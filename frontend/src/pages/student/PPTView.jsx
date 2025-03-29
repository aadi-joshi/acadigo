import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DocumentTextIcon, ArrowTopRightOnSquareIcon, ArrowDownTrayIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export default function PPTView() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [ppts, setPPTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPPT, setSelectedPPT] = useState(null);
  const [viewerError, setViewerError] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchPPTs = async () => {
      try {
        setLoading(true);
        console.log('Fetching PPTs...');
        
        // Use our api service which automatically includes auth token
        const { data } = await api.get('/ppts');
        console.log('PPTs fetched successfully:', data.length);
        setPPTs(data);
        
        // If ID is provided in URL, fetch that specific PPT
        if (id) {
          try {
            console.log('Fetching specific PPT:', id);
            const { data: pptData } = await api.get(`/ppts/${id}`);
            console.log('Specific PPT fetched:', pptData);
            setSelectedPPT(pptData);
            // Log the view
            await api.post(`/logs/ppt/${id}/view`);
          } catch (specificError) {
            console.error('Error fetching specific PPT:', specificError);
            // Only set error if we couldn't fetch any PPTs at all
            if (data.length === 0) {
              setError('PPT not found or you do not have permission to access it');
            }
          }
        } else if (data.length > 0) {
          // Select the first PPT if no specific one is requested
          setSelectedPPT(data[0]);
        }
      } catch (err) {
        console.error('Error fetching PPTs:', err);
        if (err.response?.status === 401) {
          setError('Authentication error: Please login again');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to access these PPTs');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch PPTs');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPPTs();
    } else {
      setError('You must be logged in to view PPTs');
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  const handlePPTClick = async (ppt) => {
    try {
      setSelectedPPT(ppt);
      setViewerError(false);
      // Log the view
      await api.post(`/logs/ppt/${ppt._id}/view`);
    } catch (err) {
      console.error('Error logging PPT view:', err);
    }
  };

  const handleDownload = async (e, ppt) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log('Downloading PPT:', ppt.fileName);
      window.open(ppt.fileUrl, '_blank');
      // Log the download
      await api.post(`/logs/ppt/${ppt._id}/download`);
      toast.success('Download started');
    } catch (err) {
      console.error('Error downloading PPT:', err);
      toast.error('Failed to download file');
    }
  };

  const handleViewerError = () => {
    console.log('PDF/PPT viewer error occurred');
    setViewerError(true);
  };

  // Filter PPTs based on search term
  const filteredPPTs = ppts.filter(ppt => 
    ppt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ppt.description && ppt.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)]">
      {/* PPT List Sidebar */}
      <div className="w-full lg:w-1/3 bg-gray-800 rounded-xl p-4 overflow-hidden flex flex-col lg:mr-4 mb-4 lg:mb-0">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search PPTs..."
              className="w-full bg-gray-700 rounded-md py-2 pl-4 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <h2 className="text-lg font-medium text-white mb-4">Available PPTs</h2>
        
        {filteredPPTs.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredPPTs.map((ppt) => (
              <div 
                key={ppt._id} 
                className={`p-3 rounded-lg cursor-pointer ${
                  selectedPPT && selectedPPT._id === ppt._id 
                    ? 'bg-primary-900 bg-opacity-20 border border-primary-500' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => handlePPTClick(ppt)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-primary-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-white">{ppt.title}</h3>
                      {ppt.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ppt.description}</p>
                      )}
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>Added on {new Date(ppt.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDownload(e, ppt)}
                    className="text-gray-400 hover:text-primary-400"
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-center">
              {searchTerm ? 'No PPTs match your search.' : 'No PPTs available.'}
            </p>
          </div>
        )}
      </div>
      
      {/* PPT Viewer */}
      <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden flex flex-col">
        {selectedPPT ? (
          <>
            <div className="p-4 border-b border-gray-700">
              <h1 className="text-xl font-bold text-white">{selectedPPT.title}</h1>
              {selectedPPT.description && (
                <p className="mt-1 text-gray-400">{selectedPPT.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-400">
                  Added on {new Date(selectedPPT.createdAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <a
                    href={selectedPPT.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-300 bg-primary-900 bg-opacity-10 hover:bg-opacity-20"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                    Open in New Tab
                  </a>
                  <a
                    href={selectedPPT.fileUrl}
                    download
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    onClick={() => api.post(`/logs/ppt/${selectedPPT._id}/download`)}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </div>
              </div>
            </div>
            
            {viewerError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <DocumentTextIcon className="h-16 w-16 text-gray-500 mb-4" />
                <h2 className="text-xl font-medium text-white mb-2">Viewer Not Available</h2>
                <p className="text-gray-400 text-center max-w-md mb-4">
                  The document viewer encountered an error. You can still download the file to view it locally.
                </p>
                <a
                  href={selectedPPT.fileUrl}
                  download
                  className="btn-primary"
                  onClick={() => api.post(`/logs/ppt/${selectedPPT._id}/download`)}
                >
                  Download File
                </a>
              </div>
            ) : (
              <div className="flex-1 bg-gray-900 overflow-hidden">
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedPPT.fileUrl)}&embedded=true`}
                  className="w-full h-full"
                  title={selectedPPT.title}
                  frameBorder="0"
                  onError={handleViewerError}
                ></iframe>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <DocumentTextIcon className="h-16 w-16 text-gray-500 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">No PPT Selected</h2>
            <p className="text-gray-400 text-center max-w-md">
              Select a PPT from the list to view it here. You can search for specific PPTs using the search bar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
