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
        <div className="flex justify-end space-x-3 mt-4"> {/* Added mt-4 for spacing */}
          <Link href={`/tasks/edit/${taskId}`} className="
            bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-sm
            transition duration-300 shadow-sm hover:shadow-md
          ">
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="
              bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md text-sm
              transition duration-300 shadow-sm hover:shadow-md
            "
          >
            Delete
          </button>
        </div>
      );
    }
    