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
import PageBreadcrumb from "../components/PageBreadcrumb";
import NavbarBedAllotment from "../components/NavbarBedAllotment";
import MuiDateTimePicker from "./IPD Forms/inputs/MuiDateTimePicker";

const BASE_URL = "http://194.195.117.79:5100/api";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const BedAllotment = () => {
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [bedAllotments, setBedAllotments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAllotment, setSelectedAllotment] = useState(null);
  const [modalAdmissionDate, setModalAdmissionDate] = useState("");
  const [modalDischargeDate, setModalDischargeDate] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const bedOptions = [
    { value: "W1", label: "W1 - General Ward" },
    { value: "W2", label: "W2 - Semi AC" },
    { value: "I1", label: "I1 - Private AC" },
    { value: "SEMI 1", label: "SEMI 1 - DELUXE" },
    { value: "SEMIZ", label: "SEMIZ - Twin Sharing" },
    { value: "SEMI3", label: "SEMI3 - Super Deluxe" },
    { value: "SEMI4", label: "SEMI4 - Suite" },
  ];

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

  const handleEdit = (allotment) => {
    setSelectedAllotment(allotment);
    setModalAdmissionDate(allotment.allotment_datetime || "");
    setModalDischargeDate(allotment.discharge_datetime || "");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setBedAllotments(bedAllotments.filter((item) => item.id !== id));
      Toast.fire({
        icon: "success",
        title: "Bed allotment deleted successfully",
      });
    }
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
          <Button
            variant="primary"
            onClick={() => {}}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "6px 7px",
              fontSize: "12px",
              marginTop: "18px",
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />
            Refresh
          </Button>
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
            <NavbarBedAllotment />
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
                    header="#"
                    headerClassName="datatable-header-center"
                    body={(rowData, options) => options.rowIndex + 1}
                    style={{ width: "50px", border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    field="bed_number"
                    header="Bed number"
                    headerClassName="datatable-header-center"
                    style={{ border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    field="bed_type"
                    header="Bed type"
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
                    field="allotment_datetime"
                    header="Allotment Date & Time"
                    headerClassName="datatable-header-center"
                    style={{ border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    field="discharge_datetime"
                    header="Discharge Date & Time"
                    headerClassName="datatable-header-center"
                    style={{ border: "1px solid #4dd0e1" }}
                  />
                  <Column
                    header="Action"
                    headerClassName="datatable-header-center"
                    style={{ width: "120px", border: "1px solid #4dd0e1" }}
                    body={(rowData) => (
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
                          onClick={() => handleEdit(rowData)}
                        >
                          <FeatherIcon icon="edit" size="15" />
                        </Button>
                        <Button
                          style={{
                            borderRadius: "8px",
                            padding: "7px 11px",
                            fontSize: "14px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          variant="danger"
                          onClick={() => handleDelete(rowData.id)}
                        >
                          <FeatherIcon icon="trash" size="15" />
                        </Button>
                      </div>
                    )}
                  />
                </DataTable>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }}
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          >
            <FeatherIcon icon="edit" className="me-2" size="16" />
            Edit Bed Allotment Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: "#f8fbfc",
            fontSize: "13px",
            padding: "5px",
          }}
        >
          <Form>
            <div className="mb-4">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Bed Number
                    </Form.Label>
                    <Form.Select
                      defaultValue={selectedAllotment?.bed_number}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select Bed</option>
                      {bedOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Bed Type
                    </Form.Label>
                    <Form.Control
                      type="text"
                      defaultValue={selectedAllotment?.bed_type}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Patient Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      defaultValue={selectedAllotment?.patient_name}
                      readOnly
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        backgroundColor: "#e7ebebff",
                        cursor: "not-allowed",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <MuiDateTimePicker
                    label="Allotment Date & Time"
                    value={modalAdmissionDate}
                    onChange={(e) => setModalAdmissionDate(e.target.value)}
                    name="allotment_datetime"
                    type="datetime"
                    required={true}
                    placeholder="Select Allotment Date & Time"
                    style={{ marginBottom: "0px" }}
                    labelStyle={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                    inputSx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        height: "35px",
                        "& fieldset": {
                          borderWidth: "2px !important",
                          borderColor: "rgb(77, 208, 225) !important",
                        },
                      },
                      "& .MuiInputBase-input": {
                        padding: "5px 10px !important",
                        fontSize: "12px !important",
                      },
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <MuiDateTimePicker
                    label="Discharge Date & Time"
                    value={modalDischargeDate}
                    onChange={(e) => setModalDischargeDate(e.target.value)}
                    name="discharge_datetime"
                    type="datetime"
                    required={true}
                    placeholder="Select Discharge Date & Time"
                    style={{ marginBottom: "0px" }}
                    labelStyle={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                    inputSx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        height: "35px",
                        "& fieldset": {
                          borderWidth: "2px !important",
                          borderColor: "rgb(77, 208, 225) !important",
                        },
                      },
                      "& .MuiInputBase-input": {
                        padding: "5px 10px !important",
                        fontSize: "12px !important",
                      },
                    }}
                  />
                </Col>
              </Row>
            </div>
            <div className="d-flex justify-content-end pt-2">
              <Button
                size="sm"
                variant="danger"
                className="me-2 px-4"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  padding: "10px",
                }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="px-4"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  borderColor: "#00bcd4",
                  padding: "10px",
                }}
                onClick={() => setShowModal(false)}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BedAllotment;
