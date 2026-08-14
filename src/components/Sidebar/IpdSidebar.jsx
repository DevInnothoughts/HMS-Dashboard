import React from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";

const IpdSidebar = ({ activeIndex, handleMenuClick, isCollapsed, location }) => {
    const reportRoutes = [
        "/billing-reports", "/insurance-due-report", "/ipd-collection-report", "/ipd-due-report",
        "/opd-ipd-coll-graph", "/opd-ipd-collection"
    ];
    const isReportActive = location
        ? (reportRoutes.includes(location.pathname) || activeIndex === "/manage-reports")
        : false;

    return (
        <ul className="sidebar-menu-list">
            {/* Role Badge */}
            {!isCollapsed && (
                <li style={{ listStyle: 'none', marginBottom: '4px', textAlign: 'center' }}>
                    <div className="role-badge">
                        <div className="role-badge-icon">
                            <i className="fa fa-hospital-o"></i>
                        </div>
                        <div className="role-badge-text">
                            <span className="role-badge-name">IPD Panel</span>
                        </div>
                    </div>
                </li>
            )}

            {/* Dashboard */}
            <li className={`menu-item ${activeIndex === "/ipd-dashboard" ? "active" : ""}`}>
                <Link to="/ipd-dashboard" data-label="Dashboard">
                    <div className="icon-wrap"><FeatherIcon icon="grid" /></div>
                    {!isCollapsed && <span>Dashboard</span>}
                </Link>
            </li>

            {/* Patients */}
            <li className={`menu-item ${activeIndex === "/ipd-patient-list" ? "active" : ""}`}>
                <Link to="/ipd-patient-list" data-label="Patients">
                    <div className="icon-wrap"><i className="fa fa-user"></i></div>
                    {!isCollapsed && <span>Patients</span>}
                </Link>
            </li>



            {/* Admissions */}
            <li className={`menu-item ${activeIndex === "/ipd-admission-list" ? "active" : ""}`}>
                <Link to="/ipd-admission-list" data-label="Admissions">
                    <div className="icon-wrap"><FeatherIcon icon="clipboard" /></div>
                    {!isCollapsed && <span>Admissions</span>}
                </Link>
            </li>

            {/* IPD Bills */}
            <li className={`menu-item ${activeIndex === "/ipd-bill-list" ? "active" : ""}`}>
                <Link to="/ipd-bill-list" data-label="IPD Bills">
                    <div className="icon-wrap"><FeatherIcon icon="file" /></div>
                    {!isCollapsed && <span>IPD Bills</span>}
                </Link>
            </li>



            {/* Bed Allotment */}
            <li className={`menu-item ${activeIndex === "/bed-allotment-list" ? "active" : ""}`}>
                <Link to="/bed-allotment-list" data-label="Bed Allotment">
                    <div className="icon-wrap"><i className="fa fa-bed"></i></div>
                    {!isCollapsed && <span>Bed Allotment</span>}
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
                    <li>
                        <Link
                            to="/billing-reports"
                            className={location?.pathname === "/billing-reports" ? "active" : ""}
                        >
                            Billing Report
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/insurance-due-report"
                            className={location?.pathname === "/insurance-due-report" ? "active" : ""}
                        >
                            Insurance Due Report
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/ipd-collection-report"
                            className={location?.pathname === "/ipd-collection-report" ? "active" : ""}
                        >
                            IPD Collection Report
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/ipd-due-report"
                            className={location?.pathname === "/ipd-due-report" ? "active" : ""}
                        >
                            IPD Due Report
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/opd-ipd-coll-graph"
                            className={location?.pathname === "/opd-ipd-coll-graph" ? "active" : ""}
                        >
                            OPD + IPD Collection Graph
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/opd-ipd-collection"
                            className={location?.pathname === "/opd-ipd-collection" ? "active" : ""}
                        >
                            OPD + IPD Collection Report
                        </Link>
                    </li>
                </ul>
            </li>
        </ul>
    );
};

export default IpdSidebar;
