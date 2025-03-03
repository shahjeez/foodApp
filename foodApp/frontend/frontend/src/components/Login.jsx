import React, { useState } from "react";
import axios from "../utils/api"; // Import API config
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      console.log("📤 Sending:", { username: username, password }); // Log before sending
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        {
          username: username,
          password,
        }
      );

      console.log("✅ Login Success:", response.data); // Log response
      localStorage.setItem("token", response.data.token);
      navigate("/ingredients");
    } catch (err) {
      console.error("❌ Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type='username'
        placeholder='Username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
