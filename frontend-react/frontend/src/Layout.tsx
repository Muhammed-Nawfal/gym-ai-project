import React from "react";
import Navbar from "./components/Navbar";
import { Outlet, useLocation } from "react-router-dom";

const Layout: React.FC = () => {

    const location = useLocation();
    const hideNavBar = ["/login", "/register", "/onboarding"];

    const shouldHideNavBar = hideNavBar.includes(location.pathname);

    return(
        <div className="min-h-screen">
            {!shouldHideNavBar && <Navbar/>}

            {shouldHideNavBar?
            (
                <Outlet />
            ) : (
                <main className="mx-auto max-w-7xl px-4 py-8">
                    <Outlet />
                </main>
            )}
            
        </div>
    );
};

export default Layout;