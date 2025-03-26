const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const spinner = (
    <div className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" 
      role="status"
      aria-label="loading"
      style={{ 
        borderColor: 'currentColor currentColor transparent currentColor'
      }}
      className={`text-primary-500 ${sizeClasses[size] || sizeClasses.medium}`}>
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
