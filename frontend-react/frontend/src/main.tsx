import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import App from "./App";
// import LoginPage from "./pages/LoginPage";
// import Dashboard from "./pages/Dashboard";

// const router = createBrowserRouter([
//   { path: "/", element: <App /> },
//   { path: "/login", element: <LoginPage /> },
//   { path: "/dashboard", element: <Dashboard /> },
// ]);

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <RouterProvider router={router} />
//   </React.StrictMode>
// );

