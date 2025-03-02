import React from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import pb from "../utils/pocketbase";
import Auth from "../utils/Auth.jsx";

const Dashboard = () => {
  return (
    <div>
      {Auth()};<h1>Welcome to your Dashboard</h1>
      <p>This is a protected page for logged-in users.</p>
    </div>
  );
};

export default Dashboard;
