// import React, { useState, useEffect, useCallback } from "react";
// import { decodeJwt } from "../../utils/decode-jwt";
// import { FilterMatchMode } from "primereact/api";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import FeatherIcon from "feather-icons-react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   InputGroup,
//   Button,
//   Spinner,
//   Modal,
// } from "react-bootstrap";
// import NavBarA from "../../components/NavbarA";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import moment from "moment";

// const BASE_URL = "http://194.195.117.79:5100/api";
// const TYPE_LIST = ["NEW", "FOLLOW", "POST-OPERATIVE"];

// export default function Appointment_list() {
//   const [appointmentData, setAppointmentData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   });
//   const [currentLocation, setCurrentLocation] = useState('default');
//   const [fromDate, setFromDate] = useState(new Date());
//   const [toDate, setToDate] = useState(new Date());
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);
//   const [cancellationReason, setCancellationReason] = useState("");
//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [doctors, setDoctors] = useState([]);
//   const [fdeList, setFdeList] = useState([]);
//   const [consultationList, setConsultationList] = useState([]);
//   const [timeSlots, setTimeSlots] = useState([]);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     console.log("Token:", token);
//     if (token) {
//       const payload = decodeJwt(token);
//       if (payload && payload.jobLocation) {
//         setCurrentLocation(payload.jobLocation);
//       }
//       console.log(payload.jobLocation);
//     }
//   }, []);

//   const formatDateToDDMMYYYY = (date) => {
//     if (date instanceof Date) {
//       return moment(date).format("DD-MM-YYYY");
//     }
//     return "";
//   };

//   const generateTimeSlots = () => {
//     const slots = [];
//     const startTime = moment().startOf('day').add(7, 'hours');
//     const endTime = moment().startOf('day').add(23, 'hours').add(45, 'minutes');

//     const isToday = moment(selectedAppointment?.appointment_timestamp).isSame(moment(), 'day');
//     if (isToday) {
//       let now = moment();
//       let currentMinutes = now.minute();
//       let nextInterval = Math.ceil(currentMinutes / 15) * 15;
//       startTime.set({ 'hour': now.hour(), 'minute': 0, 'second': 0 }).add(nextInterval, 'minutes');
//     }

//     let currentTime = startTime.clone();

//     while (currentTime.isSameOrBefore(endTime)) {
//       slots.push(currentTime.format('hh:mm A'));
//       currentTime.add(15, 'minutes');
//     }
//     return slots;
//   };

//   const fetchAppointmentData = useCallback(async () => {
//     setLoading(true);
//     try {
//       if (!fromDate || !toDate || currentLocation === 'default') return;

//       const formattedFromDate = formatDateToDDMMYYYY(fromDate);
//       const formattedToDate = formatDateToDDMMYYYY(toDate);
//       const url = `${BASE_URL}/V1/appointment/listAppointments?from=${formattedFromDate}&to=${formattedToDate}&location=${currentLocation}`;

//       const response = await fetch(url, { method: "GET" });
//       const data = await response.json();

//       if (response.ok && data.data) {
//         console.log(data.data);
//         setAppointmentData(data.data);
//       } else {
//         console.error("Error fetching appointments:", data.message || "Unknown error");
//       }
//     } catch (error) {
//       console.error("Error fetching appointments:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [fromDate, toDate, currentLocation]);

//   const fetchDropdownData = useCallback(async () => {
//     try {
//       const endpoints = [
//         `${BASE_URL}/V1/appointment/consultationDropdown?location=${currentLocation}`,
//         `${BASE_URL}/V1/appointment/doctorDropdown?location=${currentLocation}`,
//         `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
//       ];

//       const [consultationResponse, doctorResponse, fdeResponse] = await Promise.all(
//         endpoints.map(url => fetch(url).then(res => res.json()))
//       );

//       setConsultationList(Array.isArray(consultationResponse.data) ? consultationResponse.data : []);
//       setDoctors(Array.isArray(doctorResponse.data) ? doctorResponse.data : []);
//       setFdeList(Array.isArray(fdeResponse.data) ? fdeResponse.data : []);
//     } catch (error) {
//       console.error("Error fetching dropdown data:", error.message);
//     }
//   }, [currentLocation]);

