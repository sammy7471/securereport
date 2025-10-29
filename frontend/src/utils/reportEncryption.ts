import {
  initSDK,
  createInstance,
  SepoliaConfig
} from "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js";

let fheInstance: any = null;

async function initializeFHE() {
  if (fheInstance) return fheInstance;

  console.log("🔐 Initializing Zama FHE SDK...");
  await initSDK();

  const config = {
    ...SepoliaConfig,
    relayerUrl: "https://relayer.testnet.zama.cloud",
    network: window.ethereum
  };

  fheInstance = await createInstance(config);
  console.log("✅ Zama FHE initialized successfully");
  return fheInstance;
}

// Convert string to bytes
function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Encrypt report content as a single uint32 value (simplified)
 */
export async function encryptReportContent(
  contractAddress: string,
  content: string,
  userAddress: string
): Promise<{ encryptedValue: string, inputProof: string }> {
  try {
    const fhe = await initializeFHE();
    console.log(`🔐 Encrypting report content (${content.length} chars)...`);

    // Create encrypted input
    const input = fhe.createEncryptedInput(contractAddress, userAddress);
    
    // Convert string to a single uint32 value (hash-like)
    // Take first 4 bytes or hash the content
    const contentBytes = stringToBytes(content);
    let value = 0;
    for (let i = 0; i < Math.min(4, contentBytes.length); i++) {
      value |= (contentBytes[i] << (i * 8));
    }
    value = value >>> 0; // Ensure unsigned
    
    console.log(`📦 Encrypting as single value: ${value}`);
    
    // Add single value
    input.add32(value);
    
    console.log("🔒 Encrypting report...");
    const encrypted = await input.encrypt();
    
    // Convert Uint8Array handle to hex string (bytes32 format)
    const handle = encrypted.handles[0];
    const encryptedValue = '0x' + Array.from(handle).map((b: number) => b.toString(16).padStart(2, '0')).join('');
    
    console.log("✅ Report encrypted successfully");
    
    // Convert inputProof to hex string
    const inputProofBytes = encrypted.inputProof as Uint8Array;
    const inputProofHex = '0x' + Array.from(inputProofBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return {
      encryptedValue: encryptedValue.padEnd(66, '0'),
      inputProof: inputProofHex
    };
    
  } catch (error: any) {
    console.error("❌ Encryption failed:", error);
    throw new Error(`Encryption failed: ${error.message || "Unknown error occurred"}`);
  }
}

/**
 * Decrypt report content from encrypted handle (simplified)
 */
export async function decryptReportContent(
  contractAddress: string,
  handle: string,
  signer: any
): Promise<string> {
  try {
    const fhe = await initializeFHE();
    console.log(`🔓 Decrypting report content...`);

    // Generate keypair for user decryption
    const keypair = fhe.generateKeypair();
    
    // Get user address
    let userAddress: string;
    if (typeof signer.getAddress === 'function') {
      userAddress = await signer.getAddress();
    } else if (signer.address) {
      userAddress = signer.address;
    } else {
      throw new Error('Could not get user address from signer');
    }
    
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '10';
    const contractAddresses = [contractAddress];

    console.log("🔐 Creating EIP-712 signature for relayer...");
    
    const eip712 = fhe.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );

    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    );

    console.log("🌐 Requesting decryption from relayer...");
    
    // Convert handle to bytes
    const hex = handle.startsWith('0x') ? handle.slice(2) : handle;
    const handleBytes = new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

    const handleContractPairs = [{ 
      handle: handleBytes, 
      contractAddress 
    }];
    
    const result = await fhe.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      userAddress,
      startTimeStamp,
      durationDays
    );

    console.log("📦 Relayer response received");

    // Get decrypted value
    const decryptedValue = result[handle];
    const valueNum = typeof decryptedValue === 'bigint' ? Number(decryptedValue) : decryptedValue;

    // Convert uint32 back to string (first 4 bytes)
    const bytes: number[] = [
      valueNum & 0xFF,
      (valueNum >> 8) & 0xFF,
      (valueNum >> 16) & 0xFF,
      (valueNum >> 24) & 0xFF
    ];

    const plaintext = new TextDecoder().decode(new Uint8Array(bytes.filter(b => b !== 0)));
    console.log("✅ Report decrypted successfully");
    return plaintext || `[Encrypted value: ${valueNum}]`;

  } catch (error: any) {
    console.error("❌ Decryption failed:", error);
    throw new Error(`Decryption failed: ${error.message || "Unknown error occurred"}`);
  }
}

/**
 * Generate a random access code for anonymous tracking
 */
export function generateAccessCode(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash access code for storage
 */
export async function hashAccessCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
