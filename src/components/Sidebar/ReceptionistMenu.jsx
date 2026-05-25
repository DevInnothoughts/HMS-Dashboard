import React from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { FaFileInvoiceDollar } from "react-icons/fa";

const ReceptionistMenu = ({
    activeIndex,
    handleMenuClick,
    isCollapsed,
    location
}) => {
    const reportRoutes = [
        "/appointmentConversion", "/BillingReport", "/BirthdayAlert", "/cashDepositReport", "/conditionWiseReport",
        "/dailyOPDReport", "/enquiryConversation", "/enquiryData", "/insuranceduereport",
        "/IPDCollectionReport", "/ipdduereport", "/opdipdcollgraph", "/opdipdcollection",
        "/OPDCollectionReports", "/oPDReceiptsReport", "/PharmacyCollectionReport",
        "/referenceReport", "/sxconversionreport"
    ];
    const isReportActive = reportRoutes.includes(location.pathname) || activeIndex === "/manage-reports";

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
                        {localStorage.getItem("accountType") || "Receptionist"}
                    </span>
                </li>
            )}
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
                        <i className="fa fa-user"></i>
                    </div>
                    {!isCollapsed && <span>Patients</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/leads" || location.pathname === "/leads" ? "active" : ""}`}>
                <Link to="/leads">
                    <div className="icon-item">
                        <i className="fa fa-bar-chart"></i>
                    </div>
                    {!isCollapsed && <span>Enquiries</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/calling-calendar" ? "active" : ""}`}>
                <Link to="/calling-calendar">
                    <div className="icon-item">
                        <i className="fa fa-phone-square"></i>
                    </div>
                    {!isCollapsed && <span>Calling Calendar</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/appointments" ? "active" : ""}`}>
                <Link to="/appointments">
                    <div className="icon-item">
                        <i className="fa fa-calendar"></i>
                    </div>
                    {!isCollapsed && <span>Appointments</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/invoices" ? "active" : ""}`}>
                <Link to="/invoices">
                    <div className="icon-item">
                        <FeatherIcon icon="file-text" />
                    </div>
                    {!isCollapsed && <span>IPD Bills</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/invoices/payment-data" ? "active" : ""}`}>
                <Link to="/invoices/payment-data">
                    <div className="icon-item">
                        <FaFileInvoiceDollar />
                    </div>
                    {!isCollapsed && <span>IPD Payment Data</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/reports/receipts" ? "active" : ""}`}>
                <Link to="/reports/receipts">
                    <div className="icon-item">
                        <FeatherIcon icon="file-text" />
                    </div>
                    {!isCollapsed && <span>OPD Receipts</span>}
                </Link>
            </li>


            <li className={`menu-item ${activeIndex === "/daily-closing" ? "active" : ""}`}>
                <Link to="/daily-closing">
                    <div className="icon-item">
                        <i className="fa fa-money"></i>
                    </div>
                    {!isCollapsed && <span>Daily closing</span>}
                </Link>
            </li>

            <li className={`menu-item ${activeIndex === "/bed-allotment" ? "active" : ""}`}>
                <Link to="/bed-allotment">
                    <div className="icon-item">
                        <i className="fa fa-bed"></i>
                    </div>
                    {!isCollapsed && <span>Bed Allotment</span>}
                </Link>
            </li>

            <li className={`menu-item ${isReportActive ? "active" : ""}`}>
                <Link to="#" onClick={() => handleMenuClick("/manage-reports")}>
                    <div className="icon-item">
                        <i className="fa fa-list-alt"></i>
                    </div>
                    {!isCollapsed && <span>Reports</span>}
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
};

export default ReceptionistMenu;
