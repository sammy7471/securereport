import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { toast } from 'react-hot-toast';
import SecureReportABI from '../abi/SecureReport.json';
import { encryptReportContent, decryptReportContent, generateAccessCode, hashAccessCode } from '../utils/reportEncryption';
import { useSigner } from './useSigner';

const CONTRACT_ADDRESS = import.meta.env.VITE_SECUREREPORT_CONTRACT_ADDRESS as `0x${string}`;

export enum Category {
  Fraud = 0,
  Harassment = 1,
  Safety = 2,
  Ethics = 3,
  Legal = 4,
  Environmental = 5,
  Other = 6
}

export enum Severity {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export enum Status {
  Submitted = 0,
  UnderReview = 1,
  Investigating = 2,
  Resolved = 3,
  Closed = 4
}

export interface Organization {
  orgAddress: string;
  name: string;
  description: string;
  isVerified: boolean;
  isActive: boolean;
  registeredAt: bigint;
  reportsReceived: bigint;
  reportsResolved: bigint;
}

export interface ReportMetadata {
  id: bigint;
  category: Category;
  severity: Severity;
  status: Status;
  submittedAt: bigint;
  updatedAt: bigint;
  publicNotes: string;
}

export interface ReportDetails extends ReportMetadata {
  organization: string;
  accessCode: string;
  isActive: boolean;
}

export function useSecureReport() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const signer = useSigner();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [myOrganization, setMyOrganization] = useState<Organization | null>(null);
  const [reports, setReports] = useState<ReportMetadata[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [decryptedReports, setDecryptedReports] = useState<Record<string, string>>({});

  // Fetch organization details
  const fetchOrganization = async (orgAddress: string) => {
    if (!publicClient) return null;

    try {
      const org = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: SecureReportABI.abi,
        functionName: 'getOrganization',
        args: [orgAddress],
      }) as Organization;

      return org;
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  };

  // Fetch my organization
  useEffect(() => {
    if (address) {
      fetchOrganization(address).then(setMyOrganization);
    }
  }, [address, publicClient]);

