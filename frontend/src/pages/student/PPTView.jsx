import { useState, useEffect } from 'react';
import { getPPTs, logPPTView } from '../../services/pptService';
import { toast } from 'react-toastify';
import { DocumentTextIcon, ArrowTopRightOnSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import useAuth from '../../hooks/useAuth';

const PPTView = () => {
  const { user } = useAuth();
  const [ppts, setPpts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchPPTs = async () => {
      setLoading(true);
      try {
        // For students, only get PPTs for their batch
        const pptsData = user.role === 'student' 
          ? await getPPTs(user.batch)
          : await getPPTs();
        
        setPpts(pptsData);
      } catch (error) {
        console.error('Error fetching PPTs:', error);
        toast.error('Failed to fetch PPTs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPPTs();
  }, [user]);
  
  const handleViewPPT = async (pptId) => {
    try {
      await logPPTView(pptId);
      // Update the access count locally
      setPpts(ppts.map(ppt => 
        ppt._id === pptId
          ? { ...ppt, accessCount: ppt.accessCount + 1 }
          : ppt
      ));
    } catch (error) {
      console.error('Error logging PPT view:', error);
    }
  };
  
  const filteredPPTs = ppts.filter(ppt => 
    ppt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ppt.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PPT Library</h1>
      
      {/* Search and filters */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for PPTs..."
          className="input w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* PPTs grid */}
      {filteredPPTs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPPTs.map((ppt) => (
            <div key={ppt._id} className="card flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-6 w-6 text-blue-400 mr-2" />
                  <h2 className="text-lg font-semibold">{ppt.title}</h2>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 flex-grow">
                {ppt.description || 'No description provided'}
              </p>
              
              <div className="mb-4">
                <div className="text-sm text-gray-400">Uploaded</div>
                <div>{format(new Date(ppt.createdAt), 'MMM dd, yyyy')}</div>
              </div>
              
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <EyeIcon className="h-4 w-4 mr-1" />
                <span>{ppt.accessCount} views</span>
              </div>
              
              <a
                href={ppt.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center justify-center"
                onClick={() => handleViewPPT(ppt._id)}
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-1" />
                View PPT
              </a>
              
              {ppt.previewUrl && (
                <a
                  href={ppt.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center justify-center mt-2"
                >
                  Preview
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          {searchTerm 
            ? 'No PPTs found matching your search'
            : 'No PPTs available for you at the moment'}
        </div>
      )}
    </div>
  );
};

export default PPTView;
