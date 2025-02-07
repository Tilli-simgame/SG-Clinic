import React, { useState } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import AppointmentForm from './AppointmentForm';
import TimeSlots from './TimeSlots';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function AppointmentSection() {
  const isAuthenticated = useIsAuthenticated();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleDateSelect = (slotInfo: { start: Date; end: Date; slots: Date[] | string[] }) => {
    setSelectedDate(slotInfo.start);
    setSelectedTime(null);
  };

  // Generate events for the next 30 days
  const generateEvents = () => {
    const events = [];
    const startDate = new Date();
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Add 'Free' event for each day
      events.push({
        title: 'Free',
        start: new Date(currentDate.setHours(9, 0, 0, 0)),
        end: new Date(currentDate.setHours(17, 0, 0, 0)),
        allDay: false,
      });
    }
    return events;
  };

  const events = generateEvents();

  return (
    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <AppointmentForm selectedDate={selectedDate} selectedTime={selectedTime} isAuthenticated={isAuthenticated} />
      <div className="space-y-6">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 400 }}
          onSelectSlot={handleDateSelect}
          selectable
          views={['month', 'week']}
          defaultView="month"
        />
        {selectedDate && (
          <TimeSlots selectedDate={selectedDate} onTimeSelect={setSelectedTime} />
        )}
      </div>
    </div>
  );
}

export default AppointmentSection;