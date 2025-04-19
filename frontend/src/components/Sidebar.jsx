import React from 'react';
import { NavLink } from 'react-router-dom';
import { RiDashboardLine, RiFileCopy2Line, RiHome5Line, RiLogoutBoxLine, RiUser3Line, RiWallet3Line } from 'react-icons/ri';
import { FiSend } from 'react-icons/fi';
import { MdOutlineCreate } from 'react-icons/md';
import { TbFileUpload } from 'react-icons/tb';
import { FaRegListAlt } from 'react-icons/fa';
import { useStateContext } from '../context';

const Sidebar = () => {
  const { address, disconnect } = useStateContext();

  const navLinks = [
    {
      name: 'Home',
      path: '/',
      icon: <RiHome5Line className="h-5 w-5" />,
    },
    {
      name: 'Dashboard',
      path: '/profile',
      icon: <RiDashboardLine className="h-5 w-5" />,
    },
    {
      name: 'My Campaigns',
      path: '/my-campaigns',
      icon: <FaRegListAlt className="h-5 w-5" />,
    },
    {
      name: 'Create Campaign',
      path: '/create-campaign',
      icon: <MdOutlineCreate className="h-5 w-5" />,
    },
    {
      name: 'Send Funds',
      path: '/send-transaction',
      icon: <FiSend className="h-5 w-5" />,
    },
    {
      name: 'Credit Wallet',
      path: '/credit-wallet',
      icon: <RiWallet3Line className="h-5 w-5" />,
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: <RiFileCopy2Line className="h-5 w-5" />,
    },
  ];

  if (address) {
    navLinks.push({
      name: 'Withdraw',
      path: '/withdraw',
      icon: <TbFileUpload className="h-5 w-5" />,
    });
  }

  const handleDisconnect = async () => {
    try {
      await disconnect();
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <aside className="w-64 h-full border-r border-light-400 bg-light-100 shadow-sidebar transition-colors duration-200">
      <div className="flex h-full flex-col py-6">
        <div className="px-3 py-2">
          <h2 className="text-lg font-semibold text-gradient">FundFlow</h2>
          <p className="mt-1 text-xs text-light-600">
            Decentralized Crowdfunding
          </p>
        </div>

        <div className="mt-6 flex flex-col px-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-primary-50 text-primary-600"
                      : "text-light-900 hover:bg-light-200"
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="mt-6 px-3">
          <div className="rounded-md bg-light-200 p-3">
            <h3 className="font-medium text-light-900">
              Need Help?
            </h3>
            <p className="mt-1 text-xs text-light-600">
              Check our documentation for guides and FAQs
            </p>
            <button className="mt-3 text-xs font-medium text-primary-600 hover:text-primary-500">
              View Documentation
            </button>
          </div>
        </div>

        {address && (
          <div className="mt-auto px-3">
            <div className="rounded-md bg-light-200 p-3">
              <button
                onClick={handleDisconnect}
                className="flex w-full items-center gap-2 text-sm font-medium text-light-900 hover:text-primary-600"
              >
                <RiLogoutBoxLine className="h-5 w-5" />
                <span>Disconnect Wallet</span>
              </button>
              <p className="mt-1 text-xs text-light-600">
                You are connected as:
                <span className="block mt-1 truncate font-medium">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
