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
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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

      <div className={`${isProfileIncomplete ? "blurred-background" : ""} flex-grow flex flex-col`}>
        <main className="flex-grow container mx-auto px-4 mt-20 pt-8 sm:pt-12 md:pt-16 pb-8 sm:px-6 lg:px-8 flex justify-center items-start">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            <div className="w-full h-28 bg-gradient-to-r from-blue-400 to-blue-600" aria-hidden="true">
              <img
                src={Bannerimg}
                alt="Profile Banner"
                className="mx-auto w-full h-64 object-cover dark:border-gray-700 shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="relative px-6 sm:px-8 pb-6 pt-16">
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{ marginTop: '8px', marginLeft: '190px' }}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={`${user.name || 'User'}'s profile`}
                    className="mx-auto rounded-full w-37 h-37 object-cover border-4 border-white dark:border-gray-700 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="mx-auto flex items-center justify-center rounded-full bg-yellow-500 w-24 h-24 border-4 border-white dark:border-gray-700 text-white text-3xl font-semibold shadow-md">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              
              <div className="text-center mt-2 mb-6"> 
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.name || 'User Name'}
                </h1>
                <p className="text-blue-500 text-sm sm:text-base">
                  @{user.username || 'username'}
                </p>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-start">
                  <div className="w-8 mr-3 mt-0.5 flex-shrink-0 flex justify-center">
                    <UserCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">FULL NAME</p>
                    <p className="text-gray-800 dark:text-gray-200 mt-1 break-words">{user.name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 mr-3 mt-0.5 flex-shrink-0 flex justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">EMAIL</p>
                    <p className="text-gray-800 dark:text-gray-200 mt-1 break-words">{user.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 mr-3 mt-0.5 flex-shrink-0 flex justify-center">
                    <IdentificationIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">AADHAAR NO.</p>
                    <p className="text-gray-800 dark:text-gray-200 mt-1">{formatAdhaarCardDisplay(user.adhaarNumber)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 mr-3 mt-0.5 flex-shrink-0 flex justify-center">
                    <LinkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">SOURCE</p>
                    <p className="text-gray-800 dark:text-gray-200 mt-1 break-words">{user.source || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* My Cases Section */}
              {!isProfileIncomplete && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">My Submitted Cases</h2>
                  
                  {casesLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Loading cases...</p>
                    </div>
                  ) : userCases.length > 0 ? (
                    <div className="space-y-3">
                      {userCases.map((caseItem) => (
                        <div key={caseItem._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {caseItem.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Case ID: <span className="font-mono">{caseItem.caseId}</span>
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Reported: {new Date(caseItem.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="ml-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                caseItem.status === 'approved'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : caseItem.status === 'rejected'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : caseItem.status === 'resolved'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          {caseItem.status === 'pending' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Your case is under review by our admins. You'll be notified once it's approved.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <p>You haven't submitted any missing person cases yet.</p>
                      <button
                        onClick={() => navigate('/form-missing')}
                        className="mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Report a missing person
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/edit-profile")}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProfileIncomplete}
                >
                  Edit Profile 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Milap.ai. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Profile;
