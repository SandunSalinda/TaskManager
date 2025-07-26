    // src/components/SimpleCalendar.tsx
    'use client';

    import React, { useState, useEffect } from 'react';

    export default function SimpleCalendar() {
      const [currentDate, setCurrentDate] = useState(new Date());

      useEffect(() => {
        // Update current date every minute (optional, but makes it dynamic)
        const timer = setInterval(() => {
          setCurrentDate(new Date());
        }, 60 * 1000); // Every minute

        return () => clearInterval(timer);
      }, []);

      const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
      };

      const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
      };

      const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month); // Day of the week for the 1st
        const today = new Date().getDate(); // Current day of the month

        const days = [];
        // Fill leading empty days
        for (let i = 0; i < firstDay; i++) {
          days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        // Fill days of the month
        for (let day = 1; day <= daysInMonth; day++) {
          const isToday = day === today && year === new Date().getFullYear() && month === new Date().getMonth();
          days.push(
            <div
              key={day}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-blue-100'}
                transition-colors duration-150 cursor-pointer
              `}
            >
              {day}
            </div>
          );
        }
        return days;
      };

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            {/* Navigation arrows could be added here for full interactivity */}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-gray-500 text-xs font-medium mb-2">
            {dayNames.map(day => <div key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>
      );
    }
    