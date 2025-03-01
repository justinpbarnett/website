import Link from 'next/link';

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          There was a problem signing you in. Please try again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 