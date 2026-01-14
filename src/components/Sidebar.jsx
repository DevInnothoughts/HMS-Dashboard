import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import FeatherIcon from "feather-icons-react";
import { useSidebarContext } from "../pages/api/useSidebarContext";
import logo from "/src/assets/images/logo/icon-logo.png";


const SidebarLinesCSS = () => (
  <style>{`
    .codex-sidebar {
      width: 250px;
      transition: all 0.3s ease;
    }

    /* Sidebar collapsed logic */
    .codex-sidebar.collapsed { width: 80px; }
    .codex-sidebar.collapsed span, 
    .codex-sidebar.collapsed .fa-angle-down,
    .codex-sidebar.collapsed h5,
    .codex-sidebar.collapsed h4,
    .codex-sidebar.collapsed .submenu-list {
      display: none !important;
    }

    /* Submenu Container */
    .submenu-list {
      position: relative;
      list-style: none;
      margin-left: 35px !important; /* Spacing for the lines */
      padding-left: 0 !important;
      border-left: 2px solid #00aaff; /* The Main Vertical Line */
    }

    .submenu-list li {
      position: relative;
      line-height: 20px; 
      margin-bottom: 0;
    }

    /* The Horizontal Line (Branch) */
    .submenu-list li::before {
      content: "";
      position: absolute;
      top: 15px; /* Centers the line with the text height */
      left: 0;
      width: 15px; 
      height: 2px;
      background-color: #00aaff;
    }

    /* Hiding the excess vertical line after the last item */
    .submenu-list li:last-child {
      background: white; /* Matches sidebar background to "cut" the line */
    }
    
    /* Alternative "Cut" method: A white box that covers the bottom of the vertical line */
    .submenu-list li:last-child::after {
      content: "";
      position: absolute;
      top: 15px;
      left: -2px;
      width: 2px;
      height: 100%;
      background-color: white; /* Matches sidebar background */
    }

    .submenu-list li a {
      color: #333;
      text-decoration: none;
      font-size: 14px;
      display: block;
      transition: 0.2s;
    }

    .submenu-list li a:hover {
      color: #00aaff;
    }
  `}</style>
);

