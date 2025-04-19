import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomButton, FormField, Loader } from "../components";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../url";

const DeleteCampaign = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [userWallet, setUserWallet] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
      toast.error("You do not have permission to delete this campaign", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      navigate(`/campaign-details/${campaignId}`);
    }
  }, [campaign, userWallet, campaignId, navigate]);

  const handleDelete = async () => {
    if (confirmId !== campaignId) {
      toast.error("Campaign ID does not match. Please enter the correct ID to confirm deletion.", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      return;
    }

    try {
      setIsDeleting(true);
  
      const response = await axios.post(`${BASE_URL}/deleteCampaign`, {
        campaignId,
        walletAddress: userWallet
      });
  
      if (response.data.success) {
        toast.success(response.data.message || "Campaign deleted successfully", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
        navigate('/profile');
      } else {
        toast.error(response.data.message || "Failed to delete campaign", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
      }
    } catch (error) {
      // In case the error comes with a custom message from backend
      const backendMessage = error?.response?.data?.message;
      toast.error(backendMessage || "Something went wrong. Please try again", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      console.error("Error deleting campaign:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <Loader />;
  if (!campaign) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-light-900">Delete Campaign</h1>
      
      <div className="card bg-error-50 border border-error-200 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-error-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-error-700">Warning: Permanent Action</h2>
            <p className="text-error-600">This action cannot be undone and will permanently delete this campaign.</p>
          </div>
        </div>
      </div>
      
      {/* Campaign details */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-light-900 mb-4">Campaign Details</h2>
        
        <div className="flex items-start gap-4 mb-6">
          <img 
            src={campaign.image} 
            alt={campaign.title} 
            className="w-24 h-24 object-cover rounded-md"
          />
          <div>
            <h3 className="font-medium text-light-900">{campaign.title}</h3>
            <p className="text-sm text-light-600 mb-2">Campaign ID: {campaign.campaignId}</p>
            <p className="text-sm text-light-600">Created on {new Date(campaign.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="bg-light-200 p-4 rounded-md mb-6">
          <div className="grid grid-cols-2 gap-y-2">
            <div>
              <p className="text-xs text-light-600">Target</p>
              <p className="text-sm font-medium text-light-900">{campaign.target} INR</p>
            </div>
            <div>
              <p className="text-xs text-light-600">Raised</p>
              <p className="text-sm font-medium text-light-900">{campaign.raised || 0} INR</p>
            </div>
            <div>
              <p className="text-xs text-light-600">Category</p>
              <p className="text-sm font-medium text-light-900">{campaign.category}</p>
            </div>
            <div>
              <p className="text-xs text-light-600">Deadline</p>
              <p className="text-sm font-medium text-light-900">{new Date(campaign.deadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation input */}
      <div className="card">
        <h2 className="text-xl font-bold text-light-900 mb-4">Confirmation</h2>
        
        <p className="text-light-600 mb-6">
          To confirm deletion, please enter the campaign ID: <span className="font-medium text-light-900">{campaignId}</span>
        </p>
        
        <FormField 
          labelName="Campaign ID"
          placeholder="Enter the campaign ID to confirm deletion"
          inputType="text"
          value={confirmId}
          handleChange={(e) => setConfirmId(e.target.value)}
        />
        
        <div className="flex gap-4 mt-6">
          <CustomButton 
            btnType="button"
            title={isDeleting ? "Deleting..." : "Delete Campaign"}
            styles="bg-black text-white flex-1"
            handleClick={handleDelete}
            isDisabled={isDeleting || !confirmId}
          />
          
          <CustomButton 
            btnType="button"
            title="Cancel"
            styles="bg-light-300 text-light-900 flex-1"
            handleClick={() => navigate(`/campaign-details/${campaignId}`)}
            isDisabled={isDeleting}
          />
        </div>
      </div>
    </div>
  );
};

export default DeleteCampaign; 