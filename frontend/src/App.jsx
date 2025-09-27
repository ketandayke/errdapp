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
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
          {/* Background Pattern */}
          {/* <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div> */}
          
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
          </div>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #475569',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
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