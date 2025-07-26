// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TaskActions from '@/componants/TaskActions';
import TaskStatusDropdown from '@/componants/TaskStatusDropdown';
import SimpleCalendar from '@/componants/SimpleCalender';
import { useNotifications } from '@/lib/NotificationContext';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string; // ISO string
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { showSuccess } = useNotifications();

  const router = useRouter();

  // Handle mounting for search params
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for success parameters and show notifications
  useEffect(() => {
    if (!mounted) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const updated = urlParams.get('updated');
    const created = urlParams.get('created');
    
    if (updated === 'success') {
      showSuccess('Task updated successfully!', 5000);
      // Clean up the URL parameter
      router.replace('/');
    }
    
    if (created === 'success') {
      showSuccess('Task created successfully!', 5000);
      // Clean up the URL parameter
      router.replace('/');
    }
  }, [mounted, showSuccess, router]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks', {
          cache: 'no-store',
        });

        if (!res.ok) {
          const responseText = await res.text();
          console.error('API Error Response:', responseText);

          try {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
          } catch (parseError) {
            throw new Error(`API returned HTML instead of JSON. Status: ${res.status}. Response: ${responseText.substring(0, 200)}...`);
          }
        }

        const responseText = await res.text();
        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          console.error('JSON Parse Error - Response Text:', responseText.substring(0, 500));
          throw new Error(`Invalid JSON response from API: ${responseText.substring(0, 200)}...`);
        }

        if (data.success) {
          // Sort tasks by creation date (newest first)
          const sortedTasks = data.data.sort((a: Task, b: Task) => {
            return b._id.localeCompare(a._id);
          });
          setTasks(sortedTasks);
        } else {
          throw new Error(data.error || 'Failed to fetch tasks: success was false');
        }
      } catch (err: unknown) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching tasks:', err);
        }
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Function to remove a task from the state (for real-time deletion)
  const removeTaskFromState = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
  };

  // Function to update a task's status in the state (for real-time status updates)
  const updateTaskStatusInState = (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all duration-300 p-8 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-700 mb-2">Loading Tasks</h1>
          <p className="text-slate-500">Please wait while we fetch your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-10">
      <div className="container mx-auto max-w-7xl">
        {/* Enhanced header with subtle glass effect */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 p-7 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center space-x-4 mb-6 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Task Manager
              </h1>
              <p className="text-slate-600 text-sm">Organize your work efficiently</p>
            </div>
          </div>
          <Link href="/tasks/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Create Task</span>
          </Link>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-sm" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-semibold">Error:</strong>
                <span className="ml-2">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Enhanced Calendar Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <SimpleCalendar />
              {/* Task Summary Card */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700 mb-3">Task Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="font-semibold text-slate-800">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-600">Pending</span>
                    <span className="font-semibold text-yellow-700">{tasks.filter(t => t.status === 'pending').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600">In Progress</span>
                    <span className="font-semibold text-blue-700">{tasks.filter(t => t.status === 'in-progress').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Completed</span>
                    <span className="font-semibold text-green-700">{tasks.filter(t => t.status === 'completed').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Main Task List Area */}
          <div className="lg:col-span-4">
            {tasks.length === 0 && !error ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-9h3.75M12 3v9m0 0l3-3m-3 3l-3-3m12 6v-6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                  No tasks yet
                </h3>
                <p className="text-slate-500 mb-6">
                  Start by creating your first task to organize your workflow!
                </p>
                <Link href="/tasks/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Create First Task</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <div key={task._id} className={`
                    bg-white rounded-xl shadow-sm border border-slate-200 transition-all duration-300 p-6 hover:scale-[1.02] flex flex-col relative overflow-hidden group hover:shadow-md hover:border-slate-300
                    ${
                      task.status === 'pending' ? 'border-l-4 border-yellow-400 bg-gradient-to-r from-yellow-50/50 to-white' :
                      task.status === 'in-progress' ? 'border-l-4 border-blue-400 bg-gradient-to-r from-blue-50/50 to-white' :
                      'border-l-4 border-green-400 bg-gradient-to-r from-green-50/50 to-white'
                    }
                  `}>
                    {/* Header with title and status aligned */}
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors flex-1 mr-3">{task.title}</h2>
                      <TaskStatusDropdown 
                        taskId={task._id} 
                        initialStatus={task.status} 
                        onStatusUpdated={updateTaskStatusInState}
                      />
                    </div>
                    
                    <p className="text-slate-600 mb-6 flex-grow leading-relaxed text-sm">{task.description}</p>

                    <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center text-sm text-slate-600 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                        </svg>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>

                      <TaskActions taskId={task._id} onTaskDeleted={removeTaskFromState} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
