import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import FeatherIcon from "feather-icons-react";
import { useSidebarContext } from "../pages/api/useSidebarContext";
import logo from "/src/assets/images/logo/icon-logo.png";
import DoctorMenu from "./Sidebar/DoctorMenu";
import IpdMenu from "./Sidebar/IpdMenu";
import ReceptionistMenu from "./Sidebar/ReceptionistMenu";

const SidebarLinesCSS = () => (
    <style>{`
    .codex-sidebar {
      width: 250px;
      transition: all 0.3s ease;
    }

    .codex-sidebar.collapsed { width: 80px; }
    .codex-sidebar.collapsed span, 
    .codex-sidebar.collapsed .fa-angle-down,
    .codex-sidebar.collapsed h5,
    .codex-sidebar.collapsed h4,
    .codex-sidebar.collapsed .submenu-list {
      display: none !important;
    }

    .submenu-list {
      position: relative;
      list-style: none;
      margin-left: 35px !important; 
      padding-left: 0 !important;
      border-left: 2px solid #00aaff; 
    }

    .submenu-list li {
      position: relative;
      line-height: 20px; 
      margin-bottom: 0;
    }

    .submenu-list li::before {
      content: "";
      position: absolute;
      top: 15px; 
      left: 0;
      width: 15px; 
      height: 2px;
      background-color: #00aaff;
    }

    .submenu-list li:last-child {
      background: white; 
    }
    
    .submenu-list li:last-child::after {
      content: "";
      position: absolute;
      top: 15px;
      left: -2px;
      width: 2px;
      height: 100%;
      background-color: white; 
    }

    .submenu-list li a {
      color: #333;
      text-decoration: none;
      font-size: 14px;
      display: block;
      transition: 0.2s;
    }

    .submenu-list li a:hover,
    .submenu-list li a.active {
      color: #2279faff;
      font-weight: 600;
    }
  `}</style>
);

export default function Sidebar() {
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);
    const accountType = localStorage.getItem("accountType");
    const department = localStorage.getItem("department");
    const { toggleSidebar, isCollapsed } = useSidebarContext();

    useEffect(() => {
        setActiveIndex(location.pathname);
    }, [location.pathname]);

    const handleMenuClick = (path) => {
        setActiveIndex((prevPath) => (prevPath === path ? null : path));
    };

    const renderContent = () => {
        const props = {
            activeIndex,
            handleMenuClick,
            isCollapsed,
            location
        };

        if (department === "IPD" && accountType === "reception") {
            return <IpdMenu {...props} />;
        }
        if (accountType === "doctor") {
            return <DoctorMenu {...props} department={department} />;
        }
        return <ReceptionistMenu {...props} />;
    };

    return (
        <div className={`codex-sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <SidebarLinesCSS />
            <div className="logo-gridwrap">
                <Link className="lightlogo" to="/">
                    <img className="img-fluid" src={logo} alt="sidebar-lightlogo" />
                    {!isCollapsed && <span className="ms-2">HMS</span>}
                </Link>
                <div className="sidebar-action" onClick={toggleSidebar}>
                    <FeatherIcon icon="menu" />
                </div>
            </div>

            <SimpleBar className="codex-menu">
                {renderContent()}
            </SimpleBar>
        </div>
    );
}
