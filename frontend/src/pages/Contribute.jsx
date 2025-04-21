import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStateContext } from "../context";
import { CustomButton, Loader, FormField } from "../components";
import { daysLeft } from "../utils";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../url";

const Contribute = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { donate, address } = useStateContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState("");
  const [senderWallet, setSenderWallet] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  
  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.walletAddress) {
        setSenderWallet(parsedUser.walletAddress);
        fetchWalletBalance(parsedUser.walletAddress);
      }
    }
  }, []);

  // Fetch wallet balance
  const fetchWalletBalance = async (walletAddress) => {
    if (!walletAddress) return;
    
    try {
      setIsCheckingBalance(true);
      const response = await axios.post(`${BASE_URL}/getBalance`, {
        walletAddress
      });
      
      if (response.data.balance) {
        setWalletBalance(parseFloat(response.data.balance));
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(`${BASE_URL}/getCampaignDetails`, {
          campaignId,
        });
        
        if (response.data) {
          setCampaign(response.data);
        } else {
          toast.error("Campaign not found", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
          });
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        toast.error("Failed to load campaign details", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchCampaignDetails();
  }, [campaignId, navigate]);

  const handleContribute = async () => {
    if (!senderWallet) {
      toast.error("Please log in to contribute to this campaign", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      return;
    }

    // Check if the amount is greater than wallet balance
    if (parseFloat(amount) > walletBalance) {
      toast.error("Insufficient balance. Please add funds to your wallet.", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Make API call to contribute
      const response = await axios.post(`${BASE_URL}/contribute`, {
        campaignId,
        walletAddress: senderWallet,
        amount: parseFloat(amount)
      });

      if (response.data.success) {
        toast.success("Contribution successful! Thank you for your support.", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
        navigate(`/campaign-details/${campaignId}`);
      } else {
        toast.error(response.data.message || "Failed to contribute", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error contributing to campaign:", error);
      let errorMessage = "Something went wrong. Please try again later.";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    } finally {
      // Add a timeout to prevent rapid resubmission
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    }
  };

  if (isLoading) return <Loader />;
  if (!campaign) return null;

  const remainingDays = daysLeft(campaign.deadline);
  const isExpired = remainingDays <= 0;
  const raised = campaign.raised || 0;
  const remaining = campaign.target - raised;
  const progress = Math.min(Math.round((raised / campaign.target) * 100), 100);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-light-900">Contribute to Campaign</h1>
        <button 
          onClick={() => navigate(`/campaign-details/${campaignId}`)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Campaign
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Campaign Info */}
        <div className="md:col-span-2 space-y-8">
      {/* Campaign Overview Card */}
          <div className="card bg-white shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Campaign Image */}
              <div className="md:w-2/5">
            <img 
              src={campaign.image} 
              alt={campaign.title}
              className="rounded-md w-full h-48 object-cover"
            />
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-light-900">{raised} INR raised</span>
                    <span className="font-medium text-light-900">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-light-300">
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-light-600">Goal: {campaign.target} INR</span>
                    <span className="text-light-600">
                      {isExpired ? "Campaign Ended" : `${remainingDays} days left`}
                    </span>
                  </div>
                </div>
          </div>
          
          {/* Campaign Info */}
              <div className="md:w-3/5">
                <h2 className="text-xl font-bold text-light-900 mb-3">{campaign.title}</h2>
                <p className="text-sm text-light-600 mb-4">
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium mr-2">
                    {campaign.category}
                  </span>
                  Created by {campaign.name || "Anonymous"}
                </p>
                
                <div className="bg-light-100 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-light-900 mb-2">Campaign Status</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span className="text-light-600">Status:</span>
                      <span className={`ml-2 font-medium ${isExpired ? "text-error-500" : "text-success-500"}`}>
                        {isExpired ? "Ended" : "Active"}
                      </span>
              </div>
              <div>
                      <span className="text-light-600">Raised:</span>
                      <span className="ml-2 font-medium text-light-900">{raised} INR</span>
              </div>
              <div>
                      <span className="text-light-600">Remaining:</span>
                      <span className="ml-2 font-medium text-light-900">{remaining} INR</span>
              </div>
              <div>
                      <span className="text-light-600">Deadline:</span>
                      <span className="ml-2 font-medium text-light-900">
                        {new Date(campaign.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
              </div>
                
                <p className="text-sm text-light-600 mb-2">Campaign Description:</p>
                <p className="text-sm text-light-900 line-clamp-3 mb-2">
                  {campaign.description.substring(0, 150)}...
                </p>
          </div>
        </div>
      </div>
      
      {/* Wallet Addresses */}
          <div className="card bg-white shadow-md">
        <h3 className="text-lg font-bold mb-4 text-light-900">Wallet Information</h3>
        
        <div className="space-y-4">
          <div>
                <div className="flex items-center mb-1">
                  <svg className="w-4 h-4 text-primary-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-light-800">Your Wallet (Sender)</p>
                </div>
                {senderWallet ? (
                  <div className="p-3 bg-light-100 rounded-md text-light-900 break-all border border-light-300">
                    <div className="flex justify-between">
                      <span className="truncate">{senderWallet}</span>
                      <span className="font-medium text-success-600">
                        Balance: {isCheckingBalance ? 'Loading...' : `${walletBalance} INR`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-error-50 rounded-md text-error-700 border border-error-200">
                    Please login to contribute to this campaign
                  </div>
                )}
          </div>
          
          <div>
                <div className="flex items-center mb-1">
                  <svg className="w-4 h-4 text-success-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-sm font-medium text-light-800">Recipient Wallet</p>
                </div>
                <div className="p-3 bg-light-100 rounded-md text-light-900 break-all border border-light-300">
              {campaign.walletAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Contribution Form */}
        <div className="md:col-span-1">
          <div className="card bg-white shadow-md">
            <h3 className="text-lg font-bold mb-4 text-light-900">Make a Contribution</h3>
        
        {isExpired ? (
              <div className="p-4 bg-error-50 rounded-md text-error-700 border border-error-200">
                <p className="text-sm">
            This campaign has ended and is no longer accepting contributions.
                </p>
          </div>
        ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-1">
                    Amount (INR)
                  </label>
            <FormField
                    placeholder="Enter amount"
              inputType="number"
              value={amount}
              handleChange={(e) => setAmount(e.target.value)}
            />
                  <p className="text-xs text-light-600 mt-1">
                    Minimum contribution: 1 INR
                  </p>
                  
                  {/* Balance Check */}
                  {amount && senderWallet && (
                    <div className={`mt-2 text-xs rounded-md p-2 ${
                      parseFloat(amount) > walletBalance 
                        ? "bg-error-50 text-error-600" 
                        : "bg-success-50 text-success-600"
                    }`}>
                      {parseFloat(amount) > walletBalance 
                        ? "Insufficient balance. Please add funds to your wallet."
                        : "Sufficient balance available."}
                    </div>
                  )}
                </div>
                
                <div className="bg-light-100 p-3 rounded-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-light-600">Your Balance:</span>
                    <span className="font-medium text-light-900">
                      {isCheckingBalance ? 'Loading...' : `${walletBalance} INR`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-light-600">Contribution Amount:</span>
                    <span className="font-medium text-light-900">{amount || '0'} INR</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-light-300 mt-2">
                    <span className="text-light-900 font-medium">Balance After:</span>
                    <span className="font-medium text-light-900">
                      {isCheckingBalance 
                        ? 'Loading...' 
                        : `${(walletBalance - (parseFloat(amount) || 0)).toFixed(2)} INR`}
                    </span>
                  </div>
            </div>
            
                <div className="flex flex-col gap-2">
              <CustomButton
                btnType="button"
                    title={isSubmitting ? "Processing..." : "Contribute Now"}
                    styles={`w-full bg-primary-600`}
                handleClick={handleContribute}
                    isDisabled={!senderWallet || !amount || isSubmitting || parseFloat(amount) > walletBalance}
                  />
                  
                  {!senderWallet && (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-2 text-sm text-primary-600 font-medium"
                    >
                      Login to Contribute
                    </button>
                  )}
                  
                  {senderWallet && parseFloat(amount) > walletBalance && (
                    <button
                      onClick={() => navigate('/credit-wallet')}
                      className="w-full py-2 text-sm text-primary-600 font-medium"
                    >
                      Add Funds to Wallet
                    </button>
                  )}
                </div>
            </div>
            )}
          </div>
          
          {/* Transaction Disclaimer */}
          <div className="mt-4 p-4 bg-light-100 rounded-md text-sm text-light-600">
            <h4 className="font-medium text-light-900 mb-2">Transaction Information</h4>
            <p className="mb-2 text-xs">
              All contributions are processed on the blockchain, ensuring full transparency and security.
            </p>
            <ul className="list-disc pl-4 text-xs space-y-1">
              <li>Transactions are finalized immediately</li>
              <li>All contributions are non-refundable</li>
              <li>Transaction records are publicly available on the blockchain</li>
              <li>Your contribution will appear in your transaction history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contribute; 