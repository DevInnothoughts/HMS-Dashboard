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
    const dashboardPath = department === "IPD" ? "/doctor-ipd-dashboard" : "/doctor-opd-dashboard";
    const doctorReportRoutes = ["/diagnosis-report", "/opd-surgery-report"];
    const isDoctorReportActive = doctorReportRoutes.includes(location.pathname) || activeIndex === "/manage-doctor-reports";

    return (
        <ul>
            <li className={`menu-item ${activeIndex === dashboardPath ? "active" : ""}`}>
                <Link to={dashboardPath}>
                    <div className="icon-item">
                        <FeatherIcon icon="home" />
                    </div>
                    <span>Doctor Dashboard</span>
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

            <li className={`menu-item ${activeIndex === "/doctor-patients" ? "active" : ""}`}>
                <Link to="/doctor-patients">
                    <div className="icon-item">
                        <FeatherIcon icon="users" />
                    </div>
                    <span>Patient</span>
                </Link>
            </li>

            <li className={`menu-item ${isDoctorReportActive ? "active" : ""}`}>
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
