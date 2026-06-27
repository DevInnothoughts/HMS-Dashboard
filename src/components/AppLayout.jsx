// src/components/AppLayout.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import ReceptionHeader from "./Header/ReceptionHeader";
import DoctorHeader from "./Header/DoctorHeader";
import IpdHeader from "./Header/IpdHeader";
import SidebarSetting from "./Sidebar/SidebarSetting"; // Adjust path if needed
// import Customizer from "./Customizer"; // Adjust path if needed
import Taptotop from "./Taptotop"; // Adjust path if needed
import { SidebarProvider } from "../pages/api/useSidebarContext"; // Adjust path if needed
import ActiveSessionTracker from "./ActiveSessionTracker";


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
      {/* Auto-logout tracker */}
      <ActiveSessionTracker />

      {/* Conditionally render Header */}
      {shouldRenderExtras && headerEnabled && (
        localStorage.getItem("accountType")?.toLowerCase() === "doctor"
          ? <DoctorHeader />
          : (localStorage.getItem("accountType")?.toLowerCase() === "ipd" ? <IpdHeader /> : <ReceptionHeader />)
      )}
      {/* Conditionally render Sidebar */}
      {shouldRenderExtras && sidebarEnabled && <SidebarSetting />}

      {/* The main content/Routes will be rendered here */}
      {children}

      {/* Floating Action Button Start */}

      {/* Floating Action Button End */}

      {/* Scroll To Top Start */}
      <Taptotop />
      {/* Scroll To Top End */}

      {/* Conditionally render Customizer */}
      {shouldRenderExtras && customizerEnabled }
    </SidebarProvider>
  );
};

export default AppLayout;