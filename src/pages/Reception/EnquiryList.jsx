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
  Modal,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { Link, useNavigate } from "react-router-dom";
import AppointmentNavbar from "../../components/Navbar/AppointmentNavbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css";
import { FilterMatchMode } from "primereact/api";
import moment from "moment";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = "http://194.195.117.79:5100/api";

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

export default function EnquiryList({ isTab = false }) {
  const [currentLocation, setCurrentLocation] = useState("default");
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDbSearching, setIsDbSearching] = useState(false);
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [fromDate, setFromDate] = useState(moment().startOf("day").toDate());
  const [toDate, setToDate] = useState(moment().endOf("day").toDate());
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [statusFilter, setStatusFilter] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [noPendingAppt, setNoPendingAppt] = useState(true);
  const [showEditEnquiryModal, setShowEditEnquiryModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editEnquiryStatus, setEditEnquiryStatus] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [treatmentList, setTreatmentList] = useState([]);
  const [appointmentFormData, setAppointmentFormData] = useState({
    date: new Date(),
    doctor_id: "",
    doctorName: "",
    name: "",
    phone: "",
    appointmentTime: "",
    FDE_Name: "",
    note: "",
    patient_type: "",
    treatment: "",
    patient_id: "",
  });

  const generateTimeSlots = () => {
    const slots = [];
    let start = moment("07:00", "HH:mm");
    const end = moment("23:45", "HH:mm");

    while (start <= end) {
      slots.push(start.format("hh:mm A"));
      start.add(15, "minutes");
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const fetchDropdownData = useCallback(async () => {
    if (!currentLocation || currentLocation === "default") return;

    try {
      const doctorResponse = await fetch(
        `${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        setDoctors(Array.isArray(doctorData.data) ? doctorData.data : []);
      }

      const fdeResponse = await fetch(
        `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (fdeResponse.ok) {
        const fdeData = await fdeResponse.json();
        setFdeList(Array.isArray(fdeData.data) ? fdeData.data : []);
      }

      const treatmentResponse = await fetch(
        `${BASE_URL}/V1/appointment/treatmentDropdown?location=${currentLocation}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (treatmentResponse.ok) {
        const treatmentData = await treatmentResponse.json();
        setTreatmentList(Array.isArray(treatmentData.data) ? treatmentData.data : []);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const handleAddAppointmentClick = async (enquiry) => {
    const phone = enquiry.patient_phone || "";
    const name = enquiry.patient_name || "";
    setNoPendingAppt(true);

    // Set initial form data
    setAppointmentFormData({
      date: new Date(),
      doctor_id: enquiry.doctor_id || "",
      doctorName: enquiry.doctor_name || "",
      name: name,
      phone: phone,
      appointmentTime: "",
      FDE_Name: "",
      note: enquiry.calling_notes || "",
      patient_type: "New", // Default to New
      treatment: "",
      patient_id: "",
    });

    let hasPendingAppt = false;
    try {
      const confirmUrl = `${BASE_URL}/V1/appointment/getPatientByApptConfirm?patient_phone=${phone}&location=${currentLocation}`;
      const confirmResponse = await fetch(confirmUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (confirmResponse.status === 400) {
        Swal.fire({
          icon: "warning",
          title: "Pending Appointment Exists for This Patient",
          html: `
         <div style="font-family: inherit;">
                    <p style="margin-bottom: 4px; font-weight: bold; font-size:14px; color: #e67e22; text-align:center !important;">How to check?</p>
                    <p style="margin: 0; line-height: 1.5; font-size:13px !important; text-align:center !important;">
                    Go to <strong>Appointment List</strong> &rarr; Search by <strong>Contact Number</strong> in <strong>Global Search</strong> &rarr; If found, <strong>Delete or Edit</strong> the pending appointment.
                    </p>
                  </div>
          `,
          confirmButtonColor: "#f39c12",
        });
        setNoPendingAppt(false);
        hasPendingAppt = true;
      } else {
        setNoPendingAppt(true);
      }
    } catch (innerError) {
      console.error("Error in confirmation check API call:", innerError);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/getPatientByMobile?patient_phone=${phone}&location=${currentLocation}`,
      );
      const result = await response.json();

      if (response.ok && result.data) {
        if (!hasPendingAppt) {
          Swal.fire({
            icon: "warning",
            title: "Patient Found",
            text: `${result.data.name} is already registered.`,
            confirmButtonColor: "#00bcd4",
            timer: 2000,
          });
        }

        // Patient exists
        setAppointmentFormData((prev) => ({
          ...prev,
          patient_type: "", // Default to Select Type (empty string) for existing patients
          patient_id: result.data.patient_id,
        }));
      } else {
        // Patient doesn't exist
        setAppointmentFormData((prev) => ({
          ...prev,
          patient_id: "",
          patient_type: "New",
          treatment: "",
        }));
      }
    } catch (error) {
      console.error("Error checking patient existence:", error);
    }

    setShowAddModal(true);
  };

  const handleEditEnquiryClick = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setEditEnquiryStatus(enquiry.enquiry_status || "");
    setShowEditEnquiryModal(true);
  };

  const handleSubmitEditEnquiry = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/V1/enquiry/updateEnquiryStatus?location=${currentLocation}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enquiry_id: selectedEnquiry.enquiry_id,
            status: editEnquiryStatus,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update enquiry status");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Enquiry status updated successfully",
        timer: 2000,
      });

      setShowEditEnquiryModal(false);
      fetchEnquiriesData();
    } catch (error) {
      console.error("Error updating enquiry status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update enquiry status",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedDate = moment(appointmentFormData.date).format("YYYY-MM-DD");
    const selectedDoctor = doctors.find(
      (doc) => doc.doctor_id === appointmentFormData.doctor_id,
    );
    const doctorName = selectedDoctor
      ? selectedDoctor.name
      : appointmentFormData.doctorName;

    const payload = {
      appointment_timestamp: formattedDate,
      doctor_id: appointmentFormData.doctor_id,
      doctorName: doctorName,
      patientName: appointmentFormData.name,
      patient_phone: appointmentFormData.phone,
      patient_id: appointmentFormData.patient_id,
      patient_type:
        appointmentFormData.patient_type === "Post Operative"
          ? "Postoperative"
          : appointmentFormData.patient_type,
      appointment_time: appointmentFormData.appointmentTime
        ? moment(appointmentFormData.appointmentTime, ["hh:mm A", "HH:mm"]).format("HH:mm")
        : "",
      treatment_name: appointmentFormData.treatment,
      FDE_Name: appointmentFormData.FDE_Name,
      note: appointmentFormData.note,
      phone: appointmentFormData.phone,
    };

    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/addAppointment?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to add appointment");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Appointment added successfully",
        timer: 2000,
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding appointment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add appointment",
      });
    } finally {
      setLoading(false);
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex align-items-center justify-content-center gap-2">
        <Button
          variant="primary"
          onClick={() => handleAddAppointmentClick(rowData)}
          className="appointment-btn btn-primary btn-extra-small btn-icon text-white"
          title="Add Appointment"
          style={{
            backgroundColor: "#00bcd4",
            borderColor: "#00bcd4",
            padding: "5px",
            borderRadius: "6px",
          }}
        >
          <FeatherIcon icon="plus-square" size={16} />
        </Button>
      </div>
    );
  };

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

  const searchFromDatabase = async (query) => {
    if (!currentLocation || currentLocation === "default" || isDbSearching)
      return;

    setIsDbSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/enquiry/searchEnquiry?query=${encodeURIComponent(
          query,
        )}&location=${currentLocation}`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setEnquiries((prev) => {
            const existingIds = new Set(prev.map((e) => e.enquiry_id));
            const newUniqueEnquiries = data.data.filter(
              (e) => !existingIds.has(e.enquiry_id),
            );
            return [...prev, ...newUniqueEnquiries];
          });
          setFilteredEnquiries((prev) => {
            const existingIds = new Set(prev.map((e) => e.enquiry_id));
            const newUniqueEnquiries = data.data.filter(
              (e) => !existingIds.has(e.enquiry_id),
            );
            return [...prev, ...newUniqueEnquiries];
          });
        }
      }
    } catch (error) {
      console.error("Error searching enquiries from database:", error);
    } finally {
      setIsDbSearching(false);
    }
  };

  useEffect(() => {
    const searchValue = filters1.global.value;
    if (!searchValue || searchValue.length < 3) return;

    const hasLocalMatches = enquiries.some((e) => {
      const lowerSearch = searchValue.toLowerCase();
      return (
        (e.patient_name &&
          e.patient_name.toLowerCase().includes(lowerSearch)) ||
        (e.patient_phone && String(e.patient_phone).includes(searchValue))
      );
    });

    if (!hasLocalMatches) {
      const delayDebounceFn = setTimeout(() => {
        searchFromDatabase(searchValue);
      }, 800);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [filters1.global.value, enquiries]);

  useEffect(() => {
    if (currentLocation !== "default") {
      fetchEnquiriesData();
    }
  }, [fetchEnquiriesData, currentLocation]);

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    const updatedFilters = {
      ...filters1,
    };

    if (value) {
      updatedFilters.enquiry_status = {
        value,
        matchMode: FilterMatchMode.EQUALS,
      };
    } else {
      delete updatedFilters.enquiry_status;
    }

    setStatusFilter(value);
    setFilters1(updatedFilters);
  };

  const renderStatusHeader = () => (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <span style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
        Enquiry Status
      </span>
      <Form.Select
        size="sm"
        value={statusFilter}
        onChange={handleStatusFilterChange}
        style={{
          width: "120px",
          fontSize: "12px",
          padding: "4px 6px",
          borderRadius: "6px",
          border: "1px solid #90caf9",
        }}
      >
        <option value="">All</option>
        <option value="Visited">Visited</option>
        <option value="Not Visited">Not Visited</option>
        <option value="Surgery Done">Surgery Done</option>
      </Form.Select>
    </div>
  );

  const handleGlobalSearchChange = (e) => {
    setFilters1({
      global: {
        value: e.target.value,
        matchMode: FilterMatchMode.CONTAINS,
      },
    });
  };

  const exportToExcel = () => {
    let dataToExport = filteredEnquiries;

    if (statusFilter) {
      dataToExport = dataToExport.filter((item) => {
        const status = item.dynamic_status || item.enquiry_status;
        return status === statusFilter;
      });
    }

    const globalSearch = filters1?.global?.value;
    if (globalSearch && globalSearch.trim() !== "") {
      const searchLower = globalSearch.toLowerCase().trim();
      dataToExport = dataToExport.filter((item) => {
        const dateStr = item.date ? moment(item.date).format("DD-MM-YYYY") : "";
        const name = (item.patient_name || "").toLowerCase();
        const phone = String(item.patient_phone || "").toLowerCase();
        const docName = (item.doctorName || "").toLowerCase();
        const note = (item.note || "").toLowerCase();
        return (
          dateStr.includes(searchLower) ||
          name.includes(searchLower) ||
          phone.includes(searchLower) ||
          docName.includes(searchLower) ||
          note.includes(searchLower)
        );
      });
    }

    const excelData = dataToExport.map((item, index) => ({
      "Sr No": index + 1,
      Date: item.date ? moment(item.date).format("DD-MM-YYYY") : "",
      "Contact No": item.patient_phone || "",
      "Patient Name": item.patient_name || "",
      Address: item.patient_location || "",
      "Enquiry Type": item.enquirytype || "",
      "Doctor Name": item.doctorName || "",
      "FDE Name": item.FDE_Name || "",
      Note: item.note || "",
      "Enquiry Status": item.dynamic_status || item.enquiry_status || "",
    }));

    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });

    const formattedFromDate = fromDate ? moment(fromDate).format("DD-MM-YYYY") : "";
    const formattedToDate = toDate ? moment(toDate).format("DD-MM-YYYY") : "";
    const fileName = `Enquiry_List_${formattedFromDate}_to_${formattedToDate}${fileExtension}`;

    saveAs(data, fileName);
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
            <InputGroup style={{ position: "relative" }}>
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
              {isDbSearching && (
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                >
                  <Spinner
                    animation="border"
                    size="sm"
                    variant="info"
                    style={{ width: "12px", height: "12px" }}
                  />
                </div>
              )}
            </InputGroup>
          </Form.Group>
          <Button
            variant="outline-success"
            onClick={exportToExcel}
            style={{
              backgroundColor: "#28a745",
              border: "none",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              height: "26px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              whiteSpace: "nowrap",
            }}
          >
            <FeatherIcon icon="download" size={13} />
            Download Excel
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
              setStatusFilter("");
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

  return (
    <div
      className={isTab ? "" : "themebody-wrap"}
      style={
        isTab
          ? { fontFamily: "'Poppins', Arial, sans-serif" }
          : {
            background: "linear-gradient(to right, #e0f7fa, #80deea)",
            fontFamily: "'Poppins', Arial, sans-serif",
            minHeight: "100vh",
            padding: "10px",
          }
      }
    >
      {!isTab && <PageBreadcrumb pagename="Enquiry List" />}
      {!isTab && (
        <AppointmentNavbar pagename={`Enquiry List (${currentLocation.toUpperCase()})`} />
      )}

      <div className={isTab ? "" : "theme-body"}>
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
                        "doctorName",
                        "note",
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
                      <Column
                        field="doctorName"
                        header="Doctor Name"
                        body={(rowData) => rowData.doctorName || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          width: "150px",
                          wordBreak: "break-word",
                        }}
                      />
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
                      <Column
                        field="note"
                        header="Note"
                        body={(rowData) => rowData.note || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          width: "180px",
                          wordBreak: "break-word",
                        }}
                      />
                      <Column
                        field="enquiry_status"
                        header={renderStatusHeader}
                        body={(rowData) => {
                          const status =
                            rowData.dynamic_status || rowData.enquiry_status;
                          if (!status) return "-";

                          let badgeBg = "#ffe0b2";
                          let badgeColor = "#e65100";
                          if (status === "Visited") {
                            badgeBg = "#e0f2f1";
                            badgeColor = "#004d40";
                          } else if (status === "Surgery Done") {
                            badgeBg = "#e8f5e9";
                            badgeColor = "#1b5e20";
                          } else if (status === "Not Visited") {
                            badgeBg = "#efebe9";
                            badgeColor = "#4e342e";
                          }

                          return (
                            <span
                              style={{
                                backgroundColor: badgeBg,
                                color: badgeColor,
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "600",
                                display: "inline-block",
                              }}
                            >
                              {status}
                            </span>
                          );
                        }}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          width: "120px",
                        }}
                      />
                      <Column
                        header="Action"
                        body={actionBodyTemplate}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
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

      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
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
            <FeatherIcon icon="plus-circle" className="me-2" size={18} />
            Add Appointment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: "#f8fbfc",
            padding: "5px",
          }}
        >
          <Form onSubmit={handleSubmitAppointment}>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Appointment Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <DatePicker
                    selected={appointmentFormData.date}
                    onChange={(date) =>
                      setAppointmentFormData({ ...appointmentFormData, date })
                    }
                    dateFormat="dd-MM-yyyy"
                    className="form-control form-control-sm"
                    customInput={
                      <Form.Control
                        size="sm"
                        style={{
                          border: "2px solid rgb(77, 208, 225)",
                          fontSize: "12px",
                          borderRadius: "10px",
                        }}
                      />
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Appointment Time <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={appointmentFormData.appointmentTime}
                    onChange={(e) =>
                      setAppointmentFormData({
                        ...appointmentFormData,
                        appointmentTime: e.target.value,
                      })
                    }
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                    required
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-15">
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Patient Type <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={appointmentFormData.patient_type}
                    onChange={(e) =>
                      setAppointmentFormData({
                        ...appointmentFormData,
                        patient_type: e.target.value,
                      })
                    }
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                    required
                  >
                    <option value="">Select Type</option>
                    {appointmentFormData.patient_id ? (
                      <>
                        <option value="Followup">Followup</option>
                        <option value="Post Operative">Post Operative</option>
                        <option value="MCDPA">MCDPA</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <option value="New">New</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              {(appointmentFormData.patient_type === "Other" || appointmentFormData.treatment) && (
                <Col md={6} className="mb-10">
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Treatment <span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      value={appointmentFormData.treatment}
                      onChange={(e) =>
                        setAppointmentFormData({
                          ...appointmentFormData,
                          treatment: e.target.value,
                        })
                      }
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      required
                    >
                      <option value="">Select Treatment</option>
                      {treatmentList.map((t) => (
                        <option key={t.treatment_name} value={t.treatment_name}>
                          {t.treatment_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              <Col md={6} className={(appointmentFormData.patient_type === "Other" || appointmentFormData.treatment) ? "mt-3" : ""}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Patient Name <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={appointmentFormData.name}
                    onChange={(e) =>
                      setAppointmentFormData({
                        ...appointmentFormData,
                        name: e.target.value,
                      })
                    }
                    readOnly={!!appointmentFormData.patient_id}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "11px",
                      borderRadius: "10px",
                      cursor: appointmentFormData.patient_id ? "not-allowed" : "default",
                      backgroundColor: appointmentFormData.patient_id ? "#e7ebebff" : undefined,
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-15">
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Contact Number <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={appointmentFormData.phone}
                    readOnly
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "11px",
                      borderRadius: "10px",
                      backgroundColor: "#e7ebebff",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Doctor Name <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={appointmentFormData.doctor_id}
                    onChange={(e) =>
                      setAppointmentFormData({
                        ...appointmentFormData,
                        doctor_id: e.target.value,
                      })
                    }
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                    required
                  >
                    <option value="">Select a Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctor_id} value={doctor.doctor_id}>
                        {doctor.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-15">
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    FDE Name <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={appointmentFormData.FDE_Name}
                    onChange={(e) =>
                      setAppointmentFormData({
                        ...appointmentFormData,
                        FDE_Name: e.target.value,
                      })
                    }
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                    required
                  >
                    <option value="">Select FDE Name</option>
                    {fdeList.map((fde) => (
                      <option key={fde.FDEID} value={fde.FDEID}>
                        {fde.FDEName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Note
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    as="textarea"
                    rows={2}
                    value={appointmentFormData.note}
                    onChange={(e) =>
                      setAppointmentFormData({
                        ...appointmentFormData,
                        note: e.target.value,
                      })
                    }
                    placeholder="Enter Note"
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end pt-3">
              <Button
                variant="secondary"
                className="me-2 px-4"
                onClick={() => setShowAddModal(false)}
                style={{ borderRadius: "10px", fontSize: "12px" }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !noPendingAppt}
                className="px-4"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  borderColor: "#00bcd4",
                }}
              >
                Add Appointment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showEditEnquiryModal}
        onHide={() => setShowEditEnquiryModal(false)}
        size="md"
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
            <FeatherIcon icon="edit" className="me-2" size={18} />
            Edit Enquiry Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: "#f8fbfc",
            padding: "10px",
          }}
        >
          <Form onSubmit={handleSubmitEditEnquiry}>
            <Form.Group className="mb-4">
              <Form.Label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                Enquiry Status <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Select
                size="sm"
                value={editEnquiryStatus}
                onChange={(e) => setEditEnquiryStatus(e.target.value)}
                style={{
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "13px",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  height: "40px",
                }}
                required
              >
                <option value="">Select Status</option>
                <option value="Visited">Visited</option>
                <option value="Not Visited">Not Visited</option>
                <option value="Surgery Done">Surgery Done</option>
              </Form.Select>
            </Form.Group>

            <div
              className="d-flex justify-content-end pt-2"
              style={{ marginTop: "15px" }}
            >
              <Button
                variant="secondary"
                className="me-2 px-4"
                onClick={() => setShowEditEnquiryModal(false)}
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  height: "35px",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="px-4"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  borderColor: "#00bcd4",
                  height: "35px",
                }}
              >
                {loading ? "Saving..." : "Confirm & Save"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
