import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { decodeJwt } from "../../utils/decode-jwt";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Spinner,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { Link } from "react-router-dom";
import NavBarA from "../../components/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css";
import { FilterMatchMode } from "primereact/api";
import moment from "moment";
import Swal from "sweetalert2";



// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api"

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});


export default function EnquiryList() {
  const [currentLocation, setCurrentLocation] = useState("default");
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [fromDate, setFromDate] = useState(moment().startOf("day").toDate());
  const [toDate, setToDate] = useState(moment().endOf("day").toDate());
  const [filters1, setFilters1] = useState({
    // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const formatToDDMMYYYY = (date) => {
    if (!date) return null;
    return moment(date).format("DD-MM-YYYY");
  };

  const fetchEnquiriesData = useCallback(async () => {
    if (currentLocation === "default") {
      console.warn("Waiting for location to be set from JWT...");
      return;
    }

    setLoading(true);
    try {
      let finalFromDate = formatToDDMMYYYY(fromDate);
      let finalToDate = formatToDDMMYYYY(toDate);

      if (!finalFromDate || !finalToDate) {
        const today = moment().format("DD-MM-YYYY");
        finalFromDate = today;
        finalToDate = today;
      }

      const url = new URL(`${BASE_URL}/V1/enquiry/listEnquiry`);

      const params = {
        from: finalFromDate,
        to: finalToDate,
        location: currentLocation,
      };
      console.log(params);

      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key]),
      );

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data.data)) {
        setEnquiries(data.data);
        setFilteredEnquiries(data.data);
      } else {
        Toast.fire({
          icon: "error",
          title: "Failed to load enquiries",
        });
        console.error(
          "Error fetching enquiries:",
          data.message || "Unknown error",
        );
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to load enquiries",
      });
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, currentLocation]);

  useEffect(() => {
    if (currentLocation !== "default") {
      fetchEnquiriesData();
    }
  }, [fetchEnquiriesData, currentLocation]);

  const handleGlobalSearchChange = (e) => {
    setFilters1({
      global: {
        value: e.target.value,
        matchMode: FilterMatchMode.CONTAINS,
      },
    });
  };

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
            <InputGroup>
              <Form.Control
                type="search"
                value={filters1.global.value || ""}
                onChange={handleGlobalSearchChange}
                placeholder="Global Search"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
                  transition: "all 0.3s ease",
                }}
              />
            </InputGroup>
          </Form.Group>
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
              onChange={setFromDate}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
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
              onChange={setToDate}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
              minDate={fromDate}
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>

          <Button
            variant="primary"
            onClick={fetchEnquiriesData}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "6px",
              padding: "6px 7px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "15px",
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={13} className="me-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );

  const header = renderHeader();

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <PageBreadcrumb pagename="Enquiry List" />
      <NavBarA pagename={`Enquiry List (${currentLocation.toUpperCase()})`} />

      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1.5px solid #00bcd4",
                  margin: "-6px",
                }}
              >
                <Card.Body style={{ marginTop: "-6px" }}>
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
                      value={filteredEnquiries}
                      paginator
                      rows={rows}
                      first={first}
                      onPage={(e) => {
                        setFirst(e.first);
                        setRows(e.rows);
                      }}
                      header={header}
                      filters={filters1}
                      globalFilterFields={[
                        "date",
                        "patient_name",
                        "patient_phone",
                      ]}
                      responsiveLayout="scroll"
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      className="p-datatable-customers datatable-compact-style datatable-medium-small"
                      rowClassName={(rowData, { rowIndex }) => ({
                        style: {
                          backgroundColor:
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white",
                          transition: "background-color 0.3s ease",
                        },
                        onMouseOver: (e) => {
                          e.currentTarget.style.backgroundColor = "#b2ebf2";
                        },
                        onMouseOut: (e) => {
                          e.currentTarget.style.backgroundColor =
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white";
                        },
                      })}
                    >
                      <Column
                        field="srNo"
                        header="Sr No"
                        body={(rowData, { rowIndex }) => rowIndex + 1}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          width: "60px",
                        }}
                      />
                      <Column
                        field="date"
                        header="Date"
                        body={(rowData) =>
                          moment(rowData.date).format("DD-MM-YYYY")
                        }
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          width: "90px",
                        }}
                      />
                      <Column
                        field="patient_phone"
                        header="Contact No"
                        body={(rowData) => rowData.patient_phone || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          width: "90px",
                        }}
                      />
                      <Column
                        field="patient_name"
                        header="Patient Name"
                        body={(rowData) => rowData.patient_name || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          width: "180px",
                          wordBreak: "break-word",
                        }}
                      />
                      <Column
                        field="patient_location"
                        header="Address"
                        body={(rowData) => rowData.patient_location || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          wordBreak: "break-all",
                          width: "180px",
                        }}
                      />
                      <Column
                        field="enquirytype"
                        header="Enquiry Type"
                        body={(rowData) => rowData.enquirytype || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          wordBreak: "break-word",
                          width: "150px",
                        }}
                      />
                      {/* <Column
                        field="doctorName"
                        header="Doctor Name"
                        body={(rowData) => rowData.doctorName || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          width: "150px",
                        }}
                      /> */}
                      <Column
                        field="FDE_Name"
                        header="FDE Name"
                        body={(rowData) => rowData.FDE_Name || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          width: "120px",
                          wordBreak: "break-word",
                        }}
                      />
                    </DataTable>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
