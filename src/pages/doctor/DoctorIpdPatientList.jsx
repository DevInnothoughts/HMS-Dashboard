import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import DatePicker from "react-datepicker";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";

const BASE_URL = "http://localhost:5100/api";

const formatSurgeryDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeDate = (value) => {
  if (!value) return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  return null;
};

const buildSurgeryValue = (date, time) => {
  if (!date) return "";
  if (!time) return date;
  return `${date} ${time}`;
};

const formatAgeGender = (age, sex) => {
  const ageText = age === null || age === undefined || age === "" ? "N/A" : age;
  const sexText = sex ? sex : "N/A";
  return `${ageText} / ${sexText}`;
};

export default function DoctorIpdPatientList() {
  const navigate = useNavigate();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [filters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentLocation("default");
      return;
    }

    const payload = decodeJwt(token);
    if (payload?.jobLocation) {
      setCurrentLocation(payload.jobLocation);
    }
  }, []);

  const loadPatients = useCallback(async () => {
    if (!currentLocation || currentLocation === "default") {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/admission/list-admissions?location=${encodeURIComponent(currentLocation)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch IPD patients");
      }

      const result = await response.json();
      const normalizedPatients = Array.isArray(result)
        ? result.map((patient) => ({
            ...patient,
            surgeryDate: buildSurgeryValue(
              patient.surgery_date,
              patient.surgery_time,
            ),
            admissionNo: patient.adm_no || "",
            patientName: patient.patient_name || "",
            name: patient.patient_name || "",
            ageGender: formatAgeGender(patient.age, patient.sex),
            roomType: patient.room_type || "N/A",
            roomNo: patient.room_no || "N/A",
            surgeonName: patient.surgeon_name || "N/A",
            sxPlan: patient.sx_plan || "N/A",
            Uid_no: patient.uid_no || "",
            patient_type: patient.patient_type ?? 0,
            phone: patient.phone || "",
            age: patient.age || "",
            sex: patient.sex || "",
            address: patient.address || "",
          }))
        : [];

      setPatients(normalizedPatients);
      setFirst(0);
    } catch (error) {
      console.error("Error loading IPD patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation !== "default") {
      loadPatients();
    }
  }, [currentLocation, loadPatients]);

  const filteredPatients = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch =
        !searchValue ||
        [
          patient.surgeryDate,
          patient.admissionNo,
          patient.patientName,
          patient.ageGender,
          patient.roomType,
          patient.roomNo,
          patient.surgeonName,
          patient.sxPlan,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchValue);

      const patientDate = normalizeDate(patient.surgeryDate);
      const matchesFrom = !fromDate || (patientDate && patientDate >= fromDate);
      const matchesTo = !toDate || (patientDate && patientDate <= toDate);

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [fromDate, patients, searchTerm, toDate]);

  const handleTodayPatients = () => {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    setFromDate(start);
    setToDate(end);
  };

  const handleClearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setSearchTerm("");
    setFirst(0);
  };

  const handleRefresh = () => {
    loadPatients();
  };

  const actionBodyTemplate = (patient) => (
    <div className="d-flex align-items-center justify-content-center">
      <Button
        variant="primary"
        className="btn-primary btn-extra-small btn-icon"
        title="View"
        onClick={() =>
          navigate("/doctor-patient-details", { state: { patient } })
        }
        style={{
          borderRadius: "6px",
          padding: "5px 8px",
        }}
      >
        <FeatherIcon icon="eye" size="16" />
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
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
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
              onChange={(e) => setRows(parseInt(e.target.value, 10))}
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
            <InputGroup style={{ position: "relative" }}>
              <Form.Control
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

          <Button
            variant="info"
            onClick={handleTodayPatients}
            style={{
              backgroundColor: "#29b6f6",
              border: "none",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <FeatherIcon icon="calendar" size={12} className="me-1" />
            Today's Patients
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
            flexWrap: "wrap",
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
            onClick={handleRefresh}
            disabled={loading}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "6px 7px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "15px",
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />
            {loading ? "Loading..." : "Refresh"}
          </Button>

          <Button
            variant="secondary"
            onClick={handleClearFilters}
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
      <PageBreadcrumb pagename="IPD Patient List" />

      <div className="theme-body" style={{ minHeight: "100vh" }}>
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
                  margin: "10px -10px 12px -10px",
                }}
              >
                <Card.Body style={{ marginTop: "-6px" }}>
                  <DataTable
                    value={filteredPatients}
                    paginator
                    rows={rows}
                    first={first}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    filters={filters1}
                    header={renderHeader()}
                    globalFilterFields={[
                      "admissionNo",
                      "patientName",
                      "ageGender",
                      "roomType",
                      "roomNo",
                      "surgeonName",
                      "sxPlan",
                    ]}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    responsiveLayout="scroll"
                    className="datatable-compact-style datatable-medium-small"
                  >
                    <Column
                      field="surgeryDate"
                      header="Surgery Date & Time"
                      body={(rowData) => formatSurgeryDate(rowData.surgeryDate)}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "170px",
                      }}
                    />

                    <Column
                      field="admissionNo"
                      header="Admission No"
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "130px",
                      }}
                    />

                    <Column
                      field="patientName"
                      header="Patient Name"
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "left",
                        padding: "0.75rem",
                        minWidth: "180px",
                      }}
                    />

                    <Column
                      field="ageGender"
                      header="Age/Gender"
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "120px",
                      }}
                    />

                    <Column
                      field="roomType"
                      header="Room type"
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "140px",
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
                        width: "110px",
                      }}
                    />

                    <Column
                      field="surgeonName"
                      header="Surgeon Name"
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "left",
                        padding: "0.75rem",
                        minWidth: "180px",
                      }}
                    />

                    <Column
                      field="sxPlan"
                      header="SX Plan"
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "left",
                        padding: "0.75rem",
                        minWidth: "150px",
                      }}
                    />

                    <Column
                      header="Action"
                      body={actionBodyTemplate}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "110px",
                      }}
                    />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
