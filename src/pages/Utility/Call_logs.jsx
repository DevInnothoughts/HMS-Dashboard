import React, { useState, useEffect } from "react";
import moment from "moment";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import FeatherIcon from "feather-icons-react";
import { decodeJwt } from "../../utils/decode-jwt";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Modal,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css"; // Add this import at the top
import { toast } from "react-hot-toast";

export const BASE_URL = "http://localhost:5100/api"; // Update your API base URL here

export default function Call_logs() {
  const [CallLogs, setCallLogs] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: "",
    doctorName: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [doctors, setDoctors] = useState([]); // Doctors list
  const [fdeList, setFdeList] = useState([]); // FDE list
  const [enquiryTypes, setEnquiryTypes] = useState([]); // Store enquiry types
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [loading, setLoading] = useState(false); // Loading state
  const [showNoteModal, setShowNoteModal] = useState(false); // Modal state for showing note
  const [selectedNote, setSelectedNote] = useState(""); // Selected note content
  const [showEnquiryModal, setShowEnquiryModal] = useState(false); // Modal state for Enquiry
  const [selectedCallLog, setSelectedCallLog] = useState(null); // Selected call log for Enquiry
  const [timeSlots, setTimeSlots] = useState([]); // Add this state for time slots
  const [selectedDate, setSelectedDate] = useState(null); // Add this state for the modal
  const [enquiries, setEnquiries] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('default');
  
  function formatDate(date) {
    return new Date(date); // Return a Date object
  }

  const [fromDate, setFromDate] = useState(new Date()); // Initialize with Date object
  const [toDate, setToDate] = useState(new Date()); // Initialize with Date object

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
          const payload = decodeJwt(token);
          if (payload && payload.jobLocation) {
              setCurrentLocation(payload.jobLocation);
          }
      }
    }, []);
  

  const handleAddAppointmentClick = (rowData) => {
    const today = new Date();
    console.log("Opening Add Appointment Modal with details:", {
      date: formatDate(today),
      caller_no: rowData.caller_no,
      callTime: rowData.call_time,
      note: rowData.note,
    });

    setFormData({
      date: formatDate(today),
      doctor_id: "",
      doctorName: "",
      patientName: "",
      caller_no: rowData.caller_no || "",
      appointmentTime: rowData.call_time || "",
      FDE_Name: "",
      note: rowData.note || "",
    });
    setShowAddModal(true);
  };

  // State to handle the enquiry form fields
  const [enquiryForm, setEnquiryForm] = useState({
    call_date: "",
    enquirytype: "",
    patient_name: "",
    caller_no: "",
    FDE_Name: "",
    note: "",
  });
  // Function to format date to yyyy-MM-dd
  // const formatToApiDate = (date) => {
  //   if (!date) return "";
  //   const [day, month, year] = date.split("-");
  //   return `${year}-${month}-${day}`; // Return formatted date as yyyy-MM-dd
  // };

