import React from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";

const DoctorMenu = ({
    activeIndex,
    handleMenuClick,
    isCollapsed,
    location,
    department
}) => {
    const dashboardPath = "/doctor-dashboard";
    const doctorReportRoutes = ["/diagnosis-report", "/opd-surgery-report"];
    const isDoctorReportActive = doctorReportRoutes.includes(location.pathname) || activeIndex === "/manage-doctor-reports";

    return (
        <ul>
            {!isCollapsed && (
                <li style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <span
                        style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#2a96d0ff",
                            background: "rgba(26, 110, 124, 0.14)",
                            padding: "5px 12px",
                            borderRadius: "10px",
                            border: "1px solid #2a96d087",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "85%",
                            gap: "8px",
                        }}
                    >
                        <i className="fa fa-user-circle-o" style={{ fontSize: "14px", color: "#2a96d0ff" }}></i>
                        {localStorage.getItem("accountType") || "Doctor"}
                    </span>
                </li>
            )}
            <li className={`menu-item ${activeIndex === dashboardPath ? "active" : ""}`}>
                <Link to={dashboardPath}>
                    <div className="icon-item">
                        <FeatherIcon icon="grid" />
                    </div>
                    <span>Dashboard</span>
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/doctor-search-by" ? "active" : ""}`}>
                <Link to="/doctor-search-by">
                    <div className="icon-item">
                        <i className="fa fa-search"></i>
                    </div>
                    {!isCollapsed && <span>Search By</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/doctor-manage-admission" ? "active" : ""}`}>
                <Link to="/doctor-manage-admission">
                    <div className="icon-item">
                        <i className="fa fa-hospital-o"></i>
                    </div>
                    {!isCollapsed && <span>Manage Admission</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/doctor-calling-calendar" ? "active" : ""}`}>
                <Link to="/doctor-calling-calendar">
                    <div className="icon-item">
                        <i className="fa fa-calendar-check-o"></i>
                    </div>
                    {!isCollapsed && <span>Calling Calendar</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/doctor-patients" ? "active" : ""}`}>
                <Link to="/doctor-patients">
                    <div className="icon-item">
                        <i className="fa fa-user"></i>
                    </div>
                    <span>OPD Patients</span>
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/doctor-ipd-patients" ? "active" : ""}`}>
                <Link to="/doctor-ipd-patients">
                    <div className="icon-item">
                       <i className="fa fa-user"></i>
                    </div>
                    <span>IPD Patients</span>
                </Link>
            </li>

            <li className={`menu-item ${isDoctorReportActive ? "active" : ""}`}>
                <Link to="#" onClick={() => handleMenuClick("/manage-doctor-reports")}>
                    <div className="icon-item">
                        <FeatherIcon icon="file-text" />
                    </div>
                    <span>Reports</span>
                    <i className={`fa ${isDoctorReportActive ? "fa-angle-down" : "fa-angle-right"}`}></i>
                </Link>
                <ul
                    className="submenu-list"
                    style={{
                        display: isDoctorReportActive ? "block" : "none",
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
};

export default DoctorMenu;
