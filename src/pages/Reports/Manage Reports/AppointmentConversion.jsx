import React, { useState } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
} from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api"

const appointmentTypes = [
  { value: "New", label: "New" },
  { value: "Post Operative", label: "Post Operative" },
  { value: "Follow Up", label: "Follow Up" },
  { value: "Other", label: "Other" },
];

const appointmentStatusOptions = [
  { value: "Visited", label: "Visited" },
  { value: "Do not Wait", label: "Do not Wait" },
];

const AppointmentConversion = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentStatus, setAppointmentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  const handleFindClick = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !appointmentType) {
      alert("Please select all fields");
      return;
    }

    setLoading(true);
    try {
      const formatDateForAPI = (dateString) => {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      };

      const queryParams = new URLSearchParams({
        from: formatDateForAPI(fromDate),
        to: formatDateForAPI(toDate),
        patient_type: appointmentType,
      }).toString();

      const url = `${BASE_URL}/V1/appointment/listAppointments?${queryParams}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `HTTP error! status: ${response.status}${errorData ? ` - ${errorData.error}` : ""}`
        );
      }

      const data = await response.json();
      let filtered = data.data || [];

      // Filter by appointment status if selected
      if (appointmentStatus) {
        filtered = filtered.filter(app =>
          (app.status || "").toLowerCase() === appointmentStatus.toLowerCase()
        );
      }

      const sortedAppointments = filtered.sort((a, b) => {
        const dateA = new Date(a.date || a.appointment_date);
        const dateB = new Date(b.date || b.appointment_date);
        return dateB - dateA;
      });

      setAppointments(sortedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Error fetching appointments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = appointments.map((app, index) => ({
      "Sr No": index + 1,
      "Date": app.date || app.appointment_date,
      "UID no": app.appointment_uid || app._id,
      "Patient Name": app.patientName,
      "Patient Type": app.patient_type || app.appointmentType,
      "Appointment Type": app.patient_type || app.appointmentType,
      "Doctor Name": app.doctorName,
      "Doctor Type": app.doctor_type || "-",
      "FDE Name": app.fde_name || "-",
      "Cancellation": app.cancellation_reason || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "Appointment_Conversion_Report" + fileExtension);
  };


  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Appointment Conversion Report", 14, 15);

    const tableColumn = ["Sr No", "Date", "UID no", "Patient Name", "Patient Type", "Appointment Type", "Doctor Name", "Doctor Type", "FDE Name", "Cancellation"];
    const tableRows = appointments.map((app, index) => [
      index + 1,
      app.date || app.appointment_date,
      app.appointment_uid || app._id,
      app.patientName,
      app.patient_type || app.appointmentType,
      app.patient_type || app.appointmentType,
      app.doctorName,
      app.doctor_type || "-",
      app.fde_name || "-",
      app.cancellation_reason || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193] }
    });

    doc.save("Appointment_Conversion_Report.pdf");
  };

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center" style={{ gap: "20px" }}>
          <div className="d-flex align-items-center">
            <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Show</span>
            <Form.Select
              size="sm"
              style={{ width: "70px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Search</span>
            <span className="p-input-icon-left">
              <InputText
                value={searchText}
                onChange={onGlobalFilterChange}
                placeholder="Global Search..."
                className="p-inputtext-sm"
                style={{ width: "200px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
              />
            </span>
          </div>
        </div>
        <div className="d-flex" style={{ gap: "10px" }}>
          <button
            className="btn btn-success btn-sm"
            onClick={exportToExcel}
            style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
          >
            <i className="fa fa-file-excel-o"></i> Download Excel
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={downloadPDF}
            style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
          >
            <i className="fa fa-file-pdf-o"></i> Download PDF
          </button>
        </div>
      </div>
    );
  };

  const header = renderHeader();

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "10px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        fontSize: "13px",
      }}
    >
      <PageBreadcrumb pagename="Appointment Conversion" />

      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    fontSize: "20px",
                    color: "#006064",
                    background: "linear-gradient(to right, #4dd0e1, #00acc1)",
                    borderBottom: "3px solid #00bcd4",
                    padding: "0.8rem",
                    backgroundColor: "white",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "18px" }}>Manage Appointment Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleFindClick}>
                    <Row className="align-items-end mb-4 flex-nowrap" style={{ margin: "0 -5px" }}>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>From Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>To Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>Appointment Type</Form.Label>
                          <Form.Select
                            value={appointmentType}
                            onChange={(e) => setAppointmentType(e.target.value)}
                            style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                          >
                            <option value="">Select Type</option>
                            {appointmentTypes.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>Appointment Status</Form.Label>
                          <Form.Select
                            value={appointmentStatus}
                            onChange={(e) => setAppointmentStatus(e.target.value)}
                            style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                          >
                            <option value="">Select Status</option>
                            {appointmentStatusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{
                              height: "35px",
                              width: "100%",
                              backgroundColor: "#00acc1",
                              borderColor: "#00bcd4",
                              color: "white",
                              borderRadius: "8px",
                              fontWeight: "bold",
                              fontSize: "13px"
                            }}
                          >
                            {loading ? "Loading..." : "Search"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  <DataTable
                    value={appointments}
                    paginator
                    rows={rows}
                    filters={filters}
                    header={header}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    emptyMessage={loading ? "Loading..." : "No records found."}
                    className="p-datatable-sm custom-datatable"
                    style={{ fontSize: "12px" }}
                    rowHover
                    stripedRows
                    responsiveLayout="scroll"
                  >
                    <Column
                      header="Sr No"
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{ width: "60px", textAlign: "center" }}
                    />
                    <Column field="date" header="Date" body={(row) => row.date || row.appointment_date} />
                    <Column field="appointment_uid" header="UID no" body={(row) => row.appointment_uid || row._id} />
                    <Column field="patientName" header="Patient Name" />
                    <Column field="patient_type" header="Patient Type" body={(row) => row.patient_type || row.appointmentType} />
                    <Column field="appointmentType" header="Appointment Type" body={(row) => row.patient_type || row.appointmentType} />
                    <Column field="doctorName" header="Doctor Name" />
                    <Column field="doctor_type" header="Doctor Type" body={(row) => row.doctor_type || "-"} />
                    <Column field="fde_name" header="FDE Name" body={(row) => row.fde_name || "-"} />
                    <Column field="cancellation_reason" header="Cancellation" body={(row) => row.cancellation_reason || "-"} />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
        .custom-datatable .p-datatable-header {
          background: #e0f7fa;
          border: 1px solid #4dd0e1;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 10px;
        }
        .custom-datatable .p-datatable-thead > tr > th {
          background-color: #b2ebf2 !important;
          color: black !important;
          font-size: 12px;
          padding: 10px 8px !important;
          border: 1px solid #90caf9 !important;
          text-align: center !important;
        }
        .custom-datatable .p-datatable-thead > tr > th * {
          color: black !important;
          justify-content: center !important;
        }
        .custom-datatable .p-datatable-tbody > tr > td {
          font-size: 12px;
          padding: 8px;
          border: 1px solid #90caf9;
          text-align: center !important;
        }
        .custom-datatable .p-paginator {
          background: #f8fdfe;
          border: 1px solid #4dd0e1;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          padding: 5px;
        }
      `}</style>
    </div>
  );
};

export default AppointmentConversion;
