import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import pb from "../utils/pocketbase";
import Auth from "../utils/Auth.jsx";
import logout_logo from "../Assets/logout.png";
import upload_logo from "../Assets/upload.png";
import { ToastContainer, toast } from "react-toastify";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [displayRecords, setDisplayRecords] = useState([]);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const fileInputRef = useRef(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  const handleSignout = () => {
    pb.authStore.clear();
    navigate("/");
  };

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const userId = pb.authStore.model.id;
        const user = await pb.collection("users").getOne(userId);
        setUserData(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
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
        setDisplayRecords(records);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setUploading(true); // Start uploading
    setLoadingVideo(true);

    const formData = new FormData();
    formData.append("label", label);
    formData.append("user", pb.authStore.model.id);
    formData.append("file", file);

    try {
      const record = await pb.collection("posts").create(formData);
      console.log("Uploaded:", record);
      toast("File was uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed.");
    } finally {
      setLoadingVideo(false);
      setUploading(false); // Hide popup after upload completes
      setFile(null);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click(); // Trigger file input click on image click
  };

  useEffect(() => {
    const fetchData = async () => {
      if (userData) {
        const posts = await fetchUserPosts(userData.id);
        setUserPosts(posts); // Store posts in state
      }
    };

    fetchData();
  }, [userData]); // Runs when `userData` is set
  const fetchUserPosts = async (userId) => {
    try {
      const userPosts = await pb.collection("posts").getFullList({
        filter: `user = '${userId}'`, // Filter by user
        sort: "-created", // Sort by latest
      });

      return userPosts || []; // Return empty array if no posts
    } catch (error) {
      console.error("Error fetching posts:", error);
      return []; // Return empty array on error
    }
  };

  return (
    <div className="fullpage">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
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

      <div className="headvid">
        <header>
          {userData ? (
            <h1>
              {pb.authStore.model.id === userData.id ? "Your " : userData.name}
              Videos
            </h1>
          ) : (
            <div>Loading user data...</div>
          )}
          <div className="uploadimage">
            <img src={upload_logo} alt="Upload" onClick={handleImageClick} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {/* Conditionally show label input once file is selected */}
            {file && !uploading && (
              <div className="popout">
                <input
                  className="popouttext"
                  type="text"
                  placeholder="Enter Title"
                  onChange={(e) => setLabel(e.target.value)}
                />
                <button onClick={handleUpload} disabled={loadingVideo}>
                  {loadingVideo ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}
            {/* Show the popout during the upload */}
            {uploading && (
              <div className="popout">
                <h2>If the file was big it could take a couple minutes</h2>
                <br></br>
                <h3>Uploading...</h3>
              </div>
            )}
          </div>
          <button className="signout-button" onClick={handleSignout}>
            Sign Out
          </button>
        </header>
        <div className="videocontainer">
          <div className="videobody">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post.id} className="post-container">
                  {post.file ? (
                    post.file.endsWith(".mp4") ||
                    post.file.endsWith(".webm") ? (
                      <video controls width="300">
                        <source
                          src={pb.files.getUrl(post, post.file)}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={pb.files.getUrl(post, post.file)}
                        alt={post.label || "Uploaded Image"}
                        width="300"
                      />
                    )
                  ) : (
                    <p>No file found for this post.</p>
                  )}
                  <p>{post.label}</p>
                </div>
              ))
            ) : (
              <p>No posts found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
