// import React, { useState } from "react";
// import {
//   Row,
//   Col,
//   Card,
//   Container,
//   Form,
// } from "react-bootstrap";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import { FilterMatchMode } from "primereact/api";
// import { InputText } from "primereact/inputtext";
// import { ColumnGroup } from 'primereact/columngroup';
// import { saveAs } from "file-saver";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import PageBreadcrumb from "../../../components/PageBreadcrumb";
// import SimpleBar from "simplebar-react";

// // Placeholder Base URL - replace with actual if API integration is needed later
//  

// // const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
// const BASE_URL = "http://194.195.117.79:5100/api"

// const PharmacyCollectionReport = () => {
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [rows, setRows] = useState(10);
//   const [filters, setFilters] = useState({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   });
//   const [totals, setTotals] = useState({
//     cash: 1200,
//     onlineUpi: 800,
//     card: 0,
//     discount: 150,
//   });

//   const onGlobalFilterChange = (e) => {
//     const value = e.target.value;
//     let _filters = { ...filters };
//     _filters["global"].value = value;
//     setFilters(_filters);
//     setSearchText(value);
//   };

//   const calculateTotals = (data) => {
//     return data.reduce(
//       (acc, curr) => ({
//         cash: acc.cash + (parseInt(curr.cashamt) || 0),
//         onlineUpi: acc.onlineUpi + (parseInt(curr.onlineUpiAmt) || 0),
//         card: acc.card + (parseInt(curr.cardamt) || 0),
//         discount: acc.discount + (parseInt(curr.discount) || 0),
//       }),
//       { cash: 0, onlineUpi: 0, card: 0, discount: 0 }
//     );
//   };

//   const handleFind = async (e) => {
//     if (e) e.preventDefault();
//     if (!fromDate || !toDate) {
//       alert("Please Enter the all fields details..");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Logic for API call would go here. For now, using mock data logic or preserving structure.
//       // If there's an actual endpoint, it should be updated here.
//       // For this refactor, I'm simulating data fetch or updating with existing dummy data logic if API isn't ready.

//       // Simulating API response delay and data update
//       setTimeout(() => {
//         const newData = [
//           {
//             date: "2024-05-15",
//             billNo: "BILL-003",
//             patientName: "Alice Brown",
//             prescriptionType: "OPD",
//             cashamt: 500,
//             onlineUpiAmt: 1000,
//             cardamt: 200,
//             discount: 0,
//           }
//         ];
//         setTableData(newData);
//         setTotals(calculateTotals(newData));
//         setLoading(false);
//       }, 500);

//     } catch (error) {
//       console.error("Error:", error);
//       alert(`Failed to fetch data: ${error.message}`);
//       setLoading(false);
//     }
//   };

//   const formatDateDisplay = (dateStr) => {
//     if (!dateStr) return "";
//     const date = new Date(dateStr);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const exportToExcel = () => {
//     const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
//     const fileExtension = ".xlsx";

//     const excelData = tableData.map((item, index) => ({
//       "Sr No": index + 1,
//       "Date": formatDateDisplay(item.date),
//       "Bill No": item.billNo,
//       "Patient Name": item.patientName,
//       "Prescription Type": item.prescriptionType,
//       "Cash": item.cashamt,
//       "Online/UPI": item.onlineUpiAmt,
//       "Card": item.cardamt,
//       "Discount": item.discount,
//     }));

//     // Add totals row
//     excelData.push({
//       "Sr No": "Total",
//       "Date": "",
//       "Bill No": "",
//       "Patient Name": "",
//       "Prescription Type": "",
//       "Cash": totals.cash,
//       "Online/UPI": totals.onlineUpi,
//       "Card": totals.card,
//       "Discount": totals.discount,
//     });

//     const ws = XLSX.utils.json_to_sheet(excelData);
//     const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
//     const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     const data = new Blob([excelBuffer], { type: fileType });
//     saveAs(data, "Pharmacy_Collection_Report" + fileExtension);
//   };

