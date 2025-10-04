import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";

// Define your backend URL
// IMPORTANT: This should match the base URL + prefix where your auth router is mounted in the backend
// Based on the previous conversation, it seems to be mounted at /api/auth
const API_URL = "http://localhost:5000/api/auth";

const Login = ({ setUser }) => {
  // State for form inputs (email and password)
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  // State for displaying error messages
  const [error, setError] = useState("");
  // State to indicate if an API request is in progress
  const [loading, setLoading] = useState(false);
  // Hook for navigation
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");
    
    if (token && user) {
      // User is already logged in, redirect to profile
      console.log("User already logged in, redirecting to profile");
      navigate("/profile");
    }
  }, [navigate]);

  // Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/google`, {
        credential: credentialResponse.credential
      });

      const { token, user } = response.data;
      
      // Store in sessionStorage
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // Update parent component
      if (setUser) setUser(user);
      
      // Navigate to profile
      navigate('/profile');
      
    } catch (err) {
      console.error('Google authentication error:', err);
      setError(
        err.response?.data?.message || 
        'Google authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login Error
  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  // --- Handle Form Input Changes ---
  // Updates the form state as the user types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Handle Email/Password Login ---
  // This function is called when the email/password form is submitted.
  // It sends the email and password to your backend's login endpoint.
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default browser form submission
    setLoading(true); // Start loading state
    setError(""); // Clear any previous errors

    // Basic client-side validation: check if fields are empty
    if (!form.email || !form.password) {
      setError("Please fill all fields.");
      setLoading(false); // Stop loading immediately as no API call is made
      return;
    }

    try {
      console.log("Attempting POST to email login endpoint:", `${API_URL}/login`); // Log API call attempt
      // Make a POST request to the backend's email login endpoint with form data
      const response = await axios.post(`${API_URL}/login`, form);

      console.log("Backend response received:", response); // Log the full response object
      console.log("Backend response status:", response.status); // Log the response status
      console.log("Backend response data:", response.data); // Log the data part

       // Check if the backend response contains the expected data (token and user)
      if (!response.data || !response.data.token || !response.data.user) {
          console.error("Backend response data is missing token or user property.");
          setError("Invalid response from server during email login.");
          setLoading(false); // Stop loading
          return; // Stop processing if data is unexpected
      }

      // Extract token and user data from the backend response
      const { token, user, message } = response.data;
      console.log("Extracted token, user, message:", { token: token ? '...' : null, user, message }); // Log extracted data (mask token for security)


      // Store the received token and user data in session storage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      console.log("Stored token and user in sessionStorage.");


      // Update parent component state if setUser prop is provided
      if (setUser) {
        setUser(user);
        console.log("Called setUser.");
      }

      // Navigate to the profile page upon successful login
      console.log("Navigating to /profile..."); // Log navigation attempt
      navigate("/profile");
      console.log("Navigation initiated."); // This log might not appear if navigation happens immediately


    } catch (err) {
      // Handle errors during the API call
      console.error("Email Login Error (caught in try...catch):", err); // Log the error object itself
      console.error("Error response:", err.response); // Log the error response if available

      // Display an informative error message to the user
      setError(err.response && err.response.data && err.response.data.message
        ? err.response.data.message // Use backend's error message if available
        : "Login failed. Please check your credentials and try again."); // Fallback generic message
       console.log("Error message set:", error); // Log the error message being set
    } finally {
      console.log("Finally block: Setting loading to false."); // Log finally block execution
      setLoading(false); // Ensure loading state is turned off
    }
  };

  // --- Render Component ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Login</h2>

        {/* Email/Password Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
            disabled={loading} // Disable input while loading
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
            disabled={loading} // Disable input while loading
          />
          {/* Display error message if present */}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white font-semibold py-2 rounded-md transition ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Logging In..." : "Login"} {/* Change button text based on loading state */}
          </button>
        </form>

        {/* Separator */}
        <div className="my-6 text-center text-gray-500 dark:text-gray-400">or</div>

        {/* Google Login Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            text="signin_with"
            shape="rectangular"
            theme="outline"
            size="large"
          />
        </div>

        {/* Link to Registration Page */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
