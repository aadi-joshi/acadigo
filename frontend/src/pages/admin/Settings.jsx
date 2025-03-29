import { useState, useEffect } from 'react';
import { CogIcon, ServerIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    systemAnnouncements: true,
    securityLevel: 'high',
    fileUploadLimit: 10,
    studentSubmissionLimit: 3
  });
  
  const [loading, setLoading] = useState(false);

  // Settings sections
  const settingsSections = [
    {
      title: 'General Settings',
      icon: CogIcon,
      color: 'bg-blue-900',
      settings: [
        {
          id: 'emailNotifications',
          name: 'Email Notifications',
          description: 'Enable email notifications for all system events',
          type: 'toggle',
          value: settings.emailNotifications
        },
        {
          id: 'systemAnnouncements',
          name: 'System Announcements',
          description: 'Show system announcements on dashboard',
          type: 'toggle',
          value: settings.systemAnnouncements
        }
      ]
    },
    {
      title: 'System Configuration',
      icon: ServerIcon,
      color: 'bg-green-900',
      settings: [
        {
          id: 'fileUploadLimit',
          name: 'File Upload Limit (MB)',
          description: 'Maximum file size for uploads',
          type: 'number',
          value: settings.fileUploadLimit,
          min: 1,
          max: 50
        },
        {
          id: 'studentSubmissionLimit',
          name: 'Student Daily Submission Limit',
          description: 'Maximum number of submissions per student per day',
          type: 'number',
          value: settings.studentSubmissionLimit,
          min: 1,
          max: 10
        }
      ]
    },
    {
      title: 'Security Settings',
      icon: ShieldCheckIcon,
      color: 'bg-red-900',
      settings: [
        {
          id: 'securityLevel',
          name: 'Security Level',
          description: 'Set the overall security level for the application',
          type: 'select',
          value: settings.securityLevel,
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]
        }
      ]
    }
  ];

  const handleChange = (id, value) => {
    setSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you would save to the backend
      // await axios.put('/api/settings', settings);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">System Settings</h1>
      
      <div className="space-y-8">
        {settingsSections.map((section) => (
          <div key={section.title} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className={`${section.color} bg-opacity-20 p-3 rounded-full mr-4`}>
                <section.icon className="h-6 w-6 text-gray-300" />
              </div>
              <h2 className="text-xl font-medium text-white">{section.title}</h2>
            </div>
            
            <div className="space-y-6">
              {section.settings.map((setting) => (
                <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-700">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-medium text-white">{setting.name}</h3>
                    <p className="text-sm text-gray-400">{setting.description}</p>
                  </div>
                  
                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => handleChange(setting.id, !setting.value)}
                      className={`w-14 h-7 flex items-center ${setting.value ? 'bg-primary-600' : 'bg-gray-600'} rounded-full px-1 transition-colors`}
                    >
                      <span 
                        className={`bg-white w-5 h-5 rounded-full transform transition-transform ${
                          setting.value ? 'translate-x-7' : ''
                        }`} 
                      />
                    </button>
                  )}
                  
                  {setting.type === 'number' && (
                    <input
                      type="number"
                      value={setting.value}
                      onChange={(e) => handleChange(setting.id, parseInt(e.target.value))}
                      min={setting.min}
                      max={setting.max}
                      className="input w-24 text-center"
                    />
                  )}
                  
                  {setting.type === 'select' && (
                    <select
                      value={setting.value}
                      onChange={(e) => handleChange(setting.id, e.target.value)}
                      className="select"
                    >
                      {setting.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
