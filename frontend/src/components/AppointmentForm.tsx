'use client';

import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';

interface AppointmentFormProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  isAuthenticated: boolean;
}

export default function AppointmentForm({ selectedDate, selectedTime, isAuthenticated }: AppointmentFormProps) {
  const { instance, inProgress, accounts } = useMsal();
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    breed: '',
    age: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time for your appointment.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const appointmentData = {
      ...formData,
      appointmentDate: selectedDate.toISOString(),
      appointmentTime: selectedTime
    };

    try {
      console.log('Authentication status:', isAuthenticated);
      console.log('Interaction status:', inProgress);
      console.log('Accounts:', accounts);

      if (inProgress !== InteractionStatus.None) {
        throw new Error('Authentication interaction is in progress');
      }

      if (accounts.length === 0) {
        throw new Error('No active account found');
      }

      const account = accounts[0];
      console.log('Selected account:', account);

      const tokenRequest = {
        scopes: [`https://${process.env.REACT_APP_TENANT_NAME}.onmicrosoft.com/api/appointments.write`],
        account: account
      };
      console.log('Token request:', tokenRequest);

      const tokenResponse = await instance.acquireTokenSilent(tokenRequest);
      console.log('Token acquired successfully');
      console.log('Token:', tokenResponse.accessToken);

      const response = await fetch(`${process.env.REACT_APP_FUNCTION_APP_URL}/api/ProcessAppointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResponse.accessToken}`
        },
        body: JSON.stringify(appointmentData),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        setSuccess(responseText);
        setFormData({
          petName: '',
          petType: '',
          breed: '',
          age: '',
          reason: ''
        });
      } else {
        throw new Error(responseText || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="petName" className="block text-sm font-medium text-gray-700">
          Pet's Name
        </label>
        <input
          id="petName"
          name="petName"
          type="text"
          required
          value={formData.petName}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="petType" className="block text-sm font-medium text-gray-700">
          Pet Type
        </label>
        <select
          id="petType"
          name="petType"
          required
          value={formData.petType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select pet type</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
          Breed
        </label>
        <input
          id="breed"
          name="breed"
          type="text"
          required
          value={formData.breed}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          id="age"
          name="age"
          type="text"
          required
          value={formData.age}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason for Appointment
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          value={formData.reason}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      {selectedDate && selectedTime && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Selected Appointment</h3>
          <p className="text-blue-600">
            {selectedDate.toDateString()}, {selectedTime}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={!isAuthenticated || isSubmitting}
        className={`w-full px-4 py-2 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isAuthenticated && !isSubmitting
            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
}