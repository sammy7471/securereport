import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSecureReport, Status, Category, Severity } from '../hooks/useSecureReport';
import { DecryptionProgress } from '../components/EncryptionProgress';

type Page = 'home' | 'submit-report' | 'org-dashboard' | 'track-report';

interface TrackReportPageProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export function TrackReportPage({ onNavigate, currentPage }: TrackReportPageProps) {
  const { trackReport, decryptFeedback } = useSecureReport();
  const [accessCode, setAccessCode] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await trackReport(accessCode);
      if (data) {
        setReportData(data);
      } else {
        setError('Report not found. Please check your access code.');
      }
    } catch (err) {
      setError('Failed to track report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const decryptedFeedback = await decryptFeedback(accessCode);
      if (decryptedFeedback) {
        setFeedback(decryptedFeedback);
      }
    } finally {
      // Keep modal visible for 1 second after completion
      setTimeout(() => {
        setLoadingFeedback(false);
      }, 1000);
    }
  };

  const getStatusLabel = (status: Status) => {
    return ['Submitted', 'Under Review', 'Investigating', 'Resolved', 'Closed'][status];
  };

  const getStatusColor = (status: Status) => {
    const colors = ['bg-gray-500/20 text-gray-400', 'bg-blue-500/20 text-blue-400', 'bg-yellow-500/20 text-yellow-400', 'bg-green-500/20 text-green-400', 'bg-gray-700/20 text-gray-500'];
    return colors[status];
  };

  const getCategoryLabel = (cat: Category) => {
    return ['Fraud', 'Harassment', 'Safety', 'Ethics', 'Legal', 'Environmental', 'Other'][cat];
  };

  const getSeverityLabel = (sev: Severity) => {
    return ['Low', 'Medium', 'High', 'Critical'][sev];
  };

  const getSeverityColor = (sev: Severity) => {
    const colors = ['bg-blue-500/20 text-blue-400', 'bg-yellow-500/20 text-yellow-400', 'bg-orange-500/20 text-orange-400', 'bg-red-500/20 text-red-400'];
    return colors[sev];
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
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
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-semibold text-lg">Track Report</span>
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

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Track Your Report</h1>
          <p className="text-gray-400">Enter your access code to check the status</p>
        </div>

        {!reportData ? (
          <form onSubmit={handleTrack} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Access Code
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter your access code..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                This is the code you received when you submitted your report
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Tracking...' : 'Track Report'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Report #{reportData.id.toString()}</h2>
                <button
                  onClick={() => {
                    setReportData(null);
                    setAccessCode('');
                  }}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Track Another
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400 w-24">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reportData.status)}`}>
                    {getStatusLabel(reportData.status)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400 w-24">Category:</span>
                  <span className="text-white">{getCategoryLabel(reportData.category)}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400 w-24">Severity:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(reportData.severity)}`}>
                    {getSeverityLabel(reportData.severity)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400 w-24">Submitted:</span>
                  <span className="text-white">
                    {new Date(Number(reportData.submittedAt) * 1000).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400 w-24">Updated:</span>
                  <span className="text-white">
                    {new Date(Number(reportData.updatedAt) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Encrypted Feedback Section */}
              <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Organization Feedback</h3>
                  {!feedback && (
                    <button
                      onClick={handleDecryptFeedback}
                      disabled={loadingFeedback}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50"
                    >
                      {loadingFeedback ? 'Decrypting...' : '🔓 Decrypt Feedback'}
                    </button>
                  )}
                </div>
                {feedback ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-gray-300">{feedback}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Click "Decrypt Feedback" to view the encrypted message from the organization
                  </p>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Status Timeline</h3>
              <div className="space-y-3">
                {[Status.Submitted, Status.UnderReview, Status.Investigating, Status.Resolved].map((status, idx) => (
                  <div key={status} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      reportData.status >= status
                        ? 'bg-green-500'
                        : 'bg-gray-700'
                    }`}>
                      {reportData.status >= status ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-gray-500 text-sm">{idx + 1}</span>
                      )}
                    </div>
                    <span className={reportData.status >= status ? 'text-white' : 'text-gray-500'}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Your Privacy is Protected</p>
                  <p className="text-blue-400">
                    Your identity remains completely anonymous. Only the organization can see the encrypted report content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DecryptionProgress 
        isDecrypting={loadingFeedback} 
        onComplete={() => setLoadingFeedback(false)} 
      />
    </div>
  );
}