export default function Sidebar() {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(null);
  const accountType = localStorage.getItem("accountType");
  const department = localStorage.getItem("department");
  const jobLocation = localStorage.getItem("jobLocation");
  const { toggleSidebar, isCollapsed } = useSidebarContext();

  useEffect(() => {
    setActiveIndex(location.pathname);
  }, [location.pathname]);

  const handleMenuClick = (path) => {
    setActiveIndex((prevPath) => (prevPath === path ? null : path));
  };

  const renderIPDReceptionDemoMenu = () => (
    <ul>
      <li className="cdxmenu-title">
        <h5>Receptionist(IPD)</h5>
      </li>

      <li className={`menu-item ${activeIndex === "/reception-dashboard" ? "active" : ""}`}>
        <Link to="/reception-dashboard">
          <div className="icon-item">
            <FeatherIcon icon="grid" />
          </div>
          <span>Dashboard</span>
        </Link>
      </li>

      <li className={`menu-item ${activeIndex === "/search-by" ? "active" : ""}`}>
        <Link to="/search-by">
          <div className="icon-item">
            <i className="fa fa-search"></i>
          </div>
          {!isCollapsed && <span>Search By</span>}
        </Link>
      </li>

      <li className={`menu-item ${activeIndex === "/manage-admission" ? "active" : ""}`}>
        <Link to="/manage-admission">
          <div className="icon-item">
            <i className="fa fa-hospital-o"></i>
          </div>
          {!isCollapsed && <span>Manage Admission</span>}
        </Link>
      </li>


      <li className={`menu-item ${activeIndex === "/surgery" ? "active" : ""}`}>
        <Link to="/surgery">
          <div className="icon-item">
            <i className="fa fa-stethoscope"></i>
          </div>
          {!isCollapsed && <span>Surgery</span>}
        </Link>
      </li>


    </ul>
  );

  const renderReceptionistMenu = () => (
    <ul>
      <li className="cdxmenu-title">
        <h5>Receptionist</h5>
      </li>

      <li className={`menu-item ${activeIndex === "/reception-dashboard" ? "active" : ""}`}>
        <Link to="/reception-dashboard">
          <div className="icon-item">
            <FeatherIcon icon="grid" />
          </div>
          <span>Dashboard</span>
        </Link>
      </li>

      <li className={`menu-item ${activeIndex === "/patients" ? "active" : ""}`}>
        <Link to="/patients">
          <div className="icon-item">
            <i className="fa fa-wheelchair"></i>
          </div>
          {!isCollapsed && <span>Patients</span>}
        </Link>
      </li>

      <li
        className={`menu-item ${activeIndex === "/call-logs" ? "active" : ""}`}
      >
        <Link to="/call-logs">
          <div className="icon-item">
            <i className="fa fa-phone"></i>
          </div>
          {!isCollapsed && <span>Call Logs</span>}
        </Link>
      </li>

      <li
        className={`menu-item ${activeIndex === "/appointments" ? "active" : ""
          }`}
      >
        <Link to="/appointments">
          <div className="icon-item">
            <i className="fa fa-calendar"></i>
          </div>
          {!isCollapsed && <span>Manage Appointments</span>}
        </Link>
      </li>

      <li
        className={`menu-item ${activeIndex === "/invoices" ? "active" : ""
          }`}
      >
        <Link to="/invoices">
          <div className="icon-item">
            <FeatherIcon icon="file-text" />
          </div>
          {!isCollapsed && <span>IPD Bills</span>}
        </Link>
      </li>

      <li
        className={`menu-item ${activeIndex === "/manage-reports" ? "active" : ""}`}
      >
        <Link to="#" onClick={() => handleMenuClick("/manage-reports")}>
          <div className="icon-item">
            <i className="fa fa-list-alt"></i>
          </div>
          {!isCollapsed && <span>Manage Reports</span>}
          <i className="fa fa-angle-down"></i>
        </Link>
        <ul
          className="submenu-list"
          style={{
            display: activeIndex === "/manage-reports" ? "block" : "none",
          }}
        >
          <li><Link to="/dailyOPDReport">Daily OPD Report</Link></li>
          <li><Link to="/birthdayAlert">Birthday Alert</Link></li>
          <li><Link to="/appointmentConversion">Appointment Conversion</Link></li>
          <li><Link to="/enquiryConversation">Enquiry Conversation</Link></li>
          <li><Link to="/enquiryData">Enquiry Data</Link></li>
          <li><Link to="/oPDReceiptsReport">OPD Receipts Report</Link></li>
          <li><Link to="/BillingReport">Billing Report</Link></li>
          <li><Link to="/IPDCollectionReport">IPD Collection Report</Link></li>
          <li><Link to="/referenceReport"> Reference Report</Link></li>
          <li><Link to="/conditionWiseReport">Condition Wise Report</Link></li>
        </ul>
      </li>
    </ul>
  );

  const renderDoctorMenu = () => (
    <ul>
      <li className="cdxmenu-title">
        <h4>Doctor</h4>
      </li>

      <li
        className={`menu-item ${activeIndex === "/doctor-dashboard" ? "active" : ""
          }`}
      >
        <Link to="#" onClick={() => handleMenuClick("/doctor-dashboard")}>
          <div className="icon-item">
            <FeatherIcon icon="home" />
          </div>
          <Link to="/doctor-dashboard">Doctor Dashboard</Link>
        </Link>
      </li>

      <li className={`menu-item ${activeIndex === "/patient" ? "active" : ""}`}>
        <Link to="/patient">
          <div className="icon-item">
            <FeatherIcon icon="users" />
          </div>
          <span>Patient</span>
        </Link>
      </li>

      <li
        className={`menu-item ${activeIndex === "/manage-doctor-reports" ? "active" : ""
          }`}
      >
        <Link to="#" onClick={() => handleMenuClick("/manage-doctor-reports")}>
          <div className="icon-item">
            <FeatherIcon icon="file-text" />
          </div>
          <span>Manage Reports</span>
          <i className="fa fa-angle-down"></i>
        </Link>
        <ul
          className="submenu-list"
          style={{
            display:
              activeIndex === "/manage-doctor-reports" ? "block" : "none",
          }}
        >
          <li>
            <Link to="/diagnosis-report">Diagnosis Report</Link>
          </li>
          <li>
            <Link to="/opd-surgery-report">OPD Surgery Report</Link>
          </li>
        </ul>
      </li>
    </ul>
  );

  const renderContent = () => {
    if (department === "IPD" && accountType === "reception" ) {
      return renderIPDReceptionDemoMenu();
    }
    if (accountType === "doctor") {
      return renderDoctorMenu();
    }
    return renderReceptionistMenu();
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
