import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import ReactApexChart from "react-apexcharts";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReferenceReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const chartRef = useRef(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [referenceData, setReferenceData] = useState([
    { type: "socialMedia", count: 15 },
    { type: "Referred By Another Patient", count: 25 },
    { type: "Referred By Another Doctor", count: 10 },
    { type: "old_ref", count: 8 },
    { type: "internet", count: 20 },
    { type: "I was treated here in past", count: 12 },
    { type: "Healing Hands Clinic Branch", count: 30 },
    { type: "family_friends", count: 18 },
    { type: "Entertainment Media", count: 5 },
    { type: "dr_ref", count: 22 },
  ]);

  const chartSeries = [{
    name: 'Reference Count',
    data: referenceData.map(item => item.count)
  }];

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 380,
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 2,
        left: 2,
        blur: 4,
        opacity: 0.1
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        dataLabels: {
          position: 'top',
        },
      }
    },
    colors: ['#42A5F5', '#FFCA28', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#26C6DA', '#8D6E63', '#5C6BC0', '#26A69A'],
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return val;
      },
      offsetX: 30,
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },
    xaxis: {
      categories: referenceData.map(item => item.type),
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 'bold'
        }
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true
      },
      y: {
        title: {
          formatter: function () {
            return '';
          }
        }
      }
    },
    legend: {
      show: false
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();
    doc.text("Reference Report", 14, 15);

    const tableColumn = ["Sr No", "Reference Type", "Reference Count"];
    const tableRows = referenceData.map((item, index) => [
      index + 1,
      item.type,
      item.count
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    const finalY = doc.lastAutoTable.finalY || 20;

    if (chartRef.current && chartRef.current.chart) {
      const { imgURI } = await chartRef.current.chart.dataURI();
      if (imgURI) {
        doc.text("Reference Statistics", 14, finalY + 15);
        doc.addImage(imgURI, 'PNG', 14, finalY + 20, 180, 100);
      }
    }

    doc.save("Reference_Report.pdf");
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
        <button
          className="btn btn-danger btn-sm"
          onClick={downloadPDF}
          style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
        >
          <i className="fa fa-file-pdf-o"></i> Download PDF
        </button>
      </div>
    );
  };

  const header = renderHeader();

  const handleFindClick = (e) => {
    e.preventDefault();
    console.log(`Filtering Reference Report from ${fromDate} to ${toDate}`);
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "20px",
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
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd",
                    borderBottom: "2px solid #0288d1",
                    padding: "1rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Reference Report</h4>
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
                              fontSize: "13px"
                            }}
                          >
                            Search
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
                    header={header}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
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
                    <Column field="type" header="Reference Type" />
                    <Column field="count" header="Reference Count" />
                  </DataTable>

                  <div className="mt-5 mb-3 d-flex flex-column align-items-center">
                    <h5 style={{ color: "#006064", fontWeight: "bold" }}>Reference Statistics</h5>
                    <div style={{ width: '100%', maxWidth: '800px' }}>
                      <ReactApexChart ref={chartRef} options={chartOptions} series={chartSeries} type="bar" height={450} />
                    </div>
                  </div>
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

export default ReferenceReport;