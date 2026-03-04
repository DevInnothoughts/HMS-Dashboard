// import React, { useState } from "react";
// import { Row, Col, Card, Container, Form, Button } from "react-bootstrap";
// import SimpleBar from "simplebar-react";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import { FilterMatchMode } from "primereact/api";
// import { InputText } from "primereact/inputtext";
// import PageBreadcrumb from "../../../components/PageBreadcrumb";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import axios from 'axios';

// const SxConversionReport = () => {
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [rows, setRows] = useState(10);
//   const [filters, setFilters] = useState({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   });

//   const [consultantData, setConsultantData] = useState([]);
//   const [assistantData, setAssistantData] = useState([]);
//   const [mainConversionData, setMainConversionData] = useState([]);
//   const [assistantConversionData, setAssistantConversionData] = useState([]);
//   const [mainOverallData, setMainOverallData] = useState([]);
//   const [assistantOverallData, setAssistantOverallData] = useState([]);

//   const onGlobalFilterChange = (e) => {
//     const value = e.target.value;
//     let _filters = { ...filters };
//     _filters["global"].value = value;
//     setFilters(_filters);
//     setSearchText(value);
//   };

//   const handleSearch = async () => {
//     if (!fromDate || !toDate) {
//       alert('Please Enter all fields details..');
//       return;
//     }

//     // Mock data for demonstration
//     setConsultantData([{ doctorName: 'Dr. John', new: 10, followup: 5, postoperative: 3, medication: 8, surgery: 2, test: 4 }]);
//     setAssistantData([{ doctorName: 'Dr. James', new: 8, followup: 4, postoperative: 2, medication: 6, surgery: 1, test: 3 }]);
//     setMainConversionData([{ doctorName: 'Dr. John', count: 15 }]);
//     setAssistantConversionData([{ doctorName: 'Dr. James', count: 12 }]);
//     setMainOverallData([{ doctorName: 'Dr. John', count: 45 }]);
//     setAssistantOverallData([{ doctorName: 'Dr. James', count: 38 }]);
//   };

//   const downloadPDF = () => {
//     const doc = new jsPDF("l", "mm", "a4");
//     doc.text("Sx Conversion Report", 14, 15);

//     let finalY = 25;

//     const generateTable = (title, data, columns, fields) => {
//       doc.text(title, 14, finalY);
//       const tableRows = data.map((item, index) => [
//         index + 1,
//         ...fields.map(field => item[field])
//       ]);

//       autoTable(doc, {
//         head: [columns],
//         body: tableRows,
//         startY: finalY + 5,
//         theme: 'grid',
//         styles: { fontSize: 8 },
//         headStyles: { fillColor: [0, 172, 193] }
//       });

//       finalY = doc.lastAutoTable.finalY + 15;
//     };

//     const performanceCols = ["Sr No", "Doctor Name", "New", "Followup", "Postoperative", "Medication", "Surgery", "Test"];
//     const performanceFields = ["doctorName", "new", "followup", "postoperative", "medication", "surgery", "test"];

//     const conversionCols = ["Sr No", "Doctor Name", "Count"];
//     const conversionFields = ["doctorName", "count"];

//     generateTable("Consultant Doctor Performance", consultantData, performanceCols, performanceFields);
//     generateTable("Assistant Doctor Performance", assistantData, performanceCols, performanceFields);
//     generateTable("Main Doctor Conversion", mainConversionData, conversionCols, conversionFields);
//     generateTable("Assistance Doctor Conversion", assistantConversionData, conversionCols, conversionFields);
//     generateTable("Main Doctor Overall Conversion", mainOverallData, conversionCols, conversionFields);
//     generateTable("Assistance Doctor Overall Conversion", assistantOverallData, conversionCols, conversionFields);

//     doc.save("Sx_Conversion_Report.pdf");
//   };

//   const renderHeader = () => {
//     return (
//       <div className="d-flex justify-content-between align-items-center mb-1">
//         <div className="d-flex align-items-center" style={{ gap: "20px" }}>
//           <div className="d-flex align-items-center">
//             <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Show</span>
//             <Form.Select
//               size="sm"
//               style={{ width: "70px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
//               value={rows}
//               onChange={(e) => setRows(Number(e.target.value))}
//             >
//               <option value={10}>10</option>
//               <option value={25}>25</option>
//               <option value={50}>50</option>
//             </Form.Select>
//           </div>
//           <div className="d-flex align-items-center">
//             <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Search</span>
//             <span className="p-input-icon-left">
//               <InputText
//                 value={searchText}
//                 onChange={onGlobalFilterChange}
//                 placeholder="Global Search..."
//                 className="p-inputtext-sm"
//                 style={{ width: "200px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
//               />
//             </span>
//           </div>
//         </div>
//         <button
//           className="btn btn-danger btn-sm"
//           onClick={downloadPDF}
//           style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
//         >
//           <i className="fa fa-file-pdf-o"></i> Download PDF
//         </button>
//       </div>
//     );
//   };

