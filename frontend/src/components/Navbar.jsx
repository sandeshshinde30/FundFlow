import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IoClose, IoMenu } from 'react-icons/io5';
import { logo, search } from '../assets';
import CustomButton from './CustomButton';
import useBalance from '../hooks/useBalance';
import BASE_URL from '../url';

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState("0.00");
  const [userName, setUserName] = useState('');

  // Load wallet address and user details from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.walletAddress) {
      setAddress(user.walletAddress);
    }
    if (user?.name) {
      setUserName(user.name);
    }
    if (address) {
      fetchBalance(address);
    }
  }, [address]);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const userMenuItems = [
    { label: 'Profile', link: '/profile' },
    { label: 'Create Campaign', link: '/create-campaign' },
    { label: 'My Campaigns', link: '/my-campaigns' },
    { label: 'Send Transaction', link: '/send-transaction' },
    { label: 'Credit Wallet', link: '/credit-wallet' },
    { label: 'Transactions', link: '/transactions' },
  ];

  const fetchBalance = async (walletAddress) => {
    try {
      const res = await fetch(`${BASE_URL}/getBalance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ walletAddress })
      });

      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance || "0.00");
      } else {
        console.error("Failed to fetch balance:", data.message);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary-400 to-primary-600">
            <img src={logo} alt="FundFlow logo" className="h-6 w-6 object-contain" />
          </div>
          <p className="hidden text-xl font-semibold text-gray-800 sm:flex">FundFlow</p>
        </Link>

        {/* Search */}
        {/* <div className="hidden h-10 w-64 items-center gap-2 rounded-lg border border-gray-300 bg-light-100 px-3 md:flex">
          <img src={search} alt="search" className="h-4 w-4 object-contain" />
          <input
            type="text"
            placeholder="Search campaigns"
            className="h-full w-full bg-transparent text-sm outline-none"
          />
        </div> */}

        {/* Desktop Navigation */}
        <div className="flex items-center gap-4">
          {/* Balance Display */}
          {address && (
            <div className="hidden rounded-lg border border-gray-200 bg-light-100 px-3 py-1.5 sm:block">
              <span className="text-xs text-gray-500">Balance:</span>
              <span className="ml-1 font-medium text-gray-700">{balance} INR</span>
            </div>
          )}

          {/* User's Name and Initials */}
          {!isAuthPage &&
  (address ? ( 
    <div className="relative  items-center gap-2">
      
      {/* Profile Icon */}
      <button
        onClick={toggleUserMenu}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-light-100"
      >
        {/* Display the user's initial letter inside the circle */}
        <span className="text-lg font-semibold text-gray-700">
          {userName.charAt(0).toUpperCase()}
        </span>
      </button>

      {isUserMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          {userMenuItems.map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsUserMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  ) : (
    <Link to="/login">
      <CustomButton
        btnType="button"
        title="Login"
        styles="bg-primary-500 text-white px-5 py-2 rounded-lg hover:bg-primary-600"
      />
    </Link>
  ))}


          {/* Mobile Menu Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-light-100 lg:hidden"
            onClick={() => setIsDrawerOpen(true)}
          >
            <IoMenu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          <div className="relative flex w-4/5 max-w-sm flex-col bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary-400 to-primary-600">
                  <img src={logo} alt="logo" className="h-6 w-6 object-contain" />
                </div>
                <p className="text-xl font-semibold text-gray-800">FundFlow</p>
              </Link>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-light-100"
                onClick={() => setIsDrawerOpen(false)}
              >
                <IoClose className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <nav className="mt-4 flex flex-col gap-1.5">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.link}
                    className="rounded-lg px-4 py-2.5 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {address && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-light-100 p-3">
                <div className="text-xs text-gray-500">Connected Wallet</div>
                <div className="mt-1 truncate font-medium text-gray-700">{address}</div>
                <div className="mt-2 text-sm text-gray-500">
                  Balance: <span className="font-medium text-gray-700">{balance} INR</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
