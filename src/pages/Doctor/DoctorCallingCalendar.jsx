import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Spinner,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { decodeJwt } from "../Utility/decode-jwt";
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

export default function DoctorCallingCalendar() {
  const [currentLocation, setCurrentLocation] = useState("default");
  const [selectedView, setSelectedView] = useState("dashboard"); // "dashboard" or "advised"
  const [selectedType, setSelectedType] = useState(""); // "Surgery", "Medication", "Test", "Dischargecard"
  const [selectedDays, setSelectedDays] = useState(3); // 3, 7, 15, 30, 0
  const [fromDate, setFromDate] = useState(moment().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
  const [records, setRecords] = useState([]);
  const [noNotesRecords, setNoNotesRecords] = useState([]);
  const [mcdpaData, setMcdpaData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedRecordType, setSelectedRecordType] = useState("");
  const [noteComment, setNoteComment] = useState("");
  const [callbackDate, setCallbackDate] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [cardCounts, setCardCounts] = useState({
    Surgery: { toBeCalled: 0, pending: 0, called: 0 },
    Medication: { toBeCalled: 0, pending: 0, called: 0 },
    Test: { toBeCalled: 0, pending: 0, called: 0 },
    Dischargecard: { toBeCalled: 0, pending: 0, called: 0 },
    MCDPA: { toBeCalled: 0, pending: 0, called: 0 },
  });

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

  const fetchTodayCounts = async () => {
    if (!currentLocation || currentLocation === "default") return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/calling-calendar/today-counts?_t=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "x-hms-location": currentLocation,
          },
        }
      );
      if (response.ok) {
        const resData = await response.json();
        if (resData.statusCode === 200 && resData.data) {
          setCardCounts(resData.data);
        }
      }
    } catch (err) {
      console.error("Error fetching doctor calling counts:", err);
    }
  };

  useEffect(() => {
    if (currentLocation && currentLocation !== "default") {
      fetchTodayCounts();
    }
  }, [currentLocation]);

  // Refetch when toDate or currentLocation changes in advised view
  useEffect(() => {
    if (selectedView === "advised" && selectedType && currentLocation && currentLocation !== "default") {
      if (selectedType === "MCDPA") {
        fetchMCDPAData();
      } else {
        fetchAdvisedData(selectedType, selectedDays, toDate);
      }
    }
  }, [toDate, currentLocation]);

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
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch MCDPA Data from API
  const fetchMCDPAData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/calling-calendar/mcdpa-patients`, {
        method: "GET",
        headers: {
          "x-hms-location": currentLocation,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch MCDPA records");
      }

      const resData = await response.json();
      if (resData.statusCode === 200 && resData.data) {
        setMcdpaData(resData.data || {});
      } else {
        setMcdpaData({});
      }
    } catch (error) {
      console.error("Error fetching MCDPA data:", error);
      Toast.fire({
        icon: "error",
        title: "Error fetching MCDPA records",
      });
      setMcdpaData({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch Advised Data from API
  const fetchAdvisedData = async (type, days, baseDateStr = toDate) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/calling-calendar/filter`, {
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
        setNoNotesRecords(resData.data.noNotesRecords || []);
      } else {
        setRecords([]);
        setNoNotesRecords([]);
      }
    } catch (error) {
      console.error("Error fetching advised data:", error);
      Toast.fire({
        icon: "error",
        title: "Error fetching records",
      });
      setRecords([]);
      setNoNotesRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdvised = (type) => {
    setSelectedType(type);
    setSelectedView("advised");
    setSelectedDays(3);
    if (type === "MCDPA") {
      fetchMCDPAData();
    } else {
      fetchAdvisedData(type, 3);
    }
  };

  const handleDayFilterChange = (days) => {
    setSelectedDays(days);
    if (selectedType !== "MCDPA") {
      fetchAdvisedData(selectedType, days);
    }
  };

  const handleGoBack = () => {
    setSelectedView("dashboard");
    setRecords([]);
    setNoNotesRecords([]);
    setMcdpaData({});
    fetchTodayCounts();
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
    setCallbackDate("");
    setShowCallbackModal(true);
  };

  // Submit Note
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!noteComment.trim()) {
      Swal.fire("Warning", "Please enter the note details.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/calling-calendar/submitnote`,
        {
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
        },
      );

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
        if (selectedType === "MCDPA") {
          fetchMCDPAData();
        } else {
          fetchAdvisedData(selectedType, selectedDays);
        }
        fetchTodayCounts();
      } else {
        Swal.fire("Error", "Failed to save note.", "error");
      }
    } catch (error) {
      console.error("Error submitting note:", error);
      Swal.fire("Error", "Server error while saving note.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Callback
  const handleSubmitCallback = async (e) => {
    e.preventDefault();
    if (!callbackDate || !callbackDate.trim()) {
      Swal.fire("Warning", "Please select callback date.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/calling-calendar/submitcallback`,
        {
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
        },
      );

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
        if (selectedType === "MCDPA") {
          fetchMCDPAData();
        } else {
          fetchAdvisedData(selectedType, selectedDays);
        }
        fetchTodayCounts();
      } else {
        Swal.fire("Error", "Failed to save callback date.", "error");
      }
    } catch (error) {
      console.error("Error submitting callback:", error);
      Swal.fire("Error", "Server error while saving callback date.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excel Download
  const handleDownloadExcel = () => {
    const daysString = "3,7,15,30,0";
    const downloadUrl = `${BASE_URL}/V1/doctor/calling-calendar/download-excel?Frdate=${fromDate}&date=${toDate}&days=${daysString}&type=${selectedType}&location=${currentLocation}`;
    window.location.href = downloadUrl;
  };

  const displayedRecords = selectedType === "MCDPA"
    ? (selectedDays === 0 ? (mcdpaData.callback || []) : (mcdpaData[selectedDays] || []))
    : records;

  const renderCountBadges = (type) => {
    const counts = cardCounts[type] || { toBeCalled: 0, pending: 0, called: 0 };
    return (
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "6px",
          maxWidth: "calc(100% - 75px)",
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            padding: "3px 8px",
            borderRadius: "12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            border: "1px solid #c8e6c9",
            boxShadow: "0 1px 2px rgba(46,125,50,0.08)",
            whiteSpace: "nowrap",
          }}
          title={`${counts.toBeCalled} patients scheduled to be called today`}
        >
          <i className="fa fa-phone" style={{ fontSize: "10px" }}></i>
          <span>{counts.toBeCalled} To Call</span>
        </span>

        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            backgroundColor: counts.pending > 0 ? "#fff3e0" : "#f8fafc",
            color: counts.pending > 0 ? "#e65100" : "#64748b",
            padding: "3px 8px",
            borderRadius: "12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            border: counts.pending > 0 ? "1px solid #ffe0b2" : "1px solid #e2e8f0",
            boxShadow: counts.pending > 0 ? "0 1px 2px rgba(230,81,0,0.08)" : "none",
            whiteSpace: "nowrap",
          }}
          title={`${counts.pending} patients pending to be called today`}
        >
          <i className="fa fa-clock-o" style={{ fontSize: "10px" }}></i>
          <span>{counts.pending} Pending</span>
        </span>

        {counts.called > 0 && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              backgroundColor: "#e0f2fe",
              color: "#0369a1",
              padding: "3px 8px",
              borderRadius: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              border: "1px solid #bae6fd",
              whiteSpace: "nowrap",
            }}
            title={`${counts.called} patients called today`}
          >
            <i className="fa fa-check" style={{ fontSize: "10px" }}></i>
            <span>{counts.called} Called</span>
          </span>
        )}
      </div>
    );
  };

  const renderResultsHeader = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1.5px solid #d4e8e3",
        paddingBottom: "10px",
        marginBottom: "5px",
        paddingLeft: "15px",
        paddingRight: "15px",
      }}
    >
      <div style={{ width: "25%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Patient Details</div>
      <div style={{ width: "35%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Diagnosis</div>
      <div style={{ width: "30%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Action Taken</div>
      <div style={{ width: "10%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase", textAlign: "right" }}>Actions</div>
    </div>
  );

  const renderRecordCard = (row) => {
    const recordId = selectedType === "Dischargecard"
      ? row.discharge_id
      : selectedType === "Enquiry"
        ? row.id
        : row.diag_id;

    let parsedNotes = [];
    if (row.calling_notes) {
      let parsed = row.calling_notes;
      if (typeof parsed === "string") {
        if (parsed === "{}" || parsed === "[]") {
          parsed = [];
        } else {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) { }
        }
      }

      if (Array.isArray(parsed)) {
        parsedNotes = parsed;
      } else if (typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0) {
        parsedNotes = [parsed];
      } else if (typeof parsed === "string" && parsed.trim() !== "") {
        parsedNotes = [{ note: parsed }];
      }

      let flattened = [];
      parsedNotes.forEach((item) => {
        if (item && Array.isArray(item.note)) {
          flattened.push(...item.note);
        } else if (item && typeof item.note === "string") {
          try {
            const inner = JSON.parse(item.note);
            if (Array.isArray(inner)) {
              flattened.push(...inner);
            } else {
              flattened.push(item);
            }
          } catch (e) {
            flattened.push(item);
          }
        } else if (item && typeof item === "string") {
          flattened.push({ note: item });
        } else if (item) {
          flattened.push(item);
        }
      });
      parsedNotes = flattened;
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
              {row.was_sunday === 1 && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "#b26a00",
                    backgroundColor: "#fff8e1",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginBottom: "6px",
                    fontWeight: "600",
                    border: "1px solid #ffe082",
                    textTransform: "none"
                  }}
                >
                  <span>⚠️ Scheduled Sunday (Moved to Saturday)</span>
                </div>
              )}
              <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#1a2b26", textTransform: "uppercase" }}>
                {row.name || "Unknown Patient"}
                <br />
                <span style={{ fontSize: "13px", color: "#4f6961ff" }}>{row.phone || "-"}</span>
                {row.doctor_name && (
                  <>
                    <br />
                    <span style={{ fontSize: "12px", color: "#0f7b63", fontWeight: "600" }}>{row.doctor_name}</span>
                  </>
                )}
              </p>
            </div>

            {/* Diagnosis */}
            <div style={{ width: "35%", paddingRight: "12px", fontSize: "14px", fontWeight: "600", color: "#1a2b26", textTransform: "uppercase" }}>
              {row.diagnosis || "-"}
            </div>

            {/* Action Taken */}
            <div style={{ width: "30%", paddingRight: "12px" }}>
              {parsedNotes.length === 0 ? (
                <span style={{ color: "#6b8f85", fontSize: "13px" }}>No calling notes added yet.</span>
              ) : (
                parsedNotes.map((note, index) => {
                  const formattedNoteDate = note.date
                    ? moment(note.date).format("YYYY-MM-DD")
                    : "";
                  return (
                    <div key={index} style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: index < parsedNotes.length - 1 ? "1px dashed #d4e8e3" : "none" }}>
                      <div style={{ fontSize: "13px", color: "#1a2b26", lineHeight: "1.4" }}>
                        <span style={{ fontWeight: "700", color: "#0f7b63" }}>{index + 1}.</span>{" "}
                        {formattedNoteDate && (
                          <>
                            <span style={{ fontWeight: "600", color: "#486f64ff" }}>{formattedNoteDate}</span>
                            <span style={{ margin: "0 4px", color: "#6f988eff" }}>|</span>
                          </>
                        )}
                        <span style={{ fontWeight: "600" }}>
                          {typeof note === "string"
                            ? note
                            : typeof note.note === "object"
                              ? JSON.stringify(note.note)
                              : note.note || ""}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div style={{ width: "10%", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button
                onClick={() => handleOpenNoteModal(recordId, selectedType)}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", backgroundColor: "#0f7b63", border: "none", borderRadius: "8px", color: "white", padding: 0, boxShadow: "0 2px 6px rgba(15,123,99,0.15)" }}
                title="Add Note"
              >
                <FeatherIcon icon="edit-3" size={14} stroke="white" style={{ color: "white", stroke: "white" }} />
              </Button>
              <Button
                onClick={() => handleOpenCallbackModal(recordId, selectedType)}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", backgroundColor: "#0f7b63", border: "none", borderRadius: "8px", color: "white", padding: 0, boxShadow: "0 2px 6px rgba(15,123,99,0.15)" }}
                title="Add Callback Date"
              >
                <FeatherIcon icon="calendar" size={14} stroke="white" style={{ color: "white", stroke: "white" }} />
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
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
          <Container fluid style={{ padding: "10px", marginTop: "10px" }}>
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
                border: "1px solid #4dd0e1",
                boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#6b8f85",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FeatherIcon
                  icon="filter"
                  size={14}
                  style={{ color: "#0f7b63" }}
                />{" "}
                Date Range
              </span>
              <div style={{ position: "relative", flex: 1 }}>
                <FeatherIcon
                  icon="calendar"
                  size={14}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#0f7b63",
                  }}
                />
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{
                    paddingLeft: "36px",
                    border: "1.5px solid #d4e8e3",
                    borderRadius: "10px",
                    backgroundColor: "#f7faf9",
                  }}
                />
              </div>
              <span style={{ color: "#6b8f85", fontWeight: "600" }}>→</span>
              <div style={{ position: "relative", flex: 1 }}>
                <FeatherIcon
                  icon="check-square"
                  size={14}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#0f7b63",
                  }}
                />
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    paddingLeft: "36px",
                    border: "1.5px solid #d4e8e3",
                    borderRadius: "10px",
                    backgroundColor: "#f7faf9",
                  }}
                />
              </div>
              {selectedView !== "dashboard" && (
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
                    marginLeft: "auto"
                  }}
                >
                  <i className="fa fa-file-excel"></i> Download Excel
                </Button>
              )}
            </div>

            {/* Views */}
            {selectedView === "dashboard" ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <h2
                    style={{
                      fontWeight: "600",
                      fontSize: "22px",
                      fontFamily: "Syne, sans-serif",
                      margin: 0,
                    }}
                  >
                    Quick Actions
                  </h2>
                  <span
                    className="badge"
                    style={{
                      fontSize: "11px",
                      backgroundColor: "#c1e5ddff",
                      color: "#0f7b63",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontWeight: "700",
                    }}
                  >
                    OPD - IPD
                  </span>
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
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            backgroundColor: "#fdecea",
                            display: "flex",
                            alignItems: "center",
                            justifyCenter: "center",
                            color: "#e74c3c",
                            fontSize: "22px",
                            margin: "auto 0",
                          }}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="fa fa-stethoscope"></i>
                        </div>
                        <div>
                          <h5
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              margin: "0 0 4px 0",
                            }}
                          >
                            Surgery Advised
                          </h5>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b8f85",
                              margin: 0,
                            }}
                          >
                            View surgery recommendations
                          </p>
                          {renderCountBadges("Surgery")}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor:
                              hoveredCard === "Surgery" ? "#e74c3c" : "#fdecea",
                            color:
                              hoveredCard === "Surgery" ? "white" : "#e74c3c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition:
                              "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredCard === "Surgery"
                                ? "translateX(4px)"
                                : "none",
                            boxShadow:
                              hoveredCard === "Surgery"
                                ? "0 4px 10px rgba(231,76,60,0.3)"
                                : "none",
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
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            backgroundColor: "#eaf3fb",
                            display: "flex",
                            alignItems: "center",
                            justifyCenter: "center",
                            color: "#2980b9",
                            fontSize: "22px",
                          }}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="fa fa-medkit"></i>
                        </div>
                        <div>
                          <h5
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              margin: "0 0 4px 0",
                            }}
                          >
                            Medication Advised
                          </h5>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b8f85",
                              margin: 0,
                            }}
                          >
                            Track prescribed medications
                          </p>
                          {renderCountBadges("Medication")}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor:
                              hoveredCard === "Medication"
                                ? "#2980b9"
                                : "#eaf3fb",
                            color:
                              hoveredCard === "Medication"
                                ? "white"
                                : "#2980b9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition:
                              "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredCard === "Medication"
                                ? "translateX(4px)"
                                : "none",
                            boxShadow:
                              hoveredCard === "Medication"
                                ? "0 4px 10px rgba(41,128,185,0.3)"
                                : "none",
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
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            backgroundColor: "#fef6e6",
                            display: "flex",
                            alignItems: "center",
                            justifyCenter: "center",
                            color: "#f39c12",
                            fontSize: "22px",
                          }}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="fa fa-flask"></i>
                        </div>
                        <div>
                          <h5
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              margin: "0 0 4px 0",
                            }}
                          >
                            Test Advised
                          </h5>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b8f85",
                              margin: 0,
                            }}
                          >
                            Diagnostic tests overview
                          </p>
                          {renderCountBadges("Test")}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor:
                              hoveredCard === "Test" ? "#f39c12" : "#fef6e6",
                            color: hoveredCard === "Test" ? "white" : "#f39c12",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition:
                              "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredCard === "Test"
                                ? "translateX(4px)"
                                : "none",
                            boxShadow:
                              hoveredCard === "Test"
                                ? "0 4px 10px rgba(243,156,18,0.3)"
                                : "none",
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
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            backgroundColor: "#f4eef9",
                            display: "flex",
                            alignItems: "center",
                            justifyCenter: "center",
                            color: "#8e44ad",
                            fontSize: "22px",
                          }}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="fa fa-phone"></i>
                        </div>
                        <div>
                          <h5
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              margin: "0 0 4px 0",
                            }}
                          >
                            Post-OP Calls
                          </h5>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b8f85",
                              margin: 0,
                            }}
                          >
                            Follow-up discharge calls
                          </p>
                          {renderCountBadges("Dischargecard")}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor:
                              hoveredCard === "Dischargecard"
                                ? "#8e44ad"
                                : "#f4eef9",
                            color:
                              hoveredCard === "Dischargecard"
                                ? "white"
                                : "#8e44ad",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition:
                              "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredCard === "Dischargecard"
                                ? "translateX(4px)"
                                : "none",
                            boxShadow:
                              hoveredCard === "Dischargecard"
                                ? "0 4px 10px rgba(142,68,173,0.3)"
                                : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 5: MCDPA */}
                  <Col xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => handleOpenAdvised("MCDPA")}
                      onMouseEnter={() => setHoveredCard("MCDPA")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        borderRadius: "16px",
                        border: "1.5px solid #d4e8e3",
                        boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        borderTop: "4px solid #009688",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="hover-card-elevate"
                    >
                      <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            backgroundColor: "#e0f2f1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#009688",
                            fontSize: "22px",
                            margin: "auto 0",
                          }}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="fa fa-user-md"></i>
                        </div>
                        <div>
                          <h5
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              margin: "0 0 4px 0",
                            }}
                          >
                            MCDPA
                          </h5>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b8f85",
                              margin: 0,
                            }}
                          >
                            MCDPA Patients list
                          </p>
                          {renderCountBadges("MCDPA")}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor:
                              hoveredCard === "MCDPA" ? "#009688" : "#e0f2f1",
                            color:
                              hoveredCard === "MCDPA" ? "white" : "#009688",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition:
                              "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredCard === "MCDPA"
                                ? "translateX(4px)"
                                : "none",
                            boxShadow:
                              hoveredCard === "MCDPA"
                                ? "0 4px 10px rgba(0,150,136,0.3)"
                                : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 6: Enquiry Calls */}
                  {/* <Col xs={12} sm={6} md={4}>
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
                  </Col> */}
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
                    <i
                      className="fa fa-arrow-left"
                      style={{ fontSize: "16px" }}
                    ></i>
                  </Button>
                  <h3
                    style={{
                      margin: 0,
                      flex: 1,
                      fontFamily: "Syne, sans-serif",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                  >
                    {selectedType === "Dischargecard"
                      ? "Post-OP Calls"
                      : selectedType === "Enquiry"
                        ? "Enquiry Follow-up Calls"
                        : `${selectedType} Advised (OPD)`}
                  </h3>
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
                      background:
                        selectedDays === 3
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 3
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
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
                      background:
                        selectedDays === 7
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 7
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
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
                      background:
                        selectedDays === 15
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 15
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
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
                      background:
                        selectedDays === 30
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 30
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
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
                      background:
                        selectedDays === 0
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 0
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
                    }}
                  >
                    Call Back
                  </Button>
                </div>

                {/* Records List */}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner
                      animation="border"
                      variant="success"
                      className="mb-2"
                    />
                    <p style={{ color: "#6b8f85", margin: 0 }}>
                      Fetching records...
                    </p>
                  </div>
                ) : selectedDays === 0 ? (
                  <div>
                    {/* Section 1: Today's Call Back Patients */}
                    <div style={{ marginBottom: "40px" }}>
                      <h4
                        style={{
                          fontWeight: "700",
                          fontSize: "16px",
                          color: "#0f7b63",
                          marginBottom: "15px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Today's Call Back Patients ({displayedRecords.length})
                      </h4>
                      {displayedRecords.length === 0 ? (
                        <div
                          style={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            padding: "30px 24px",
                            textAlign: "center",
                            border: "1.5px dashed #d4e8e3",
                            color: "#6b8f85",
                          }}
                        >
                          No callback scheduled for today
                        </div>
                      ) : (
                        <div>
                          {renderResultsHeader()}
                          {displayedRecords.map((row) => renderRecordCard(row))}
                        </div>
                      )}
                    </div>

                    {/* Section 2: Pending Outreach List */}
                    {selectedType !== "MCDPA" && (
                      <div style={{ marginTop: "40px" }}>
                        <h4
                          style={{
                            fontWeight: "700",
                            fontSize: "16px",
                            color: "#0f7b63",
                            marginBottom: "15px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Pending Outreach List ({noNotesRecords.length})
                        </h4>
                        {noNotesRecords.length === 0 ? (
                          <div
                            style={{
                              backgroundColor: "white",
                              borderRadius: "16px",
                              padding: "30px 24px",
                              textAlign: "center",
                              border: "1.5px dashed #d4e8e3",
                              color: "#6b8f85",
                            }}
                          >
                            No patients pending outreach (Above 30 days from advice without notes) since 1st July 2026
                          </div>
                        ) : (
                          <div>
                            {renderResultsHeader()}
                            {noNotesRecords.map((row) => renderRecordCard(row))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : displayedRecords.length === 0 ? (
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
                    <i
                      className="fa fa-folder-open mb-3"
                      style={{ fontSize: "40px", color: "#d4e8e3" }}
                    ></i>
                    <p
                      style={{ fontSize: "15px", fontWeight: "500", margin: 0 }}
                    >
                      No records available
                    </p>
                  </div>
                ) : (
                  <div>
                    {renderResultsHeader()}
                    {displayedRecords.map((row) => renderRecordCard(row))}
                  </div>
                )}
              </div>
            )}
          </Container>
        </div>
      </div>

      {/* Note submission Modal */}
      <Modal
        show={showNoteModal}
        onHide={() => setShowNoteModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            Add Note <span className="text-danger">*</span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitNote}>
          <Modal.Body className="pt-0">
            <Form.Group>
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
              disabled={isSubmitting}
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
              {isSubmitting ? "Submitting Note..." : "Submit Note"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Callback Date submission Modal */}
      <Modal
        show={showCallbackModal}
        onHide={() => setShowCallbackModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            Add CallBack Date <span className="text-danger">*</span>
          </Modal.Title>
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
              disabled={isSubmitting}
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
              {isSubmitting ? "Submitting Date..." : "Submit Date"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
