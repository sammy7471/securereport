import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useSecureReport, Category, Severity } from '../hooks/useSecureReport';
import { EncryptionProgress } from '../components/EncryptionProgress';

type Page = 'home' | 'submit-report' | 'org-dashboard' | 'track-report';

interface SubmitReportPageProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export function SubmitReportPage({ onNavigate, currentPage }: SubmitReportPageProps) {
  const { address, isConnected } = useAccount();
  const { submitReport, isSubmitting, fetchOrganization } = useSecureReport();

  const [step, setStep] = useState<'select-org' | 'report-form' | 'success'>('select-org');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgName, setOrgName] = useState('');
  const [category, setCategory] = useState<Category>(Category.Other);
  const [severity, setSeverity] = useState<Severity>(Severity.Medium);
  const [content, setContent] = useState('');
  const [evidence, setEvidence] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showEncryptionProgress, setShowEncryptionProgress] = useState(false);

  const handleLoadOrganization = async () => {
    if (!orgAddress) {
      alert('Please enter an organization address');
      return;
    }

    const org = await fetchOrganization(orgAddress);
    if (!org) {
      alert('Organization not found');
      return;
    }

    if (!org.isVerified || !org.isActive) {
      alert('Organization is not verified or active');
      return;
    }

    setOrgName(org.name);
    setStep('report-form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please enter report details');
      return;
    }

    setShowEncryptionProgress(true);

    try {
      const code = await submitReport(
        orgAddress,
        category,
        severity,
        content,
        evidence
      );

      if (code) {
        setAccessCode(code);
        setStep('success');
        // Reset form
        setContent('');
        setEvidence('');
      }
    } finally {
      setTimeout(() => setShowEncryptionProgress(false), 500);
    }
  };

  const getCategoryLabel = (cat: Category) => {
    return ['Fraud', 'Harassment', 'Safety', 'Ethics', 'Legal', 'Environmental', 'Other'][cat];
  };

  const getSeverityLabel = (sev: Severity) => {
    return ['Low', 'Medium', 'High', 'Critical'][sev];
  };

  const getSeverityColor = (sev: Severity) => {
    const colors = ['text-blue-400', 'text-yellow-400', 'text-orange-400', 'text-red-400'];
    return colors[sev];
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <EncryptionProgress isEncrypting={showEncryptionProgress} />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        {/* Mobile Navigation */}
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-2 py-2">
          <div className="flex justify-around items-center">
            <button
              onClick={() => onNavigate('home')}
              className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all ${
                currentPage === 'home'
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl">🏠</span>
              <span className="text-xs mt-0.5">Home</span>
            </button>
            <button
              onClick={() => onNavigate('submit-report')}
              className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all ${
                currentPage === 'submit-report'
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl">📝</span>
              <span className="text-xs mt-0.5">Submit</span>
            </button>
            <button
              onClick={() => onNavigate('org-dashboard')}
              className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all ${
                currentPage === 'org-dashboard'
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl">🏢</span>
              <span className="text-xs mt-0.5">Org</span>
            </button>
            <button
              onClick={() => onNavigate('track-report')}
              className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all ${
                currentPage === 'track-report'
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl">🔍</span>
              <span className="text-xs mt-0.5">Track</span>
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-lg">Submit Report</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'home'
                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                🏠 Home
              </button>
              <button
                onClick={() => onNavigate('submit-report')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'submit-report'
                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                📝 Submit
              </button>
              <button
                onClick={() => onNavigate('org-dashboard')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'org-dashboard'
                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                🏢 Organization
              </button>
              <button
                onClick={() => onNavigate('track-report')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'track-report'
                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                🔍 Track
              </button>
            </div>
            
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        {/* Select Organization */}
        {step === 'select-org' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3">Report Misconduct Anonymously</h1>
              <p className="text-gray-400">Your identity will remain completely anonymous</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Organization Address
              </label>
              <input
                type="text"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the Ethereum address of the organization you want to report to
              </p>

              <button
                onClick={handleLoadOrganization}
                disabled={!orgAddress}
                className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Your Privacy is Protected</p>
                  <ul className="space-y-1 text-blue-400">
                    <li>• Your report is encrypted before submission</li>
                    <li>• No one can trace the report back to you</li>
                    <li>• You'll receive an access code to track status</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Form */}
        {step === 'report-form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Reporting to: {orgName}</h2>
                  <p className="text-sm text-gray-400">{orgAddress}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('select-org')}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Change
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(Number(e.target.value) as Category)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  {Object.keys(Category).filter(k => isNaN(Number(k))).map((key, idx) => (
                    <option key={key} value={idx}>{key}</option>
                  ))}
                </select>
              </div>

              {/* Severity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Severity *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[Severity.Low, Severity.Medium, Severity.High, Severity.Critical].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        severity === sev
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {getSeverityLabel(sev)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Report Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Report Details * <span className="text-red-400">(Encrypted)</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the incident in detail... This will be encrypted."
                  rows={8}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  required
                />
              </div>

              {/* Evidence */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Evidence/Additional Information <span className="text-gray-500">(Optional, Encrypted)</span>
                </label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="Any supporting evidence, documents, or additional context..."
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              {!isConnected && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    Please connect your wallet to submit the report. Your wallet is only used for encryption - your identity remains anonymous.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isConnected}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Anonymous Report'}
              </button>
            </div>
          </form>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-3">Report Submitted Successfully</h1>
              <p className="text-gray-400">Your report has been encrypted and submitted anonymously</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Your Access Code</h3>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 flex items-center justify-between">
                <code className="text-green-400 font-mono text-sm break-all flex-1">{accessCode}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(accessCode);
                    alert('Access code copied to clipboard!');
                  }}
                  className="ml-4 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg flex items-center space-x-2"
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Save this code! You'll need it to track the status of your report anonymously.
              </p>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-yellow-300">
                    <p className="font-medium mb-1">Important</p>
                    <p className="text-yellow-400">This code will not be shown again. Please save it in a secure location.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('select-org');
                  setOrgAddress('');
                  setOrgName('');
                  setAccessCode('');
                }}
                className="mt-6 w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