// const downloadPDF = () => {
//   const doc = new jsPDF();
//   doc.text("Pharmacy Collection Report", 14, 15);

//   const tableColumn = ["Sr No", "Date", "Bill No", "Patient Name", "Prescription Type", "Cash", "Online/UPI", "Card", "Discount"];
//   const tableRows = tableData.map((item, index) => [
//     index + 1,
//     formatDateDisplay(item.date),
//     item.billNo,
//     item.patientName,
//     item.prescriptionType,
//     item.cashamt,
//     item.onlineUpiAmt,
//     item.cardamt,
//     item.discount,
//   ]);

//   // Add totals row
//   tableRows.push([
//     "Total", "", "", "", "", totals.cash, totals.onlineUpi, totals.card, totals.discount
//   ]);

//   autoTable(doc, {
//     head: [tableColumn],
//     body: tableRows,
//     startY: 20,
//     theme: 'grid',
//     styles: { fontSize: 8 },
//     headStyles: { fillColor: [0, 172, 193] }
//   });

//   doc.save("Pharmacy_Collection_Report.pdf");
// };

// const renderHeader = () => {
//   return (
//     <div className="d-flex justify-content-between align-items-center mb-1">
//       <div className="d-flex align-items-center" style={{ gap: "20px" }}>
//         <div className="d-flex align-items-center">
//           <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Show</span>
//           <Form.Select
//             size="sm"
//             style={{ width: "70px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
//             value={rows}
//             onChange={(e) => setRows(Number(e.target.value))}
//           >
//             <option value={10}>10</option>
//             <option value={25}>25</option>
//             <option value={50}>50</option>
//             <option value={100}>100</option>
//           </Form.Select>
//         </div>
//         <div className="d-flex align-items-center">
//           <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Search</span>
//           <span className="p-input-icon-left">
//             <InputText
//               value={searchText}
//               onChange={onGlobalFilterChange}
//               placeholder="Global Search..."
//               className="p-inputtext-sm"
//               style={{ width: "200px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
//             />
//           </span>
//         </div>
//       </div>
//       <div className="d-flex" style={{ gap: "10px" }}>
//         <button
//           className="btn btn-success btn-sm"
//           onClick={exportToExcel}
//           style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
//         >
//           <i className="fa fa-file-excel-o"></i> Download Excel
//         </button>
//         <button
//           className="btn btn-danger btn-sm"
//           onClick={downloadPDF}
//           style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
//         >
//           <i className="fa fa-file-pdf-o"></i> Download PDF
//         </button>
//       </div>
//     </div>
//   );
// };

//   const footerGroup = (
//     <ColumnGroup>
//       <Row>
//         <Column footer="Total" colSpan={5} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
//         <Column footer={totals.cash} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
//         <Column footer={totals.onlineUpi} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
//         <Column footer={totals.card} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
//         <Column footer={totals.discount} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
//       </Row>
//     </ColumnGroup>
//   );

// const header = renderHeader();

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
//       <PageBreadcrumb pagename="Pharmacy Collection Report" />

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
//                   <h4 style={{ margin: 0 }}>Pharmacy Collection Report</h4>
//                 </Card.Header>
//                 <Card.Body style={{ padding: "5px" }}>
//                   <Form onSubmit={handleFind}>
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
//                             type="submit"
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
//                             {loading ? "Loading..." : "Search"}
//                           </button>
//                         </Form.Group>
//                       </Col>
//                     </Row>
//                   </Form>

