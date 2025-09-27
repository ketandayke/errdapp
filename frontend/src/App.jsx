import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './contexts/Web3Context';

// Components
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import SubmitDataset from './pages/SubmitDataset';
import MyDatasets from './pages/MyDatasets';

// Styles
import './index.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-x-hidden">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Orbs */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          </div>
          
          <div className="relative z-10">
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/submit" element={<SubmitDataset />} />
                <Route path="/my-datasets" element={<MyDatasets />} />
              </Routes>
            </main>
            
            {/* Footer */}
            <footer className="relative z-10 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
              <div className="container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="col-span-2">
                    <h3 className="text-xl font-bold gradient-text mb-4">De-Bugger</h3>
                    <p className="text-gray-400 max-w-md">
                      The world's first marketplace for tokenized developer knowledge. 
                      Transform your debugging expertise into valuable, tradable assets.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-4">Platform</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li><a href="#" className="hover:text-white transition-colors">Browse Datasets</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Submit Data</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-4">Community</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
                  <p>&copy; 2024 De-Bugger. All rights reserved. Built on Filecoin.</p>
                </div>
              </div>
            </footer>
          </div>
          
          {/* Enhanced Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'rgba(17, 24, 39, 0.95)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(6, 78, 59, 0.95)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(127, 29, 29, 0.95)',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#6366f1',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  background: 'rgba(30, 27, 75, 0.95)',
                },
              },
            }}
          />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;