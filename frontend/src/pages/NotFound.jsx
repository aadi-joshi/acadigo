import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">404</h2>
          <p className="mt-2 text-center text-xl text-gray-400">
            Page not found
          </p>
        </div>
        <div className="mt-8">
          <p className="text-gray-300 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="btn-primary inline-block"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
