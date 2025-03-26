import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-6xl font-bold text-gray-400">404</h1>
      <p className="text-2xl font-medium mt-4 mb-8">Page not found</p>
      <Link to="/" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
