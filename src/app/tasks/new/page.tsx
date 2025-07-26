    // src/app/tasks/new/page.tsx
    'use client';

    import { useState } from 'react';
    import { useRouter } from 'next/navigation';
    import Link from 'next/link';

    interface TaskInput {
      title: string;
      description: string;
      dueDate: string; // Stored as string for input[type=date], converted to ISO string for API
      status?: 'pending' | 'in-progress' | 'completed';
    }

    export default function CreateTaskPage() {
      const [title, setTitle] = useState<string>('');
      const [description, setDescription] = useState<string>('');
      const [dueDate, setDueDate] = useState<string>('');
      const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
      const [error, setError] = useState<string | null>(null);
      const [loading, setLoading] = useState<boolean>(false);
      const router = useRouter();

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!title || !description || !dueDate) {
          setError('All fields are required.');
          setLoading(false);
          return;
        }

        const formattedDueDate = new Date(dueDate).toISOString();

        const newTask: TaskInput = {
          title,
          description,
          dueDate: formattedDueDate,
          status,
        };

        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          const res = await fetch(`${baseUrl}/api/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to create task');
          }

          router.push('/');
          router.refresh();
        } catch (err: unknown) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error creating task:', err);
          }
          setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
          setLoading(false);
        }
      };

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
                Create New Task
              </h1>
            </header>

            {error && (
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
                  placeholder="e.g., Buy groceries"
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
                  placeholder="e.g., Milk, eggs, bread, vegetables for dinner"
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
                    <span>Creating Task...</span>
                  </span>
                ) : (
                  'Create Task'
                )}
              </button>
            </form>
          </div>
        </div>
      );
    }
    