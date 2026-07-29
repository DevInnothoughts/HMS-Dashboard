import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Card,
  Modal,
  Form,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import FeatherIcon from "feather-icons-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import MuiDateTimePicker from "../Utility/inputs/MuiDateTimePicker";

const BASE_URL = "http://194.195.117.79:5100/api";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const BedAllotmentList = () => {
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [bedAllotments, setBedAllotments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Show under development alert
  useEffect(() => {
    Swal.fire({
      title: "Information",
      text: "This feature is under development",
      icon: "info",
      confirmButtonColor: "#00bcd4",
    });
    setBedAllotments([]); // Ensure it's empty as requested
  }, []);



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
              onChange={(e) => setRows(parseInt(e.target.value))}
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
                value={filters.global.value || ""}
                onChange={(e) =>
                  setFilters({
                    global: {
                      value: e.target.value,
                      matchMode: FilterMatchMode.CONTAINS,
                    },
                  })
                }
                placeholder="Search..."
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
              onChange={(date) => setFromDate(date)}
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
              onChange={(date) => setToDate(date)}
              dateFormat="dd-MM-yyyy"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

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
      <PageBreadcrumb pagename="Bed Allotment List" />
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "1px solid #00bcd4",
                margin: "5px",
              }}
            >
              <Card.Body style={{ margin: "4px" }}>
                {renderHeader()}
                <DataTable
                  value={bedAllotments}
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
                  filters={filters}
                  paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                  responsiveLayout="scroll"
                  className="custom-datatable-centered datatable-medium-small"
                >
                  <Column
                    header="Sr No"
                    headerClassName="datatable-header-center"
                    body={(rowData, options) => options.rowIndex + 1}
                    style={{ width: "80px", border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    field="bed_number"
                    header="Bed number"
                    headerClassName="datatable-header-center"
                    style={{ border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    field="roomcategory"
                    header="Room Category"
                    headerClassName="datatable-header-center"
                    style={{ border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    field="patient_name"
                    header="Patient name"
                    headerClassName="datatable-header-center"
                    style={{ border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    field="contact_number"
                    header="Contact number"
                    headerClassName="datatable-header-center"
                    body={(rowData) => rowData.contact_number || rowData.contact || rowData.phone || rowData.patient_phone || "-"}
                    style={{ border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    field="admission_datetime"
                    header="Admission Date & Time"
                    headerClassName="datatable-header-center"
                    style={{ border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    field="discharge_datetime"
                    header="Discharge Date & Time"
                    headerClassName="datatable-header-center"
                    style={{ border: "1px solid #4dd0e1" }}
                  />

                </DataTable>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>


    </div>
  );
};

export default BedAllotmentList;
