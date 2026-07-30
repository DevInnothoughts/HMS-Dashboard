import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
  Spinner,
} from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { decodeJwt } from "../../../utils/decode-jwt";

const BASE_URL = "http://localhost:5100/api";

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

  const processReportData = (response, type) => {
    const uniqueDoctors = [
      ...new Set(response.map((item) => item.consultantDoctor)),
    ];
    const processed = uniqueDoctors.map((docId) => {
      const docRecords = response.filter((r) => r.consultantDoctor === docId);
      const doctorName = docRecords[0]?.DoctorName || "Unknown";

      const stats = {
        doctorName,
        piles: 0,
        fistula: 0,
        hernia: 0,
        varicoseVeins: 0,
        prolapse: 0,
        circumcision: 0,
        abscess: 0,
        fissure: 0,
        ibs: 0,
        totalPiles: 0,
        totalFistula: 0,
        totalHernia: 0,
        totalVaricose: 0,
        totalProlapse: 0,
        totalCircumcision: 0,
        totalAbscess: 0,
        totalFissure: 0,
        totalIbs: 0,
      };

      docRecords.forEach((rec) => {
        const spec = rec.speciality?.toLowerCase();
        const pkg = parseFloat(rec.Package) || 0;

        const mapSpeciality = (key, totalKey) => {
          stats[key]++;
          if (type === "detailed") stats[totalKey] += pkg;
        };

        if (spec?.includes("piles")) mapSpeciality("piles", "totalPiles");
        else if (spec?.includes("fistula"))
          mapSpeciality("fistula", "totalFistula");
        else if (spec?.includes("hernia"))
          mapSpeciality("hernia", "totalHernia");
        else if (spec?.includes("varicose"))
          mapSpeciality("varicoseVeins", "totalVaricose");
        else if (spec?.includes("prolapse"))
          mapSpeciality("prolapse", "totalProlapse");
        else if (spec?.includes("circumcision"))
          mapSpeciality("circumcision", "totalCircumcision");
        else if (spec?.includes("abscess"))
          mapSpeciality("abscess", "totalAbscess");
        else if (spec?.includes("fissure"))
          mapSpeciality("fissure", "totalFissure");
        else if (spec?.includes("ibs")) mapSpeciality("ibs", "totalIbs");
      });
      return stats;
    });
    return processed;
  };

  const handleFind = async () => {
    if (!fromDate || !toDate) {
      alert("Please Enter all fields details..");
      return;
    }

    setLoading(true);
    try {
      const authHeader = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const resAssisted = await fetch(
        `${BASE_URL}/V1/managereports/getConditionReports`,
        {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
            isDetailed: false,
          }),
        },
      );
      const dataAssisted = await resAssisted.json();
      setAssistedData(processReportData(dataAssisted, "assisted"));

      const resDetailed = await fetch(
        `${BASE_URL}/V1/managereports/getConditionReports`,
        {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
            isDetailed: true,
          }),
        },
      );
      const dataDetailed = await resDetailed.json();
      const detailedProcessed = processReportData(dataDetailed, "detailed");

      setConvertedData(detailedProcessed.map((d) => ({ ...d })));

      setTotalPackageData(
        detailedProcessed.map((d) => ({
          doctorName: d.doctorName,
          piles: d.totalPiles,
          fistula: d.totalFistula,
          hernia: d.totalHernia,
          varicoseVeins: d.totalVaricose,
          prolapse: d.totalProlapse,
          circumcision: d.totalCircumcision,
          abscess: d.totalAbscess,
          fissure: d.totalFissure,
          ibs: d.totalIbs,
        })),
      );

      setAveragePackageData(
        detailedProcessed.map((d) => ({
          doctorName: d.doctorName,
          piles: Math.round(d.totalPiles / (d.piles || 1)),
          fistula: Math.round(d.totalFistula / (d.fistula || 1)),
          hernia: Math.round(d.totalHernia / (d.hernia || 1)),
          varicoseVeins: Math.round(d.totalVaricose / (d.varicoseVeins || 1)),
          prolapse: Math.round(d.totalProlapse / (d.prolapse || 1)),
          circumcision: Math.round(d.totalCircumcision / (d.circumcision || 1)),
          abscess: Math.round(d.totalAbscess / (d.abscess || 1)),
          fissure: Math.round(d.totalFissure / (d.fissure || 1)),
          ibs: Math.round(d.totalIbs / (d.ibs || 1)),
        })),
      );
    } catch (error) {
      console.error("Error fetching condition reports:", error);
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

  const handlePrint = () => {
    window.print();
  };

  const getFilteredData = (data) => {
    if (!searchText) return data;
    const query = searchText.toLowerCase().trim();
    return data.filter((item) => {
      const doctorName = (item.doctorName || "").toLowerCase();
      const piles = String(item.piles || "").toLowerCase();
      const fistula = String(item.fistula || "").toLowerCase();
      const hernia = String(item.hernia || "").toLowerCase();
      const varicoseVeins = String(item.varicoseVeins || "").toLowerCase();
      const prolapse = String(item.prolapse || "").toLowerCase();
      const circumcision = String(item.circumcision || "").toLowerCase();
      const abscess = String(item.abscess || "").toLowerCase();
      const fissure = String(item.fissure || "").toLowerCase();
      const ibs = String(item.ibs || "").toLowerCase();

      return (
        doctorName.includes(query) ||
        piles.includes(query) ||
        fistula.includes(query) ||
        hernia.includes(query) ||
        varicoseVeins.includes(query) ||
        prolapse.includes(query) ||
        circumcision.includes(query) ||
        abscess.includes(query) ||
        fissure.includes(query) ||
        ibs.includes(query)
      );
    });
  };

  const filteredAssisted = getFilteredData(assistedData);
  const filteredConverted = getFilteredData(convertedData);
  const filteredTotalPackage = getFilteredData(totalPackageData);
  const filteredAveragePackage = getFilteredData(averagePackageData);

  const getTableTotals = (data, isAverage = false) => {
    const initial = {
      piles: 0,
      fistula: 0,
      hernia: 0,
      varicoseVeins: 0,
      prolapse: 0,
      circumcision: 0,
      abscess: 0,
      fissure: 0,
      ibs: 0,
    };
    const sum = data.reduce((acc, curr) => {
      acc.piles += Number(curr.piles) || 0;
      acc.fistula += Number(curr.fistula) || 0;
      acc.hernia += Number(curr.hernia) || 0;
      acc.varicoseVeins += Number(curr.varicoseVeins) || 0;
      acc.prolapse += Number(curr.prolapse) || 0;
      acc.circumcision += Number(curr.circumcision) || 0;
      acc.abscess += Number(curr.abscess) || 0;
      acc.fissure += Number(curr.fissure) || 0;
      acc.ibs += Number(curr.ibs) || 0;
      return acc;
    }, initial);

    if (isAverage && data.length > 0) {
      return {
        piles: Math.round(sum.piles / data.length),
        fistula: Math.round(sum.fistula / data.length),
        hernia: Math.round(sum.hernia / data.length),
        varicoseVeins: Math.round(sum.varicoseVeins / data.length),
        prolapse: Math.round(sum.prolapse / data.length),
        circumcision: Math.round(sum.circumcision / data.length),
        abscess: Math.round(sum.abscess / data.length),
        fissure: Math.round(sum.fissure / data.length),
        ibs: Math.round(sum.ibs / data.length),
      };
    }
    return sum;
  };

  const assistedTotals = getTableTotals(filteredAssisted);
  const convertedTotals = getTableTotals(filteredConverted);
  const totalPackageTotals = getTableTotals(filteredTotalPackage);
  const averagePackageTotals = getTableTotals(filteredAveragePackage, true);

  const getFooterGroup = (totals) => (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total"
          colSpan={2}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column footer={formatValue(totals.piles)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatValue(totals.fistula)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatValue(totals.hernia)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatValue(totals.varicoseVeins)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatValue(totals.prolapse)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatValue(totals.circumcision)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatValue(totals.abscess)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatValue(totals.fissure)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatValue(totals.ibs)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
      </Row>
    </ColumnGroup>
  );

  const renderHeader = () => {
    return (
      <Row className="align-items-center mb-1" style={{ margin: "0 -5px" }}>
        <Col style={{ padding: "0 5px" }} className="d-flex align-items-center">
          <div className="d-flex align-items-center" style={{ gap: "20px" }}>
            <div className="d-flex align-items-center">
              <span
                className="me-1"
                style={{
                  fontWeight: "bold",
                  color: "#006064",
                  fontSize: "12px",
                }}
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
                style={{
                  fontWeight: "bold",
                  color: "#006064",
                  fontSize: "12px",
                }}
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
        <Col
          style={{ padding: "0 5px" }}
          className="d-flex justify-content-end"
        >
          <button
            className="btn btn-danger btn-sm"
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              borderRadius: "8px",
              fontWeight: "600",
              height: "35px",
            }}
          >
            <i className="fa fa-print"></i> Print Report
          </button>
        </Col>
      </Row>
    );
  };

  const ReportSection = ({ title, data, totals }) => (
    <div className="mb-5 pb-3 mt-10 custom-datatable-wrapper">
      <div
        className="p-3 mb-2"
        style={{
          background: "linear-gradient(to right, #fafafa, #e9e9e9)",
          border: "1px solid #d5d5d5",
          borderBottom: "none",
          borderRadius: "4px 4px 0 0",
          color: "#555",
          fontWeight: "600",
        }}
      >
        {title}
      </div>
      <DataTable
        value={data}
        paginator
        rows={rows}
        filters={filters}
        footerColumnGroup={getFooterGroup(totals)}
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        className="p-datatable-sm custom-datatable"
        style={{ fontSize: "12px" }}
        rowHover
        stripedRows
        responsiveLayout="scroll"
        emptyMessage="No data available."
      >
        <Column
          header="Sr No"
          body={(rowData, { rowIndex }) => rowIndex + 1}
          style={{ width: "60px", textAlign: "center" }}
        />
        <Column field="doctorName" header="Doctor Name" body={(r) => formatValue(r.doctorName)} />
        <Column field="piles" header="Piles" body={(r) => formatValue(r.piles)} />
        <Column field="fistula" header="Fistula" body={(r) => formatValue(r.fistula)} />
        <Column field="hernia" header="Hernia" body={(r) => formatValue(r.hernia)} />
        <Column field="varicoseVeins" header="Varicose Veins" body={(r) => formatValue(r.varicoseVeins)} />
        <Column field="prolapse" header="Prolapse" body={(r) => formatValue(r.prolapse)} />
        <Column field="circumcision" header="Circumcision" body={(r) => formatValue(r.circumcision)} />
        <Column field="abscess" header="Abscess" body={(r) => formatValue(r.abscess)} />
        <Column field="fissure" header="Fissure" body={(r) => formatValue(r.fissure)} />
        <Column field="ibs" header="IBS" body={(r) => formatValue(r.ibs)} />
      </DataTable>
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
      <PageBreadcrumb pagename="Condition Wise Report" />

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
                    padding: "0.8rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Condition Wise Report</h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b>
                    </div>
                  )}
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form className="no-print">
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
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleFind}
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
                            {loading ? <Spinner size="sm" /> : "Search"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  <div className="no-print">{renderHeader()}</div>

                  <div className="mt-3">
                    <ReportSection
                      title="Assisted - Condition Wise Performance"
                      data={assistedData}
                      totals={assistedTotals}
                    />
                    <ReportSection
                      title="Converted - Condition Wise Performance"
                      data={convertedData}
                      totals={convertedTotals}
                    />
                    <ReportSection
                      title="Total Package - Condition Wise"
                      data={totalPackageData}
                      totals={totalPackageTotals}
                    />
                    <ReportSection
                      title="Average Package - Condition Wise"
                      data={averagePackageData}
                      totals={averagePackageTotals}
                    />
                  </div>

                  {/* Print-only container displaying all tables */}
                  <div className="print-table-container">
                    <h5 className="print-section-title">Assisted - Condition Wise Performance</h5>
                    <table className="print-table mb-4">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Doctor Name</th>
                          <th>Piles</th>
                          <th>Fistula</th>
                          <th>Hernia</th>
                          <th>Varicose Veins</th>
                          <th>Prolapse</th>
                          <th>Circumcision</th>
                          <th>Abscess</th>
                          <th>Fissure</th>
                          <th>IBS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssisted.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.doctorName)}</td>
                            <td>{formatValue(item.piles)}</td>
                            <td>{formatValue(item.fistula)}</td>
                            <td>{formatValue(item.hernia)}</td>
                            <td>{formatValue(item.varicoseVeins)}</td>
                            <td>{formatValue(item.prolapse)}</td>
                            <td>{formatValue(item.circumcision)}</td>
                            <td>{formatValue(item.abscess)}</td>
                            <td>{formatValue(item.fissure)}</td>
                            <td>{formatValue(item.ibs)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(assistedTotals.piles)}</td>
                          <td>{formatValue(assistedTotals.fistula)}</td>
                          <td>{formatValue(assistedTotals.hernia)}</td>
                          <td>{formatValue(assistedTotals.varicoseVeins)}</td>
                          <td>{formatValue(assistedTotals.prolapse)}</td>
                          <td>{formatValue(assistedTotals.circumcision)}</td>
                          <td>{formatValue(assistedTotals.abscess)}</td>
                          <td>{formatValue(assistedTotals.fissure)}</td>
                          <td>{formatValue(assistedTotals.ibs)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <h5 className="print-section-title">Converted - Condition Wise Performance</h5>
                    <table className="print-table mb-4">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Doctor Name</th>
                          <th>Piles</th>
                          <th>Fistula</th>
                          <th>Hernia</th>
                          <th>Varicose Veins</th>
                          <th>Prolapse</th>
                          <th>Circumcision</th>
                          <th>Abscess</th>
                          <th>Fissure</th>
                          <th>IBS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredConverted.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.doctorName)}</td>
                            <td>{formatValue(item.piles)}</td>
                            <td>{formatValue(item.fistula)}</td>
                            <td>{formatValue(item.hernia)}</td>
                            <td>{formatValue(item.varicoseVeins)}</td>
                            <td>{formatValue(item.prolapse)}</td>
                            <td>{formatValue(item.circumcision)}</td>
                            <td>{formatValue(item.abscess)}</td>
                            <td>{formatValue(item.fissure)}</td>
                            <td>{formatValue(item.ibs)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(convertedTotals.piles)}</td>
                          <td>{formatValue(convertedTotals.fistula)}</td>
                          <td>{formatValue(convertedTotals.hernia)}</td>
                          <td>{formatValue(convertedTotals.varicoseVeins)}</td>
                          <td>{formatValue(convertedTotals.prolapse)}</td>
                          <td>{formatValue(convertedTotals.circumcision)}</td>
                          <td>{formatValue(convertedTotals.abscess)}</td>
                          <td>{formatValue(convertedTotals.fissure)}</td>
                          <td>{formatValue(convertedTotals.ibs)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <h5 className="print-section-title">Total Package - Condition Wise</h5>
                    <table className="print-table mb-4">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Doctor Name</th>
                          <th>Piles</th>
                          <th>Fistula</th>
                          <th>Hernia</th>
                          <th>Varicose Veins</th>
                          <th>Prolapse</th>
                          <th>Circumcision</th>
                          <th>Abscess</th>
                          <th>Fissure</th>
                          <th>IBS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTotalPackage.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.doctorName)}</td>
                            <td>{formatValue(item.piles)}</td>
                            <td>{formatValue(item.fistula)}</td>
                            <td>{formatValue(item.hernia)}</td>
                            <td>{formatValue(item.varicoseVeins)}</td>
                            <td>{formatValue(item.prolapse)}</td>
                            <td>{formatValue(item.circumcision)}</td>
                            <td>{formatValue(item.abscess)}</td>
                            <td>{formatValue(item.fissure)}</td>
                            <td>{formatValue(item.ibs)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(totalPackageTotals.piles)}</td>
                          <td>{formatValue(totalPackageTotals.fistula)}</td>
                          <td>{formatValue(totalPackageTotals.hernia)}</td>
                          <td>{formatValue(totalPackageTotals.varicoseVeins)}</td>
                          <td>{formatValue(totalPackageTotals.prolapse)}</td>
                          <td>{formatValue(totalPackageTotals.circumcision)}</td>
                          <td>{formatValue(totalPackageTotals.abscess)}</td>
                          <td>{formatValue(totalPackageTotals.fissure)}</td>
                          <td>{formatValue(totalPackageTotals.ibs)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <h5 className="print-section-title">Average Package - Condition Wise</h5>
                    <table className="print-table mb-4">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Doctor Name</th>
                          <th>Piles</th>
                          <th>Fistula</th>
                          <th>Hernia</th>
                          <th>Varicose Veins</th>
                          <th>Prolapse</th>
                          <th>Circumcision</th>
                          <th>Abscess</th>
                          <th>Fissure</th>
                          <th>IBS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAveragePackage.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.doctorName)}</td>
                            <td>{formatValue(item.piles)}</td>
                            <td>{formatValue(item.fistula)}</td>
                            <td>{formatValue(item.hernia)}</td>
                            <td>{formatValue(item.varicoseVeins)}</td>
                            <td>{formatValue(item.prolapse)}</td>
                            <td>{formatValue(item.circumcision)}</td>
                            <td>{formatValue(item.abscess)}</td>
                            <td>{formatValue(item.fissure)}</td>
                            <td>{formatValue(item.ibs)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(averagePackageTotals.piles)}</td>
                          <td>{formatValue(averagePackageTotals.fistula)}</td>
                          <td>{formatValue(averagePackageTotals.hernia)}</td>
                          <td>{formatValue(averagePackageTotals.varicoseVeins)}</td>
                          <td>{formatValue(averagePackageTotals.prolapse)}</td>
                          <td>{formatValue(averagePackageTotals.circumcision)}</td>
                          <td>{formatValue(averagePackageTotals.abscess)}</td>
                          <td>{formatValue(averagePackageTotals.fissure)}</td>
                          <td>{formatValue(averagePackageTotals.ibs)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
        .custom-datatable .p-datatable-tfoot > tr > td { background-color: #e0f7fa !important; color: black !important; padding: 10px 8px; border: 1px solid #90caf9 !important; font-size: 12px; }
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
          .simplebar-scrollbar,
          .custom-datatable-wrapper {
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
            page-break-inside: avoid !important;
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
          .print-table .print-totals-row td {
            background-color: #e0f7fa !important;
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
          .print-section-title {
            color: #006064 !important;
            font-size: 12px !important;
            font-weight: bold !important;
            margin-top: 15px !important;
            margin-bottom: 5px !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ConditionWiseReport;
