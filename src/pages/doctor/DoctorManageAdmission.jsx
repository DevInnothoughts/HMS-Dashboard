import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Spinner,
  Modal
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BASE_URL = "http://194.195.117.79:5100/api";

export default function DoctorManageAdmission() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");

  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [toDate, setToDate] = useState(new Date());

  // Initialize Location from JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const formatToApiDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [reschedulePatient, setReschedulePatient] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelPatient, setCancelPatient] = useState(null);

  const fetchVerifiedPatients = useCallback(async () => {
    if (currentLocation === "default") return;

    setLoading(true);
    try {
      const from = formatToApiDate(fromDate);
      const to = formatToApiDate(toDate);
      const response = await fetch(
        `${BASE_URL}/V1/doctor/manage-admission/list?location=${currentLocation}&from=${from}&to=${to}`,
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
        console.log("Doctor Manage Admission Result:", result);

        if (!Array.isArray(result)) {
          console.error("Expected array but got:", typeof result);
          return;
        }

        const sortedData = result.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        const formattedData = sortedData.map((p) => ({
          uhid: p.uid,
          name: p.name,
          contact: p.patient_phone,
          age: p.age,
          gender: p.sex,
          verifiedDate: p.admission_datetime || "NOT ADMITTED",
          surgeryDate: p.surgery_datetime || "Not Scheduled",
          roomType: p.room_type || "N/A",
          roomNo: p.room_no || "N/A",
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

  const handleRescheduleClick = (patient) => {
    setReschedulePatient(patient);
    setRescheduleDate(null);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({ title: "Updating...", didOpen: () => Swal.showLoading() });
      const response = await fetch(
        `${BASE_URL}/V1/doctor/manage-admission/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            location: currentLocation,
            uidNo: reschedulePatient.uhid,
            rescheduleDate: rescheduleDate,
          }),
        },
      );

      if (response.ok) {
        Swal.fire("Success", "Surgery date rescheduled!", "success");
        setShowRescheduleModal(false);
        fetchVerifiedPatients();
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
      Swal.fire("Required", "Please provide a reason", "warning");
      return;
    }
    try {
      Swal.fire({ title: "Cancelling...", didOpen: () => Swal.showLoading() });
      const response = await fetch(
        `${BASE_URL}/V1/doctor/manage-admission/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            location: currentLocation,
            uhid: cancelPatient.uhid,
            contact: cancelPatient.contact,
            reason: cancelReason,
          }),
        },
      );

      if (response.ok) {
        Swal.fire("Cancelled!", "Admission entry has been removed.", "success");
        setShowCancelModal(false);
        fetchVerifiedPatients();
      } else {
        const err = await response.json();
        throw new Error(err.message || "Failed to cancel");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleConfirm = (contact, uhid) => {
    Swal.fire({
      title: "Confirm Admission?",
      text: "This will generate an official Admission Number.",
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
              body: JSON.stringify({ contact, uhid, location: currentLocation }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            Swal.fire(
              "Confirmed!",
              `Admission No: ${data.data.admissionNo} generated.`,
              "success",
            );
            fetchVerifiedPatients();
          } else {
            const err = await response.json();
            throw new Error(err.message || "Failed to confirm");
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
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
              style={{ borderRadius: "6px", padding: "5px 8px" }}
            >
              <FeatherIcon icon="calendar" size={16} />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              title="Cancel Surgery"
              onClick={() => handleCancelClick(patient)}
              style={{ borderRadius: "6px", padding: "5px 8px" }}
            >
              <FeatherIcon icon="trash-2" size={16} />
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              title="Confirm Admission"
              onClick={() => handleConfirm(patient.contact, patient.uhid)}
              style={{ borderRadius: "6px", padding: "5px 8px" }}
            >
              <FeatherIcon icon="check" size={16} />
            </Button>
          </>
        ) : (
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
            onClick={() => {
              console.log("Printing forms for patient:", patient.name);
            }}
          >
            <FeatherIcon icon="printer" size={16} />
          </Button>
        )}
      </div>
    );
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
      <PageBreadcrumb pagename="Doctor Manage Admission" />

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
                          width: "170px",
                        }}
                      />

                      <Column
                        field="surgeryDate"
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
                        field="roomType"
                        header="Room Type"
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />

                      <Column
                        field="roomNo"
                        header="Room No"
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "100px",
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
                        body={(rowData) => `${rowData.age} yrs / ${rowData.gender}`}
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

      {/* Reschedule Modal */}
      <Modal
        show={showRescheduleModal}
        onHide={() => setShowRescheduleModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#67c5cfff" }}>
          <Modal.Title style={{ color: "#1a5b61ff", fontSize: "1rem" }}>
            Reschedule Surgery
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRescheduleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label style={{ color: "#1a5b61ff", fontSize: "13px" }}>New Surgery Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                required
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Reschedule</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#67c5cfff" }}>
          <Modal.Title style={{ color: "#1a5b61ff", fontSize: "1rem" }}>
            Cancel Admission
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCancelSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Reason for Cancellation</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowCancelModal(false)}>Back</Button>
            <Button variant="danger" type="submit">Cancel Admission</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
