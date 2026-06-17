import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import FeatherIcon from "feather-icons-react";
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css";
import { toast } from "react-hot-toast";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const NoteCell = ({ note }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!note) return <span>-</span>;

  const noteStyle = {
    whiteSpace: isExpanded ? "normal" : "nowrap",
    textAlign: "center",
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "150px", // Limits width to trigger the dots
    cursor: "pointer",
    display: "block",
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      title={!isExpanded ? "Click to expand" : "Click to collapse"}
      style={noteStyle}
    >
      {note}
    </div>
  );
};

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

export default function Call_logs({ isTab = false }) {
  const [CallLogs, setCallLogs] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: "",
    doctorName: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [enquiryTypes, setEnquiryTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDbSearching, setIsDbSearching] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedCallLog, setSelectedCallLog] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [noPendingAppt, setNoPendingAppt] = useState(true);

  function formatDate(date) {
    return new Date(date);
  }

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const handleAddAppointmentClick = async (rowData) => {

    const today = new Date();
    const patient_phone = rowData.caller_no || "";
    setNoPendingAppt(true);

    setFormData((prev) => ({
      ...prev,
      date: moment(today).format("YYYY-MM-DD"),
      caller_no: patient_phone,
      appointmentTime: rowData.call_time || "",
      note: rowData.note || "",
      patientName: "",
      doctor_id: "",
      FDE_Name: "",
      patient_type: "",
      patient_id: undefined,
    }));

    if (!patient_phone) {
      setShowAddModal(true);
      return;
    }

    let hasPendingAppt = false;
    try {
      const confirmUrl = `${BASE_URL}/V1/appointment/getPatientByApptConfirm?patient_phone=${patient_phone}&location=${currentLocation}`;
      const confirmResponse = await fetch(confirmUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (confirmResponse.status === 400) {
        Swal.fire({
          icon: "warning",
          title: "Pending Appointment",
          text: "Pending appointment, close that appointment first.",
          confirmButtonColor: "#f39c12",
        });
        setNoPendingAppt(false);
        hasPendingAppt = true;
      } else {
        setNoPendingAppt(true);
      }
    } catch (innerError) {
      console.error("Error in confirmation check API call:", innerError);
    }

    try {
      const url = `${BASE_URL}/V1/appointment/getPatientByMobile?patient_phone=${patient_phone}&location=${currentLocation}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200 && data.data) {
          if (!hasPendingAppt) {
            Swal.fire({
              icon: "warning",
              title: "Patient Found",
              text: `${data.data.name} is already registered.`,
              confirmButtonColor: "#00bcd4",
              timer: 2000,
            });
          }

          setFormData((prev) => ({
            ...prev,
            patient_id: data.data.patient_id,
            patientName: data.data.name || "",
            patient_type: "",
          }));
        } else {
          setFormData((prev) => ({ ...prev, patient_type: "New" }));
        }
      } else {
        setFormData((prev) => ({ ...prev, patient_type: "New" }));
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      setFormData((prev) => ({ ...prev, patient_type: "New" }));
    }

    setShowAddModal(true);
  };

  const [enquiryForm, setEnquiryForm] = useState({
    call_date: "",
    enquirytype: "",
    patient_name: "",
    caller_no: "",
    FDE_Name: "",
    note: "",
  });

  // const formatToApiDate = (date) => {
  //   const validDate = date instanceof Date ? date : new Date(date);
  //   if (isNaN(validDate)) {
  //     console.error("Invalid date:", date);
  //     return null;
  //   }
  //   const day = String(validDate.getDate()).padStart(2, "0");
  //   const month = String(validDate.getMonth() + 1).padStart(2, "0");
  //   const year = validDate.getFullYear();
  //   return `${day}-${month}-${year}`;
  // };

  const formatToApiDate = (date) => {
    if (!date) return null;
    // Use moment to ensure we get the correct Day-Month-Year regardless of UTC offset
    return moment(date).format("DD-MM-YYYY");
  };

  const searchFromDatabase = async (query) => {
    if (!currentLocation || currentLocation === "default" || isDbSearching)
      return;

    setIsDbSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/ivrdata/searchIvrdata?query=${encodeURIComponent(
          query,
        )}&location=${currentLocation}`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setCallLogs((prev) => {
            const existingIds = new Set(prev.map((log) => log.ivr_id));
            const newUniqueLogs = data.data
              .map((log) => ({
                ...log,
                caller_no: log.caller_no
                  ? String(log.caller_no).replace(/^0+/, "")
                  : log.caller_no,
              }))
              .filter((log) => !existingIds.has(log.ivr_id));
            return [...prev, ...newUniqueLogs];
          });
        }
      }
    } catch (error) {
      console.error("Error searching call logs from database:", error);
    } finally {
      setIsDbSearching(false);
    }
  };

  useEffect(() => {
    const searchValue = filters1.global.value;
    if (!searchValue || searchValue.length < 3) return;

    const hasLocalMatches = CallLogs.some((log) => {
      const lowerSearch = searchValue.toLowerCase();
      return (
        (log.caller_no && log.caller_no.includes(searchValue)) ||
        (log.patient_name &&
          log.patient_name.toLowerCase().includes(lowerSearch)) ||
        (log.note && log.note.toLowerCase().includes(lowerSearch)) ||
        (log.destination_no && log.destination_no.includes(searchValue))
      );
    });

    if (!hasLocalMatches) {
      const delayDebounceFn = setTimeout(() => {
        searchFromDatabase(searchValue);
      }, 800);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [filters1.global.value, CallLogs]);

  const fetchCallLogsData = async () => {

    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/ivrdata/listIvrdata`);
      const params = {
        from: formatToApiDate(fromDate),
        to: formatToApiDate(toDate),
        location: currentLocation,
      };


      Object.keys(params).forEach((key) => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.data) {
        const processedData = data.data.map((log) => ({
          ...log,
          // Strip leading zeros from caller_no
          caller_no: log.caller_no
            ? String(log.caller_no).replace(/^0+/, "")
            : log.caller_no,
        }));
        setCallLogs(processedData);
      } else {
        console.error("Error in response:", data);
        Toast.fire({
          icon: "error",
          title: "Failed to fetch call logs",
        });
      }
    } catch (error) {
      console.error("Error fetching call logs:", error);
      Toast.fire({
        icon: "error",
        title: "Failed to load call logs",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = useCallback(async () => {
    try {
      const endpoints = [
        `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`,
      ];

      const [fdeResponse, doctorResponse] = await Promise.all(
        endpoints.map((url) =>
          fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }).then((res) => res.json()),
        ),
      );

      setFdeList(Array.isArray(fdeResponse.data) ? fdeResponse.data : []);
      setDoctors(Array.isArray(doctorResponse.data) ? doctorResponse.data : []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
      toast.error("Failed to load selection data.");
    }
  }, [currentLocation]);

  useEffect(() => {
    if (!currentLocation) return;

    fetchCallLogsData();
    fetchDropdownData();
  }, [currentLocation, fromDate, toDate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "doctor_id") {
      const selectedDoctor = doctors.find(
        (doc) => String(doc.doctor_id) === value,
      );

      setFormData((prev) => ({
        ...prev,
        doctor_id: value,
        doctorName: selectedDoctor ? selectedDoctor.name : "",
      }));
      return;
    }

    if (name === "FDE_Name") {
      const selectedFDE = fdeList.find((fde) => String(fde.FDEID) === value);

      setFormData((prev) => ({
        ...prev,
        FDE_Name: value,
        fdeName: selectedFDE ? selectedFDE.FDEName : "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    setShowAddModal(false);
  };

  const handleEnquiryInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "FDE_Name") {
      const selectedFDE = fdeList.find((fde) => String(fde.FDEID) === value);

      setEnquiryForm((prev) => ({
        ...prev,
        FDE_Name: value,
        fdeName: selectedFDE ? selectedFDE.FDEName : "",
      }));
      return;
    }

    setEnquiryForm({
      ...enquiryForm,
      [name]: newValue,
    });
  };

  const handleEnquiryClick = (callLog) => {


    const today = new Date();
    setSelectedCallLog(callLog);
    setSelectedDate(today);
    setEnquiryForm((prev) => ({
      ...prev,
      date: formatDate(today),
      caller_no: callLog.caller_no || "",
      note: callLog.note || "",
    }));
    setShowEnquiryModal(true);
  };

  const handleNoteClick = (note, rowData) => {

    setSelectedCallLog(rowData);
    setFormData((prev) => ({
      ...prev,
      note: note || "",
    }));
    setShowNoteModal(true);
  };

  const handleSaveNote = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedCallLog || !selectedCallLog.ivr_id) {
      toast.error("Error: IVR ID is missing.");
      return;
    }

    if (!formData.note || formData.note.trim() === "") {
      toast.error("Error: Note cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ivr_id: selectedCallLog.ivr_id,
        note: formData.note.trim(),
      };



      const response = await fetch(
        `${BASE_URL}/V1/ivrdata/editNote/${selectedCallLog.ivr_id}?location=${currentLocation}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const responseData = await response.json();

      if (response.ok && responseData.statusCode === 200) {
        setCallLogs((prevLogs) =>
          prevLogs.map((log) =>
            log.ivr_id === selectedCallLog.ivr_id
              ? { ...log, note: formData.note.trim() }
              : log,
          ),
        );

        setShowNoteModal(false);
        Swal.fire({
          icon: "success",
          title: "Note Saved",
          text: "The note has been updated successfully.",
          timer: 2000,
        });
      } else {
        Toast.fire({ icon: "error", title: "Failed to update note" });
      }
    } catch (error) {
      console.error("Error updating note:", error);
      Toast.fire({ icon: "error", title: "An error occurred while updating" });
    } finally {
      setLoading(false);
    }
  };
  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    const updatedFilters = { ...filters1 };

    if (value) {
      updatedFilters.dynamic_status = {
        value,
        matchMode: FilterMatchMode.EQUALS,
      };
    } else {
      delete updatedFilters.dynamic_status;
    }

    setStatusFilter(value);
    setFilters1(updatedFilters);
  };

  const renderStatusHeader = () => (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <span style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
        Enquiry Status
      </span>
      <Form.Select
        size="sm"
        value={statusFilter}
        onChange={handleStatusFilterChange}
        style={{
          width: "120px",
          fontSize: "12px",
          padding: "4px 6px",
          borderRadius: "6px",
          border: "1px solid #90caf9",
        }}
      >
        <option value="">All</option>
        <option value="Visited">Visited</option>
        <option value="Not Visited">Not Visited</option>
        <option value="Surgery Done">Surgery Done</option>
      </Form.Select>
    </div>
  );

  const statusBodyTemplate = (rowData) => {
    const status = rowData.dynamic_status || "Not Visited";
    let badgeBg = "#ffe0b2";
    let badgeColor = "#e65100";
    if (status === "Visited") {
      badgeBg = "#e0f2f1";
      badgeColor = "#004d40";
    } else if (status === "Not Visited") {
      badgeBg = "#efebe9";
      badgeColor = "#4e342e";
    }

    return (
      <span
        style={{
          backgroundColor: badgeBg,
          color: badgeColor,
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "600",
          display: "inline-block",
        }}
      >
        {status}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex align-items-center justify-content-center">
      <Button
        variant="primary"
        onClick={() => handleEnquiryClick(rowData)}
        className="enquiry-btn btn-primary btn-extra-small btn-icon me-2"
        title="Add Enquiry"
      >
        <FeatherIcon icon="help-circle" size="16" />
      </Button>

      <Button
        variant="primary"
        onClick={() => handleAddAppointmentClick(rowData)}
        className="appointment-btn btn-primary btn-extra-small btn-icon me-2"
        title="Add Appointment"
      >
        <FeatherIcon icon="plus-square" size="16" />
      </Button>

      <Button
        variant="primary"
        onClick={() => handleNoteClick(rowData.note, rowData)}
        className="note-btn btn-primary btn-extra-small btn-icon"
        title="Add Note"
      >
        <FeatherIcon icon="file-text" size="16" />
      </Button>
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        border: "1px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "8px",
        padding: "10px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                marginRight: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Show
            </span>
            <Form.Select
              size="sm"
              value={rows}
              onChange={(e) => {
                setRows(parseInt(e.target.value));
                setFirst(0);
              }}
              style={{
                width: "70px",
                height: "30px",
                border: "1px solid #4dd0e1",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>
          <Form.Group
            className="ms-2"
            style={{ display: "flex", alignItems: "center", margin: 0 }}
          >
            <span
              style={{
                marginRight: "10px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Search
            </span>
            <InputGroup style={{ position: "relative" }}>
              <Form.Control
                type="search"
                value={filters1.global.value || ""}
                onChange={(e) =>
                  setFilters1({
                    global: {
                      value: e.target.value,
                      matchMode: FilterMatchMode.CONTAINS,
                    },
                  })
                }
                placeholder="Global Search"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
                  transition: "all 0.3s ease",
                }}
              />
              {isDbSearching && (
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                >
                  <Spinner
                    animation="border"
                    size="sm"
                    variant="info"
                    style={{ width: "12px", height: "12px" }}
                  />
                </div>
              )}
            </InputGroup>
          </Form.Group>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #4dd0e1",
            borderRadius: "8px",
            padding: "8px",
            backgroundColor: "#f5fcfd",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              From Date
            </div>
            <DatePicker
              selected={fromDate}
              onChange={(date) => {
                setFromDate(date);
              }}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
              customInput={
                <Form.Control
                  style={{
                    padding: "5px 8px",
                    fontSize: "12px",
                  }}
                />
              }
            />
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              To Date
            </div>
            <DatePicker
              selected={toDate ? new Date(toDate) : null}
              onChange={(date) => {
                // FIX: Use moment to format local date instead of toISOString()
                const formattedDate = date
                  ? moment(date).format("YYYY-MM-DD")
                  : "";
                setToDate(formattedDate);
              }}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
              popperPlacement="bottom-start"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>

          <Button
            variant="primary"
            onClick={() => fetchCallLogsData(true)}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "6px 7px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "16px",
              ":hover": {
                backgroundColor: "#00acc1",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFromDate(null);
              setToDate(null);
              setStatusFilter("");
              setFilters1({
                global: { value: null, matchMode: FilterMatchMode.EQUALS },
              });
            }}
            style={{
              backgroundColor: "#ff9800",
              border: "none",
              borderRadius: "8px",
              padding: "5px 5px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "13px",
            }}
          >
            <FeatherIcon icon="filter" size={12} className="me-1" />
            Clear Filter
          </Button>
        </div>
      </div>
    </div>
  );

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: moment(date).format("YYYY-MM-DD"),
    }));

    setTimeSlots(generateTimeSlots());
  };

  const generateTimeSlots = () => {
    const slots = [];
    let start = moment().startOf("day").add(7, "hours");
    const end = moment().startOf("day").add(23, "hours").add(45, "minutes");

    while (start <= end) {
      slots.push({
        label: start.format("hh:mm A"),
        value: start.format("HH:mm"),
      });
      start.add(15, "minutes");
    }
    return slots;
  };

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, [formData.date]);

  const handleSubmit = async (e, saveType) => {
    if (e && e.preventDefault) e.preventDefault();
    const selectedFDE = fdeList.find(
      (fde) => String(fde.FDEID) === formData.FDE_Name,
    );
    const fdeName = selectedFDE ? selectedFDE.FDEName : "";

    const selectedDoctor = doctors.find(
      (doc) => String(doc.doctor_id) === formData.doctor_id,
    );
    const doctorName = selectedDoctor ? selectedDoctor.name : "";

    const payload = {
      fde_id: formData.FDE_Name,
      FDE_Name: fdeName,
      // Ensure time is in 24-hour HH:mm format for database consistency
      appointment_time: formData.appointmentTime
        ? moment(formData.appointmentTime, ["hh:mm A", "HH:mm"]).format("HH:mm")
        : "",
      patient_phone: formData.caller_no,
      patient_type:
        formData.patient_type === "Post Operative"
          ? "Postoperative"
          : formData.patient_type,
      appointment_timestamp: moment(formData.date).format("YYYY-MM-DD"),
      doctorName: doctorName,
      doctor_id: formData.doctor_id,
      note: formData.note,
      patientName: formData.patientName,
      patient_id: formData.patient_id,
    };

    try {

      // console.log(payload);
      const response = await fetch(
        `${BASE_URL}/V1/appointment/addAppointment?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network response was not ok");
      }

      const responseData = await response.json();
      Swal.fire({
        icon: "success",
        title: "Appointment Booked!",
        text: "The appointment has been recorded successfully.",
        confirmButtonColor: "#00bcd4",
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding appointment:", error.message);
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: "Could not book the appointment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnquirySubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (
      !enquiryForm.date ||
      !enquiryForm.patient_name ||
      !enquiryForm.caller_no ||
      !enquiryForm.enquirytype
    ) {
      Toast.fire({ icon: "warning", title: "Please fill all required fields" });
      return;
    }

    const payload = {
      patient_location: currentLocation,
      patient_type: "New",
      date: moment(enquiryForm.date).format("YYYY-MM-DD"),
      // time: enquiryForm.time,
      time: "0",
      // doctor_id: enquiryForm.doctor_id || null,
      doctor_id: "0",
      patient_name: enquiryForm.patient_name,
      patient_phone: enquiryForm.caller_no,
      // patient_type: "New",
      enquirytype: enquiryForm.enquirytype,
      fdeId: enquiryForm.FDE_Name || null,
      FDE_Name: enquiryForm.fdeName || null, // ✅ Send Name instead of ID
      // reference: enquiryForm.reference || null,
      reference: "0",
      note: enquiryForm.note || "",
    };

    setLoading(true);
    try {


      const response = await fetch(
        `${BASE_URL}/V1/enquiry/addEnquiry?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          `Error: ${response.status} - ${responseData.message || "Bad Request"}`,
        );
      }
      Swal.fire({
        icon: "success",
        title: "Enquiry Added",
        text: "New enquiry has been registered.",
        timer: 2000,
      });
      setEnquiryForm({
        date: "",
        doctor_id: "",
        patient_name: "",
        caller_no: "",
        enquirytype: "",
        FDE_Name: "",
        fdeName: "",
        fdeId: "",
        note: "",
      });

      setShowEnquiryModal(false);
    } catch (error) {
      console.error("Error adding enquiry:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add enquiry.",
      });
    } finally {
      setLoading(false);
    }
  };

  const pageContent = (
    <div
      className="theme-body"
      style={isTab ? { padding: "0px", marginTop: "0px" } : {}}
    >
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "10px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "1.5px solid #00bcd4",
                padding: "5px",
                margin: "10px -10px 12px -10px",
              }}
            >
              <Card.Body>
                <Row className="Product_list" style={{ marginTop: "-18px" }}>
                  {loading ? (
                    <div
                      className="d-flex justify-content-center py-5"
                      style={{ color: "#00bcd4" }}
                    >
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : (
                    <DataTable
                      value={CallLogs}
                      paginator
                      rows={rows}
                      first={first}
                      onPage={(e) => {
                        setFirst(e.first);
                        setRows(e.rows);
                      }}
                      filters={filters1}
                      header={renderHeader}
                      loading={loading}
                      globalFilterFields={[
                        "call_date",
                        "caller_no",
                        "patient_name",
                        "destination_no",
                        "circle_name",
                      ]}
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      responsiveLayout="scroll"
                      className="datatable-compact-style datatable-medium-small"
                    >
                      <Column
                        field="ivr_id"
                        header="Sr No"
                        body={(rowData) => rowData.ivr_id || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "90px",
                        }}
                      />
                      <Column
                        field="call_date"
                        header="Date"
                        body={(rowData) => {
                          const rawDate = rowData.call_date;
                          if (!rawDate) return "-";

                          const dateObj = moment(rawDate, "YYYY-MM-DD");

                          return dateObj.isValid()
                            ? dateObj.format("DD-MM-YYYY")
                            : rawDate;
                        }}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "110px",
                        }}
                      />

                      <Column
                        field="call_time"
                        header="Time"
                        body={(rowData) => rowData.call_time || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "80px",
                        }}
                      />

                      <Column
                        field="caller_no"
                        header="Patient Contact No"
                        body={(rowData) => rowData.caller_no || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "110px",
                        }}
                      />

                      <Column
                        field="patient_name"
                        header="Patient Name"
                        body={(rowData) => rowData.patient_name || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "140px",
                        }}
                      />

                      <Column
                        field="destination_no"
                        header="HHC Contact No"
                        body={(rowData) => rowData.destination_no || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "110px",
                        }}
                      />

                      <Column
                        field="call_type"
                        header="Call Type"
                        body={(rowData) => rowData.call_type || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "100px",
                        }}
                      />
                      <Column
                        field="call_status"
                        header="Call Status"
                        body={(rowData) => rowData.call_status || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "100px",
                        }}
                      />
                      <Column
                        field="call_duration"
                        header="Call Duration"
                        body={(rowData) => rowData.call_duration || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "100px",
                        }}
                      />
                      <Column
                        field="circle_name"
                        header="Region"
                        body={(rowData) => rowData.circle_name || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "130px",
                        }}
                      />
                      {/* <Column
                        field="note"
                        header="Note"
                        body={(rowData) => rowData.note || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "180px",
                        }}
                      /> */}
                      <Column
                        field="note"
                        header="Note"
                        style={{
                          minWidth: "150px",
                          maxWidth: "150px",
                          textAlign: "center",
                          border: "1px solid #90caf9",
                        }}
                        // This uses the component we just created
                        body={(rowData) => <NoteCell note={rowData.note} />}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="dynamic_status"
                        header={renderStatusHeader}
                        body={statusBodyTemplate}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />

                      <Column
                        header="Actions"
                        body={actionBodyTemplate}
                        exportable={false}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "110px",
                        }}
                      />
                    </DataTable>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );

  return (
    <>
      {isTab ? (
        pageContent
      ) : (
        <div
          className="themebody-wrap"
          style={{
            background: "linear-gradient(to right, #e0f7fa, #80deea)",
            fontFamily: "'Poppins', Arial, sans-serif",
            minHeight: "100vh",
            padding: "10px",
          }}
        >
          <PageBreadcrumb pagename="Call Logs" />
          {pageContent}
        </div>
      )}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
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
            <FeatherIcon icon="plus-square" className="me-2" size="18" />
            Add Appointment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px", padding: "5px" }}>
          <Form onSubmit={(e) => handleSubmit(e, "save")}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-10">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Appointment Date <span className="text-danger">*</span>
                  </Form.Label>
                  <DatePicker
                    required
                    selected={
                      formData.date ? new Date(formData.date) : new Date()
                    }
                    onChange={(date) => date && handleDateChange(date)}
                    dateFormat="dd-MM-yyyy"
                    minDate={new Date()}
                    className="form-control form-control-sm"
                    customInput={
                      <Form.Control
                        size="sm"
                        style={{
                          border: "2px solid rgb(77, 208, 225)",
                          fontSize: "12px",
                          borderRadius: "10px",
                        }}
                      />
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Appointment Time <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map((time, index) => (
                      <option key={index} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-10">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Doctor Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    size="sm"
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="">Select a Doctor</option>
                    {doctors.map((doctor) => (
                      <option
                        key={doctor.doctor_id}
                        value={String(doctor.doctor_id)}
                      >
                        {doctor.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Patient Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    size="sm"
                    name="patient_type"
                    value={formData.patient_type}
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="">Select Type</option>

                    {formData.patient_type === "New" ||
                      formData.patient_id === undefined ? (
                      <option value="New">NEW</option>
                    ) : (
                      <>
                        <option value="Follow">Follow</option>
                        <option value="Post Operative">Post Operative</option>
                        <option value="MCDPA">MCDPA</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Patient Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="text"
                    name="patientName"
                    placeholder="Enter full name"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    readOnly={!!formData.patient_id}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                      cursor: formData.patient_id ? "not-allowed" : "default",
                      backgroundColor: formData.patient_id ? "#e7ebebff" : undefined,
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-10">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Contact Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    name="caller_no"
                    readOnly
                    required
                    value={formData.caller_no}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      backgroundColor: "#e7ebebff",
                      cursor: "not-allowed",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    FDE Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    size="sm"
                    name="FDE_Name"
                    value={formData.FDE_Name}
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="">Select FDE</option>
                    {fdeList.map((fde) => (
                      <option key={fde.FDEID} value={String(fde.FDEID)}>
                        {fde.FDEName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Note
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    as="textarea"
                    rows={2}
                    name="note"
                    placeholder="Additional details..."
                    value={formData.note}
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end pt-2">
              <Button
                variant="danger"
                size="sm"
                className="me-2 px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  padding: "10px",
                }}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={loading || !noPendingAppt}
                className="px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  border: "none",
                  padding: "10px",
                }}
              >
                Add Appointment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showNoteModal}
        onHide={() => setShowNoteModal(false)}
        size="md"
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
            <FeatherIcon icon="file-text" className="me-2" size="16" />
            Add Note
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "10px" }}>
          <Form onSubmit={handleSaveNote}>
            <Form.Group>
              <Form.Label
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                Note <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                required
                style={{
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
                as="textarea"
                rows={4}
                name="note"
                value={formData.note || ""}
                onChange={handleInputChange}
                placeholder="Enter note here..."
              />
            </Form.Group>
            <Modal.Footer style={{ borderTop: "none", padding: "10px 0 0 0" }}>
              <Button
                size="sm"
                className="px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  padding: "10px",
                }}
                variant="secondary"
                onClick={() => setShowNoteModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="px-4"
                type="submit"
                disabled={loading}
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  border: "none",
                  padding: "10px",
                }}
                variant="primary"
              >
                {loading ? "Saving..." : "Add Note"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showEnquiryModal}
        onHide={() => setShowEnquiryModal(false)}
        size="lg"
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
            <FeatherIcon icon="help-circle" className="me-2" size="18" />
            Add Enquiry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px", padding: "5px" }}>
          <div>
            <Form onSubmit={handleAddEnquirySubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Call Back Date{" "}
                      <span style={{ color: "red" }} className="required">
                        *
                      </span>
                    </Form.Label>
                    <DatePicker
                      required
                      selected={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setEnquiryForm((prev) => ({
                          ...prev,
                          date: formatDate(date),
                        }));
                      }}
                      dateFormat="dd-MM-yyyy"
                      className="form-control form-control-sm"
                      placeholderText="Select date"
                      value={enquiryForm.date}
                      minDate={new Date()}
                      customInput={
                        <Form.Control
                          size="sm"
                          style={{
                            border: "2px solid rgb(77, 208, 225)",
                            fontSize: "12px",
                            borderRadius: "10px",
                          }}
                        />
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Enquiry Type{" "}
                      <span style={{ color: "red" }} className="required">
                        *
                      </span>
                    </Form.Label>
                    <Form.Select
                      required
                      size="sm"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      name="enquirytype"
                      value={enquiryForm.enquirytype}
                      onChange={handleEnquiryInputChange}
                    >
                      <option value="">Select Enquiry Type</option>
                      {[
                        "Call for Refund Amount",
                        "Wrong Enquiry or Spam Call",
                        "Enquiry for Test Charges",
                        "Accounts Department",
                        "Call for Another Branches",
                        "Call for IPD Doctors",
                        "Call for Assistant Doctors",
                        "Call Regarding Job Vacancy",
                        "Appointment Consultation",
                        "Online Consultation",
                        "SX Cost Enquiry",
                        "Call for Lab Test Enquiry",
                        "Medicines Availability at Pharmacy",
                        "Patient is Coming Late for Appointment",
                        "Insurance Related Queries",
                      ].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-15">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Patient Name{" "}
                      <span style={{ color: "red" }} className="required">
                        *
                      </span>
                    </Form.Label>
                    <Form.Control
                      required
                      size="sm"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      type="text"
                      name="patient_name"
                      value={enquiryForm.patient_name}
                      onChange={handleEnquiryInputChange}
                      placeholder="Enter Patient Name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Contact Number{" "}
                      <span style={{ color: "red" }} className="required">
                        *
                      </span>
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        backgroundColor: "#e7ebebff",
                        cursor: "not-allowed",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      type="text"
                      readOnly
                      required
                      name="caller_no"
                      placeholder="Enter Contact Number"
                      value={selectedCallLog?.caller_no}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      FDE Name{" "}
                      <span style={{ color: "red" }} className="required">
                        *
                      </span>
                    </Form.Label>
                    <Form.Select
                      required
                      size="sm"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      name="FDE_Name"
                      value={enquiryForm.FDE_Name}
                      onChange={handleEnquiryInputChange}
                    >
                      <option value="">Select FDE Name</option>
                      {fdeList &&
                        fdeList.length > 0 &&
                        fdeList.map((fde) => (
                          <option key={fde.FDEID} value={String(fde.FDEID)}>
                            {fde.FDEID} - {fde.FDEName}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Note
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      as="textarea"
                      name="note"
                      value={enquiryForm.note}
                      onChange={handleEnquiryInputChange}
                      rows={2}
                      placeholder="Enter Note"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end pt-2">
                <button
                  style={{
                    borderRadius: "10px",
                    fontSize: "12px",
                    padding: "10px",
                  }}
                  type="button"
                  className="btn btn-danger btn-sm me-2 px-3"
                  onClick={() => {
                    setShowEnquiryModal(false);
                    setEnquiryForm({
                      date: "",
                      enquirytype: "",
                      patient_name: "",
                      caller_no: "",
                      FDE_Name: "",
                      fdeId: "",
                      note: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    borderRadius: "10px",
                    fontSize: "12px",
                    backgroundColor: "#00bcd4",
                    borderColor: "#00bcd4",
                    padding: "10px",
                  }}
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-sm px-3"
                >
                  {loading ? "Adding..." : "Add Enquiry"}
                </button>
              </div>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}