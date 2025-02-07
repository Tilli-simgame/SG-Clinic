import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';

interface AppointmentFormProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  isAuthenticated: boolean;
}

function AppointmentForm({ selectedDate, selectedTime, isAuthenticated }: AppointmentFormProps) {
  const { instance } = useMsal();
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time for your appointment.");
      return;
    }

    const appointmentData = {
      petName,
      petType,
      breed,
      age,
      reason,
      appointmentDate: selectedDate.toISOString(),
      appointmentTime: selectedTime
    };

    try {
      const account = instance.getAllAccounts()[0];
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: [`https://${process.env.REACT_APP_TENANT_NAME}.onmicrosoft.com/api/appointments.write`],
        account: account
      });

      const response = await fetch(`${process.env.REACT_APP_FUNCTION_APP_URL}/api/ProcessAppointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResponse.accessToken}`
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.text();
        alert(result);
        // Clear form fields
        setPetName('');
        setPetType('');
        setBreed('');
        setAge('');
        setReason('');
      } else {
        throw new Error('Failed to book appointment');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while booking the appointment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="petName" className="text-sm font-medium text-gray-700">Pet's Name</label>
        <input
          id="petName"
          type="text"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          placeholder="e.g., Fluffy"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="petType" className="text-sm font-medium text-gray-700">Pet Type</label>
        <select
          id="petType"
          value={petType}
          onChange={(e) => setPetType(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select pet type</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="horse">Horse</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="breed" className="text-sm font-medium text-gray-700">Breed</label>
        <input
          id="breed"
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="e.g., Golden Retriever"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="age" className="text-sm font-medium text-gray-700">Age</label>
        <input
          id="age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age in years"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="reason" className="text-sm font-medium text-gray-700">Reason for Appointment</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please describe the reason for your visit"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        ></textarea>
      </div>
      {selectedDate && selectedTime && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Selected Appointment</h3>
          <p className="text-blue-600">{selectedDate.toDateString()}, {selectedTime}</p>
        </div>
      )}
      <div className="pt-6">
        <button
          type="submit"
          disabled={!isAuthenticated}
          className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isAuthenticated
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Book Appointment
        </button>
      </div>
    </form>
  );
}

export default AppointmentForm;