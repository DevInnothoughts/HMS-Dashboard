import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import FeatherIcon from "feather-icons-react";
import { useSidebarContext } from "../../pages/api/useSidebarContext";
import logo from "/src/assets/images/logo/icon-logo.png";
import DoctorSidebar from "./DoctorSidebar";
import IpdSidebar from "./IpdSidebar";
import ReceptionSidebar from "./ReceptionSidebar";
import SuperAdminSidebar from "./SuperAdminSidebar";

const SidebarCSS = () => (
  <style>{`
    /* ─── Sidebar Shell ─────────────────────── */
    .codex-sidebar {
      width: 250px;
      transition: width 0.3s ease;
      font-family: 'Poppins', sans-serif;
    }
    /* Collapsed state is handled by _sidebar.scss with proper SCSS specificity */

    /* ─── Collapsed tooltips ─────────────────── */
    .codex-sidebar.collapsed .menu-item > a[data-label] {
      position: relative;
    }
    .codex-sidebar.collapsed .menu-item > a[data-label]::after {
      content: attr(data-label);
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      background: #00acc1;
      color: #fff;
      font-size: 11.5px;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 9999;
      box-shadow: 0 3px 8px rgba(0, 172, 193, 0.3);
    }
    .codex-sidebar.collapsed .menu-item > a[data-label]:hover::after {
      opacity: 1;
    }

    /* ─── Role Badge ────────────────────────── */
    .role-badge {
      margin: 0px 0px 10px;
      padding: 4px 15px;
      border-radius: 10px;
      background: rgba(0, 172, 193, 0.08);
      border: 1px solid rgba(0, 172, 193, 0.25);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: fit-content;
    }
    .role-badge-icon {
      width: 24px;
      height: 22px;
      border-radius: 6px;
      background: #00acc1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .role-badge-icon i {
      color: #fff;
      font-size: 11px;
    }
    .role-badge-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .role-badge-sub {
      font-size: 9.5px;
      font-weight: 600;
      color: #8392a5;
      text-transform: uppercase;
      letter-spacing: 0.7px;
    }
    .role-badge-name {
      font-size: 12px;
      font-weight: 700;
      color: #197482ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.2px;
    }

    /* ─── Menu Items ────────────────────────── */
    .sidebar-menu-list {
      list-style: none;
      margin: 0;
      padding: 0 4px;
    }
    .menu-item {
      margin-bottom: 4px;
      border-radius: 10px;
      list-style: none;
    }
    .menu-item > a {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 5px 8px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 500;
      color: #5d7a7eff;
      text-decoration: none;
      transition: background 0.18s ease, color 0.18s ease;
      position: relative;
    }
    .menu-item > a:hover {
      background: rgba(0, 172, 193, 0.08);
      color: #00acc1;
    }
    .menu-item > a:hover .icon-wrap {
      background: rgba(0, 172, 193, 0.15);
    }
    .menu-item > a:hover .icon-wrap i,
    .menu-item > a:hover .icon-wrap svg {
      color: #00acc1;
    }

    /* Active state */
    .menu-item.active > a {
      background: #00acc1;
      color: #fff;
      font-weight: 600;
      box-shadow: 0 3px 10px rgba(0, 172, 193, 0.35);
    }
    .menu-item.active > a .icon-wrap {
      background: rgba(255,255,255,0.18);
    }
    .menu-item.active > a .icon-wrap i,
    .menu-item.active > a .icon-wrap svg {
      color: #fff;
    }
    .menu-item.active > a .chevron-icon {
      color: rgba(255,255,255,0.8);
    }

    /* ─── Icon Wrap ─────────────────────────── */
    .icon-wrap {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      background: rgba(0, 172, 193, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.18s ease;
    }
    .icon-wrap i {
      font-size: 13px;
      color: #197482ff;
      line-height: 1;
      transition: color 0.18s ease;
    }
    .icon-wrap svg {
      width: 13px;
      height: 13px;
      color: #0d7e90;
      transition: color 0.18s ease;
    }

    /* ─── Chevron ───────────────────────────── */
    .chevron-icon {
      margin-left: auto;
      font-size: 10px !important;
      color: #1bb8cdff;
      transition: transform 0.22s ease;
    }
    .menu-item.active > a .chevron-icon.fa-angle-down {
      transform: rotate(0deg);
    }

    /* ─── Submenu ───────────────────────────── */
    .submenu-list {
      list-style: none !important;
      margin: 2px 0 4px 15px !important;
      padding: 2px 0 2px 10px !important;
      border-left: 2px solid rgba(0, 172, 193, 0.3) !important;
    }
    .submenu-list li {
      margin-bottom: 1px;
      position: relative;
    }
    .submenu-list li::before {
      content: "";
      position: absolute;
      top: 50%;
      left: -12px;
      width: 8px;
      height: 1.5px;
      background: rgba(0, 172, 193, 0.4);
      transform: translateY(-50%);
    }
    .submenu-list li a {
      display: flex;
      align-items: center;
      font-size: 11px;
      font-weight: 500;
      color: #000000ff;
      padding: 4px 6px;
      border-radius: 7px;
      text-decoration: none;
      transition: all 0.16s ease;
    }
    .submenu-list li a::before {
      content: "";
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #29b5c5ff;
      flex-shrink: 0;
      margin-right: 7px;
      transition: background 0.16s ease;
    }
    .submenu-list li a:hover {
      background: rgba(0, 172, 193, 0.08);
      color: #00acc1;
    }
    .submenu-list li a:hover::before,
    .submenu-list li a.active::before {
      background: #00acc1;
    }
    .submenu-list li a.active {
      color: #00acc1;
      font-weight: 600;
      background: rgba(0, 172, 193, 0.1);
    }

    /* ─── Logo Area ───────────────────────────── */
    .logo-gridwrap {
      padding: 14px 14px 12px !important;
      border-bottom: none !important;
      background: transparent;
      position: relative;
    }
    .logo-gridwrap::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 12px;
      right: 12px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 172, 193, 0.15), transparent);
    }
    .lightlogo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .logo-img-wrap {
      width: 38px;
      height: 38px;
      border-radius: 9px;
      background: rgba(0, 172, 193, 0.1);
      border: 1px solid rgba(0, 172, 193, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logo-img-wrap img {
      width: 22px;
      height: 22px;
      object-fit: contain;
    }
    .logo-text-wrap {
      display: flex;
      flex-direction: column;
      line-height: 1;
      gap: 2px;
    }
    .logo-title {
      font-size: 18px;
      font-weight: 800;
      color: #197482ff;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-family: 'Poppins', sans-serif;
      line-height: 1;
    }
    .logo-subtitle {
      font-size: 9px;
      font-weight: 500;
      color: #0fafc1ff;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      font-family: 'Poppins', sans-serif;
    }
    .sidebar-action {
      width: 32px; 
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 172, 193, 0.08);
      border: 1px solid rgba(0, 172, 193, 0.2);
      cursor: pointer;
      transition: background 0.18s ease;
      flex-shrink: 0;
    }
    .sidebar-action:hover {
      background: rgba(0, 172, 193, 0.18);
    }
    .sidebar-action svg {
      width: 15px;
      height: 15px;
      color: #27737dff;
    }

    /* ─── Logout Button ─────────────────────── */
    .sidebar-logout-section {
      padding: 10px 12px 5px 12px;
      border-top: 1px solid rgba(0, 172, 193, 0.15);
    }
    .logout-btn {
      width: 100%;
      border: 1px solid rgba(226, 86, 42, 0.3);
      border-radius: 7px;
      padding: 7px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      color: #e2562a;
      background: rgba(226, 86, 42, 0.05);
      transition: all 0.2s ease;
      font-family: 'Poppins', sans-serif;
      letter-spacing: 0.1px;
    }
    .logout-btn:hover {
      background: #e2562a;
      color: #fff;
      border-color: #e2562a;
      box-shadow: 0 3px 10px rgba(226, 86, 42, 0.28);
    }
    .logout-btn.is-collapsed {
      justify-content: center;
      padding: 9px;
    }
    .logout-btn i {
      font-size: 16px;
      flex-shrink: 0;
    }

    /* ─── Scrollbar hide ────────────────────── */
    .codex-sidebar .simplebar-scrollbar::before,
    .codex-sidebar .simplebar-scrollbar,
    .codex-sidebar .simplebar-track { display: none !important; }
    .codex-sidebar ::-webkit-scrollbar { display: none !important; width: 0 !important; }
    .codex-sidebar * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
  `}</style>
);

