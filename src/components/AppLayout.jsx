import React from "react";
import { useLocation } from "react-router-dom";
import ReceptionHeader from "./Header/ReceptionHeader";
import DoctorHeader from "./Header/DoctorHeader";
import IpdHeader from "./Header/IpdHeader";
import SuperAdminHeader from "./Header/SuperAdminHeader";
import SidebarSetting from "./Sidebar/SidebarSetting";
import Taptotop from "./Taptotop";
import { SidebarProvider } from "../pages/api/useSidebarContext";
import ActiveSessionTracker from "./ActiveSessionTracker";

const routesWithoutExtras = [
  "/login",
  "/register",
  "/forgot-password",
  "/new-password",
  "/verify-email",
  "/verify-pin",
  "/landing",
  "/error-page",
  "/diagnosis-card-preview",
];

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isSpecialRoute = routesWithoutExtras.includes(location.pathname);
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
      {shouldRenderExtras && headerEnabled && (() => {
        const accType = localStorage.getItem("accountType")?.toLowerCase();
        if (accType === "superadmin" || accType === "super admin") {
          return <SuperAdminHeader />;
        }
        if (accType === "doctor") {
          return <DoctorHeader />;
        }
        if (accType === "ipd") {
          return <IpdHeader />;
        }
        return <ReceptionHeader />;
      })()}
      {/* Conditionally render Sidebar */}
      {shouldRenderExtras && sidebarEnabled && <SidebarSetting />}

      {/* The main content/Routes will be rendered here */}
      {children}

      {/* Scroll To Top Start */}
      <Taptotop />
      {/* Scroll To Top End */}

      {/* Conditionally render Customizer */}
      {shouldRenderExtras && customizerEnabled}
    </SidebarProvider>
  );
};

export default AppLayout;