//   useEffect(() => {
//     if (currentLocation !== 'default') {
//       fetchAppointmentData();
//       fetchDropdownData();
//     }
//   }, [fetchAppointmentData, fetchDropdownData, currentLocation]);

//   useEffect(() => {
//     if (selectedAppointment) {
//       setTimeSlots(generateTimeSlots());
//     }
//   }, [selectedAppointment?.appointment_timestamp]);

//   const handleDateChange = (date) => {
//     if (!date || !selectedAppointment) return;

//     setSelectedAppointment((prev) => ({
//       ...prev,
//       appointment_timestamp: date.toISOString(),
//     }));
//   };

//   const handleEditModalInputChange = (e) => {
//     const { name, value } = e.target;
//     setSelectedAppointment((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSaveChanges = async () => {
//     if (!selectedAppointment || !selectedAppointment.patient_phone) {
//       alert("Error: Patient Phone number is missing!");
//       return;
//     }

//     const updatePayload = {
//       ...selectedAppointment,
//       date: formatDateToDDMMYYYY(new Date(selectedAppointment.appointment_timestamp)),
//       patient_location: currentLocation,
//     };

//     try {
//       const response = await fetch(
//         `${BASE_URL}/V1/appointment/editAppointment/${selectedAppointment.patient_phone}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(updatePayload),
//         }
//       );

//       const result = await response.json();

//       if (response.ok) {
//         alert("Appointment updated successfully!");
//         fetchAppointmentData();
//         setShowEditModal(false);
//       } else {
//         console.error("Failed to update appointment:", result.message);
//         alert("Failed to update appointment: " + (result.message || "Unknown error"));
//       }
//     } catch (error) {
//       console.error("Error updating appointment:", error.message);
//       alert("Error updating appointment: " + error.message);
//     }
//   };

//   const handleDelete = async () => {
//     if (!appointmentIdToDelete) return;

