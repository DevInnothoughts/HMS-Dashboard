import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

export default function IpdbillNavbar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="navbar-container" style={{ border: "1.5px solid #00bcd4" }}>
      <Container fluid>
        <div className="navbar-content">
          <nav className="breadcrumb-nav">
            <Link
              to="/ipd-dashboard"
              className={`nav-link ${location.pathname === "/ipd-dashboard" ? "active" : ""}`}
            >
              <span className="nav-icon"><FeatherIcon icon="grid" size={16} /></span>
              Dashboard
            </Link>
            <span className="separator">•</span>
            <Link
              to="/ipd-bill-list"
              className={`nav-link ${location.pathname === "/ipd-bill-list" ? "active" : ""}`}
            >
              <span className="nav-icon">📄</span>
              IPD Bills
            </Link>
            <span className="separator">•</span>
            <Link
              to="/add-ipd-bill"
              className={`nav-link ${location.pathname === "/add-ipd-bill" ? "active" : ""}`}
            >
              <span className="nav-icon">➕</span>
              Add IPD Bill
            </Link>
            <span className="separator">•</span>
            <Link
              to="/ipd-collection"
              className={`nav-link ${location.pathname === "/ipd-collection" ? "active" : ""}`}
            >
              <span className="nav-icon">💳</span>
              IPD Collection
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
            margin: 15px 22px 16px 22px;
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

          .nav-link:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }

          .separator {
            color: #94a3b8;
            font-size: 12px;
            margin: 0 4px;
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

          .nav-link.active .nav-icon {
            opacity: 1;
          }

          .nav-link.active:hover {
            transform: none;
          }

          @media (max-width: 768px) {
            .navbar-content {
              flex-direction: column;
              align-items: stretch;
            }
            
            .breadcrumb-nav {
              justify-content: center;
              gap: 6px;
            }
            
            .nav-link {
              padding: 6px 10px;
              font-size: 13px;
            }
            
            .nav-link.active::after {
              width: 60%;
            }
          }

          @media (max-width: 480px) {
            .nav-icon {
              display: none;
            }
            
            .nav-link {
              padding: 4px 8px;
              font-size: 12px;
            }
          }
        `}
      </style>
    </div>
  );
}
