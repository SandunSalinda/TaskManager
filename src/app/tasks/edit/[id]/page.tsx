// src/app/tasks/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react'; // Removed 'use' import
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Simple Task interface for basic type safety
interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string; // ISO string
}

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  // State to get id from params (in Next.js 15+ for client components)
  const [id, setId] = useState<string | null>(null);

  // State to hold task data and form inputs
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');

  const [loading, setLoading] = useState<boolean>(true); // For initial data fetch
  const [error, setError] = useState<string | null>(null); // For any errors related to fetch or form submission

  const router = useRouter();

  // Get id from params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Fetch task data when the component mounts or ID changes
  useEffect(() => {
    if (!id) return; // Ensure id is available before fetching

    const fetchTask = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/tasks/${id}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to load task: ${res.status}`);
        }

        const data = await res.json();
        if (data.success && data.data) {
          setTask(data.data);
          setTitle(data.data.title);
          setDescription(data.data.description);
          // Format for input[type=date]
          setDueDate(data.data.dueDate ? new Date(data.data.dueDate).toISOString().split('T')[0] : '');
          setStatus(data.data.status);
        } else {
          throw new Error(data.error || 'Task data not found.');
        }
      } catch (err: unknown) { // Use unknown for caught errors
        console.error("Error fetching task:", err);
        // Handle different types of errors based on message content
        if (err instanceof Error) {
          // Check for MongoDB CastError (invalid ObjectId format) by message content
          if (err.message.includes('Cast to ObjectId failed') || err.message.includes('Invalid task ID')) {
            setError("Invalid task ID format. Please check the URL.");
          } else {
            setError(err.message);
          }
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]); // Depend on 'id' to re-fetch when it becomes available


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true); // Indicate form submission loading

    if (!title || !description || !dueDate || !status) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    const formattedDueDate = new Date(dueDate).toISOString();

    const updatedTaskData = {
      title,
      description,
      dueDate: formattedDueDate,
      status,
    };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTaskData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/');
        router.refresh(); // Re-fetches data for the home page
      } else {
        throw new Error(data.error || 'Failed to update task.');
      }
    } catch (err: unknown) { // Use unknown for caught errors
      console.error("Error updating task:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while updating.');
    } finally {
      setLoading(false); // End loading regardless of success/failure
    }
  };

  if ((loading || !task) || !id) { // Show loading if initial fetch is ongoing, task not loaded, or id not available
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all duration-300 p-8 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-700 mb-2">Loading Task</h1>
          <p className="text-slate-500">Please wait while we fetch the task details...</p>
        </div>
      </div>
    );
  }

  if (error) { // If there's an error (and task is null or partially loaded due to error)
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 border border-blue-100 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
              Error Loading Task
          </h1>
          {error && <p className="text-red-700">{error}</p>}
          <p className="text-gray-600 mt-4">Go back to the <Link href="/" className="text-blue-500 hover:underline">home page</Link>.</p>
        </div>
      </div>
    );
  }

  // Render the form once the task is loaded and no error
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-blue-100">
          <Link href="/" className="
            flex items-center space-x-2 text-blue-600 hover:text-blue-800
            font-medium text-lg transition-colors duration-200 mb-4 sm:mb-0
          ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-blue-700 text-center sm:text-right">
            Edit Task
          </h1>
        </header>

        {error && ( // Display submission error if any
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-8 shadow-sm" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-800 text-lg font-semibold mb-2">Title</label>
            <input
              type="text"
              id="title"
              className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-gray-800 transition duration-200 text-base placeholder-gray-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Update project proposal"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-800 text-lg font-semibold mb-2">Description</label>
            <textarea
              id="description"
              rows={5}
              className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-gray-800 transition duration-200 resize-y text-base placeholder-gray-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Review feedback and integrate changes for final submission"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-gray-800 text-lg font-semibold mb-2">Due Date</label>
            <input
              type="date"
              id="dueDate"
              className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-gray-800 transition duration-200 text-base"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-gray-800 text-lg font-semibold mb-2">Status</label>
            <select
              id="status"
              className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-gray-800 transition duration-200 text-base bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In-Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating Task...</span>
              </span>
            ) : (
              'Update Task'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
