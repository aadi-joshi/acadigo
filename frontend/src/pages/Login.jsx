import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthContext from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const { login, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  // Add state for carousel
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Features data array
  const features = [
    {
      title: "Multiple User Roles",
      description: "Admin, Trainer, and Student roles with appropriate permissions and interfaces"
    },
    {
      title: "Intuitive Dashboard",
      description: "Role-specific dashboards with quick access to features and real-time analytics"
    },
    {
      title: "PPT Management",
      description: "Upload, organize, view, and track presentations with granular access control"
    },
    {
      title: "Assignment System",
      description: "Create assignments, set deadlines, submit solutions, and grade with feedback"
    },
    {
      title: "Batch Management",
      description: "Organize students into batches for streamlined content delivery and tracking"
    },
    {
      title: "Activity Tracking",
      description: "Comprehensive analytics on student access, engagement, and performance"
    }
  ];

  // Carousel control functions
  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlide((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlide((prev) => (prev === 0 ? features.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === activeSlide) return;
    setIsTransitioning(true);
    setActiveSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 2000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [activeSlide, isTransitioning]);

  // Clear error messages when user starts typing
  useEffect(() => {
    if (email || password) {
      setPasswordError(false);
      setErrorMessage('');
    }
  }, [email, password]);

  // Show error message from context if available
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      if (error.toLowerCase().includes('credential') || error.toLowerCase().includes('invalid')) {
        setPasswordError(true);
      }
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(false);
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      console.log('Submitting login with:', email);

      const user = await login(email, password);

      // Only navigate if we actually got a user back
      if (user) {
        console.log('Login successful, navigating to dashboard');
        // Use setTimeout to ensure state updates are complete before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 300);
      } else {
        // This should not happen normally, but just in case
        setPasswordError(true);
        setErrorMessage('Login failed. Invalid credentials.');
      }
    } catch (err) {
      console.error('Login submission error:', err);
      // Extract the most specific error message available
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        error ||
        'Failed to log in. Please check your credentials.';

      console.log('Detailed error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: errorMsg
      });

      // Provide more specific error feedback
      if (err.response?.status === 429) {
        setErrorMessage('Too many login attempts. Please wait a moment before trying again.');
      } else if (err.response?.status === 401 ||
        errorMsg.toLowerCase().includes('credential') ||
        errorMsg.toLowerCase().includes('invalid')) {
        setPasswordError(true);
        setErrorMessage('Invalid email or password. Please try again.');
      } else {
        setErrorMessage(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Information Column */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-12 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="max-w-md text-center relative z-10">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold text-white">ACADIGO</h1>
          </div>
          <p className="text-xl text-gray-300 mb-10">A powerful learning management system with role-based permissions</p>

          {/* Carousel Container */}
          <div className="relative h-64 mb-8">
            {/* Feature Slides */}
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 transform
                  ${index === activeSlide
                    ? 'opacity-100 translate-x-0 scale-100'
                    : index < activeSlide
                      ? 'opacity-0 -translate-x-full scale-95'
                      : 'opacity-0 translate-x-full scale-95'
                  }`}
              >
                <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg transform transition-all duration-700 hover:translate-y-1 hover:shadow-glow h-full flex flex-col justify-center">
                  <h3 className="text-xl font-semibold text-primary-400 mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-5 bg-gray-800 bg-opacity-50 rounded-full p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-5 bg-gray-800 bg-opacity-50 rounded-full p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeSlide
                    ? 'w-8 bg-primary-500'
                    : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Feature Count Display */}
          <div className="text-sm text-gray-400">
            Feature {activeSlide + 1} of {features.length}
          </div>
        </div>

        {/* Subtle animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary-500 rounded-full filter blur-xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-400 rounded-full filter blur-xl animate-float animation-delay-1000"></div>
          <div className="absolute top-1/2 -left-10 w-24 h-24 bg-primary-600 rounded-full filter blur-xl animate-float animation-delay-500"></div>
        </div>
      </div>

      {/* Login Form Column */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <img src="https://i.ibb.co/MkXp26yF/icon.png" />
            <h2 className="text-center text-3xl font-extrabold text-white">Sign in</h2>
          </div>

          {errorMessage && (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded relative" role="alert">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                <span className="block sm:inline">{errorMessage}</span>
              </div>
              {passwordError && (
                <p className="text-sm mt-2">
                  Please check your email and password combination. If you're having trouble, contact your administrator.
                </p>
              )}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    passwordError ? 'border-red-500' : 'border-gray-700'
                  } rounded-t-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    passwordError ? 'border-red-500' : 'border-gray-700'
                  } rounded-b-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-primary-500 group-hover:text-primary-400" aria-hidden="true" />
                </span>
                {loading ? <LoadingSpinner size="small" /> : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
