import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context";
import { money } from "../assets";
import { CustomButton, FormField, Loader } from "../components";
import { checkIfImage } from "../utils";
import { toast } from "react-toastify";
import BASE_URL from "../url";

const CreateCampaign = () => {
  const isSubmittingRef = useRef(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createCampaign } = useStateContext();
  const [form, setForm] = useState({
    name: "",
    title: "",
    category: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignsThisMonth, setCampaignsThisMonth] = useState(0);
  const [showMonthlyLimitWarning, setShowMonthlyLimitWarning] = useState(false);

  // Check for monthly campaign limit
  useEffect(() => {
    const checkCampaignLimit = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.walletAddress) return;

        const response = await fetch(`${BASE_URL}/getCampaignsInCurrentMonth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: user.walletAddress,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setCampaignsThisMonth(data.count || 0);
          if (data.count >= 2) {
            setShowMonthlyLimitWarning(true);
          }
        }
      } catch (error) {
        console.error("Error checking campaign limit:", error);
      }
    };

    checkCampaignLimit();
  }, []);

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: null });
    }
    
    // Update image preview when image URL changes
    if (fieldName === 'image' && e.target.value) {
      checkIfImage(e.target.value, (exists) => {
        if (exists) setPreviewImage(e.target.value);
      });
    }
  };

  const validateForm = () => {
    let formErrors = {};
    let valid = true;

    // Name validation
    if (!form.name.trim()) {
      formErrors.name = "Name is required";
      valid = false;
    }

    // Title validation
    if (!form.title.trim()) {
      formErrors.title = "Campaign title is required";
      valid = false;
    }

    // Category validation
    if (!form.category) {
      formErrors.category = "Category is required";
      valid = false;
    }

    // Description validation
    if (!form.description.trim()) {
      formErrors.description = "Description is required";
      valid = false;
    }

    // Target validation
    if (!form.target || isNaN(form.target) || parseFloat(form.target) <= 0) {
      formErrors.target = "Valid target amount is required";
      valid = false;
    }

    // Deadline validation
    if (!form.deadline) {
      formErrors.deadline = "End date is required";
      valid = false;
    } else {
      const selectedDate = new Date(form.deadline);
      const today = new Date();
      if (selectedDate <= today) {
        formErrors.deadline = "End date must be in the future";
        valid = false;
      }
    }

    // Image URL validation
    if (!form.image.trim()) {
      formErrors.image = "Image URL is required";
      valid = false;
    }

    setErrors(formErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isSubmittingRef.current) return; // block resubmission
    isSubmittingRef.current = true;

  
    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      isSubmittingRef.current = false; // release lock
      return;
    }
    
    console.log("form",form);

    if (campaignsThisMonth >= 2) {
      toast.error("You can only create 2 campaigns per month", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
      });
      isSubmittingRef.current = false;
      return;
    }
  
    checkIfImage(form.image, async (exists) => {
      if (!exists) {
        toast.error("Please provide a valid image URL", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        });
        setErrors({ ...errors, image: "Invalid image URL" });
        isSubmittingRef.current = false;
        return;
      }
    });
  
      setIsLoading(true);
  
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const walletAddress = user?.walletAddress;
  
        if (!walletAddress) {
          toast.error("You must be logged in to create a campaign");
          return;
        }
  
        const response = await fetch(`${BASE_URL}/createCampaign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress, ...form }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          toast.success("Campaign created successfully!");
          setTimeout(() => {
            navigate("/my-campaigns");
            isSubmittingRef.current = false;
          }, 2000);
        } else {
          toast.error(data.message || "Failed to create campaign");
          isSubmittingRef.current = false;
        }
      } catch (error) {
        console.error("Error creating campaign:", error);
        toast.error("Something went wrong");
        isSubmittingRef.current = false;
      } finally {
        setIsLoading(false);
      }
    
  };
  
  
  const categories = [
    "Fundraiser", "Crisis Relief", "Emergency", "Education", 
    "Medical", "Non-Profit", "Personal", "Environment", 
    "Animals", "Technology", "Arts", "Other"
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {isLoading && <Loader />}
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-light-900 mb-2">Create a New Campaign</h1>
        <p className="text-light-600">Fill out the form below to start your fundraising journey</p>
      </div>

      {/* Monthly Limit Warning */}
      {showMonthlyLimitWarning && (
        <div className="bg-warning-100 border border-warning-300 text-warning-800 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-warning-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Campaign Limit Warning</h3>
              <div className="mt-2 text-sm">
                <p>
                  You have created {campaignsThisMonth} out of 2 allowed campaigns this month. You {campaignsThisMonth >= 2 ? "cannot" : "can"} create {2 - campaignsThisMonth} more campaign{2 - campaignsThisMonth !== 1 ? "s" : ""} this month.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-light-100 border border-light-300 rounded-md p-4 mb-6">
        <h3 className="text-sm font-medium mb-2">Campaign Guidelines & Disclaimer</h3>
        <ul className="text-xs text-light-600 space-y-1 list-disc pl-4">
          <li>You may create a maximum of 2 campaigns per month</li>
          <li>All campaigns are verified and monitored for legitimacy</li>
          <li>Provide accurate information about your funding needs</li>
          <li>Once funded, you are responsible for fulfilling the campaign's purpose</li>
          <li>FundFlow reserves the right to remove campaigns that violate our terms</li>
          <li>All transactions are recorded on the blockchain for transparency</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column: Form fields */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-light-900 mb-4">Campaign Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-1">Your Name *</label>
                  <FormField
                    placeholder="e.g. Kiran Mahajan"
                    inputType="text"
                    value={form.name}
                    handleChange={(e) => handleFormFieldChange("name", e)}
                  />
                  {errors.name && <p className="text-error-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-1">Campaign Title *</label>
                  <FormField
                    placeholder="e.g. Funds for Tamilnadu floods"
                    inputType="text"
                    value={form.title}
                    handleChange={(e) => handleFormFieldChange("title", e)}
                  />
                  {errors.title && <p className="text-error-500 text-sm mt-1">{errors.title}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormFieldChange("category", e)}
                    className="w-full bg-white border border-light-300 rounded-md py-2 px-3 text-light-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-error-500 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-bold text-light-900 mb-4">Campaign Story</h2>
              
              <div>
                <label className="block text-sm font-medium text-light-700 mb-1">Story *</label>
                <p className="text-xs text-light-500 mb-2">Describe your campaign and why it matters. Be detailed and compelling.</p>
                <FormField
                  placeholder="Write your story here..."
                  isTextArea
                  value={form.description}
                  handleChange={(e) => handleFormFieldChange("description", e)}
                />
                {errors.description && <p className="text-error-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-bold text-light-900 mb-4">Funding Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-1">Target Amount (INR) *</label>
                  <FormField
                    placeholder="e.g. 5000"
                    inputType="number"
                    value={form.target}
                    handleChange={(e) => handleFormFieldChange("target", e)}
                  />
                  {errors.target && <p className="text-error-500 text-sm mt-1">{errors.target}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-700 mb-1">End Date *</label>
                  <FormField
                    inputType="date"
                    value={form.deadline}
                    handleChange={(e) => handleFormFieldChange("deadline", e)}
                  />
                  {errors.deadline && <p className="text-error-500 text-sm mt-1">{errors.deadline}</p>}
                </div>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-md mt-4 flex items-center">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-primary-700">
                  You'll receive 100% of the funds raised for your campaign.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right column: Image preview and submit */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-light-900 mb-4">Campaign Image</h2>
              
              <div>
                <label className="block text-sm font-medium text-light-700 mb-1">Image URL *</label>
                <p className="text-xs text-light-500 mb-2">Add a compelling image that represents your campaign.</p>
                <FormField
                  placeholder="Enter image URL (JPEG, PNG, WebP)"
                  inputType="url"
                  value={form.image}
                  handleChange={(e) => handleFormFieldChange("image", e)}
                />
                {errors.image && <p className="text-error-500 text-sm mt-1">{errors.image}</p>}
              </div>
              
              <div className="mt-4">
                {previewImage ? (
                  <div className="relative">
                    <img 
                      src={previewImage} 
                      alt="Campaign preview" 
                      className="w-full h-56 object-cover rounded-md"
                    />
                    <p className="text-xs text-light-500 mt-2 text-center">Image Preview</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-light-300 rounded-md p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-light-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-light-500 mt-2">Enter an image URL to see preview</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card bg-light-100">
              <h2 className="text-xl font-bold text-light-900 mb-4">Ready to Launch?</h2>
              
              <p className="text-light-600 mb-6">
                By creating this campaign, you agree to our terms of service and privacy policy.
                We review all campaigns for compliance with our guidelines.
              </p>
              
              <div className="flex justify-end gap-4">
                <CustomButton 
                  btnType="button"
                  title="Cancel"
                  styles="bg-light-300 text-light-900"
                  handleClick={() => navigate('/')}
                />
                <CustomButton 
                  btnType="submit"
                  title={isSubmitting ? "Creating Campaign..." : "Create Campaign"}
                  styles="bg-primary-600"
                  handleClick={handleSubmit}
                  disabled={isLoading}
                  isDisabled={isSubmitting || (campaignsThisMonth >= 2)}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
