import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRoutes from './AppRoutes';

// You'll need to replace this with your actual Google Client ID from your .env file or environment variables
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "your-google-client-id-here";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AppRoutes />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
