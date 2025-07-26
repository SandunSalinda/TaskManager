'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/lib/NotificationContext';

interface TaskStatusDropdownProps {
  taskId: string;
  initialStatus: 'pending' | 'in-progress' | 'completed';
  onStatusUpdated: (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => void;
}

export default function TaskStatusDropdown({ taskId, initialStatus, onStatusUpdated }: TaskStatusDropdownProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { showSuccess, showError } = useNotifications();

  // Update local status when prop changes
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.status-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const updateStatus = async (newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (newStatus === status) return;
    
    setIsLoading(true);
    setIsOpen(false); // Close dropdown after selection
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStatus(newStatus);
        onStatusUpdated(taskId, newStatus); // Update the parent state immediately
        showSuccess(`Task status updated to ${newStatus.replace('-', ' ')}!`);
      } else {
        throw new Error(data.error || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      showError(`Failed to update task status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Reset to previous status on error
      setStatus(status);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative inline-block text-left status-dropdown">
      <div>
        <button
          type="button"
          className={`inline-flex items-center justify-center w-full rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 transition-all duration-200 ${getStatusColor(status)} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <div className="flex items-center space-x-1.5">
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 012h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              getStatusIcon(status)
            )}
            <span className="capitalize">{status.replace('-', ' ')}</span>
          </div>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {(['pending', 'in-progress', 'completed'] as const).map((statusOption) => (
              <button
                key={statusOption}
                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                  status === statusOption ? 'bg-gray-50 font-medium' : ''
                }`}
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(statusOption);
                }}
                disabled={isLoading || status === statusOption}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    statusOption === 'pending' ? 'bg-yellow-400' :
                    statusOption === 'in-progress' ? 'bg-blue-400' :
                    'bg-green-400'
                  }`} />
                  <span className="capitalize text-gray-700">
                    {statusOption.replace('-', ' ')}
                  </span>
                </div>
                {status === statusOption && (
                  <svg className="ml-auto w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
