import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

    setToken(response.data.token);
    navigate("/profile");
    } 
    catch (err: any) {
        if(err.response && err.response.status === 401) {
            setError("Invalid email or password");
        } 
        else {
            setError("Something went wrong. Please try again.");
        }
            
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="card card-hover border-brand-gold/10 w-full max-w-[22rem] p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Gym AI</h1>
        <p className="muted mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            editable={true}
            />

            <TextField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            editable={true}
            />

          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            Sign In
          </button>
        </form>

        {error && <p className="text-red-500 mt-3">{error}</p>}

        <p className="mt-6 text-sm text-zinc-400">
          Don’t have an account?{" "}
          <a href="/register" className="text-[var(--brand-gold)] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
