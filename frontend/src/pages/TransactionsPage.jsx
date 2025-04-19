import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, CustomButton } from "../components";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../url";
import { FiCopy, FiExternalLink, FiCheckCircle } from "react-icons/fi";

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchWalletAddress, setSearchWalletAddress] = useState("");
  const [searchType, setSearchType] = useState("all"); // all, sent, received
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.walletAddress) {
        setAddress(parsedUser.walletAddress);
      } else {
        toast.error("Please login to view transactions", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
        navigate('/login');
      }
    } else {
      toast.error("Please login to view transactions", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      navigate('/login');
    }
  }, [navigate]);

  // Fetch transactions when address is available
  useEffect(() => {
    const fetchTransactions = async () => {
      if (address) {
        setIsLoading(true);
        try {
          const response = await axios.post(`${BASE_URL}/getTransactions`, {
            walletAddress: address
          });
          
          if (response.data && Array.isArray(response.data)) {
            setTransactions(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch transactions:", error);
          toast.error("Failed to load transaction history", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [address]);

  // Handle copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Search transactions by wallet address
  const handleSearchByWallet = async () => {
    if (!searchWalletAddress || isSubmitting) return;
    
    setIsLoading(true);
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${BASE_URL}/getTransactionsByWallet`, {
        walletAddress: searchWalletAddress
      });
      
      if (response.data && Array.isArray(response.data)) {
        setTransactions(response.data);
        toast.success(`Found ${response.data.length} transactions`, {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Failed to search transactions:", error);
      toast.error("Failed to search transactions by wallet address", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  // Search transactions by transaction hash
  const handleSearchByHash = async () => {
    if (!searchQuery || isSubmitting) return;
    
    setIsLoading(true);
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${BASE_URL}/getTransactionByHash`, {
        transactionHash: searchQuery
      });
      
      if (response.data) {
        if (response.data.transactionHash) {
          setTransactions([response.data]);
          setSelectedTransaction(response.data);
          setShowDetails(true);
        } else {
          toast.warning("Transaction not found", {
            position: "top-right",
            autoClose: 3000,
            theme: "light",
          });
        }
      }
    } catch (error) {
      console.error("Failed to search transaction:", error);
      toast.error(error?.response?.data?.message || "Failed to search transaction by hash", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  // Filter transactions based on type
  const filteredTransactions = () => {
    switch (searchType) {
      case "sent":
        return transactions.filter(tx => tx.from === address);
      case "received":
        return transactions.filter(tx => tx.to === address);
      default:
        return transactions;
    }
  };

  // Show transaction details
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Get transaction age
  const getTransactionAge = (timestamp) => {
    const now = new Date();
    const txDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - txDate) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {isLoading && <Loader />}
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-900 sm:text-3xl">Blockchain Transactions</h1>
          <p className="mt-2 text-light-600">View and validate all blockchain transactions</p>
        </div>
      </div>

      {/* Search Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Transaction Hash Search */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="font-medium text-light-900 mb-2">Search by Transaction Hash</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Transaction Hash (0x...)"
              className="flex-1 rounded-md border border-light-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CustomButton
              btnType="button"
              title={isSubmitting ? "Searching..." : "Search"}
              styles="bg-primary-600"
              handleClick={handleSearchByHash}
              isDisabled={isSubmitting || !searchQuery}
            />
          </div>
        </div>
        
        {/* Wallet Address Search */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="font-medium text-light-900 mb-2">Search by Wallet Address</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Wallet Address (0x...)"
              className="flex-1 rounded-md border border-light-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchWalletAddress}
              onChange={(e) => setSearchWalletAddress(e.target.value)}
            />
            <CustomButton
              btnType="button"
              title={isSubmitting ? "Searching..." : "Search"}
              styles="bg-primary-600"
              handleClick={handleSearchByWallet}
              isDisabled={isSubmitting || !searchWalletAddress}
            />
          </div>
        </div>
      </div>

      {/* Transaction Filters */}
      <div className="flex mb-6 overflow-x-auto bg-white p-1 rounded-xl shadow-md">
        <button
          className={`px-6 py-2 rounded-lg text-sm font-medium ${
            searchType === "all"
              ? "bg-primary-100 text-primary-600"
              : "text-light-600 hover:bg-light-100"
          }`}
          onClick={() => setSearchType("all")}
        >
          All Transactions
        </button>
        <button
          className={`px-6 py-2 rounded-lg text-sm font-medium ${
            searchType === "sent"
              ? "bg-primary-100 text-primary-600"
              : "text-light-600 hover:bg-light-100"
          }`}
          onClick={() => setSearchType("sent")}
        >
          Sent
        </button>
        <button
          className={`px-6 py-2 rounded-lg text-sm font-medium ${
            searchType === "received"
              ? "bg-primary-100 text-primary-600"
              : "text-light-600 hover:bg-light-100"
          }`}
          onClick={() => setSearchType("received")}
        >
          Received
        </button>
      </div>

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-light-900">Transaction Details</h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-light-600 hover:text-light-900"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-light-100 p-4 rounded-xl">
                  <h3 className="font-medium text-light-900 mb-2">Transaction Hash</h3>
                  <p className="text-sm text-light-900 break-all">{selectedTransaction.transactionHash}</p>
                </div>
                
                <div className="bg-light-100 p-4 rounded-xl">
                  <h3 className="font-medium text-light-900 mb-2">Block Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-light-600">Block Number:</span>
                      <span className="ml-2 font-medium text-light-900">{selectedTransaction.blockNumber}</span>
                    </div>
                    <div>
                      <span className="text-light-600">Block Hash:</span>
                      <span className="ml-2 font-medium text-light-900 truncate">{selectedTransaction.blockHash?.substring(0, 16)}...</span>
                    </div>
                    <div>
                      <span className="text-light-600">Timestamp:</span>
                      <span className="ml-2 font-medium text-light-900">{formatDate(selectedTransaction.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-light-100 p-4 rounded-xl">
                    <h3 className="font-medium text-light-900 mb-2">From</h3>
                    <p className="text-sm text-light-900 break-all">{selectedTransaction.from}</p>
                  </div>
                  
                  <div className="bg-light-100 p-4 rounded-xl">
                    <h3 className="font-medium text-light-900 mb-2">To</h3>
                    <p className="text-sm text-light-900 break-all">{selectedTransaction.to}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-light-100 p-4 rounded-xl">
                    <h3 className="font-medium text-light-900 mb-2">Value</h3>
                    <p className="text-lg font-bold text-primary-600">{selectedTransaction.value} INR</p>
                  </div>
                  
                  <div className="bg-light-100 p-4 rounded-xl">
                    <h3 className="font-medium text-light-900 mb-2">Status</h3>
                    <div className="flex items-center">
                      <span className={`h-2 w-2 rounded-full ${selectedTransaction.status ? 'bg-success-500' : 'bg-error-500'} mr-2`}></span>
                      <span className={`font-medium ${selectedTransaction.status ? 'text-success-600' : 'text-error-600'}`}>
                        {selectedTransaction.status ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedTransaction.campaignId && (
                  <div className="bg-light-100 p-4 rounded-xl">
                    <h3 className="font-medium text-light-900 mb-2">Related Campaign</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-light-900 mb-2 sm:mb-0">
                        Campaign ID: <span className="font-medium">{selectedTransaction.campaignId}</span>
                      </p>
                      <button
                        onClick={() => {
                          setShowDetails(false);
                          navigate(`/campaign-details/${selectedTransaction.campaignId}`);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View Campaign Details
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="bg-light-100 p-4 rounded-xl">
                  <h3 className="font-medium text-light-900 mb-2">Transaction Type</h3>
                  <p className="text-sm text-light-900">{selectedTransaction.type}</p>
                </div>
                
                {selectedTransaction.note && (
                  <div className="bg-light-100 p-4 rounded-xl">
                    <h3 className="font-medium text-light-900 mb-2">Note</h3>
                    <p className="text-sm text-light-900">{selectedTransaction.note}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <CustomButton
                  btnType="button"
                  title="Close"
                  styles="bg-light-300 text-light-900"
                  handleClick={() => setShowDetails(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-light-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-light-900">Transaction Hash</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-light-900">Block</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-light-900">Age</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-light-900">From</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-light-900">To</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-light-900">Direction</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-light-900">Value</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-light-900">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-light-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-300">
              {filteredTransactions().map((tx, index) => (
                <tr 
                  key={tx.transactionHash || index}
                  className="hover:bg-light-50"
                >
                  <td className="px-4 py-3 text-sm text-light-900">
                    <div className="flex items-center">
                      <span className="font-mono truncate block max-w-[120px]">{tx.transactionHash?.substring(0, 10)}...</span>
                      <button 
                        onClick={() => handleCopy(tx.transactionHash)}
                        className="ml-1 text-light-500 hover:text-primary-600"
                        title="Copy transaction hash"
                      >
                        {copiedText === tx.transactionHash ? 
                          <FiCheckCircle className="h-4 w-4 text-success-600" /> : 
                          <FiCopy className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-light-900">
                    {tx.blockNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-light-600">
                    {getTransactionAge(tx.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm text-light-900">
                    <div className="flex items-center">
                      <span className={`truncate block max-w-[100px] ${tx.from === address ? "font-medium" : ""}`}>
                        {tx.from === address ? address : tx.from?.substring(0, 8) + "..."}
                      </span>
                      <button 
                        onClick={() => handleCopy(tx.from)}
                        className="ml-1 text-light-500 hover:text-primary-600"
                        title="Copy sender address"
                      >
                        {copiedText === tx.from ? 
                          <FiCheckCircle className="h-4 w-4 text-success-600" /> : 
                          <FiCopy className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-light-900">
                    <div className="flex items-center">
                      <span className={`truncate block max-w-[100px] ${tx.to === address ? "font-medium" : ""}`}>
                        {tx.to === address ? address : tx.to?.substring(0, 8) + "..."}
                      </span>
                      <button 
                        onClick={() => handleCopy(tx.to)}
                        className="ml-1 text-light-500 hover:text-primary-600"
                        title="Copy recipient address"
                      >
                        {copiedText === tx.to ? 
                          <FiCheckCircle className="h-4 w-4 text-success-600" /> : 
                          <FiCopy className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.from === address ? "bg-error-100 text-error-700" : "bg-success-100 text-success-700"
                      }`}>
                        {tx.from === address ? "OUT" : "IN"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`font-medium ${
                      tx.from === address ? "text-error-600" : "text-success-600"
                    }`}>
                      {tx.from === address ? "-" : "+"}{tx.value} INR
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status ? "bg-success-100 text-success-700" : "bg-error-100 text-error-700"
                      }`}>
                        {tx.status ? "Success" : "Failed"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleViewDetails(tx)}
                        className="p-1.5 rounded-md hover:bg-light-100"
                        title="View transaction details"
                      >
                        <FiExternalLink className="h-4 w-4 text-primary-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredTransactions().length === 0 && (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-light-600">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage; 