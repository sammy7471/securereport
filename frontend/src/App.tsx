import { useState } from 'react';
import { WagmiConfig, useAccount } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { wagmiConfig, chains } from './config/wagmi';
import { SubmitReportPage } from './pages/SubmitReportPage';
import { OrganizationDashboard } from './pages/OrganizationDashboard';
import { TrackReportPage } from './pages/TrackReportPage';
import { HomePage } from './pages/HomePage';
import { ChainGuard } from './components/ChainGuard';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const SECUREREPORT_CONTRACT = import.meta.env.VITE_SECUREREPORT_CONTRACT_ADDRESS || '';

type Page = 'home' | 'submit-report' | 'org-dashboard' | 'track-report';

function AppContent() {
  const { isConnected } = useAccount();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
          },
        }}
      />
      
      <ChainGuard>
        {!SECUREREPORT_CONTRACT && isConnected ? (
          <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center max-w-md mx-4">
              <div className="w-16 h-16 bg-yellow-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Contract Not Configured
              </h3>
              <p className="text-sm text-gray-400">
                Please set VITE_SECUREREPORT_CONTRACT_ADDRESS in your .env file.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Pages */}
            {currentPage === 'home' ? (
              <HomePage onNavigate={setCurrentPage} />
            ) : currentPage === 'submit-report' ? (
              <SubmitReportPage onNavigate={setCurrentPage} currentPage={currentPage} />
            ) : currentPage === 'org-dashboard' ? (
              <OrganizationDashboard onNavigate={setCurrentPage} currentPage={currentPage} />
            ) : (
              <TrackReportPage onNavigate={setCurrentPage} currentPage={currentPage} />
            )}
          </>
        )}
      </ChainGuard>
    </>
  );
}

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
