import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import ReactApexChart from "react-apexcharts";
import { decodeJwt } from "../../../utils/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

const appointmentTypes = [
  { value: "New", label: "New" },
  { value: "Post Operative", label: "Post Operative" },
  { value: "Follow Up", label: "Follow Up" },
  { value: "Other", label: "Other" },
];

const appointmentStatusOptions = [
  { value: "Visited", label: "Visited" },
  { value: "Do not Wait", label: "Do not Wait" },
];

const formatValue = (val) => {
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
    return "-";
  }
  return val;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return datePart.split("-").reverse().join("-");
};

const AppointmentConversion = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentStatus, setAppointmentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
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

  const [dailyChartData, setDailyChartData] = useState({
    categories: [],
    series: [],
  });
  const [monthlyChartData, setMonthlyChartData] = useState({
    categories: [],
    series: [],
  });

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  const handleFindClick = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please select date range");
      return;
    }

    setLoading(true);
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const [
        resList,
        resNew,
        resFO,
        resPO,
        resMonthNew,
        resMonthFO,
        resMonthPO,
      ] = await Promise.all([
        fetch(`${BASE_URL}/V1/managereports/listConvAppointments`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
            AppointmentType: appointmentType,
            AppointmentStatus: appointmentStatus,
          }),
        }),
        fetch(`${BASE_URL}/V1/managereports/NewAppointmentDetails`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
          }),
        }),
        fetch(`${BASE_URL}/V1/managereports/FollowAppointmentDetails`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
          }),
        }),
        fetch(`${BASE_URL}/V1/managereports/POAppointmentDetails`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
          }),
        }),
        fetch(`${BASE_URL}/V1/managereports/MonthwiseNewAppointment`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
          }),
        }),
        fetch(`${BASE_URL}/V1/managereports/MonthwiseFOAppointment`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
          }),
        }),
        fetch(`${BASE_URL}/V1/managereports/MonthwisePOAppointment`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
          }),
        }),
      ]);

      const listData = await resList.json();
      const dailyNew = await resNew.json();
      const dailyFO = await resFO.json();
      const dailyPO = await resPO.json();
      const mNew = await resMonthNew.json();
      const mFO = await resMonthFO.json();
      const mPO = await resMonthPO.json();

      let filtered = listData || [];
      if (appointmentType) {
        filtered = filtered.filter(
          (app) =>
            (app.patient_type || app.appointmentType || "").toLowerCase() ===
            appointmentType.toLowerCase(),
        );
      }
      if (appointmentStatus) {
        filtered = filtered.filter(
          (app) =>
            (app.status || "").toLowerCase() ===
            appointmentStatus.toLowerCase(),
        );
      }
      const mappedList = filtered.map((app) => ({
        ...app,
        patient_type:
          app.patient_type === "Postoperative"
            ? "Post Operative"
            : app.patient_type,
      }));
      setAppointments(mappedList);

      const dailyDates = [
        ...new Set([
          ...dailyNew.map((d) => d.appointment_timestamp),
          ...dailyFO.map((d) => d.appointment_timestamp),
        ]),
      ].sort();
      setDailyChartData({
        categories: dailyDates.map((d) => d.split("T")[0]),
        series: [
          {
            name: "New",
            data: dailyDates.map(
              (date) =>
                dailyNew.find((d) => d.appointment_timestamp === date)
                  ?.NEWcount || 0,
            ),
          },
          {
            name: "Follow Up",
            data: dailyDates.map(
              (date) =>
                dailyFO.find((d) => d.appointment_timestamp === date)
                  ?.FOcount || 0,
            ),
          },
          {
            name: "Post Operative",
            data: dailyDates.map(
              (date) =>
                dailyPO.find((d) => d.appointment_timestamp === date)
                  ?.POcount || 0,
            ),
          },
        ],
      });

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthlyKeys = [
        ...new Set([...mNew.map((m) => `${m.cyear}-${m.cmonth}`)]),
      ].sort();
      setMonthlyChartData({
        categories: monthlyKeys.map(
          (k) => `${monthNames[k.split("-")[1] - 1]} ${k.split("-")[0]}`,
        ),
        series: [
          {
            name: "New",
            data: monthlyKeys.map(
              (k) =>
                mNew.find((m) => `${m.cyear}-${m.cmonth}` === k)?.PatientType ||
                0,
            ),
          },
          {
            name: "Follow Up",
            data: monthlyKeys.map(
              (k) =>
                mFO.find((m) => `${m.cyear}-${m.cmonth}` === k)?.PatientType ||
                0,
            ),
          },
          {
            name: "Post Operative",
            data: monthlyKeys.map(
              (k) =>
                mPO.find((m) => `${m.cyear}-${m.cmonth}` === k)?.PatientType ||
                0,
            ),
          },
        ],
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = (categories, title) => ({
    chart: { type: "bar", stacked: true, toolbar: { show: true } },
    plotOptions: { bar: { horizontal: false, columnWidth: "55%" } },
    xaxis: { categories },
    title: { text: title, align: "center", style: { color: "#006064" } },
    colors: ["#369EAD", "#C24642", "#5A55A3"],
    legend: { position: "top" },
    fill: { opacity: 1 },
  });

  const getFilteredData = () => {
    if (!searchText) return appointments;
    const query = searchText.toLowerCase().trim();
    return appointments.filter((app) => {
      const date = String(app.appointment_timestamp || app.date || app.appointment_date || "").toLowerCase();
      const uid = String(app.UidNo || app.appointment_uid || app._id || "").toLowerCase();
      const patient = String(app.patient || app.patientName || "").toLowerCase();
      const type1 = String(app.patient_type || "").toLowerCase();
      const type2 = String(app.appointmentType || "").toLowerCase();
      const doctor = String(app.doctor || app.doctorName || "").toLowerCase();
      const docType = String(app.doctor_type || "").toLowerCase();
      const fde = String(app.FDE_Name || app.fde_name || "").toLowerCase();
      const cancel = String(app.cancellation_reason || "").toLowerCase();

      return (
        date.includes(query) ||
        uid.includes(query) ||
        patient.includes(query) ||
        type1.includes(query) ||
        type2.includes(query) ||
        doctor.includes(query) ||
        docType.includes(query) ||
        fde.includes(query) ||
        cancel.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = filteredData.map((app, index) => ({
      "Sr No": index + 1,
      Date: app.appointment_timestamp || app.date || app.appointment_date,
      "UID no": app.UidNo || app.appointment_uid || app._id,
      "Patient Name": app.patient || app.patientName,
      "Patient Type": app.patient_type || app.appointmentType,
      "Appointment Type": app.patient_type || app.appointmentType,
      "Doctor Name": app.doctor || app.doctorName,
      "Doctor Type": app.doctor_type || "-",
      "FDE Name": app.FDE_Name || app.fde_name || "-",
      Cancellation: app.cancellation_reason || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "Appointment_Conversion_Report" + fileExtension);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-between align-items-center mb-1">
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
              <option value={100}>100</option>
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
        <div className="d-flex" style={{ gap: "10px" }}>
          <button
            className="btn btn-success btn-sm"
            onClick={exportToExcel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              borderRadius: "8px",
            }}
          >
            <i className="fa fa-file-excel-o"></i> Download Excel
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              borderRadius: "8px",
            }}
          >
            <i className="fa fa-print"></i> Print Report
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "10px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        fontSize: "13px",
      }}
    >
      <PageBreadcrumb pagename="Appointment Conversion" />

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
                  <h4 style={{ margin: 0, fontSize: "18px" }}>
                    Manage Appointment Report
                  </h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b>
                    </div>
                  )}
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleFindClick} className="no-print">
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
                              whiteSpace: "nowrap",
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
                              whiteSpace: "nowrap",
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
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              whiteSpace: "nowrap",
                              fontSize: "12px",
                            }}
                          >
                            Appointment Type
                          </Form.Label>
                          <Form.Select
                            value={appointmentType}
                            onChange={(e) => setAppointmentType(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="">Select Type</option>
                            {appointmentTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              whiteSpace: "nowrap",
                              fontSize: "12px",
                            }}
                          >
                            Appointment Status
                          </Form.Label>
                          <Form.Select
                            value={appointmentStatus}
                            onChange={(e) =>
                              setAppointmentStatus(e.target.value)
                            }
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="">Select Status</option>
                            {appointmentStatusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading}
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
                          >
                            {loading ? "Loading..." : "Search"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  {/* Move controls above graphs */}
                  <div className="mb-3 no-print">{renderHeader()}</div>

                  <DataTable
                    value={appointments}
                    paginator
                    rows={rows}
                    filters={filters}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    emptyMessage={loading ? "Loading..." : "No records found."}
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
                    <Column
                      field="date"
                      header="Date"
                      body={(row) =>
                        formatValue(
                          row.appointment_timestamp ||
                            row.date ||
                            row.appointment_date,
                        )
                      }
                    />
                    <Column
                      field="appointment_uid"
                      header="UID no"
                      body={(row) =>
                        formatValue(row.UidNo || row.appointment_uid || row._id)
                      }
                    />
                    <Column
                      field="patientName"
                      header="Patient Name"
                      body={(row) => formatValue(row.patient || row.patientName)}
                    />
                    <Column
                      field="patient_type"
                      header="Patient Type"
                      body={(row) => formatValue(row.patient_type || row.appointmentType)}
                    />
                    <Column
                      field="appointmentType"
                      header="Appointment Type"
                      body={(row) => formatValue(row.patient_type || row.appointmentType)}
                    />
                    <Column
                      field="doctorName"
                      header="Doctor Name"
                      body={(row) => formatValue(row.doctor || row.doctorName)}
                    />
                    <Column
                      field="doctor_type"
                      header="Doctor Type"
                      body={(row) => formatValue(row.doctor_type)}
                    />
                    <Column
                      field="fde_name"
                      header="FDE Name"
                      body={(row) => formatValue(row.FDE_Name || row.fde_name)}
                    />
                    <Column
                      field="cancellation_reason"
                      header="Cancellation"
                      body={(row) => formatValue(row.cancellation_reason)}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Date</th>
                          <th>UID no</th>
                          <th>Patient Name</th>
                          <th>Patient Type</th>
                          <th>Appointment Type</th>
                          <th>Doctor Name</th>
                          <th>Doctor Type</th>
                          <th>FDE Name</th>
                          <th>Cancellation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.appointment_timestamp || item.date || item.appointment_date)}</td>
                            <td>{formatValue(item.UidNo || item.appointment_uid || item._id)}</td>
                            <td>{formatValue(item.patient || item.patientName)}</td>
                            <td>{formatValue(item.patient_type || item.appointmentType)}</td>
                            <td>{formatValue(item.patient_type || item.appointmentType)}</td>
                            <td>{formatValue(item.doctor || item.doctorName)}</td>
                            <td>{formatValue(item.doctor_type)}</td>
                            <td>{formatValue(item.FDE_Name || item.fde_name)}</td>
                            <td>{formatValue(item.cancellation_reason)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Analytics Section - Replicating PHP Chart Containers */}
                  {(dailyChartData.series.length > 0 || monthlyChartData.series.length > 0) && (
                    <Row className="mt-4 mb-4 print-chart-container">
                      <Col md={6}>
                        <ReactApexChart
                          options={chartOptions(
                            dailyChartData.categories,
                            "Daily Comparative Reports",
                          )}
                          series={dailyChartData.series}
                          type="bar"
                          height={300}
                        />
                      </Col>
                      <Col md={6}>
                        <ReactApexChart
                          options={chartOptions(
                            monthlyChartData.categories,
                            "Monthly Comparative Reports",
                          )}
                          series={monthlyChartData.series}
                          type="bar"
                          height={300}
                        />
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
        .print-table-container {
          display: none;
        }
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

        @media print {
          @page {
            size: landscape;
            margin: 20mm 15mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .codex-sidebar,
          .codex-header,
          .codex-breadcrumb,
          .scroll-top,
          .no-print,
          .p-datatable-header,
          .p-paginator,
          .simplebar-placeholder,
          .simplebar-track,
          .simplebar-scrollbar {
            display: none !important;
          }
          body, html {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: auto !important;
          }
          .themebody-wrap {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            min-height: auto !important;
            height: auto !important;
            page-break-after: avoid !important;
          }
          .theme-body,
          .simplebar-content-wrapper,
          .simplebar-mask,
          .simplebar-wrapper,
          .simplebar-offset,
          .simplebar-content {
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            position: relative !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
          }
          .container-fluid {
            padding: 0 !important;
            width: 100% !important;
          }
          .custom-datatable {
            display: none !important;
          }
          .print-table-container {
            display: block !important;
            width: 100% !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 10px !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #90caf9 !important;
            padding: 6px 4px !important;
            font-size: 10px !important;
            color: #000 !important;
            text-align: center !important;
          }
          .print-table th {
            background-color: #b2ebf2 !important;
            font-weight: bold !important;
          }
          .print-table thead {
            display: table-header-group !important;
          }
          .print-table tbody {
            display: table-row-group !important;
          }
          .print-table tr {
            page-break-inside: avoid !important;
          }
          .print-chart-container {
            page-break-inside: avoid !important;
            margin-top: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentConversion;
