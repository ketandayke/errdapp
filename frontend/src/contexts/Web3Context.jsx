import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Web3 Context
const Web3Context = createContext();

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within Web3Provider');
    }
    return context;
};

// Filecoin Calibration Network Config
const FILECOIN_CALIBRATION = {
    chainId: '0x4CB2F', // 314159 in hex
    chainName: 'Filecoin Calibration',
    nativeCurrency: {
        name: 'tFIL',
        symbol: 'tFIL',
        decimals: 18,
    },
    rpcUrls: ['https://api.calibration.node.glif.io/rpc/v1'],
    blockExplorerUrls: ['https://calibration.filfox.info/en'],
};

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const handleAccountsChanged = useCallback((accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            setAccount(accounts[0]);
        }
    }, []);
    
    const handleChainChanged = () => {
        // As recommended by MetaMask, a full reload is the safest way to handle chain changes
        window.location.reload();
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
        setBalance(null);
        setIsConnected(false);
        toast.success('Wallet disconnected');
    };

    const updateBalance = useCallback(async (currentProvider, currentAccount) => {
        try {
            if (currentAccount && currentProvider) {
                const balanceWei = await currentProvider.getBalance(currentAccount);
                setBalance(ethers.utils.formatEther(balanceWei));
            }
        } catch (error) {
            console.error('Failed to update balance:', error);
        }
    }, []);

    const checkConnection = useCallback(async () => {
        if (window.ethereum) {
            try {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await web3Provider.listAccounts();
                
                if (accounts.length > 0) {
                    const network = await web3Provider.getNetwork();
                    setProvider(web3Provider);
                    setSigner(web3Provider.getSigner());
                    setAccount(accounts[0]);
                    setChainId(network.chainId);
                    setIsConnected(true);
                    updateBalance(web3Provider, accounts[0]);
                }
            } catch (error) {
                console.error('Connection check failed:', error);
            }
        }
    }, [updateBalance]);

    // Initialize provider and listeners on mount
    useEffect(() => {
        if (window.ethereum) {
            checkConnection();
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [checkConnection, handleAccountsChanged]);

    // Update balance whenever account changes
    useEffect(() => {
        if (account && provider) {
            updateBalance(provider, account);
        }
    }, [account, provider, updateBalance]);


    const switchToFilecoinCalibration = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: FILECOIN_CALIBRATION.chainId }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [FILECOIN_CALIBRATION],
                    });
                } catch (addError) {
                    toast.error('Failed to add Filecoin Calibration network');
                    throw addError;
                }
            } else {
                toast.error('Failed to switch network');
                throw switchError;
            }
        }
    };
    
    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error('Please install MetaMask!');
            return false;
        }

        setIsConnecting(true);
        const toastId = toast.loading("Connecting wallet...");

        try {
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            await web3Provider.send('eth_requestAccounts', []);
            const web3Signer = web3Provider.getSigner();
            const userAccount = await web3Signer.getAddress();
            const network = await web3Provider.getNetwork();

            if (network.chainId !== 314159) {
                toast.loading("Please switch to Filecoin Calibration...", { id: toastId });
                await switchToFilecoinCalibration();
                // After switching, the provider will update via the 'chainChanged' event, triggering a reload.
                // We'll just complete the connection optimistically.
            }

            setAccount(userAccount);
            setProvider(web3Provider);
            setSigner(web3Signer);
            setChainId(network.chainId);
            setIsConnected(true);
            updateBalance(web3Provider, userAccount);

            toast.success('Wallet connected!', { id: toastId });
            return true;

        } catch (error) {
            console.error('Connection failed:', error);
            toast.error(error.message?.includes("User rejected") ? "Connection request rejected." : "Failed to connect wallet.", { id: toastId });
            return false;
        } finally {
            setIsConnecting(false);
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatBalance = (balance) => {
        if (!balance) return '0.0000';
        return parseFloat(balance).toFixed(4);
    };

    const isCorrectNetwork = chainId === 314159;

    const value = {
        account,
        provider,
        signer,
        balance,
        isConnecting,
        isConnected,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
        formatAddress,
        formatBalance,
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
};
