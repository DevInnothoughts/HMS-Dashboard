import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

export default function BedallotmentNavbar() {
  const location = useLocation();
  const accountType = localStorage.getItem("accountType");
  const department = localStorage.getItem("department");
  const isIpd = accountType?.toLowerCase() === "ipd" || (department === "IPD" && accountType?.toLowerCase() === "reception");
  const dashboardLink = isIpd ? "/ipd-dashboard" : "/reception-dashboard";

  return (
    <div className="navbar-container" style={{ border: "1.5px solid #00bcd4", }}>
      <Container fluid>
        <div className="navbar-content">
          <nav className="breadcrumb-nav">
            <Link
              to={dashboardLink}
              className={`nav-link ${location.pathname === dashboardLink ? "active" : ""}`}
            >
              <span className="nav-icon"><FeatherIcon icon="grid" size={16} /></span>
              Dashboard
            </Link>
            <span className="separator">•</span>
            <Link
              to="/bed-allotment-list"
              className={`nav-link ${location.pathname === "/bed-allotment-list" ? "active" : ""
                }`}
            >
              <span className="nav-icon">📋</span>
              Bed Allotment List
            </Link>
            <span className="separator">•</span>
            <Link
              to="/add-bed-allotment"
              className={`nav-link ${location.pathname === "/add-bed-allotment" ? "active" : ""
                }`}
            >
              <span className="nav-icon">➕</span>
              Allot Bed
            </Link>
          </nav>
        </div>
      </Container>

      {/* CSS Styling */}
      <style>
        {`
          .navbar-container {
            background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
            padding: 10px 12px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            margin: 8px 0 22px 3px; 
            border: 1px solid rgba(255, 255, 255, 0.8);
          }

          .navbar-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
          }

          .breadcrumb-nav {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            font-weight: 500;
            font-size: 14px;
          }

          .nav-link {
            display: flex;
            align-items: center;
            gap: 5px;
            text-decoration: none;
            color: #000000ff;
            padding: 8px 10px;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: transparent;
          }

          .nav-icon {
            font-size: 16px;
            opacity: 0.8;
          }

          .nav-link:hover {
            background-color: #ffffff;
            color: #1a73e8;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          .nav-link.active {
            background-color: #ffffff;
            color: #1a73e8;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            position: relative;
          }

          .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 3px;
            background-color: #1a73e8;
            border-radius: 2px;
          }

          .separator {
            color: #888888ff;
            font-size: 12px;
            margin: 4px;
          }
        `}
      </style>
    </div>
  );
}
