'use client';

import React, { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { AccountInfo } from '@azure/msal-browser';
import { loginRequest } from './../config/authConfig';

function Header() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    console.log('Accounts:', accounts);
    if (accounts.length > 0) {
      console.log('First account:', accounts[0]);
    }
  }, [accounts]);

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(console.error);
  };

  const handleLogout = () => {
    instance.logoutPopup().catch(console.error);
  };

  const userAccount: AccountInfo | undefined = accounts[0];

  console.log(userAccount);

  const userName = userAccount?.name || userAccount?.username || 'User';
  const userEmail = userAccount?.username || 'No email available';


  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center border-b pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Virtuaaliklinikka</h1>
        <p className="text-gray-600">Varaa aika.</p>
        <div className="mt-4">
          {isAuthenticated && userAccount ? (
            <div className="flex flex-col items-center">
              <div className="mb-2 text-sm text-gray-700">
                <p><strong>Name:</strong> {userName}</p>
                <p><strong>Email:</strong> {userEmail}</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;