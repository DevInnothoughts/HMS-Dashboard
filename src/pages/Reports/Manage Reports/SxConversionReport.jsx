import React, { useState, useEffect } from "react";
import { Row, Col, Card, Container, Form, Button, Spinner } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import ReactApexChart from "react-apexcharts"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { decodeJwt } from "../../../utils/decode-jwt";

const BASE_URL = "http://localhost:5100/api";

const SxConversionReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);
  const [currentLocation, setCurrentLocation] = useState("");

  // Performance Table States
  const [consultantData, setConsultantData] = useState([]);
  const [assistantData, setAssistantData] = useState([]);

  // Conversion Table States
  const [mainConversionData, setMainConversionData] = useState([]);
  const [assistantConversionData, setAssistantConversionData] = useState([]);
  const [mainOverallData, setMainOverallData] = useState([]);
  const [assistantOverallData, setAssistantOverallData] = useState([]);
  
  // State for Table and Chart Data
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState({ categories: [], advised: [], converted: [], percentage: [] });

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

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, global: { value, matchMode: FilterMatchMode.CONTAINS } });
    setSearchText(value);
  };

  // 1. Function to process Performance Data (Main or Assistant)
  const processPerformanceData = (rawMsg) => {
    const uniqueIds = [];
    const doctorNames = [];
  
    // Step 1: Identify Unique Doctors
    rawMsg.forEach((item) => {
      const docId = item.consultantDoctor || item.assistanceDoctor;
      if (!uniqueIds.includes(docId)) {
        uniqueIds.push(docId);
        doctorNames.push(item.DoctorName);
      }
    });
  
    // Step 2: Tally Stats per Unique Doctor (Replicating PHP nested loop & Switch)
    return uniqueIds.map((id, index) => {
      const stats = { new: 0, follow: 0, postop: 0, med: 0, sur: 0, test: 0 };
  
      rawMsg.forEach((msg) => {
        if ((msg.consultantDoctor || msg.assistanceDoctor) === id) {
          // Patient Type Tally
          switch (msg.patient_type) {
            case "New": stats.new++; break;
            case "Follow": stats.follow++; break;
            case "Postoperative": stats.postop++; break;
            default: break;
          }
          // Diagnosis Advice Tally
          const advice = msg.diagnosisAdvice || "";
          if (advice.includes("Medication")) stats.med++;
          if (advice.includes("Surgery")) stats.sur++;
          if (advice.includes("Test")) stats.test++;
        }
      });
  
      return {
        sr: index + 1,
        doctorName: doctorNames[index],
        ...stats
      };
    });
  };
  
  // 2. Updated handleSearch to include all Performance AJAX calls
  // const handleSearch = async () => {
  //   if (!fromDate || !toDate) {
  //     alert('Please Enter all fields details..');
  //     return;
  //   }
  
  //   setLoading(true);
  //   const authHeaders = {
  //     "Content-Type": "application/json",
  //     "Authorization": `Bearer ${localStorage.getItem("token")}`
  //   };
  
  //   try {
  //     // Concurrent fetches for all 6 AJAX endpoints in your PHP snippet
  //     const [
  //       resMainPerf, resAsstPerf, 
  //       resMainConv, resAsstConv, 
  //       resMainOverall, resAsstOverall
  //     ] = await Promise.all([
  //       fetch(`${BASE_URL}/V1/managereports/MainDoctorPerformaceData`, { method: "POST", headers: authHeaders, body: JSON.stringify({ Fromdate: fromDate, Todate: toDate, location: currentLocation }) }),
  //       fetch(`${BASE_URL}/V1/managereports/AssistanceDoctorPerformaceData`, { method: "POST", headers: authHeaders, body: JSON.stringify({ Fromdate: fromDate, Todate: toDate, location: currentLocation }) }),
  //       fetch(`${BASE_URL}/V1/managereports/MainDoctorCoversionData`, { method: "POST", headers: authHeaders, body: JSON.stringify({ Fromdate: fromDate, Todate: toDate, location: currentLocation }) }),
  //       fetch(`${BASE_URL}/V1/managereports/AssistanceDoctorCoversionData`, { method: "POST", headers: authHeaders, body: JSON.stringify({ Fromdate: fromDate, Todate: toDate, location: currentLocation }) }),
  //       fetch(`${BASE_URL}/V1/managereports/MainDoctorOverallConversion`, { method: "POST", headers: authHeaders, body: JSON.stringify({ Fromdate: fromDate, Todate: toDate, location: currentLocation }) }),
  //       fetch(`${BASE_URL}/V1/managereports/AssistanceDoctorOverallConversion`, { method: "POST", headers: authHeaders, body: JSON.stringify({ Fromdate: fromDate, Todate: toDate, location: currentLocation }) })
  //     ]);
  
  //     // Parse all responses
  //     const mainPerfRaw = await resMainPerf.json();
  //     const asstPerfRaw = await resAsstPerf.json();
  //     const mainConv = await resMainConv.json();
  //     const asstConv = await resAsstConv.json();
  //     const mainOverall = await resMainOverall.json();
  //     const asstOverall = await resAsstOverall.json();
  
  //     // Set States for the 6 sections
  //     setConsultantData(processPerformanceData(mainPerfRaw.data || mainPerfRaw));
  //     setAssistantData(processPerformanceData(asstPerfRaw.data || asstPerfRaw));
  //     setMainConversionData(mainConv.data || mainConv);
  //     setAssistantConversionData(asstConv.data || asstConv);
  //     setMainOverallData(mainOverall.data || mainOverall);
  //     setAssistantOverallData(asstOverall.data || asstOverall);
  
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //     alert("Error loading performance data.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      alert('Please select a date range.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/managereports/getDoctorPerformanceAnalytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          location: currentLocation, 
          Fromdate: fromDate, 
          Todate: toDate 
        })
      });
  
      const result = await response.json();
  
      if (result.success) {
        const { data } = result;
        
        // Process and set all states at once
        setConsultantData(processPerformanceData(data.mainPerformance));
        setAssistantData(processPerformanceData(data.asstPerformance));
        setMainConversionData(data.mainConversion);
        setAssistantConversionData(data.asstConversion);
        setMainOverallData(data.mainOverall);
        setAssistantOverallData(data.asstOverall);
      }
    } catch (error) {
      console.error("Batch fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: true } },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
    xaxis: { categories: chartData.categories, labels: { rotate: -45, style: { fontSize: '10px' } } },
    yaxis: [
      { title: { text: "Count" } },
      { opposite: true, title: { text: "Conversion %" }, max: 100 }
    ],
    colors: ['#C24642', '#369EAD', '#FFB01A'],
    legend: { position: 'top' },
    tooltip: { shared: true }
  };

  const chartSeries = [
    { name: 'Surgery Advised', type: 'column', data: chartData.advised },
    { name: 'Surgery Converted', type: 'column', data: chartData.converted },
    { name: 'Conversion Rate %', type: 'line', data: chartData.percentage }
  ];

  const renderHeader = () => (
    <div className="d-flex justify-content-between align-items-center mb-1">
      <div className="d-flex align-items-center" style={{ gap: "20px" }}>
        <div className="d-flex align-items-center">
          <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Show</span>
          <Form.Select size="sm" style={{ width: "70px", borderRadius: "8px" }} value={rows} onChange={(e) => setRows(Number(e.target.value))}>
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
          </Form.Select>
        </div>
        <InputText value={searchText} onChange={onGlobalFilterChange} placeholder="Search doctors..." className="p-inputtext-sm" style={{ width: "250px", borderRadius: "8px", border: "1px solid #4dd0e1" }} />
      </div>
      <Button variant="danger" size="sm" onClick={() => {}} style={{ borderRadius: "8px" }}>
        <i className="fa fa-file-pdf-o me-1"></i> Download PDF
      </Button>
    </div>
  );

  return (
    <div className="themebody-wrap" style={{ padding: "20px", background: "linear-gradient(to right, #e0f7fa, #80deea)", minHeight: "100vh" }}>
      <PageBreadcrumb pagename="Surgery Conversion Report" />
      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card style={{ borderRadius: "12px", boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)", border: "1px solid #00bcd4" }}>
                <Card.Header className="text-center" style={{ background: "linear-gradient(to right, #00acc1, #007c91)", color: "white" }}>
                  <h4 className="m-0">Surgery Conversion Analytics</h4>
                </Card.Header>
                <Card.Body className="p-3">
                  <Form className="mb-4">
                    <Row className="align-items-end g-2">
                      <Col md={4}><Form.Label className="fw-bold small">From Date</Form.Label><Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></Col>
                      <Col md={4}><Form.Label className="fw-bold small">To Date</Form.Label><Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></Col>
                      <Col md={4}><Button className="w-100 fw-bold" onClick={handleSearch} style={{ height: "38px", background: "#00acc1" }}>{loading ? <Spinner size="sm" /> : "Generate Report"}</Button></Col>
                    </Row>
                  </Form>

                  {/* Chart Section - Replicating CanvasJS Container */}
                  <div className="mb-5 p-3 border rounded bg-white shadow-sm">
                    <h5 className="text-center fw-bold mb-4" style={{ color: "#006064" }}>Surgery Conversion Graph</h5>
                    <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={350} />
                  </div>

                  <DataTable
                    value={tableData}
                    paginator rows={rows}
                    filters={filters}
                    header={renderHeader()}
                    className="p-datatable-sm custom-datatable"
                    stripedRows
                    responsiveLayout="scroll"
                  >
                    <Column header="Sr No" body={(r, { rowIndex }) => rowIndex + 1} style={{ width: "60px", textAlign: "center" }} />
                    <Column field="consultantDoctor" header="Consultant Doctor" />
                    <Column field="assistanceDoctor" header="Assistant Doctor" />
                    <Column field="advised" header="Surgery Advised" style={{ fontWeight: 'bold' }} />
                    <Column field="converted" header="Surgery Converted" style={{ color: '#007c91', fontWeight: 'bold' }} />
                    <Column field="percentage" header="Conversion Rate" style={{ color: '#C24642', fontWeight: 'bold' }} />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
        .custom-datatable .p-datatable-thead > tr > th { background-color: #b2ebf2 !important; color: black !important; font-size: 12px; text-align: center !important; border: 1px solid #90caf9 !important; }
        .custom-datatable .p-datatable-tbody > tr > td { font-size: 12px; text-align: center !important; border: 1px solid #90caf9 !important; }
      `}</style>
    </div>
  );
};

export default SxConversionReport;