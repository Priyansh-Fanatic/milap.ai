import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile-model.css";
import Bannerimg from "./banner.png";

const API_URL = "http://localhost:5000/api/auth";

// Icon Components
const UserCircleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IdentificationIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h10.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25zM6.75 8.25h10.5M6.75 12h10.5m-7.5 3.75h4.5m-4.5 2.25h4.5M3 12h.008v.008H3V12zm0 0h.008v.008H3V12z" />
  </svg>
);

const EnvelopeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LinkIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adhaarInput, setAdhaarInput] = useState("");
  const [userCases, setUserCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const incomplete = !parsedUser.adhaarNumber || parsedUser.adhaarNumber.startsWith("google_");
      
      setUser(parsedUser);
      setIsProfileIncomplete(incomplete);
      setAdhaarInput(incomplete || parsedUser.adhaarNumber.startsWith("google_") ? "" : parsedUser.adhaarNumber);

      if (!incomplete) {
        fetchUserCases();
      }

    } catch (err) {
      console.error("Error parsing user data from session storage:", err);
      sessionStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  // Fetch user's submitted cases
  const fetchUserCases = async () => {
    setCasesLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      console.log("Fetching user cases with token:", token ? "Token exists" : "No token");
      console.log("Making request to:", 'http://localhost:5000/api/cases/my-cases');
      
      const response = await axios.get('http://localhost:5000/api/cases/my-cases', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Response received:", response.data);
      
      if (response.data.success) {
        setUserCases(response.data.cases);
        console.log("Cases set:", response.data.cases);
      }
    } catch (error) {
      console.error("Error fetching user cases:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
    } finally {
      setCasesLoading(false);
    }
  };

  // Request case resolution
  const handleRequestResolution = async (caseId, caseName) => {
    try {
      const reason = prompt(`Request resolution for case: ${caseName}\n\nPlease provide details about how/where the person was found:`);
      if (!reason) return; // User cancelled
      
      const foundLocation = prompt('Where was the person found?') || '';
      const foundDate = prompt('When was the person found? (YYYY-MM-DD format, or leave empty for today):') || new Date().toISOString().split('T')[0];
      
      const resolutionData = {
        reason,
        foundLocation,
        foundDate
      };
      
      if (window.confirm(`Submit resolution request for ${caseName}?\n\nDetails: ${reason}\nLocation: ${foundLocation || 'Not specified'}\nDate: ${foundDate}`)) {
        const token = sessionStorage.getItem("token");
        
        await axios.patch(`http://localhost:5000/api/cases/request-resolution/${caseId}`, 
          resolutionData, 
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        
        alert('Resolution request submitted successfully! An admin will review your request.');
        // Refresh cases to show updated status
        fetchUserCases();
      }
    } catch (error) {
      console.error('Error requesting resolution:', error);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to submit resolution request. Please try again.');
      }
    }
  };

  const handleAdhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAdhaarInput(value);
  };

  const formatAdhaarInputDisplay = (value) => {
    const adhaar = value.replace(/\D/g, '');
    const parts = [];
    for (let i = 0; i < adhaar.length; i += 4) {
      parts.push(adhaar.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatAdhaarCardDisplay = (value) => {
    if (!value || typeof value !== 'string') return 'N/A';
    if (value.startsWith("google_")) return "Update Required";
    if (value.length < 12) return value;
    
    const adhaar = value.replace(/\D/g, '');
    if (adhaar.length !== 12) return value;

    const parts = [];
    for (let i = 0; i < adhaar.length; i += 4) {
      parts.push(adhaar.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  const handleProfileComplete = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanedAdhaar = adhaarInput.replace(/\D/g, '');
    if (cleanedAdhaar.length !== 12) {
      setLoading(false);
      return;
    }
    
    const formData = {
      name: user.name, 
      username: user.username, 
      adhaarNumber: cleanedAdhaar
    };
    
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_URL}/update-profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUserDataFromResponse = response.data.user || {}; 
      const updatedUser = {
        ...user,
        name: updatedUserDataFromResponse.name || user.name,
        username: updatedUserDataFromResponse.username || user.username,
        email: updatedUserDataFromResponse.email || user.email,
        adhaarNumber: cleanedAdhaar,
        source: updatedUserDataFromResponse.source || user.source,
        picture: updatedUserDataFromResponse.picture || user.picture,
        profileComplete: true
      };

      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsProfileIncomplete(false);

    } catch (err) {
      console.error("Profile update failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Profile Incomplete Modal */}
      {isProfileIncomplete && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <h2 className="profile-modal-title">Update Your Aadhaar Number</h2>
            
            <form onSubmit={handleProfileComplete} className="space-y-6">
              <div className="profile-input-group">
                <label 
                  htmlFor="adhaar-input" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Aadhaar Number (12 digits)
                </label>
                <input
                  id="adhaar-input"
                  type="text"
                  placeholder="Enter your 12-digit Aadhaar number"
                  value={formatAdhaarInputDisplay(adhaarInput)}
                  onChange={handleAdhaarChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  maxLength={14}
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This information is required to complete your profile and access all features.
                </p>
              </div>

              <div className="profile-modal-footer">
                <button
                  type="submit"
                  disabled={loading || adhaarInput.replace(/\D/g, '').length !== 12}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? "Updating..." : "Complete Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`${isProfileIncomplete ? "blurred-background" : ""}`}>
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Dashboard</h1>
              <button
                type="button"
                onClick={() => navigate("/edit-profile")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg inline-flex items-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                disabled={isProfileIncomplete}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Profile Card - Left Side */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Cover Photo */}
                <div className="h-32 relative overflow-hidden">
                  <img
                    src={Bannerimg}
                    alt="Profile Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute bottom-4 left-6">
                    <h2 className="text-white text-lg font-semibold">Profile Information</h2>
                  </div>
                </div>
                
                {/* Profile Picture */}
                <div className="relative px-6 pb-6">
                  <div className="flex justify-center -mt-16 mb-6">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={`${user.name || 'User'}'s profile`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-4 border-white dark:border-gray-700 shadow-xl flex items-center justify-center text-white text-4xl font-bold">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {user.name || 'User Name'}
                    </h1>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      @{user.username || 'username'}
                    </p>
                  </div>
                  
                  {/* Details Grid */}
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <div className="flex items-center mb-1">
                        <UserCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Full Name</span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{user.name || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <div className="flex items-center mb-1">
                        <EnvelopeIcon className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Email Address</span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100 font-medium break-all">{user.email || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <div className="flex items-center mb-1">
                        <IdentificationIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Aadhaar Number</span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100 font-medium font-mono">{formatAdhaarCardDisplay(user.adhaarNumber)}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <div className="flex items-center mb-1">
                        <LinkIcon className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Account Source</span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{user.source || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cases Dashboard - Right Side */}
            <div className="lg:col-span-8">
              {!isProfileIncomplete && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                  {/* Cases Header */}
                  <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Submitted Cases</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your missing person reports</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {userCases.length} {userCases.length === 1 ? 'Case' : 'Cases'}
                        </span>
                        <button
                          onClick={() => navigate('/form-missing')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg inline-flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          New Report
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cases Content */}
                  <div className="p-8">
                    {casesLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading your cases...</p>
                      </div>
                    ) : userCases.length > 0 ? (
                      <div className="grid gap-6">
                        {userCases.map((caseItem) => (
                          <div key={caseItem._id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-3">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mr-4">
                                    {caseItem.name}
                                  </h3>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    caseItem.status === 'approved'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : caseItem.status === 'rejected'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      : caseItem.status === 'resolved'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  }`}>
                                    {caseItem.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span className="font-medium">Case ID:</span>
                                    <span className="ml-2 font-mono text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                      {caseItem.caseId}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2m-6 0h6" />
                                    </svg>
                                    <span className="font-medium">Reported:</span>
                                    <span className="ml-2">{new Date(caseItem.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="ml-6 flex flex-col items-end gap-3">
                                {/* Resolution Request Button */}
                                {caseItem.status === 'approved' && !caseItem.resolutionRequested && (
                                  <button
                                    onClick={() => handleRequestResolution(caseItem._id, caseItem.name)}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                                    title="Request case resolution if person was found"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Person Found?
                                  </button>
                                )}
                                
                                {/* Resolution Requested Status */}
                                {caseItem.resolutionRequested && caseItem.status !== 'resolved' && (
                                  <span className="px-4 py-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-sm font-medium rounded-lg flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Resolution Pending
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Status Messages */}
                            {caseItem.status === 'pending' && (
                              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Your case is under review by our admins. You'll be notified once it's approved.
                                </p>
                              </div>
                            )}
                            
                            {caseItem.status === 'approved' && !caseItem.resolutionRequested && (
                              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Case approved and published. If the person has been found, click "Person Found?" to request case resolution.
                                </p>
                              </div>
                            )}
                            
                            {caseItem.resolutionRequested && caseItem.status !== 'resolved' && (
                              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Resolution request submitted on {new Date(caseItem.resolutionRequestDate).toLocaleDateString()}. Waiting for admin approval.
                                </p>
                              </div>
                            )}
                            
                            {caseItem.status === 'resolved' && (
                              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center mb-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Case Resolved - Person Found!
                                </p>
                                {caseItem.foundLocation && (
                                  <p className="text-sm text-blue-600 dark:text-blue-400 ml-6 mb-1">
                                    📍 Found at: {caseItem.foundLocation}
                                  </p>
                                )}
                                {caseItem.foundDate && (
                                  <p className="text-sm text-blue-600 dark:text-blue-400 ml-6">
                                    📅 Found on: {new Date(caseItem.foundDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cases Submitted Yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't submitted any missing person cases yet. Start by reporting a missing person.</p>
                        <button
                          onClick={() => navigate('/form-missing')}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg inline-flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Report a Missing Person
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Milap.ai. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Profile;
