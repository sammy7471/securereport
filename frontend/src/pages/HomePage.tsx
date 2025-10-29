import { ConnectButton } from '@rainbow-me/rainbowkit';

type Page = 'home' | 'submit-report' | 'org-dashboard' | 'track-report';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-semibold text-lg">SecureReport</span>
          </div>
          
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            {/* Animated Shield Icon with Fire */}
            <div className="relative inline-block mb-6">
              {/* Outer glow layers - animated */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full blur-xl opacity-50" 
                   style={{ animation: 'flicker 2s ease-in-out infinite' }}></div>
              
              {/* Flame particles */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full blur-sm opacity-70"
                   style={{ animation: 'flame1 1.5s ease-in-out infinite' }}></div>
              <div className="absolute -top-1 left-1/3 w-2 h-2 bg-yellow-400 rounded-full blur-sm opacity-60"
                   style={{ animation: 'flame2 1.8s ease-in-out infinite 0.3s' }}></div>
              <div className="absolute -top-1 right-1/3 w-2 h-2 bg-red-500 rounded-full blur-sm opacity-60"
                   style={{ animation: 'flame3 1.6s ease-in-out infinite 0.6s' }}></div>
              
              {/* Shield container */}
              <div className="relative bg-gray-900 p-6 rounded-full border-2 border-orange-500/50"
                   style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.3), inset 0 0 20px rgba(249, 115, 22, 0.1)' }}>
                <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     style={{ filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              
              {/* CSS animations */}
              <style>{`
                @keyframes flicker {
                  0%, 100% { opacity: 0.5; transform: scale(1); }
                  50% { opacity: 0.7; transform: scale(1.05); }
                }
                @keyframes flame1 {
                  0% { transform: translate(-50%, 0) scale(1); opacity: 0.7; }
                  50% { transform: translate(-50%, -20px) scale(0.8); opacity: 0.3; }
                  100% { transform: translate(-50%, -40px) scale(0.5); opacity: 0; }
                }
                @keyframes flame2 {
                  0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                  50% { transform: translate(-5px, -15px) scale(0.7); opacity: 0.3; }
                  100% { transform: translate(-10px, -30px) scale(0.4); opacity: 0; }
                }
                @keyframes flame3 {
                  0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                  50% { transform: translate(5px, -15px) scale(0.7); opacity: 0.3; }
                  100% { transform: translate(10px, -30px) scale(0.4); opacity: 0; }
                }
              `}</style>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              Anonymous Whistleblowing Platform
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Report misconduct securely with end-to-end encryption. Your identity remains completely anonymous.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fully Encrypted</h3>
              <p className="text-sm text-gray-400">
                Reports are encrypted using FHE before submission. Only the organization can decrypt them.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 transition-all">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">100% Anonymous</h3>
              <p className="text-sm text-gray-400">
                No identity data is stored. Track your report using a secure access code.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Blockchain Secured</h3>
              <p className="text-sm text-gray-400">
                All reports are stored on-chain, ensuring immutability and transparency.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('submit-report')}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-semibold text-lg shadow-lg transition-all"
            >
              📝 Submit Anonymous Report
            </button>
            <button
              onClick={() => onNavigate('track-report')}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-lg border border-gray-700 transition-all"
            >
              🔍 Track Report Status
            </button>
          </div>

          <div className="mt-8">
            <button
              onClick={() => onNavigate('org-dashboard')}
              className="text-gray-400 hover:text-white transition-all"
            >
              Are you an organization? <span className="text-red-400">Register here →</span>
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="border-t border-gray-800 bg-gray-900/30 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Submit Your Report</h3>
                  <p className="text-gray-400">
                    Choose an organization and describe the misconduct. Your report is encrypted before leaving your device.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Save Your Access Code</h3>
                  <p className="text-gray-400">
                    You'll receive a unique access code. Keep it safe - it's the only way to track your report anonymously.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Organization Reviews</h3>
                  <p className="text-gray-400">
                    The organization decrypts and investigates your report. They can send you encrypted feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                  <p className="text-gray-400">
                    Use your access code to check the status and decrypt any feedback from the organization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
