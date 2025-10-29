import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useSecureReport, Category, Severity, Status, ReportMetadata } from '../hooks/useSecureReport';
import { DecryptionProgress } from '../components/EncryptionProgress';

type Page = 'home' | 'submit-report' | 'org-dashboard' | 'track-report';

interface OrganizationDashboardProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export function OrganizationDashboard({ onNavigate, currentPage }: OrganizationDashboardProps) {
  const { address, isConnected } = useAccount();
  const {
    myOrganization,
    reports,
    decryptedReports,
    isRegistering,
    registerOrganization,
    fetchOrganizationReports,
    updateReportStatus,
    decryptReport,
  } = useSecureReport();

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportMetadata | null>(null);
  const [newStatus, setNewStatus] = useState<Status>(Status.UnderReview);
  const [statusNotes, setStatusNotes] = useState('');
  const [showDecryptionProgress, setShowDecryptionProgress] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');

  useEffect(() => {
    if (address && myOrganization?.isVerified) {
      fetchOrganizationReports(address);
    }
  }, [address, myOrganization]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerOrganization(orgName, orgDescription);
    setShowRegisterForm(false);
    setOrgName('');
    setOrgDescription('');
  };

  const handleDecrypt = async (reportId: bigint) => {
    setShowDecryptionProgress(true);
    try {
      await decryptReport(reportId);
    } finally {
      setTimeout(() => setShowDecryptionProgress(false), 500);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    // Use default feedback if empty
    const feedback = statusNotes.trim() || 'Status updated';
    await updateReportStatus(selectedReport.id, newStatus, feedback);
    setSelectedReport(null);
    setStatusNotes('');
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

  const getStatusLabel = (status: Status) => {
    return ['Submitted', 'Under Review', 'Investigating', 'Resolved', 'Closed'][status];
  };

  const getStatusColor = (status: Status) => {
    const colors = ['bg-gray-500/20 text-gray-400', 'bg-blue-500/20 text-blue-400', 'bg-yellow-500/20 text-yellow-400', 'bg-green-500/20 text-green-400', 'bg-gray-700/20 text-gray-500'];
    return colors[status];
  };

  const filteredReports = filterStatus === 'all' 
    ? reports 
    : reports.filter(r => r.status === filterStatus);

  const stats = {
    total: reports.length,
    submitted: reports.filter(r => r.status === Status.Submitted).length,
    investigating: reports.filter(r => r.status === Status.Investigating).length,
    resolved: reports.filter(r => r.status === Status.Resolved).length,
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Organization Dashboard</h1>
            <p className="text-gray-400 mb-6">Manage and review anonymous reports</p>
          </div>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <DecryptionProgress isDecrypting={showDecryptionProgress} />

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="font-semibold text-lg">Organization Dashboard</span>
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

      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Not Registered */}
        {!myOrganization?.isActive && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3">Register Your Organization</h1>
              <p className="text-gray-400">Start receiving anonymous reports</p>
            </div>

            {!showRegisterForm ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-400 mb-6">
                  Register your organization to receive and manage anonymous whistleblowing reports.
                </p>
                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-medium"
                >
                  Register Organization
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Description *
                  </label>
                  <textarea
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    placeholder="Brief description of your organization..."
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {isRegistering ? 'Registering...' : 'Register'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Pending Verification */}
        {myOrganization?.isActive && !myOrganization?.isVerified && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Pending Verification</h2>
              <p className="text-gray-400 mb-4">
                Your organization <strong className="text-white">{myOrganization.name}</strong> is registered and awaiting admin verification.
              </p>
              <p className="text-sm text-gray-500">
                You'll be able to receive reports once verified by the platform administrator.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {myOrganization?.isVerified && (
          <div className="space-y-6">
            {/* Org Info */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-2">{myOrganization.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{myOrganization.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                  ✓ Verified
                </span>
                <span className="text-gray-500">
                  {myOrganization.reportsReceived.toString()} reports received
                </span>
                <span className="text-gray-500">
                  {myOrganization.reportsResolved.toString()} resolved
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">{stats.total}</div>
                <div className="text-sm text-gray-400">Total Reports</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1 text-blue-400">{stats.submitted}</div>
                <div className="text-sm text-gray-400">New</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1 text-yellow-400">{stats.investigating}</div>
                <div className="text-sm text-gray-400">Investigating</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold mb-1 text-green-400">{stats.resolved}</div>
                <div className="text-sm text-gray-400">Resolved</div>
              </div>
            </div>

            {/* Filter */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === 'all'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {[Status.Submitted, Status.UnderReview, Status.Investigating, Status.Resolved, Status.Closed].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filterStatus === status
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
                  <p className="text-gray-400">No reports found</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div key={report.id.toString()} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg font-semibold">Report #{report.id.toString()}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                            {getSeverityLabel(report.severity)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusLabel(report.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Category: {getCategoryLabel(report.category)}</span>
                          <span>•</span>
                          <span>{new Date(Number(report.submittedAt) * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {report.publicNotes && (
                      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-300">{report.publicNotes}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDecrypt(report.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                      >
                        {decryptedReports[report.id.toString()] ? '✓ Decrypted' : '🔓 Decrypt Report'}
                      </button>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
                      >
                        Update Status
                      </button>
                    </div>

                    {decryptedReports[report.id.toString()] && (
                      <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                        <h4 className="font-semibold mb-2">Decrypted Content:</h4>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {decryptedReports[report.id.toString()]}
                        </p>
                        {decryptedReports[`${report.id.toString()}_evidence`] && (
                          <>
                            <h4 className="font-semibold mt-4 mb-2">Evidence:</h4>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">
                              {decryptedReports[`${report.id.toString()}_evidence`]}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Update Report Status</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(Number(e.target.value) as Status)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {[Status.UnderReview, Status.Investigating, Status.Resolved, Status.Closed].map((status) => (
                    <option key={status} value={status}>{getStatusLabel(status)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Encrypted Feedback for Reporter
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add encrypted feedback that only the reporter can decrypt..."
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  🔒 This message will be encrypted and only the reporter can decrypt it using their access code
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-medium"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
