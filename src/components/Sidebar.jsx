import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import FeatherIcon from "feather-icons-react";
import { useSidebarContext } from "../pages/api/useSidebarContext";
import logo from "/src/assets/images/logo/icon-logo.png";
import { FaFileInvoiceDollar, FaClipboardList } from "react-icons/fa";


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
    const jobLocation = localStorage.getItem("jobLocation");
    const { toggleSidebar, isCollapsed } = useSidebarContext();

    useEffect(() => {
        setActiveIndex(location.pathname);
    }, [location.pathname]);

    const reportRoutes = [
        "/appointmentConversion", "/BillingReport", "/BirthdayAlert", "/cashDepositReport", "/conditionWiseReport",
        "/dailyOPDReport", "/enquiryConversation", "/enquiryData", "/insuranceduereport",
        "/IPDCollectionReport", "/ipdduereport", "/opdipdcollgraph", "/opdipdcollection",
        "/OPDCollectionReports", "/oPDReceiptsReport", "/PharmacyCollectionReport",
        "/referenceReport", "/sxconversionreport"
    ];

    const doctorReportRoutes = ["/diagnosis-report", "/opd-surgery-report"];

    const isReportActive = reportRoutes.includes(location.pathname) || activeIndex === "/manage-reports";
    const isDoctorReportActive = doctorReportRoutes.includes(location.pathname) || activeIndex === "/manage-doctor-reports";

    const handleMenuClick = (path) => {
        setActiveIndex((prevPath) => (prevPath === path ? null : path));
    };

    const renderIPDReceptionDemoMenu = () => (
        <ul>
            <li className="cdxmenu-title">
                <h5>Receptionist(IPD)</h5>
            </li>

            <li className={`menu-item ${activeIndex === "/ipd-dashboard" ? "active" : ""}`}>
                <Link to="/ipd-dashboard">
                    <div className="icon-item">
                        <FeatherIcon icon="grid" />
                    </div>
                    {!isCollapsed && <span>Dashboard</span>}
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
        </ul>
    );

    const renderReceptionistMenu = () => (
        <ul>
            <li className="cdxmenu-title">
                <h5>Receptionist(OPD)</h5>
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
                className={`menu-item ${activeIndex === "/invoices/payment-data" ? "active" : ""
                    }`}
            >
                <Link to="/invoices/payment-data">
                    <div className="icon-item">
                        <FaFileInvoiceDollar />
                    </div>
                    {!isCollapsed && <span>IPD Payment Data</span>}
                </Link>
            </li>

            <li
                className={`menu-item ${activeIndex === "/reports/receipts" ? "active" : ""
                    }`}
            >
                <Link to="/reports/receipts">
                    <div className="icon-item">
                        <FeatherIcon icon="file-text" />
                    </div>
                    {!isCollapsed && <span>OPD Receipt</span>}
                </Link>
            </li>

            <li
                className={`menu-item ${activeIndex === "/daily-closing" ? "active" : ""
                    }`}
            >
                <Link to="/daily-closing">
                    <div className="icon-item">
                        <i className="fa fa-money"></i>
                    </div>
                    {!isCollapsed && <span>Daily closing</span>}
                </Link>
            </li>

            <li
                className={`menu-item ${activeIndex === "/bed-allotment" ? "active" : ""
                    }`}
            >
                <Link to="/bed-allotment">
                    <div className="icon-item">
                        <i className="fa fa-bed"></i>
                    </div>
                    {!isCollapsed && <span>Bed Allotment</span>}
                </Link>
            </li>

            <li
                className={`menu-item ${isReportActive ? "active" : ""}`}
            >
                <Link to="#" onClick={() => handleMenuClick("/manage-reports")}>
                    <div className="icon-item">
                        <i className="fa fa-list-alt"></i>
                    </div>
                    {!isCollapsed && <span>Manage Reports</span>}
                    {!isCollapsed && (
                        <i className={`fa ${isReportActive ? "fa-angle-down" : "fa-angle-right"}`}></i>
                    )}
                </Link>
                <ul
                    className="submenu-list"
                    style={{
                        display: isReportActive ? "block" : "none",
                    }}
                >
                    <li><Link to="/appointmentConversion" className={location.pathname === "/appointmentConversion" ? "active" : ""}>Appointment Conversion</Link></li>
                    <li><Link to="/BillingReport" className={location.pathname === "/BillingReport" ? "active" : ""}>Billing Report</Link></li>
                    <li><Link to="/BirthdayAlert" className={location.pathname === "/BirthdayAlert" ? "active" : ""}>Birthday Alert</Link></li>
                    <li><Link to="/cashDepositReport" className={location.pathname === "/cashDepositReport" ? "active" : ""}>Cash Deposit Report</Link></li>
                    <li><Link to="/conditionWiseReport" className={location.pathname === "/conditionWiseReport" ? "active" : ""}>Condition Wise Report</Link></li>
                    <li><Link to="/dailyOPDReport" className={location.pathname === "/dailyOPDReport" ? "active" : ""}>Daily OPD Report</Link></li>
                    <li><Link to="/enquiryConversation" className={location.pathname === "/enquiryConversation" ? "active" : ""}>Enquiry Conversion</Link></li>
                    <li><Link to="/enquiryData" className={location.pathname === "/enquiryData" ? "active" : ""}>Enquiry Data</Link></li>
                    <li><Link to="/insuranceduereport" className={location.pathname === "/insuranceduereport" ? "active" : ""}>Insurance Due Report</Link></li>
                    <li><Link to="/IPDCollectionReport" className={location.pathname === "/IPDCollectionReport" ? "active" : ""}>IPD Collection Report</Link></li>
                    <li><Link to="/ipdduereport" className={location.pathname === "/ipdduereport" ? "active" : ""}>IPD Due Report</Link></li>
                    <li><Link to="/opdipdcollgraph" className={location.pathname === "/opdipdcollgraph" ? "active" : ""}>OPD + IPD Collection Graph</Link></li>
                    <li><Link to="/opdipdcollection" className={location.pathname === "/opdipdcollection" ? "active" : ""}>OPD + IPD Collection Report</Link></li>
                    <li><Link to="/OPDCollectionReports" className={location.pathname === "/OPDCollectionReports" ? "active" : ""}>OPD Collection Report</Link></li>
                    <li><Link to="/oPDReceiptsReport" className={location.pathname === "/oPDReceiptsReport" ? "active" : ""}>OPD Receipts Report</Link></li>
                    <li><Link to="/PharmacyCollectionReport" className={location.pathname === "/PharmacyCollectionReport" ? "active" : ""}>Pharmacy Collection Report</Link></li>
                    <li><Link to="/referenceReport" className={location.pathname === "/referenceReport" ? "active" : ""}>Reference Report</Link></li>
                    <li><Link to="/sxconversionreport" className={location.pathname === "/sxconversionreport" ? "active" : ""}>SX Conversion Report</Link></li>
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
                className={`menu-item ${isDoctorReportActive ? "active" : ""
                    }`}
            >
                <Link to="#" onClick={() => handleMenuClick("/manage-doctor-reports")}>
                    <div className="icon-item">
                        <FeatherIcon icon="file-text" />
                    </div>
                    <span>Manage Reports</span>
                    <i className={`fa ${isDoctorReportActive ? "fa-angle-down" : "fa-angle-right"}`}></i>
                </Link>
                <ul
                    className="submenu-list"
                    style={{
                        display:
                            isDoctorReportActive ? "block" : "none",
                    }}
                >
                    <li>
                        <Link to="/diagnosis-report" className={location.pathname === "/diagnosis-report" ? "active" : ""}>Diagnosis Report</Link>
                    </li>
                    <li>
                        <Link to="/opd-surgery-report" className={location.pathname === "/opd-surgery-report" ? "active" : ""}>OPD Surgery Report</Link>
                    </li>
                </ul>
            </li>
        </ul>
    );

    const renderContent = () => {
        if (department === "IPD" && accountType === "reception") {
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
