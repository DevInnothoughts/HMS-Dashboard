import React, { useState, useEffect, useCallback } from "react";
import { decodeJwt } from "../../utils/decode-jwt";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import FeatherIcon from "feather-icons-react";
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
import NavBarA from "../../components/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

// --- Configuration ---
const BASE_URL = "http://localhost:5100/api";
const TYPE_LIST = ["NEW", "FOLLOW", "POST-OPERATIVE"];

export default function Appointment_list() {
  // --- Core State ---
  const [appointmentData, setAppointmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [currentLocation, setCurrentLocation] = useState('default'); // ** EDITED **: Default is 'default'

  // --- Filter State ---
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  // --- Modal/Action State ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false); // To open the (future) Receipt Modal

  // --- Dropdown Data State (Needed for Modals) ---
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [consultationList, setConsultationList] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);


  // ------------------------- API UTILITIES -------------------------

  useEffect(() => {
      const token = localStorage.getItem('token');
      console.log("Token:", token);
      if (token) {
          const payload = decodeJwt(token);
          if (payload && payload.jobLocation) {
              setCurrentLocation(payload.jobLocation);
          }
          console.log(payload.jobLocation);
      }
    }, []);

  const formatDateToDDMMYYYY = (date) => {
    if (date instanceof Date) {
      return moment(date).format("DD-MM-YYYY");
    }
    return "";
  };

  // Generates time slots (Helper for Edit Modal)
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = moment().startOf('day').add(7, 'hours'); // Start 7 AM
    const endTime = moment().startOf('day').add(23, 'hours').add(45, 'minutes'); // End 11:45 PM

    // Logic to start from the next 15-minute interval if the date is today (simplified check)
    const isToday = moment(selectedAppointment?.appointment_timestamp).isSame(moment(), 'day');
    if (isToday) {
        let now = moment();
        let currentMinutes = now.minute();
        // Snap to the next 15-minute interval
        let nextInterval = Math.ceil(currentMinutes / 15) * 15;
        startTime.set({ 'hour': now.hour(), 'minute': 0, 'second': 0 }).add(nextInterval, 'minutes');
    }

    let currentTime = startTime.clone();

    while (currentTime.isSameOrBefore(endTime)) {
      slots.push(currentTime.format('hh:mm A'));
      currentTime.add(15, 'minutes');
    }
    return slots;
  };

  const fetchAppointmentData = useCallback(async () => {
    setLoading(true);
    try {
      // ** EDITED **: Check if currentLocation is available before fetching
      if (!fromDate || !toDate || currentLocation === 'default') return; 

      const formattedFromDate = formatDateToDDMMYYYY(fromDate);
      const formattedToDate = formatDateToDDMMYYYY(toDate);

      // ** EDITED **: Replaced LOCATION with currentLocation
      const url = `${BASE_URL}/V1/appointment/listAppointments?from=${formattedFromDate}&to=${formattedToDate}&location=${currentLocation}`;

      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (response.ok && data.data) {
        setAppointmentData(data.data);
      } else {
        console.error("Error fetching appointments:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, currentLocation]); // ** EDITED **: Added currentLocation to dependency array

  const fetchDropdownData = useCallback(async () => {
    try {
      // ** EDITED **: Replaced LOCATION with currentLocation in all endpoints
      const endpoints = [
        `${BASE_URL}/V1/appointment/consultationDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/doctorDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
      ];

      const [consultationResponse, doctorResponse, fdeResponse] = await Promise.all(
        endpoints.map(url => fetch(url).then(res => res.json()))
      );

      setConsultationList(Array.isArray(consultationResponse.data) ? consultationResponse.data : []);
      setDoctors(Array.isArray(doctorResponse.data) ? doctorResponse.data : []);
      setFdeList(Array.isArray(fdeResponse.data) ? fdeResponse.data : []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]); // ** EDITED **: Added currentLocation to dependency array

  // ------------------------- EFFECTS -------------------------

  useEffect(() => {
    // Only fetch data if currentLocation is set to something meaningful
    if (currentLocation !== 'default') {
        fetchAppointmentData();
        fetchDropdownData();
    }
  }, [fetchAppointmentData, fetchDropdownData, currentLocation]); // ** EDITED **: Added currentLocation dependency

  // Effect to regenerate time slots when editing a different appointment's date/time
  useEffect(() => {
    if (selectedAppointment) {
      setTimeSlots(generateTimeSlots());
    }
  }, [selectedAppointment?.appointment_timestamp]);

  // ------------------------- HANDLERS -------------------------

  const handleDateChange = (date) => {
    if (!date || !selectedAppointment) return;

    // Update the selectedAppointment state with the new date
    setSelectedAppointment((prev) => ({
      ...prev,
      appointment_timestamp: date.toISOString(), // Store the timestamp
    }));
  };

  const handleEditModalInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedAppointment((prev) => ({
        ...prev,
        [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedAppointment || !selectedAppointment.patient_phone) {
        alert("Error: Patient Phone number is missing!");
        return;
    }

    // Prepare data (filter out unwanted keys if necessary)
    const updatePayload = {
        ...selectedAppointment,
        // Ensure date/time fields are correctly formatted if the backend expects a specific string format
        date: formatDateToDDMMYYYY(new Date(selectedAppointment.appointment_timestamp)),
        patient_location: currentLocation, // ** EDITED **: Ensure location is sent as currentLocation
    };

    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/editAppointment/${selectedAppointment.patient_phone}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Appointment updated successfully!");
        fetchAppointmentData(); // Refresh list to show changes
        setShowEditModal(false);
      } else {
        console.error("Failed to update appointment:", result.message);
        alert("Failed to update appointment: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating appointment:", error.message);
      alert("Error updating appointment: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!appointmentIdToDelete) return;

    try {
      // ** EDITED **: Pass currentLocation as a query parameter
      const response = await fetch(
        `${BASE_URL}/V1/appointment/delete/${appointmentIdToDelete}?location=${currentLocation}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          // body: JSON.stringify({ cancellationReason }), // Send reason if backend supports it in DELETE body/query
        }
      );

      if (response.ok) {
        alert("Appointment successfully cancelled.");
        fetchAppointmentData();
        setShowDeleteModal(false);
        setCancellationReason("");
      } else {
        const errorData = await response.json();
        alert("Failed to delete appointment: " + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      alert("An error occurred while deleting the appointment.");
      console.error("Network Error:", error);
    }
  };

  // Process/Action Button Handlers (Simplified for the component structure)
  const handleProcessUpdate = async (appId, endpoint, successMessage) => {
    try {
      // ** EDITED **: Pass currentLocation as a query parameter
      const response = await fetch(
        `${BASE_URL}/V1/appointment/${endpoint}?appId=${appId}&location=${currentLocation}`,
        { method: "PUT", headers: { "Content-Type": "application/json" } }
      );

      const data = await response.json();

      if (response.ok) {
        alert(successMessage);
        fetchAppointmentData();
      } else {
        alert(`Failed to update process: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error updating process. Please try again: ${error.message}`);
    }
  };


  // ------------------------- JSX RENDER HELPERS -------------------------

  const getProcessColor = (rowData) => {
    const { ConfirmPatient, historychk, executivechk, consultationchk } = rowData;
    const isConfirmed = ConfirmPatient === 1;
    const hasHistory = historychk === 3;
    const hasExecution = executivechk === 1;
    const hasConsultation = consultationchk === 2;
    const hasReceipt = executivechk === 4;

    if (!isConfirmed) return "#fff";
    if (hasReceipt) return "#b2ff8e"; // Green
    if (hasConsultation) return "#ccb3f0"; // Purple
    if (hasExecution) return "#faff61"; // Yellow
    if (hasHistory) return "#ff9861"; // Orange
    return "#fff";
  };

  const renderActionBody = (rowData) => {
    const { appointment_id, confirm_time, historychk, executivechk, consultationchk } = rowData;
    const isConfirmed = confirm_time != 0;

    return (
      <div
        className="cart-action"
        style={{
          backgroundColor: getProcessColor(rowData),
          margin: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          border: "3px solid #ccc",
          padding: "10px",
          borderRadius: "8px",
          transition: "background-color 0.3s ease",
        }}
      >
        {/* Unconfirmed Actions: Edit, Delete, Confirm */}
        {!isConfirmed && (
          <>
            <button title="Edit" onClick={() => { setSelectedAppointment(rowData); setShowEditModal(true); }} disabled={isConfirmed}>
              <FeatherIcon icon="edit" className="w-18" />
            </button>
            <button title="Cancel" onClick={() => setAppointmentIdToDelete(appointment_id) || setShowDeleteModal(true)} disabled={isConfirmed}>
              <FeatherIcon icon="trash-2" className="w-18 text-danger" />
            </button>
            <button title="Confirm" onClick={() => handleProcessUpdate(appointment_id, 'confirmAppointment', 'Appointment confirmed!')} disabled={isConfirmed}>
              <FeatherIcon icon="check" className="w-18" />
            </button>
          </>
        )}

        {/* Confirmed Actions: Process Flow */}
        {isConfirmed && (
          <>
            {/* History Check (Requires confirmation) */}
            <button title="History" onClick={() => handleProcessUpdate(appointment_id, 'updateHistoryChk', 'History process completed!')} disabled={historychk === 3}>
              <FeatherIcon icon="clock" className="w-18" />
            </button>

            {/* Execution Check (Requires historyChk = 3) */}
            <button title="Execution" onClick={() => handleProcessUpdate(appointment_id, 'updateExecutionChk', 'Execution process completed!')} disabled={historychk !== 3 || executivechk === 1 || executivechk === 4}>
              <FeatherIcon icon="list" className="w-18" />
            </button>

            {/* Consultation Check (Requires executivechk = 1) */}
            <button title="Consultation" onClick={() => handleProcessUpdate(appointment_id, 'updateConsultationChk', 'Consultation process completed!')} disabled={executivechk !== 1 || consultationchk === 2}>
              <FeatherIcon icon="user-check" className="w-18" />
            </button>

            {/* Receipts (Requires consultationchk = 2) */}
            <button title="Receipts" disabled={consultationchk !== 2} onClick={() => { setSelectedAppointment(rowData); setShowReceiptModal(true); }}>
              <FeatherIcon icon="file-text" className="w-18" />
            </button>
          </>
        )}
      </div>
    );
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <Form.Group style={{ display: "flex", alignItems: "center", margin: 0 }}>
            <InputGroup>
              <Form.Control
                type="search"
                value={filters.global.value || ""}
                onChange={(e) =>
                  setFilters({
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
          {/* ** EDITED **: Display current location for user info */}
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#00838f" }}>
              Location: {currentLocation.toUpperCase()}
          </div>
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
          {/* From Date Picker */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#00838f", marginBottom: "5px" }}>
              From Date
            </div>
            <DatePicker
              selected={fromDate}
              onChange={setFromDate}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
              customInput={<Form.Control style={{ /* styles */ }} />}
            />
          </div>
          {/* To Date Picker */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#00838f", marginBottom: "5px" }}>
              To Date
            </div>
            <DatePicker
              selected={toDate}
              onChange={setToDate}
              dateFormat="dd-MM-yyyy"
              minDate={fromDate}
              customInput={<Form.Control style={{ /* styles */ }} />}
            />
          </div>
          <Button
            variant="primary"
            onClick={fetchAppointmentData}
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
            }}
            // ** EDITED **: Disable button if location is default
            disabled={currentLocation === 'default'}
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );

  // ------------------------- RENDER -------------------------

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "20px",
      }}
    >

      {/* --- Delete Modal --- */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reason of Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Appointment ID: **{appointmentIdToDelete}**</p>
          <textarea
            className="form-control"
            placeholder="Enter the cancellation reason..."
            rows="4"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          ></textarea>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete}>
            Submit & Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Edit Modal --- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
          <Modal.Header closeButton><Modal.Title>Edit Appointment</Modal.Title></Modal.Header>
          <Modal.Body>
              {selectedAppointment ? (
                  <Form>
                      <Row>
                          <Col md={4} className="mb-4">
                              <Form.Group className="mb-3">
                                  <Form.Label>Type</Form.Label>
                                  <Form.Select name="patient_type" value={selectedAppointment.patient_type || ""} onChange={handleEditModalInputChange}>
                                      <option value="">Select Type</option>
                                      {TYPE_LIST.map((type, index) => (<option key={index} value={type}>{type}</option>))}
                                  </Form.Select>
                              </Form.Group>
                          </Col>
                          <Col md={4}>
                              <Form.Group className="mb-3">
                                  <Form.Label>Doctor Name</Form.Label>
                                  <Form.Select name="doctorName" value={selectedAppointment.doctorName || ""} onChange={handleEditModalInputChange}>
                                      <option value="">Select a Doctor</option>
                                      {doctors.map((doctor) => (<option key={doctor.doctor_id} value={doctor.name}>{doctor.name}</option>))}
                                  </Form.Select>
                              </Form.Group>
                          </Col>
                          <Col md={4}>
                              <Form.Group className="mb-3">
                                  <Form.Label>Patient Name</Form.Label>
                                  <Form.Control type="text" name="patientName" value={selectedAppointment.patientName || ""} onChange={handleEditModalInputChange} />
                              </Form.Group>
                          </Col>
                          <Col md={4}>
                              <Form.Group className="mb-3">
                                  <Form.Label>Contact No</Form.Label>
                                  <Form.Control type="text" name="patient_phone" value={selectedAppointment.patient_phone || ""} onChange={handleEditModalInputChange} />
                              </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                                <Form.Label>Appointment Date</Form.Label>
                                <DatePicker
                                    selected={selectedAppointment.appointment_timestamp ? new Date(selectedAppointment.appointment_timestamp) : null}
                                    onChange={handleDateChange}
                                    dateFormat="dd-MM-yyyy"
                                    className="form-control"
                                    placeholderText="Select Date"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Appointment Time</Form.Label>
                                <Form.Select name="appointmentTime" value={selectedAppointment.appointmentTime || ""} onChange={handleEditModalInputChange}>
                                    <option value="">Select Time</option>
                                    {timeSlots.map((time, index) => (<option key={index} value={time}>{time}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {/* More fields here... FDE, Reference, Note, etc. */}
                      </Row>
                      <Button variant="primary" onClick={handleSaveChanges} style={{ float: "right", marginTop: '20px' }}>
                          Save Changes
                      </Button>
                  </Form>
              ) : (
                  <p>Loading appointment details...</p>
              )}
          </Modal.Body>
      </Modal>

      {/* --- Receipt Modal (Needs full implementation in modular component) --- */}
      {showReceiptModal && (
        <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} size="xl" centered>
            <Modal.Body><p>Receipt Generation/Saving UI Goes Here.</p></Modal.Body>
        </Modal>
      )}


      {/* --- Main Content --- */}
      <NavBarA pagename="Appointment List" />

      <div className="theme-body" style={{ /* styles */ }}>
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  marginLeft: "-30px",
                  marginRight: "-30px",
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                }}
              >
                <Card.Body>
                  {loading ? (
                    <div className="d-flex justify-content-center py-5" style={{ color: "#00bcd4" }}>
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : (
                    <DataTable
                      value={appointmentData}
                      paginator
                      rows={10}
                      filters={filters}
                      header={renderHeader}
                      globalFilterFields={[
                        "appointment_id", "patient_name", "patient_phone", "doctor_name", "FDE_Name", "note",
                      ]}
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                      responsiveLayout="scroll"
                      className="p-datatable-customers"
                    >
                      <Column field="appointment_id" header="Sr.No" style={{ width: "60px", textAlign: "center" }} />
                      <Column
                        field="appointment_timestamp"
                        header="Date"
                        sortable
                        body={(rowData) => moment(rowData.appointment_timestamp).format("DD-MM-YYYY")}
                      />
                      <Column field="appointment_time" header="Appo.Time" sortable />
                      <Column field="confirm_time" header="Confirm Time" sortable />
                      <Column field="patient_type" header="Type" sortable />
                      <Column field="patient_name" header="Patient Name" sortable />
                      <Column field="patient_phone" header="Contact No" sortable />
                      <Column field="doctor_name" header="Doctor Details" sortable />
                      <Column field="FDE_Name" header="FDE Name" sortable />
                      <Column field="note" header="Note" sortable />
                      <Column header="Actions" body={renderActionBody} exportable={false} />
                    </DataTable>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}