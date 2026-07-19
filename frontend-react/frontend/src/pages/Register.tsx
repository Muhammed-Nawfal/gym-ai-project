import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import { useRegistration } from "../context/RegistrationContext";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { updateRegistrationData } = useRegistration();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { firstName, lastName, userName, email, password, confirm } = formData;

    if (!firstName || !lastName || !userName || !email || !password || !confirm) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try{
      setLoading(true);

      const availabilityResponse = await axios.get("/api/auth/check-availability", {
        params: {
          email: email,
          userName: userName,
        }
      });

      const {emailAvailable, usernameAvailable} = availabilityResponse.data;

      if (!emailAvailable && !usernameAvailable) {
        setError("Email and username are already taken. Please use different ones.");
        return;
      }

      if (!emailAvailable) {
        setError("This email is already registered. Please log in or use a different email.");
        return;
      }

      if (!usernameAvailable) {
        setError("This username is already taken. Please choose a different one.");
        return;
      }

      updateRegistrationData({
        firstName, lastName, userName, email, password,
      });

      navigate("/onboarding");

    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to verify availability. Please try again.");
    } finally {
      setLoading(false);
    }
  

  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="card card-hover border-brand-gold/10 w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Gym AI</h1>
        <p className="muted mb-6">Create your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <TextField
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    editable={true}
                />

                <TextField
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    editable={true}
                />

            </div>
            

            <TextField
                placeholder="Username"
                value={formData.userName}
                onChange={(e) => handleChange("userName", e.target.value)}
                editable={true}
            />

            <TextField
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                editable={true}
            />

            <TextField
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                editable={true}
            />

            <TextField
                placeholder="Confirm Password"
                type="password"
                value={formData.confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
                editable={true}
            />

            <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
            >
                Continue to Profile Setup
            </button>
        </form>

        {error && <p className="text-red-500 mt-3">{error}</p>}

        <p className="mt-6 text-sm text-zinc-400">
          Already have an account?{" "}
          <a href="/login" className="text-brand-gold hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