const formatToApiDate = (date) => {
  // Ensure the date is a valid Date object
  const validDate = date instanceof Date ? date : new Date(date);

  if (isNaN(validDate)) {
    console.error("Invalid date:", date);
    return null;
  }

  const day = String(validDate.getDate()).padStart(2, "0");
  const month = String(validDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = validDate.getFullYear();

  // CHANGE MADE HERE: Use hyphens instead of slashes
  return `${day}-${month}-${year}`;
};

  // Fetch the call logs data from API
  const fetchCallLogsData = async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/ivrdata/listIvrdata`);
      const params = {
        from: formatToApiDate(fromDate),
        to: formatToApiDate(toDate),
        location: currentLocation,
      };

      Object.keys(params).forEach((key) => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      console.log("Fetching data from:", url.toString());

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Prevent caching
      });

      const data = await response.json();
      console.log("Fetch Response:", data);

      if (response.ok && data.data) {
        setCallLogs(data.data);
      } else {
        console.error("Error in response:", data);
        toast.error(data.message || "Failed to fetch call logs");
      }
    } catch (error) {
      console.error("Error fetching call logs:", error);
      toast.error("Failed to load call logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch FDE list
      const fdeResponse = await fetch(
        `${BASE_URL}/V1/appointment/fdeDropdown`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch doctors list - Fix the endpoint
      const doctorResponse = await fetch(
        `${BASE_URL}/V1/appointment/doctorDropdown`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (fdeResponse.ok) {
        const fdeData = await fdeResponse.json();
        setFdeList(fdeData.data || []);
      }

      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        setDoctors(doctorData.data || []); // Set doctors state instead of enquiryTypes
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  useEffect(() => {
    fetchCallLogsData();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    console.log("Doctors State Updated:", doctors); // Log state updates
  }, [doctors]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // Add logging for doctor selection
    if (name === "doctor_id") {
      const selectedDoctor = doctors.find((doc) => doc.doctor_id === value);
      console.log("Doctor Selection Changed:", {
        selectedID: value,
        doctorName: selectedDoctor ? selectedDoctor.name : "No doctor selected",
        allDoctors: doctors,
      });

      // Update both doctor_id and doctorName in formData
      setFormData((prev) => ({
        ...prev,
        doctor_id: value,
        doctorName: selectedDoctor ? selectedDoctor.name : "",
      }));
      return; // Return early since we've handled the state update
    }

    // Existing FDE logging
    if (name === "FDE_Name") {
      const selectedFDE = fdeList.find((fde) => fde.FDEID === value);
      console.log("FDE Selection Changed:", {
        selectedID: value,
        selectedFDE: selectedFDE,
        FDEName: selectedFDE ? selectedFDE.FDEName : "No FDE selected",
      });

      // Update both FDE_Name and fdeName in formData
      setFormData((prev) => ({
        ...prev,
        FDE_Name: value,
        fdeName: selectedFDE ? selectedFDE.FDEName : "",
      }));
      return; // Return early since we've handled the state update
    }

    // Handle all other form fields
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Handle Add Appointment Submission
  const handleAddAppointment = (e) => {
    e.preventDefault();
    console.log("Submitting Appointment:", formData);

    // Add API call or logic to process the appointment data
    setShowAddModal(false); // Close the modal after submission
  };
  // Enquiry form input change handler
  const handleEnquiryInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // Existing FDE logging
    if (name === "FDE_Name") {
      const selectedFDE = fdeList.find((fde) => fde.FDEID === value);
      console.log("FDE Selection Changed:", {
        selectedID: value,
        selectedFDE: selectedFDE,
        FDEName: selectedFDE ? selectedFDE.FDEName : "No FDE selected",
      });

      // Update both FDE_Name and fdeName in formData
      setEnquiryForm((prev) => ({
        ...prev,
        FDE_Name: value,
        fdeName: selectedFDE ? selectedFDE.FDEName : "",
      }));
      return; // Return early since we've handled the state update
    }

    setEnquiryForm({
      ...enquiryForm,
      [name]: newValue,
    });
  };

  const handleEnquirySubmit = async () => {
    // Get the selected FDE's name
    const selectedFDE = fdeList.find(
      (fde) => fde.FDEID === enquiryForm.FDE_Name
    );
    const fdeName = selectedFDE ? selectedFDE.FDEName : "Not selected";

    // Get the selected doctor's name
    const selectedDoctor = doctors.find(
      (doc) => doc.doctor_id === formData.doctor_id
    );
    const doctorName = selectedDoctor ? selectedDoctor.name : "Not selected";

    // Log the enquiry details
    console.log("Adding New Enquiry:", {
      enquiryDetails: {
        date: enquiryForm.date,
        enquiryType: enquiryForm.enquirytype,
        patientName: enquiryForm.patient_name,
        mobileNumber: selectedCallLog?.caller_no,
        FDE_Name: {
          id: enquiryForm.fdeId,
          name: enquiryForm.FDE_Name,
        },
        doctorName: {
          id: formData.doctor_id,
          name: doctorName,
        },
        note: enquiryForm.note,
      },
    });

    try {
      const response = await fetch(`${BASE_URL}/V1/enquiry/addEnquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: enquiryForm.date,
          time: enquiryForm.time,
          fde_id: enquiryForm.FDE_Name,
          enquirytype: enquiryForm.enquirytype,
          patient_name: enquiryForm.patient_name,
          patient_phone: enquiryForm.caller_no,
          FDE_Name: enquiryForm.FDE_Name,
          note: enquiryForm.note,
        }),
      });

      const responseData = await response.json();
      console.log("Server Response:", responseData);

      if (response.ok) {
        toast.success("Enquiry added successfully");
        setShowEnquiryModal(false);
        fetchEnquiries();
        // Reset form
        setEnquiryForm({
          date: "",
          time: "",
          FDE_Name: "",
          enquirytype: "",
          patient_name: "",
          caller_no: "",
          note: "",
        });
      } else {
        toast.error("Failed to add enquiry");
      }
    } catch (error) {
      console.error("Error adding enquiry:", error);
      toast.error("Error adding enquiry");
    }
  };

  // Enquiry modal handler
  const handleEnquiryClick = (callLog) => {
    console.log("Opening Enquiry Modal with details:", {
      callLogId: callLog.ivr_id,
      caller_no: callLog.caller_no,
      date: formatDate(new Date()),
      note: callLog.note,
    });

    const today = new Date();
    setSelectedCallLog(callLog);
    setSelectedDate(today);
    setEnquiryForm((prev) => ({
      ...prev,
      date: formatDate(today),
      caller_no: callLog.caller_no || "",
      note: callLog.note || "",
    }));
    setShowEnquiryModal(true);
  };

  // Handle showing the note
  const handleNoteClick = (note, rowData) => {
    console.log("Opening note modal with call log:", rowData);
    setSelectedCallLog(rowData);
    setFormData((prev) => ({
      ...prev,
      note: note || "",
    }));
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!selectedCallLog || !selectedCallLog.ivr_id) {
      toast.error("Error: IVR ID is missing.");
      return;
    }

    if (!formData.note || formData.note.trim() === "") {
      toast.error("Error: Note cannot be empty.");
      return;
    }

    try {
      const payload = {
        ivr_id: selectedCallLog.ivr_id,
        note: formData.note.trim(),
      };

      console.log("Sending Request to API:", payload);

      const response = await fetch(
        `${BASE_URL}/V1/ivrdata/editNote/${selectedCallLog.ivr_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();
      console.log("Server Response:", responseData);

      // Check if the update was successful
      if (response.ok && responseData.statusCode === 200) {
        // Update the CallLogs state with the new note
        setCallLogs((prevLogs) =>
          prevLogs.map((log) =>
            log.ivr_id === selectedCallLog.ivr_id
              ? { ...log, note: formData.note.trim() } // Update the note for the specific log
              : log
          )
        );

        // Close the modal and show a success message
        setShowNoteModal(false);
        toast.success("Note updated successfully");
      } else {
        toast.error(responseData.data?.message || "Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("An error occurred while updating the note");
    }
  };
  // Actions template for the DataTable
  const actionBodyTemplate = (rowData) => (
    <div className="cart-action" style={{ display: "flex", gap: "5px" }}>
      {" "}
      {/* Reduced gap */}
      <Button
        variant="btn"
        onClick={() => handleAddAppointmentClick(rowData)} // Pass rowData here
        className="appointment-btn"
        title="Add Appointment" // Tooltip text on hover
        style={{
          width: "35px", // Set a fixed size for consistent button sizes
          height: "35px", // Set a fixed size for consistent button sizes
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%", // Circular shape
          padding: "0", // Remove padding to keep the size uniform
        }}
      >
        <FeatherIcon icon="plus-square" className="w-18" />
      </Button>
      {/* Enquiry Button */}
      <Button
        variant="btn"
        onClick={() => handleEnquiryClick(rowData)}
        className="enquiry-btn"
        title="Enquiry" // Tooltip text on hover
        style={{
          width: "35px", // Set a fixed size for consistent button sizes
          height: "35px", // Set a fixed size for consistent button sizes
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%", // Circular shape
          padding: "0", // Remove padding to keep the size uniform
        }}
      >
        <FeatherIcon icon="message-circle" className="w-18" />
      </Button>
      <Button
        variant="btn"
        onClick={() => handleNoteClick(rowData.note, rowData)}
        className="note-btn"
        title="View Notes" // Tooltip text on hover
        style={{
          width: "35px", // Set a fixed size for consistent button sizes
          height: "35px", // Set a fixed size for consistent button sizes
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%", // Circular shape
          padding: "0", // Remove padding to keep the size uniform
        }}
      >
        <FeatherIcon icon="file-text" className="w-18" />
      </Button>
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        border: "2px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "12px",
        padding: "15px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Global Search Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <Form.Group
            style={{
              display: "flex",
              alignItems: "center",
              margin: 0,
            }}
          >
            <InputGroup>
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
                  borderRadius: "8px",
                  border: "2px solid #4dd0e1",
                  padding: "8px 12px",
                  width: "250px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                }}
              />
            </InputGroup>
          </Form.Group>
        </div>

        {/* Date Picker Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            border: "2px solid #4dd0e1",
            borderRadius: "12px",
            padding: "15px",
            backgroundColor: "#f5fcfd",
          }}
        >
          <div
            style={{
              margin: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "5px",
              }}
            >
              From Date
            </div>
            <DatePicker
              selected={fromDate} // Pass the Date object directly
              onChange={(date) => {
                setFromDate(date); // Set the Date object directly
                console.log("From Date Selected:", date);
              }}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
              maxDate={new Date()}
              customInput={
                <Form.Control
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #4dd0e1",
                    padding: "8px 12px",
                    width: "160px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                  }}
                />
              }
            />
            {/* <DatePicker
              selected={fromDate ? new Date(fromDate) : null}
              onChange={(date) => {
                const formattedDate = date
                  ? date.toISOString().split("T")[0]
                  : "";
                setFromDate(formattedDate);
                console.log("From Date Selected:", formattedDate);
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select from date"
              maxDate={new Date()}
              customInput={
                <Form.Control
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #4dd0e1",
                    padding: "8px 12px",
                    width: "160px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                  }}
                />
              }
              popperClassName="custom-popper"
              popperPlacement="bottom-start"
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [0, 8],
                  },
                },
              ]}
            /> */}
          </div>

          <div
            style={{
              margin: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "5px",
              }}
            >
              To Date
            </div>
            <DatePicker
              selected={toDate ? new Date(toDate) : null}
              onChange={(date) => {
                const formattedDate = date
                  ? date.toISOString().split("T")[0]
                  : "";
                setToDate(formattedDate);
                console.log("To Date Selected:", formattedDate);
              }}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
              minDate={fromDate ? new Date(fromDate) : null}
              customInput={
                <Form.Control
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #4dd0e1",
                    padding: "8px 12px",
                    width: "160px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                  }}
                />
              }
              popperClassName="custom-popper"
              popperPlacement="bottom-start"
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [0, 8],
                  },
                },
              ]}
            />
          </div>

          <Button
            variant="primary"
            onClick={() => fetchCallLogsData(true)}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "20px",
              ":hover": {
                backgroundColor: "#00acc1",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );

  const handleDateChange = (date) => {
    handleInputChange({
      target: {
        name: "date",
        value: moment(date).format("DD-MM-YYYY"), // Ensures correct format
      },
    });

    // Regenerate time slots when the date changes
    setTimeSlots(generateTimeSlots());
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(23, 45, 0);

    // Check if the selected date is today
    const isToday = formData.date === new Date().toISOString().split("T")[0];

    if (isToday) {
      startTime.setHours(
        new Date().getHours(),
        Math.ceil(new Date().getMinutes() / 15) * 15,
        0
      );
    } else {
      startTime.setHours(7, 0, 0);
    }

    while (startTime <= endTime) {
      const timeString = startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      slots.push(timeString);
      startTime.setMinutes(startTime.getMinutes() + 15);
    }

    return slots;
  };

  // Use useEffect to generate initial time slots
  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, [formData.date]); // Regenerate when date changes

  const handleSubmit = async (saveType) => {
    // Get the selected FDE's name from the fdeList
    const selectedFDE = fdeList.find((fde) => fde.FDEID === formData.FDE_Name);
    const fdeName = selectedFDE ? selectedFDE.FDEName : "";

    // Get the selected doctor's name from the doctors list
    const selectedDoctor = doctors.find(
      (doc) => doc.doctor_id === formData.doctor_id
    );
    const doctorName = selectedDoctor ? selectedDoctor.name : "";

    // Log the exact fields that match the backend
    console.log("Submitting Appointment Details:", {
      FDE_Name: formData.FDE_Name,
      fdeId: formData.fdeId || null, // Send null if empty
      appointmentTime: formData.appointmentTime,
      patient_phone: formData.caller_no,
      date: moment(formData.date).format("DD-MM-YYYY"),
      doctorName: formData.doctorName,
      doctor_id: formData.doctor_id,
      note: formData.note,
      patientName: formData.patientName,
    });

    const payload = {
      FDE_Name: formData.FDE_Name,
      fdeId: formData.fdeId || null, // Send null if empty
      appointmentTime: formData.appointmentTime,
      patient_phone: formData.caller_no,
      date: moment(formData.date).format("DD-MM-YYYY"), // Converts to "DD-MM-YYYY"
      doctorName: formData.doctorName,
      doctor_id: formData.doctor_id,
      note: formData.note,
      patientName: formData.patientName,
    };

    try {
      console.log("Sending request to backend...", payload);

      const response = await fetch(
        `${BASE_URL}/V1/appointment/addAppointment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      // Handle the response as needed
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("Appointment added successfully:", responseData);
      toast.success("Appointment booked successfully");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding appointment:", error.message);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnquirySubmit = async () => {
    // Ensure required fields are present
    if (
      !formData.date ||
      !formData.patient_name ||
      !formData.patient_phone ||
      !formData.enquirytype
    ) {
      alert(
        "Please fill in all required fields: Date, Patient Name, Contact Number, Enquiry Type."
      );
      return;
    }

    // Format the payload correctly
    const payload = {
      date: moment(formData.date).format("DD-MM-YYYY"), // Converts to "DD-MM-YYYY"
      doctor_id: formData.doctor_id || null, // Send null if empty
      patient_name: formData.patient_name,
      patient_phone: formData.patient_phone,
      enquirytype: formData.enquirytype,
      fdeId: formData.fdeId || null, // Send null if empty
      FDE_Name: formData.FDE_Name || null, // Send null if empty
      note: formData.note || "",
    };

    try {
      console.log(
        "🚀 Sending Enquiry Request:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch(`${BASE_URL}/V1/enquiry/addEnquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          `Error: ${response.status} - ${responseData.message || "Bad Request"}`
        );
      }

      console.log("✅ Enquiry Added Successfully:", responseData);
      alert("Enquiry added successfully!");

      // Clear form and refresh data
      setFormData({
        date: "",
        doctor_id: "",
        patient_name: "",
        patient_phone: "",
        enquirytype: "",
        FDE_Name: "",
        fdeId: "",
        note: "",
      });

      setShowEnquiryModal(false);
    } catch (error) {
      console.error("❌ Error adding enquiry:", error.message);
      alert(`Failed to add enquiry: ${error.message}`);
    }
  };

  useEffect(() => {
    console.log("FDE List:", fdeList);
    console.log("Enquiry Types:", enquiryTypes);
    console.log("Form Data:", formData);
  }, [fdeList, enquiryTypes, formData]);

  // Update the handleAddEnquiryClick function
  const handleAddEnquiryClick = () => {
    const today = new Date();
    setFormData((prev) => ({
      ...prev,
      date: today.toISOString().split("T")[0], // Set today's date in YYYY-MM-DD format
      time: today.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }));
    setSelectedDate(today); // For the DatePicker component
    setShowAddModal(true);
  };

  const fetchEnquiries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/V1/enquiry/listEnquiry`);
      if (response.ok) {
        const data = await response.json();
        setEnquiries(data.data || []);
      } else {
        console.error("Failed to fetch enquiries");
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  return (
    <>
      <div
        className="themebody-wrap"
        style={{
          backgroundColor: "#e0f7fa",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        {/* Breadcrumb Start */}
        <PageBreadcrumb pagename="Call List" />
        {/* Breadcrumb End */}
        {/* theme body start */}
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
                    border: "4px solid #00bcd4",
                  }}
                >
                  <Card.Body>
                    <Row className="Product_list">
                      <DataTable
                        value={CallLogs}
                        paginator
                        rows={10}
                        filters={filters1}
                        header={renderHeader}
                        loading={loading}
                        globalFilterFields={[
                          "ivr_id",
                          "call_date",
                          "caller_no",
                          "destination_no",
                          "call_time",
                          "call_type",
                          "call_status",
                          "call_duration",
                          "circle_name",
                          "status",
                          "note",
                          "source",
                        ]}
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                        responsiveLayout="scroll"
                        className="p-datatable-customers"
                        style={{
                          border: "1px solid #4dd0e1",
                          marginTop: "20px",
                          width: "100%",
                          background: "white",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <Column
                          field="ivr_id"
                          header="Sr No."
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_date"
                          header="Date"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="caller_no"
                          header="Phone No."
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="destination_no"
                          header="Destination Number"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_time"
                          header="Call Time"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_type"
                          header="Type"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_status"
                          header="Raw Type"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="call_duration"
                          header="Duration"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="circle_name"
                          header="Region"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="status"
                          header="Status"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="note"
                          header="Note"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          field="source"
                          header="Source"
                          sortable
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                        <Column
                          header="Actions"
                          body={actionBodyTemplate}
                          exportable={false}
                          style={{
                            border: "1px solid #90caf9",
                            textAlign: "center",
                            padding: "0.75rem",
                          }}
                        />
                      </DataTable>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
        {/* theme body end */}
      </div>

      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddAppointment}>
            <Row>
              {/* Date */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <DatePicker
                    selected={
                      formData.date ? new Date(formData.date) : new Date()
                    }
                    onChange={(date) => {
                      if (date) {
                        handleDateChange(date);
                      } else {
                        console.error("Invalid date selected");
                      }
                    }}
                    className="form-control"
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select Date"
                    minDate={new Date()}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>Doctor Name</Form.Label>
                  <Form.Select
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a Doctor</option>
                    {doctors && doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <option key={doctor.doctor_id} value={doctor.name}>
                          {doctor.doctor_id} - {doctor.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No doctors available</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="patientName"
                    placeholder="Patient Name"
                    value={formData.patientName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="caller_no"
                    placeholder="Mobile Number"
                    value={formData.caller_no}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Update both fields in formData
                      handleInputChange({
                        target: {
                          name: "caller_no",
                          value: value,
                        },
                      });
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Appointment Time</Form.Label>
                  <Form.Select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
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
              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>FDE Name</Form.Label>
                  <Form.Select
                    name="FDE_Name"
                    value={formData.FDE_Name}
                    onChange={handleInputChange}
                  >
                    <option value="">Select FDE Name</option>
                    {fdeList &&
                      fdeList.length > 0 &&
                      fdeList.map((fde) => (
                        <option key={fde.FDEID} value={fde.FDEName}>
                          {fde.FDEID} - {fde.FDEName}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={15}>
                <Form.Group className="mb-20">
                  <Form.Label>Note</Form.Label>
                  <Form.Control
                    type="text"
                    name="note"
                    placeholder="Note"
                    value={formData.note}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <div className="d-flex justify-content-center">
                <Col className="text-end">
                  <button
                    type="button"
                    className="btn btn-primary me-2"
                    onClick={() => handleSubmit("save")}
                  >
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        date: "",
                        doctor_id: "",
                        name: "",
                        phone: "",
                        appointmentTime: "",
                        FDE_Name: "",
                        fdeId: "",
                        note: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </Col>
              </div>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Modal for displaying note */}
      <Modal
        show={showNoteModal}
        onHide={() => setShowNoteModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Replace the static note display with an editable input field */}
          <Form.Control
            as="textarea"
            rows={5}
            name="note"
            value={formData.note || ""}
            onChange={handleInputChange}
            placeholder="Enter note"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleSaveNote} // Ensure this is correctly calling the function
          >
            Save
          </Button>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Enquiry */}
      <Modal
        show={showEnquiryModal}
        onHide={() => setShowEnquiryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Enquiry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Display Enquiry form or details */}
          <div>
            <p>Enquiry for Call Log ID: {selectedCallLog?.ivr_id}</p>
            {/* Enquiry Form */}
            <Form onSubmit={handleEnquirySubmit}>
              <br />
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Call Back Date</Form.Label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setEnquiryForm((prev) => ({
                          ...prev,
                          date: formatDate(date),
                        }));
                      }}
                      dateFormat="dd-MM-yyyy"
                      className="form-control"
                      placeholderText="Select date"
                      value={enquiryForm.date}
                      minDate={new Date()} // Optional: if you want to prevent past dates
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  {/* Enquiry Type */}
                  <Form.Group className="mb-3">
                    <Form.Label>Enquiry Type</Form.Label>
                    <Form.Select
                      name="enquirytype"
                      value={enquiryForm.enquirytype}
                      onChange={handleEnquiryInputChange}
                      required
                    >
                      <option value="">Select Enquiry Type</option>
                      {[
                        "Call for Refund Amount",
                        "Wrong Enquiry or Spam Call",
                        "Enquiry for Test Charges",
                        "Accounts Department",
                        "Call for Another Branches",
                        "Call for IPD Doctors",
                        "Call for Assistant Doctors",
                        "Call Regarding Job Vacancy",
                        "Appointment Consultation",
                        "Online Consultation",
                        "SX Cost Enquiry",
                        "Call for Lab Test Enquiry",
                        "Medicines Availability at Pharmacy",
                        "Patient is Coming Late for Appointment",
                        "Insurance Related Queries",
                      ].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Patient Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="patient_name"
                      value={enquiryForm.patient_name}
                      onChange={handleEnquiryInputChange}
                      placeholder="Enter Patient Name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-20">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="caller_no"
                      placeholder="Mobile Number"
                      value={selectedCallLog?.caller_no}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-20">
                    <Form.Label>FDE Name</Form.Label>
                    <Form.Select
                      name="FDE_Name"
                      value={enquiryForm.FDE_Name}
                      onChange={handleEnquiryInputChange}
                    >
                      <option value="">Select FDE Name</option>
                      {fdeList &&
                        fdeList.length > 0 &&
                        fdeList.map((fde) => (
                          <option key={fde.FDEID} value={fde.FDEName}>
                            {fde.FDEID} - {fde.FDEName}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Add Note</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="note"
                      value={formData.note}
                      onChange={handleEnquiryInputChange}
                      rows={3}
                      placeholder="Enter Note"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-center">
                <Col className="text-end">
                  <button
                    type="button"
                    className="btn btn-primary me-2"
                    onClick={handleEnquirySubmit}
                  >
                    Add Enquiry
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setShowEnquiryModal(false);
                      setEnquiryForm({
                        date: "",
                        enquirytype: "",
                        patient_name: "",
                        caller_no: "",
                        FDE_Name: "",
                        fdeId: "",
                        note: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </Col>
              </div>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </>
  );
}
