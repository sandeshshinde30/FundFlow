import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomButton, Loader } from "../components";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../url";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

const Withdraw = () => {
  const { campaignId } = useParams();
  console.log("Campaign ID:", campaignId);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [userWallet, setUserWallet] = useState("");

  // Load user data
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.walletAddress) {
        setUserWallet(parsedUser.walletAddress);
      }
    }
  }, []);

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

  // Check if user owns the campaign
  useEffect(() => {
    if (campaign && userWallet && campaign.walletAddress !== userWallet) {
      toast.error("You do not have permission to withdraw funds from this campaign", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      navigate(`/campaign-details/${campaignId}`);
    }
  }, [campaign, userWallet, campaignId, navigate]);

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      const response = await axios.post(`${BASE_URL}/withdrawFunds`, {
        campaignId,
        walletAddress: userWallet,
      });
      
      if (response.data.success) {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
        navigate('/profile');
      } else {
        toast.error(response.data.message || "Failed to withdraw funds", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      let errorMessage = "Something went wrong. Please try again";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) return <Loader />;
  if (!campaign) return null;

  const progress = Math.min(Math.round((campaign.raised / campaign.target) * 100), 100);
  const canWithdraw = progress >= 100;
  const remainingDays = campaign.deadline ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          {/* Campaign Image Section */}
          <div className="md:w-2/5">
            <div className="relative h-full">
              <img 
                src={campaign.image} 
                alt={campaign.title} 
                className="w-full h-full object-cover"
                style={{ minHeight: "300px" }}
              />
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {campaign.category || "General"}
                </span>
              </div>
              
              {/* Status Badge */}
              <div className="absolute bottom-4 left-4">
                <span className={`${canWithdraw ? 'bg-success-600' : 'bg-warning-600'} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                  {canWithdraw ? 'Ready for Withdrawal' : 'Not Fully Funded'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Campaign Details Section */}
          <div className="md:w-3/5 p-6">
            <h1 className="text-2xl font-bold text-light-900 mb-2">{campaign.title}</h1>
            <p className="text-sm text-light-600 mb-6">Created on {new Date(campaign.createdAt).toLocaleDateString()}</p>
            
            {/* Campaign Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-light-100 p-4 rounded-lg text-center">
                <p className="text-sm text-light-600">Days Left</p>
                <p className="text-xl font-bold text-light-900">
                  {remainingDays}
                </p>
              </div>
              <div className="bg-light-100 p-4 rounded-lg text-center">
                <p className="text-sm text-light-600">Progress</p>
                <p className="text-xl font-bold text-primary-600">{progress}%</p>
              </div>
              <div className="bg-light-100 p-4 rounded-lg text-center">
                <p className="text-sm text-light-600">Target</p>
                <p className="text-xl font-bold text-light-900">{campaign.target} INR</p>
              </div>
              <div className="bg-light-100 p-4 rounded-lg text-center">
                <p className="text-sm text-light-600">Raised</p>
                <p className="text-xl font-bold text-success-600">{campaign.raised} INR</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 mb-6">
              <div className="flex flex-wrap justify-between text-sm mb-2">
                <span className="font-medium text-light-900">{campaign.raised} INR raised</span>
                <span className="text-light-600">of {campaign.target} INR target</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-light-300 mb-1">
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Organizer Information */}
            <div className="bg-light-100 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-light-900 mb-2">Recipient Information</h3>
              <div className="flex items-center gap-3">
                <Jazzicon
                  diameter={48}
                  seed={jsNumberForAddress(userWallet || "0x0")}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium text-light-900">{campaign.name || "Anonymous"}</p>
                  <p className="text-xs text-light-600 break-all truncate max-w-[200px]">{userWallet}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Withdrawal Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-light-900 mb-6">Withdraw Funds</h2>
        
        {canWithdraw ? (
          <>
            <div className="bg-success-100 p-6 rounded-xl mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-success-200 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-success-700 text-xl mb-2">Congratulations!</h3>
                  <p className="text-success-700 text-lg mb-2">Your campaign has reached its funding goal!</p>
                  <p className="text-success-600">You've successfully raised <span className="font-bold">{campaign.raised} INR</span> from your supporters. You can now withdraw these funds to your wallet.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-light-100 p-6 rounded-xl mb-8">
              <h3 className="font-bold text-light-900 text-xl mb-4">Withdrawal Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-light-300">
                  <span className="text-light-700 font-medium">Campaign ID</span>
                  <span className="font-medium text-light-900">{campaignId}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-light-300">
                  <span className="text-light-700 font-medium">Total Raised</span>
                  <span className="font-bold text-light-900">{campaign.raised} INR</span>
                </div>
                <div className="flex justify-between py-3 border-b border-light-300">
                  <span className="text-light-700 font-medium">Campaign Target</span>
                  <span className="font-medium text-light-900">{campaign.target} INR</span>
                </div>
                <div className="flex justify-between py-3 border-b border-light-300">
                  <span className="text-light-700 font-medium">Campaign Status</span>
                  <span className="font-medium text-success-600">Ready for Withdrawal</span>
                </div>
                <div className="flex justify-between py-3 border-b border-light-300">
                  <span className="text-light-700 font-medium">Recipient Wallet</span>
                  <span className="font-medium text-light-900 text-sm truncate max-w-[300px]">{userWallet}</span>
                </div>
                <div className="flex justify-between py-4 font-bold text-xl">
                  <span className="text-light-900">Total Withdrawal Amount</span>
                  <span className="text-primary-600">{campaign.raised} INR</span>
                </div>
              </div>
            </div>
            
            <div className="bg-warning-100 p-6 rounded-xl mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-warning-200 p-3 rounded-full flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-warning-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-warning-700 text-xl mb-2">Important Notice</h3>
                  <p className="text-warning-700 mb-2">By withdrawing funds:</p>
                  <ul className="list-disc list-inside text-warning-700 space-y-1 ml-2">
                    <li>Your campaign will be marked as complete</li>
                    <li>You'll no longer be able to receive additional contributions</li>
                    <li>The campaign will be removed from active listings</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <CustomButton 
                btnType="button"
                title={isWithdrawing ? "Processing Withdrawal..." : "Withdraw Funds Now"}
                styles="bg-primary-600 flex-1 text-lg py-4"
                handleClick={handleWithdraw}
                isDisabled={isWithdrawing}
              />
              
              <CustomButton 
                btnType="button"
                title="Back to Campaign"
                styles="bg-light-300 text-light-900 flex-1 text-lg py-4"
                handleClick={() => navigate(`/campaign-details/${campaignId}`)}
                isDisabled={isWithdrawing}
              />
            </div>
          </>
        ) : (
          <div className="bg-light-100 p-8 rounded-xl text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-light-200 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-light-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-light-900 text-2xl mb-4">Funding Goal Not Reached</h3>
            <p className="text-light-700 text-lg mb-6">Your campaign has only reached <span className="font-bold text-primary-600">{progress}%</span> of its funding goal. You need to reach 100% before you can withdraw funds.</p>
            <div className="h-4 w-full max-w-md mx-auto overflow-hidden rounded-full bg-light-300 mb-8">
              <div
                className="h-full rounded-full bg-primary-600"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <CustomButton 
                btnType="button"
                title="Back to Campaign"
                styles="bg-primary-600 flex-1 text-lg py-4"
                handleClick={() => navigate(`/campaign-details/${campaignId}`)}
              />
              <CustomButton 
                btnType="button"
                title="Go to Dashboard"
                styles="bg-light-300 text-light-900 flex-1 text-lg py-4"
                handleClick={() => navigate('/profile')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
