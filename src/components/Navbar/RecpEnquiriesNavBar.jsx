import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Badge,
  ProgressBar,
  Button,
  Table,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import PageBreadcrumb from "../PageBreadcrumb";
import IvrEnquiryList from "../../pages/Reception/IvrEnquiryList";
import WebEnquiryList from "../../pages/Reception/WebEnquiryList";
import ChatbotEnquiryList from "../../pages/Reception/ChatbotEnquiryList";
import UnattendedEnquiryList from "../../pages/Reception/UnattendedEnquiryList";
import EnquiryList from "../../pages/Reception/EnquiryList";
import AddEnquiry from "../../pages/Reception/AddEnquiry";
import "../../styles/styles.css";

export default function RecpEnquiriesNavBar() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "ivr");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const getBreadcrumbName = () => {
    switch (activeTab) {
      case "ivr":
        return "IVR Enquiry List";
      case "chatbot":
        return "Chatbot Enquiry List";
      case "web":
        return "Web Enquiry List";
      case "enquiryList":
        return "Enquiry List";
      case "addEnquiry":
        return "Add Enquiry";
      case "unattended":
        return "Unattended Enquiry List";
      default:
        return "Enquiries";
    }
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <PageBreadcrumb pagename={getBreadcrumbName()} />

      {/* Tabs Navigation Container */}
      <Container fluid className="px-0" style={{ marginTop: "10px" }}>
        <Row className="mb-3">
          <Col>
            <div className="navbar-container" style={{ border: "1.5px solid #00bcd4", margin: "0 10px", background: "rgba(255, 255, 255, 0.95)" }}>
              <div className="navbar-content">
                <nav className="breadcrumb-nav" style={{ width: "100%", display: "flex", justifyContent: "flex-start", gap: "20px" }}>
                  <button
                    onClick={() => setActiveTab("ivr")}
                    className={`nav-link ${activeTab === "ivr" ? "active" : ""}`}
                  >
                    <span className="nav-icon">📞</span>
                    IVR Enquiries
                  </button>
                  <span className="separator">•</span>
                  <button
                    onClick={() => setActiveTab("chatbot")}
                    className={`nav-link ${activeTab === "chatbot" ? "active" : ""}`}
                  >
                    <span className="nav-icon">💬</span>
                    Chatbot Enquiries
                  </button>
                  <span className="separator">•</span>
                  <button
                    onClick={() => setActiveTab("web")}
                    className={`nav-link ${activeTab === "web" ? "active" : ""}`}
                  >
                    <span className="nav-icon">🌐</span>
                    Web Enquiries
                  </button>
                  <span className="separator">•</span>
                  <button
                    onClick={() => setActiveTab("enquiryList")}
                    className={`nav-link ${activeTab === "enquiryList" ? "active" : ""}`}
                  >
                    <span className="nav-icon">📋</span>
                    Enquiry List
                  </button>
                  <span className="separator">•</span>
                  <button
                    onClick={() => setActiveTab("addEnquiry")}
                    className={`nav-link ${activeTab === "addEnquiry" ? "active" : ""}`}
                  >
                    <span className="nav-icon">➕</span>
                    Add Enquiry
                  </button>
                  <span className="separator">•</span>
                  <button
                    onClick={() => setActiveTab("unattended")}
                    className={`nav-link ${activeTab === "unattended" ? "active" : ""}`}
                  >
                    <span className="nav-icon">⚠️</span>
                    Unattended Enquiries
                  </button>
                </nav>
              </div>
            </div>
          </Col>
        </Row>

        {/* Tab Contents */}
        <Row>
          <Col>
            {activeTab === "ivr" && (
              <div style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                <IvrEnquiryList isTab={true} />
              </div>
            )}

            {activeTab === "chatbot" && (
              <ChatbotEnquiryList isTab={true} />
            )}

            {activeTab === "web" && (
              <WebEnquiryList isTab={true} />
            )}

            {activeTab === "unattended" && (
              <UnattendedEnquiryList isTab={true} />
            )}

            {activeTab === "enquiryList" && (
              <div style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                <EnquiryList isTab={true} />
              </div>
            )}

            {activeTab === "addEnquiry" && (
              <div style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                <AddEnquiry isTab={true} />
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .navbar-container {
          background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
          padding: 10px 12px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin: 15px 22px 22px 22px;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          font-weight: 500;
          font-size: 14px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          color: #000000ff;
          padding: 8px 10px;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .nav-icon {
          font-size: 16px;
          opacity: 0.8;
          display: flex;
          align-items: center;
        }

        .nav-link:hover {
          background-color: #ffffff;
          color: #1a73e8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .nav-link:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .separator {
          color: #888888ff;
          font-size: 12px;
          margin: 4px;
        }

        .nav-link.active {
          background-color: #ffffff;
          color: #1a73e8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          position: relative;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 3px;
          background-color: #1a73e8;
          border-radius: 2px;
        }

        .nav-link.active .nav-icon {
          opacity: 1;
        }

        .nav-link.active:hover {
          transform: none;
        }

        @media (max-width: 768px) {
          .nav-link.active::after {
            width: 60%;
          }
          .breadcrumb-nav {
            justify-content: center;
            gap: 6px;
          }
          .nav-link {
            padding: 6px 10px;
            font-size: 13px;
          }
        }
        @media (max-width: 480px) {
          .nav-icon {
            display: none;
          }
          .nav-link {
            padding: 4px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
