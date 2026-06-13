import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import {
  Row,
  Col,
  Card,
  Container,
  Spinner,
  Form,
  Button,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { InputText } from "primereact/inputtext";
import SimpleBar from "simplebar-react";
import moment from "moment";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { decodeJwt } from "../../../utils/decode-jwt";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const BirthdayAlert = () => {
  const currentDate = moment().format("DD-MM-YYYY");
  const [patients, setPatients] = useState([]);

  const formatBirthDate = (birthDate) => {
    if (!birthDate || birthDate === "-" || birthDate === "--") return "-";
    const m = moment(birthDate, ["DD-MM-YYYY", "DD/MM/YYYY", "DDMMYYYY", "YYYY-MM-DD"]);
    return m.isValid() ? m.format("DD-MM-YYYY") : birthDate;
  };
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const fetchBirthdays = useCallback(async () => {
    if (currentLocation === "default") return;

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getBirthdayAlerts?location=${currentLocation}`,
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
        console.log("Birthday API raw response:", result);

        // Extracting data from your controller's structure: result.reportsdetails.data
        const birthdayData = result.reportsdetails?.data || [];
        console.log("Extracted birthday patients list:", birthdayData);
        setPatients(birthdayData);
      } else {
        console.error("Birthday API error response:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching birthdays:", error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchBirthdays();
  }, [fetchBirthdays]);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const handleRefresh = () => {
    setGlobalFilterValue("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    setFirst(0);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Birthday Alert", 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date: ${currentDate}`, 14, 22);

    const tableColumn = [
      "Sr No",
      "Birth Date",
      "Patient Name",
      "Contact Number",
      "Address",
    ];
    const tableRows = [...patients]
      .sort((a, b) => {
        const dateA = moment(a.birth_date, ["DD-MM-YYYY", "DD/MM/YYYY", "DDMMYYYY", "YYYY-MM-DD"]);
        const dateB = moment(b.birth_date, ["DD-MM-YYYY", "DD/MM/YYYY", "DDMMYYYY", "YYYY-MM-DD"]);
        return dateA.diff(dateB);
      })
      .map((item, index) => [
        index + 1,
        formatBirthDate(item.birth_date),
        item.name,
        item.phone,
        item.address,
      ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193] },
    });

    doc.save(`Birthday_Alert_${currentDate}.pdf`);
  };

  const renderHeader = () => {
    return (
      <div
        className="d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: "#e0f7fa",
          padding: "6px 12px",
          borderRadius: "8px",
          border: "1.5px solid #4dd0e1",
          marginBottom: "6px",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <span
              style={{
                marginRight: "10px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#00838f",
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
                width: "80px",
                height: "35px",
                borderRadius: "8px",
                border: "1.5px solid #4dd0e1",
                fontSize: "13px",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </div>

          <div className="d-flex align-items-center">
            <span
              style={{
                marginRight: "10px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#00838f",
              }}
            >
              Search
            </span>
            <span className="p-input-icon-left">
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Global Search"
                style={{
                  borderRadius: "8px",
                  padding: "5px 1px 5px 5px",
                  fontSize: "12px",
                  border: "1.5px solid #4dd0e1",
                  width: "200px",
                  height: "35px",
                }}
              />
            </span>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={handleRefresh}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "8px 15px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={15} />
            Refresh
          </Button>

          <Button
            variant="danger"
            onClick={downloadPDF}
            style={{
              backgroundColor: "#ef5350",
              border: "none",
              borderRadius: "8px",
              padding: "8px 15px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <i className="fa fa-file-pdf-o"></i>
            Download PDF
          </Button>
        </div>
      </div>
    );
  };

  const header = renderHeader();

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
      <PageBreadcrumb pagename="Birthday Alert" />

      <div className="theme-body">
        <Container fluid>
          <Row className="justify-content-center">
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1.5px solid #00bcd4",
                  overflow: "hidden",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    borderBottom: "none",
                    padding: "0.8rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                  }}
                >
                  <h4 style={{ margin: 0, letterSpacing: "0.5px" }}>
                    Today's Birthday Alert
                  </h4>
                  <div
                    style={{ fontSize: "16px", marginTop: "5px", opacity: 0.9 }}
                  >
                    {currentDate}
                  </div>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  {renderHeader()}
                  <DataTable
                    value={[...patients].sort((a, b) => {
                      const dateA = moment(a.birth_date, ["DD-MM-YYYY", "DD/MM/YYYY", "DDMMYYYY", "YYYY-MM-DD"]);
                      const dateB = moment(b.birth_date, ["DD-MM-YYYY", "DD/MM/YYYY", "DDMMYYYY", "YYYY-MM-DD"]);
                      return dateA.diff(dateB);
                    })}
                    paginator
                    rows={rows}
                    first={first}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    filters={filters}
                    globalFilterFields={["name", "phone", "address"]}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    className="p-datatable-sm custom-datatable"
                    stripedRows
                    rowHover
                    responsiveLayout="scroll"
                    style={{ fontSize: "12px" }}
                  >
                    <Column
                      header="Sr No"
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{ width: "60px", textAlign: "center" }}
                    />
                    <Column
                      field="birth_date"
                      header="Birth Date"
                      body={(rowData) => formatBirthDate(rowData.birth_date)}
                    />
                    <Column field="name" header="Patient Name" />
                    <Column field="phone" header="Contact Number" />
                    <Column field="address" header="Address" />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      {/* Add this block at the end of your JSX */}
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

export default BirthdayAlert;