//   const header = renderHeader();

//   const ReportSection = ({ title, data, type }) => (
//     <div className="mb-4 pb-2 mt-4">
//       <div className="p-5 mb-2" style={{ background: "linear-gradient(to right, #fafafa, #e9e9e9)", border: "1px solid #d5d5d5", borderBottom: "none", borderRadius: "4px 4px 0 0", color: "#555", fontWeight: "600" }}>
//         {title}
//       </div>
//       <DataTable
//         value={data}
//         paginator
//         rows={rows}
//         filters={filters}
//         paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
//         currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
//         className="p-datatable-sm custom-datatable"
//         style={{ fontSize: "12px" }}
//         rowHover
//         stripedRows
//         responsiveLayout="scroll"
//         emptyMessage="No data available."
//       >
//         <Column header="Sr No" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: "60px", textAlign: "center" }} />
//         <Column field="doctorName" header="Doctor Name" />
//         {type === 'performance' ? (
//           <>
//             <Column field="new" header="New" />
//             <Column field="followup" header="Followup" />
//             <Column field="postoperative" header="Postoperative" />
//             <Column field="medication" header="Medication" />
//             <Column field="surgery" header="Surgery" />
//             <Column field="test" header="Test" />
//           </>
//         ) : (
//           <Column field="count" header="Count" />
//         )}
//       </DataTable>
//     </div>
//   );

//   return (
//     <div
//       className="themebody-wrap"
//       style={{
//         padding: "20px",
//         background: "linear-gradient(to right, #e0f7fa, #80deea)",
//         fontFamily: "'Poppins', Arial, sans-serif",
//         minHeight: "100vh",
//       }}
//     >
//       <PageBreadcrumb pagename="Sx Conversion Report" />

//       <SimpleBar className="theme-body common-dash">
//         <Container fluid>
//           <Row>
//             <Col md={12}>
//               <Card
//                 style={{
//                   borderRadius: "12px",
//                   boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
//                   borderColor: "#00bcd4",
//                   background: "white",
//                   border: "1px solid #00bcd4",
//                 }}
//               >
//                 <Card.Header
//                   className="text-center"
//                   style={{
//                     fontWeight: "bold",
//                     backgroundColor: "#e3f2fd",
//                     borderBottom: "2px solid #0288d1",
//                     padding: "1rem",
//                     background: "linear-gradient(to right, #00acc1, #007c91)",
//                     color: "white",
//                     fontSize: "16px",
//                   }}
//                 >
//                   <h4 style={{ margin: 0 }}>Sx Conversion Report</h4>
//                 </Card.Header>
//                 <Card.Body style={{ padding: "5px" }}>
//                   <Form>
//                     <Row className="align-items-end mb-4 flex-nowrap" style={{ margin: "0 -5px" }}>
//                       <Col style={{ padding: "0 5px", flex: "1" }}>
//                         <Form.Group className="mb-2">
//                           <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>From Date</Form.Label>
//                           <Form.Control
//                             type="date"
//                             value={fromDate}
//                             onChange={(e) => setFromDate(e.target.value)}
//                             style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col style={{ padding: "0 5px", flex: "1" }}>
//                         <Form.Group className="mb-2">
//                           <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>To Date</Form.Label>
//                           <Form.Control
//                             type="date"
//                             value={toDate}
//                             onChange={(e) => setToDate(e.target.value)}
//                             style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col style={{ padding: "0 5px", flex: "1" }}>
//                         <Form.Group className="mb-2">
//                           <button
//                             className="btn btn-primary"
//                             type="button"
//                             onClick={handleSearch}
//                             style={{
//                               height: "35px",
//                               width: "100%",
//                               backgroundColor: "#00acc1",
//                               borderColor: "#00bcd4",
//                               color: "white",
//                               borderRadius: "8px",
//                               fontWeight: "bold",
//                               fontSize: "13px"
//                             }}
//                           >
//                             Search
//                           </button>
//                         </Form.Group>
//                       </Col>
//                     </Row>
//                   </Form>

