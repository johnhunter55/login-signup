import React, { useState } from "react";
import "./LoginSignup.css";

import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";

const LoginSignup = () => {
  const [action, setAction] = useState("Sign Up"); // Tracks whether we're in "Sign Up" or "Login" mode
  const [name, setName] = useState(""); // State for the name (only in Sign Up)
  const [email, setEmail] = useState(""); // State for the email
  const [password, setPassword] = useState(""); // State for the password

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (action === "Sign Up") {
      // Handle Sign Up logic (e.g., call PocketBase to create a new user)
      console.log("Signing up with:", { name, email, password });
      // You would call PocketBase's sign-up method here
    } else {
      // Handle Login logic (e.g., call PocketBase to authenticate user)
      console.log("Logging in with:", { email, password });
      // You would call PocketBase's login method here
    }
  };

  return (
    <div className="first-container">
      <div className="container">
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
              <input type="text" placeholder="name" />
            </div>
          )}
          <div className="input">
            <img src={email_icon} alt="Email" />
            <input type="email" placeholder="email" />
          </div>
          <div className="input">
            <img src={password_icon} alt="Password" />
            <input type="password" placeholder="password" />
          </div>
        </div>
        {action === "Sign Up" ? (
          <div></div>
        ) : (
          <div className="forgot-password">
            Lost Password? <span>Click Here!</span>
          </div>
        )}
        <div className="pushdown">
          <div className="submit-container">
            <div
              className={action === "Login" ? "submit gray" : "submit"}
              onClick={() => {
                setAction("Sign Up");
              }}
            >
              Sign Up
            </div>
            <div
              className={action === "Sign Up" ? "submit gray" : "submit"}
              onClick={() => {
                setAction("Login");
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
