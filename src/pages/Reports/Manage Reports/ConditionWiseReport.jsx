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

// const ConditionWiseReport = () => {
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [rows, setRows] = useState(10);
//   const [filters, setFilters] = useState({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   });

//   const defaultTableStructure = [
//     {
//       doctorName: '',
//       piles: 0,
//       fistula: 0,
//       hernia: 0,
//       varicoseVeins: 0,
//       prolapse: 0,
//       circumcision: 0,
//       abscess: 0,
//       fissure: 0,
//       ibs: 0
//     }
//   ];

//   const [assistedData, setAssistedData] = useState(defaultTableStructure);
//   const [convertedData, setConvertedData] = useState(defaultTableStructure);
//   const [totalPackageData, setTotalPackageData] = useState(defaultTableStructure);
//   const [averagePackageData, setAveragePackageData] = useState(defaultTableStructure);

//   const onGlobalFilterChange = (e) => {
//     const value = e.target.value;
//     let _filters = { ...filters };
//     _filters["global"].value = value;
//     setFilters(_filters);
//     setSearchText(value);
//   };

//   const handleFind = async () => {
//     if (!fromDate || !toDate) {
//       alert('Please Enter all fields details..');
//       return;
//     }

//     try {
//       // Mock data for demonstration since API might not return data without real backend
//       // Replace with actual API calls as needed
//       /*
//      const assistedResponse = await axios.post('/receptionist/AssistConditionWiseData', {
//        Fromdate: fromDate,
//        Todate: toDate
//      });
//      processAssistedData(assistedResponse.data);

//      const convertedResponse = await axios.post('/receptionist/ConditionWiseData', {
//        Fromdate: fromDate,
//        Todate: toDate
//      });
//      processConvertedData(convertedResponse.data);
//      */

//       // Setting dummy data for visualization as requested "make it same as AppointmentConversion.jsx"
//       // In a real scenario, this would come from the API
//       setAssistedData([{ doctorName: 'Dr. Smith', piles: 5, fistula: 2, hernia: 1, varicoseVeins: 0, prolapse: 0, circumcision: 1, abscess: 0, fissure: 2, ibs: 0 }]);
//       setConvertedData([{ doctorName: 'Dr. Smith', piles: 3, fistula: 1, hernia: 1, varicoseVeins: 0, prolapse: 0, circumcision: 1, abscess: 0, fissure: 1, ibs: 0 }]);
//       setTotalPackageData([{ doctorName: 'Dr. Smith', piles: 50000, fistula: 20000, hernia: 15000, varicoseVeins: 0, prolapse: 0, circumcision: 10000, abscess: 0, fissure: 12000, ibs: 0 }]);
//       setAveragePackageData([{ doctorName: 'Dr. Smith', piles: 10000, fistula: 10000, hernia: 15000, varicoseVeins: 0, prolapse: 0, circumcision: 10000, abscess: 0, fissure: 6000, ibs: 0 }]);

//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

// const downloadPDF = () => {
//   const doc = new jsPDF();
//   doc.text("Condition Wise Report", 14, 15);

//   let finalY = 25;

//   const generateTable = (title, data) => {
//     doc.text(title, 14, finalY);
//     const tableColumn = ["Sr No", "Doctor Name", "Piles", "Fistula", "Hernia", "Varicose Veins", "Prolapse", "Circumcision", "Abscess", "Fissure", "IBS"];
//     const tableRows = data.map((item, index) => [
//       index + 1,
//       item.doctorName,
//       item.piles,
//       item.fistula,
//       item.hernia,
//       item.varicoseVeins,
//       item.prolapse,
//       item.circumcision,
//       item.abscess,
//       item.fissure,
//       item.ibs
//     ]);

//     autoTable(doc, {
//       head: [tableColumn],
//       body: tableRows,
//       startY: finalY + 5,
//       theme: 'grid',
//       styles: { fontSize: 8 },
//       headStyles: { fillColor: [0, 172, 193] } // Cyan color matching theme
//     });