//                   {header}

//                   <div className="mt-3">
//                     <ReportSection title="Consultant Doctor Performance" data={consultantData} type="performance" />
//                     <ReportSection title="Assistant Doctor Performance" data={assistantData} type="performance" />
//                     <Row>
//                       <Col md={6}>
//                         <ReportSection title="Main Doctor Conversion" data={mainConversionData} type="conversion" />
//                       </Col>
//                       <Col md={6}>
//                         <ReportSection title="Assistance Doctor Conversion" data={assistantConversionData} type="conversion" />
//                       </Col>
//                     </Row>
//                     <Row>
//                       <Col md={6}>
//                         <ReportSection title="Main Doctor Overall Conversion" data={mainOverallData} type="conversion" />
//                       </Col>
//                       <Col md={6}>
//                         <ReportSection title="Assistance Doctor Overall Conversion" data={assistantOverallData} type="conversion" />
//                       </Col>
//                     </Row>
//                   </div>

//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </SimpleBar>
//       <style>{`
//         .custom-datatable .p-datatable-header {
//           background: #e0f7fa;
//           border: 1px solid #4dd0e1;
//           border-top-left-radius: 8px;
//           border-top-right-radius: 8px;
//           padding: 10px;
//         }
//         .custom-datatable .p-datatable-thead > tr > th {
//           background-color: #b2ebf2 !important;
//           color: black !important;
//           font-size: 12px;
//           padding: 10px 8px !important;
//           border: 1px solid #90caf9 !important;
//           text-align: center !important;
//         }
//         .custom-datatable .p-datatable-thead > tr > th * {
//           color: black !important;
//           justify-content: center !important;
//         }
//         .custom-datatable .p-datatable-tbody > tr > td {
//           font-size: 12px;
//           padding: 8px;
//           border: 1px solid #90caf9;
//           text-align: center !important;
//         }
//         .custom-datatable .p-paginator {
//           background: #f8fdfe;
//           border: 1px solid #4dd0e1;
//           border-bottom-left-radius: 8px;
//           border-bottom-right-radius: 8px;
//           padding: 5px;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default SxConversionReport;

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

const BASE_URL = "http://194.195.117.79:5100/api";

const SxConversionReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);
  const [currentLocation, setCurrentLocation] = useState("");
  
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

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      alert('Please select a date range.');
      return;
    }

    setLoading(true);
    const authHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    };

    try {
      // Replicating PHP logic: Fetching Conversion and Advice Details concurrently
      const [resConversion, resAdvice] = await Promise.all([
        fetch(`${BASE_URL}/V1/managereports/surgeryConversionDetails`, { 
            method: "POST", 
            headers: authHeaders, 
            body: JSON.stringify({ Fromdate: fromDate, Todate: toDate, location: currentLocation }) 
        }),
        fetch(`${BASE_URL}/V1/managereports/surgeryadviceDetails`, { 
            method: "POST", 
            headers: authHeaders, 
            body: JSON.stringify({ Fromdate: fromDate, Todate: toDate, location: currentLocation }) 
        })
      ]);

      const conversionRaw = await resConversion.json();
      const adviceRaw = await resAdvice.json();

      // Process and Merge Data for Table and Charts (Logic from PHP loop)
      const categories = [];
      const advisedArr = [];
      const convertedArr = [];
      const percentageArr = [];

      // Create a map for quick lookup from Advice Data
      const adviceMap = new Map(adviceRaw.map(item => [
        `${item.consultantDoctor} and ${item.assistanceDoctor}`, 
        parseInt(item.surgeryAdvice) || 0
      ]));

      const processedTable = conversionRaw.map((item) => {
        const label = `${item.consultantDoctor} and ${item.assistanceDoctor}`;
        const converted = parseInt(item.pcount) || 0;
        const advised = adviceMap.get(label) || 0;
        const percentage = advised > 0 ? (converted * 100) / advised : 0;

        categories.push(label);
        advisedArr.push(advised);
        convertedArr.push(converted);
        percentageArr.push(parseFloat(percentage.toFixed(2)));

        return {
          ...item,
          label,
          converted,
          advised,
          percentage: percentage.toFixed(2) + "%"
        };
      });

      setTableData(processedTable);
      setChartData({ categories, advised: advisedArr, converted: convertedArr, percentage: percentageArr });

    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to load report data.");
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