export default function SidebarSetting() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const accountType = localStorage.getItem("accountType");
  const department = localStorage.getItem("department");
  const isSuperAdmin =
    accountType?.toLowerCase() === "superadmin" ||
    accountType?.toLowerCase() === "super admin";
  const dashboardLink = isSuperAdmin
    ? "/superadmin-dashboard"
    : accountType?.toLowerCase() === "doctor"
    ? "/doctor-dashboard"
    : (department === "IPD" ? "/ipd-dashboard" : "/reception-dashboard");
  const { toggleSidebar, isCompact } = useSidebarContext();

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

    if (isSuperAdmin) {
      return <SuperAdminSidebar {...props} />;
    }
    if (accountType?.toLowerCase() === "ipd" || (department === "IPD" && accountType?.toLowerCase() === "reception")) {
      return <IpdSidebar {...props} />;
    }
    if (accountType?.toLowerCase() === "doctor") {
      return <DoctorSidebar {...props} department={department} />;
    }
    return <ReceptionSidebar {...props} />;
  };

  return (
    <div
      className={`codex-sidebar ${effectivelyCollapsed ? "collapsed" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
    >
      <SidebarCSS />

      {/* Logo */}
      <div className="logo-gridwrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link className="lightlogo" to={dashboardLink}>
          <div className="logo-img-wrap">
            <img src={logo} alt="HMS Logo" />
          </div>
          {!effectivelyCollapsed && (
            <div className="logo-text-wrap">
              <span className="logo-title">HMS</span>
            </div>
          )}
        </Link>
        <div className="sidebar-action" onClick={toggleSidebar}>
          <FeatherIcon icon="menu" />
        </div>
      </div>

      {/* Menu */}
      <SimpleBar className="codex-menu" style={{ flexGrow: 1, overflowX: 'hidden' }}>
        {renderContent()}
      </SimpleBar>

      {/* Logout */}
      <div className="sidebar-logout-section">
        <button
          onClick={handleLogout}
          className={`logout-btn${effectivelyCollapsed ? " is-collapsed" : ""}`}
        >
          <i className="fa fa-sign-out"></i>
          {!effectivelyCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
