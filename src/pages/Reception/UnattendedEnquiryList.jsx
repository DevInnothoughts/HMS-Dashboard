import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import FeatherIcon from "feather-icons-react";
import { decodeJwt } from "../Utility/decode-jwt";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SlotQuickViewPicker from "../../components/Reception/SlotQuickViewPicker";

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
    maxWidth: "150px",
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

export default function UnattendedEnquiryList({ isTab = false }) {
  const [unattendedLeads, setUnattendedLeads] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");

  // Table state
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [fromDate, setFromDate] = useState(moment().startOf("day").toDate());
  const [toDate, setToDate] = useState(moment().endOf("day").toDate());
  const [selectedSource, setSelectedSource] = useState("All");

  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [noPendingAppt, setNoPendingAppt] = useState(true);

  // Forms state
  const [treatmentList, setTreatmentList] = useState([]);
  const [formData, setFormData] = useState({
    date: moment().format("YYYY-MM-DD"),
    appointmentTime: "",
    treatment: "",
    caller_no: "",
    patientName: "",
    patient_id: "",
    doctor_id: "",
    FDE_Name: "",
    patient_type: "OPD",
    note: "",
  });

  const [enquiryForm, setEnquiryForm] = useState({
    date: "",
    enquirytype: "",
    patient_name: "",
    caller_no: "",
    FDE_Name: "",
    fdeName: "",
    note: "",
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

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

    setEnquiryForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: moment(date).format("YYYY-MM-DD"),
    }));
    setTimeSlots(generateTimeSlots());
  };

  function formatDate(date) {
    return moment(date).format("YYYY-MM-DD");
  }

  // SweetAlert notifications
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Extract location from Token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  // Fetch dropdown lists
  const fetchDropdowns = useCallback(async () => {
    if (!currentLocation) return;
    try {
      const [fdeRes, docRes, treatmentRes] = await Promise.all([
        fetch(
          `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
        ),
        fetch(
          `${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`,
        ),
        fetch(
          `${BASE_URL}/V1/appointment/treatmentDropdown?location=${currentLocation}`,
        ),
      ]);
      const fdeData = await fdeRes.json();
      const docData = await docRes.json();
      const treatmentData = await treatmentRes.json();

      if (fdeRes.ok && fdeData.data) setFdeList(fdeData.data);
      if (docRes.ok && docData.data) setDoctors(docData.data);
      if (treatmentRes.ok && treatmentData.data)
        setTreatmentList(treatmentData.data);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  const formatToDDMMYYYY = (date) => {
    if (!date) return null;
    return moment(date).format("DD-MM-YYYY");
  };

  // Main Listing Fetch (consolidating 3 API calls and filtering)
  const fetchUnattendedLeads = useCallback(async () => {
    if (!currentLocation) return;
    setLoading(true);
    try {
      let finalFromDate = formatToDDMMYYYY(fromDate);
      let finalToDate = formatToDDMMYYYY(toDate);

      if (!finalFromDate || !finalToDate) {
        const today = moment().format("DD-MM-YYYY");
        finalFromDate = today;
        finalToDate = today;
      }

      const ivrUrl = `${BASE_URL}/V1/ivrdata/listIvrdata?location=${currentLocation}&from=${finalFromDate}&to=${finalToDate}`;
      const webUrl = `${BASE_URL}/V1/webleads/listWebleads?location=${currentLocation}&from=${finalFromDate}&to=${finalToDate}`;
      const chatbotUrl = `${BASE_URL}/V1/chatbotleads/listChatbotLeads?location=${currentLocation}&from=${finalFromDate}&to=${finalToDate}`;

      const [ivrRes, webRes, chatbotRes] = await Promise.all([
        fetch(ivrUrl),
        fetch(webUrl),
        fetch(chatbotUrl),
      ]);

      const ivrData = await ivrRes.json();
      const webData = await webRes.json();
      const chatbotData = await chatbotRes.json();

      const isVisited = (item) =>
        String(item.dynamic_status || item.status || "").toLowerCase() ===
        "visited";

      let processedIvr = [];
      if (ivrRes.ok && ivrData.data) {
        processedIvr = ivrData.data
          .filter(
            (log) =>
              log.call_status &&
              log.call_status.toLowerCase() === "missed" &&
              (!log.note || log.note.trim() === "") &&
              !isVisited(log),
          )
          .map((log) => ({
            ...log,
            id: `ivr-${log.ivr_id}`,
            source: "IVR",
            date: log.call_date
              ? moment(
                  log.call_date + " " + (log.call_time || "00:00:00"),
                  "YYYY-MM-DD HH:mm:ss",
                ).toDate()
              : new Date(),
            name: log.patient_name || "-",
            phoneno: log.caller_no
              ? String(log.caller_no).replace(/^0+/, "")
              : "-",
            reason: "Missed Call",
          }));
      }

      let processedWeb = [];
      if (webRes.ok && webData.data) {
        processedWeb = webData.data
          .filter(
            (lead) =>
              (!lead.note || lead.note.trim() === "") && !isVisited(lead),
          )
          .map((lead) => ({
            ...lead,
            id: `web-${lead.appointment_id}`,
            source: "Web",
            date: lead.date ? new Date(lead.date) : new Date(),
            reason: "No Note Added",
          }));
      }

      let processedChatbot = [];
      if (chatbotRes.ok && chatbotData.data) {
        processedChatbot = chatbotData.data
          .filter(
            (lead) =>
              (!lead.note || lead.note.trim() === "") && !isVisited(lead),
          )
          .map((lead) => ({
            ...lead,
            id: `chatbot-${lead.appointment_id}`,
            source: "Chatbot",
            date: lead.date ? new Date(lead.date) : new Date(),
            reason: "No Note Added",
          }));
      }

      // Combine and sort by date descending
      const combined = [
        ...processedIvr,
        ...processedWeb,
        ...processedChatbot,
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setUnattendedLeads(combined);
    } catch (err) {
      console.error("Error fetching unattended leads:", err);
      Toast.fire({ icon: "error", title: "Failed to fetch unattended leads" });
    } finally {
      setLoading(false);
    }
  }, [currentLocation, fromDate, toDate]);

  useEffect(() => {
    fetchUnattendedLeads();
  }, [fetchUnattendedLeads]);

  // Modal Triggers
  const handleNoteClick = (rowData) => {
    setSelectedLead(rowData);
    setFormData((prev) => ({
      ...prev,
      note: rowData.note || "",
    }));
    setShowNoteModal(true);
  };

  const handleEnquiryClick = (rowData) => {
    setSelectedLead(rowData);
    const today = new Date();
    setSelectedDate(today);
    setEnquiryForm({
      date: moment(today).format("YYYY-MM-DD"),
      enquirytype: "",
      patient_name: rowData.name || "",
      caller_no: rowData.phoneno || "",
      FDE_Name: "",
      fdeName: "",
      note: rowData.note || "",
    });
    setShowEnquiryModal(true);
  };

  const handleAddAppointmentClick = async (rowData) => {
    setSelectedLead(rowData);
    const today = new Date();
    const patient_phone = rowData.phoneno || "";
    setNoPendingAppt(true);

    setFormData((prev) => ({
      ...prev,
      date: moment(today).format("YYYY-MM-DD"),
      caller_no: patient_phone,
      appointmentTime: "",
      note: rowData.note || "",
      patientName: rowData.name || "",
      doctor_id: "",
      FDE_Name: "",
      patient_type: "New",
      treatment: "",
      patient_id: "",
    }));

    if (!patient_phone || patient_phone === "-") {
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
          title: "Pending Appointment Exists for This Patient",
          html: `
                     <div style="font-family: inherit;">
                    <p style="margin-bottom: 4px; font-weight: bold; font-size:14px; color: #e67e22; text-align:center !important;">How to check?</p>
                    <p style="margin: 0; line-height: 1.5; font-size:13px !important; text-align:center !important;">
                    Go to <strong>Appointment List</strong> &rarr; Search by <strong>Contact Number</strong> in <strong>Global Search</strong> &rarr; If found, <strong>Delete or Edit</strong> the pending appointment.
                    </p>
                  </div>
                    `,
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

  // Submit Handlers
  const handleSaveNote = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedLead) return;

    if (!formData.note || formData.note.trim() === "") {
      Toast.fire({ icon: "error", title: "Note cannot be empty." });
      return;
    }

    const trimmedNote = formData.note.trim();

    setIsSubmitting(true);
    try {
      let response;
      if (selectedLead.source === "IVR") {
        const ivrId = selectedLead.ivr_id;
        response = await fetch(
          `${BASE_URL}/V1/ivrdata/editNote/${ivrId}?location=${currentLocation}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ivr_id: ivrId, note: trimmedNote }),
          },
        );
      } else if (selectedLead.source === "Web") {
        response = await fetch(
          `${BASE_URL}/V1/webleads/editNote/${selectedLead.appointment_id}?location=${currentLocation}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: trimmedNote }),
          },
        );
      } else if (selectedLead.source === "Chatbot") {
        response = await fetch(
          `${BASE_URL}/V1/chatbotleads/editNote/${selectedLead.appointment_id}?location=${currentLocation}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: trimmedNote }),
          },
        );
      }

      const resData = await response.json();
      if (response.ok && resData.statusCode === 200) {
        setUnattendedLeads((prev) =>
          prev.filter((lead) => lead.id !== selectedLead.id),
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
    } catch (err) {
      console.error(err);
      Toast.fire({
        icon: "error",
        title: "An error occurred while saving note",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnquirySubmit = async (e) => {
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
      time: "0",
      doctor_id: "0",
      patient_name: enquiryForm.patient_name,
      patient_phone: enquiryForm.caller_no,
      enquirytype: enquiryForm.enquirytype,
      fdeId: enquiryForm.FDE_Name || null,
      FDE_Name: enquiryForm.fdeName || null,
      reference: "0",
      note: enquiryForm.note || "",
    };

    setIsSubmitting(true);
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
        patient_name: "",
        caller_no: "",
        enquirytype: "",
        FDE_Name: "",
        fdeName: "",
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
      setIsSubmitting(false);
    }
  };

  const handleAppointmentSubmit = async (e) => {
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
      treatment_name: formData.treatment,
      patientName: formData.patientName,
      patient_id: formData.patient_id,
    };

    setIsSubmitting(true);
    try {
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
      setIsSubmitting(false);
    }
  };

  const sourceBodyTemplate = (rowData) => {
    const src = rowData.source;
    let bgColor = "#efebe9";
    let textColor = "#5d4037";
    let borderColor = "#8d6e63";
    let icon = "🔗";

    if (src === "IVR") {
      bgColor = "#e0f7fa";
      textColor = "#006064";
      borderColor = "#00bcd4";
      icon = "📞";
    } else if (src === "Web") {
      bgColor = "#e8f5e9";
      textColor = "#1b5e20";
      borderColor = "#4caf50";
      icon = "🌐";
    } else if (src === "Chatbot") {
      bgColor = "#f3e5f5";
      textColor = "#4a148c";
      borderColor = "#9c27b0";
      icon = "💬";
    }

    return (
      <span
        style={{
          backgroundColor: bgColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
          borderRadius: "4px",
          padding: "3px 6px",
          fontSize: "11px",
          fontWeight: "600",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span>{icon}</span>
        {src}
      </span>
    );
  };

  const reasonBodyTemplate = (rowData) => {
    const isMissed = rowData.source === "IVR";
    return (
      <span
        style={{
          backgroundColor: isMissed ? "#ffebee" : "#fff3e0",
          color: isMissed ? "#c62828" : "#ef6c00",
          border: `1px solid ${isMissed ? "#ef9a9a" : "#ffcc80"}`,
          borderRadius: "4px",
          padding: "3px 6px",
          fontSize: "11px",
          fontWeight: "500",
        }}
      >
        {rowData.reason}
      </span>
    );
  };

  const exportToExcel = () => {
    let dataToExport = filteredLeads;

    const globalSearch = filters1?.global?.value;
    if (globalSearch && globalSearch.trim() !== "") {
      const searchLower = globalSearch.toLowerCase().trim();
      dataToExport = dataToExport.filter((item) => {
        const dateTimeStr = item.date
          ? moment(item.date).format("DD-MM-YYYY hh:mm A")
          : "";
        const name = (item.name || "").toLowerCase();
        const phone = String(item.phoneno || "").toLowerCase();
        const source = (item.source || "").toLowerCase();
        const reason = (item.reason || "").toLowerCase();
        const note = (item.note || "").toLowerCase();
        return (
          dateTimeStr.toLowerCase().includes(searchLower) ||
          name.includes(searchLower) ||
          phone.includes(searchLower) ||
          source.includes(searchLower) ||
          reason.includes(searchLower) ||
          note.includes(searchLower)
        );
      });
    }

    const excelData = dataToExport.map((item) => ({
      "Date & Time": item.date
        ? moment(item.date).format("DD-MM-YYYY hh:mm A")
        : "",
      "Patient Name": item.name || "",
      "Contact Number": item.phoneno || "",
      "Lead Source": item.source || "",
      Note: item.note || "",
    }));

    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });

    const formattedFromDate = fromDate
      ? moment(fromDate).format("DD-MM-YYYY")
      : "";
    const formattedToDate = toDate ? moment(toDate).format("DD-MM-YYYY") : "";
    const fileName = `Unattended_Enquiry_List_${formattedFromDate}_to_${formattedToDate}${fileExtension}`;

    saveAs(data, fileName);
  };

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
                placeholder="Search unattended leads"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
                }}
              />
            </InputGroup>
          </Form.Group>
          <Button
            variant="outline-success"
            onClick={exportToExcel}
            style={{
              backgroundColor: "#28a745",
              border: "none",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              height: "26px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              whiteSpace: "nowrap",
            }}
          >
            <FeatherIcon icon="download" size={13} />
            Download Excel
          </Button>
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
              onChange={setFromDate}
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

          <div>
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
              selected={toDate}
              onChange={setToDate}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setFromDate(null);
              setToDate(null);
              setFilters1({
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
              });
              setSelectedSource("All");
            }}
            style={{
              backgroundColor: "#ff9800",
              border: "none",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              marginTop: "16px",
            }}
          >
            <FeatherIcon icon="filter" size={12} className="me-1" />
            Clear Filter
          </Button>
        </div>
      </div>
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex align-items-center justify-content-center">
      <Button
        variant="primary"
        onClick={() => handleEnquiryClick(rowData)}
        className="enquiry-btn btn-primary btn-extra-small btn-icon me-2"
        title="Add Enquiry"
        style={{
          padding: "4px 8px",
          backgroundColor: "#00bcd4",
          border: "none",
        }}
      >
        <FeatherIcon icon="help-circle" size="16" />
      </Button>

      <Button
        variant="primary"
        onClick={() => handleAddAppointmentClick(rowData)}
        className="appointment-btn btn-primary btn-extra-small btn-icon me-2"
        title="Add Appointment"
        style={{
          padding: "4px 8px",
          backgroundColor: "#00bcd4",
          border: "none",
        }}
      >
        <FeatherIcon icon="plus-square" size="16" />
      </Button>

      <Button
        variant="primary"
        onClick={() => handleNoteClick(rowData)}
        className="note-btn btn-primary btn-extra-small btn-icon"
        title="Add Note"
        style={{
          padding: "4px 8px",
          backgroundColor: "#00bcd4",
          border: "none",
        }}
      >
        <FeatherIcon icon="file-text" size="16" />
      </Button>
    </div>
  );

  const filteredLeads = unattendedLeads.filter((lead) => {
    if (selectedSource === "All") return true;
    return lead.source.toLowerCase() === selectedSource.toLowerCase();
  });

  const sourceHeaderTemplate = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span>Lead Source</span>
        <Form.Select
          size="sm"
          value={selectedSource}
          onChange={(e) => {
            setSelectedSource(e.target.value);
            setFirst(0); // Reset pagination to first page
          }}
          style={{
            fontSize: "11px",
            padding: "2px 4px",
            height: "26px",
            width: "100px",
            border: "1.5px solid #00bcd4",
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            cursor: "pointer",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          <option value="All">All</option>
          <option value="Web">Web</option>
          <option value="Chatbot">Chatbot</option>
          <option value="IVR">IVR</option>
        </Form.Select>
      </div>
    );
  };

  const unattendedPageContent = (
    <div style={{ animation: "fadeIn 0.5s ease-in-out", padding: "0 10px" }}>
      <Card
        style={{
          borderRadius: "15px",
          border: "1.5px solid #00bcd4",
          boxShadow: "0px 8px 16px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Card.Body style={{ padding: "0" }}>
          <div className="table-responsive">
            <DataTable
              value={filteredLeads}
              paginator
              rows={rows}
              first={first}
              onPage={(e) => {
                setFirst(e.first);
                setRows(e.rows);
              }}
              filters={filters1}
              header={renderHeader()}
              loading={loading}
              globalFilterFields={[
                "name",
                "phoneno",
                "source",
                "reason",
                "note",
              ]}
              paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
              responsiveLayout="scroll"
              className="datatable-compact-style datatable-medium-small"
              emptyMessage="No unattended leads found."
            >
              <Column
                field="date"
                header="Date & Time"
                body={(rowData) =>
                  moment(rowData.date).format("DD-MM-YYYY hh:mm A")
                }
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "160px",
                  fontSize: "12px",
                }}
              />
              <Column
                field="name"
                header="Patient Name"
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "250px",
                  fontSize: "12px",
                }}
              />
              <Column
                field="phoneno"
                header="Contact Number"
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "200px",
                  fontSize: "12px",
                }}
              />
              <Column
                field="source"
                header={sourceHeaderTemplate}
                body={sourceBodyTemplate}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "170px",
                  fontSize: "12px",
                }}
              />
              {/* <Column
                                field="reason"
                                header="Unattended Status"
                                body={reasonBodyTemplate}
                                headerClassName="datatable-header-center"
                                style={{
                                    border: "1px solid #90caf9",
                                    textAlign: "center",
                                    padding: "0.75rem",
                                    width: "140px",
                                    fontSize: "12px",
                                }}
                            /> */}
              <Column
                field="note"
                header="Note"
                body={(rowData) => <NoteCell note={rowData.note} />}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "150px",
                }}
              />
              <Column
                header="Actions"
                body={actionBodyTemplate}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "140px",
                }}
              />
            </DataTable>
          </div>
        </Card.Body>
      </Card>

      {/* Note Edit Modal */}
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
                disabled={isSubmitting}
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  border: "none",
                  padding: "10px",
                }}
                variant="primary"
              >
                {isSubmitting ? "Adding..." : "Add Note"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Enquiry Modal */}
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
            <Form onSubmit={handleEnquirySubmit}>
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
                      value={enquiryForm.caller_no}
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
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm px-3"
                >
                  {isSubmitting ? "Adding..." : "Add Enquiry"}
                </button>
              </div>
            </Form>
          </div>
        </Modal.Body>
      </Modal>

      {/* Add Appointment Modal */}
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
          <Form onSubmit={handleAppointmentSubmit}>
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
                  <SlotQuickViewPicker
                    required
                    hideDropdown
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    date={formData.date}
                    location={currentLocation}
                    format="24h"
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
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
                    {formData.patient_type === "New" || !formData.patient_id ? (
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
              {(formData.patient_type === "Other" || formData.treatment) && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Treatment <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      required
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select Treatment</option>
                      {treatmentList.map((t) => (
                        <option key={t.treatment_name} value={t.treatment_name}>
                          {t.treatment_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              <Col
                md={6}
                className={
                  formData.patient_type === "Other" || formData.treatment
                    ? "mt-2"
                    : ""
                }
              >
                <Form.Group className="mb-10">
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
                      backgroundColor: formData.patient_id
                        ? "#e7ebebff"
                        : undefined,
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
                disabled={loading || !noPendingAppt || isSubmitting}
                className="px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  border: "none",
                  padding: "10px",
                }}
              >
                {isSubmitting ? "Booking..." : "Add Appointment"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );

  return (
    <>
      {isTab ? (
        unattendedPageContent
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
          <PageBreadcrumb pagename="Unattended Enquiry List" />
          {unattendedPageContent}
        </div>
      )}
    </>
  );
}
