import React, { useState, useEffect } from "react";
import moment from "moment";
import { Container, Row, Col, Card, Form, Button, Modal, Spinner } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";

const BASE_URL = "http://194.195.117.79:5100/api";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export default function CallingCalendar() {
  const [currentLocation, setCurrentLocation] = useState("default");
  const [selectedView, setSelectedView] = useState("dashboard"); // "dashboard" or "advised"
  const [selectedType, setSelectedType] = useState(""); // "Surgery", "Medication", "Test", "Dischargecard"
  const [selectedDays, setSelectedDays] = useState(3); // 3, 7, 15, 30, 0
  const [fromDate, setFromDate] = useState(moment().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedRecordType, setSelectedRecordType] = useState("");
  const [noteComment, setNoteComment] = useState("");
  const [callbackDate, setCallbackDate] = useState(moment().format("YYYY-MM-DD"));
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch Location from JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Advised Data from API
  const fetchAdvisedData = async (type, days, baseDateStr = toDate) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/calling-calendar/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hms-location": currentLocation,
        },
        body: JSON.stringify({
          selected_date: baseDateStr,
          type: type,
          days: Number(days),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch records");
      }

      const resData = await response.json();
      if (resData.statusCode === 200 && resData.data) {
        setRecords(resData.data.records || []);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Error fetching advised data:", error);
      Toast.fire({
        icon: "error",
        title: "Error fetching records",
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdvised = (type) => {
    setSelectedType(type);
    setSelectedView("advised");
    setSelectedDays(3);
    fetchAdvisedData(type, 3);
  };

  const handleDayFilterChange = (days) => {
    setSelectedDays(days);
    fetchAdvisedData(selectedType, days);
  };

  const handleGoBack = () => {
    setSelectedView("dashboard");
    setRecords([]);
  };

  // Open modals
  const handleOpenNoteModal = (recordId, type) => {
    setSelectedRecordId(recordId);
    setSelectedRecordType(type);
    setNoteComment("");
    setShowNoteModal(true);
  };

  const handleOpenCallbackModal = (recordId, type) => {
    setSelectedRecordId(recordId);
    setSelectedRecordType(type);
    setCallbackDate(moment().format("YYYY-MM-DD"));
    setShowCallbackModal(true);
  };

  // Submit Note
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!noteComment.trim()) {
      Swal.fire("Warning", "Please enter the note details.", "warning");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/V1/calling-calendar/submitnote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hms-location": currentLocation,
        },
        body: JSON.stringify({
          comment: noteComment.trim(),
          id: selectedRecordId,
          type: selectedRecordType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      const resData = await response.json();
      if (resData.statusCode === 200) {
        setShowNoteModal(false);
        Toast.fire({
          icon: "success",
          title: "Note submitted successfully!",
        });
        // Refresh local data
        fetchAdvisedData(selectedType, selectedDays);
      } else {
        Swal.fire("Error", "Failed to save note.", "error");
      }
    } catch (error) {
      console.error("Error submitting note:", error);
      Swal.fire("Error", "Server error while saving note.", "error");
    }
  };

  // Submit Callback
  const handleSubmitCallback = async (e) => {
    e.preventDefault();
    if (!callbackDate) {
      Swal.fire("Warning", "Please select callback date.", "warning");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/V1/calling-calendar/submitcallback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hms-location": currentLocation,
        },
        body: JSON.stringify({
          CallBackdatepicker: callbackDate,
          id: selectedRecordId,
          type: selectedRecordType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save callback date");
      }

      const resData = await response.json();
      if (resData.statusCode === 200) {
        setShowCallbackModal(false);
        Toast.fire({
          icon: "success",
          title: "Callback date updated successfully!",
        });
        // Refresh local data
        fetchAdvisedData(selectedType, selectedDays);
      } else {
        Swal.fire("Error", "Failed to save callback date.", "error");
      }
    } catch (error) {
      console.error("Error submitting callback:", error);
      Swal.fire("Error", "Server error while saving callback date.", "error");
    }
  };

  // Excel Download
  const handleDownloadExcel = () => {
    const daysString = "3,7,15,30,0";
    const downloadUrl = `${BASE_URL}/V1/calling-calendar/download-excel?Frdate=${fromDate}&date=${toDate}&days=${daysString}&type=${selectedType}&location=${currentLocation}`;
    window.location.href = downloadUrl;
  };

  return (
    <>
      <div
        className="themebody-wrap"
        style={{
          background: "linear-gradient(to right, #e0f7fa, #80deea)",
          fontFamily: "'Poppins', Arial, sans-serif",
          minHeight: "100vh",
          padding: "10px",
        }}
      >
        <PageBreadcrumb pagename="Calling Calendar" />
        <div className="theme-body">
          <Container fluid style={{ padding: "0px" }}>
            {/* Date Filter Bar */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "28px",
                border: "1px solid #d4e8e3",
                boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#6b8f85", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FeatherIcon icon="filter" size={14} style={{ color: "#0f7b63" }} /> Date Range
              </span>
              <div style={{ position: "relative", flex: 1 }}>
                <FeatherIcon icon="calendar" size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#0f7b63" }} />
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{ paddingLeft: "36px", border: "1.5px solid #d4e8e3", borderRadius: "10px", backgroundColor: "#f7faf9" }}
                />
              </div>
              <span style={{ color: "#6b8f85", fontWeight: "600" }}>→</span>
              <div style={{ position: "relative", flex: 1 }}>
                <FeatherIcon icon="check-square" size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#0f7b63" }} />
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{ paddingLeft: "36px", border: "1.5px solid #d4e8e3", borderRadius: "10px", backgroundColor: "#f7faf9" }}
                />
              </div>
            </div>

            {/* Views */}
            {selectedView === "dashboard" ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <h2 style={{ fontWeight: "600", fontSize: "22px", fontFamily: "Syne, sans-serif", margin: 0 }}>Quick Actions</h2>
                  <span className="badge" style={{ fontSize: "11px", backgroundColor: "#c1e5ddff", color: "#0f7b63", padding: "4px 10px", borderRadius: "20px", fontWeight: "700" }}>OPD - IPD</span>
                </div>

                <Row className="g-4">
                  {/* Card 1: Surgery Advised */}
                  <Col xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => handleOpenAdvised("Surgery")}
                      onMouseEnter={() => setHoveredCard("Surgery")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        borderRadius: "16px",
                        border: "1.5px solid #d4e8e3",
                        boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        borderTop: "4px solid #e74c3c",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="hover-card-elevate"
                    >
                      <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                        <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#fdecea", display: "flex", alignItems: "center", justifyCenter: "center", color: "#e74c3c", fontSize: "22px", margin: "auto 0" }} className="d-flex align-items-center justify-content-center">
                          <i className="fa fa-stethoscope"></i>
                        </div>
                        <div>
                          <h5 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 4px 0" }}>Surgery Advised</h5>
                          <p style={{ fontSize: "12px", color: "#6b8f85", margin: 0 }}>View surgery recommendations</p>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: hoveredCard === "Surgery" ? "#e74c3c" : "#fdecea",
                            color: hoveredCard === "Surgery" ? "white" : "#e74c3c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: hoveredCard === "Surgery" ? "translateX(4px)" : "none",
                            boxShadow: hoveredCard === "Surgery" ? "0 4px 10px rgba(231,76,60,0.3)" : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 2: Medication Advised */}
                  <Col xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => handleOpenAdvised("Medication")}
                      onMouseEnter={() => setHoveredCard("Medication")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        borderRadius: "16px",
                        border: "1.5px solid #d4e8e3",
                        boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        borderTop: "4px solid #2980b9",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="hover-card-elevate"
                    >
                      <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                        <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#eaf3fb", display: "flex", alignItems: "center", justifyCenter: "center", color: "#2980b9", fontSize: "22px" }} className="d-flex align-items-center justify-content-center">
                          <i className="fa fa-medkit"></i>
                        </div>
                        <div>
                          <h5 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 4px 0" }}>Medication Advised</h5>
                          <p style={{ fontSize: "12px", color: "#6b8f85", margin: 0 }}>Track prescribed medications</p>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: hoveredCard === "Medication" ? "#2980b9" : "#eaf3fb",
                            color: hoveredCard === "Medication" ? "white" : "#2980b9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: hoveredCard === "Medication" ? "translateX(4px)" : "none",
                            boxShadow: hoveredCard === "Medication" ? "0 4px 10px rgba(41,128,185,0.3)" : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 3: Test Advised */}
                  <Col xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => handleOpenAdvised("Test")}
                      onMouseEnter={() => setHoveredCard("Test")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        borderRadius: "16px",
                        border: "1.5px solid #d4e8e3",
                        boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        borderTop: "4px solid #f39c12",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="hover-card-elevate"
                    >
                      <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                        <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#fef6e6", display: "flex", alignItems: "center", justifyCenter: "center", color: "#f39c12", fontSize: "22px" }} className="d-flex align-items-center justify-content-center">
                          <i className="fa fa-flask"></i>
                        </div>
                        <div>
                          <h5 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 4px 0" }}>Test Advised</h5>
                          <p style={{ fontSize: "12px", color: "#6b8f85", margin: 0 }}>Diagnostic tests overview</p>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: hoveredCard === "Test" ? "#f39c12" : "#fef6e6",
                            color: hoveredCard === "Test" ? "white" : "#f39c12",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: hoveredCard === "Test" ? "translateX(4px)" : "none",
                            boxShadow: hoveredCard === "Test" ? "0 4px 10px rgba(243,156,18,0.3)" : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 4: Post-OP Calls */}
                  <Col xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => handleOpenAdvised("Dischargecard")}
                      onMouseEnter={() => setHoveredCard("Dischargecard")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        borderRadius: "16px",
                        border: "1.5px solid #d4e8e3",
                        boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        borderTop: "4px solid #8e44ad",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="hover-card-elevate"
                    >
                      <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                        <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#f4eef9", display: "flex", alignItems: "center", justifyCenter: "center", color: "#8e44ad", fontSize: "22px" }} className="d-flex align-items-center justify-content-center">
                          <i className="fa fa-phone"></i>
                        </div>
                        <div>
                          <h5 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 4px 0" }}>Post-OP Calls</h5>
                          <p style={{ fontSize: "12px", color: "#6b8f85", margin: 0 }}>Follow-up discharge calls</p>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: hoveredCard === "Dischargecard" ? "#8e44ad" : "#f4eef9",
                            color: hoveredCard === "Dischargecard" ? "white" : "#8e44ad",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: hoveredCard === "Dischargecard" ? "translateX(4px)" : "none",
                            boxShadow: hoveredCard === "Dischargecard" ? "0 4px 10px rgba(142,68,173,0.3)" : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 5: Enquiry Calls */}
                  <Col xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => handleOpenAdvised("Enquiry")}
                      onMouseEnter={() => setHoveredCard("Enquiry")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        borderRadius: "16px",
                        border: "1.5px solid #d4e8e3",
                        boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        borderTop: "4px solid #16a085",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="hover-card-elevate"
                    >
                      <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                        <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#e8f6f3", display: "flex", alignItems: "center", justifyCenter: "center", color: "#16a085", fontSize: "22px" }} className="d-flex align-items-center justify-content-center">
                          <i className="fa fa-users"></i>
                        </div>
                        <div>
                          <h5 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 4px 0" }}>Enquiry Calls</h5>
                          <p style={{ fontSize: "12px", color: "#6b8f85", margin: 0 }}>Follow-up appointment enquiries</p>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: hoveredCard === "Enquiry" ? "#16a085" : "#e8f6f3",
                            color: hoveredCard === "Enquiry" ? "white" : "#16a085",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: hoveredCard === "Enquiry" ? "translateX(4px)" : "none",
                            boxShadow: hoveredCard === "Enquiry" ? "0 4px 10px rgba(22,160,133,0.3)" : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            ) : (
              <div>
                {/* Header Toolbar */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "10px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "20px",
                    border: "1px solid #d4e8e3",
                    boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                  }}
                >
                  <Button
                    onClick={handleGoBack}
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      backgroundColor: "#0f7b63",
                      border: "none",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(15,123,99,0.2)",
                    }}
                    title="Go Back to Dashboard"
                  >
                    <i className="fa fa-arrow-left" style={{ fontSize: "16px" }}></i>
                  </Button>
                  <h3 style={{ margin: 0, flex: 1, fontFamily: "Syne, sans-serif", fontSize: "18px", fontWeight: "700" }}>
                    {selectedType === "Dischargecard" ? "Post-OP Calls" : selectedType === "Enquiry" ? "Enquiry Follow-up Calls" : `${selectedType} Advised (OPD)`}
                  </h3>
                  <Button
                    onClick={handleDownloadExcel}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "9px 18px",
                      background: "linear-gradient(135deg, #0f7b63, #1aab8a)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "600",
                      fontSize: "13px",
                      boxShadow: "0 4px 12px rgba(15,123,99,0.3)",
                    }}
                  >
                    <i className="fa fa-file-excel"></i> Download Excel
                  </Button>
                </div>

                {/* Days Filter Tabs */}
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "6px",
                    display: "inline-flex",
                    gap: "4px",
                    marginBottom: "24px",
                    border: "1px solid #d4e8e3",
                    boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                  }}
                >
                  <Button
                    onClick={() => handleDayFilterChange(3)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 3 ? "white" : "#6b8f85",
                      background: selectedDays === 3 ? "linear-gradient(135deg, #0f7b63, #1aab8a)" : "none",
                      boxShadow: selectedDays === 3 ? "0 4px 12px rgba(15,123,99,0.28)" : "none",
                    }}
                  >
                    3 Days
                  </Button>
                  <Button
                    onClick={() => handleDayFilterChange(7)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 7 ? "white" : "#6b8f85",
                      background: selectedDays === 7 ? "linear-gradient(135deg, #0f7b63, #1aab8a)" : "none",
                      boxShadow: selectedDays === 7 ? "0 4px 12px rgba(15,123,99,0.28)" : "none",
                    }}
                  >
                    7 Days
                  </Button>
                  <Button
                    onClick={() => handleDayFilterChange(15)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 15 ? "white" : "#6b8f85",
                      background: selectedDays === 15 ? "linear-gradient(135deg, #0f7b63, #1aab8a)" : "none",
                      boxShadow: selectedDays === 15 ? "0 4px 12px rgba(15,123,99,0.28)" : "none",
                    }}
                  >
                    15 Days
                  </Button>
                  <Button
                    onClick={() => handleDayFilterChange(30)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 30 ? "white" : "#6b8f85",
                      background: selectedDays === 30 ? "linear-gradient(135deg, #0f7b63, #1aab8a)" : "none",
                      boxShadow: selectedDays === 30 ? "0 4px 12px rgba(15,123,99,0.28)" : "none",
                    }}
                  >
                    30 Days
                  </Button>
                  <Button
                    onClick={() => handleDayFilterChange(0)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 0 ? "white" : "#6b8f85",
                      background: selectedDays === 0 ? "linear-gradient(135deg, #0f7b63, #1aab8a)" : "none",
                      boxShadow: selectedDays === 0 ? "0 4px 12px rgba(15,123,99,0.28)" : "none",
                    }}
                  >
                    Call Back
                  </Button>
                </div>

                {/* Records List */}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="success" className="mb-2" />
                    <p style={{ color: "#6b8f85", margin: 0 }}>Fetching records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "16px",
                      padding: "60px 24px",
                      textAlign: "center",
                      border: "1.5px dashed #d4e8e3",
                      color: "#6b8f85",
                    }}
                  >
                    <i className="fa fa-folder-open mb-3" style={{ fontSize: "40px", color: "#d4e8e3" }}></i>
                    <p style={{ fontSize: "15px", fontWeight: "500", margin: 0 }}>No records available</p>
                  </div>
                ) : (
                  <div>
                    {/* Result Title Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #d4e8e3", paddingBottom: "10px", marginBottom: "5px", paddingLeft: "15px", paddingRight: "15px" }}>
                      <div style={{ width: "25%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Patient Details</div>
                      <div style={{ width: "35%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Diagnosis</div>
                      <div style={{ width: "30%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Action Taken</div>
                      <div style={{ width: "10%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase", textAlign: "right" }}>Actions</div>
                    </div>

                    {/* Grid Lists */}
                    {records.map((row) => {
                      const recordId = selectedType === "Dischargecard" ? row.discharge_id : selectedType === "Enquiry" ? row.id : row.diag_id;
                      let parsedNotes = [];
                      if (row.calling_notes) {
                        try {
                          parsedNotes = JSON.parse(row.calling_notes);
                          if (!Array.isArray(parsedNotes)) {
                            parsedNotes = [];
                          }
                        } catch (e) {
                          parsedNotes = [];
                        }
                      }

                      return (
                        <Card
                          key={recordId}
                          style={{
                            borderRadius: "16px",
                            border: "1.5px solid #d4e8e3",
                            boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                            marginBottom: "16px",
                          }}
                        >
                          <Card.Body className="p-4">
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start" }}>
                              {/* Patient Details */}
                              <div style={{ width: "25%", padding: "5px" }}>
                                <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#1a2b26", textTransform: "uppercase" }}>
                                  {row.name || "Unknown Patient"}
                                  <br /><span style={{ fontSize: "13px", color: "#4f6961ff" }}>{row.phone || "-"}</span>
                                </p>
                              </div>

                              {/* Diagnosis */}
                              <div style={{ width: "35%", paddingRight: "12px", fontSize: "14px", fontWeight: "600", color: "#1a2b26", textTransform: "uppercase" }}>
                                {row.diagnosis || "-"}
                              </div>

                              {/* Action Taken (Calling Notes) */}
                              <div style={{ width: "30%", paddingRight: "12px" }}>
                                {parsedNotes.length === 0 ? (
                                  <span style={{ color: "#6b8f85", fontSize: "13px" }}>No calling notes added yet.</span>
                                ) : (
                                  parsedNotes.map((note, index) => {
                                    const formattedNoteDate = note.date
                                      ? moment(note.date).format("DD/MM/YYYY")
                                      : "";
                                    return (
                                      <div key={index} style={{ marginBottom: "10px" }}>
                                        <p style={{ margin: "0 0 2px 0", fontSize: "12px", fontWeight: "700", color: "#0f7b63" }}>
                                          {formattedNoteDate}
                                        </p>
                                        <span style={{ fontSize: "13px", color: "#1a2b26" }}>
                                          {index + 1}. {note.note}
                                        </span>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Actions */}
                              <div style={{ width: "10%", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                <Button
                                  onClick={() => handleOpenNoteModal(recordId, selectedType)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "36px",
                                    height: "36px",
                                    backgroundColor: "#0f7b63",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "white",
                                    padding: 0,
                                    boxShadow: "0 2px 6px rgba(15,123,99,0.15)",
                                  }}
                                  title="Add Note"
                                >
                                  <FeatherIcon icon="edit-3" size={14} stroke="white" style={{ color: "white", stroke: "white" }} />
                                </Button>
                                <Button
                                  onClick={() => handleOpenCallbackModal(recordId, selectedType)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "36px",
                                    height: "36px",
                                    backgroundColor: "#0f7b63",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "white",
                                    padding: 0,
                                    boxShadow: "0 2px 6px rgba(15,123,99,0.15)",
                                  }}
                                  title="Add Callback Date"
                                >
                                  <FeatherIcon icon="calendar" size={14} stroke="white" style={{ color: "white", stroke: "white" }} />
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Container>
        </div>
      </div>

      {/* Note submission Modal */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", fontWeight: "700" }}>Add Note</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitNote}>
          <Modal.Body className="pt-0">
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={4}
                value={noteComment}
                onChange={(e) => setNoteComment(e.target.value)}
                placeholder="Enter your note or remarks here..."
                style={{
                  border: "1.5px solid #d4e8e3",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "13px",
                  backgroundColor: "#f7faf9",
                }}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "none" }}>
            <Button
              type="submit"
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #0f7b63, #1aab8a)",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(15,123,99,0.28)",
              }}
            >
              Submit Note
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Callback Date submission Modal */}
      <Modal show={showCallbackModal} onHide={() => setShowCallbackModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", fontWeight: "700" }}>Add CallBack Date</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitCallback}>
          <Modal.Body className="pt-0">
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                value={callbackDate}
                onChange={(e) => setCallbackDate(e.target.value)}
                style={{
                  border: "1.5px solid #d4e8e3",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "13px",
                  backgroundColor: "#f7faf9",
                }}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "none" }}>
            <Button
              type="submit"
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #0f7b63, #1aab8a)",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(15,123,99,0.28)",
              }}
            >
              Submit Date
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
