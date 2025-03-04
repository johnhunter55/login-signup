import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import pb from "../utils/pocketbase";
import Auth from "../utils/Auth.jsx";
import logout_logo from "../Assets/logout.png";
import upload_logo from "../Assets/upload.png";

const Dashboard = () => {
  const [loading, setLoading] = useState(true); // Handle loading state for user data
  const [userData, setUserData] = useState(null);
  const [displayRecords, setDisplayRecords] = useState([]);
  const navigate = useNavigate(); // ✅ Call useNavigate inside the component
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const fileInputRef = useRef(null); // Define useRef for the file input
  const [loadingVideo, setLoadingVideo] = useState(false);

  const handleSignout = () => {
    pb.authStore.clear(); // Clear authentication
    navigate("/"); // ✅ Redirect to login page
  };

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted
    const fetchUserData = async () => {
      try {
        // Get the logged-in user's ID from the auth store
        const userId = pb.authStore.model.id;

        // Fetch user data for the logged-in user
        const user = await pb.collection("users").getOne(userId);
        setUserData(user);

        // Set all users to state only if the component is still mounted
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        // Set loading to false after data fetching is complete, if component is still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const records = await pb.collection("users").getFullList({
          sort: "-created",
        });
        setDisplayRecords(records); // ✅ Correct way to update state
        setLoading(false);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, []); // ✅ Runs only on mount

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setLoadingVideo(true);

    const formData = new FormData();
    formData.append("label", label);
    formData.append("user", pb.authStore.model.id);
    formData.append("file", file);

    try {
      const record = await pb.collection("posts").create(formData);
      console.log("Uploaded:", record);
      alert("Upload successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed.");
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click(); // Trigger file input click on image click
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fullpage">
      <div className="nav">
        <div className="sidebar">
          <h1 className="friend">Friends</h1>
          <ul>
            {displayRecords.length > 0 ? (
              displayRecords.map((user) => <li key={user.id}>{user.name}</li>)
            ) : (
              <li>No users found.</li>
            )}
          </ul>
        </div>
      </div>

      <header>
        {userData ? (
          <h1>
            {pb.authStore.model.id === userData.id ? "Your " : userData.name}
            Videos
          </h1>
        ) : (
          <div>Loading user data...</div>
        )}

        <div>
          <img
            src={upload_logo}
            alt="Upload"
            onClick={handleImageClick}
            style={{ cursor: "pointer", width: "100px", height: "100px" }}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* Conditionally show label input once file is selected */}
          {file && (
            <>
              <input
                type="text"
                placeholder="Enter label"
                onChange={(e) => setLabel(e.target.value)}
              />
              <button onClick={handleUpload} disabled={loadingVideo}>
                {loadingVideo ? "Uploading..." : "Upload"}
              </button>
            </>
          )}
        </div>

        <button className="signout-button" onClick={handleSignout}>
          Sign Out
        </button>
      </header>
    </div>
  );
};

export default Dashboard;
