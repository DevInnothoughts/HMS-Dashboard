import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { Row, Col, Card, Container, Spinner, Form, Button } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { InputText } from "primereact/inputtext";
import SimpleBar from "simplebar-react";
import moment from "moment";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { decodeJwt } from "../../../utils/decode-jwt"; // Ensure path is correct

const BASE_URL = "http://localhost:5100/api";

const BirthdayAlert = () => {
    const currentDate = moment().format("DD-MM-YYYY");
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState("default");
    
    const [rows, setRows] = useState(10);
    const [first, setFirst] = useState(0);
    const [filters, setFilters] = useState({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState("");
  
    // 1. Get Location from Token
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = decodeJwt(token);
        if (payload?.jobLocation) {
          setCurrentLocation(payload.jobLocation);
        }
      }
    }, []);
  
    // 2. API Fetching Function
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
          }
        );
  
        if (response.ok) {
          const result = await response.json();
          // Extracting data from your controller's structure: result.reportsdetails.data
          const birthdayData = result.reportsdetails?.data || [];
          setPatients(birthdayData);
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

    const tableColumn = ["Sr No", "Patient Name", "Contact Number", "Address"];
    const tableRows = patients.sort((a, b) => a.name.localeCompare(b.name)).map((item, index) => [
      index + 1,
      item.name,
      item.phone,
      item.address,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193] }
    });

    doc.save(`Birthday_Alert_${currentDate}.pdf`);
  };

  const renderHeader = () => {
    return (
      <div
        className="d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: "#e0f7fa",
          padding: "10px 15px",
          borderRadius: "8px",
          border: "1px solid #4dd0e1",
          marginBottom: "5px"
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <span style={{ marginRight: "10px", fontSize: "13px", fontWeight: "600", color: "#00838f" }}>Show</span>
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
                fontSize: "13px"
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </div>

          <div className="d-flex align-items-center">
            <span style={{ marginRight: "10px", fontSize: "13px", fontWeight: "600", color: "#00838f" }}>Search</span>
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
                  height: "35px"
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
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
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
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
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
                  overflow: "hidden"
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    borderBottom: "none",
                    padding: "1.2rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                  }}
                >
                  <h4 style={{ margin: 0, fontWeight: "700", letterSpacing: "0.5px" }}>Today's Birthday Alert</h4>
                  <div style={{ fontSize: "16px", marginTop: "5px", opacity: 0.9 }}>
                    {currentDate}
                  </div>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <DataTable
                    value={[...patients].sort((a, b) => a.name.localeCompare(b.name))}
                    paginator
                    rows={rows}
                    first={first}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    header={header}
                    rowsPerPageOptions={[10, 25, 50]}
                    filters={filters}
                    globalFilterFields={["name", "phone", "address"]}
                    responsiveLayout="scroll"
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    className="p-datatable-customers datatable-compact-style"
                    rowClassName={(rowData, { rowIndex }) => ({
                      style: {
                        backgroundColor: rowIndex % 2 === 0 ? "#f8fdfe" : "white",
                        transition: "background-color 0.2s ease",
                      },
                    })}
                  >
                    <Column
                      field="id"
                      header="Sr No"
                      alignHeader="center"
                      align="center"
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{
                        width: "80px",
                        border: "1px solid #e0f2f1",
                      }}
                      headerStyle={{
                        backgroundColor: "#00bcd4",
                        color: "white",
                        fontSize: "13px",
                      }}
                    />
                    <Column
                      field="name"
                      header="Patient Name"
                      alignHeader="center"
                      align="center"
                      sortable
                      style={{
                        border: "1px solid #e0f2f1",
                      }}
                      headerStyle={{
                        backgroundColor: "#00bcd4",
                        color: "white",
                        fontSize: "13px",
                      }}
                    />
                    <Column
                      field="phone"
                      header="Contact Number"
                      alignHeader="center"
                      align="center"
                      style={{
                        width: "200px",
                        border: "1px solid #e0f2f1",
                      }}
                      headerStyle={{
                        backgroundColor: "#00bcd4",
                        color: "white",
                        fontSize: "13px",
                      }}
                    />
                    <Column
                      field="address"
                      header="Address"
                      alignHeader="center"
                      align="center"
                      style={{
                        border: "1px solid #e0f2f1",
                      }}
                      headerStyle={{
                        backgroundColor: "#00bcd4",
                        color: "white",
                        fontSize: "13px",
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
};

export default BirthdayAlert;
