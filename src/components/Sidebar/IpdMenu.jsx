import React from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";

const IpdMenu = ({ activeIndex, isCollapsed }) => {
    return (
        <ul>
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
};

export default IpdMenu;
