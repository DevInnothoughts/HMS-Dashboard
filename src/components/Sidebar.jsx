import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

    /* Hide the SimpleBar scrollbar to keep a clean look */
    .codex-sidebar .simplebar-scrollbar::before,
    .codex-sidebar .simplebar-scrollbar,
    .codex-sidebar .simplebar-track {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
    }

    /* Hide native scrollbars just in case */
    .codex-sidebar ::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
    }
    .codex-sidebar * {
      -ms-overflow-style: none !important;  /* IE and Edge */
      scrollbar-width: none !important;  /* Firefox */
    }
  `}</style>
);

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const accountType = localStorage.getItem("accountType");
    const department = localStorage.getItem("department");
    const { toggleSidebar, isCompact } = useSidebarContext();

    // The sidebar should be collapsed if it's explicitly compact AND we are not hovering.
    // This allows the toggle button to pin the sidebar open (isCompact = false).
    const effectivelyCollapsed = isCompact && !isHovered;

    useEffect(() => {
        setActiveIndex(location.pathname);
    }, [location.pathname]);

    const handleMenuClick = (path) => {
        setActiveIndex((prevPath) => (prevPath === path ? null : path));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login', { replace: true });
    };

    const renderContent = () => {
        const props = {
            activeIndex,
            handleMenuClick,
            isCollapsed: effectivelyCollapsed,
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
        <div 
            className={`codex-sidebar ${effectivelyCollapsed ? "collapsed" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
        >
            <SidebarLinesCSS />
            <div className="logo-gridwrap">
                <Link className="lightlogo" to="/">
                    <img className="img-fluid" src={logo} alt="sidebar-lightlogo" />
                    {!effectivelyCollapsed && <span className="ms-2">HMS</span>}
                </Link>
                <div className="sidebar-action" onClick={toggleSidebar}>
                    <FeatherIcon icon="menu" />
                </div>
            </div>

            <SimpleBar className="codex-menu" style={{ flexGrow: 1, overflowX: 'hidden' }}>
                {renderContent()}
            </SimpleBar>

            <div style={{ padding: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(120deg, #4776E6 0%, #8E54E9 100%)',
                    border: 'none',
                    padding: effectivelyCollapsed ? '10px' : '10px 15px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: effectivelyCollapsed ? 'center' : 'flex-start',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                  }}
                >
                  <i className="fa fa-sign-out" style={{ fontSize: '18px' }}></i>
                  {!effectivelyCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}
