import React, { useState } from "react";
import "./LoginSignup.css";
import { ToastContainer, toast } from "react-toastify";

import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import pb from "../utils/pocketbase.js"; // Import PocketBase

const LoginSignup = () => {
  const [action, setAction] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginError = () => {
    if (!email) {
      toast(`Error: type email`);
      return;
    }
    if (!password) {
      toast(`Error: type password`);
      return;
    }
  };

  const signUpError = () => {
    if (!name) {
      toast(`Error: type username`);
      return;
    }
    if (!email) {
      toast(`Error: type email`);
      return;
    }
    if (!password) {
      toast(`Error: type password`);
      return;
    }
    if (!confirmPassword) {
      toast(`Error: type confirm password`);
      return;
    }
    if (confirmPassword !== password) {
      toast(`Error: passwords dont match`);
      return;
    }
  };

  // Define isFormValid function
  const isFormValid = () => {
    // For Sign Up, check if passwords match and if all fields are filled
    if (action === "Sign Up") {
      return (
        email &&
        password &&
        confirmPassword &&
        password === confirmPassword &&
        name
      );
    } else {
      return email && password;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (action === "Sign Up") {
        const data = {
          email,
          password,
          passwordConfirm: confirmPassword,
          name,
        };
        const user = await pb.collection("users").create(data);
        console.log("Signed up user:", user);
      } else {
        const user = await pb
          .collection("users")
          .authWithPassword(email, password);
        console.log("Logged in user:", user);
      }

      setError(""); // Clear any error messages

      // Redirect to the dashboard or next page after successful login/signup
      window.location.href = "/dashboard"; // Redirect to dashboard
    } catch (err) {
      console.error(err);
      toast(`Error: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="first-container">
      <div className="container">
        <ToastContainer
          position="bottom-center"
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
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          {action === "Login" ? (
            <div></div>
          ) : (
            <div className="input">
              <img src={user_icon} alt="User" />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="input">
            <img src={email_icon} alt="Email" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input">
            <img src={password_icon} alt="Password" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {action === "Sign Up" && (
            <div
              className={`input ${
                confirmPassword !== password ? "noMatch" : ""
              }`}
            >
              <img src={password_icon} alt="Password" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="pushdown">
          <div className="submit-container">
            <div
              className={action === "Login" ? "submit gray" : "submit"}
              onClick={(e) => {
                if (action === "Sign Up") {
                  if (isFormValid()) {
                    handleSubmit(e);
                  } else {
                    signUpError();
                  }
                }
                if (action === "Login") {
                  setAction("Sign Up");
                }
              }}
            >
              Sign Up
            </div>
            <div
              className={action === "Sign Up" ? "submit gray" : "submit"}
              onClick={(e) => {
                if (action === "Login") {
                  if (isFormValid()) {
                    handleSubmit(e);
                  } else {
                    loginError();
                  }
                }
                if (action === "Sign Up") {
                  setAction("Login");
                }
              }}
            >
              Log In
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
