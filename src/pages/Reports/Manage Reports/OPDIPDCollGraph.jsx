import React, { useState, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
  Dropdown,
} from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import jsPDF from "jspdf";

const OPDIPDCollGraph = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs for charts to enable export
  const dailyChartRef = useRef(null);
  const monthlyChartRef = useRef(null);

  // Dummy Data
  const dailyData = [
    { date: "2025-01-01", opd: 15000, ipd: 25000 },
    { date: "2025-01-02", opd: 12000, ipd: 30000 },
    { date: "2025-01-03", opd: 18000, ipd: 22000 },
    { date: "2025-01-04", opd: 14000, ipd: 28000 },
    { date: "2025-01-05", opd: 20000, ipd: 35000 },
    { date: "2025-01-06", opd: 16000, ipd: 27000 },
    { date: "2025-01-07", opd: 19000, ipd: 31000 },
  ];

  const monthlyData = [
    { month: "Jan 2025", opd: 450000, ipd: 750000 },
    { month: "Feb 2025", opd: 520000, ipd: 820000 },
    { month: "Mar 2025", opd: 480000, ipd: 790000 },
  ];

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const exportChart = async (chartRef, format, title) => {
    if (!chartRef.current || !chartRef.current.chart) return;

    const { imgURI } = await chartRef.current.chart.dataURI();

    if (format === 'print') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { 
                margin: 0; 
                padding: 40px; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                font-family: 'Poppins', sans-serif;
              }
              h1 { color: #006064; margin-bottom: 20px; }
              img { max-width: 100%; height: auto; border: 1px solid #e0f7fa; border-radius: 8px; }
              @media print {
                h1 { margin-top: 0; }
                img { width: 100%; }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <img src="${imgURI}" onload="setTimeout(() => { window.print(); window.close(); }, 500);" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      const link = document.createElement('a');
      link.href = imgURI;
      link.download = `${title.replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getBaseOptions = (categories) => ({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: categories,
      title: { text: categories[0]?.includes('-') ? 'Date Range' : 'Month Range', style: { color: '#006064', fontWeight: 'bold' } },
      labels: { style: { colors: '#006064', fontWeight: 'bold' } }
    },
    yaxis: {
      title: { text: 'Amount (₹)', style: { color: '#006064', fontWeight: 'bold' } },
      labels: { style: { colors: '#006064' } }
    },
    fill: { opacity: 1 },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => `₹ ${val.toLocaleString()}` }
    },
    legend: { position: 'top', horizontalAlign: 'right', fontWeight: 'bold' },
    colors: ['#00acc1', '#007c91'],
  });

  const dailyOptions = getBaseOptions(dailyData.map(d => d.date));
  const dailySeries = [
    { name: 'OPD Collection', data: dailyData.map(d => d.opd) },
    { name: 'IPD Collection', data: dailyData.map(d => d.ipd) }
  ];

  const monthlyOptions = getBaseOptions(monthlyData.map(d => d.month));
  const monthlySeries = [
    { name: 'OPD Collection', data: monthlyData.map(d => d.opd) },
    { name: 'IPD Collection', data: monthlyData.map(d => d.ipd) }
  ];

  const DownloadButton = ({ chartRef, title }) => {
    const [show, setShow] = useState(false);

    return (
      <div
        className="custom-download-btn"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <button
          className="btn btn-sm"
          style={{
            backgroundColor: '#fe0b0bff',
            color: 'white',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <i className="fa fa-download"></i>
        </button>
        {show && (
          <div
            className="download-menu"
            style={{
              position: 'absolute',
              top: '32px',
              right: '0',
              backgroundColor: 'white',
              border: '1px solid #00bcd4',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '150px',
              padding: '5px 0'
            }}
          >
            <div
              className="download-item"
              onClick={() => exportChart(chartRef, 'print', title)}
              style={{ padding: '8px 15px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#006064' }}
            >
              Print
            </div>
            <div
              className="download-item"
              onClick={() => exportChart(chartRef, 'jpeg', title)}
              style={{ padding: '8px 15px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#006064' }}
            >
              Save as JPEG image
            </div>
            <div
              className="download-item"
              onClick={() => exportChart(chartRef, 'png', title)}
              style={{ padding: '8px 15px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#006064' }}
            >
              Save as PNG image
            </div>
          </div>
        )}
      </div>
    );
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
      <PageBreadcrumb pagename="OPD + IPD Collection Graph" />

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
                    borderBottom: "2px solid #0288d1",
                    padding: "1rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Consolidated Collection Graph (OPD + IPD)</h4>
                </Card.Header>
                <Card.Body style={{ padding: "25px" }}>
                  <Form onSubmit={handleSearch}>
                    <Row className="align-items-end mb-5 flex-nowrap" style={{ margin: "0 -5px" }}>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "14px" }}>From Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "8px", backgroundColor: "#e0f7fa", fontSize: "14px" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "14px" }}>To Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "8px", backgroundColor: "#e0f7fa", fontSize: "14px" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <button
                            className="btn btn-primary"
                            type="submit"
                            style={{
                              height: "42px",
                              width: "100%",
                              backgroundColor: "#00acc1",
                              borderColor: "#00bcd4",
                              color: "white",
                              borderRadius: "8px",
                              fontWeight: "bold",
                              fontSize: "14px"
                            }}
                          >
                            {loading ? "Loading..." : "Search"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  {/* Daily Graph Section */}
                  <div className="mb-5" style={{ border: '1px solid #e0f7fa', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 style={{ color: "#006064", fontWeight: "bold", margin: 0 }}>Daily Consolidated Reports Graph</h5>
                      <DownloadButton chartRef={dailyChartRef} title="Daily Consolidated Reports Graph" />
                    </div>
                    <p style={{ fontSize: '12px', color: '#007c91', marginBottom: '20px' }}>
                      Visualizing the financial collections for OPD and IPD on a day-to-day basis within the selected date range.
                    </p>
                    <ReactApexChart ref={dailyChartRef} options={dailyOptions} series={dailySeries} type="bar" height={350} />
                  </div>

                  <div style={{ height: '40px' }}></div>

                  {/* Monthly Graph Section */}
                  <div className="mb-3" style={{ border: '1px solid #e0f7fa', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 style={{ color: "#006064", fontWeight: "bold", margin: 0 }}>Monthly Consolidated Reports Graph</h5>
                      <DownloadButton chartRef={monthlyChartRef} title="Monthly Consolidated Reports Graph" />
                    </div>
                    <p style={{ fontSize: '12px', color: '#007c91', marginBottom: '20px' }}>
                      Visualizing total financial collections for OPD and IPD aggregated by month within the selected date range.
                    </p>
                    <ReactApexChart ref={monthlyChartRef} options={monthlyOptions} series={monthlySeries} type="bar" height={350} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
                .download-item:hover {
                    background-color: #e0f7fa;
                }
                .custom-download-btn:hover button {
                    background-color: #007c91 !important;
                }
            `}</style>
    </div>
  );
};

export default OPDIPDCollGraph;
