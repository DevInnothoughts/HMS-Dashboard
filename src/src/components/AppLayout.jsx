// src/components/AppLayout.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header"; // Adjust path if needed
import Sidebar from "./Sidebar"; // Adjust path if needed
import Customizer from "./Customizer"; // Adjust path if needed
import Taptotop from "./Taptotop"; // Adjust path if needed
import { SidebarProvider } from "../pages/api/useSidebarContext"; // Adjust path if needed

// Routes that should *not* have the header/sidebar/customizer
const routesWithoutExtras = [
  "/login",
  "/register",
  "/forgot-password",
  "/new-password",
  "/verify-email",
  "/verify-pin",
  "/landing",
  "/error-page",
];

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isSpecialRoute = routesWithoutExtras.includes(location.pathname);

  // You might manage these in a global state, but for now, we'll keep them here as in your original file
  const customizerEnabled = true;
  const headerEnabled = true;
  const sidebarEnabled = true;

  const shouldRenderExtras =
    !isSpecialRoute && location.pathname !== "/error-page";

  return (
    <SidebarProvider>
      {/* Conditionally render Header */}
      {shouldRenderExtras && headerEnabled && <Header />}
      {/* Conditionally render Sidebar */}
      {shouldRenderExtras && sidebarEnabled && <Sidebar />}

      {/* The main content/Routes will be rendered here */}
      {children}

      {/* Scroll To Top Start */}
      <Taptotop />
      {/* Scroll To Top End */}

      {/* Conditionally render Customizer */}
      {shouldRenderExtras && customizerEnabled && <Customizer />}
    </SidebarProvider>
  );
};

export default AppLayout;