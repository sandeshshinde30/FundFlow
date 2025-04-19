import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader, CustomButton } from "../components";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../url";
import { daysLeft } from "../utils";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();
  const remainingDays = daysLeft(campaign.deadline);
  const isExpired = remainingDays <= 0;
  const progress = Math.min(Math.round((campaign.raised / campaign.target) * 100), 100);
  const canWithdraw = progress >= 100;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg">
      {/* Campaign Image */}
      <div className="relative">
        <img 
          src={campaign.image} 
          alt={campaign.title}
          className="h-48 w-full object-cover"
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white">
            {campaign.category || "General"}
          </span>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium text-white ${isExpired ? 'bg-error-600' : canWithdraw ? 'bg-success-600' : 'bg-warning-600'}`}>
            {isExpired ? 'Campaign Ended' : canWithdraw ? 'Ready for Withdrawal' : 'Funding In Progress'}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        {/* Campaign Title and Date */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-light-900 line-clamp-2">{campaign.title}</h3>
          <p className="text-xs text-light-600">Created on {new Date(campaign.createdAt).toLocaleDateString()}</p>
        </div>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-light-900">{campaign.raised} INR raised</span>
            <span className="font-medium text-primary-600">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-light-300">
            <div
              className="h-full rounded-full bg-primary-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-light-600">Goal: {campaign.target} INR</span>
            <span className="text-light-600">
              {isExpired ? "Ended" : `${remainingDays} days left`}
            </span>
          </div>
        </div>
        
        {/* Campaign Actions */}
        <div className="flex flex-col gap-2">
          <Link to={`/campaign-details/${campaign.campaignId}`} className="w-full">
            <CustomButton
              btnType="button"
              title="View Details"
              styles="w-full bg-light-300 text-light-900 hover:bg-light-400"
            />
          </Link>
          
          {canWithdraw && (
            <Link to={`/withdraw/${campaign.campaignId}`} className="w-full">
              <CustomButton
                btnType="button"
                title="Withdraw Funds"
                styles="w-full bg-success-600 hover:bg-success-700"
              />
            </Link>
          )}
          
          {!canWithdraw && !isExpired && (
            <div className="mt-1 text-center">
              <p className="text-xs text-light-600">
                {100 - progress}% more to unlock withdrawal
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyCampaigns = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [withdrawableCampaigns, setWithdrawableCampaigns] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [endedCampaigns, setEndedCampaigns] = useState([]);
  const [address, setAddress] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, withdrawable, active, ended

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.walletAddress) {
        setAddress(parsedUser.walletAddress);
      } else {
        // No wallet address, redirect to login
        toast.error("Please login to view your campaigns", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
        navigate('/login');
      }
    } else {
      // No user data, redirect to login
      toast.error("Please login to view your campaigns", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      navigate('/login');
    }
  }, [navigate]);

  // Fetch user campaigns
  useEffect(() => {
    const fetchUserCampaigns = async () => {
      if (address) {
        setIsLoading(true);
        try {
          const response = await axios.post(`${BASE_URL}/getCampaigns`, {
            walletAddress: address
          });
          
          if (response.data && Array.isArray(response.data)) {
            const fetchedCampaigns = response.data;
            setCampaigns(fetchedCampaigns);
            
            // Categorize campaigns
            const now = new Date().getTime();
            
            const withdrawable = fetchedCampaigns.filter(campaign => {
              const raised = campaign.raised || 0;
              const progress = Math.round((raised / campaign.target) * 100);
              return progress >= 100;
            });
            
            const active = fetchedCampaigns.filter(campaign => {
              const deadline = new Date(campaign.deadline).getTime();
              const raised = campaign.raised || 0;
              const progress = Math.round((raised / campaign.target) * 100);
              return deadline > now && progress < 100;
            });
            
            const ended = fetchedCampaigns.filter(campaign => {
              const deadline = new Date(campaign.deadline).getTime();
              const raised = campaign.raised || 0;
              const progress = Math.round((raised / campaign.target) * 100);
              return deadline <= now && progress < 100;
            });
            
            setWithdrawableCampaigns(withdrawable);
            setActiveCampaigns(active);
            setEndedCampaigns(ended);
          }
        } catch (error) {
          console.error("Failed to fetch user campaigns", error);
          toast.error("Failed to load your campaigns", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserCampaigns();
  }, [address]);

  // Filter campaigns based on active tab
  const displayedCampaigns = () => {
    switch (activeTab) {
      case "withdrawable":
        return withdrawableCampaigns;
      case "active":
        return activeCampaigns;
      case "ended":
        return endedCampaigns;
      default:
        return campaigns;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-900 sm:text-3xl">My Campaigns</h1>
          <p className="mt-2 text-light-600">Manage and track all your fundraising campaigns</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/create-campaign">
            <CustomButton
              btnType="button"
              title="Create New Campaign"
              styles="bg-primary-600 hover:bg-primary-700"
            />
          </Link>
        </div>
      </div>

      {/* Campaign Stats Summary */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-md">
          <div className="mb-2 text-sm font-medium text-light-600">Total Campaigns</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-light-900">{campaigns.length}</div>
            <div className="rounded-full bg-primary-100 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-md">
          <div className="mb-2 text-sm font-medium text-light-600">Withdrawable</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-success-600">{withdrawableCampaigns.length}</div>
            <div className="rounded-full bg-success-100 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-md">
          <div className="mb-2 text-sm font-medium text-light-600">Active Campaigns</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-primary-600">{activeCampaigns.length}</div>
            <div className="rounded-full bg-primary-100 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-md">
          <div className="mb-2 text-sm font-medium text-light-600">Ended Campaigns</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-light-600">{endedCampaigns.length}</div>
            <div className="rounded-full bg-light-200 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-light-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-light-300">
        <div className="flex overflow-x-auto">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "all"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-light-600 hover:text-light-900"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Campaigns
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "withdrawable"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-light-600 hover:text-light-900"
            }`}
            onClick={() => setActiveTab("withdrawable")}
          >
            Ready for Withdrawal {withdrawableCampaigns.length > 0 && `(${withdrawableCampaigns.length})`}
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "active"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-light-600 hover:text-light-900"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active Campaigns
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "ended"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-light-600 hover:text-light-900"
            }`}
            onClick={() => setActiveTab("ended")}
          >
            Ended Campaigns
          </button>
        </div>
      </div>

      {/* Campaign Cards */}
      {displayedCampaigns().length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 shadow-md">
          <div className="mb-4 rounded-full bg-light-100 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-light-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-light-900">No Campaigns Found</h3>
          <p className="mb-6 text-center text-light-600">
            {activeTab === "all" 
              ? "You haven't created any campaigns yet."
              : activeTab === "withdrawable"
                ? "You don't have any campaigns ready for withdrawal."
                : activeTab === "active"
                  ? "You don't have any active campaigns."
                  : "You don't have any ended campaigns."
            }
          </p>
          <Link to="/create-campaign">
            <CustomButton
              btnType="button"
              title="Create Your First Campaign"
              styles="bg-primary-600"
            />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCampaigns().map((campaign) => (
            <CampaignCard key={campaign.campaignId} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Withdrawable Campaigns Section (if on All tab and has withdrawable campaigns) */}
      {activeTab === "all" && withdrawableCampaigns.length > 0 && (
        <div className="mt-12 rounded-xl bg-success-50 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-success-800">Campaigns Ready for Withdrawal</h2>
              <p className="text-success-700">These campaigns have reached their funding goals and are ready for withdrawal!</p>
            </div>
            <Link to="#" onClick={() => setActiveTab("withdrawable")}>
              <span className="text-sm font-medium text-success-700 hover:text-success-800">View All</span>
            </Link>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {withdrawableCampaigns.slice(0, 3).map((campaign) => (
              <div key={campaign.campaignId} className="flex items-center rounded-lg bg-white p-4 shadow-sm">
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="mr-4 h-14 w-14 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-light-900 line-clamp-1">{campaign.title}</h4>
                  <p className="text-xs text-success-600">{campaign.raised} INR raised</p>
                </div>
                <Link to={`/withdraw/${campaign.campaignId}`}>
                  <button className="ml-2 rounded-full bg-success-100 p-2 text-success-700 hover:bg-success-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCampaigns; 