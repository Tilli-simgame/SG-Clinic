import React from 'react';

interface TimeSlotsProps {
  selectedDate: Date;
  onTimeSelect: (time: string) => void;
}

function TimeSlots({ selectedDate, onTimeSelect }: TimeSlotsProps) {
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Available Times</h3>
      <div className="grid grid-cols-4 gap-2">
        {timeSlots.map((time) => (
          <button
            key={time}
            onClick={() => onTimeSelect(time)}
            className="bg-gray-100 p-2 rounded cursor-pointer hover:bg-blue-100 text-sm"
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimeSlots;