import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
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
  const [mainConversionData, setMainConversionData] = useState([]);
  const [assistantConversionData, setAssistantConversionData] = useState([]);
  const [mainOverallData, setMainOverallData] = useState([]);
  const [assistantOverallData, setAssistantOverallData] = useState([]);

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
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    setSearchText(value);
  };

  // 1. Function to process Performance Data (Main or Assistant)
  // const processPerformanceData = (rawMsg) => {
  //   const uniqueIds = [];
  //   const doctorNames = [];

  //   // Step 1: Identify Unique Doctors
  //   rawMsg.forEach((item) => {
  //     const docId = item.consultantDoctor || item.assistanceDoctor;
  //     if (!uniqueIds.includes(docId)) {
  //       uniqueIds.push(docId);
  //       doctorNames.push(item.DoctorName);
  //     }
  //   });

  //   // Step 2: Tally Stats per Unique Doctor (Replicating PHP nested loop & Switch)
  //   return uniqueIds.map((id, index) => {
  //     const stats = { new: 0, follow: 0, postop: 0, med: 0, sur: 0, test: 0 };

  //     rawMsg.forEach((msg) => {
  //       if ((msg.consultantDoctor || msg.assistanceDoctor) === id) {
  //         // Patient Type Tally
  //         switch (msg.patient_type) {
  //           case "New": stats.new++; break;
  //           case "Follow": stats.follow++; break;
  //           case "Postoperative": stats.postop++; break;
  //           default: break;
  //         }
  //         // Diagnosis Advice Tally
  //         const advice = msg.diagnosisAdvice || "";
  //         if (advice.includes("Medication")) stats.med++;
  //         if (advice.includes("Surgery")) stats.sur++;
  //         if (advice.includes("Test")) stats.test++;
  //       }
  //     });

  //     return {
  //       sr: index + 1,
  //       doctorName: doctorNames[index],
  //       ...stats
  //     };
  //   });
  // };

  const processPerformanceData = (rawMsg) => {
    const uniqueIds = [];
    const doctorNames = [];

    rawMsg.forEach((item) => {
      const docId = item.consultantDoctor || item.assistanceDoctor;
      if (!uniqueIds.includes(docId)) {
        uniqueIds.push(docId);
        doctorNames.push(item.DoctorName);
      }
    });

    return uniqueIds.map((id, index) => {
      const stats = { new: 0, follow: 0, postop: 0, med: 0, sur: 0, test: 0 };

      rawMsg.forEach((msg) => {
        if ((msg.consultantDoctor || msg.assistanceDoctor) === id) {
          switch (msg.patient_type) {
            case "New":
              stats.new++;
              break;
            case "Follow":
              stats.follow++;
              break;
            case "Postoperative":
              stats.postop++;
              break;
            default:
              break;
          }
          const advice = msg.diagnosisAdvice || "";
          if (advice.includes("Medication")) stats.med++;
          if (advice.includes("Surgery")) stats.sur++;
          if (advice.includes("Test")) stats.test++;
        }
      });

      return {
        sr: index + 1,
        DoctorName: doctorNames[index], // Capitalized to match conversion tables
        count: stats.sur, // Used for the "Conversion" view
        ...stats,
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

  // const handleSearch = async () => {
  //   if (!fromDate || !toDate) {
  //     alert('Please select a date range.');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const response = await fetch(`${BASE_URL}/V1/managereports/getDoctorPerformanceAnalytics`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${localStorage.getItem("token")}`
  //       },
  //       body: JSON.stringify({
  //         location: currentLocation,
  //         Fromdate: fromDate,
  //         Todate: toDate
  //       })
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       const { data } = result;

  //       // Process and set all states at once
  //       setConsultantData(processPerformanceData(data.mainPerformance));
  //       setAssistantData(processPerformanceData(data.asstPerformance));
  //       setMainConversionData(data.mainConversion);
  //       setAssistantConversionData(data.asstConversion);
  //       setMainOverallData(data.mainOverall);
  //       setAssistantOverallData(data.asstOverall);
  //     }
  //   } catch (error) {
  //     console.error("Batch fetch error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      alert("Please select a date range.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getDoctorPerformanceAnalytics`,
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
          }),
        },
      );

      const result = await response.json();
      console.log(result);
      if (result.success) {
        const { data } = result;

        // Process Performance Data (Aggregating counts)
        setConsultantData(processPerformanceData(data.mainPerformance));
        setAssistantData(processPerformanceData(data.asstPerformance));

        // Helper to map pcount -> count and handle capital DoctorName
        const mapData = (list) =>
          list.map((item) => ({
            ...item,
            count: item.pcount || 0,
            DoctorName: item.DoctorName || item.doctorName, // Handles both case variants
          }));

        setMainConversionData(mapData(data.mainConversion));
        setAssistantConversionData(mapData(data.asstConversion));
        setMainOverallData(mapData(data.mainOverall));
        setAssistantOverallData(mapData(data.asstOverall));
      }
    } catch (error) {
      console.error("Batch fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 96, 100);
    doc.text("Surgery Conversion Report", pageWidth / 2, 15, {
      align: "center",
    });

    // Date Range
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(
      `Report Period: ${fromDate || "N/A"} to ${toDate || "N/A"}`,
      pageWidth / 2,
      22,
      { align: "center" },
    );

    let currentY = 30;

    const tables = [
      { title: "Main Doctor Conversion", data: consultantData },
      { title: "Assistance Doctor Conversion", data: assistantData },
      {
        title: "Assistance Doctor Overall Conversion",
        data: assistantOverallData,
      },
      { title: "Main Doctor Overall Conversion", data: mainOverallData },
    ];

    tables.forEach((table, index) => {
      // Check if title fits on current page, else add new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Table Title
      doc.setFontSize(14);
      doc.setTextColor(0, 124, 145);
      doc.text(table.title, 14, currentY);

      autoTable(doc, {
        head: [["Sr No", "Doctor Name", "Count"]],
        body: table.data.map((item, i) => [i + 1, item.DoctorName, item.count]),
        startY: currentY + 5,
        theme: "striped",
        headStyles: { fillColor: [0, 172, 193], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { top: 10 },
      });

      currentY = doc.lastAutoTable.finalY + 15;
    });

    doc.save(`SX_Conversion_Report_${fromDate}_to_${toDate}.pdf`);
  };

  const renderHeader = () => (
    <Row className="align-items-center" style={{ margin: "0 -5px" }}>
      <Col style={{ padding: "0 5px" }} className="d-flex align-items-center">
        <div className="d-flex align-items-center" style={{ gap: "20px" }}>
          <div className="d-flex align-items-center">
            <span
              className="me-1"
              style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}
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
              style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}
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
      </Col>
      <Col style={{ padding: "0 5px" }} className="d-flex justify-content-end">
        <button
          className="btn btn-danger btn-sm"
          onClick={downloadPDF}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            borderRadius: "8px",
            fontWeight: "600",
            height: "35px",
          }}
        >
          <i className="fa fa-file-pdf-o"></i> Download PDF
        </button>
      </Col>
    </Row>
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
      <PageBreadcrumb pagename="SX Conversion Report" />
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
                  <h4 style={{ margin: 0 }}>SX Conversion Report</h4>
                </Card.Header>
                <Card.Body className="p-3">
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearch();
                    }}
                  >
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
                            {loading ? <Spinner size="sm" /> : "Search"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  {/* Global Controls */}
                  <div className="mb-3">{renderHeader()}</div>

                  <Row className="g-4">
                    {/* 1. Main Doctor Conversion */}
                    <Col lg={6}>
                      <Card
                        className="h-100 border-0"
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          boxShadow: "0px 6px 15px rgba(0, 80, 80, 0.12)",
                        }}
                      >
                        <Card.Header
                          className="py-10"
                          style={{
                            background:
                              "linear-gradient(to right, #f1f8f9, #e0f2f1)",
                            borderBottom: "1px solid #b2ebf2",
                          }}
                        >
                          <h6
                            className="m-0 fw-bold"
                            style={{ color: "#006064", fontSize: "14px" }}
                          >
                            <i className="fa fa-user-md me-2"></i> Main Doctor
                            Conversion
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <DataTable
                            value={consultantData}
                            rows={rows}
                            filters={filters}
                            className="p-datatable-sm custom-datatable"
                            stripedRows
                            rowHover
                            responsiveLayout="scroll"
                            style={{ fontSize: "12px" }}
                          >
                            <Column
                              header="Sr No"
                              body={(r, { rowIndex }) => rowIndex + 1}
                              style={{ width: "80px", textAlign: "center" }}
                            />
                            <Column
                              field="DoctorName"
                              header="Doctor Name"
                              sortable
                            />
                            <Column
                              field="count"
                              header="Count"
                              sortable
                              style={{ fontWeight: "bold", color: "#007c91" }}
                            />
                          </DataTable>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* 2. Assistance Doctor Conversion */}
                    <Col lg={6}>
                      <Card
                        className="h-100 border-0"
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          boxShadow: "0px 6px 15px rgba(0, 80, 80, 0.12)",
                        }}
                      >
                        <Card.Header
                          className="py-10"
                          style={{
                            background:
                              "linear-gradient(to right, #f1f8f9, #e0f2f1)",
                            borderBottom: "1px solid #b2ebf2",
                          }}
                        >
                          <h6
                            className="m-0 fw-bold"
                            style={{ color: "#006064", fontSize: "14px" }}
                          >
                            <i className="fa fa-user-plus me-2"></i> Assistance
                            Doctor Conversion
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <DataTable
                            value={assistantData}
                            rows={rows}
                            filters={filters}
                            className="p-datatable-sm custom-datatable"
                            stripedRows
                            rowHover
                            responsiveLayout="scroll"
                            style={{ fontSize: "12px" }}
                          >
                            <Column
                              header="Sr No"
                              body={(r, { rowIndex }) => rowIndex + 1}
                              style={{ width: "80px", textAlign: "center" }}
                            />
                            <Column
                              field="DoctorName"
                              header="Doctor Name"
                              sortable
                            />
                            <Column
                              field="count"
                              header="Count"
                              sortable
                              style={{ fontWeight: "bold", color: "#007c91" }}
                            />
                          </DataTable>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* 3. Assistance Doctor Overall Conversion */}
                    <Col lg={6}>
                      <Card
                        className="h-100 border-0"
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          boxShadow: "0px 6px 15px rgba(0, 80, 80, 0.12)",
                        }}
                      >
                        <Card.Header
                          className="py-10"
                          style={{
                            background:
                              "linear-gradient(to right, #f1f8f9, #e0f2f1)",
                            borderBottom: "1px solid #b2ebf2",
                          }}
                        >
                          <h6
                            className="m-0 fw-bold"
                            style={{ color: "#006064", fontSize: "14px" }}
                          >
                            <i className="fa fa-pie-chart me-2"></i> Assistance
                            Doctor Overall Conversion
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <DataTable
                            value={assistantOverallData}
                            rows={rows}
                            filters={filters}
                            className="p-datatable-sm custom-datatable"
                            stripedRows
                            rowHover
                            responsiveLayout="scroll"
                            style={{ fontSize: "12px" }}
                          >
                            <Column
                              header="Sr No"
                              body={(r, { rowIndex }) => rowIndex + 1}
                              style={{ width: "80px", textAlign: "center" }}
                            />
                            <Column
                              field="DoctorName"
                              header="Doctor Name"
                              sortable
                            />
                            <Column
                              field="count"
                              header="Count"
                              sortable
                              style={{ fontWeight: "bold", color: "#007c91" }}
                            />
                          </DataTable>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* 4. Main Doctor Overall Conversion */}
                    <Col lg={6}>
                      <Card
                        className="h-100 border-0"
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          boxShadow: "0px 6px 15px rgba(0, 80, 80, 0.12)",
                        }}
                      >
                        <Card.Header
                          className="py-10"
                          style={{
                            background:
                              "linear-gradient(to right, #f1f8f9, #e0f2f1)",
                            borderBottom: "1px solid #b2ebf2",
                          }}
                        >
                          <h6
                            className="m-0 fw-bold"
                            style={{ color: "#006064", fontSize: "14px" }}
                          >
                            <i className="fa fa-line-chart me-2"></i> Main
                            Doctor Overall Conversion
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <DataTable
                            value={mainOverallData}
                            rows={rows}
                            filters={filters}
                            className="p-datatable-sm custom-datatable"
                            stripedRows
                            rowHover
                            responsiveLayout="scroll"
                            style={{ fontSize: "12px" }}
                          >
                            <Column
                              header="Sr No"
                              body={(r, { rowIndex }) => rowIndex + 1}
                              style={{ width: "80px", textAlign: "center" }}
                            />
                            <Column
                              field="DoctorName"
                              header="Doctor Name"
                              sortable
                            />
                            <Column
                              field="count"
                              header="Count"
                              sortable
                              style={{ fontWeight: "bold", color: "#007c91" }}
                            />
                          </DataTable>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
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

export default SxConversionReport;
