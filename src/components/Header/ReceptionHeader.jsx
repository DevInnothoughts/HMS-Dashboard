import React, { useState, useEffect, useCallback } from "react";
import FeatherIcon from "feather-icons-react";
import SimpleBar from "simplebar-react";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../pages/api/useSidebarContext";
import "font-awesome/css/font-awesome.min.css";
import { decodeJwt } from "../../utils/decode-jwt";

export default function ReceptionHeader() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [accountType, setAccountType] = useState("");
  const [department, setDepartment] = useState("");
  const [apptCounts, setApptCounts] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [pendingAppts, setPendingAppts] = useState([]);
  const [confirmedAppts, setConfirmedAppts] = useState([]);
  const [cancelledAppts, setCancelledAppts] = useState([]);
  const [showPendingDropdown, setShowPendingDropdown] = useState(false);
  const [showConfirmedDropdown, setShowConfirmedDropdown] = useState(false);
  const [showCancelledDropdown, setShowCancelledDropdown] = useState(false);

  const fetchApptCounts = useCallback(async () => {
    if (!currentLocation) return;
    try {
      const localDate = new Date();
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      const date = `${year}-${month}-${day}`;

      const response = await fetch(
        `http://194.195.117.79:5100/api/V1/appointment/getAppointmentCounts?location=${currentLocation}&date=${date}`,
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        setApptCounts(data.data);
      }

      // Fetch pending & confirmed list for today
      const formattedDate = new Date()
        .toLocaleDateString("en-GB")
        .split("/")
        .join("-");
      const listRes = await fetch(
        `http://194.195.117.79:5100/api/V1/appointment/listAppointments?from=${formattedDate}&to=${formattedDate}&location=${currentLocation}`,
      );
      const listData = await listRes.json();
      if (listData.statusCode === 200 && Array.isArray(listData.data)) {
        const pending = listData.data.filter(
          (app) => app.confirm_time === "0" || app.confirm_time === 0,
        );
        const confirmed = listData.data.filter(
          (app) => app.confirm_time !== "0" && app.confirm_time !== 0,
        );
        setPendingAppts(pending);
        setConfirmedAppts(confirmed);
      }

      // Fetch cancelled list for today
      const cancelledRes = await fetch(
        `http://194.195.117.79:5100/api/V1/appointment/listAppointments?from=${formattedDate}&to=${formattedDate}&location=${currentLocation}&includeDeleted=true`,
      );
      const cancelledData = await cancelledRes.json();
      if (
        cancelledData.statusCode === 200 &&
        Array.isArray(cancelledData.data)
      ) {
        setCancelledAppts(cancelledData.data);
      }
    } catch (error) {
      console.error("Error fetching appointment counts:", error);
    }
  }, [currentLocation]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
    setAccountType(localStorage.getItem("accountType") || "");
    setDepartment(localStorage.getItem("department") || "");
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchApptCounts();

      const interval = setInterval(fetchApptCounts, 30000); // Update every 30 seconds

      const handleRefresh = () => {
        fetchApptCounts(); // Instant update
        setTimeout(fetchApptCounts, 600); // 1st fallback
        setTimeout(fetchApptCounts, 1200); // 2nd fallback
      };

      window.addEventListener("refreshApptCounts", handleRefresh);

      return () => {
        clearInterval(interval);
        window.removeEventListener("refreshApptCounts", handleRefresh);
      };
    }
  }, [currentLocation, fetchApptCounts]);

  const handlePatientClick = (app) => {
    // Store in localStorage for cross-page persistence
    localStorage.setItem("autoSelectAppointmentId", app.appointment_id);

    // Dispatch event for instant selection if already on dashboard
    window.dispatchEvent(
      new CustomEvent("selectAppointment", {
        detail: {
          appointmentId: app.appointment_id,
          patientName: app.patient_name,
        },
      }),
    );

    setShowPendingDropdown(false);
    setShowConfirmedDropdown(false);
    setShowCancelledDropdown(false);
    navigate("/reception-dashboard");
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const { toggleSidebar } = useSidebarContext();

  return (
    <>
      <header className="codex-header">
        <div className="flex-between">
          <div className="header-left d-flex align-items-center">
            {currentLocation && (
              <div
                className="appointment-summary-wrapper"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginLeft: "5px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <i
                      className="fa fa-calendar-check-o"
                      style={{ color: "#000000ff", fontSize: "13px" }}
                    ></i>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#000000ff",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Today's Appointment Summary
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#000000ff",
                      fontWeight: "750",
                      marginLeft: "30%",
                    }}
                  >
                    {new Date().toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div
                  className="appointment-stats"
                  style={{ display: "flex", gap: "10px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: "#f8f9fa",
                      padding: "2px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: "1px solid #d1d3d4ff",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#636c74ff",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#212529",
                        fontWeight: "800",
                      }}
                    >
                      {apptCounts.total}
                    </span>
                  </div>

                  {/* Confirmed Dropdown */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setShowConfirmedDropdown(true)}
                    onMouseLeave={() => setShowConfirmedDropdown(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(40, 167, 69, 0.1)",
                        padding: "2px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border: "1px solid rgba(40, 167, 69, 0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#28a745",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Confirmed
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#28a745",
                          fontWeight: "800",
                        }}
                      >
                        {apptCounts.confirmed}
                      </span>
                    </div>

                    {showConfirmedDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "320px",
                          zIndex: 1000,
                          paddingTop: "8px",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.98)",
                            backdropFilter: "blur(15px)",
                            borderRadius: "12px",
                            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                            border: "1px solid rgba(40, 167, 69, 0.3)",
                            overflow: "hidden",
                            animation: "fadeInUp 0.2s ease-out",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 15px",
                              background: "rgba(40, 167, 69, 0.15)",
                              borderBottom: "1px solid rgba(40, 167, 69, 0.2)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "800",
                                  fontSize: "11px",
                                  color: "#28a745",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Confirmed Appointments
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#28a745",
                                  color: "white",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "800",
                                }}
                              >
                                {confirmedAppts.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {confirmedAppts.length > 0 ? (
                                confirmedAppts.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === confirmedAppts.length - 1
                                          ? "none"
                                          : "1px solid #f1f5f9",
                                      transition: "background 0.2s",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) =>
                                    (e.currentTarget.style.background =
                                      "#f0fff4")
                                    }
                                    onMouseOut={(e) =>
                                    (e.currentTarget.style.background =
                                      "transparent")
                                    }
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "13px",
                                          color: "#0f172a",
                                        }}
                                      >
                                        {app.patient_name}
                                      </span>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "3px",
                                          background: "#f8fafc",
                                          padding: "1px 6px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        <i
                                          className="fa fa-clock-o"
                                          style={{
                                            fontSize: "10px",
                                            color: "#64748b",
                                          }}
                                        ></i>
                                        <span
                                          style={{
                                            fontSize: "10px",
                                            color: "#475569",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {app.appointment_time}
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "18px",
                                          height: "18px",
                                          borderRadius: "50%",
                                          background: "#f1f5f9",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <i
                                          className="fa fa-user-md"
                                          style={{
                                            fontSize: "10px",
                                            color: "#94a3b8",
                                          }}
                                        ></i>
                                      </div>
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#64748b",
                                          fontWeight: "500",
                                        }}
                                      >
                                        {app.doctor_name}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div
                                  style={{
                                    padding: "30px 20px",
                                    textAlign: "center",
                                  }}
                                >
                                  <i
                                    className="fa fa-calendar-o"
                                    style={{
                                      fontSize: "24px",
                                      color: "#e2e8f0",
                                      marginBottom: "10px",
                                      display: "block",
                                    }}
                                  ></i>
                                  <span
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    No confirmed appointments for today
                                  </span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pending Dropdown */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setShowPendingDropdown(true)}
                    onMouseLeave={() => setShowPendingDropdown(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(255, 193, 7, 0.1)",
                        padding: "2px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border: "1px solid rgba(255, 193, 7, 0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#dfa908ff",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Pending
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#dfa908ff",
                          fontWeight: "800",
                        }}
                      >
                        {apptCounts.pending}
                      </span>
                    </div>

                    {showPendingDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "320px",
                          zIndex: 1000,
                          paddingTop: "8px",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.98)",
                            backdropFilter: "blur(15px)",
                            borderRadius: "12px",
                            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                            border: "1px solid rgba(255, 193, 7, 0.3)",
                            overflow: "hidden",
                            animation: "fadeInUp 0.2s ease-out",
                          }}
                        >
                          <style>{`
                            @keyframes fadeInUp {
                              from { opacity: 0; transform: translateY(10px); }
                              to { opacity: 1; transform: translateY(0); }
                            }
                          `}</style>
                          <div
                            style={{
                              padding: "12px 15px",
                              background: "rgba(255, 193, 7, 0.15)",
                              borderBottom: "1px solid rgba(255, 193, 7, 0.2)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "800",
                                  fontSize: "11px",
                                  color: "#dfa908ff",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Pending Appointments
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#dfa908ff",
                                  color: "white",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "800",
                                }}
                              >
                                {pendingAppts.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {pendingAppts.length > 0 ? (
                                pendingAppts.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === pendingAppts.length - 1
                                          ? "none"
                                          : "1px solid #f1f5f9",
                                      transition: "background 0.2s",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) =>
                                    (e.currentTarget.style.background =
                                      "#fffbeb")
                                    }
                                    onMouseOut={(e) =>
                                    (e.currentTarget.style.background =
                                      "transparent")
                                    }
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "13px",
                                          color: "#0f172a",
                                        }}
                                      >
                                        {app.patient_name}
                                      </span>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "3px",
                                          background: "#f8fafc",
                                          padding: "1px 6px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        <i
                                          className="fa fa-clock-o"
                                          style={{
                                            fontSize: "10px",
                                            color: "#64748b",
                                          }}
                                        ></i>
                                        <span
                                          style={{
                                            fontSize: "10px",
                                            color: "#475569",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {app.appointment_time}
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "18px",
                                          height: "18px",
                                          borderRadius: "50%",
                                          background: "#f1f5f9",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <i
                                          className="fa fa-user-md"
                                          style={{
                                            fontSize: "10px",
                                            color: "#94a3b8",
                                          }}
                                        ></i>
                                      </div>
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#64748b",
                                          fontWeight: "500",
                                        }}
                                      >
                                        {app.doctor_name}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div
                                  style={{
                                    padding: "30px 20px",
                                    textAlign: "center",
                                  }}
                                >
                                  <i
                                    className="fa fa-calendar-o"
                                    style={{
                                      fontSize: "24px",
                                      color: "#e2e8f0",
                                      marginBottom: "10px",
                                      display: "block",
                                    }}
                                  ></i>
                                  <span
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    No pending appointments for today
                                  </span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cancelled Dropdown */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setShowCancelledDropdown(true)}
                    onMouseLeave={() => setShowCancelledDropdown(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(220, 53, 69, 0.1)",
                        padding: "2px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border: "1px solid rgba(220, 53, 69, 0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#dc3545",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Cancelled
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#dc3545",
                          fontWeight: "800",
                        }}
                      >
                        {apptCounts.cancelled}
                      </span>
                    </div>

                    {showCancelledDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "320px",
                          zIndex: 1000,
                          paddingTop: "8px",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.98)",
                            backdropFilter: "blur(15px)",
                            borderRadius: "12px",
                            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                            border: "1px solid rgba(220, 53, 69, 0.3)",
                            overflow: "hidden",
                            animation: "fadeInUp 0.2s ease-out",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 15px",
                              background: "rgba(220, 53, 69, 0.15)",
                              borderBottom: "1px solid rgba(220, 53, 69, 0.2)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "800",
                                  fontSize: "11px",
                                  color: "#dc3545",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Cancelled Appointments
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#dc3545",
                                  color: "white",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "800",
                                }}
                              >
                                {cancelledAppts.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {cancelledAppts.length > 0 ? (
                                cancelledAppts.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === cancelledAppts.length - 1
                                          ? "none"
                                          : "1px solid #f1f5f9",
                                      transition: "background 0.2s",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) =>
                                    (e.currentTarget.style.background =
                                      "#fff5f5")
                                    }
                                    onMouseOut={(e) =>
                                    (e.currentTarget.style.background =
                                      "transparent")
                                    }
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight: "700",
                                          fontSize: "13px",
                                          color: "#0f172a",
                                        }}
                                      >
                                        {app.patient_name}
                                      </span>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "3px",
                                          background: "#f8fafc",
                                          padding: "1px 6px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        <i
                                          className="fa fa-clock-o"
                                          style={{
                                            fontSize: "10px",
                                            color: "#64748b",
                                          }}
                                        ></i>
                                        <span
                                          style={{
                                            fontSize: "10px",
                                            color: "#475569",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {app.appointment_time}
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "3px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#dc3545",
                                          fontWeight: "600",
                                        }}
                                      >
                                        Reason: {app.cancelComment || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div
                                  style={{
                                    padding: "30px 20px",
                                    textAlign: "center",
                                  }}
                                >
                                  <i
                                    className="fa fa-calendar-o"
                                    style={{
                                      fontSize: "24px",
                                      color: "#e2e8f0",
                                      marginBottom: "10px",
                                      display: "block",
                                    }}
                                  ></i>
                                  <span
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    No cancelled appointments for today
                                  </span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="header-right">
            <ul className="nav-iconlist">
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginRight: "15px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "750",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginRight: "5px",
                    userSelect: "none",
                  }}
                >
                  <i
                    className="fa fa-bolt"
                    style={{ color: "#f59e0b", fontSize: "13px" }}
                  ></i>
                  Quick Actions :
                </span>
                <button
                  onClick={() => navigate("/add-appointment")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    backgroundColor: "#e0f7fa",
                    color: "#00838f",
                    border: "1px solid #00bcd4",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "12px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 10px rgba(0,0,0,0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 5px rgba(0,0,0,0.05)";
                  }}
                >
                  <i
                    className="fa fa-calendar-plus-o"
                    style={{ fontSize: "14px" }}
                  ></i>
                  Add Appointment
                </button>
                <button
                  onClick={() =>
                    navigate("/recp-enquiries-navbar", { state: { activeTab: "addEnquiry" } })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    backgroundColor: "#ffe0b2",
                    color: "#e65100",
                    border: "1px solid #ff9800",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "12px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 10px rgba(0,0,0,0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 5px rgba(0,0,0,0.05)";
                  }}
                >
                  <i
                    className="fa fa-question-circle-o"
                    style={{ fontSize: "14px" }}
                  ></i>
                  Add Enquiry
                </button>
                <div
                  style={{
                    width: "3px",
                    height: "28px",
                    backgroundColor: "#e2e8f0",
                    marginLeft: "20px",
                    borderRadius: "2px",
                  }}
                ></div>
              </li>

              <li
                className="nav-profile"
                style={{ display: "flex", alignItems: "center" }}
              >
                {currentLocation && (
                  <div
                    className="location-badge"
                    style={{
                      marginRight: "0",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 12px",
                      background: "rgba(26, 110, 124, 0.14)",
                      border: "1px solid #2a96d087",
                      borderRadius: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <i
                      className="fa fa-map-marker"
                      style={{ color: "#2a96d0ff", fontSize: "14px" }}
                    ></i>
                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "12px",
                        color: "#2a96d0ff",
                      }}
                    >
                      {currentLocation}
                    </span>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
