import React from "react";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./Layout";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OnBoarding from "./pages/OnBoarding";
import { RegistrationProvider } from "./context/RegistrationContext";
import { AuthProvider } from "./context/AuthContext";

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/profile" element= {<Profile/>}/>
            <Route path="/login" element= {<Login/>}/>
            <Route path="/home" element={<Home />} />

            <Route element={<RegistrationProvider><Outlet /></RegistrationProvider>}>
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<OnBoarding />} />
            </Route>

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
