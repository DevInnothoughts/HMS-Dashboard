import React, { useState, useEffect } from "react";
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
import { decodeJwt } from "../../../utils/decode-jwt";


// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api" // Update your API base URL here

const EnquiryConversion = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState({
    bookedAppointments: "-",
    visited: "-",
    dnw: "-",
    dnt: "-",
    totalEnquiries: "-",
    callBack: "-",
  });
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [currentLocation, setCurrentLocation] = useState("");
    
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  const handleFind = async (e) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      alert("Please Enter all fields details..");
      return;
    }

    try {
      // 1. Format dates for the API (DD/MM/YYYY)
      // const formattedFromDate = fromDate.split("-").reverse().join("-");
      // const formattedToDate = toDate.split("-").reverse().join("-");
      console.log(fromDate, toDate);
      // 2. Fetch both datasets concurrently using Promise.all
      const [appointmentResponse, callBackResponse] = await Promise.all([
        fetch(`${BASE_URL}/V1/managereports/listEnqConv?location=${currentLocation}&from=${fromDate}&to=${toDate}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        }),
        fetch(`${BASE_URL}/V1/managereports/listEnqConvCallBack?location=${currentLocation}&from=${fromDate}&to=${toDate}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        })
      ]);

      if (!appointmentResponse.ok || !callBackResponse.ok) {
        throw new Error("Failed to fetch data from the server");
      }

      const appointmentData = await appointmentResponse.json();
      const callBackData = await callBackResponse.json();
      // console.log(appointmentData, callBackData);
      // 3. Process Appointment Logic (Counters and Unique Enquiries)
      let confirmedPatients = 0;
      let dnwPatients = 0;
      let dntPatients = 0;
      const uniqueEnquiryList = [];

      const appointments = appointmentData?.data || [];
      
      appointments.forEach((item) => {
        // Visited: confirm_time is not 0
        if (item.confirm_time !== 0) {
          confirmedPatients++;
        }
        // DNW (Do Not Wait): executivechk is 0 AND confirmed
        if (item.executivechk === 0 && item.confirm_time !== 0) {
          dnwPatients++;
        }
        // DNT (Did Not Turnup): confirm_time is 0
        if (item.confirm_time === 0) {
          dntPatients++;
        }
        // Collect unique total enquiries
        if (item.totalenquiry && !uniqueEnquiryList.includes(item.totalenquiry)) {
          uniqueEnquiryList.push(item.totalenquiry);
        }
      });

      // 4. Update State with combined results
      setReportData({
        bookedAppointments: appointments.length || 0,
        visited: confirmedPatients,
        dnw: dnwPatients,
        dnt: dntPatients,
        totalEnquiries: uniqueEnquiryList.length > 0 ? uniqueEnquiryList[0] : 0,
        callBack: callBackData?.data?.length || 0,
      });

    } catch (error) {
      console.error("Error fetching conversion data:", error);
      alert(`Error: ${error.message}`);
      setReportData({
        bookedAppointments: "-",
        visited: "-",
        dnw: "-",
        dnt: "-",
        totalEnquiries: "-",
        callBack: "-",
      });
    }
  };

  const exportToExcel = () => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = [{
      "Booked Appointment": reportData.bookedAppointments,
      "Visited": reportData.visited,
      "DNW": reportData.dnw,
      "DNT": reportData.dnt,
      "Total Enquiries": reportData.totalEnquiries,
      "Call Back": reportData.callBack
    }];

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "Enquiry_Conversion_Report" + fileExtension);
  };


  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Enquiry Conversion Report", 14, 15);

    const tableColumn = ["Booked Appointment", "Visited", "DNW", "DNT", "Total Enquiries", "Call Back"];
    const tableRows = [
      [
        reportData.bookedAppointments,
        reportData.visited,
        reportData.dnw,
        reportData.dnt,
        reportData.totalEnquiries,
        reportData.callBack
      ]
    ];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193] }
    });

    doc.save("Enquiry_Conversion_Report.pdf");
  };

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center" style={{ gap: "20px" }}>
          <div className="d-flex align-items-center">
            <span className="me-1" style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>Show</span>
            <Form.Select
              size="sm"
              style={{ width: "70px", borderRadius: "8px", border: "1px solid #4dd0e1", fontSize: "12px" }}
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
            <span className="me-1" style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>Search</span>
            <span className="p-input-icon-left">
              <InputText
                value={searchText}
                onChange={onGlobalFilterChange}
                placeholder="Global Search..."
                className="p-inputtext-sm"
                style={{ width: "200px", borderRadius: "8px", border: "1px solid #4dd0e1", fontSize: "12px" }}
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
        padding: "20px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      <PageBreadcrumb pagename="Enquiry Conversion Report" />

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
                    padding: "0.8rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4>Enquiry Conversion Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleFind}>
                    <Row className="align-items-end mb-4 flex-nowrap" style={{ margin: "0 -5px" }}>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>
                            From Date
                          </Form.Label>
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
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>
                            To Date
                          </Form.Label>
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
                    value={[reportData]}
                    paginator
                    rows={rows}
                    filters={filters}
                    header={header}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    emptyMessage="No records found."
                    className="p-datatable-sm custom-datatable"
                    style={{ fontSize: "12px" }}
                    rowHover
                    stripedRows
                    responsiveLayout="scroll"
                  >
                    <Column field="bookedAppointments" header="Booked Appointment" />
                    <Column field="visited" header="Visited" />
                    <Column field="dnw" header="DNW" />
                    <Column field="dnt" header="DNT" />
                    <Column field="totalEnquiries" header="Total Enquiries" />
                    <Column field="callBack" header="Call Back" />
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
      `}</style>
    </div>
  );
};

export default EnquiryConversion;
