import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { Bug, Menu, X, Home, Store, Upload, User, Wallet } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const {
    account,
    balance,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    formatAddress,
    formatBalance,
    isCorrectNetwork
  } = useWeb3();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/marketplace', label: 'Browse', icon: Store },
    { path: '/submit', label: 'Submit', icon: Upload },
    { path: '/my-datasets', label: 'My Data', icon: User },
  ];

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-primary-900/95 backdrop-blur-lg border-b border-primary-700/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <Bug className="w-8 h-8 text-accent-purple group-hover:animate-pulse" />
              <span className="text-xl font-bold gradient-text">De-Bugger</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActivePath(item.path)
                        ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                        : 'text-primary-300 hover:text-white hover:bg-primary-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Wallet Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Balance Display */}
              {isConnected && balance && (
                <div className="flex items-center space-x-2 bg-primary-800/50 px-4 py-2 rounded-lg border border-primary-600">
                  <Wallet className="w-4 h-4 text-accent-green" />
                  <span className="text-sm font-medium">
                    {formatBalance(balance)} FIL
                  </span>
                </div>
              )}

              {/* Network Warning */}
              {isConnected && !isCorrectNetwork && (
                <div className="bg-accent-red/20 border border-accent-red/30 px-3 py-1 rounded-lg">
                  <span className="text-xs text-accent-red font-medium">Wrong Network</span>
                </div>
              )}

              {/* Connect/Disconnect Button */}
              <button
                onClick={handleWalletClick}
                disabled={isConnecting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isConnected
                    ? 'bg-primary-700 hover:bg-primary-600 text-white border border-primary-600'
                    : 'btn-primary'
                } disabled:opacity-50`}
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isConnecting 
                    ? 'Connecting...' 
                    : isConnected 
                      ? formatAddress(account)
                      : 'Connect Wallet'
                  }
                </span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-primary-700/50 hover:bg-primary-700 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-primary-900/95 backdrop-blur-lg border-b border-primary-700/50">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActivePath(item.path)
                        ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                        : 'text-primary-300 hover:text-white hover:bg-primary-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Wallet Section */}
              <div className="pt-4 border-t border-primary-700 space-y-4">
                {isConnected && balance && (
                  <div className="flex items-center space-x-2 bg-primary-800/50 px-4 py-3 rounded-lg border border-primary-600">
                    <Wallet className="w-5 h-5 text-accent-green" />
                    <span className="font-medium">{formatBalance(balance)} FIL</span>
                  </div>
                )}

                <button
                  onClick={handleWalletClick}
                  disabled={isConnecting}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isConnecting 
                    ? 'Connecting...' 
                    : isConnected 
                      ? `Disconnect ${formatAddress(account)}`
                      : 'Connect Wallet'
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;