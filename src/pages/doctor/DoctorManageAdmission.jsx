import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Spinner,
  Modal
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import MuiDateTimePicker from "../IPD Forms/inputs/MuiDateTimePicker";
import moment from "moment";

const BASE_URL = "http://194.195.117.79:5100/api";

export default function DoctorManageAdmission() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDbSearching, setIsDbSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");

  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Initialize Location from JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const formatToApiDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [reschedulePatient, setReschedulePatient] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelPatient, setCancelPatient] = useState(null);

  const [showDocModal, setShowDocModal] = useState(false);
  const [docPatient, setDocPatient] = useState(null);
  const [documents, setDocuments] = useState({
    aadharCard: null,
    panCard: null,
    cancelledCheque: null,
    pdcCheque: null
  });
  const [previews, setPreviews] = useState({
    aadharCard: null,
    panCard: null,
    cancelledCheque: null,
    pdcCheque: null
  });
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const fetchVerifiedPatients = useCallback(async () => {
    if (currentLocation === "default") return;

    setLoading(true);
    try {
      const from = fromDate ? formatToApiDate(fromDate) : "";
      const to = toDate ? formatToApiDate(toDate) : "";
      const search = searchTerm || "";
      const response = await fetch(
        `${BASE_URL}/V1/doctor/manage-admission/list?location=${currentLocation}&from=${from}&to=${to}&search=${search}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Doctor Manage Admission Result:", result);

        if (!Array.isArray(result)) {
          console.error("Expected array but got:", typeof result);
          return;
        }

        const sortedData = result.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        const formattedData = sortedData.map((p) => ({
          ...p,
          uhid: p.uid,
          name: p.name,
          contact: p.patient_phone,
          age: p.age,
          gender: p.sex,
          verifiedDate: p.admission_datetime || "NOT ADMITTED",
          surgeryDate: p.surgery_datetime || "Not Scheduled",
          roomType: p.room_type || "N/A",
          roomNo: p.room_no || "N/A",
          surgeonName: p.surgeon_name || "N/A",
          aadharcard: p.aadharcard || null,
          pancard: p.pancard || null,
          cancelled_cheque: p.cancelled_cheque || null,
          pdc_cheque: p.pdc_cheque || null,
          admissionNo:
            p.admission_no === 0 || p.admission_no === "0"
              ? null
              : p.admission_no,
          patient_id: p.patient_id,
          global_id: p.global_id,
        }));

        setPatients(formattedData);
      } else {
        console.error("Failed to fetch verified patients");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, fromDate, toDate, searchTerm]);

  const searchFromDatabase = async (query) => {
    if (!currentLocation || isDbSearching) return;

    setIsDbSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/manage-admission/search?query=${encodeURIComponent(
          query
        )}&location=${currentLocation}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result && result.length > 0) {
          const formattedNew = result.map((p) => ({
            ...p,
            uhid: p.uid,
            name: p.name,
            contact: p.patient_phone,
            age: p.age,
            gender: p.sex,
            verifiedDate: p.admission_datetime || "NOT ADMITTED",
            surgeryDate: p.surgery_datetime || "Not Scheduled",
            roomType: p.room_type || "N/A",
            roomNo: p.room_no || "N/A",
            surgeonName: p.surgeon_name || "N/A",
            aadharcard: p.aadharcard || null,
            pancard: p.pancard || null,
            cancelled_cheque: p.cancelled_cheque || null,
            pdc_cheque: p.pdc_cheque || null,
            admissionNo:
              p.admission_no === 0 || p.admission_no === "0"
                ? null
                : p.admission_no,
            patient_id: p.patient_id,
            global_id: p.global_id,
          }));

          setPatients((prev) => {
            const existingIds = new Set(prev.map((p) => String(p.uhid)));
            const uniqueNew = formattedNew.filter((p) => !existingIds.has(String(p.uhid)));
            return [...prev, ...uniqueNew];
          });
        }
      }
    } catch (error) {
      console.error("Error searching from database:", error);
    } finally {
      setIsDbSearching(false);
    }
  };

  useEffect(() => {
    const searchValue = searchTerm;
    if (!searchValue || searchValue.length < 3) return;

    const hasLocalMatches = patients.some((p) => {
      const lowerSearch = searchValue.toLowerCase();
      return (
        (p.uhid && p.uhid.toLowerCase().includes(lowerSearch)) ||
        (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
        (p.contact && p.contact.includes(searchValue)) ||
        (p.admissionNo && String(p.admissionNo).toLowerCase().includes(lowerSearch))
      );
    });

    if (!hasLocalMatches) {
      const delayDebounceFn = setTimeout(() => {
        searchFromDatabase(searchValue);
      }, 800);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, patients]);

  useEffect(() => {
    fetchVerifiedPatients();
  }, [fetchVerifiedPatients]);

  useEffect(() => {
    const autoSelectUhid = localStorage.getItem("autoSelectUhid");
    if (autoSelectUhid && patients.length > 0) {
      setSearchTerm(autoSelectUhid);
      setFilters1({
        global: {
          value: autoSelectUhid,
          matchMode: FilterMatchMode.CONTAINS,
        },
      });
      localStorage.removeItem("autoSelectUhid");
    }
  }, [patients]);

  const handleRescheduleClick = (patient) => {
    setReschedulePatient(patient);
    // Initialize with current date if available, otherwise null
    setRescheduleDate(patient.surgeryDate !== "Not Scheduled" ? patient.surgeryDate : null);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({ title: "Updating...", didOpen: () => Swal.showLoading() });
      const response = await fetch(
        `${BASE_URL}/V1/doctor/manage-admission/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            location: currentLocation,
            uidNo: reschedulePatient.uhid,
            rescheduleDate: rescheduleDate,
          }),
        },
      );

      if (response.ok) {
        Swal.fire("Success", "Surgery date rescheduled!", "success");
        setShowRescheduleModal(false);
        fetchVerifiedPatients();
      } else {
        const err = await response.json();
        throw new Error(err.message || "Failed to reschedule");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleCancelClick = (patient) => {
    setCancelPatient(patient);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      Swal.fire("Required", "Please provide a reason", "warning");
      return;
    }
    try {
      Swal.fire({ title: "Cancelling...", didOpen: () => Swal.showLoading() });
      const response = await fetch(
        `${BASE_URL}/V1/doctor/manage-admission/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            location: currentLocation,
            uhid: cancelPatient.uhid,
            contact: cancelPatient.contact,
            reason: cancelReason,
          }),
        },
      );

      if (response.ok) {
        Swal.fire("Cancelled!", "Admission entry has been removed.", "success");
        setShowCancelModal(false);
        fetchVerifiedPatients();
      } else {
        const err = await response.json();
        throw new Error(err.message || "Failed to cancel");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleConfirm = (contact, uhid) => {
    Swal.fire({
      title: "Confirm Admission?",
      text: "This will generate an official Admission Number.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#15ab56ff",
      cancelButtonColor: "#dc1818ff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${BASE_URL}/V1/doctor/manage-admission/confirm`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ contact, uhid, location: currentLocation }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            Swal.fire(
              "Confirmed!",
              `Admission No: ${data.data.admissionNo} generated.`,
              "success",
            );
            fetchVerifiedPatients();
          } else {
            const err = await response.json();
            throw new Error(err.message || "Failed to confirm");
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  const buildDocPreviewMap = (patient = {}) => ({
    aadharCard: patient.aadharcard || null,
    panCard: patient.pancard || null,
    cancelledCheque: patient.cancelled_cheque || null,
    pdcCheque: patient.pdc_cheque || null,
  });

  const handleViewDocumentsClick = (patient) => {
    setDocPatient(patient);
    setShowDocModal(true);
    setDocuments({
      aadharCard: null,
      panCard: null,
      cancelledCheque: null,
      pdcCheque: null
    });
    setPreviews(buildDocPreviewMap(patient));
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docType]: file
      }));
      // Generate preview
      const previewUrl = URL.createObjectURL(file);
      setPreviews(prev => ({
        ...prev,
        [docType]: previewUrl
      }));
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();

    if (!docPatient) {
      Swal.fire("Error", "No patient selected for document upload.", "error");
      return;
    }

    const requiredDocs = ["aadharCard", "panCard", "cancelledCheque"];
    const hasExistingDocs = requiredDocs.some((docType) => Boolean(previews[docType]));
    const hasNewFiles = requiredDocs.some((docType) => Boolean(documents[docType]));

    if (!hasExistingDocs && !hasNewFiles) {
      Swal.fire("Required", "Please upload Aadhar, PAN, and Cancelled Cheque documents.", "warning");
      return;
    }

    try {
      Swal.fire({ title: "Saving documents...", didOpen: () => Swal.showLoading() });

      const formData = new FormData();
      formData.append("location", currentLocation);
      formData.append("admissionId", String(docPatient.id));
      formData.append("uid", String(docPatient.uhid));
      formData.append("contact", String(docPatient.contact));

      requiredDocs.forEach((docType) => {
        if (documents[docType]) {
          formData.append(docType, documents[docType]);
        }
      });

      if (documents.pdcCheque) {
        formData.append("pdcCheque", documents.pdcCheque);
      }

      const response = await fetch(
        `${BASE_URL}/V1/doctor/manage-admission/documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to save documents");
      }

      const savedResponse = await response.json();
      const savedDocuments = savedResponse?.data || {};

      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === docPatient.id
            ? {
                ...patient,
                aadharcard: savedDocuments.aadharcard || patient.aadharcard,
                pancard: savedDocuments.pancard || patient.pancard,
                cancelled_cheque: savedDocuments.cancelled_cheque || patient.cancelled_cheque,
                pdc_cheque: savedDocuments.pdc_cheque || patient.pdc_cheque,
              }
            : patient,
        ),
      );

      setDocPatient((prev) =>
        prev
          ? {
              ...prev,
              aadharcard: savedDocuments.aadharcard || prev.aadharcard,
              pancard: savedDocuments.pancard || prev.pancard,
              cancelled_cheque: savedDocuments.cancelled_cheque || prev.cancelled_cheque,
              pdc_cheque: savedDocuments.pdc_cheque || prev.pdc_cheque,
            }
          : prev,
      );
      setPreviews(buildDocPreviewMap({
        ...docPatient,
        aadharcard: savedDocuments.aadharcard || docPatient.aadharcard,
        pancard: savedDocuments.pancard || docPatient.pancard,
        cancelled_cheque: savedDocuments.cancelled_cheque || docPatient.cancelled_cheque,
        pdc_cheque: savedDocuments.pdc_cheque || docPatient.pdc_cheque,
      }));

      Swal.fire("Saved!", "Documents were saved successfully.", "success");
      setShowDocModal(false);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
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
            style={{
              display: "flex",
              alignItems: "center",
              margin: 0,
            }}
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
            <InputGroup style={{ position: 'relative' }}>
              <Form.Control
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setFilters1({
                    global: {
                      value: e.target.value,
                      matchMode: FilterMatchMode.CONTAINS,
                    },
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchVerifiedPatients();
                  }
                }}
                placeholder="Search Name/UHID/Phone"
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
              {isDbSearching && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 5,
                  pointerEvents: 'none'
                }}>
                  <Spinner animation="border" size="sm" variant="info" style={{ width: '12px', height: '12px' }} />
                </div>
              )}
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
              placeholderText="Select from date"
              maxDate={new Date()}
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
            onClick={() => fetchVerifiedPatients()}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
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
            <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFromDate(null);
              setToDate(null);
              setSearchTerm("");
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

  const header = renderHeader();

  const formatDisplayDateTime = (dateTimeStr) => {
    if (!dateTimeStr || dateTimeStr === "Not Scheduled" || dateTimeStr === "NOT ADMITTED") return dateTimeStr;
    try {
      const parsed = moment(dateTimeStr, ["DD-MM-YYYY HH:mm", "DD-MM-YYYY hh:mm A", "YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A", "YYYY-MM-DDTHH:mm:ss.SSSZ"]);
      if (parsed.isValid()) {
        return parsed.format("DD-MM-YYYY HH:mm");
      }
      return dateTimeStr;
    } catch (e) {
      return dateTimeStr;
    }
  };

  const actionBodyTemplate = (patient) => {
    return (
      <div className="d-flex justify-content-center gap-1">
        {!patient.admissionNo ? (
          <>
            <Button
              variant="outline-primary"
              size="sm"
              title="Reschedule Surgery"
              onClick={() => handleRescheduleClick(patient)}
              style={{ borderRadius: "6px", padding: "5px 8px" }}
            >
              <FeatherIcon icon="calendar" size={16} />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              title="Cancel Surgery"
              onClick={() => handleCancelClick(patient)}
              style={{ borderRadius: "6px", padding: "5px 8px" }}
            >
              <FeatherIcon icon="trash-2" size={16} />
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              title="Confirm Admission"
              onClick={() => handleConfirm(patient.contact, patient.uhid)}
              style={{ borderRadius: "6px", padding: "5px 8px" }}
            >
              <FeatherIcon icon="check" size={16} />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="info"
              className="btn-info btn-extra-small btn-icon me-1"
              title="View Documents"
              onClick={() => handleViewDocumentsClick(patient)}
              style={{
                borderRadius: "6px",
                padding: "5px 8px",
                color: "white"
              }}
            >
              <FeatherIcon icon="file-text" size={16} />
            </Button>

          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "15px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Doctor Manage Admission" />

      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col>
              <Card
                style={{
                  borderRadius: "15px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                  border: "none",
                  background: "white",
                  overflow: "hidden",
                }}
              >
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="info" />
                      <p className="mt-2 text-muted">Loading data...</p>
                    </div>
                  ) : (
                    <DataTable
                      value={patients}
                      paginator
                      rows={rows}
                      first={first}
                      onPage={(e) => {
                        setFirst(e.first);
                        setRows(e.rows);
                      }}
                      filters={filters1}
                      header={header}
                      globalFilterFields={[
                        "uhid",
                        "name",
                        "contact",
                        "admissionNo",
                      ]}
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      responsiveLayout="scroll"
                      className="datatable-compact-style datatable-medium-small"
                      style={{ padding: "5px" }}
                    >
                      
                      <Column
                        field="verifiedDate"
                        header="Admission Date & Time"
                        headerClassName="datatable-header-center"
                        body={(rowData) => (
                          <span style={{ fontSize: "11px" }}>
                            {formatDisplayDateTime(rowData.verifiedDate)}
                          </span>
                        )}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "170px",
                        }}
                      />

                      <Column
                        field="surgeryDate"
                        header="Surgery Date & Time"
                        headerClassName="datatable-header-center"
                        body={(rowData) => (
                          <span style={{ fontSize: "11px" }}>
                            {formatDisplayDateTime(rowData.surgeryDate)}
                          </span>
                        )}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "160px",
                        }}
                      />

                      <Column
                        field="uhid"
                        header="UHID No"
                        headerClassName="datatable-header-center"
                        body={(rowData) => (
                          <span
                            className="fw-bold"
                            style={{ color: "#178aaeff" }}
                          >
                            {rowData.uhid}
                          </span>
                        )}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />

                      <Column
                        field="admissionNo"
                        header="Admission No"
                        headerClassName="datatable-header-center"
                        body={(rowData) => (
                          <span
                            className={
                              rowData.admissionNo ? "fw-bold" : "text-muted"
                            }
                            style={{
                              color: rowData.admissionNo
                                ? "#178aaeff"
                                : "inherit",
                            }}
                          >
                            {rowData.admissionNo || "N/A"}
                          </span>
                        )}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />

                      <Column
                        field="name"
                        header="Patient Name"
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "150px",
                        }}
                      />

                      <Column
                        field="contact"
                        header="Contact No"
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />

                      <Column
                        header="Age/Gender"
                        headerClassName="datatable-header-center"
                        body={(rowData) => `${rowData.age} yrs / ${rowData.gender}`}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "100px",
                        }}
                      />

                      <Column
                        field="roomType"
                        header="Room Type"
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />

                      <Column
                        field="roomNo"
                        header="Room No"
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "100px",
                        }}
                      />

                      <Column
                        field="surgeonName"
                        header="Surgeon Name"
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "150px",
                        }}
                      />

                      <Column
                        header="Actions"
                        headerClassName="datatable-header-center"
                        body={actionBodyTemplate}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "110px",
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

      {/* Reschedule Modal */}
      <Modal
        show={showRescheduleModal}
        onHide={() => setShowRescheduleModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#67c5cfff" }}>
          <Modal.Title style={{ color: "#1a5b61ff", fontSize: "1rem" }}>
            Reschedule Surgery
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRescheduleSubmit}>
          <Modal.Body>
            <Form.Group>
              <MuiDateTimePicker
                label="New Surgery Date & Time"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                required={true}
                type="datetime"
                ampm={false}
                labelStyle={{ color: "#1a5b61ff", fontSize: "13px" }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Reschedule</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#67c5cfff" }}>
          <Modal.Title style={{ color: "#1a5b61ff", fontSize: "1rem" }}>
            Cancel Admission
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCancelSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Reason for Cancellation</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowCancelModal(false)}>Back</Button>
            <Button variant="danger" type="submit">Cancel Admission</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Patients Documents Modal */}
      <Modal
        show={showDocModal}
        onHide={() => setShowDocModal(false)}
        centered
        size="lg"
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
            <FeatherIcon icon="file-text" className="me-2" size="18" />
            Patients Documents
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleDocSubmit}>
          <Modal.Body style={{ fontSize: "13px", padding: "10px" }}>
            {Object.values(previews).some(Boolean) && (
              <div className="mb-3">
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#00838f", marginBottom: "8px" }}>
                  Saved Documents
                </div>
                <Row>
                  {[
                    { key: "aadharCard", label: "Aadharcard" },
                    { key: "panCard", label: "Pan Card" },
                    { key: "cancelledCheque", label: "Cancelled Cheque" },
                    { key: "pdcCheque", label: "PDC Cheque" },
                  ].map((doc) =>
                    previews[doc.key] ? (
                      <Col md={3} key={doc.key} className="mb-2">
                        <div
                          style={{
                            border: "1px solid #4dd0e1",
                            borderRadius: "8px",
                            overflow: "hidden",
                            cursor: "pointer",
                            height: "90px",
                            backgroundColor: "#f8fdff",
                          }}
                          onClick={() => setFullScreenImage(previews[doc.key])}
                          title={`Click to preview ${doc.label}`}
                        >
                          <img
                            src={previews[doc.key]}
                            alt={`${doc.label} Preview`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div style={{ fontSize: "10px", textAlign: "center", marginTop: "4px", color: "#006064" }}>
                          {doc.label}
                        </div>
                      </Col>
                    ) : null,
                  )}
                </Row>
              </div>
            )}
            <Row>
              <Col md={6} className="mb-20">
                <Form.Group controlId="aadharCard">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    <FeatherIcon icon="credit-card" size={14} className="me-1" />
                    Aadharcard <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    size="sm"
                    onChange={(e) => handleFileChange(e, "aadharCard")}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                  {previews.aadharCard && (
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="mt-2"
                        style={{
                          border: "1px solid #4dd0e1",
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                          width: "60px",
                          height: "45px"
                        }}
                        onClick={() => setFullScreenImage(previews.aadharCard)}
                        title="Click to view full image"
                      >
                        <img src={previews.aadharCard} alt="Aadhar Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "red", marginTop: "10px" }}>
                        click to preview the image
                      </span>
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Group controlId="panCard">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    <FeatherIcon icon="credit-card" size={14} className="me-1" />
                    Pan Card <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    size="sm"
                    onChange={(e) => handleFileChange(e, "panCard")}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                  {previews.panCard && (
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="mt-2"
                        style={{
                          border: "1px solid #4dd0e1",
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                          width: "60px",
                          height: "45px"
                        }}
                        onClick={() => setFullScreenImage(previews.panCard)}
                        title="Click to view full image"
                      >
                        <img src={previews.panCard} alt="PAN Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "red", marginTop: "10px" }}>
                        click to preview the image
                      </span>
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Group controlId="cancelledCheque">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    <FeatherIcon icon="file-text" size={14} className="me-1" />
                    Cancelled Cheque <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    size="sm"
                    onChange={(e) => handleFileChange(e, "cancelledCheque")}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                  {previews.cancelledCheque && (
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="mt-2"
                        style={{
                          border: "1px solid #4dd0e1",
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                          width: "60px",
                          height: "45px"
                        }}
                        onClick={() => setFullScreenImage(previews.cancelledCheque)}
                        title="Click to view full image"
                      >
                        <img src={previews.cancelledCheque} alt="Cheque Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "red", marginTop: "10px" }}>
                        click to preview the image
                      </span>
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6} className="mb-2">
                <Form.Group controlId="pdcCheque">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    <FeatherIcon icon="calendar" size={14} className="me-1" />
                    PDC Cheque (Optional)
                  </Form.Label>
                  <Form.Control
                    type="file"
                    size="sm"
                    onChange={(e) => handleFileChange(e, "pdcCheque")}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                  {previews.pdcCheque && (
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="mt-2"
                        style={{
                          border: "1px solid #4dd0e1",
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                          width: "60px",
                          height: "45px"
                        }}
                        onClick={() => setFullScreenImage(previews.pdcCheque)}
                        title="Click to view full image"
                      >
                        <img src={previews.pdcCheque} alt="PDC Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "red", marginTop: "10px" }}>
                        click to preview the image
                      </span>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end pt-2">
              <Button
                variant="danger"
                size="sm"
                className="me-2 px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  padding: "10px",
                }}
                onClick={() => setShowDocModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  border: "none",
                  padding: "10px",
                }}
              >
                Save Documents
              </Button>
            </div>
          </Modal.Body>
        </Form>
      </Modal>

      {/* Full Screen Image Preview Modal */}
      <Modal
        show={!!fullScreenImage}
        onHide={() => setFullScreenImage(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ border: "none", backgroundColor: "#f8f9fa" }}>
          <Modal.Title style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-3" style={{ backgroundColor: "#fff" }}>
          {fullScreenImage && (
            <img
              src={fullScreenImage}
              alt="Full Preview"
              style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
