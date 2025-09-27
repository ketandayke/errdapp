import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { Bug, Menu, X, Home, Store, Upload, User, Wallet, Zap } from 'lucide-react';

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
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Bug className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300" />
                <div className="absolute inset-0 bg-indigo-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-bold gradient-text">De-Bugger</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      isActivePath(item.path)
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/50'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Wallet Section */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Balance Display */}
              {isConnected && balance && (
                <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-600/50">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">
                    {formatBalance(balance)} FIL
                  </span>
                </div>
              )}

              {/* Network Warning */}
              {isConnected && !isCorrectNetwork && (
                <div className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-xl">
                  <span className="text-xs text-red-400 font-medium">Wrong Network</span>
                </div>
              )}

              {/* Connect/Disconnect Button */}
              <button
                onClick={handleWalletClick}
                disabled={isConnecting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isConnected
                    ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-600/50 hover:border-gray-500/50'
                    : 'btn-primary'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
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
              className="md:hidden p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass border-t border-white/10">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActivePath(item.path)
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/50'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Wallet Section */}
              <div className="pt-4 border-t border-gray-700/50 space-y-4">
                {isConnected && balance && (
                  <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-600/50">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">{formatBalance(balance)} FIL</span>
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