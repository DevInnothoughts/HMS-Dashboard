import React from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";

const SuperAdminSidebar = ({
  activeIndex,
  handleMenuClick,
  isCollapsed,
  location,
}) => {
  const dashboardPath = "/superadmin-dashboard";
  const hcPath = "/superadmin-hc";

  const isDashboardActive =
    activeIndex === dashboardPath ||
    location.pathname === dashboardPath ||
    activeIndex === "/" ||
    location.pathname === "/";

  const isHcActive =
    activeIndex === hcPath ||
    location.pathname === hcPath ||
    activeIndex === "/hospital-certificates" ||
    location.pathname === "/hospital-certificates" ||
    activeIndex === "/superadmin-hospital-certificates" ||
    location.pathname === "/superadmin-hospital-certificates";

  const ipdDuePath = "/superadmin-ipd-bills-due-list";

  const isIpdDueActive =
    activeIndex === ipdDuePath ||
    location.pathname === ipdDuePath ||
    activeIndex === "/ipd-bills-due-list" ||
    location.pathname === "/ipd-bills-due-list";

  return (
    <ul className="sidebar-menu-list">
      {/* Role Badge */}
      {!isCollapsed && (
        <li
          style={{
            listStyle: "none",
            marginBottom: "4px",
            textAlign: "center",
          }}
        >
          <div className="role-badge">
            <div className="role-badge-icon">
              <i className="fa fa-shield"></i>
            </div>
            <div className="role-badge-text">
              <span className="role-badge-name">Super Admin</span>
            </div>
          </div>
        </li>
      )}

      {/* Super Admin Dashboard */}
      <li className={`menu-item ${isDashboardActive ? "active" : ""}`}>
        <Link to={dashboardPath} data-label="Dashboard">
          <div className="icon-wrap">
            <FeatherIcon icon="grid" />
          </div>
          <span>Dashboard</span>
        </Link>
      </li>

      {/* Hospital Certificates */}
      <li className={`menu-item ${isHcActive ? "active" : ""}`}>
        <Link to={hcPath} data-label="Hospital Certificates">
          <div className="icon-wrap">
            <i className="fa fa-certificate"></i>
          </div>
          {!isCollapsed && <span>Hospital Certificates</span>}
        </Link>
      </li>

      {/* IPD Bills Due List */}
      <li className={`menu-item ${isIpdDueActive ? "active" : ""}`}>
        <Link to={ipdDuePath} data-label="IPD Bills Due List">
          <div className="icon-wrap">
            <i className="fa fa-file-text-o"></i>
          </div>
          {!isCollapsed && <span>IPD Bills Due List</span>}
        </Link>
      </li>
    </ul>
  );
};

export default SuperAdminSidebar;