//     finalY = doc.lastAutoTable.finalY + 15;
//   };

//   generateTable("Assisted - Condition Wise Performance", assistedData);
//   generateTable("Converted - Condition Wise Performance", convertedData);
//   generateTable("Total Package - Condition Wise", totalPackageData); // Might need a new page check in real app
//   generateTable("Average Package - Condition Wise", averagePackageData);

//   doc.save("Condition_Wise_Report.pdf");
// };

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
//               <option value={100}>100</option>
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

//   const ReportSection = ({ title, data }) => (
//     <div className="mb-5 pb-3 mt-10">
//       <div className="p-5 mb-2" style={{ background: "linear-gradient(to right, #fafafa, #e9e9e9)", border: "1px solid #d5d5d5", borderBottom: "none", borderRadius: "4px 4px 0 0", color: "#555", fontWeight: "600" }}>
//         {title}
//       </div>
//       <DataTable
//         value={data}
//         paginator
//         rows={rows}
//         filters={filters}
//         // header={header} // Header is shared or can be per table, usually shared at top for pages
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
//         <Column field="piles" header="Piles" />
//         <Column field="fistula" header="Fistula" />
//         <Column field="hernia" header="Hernia" />
//         <Column field="varicoseVeins" header="Varicose Veins" />
//         <Column field="prolapse" header="Prolapse" />
//         <Column field="circumcision" header="Circumcision" />
//         <Column field="abscess" header="Abscess" />
//         <Column field="fissure" header="Fissure" />
//         <Column field="ibs" header="IBS" />
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
//       <PageBreadcrumb pagename="Condition Wise Report" />

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
//                   <h4 style={{ margin: 0 }}>Condition Wise Report</h4>
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
//                             onClick={handleFind}
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

//                   {/* Top Control Bar for all tables */}
//                   {header}

//                   <div className="mt-3">
//                     <ReportSection title="Assisted - Condition Wise Performance" data={assistedData} />
//                     <ReportSection title="Converted - Condition Wise Performance" data={convertedData} />
//                     <ReportSection title="Total Package - Condition Wise" data={totalPackageData} />
//                     <ReportSection title="Average Package - Condition Wise" data={averagePackageData} />
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

// export default ConditionWiseReport;

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Container, Form, Spinner, Button } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { decodeJwt } from "../../../utils/decode-jwt";



// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api"

const ConditionWiseReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [assistedData, setAssistedData] = useState([]);
  const [convertedData, setConvertedData] = useState([]);
  const [totalPackageData, setTotalPackageData] = useState([]);
  const [averagePackageData, setAveragePackageData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

  // --- Core Processing Logic (Replicating AJAX Logic) ---
  const processReportData = (response, type) => {
    const uniqueDoctors = [...new Set(response.map(item => item.consultantDoctor))];

    const processed = uniqueDoctors.map(docId => {
      const docRecords = response.filter(r => r.consultantDoctor === docId);
      const doctorName = docRecords[0]?.DoctorName || "Unknown";

      const stats = {
        doctorName,
        piles: 0, fistula: 0, hernia: 0, varicoseVeins: 0,
        prolapse: 0, circumcision: 0, abscess: 0, fissure: 0, ibs: 0,
        totalPiles: 0, totalFistula: 0, totalHernia: 0, totalVaricose: 0,
        totalProlapse: 0, totalCircumcision: 0, totalAbscess: 0, totalFissure: 0, totalIbs: 0
      };

      docRecords.forEach(rec => {
        const spec = rec.speciality?.toLowerCase();
        const pkg = parseFloat(rec.Package) || 0;

        const mapSpeciality = (key, totalKey) => {
          stats[key]++;
          if (type === 'detailed') stats[totalKey] += pkg;
        };

        if (spec?.includes("piles")) mapSpeciality('piles', 'totalPiles');
        else if (spec?.includes("fistula")) mapSpeciality('fistula', 'totalFistula');
        else if (spec?.includes("hernia")) mapSpeciality('hernia', 'totalHernia');
        else if (spec?.includes("varicose")) mapSpeciality('varicoseVeins', 'totalVaricose');
        else if (spec?.includes("prolapse")) mapSpeciality('prolapse', 'totalProlapse');
        else if (spec?.includes("circumcision")) mapSpeciality('circumcision', 'totalCircumcision');
        else if (spec?.includes("abscess")) mapSpeciality('abscess', 'totalAbscess');
        else if (spec?.includes("fissure")) mapSpeciality('fissure', 'totalFissure');
        else if (spec?.includes("ibs")) mapSpeciality('ibs', 'totalIbs');
      });

      return stats;
    });

    return processed;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Condition Wise Report", 14, 15);

    let finalY = 25;

    const generateTable = (title, data) => {
      doc.text(title, 14, finalY);
      const tableColumn = ["Sr No", "Doctor Name", "Piles", "Fistula", "Hernia", "Varicose Veins", "Prolapse", "Circumcision", "Abscess", "Fissure", "IBS"];
      const tableRows = data.map((item, index) => [
        index + 1,
        item.doctorName,
        item.piles,
        item.fistula,
        item.hernia,
        item.varicoseVeins,
        item.prolapse,
        item.circumcision,
        item.abscess,
        item.fissure,
        item.ibs
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: finalY + 5,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 172, 193] } // Cyan color matching theme
      });

      finalY = doc.lastAutoTable.finalY + 15;
    };

    generateTable("Assisted - Condition Wise Performance", assistedData);
    generateTable("Converted - Condition Wise Performance", convertedData);
    generateTable("Total Package - Condition Wise", totalPackageData); // Might need a new page check in real app
    generateTable("Average Package - Condition Wise", averagePackageData);

    doc.save("Condition_Wise_Report.pdf");
  };

  const handleFind = async () => {
    if (!fromDate || !toDate) {
      alert('Please Enter all fields details..');
      return;
    }

    setLoading(true);
    try {
      const authHeader = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      };

      // 1. Fetch Assisted Data
      const resAssisted = await fetch(`${BASE_URL}/V1/managereports/getConditionReports`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ location: currentLocation, Fromdate: fromDate, Todate: toDate, isDetailed: false })
      });
      const dataAssisted = await resAssisted.json();
      setAssistedData(processReportData(dataAssisted, 'assisted'));

      // 2. Fetch Detailed Data
      const resDetailed = await fetch(`${BASE_URL}/V1/managereports/getConditionReports`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ location: currentLocation, Fromdate: fromDate, Todate: toDate, isDetailed: true })
      });
      const dataDetailed = await resDetailed.json();
      const detailedProcessed = processReportData(dataDetailed, 'detailed');

      setConvertedData(detailedProcessed.map(d => ({ ...d }))); // Converted count

      setTotalPackageData(detailedProcessed.map(d => ({
        doctorName: d.doctorName,
        piles: d.totalPiles, fistula: d.totalFistula, hernia: d.totalHernia,
        varicoseVeins: d.totalVaricose, prolapse: d.totalProlapse,
        circumcision: d.totalCircumcision, abscess: d.totalAbscess,
        fissure: d.totalFissure, ibs: d.totalIbs
      })));

      setAveragePackageData(detailedProcessed.map(d => ({
        doctorName: d.doctorName,
        piles: Math.round(d.totalPiles / (d.piles || 1)),
        fistula: Math.round(d.totalFistula / (d.fistula || 1)),
        hernia: Math.round(d.totalHernia / (d.hernia || 1)),
        varicoseVeins: Math.round(d.totalVaricose / (d.varicoseVeins || 1)),
        prolapse: Math.round(d.totalProlapse / (d.prolapse || 1)),
        circumcision: Math.round(d.totalCircumcision / (d.circumcision || 1)),
        abscess: Math.round(d.totalAbscess / (d.abscess || 1)),
        fissure: Math.round(d.totalFissure / (d.fissure || 1)),
        ibs: Math.round(d.totalIbs / (d.ibs || 1))
      })));

    } catch (error) {
      console.error('Error fetching condition reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, global: { value, matchMode: FilterMatchMode.CONTAINS } });
    setSearchText(value);
  };

  const ReportSection = ({ title, data }) => (
    <div className="mb-5 shadow-sm rounded border overflow-hidden">
      <div className="p-3" style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6", fontWeight: "600", color: "#00838f" }}>
        {title}
      </div>
      <DataTable
        value={data}
        paginator rows={rows}
        filters={filters}
        className="p-datatable-sm custom-datatable"
        style={{ fontSize: "11px" }}
        responsiveLayout="scroll"
        emptyMessage="No data found."
      >
        <Column header="Sr No" body={(r, { rowIndex }) => rowIndex + 1} style={{ width: "50px", textAlign: "center" }} />
        <Column field="doctorName" header="Doctor" style={{ width: "150px" }} />
        <Column field="piles" header="Piles" />
        <Column field="fistula" header="Fistula" />
        <Column field="hernia" header="Hernia" />
        <Column field="varicoseVeins" header="Varicose" />
        <Column field="prolapse" header="Prolapse" />
        <Column field="circumcision" header="Circum." />
        <Column field="abscess" header="Abscess" />
        <Column field="fissure" header="Fissure" />
        <Column field="ibs" header="IBS" />
      </DataTable>
    </div>
  );

  return (
    <div className="themebody-wrap" style={{ padding: "20px", background: "linear-gradient(to right, #e0f7fa, #80deea)", minHeight: "100vh" }}>
      <PageBreadcrumb pagename="Condition Wise Report" />
      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card className="border-cyan-soft shadow-lg">
                <Card.Header className="text-center py-3" style={{ background: "linear-gradient(to right, #00acc1, #007c91)", color: "white" }}>
                  <h4 className="mb-0">Condition Wise Analysis</h4>
                </Card.Header>
                <Card.Body>
                  <Form className="mb-4">
                    <Row className="align-items-end g-2">
                      <Col md={4}><Form.Label className="small fw-bold">From Date</Form.Label><Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></Col>
                      <Col md={4}><Form.Label className="small fw-bold">To Date</Form.Label><Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></Col>
                      <Col md={4}><Button className="w-100 btn-cyan" onClick={handleFind} disabled={loading}>{loading ? <Spinner size="sm" /> : "Search"}</Button></Col>
                    </Row>
                  </Form>

                  <div className="d-flex justify-content-between mb-3 align-items-center">
                    <InputText value={searchText} onChange={onGlobalFilterChange} placeholder="Filter all tables..." className="p-inputtext-sm" style={{ width: "250px" }} />
                    <Button variant="danger" size="sm" onClick={downloadPDF}><i className="fa fa-file-pdf-o me-2" />PDF</Button>
                  </div>

                  <ReportSection title="Assisted Counts" data={assistedData} />
                  <ReportSection title="Converted Counts" data={convertedData} />
                  <ReportSection title="Total Revenue (Package)" data={totalPackageData} />
                  <ReportSection title="Average Revenue per Surgery" data={averagePackageData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
        .btn-cyan { background-color: #00acc1; border: none; font-weight: 600; height: 38px; }
        .btn-cyan:hover { background-color: #00838f; }
        .custom-datatable .p-datatable-thead > tr > th { background-color: #b2ebf2 !important; color: #333 !important; font-size: 11px; text-align: center !important; border: 1px solid #90caf9 !important; }
        .custom-datatable .p-datatable-tbody > tr > td { text-align: center !important; border: 1px solid #e0f2f1; }
      `}</style>
    </div>
  );
};

export default ConditionWiseReport;
