import { useEffect, useState } from 'react';
import axios from 'axios';
import { format, isPast } from 'date-fns';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DocumentTextIcon, ArrowTopRightOnSquareIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const PPTView = () => {
  const [ppts, setPPTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPPT, setSelectedPPT] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchPPTs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/ppts/available');
        setPPTs(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch PPTs');
        console.error('Error fetching PPTs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPPTs();
  }, []);

  const handlePPTClick = async (ppt) => {
    setSelectedPPT(ppt);
    // Log the view
    try {
      await axios.post(`/api/logs/ppt/${ppt._id}/view`);
    } catch (err) {
      console.error('Error logging PPT view:', err);
    }
  };

  const handleDownload = async (e, ppt) => {
    e.stopPropagation();
    try {
      window.open(ppt.fileUrl, '_blank');
      // Log the download
      await axios.post(`/api/logs/ppt/${ppt._id}/download`);
    } catch (err) {
      console.error('Error downloading PPT:', err);
    }
  };

  // Filter PPTs based on search term
  const filteredPPTs = ppts.filter(ppt => 
    ppt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ppt.description && ppt.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort PPTs by created date (newest first)
  const sortedPPTs = [...filteredPPTs].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

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
        
        <h2 className="text-lg font-medium text-white mb-4">PPTs</h2>
        
        {sortedPPTs.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-2">
            {sortedPPTs.map((ppt) => {
              return (
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
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-400">
                            Added: {format(new Date(ppt.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDownload(e, ppt)}
                      className="p-1 rounded hover:bg-gray-500"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 text-gray-300" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-center">
              {searchTerm ? 'No PPTs match your search.' : 'No PPTs available.'}
            </p>
          </div>
        )}
      </div>
      
      {/* PPT Detail View */}
      <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden flex flex-col">
        {selectedPPT ? (
          <>
            <div className="flex-shrink-0">
              <div className="p-4 border-b border-gray-700">
                <h1 className="text-xl font-bold text-white">{selectedPPT.title}</h1>
                
                <div className="flex items-center mt-2 text-sm text-gray-400">
                  <span>
                    Added: {format(new Date(selectedPPT.createdAt), 'MMMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-between mt-4">
                  <div className="mb-2">
                    <a
                      href={selectedPPT.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                      Open in New Tab
                    </a>
                    <button
                      onClick={() => handleDownload(new Event('click'), selectedPPT)}
                      className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-400 bg-primary-900 bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-white mb-2">Description</h2>
                <div className="bg-gray-700 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                  {selectedPPT.description || 'No description provided.'}
                </div>
              </div>
              
              {/* PPT Preview */}
              <div className="mb-4">
                <h2 className="text-lg font-medium text-white mb-2">Preview</h2>
                <div className="bg-gray-700 rounded-lg overflow-hidden h-96">
                  {selectedPPT.fileUrl && (
                    <iframe 
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedPPT.fileUrl)}&embedded=true`} 
                      className="w-full h-full" 
                      frameBorder="0"
                    >
                      This browser does not support embedded PDFs. Please download the file to view it.
                    </iframe>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <DocumentTextIcon className="h-16 w-16 text-gray-500 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">No PPT Selected</h2>
            <p className="text-gray-400 text-center max-w-md">
              Select a PPT from the list to view details and preview the content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PPTView;
