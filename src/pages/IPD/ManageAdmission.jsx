import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Modal,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MuiDateTimePicker from "../IPD Forms/inputs/MuiDateTimePicker";
import dayjs from "dayjs";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

export default function ManageAdmission() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLocation, setCurrentLocation] = useState("default");

  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [reschedulePatient, setReschedulePatient] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelPatient, setCancelPatient] = useState(null);

  // 1. Initialize Location from JWT
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
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatToApiDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 2. Fetch Logic
  // const fetchVerifiedPatients = useCallback(async () => {
  //     if (currentLocation === "default") return;

  //     setLoading(true);
  //     try {
  //         const response = await fetch(`${BASE_URL}/V1/ipd/admin/listVerifiedPatients?location=${currentLocation}`, {
  //             method: "GET",
  //             headers: {
  //                 "Content-Type": "application/json",
  //                 "Authorization": `Bearer ${localStorage.getItem("token")}`
  //             }
  //         });

  //         if (response.ok) {
  //             const result = await response.json();
  //             console.log(result);
  //             // Map API data to your component's expected structure
  //             const formattedData = result.map(p => ({
  //                 uhid: p.uid,
  //                 name: p.name,
  //                 contact: p.patient_phone,
  //                 age: p.age,
  //                 gender: p.sex,
  //                 verifiedDate: formatDate(p.created_at),
  //                 admissionNo: (p.admission_no === 0 || p.admission_no === "0") ? null : p.admission_no,
  //                 patient_id: p.patient_id,
  //                 global_id: p.global_id
  //             }));
  //             console.log(formattedData);
  //             setPatients(formattedData);
  //         } else {
  //             console.error("Failed to fetch verified patients");
  //         }
  //     } catch (error) {
  //         console.error("Error fetching data:", error);
  //     } finally {
  //         setLoading(false);
  //     }
  // }, [currentLocation]);

  const fetchVerifiedPatients = useCallback(async () => {
    if (currentLocation === "default") return;

    setLoading(true);
    try {
      const from = formatToApiDate(fromDate);
      const to = formatToApiDate(toDate);
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admin/listVerifiedPatients?location=${currentLocation}&from=${from}&to=${to}`,
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
        
        // 1. Sort the raw data by date (Descending: Newest first)
        const sortedData = result.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        // 2. Map the sorted data to your formatted structure
        const formattedData = sortedData.map((p) => ({
          uhid: p.uid,
          name: p.name,
          contact: p.patient_phone,
          age: p.age,
          gender: p.sex,
          verifiedDate: p.admission_datetime || "NOT ADMITTED",
          surgeryDate: p.surgery_datetime || "Not Scheduled", // Using the formatter from previous step
          admissionNo:
            p.admission_no === 0 || p.admission_no === "0"
              ? null
              : p.admission_no,
          patient_id: p.patient_id,
          global_id: p.global_id,
        }));

        setPatients(formattedData);
      } else {
        console.error("Failed to fetch verified patients");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, fromDate, toDate]);

  useEffect(() => {
    fetchVerifiedPatients();
  }, [fetchVerifiedPatients]);

  // 3. Search Filtering - PrimeReact DataTable handles global filtering via filters1 state

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
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
              onChange={(e) => setRows(parseInt(e.target.value))}
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
            style={{
              display: "flex",
              alignItems: "center",
              margin: 0,
            }}
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
              onChange={(date) => setFromDate(date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
              maxDate={new Date()}
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
              onChange={(date) => setToDate(date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
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
            onClick={() => fetchVerifiedPatients()}
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
              marginTop: "15px",
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );

  const header = renderHeader();

  const handleRescheduleClick = (patient) => {
    setReschedulePatient(patient);
    // Initialize to null to force selection (required)
    setRescheduleDate(null);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();

    try {
      Swal.fire({ title: "Updating...", didOpen: () => Swal.showLoading() });

      const response = await fetch(
        `${BASE_URL}/V1/ipd/admin/rescheduleSurgeryDate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            location: currentLocation,
            uidNo: reschedulePatient.uhid, // Ensure this matches your state key
            rescheduleDate: rescheduleDate,
          }),
        },
      );

      if (response.ok) {
        Swal.fire("Success", "Surgery date rescheduled!", "success");
        setShowRescheduleModal(false);
        fetchVerifiedPatients(); // Refresh the list/calendar
      } else {
        const err = await response.json();
        throw new Error(err.message || "Failed to reschedule");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleCancelClick = (patient) => {
    setCancelPatient(patient);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();

    if (!cancelReason.trim()) {
      Swal.fire(
        "Required",
        "Please provide a reason for cancellation",
        "warning",
      );
      return;
    }

    try {
      // Show a loading state inside Swal
      Swal.fire({
        title: "Cancelling Admission...",
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
            uhid: cancelPatient.uhid, // Fixed: Using cancelPatient
            contact: cancelPatient.contact, // Fixed: Using cancelPatient.contact
            reason: cancelReason,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Cancelled!",
          text: "The surgery entry has been successfully removed.",
          timer: 2000,
          showConfirmButton: false,
        });

        setShowCancelModal(false);
        fetchVerifiedPatients(); // Refresh the DataTable to remove the cancelled patient
      } else {
        throw new Error(data.message || "Failed to cancel admission");
      }
    } catch (error) {
      console.error("Cancellation Error:", error);
      Swal.fire("Error", error.message || "Server connection failed", "error");
    }
  };

  const actionBodyTemplate = (patient) => {
    return (
      <div className="d-flex justify-content-center gap-1">
        {!patient.admissionNo ? (
          <>
            <Button
              variant="outline-primary"
              size="sm"
              title="Reschedule Surgery"
              onClick={() => handleRescheduleClick(patient)}
              style={{
                borderRadius: "6px",
                padding: "5px 8px",
              }}
            >
              <FeatherIcon icon="calendar" size={16} />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              title="Cancel Surgery"
              onClick={() => handleCancelClick(patient)}
              style={{
                borderRadius: "6px",
                padding: "5px 8px",
              }}
            >
              <FeatherIcon icon="trash-2" size={16} />
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              title="Confirm Surgery"
              onClick={() => handleConfirm(patient.contact, patient.uhid)}
              style={{
                borderRadius: "6px",
                padding: "5px 8px",
              }}
            >
              <FeatherIcon icon="check" size={16} />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleForms(patient)}
              title="All Forms"
              style={{
                borderRadius: "6px",
                backgroundColor: "#178aaeff",
                border: "none",
                padding: "5px 8px",
              }}
            >
              <FeatherIcon icon="file-text" size={16} />
            </Button>
            <Button
              variant="primary"
              size="sm"
              title="Print All Forms"
              style={{
                borderRadius: "6px",
                backgroundColor: "#178aaeff",
                border: "none",
                padding: "5px 8px",
              }}
            >
              <FeatherIcon icon="printer" size={16} />
            </Button>
          </>
        )}
      </div>
    );
  };

  const handleForms = (patientData) => {
    navigate(`/surgery/forms`, { state: { patientData: patientData } });
  };

  const handleConfirm = (contact, uhid) => {
    Swal.fire({
      title: "Confirm Admission?",
      text: "This will move the patient to the surgery list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#15ab56ff",
      cancelButtonColor: "#dc1818ff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Call backend to update status and generate Admission No
          const response = await fetch(
            `${BASE_URL}/V1/ipd/admin/confirmAdmissionEntry`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contact,
                uhid,
                location: currentLocation,
              }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            
            Swal.fire(
              "Confirmed!",
              `Admission No: ${data.admissionNo} generated.`,
              "success",
            );
            fetchVerifiedPatients(); // Refresh the list
          }
        } catch (error) {
          Swal.fire("Error", "Could not confirm admission", "error");
        }
      }
    });
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "15px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Manage Admission" />

      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col>
              <Card
                style={{
                  borderRadius: "15px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                  border: "none",
                  background: "white",
                  overflow: "hidden",
                }}
              >
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="info" />
                      <p className="mt-2 text-muted">Loading data...</p>
                    </div>
                  ) : (
                    <DataTable
                      value={patients}
                      paginator
                      rows={rows}
                      first={first}
                      onPage={(e) => {
                        setFirst(e.first);
                        setRows(e.rows);
                      }}
                      filters={filters1}
                      header={header}
                      globalFilterFields={[
                        "uhid",
                        "name",
                        "contact",
                        "admissionNo",
                      ]}
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      responsiveLayout="scroll"
                      className="datatable-compact-style datatable-medium-small"
                      style={{ padding: "5px" }}
                    >
                      <Column
                        field="verifiedDate"
                        header="Admission Date & Time"
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "140px",
                        }}
                      />

                      <Column
                        field="surgeryDate" // Changed from verifiedDate
                        header="Surgery Date & Time"
                        headerClassName="datatable-header-center"
                        body={(rowData) => (
                          <span style={{ fontSize: "10px" }}>
                            {rowData.surgeryDate}
                          </span>
                        )}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "160px",
                        }}
                      />

                      <Column
                        field="uhid"
                        header="UHID No"
                        headerClassName="datatable-header-center"
                        body={(rowData) => (
                          <span
                            className="fw-bold"
                            style={{ color: "#178aaeff" }}
                          >
                            {rowData.uhid}
                          </span>
                        )}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />

                      <Column
                        field="admissionNo"
                        header="Admission No"
                        headerClassName="datatable-header-center"
                        body={(rowData) => (
                          <span
                            className={
                              rowData.admissionNo ? "fw-bold" : "text-muted"
                            }
                            style={{
                              color: rowData.admissionNo
                                ? "#178aaeff"
                                : "inherit",
                            }}
                          >
                            {rowData.admissionNo || "N/A"}
                          </span>
                        )}
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
                          width: "150px",
                        }}
                      />

                      <Column
                        field="contact"
                        header="Contact No"
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />
                      <Column
                        header="Age/Gender"
                        headerClassName="datatable-header-center"
                        body={(rowData) => `${rowData.age} / ${rowData.gender}`}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "100px",
                        }}
                      />
                      <Column
                        header="Actions"
                        headerClassName="datatable-header-center"
                        body={actionBodyTemplate}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "110px",
                        }}
                      />
                    </DataTable>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Reschedule Surgery Modal */}
      <Modal
        show={showRescheduleModal}
        onHide={() => setShowRescheduleModal(false)}
        centered
        size="md"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#67c5cfff",
            borderBottom: "2px solid #1a5b61ff",
            padding: "7px 15px",
          }}
        >
          <Modal.Title
            style={{
              color: "#1a5b61ff",
              fontWeight: "600",
              fontSize: "1.1rem",
            }}
          >
            <FeatherIcon icon="calendar" size="18" className="me-2" />
            Reschedule Surgery
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRescheduleSubmit}>
          <Modal.Body style={{ padding: "10px" }}>
            <MuiDateTimePicker
              label="New Surgery Date & Time"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              name="rescheduleDate"
              type="datetime"
              required={true}
              disablePast={true}
              placeholder="Select New Date & Time"
              style={{ marginBottom: "0px" }}
            />
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="secondary"
              onClick={() => setShowRescheduleModal(false)}
              style={{ borderRadius: "8px", padding: "8px 20px" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: "#178aaeff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 20px",
                fontWeight: "600",
              }}
            >
              Submit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Cancellation Reason Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
        size="md"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#67c5cfff",
            borderBottom: "2px solid #1a5b61ff",
            padding: "7px 15px",
          }}
        >
          <Modal.Title
            style={{
              color: "#1a5b61ff",
              fontWeight: "600",
              fontSize: "1.1rem",
            }}
          >
            <FeatherIcon icon="trash-2" size="18" className="me-2" />
            Reason of cancellation for surgery
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCancelSubmit}>
          <Modal.Body style={{ padding: "10px" }}>
            <Form.Group>
              <Form.Label
                style={{
                  fontWeight: "600",
                  marginBottom: "8px",
                  fontSize: "0.85rem",
                  color: "#34495e",
                }}
              >
                Cancellation Reason
                <span style={{ color: "red", marginLeft: "4px" }}>*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter the reason for cancellation..."
                style={{
                  borderRadius: "8px",
                  border: "1.5px solid #4dd0e1",
                  fontSize: "0.85rem",
                  padding: "5px",
                }}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              type="submit"
              variant="danger"
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "8px 20px",
                fontWeight: "600",
              }}
            >
              Confirm & Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
