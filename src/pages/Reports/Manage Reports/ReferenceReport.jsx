import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, Container, Form, Spinner } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import ReactApexChart from "react-apexcharts";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { decodeJwt } from "../../../utils/decode-jwt";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://localhost:5100/api";

const ReferenceReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState("default");

  const [referenceData, setReferenceData] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

  const getFriendlyName = (type) => {
    const mapping = {
      newspaper: "Newspaper Reference",
      dr_ref: "Doctor Reference",
      internet: "Internet Reference",
      old_ref: "Old Reference",
      MediaRef: "Media Reference",
      hhc_board: "HHC Board Reference",
      WOM: "Word of Mouth",
      TVShow: "TV Show",
      "": "Not Visited",
    };
    return mapping[type] || type || "Other Reference";
  };

  const handleFindClick = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please Enter all fields details..");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getReferenceReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
            type: "summary",
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      console.log(result);
      const formattedData = result.map((item) => ({
        type: getFriendlyName(item.reference_type),
        count: parseInt(item.referencecount) || 0,
      }));

      setReferenceData(formattedData);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load reference statistics");
    } finally {
      setLoading(false);
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    setSearchText(value);
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();
    doc.text("Reference Distribution Report", 14, 15);
    autoTable(doc, {
      head: [["Sr No", "Reference Type", "Count"]],
      body: referenceData.map((item, i) => [i + 1, item.type, item.count]),
      startY: 20,
      headStyles: { fillColor: [0, 172, 193] },
    });
    doc.save(`Reference_Report_${fromDate}_to_${toDate}.pdf`);
  };

  const chartSeries = [
    {
      name: "Reference Count",
      data: referenceData.map((item) => item.count),
    },
  ];

  const chartOptions = {
    chart: { type: "bar", height: 380 },
    plotOptions: {
      bar: { borderRadius: 4, horizontal: true, distributed: true },
    },
    colors: ["#42A5F5", "#FFCA28", "#66BB6A", "#FFA726", "#AB47BC", "#EC407A"],
    xaxis: { categories: referenceData.map((item) => item.type) },
    title: {
      text: "Patient Source Distribution",
      align: "center",
      style: { color: "#006064" },
    },
  };

  const renderHeader = () => (
    <div className="d-flex justify-content-between align-items-center mb-1">
      <div className="d-flex align-items-center" style={{ gap: "20px" }}>
        <div className="d-flex align-items-center">
          <span
            className="me-1"
            style={{ fontWeight: "bold", color: "#006064", fontSize: "13px" }}
          >
            Show
          </span>
          <Form.Select
            size="sm"
            style={{
              width: "70px",
              borderRadius: "8px",
              border: "1px solid #4dd0e1",
              fontSize: "12px",
            }}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Form.Select>
        </div>
        <div className="d-flex align-items-center">
          <span
            className="me-1"
            style={{ fontWeight: "bold", color: "#006064", fontSize: "13px" }}
          >
            Search
          </span>
          <span className="p-input-icon-left">
            <InputText
              value={searchText}
              onChange={onGlobalFilterChange}
              placeholder="Global Search..."
              className="p-inputtext-sm"
              style={{
                width: "200px",
                borderRadius: "8px",
                border: "1px solid #4dd0e1",
                fontSize: "12px",
              }}
            />
          </span>
        </div>
      </div>
      <button
        className="btn btn-danger btn-sm"
        onClick={downloadPDF}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          borderRadius: "8px",
          fontWeight: "600",
        }}
      >
        <i className="fa fa-file-pdf-o"></i> Download PDF
      </button>
    </div>
  );

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "10px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      <PageBreadcrumb pagename="Reference Report" />
      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  border: "1px solid #00bcd4",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    padding: "0.8rem",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Reference Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleFindClick}>
                    <Row
                      className="align-items-end mb-4 flex-nowrap"
                      style={{ margin: "0 -5px" }}
                    >
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            From Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            To Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <button
                            className="btn btn-primary"
                            type="submit"
                            style={{
                              height: "35px",
                              width: "100%",
                              backgroundColor: "#00acc1",
                              borderColor: "#00bcd4",
                              color: "white",
                              borderRadius: "8px",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                            disabled={loading}
                          >
                            {loading ? "Loading..." : "Search"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  <DataTable
                    value={referenceData}
                    paginator
                    rows={rows}
                    filters={filters}
                    header={renderHeader()}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    className="p-datatable-sm custom-datatable mb-4"
                    stripedRows
                    rowHover
                    responsiveLayout="scroll"
                    style={{ fontSize: "12px" }}
                  >
                    <Column
                      header="Sr No"
                      body={(r, { rowIndex }) => rowIndex + 1}
                      style={{ width: "100px", textAlign: "center" }}
                    />
                    <Column field="type" header="Reference Type" sortable />
                    <Column field="count" header="Reference Count" sortable />
                  </DataTable>

                  {referenceData.length > 0 && (
                    <div className="mt-5 d-flex flex-column align-items-center">
                      <h5 style={{ color: "#006064", fontWeight: "bold" }}>
                        Reference Statistics
                      </h5>
                      <div style={{ width: "100%", maxWidth: "850px" }}>
                        <ReactApexChart
                          options={chartOptions}
                          series={chartSeries}
                          type="bar"
                          height={450}
                        />
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
        .custom-datatable .p-datatable-header { background: #e0f7fa; border: 1px solid #4dd0e1; padding: 10px; border-radius: 8px 8px 0 0; }
        .custom-datatable .p-datatable-thead > tr > th { background-color: #b2ebf2 !important; color: black !important; font-size: 12px; border: 1px solid #90caf9 !important; text-align: center !important; }
        .custom-datatable .p-datatable-thead > tr > th .p-column-header-content { justify-content: center !important; }
        .custom-datatable .p-datatable-tbody > tr > td { font-size: 12px; padding: 8px; border: 1px solid #90caf9; text-align: center !important; }
        .custom-datatable .p-paginator { background: #f8fdfe; border: 1px solid #4dd0e1; border-radius: 0 0 8px 8px; }
      `}</style>
    </div>
  );
};

export default ReferenceReport;
