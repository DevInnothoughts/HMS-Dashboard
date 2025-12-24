import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import FeatherIcon from "feather-icons-react";
import { useSidebarContext } from "../pages/api/useSidebarContext";
import logo from "/src/assets/images/logo/icon-logo.png";

const SidebarLinesCSS = () => (
  <style>{`
    .submenu-list {
      position: relative;
      list-style: none;
      margin-left: 25px !important;
      padding-left: 0 !important;
    }

    /* Vertical line */
    .submenu-list::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 2px;
      height: 100%;
      background-color: #00aaff;
    }

    .submenu-list li {
      position: relative;
      padding-left: -9px; 
      line-height: 15px;
      margin-bottom: 6px;
    }

    /* Horizontal line */
    .submenu-list li::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      width: 15px; 
      height: 1px;
      background-color: #00aaff;
      transform: translateY(-50%);
    }

    /* Cut vertical line exactly at last item */
    .submenu-list li:last-child::after {
      content: "";
      position: absolute;
      left: -1px;
      top: 50%;
      width: 4px;
      height: 100%;
      background-color: #fff;
    }

    .submenu-list li:hover::before {
      background-color: #3b82f6;
    }
  `}</style>
);

export default function Sidebar() {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(null);
  const accountType = localStorage.getItem("accountType");

  useEffect(() => {
    setActiveIndex(location.pathname);
  }, [location.pathname]);

  const handleMenuClick = (path) => {
    setActiveIndex((prevPath) => (prevPath === path ? null : path));
  };

  const { toggleSidebar } = useSidebarContext();

  const renderReceptionistMenu = () => (
    <ul>
      <li className="cdxmenu-title">
        <h5>Receptionist</h5>
      </li>

      <li className={`menu-item ${activeIndex === "/" ? "active" : ""}`}>
        <Link to="#" onClick={() => handleMenuClick("/")}>
          <div className="icon-item">
            <FeatherIcon icon="grid" />
          </div>
          <span>Dashboard</span>
          <i className="fa fa-angle-down"></i>
        </Link>
        <ul
          className="submenu-list"
          style={{ display: activeIndex === "/" ? "block" : "none" }}
        >
          {/* <li>
            <Link to="/">Hospital Dashboard</Link>
          </li> */}
          <li>
            <Link to="/reception-dashboard"> Rep. Dashboard</Link>
          </li>
          <li>
            <Link to="/doctor/schedule">Doctor Schedule</Link>
          </li>
          {/* <li>
            <Link to="/dashboard3">Patient Dashboard</Link>
          </li> */}
        </ul>
      </li>

      <li
        className={`menu-item ${
          activeIndex === "/patients" ? "active" : ""
        }`}
      >
        <Link to="/patients">
          <div className="icon-item">
            <i className="fa fa-wheelchair"></i>
          </div>
          Patients
        </Link>
      </li>

      <li
        className={`menu-item ${activeIndex === "/call-logs" ? "active" : ""}`}
      >
        <Link to="/call-logs">
          <div className="icon-item">
            <i className="fa fa-phone"></i>
          </div>
          Call Logs
        </Link>
      </li>

      <li
        className={`menu-item ${
          activeIndex === "/appointments" ? "active" : ""
        }`}
      >
        <Link to="/appointments">
          <div className="icon-item">
            <i className="fa fa-calendar"></i>
          </div>
          Manage Appointments
        </Link>
      </li>

      <li
        className={`menu-item ${
          activeIndex === "/invoices" ? "active" : ""
        }`}
      >
        <Link to="/invoices">
          <div className="icon-item">
            <FeatherIcon icon="file-text" />
          </div>
          Invoice List
        </Link>
      </li>

      <li
        className={`menu-item ${
          activeIndex === "/manage-reports" ? "active" : ""
        }`}
      >
        <Link to="#" onClick={() => handleMenuClick("/manage-reports")}>
          <div className="icon-item">
            <i className="fa fa-list-alt"></i>
          </div>
          Manage Reports
          <i className="fa fa-angle-down"></i>
        </Link>
        <ul
          className="submenu-list"
          style={{
            display: activeIndex === "/manage-reports" ? "block" : "none",
          }}
        >
          <li>
            <Link to="/dailyOPDReport">Daily OPD Report</Link>
          </li>
          <li>
            <Link to="/birthdayAlert">Birthday Alert</Link>
          </li>
          <li>
            <Link to="/appointmentConversion">Appointment Conversion</Link>
          </li>
          <li>
            <Link to="/enquiryConversation">Enquiry Conversation</Link>
          </li>
          <li>
            <Link to="/enquiryData">Enquiry Data</Link>
          </li>
          <li>
            <Link to="/oPDReceiptsReport">OPD Receipts Report</Link>
          </li>
          <li>
            <Link to="/BillingReport">Billing Report</Link>
          </li>
          <li>
            <Link to="/IPDCollectionReport">IPD Collection Report</Link>
          </li>
          <li>
            <Link to="/referenceReport"> Reference Report</Link>
          </li>
          <li>
            <Link to="/conditionWiseReport">Condition Wise Report</Link>
          </li>
          <li>
            
            </li>
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
        className={`menu-item ${
          activeIndex === "/doctor-dashboard" ? "active" : ""
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
        className={`menu-item ${
          activeIndex === "/manage-doctor-reports" ? "active" : ""
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

  return (
    <div className="codex-sidebar">
      <SidebarLinesCSS />
      <div className="logo-gridwrap">
        <Link className="lightlogo" to="/">
          <img className="img-fluid" src={logo} alt="sidebar-lightlogo" />
          <span className="ms-2">HMS</span>
        </Link>
        <div className="sidebar-action" onClick={toggleSidebar}>
                <FeatherIcon icon="menu" />
              </div>
      </div>
      
      <SimpleBar className="codex-menu">
        {accountType === "doctor"
          ? renderDoctorMenu()
          : renderReceptionistMenu()}
      </SimpleBar>
    </div>
  );
}
