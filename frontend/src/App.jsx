import React, { useEffect } from "react";
import { Route, Routes, Outlet, useLocation } from "react-router-dom";
import { Sidebar, Navbar, Footer } from "./components";
import { CampaignDetails, CreateCampaign, Home, Profile, Withdraw } from "./pages";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TransactionsPage from "./pages/TransactionsPage";
import SendTransaction from "./pages/SendTransaction";
import CreditWallet from "./pages/CreditWallet";
import UpdateCampaign from "./pages/UpdateCampaign";
import DeleteCampaign from "./pages/DeleteCampaign";
import Contribute from "./pages/Contribute";
import MyCampaigns from "./pages/MyCampaigns";

// Layout component for the main app
const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-light-200 text-light-900">
      <Navbar />
      
      <div className="flex flex-1">
        <div className="sticky top-0 hidden h-screen lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

const App = () => {
  const { pathname } = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Main App Routes with shared layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-campaign" element={<CreateCampaign />} />
        <Route path="/campaign-details/:campaignId" element={<CampaignDetails />} />
        <Route path="/update-campaign/:campaignId" element={<UpdateCampaign />} />
        <Route path="/delete-campaign/:campaignId" element={<DeleteCampaign />} />
        <Route path="/contribute/:campaignId" element={<Contribute />} />
        <Route path="/withdraw/:campaignId" element={<Withdraw />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/send-transaction" element={<SendTransaction />} />
        <Route path="/credit-wallet" element={<CreditWallet />} />
        <Route path="/my-campaigns" element={<MyCampaigns />} />
       

      </Route>
    </Routes>
  );
};

export default App;