//                   <DataTable
//                     value={tableData}
//                     paginator
//                     rows={rows}
//                     filters={filters}
//                     header={header}
//                     footerColumnGroup={footerGroup}
//                     paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
//                     currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
//                     emptyMessage={loading ? "Loading..." : "No records found."}
//                     className="p-datatable-sm custom-datatable"
//                     style={{ fontSize: "12px" }}
//                     rowHover
//                     stripedRows
//                     responsiveLayout="scroll"
//                   >
//                     <Column
//                       header="Sr No"
//                       body={(rowData, { rowIndex }) => rowIndex + 1}
//                       style={{ width: "60px", textAlign: "center" }}
//                     />
//                     <Column field="date" header="Date" body={(rowData) => formatDateDisplay(rowData.date)} />
//                     <Column field="billNo" header="Bill No" />
//                     <Column field="patientName" header="Patient Name" />
//                     <Column field="prescriptionType" header="Prescription Type" />
//                     <Column field="cashamt" header="Cash" />
//                     <Column field="onlineUpiAmt" header="Online/UPI" />
//                     <Column field="cardamt" header="Card" />
//                     <Column field="discount" header="Discount" />
//                   </DataTable>
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
//         .custom-datatable .p-datatable-footer {
//           background-color: transparent !important;
//           border-top: 1px solid #90caf9 !important;
//         }
//         .custom-datatable .p-datatable-tfoot > tr > td {
//           background-color: #e0f7fa !important;
//           color: black !important;
//           padding: 10px 8px;
//           border: 1px solid #90caf9 !important;
//           font-size: 12px;
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

// export default PharmacyCollectionReport;

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from 'primereact/columngroup';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import { decodeJwt } from "../../../utils/decode-jwt"; // Ensure this utility exists



// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api"

const PharmacyCollectionReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [totals, setTotals] = useState({ cash: 0, onlineUpi: 0, card: 0, discount: 0 });

  // 1. Initialize Location from Token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  // 2. Calculation Logic mimicking the AJAX Success block
  const calculateTotals = (data) => {
    return data.reduce(
      (acc, curr) => ({
        cash: acc.cash + (parseFloat(curr.cashamt) || 0),
        onlineUpi: acc.onlineUpi + (parseFloat(curr.onlineUpiAmt) || 0),
        card: acc.card + (parseFloat(curr.cardamt) || 0),
        discount: acc.discount + (parseFloat(curr.discount) || 0),
      }),
      { cash: 0, onlineUpi: 0, card: 0, discount: 0 }
    );
  };

  const handleFind = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please Enter all date fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/managereports/getPharmacyReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          location: currentLocation,
          Fromdate: fromDate,
          Todate: toDate
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      // 3. Process Data mimicking the AJAX loop logic
      const formattedData = result.map((item) => {
        const paymentMode = item.paymentmode;
        const total = parseFloat(item.final_total) || 0;

        return {
          ...item,
          date: item.created_at ? item.created_at.split('T')[0] : "",
          billNo: item.bill_no || `PH-${item.id}`,
          patientName: item.patient_name || item.patient || "N/A", // matches SQL alias
          prescriptionType: item.prescription_type,
          // Mapping mode logic from your AJAX snippet
          cashamt: paymentMode === 'Cash' ? total : 0,
          cardamt: paymentMode === 'Card' ? total : 0,
          onlineUpiAmt: (paymentMode === 'Online' || paymentMode === 'UPI') ? total : 0,
          discount: parseFloat(item.discountamt) || 0,
        };
      });

      setTableData(formattedData);
      setTotals(calculateTotals(formattedData));
    } catch (error) {
      console.error("Error:", error);
      alert("Error fetching pharmacy collection records.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "N/A";
    return dateStr.split('-').reverse().join('-'); // YYYY-MM-DD to DD-MM-YYYY
  };

  // --- Export Logic ---
  const exportToExcel = () => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const excelData = tableData.map((item, index) => ({
      "Sr No": index + 1,
      "Date": formatDateDisplay(item.date),
      "Bill No": item.billNo,
      "Patient": item.patientName,
      "Type": item.prescriptionType,
      "Cash": item.cashamt.toFixed(2),
      "Online/UPI": item.onlineUpiAmt.toFixed(2),
      "Card": item.cardamt.toFixed(2),
      "Discount": item.discount.toFixed(2),
    }));

    excelData.push({ "Sr No": "TOTAL", "Cash": totals.cash.toFixed(2), "Online/UPI": totals.onlineUpi.toFixed(2), "Card": totals.card.toFixed(2), "Discount": totals.discount.toFixed(2) });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["PharmacyCollection"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: fileType }), `Pharmacy_Collection_${fromDate}.xlsx`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Pharmacy Collection Report", 14, 15);

    const tableColumn = ["Sr No", "Date", "Bill No", "Patient Name", "Prescription Type", "Cash", "Online/UPI", "Card", "Discount"];
    const tableRows = tableData.map((item, index) => [
      index + 1,
      formatDateDisplay(item.date),
      item.billNo,
      item.patientName,
      item.prescriptionType,
      item.cashamt,
      item.onlineUpiAmt,
      item.cardamt,
      item.discount,
    ]);

    // Add totals row
    tableRows.push([
      "Total", "", "", "", "", totals.cash, totals.onlineUpi, totals.card, totals.discount
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193] }
    });

    doc.save("Pharmacy_Collection_Report.pdf");
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

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total" colSpan={5} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.cash.toFixed(2)} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.onlineUpi.toFixed(2)} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.card.toFixed(2)} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.discount.toFixed(2)} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
      </Row>
    </ColumnGroup>
  );

  const header = renderHeader();

  return (
    <div className="themebody-wrap" style={{ padding: "20px", background: "linear-gradient(to right, #e0f7fa, #80deea)", minHeight: "100vh" }}>
      <PageBreadcrumb pagename="Pharmacy Collection Report" />
      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card style={{ borderRadius: "12px", border: "1px solid #00bcd4" }}>
                <Card.Header className="text-center" style={{ background: "linear-gradient(to right, #00acc1, #007c91)", color: "white" }}>
                  <h4 style={{ margin: 0 }}>Pharmacy Collection Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "10px" }}>
                  <Form onSubmit={handleFind}>
                    <Row className="align-items-end mb-4 flex-nowrap" style={{ margin: "0 -5px" }}>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Label style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>From Date</Form.Label>
                        <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ border: "2px solid #4dd0e1", borderRadius: "8px", fontSize: "12px" }} />
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Label style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>To Date</Form.Label>
                        <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ border: "2px solid #4dd0e1", borderRadius: "8px", fontSize: "12px" }} />
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <button className="btn btn-primary w-100" type="submit" style={{ height: "35px", background: "#00acc1", borderRadius: "8px", fontWeight: "bold" }}>
                          {loading ? "Searching..." : "Search"}
                        </button>
                      </Col>
                    </Row>
                  </Form>

                  <DataTable
                    value={tableData}
                    paginator
                    rows={rows}
                    filters={filters}
                    header={renderHeader()}
                    footerColumnGroup={footerGroup}
                    emptyMessage={loading ? "Loading..." : "No records found."}
                    className="p-datatable-sm custom-datatable"
                    stripedRows
                    responsiveLayout="scroll"
                  >
                    <Column header="Sr No" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: "60px", textAlign: "center" }} />
                    <Column field="date" header="Date" body={(rowData) => formatDateDisplay(rowData.date)} />
                    <Column field="billNo" header="Bill No" />
                    <Column field="patientName" header="Patient Name" />
                    <Column field="prescriptionType" header="Type" />
                    <Column field="cashamt" header="Cash" body={(r) => r.cashamt.toFixed(2)} />
                    <Column field="onlineUpiAmt" header="Online/UPI" body={(r) => r.onlineUpiAmt.toFixed(2)} />
                    <Column field="cardamt" header="Card" body={(r) => r.cardamt.toFixed(2)} />
                    <Column field="discount" header="Discount" body={(r) => r.discount.toFixed(2)} />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
        .custom-datatable .p-datatable-thead > tr > th { background-color: #b2ebf2 !important; font-size: 12px; border: 1px solid #90caf9 !important; text-align: center !important; color: black !important; }
        .custom-datatable .p-datatable-tbody > tr > td { font-size: 11px; border: 1px solid #90caf9; text-align: center !important; }
        .custom-datatable .p-datatable-tfoot > tr > td { background-color: #e0f7fa !important; border: 1px solid #90caf9 !important; font-size: 12px; }
      `}</style>
    </div>
  );
};

export default PharmacyCollectionReport;