//     try {
//       const response = await fetch(
//         `${BASE_URL}/V1/appointment/delete/${appointmentIdToDelete}?location=${currentLocation}`,
//         {
//           method: "DELETE",
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (response.ok) {
//         alert("Appointment successfully cancelled.");
//         fetchAppointmentData();
//         setShowDeleteModal(false);
//         setCancellationReason("");
//       } else {
//         const errorData = await response.json();
//         alert("Failed to delete appointment: " + (errorData.message || 'Unknown error'));
//       }
//     } catch (error) {
//       alert("An error occurred while deleting the appointment.");
//       console.error("Network Error:", error);
//     }
//   };

//   const handleProcessUpdate = async (appId, endpoint, successMessage) => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/V1/appointment/${endpoint}?appId=${appId}&location=${currentLocation}`,
//         { method: "PUT", headers: { "Content-Type": "application/json" } }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         alert(successMessage);
//         fetchAppointmentData();
//       } else {
//         alert(`Failed to update process: ${data.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       alert(`Error updating process. Please try again: ${error.message}`);
//     }
//   };

//   const getProcessColor = (rowData) => {
//     const { ConfirmPatient, historychk, executivechk, consultationchk } = rowData;
//     const isConfirmed = ConfirmPatient === 0;
//     const hasHistory = historychk === 3;
//     const hasExecution = executivechk === 1;
//     const hasConsultation = consultationchk === 2;
//     const hasReceipt = executivechk === 4;

//     if (!isConfirmed) return "#f0f0f0";
//     if (hasReceipt) return "#b2ff8e"; // Green
//     if (hasConsultation) return "#ccb3f0"; // Purple
//     if (hasExecution) return "#faff61"; // Yellow
//     if (hasHistory) return "#ff9861"; // Orange

//     return "#fff";
//   };

//   const renderActionBody = (rowData) => {
//     const { appointment_id, confirm_time, historychk, executivechk, consultationchk } = rowData;
//     const isConfirmed = confirm_time != 0;

//     return (
//       <div
//         className="cart-action"
//         style={{
//           backgroundColor: getProcessColor(rowData),
//           margin: "5px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "5px",
//           border: "3px solid #ccc",
//           padding: "10px",
//           borderRadius: "8px",
//           transition: "background-color 0.3s ease",
//         }}
//       >

//         {!isConfirmed && (
//           <>
//             <button title="Edit" onClick={() => { setSelectedAppointment(rowData); setShowEditModal(true); }} disabled={isConfirmed}>
//               <FeatherIcon icon="edit" className="w-18" />
//             </button>
//             <button title="Cancel" onClick={() => setAppointmentIdToDelete(appointment_id) || setShowDeleteModal(true)} disabled={isConfirmed}>
//               <FeatherIcon icon="trash-2" className="w-18 text-danger" />
//             </button>
//             <button title="Confirm" onClick={() => handleProcessUpdate(appointment_id, 'confirmAppointment', 'Appointment confirmed!')} disabled={isConfirmed}>
//               <FeatherIcon icon="check" className="w-18" />
//             </button>
//           </>
//         )}

//         {isConfirmed && (
//           <>
//             <button title="History" onClick={() => handleProcessUpdate(appointment_id, 'updateHistoryChk', 'History process completed!')} disabled={historychk === 3}>
//               <FeatherIcon icon="clock" className="w-18" />
//             </button>

//             <button title="Execution" onClick={() => handleProcessUpdate(appointment_id, 'updateExecutionChk', 'Execution process completed!')} disabled={historychk !== 3 || executivechk === 1 || executivechk === 4}>
//               <FeatherIcon icon="list" className="w-18" />
//             </button>

//             <button title="Consultation" onClick={() => handleProcessUpdate(appointment_id, 'updateConsultationChk', 'Consultation process completed!')} disabled={executivechk !== 1 || consultationchk === 2}>
//               <FeatherIcon icon="user-check" className="w-18" />
//             </button>

//             <button title="Receipts" disabled={consultationchk !== 2} onClick={() => { setSelectedAppointment(rowData); setShowReceiptModal(true); }}>
//               <FeatherIcon icon="file-text" className="w-18" />
//             </button>
//           </>
//         )}
//       </div>
//     );
//   };

//   const renderHeader = () => (
//     <div
//       style={{
//         border: "2px solid #4dd0e1",
//         textAlign: "center",
//         borderRadius: "12px",
//         padding: "15px",
//         backgroundColor: "#e0f7fa",
//         boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           gap: "20px",
//         }}
//       >

//         <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
//           <Form.Group style={{ display: "flex", alignItems: "center", margin: 0 }}>
//             <InputGroup>
//               <Form.Control
//                 type="search"
//                 value={filters.global.value || ""}
//                 onChange={(e) =>
//                   setFilters({
//                     global: {
//                       value: e.target.value,
//                       matchMode: FilterMatchMode.CONTAINS,
//                     },
//                   })
//                 }
//                 placeholder="Global Search"
//                 style={{
//                   borderRadius: "8px",
//                   border: "2px solid #4dd0e1",
//                   padding: "8px 12px",
//                   width: "250px",
//                   fontSize: "14px",
//                   transition: "all 0.3s ease",
//                 }}
//               />
//             </InputGroup>
//           </Form.Group>
//           <div style={{ fontSize: "14px", fontWeight: "bold", color: "#00838f" }}>
//             Location: {currentLocation.toUpperCase()}
//           </div>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "15px",
//             border: "2px solid #4dd0e1",
//             borderRadius: "12px",
//             padding: "15px",
//             backgroundColor: "#f5fcfd",
//           }}
//         >

//           <div>
//             <div style={{ fontSize: "14px", fontWeight: "500", color: "#00838f", marginBottom: "5px" }}>
//               From Date
//             </div>
//             <DatePicker
//               selected={fromDate}
//               onChange={setFromDate}
//               dateFormat="dd-MM-yyyy"
//               placeholderText="Select from date"
//               customInput={<Form.Control />}
//             />
//           </div>
//           <div>
//             <div style={{ fontSize: "14px", fontWeight: "500", color: "#00838f", marginBottom: "5px" }}>
//               To Date
//             </div>
//             <DatePicker
//               selected={toDate}
//               onChange={setToDate}
//               dateFormat="dd-MM-yyyy"
//               minDate={fromDate}
//               customInput={<Form.Control />}
//             />
//           </div>
//           <Button
//             variant="primary"
//             onClick={fetchAppointmentData}
//             style={{
//               backgroundColor: "#00bcd4",
//               border: "none",
//               borderRadius: "8px",
//               padding: "8px 20px",
//               fontSize: "14px",
//               fontWeight: "500",
//               color: "white",
//               cursor: "pointer",
//               transition: "all 0.3s ease",
//               boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//               marginTop: "20px",
//             }}
//             disabled={currentLocation === 'default'}
//           >
//             Refresh Data
//           </Button>
//         </div>
//       </div>
//     </div>
//   );

//   const getColumnStyle = (width) => ({
//     width: width,
//     minWidth: width,
//     border: "1px solid #90caf9",
//     textAlign: "center",
//     padding: "0.75rem"
//   });

//   const headerCenterStyle = { textAlign: "center" };

//   return (
//     <div
//       className="themebody-wrap"
//       style={{
//         background: "linear-gradient(to right, #e0f7fa, #80deea)",
//         fontFamily: "'Poppins', Arial, sans-serif",
//         minHeight: "100vh",
//         padding: "20px",
//       }}
//     >

//       <Modal
//         show={showDeleteModal}
//         onHide={() => setShowDeleteModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Reason of Cancellation</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>Appointment ID: **{appointmentIdToDelete}**</p>
//           <textarea
//             className="form-control"
//             placeholder="Enter the cancellation reason..."
//             rows="4"
//             value={cancellationReason}
//             onChange={(e) => setCancellationReason(e.target.value)}
//           ></textarea>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="danger" onClick={handleDelete}>
//             Submit & Cancel
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
//         <Modal.Header closeButton><Modal.Title>Edit Appointment</Modal.Title></Modal.Header>
//         <Modal.Body>
//           {selectedAppointment ? (
//             <Form>
//               <Row>
//                 <Col md={4} className="mb-4">
//                   <Form.Group className="mb-3">
//                     <Form.Label>Type</Form.Label>
//                     <Form.Select name="patient_type" value={selectedAppointment.patient_type || ""} onChange={handleEditModalInputChange}>
//                       <option value="">Select Type</option>
//                       {TYPE_LIST.map((type, index) => (<option key={index} value={type}>{type}</option>))}
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Doctor Name</Form.Label>
//                     <Form.Select name="doctorName" value={selectedAppointment.doctorName || ""} onChange={handleEditModalInputChange}>
//                       <option value="">Select a Doctor</option>
//                       {doctors.map((doctor) => (<option key={doctor.doctor_id} value={doctor.name}>{doctor.name}</option>))}
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Patient Name</Form.Label>
//                     <Form.Control type="text" name="patientName" value={selectedAppointment.patientName || ""} onChange={handleEditModalInputChange} />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Contact No</Form.Label>
//                     <Form.Control type="text" name="patient_phone" value={selectedAppointment.patient_phone || ""} onChange={handleEditModalInputChange} />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Appointment Date</Form.Label>
//                     <DatePicker
//                       selected={selectedAppointment.appointment_timestamp ? new Date(selectedAppointment.appointment_timestamp) : null}
//                       onChange={handleDateChange}
//                       dateFormat="dd-MM-yyyy"
//                       className="form-control"
//                       placeholderText="Select Date"
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Appointment Time</Form.Label>
//                     <Form.Select name="appointmentTime" value={selectedAppointment.appointmentTime || ""} onChange={handleEditModalInputChange}>
//                       <option value="">Select Time</option>
//                       {timeSlots.map((time, index) => (<option key={index} value={time}>{time}</option>))}
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <Button variant="primary" onClick={handleSaveChanges} style={{ float: "right", marginTop: '20px' }}>
//                 Save Changes
//               </Button>
//             </Form>
//           ) : (
//             <p>Loading appointment details...</p>
//           )}
//         </Modal.Body>
//       </Modal>

//       {showReceiptModal && (
//         <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} size="xl" centered>
//           <Modal.Body><p>Receipt Generation/Saving UI Goes Here.</p></Modal.Body>
//         </Modal>
//       )}

//       <NavBarA pagename="Appointment List" />
//       <div className="theme-body">
//         <Container fluid>
//           <Row>
//             <Col md={12}>
//               <Card
//                 style={{
//                   marginLeft: "-30px",
//                   marginRight: "-30px",
//                   borderRadius: "12px",
//                   boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
//                   borderColor: "#00bcd4",
//                   background: "white",
//                   border: "1px solid #00bcd4",
//                 }}
//               >
//                 <Card.Body>
//                   {loading ? (
//                     <div className="d-flex justify-content-center py-5" style={{ color: "#00bcd4" }}>
//                       <Spinner animation="border" role="status">
//                         <span className="visually-hidden">Loading...</span>
//                       </Spinner>
//                     </div>
//                   ) : (
//                     <DataTable
//                       value={appointmentData}
//                       paginator
//                       rows={10}
//                       filters={filters}
//                       header={renderHeader}
//                       globalFilterFields={[
//                         "appointment_id", "patient_name", "patient_phone", "doctor_name", "FDE_Name", "note",
//                       ]}
//                       currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
//                       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
//                       className="p-datatable-customers p-datatable-gridlines p-datatable-striped"
//                     >
//                       <Column
//                         field="appointment_id"
//                         header="Sr.No"
//                         sortable
//                         style={getColumnStyle("70px")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         field="appointment_timestamp"
//                         header="Date"
//                         sortable
//                         style={getColumnStyle("120px")}
//                         body={(rowData) => moment(rowData.appointment_timestamp).format("DD-MM-YYYY")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         field="appointment_time"
//                         header="Appo.Time"
//                         sortable
//                         style={getColumnStyle("120px")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         field="confirm_time"
//                         header="Confirm Time"
//                         sortable
//                         style={getColumnStyle("120px")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         field="patient_type"
//                         header="Type"
//                         sortable
//                         style={getColumnStyle("120px")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         field="patient_name"
//                         header="Patient Name"
//                         sortable
//                         style={getColumnStyle("180px")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         field="patient_phone"
//                         header="Contact No"
//                         sortable
//                         style={getColumnStyle("120px")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         field="doctor_name"
//                         header="Doctor Details"
//                         sortable
//                         style={getColumnStyle("180px")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         field="FDE_Name"
//                         header="FDE Name"
//                         sortable
//                         style={getColumnStyle("120px")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         field="note"
//                         header="Note"
//                         sortable
//                         style={getColumnStyle("250px")}
//                         headerClassName="datatable-header-center"
//                       />
//                       <Column
//                         header="Actions"
//                         body={renderActionBody}
//                         exportable={false}
//                         style={getColumnStyle("180px")}
//                         headerClassName="datatable-header-center"
//                       />
//                     </DataTable>
//                   )}
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//     </div>
//   );
// }

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

const BASE_URL = "http://194.195.117.79:5100/api";
const TYPE_LIST = ["NEW", "FOLLOW", "POST-OPERATIVE"];

const ActionButton = ({ title, onClick, disabled, icon, ...props }) => {
  const defaultBg = "#f1f1f1";
  const defaultBorder = "#ccc";
  const defaultColor = "#555";
  const isDanger = title === "Cancel";
  const isConfirm = title === "Confirm";
  const isReceipt = title === "Receipts";

  const baseStyle = {
    padding: "4px 6px",
    minWidth: "35px",
    borderRadius: "4px",
    border: `1px solid ${
      disabled ? "#ddd" : isDanger ? "#dc3545" : defaultBorder
    }`,
    backgroundColor: disabled ? "#f8f9fa" : isConfirm ? "#e6f7ea" : defaultBg,
    color: disabled ? "#aaa" : isDanger ? "#dc3545" : defaultColor,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: disabled ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
    opacity: disabled ? 0.6 : 1,
    ...props.style,
  };

  const iconColor = disabled
    ? "#aaa"
    : isDanger
    ? "#dc3545"
    : isReceipt
    ? "#007bff"
    : defaultColor;

  const iconStyle = {
    margin: "2px",
    width: "18px",
    height: "18px",
    stroke: iconColor,
  };

  const handleMouseOver = (e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = isDanger ? "#c82333" : "#e0e0e0";
      e.currentTarget.children[0].style.stroke = "white";
      e.currentTarget.style.color = isDanger ? "white" : defaultColor;
      e.currentTarget.style.border = `1px solid ${
        isDanger ? "#c82333" : "#b0b0b0"
      }`;
    }
  };

  const handleMouseOut = (e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = isConfirm ? "#e6f7ea" : defaultBg;
      e.currentTarget.children[0].style.stroke = iconColor;
      e.currentTarget.style.border = `1px solid ${
        isDanger ? "#dc3545" : defaultBorder
      }`;
    }
  };

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <FeatherIcon icon={icon} style={iconStyle} />
    </button>
  );
};

