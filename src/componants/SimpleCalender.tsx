// src/components/SimpleCalendar.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function SimpleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Update current date every minute to keep it dynamic
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date().getDate();
    const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();

    const days = [];
    
    // Fill leading empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Fill days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today && isCurrentMonth;
      days.push(
        <div
          key={day}
          className={`
            w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
            transition-all duration-200 cursor-pointer
            ${isToday 
              ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200' 
              : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
            }
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all duration-300 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {monthNames[currentDate.getMonth()]}
          </h3>
          <p className="text-sm text-slate-500">{currentDate.getFullYear()}</p>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-slate-500 text-xs font-medium mb-3">
        {dayNames.map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
}
