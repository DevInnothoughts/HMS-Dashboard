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
import SlotQuickViewPicker from "./SlotQuickViewPicker";

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

export default function WebFormEnquiryList({ isTab = false }) {
  const [webLeads, setWebLeads] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDbSearching, setIsDbSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");

  // Table state
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [fromDate, setFromDate] = useState(moment().startOf("day").toDate());
  const [toDate, setToDate] = useState(moment().endOf("day").toDate());
  const [noPendingAppt, setNoPendingAppt] = useState(true);

  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

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

  // Main Listing Fetch
  const fetchWebLeads = useCallback(async () => {
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

      const res = await fetch(
        `${BASE_URL}/V1/webleads/listWebleads?location=${currentLocation}&from=${finalFromDate}&to=${finalToDate}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
      );
      const resData = await res.json();
      if (res.ok && resData.data) {
        setWebLeads(resData.data);
      } else {
        Toast.fire({ icon: "error", title: "Failed to fetch web leads" });
      }
    } catch (err) {
      console.error("Error fetching web leads:", err);
      Toast.fire({ icon: "error", title: "Failed to connect to backend" });
    } finally {
      setLoading(false);
    }
  }, [currentLocation, fromDate, toDate]);

  useEffect(() => {
    fetchWebLeads();
  }, [fetchWebLeads]);

  // Debounced search inside Database
  useEffect(() => {
    const queryVal = filters1.global.value;
    if (queryVal && queryVal.trim().length > 2) {
      const delayDebounceFn = setTimeout(async () => {
        setIsDbSearching(true);
        try {
          const res = await fetch(
            `${BASE_URL}/V1/webleads/searchWebleads?location=${currentLocation}&query=${encodeURIComponent(queryVal)}`,
          );
          const resData = await res.json();
          if (res.ok && resData.data) {
            setWebLeads(resData.data);
          }
        } catch (e) {
          console.error("Error doing search:", e);
        } finally {
          setIsDbSearching(false);
        }
      }, 700);

      return () => clearTimeout(delayDebounceFn);
    } else if (queryVal === "") {
      fetchWebLeads();
    }
  }, [filters1.global.value, currentLocation, fetchWebLeads]);

  // Modal Triggers
  const handleEnquiryClick = (rowData) => {
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
          let isConfirmedSame = true;
          if (data.data.matchType === "SECONDARY") {
            const popResult = await Swal.fire({
              icon: "question",
              iconColor: "#f59e0b",
              title: "Secondary Number Detected",
              html: `
                <div style="font-family: inherit; text-align: left; font-size: 13px; color: #334155;">
                  <p style="margin-bottom: 12px; font-size: 14px; text-align: center; color: #475569;">
                    This contact number was found as the <strong>secondary / alternative number</strong> of:
                  </p>
                  <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px;">
                    <!-- Row 1: Patient Name & Primary Contact -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 12px;">
                      <div style="flex: 1; min-width: 0;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">Patient Name</span>
                        <div style="font-weight: 700; font-size: 15px; color: #0f172a; word-break: break-word;">${data.data.name || "-"}</div>
                      </div>
                      <div style="flex: 1; min-width: 0; text-align: right;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">Primary Contact</span>
                        <div style="font-weight: 700; font-size: 15px; color: #0f172a;">${data.data.phone || "-"}</div>
                      </div>
                    </div>
                    <!-- Row 2: UID No & Address -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
                      <div style="flex: 1; min-width: 0;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">UID No</span>
                        <div style="font-weight: 600; font-size: 13px; color: #334155; word-break: break-word;">${data.data.Uid_no || "-"}</div>
                      </div>
                      <div style="flex: 1; min-width: 0; text-align: right;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; display: block; margin-bottom: 2px;">Address</span>
                        <div style="font-weight: 600; font-size: 13px; color: #334155; word-break: break-word;">${data.data.address || "-"}</div>
                      </div>
                    </div>
                  </div>
                  <p style="margin: 0; font-weight: 600; text-align: center; color: #0f7b63; font-size: 14px;">
                    Is this appointment for <u>${data.data.name || "this patient"}</u>, or should we mark it as a <u>New Patient</u>?
                  </p>
                </div>
              `,
              showCancelButton: true,
              confirmButtonText: `Same Patient (${data.data.name || "Existing"})`,
              cancelButtonText: "Mark as New Patient",
              confirmButtonColor: "#00bcd4",
              cancelButtonColor: "#64748b",
              allowOutsideClick: false,
            });
            if (!popResult.isConfirmed) {
              isConfirmedSame = false;
            }
          }

          if (isConfirmedSame) {
            if (!hasPendingAppt && data.data.matchType !== "SECONDARY") {
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
            setFormData((prev) => ({
              ...prev,
              patient_id: "",
              patient_type: "New",
            }));
          }
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
      time: moment().format("HH:mm"),
      doctor_id: "0",
      patient_name: enquiryForm.patient_name,
      patient_phone: enquiryForm.caller_no,
      enquirytype: enquiryForm.enquirytype,
      fdeId: enquiryForm.FDE_Name || null,
      FDE_Name: enquiryForm.fdeName || null,
      reference: "0",
      note: enquiryForm.note || "",
      source_name: "Web Lead",
      record_type: "Enquiry",
      branch_name: currentLocation,
      received_location: currentLocation,
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
      source_name: "Web Lead",
      record_type: "Appointment",
      branch_name: currentLocation,
      received_location: currentLocation,
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
      window.dispatchEvent(new CustomEvent("refreshApptCounts"));
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

  const exportToExcel = () => {
    let dataToExport = webLeads;

    if (statusFilter) {
      dataToExport = dataToExport.filter((item) => {
        const status = item.dynamic_status || "Not Visited";
        return status === statusFilter;
      });
    }

    const globalSearch = filters1?.global?.value;
    if (globalSearch && globalSearch.trim() !== "") {
      const searchLower = globalSearch.toLowerCase().trim();
      dataToExport = dataToExport.filter((item) => {
        const dateStr = item.date
          ? moment.utc(item.date).format("DD-MM-YYYY")
          : "";
        const timeStr = item.date
          ? moment.utc(item.date).format("hh:mm A")
          : "";
        const name = (item.name || "").toLowerCase();
        const phone = String(item.phoneno || "").toLowerCase();
        const email = (item.email_id || "").toLowerCase();
        const source = (item.utmsource || "Direct Website").toLowerCase();
        const msg = (item.message || "").toLowerCase();
        const note = (item.note || "").toLowerCase();
        return (
          dateStr.includes(searchLower) ||
          timeStr.toLowerCase().includes(searchLower) ||
          name.includes(searchLower) ||
          phone.includes(searchLower) ||
          email.includes(searchLower) ||
          source.includes(searchLower) ||
          msg.includes(searchLower) ||
          note.includes(searchLower)
        );
      });
    }

    const excelData = dataToExport.map((item) => ({
      Date: item.date ? moment.utc(item.date).format("DD-MM-YYYY") : "",
      Time: item.date ? moment.utc(item.date).format("hh:mm A") : "",
      "Full Name": item.name || "",
      "Contact Number": item.phoneno || "",
      Email: item.email_id || "",
      Source: item.utmsource || "Direct Website",
      Message: item.message || "",
      Note: item.note || "",
      "Enquiry Status": item.dynamic_status || "Not Visited",
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
    const fileName = `Web_Enquiry_List_${formattedFromDate}_to_${formattedToDate}${fileExtension}`;

    saveAs(data, fileName);
  };

  // Header Builder (Same styling as Call logs)
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
                placeholder="Search leads"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
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
              setStatusFilter("");
              setFilters1({
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
              });
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
  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    const updatedFilters = {
      ...filters1,
    };

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
        <option value="Visited">🟢 Visited</option>
        <option value="Not Visited">⚪ Not Visited</option>
        <option value="Surgery Done">🟡 Surgery Done</option>
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
    } else if (status === "Surgery Done") {
      badgeBg = "#fffde7";
      badgeColor = "#5d4037";
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
        className="appointment-btn btn-primary btn-extra-small btn-icon"
        title="Add Appointment"
        style={{
          padding: "4px 8px",
          backgroundColor: "#00bcd4",
          border: "none",
        }}
      >
        <FeatherIcon icon="plus-square" size="16" />
      </Button>
    </div>
  );

  const sourceBodyTemplate = (rowData) => {
    const src = rowData.utmsource || "Direct Website";
    return (
      <span
        style={{
          backgroundColor: src.toLowerCase().includes("organic")
            ? "#e1f5fe"
            : "#efebe9",
          color: src.toLowerCase().includes("organic") ? "#0288d1" : "#5d4037",
          border: `1px solid ${src.toLowerCase().includes("organic") ? "#29b6f6" : "#8d6e63"}`,
          borderRadius: "4px",
          padding: "3px 6px",
          fontSize: "11px",
        }}
      >
        {src}
      </span>
    );
  };

  return (
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
              value={webLeads}
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
                "email_id",
                "utmsource",
                "message",
                "note",
              ]}
              paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
              responsiveLayout="scroll"
              className="datatable-compact-style datatable-medium-small"
              emptyMessage="No web leads found."
              rowClassName={(rowData) => {
                const status = rowData.dynamic_status || rowData.enquiry_status;
                return {
                  "enquiry-row-visited": status === "Visited",
                  "enquiry-row-surgery-done": status === "Surgery Done",
                };
              }}
            >
              <Column
                field="date"
                header="Date"
                body={(rowData) =>
                  moment.utc(rowData.date).format("DD-MM-YYYY")
                }
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "110px",
                  fontSize: "12px",
                }}
              />
              <Column
                field="date"
                header="Time"
                body={(rowData) => moment.utc(rowData.date).format("hh:mm A")}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "100px",
                  fontSize: "12px",
                }}
              />
              <Column
                field="name"
                header="Full Name"
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
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
                  fontSize: "12px",
                }}
              />
              <Column
                field="email_id"
                header="Email"
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  fontSize: "12px",
                }}
              />
              {/* <Column
                                field="selected_area"
                                header="Region"
                                headerClassName="datatable-header-center"
                                style={{
                                    border: "1px solid #90caf9",
                                    textAlign: "center",
                                    padding: "0.75rem",
                                    fontSize: "12px",
                                }}
                            /> */}
              <Column
                field="utmsource"
                header="Source"
                body={sourceBodyTemplate}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "130px",
                  fontSize: "12px",
                }}
              />
              <Column
                field="message"
                header="Message"
                body={(rowData) => (
                  <div
                    style={{
                      fontSize: "11px",
                      maxWidth: "250px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {rowData.message}
                  </div>
                )}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                }}
              />
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
                        "Hot",
                        "Mild",
                        "Cold",
                        "Other",
                        "Appointment",
                        "Visited",
                        // "Call for Refund Amount",
                        // "Wrong Enquiry or Spam Call",
                        // "Enquiry for Test Charges",
                        // "Accounts Department",
                        // "Call for Another Branches",
                        // "Call for IPD Doctors",
                        // "Call for Assistant Doctors",
                        // "Call Regarding Job Vacancy",
                        // "Appointment Consultation",
                        // "Online Consultation",
                        // "SX Cost Enquiry",
                        // "Call for Lab Test Enquiry",
                        // "Medicines Availability at Pharmacy",
                        // "Patient is Coming Late for Appointment",
                        // "Insurance Related Queries",
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
                disabled={isSubmitting || !noPendingAppt}
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

  const webPageContent = (
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
              value={webLeads}
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
                "email_id",
                "message",
                "note",
              ]}
              paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
              responsiveLayout="scroll"
              className="datatable-compact-style datatable-medium-small"
              emptyMessage="No web leads found."
            >
              <Column
                field="date"
                header="Date"
                body={(rowData) =>
                  formatDate(rowData.date || rowData.created_at)
                }
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "120px",
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
                }}
              />
              <Column
                field="phoneno"
                header="Phone No"
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "120px",
                }}
              />
              <Column
                field="email_id"
                header="Email ID"
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                }}
              />
              <Column
                field="message"
                header="Message"
                body={(rowData) => (
                  <div
                    style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      fontSize: "12px",
                    }}
                  >
                    {rowData.message}
                  </div>
                )}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                }}
              />
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
            <FeatherIcon icon="plus-circle" className="me-2" size="16" />
            Register Enquiry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "15px" }}>
          <Form onSubmit={handleEnquirySubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Enquiry Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="date"
                    name="date"
                    value={enquiryForm.date}
                    onChange={handleEnquiryInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
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
                    Enquiry Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    size="sm"
                    name="enquirytype"
                    value={enquiryForm.enquirytype}
                    onChange={handleEnquiryInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="">Select Enquiry Type</option>
                    <option value="OPD">OPD</option>
                    <option value="IPD">IPD</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="General">General</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
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
                    name="patient_name"
                    placeholder="Patient Name"
                    value={enquiryForm.patient_name}
                    onChange={handleEnquiryInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
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
                    Phone Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="text"
                    name="caller_no"
                    placeholder="Phone Number"
                    value={enquiryForm.caller_no}
                    onChange={handleEnquiryInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
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
                    value={enquiryForm.FDE_Name}
                    onChange={handleEnquiryInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="">Select FDE</option>
                    {fdeList.map((fde) => (
                      <option key={fde.FDEID} value={fde.FDEID}>
                        {fde.FDEName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

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
                as="textarea"
                rows={2}
                name="note"
                placeholder="Additional details..."
                value={enquiryForm.note}
                onChange={handleEnquiryInputChange}
                style={{
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
              />
            </Form.Group>

            <div className="d-flex justify-content-end pt-2">
              <Button
                variant="danger"
                size="sm"
                className="me-2"
                onClick={() => setShowEnquiryModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: "#00bcd4", border: "none" }}
              >
                {isSubmitting ? "Registering..." : "Register Enquiry"}
              </Button>
            </div>
          </Form>
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
            <FeatherIcon icon="plus-circle" className="me-2" size="16" />
            Book Appointment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "15px" }}>
          <Form onSubmit={handleAppointmentSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-2">
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
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      handleDateChange(date);
                    }}
                    dateFormat="dd-MM-yyyy"
                    minDate={new Date()}
                    customInput={
                      <Form.Control
                        required
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

              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Time Slot <span className="text-danger">*</span>
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

              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Patient Phone <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="text"
                    name="caller_no"
                    placeholder="Phone Number"
                    value={formData.caller_no}
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

            <Row>
              <Col md={4}>
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
                    placeholder="Patient Name"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Doctor <span className="text-danger">*</span>
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
                    <option value="">Select Doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc.doctor_id} value={doc.doctor_id}>
                        {doc.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
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
                      <option key={fde.FDEID} value={fde.FDEID}>
                        {fde.FDEName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
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
                    <option value="OPD">OPD</option>
                    <option value="Post Operative">Post Operative</option>
                    <option value="IPD">IPD</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={8}>
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
                    as="textarea"
                    rows={2}
                    name="note"
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
                onClick={() => setShowAddModal(false)}
                style={{ borderRadius: "10px", fontSize: "12px" }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSubmitting}
                className="px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  border: "none",
                }}
              >
                {isSubmitting ? "Booking..." : "Submit"}
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
        webPageContent
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
          <PageBreadcrumb pagename="Web Form Enquiry List" />
          {webPageContent}
        </div>
      )}
    </>
  );
}