export default function Appointment_list() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [currentLocation, setCurrentLocation] = useState("default");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [consultationList, setConsultationList] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
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

  const generateTimeSlots = () => {
    const slots = [];
    const startTime = moment().startOf("day").add(7, "hours");
    const endTime = moment().startOf("day").add(23, "hours").add(45, "minutes");

    const isToday = moment(selectedAppointment?.appointment_timestamp).isSame(
      moment(),
      "day"
    );
    if (isToday) {
      let now = moment();
      let currentMinutes = now.minute();
      let nextInterval = Math.ceil(currentMinutes / 15) * 15;
      startTime
        .set({ hour: now.hour(), minute: 0, second: 0 })
        .add(nextInterval, "minutes");
    }

    let currentTime = startTime.clone();

    while (currentTime.isSameOrBefore(endTime)) {
      slots.push(currentTime.format("hh:mm A"));
      currentTime.add(15, "minutes");
    }
    return slots;
  };

  const fetchAppointmentData = useCallback(async () => {
    setLoading(true);
    try {
      if (!fromDate || !toDate || currentLocation === "default") return;

      const formattedFromDate = formatDateToDDMMYYYY(fromDate);
      const formattedToDate = formatDateToDDMMYYYY(toDate);
      const url = `${BASE_URL}/V1/appointment/listAppointments?from=${formattedFromDate}&to=${formattedToDate}&location=${currentLocation}`;

      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (response.ok && data.data) {
        console.log(data.data);
        setAppointmentData(data.data);
      } else {
        console.error(
          "Error fetching appointments:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, currentLocation]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const endpoints = [
        `${BASE_URL}/V1/appointment/consultationDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/doctorDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
      ];

      const [consultationResponse, doctorResponse, fdeResponse] =
        await Promise.all(
          endpoints.map((url) => fetch(url).then((res) => res.json()))
        );

      setConsultationList(
        Array.isArray(consultationResponse.data)
          ? consultationResponse.data
          : []
      );
      setDoctors(Array.isArray(doctorResponse.data) ? doctorResponse.data : []);
      setFdeList(Array.isArray(fdeResponse.data) ? fdeResponse.data : []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation !== "default") {
      fetchAppointmentData();
      fetchDropdownData();
    }
  }, [fetchAppointmentData, fetchDropdownData, currentLocation]);

  useEffect(() => {
    if (selectedAppointment) {
      setTimeSlots(generateTimeSlots());
    }
  }, [selectedAppointment?.appointment_timestamp]);

  const handleDateChange = (date) => {
    if (!date || !selectedAppointment) return;

    setSelectedAppointment((prev) => ({
      ...prev,
      appointment_timestamp: date.toISOString(),
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

    const updatePayload = {
      ...selectedAppointment,
      date: formatDateToDDMMYYYY(
        new Date(selectedAppointment.appointment_timestamp)
      ),
      patient_location: currentLocation,
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
        fetchAppointmentData();
        setShowEditModal(false);
      } else {
        console.error("Failed to update appointment:", result.message);
        alert(
          "Failed to update appointment: " + (result.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating appointment:", error.message);
      alert("Error updating appointment: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!appointmentIdToDelete) return;

    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/delete/${appointmentIdToDelete}?location=${currentLocation}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        alert("Appointment successfully cancelled.");
        fetchAppointmentData();
        setShowDeleteModal(false);
        setCancellationReason("");
      } else {
        const errorData = await response.json();
        alert(
          "Failed to delete appointment: " +
            (errorData.message || "Unknown error")
        );
      }
    } catch (error) {
      alert("An error occurred while deleting the appointment.");
      console.error("Network Error:", error);
    }
  };

  const handleProcessUpdate = async (appId, endpoint, successMessage) => {
    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/${endpoint}?appId=${appId}&location=${currentLocation}`,
        { method: "PUT", headers: { "Content-Type": "application/json" } }
      );

      const data = await response.json();

      if (response.ok) {
        alert(successMessage);
        fetchAppointmentData();
      } else {
        alert(`Failed to update process: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Error updating process. Please try again: ${error.message}`);
    }
  };

  const getRowClassName = (rowData) => {
    const {
      ConfirmPatient,
      historychk,
      executivechk,
      consultationchk,
      confirm_time,
    } = rowData;
    const isConfirmed = confirm_time != 0;
    const hasHistory = historychk === 3;
    const hasExecution = executivechk === 1;
    const hasConsultation = consultationchk === 2;
    const hasReceipt = executivechk === 4;

    if (!isConfirmed) return "row-status-unconfirmed";
    if (hasReceipt) return "row-status-receipt";
    if (hasConsultation) return "row-status-consultation";
    if (hasExecution) return "row-status-execution";
    if (hasHistory) return "row-status-history";

    return "";
  };

  const renderActionBody = (rowData) => {
    const {
      appointment_id,
      confirm_time,
      historychk,
      executivechk,
      consultationchk,
    } = rowData;
    const isConfirmed = confirm_time != 0;
    const isHistoryDone = historychk === 3;
    const isExecutionDone = executivechk === 1 || executivechk === 4;
    const isConsultationDone = consultationchk === 2;
    const isReceiptDone = executivechk === 4;

    return (
      <div
        className="cart-action"
        style={{
          margin: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2px",
          gap: "2px",
        }}
      >
        {!isConfirmed && (
          <>
            <ActionButton
              title="Edit"
              onClick={() => {
                setSelectedAppointment(rowData);
                setShowEditModal(true);
              }}
              disabled={isConfirmed}
              icon="edit"
              style={{ backgroundColor: "#9fd1ffff", borderColor: "#001696ff" }}
            />
            <ActionButton
              title="Cancel"
              onClick={() =>
                setAppointmentIdToDelete(appointment_id) ||
                setShowDeleteModal(true)
              }
              disabled={isConfirmed}
              icon="trash-2"
            />
            <ActionButton
              title="Confirm"
              onClick={() =>
                handleProcessUpdate(
                  appointment_id,
                  "confirmAppointment",
                  "Appointment confirmed!"
                )
              }
              disabled={isConfirmed}
              icon="check"
              style={{ backgroundColor: "#b4ffaaff", borderColor: "#007500ff" }}
            />
          </>
        )}

        {isConfirmed && (
          <>
            <ActionButton
              title="History"
              onClick={() =>
                handleProcessUpdate(
                  appointment_id,
                  "updateHistoryChk",
                  "History process completed!"
                )
              }
              disabled={isHistoryDone}
              icon="book-open"
            />

            <ActionButton
              title="Executive"
              onClick={() =>
                handleProcessUpdate(
                  appointment_id,
                  "updateExecutionChk",
                  "Execution process completed!"
                )
              }
              disabled={!isHistoryDone || isExecutionDone}
              icon="list"
            />

            <ActionButton
              title="Consultation"
              onClick={() =>
                handleProcessUpdate(
                  appointment_id,
                  "updateConsultationChk",
                  "Consultation process completed!"
                )
              }
              disabled={!isExecutionDone || isConsultationDone}
              icon="user"
            />

            <ActionButton
              title="Receipts"
              onClick={() => {
                setSelectedAppointment(rowData);
                setShowReceiptModal(true);
              }}
              disabled={!isConsultationDone}
              icon="credit-card"
            />
          </>
        )}
      </div>
    );
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
          <Form.Group
            style={{ display: "flex", alignItems: "center", margin: 0 }}
          >
            <span
              style={{
                marginRight: "10px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "15px",
              }}
            >
              Search
            </span>
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
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
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
              onChange={setFromDate}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
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
              minDate={fromDate}
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>
          <Button
            variant="primary"
            onClick={fetchAppointmentData}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "6px",
              padding: "8px 15px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "15px",
            }}
            disabled={currentLocation === "default"}
          >
            <FeatherIcon icon="refresh-ccw" size={16} className="me-2" />
            Refresh All Data
          </Button>
        </div>
      </div>
    </div>
  );

  const getColumnStyle = (width) => ({
    width: width,
    minWidth: width,
    maxWidth: width,
    border: "1px solid #000000ff",
    textAlign: "center",
    padding: "0.5rem",
  });

  const noteColumnStyle = {
    minWidth: "200px",
    maxWidth: "400px",
    border: "1px solid #000000ff",
    textAlign: "left",
    padding: "0.5rem",
    overflowWrap: "break-word",
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
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

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment ? (
            <Form>
              <Row>
                <Col md={4} className="mb-2">
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "14px" }}>Type</Form.Label>
                    <Form.Select
                      name="patient_type"
                      value={selectedAppointment.patient_type || ""}
                      onChange={handleEditModalInputChange}
                      style={{ fontSize: "14px" }}
                    >
                      <option value="">Select Type</option>
                      {TYPE_LIST.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "14px" }}>
                      Doctor Name
                    </Form.Label>
                    <Form.Select
                      name="doctorName"
                      value={selectedAppointment.doctorName || ""}
                      onChange={handleEditModalInputChange}
                      style={{ fontSize: "14px" }}
                    >
                      <option value="">Select a Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.doctor_id} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "14px" }}>
                      Patient Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="patientName"
                      value={selectedAppointment.patientName || ""}
                      onChange={handleEditModalInputChange}
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "14px" }}>
                      Contact No
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="patient_phone"
                      value={selectedAppointment.patient_phone || ""}
                      onChange={handleEditModalInputChange}
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "14px" }}>
                      Appointment Date
                    </Form.Label>
                    <DatePicker
                      selected={
                        selectedAppointment.appointment_timestamp
                          ? new Date(selectedAppointment.appointment_timestamp)
                          : null
                      }
                      onChange={handleDateChange}
                      dateFormat="dd-MM-yyyy"
                      className="form-control"
                      placeholderText="Select Date"
                      style={{ fontSize: "14px" }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "14px" }}>
                      Appointment Time
                    </Form.Label>
                    <Form.Select
                      name="appointmentTime"
                      value={selectedAppointment.appointmentTime || ""}
                      onChange={handleEditModalInputChange}
                      style={{ fontSize: "14px" }}
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
              </Row>
              <Button
                variant="primary"
                onClick={handleSaveChanges}
                style={{ float: "right", marginTop: "10px" }}
              >
                Save Changes
              </Button>
            </Form>
          ) : (
            <p>Loading appointment details...</p>
          )}
        </Modal.Body>
      </Modal>

      {showReceiptModal && (
        <Modal
          show={showReceiptModal}
          onHide={() => setShowReceiptModal(false)}
          size="xl"
          centered
        >
          <Modal.Body>
            <p>Receipt Generation/Saving UI Goes Here.</p>
          </Modal.Body>
        </Modal>
      )}

      <NavBarA pagename="Appointment List" />
      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  marginLeft: "-10px",
                  marginRight: "-10px",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                }}
              >
                <Card.Body>
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
                      value={appointmentData}
                      paginator
                      rows={10}
                      filters={filters}
                      header={renderHeader}
                      globalFilterFields={[
                        "appointment_id",
                        "patient_name",
                        "patient_phone",
                        "doctor_name",
                        "FDE_Name",
                        "note",
                      ]}
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                      className="p-datatable-customers p-datatable-gridlines p-datatable-striped datatable-compact-style"
                      rowClassName={getRowClassName}
                    >
                      <Column
                        field="appointment_id"
                        header="ID"
                        sortable
                        style={getColumnStyle("88px")}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="appointment_timestamp"
                        header="Date"
                        style={getColumnStyle("85px")}
                        body={(rowData) =>
                          moment(rowData.appointment_timestamp).format(
                            "DD-MM-YYYY"
                          )
                        }
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="appointment_time"
                        header="Appointment Time"
                        style={getColumnStyle("83px")}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="confirm_time"
                        header="Confirm Time"
                        style={getColumnStyle("65px")}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="patient_type"
                        header="Patient Type"
                        style={getColumnStyle("75px")}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="patient_name"
                        header="Patient Name"
                        style={getColumnStyle("120px")}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="patient_phone"
                        header="Contact No"
                        style={getColumnStyle("110px")}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="doctor_name"
                        header="Doctor"
                        style={getColumnStyle("110px")}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="FDE_Name"
                        header="FDE"
                        style={getColumnStyle("60px")}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="note"
                        header="Note"
                        style={getColumnStyle("145px")}
                        body={(rowData) => (
                          <div
                            style={{ whiteSpace: "normal", textAlign: "left" }}
                          >
                            {rowData.note}
                          </div>
                        )}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        header="Actions"
                        body={renderActionBody}
                        exportable={false}
                        style={getColumnStyle("165px")}
                        headerClassName="datatable-header-center"
                      />
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