  // Register as organization
  const registerOrganization = async (name: string, description: string) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsRegistering(true);
    try {
      toast.loading('Registering organization...', { id: 'register' });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: SecureReportABI.abi,
        functionName: 'registerOrganization',
        args: [name, description],
      });

      toast.loading('Waiting for confirmation...', { id: 'register' });
      await publicClient!.waitForTransactionReceipt({ hash });

      toast.success('Organization registered! Awaiting admin verification.', { id: 'register' });
      
      // Refresh organization data
      const org = await fetchOrganization(address);
      setMyOrganization(org);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register organization', { id: 'register' });
    } finally {
      setIsRegistering(false);
    }
  };

  // Submit anonymous report
  const submitReport = async (
    organizationAddress: string,
    category: Category,
    severity: Severity,
    content: string,
    evidence: string = ''
  ): Promise<string | null> => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setIsSubmitting(true);
    let accessCode = '';

    try {
      toast.loading('Generating access code...', { id: 'submit' });
      
      // Generate access code for anonymous tracking
      accessCode = generateAccessCode();
      const hashedCode = await hashAccessCode(accessCode);

      toast.loading('Encrypting report...', { id: 'submit' });

      // Encrypt report content (simplified - single value)
      const { encryptedValue, inputProof } = await encryptReportContent(
        CONTRACT_ADDRESS,
        content,
        address
      );

      toast.loading('Submitting to blockchain...', { id: 'submit' });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: SecureReportABI.abi,
        functionName: 'submitReport',
        args: [
          organizationAddress,
          category,
          severity,
          encryptedValue,
          inputProof,
          hashedCode
        ],
        gas: 5000000n, // Reduced gas limit for simplified contract
      });

      toast.loading('Waiting for confirmation...', { id: 'submit' });
      await publicClient!.waitForTransactionReceipt({ hash });

      toast.success('Report submitted successfully!', { id: 'submit' });
      
      return accessCode; // Return access code for user to save
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit report', { id: 'submit' });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get organization reports
  const fetchOrganizationReports = async (orgAddress: string) => {
    if (!publicClient) return;

    try {
      const reportIds = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: SecureReportABI.abi,
        functionName: 'getOrganizationReports',
        args: [orgAddress],
      }) as bigint[];

      const reportPromises = reportIds.map(async (id) => {
        const metadata = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: SecureReportABI.abi,
          functionName: 'getReportMetadata',
          args: [id],
        }) as [Category, Severity, Status, bigint, bigint, string];

        return {
          id,
          category: metadata[0],
          severity: metadata[1],
          status: metadata[2],
          submittedAt: metadata[3],
          updatedAt: metadata[4],
          publicNotes: metadata[5],
        };
      });

      const fetchedReports = await Promise.all(reportPromises);
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // Update report status with encrypted feedback
  const updateReportStatus = async (reportId: bigint, newStatus: Status, feedback: string) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      toast.loading('Encrypting feedback...', { id: 'update' });

      // Encrypt feedback for reporter
      const { encryptedValue, inputProof } = await encryptReportContent(
        CONTRACT_ADDRESS,
        feedback,
        address
      );

      toast.loading('Updating status...', { id: 'update' });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: SecureReportABI.abi,
        functionName: 'updateReportStatus',
        args: [reportId, newStatus, encryptedValue, inputProof],
        gas: 3000000n,
      });

      toast.loading('Waiting for confirmation...', { id: 'update' });
      await publicClient!.waitForTransactionReceipt({ hash });

      toast.success('Status updated!', { id: 'update' });

      // Refresh reports
      if (myOrganization) {
        await fetchOrganizationReports(address);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update status', { id: 'update' });
    }
  };

  // Decrypt report content
  const decryptReport = async (reportId: bigint) => {
    if (!signer || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      toast.loading('Fetching encrypted report...', { id: 'decrypt' });

      // Use publicClient with account parameter to simulate call from wallet
      const contentHandle = await publicClient!.readContract({
        address: CONTRACT_ADDRESS,
        abi: SecureReportABI.abi,
        functionName: 'getEncryptedReport',
        args: [reportId],
        account: address, // Pass wallet address as the caller
      }) as string;

      toast.loading('Decrypting content...', { id: 'decrypt' });

      const decryptedContent = await decryptReportContent(
        CONTRACT_ADDRESS,
        contentHandle,
        signer
      );

      toast.success('Report decrypted!', { id: 'decrypt' });

      const key = reportId.toString();
      setDecryptedReports(prev => ({
        ...prev,
        [key]: decryptedContent
      }));

      return { content: decryptedContent, evidence: '' };
    } catch (error: any) {
      console.error('Decryption error:', error);
      toast.error(error.message || 'Failed to decrypt report', { id: 'decrypt' });
      return null;
    }
  };

  // Track report by access code
  const trackReport = async (accessCode: string) => {
    if (!publicClient) return null;

    try {
      const hashedCode = await hashAccessCode(accessCode);

      const reportData = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: SecureReportABI.abi,
        functionName: 'getReportByAccessCode',
        args: [hashedCode],
      });

      return {
        id: reportData[0],
        category: reportData[1],
        severity: reportData[2],
        status: reportData[3],
        submittedAt: reportData[4],
        updatedAt: reportData[5],
      };
    } catch (error: any) {
      console.error('Track error:', error);
      return null;
    }
  };

  // Decrypt feedback for reporter
  const decryptFeedback = async (accessCode: string) => {
    if (!signer || !publicClient) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      toast.loading('Fetching encrypted feedback...', { id: 'decrypt-feedback' });

      const hashedCode = await hashAccessCode(accessCode);

      const feedbackHandle = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: SecureReportABI.abi,
        functionName: 'getEncryptedFeedback',
        args: [hashedCode],
      }) as string;

      if (!feedbackHandle || feedbackHandle === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        toast.info('No feedback yet', { id: 'decrypt-feedback' });
        return '';
      }

      toast.loading('Decrypting feedback...', { id: 'decrypt-feedback' });

      const decryptedFeedback = await decryptReportContent(
        CONTRACT_ADDRESS,
        feedbackHandle,
        signer
      );

      toast.success('Feedback decrypted!', { id: 'decrypt-feedback' });
      return decryptedFeedback;
    } catch (error: any) {
      console.error('Feedback decryption error:', error);
      toast.error('Failed to decrypt feedback', { id: 'decrypt-feedback' });
      return null;
    }
  };

  // Verify organization (admin only)
  const verifyOrganization = async (orgAddress: string) => {
    if (!walletClient) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      toast.loading('Verifying organization...', { id: 'verify' });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: SecureReportABI.abi,
        functionName: 'verifyOrganization',
        args: [orgAddress],
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      toast.success('Organization verified!', { id: 'verify' });
    } catch (error: any) {
      console.error('Verify error:', error);
      toast.error(error.message || 'Failed to verify organization', { id: 'verify' });
    }
  };

  return {
    myOrganization,
    reports,
    isSubmitting,
    isRegistering,
    decryptedReports,
    registerOrganization,
    submitReport,
    fetchOrganizationReports,
    updateReportStatus,
    decryptReport,
    trackReport,
    decryptFeedback,
    verifyOrganization,
    fetchOrganization,
  };
}
