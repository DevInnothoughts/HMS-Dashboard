import React, { useState, useEffect, useCallback } from "react";
import FeatherIcon from "feather-icons-react";
import SimpleBar from "simplebar-react";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../pages/api/useSidebarContext";
import "font-awesome/css/font-awesome.min.css";
import { decodeJwt } from "../../pages/Utility/decode-jwt";
import moment from "moment";

export default function DoctorHeader() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const formatTime24 = (timeStr) => {
    if (!timeStr) return "12:00";
    const parsed = moment(timeStr.trim(), [
      "hh:mm A",
      "HH:mm",
      "hh:mm",
      "h:mm A",
      "H:mm",
    ]);
    if (parsed.isValid()) {
      return parsed.format("HH:mm");
    }
    return timeStr;
  };
  const [currentLocation, setCurrentLocation] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [accountType, setAccountType] = useState("");
  const [department, setDepartment] = useState("");

  const [stats, setStats] = useState({
    counts: {
      total: 0,
      new: 0,
      follow: 0,
      postop: 0,
      other: 0,
      ipd: 0,
    },
    lists: {
      new: [],
      follow: [],
      postop: [],
      other: [],
      ipd: [],
    },
  });

  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showFollowDropdown, setShowFollowDropdown] = useState(false);
  const [showPostopDropdown, setShowPostopDropdown] = useState(false);
  const [showOtherDropdown, setShowOtherDropdown] = useState(false);
  const [showIpdDropdown, setShowIpdDropdown] = useState(false);

  const fetchDoctorStats = useCallback(async () => {
    if (!currentLocation || !doctorId) {
      return;
    }
    try {
      const BASE_URL = "http://194.195.117.79:5100/api";
      const todayStr = moment().format("YYYY-MM-DD");
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      // 1. Fetch header stats for OPD
      let opdStats = {
        counts: { total: 0, new: 0, follow: 0, postop: 0, other: 0, ipd: 0 },
        lists: { new: [], follow: [], postop: [], other: [], ipd: [] },
      };
      try {
        const url = `${BASE_URL}/V1/doctor/header-stats?location=${currentLocation}&doctorId=${doctorId}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.statusCode === 200 && data.data) {
          opdStats = data.data;
        }
      } catch (err) {
        console.error("Error fetching OPD header stats:", err);
      }

      // 2. Query all IPD endpoints for today
      const endpoints = [
        `${BASE_URL}/V1/doctor/admission/list-admissions?location=${encodeURIComponent(currentLocation)}`,
        `${BASE_URL}/V1/doctor/manage-admission/list?location=${encodeURIComponent(currentLocation)}&from=${todayStr}&to=${todayStr}`,
        `${BASE_URL}/V1/doctor/manage-admission/list?location=${encodeURIComponent(currentLocation)}`,
        `${BASE_URL}/V1/ipd/admin/listVerifiedPatients?location=${encodeURIComponent(currentLocation)}&from=${todayStr}&to=${todayStr}&includeDeleted=true`,
      ];

      const responses = await Promise.allSettled(
        endpoints.map((url) => fetch(url, { headers })),
      );

      let allRawIpd = [];
      for (const res of responses) {
        if (res.status === "fulfilled" && res.value && res.value.ok) {
          try {
            const json = await res.value.json();
            const list = Array.isArray(json)
              ? json
              : Array.isArray(json?.data)
                ? json.data
                : Array.isArray(json?.result)
                  ? json.result
                  : [];
            if (Array.isArray(list) && list.length > 0) {
              allRawIpd.push(...list);
            }
          } catch (e) {
            console.error("JSON parse error in DoctorHeader IPD:", e);
          }
        }
      }

      // Deduplicate IPD records using composite key based on patient identity
      const getDedupeKey = (item) => {
        const uid = String(
          item.uid ||
            item.uhid ||
            item.patient_uid ||
            item.uid_no ||
            item.patient_id ||
            "",
        )
          .trim()
          .toLowerCase();

        const phone = String(
          item.patient_phone || item.phone || item.contact || "",
        )
          .replace(/\D/g, "")
          .slice(-10);

        const name = String(
          item.name || item.patient_name || item.patientName || "",
        )
          .trim()
          .toLowerCase();

        const admNo = String(
          item.admission_no || item.adm_no || item.admissionNo || "",
        )
          .trim()
          .toLowerCase();

        if (uid && uid !== "0") return `uid_${uid}`;
        if (phone && name) return `person_${phone}_${name}`;
        if (phone) return `phone_${phone}`;
        if (admNo && admNo !== "0" && admNo !== "pending")
          return `adm_${admNo}`;

        return `id_${item.id || item.appointment_id || Math.random()}`;
      };

      const uniqueMap = new Map();
      allRawIpd.forEach((item) => {
        const key = getDedupeKey(item);
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        } else {
          // Merge records for the same key, keeping valid admission numbers and cancellation status
          const existing = uniqueMap.get(key);
          const existingAdm =
            existing.admission_no || existing.adm_no || existing.admissionNo;
          const newAdm = item.admission_no || item.adm_no || item.admissionNo;

          const existingHasAdm =
            existingAdm &&
            String(existingAdm) !== "0" &&
            String(existingAdm).trim() !== "";
          const newHasAdm =
            newAdm && String(newAdm) !== "0" && String(newAdm).trim() !== "";

          const merged = { ...existing, ...item };
          if (existingHasAdm && !newHasAdm) {
            merged.admission_no = existingAdm;
            merged.adm_no = existingAdm;
          } else if (newHasAdm) {
            merged.admission_no = newAdm;
            merged.adm_no = newAdm;
          }

          if (existing.is_deleted || item.is_deleted) {
            merged.is_deleted = 1;
          }

          uniqueMap.set(key, merged);
        }
      });
      const uniqueIpd = Array.from(uniqueMap.values());

      // Filter for records scheduled specifically on TODAY
      const isTodayRecord = (p) => {
        if (p.is_deleted) return false;
        const dateFormats = [
          "DD-MM-YYYY HH:mm",
          "DD-MM-YYYY hh:mm A",
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DD hh:mm A",
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "YYYY-MM-DDTHH:mm:ssZ",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
          "DD/MM/YYYY",
          "YYYY/MM/DD",
        ];

        const sxVal =
          p.surgery_datetime && p.surgery_datetime !== "Not Scheduled"
            ? p.surgery_datetime
            : p.surgery_date
              ? `${p.surgery_date} ${p.surgery_time || ""}`.trim()
              : null;

        if (sxVal) {
          const parsedSx = moment(sxVal, dateFormats);
          if (parsedSx.isValid()) {
            return parsedSx.format("YYYY-MM-DD") === todayStr;
          }
        }

        const admVal =
          p.admission_datetime && p.admission_datetime !== "NOT ADMITTED"
            ? p.admission_datetime
            : p.adm_date
              ? `${p.adm_date} ${p.adm_time || ""}`.trim()
              : p.admission_date
                ? `${p.admission_date}`.trim()
                : p.created_at;

        if (admVal) {
          const parsedAdm = moment(admVal, dateFormats);
          if (parsedAdm.isValid()) {
            return parsedAdm.format("YYYY-MM-DD") === todayStr;
          }
        }

        return false;
      };

      let todayIpd = uniqueIpd.filter(isTodayRecord);
      if (doctorId) {
        todayIpd = todayIpd.filter(
          (p) => !p.doctor_id || String(p.doctor_id) === String(doctorId),
        );
      }

      // Normalize IPD items
      const normalizedIpd = todayIpd.map((p) => {
        const sxVal =
          p.surgery_datetime && p.surgery_datetime !== "Not Scheduled"
            ? p.surgery_datetime
            : p.surgery_date
              ? `${p.surgery_date} ${p.surgery_time || ""}`.trim()
              : p.admission_datetime || p.created_at;
        const dateFormats = [
          "DD-MM-YYYY HH:mm",
          "DD-MM-YYYY hh:mm A",
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DD hh:mm A",
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "YYYY-MM-DDTHH:mm:ssZ",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
          "DD/MM/YYYY",
          "YYYY/MM/DD",
        ];
        const parsedTime = moment(sxVal, dateFormats);
        const displayTime = parsedTime.isValid()
          ? parsedTime.format("HH:mm")
          : "12:00";

        return {
          ...p,
          patient_name: p.patient_name || p.name || p.patientName || "Patient",
          name: p.name || p.patient_name || p.patientName || "Patient",
          appointment_id: p.id || p.patient_id || p.uid || p.uhid,
          appointment_time: displayTime,
          doctor_name: p.surgeon_name || p.doctor_name || p.doctorName || "N/A",
          patient_phone: p.patient_phone || p.phone || p.contact || "",
          uid:
            p.uid || p.uhid || p.patient_uid || p.patient_id || p.uid_no || "",
          uhid: p.uhid || p.uid || p.patient_uid || p.uid_no || "",
        };
      });

      const updatedCounts = {
        ...(opdStats.counts || {}),
        ipd: normalizedIpd.length,
        total:
          (opdStats.counts?.new || 0) +
          (opdStats.counts?.follow || 0) +
          (opdStats.counts?.postop || 0) +
          (opdStats.counts?.mcdpa || 0) +
          (opdStats.counts?.other || 0) +
          normalizedIpd.length,
      };

      setStats({
        counts: updatedCounts,
        lists: {
          ...(opdStats.lists || {}),
          ipd: normalizedIpd,
        },
      });
    } catch (error) {
      console.error("Error fetching doctor stats:", error);
    }
  }, [currentLocation, doctorId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);

      if (payload) {
        if (payload.jobLocation) {
          setCurrentLocation(payload.jobLocation);
        }
        if (payload.userId) {
          setDoctorId(payload.userId);
        }
      }
    } else {
      console.warn("⚠️ [DoctorHeader] No token found in localStorage!");
    }
    setAccountType(localStorage.getItem("accountType") || "");
    setDepartment(localStorage.getItem("department") || "");
  }, []);

  useEffect(() => {
    if (currentLocation && doctorId) {
      fetchDoctorStats();

      const interval = setInterval(fetchDoctorStats, 30000); // Update every 30 seconds

      // Handler for global refresh event
      const handleRefresh = () => {
        fetchDoctorStats(); // Instant update
        setTimeout(fetchDoctorStats, 600); // 1st fallback
        setTimeout(fetchDoctorStats, 1200); // 2nd fallback
      };

      window.addEventListener("refreshApptCounts", handleRefresh);

      return () => {
        clearInterval(interval);
        window.removeEventListener("refreshApptCounts", handleRefresh);
      };
    }
  }, [currentLocation, doctorId, fetchDoctorStats]);

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

    setShowNewDropdown(false);
    setShowFollowDropdown(false);
    setShowPostopDropdown(false);
    setShowOtherDropdown(false);

    navigate("/doctor-dashboard");
  };

  const handleIpdClick = (ipd) => {
    // Store appointment_id for cross-page persistence (same as other patient types)
    localStorage.setItem("autoSelectAppointmentId", ipd.appointment_id);

    // Dispatch event for instant selection if already on dashboard
    window.dispatchEvent(
      new CustomEvent("selectAppointment", {
        detail: {
          appointmentId: ipd.appointment_id,
          patientName: ipd.patient_name,
        },
      }),
    );

    setShowIpdDropdown(false);
    navigate("/doctor-dashboard");
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
                      className="fa fa-user-md"
                      style={{ color: "#00838f", fontSize: "14px" }}
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
                      Today's Doctor Summary
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#000000ff",
                      fontWeight: "750",
                      marginLeft: "30px",
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
                      {stats.counts.total}
                    </span>
                  </div>

                  {/* New Dropdown */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setShowNewDropdown(true)}
                    onMouseLeave={() => setShowNewDropdown(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(2, 132, 199, 0.1)",
                        padding: "2px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border: "1px solid rgba(2, 132, 199, 0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#0284c7",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        New
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#0284c7",
                          fontWeight: "800",
                        }}
                      >
                        {stats.counts.new}
                      </span>
                    </div>

                    {showNewDropdown && (
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
                            border: "1px solid rgba(2, 132, 199, 0.3)",
                            overflow: "hidden",
                            animation: "fadeInUp 0.2s ease-out",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 15px",
                              background: "rgba(2, 132, 199, 0.1)",
                              borderBottom: "1px solid rgba(2, 132, 199, 0.2)",
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
                                  color: "#0284c7",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                New Patients
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#0284c7",
                                  color: "white",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "800",
                                }}
                              >
                                {stats.lists.new.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {stats.lists.new.length > 0 ? (
                                stats.lists.new.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === stats.lists.new.length - 1
                                          ? "none"
                                          : "1px solid #f1f5f9",
                                      transition: "background 0.2s",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.background =
                                        "#f0f9ff")
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
                                          {formatTime24(app.appointment_time)}
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
                                    className="fa fa-users"
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
                                    No New patients for today
                                  </span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow Dropdown */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setShowFollowDropdown(true)}
                    onMouseLeave={() => setShowFollowDropdown(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(16, 185, 129, 0.1)",
                        padding: "2px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#10b981",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Follow
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#10b981",
                          fontWeight: "800",
                        }}
                      >
                        {stats.counts.follow}
                      </span>
                    </div>

                    {showFollowDropdown && (
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
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            overflow: "hidden",
                            animation: "fadeInUp 0.2s ease-out",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 15px",
                              background: "rgba(16, 185, 129, 0.1)",
                              borderBottom: "1px solid rgba(16, 185, 129, 0.2)",
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
                                  color: "#10b981",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Follow Patients
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#10b981",
                                  color: "white",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "800",
                                }}
                              >
                                {stats.lists.follow.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {stats.lists.follow.length > 0 ? (
                                stats.lists.follow.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === stats.lists.follow.length - 1
                                          ? "none"
                                          : "1px solid #f1f5f9",
                                      transition: "background 0.2s",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.background =
                                        "#ecfdf5")
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
                                          {formatTime24(app.appointment_time)}
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
                                    className="fa fa-users"
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
                                    No Follow patients for today
                                  </span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Postop Dropdown */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setShowPostopDropdown(true)}
                    onMouseLeave={() => setShowPostopDropdown(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(139, 92, 246, 0.1)",
                        padding: "2px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#8b5cf6",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Postop
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#8b5cf6",
                          fontWeight: "800",
                        }}
                      >
                        {stats.counts.postop}
                      </span>
                    </div>

                    {showPostopDropdown && (
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
                            border: "1px solid rgba(139, 92, 246, 0.3)",
                            overflow: "hidden",
                            animation: "fadeInUp 0.2s ease-out",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 15px",
                              background: "rgba(139, 92, 246, 0.1)",
                              borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
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
                                  color: "#8b5cf6",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Postop Patients
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#8b5cf6",
                                  color: "white",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "800",
                                }}
                              >
                                {stats.lists.postop.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {stats.lists.postop.length > 0 ? (
                                stats.lists.postop.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === stats.lists.postop.length - 1
                                          ? "none"
                                          : "1px solid #f1f5f9",
                                      transition: "background 0.2s",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.background =
                                        "#f5f3ff")
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
                                          {formatTime24(app.appointment_time)}
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
                                    className="fa fa-users"
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
                                    No Postop patients for today
                                  </span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Other Dropdown */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setShowOtherDropdown(true)}
                    onMouseLeave={() => setShowOtherDropdown(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(245, 158, 11, 0.1)",
                        padding: "2px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#f59e0b",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Other
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#f59e0b",
                          fontWeight: "800",
                        }}
                      >
                        {stats.counts.other}
                      </span>
                    </div>

                    {showOtherDropdown && (
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
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            overflow: "hidden",
                            animation: "fadeInUp 0.2s ease-out",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 15px",
                              background: "rgba(245, 158, 11, 0.1)",
                              borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
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
                                  color: "#f59e0b",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Other Patients
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#f59e0b",
                                  color: "white",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "800",
                                }}
                              >
                                {stats.lists.other.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {stats.lists.other.length > 0 ? (
                                stats.lists.other.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === stats.lists.other.length - 1
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
                                          {formatTime24(app.appointment_time)}
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
                                    className="fa fa-users"
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
                                    No Other patients for today
                                  </span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* IPD Dropdown */}
                  <div
                    style={{ position: "relative" }}
                    onMouseEnter={() => setShowIpdDropdown(true)}
                    onMouseLeave={() => setShowIpdDropdown(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(217, 70, 239, 0.1)",
                        padding: "2px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        border: "1px solid rgba(217, 70, 239, 0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#d946ef",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        IPD
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#d946ef",
                          fontWeight: "800",
                        }}
                      >
                        {stats.counts.ipd || 0}
                      </span>
                    </div>

                    {showIpdDropdown && (
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
                            border: "1px solid rgba(217, 70, 239, 0.3)",
                            overflow: "hidden",
                            animation: "fadeInUp 0.2s ease-out",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 15px",
                              background: "rgba(217, 70, 239, 0.1)",
                              borderBottom: "1px solid rgba(217, 70, 239, 0.2)",
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
                                  color: "#d946ef",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                IPD Admissions
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#d946ef",
                                  color: "white",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "800",
                                }}
                              >
                                {stats.lists.ipd ? stats.lists.ipd.length : 0}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {stats.lists.ipd && stats.lists.ipd.length > 0 ? (
                                stats.lists.ipd.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handleIpdClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === stats.lists.ipd.length - 1
                                          ? "none"
                                          : "1px solid #f1f5f9",
                                      transition: "background 0.2s",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.background =
                                        "#fdf4ff")
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
                                          className="fa fa-hospital-o"
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
                                          {formatTime24(app.appointment_time)}
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
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
                                          Surgeon: {app.doctor_name || "N/A"}
                                        </span>
                                      </div>
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
                                    className="fa fa-hospital-o"
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
                                    No IPD Admissions today
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
