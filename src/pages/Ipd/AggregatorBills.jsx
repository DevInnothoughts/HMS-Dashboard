import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Container, Row, Col, Card, Form, InputGroup, Button, Spinner } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import FeatherIcon from "feather-icons-react";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../Utility/decode-jwt";
import "../../styles/styles.css";

const BASE_URL = "http://localhost:5100/api";

const formatToApiDateLocal = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const AggregatorBills = () => {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const isTodayFiltered =
    fromDate &&
    toDate &&
    moment(fromDate).isSame(moment(), "day") &&
    moment(toDate).isSame(moment(), "day");

  const handleTodayFilterClick = () => {
    if (isTodayFiltered) {
      setFromDate(null);
      setToDate(null);
    } else {
      const today = new Date();
      setFromDate(today);
      setToDate(today);
      setFilters1({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

  const fetchAggregatorBills = useCallback(async () => {
    if (!currentLocation) return;
    setLoading(true);

    try {
      const url = new URL(`${BASE_URL}/V1/invoice/listAggregatorBills`);
      url.searchParams.append("location", currentLocation);

      const fromFormatted = formatToApiDateLocal(fromDate);
      const toFormatted = formatToApiDateLocal(toDate);
      if (fromFormatted) url.searchParams.append("from", fromFormatted);
      if (toFormatted) url.searchParams.append("to", toFormatted);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const resData = await response.json();
      if (response.ok && resData.data) {
        const processed = resData.data.map((item) => ({
          ...item,
          reference_type_display: "Aggregators",
          sub_reference_display: item.sub_reference || "-",
          patient_uid_display: item.patient_uid || "-",
          patient_name_display: (item.prefix ? `${item.prefix} ` : "") + (item.patient_name || "-"),
          patient_phone_display: item.patient_phone || "-",
          ipd_bill_amount_num: parseFloat(item.ipd_bill_amount || 0),
          due_amt_num: parseFloat(item.due_amt || 0),
        }));
        setDataList(processed);
      } else {
        setDataList([]);
      }
    } catch (err) {
      console.error("Error fetching aggregator bills:", err);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, fromDate, toDate]);

  useEffect(() => {
    fetchAggregatorBills();
  }, [currentLocation, fromDate, toDate, fetchAggregatorBills]);

  const filteredData = dataList.filter((item) => {
    const searchTerm = filters1.global.value?.toLowerCase() || "";
    if (!searchTerm) return true;

    return (
      item.patient_name_display.toLowerCase().includes(searchTerm) ||
      item.patient_uid_display.toLowerCase().includes(searchTerm) ||
      item.patient_phone_display.toLowerCase().includes(searchTerm) ||
      item.sub_reference_display.toLowerCase().includes(searchTerm) ||
      item.reference_type_display.toLowerCase().includes(searchTerm)
    );
  });

  const renderHeader = () => (
    <div
      style={{
        border: "1px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "8px",
        padding: "10px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                marginRight: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Show
            </span>
            <Form.Select
              size="sm"
              value={rows}
              onChange={(e) => {
                setRows(parseInt(e.target.value));
                setFirst(0);
              }}
              style={{
                width: "70px",
                height: "30px",
                border: "1px solid #4dd0e1",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>
          <Form.Group
            className="ms-2"
            style={{ display: "flex", alignItems: "center", margin: 0 }}
          >
            <span
              style={{
                marginRight: "10px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Search
            </span>
            <InputGroup style={{ position: "relative" }}>
              <Form.Control
                type="search"
                value={filters1.global.value || ""}
                onChange={(e) =>
                  setFilters1({
                    global: {
                      value: e.target.value,
                      matchMode: FilterMatchMode.CONTAINS,
                    },
                  })
                }
                placeholder="Global Search"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
                }}
              />
            </InputGroup>
          </Form.Group>
          <Button
            variant={isTodayFiltered ? "primary" : "outline-primary"}
            onClick={handleTodayFilterClick}
            style={{
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: "500",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginLeft: "5px",
            }}
          >
            <FeatherIcon icon="calendar" size={12} className="me-1" />
            Today's Bills
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #4dd0e1",
            borderRadius: "8px",
            padding: "8px",
            backgroundColor: "#f5fcfd",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              From Date
            </div>
            <DatePicker
              selected={fromDate}
              onChange={(date) => {
                setFromDate(date);
                setFirst(0);
              }}
              dateFormat="dd-MM-yyyy"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              To Date
            </div>
            <DatePicker
              selected={toDate}
              onChange={(date) => {
                setToDate(date);
                setFirst(0);
              }}
              dateFormat="dd-MM-yyyy"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setFromDate(null);
              setToDate(null);
              setFirst(0);
              setFilters1({
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
              });
            }}
            style={{
              backgroundColor: "#ff9800",
              border: "none",
              borderRadius: "8px",
              padding: "5px 5px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "13px",
            }}
          >
            <FeatherIcon icon="filter" size={12} className="me-1" />
            Clear Filter
          </Button>
        </div>
      </div>
    </div>
  );

  const actionBodyTemplate = () => {
    return (
      <div className="d-flex justify-content-center gap-2">
        <Button
          style={{
            borderRadius: "8px",
            padding: "7px 11px",
            fontSize: "14px",
            alignItems: "center",
            justifyContent: "center",
          }}
          variant="primary"
          title="Plus"
          onClick={() => {
            // Action edit button - nothing opens for now as requested
          }}
        >
          <FeatherIcon icon="plus" size="15" />
        </Button>
      </div>
    );
  };

  const amountBodyTemplate = (rowData) => {
    return `₹ ${rowData.ipd_bill_amount_num.toLocaleString("en-IN")}`;
  };

  const dueAmountBodyTemplate = (rowData) => {
    return `₹ ${rowData.due_amt_num.toLocaleString("en-IN")}`;
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "10px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Aggregator Bills" />

      <Container fluid className="p-0">
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "1px solid #00bcd4",
                marginLeft: "17px",
                marginRight: "17px",
              }}
            >
              <Card.Body style={{ margin: "4px" }}>
                {renderHeader()}
                {loading ? (
                  <div
                    className="d-flex justify-content-center py-5"
                    style={{ color: "#00bcd4" }}
                  >
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : (
                  <DataTable
                    value={filteredData}
                    paginator
                    rows={rows}
                    first={first}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    showGridlines
                    style={{ fontSize: "14px", marginTop: "10px" }}
                    pt={{
                      header: { style: { padding: "10px 12px" } },
                      bodyRow: { style: { height: "40px" } },
                      column: {
                        headerCell: {
                          style: {
                            padding: "10px 8px",
                            backgroundColor: "#f8f9fa",
                            textAlign: "center",
                            justifyContent: "center",
                          },
                        },
                        bodyCell: {
                          style: {
                            padding: "8px 10px",
                            textAlign: "center",
                          },
                        },
                      },
                    }}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    responsiveLayout="scroll"
                    className="custom-datatable-centered datatable-medium-small"
                  >
                    <Column
                      header="Sr No"
                      headerClassName="datatable-header-center"
                      style={{ width: "70px", border: "1px solid #4dd0e1" }}
                      body={(rowData, options) => options.rowIndex + 1}
                    />
                    <Column
                      field="reference_type_display"
                      header="Reference Type"
                      headerClassName="datatable-header-center"
                      style={{ border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="sub_reference_display"
                      header="Sub Reference Type"
                      headerClassName="datatable-header-center"
                      style={{ border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="patient_uid_display"
                      header="UID No"
                      headerClassName="datatable-header-center"
                      style={{ border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="patient_name_display"
                      header="Patient Name"
                      headerClassName="datatable-header-center"
                      style={{ border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="patient_phone_display"
                      header="Contact No"
                      headerClassName="datatable-header-center"
                      style={{ border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="ipd_bill_amount_num"
                      header="IPD Bill Amount"
                      headerClassName="datatable-header-center"
                      body={amountBodyTemplate}
                      style={{ border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="due_amt_num"
                      header="Due Amt"
                      headerClassName="datatable-header-center"
                      body={dueAmountBodyTemplate}
                      style={{ border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      header="Action"
                      headerClassName="datatable-header-center"
                      body={actionBodyTemplate}
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                  </DataTable>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AggregatorBills;
