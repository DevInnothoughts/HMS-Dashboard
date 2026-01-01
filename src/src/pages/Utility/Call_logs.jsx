import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import FeatherIcon from "feather-icons-react";
import { decodeJwt } from "../../utils/decode-jwt";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Modal,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css";
import { toast } from "react-hot-toast";

// REVERTED: Retaining the original API URL as requested.
export const BASE_URL = "http://localhost:5100/api"; 

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
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [loading, setLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedCallLog, setSelectedCallLog] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  
  function formatDate(date) {
    return new Date(date);
  }

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
          const payload = decodeJwt(token);
          if (payload && payload.jobLocation) {
              // console.log(payload.jobLocation);
              setCurrentLocation(payload.jobLocation);
              // console.log(currentLocation);
          }
      }
    }, []);
  

  const handleAddAppointmentClick = (rowData) => {
    const today = new Date();
    // HIPAA: Generalized logging to avoid showing full PHI on console.
    console.log("Opening Add Appointment Modal for IVR ID:", rowData.ivr_id);

    setFormData({
      date: formatDate(today),
      doctor_id: "",
      doctorName: "",
      patientName: "",
      caller_no: rowData.caller_no || "",
      appointmentTime: rowData.call_time || "",
      FDE_Name: "",
      note: rowData.note || "",
    });
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
        toast.error("Failed to fetch call logs.");
      }
    } catch (error) {
      console.error("Error fetching call logs:", error);
      toast.error("Failed to load call logs.");
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
          endpoints.map(url =>
            fetch(url, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }).then(res => res.json())
          )
        );

        setFdeList(Array.isArray(fdeResponse.data) ? fdeResponse.data : []);
        setDoctors(Array.isArray(doctorResponse.data) ? doctorResponse.data : []);

      } catch (error) {
        console.error("Error fetching dropdown data:", error.message);
        toast.error("Failed to load selection data.");
      }
    }, [currentLocation]); 

    // Wait until currentLocation is available before fetching
    useEffect(() => {
      if (!currentLocation) return; // ⛔ stop here until JWT is decoded

      fetchCallLogsData();
      fetchDropdownData();

    }, [currentLocation, fromDate, toDate]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "doctor_id") {
      const selectedDoctor = doctors.find((doc) => String(doc.doctor_id) === value);
      
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

      console.log("Sending note update request for IVR ID:", selectedCallLog.ivr_id);

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
        toast.success("Note updated successfully");
      } else {
        toast.error("Failed to update note.");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("An error occurred while updating the note.");
    }
  };
  
  // const actionBodyTemplate = (rowData) => (
  //   <div className="cart-action" style={{ display: "flex", gap: "5px" }}>
  //     <Button
  //       variant="btn"
  //       onClick={() => handleEnquiryClick(rowData)}
  //       className="enquiry-btn"
  //       title="Enquiry"
  //       style={{
  //         width: "35px",
  //         height: "35px",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         borderRadius: "50%",
  //         padding: "0",
  //       }}
  //     >
  //       <FeatherIcon icon="message-circle" className="w-18" />
  //     </Button>

  //     <Button
  //       variant="btn"
  //       onClick={() => handleAddAppointmentClick(rowData)}
  //       className="appointment-btn"
  //       title="Add Appointment"
  //       style={{
  //         width: "35px",
  //         height: "35px",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         borderRadius: "50%",
  //         padding: "0",
  //       }}
  //     >
  //       <FeatherIcon icon="plus-square" className="w-18" />
  //     </Button>
      
  //     <Button
  //       variant="btn"
  //       onClick={() => handleNoteClick(rowData.note, rowData)}
  //       className="note-btn"
  //       title="View Notes"
  //       style={{
  //         width: "35px",
  //         height: "35px",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         borderRadius: "50%",
  //         padding: "0",
  //       }}
  //     >
  //       <FeatherIcon icon="file-text" className="w-18" />
  //     </Button>
  //   </div>
  // );

  const actionBodyTemplate = (rowData) => (
    <div
        className="d-flex align-items-center justify-content-center"
    >
        <Button
            variant="primary"
            onClick={() => handleEnquiryClick(rowData)}
            className="enquiry-btn btn-sm btn-icon me-2"
            title="Enquiry"
        >
            <FeatherIcon icon="message-circle" size="14" /> 
        </Button>
        
        <Button
            variant="primary"
            onClick={() => handleAddAppointmentClick(rowData)}
            className="appointment-btn btn-sm btn-icon me-2" 
            title="Add Appointment"
        >
            <FeatherIcon icon="plus-square" size="14" />
        </Button>
        
        <Button
            variant="primary"
            onClick={() => handleNoteClick(rowData.note, rowData)}
            className="note-btn btn-sm btn-icon" 
            title="Add Notes"
        >
            <FeatherIcon icon="file-text" size="14" />
        </Button>
    </div>
);

  const renderHeader = () => (
    <div
      style={{
        border: "2px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "12px",
        padding: "15px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Global Search Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <Form.Group
            style={{
              display: "flex",
              alignItems: "center",
              margin: 0,
            }}
          >
            <span
            style={{
                marginRight: "10px", 
                fontSize: "16px", 
                fontWeight: "bold", 
                color: "#333",
                marginBottom:"15px"
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
                  borderRadius: "8px",
                  border: "2px solid #4dd0e1",
                  padding: "8px 12px",
                  width: "250px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                }}
              />
            </InputGroup>
          </Form.Group>
        </div>

        {/* Date Picker Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            border: "2px solid #4dd0e1",
            borderRadius: "12px",
            padding: "15px",
            backgroundColor: "#f5fcfd",
          }}
        >
          <div
            style={{
              margin: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "5px",
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
                    borderRadius: "8px",
                    border: "2px solid #4dd0e1",
                    padding: "8px 12px",
                    width: "160px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                  }}
                />
              }
            />
          </div>

          <div
            style={{
              margin: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "5px",
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
              customInput={
                <Form.Control
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #4dd0e1",
                    padding: "8px 12px",
                    width: "160px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                  }}
                />
              }
              popperClassName="custom-popper"
              popperPlacement="bottom-start"
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [0, 8],
                  },
                },
              ]}
            />
          </div>

          <Button
            variant="primary"
            onClick={() => fetchCallLogsData(true)}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "20px",
              ":hover": {
                backgroundColor: "#00acc1",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={16} className="me-2" />Refresh
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
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(23, 45, 0);

    const isToday = moment(formData.date).isSame(moment(), 'day');

    if (isToday) {
      startTime.setHours(
        new Date().getHours(),
        Math.ceil(new Date().getMinutes() / 15) * 15,
        0
      );
    } else {
      startTime.setHours(7, 0, 0);
    }

    while (startTime <= endTime) {
      const timeString = startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      slots.push(timeString);
      startTime.setMinutes(startTime.getMinutes() + 15);
    }

    return slots;
  };

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, [formData.date]);

  const handleSubmit = async (saveType) => {
    
    const selectedFDE = fdeList.find((fde) => String(fde.FDEID) === formData.FDE_Name);
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
      patient_type: "NEW",
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
      toast.success("Appointment booked successfully");
      setShowAddModal(false);
      
    } catch (error) {
      console.error("Error adding appointment:", error.message);
      toast.error(`Failed to book appointment. Check console for details.`);
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
      toast.error("Please fill in all required fields (Date, Patient Name, Contact Number, Enquiry Type).");
      return;
    }

    const payload = {
      date: enquiryForm.date,
      doctor_id: enquiryForm.doctor_id || null, 
      patient_name: enquiryForm.patient_name,
      patient_phone: enquiryForm.caller_no,
      patient_type: "NEW",
      // time: enquiryForm.call_time,
      enquirytype: enquiryForm.enquirytype,
      fdeId: enquiryForm.FDE_Name || null,
      FDE_Name: enquiryForm.FDE_Name || null, 
      note: enquiryForm.note || "",
    };

    try {
      console.log("Sending Enquiry Request.");

      const response = await fetch(`${BASE_URL}/V1/enquiry/addEnquiry?location=${currentLocation}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          `Error: ${response.status} - ${responseData.message || "Bad Request"}`
        );
      }

      toast.success("Enquiry added successfully!");

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
      toast.error(`Failed to add enquiry. Check console for details.`);
    }
  };

  useEffect(() => {
    // Console logs removed for PHI minimization
  }, [fdeList, enquiryTypes, formData]);

  const handleAddEnquiryClick = () => {
    const today = new Date();
    setFormData((prev) => ({
      ...prev,
      date: today.toISOString().split("T")[0],
      time: today.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }));
    setSelectedDate(today);
    setShowAddModal(true);
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
          backgroundColor: "#e0f7fa",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <PageBreadcrumb pagename="Call List" />
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
                    border: "4px solid #00bcd4",
                  }}
                >
                  <Card.Body>
                    <Row className="Product_list">
                      <DataTable
                        value={CallLogs}
                        paginator
                        rows={10}
                        filters={filters1}
                        header={renderHeader}
                        loading={loading}
                        globalFilterFields={[
                          "ivr_id",
                          "call_date",
                          "caller_no",
                          "destination_no",
                          "call_time",
                          "call_type",
                          "call_status",
                          "call_duration",
                          "circle_name",
                          "status",
                          "note",
                          "source",
                        ]}
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                        responsiveLayout="scroll"
                        className="datatable-compact-style"
                        style={{
                          border: "1px solid #4dd0e1",
                          marginTop: "20px",
                          width: "100%",
                          background: "white",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <Column
                          field="ivr_id"
                          header="Sr No."
                          sortable
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_date"
                          header="Date"
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="caller_no"
                          header="Caller No."
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="destination_no"
                          header="Destination No."
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_time"
                          header="Time"
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_type"
                          header="Call Type"
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_status"
                          header="Call Status"
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_duration"
                          header="Call Duration"
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="circle_name"
                          header="Region"
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="status"
                          header="Status"
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
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="source"
                          header="Source"
                          headerClassName="datatable-header-center"
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
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
                          }}
                        />
                      </DataTable>
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
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddAppointment}>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <DatePicker
                    selected={
                      formData.date ? new Date(formData.date) : new Date()
                    }
                    onChange={(date) => {
                      if (date) {
                        handleDateChange(date);
                      } else {
                        console.error("Invalid date selected");
                      }
                    }}
                    className="form-control"
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select Date"
                    minDate={new Date()}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>Doctor Name</Form.Label>
                  <Form.Select
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a Doctor</option>
                    {doctors && doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <option key={doctor.doctor_id} value={String(doctor.doctor_id)}>
                          {doctor.doctor_id} - {doctor.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No doctors available</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="patientName"
                    placeholder="Patient Name"
                    value={formData.patientName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="caller_no"
                    placeholder="Mobile Number"
                    value={formData.caller_no}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange({
                        target: {
                          name: "caller_no",
                          value: value,
                        },
                      });
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Appointment Time</Form.Label>
                  <Form.Select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
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
                <Form.Group className="mb-20">
                  <Form.Label>FDE Name</Form.Label>
                  <Form.Select
                    name="FDE_Name"
                    value={formData.FDE_Name}
                    onChange={handleInputChange}
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
              <Col md={15}>
                <Form.Group className="mb-20">
                  <Form.Label>Note</Form.Label>
                  <Form.Control
                    type="text"
                    name="note"
                    placeholder="Note"
                    value={formData.note}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <div className="d-flex justify-content-center">
                <Col className="text-end">
                  <button
                    type="button"
                    className="btn btn-primary me-2"
                    onClick={() => handleSubmit("save")}
                  >
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        date: "",
                        doctor_id: "",
                        name: "",
                        phone: "",
                        appointmentTime: "",
                        FDE_Name: "",
                        fdeId: "",
                        note: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </Col>
              </div>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={showNoteModal}
        onHide={() => setShowNoteModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={5}
            name="note"
            value={formData.note || ""}
            onChange={handleInputChange}
            placeholder="Enter note"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleSaveNote}
          >
            Save
          </Button>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showEnquiryModal}
        onHide={() => setShowEnquiryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Enquiry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <p>Enquiry for Call Log ID: {selectedCallLog?.ivr_id}</p>
            <Form>
              <br />
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Call Back Date</Form.Label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setEnquiryForm((prev) => ({
                          ...prev,
                          date: formatDate(date),
                        }));
                      }}
                      dateFormat="dd-MM-yyyy"
                      className="form-control"
                      placeholderText="Select date"
                      value={enquiryForm.date}
                      minDate={new Date()}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Enquiry Type</Form.Label>
                    <Form.Select
                      name="enquirytype"
                      value={enquiryForm.enquirytype}
                      onChange={handleEnquiryInputChange}
                      required
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
                  <Form.Group>
                    <Form.Label>Patient Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="patient_name"
                      value={enquiryForm.patient_name}
                      onChange={handleEnquiryInputChange}
                      placeholder="Enter Patient Name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-20">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="caller_no"
                      placeholder="Mobile Number"
                      value={selectedCallLog?.caller_no}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-20">
                    <Form.Label>FDE Name</Form.Label>
                    <Form.Select
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
                  <Form.Group>
                    <Form.Label>Add Note</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="note"
                      value={enquiryForm.note}
                      onChange={handleEnquiryInputChange}
                      rows={3}
                      placeholder="Enter Note"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-center">
                <Col className="text-end">
                  <button
                    type="button"
                    className="btn btn-primary me-2"
                    onClick={handleAddEnquirySubmit}
                  >
                    Add Enquiry
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
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
                </Col>
              </div>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </>
  );
}