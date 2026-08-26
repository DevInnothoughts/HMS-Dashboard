import React from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";

const DoctorSidebar = ({
    activeIndex,
    handleMenuClick,
    isCollapsed,
    location,
    department
}) => {
    const dashboardPath = "/doctor-dashboard";
    const doctorReportRoutes = ["/diagnosis-report", "/doctor-performance-report", "/follow-up-compliance-report", "/patient-feedback-report", "/doctor-pending-surgery-report", "/sx-conversion-report"];
    const isDoctorReportActive = doctorReportRoutes.includes(location.pathname) || activeIndex === "/manage-doctor-reports";

    return (
        <ul className="sidebar-menu-list">
            {/* Role Badge */}
            {!isCollapsed && (
                <li style={{ listStyle: 'none', marginBottom: '4px', textAlign: 'center' }}>
                    <div className="role-badge">
                        <div className="role-badge-icon">
                            <i className="fa fa-user-md"></i>
                        </div>
                        <div className="role-badge-text">
                            <span className="role-badge-name">Doctor Panel</span>
                        </div>
                    </div>
                </li>
            )}

            {/* Dashboard */}
            <li className={`menu-item ${activeIndex === dashboardPath ? "active" : ""}`}>
                <Link to={dashboardPath} data-label="Dashboard">
                    <div className="icon-wrap">
                        <FeatherIcon icon="grid" />
                    </div>
                    <span>Dashboard</span>
                </Link>
            </li>

            {/* Calling Calendar */}
            <li className={`menu-item ${activeIndex === "/doctor-calling-calendar" ? "active" : ""}`}>
                <Link to="/doctor-calling-calendar" data-label="Calling Calendar">
                    <div className="icon-wrap">
                        <i className="fa fa-calendar-check-o"></i>
                    </div>
                    {!isCollapsed && <span>Calling Calendar</span>}
                </Link>
            </li>

            {/* OPD Patients */}
            <li className={`menu-item ${activeIndex === "/doctor-opd-patient-list" ? "active" : ""}`}>
                <Link to="/doctor-opd-patient-list" data-label="OPD Patients">
                    <div className="icon-wrap">
                        <i className="fa fa-user"></i>
                    </div>
                    <span>OPD Patients</span>
                </Link>
            </li>

            {/* IPD Patients */}
            <li className={`menu-item ${activeIndex === "/doctor-ipd-patient-list" ? "active" : ""}`}>
                <Link to="/doctor-ipd-patient-list" data-label="IPD Patients">
                    <div className="icon-wrap">
                        <i className="fa fa-user"></i>
                    </div>
                    <span>IPD Patients</span>
                </Link>
            </li>

            {/* Reports (dropdown) */}
            <li className={`menu-item ${isDoctorReportActive ? "active" : ""}`}>
                <Link to="#" onClick={() => handleMenuClick("/manage-doctor-reports")} data-label="Reports">
                    <div className="icon-wrap">
                        <FeatherIcon icon="file-text" />
                    </div>
                    <span>Reports</span>
                    <i className={`fa ${isDoctorReportActive ? "fa-angle-down" : "fa-angle-right"} chevron-icon`}></i>
                </Link>
                <ul
                    className="submenu-list"
                    style={{ display: isDoctorReportActive ? "block" : "none" }}
                >
                    <li>
                        <Link
                            to="/diagnosis-report"
                            className={location.pathname === "/diagnosis-report" ? "active" : ""}
                        >
                            Diagnosis Report
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/doctor-performance-report"
                            className={location.pathname === "/doctor-performance-report" ? "active" : ""}
                        >
                            Doctor Performance Report
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/follow-up-compliance-report"
                            className={location.pathname === "/follow-up-compliance-report" ? "active" : ""}
                        >
                            Follow-up Compliance Report
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/patient-feedback-report"
                            className={location.pathname === "/patient-feedback-report" ? "active" : ""}
                        >
                            Patient Feedback / NPS Report
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/doctor-pending-surgery-report"
                            className={location.pathname === "/doctor-pending-surgery-report" ? "active" : ""}
                        >
                            Pending Surgery Report
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/sx-conversion-report"
                            className={location.pathname === "/sx-conversion-report" ? "active" : ""}
                        >
                            SX Conversion Report
                        </Link>
                    </li>
                </ul>
            </li>
        </ul>
    );
};

export default DoctorSidebar;
