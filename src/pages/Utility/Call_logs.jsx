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

export const BASE_URL = "http://localhost:5100/api";

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

export default function Call_logs() {
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
    // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const [loading, setLoading] = useState(false);
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
    console.log("OPening add appointment modal:");
    const today = new Date();
    const patient_phone = rowData.caller_no || "";

    // Reset/Set initial data
    setFormData((prev) => ({
      ...prev,
      date: moment(today).format("YYYY-MM-DD"),
      caller_no: patient_phone,
      appointmentTime: rowData.call_time || "",
      note: rowData.note || "",
      patientName: "",
      doctor_id: "",
      FDE_Name: "",
      patient_type: "New", // Default
    }));

    if (!patient_phone) {
      setShowAddModal(true);
      return;
    }

    try {
      const url = `${BASE_URL}/V1/appointment/getPatientByMobile?patient_phone=${patient_phone}&location=${currentLocation}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setFormData((prev) => ({ ...prev, patient_type: "New" }));
        setShowAddModal(true);
        return;
      }

      const data = await response.json();
      if (data.statusCode === 200 && data.data) {
        // --- NESTED CHECK: PENDING APPOINTMENTS ---
        try {
          const confirmUrl = `${BASE_URL}/V1/appointment/getPatientByApptConfirm?patient_phone=${patient_phone}&location=${currentLocation}`;
          const confirmResponse = await fetch(confirmUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          const confirmData = await confirmResponse.json();

          // If status 400, a pending appointment exists
          if (confirmResponse.status === 400) {
            Swal.fire({
              icon: "warning",
              title: "Duplicate Appointment",
              text: confirmData.message || "This patient already has a pending appointment. Please complete it first.",
              confirmButtonColor: "#f39c12",
            });
            return; // STOP: Do not open modal
          }
        } catch (innerError) {
          console.error("Error in confirmation check API call:", innerError);
        }

        // If we reached here, patient exists and has NO pending appointments
        Swal.fire({
          icon: "info",
          title: "Patient Found",
          text: `${data.data.name} is already registered.`,
          confirmButtonColor: "#00bcd4",
          timer: 2000,
        });

        setFormData((prev) => ({
          ...prev,
          patientName: data.data.name || "",
          patient_type: "Follow", // Default for existing patient
        }));
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

  const formatToApiDate = (date) => {
    const validDate = date instanceof Date ? date : new Date(date);
    if (isNaN(validDate)) {
      console.error("Invalid date:", date);
      return null;
    }
    const day = String(validDate.getDate()).padStart(2, "0");
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    const year = validDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchCallLogsData = async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/ivrdata/listIvrdata`);
      const params = {
        from: formatToApiDate(fromDate),
        to: formatToApiDate(toDate),
        location: currentLocation,
      };
      // console.log(params);

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
        setCallLogs(data.data);
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
        `${BASE_URL}/V1/appointment/doctorDropdown?location=${currentLocation}`,
      ];

      const [fdeResponse, doctorResponse] = await Promise.all(
        endpoints.map((url) =>
          fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }).then((res) => res.json())
        )
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
        (doc) => String(doc.doctor_id) === value
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
    console.log("Opening Enquiry Modal for IVR ID:", callLog.ivr_id);

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
    console.log("Opening note modal for IVR ID:", rowData.ivr_id);
    setSelectedCallLog(rowData);
    setFormData((prev) => ({
      ...prev,
      note: note || "",
    }));
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!selectedCallLog || !selectedCallLog.ivr_id) {
      toast.error("Error: IVR ID is missing.");
      return;
    }

    if (!formData.note || formData.note.trim() === "") {
      toast.error("Error: Note cannot be empty.");
      return;
    }

    try {
      const payload = {
        ivr_id: selectedCallLog.ivr_id,
        note: formData.note.trim(),
      };

      console.log(
        "Sending note update request for IVR ID:",
        selectedCallLog.ivr_id
      );

      const response = await fetch(
        `${BASE_URL}/V1/ivrdata/editNote/${selectedCallLog.ivr_id}?location=${currentLocation}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (response.ok && responseData.statusCode === 200) {
        setCallLogs((prevLogs) =>
          prevLogs.map((log) =>
            log.ivr_id === selectedCallLog.ivr_id
              ? { ...log, note: formData.note.trim() }
              : log
          )
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
    }
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
                setFirst(0); // Reset to first page when changing row count
              }}
              style={{ width: "70px", height: "30px", border: "1px solid #4dd0e1", borderRadius: "6px", fontSize: "12px" }}
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
            <InputGroup>
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
              maxDate={new Date()}
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
                const formattedDate = date
                  ? date.toISOString().split("T")[0]
                  : "";
                setToDate(formattedDate);
              }}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
              minDate={fromDate ? new Date(fromDate) : null}
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
    // Start at 7:00 AM today
    let start = moment().startOf('day').add(7, 'hours');
    // End at 11:45 PM today
    const end = moment().startOf('day').add(23, 'hours').add(45, 'minutes');

    while (start <= end) {
      slots.push(start.format("hh:mm A"));
      start.add(15, 'minutes'); // 15-minute gap
    }
    return slots;
  };

  // const timeSlots = generateTimeSlots();

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, [formData.date]);

  const handleSubmit = async (saveType) => {
    const selectedFDE = fdeList.find(
      (fde) => String(fde.FDEID) === formData.FDE_Name
    );
    const fdeName = selectedFDE ? selectedFDE.FDEName : "";

    const selectedDoctor = doctors.find(
      (doc) => String(doc.doctor_id) === formData.doctor_id
    );
    const doctorName = selectedDoctor ? selectedDoctor.name : "";

    const payload = {
      fde_id: formData.FDE_Name,
      FDE_Name: fdeName,
      appointment_time: formData.appointmentTime,
      patient_phone: formData.caller_no,
      patient_type: formData.patient_type, // Now dynamic
      appointment_timestamp: moment(formData.date).format("YYYY-MM-DD"),
      doctorName: doctorName,
      doctor_id: formData.doctor_id,
      note: formData.note,
      patientName: formData.patientName,
    };

    try {
      console.log("Sending appointment booking request.");

      const response = await fetch(
        `${BASE_URL}/V1/appointment/addAppointment?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
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

  const handleAddEnquirySubmit = async () => {
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
      patient_type: "NEW",
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
      FDE_Name: enquiryForm.FDE_Name || null,
      // reference: enquiryForm.reference || null,
      reference: "0",
      note: enquiryForm.note || "",
    };

    try {
      console.log("Sending Enquiry Request.");

      const response = await fetch(
        `${BASE_URL}/V1/enquiry/addEnquiry?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          `Error: ${response.status} - ${responseData.message || "Bad Request"}`
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
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/V1/enquiry/listEnquiry`);
      if (response.ok) {
        const data = await response.json();
        setEnquiries(data.data || []);
      } else {
        console.error("Failed to fetch enquiries");
        toast.error("Failed to load enquiries.");
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Error fetching enquiries.");
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

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
        <PageBreadcrumb pagename="Call Logs" />
        <div className="theme-body">
          <Container fluid>
            <Row>
              <Col>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                    borderColor: "#00bcd4",
                    background: "white",
                    border: "1.5px solid #00bcd4",
                    padding: "5px"
                  }}
                >
                  <Card.Body>
                    <Row className="Product_list">
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
                              const dateObj = moment(rawDate, [
                                "YYYY-DD-MM",
                                "YYYY-MM-DD",
                                "DD-MM-YYYY",
                              ]);

                              return dateObj.isValid()
                                ? dateObj.format("DD-MM-YYYY")
                                : rawDate;
                            }}
                            headerClassName="datatable-header-center"
                            style={{
                              border: "1px solid #90caf9",
                              textAlign: "center",
                              padding: "0.75rem",
                              width: "120px",
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
                            header="Caller No"
                            body={(rowData) => rowData.caller_no || "-"}
                            headerClassName="datatable-header-center"
                            style={{
                              border: "1px solid #90caf9",
                              textAlign: "center",
                              padding: "0.75rem",
                              width: "11  0px",
                            }}
                          />

                          <Column
                            field="destination_no"
                            header="Destination No"
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
                          <Column
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
      </div>
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
            padding: "10px 15px", // Compact padding
          }}
        >
          <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}>
            <FeatherIcon icon="plus-square" className="me-2" size="18" />
            Add Appointment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px", padding: "10px" }}>
          <Form onSubmit={handleAddAppointment}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-10">
                  <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Appointment Date <span className="text-danger">*</span>
                  </Form.Label>
                  <DatePicker
                    required
                    selected={formData.date ? new Date(formData.date) : new Date()}
                    onChange={(date) => date && handleDateChange(date)}
                    dateFormat="dd-MM-yyyy"
                    minDate={new Date()}
                    className="form-control form-control-sm"
                    customInput={
                      <Form.Control
                        size="sm"
                        style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
                      />
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Appointment Time</Form.Label>
                  <Form.Select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-10">
                  <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Doctor Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    size="sm"
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleInputChange}
                    style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
                  >
                    <option value="">Select a Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctor_id} value={String(doctor.doctor_id)}>
                        {doctor.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
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
                    style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-10">
                  <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Contact Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    name="caller_no"
                    readOnly
                    value={formData.caller_no}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      backgroundColor: "#e7ebebff",
                      cursor: "not-allowed",
                      fontSize: "12px", borderRadius: "10px"
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    FDE Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    size="sm"
                    name="FDE_Name"
                    value={formData.FDE_Name}
                    onChange={handleInputChange}
                    style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
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
                  <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Note</Form.Label>
                  <Form.Control
                    size="sm"
                    as="textarea"
                    rows={2}
                    name="note"
                    placeholder="Additional details..."
                    value={formData.note}
                    onChange={handleInputChange}
                    style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end pt-2">
              <Button
                variant="danger"
                size="sm"
                className="me-2 px-3"
                style={{ borderRadius: "10px", fontSize: "12px", padding: "10px" }}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  border: "none",
                  padding: "10px"
                }}
                onClick={() => handleSubmit("save")}
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
          <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}>
            <FeatherIcon icon="file-text" className="me-2" size="16" />
            Add Note
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "10px" }}>
          <Form.Group>
            <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
              Note <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              required
              style={{
                border: "2px solid rgb(77, 208, 225)",
                fontSize: "12px",
                borderRadius: "10px"
              }}
              as="textarea"
              rows={4}
              name="note"
              value={formData.note || ""}
              onChange={handleInputChange}
              placeholder="Enter note here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", padding: "0px 5px" }}>
          <Button
            size="sm"
            className="px-3"
            style={{ borderRadius: "10px", fontSize: "12px", padding: "10px" }}
            variant="secondary"
            onClick={() => setShowNoteModal(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="px-4"
            style={{
              borderRadius: "10px",
              fontSize: "12px",
              backgroundColor: "#00bcd4",
              border: "none", padding: "10px"
            }}
            variant="primary"
            onClick={handleSaveNote}
          >
            Add Note
          </Button>
        </Modal.Footer>
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
          <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}>
            <FeatherIcon icon="help-circle" className="me-2" size="18" />
            Add Enquiry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px", padding: "10px" }}>
          <div>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Call Back Date{" "}
                      <span style={{ color: "red" }} className="required">*</span>
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
                          style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
                        />
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Enquiry Type{" "}
                      <span style={{ color: "red" }} className="required">*</span>
                    </Form.Label>
                    <Form.Select
                      required
                      size="sm"
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
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
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Patient Name{" "}
                      <span style={{ color: "red" }} className="required">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      size="sm"
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
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
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Contact Number{" "}
                      <span style={{ color: "red" }} className="required">*</span>
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        backgroundColor: "#e7ebebff",
                        cursor: "not-allowed",
                        fontSize: "12px",
                        borderRadius: "10px"
                      }}
                      type="text"
                      readOnly
                      name="caller_no"
                      placeholder="Enter Contact Number"
                      value={selectedCallLog?.caller_no}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group >
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      FDE Name{" "}
                      <span style={{ color: "red" }} className="required">*</span>
                    </Form.Label>
                    <Form.Select
                      required
                      size="sm"
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
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
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Note
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
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
                  style={{ borderRadius: "10px", fontSize: "12px", padding: "10px" }}
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
                  style={{ borderRadius: "10px", fontSize: "12px", backgroundColor: "#00bcd4", borderColor: "#00bcd4", padding: "10px" }}
                  type="button"
                  className="btn btn-primary btn-sm px-3"
                  onClick={handleAddEnquirySubmit}
                >
                  Add Enquiry
                </button>
              </div>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}