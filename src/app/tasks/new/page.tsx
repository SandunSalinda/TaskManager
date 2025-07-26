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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 transition-all duration-300 p-8">
            <header className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
              <Link href="/" className="
                flex items-center space-x-2 text-slate-600 hover:text-blue-600
                font-medium transition-colors duration-200
              ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>Back to Home</span>
              </Link>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gradient">
                  Create New Task
                </h1>
                <p className="text-sm text-slate-600 mt-1">Add a new task to your workflow</p>
              </div>
            </header>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8" role="alert">
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">Task Title</label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white placeholder-slate-400"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Review project proposal"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white placeholder-slate-400 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the task..."
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white placeholder-slate-400"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-2">Initial Status</label>
                  <select
                    id="status"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white placeholder-slate-400"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
                  >
                    <option value="pending">📋 Pending</option>
                    <option value="in-progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-3 rounded-lg transition-all duration-200 border border-slate-200 hover:border-slate-300 flex-1 text-center">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Create Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }
    