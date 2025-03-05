import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import pb from "../utils/pocketbase";
import Auth from "../utils/Auth.jsx";
import logout_logo from "../Assets/logout.png";
import upload_logo from "../Assets/Upload.png";
import home_logo from "../Assets/Home.png";
import { ToastContainer, toast } from "react-toastify";
import cancel_upload from "../Assets/xcircle.png";
import delete_video from "../Assets/xsquare.png";

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
  const [selectedUser, setSelectedUser] = useState(pb.authStore.model);
  const [abortController, setAbortController] = useState(null);

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
      setFile(null); // Clear the file input
    }
  };

  useEffect(() => {
    // Reset file input and label state when upload is canceled
    if (!uploading && !file) {
      setLabel(""); // Clear the label when file is canceled
    }
  }, [uploading, file]); // Reset when either file or uploading state changes

  const handleImageClick = () => {
    fileInputRef.current.click(); // Trigger file input click on image click
    const controller = new AbortController();
    const signal = controller.signal;
    setAbortController(controller); // Save controller to state
  };

  const cancelUpload = () => {
    console.log("Cancel upload triggered");

    if (abortController) {
      console.log("Abort controller is set, canceling upload...");
      abortController.abort(); // Cancel the upload
      setUploading(false); // Stop showing the uploading state
      setFile(null); // Clear the file input
      setLabel(""); // Clear the label as well
      toast("Upload canceled!");
      setAbortController(null); // Clear the controller after canceling
    } else {
      console.log("No abort controller set, cannot cancel upload.");
    }
  };

  const homeImageClick = () => {
    setSelectedUser(pb.authStore.model); // Set to logged-in user
  };

  useEffect(() => {
    if (selectedUser) {
      fetchUserPosts(selectedUser.id); // Fetch posts for selected user
    }
  }, [selectedUser]); // This runs whenever `selectedUser` is updated

  const fetchUserPosts = async (userId) => {
    try {
      const posts = await pb.collection("posts").getFullList({
        filter: `user = '${userId}'`,
        sort: "-created",
      });
      setUserPosts(posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setUserPosts([]); // Ensure it doesn't break
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
              displayRecords
                .filter((user) => user.id !== pb.authStore.model.id) // Filter out logged-in user
                .map((user) => (
                  <li
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={
                      selectedUser?.id === user.id ? "selected-user" : ""
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {user.name}
                  </li>
                ))
            ) : (
              <li>No users found.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="headvid">
        <header>
          <button className="homebutton" onClick={homeImageClick}>
            <h2>Home</h2>
            <img className="homeicon" src={home_logo} alt="home" />
          </button>
          <div className="uploadimage">
            <button className="uploadbutton" onClick={handleImageClick}>
              <h2>Upload</h2>
              <img className="uploadicon" src={upload_logo} alt="Upload" />
            </button>
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
                <img
                  onClick={cancelUpload}
                  src={cancel_upload}
                  style={{ cursor: "pointer" }}
                />
                <br></br>
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
            <h2>Sign Out</h2>
          </button>
        </header>
        {userData ? (
          <h1 className="uservideos">
            {selectedUser && selectedUser.id === pb.authStore.model.id
              ? "Your Videos" // When the selected user is the logged-in user
              : selectedUser
              ? `${selectedUser.name}'s Videos` // When it's another user's videos
              : "Loading..."}{" "}
          </h1>
        ) : (
          <div className="uservideos">Loading user data...</div>
        )}
        <div className="videocontainer">
          <div className="videobody">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post.id} className="post-container">
                  {post.file ? (
                    post.file.endsWith(".mp4") ||
                    post.file.endsWith(".webm") ||
                    post.file.endsWith(".ogg") ||
                    post.file.endsWith(".mov") ||
                    post.file.endsWith(".avi") ||
                    post.file.endsWith(".wmv") ||
                    post.file.endsWith(".flv") ||
                    post.file.endsWith(".mkv") ||
                    post.file.endsWith(".webm") ? (
                      <video controls width="300">
                        <source
                          src={pb.files.getURL(post, post.file)}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={pb.files.getURL(post, post.file)}
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
