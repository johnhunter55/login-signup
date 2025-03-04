import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginSignup from "./Components/LoginSignup/LoginSignup.jsx";
import Dashboard from "./Components/dashboard/Dashboard.jsx"; // Make sure the path is correct
import pb from "./Components/utils/pocketbase.js"; // Assuming PocketBase logic

const ProtectedRoute = ({ children }) => {
  return pb.authStore.isValid ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect to dashboard if user is authenticated */}
          <Route
            path="/"
            element={pb.authStore.isValid ? <Navigate to="/dashboard" /> : <LoginSignup />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
