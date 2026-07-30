import React from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";

const ReceptionSidebar = ({
    activeIndex,
    handleMenuClick,
    isCollapsed,
    location
}) => {
    const reportRoutes = [
        "/appointment-conversion", "/billing-reports", "/birthday-alert", "/cash-deposit-report",
        "/condition-wise-report", "/daily-opd-report", "/enquiry-conversion", "/enquiry-data",
        "/opd-ipd-coll-graph", "/opd-ipd-collection", "/opd-collection-reports",
        "/opd-receipts-report", "/pharmacy-collection-report", "/reference-report",
        "/sx-conversion-report", "/daily-expense-report", "/lost-lead-report"
    ];
    const isReportActive = reportRoutes.includes(location.pathname) || activeIndex === "/manage-reports";

    return (
        <ul className="sidebar-menu-list">
            {/* Role Badge */}
            {!isCollapsed && (
                <li style={{ listStyle: 'none', marginBottom: '4px', textAlign: 'center' }}>
                    <div className="role-badge">
                        <div className="role-badge-icon">
                            <i className="fa fa-id-badge"></i>
                        </div>
                        <div className="role-badge-text">
                            <span className="role-badge-name">Reception Panel</span>
                        </div>
                    </div>
                </li>
            )}

            {/* Dashboard */}
            <li className={`menu-item ${activeIndex === "/reception-dashboard" ? "active" : ""}`}>
                <Link to="/reception-dashboard" data-label="Dashboard">
                    <div className="icon-wrap">
                        <FeatherIcon icon="grid" />
                    </div>
                    <span>Dashboard</span>
                </Link>
            </li>

            {/* Patients */}
            <li className={`menu-item ${activeIndex === "/opd-patient-list" ? "active" : ""}`}>
                <Link to="/opd-patient-list" data-label="Patients">
                    <div className="icon-wrap">
                        <i className="fa fa-user"></i>
                    </div>
                    {!isCollapsed && <span>Patients</span>}
                </Link>
            </li>

            {/* Enquiries */}
            <li className={`menu-item ${activeIndex === "/recp-enquiries-navbar" || location.pathname === "/recp-enquiries-navbar" ? "active" : ""}`}>
                <Link to="/recp-enquiries-navbar" data-label="Enquiries">
                    <div className="icon-wrap">
                        <i className="fa fa-bar-chart"></i>
                    </div>
                    {!isCollapsed && <span>Enquiries</span>}
                </Link>
            </li>

            {/* Calling Calendar */}
            <li className={`menu-item ${activeIndex === "/calling-calendar" ? "active" : ""}`}>
                <Link to="/calling-calendar" data-label="Calling Calendar">
                    <div className="icon-wrap">
                        <i className="fa fa-phone-square"></i>
                    </div>
                    {!isCollapsed && <span>Calling Calendar</span>}
                </Link>
            </li>

            {/* Appointments */}
            <li className={`menu-item ${activeIndex === "/opd-appointment-list" ? "active" : ""}`}>
                <Link to="/opd-appointment-list" data-label="Appointments">
                    <div className="icon-wrap">
                        <i className="fa fa-calendar"></i>
                    </div>
                    {!isCollapsed && <span>Appointments</span>}
                </Link>
            </li>

            {/* Receipts */}
            <li className={`menu-item ${activeIndex === "/receipt-list" ? "active" : ""}`}>
                <Link to="/receipt-list" data-label="Receipts">
                    <div className="icon-wrap">
                        <FeatherIcon icon="file-text" />
                    </div>
                    {!isCollapsed && <span>Receipts</span>}
                </Link>
            </li>

            {/* Daily Closing */}
            <li className={`menu-item ${activeIndex === "/daily-closing" ? "active" : ""}`}>
                <Link to="/daily-closing" data-label="Daily Closing">
                    <div className="icon-wrap">
                        <i className="fa fa-money"></i>
                    </div>
                    {!isCollapsed && <span>Daily Closing</span>}
                </Link>
            </li>

            {/* Daily Expense */}
            <li className={`menu-item ${activeIndex === "/daily-expense" ? "active" : ""}`}>
                <Link to="/daily-expense" data-label="Daily Expense">
                    <div className="icon-wrap">
                        <i className="fa fa-credit-card"></i>
                    </div>
                    {!isCollapsed && <span>Daily Expense</span>}
                </Link>
            </li>

            {/* Hospital Certificates */}
            <li className={`menu-item ${activeIndex === "/hospital-certificates" ? "active" : ""}`}>
                <Link to="/hospital-certificates" data-label="Certificates">
                    <div className="icon-wrap">
                        <i className="fa fa-certificate"></i>
                    </div>
                    {!isCollapsed && <span>Hospital Certificates</span>}
                </Link>
            </li>

            {/* Reports (dropdown) */}
            <li className={`menu-item ${isReportActive ? "active" : ""}`}>
                <Link to="#" onClick={() => handleMenuClick("/manage-reports")} data-label="Reports">
                    <div className="icon-wrap">
                        <i className="fa fa-list-alt"></i>
                    </div>
                    {!isCollapsed && <span>Reports</span>}
                    {!isCollapsed && (
                        <i className={`fa ${isReportActive ? "fa-angle-down" : "fa-angle-right"} chevron-icon`}></i>
                    )}
                </Link>
                <ul
                    className="submenu-list"
                    style={{ display: isReportActive ? "block" : "none" }}
                >
                    <li><Link to="/appointment-conversion" className={location.pathname === "/appointment-conversion" ? "active" : ""}>Appointment Conversion</Link></li>
                    <li><Link to="/billing-reports" className={location.pathname === "/billing-reports" ? "active" : ""}>Billing Report</Link></li>
                    <li><Link to="/birthday-alert" className={location.pathname === "/birthday-alert" ? "active" : ""}>Birthday Alert</Link></li>
                    {/* <li><Link to="/cash-deposit-report" className={location.pathname === "/cash-deposit-report" ? "active" : ""}>Cash Deposit Report</Link></li> */}
                    <li><Link to="/condition-wise-report" className={location.pathname === "/condition-wise-report" ? "active" : ""}>Condition Wise Report</Link></li>
                    <li><Link to="/daily-expense-report" className={location.pathname === "/daily-expense-report" ? "active" : ""}>Daily Expense Report</Link></li>
                    <li><Link to="/daily-opd-report" className={location.pathname === "/daily-opd-report" ? "active" : ""}>Daily OPD Report</Link></li>
                    <li><Link to="/enquiry-conversion" className={location.pathname === "/enquiry-conversion" ? "active" : ""}>Enquiry Conversion</Link></li>
                    <li><Link to="/enquiry-data" className={location.pathname === "/enquiry-data" ? "active" : ""}>Enquiry Data</Link></li>
                    <li><Link to="/lost-lead-report" className={location.pathname === "/lost-lead-report" ? "active" : ""}>Lost Lead Report</Link></li>
                    <li><Link to="/opd-ipd-coll-graph" className={location.pathname === "/opd-ipd-coll-graph" ? "active" : ""}>OPD + IPD Collection Graph</Link></li>
                    <li><Link to="/opd-ipd-collection" className={location.pathname === "/opd-ipd-collection" ? "active" : ""}>OPD + IPD Collection Report</Link></li>
                    <li><Link to="/opd-collection-reports" className={location.pathname === "/opd-collection-reports" ? "active" : ""}>OPD Collection Report</Link></li>
                    <li><Link to="/opd-receipts-report" className={location.pathname === "/opd-receipts-report" ? "active" : ""}>OPD Receipts Report</Link></li>
                    <li><Link to="/pharmacy-collection-report" className={location.pathname === "/pharmacy-collection-report" ? "active" : ""}>Pharmacy Collection Report</Link></li>
                    <li><Link to="/reference-report" className={location.pathname === "/reference-report" ? "active" : ""}>Reference Report</Link></li>
                    <li><Link to="/sx-conversion-report" className={location.pathname === "/sx-conversion-report" ? "active" : ""}>SX Conversion Report</Link></li>
                </ul>
            </li>
        </ul>
    );
};

export default ReceptionSidebar;
