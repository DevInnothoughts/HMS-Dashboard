import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../pages/api/useSidebarContext";
import "font-awesome/css/font-awesome.min.css";
import { decodeJwt } from "../../pages/Utility/decode-jwt";
import FeatherIcon from "feather-icons-react";
import SimpleBar from "simplebar-react";
import moment from "moment";

export default function IpdHeader() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [surgeryCounts, setSurgeryCounts] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [confirmedSurgeries, setConfirmedSurgeries] = useState([]);
  const [pendingSurgeries, setPendingSurgeries] = useState([]);
  const [cancelledSurgeries, setCancelledSurgeries] = useState([]);
  const [showPendingDropdown, setShowPendingDropdown] = useState(false);
  const [showConfirmedDropdown, setShowConfirmedDropdown] = useState(false);
  const [showCancelledDropdown, setShowCancelledDropdown] = useState(false);

  const getSurgeryTime = (p) => {
    const surgeryVal =
      p.surgery_datetime && p.surgery_datetime !== "Not Scheduled"
        ? p.surgery_datetime
        : p.surgery_date
          ? `${p.surgery_date} ${p.surgery_time || ""}`.trim()
          : null;

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

    if (surgeryVal) {
      const parsed = moment(surgeryVal, dateFormats);
      if (parsed.isValid()) {
        return parsed.format("HH:mm");
      }
      return surgeryVal;
    }
    if (p.surgery_time) {
      return p.surgery_time;
    }
    if (p.adm_time) {
      return p.adm_time;
    }
    if (p.admission_datetime && p.admission_datetime !== "NOT ADMITTED") {
      const parsedAdm = moment(p.admission_datetime, dateFormats);
      if (parsedAdm.isValid()) return parsedAdm.format("HH:mm");
    }
    if (p.created_at) {
      const parsedCreated = moment(p.created_at, dateFormats);
      if (parsedCreated.isValid()) return parsedCreated.format("HH:mm");
    }
    return "N/A";
  };

  const fetchIpdCount = useCallback(async () => {
    if (!currentLocation) return;
    try {
      const BASE_URL = "http://194.195.117.79:5100/api";
      const todayStr = moment().format("YYYY-MM-DD");

      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const endpoints = [
        `${BASE_URL}/V1/doctor/admission/list-admissions?location=${encodeURIComponent(currentLocation)}`,
        `${BASE_URL}/V1/doctor/manage-admission/list?location=${encodeURIComponent(currentLocation)}&from=${todayStr}&to=${todayStr}`,
        `${BASE_URL}/V1/doctor/manage-admission/list?location=${encodeURIComponent(currentLocation)}`,
        `${BASE_URL}/V1/ipd/admin/listVerifiedPatients?location=${encodeURIComponent(currentLocation)}&from=${todayStr}&to=${todayStr}&includeDeleted=true`,
      ];

      const responses = await Promise.allSettled(
        endpoints.map((url) => fetch(url, { headers })),
      );

      let allRawData = [];

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
              allRawData.push(...list);
            }
          } catch (e) {
            console.error("JSON parse error in IPD header:", e);
          }
        }
      }

      // Deduplicate using composite key based on patient identity
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
      allRawData.forEach((item) => {
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
      const uniqueRecords = Array.from(uniqueMap.values());

      // Filter for records relevant to TODAY
      const isTodayRecord = (p) => {
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

      const todayRecords = uniqueRecords.filter(isTodayRecord);
      const recordsToUse = todayRecords;

      // Normalize items
      const normalizedData = recordsToUse.map((p) => ({
        ...p,
        name: p.name || p.patient_name || p.patientName || "Patient",
        uid: p.uid || p.uhid || p.patient_uid || p.patient_id || p.uid_no || "",
        patient_phone: p.patient_phone || p.phone || p.contact || "",
        surgeon_name: p.surgeon_name || p.doctor_name || p.doctorName || "N/A",
        doctor_name: p.doctor_name || p.surgeon_name || p.doctorName || "N/A",
        admission_no: p.admission_no || p.adm_no || p.admissionNo || null,
      }));

      const activePatients = normalizedData.filter((p) => !p.is_deleted);
      const cancelled = normalizedData.filter((p) => p.is_deleted);

      const isConfirmedPatient = (p) => {
        const admNo = p.admission_no;
        return Boolean(
          admNo && admNo !== 0 && admNo !== "0" && String(admNo).trim() !== "",
        );
      };

      const confirmed = activePatients.filter((p) => isConfirmedPatient(p));
      const pending = activePatients.filter((p) => !isConfirmedPatient(p));

      setConfirmedSurgeries(confirmed);
      setPendingSurgeries(pending);
      setCancelledSurgeries(cancelled);

      setSurgeryCounts({
        total: confirmed.length + pending.length + cancelled.length,
        confirmed: confirmed.length,
        pending: pending.length,
        cancelled: cancelled.length,
      });
    } catch (error) {
      console.error("Error fetching IPD count:", error);
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
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchIpdCount();
      const interval = setInterval(fetchIpdCount, 30000); // update every 30 seconds

      const handleRefresh = () => {
        fetchIpdCount();
      };
      window.addEventListener("refreshIpdCount", handleRefresh);

      return () => {
        clearInterval(interval);
        window.removeEventListener("refreshIpdCount", handleRefresh);
      };
    }
  }, [currentLocation, fetchIpdCount]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const { toggleSidebar } = useSidebarContext();

  const handlePatientClick = (app) => {
    localStorage.setItem("autoSelectSurgeryUhid", app.uid);
    window.dispatchEvent(
      new CustomEvent("selectSurgery", {
        detail: {
          uhid: app.uid,
          patientName: app.name,
        },
      }),
    );
    setShowPendingDropdown(false);
    setShowConfirmedDropdown(false);
    setShowCancelledDropdown(false);
    navigate("/ipd-dashboard");
  };

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
                      Today's Surgery Summary
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
                      {surgeryCounts.total}
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
                        {surgeryCounts.confirmed}
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
                                Confirmed Surgeries
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
                                {confirmedSurgeries.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {confirmedSurgeries.length > 0 ? (
                                confirmedSurgeries.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === confirmedSurgeries.length - 1
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
                                        {app.name}
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
                                          {getSurgeryTime(app)}
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
                                        {app.doctor_name || "N/A"}
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
                                    No confirmed surgeries for today
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
                        {surgeryCounts.pending}
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
                                Pending Surgeries
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
                                {pendingSurgeries.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {pendingSurgeries.length > 0 ? (
                                pendingSurgeries.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === pendingSurgeries.length - 1
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
                                        {app.name}
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
                                          {getSurgeryTime(app)}
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
                                        {app.doctor_name || "N/A"}
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
                                    No pending surgeries for today
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
                        {surgeryCounts.cancelled}
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
                                Cancelled Surgeries
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
                                {cancelledSurgeries.length}
                              </span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: "295px" }}>
                            <div style={{ padding: "2px" }}>
                              {cancelledSurgeries.length > 0 ? (
                                cancelledSurgeries.map((app, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handlePatientClick(app)}
                                    style={{
                                      padding: "12px",
                                      borderBottom:
                                        idx === cancelledSurgeries.length - 1
                                          ? "none"
                                          : "1px solid #f1f5f9",
                                      transition: "background 0.2s",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.background =
                                        "#fef2f2")
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
                                        {app.name}
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
                                          {getSurgeryTime(app)}
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
                                        Reason: {app.cancel_reason || "N/A"}
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
                                    No cancelled surgeries for today
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
                  onClick={() => navigate("/add-ipd-admission")}
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
                    className="fa fa-user-plus"
                    style={{ fontSize: "14px" }}
                  ></i>
                  Add IPD Admission
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
