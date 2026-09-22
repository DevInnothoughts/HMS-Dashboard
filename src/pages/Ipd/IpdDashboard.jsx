import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import {
  Row,
  Col,
  Card,
  Container,
  Button,
  Badge,
  Spinner,
  Form,
  Modal,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Swal from "sweetalert2";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { decodeJwt } from "../Utility/decode-jwt";
import SimpleBar from "simplebar-react";

const BASE_URL = "http://194.195.117.79:5100/api";

const localizer = momentLocalizer(moment);

const CalendarCustomEvent = ({ event }) => (
  <div style={{ fontSize: "11px", lineHeight: "1.2" }}>
    <strong>{event.time}</strong>
    <div
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontWeight: "bold",
      }}
    >
      {event.patientName}
    </div>
  </div>
);

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

export default function IpdDashboard() {
  const navigate = useNavigate();
  const [surgeries, setSurgeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("day");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelComment, setCancelComment] = useState("");

  const [viewMode, setViewMode] = useState("list"); // "calendar" or "list"
  const [daySearchTerm, setDaySearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState(null); // null, "confirmed", "pending"
  const [billedInvoices, setBilledInvoices] = useState([]);

  const calendarRef = React.useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatSurgeries = useCallback((data) => {
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.result)
          ? data.result
          : [];

    return list.map((p) => {
      let surgeryMoment = null;
      let hasSurgeryDate = false;

      const rawSurgeryDate =
        p.surgery_datetime && p.surgery_datetime !== "Not Scheduled"
          ? p.surgery_datetime
          : p.surgery_date
            ? `${p.surgery_date} ${p.surgery_time || ""}`.trim()
            : null;

      if (rawSurgeryDate) {
        const parsed = moment(rawSurgeryDate, [
          "DD-MM-YYYY hh:mm A",
          "DD-MM-YYYY HH:mm",
          "DD-MM-YYYY HH:mm:ss",
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DD hh:mm A",
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "YYYY-MM-DDTHH:mm:ssZ",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
          moment.ISO_8601,
        ]);
        if (parsed.isValid()) {
          surgeryMoment = parsed;
          hasSurgeryDate = true;
        }
      }

      if (!surgeryMoment || !surgeryMoment.isValid()) {
        const fallbackDate =
          p.admission_datetime && p.admission_datetime !== "NOT ADMITTED"
            ? p.admission_datetime
            : p.created_at;
        surgeryMoment = moment(fallbackDate);
        if (!surgeryMoment.isValid()) {
          surgeryMoment = moment();
        }
      }

      const startTime = surgeryMoment.toDate();
      const endTime = surgeryMoment.clone().add(1, "hour").toDate();
      const patientName =
        p.name || p.patient_name || p.patientName || "Patient";
      const doctorName =
        p.surgeon_name || p.doctor_name || p.doctorName || "N/A";
      const phone = p.patient_phone || p.phone || p.contact || "";
      const uhid =
        p.uid ||
        p.uhid ||
        p.patient_uid ||
        p.Uid_no ||
        p.uid_no ||
        p.global_id ||
        (p.patient_id ? String(p.patient_id) : "") ||
        "";
      const age = p.age || "";
      const gender = p.sex || p.gender || "";

      const rawAdmNo = p.admission_no || p.adm_no || p.admissionNo;
      const isConfirmed = Boolean(
        rawAdmNo &&
        rawAdmNo !== 0 &&
        rawAdmNo !== "0" &&
        String(rawAdmNo).trim() !== "",
      );

      return {
        title: `${surgeryMoment.format("HH:mm")} — ${patientName}`,
        start: startTime,
        end: endTime,
        phone,
        date: surgeryMoment.format("DD-MM-YYYY"),
        time: surgeryMoment.format("HH:mm"),
        patientName,
        sxPlan: p.sx_plan || p.surgery_name || p.procedure || "",
        uhid,
        age,
        gender,
        patientid: p.patient_id || p.id,
        isConfirmed,
        admissionNo: isConfirmed ? rawAdmNo : null,
        doctorName,
        doctorId: p.doctor_id,
        confirmTime: p.created_at,
        hasSurgeryDate,
      };
    });
  }, []);

  // Fetch IPD bills to know which admissions already have a bill
  const fetchBilledUhids = useCallback(async () => {
    if (currentLocation === "default" || !currentLocation) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/invoice/listInvoice?location=${currentLocation}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.ok) {
        const result = await response.json();
        const rawData = Array.isArray(result.data?.[0])
          ? result.data[0]
          : Array.isArray(result.data)
            ? result.data
            : result || [];

        const invoicesList = rawData.map((inv) => {
          const uid = String(inv.patient_uid || inv.Uid_no || inv.uid || "")
            .trim()
            .toLowerCase();
          const phone = String(
            inv.patient_phone ||
              inv.phone ||
              inv.patient_phone_no ||
              inv.contact ||
              "",
          )
            .replace(/\D/g, "")
            .slice(-10);
          const rawAdmNo = String(
            inv.admission_no || inv.adm_no || inv.admissionno || "",
          ).trim();
          const admNo =
            rawAdmNo && rawAdmNo !== "0" && rawAdmNo.toUpperCase() !== "PENDING"
              ? rawAdmNo
              : null;
          const invDateRaw =
            inv.creation_date || inv.admissiondate || inv.adm_date || null;
          let formattedInvDate = null;
          if (invDateRaw) {
            const parsed = moment(invDateRaw);
            if (parsed.isValid())
              formattedInvDate = parsed.format("YYYY-MM-DD");
          }

          return {
            admissionNo: admNo,
            uid,
            phone,
            invDate: formattedInvDate,
            createdAt: inv.creation_date || null,
            admissionTime: inv.admissiontime || null,
            dischargeAt: inv.due_date || null,
            dischargeTime: inv.dischargetime || null,
            invoiceId: inv.invoice_id || null,
          };
        });

        setBilledInvoices(invoicesList);
        return invoicesList;
      }
    } catch (err) {
      console.error("Error fetching IPD bills:", err);
    }
  }, [currentLocation]);

  const getDedupeKey = (item) => {
    const uid = String(
      item.uid ||
        item.uhid ||
        item.patient_uid ||
        item.Uid_no ||
        item.uid_no ||
        item.global_id ||
        item.patient_id ||
        "",
    )
      .trim()
      .toLowerCase();

    const phone = String(item.patient_phone || item.phone || item.contact || "")
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

    const rawSxDate = String(
      item.surgery_datetime ||
        item.surgery_date ||
        item.admission_datetime ||
        item.adm_date ||
        item.created_at ||
        "",
    ).trim();

    let sxDateStr = rawSxDate;
    if (rawSxDate) {
      const parsed = moment(rawSxDate, [
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
      ]);
      if (parsed.isValid()) {
        sxDateStr = parsed.format("YYYY-MM-DD");
      }
    }

    if (uid && uid !== "0") return `uid_${uid}_${sxDateStr}`;
    if (phone && name) return `person_${phone}_${name}_${sxDateStr}`;
    if (phone) return `phone_${phone}_${sxDateStr}`;
    if (admNo && admNo !== "0" && admNo !== "pending")
      return `adm_${admNo}_${sxDateStr}`;

    return `id_${item.id || item.appointment_id || Math.random()}`;
  };

  const fetchSurgeries = useCallback(async () => {
    if (currentLocation === "default" || !currentLocation) return;
    setLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const endpoints = [
        `${BASE_URL}/V1/doctor/manage-admission/list?location=${encodeURIComponent(currentLocation)}`,
        `${BASE_URL}/V1/doctor/admission/list-admissions?location=${encodeURIComponent(currentLocation)}`,
        `${BASE_URL}/V1/ipd/admin/listVerifiedPatients?location=${encodeURIComponent(currentLocation)}&from=${moment().subtract(30, "days").format("YYYY-MM-DD")}&to=${moment().format("YYYY-MM-DD")}`,
      ];

      const responses = await Promise.allSettled(
        endpoints.map((url) => fetch(url, { method: "GET", headers })),
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
            console.error("JSON parse error from endpoint:", e);
          }
        }
      }

      // Deduplicate using composite key matching patient identity + normalized surgery date
      const uniqueMap = new Map();
      allRawData.forEach((item) => {
        const key = getDedupeKey(item);
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        } else {
          // Merge records for the same key, preserving valid admission numbers and cancellation status
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

      const uniqueRecords = Array.from(uniqueMap.values()).filter(
        (p) => !p.is_deleted || p.is_deleted === 0 || p.is_deleted === "0",
      );

      await fetchBilledUhids();
      const formattedEvents = formatSurgeries(uniqueRecords);
      setSurgeries(formattedEvents);
    } catch (error) {
      console.error("Error fetching surgeries:", error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, selectedDate, formatSurgeries, fetchBilledUhids]);

  useEffect(() => {
    fetchSurgeries();
  }, [fetchSurgeries]);

  const fetchDoctors = useCallback(async () => {
    if (currentLocation === "default" || !currentLocation) return;
    try {
      const url = `${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.statusCode === 200 && Array.isArray(data.data)) {
        setDoctors(data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    const handleSelectEvent = (e) => {
      const { uhid } = e.detail;
      const surgery = surgeries.find((s) => s.uhid === uhid);
      if (surgery) {
        setSelectedEvent(surgery);
        setViewMode("list");
      }
    };

    window.addEventListener("selectSurgery", handleSelectEvent);

    // Also check localStorage on mount/refresh
    const autoSelectUhid = localStorage.getItem("autoSelectSurgeryUhid");
    if (autoSelectUhid && surgeries.length > 0) {
      const surgery = surgeries.find((s) => s.uhid === autoSelectUhid);
      if (surgery) {
        setSelectedEvent(surgery);
        setViewMode("list");
        localStorage.removeItem("autoSelectSurgeryUhid");
      }
    }

    // Keep selectedEvent synchronized with latest surgeries list
    if (selectedEvent && surgeries.length > 0) {
      const updated = surgeries.find(
        (s) =>
          (s.uhid && s.uhid === selectedEvent.uhid) ||
          (s.patientid &&
            String(s.patientid) === String(selectedEvent.patientid)),
      );
      if (
        updated &&
        (updated.isConfirmed !== selectedEvent.isConfirmed ||
          updated.admissionNo !== selectedEvent.admissionNo)
      ) {
        setSelectedEvent(updated);
      }
    }

    return () => window.removeEventListener("selectSurgery", handleSelectEvent);
  }, [surgeries, selectedEvent]);

  const filteredSurgeries = useMemo(() => {
    return surgeries.filter((s) => {
      if (selectedDoctorId) {
        const docMatch =
          s.doctorName
            ?.toLowerCase()
            .includes(selectedDoctorId.toLowerCase()) ||
          String(s.doctorId) === String(selectedDoctorId);
        if (!docMatch) return false;
      }
      if (activeStatusFilter) {
        if (activeStatusFilter === "confirmed" && !s.isConfirmed) return false;
        if (activeStatusFilter === "pending" && s.isConfirmed) return false;
      }
      return true;
    });
  }, [surgeries, selectedDoctorId, activeStatusFilter]);

  const counts = useMemo(() => {
    if (viewMode === "list") {
      return filteredSurgeries.filter((event) => {
        return (
          event.hasSurgeryDate &&
          moment(event.start).isSame(selectedDate, "day")
        );
      }).length;
    } else {
      const monthStart = moment(selectedDate).clone().startOf("month");
      const monthEnd = moment(selectedDate).clone().endOf("month");
      return filteredSurgeries.filter((event) => {
        const eventDate = moment(event.start);
        return (
          eventDate.isSameOrAfter(monthStart, "day") &&
          eventDate.isSameOrBefore(monthEnd, "day")
        );
      }).length;
    }
  }, [filteredSurgeries, selectedDate, viewMode]);

  const handleCalendarNavigate = (newDate) => setSelectedDate(newDate);
  const handleCalendarView = (newView) => setCurrentView(newView);
  const handleRefreshClick = () => {
    fetchSurgeries();
    fetchBilledUhids();
    window.dispatchEvent(new CustomEvent("refreshIpdCount"));
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleConfirmSurgery = (contact, uhid) => {
    Swal.fire({
      title: "Confirm Admission?",
      text: "This will confirm the patient's admission.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#15ab56ff",
      cancelButtonColor: "#dc1818ff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${BASE_URL}/V1/doctor/manage-admission/confirm`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                contact,
                uhid,
                location: currentLocation,
              }),
            },
          );

          if (response.ok) {
            Swal.fire(
              "Confirmed!",
              "Admission confirmed successfully. You can now add an IPD bill and set the Admission Number.",
              "success",
            );
            setSelectedEvent((prev) =>
              prev
                ? {
                    ...prev,
                    isConfirmed: true,
                    status: "Admitted",
                    confirmTime: new Date().toISOString(),
                  }
                : null,
            );
            fetchSurgeries();
            window.dispatchEvent(new CustomEvent("refreshIpdCount"));
          } else {
            const err = await response.json();
            throw new Error(err.message || "Failed to confirm");
          }
        } catch (error) {
          Swal.fire(
            "Error",
            error.message || "Could not confirm admission",
            "error",
          );
        }
      }
    });
  };

  const handleCancelSurgery = () => {
    if (!selectedEvent) return;
    setCancelComment("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();

    if (!cancelComment.trim()) {
      Swal.fire(
        "Required",
        "Please provide a reason for cancellation",
        "warning",
      );
      return;
    }

    Swal.fire({
      title: "Cancel Surgery?",
      text: `Are you sure you want to cancel the surgery for ${selectedEvent.patientName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No",
      confirmButtonColor: "#dc3545",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Processing Cancellation...",
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false,
          });

          const response = await fetch(
            `${BASE_URL}/V1/ipd/admin/cancelAdmissionEntry`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                location: currentLocation,
                uhid: selectedEvent.uhid,
                contact: selectedEvent.phone,
                reason: cancelComment,
              }),
            },
          );

          const data = await response.json();
          if (response.ok) {
            setShowCancelModal(false);
            setCancelComment("");
            setSelectedEvent(null);

            Swal.fire(
              "Cancelled!",
              "The surgery entry has been removed.",
              "success",
            );

            fetchSurgeries();
            window.dispatchEvent(new CustomEvent("refreshIpdCount"));
          } else {
            throw new Error(data.message || "Failed to cancel entry");
          }
        } catch (error) {
          console.error("Cancellation error:", error);
          Swal.fire(
            "Error",
            error.message || "Server connection failed",
            "error",
          );
        }
      }
    });
  };

  const getBillInfo = useCallback(
    (event) => {
      if (!event || !billedInvoices || billedInvoices.length === 0) return null;

      const admKey = event.admissionNo ? String(event.admissionNo).trim() : "";
      const isConfirmedAdm =
        admKey && admKey !== "0" && admKey.toUpperCase() !== "PENDING";

      // 1. If admission has a confirmed admission number, match by admission_no ONLY
      if (isConfirmedAdm) {
        const matchByAdmNo = billedInvoices.find(
          (inv) =>
            inv.admissionNo &&
            inv.admissionNo.toLowerCase() === admKey.toLowerCase(),
        );
        if (matchByAdmNo) return matchByAdmNo;
      }

      // 2. If unconfirmed (PENDING) or if admission_no is missing/not matched yet:
      // Match by patient identity (uid or phone) AND exact admission/surgery date
      const uidKey = event.uhid ? String(event.uhid).trim().toLowerCase() : "";
      const phoneKey = event.phone
        ? String(event.phone).replace(/\D/g, "").slice(-10)
        : "";
      const eventDateStr = event.date
        ? moment(event.date, ["DD-MM-YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
        : null;

      if (eventDateStr && (uidKey || phoneKey)) {
        const matchByPatientAndDate = billedInvoices.find((inv) => {
          const matchesPatient =
            (uidKey && inv.uid === uidKey) ||
            (phoneKey && inv.phone === phoneKey);
          const matchesDate = inv.invDate === eventDateStr;
          return matchesPatient && matchesDate;
        });
        if (matchByPatientAndDate) return matchByPatientAndDate;
      }

      return null;
    },
    [billedInvoices],
  );

  const checkHasBill = useCallback(
    (event) => {
      return Boolean(getBillInfo(event));
    },
    [getBillInfo],
  );

  const eventStyleGetter = useCallback(
    (event) => {
      const hasBill = checkHasBill(event);
      const bgColor = hasBill
        ? "#10b981"
        : event.isConfirmed
          ? "#1e40af"
          : "#475569";
      return {
        style: {
          backgroundColor: bgColor,
          borderRadius: "4px",
          border: "none",
          color: "white",
          display: "block",
        },
      };
    },
    [checkHasBill],
  );

  const toggleStatusFilter = (status) => {
    setActiveStatusFilter((prev) => (prev === status ? null : status));
  };

  const ColorLegend = ({ name, type, count }) => {
    const isSelected = activeStatusFilter === type;
    return (
      <div
        onClick={() => toggleStatusFilter(type)}
        className={`color-legend-pill ${isSelected ? "selected" : ""}`}
        style={{
          padding: "4px 10px",
          minWidth: "fit-content",
          cursor: "pointer",
          border: isSelected ? "2px solid #0284c7" : "1.5px solid #009bad",
          borderRadius: "50px",
          backgroundColor: isSelected ? "#e0f2fe" : "#ffffff",
          transform: isSelected ? "translateY(-1.5px)" : "none",
          boxShadow: isSelected
            ? "0 4px 6px -1px rgba(2, 132, 199, 0.2)"
            : "0 1px 3px rgba(0, 0, 0, 0.05)",
          transition: "all 0.2s ease-in-out",
        }}
      >
        <div
          className="status-dot"
          style={{
            width: "11px",
            height: "11px",
            backgroundColor: "#475569",
            borderRadius: "50%",
            ...(isSelected
              ? {
                  transform: "scale(1.25)",
                  boxShadow: "0 0 8px rgba(71,85,105,0.4)",
                }
              : {}),
          }}
        ></div>
        <p
          style={{
            color: "#000000",
            fontWeight: isSelected ? "700" : "600",
            margin: 0,
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            whiteSpace: "nowrap",
          }}
        >
          {name}{" "}
          <span className="cnt" style={{ fontSize: "11px", color: "#000000" }}>
            ({count || 0})
          </span>
        </p>
      </div>
    );
  };

  const SurgeryDetailsCard = () => {
    if (!selectedEvent) {
      return (
        <div className="text-center py-5">
          <FeatherIcon
            icon="layers"
            size={45}
            className="text-muted opacity-25 mb-3"
          />
          <p className="text-muted" style={{ padding: "5px" }}>
            Select a surgery entry to view the patient detail and status.
          </p>
        </div>
      );
    }

    return (
      <div className="clinical-card" style={{ margin: "10px" }}>
        <div className="clinical-body">
          <div className="data-item-inline mt-4">
            <label>
              <FeatherIcon icon="calendar" size={14} /> Surgery Date & Time:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.date} &nbsp;{selectedEvent.time}
            </span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="info" size={14} /> Admission No:
            </label>
            <span className="data-value fw-bold">
              {!selectedEvent.admissionNo ||
              selectedEvent.admissionNo === "0" ||
              selectedEvent.admissionNo === 0 ||
              selectedEvent.admissionNo === "PENDING" ? (
                <span
                  className="selectable-text text-danger fw-bold"
                  title="Confirm admission and create an IPD bill. The assigned admission number will reflect here."
                  style={{ cursor: "help" }}
                >
                  Pending
                </span>
              ) : (
                selectedEvent.admissionNo
              )}
            </span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="hash" size={14} /> UID No:
            </label>
            <span className="data-value fw-bold">{selectedEvent.uhid}</span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="user" size={14} />
              Patient Name:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.patientName}
            </span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="phone" size={14} /> Contact No:
            </label>
            <span className="data-value fw-bold">{selectedEvent.phone}</span>
          </div>
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="info" size={14} /> Age/Gender:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.age} yrs / {selectedEvent.gender}
            </span>
          </div>
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="activity" size={14} /> Surgeon:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.doctorName || "N/A"}
            </span>
          </div>
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="clipboard" size={14} /> SX Plan:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.sxPlan || "N/A"}
            </span>
          </div>
        </div>

        <div
          className="mb-3"
          style={{ borderTop: "1px solid #a3b1b4ff" }}
        ></div>

        {selectedEvent.isConfirmed && !checkHasBill(selectedEvent) && (
          <div
            className="d-flex align-items-center p-3 mb-3"
            style={{
              borderRadius: "8px",
              backgroundColor: "#eff6ff",
              color: "#1e40af",
              border: "1px solid rgba(30, 64, 175, 0.2)",
            }}
          >
            <FeatherIcon icon="check-circle" size={20} className="me-2" />
            <div className="d-flex align-items-center py-2 justify-content-between flex-grow-1">
              <strong>Admission Confirmed</strong>
              <div
                style={{
                  fontSize: "13px",
                  opacity: 1.0,
                  marginLeft: "10px",
                  textAlign: "right",
                }}
              >
                {`Admitted at: ${
                  selectedEvent.confirmTime && selectedEvent.confirmTime !== "0"
                    ? moment(selectedEvent.confirmTime).format("HH:mm")
                    : "N/A"
                }`}
              </div>
            </div>
          </div>
        )}

        <div className="clinical-actions pt-2">
          <div className="d-grid gap-1">
            {selectedEvent.isConfirmed ? (
              <>
                {checkHasBill(selectedEvent) &&
                  (() => {
                    const billInfo = getBillInfo(selectedEvent);
                    const madeAt = billInfo?.admissionTime
                      ? billInfo.admissionTime
                      : billInfo?.createdAt
                        ? moment(billInfo.createdAt).format("HH:mm")
                        : "N/A";
                    const dischargeAt = billInfo?.dischargeTime
                      ? billInfo.dischargeTime
                      : billInfo?.dischargeAt
                        ? moment(billInfo.dischargeAt).format("DD-MM-YY")
                        : "N/A";
                    return (
                      <div
                        className="d-flex align-items-center p-3 mb-3"
                        style={{
                          borderRadius: "8px",
                          backgroundColor: "#ecfdf5",
                          color: "#10b981",
                          border: "1px solid rgba(16, 185, 129, 0.2)",
                        }}
                      >
                        <FeatherIcon
                          icon="file-text"
                          size={20}
                          className="me-2"
                          style={{ flexShrink: 0 }}
                        />
                        <div className="d-flex align-items-center py-2 justify-content-between flex-grow-1">
                          <strong>IPD Bill Made</strong>
                          <div
                            style={{
                              fontSize: "13px",
                              opacity: 1.0,
                              marginLeft: "10px",
                              textAlign: "right",
                            }}
                          >
                            <div>Made at: {dischargeAt}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                <Button
                  className="d-flex align-items-center justify-content-center"
                  onClick={() => {
                    localStorage.setItem("autoSelectUhid", selectedEvent.uhid);
                    navigate("/ipd-admission-list");
                  }}
                  style={{
                    backgroundColor: "#178aaeff",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "13px",
                    padding: "8px",
                    transition: "all 0.2s ease-in-out",
                    width: "100%",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#1199bbff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#178aaeff";
                  }}
                >
                  <FeatherIcon icon="eye" size={14} className="me-2" />
                  View Patient Details
                </Button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  className="confirm-btn flex-grow-1"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                  onClick={() =>
                    handleConfirmSurgery(
                      selectedEvent.phone,
                      selectedEvent.uhid,
                    )
                  }
                >
                  <FeatherIcon icon="check-circle" size={16} className="me-1" />
                  Confirm Admission
                </Button>

                <Button
                  variant="danger"
                  className="flex-grow-1"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                  onClick={handleCancelSurgery}
                >
                  <FeatherIcon icon="x-circle" size={14} className="me-1" />
                  Cancel Admission
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <style>{`
.sidebar-wrapper, 
.header-wrapper, 
.page-main-header { 
    z-index: 9999 !important; 
}

.theme-body { 
    position: relative; 
    z-index: 1; 
}

.dashboard-header-bar {
    background: #fff; 
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.03); 
    margin-bottom: 10px;
    border: 2px solid rgb(77, 208, 225);
    padding: 1px;
    position: relative;
    z-index: 5;
}

.legend-title { 
    font-size: 7px; 
    color: #1eb3caff; 
    font-weight: 700; 
    margin-bottom: 5px; 
    letter-spacing: 0.4px; 
    text-transform: uppercase;
}

.legend-item { 
    display: flex; 
    align-items: center; 
    margin-right: 22px; 
    font-size: 13px; 
    font-weight: 600; 
    color: rgb(0, 0, 0); 
}

.dot { 
    width: 9px; 
    height: 9px; 
    border-radius: 50%; 
    margin-right: 6px; 
}

.rbc-calendar { 
    background: #fff; 
    border-radius: 12px; 
    padding: 3px;
    position: relative;
    z-index: 1;
    overflow: visible !important; 
}

.rbc-toolbar .rbc-toolbar-label {
    font-weight: 800 !important;
    font-size: 20px !important;
    color: #0f172a !important;
    letter-spacing: 0.5px;
}

.rbc-header { 
    padding: 12px 0 !important; 
    font-weight: 7000 !important; 
    color: rgb(0, 0, 0) !important; 
    border-bottom: 2px solid #f1f5f9 !important; 
}

.rbc-show-more { 
    color: #016f69ff !important; 
    background: #b0eff3ff !important; 
    border-radius: 4px !important; 
    font-weight: 900 !important; 
    font-size: 11px !important; 
    padding: 2px 6px !important; 
}

.rbc-overlay { 
    position: absolute !important;
    z-index: 100000 !important; 
    background: #fff !important;
    border: 1.5px solid #00bcd4 !important;
    border-radius: 10px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
    padding: 8px !important;
    min-width: 230px !important;
    width: max-content !important;
    max-width: 320px !important;
    max-height: 350px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
}

.rbc-overlay .rbc-event {
    margin-bottom: 4px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}

.rbc-overlay-header {
    border-bottom: 1px solid #cbd5e1 !important;
    padding: 8px 10px 6px 10px !important;
    margin: -8px -8px 6px -8px !important;
    font-weight: 700 !important;
    font-size: 13px !important;
    color: #0f172a !important;
    position: sticky !important;
    top: -8px !important;
    background: #ffffff !important;
    z-index: 10 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}

.rbc-row-segment .rbc-show-more {
    margin-top: 2px;
    display: block;
    text-align: center;
}

.rbc-month-row {
    overflow: visible !important;
}

.clinical-header-centered {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
}

.patient-name { 
    margin: 5px 0; 
    font-weight: 700; 
    color: #0447a5ff; 
    font-size: 15px;
}

.data-item-inline {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
}

.data-item-inline label {
    display: flex;
    align-items: center;
    width: 165px; 
    white-space: nowrap;
    color: #575d66ff;
    font-weight: 600;
    margin-bottom: 0;
    margin-right: 10px;
}

.data-item-inline label svg { margin-right: 9px; }

.confirm-btn {
    background-color: #1eb3caff;
    border: none;
    padding: 10px;
    font-weight: 600;
}

.confirm-btn:hover {
    background-color: #178aaeff;
}

.day-list-container {
    background: #fff;
    border-radius: 12px;
    padding: 10px;
}

.appointment-list-scroll {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 5px;
}

.appointment-list-scroll::-webkit-scrollbar {
    width: 6px;
}

.appointment-list-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
}

.appointment-list-scroll::-webkit-scrollbar-thumb {
    background: #00bcd4;
    border-radius: 10px;
}

.appointment-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    transition: all 0.2s ease;
    cursor: pointer;
    border-radius: 8px;
    margin-bottom: 8px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.appointment-item:hover {
    background-color: #f8fafc;
    transform: translateX(5px);
}

.appointment-item.active {
    background-color: #f0f9ff;
    border: 1px solid #00bcd4;
    box-shadow: 0 4px 6px -1px rgba(0, 188, 212, 0.1);
}

.time-slot {
    min-width: 65px;
    font-weight: 700;
    color: #1e293b;
    font-size: 13px;
}

.patient-info {
    flex-grow: 1;
    margin-left: 10px;
}

.patient-name-text {
    font-weight: 600;
    color: #0f172a;
    font-size: 15px;
}

.doctor-info-text {
    font-size: 12px;
    color: #586679ff;
}

.status-badge-container {
    margin-left: 15px;
}

.view-toggle-btn {
    border-radius: 8px;
    padding: 5px 12px;
    font-weight: 600;
    font-size: 12px;
    transition: all 0.3s ease;
}

.view-toggle-btn.active {
    background-color: #00bcd4;
    color: white;
    border-color: #00bcd4;
}
        `}</style>
      <PageBreadcrumb pagename="IPD Dashboard" />
      <div className="theme-body">
        <Container fluid>
          <div className="dashboard-header-bar" style={{ marginTop: "10px" }}>
            <Row className="align-items-center">
              <Col lg={7}>
                <div className="legend-title">
                  <h4 className="fw-bold mb-10">
                    {viewMode === "list" ? (
                      "Today's Surgery Overview"
                    ) : (
                      <>
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "20px",
                            color: "#000000ff",
                          }}
                        >
                          Patient Surgery Calendar for
                        </span>{" "}
                        <span
                          style={{ fontWeight: "700", color: "#007e8bff" }}
                        ></span>
                        {moment(selectedDate).format("MMMM YYYY")}
                      </>
                    )}
                  </h4>
                </div>
                <div
                  className="d-flex align-items-center flex-nowrap"
                  style={{ gap: "6px", position: "relative", zIndex: 2 }}
                >
                  <ColorLegend
                    name="IPD Patient"
                    type="surgery"
                    count={counts}
                    bgColor="#d946ef"
                  />
                </div>
              </Col>
              <Col lg={5}>
                <div className="d-flex align-items-end justify-content-lg-end gap-3 mt-3 mt-lg-0">
                  <div
                    className="d-flex flex-column"
                    style={{
                      justifyContent: "center",
                      alignContent: "center",
                      alignSelf: "center",
                    }}
                  >
                    <label
                      className="text-muted fw-bold mb-2"
                      style={{ fontSize: "13px" }}
                    >
                      Filter by Doctor:
                    </label>
                    <Form.Select
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      value={selectedDoctorId}
                      style={{
                        width: "200px",
                        height: "30px",
                        borderRadius: "8px",
                        border: "1px solid #00bcd4",
                        fontSize: "11px",
                      }}
                    >
                      <option value="">All Doctors</option>
                      {doctors.map((doc) => (
                        <option key={doc.doctor_id} value={doc.doctor_id}>
                          {doc.name}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedDoctorId("");
                      setActiveStatusFilter(null);
                      setDaySearchTerm("");
                    }}
                    style={{
                      backgroundColor: "#ff9800",
                      color: "white",
                      border: "none",
                      height: "27px",
                      width: "90px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "12px",
                      padding: 0,
                      borderRadius: "10px",
                      alignSelf: "flex-end",
                      marginBottom: "3px",
                    }}
                  >
                    <FeatherIcon icon="filter" size={10} className="me-1" />
                    Clear Filter
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          <Row>
            <Col xxl={8} xl={8} lg={12} className="mb-4">
              <Card
                className="border-0 shadow-sm"
                style={{ borderRadius: "10px" }}
              >
                <Card.Header
                  className="bg-white py-2 px-3 d-flex justify-content-between align-items-center"
                  style={{
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    border: "2px solid rgb(77, 208, 225)",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FeatherIcon
                      icon={viewMode === "calendar" ? "calendar" : "list"}
                      size={18}
                      className="text-primary me-2"
                    />
                    <h6 className="mb-0 fw-bold text-dark">
                      {viewMode === "calendar"
                        ? "Calendar View"
                        : "Day Schedule"}
                    </h6>
                  </div>
                  <div className="btn-group bg-light p-1 rounded-3">
                    <Button
                      variant={viewMode === "calendar" ? "primary" : "light"}
                      className={`view-toggle-btn py-1 px-3 ${viewMode === "calendar" ? "active shadow-sm" : ""}`}
                      onClick={() => {
                        setViewMode("calendar");
                        setCurrentView("month");
                      }}
                      size="sm"
                      style={{
                        height: "28px",
                        border: "none",
                        fontSize: "11px",
                      }}
                    >
                      Calendar
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "primary" : "light"}
                      className={`view-toggle-btn py-1 px-3 ${viewMode === "list" ? "active shadow-sm" : ""}`}
                      onClick={() => {
                        setViewMode("list");
                        setCurrentView("day");
                        setSelectedDate(new Date());
                      }}
                      size="sm"
                      style={{
                        height: "28px",
                        border: "none",
                        fontSize: "11px",
                      }}
                    >
                      Day Schedule
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body
                  className="p-3"
                  style={{
                    border: "2px solid rgb(77, 208, 225)",
                    borderTop: "none",
                    borderBottomLeftRadius: "10px",
                    borderBottomRightRadius: "10px",
                    overflow: "visible",
                  }}
                >
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="info" />
                    </div>
                  ) : viewMode === "calendar" ? (
                    <Calendar
                      ref={calendarRef}
                      localizer={localizer}
                      events={filteredSurgeries}
                      date={selectedDate}
                      view={currentView}
                      onNavigate={handleCalendarNavigate}
                      onSelectEvent={handleEventClick}
                      onView={handleCalendarView}
                      eventPropGetter={eventStyleGetter}
                      components={{ event: CalendarCustomEvent }}
                      style={{ height: 830 }}
                      popup={true}
                      views={{
                        month: true,
                        week: true,
                        day: true,
                      }}
                      length={3}
                      maxEvents={3}
                    />
                  ) : (
                    <div className="day-list-container">
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div
                            className="search-box-day"
                            style={{
                              position: "relative",
                              marginBottom: "5px",
                            }}
                          >
                            <FeatherIcon
                              icon="search"
                              size={14}
                              style={{
                                position: "absolute",
                                left: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#94a3b8",
                              }}
                            />
                            <Form.Control
                              type="text"
                              placeholder="Search name or contact..."
                              value={daySearchTerm}
                              onChange={(e) => setDaySearchTerm(e.target.value)}
                              style={{
                                paddingLeft: "32px",
                                height: "32px",
                                fontSize: "12px",
                                borderRadius: "8px",
                                border: "1.5px solid #00bcd4",
                                backgroundColor: "#fdfdfd",
                                width: "220px",
                              }}
                            />
                          </div>
                          <Badge bg="primary" className="p-6">
                            {
                              filteredSurgeries.filter(
                                (s) =>
                                  s.hasSurgeryDate &&
                                  moment(s.start).isSame(selectedDate, "day"),
                              ).length
                            }{" "}
                            Surgeries
                          </Badge>
                        </div>
                      </div>

                      <SimpleBar style={{ maxHeight: "400px" }}>
                        <div className="appointment-list-scroll">
                          {filteredSurgeries
                            .filter((s) => {
                              if (!s.hasSurgeryDate) return false;
                              const isSameDay = moment(s.start).isSame(
                                selectedDate,
                                "day",
                              );
                              if (!isSameDay) return false;

                              const term = daySearchTerm.toLowerCase();
                              const nameMatch = s.patientName
                                ?.toLowerCase()
                                .includes(term);
                              const phoneMatch = s.phone
                                ?.toLowerCase()
                                .includes(term);

                              return nameMatch || phoneMatch;
                            })
                            .sort((a, b) =>
                              moment(a.start).diff(moment(b.start)),
                            )
                            .map((s, index) => {
                              const hasBill = checkHasBill(s);
                              const listStatus = hasBill
                                ? {
                                    text: "Bill Made",
                                    color: "#10b981",
                                    bg: "#ecfdf5",
                                    rowBg: "#ecfdf5",
                                    rowBorder: "#10b981",
                                  }
                                : s.isConfirmed
                                  ? {
                                      text: "Admitted",
                                      color: "#1e40af",
                                      bg: "#eff6ff",
                                      rowBg: "#eff6ff",
                                      rowBorder: "#1e40af",
                                    }
                                  : {
                                      text: "Pending",
                                      color: "#475569",
                                      bg: "#f1f5f9",
                                      rowBg: "#ffffff",
                                      rowBorder: "#cbd5e1",
                                    };
                              const indicatorColor = hasBill
                                ? "#10b981"
                                : s.isConfirmed
                                  ? "#1e40af"
                                  : "#334155";
                              const isActive = selectedEvent?.uhid === s.uhid;
                              const isPending = !s.isConfirmed && !hasBill;

                              const itemStyle = isPending
                                ? {
                                    position: "relative",
                                    backgroundColor: isActive
                                      ? "#f0f9ff"
                                      : "#ffffff",
                                    border: isActive
                                      ? "1.5px solid #0284c7"
                                      : "1px solid #cbd5e1",
                                    boxShadow: isActive
                                      ? "0 4px 6px -1px rgba(2, 132, 199, 0.15)"
                                      : "0 1px 3px rgba(0,0,0,0.02)",
                                  }
                                : {
                                    position: "relative",
                                    backgroundColor: listStatus.rowBg,
                                    border: isActive
                                      ? `2px solid ${listStatus.rowBorder}`
                                      : `1.5px solid ${listStatus.rowBorder}80`,
                                    boxShadow: isActive
                                      ? `0 4px 8px -1px ${listStatus.color}40`
                                      : `0 1px 3px ${listStatus.color}20`,
                                  };

                              return (
                                <div
                                  key={s.uhid || index}
                                  className={`appointment-item ${isActive ? "active" : ""}`}
                                  onClick={() => handleEventClick(s)}
                                  style={itemStyle}
                                >
                                  <div className="time-slot">{s.time}</div>
                                  <div
                                    className="type-indicator mx-1"
                                    style={{
                                      width: "4px",
                                      height: "35px",
                                      backgroundColor: indicatorColor,
                                      borderRadius: "2px",
                                    }}
                                  ></div>
                                  <div className="patient-info">
                                    <div className="patient-name-text">
                                      {s.patientName}
                                    </div>
                                    <div className="doctor-info-text">
                                      <FeatherIcon
                                        icon="activity"
                                        size={12}
                                        className="me-1"
                                      />
                                      {s.doctorName}
                                    </div>
                                  </div>
                                  <div
                                    className="status-badge-container d-flex gap-2 align-items-center"
                                    style={{
                                      position: "absolute",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      margin: 0,
                                    }}
                                  >
                                    <span
                                      style={{
                                        backgroundColor: indicatorColor,
                                        color: "white",
                                        fontSize: "10px",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        minWidth: "70px",
                                        display: "inline-block",
                                        textAlign: "center",
                                        fontWeight: "700",
                                      }}
                                    >
                                      IPD
                                    </span>
                                  </div>
                                  {listStatus && (
                                    <div className="d-flex align-items-center me-3">
                                      <span
                                        style={{
                                          backgroundColor: listStatus.bg,
                                          color: indicatorColor,
                                          border: `1px solid ${indicatorColor}60`,
                                          fontSize: "10px",
                                          padding: "2px 8px",
                                          borderRadius: "4px",
                                          minWidth: "70px",
                                          display: "inline-block",
                                          textAlign: "center",
                                          fontWeight: "700",
                                          textTransform: "uppercase",
                                        }}
                                      >
                                        {listStatus.text}
                                      </span>
                                    </div>
                                  )}
                                  <div className="ms-3">
                                    <FeatherIcon
                                      icon="chevron-right"
                                      size={16}
                                      className="text-muted"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </SimpleBar>

                      {filteredSurgeries.filter(
                        (s) =>
                          s.hasSurgeryDate &&
                          moment(s.start).isSame(selectedDate, "day"),
                      ).length === 0 && (
                        <div className="text-center py-5">
                          <FeatherIcon
                            icon="calendar"
                            size={50}
                            className="text-muted mb-3 opacity-25"
                          />
                          <p className="text-muted">
                            No surgeries scheduled for this day.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col xxl={4} xl={4} lg={12}>
              <Card
                className="shadow-sm border-0"
                style={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "2px solid rgb(77, 208, 225)",
                }}
              >
                <Card.Header
                  className="bg-white py-3 d-flex justify-content-center align-items-center"
                  style={{ borderBottom: "1px solid rgb(77, 208, 225)" }}
                >
                  <div className="d-flex align-items-center justify-content-center w-100">
                    <div
                      className="d-flex align-items-center justify-content-center me-1"
                      style={{
                        background: "#e0f2fe",
                        width: "27px",
                        height: "27px",
                        borderRadius: "10px",
                        flexShrink: 0,
                      }}
                    >
                      <FeatherIcon
                        icon="clipboard"
                        size={16}
                        className="text-primary"
                      />
                    </div>
                    <h5
                      className="mb-0 fw-bold"
                      style={{
                        color: "#3f444bff",
                        whiteSpace: "nowrap",
                        fontSize: "16px",
                        padding: "7px",
                      }}
                    >
                      Surgery Details
                    </h5>
                  </div>
                </Card.Header>
                <Card.Body>
                  <SurgeryDetailsCard />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }}
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          >
            <FeatherIcon
              className="me-2"
              icon="trash"
              size="17"
              style={{ color: "#1a5b61ff" }}
            />
            Reason of Cancellation <span className="text-danger">*</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-1 pt-0">
          <Form style={{ padding: "10px" }} onSubmit={handleCancelSubmit}>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={4}
                value={cancelComment}
                onChange={(e) => setCancelComment(e.target.value)}
                placeholder="Enter the cancellation reason..."
                className="p-5"
                style={{
                  border: "1px solid #008cc8ff",
                  borderRadius: "10px",
                  marginBottom: "10px",
                }}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                variant="danger"
                type="submit"
                className="fw-bold px-4"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  padding: "10px",
                }}
              >
                Confirm & Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
