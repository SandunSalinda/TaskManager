// src/components/TaskActions.tsx
'use client'; // This makes it a Client Component

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TaskActionsProps {
  taskId: string;
}

export default function TaskActions({ taskId }: TaskActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    // Using window.confirm for simplicity, replace with a custom modal in production apps
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Task deleted successfully!');
        router.refresh(); // This re-fetches data for the parent Server Component
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete task.');
      }
    } catch (err: unknown) { // Use unknown for caught errors
      console.error('Error deleting task:', err);
      alert(err instanceof Error ? `An error occurred while deleting the task: ${err.message}` : 'An unknown error occurred while deleting the task.');
    }
  };

  return (
    <div className="flex justify-end space-x-3">
      <Link href={`/tasks/edit/${taskId}`} className="
        bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium py-2 px-4 rounded-lg text-sm
        transition-all duration-200 border border-blue-200 hover:border-blue-300 flex items-center space-x-1
      ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        <span>Edit</span>
      </Link>
      <button
        onClick={handleDelete}
        className="btn-danger flex items-center space-x-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        <span>Delete</span>
      </button>
    </div>
  );
}
