import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomButton, FormField, Loader } from "../components";
import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../url";

const UpdateCampaign = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userWallet, setUserWallet] = useState("");
  const [campaign, setCampaign] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Form fields state
  const [form, setForm] = useState({
    title: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
    category: "",
  });

  // Load user data and check ownership
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
          const campaignData = response.data;
          setCampaign(campaignData);
          
          // Populate form with existing data
          setForm({
            title: campaignData.title || "",
            description: campaignData.description || "",
            target: campaignData.target || "",
            deadline: campaignData.deadline ? new Date(campaignData.deadline).toISOString().split('T')[0] : "",
            image: campaignData.image || "",
            category: campaignData.category || "",
          });
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

  // Check if user is the campaign owner
  useEffect(() => {
    if (campaign && userWallet && campaign.walletAddress !== userWallet) {
      toast.error("You do not have permission to edit this campaign", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      navigate(`/campaign-details/${campaignId}`);
    }
  }, [campaign, userWallet, campaignId, navigate]);

  // Handle form field changes
  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => { 
    e.preventDefault();
    
    // Validate form fields
    if (!form.title || !form.description || !form.target || !form.deadline || !form.image || !form.category) {
      toast.error("Please fill all the fields", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirm(true);
  };

  // Handle update confirmation
 // In your UpdateCampaign component
 const handleUpdateConfirm = async () => {
  try {
    setIsLoading(true);

    const payload = {
      campaignId,
      title: form.title,
      description: form.description,
      target: Number(form.target),
      deadline: new Date(form.deadline).toISOString(),
      image: form.image,
      category: form.category,
    };

    const response = await axios.post(`${BASE_URL}/updateCampaign`, payload);

    const data = response.data;

    // ✅ Show error (red toast) even on success if needed
    if (data.success) {
      toast.success(data.message || "Campaign updated successfully", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      navigate(`/campaign-details/${campaignId}`);
    } else if (data.error || data.message) {
      // Handle string errors or messages
      toast.error(data.error || data.message, {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    } else if (Array.isArray(data.errors)) {
      // Handle array of validation errors
      data.errors.forEach((err) => {
        toast.error(err.msg || err.message || err, {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
      });
    } else {
      // Fallback
      toast.error("Unknown error occurred", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
    }
  } catch (error) {
    console.error("Error updating campaign:", error);
    toast.error(
      error.response?.data?.message || error.response?.data?.error || "Something went wrong. Please try again",
      {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      }
    );
  } finally {
    setIsLoading(false);
    setShowConfirm(false);
  }
};



  if (isLoading) return <Loader />;
  if (!campaign) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-light-900">Update Campaign</h1>
      
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <img 
            src={campaign.image} 
            alt={campaign.title} 
            className="w-20 h-20 object-cover rounded-md"
          />
          <div>
            <p className="text-light-900 font-medium">Campaign ID: {campaign.campaignId}</p>
            <p className="text-sm text-light-600">Created on {new Date(campaign.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField 
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange("title", e)}
          />
          
          <FormField 
            labelName="Story *"
            placeholder="Write your story"
            isTextArea
            value={form.description}
            handleChange={(e) => handleFormFieldChange("description", e)}
          />
          
          <div className="flex flex-col sm:flex-row gap-6">
            <FormField 
              labelName="Goal *"
              placeholder="INR 50000"
              inputType="number"
              value={form.target}
              handleChange={(e) => handleFormFieldChange("target", e)}
            />
            
            <FormField 
              labelName="End Date *"
              placeholder="End Date"
              inputType="date"
              value={form.deadline}
              handleChange={(e) => handleFormFieldChange("deadline", e)}
            />
          </div>
          
          <FormField 
            labelName="Campaign image *"
            placeholder="Place image URL of your campaign"
            inputType="url"
            value={form.image}
            handleChange={(e) => handleFormFieldChange("image", e)}
          />
          
          <FormField 
            labelName="Category *"
            placeholder="Education, Healthcare, etc."
            inputType="text"
            value={form.category}
            handleChange={(e) => handleFormFieldChange("category", e)}
          />
          
          <div className="flex gap-4">
            <CustomButton 
              btnType="submit"
              title="Update Campaign"
              styles="bg-primary-600 flex-1"
            />
            
            <CustomButton 
              btnType="button"
              title="Cancel"
              styles="bg-light-300 text-light-900 flex-1"
              handleClick={() => navigate(`/campaign-details/${campaignId}`)}
            />
          </div>
        </form>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold text-light-900 mb-4">Confirm Update</h2>
            
            <p className="text-light-600 mb-6">
              Are you sure you want to update this campaign? The following details will be changed:
            </p>
            
            <div className="bg-light-100 p-4 rounded-md mb-6 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-light-600">Title:</span>
                <span className="text-light-900 font-medium">{form.title}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-light-600">Target:</span>
                <span className="text-light-900 font-medium">{form.target} INR</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-light-600">Deadline:</span>
                <span className="text-light-900 font-medium">{new Date(form.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-600">Category:</span>
                <span className="text-light-900 font-medium">{form.category}</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <CustomButton 
                btnType="button"
                title="Confirm Update"
                styles="bg-primary-600 flex-1"
                handleClick={handleUpdateConfirm}
              />
              
              <CustomButton 
                btnType="button"
                title="Cancel"
                styles="bg-light-300 text-light-900 flex-1"
                handleClick={() => setShowConfirm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateCampaign;
