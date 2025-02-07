import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './config/authConfig';
import { MsalProvider } from '@azure/msal-react';
import Header from './components/Header';
import AppointmentSection from './components/AppointmentSection';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const pca = new PublicClientApplication(msalConfig);

const App: React.FC = () => {
  return (
    <MsalProvider instance={pca}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
          <Header />
          <AppointmentSection />
        </div>
      </div>
    </MsalProvider>
  );
}

export default App;