import React, { useState, useEffect } from "react";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import FeatherIcon from "feather-icons-react";
import { Link } from "react-router-dom";
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
import NavBarA from "../componets/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import logo from "../assets/images/3.png";
import labLogo from "../assets/images/1.png";
import pharmacyLogo from "../assets/images/2.png";
import receiptLogo from "../assets/images/4.png";
import moment from "moment";

const BASE_URL = "http://194.195.117.79:5000/api"; // Update your API base URL here

export default function Appointment_list() {
  const [appointments, setAppointments] = useState([]);
  const [appointment, setAppointmentdata] = useState([]); // Appointment data state
  const [doctors, setDoctors] = useState([]); // Doctors list
  const [fdeList, setFdeList] = useState([]); // FDE list
  const [consultationList, setConsultationList] = useState([]);
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [fromDate, setFromDate] = useState(new Date()); // Store as Date object
  const [toDate, setToDate] = useState(new Date()); // Store as Date object

  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]); // Add this state for time slots
  const [showReceiptView, setShowReceiptView] = useState(false);
  const [formData, setFormData] = useState({
    receipt_id: "",
    receipt_date: new Date().toISOString().split("T")[0],
    patient_id: "",
    appointment_id: "",
    doctor_id: "",
    consultationName: "",
    consultation: "",
    chargeCondition: "",
    comment: "",
    sprayqty: "",
    totalamt: "",
    discountnote: "",
    discountamt: "",
    paymentmode: "",
    otherdetails: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null); // State for storing the ID of the appointment to delete
  const [cancellationReason, setCancellationReason] = useState("");
  const [type, setType] = useState("");
  const typeList = ["NEW", "FOLLOW", "POSTOPERATIVE"];
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percentage"); // 'percentage' or 'amount'
  const [isDNC, setIsDNC] = useState(false);
  const [isDNW, setIsDNW] = useState(false);
  const [isDNP, setIsDNP] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");

  const handleAddReceipt = () => {
    // Validate required fields
    if (!formData.consultation || !formData.totalamt || !formData.paymentmode) {
      alert(
        "Please fill in all required fields (Consultation, Amount, and Payment Mode)"
      );
      return;
    }

    // Calculate discounted amount for this receipt
    const newReceipt = {
      ...formData,
      totalamt: Math.round(formData.totalamt), // Ensure integer value
      discountamt: Math.round(discount), // Ensure discount is integer
    };
    // Add to receipts array
    setReceipts([...receipts, newReceipt]);

    // Clear form for next entry
    setFormData({
      ...formData,
      consultation: "",
      totalamt: "",
      paymentmode: "",
      comment: "",
      sprayqty: "",
      discountnote: "",
      otherdetails: "",
    });
  };

  const handlePrintReceipt = () => {
    const receiptWindow = window.open("", "_blank", "width=800,height=800");
    const subtotal = parseFloat(formData.totalamt || 0);
    const finalAmount = calculateFinalAmount(subtotal, discount, discountType);

    // Convert images to base64 to ensure they load in the new window
    const getBase64Image = (imgUrl) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.src = imgUrl;
      });
    };

    // Load all images first
    Promise.all([
      getBase64Image(logo),
      getBase64Image(labLogo),
      getBase64Image(pharmacyLogo),
    ]).then(([mainLogo, labLogoBase64, pharmacyLogoBase64]) => {
      const receiptContent = `
          <html>
            <head>
              <title>Receipt - Healing Hands</title>
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
              <style>
                body, table, tr, td, p { 
                  font-size: 11px !important;
                  margin: 0;
                  padding: 0;
                }
                .bgdiv {
                  background: #2b9163;
                  padding: 15px;
                }
                .maindiv {
                  background: white;
                  border: 1px solid white;
                  border-radius: 15px;
                  padding: 10px;
                }
                .HHClogo {
                  width: 100%;
                  border-right: dotted;
                  border-color: #ccc;
                  padding-right: 20px;
                }
                .Lablogo {
                  width: 50%;
                }
                .Medicologo {
                  width: 50%;
                }
                .receipt {
                  width: 80%;
                  height: 380px;
                }
                .fa-phone {
                  padding: 3px 4px;
                  border: 1px solid grey;
                  border-radius: 50%;
                }
                @media print {
                  .bgdiv {
                    background-color: #2b9163 !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                }
              </style>
            </head>
            <body>
              <div class="bgdiv">
                <div class="maindiv">
                  <table width='100%' border='0'>
                    <tr>
                      <td style="width:30%;"><img src="${mainLogo}" class="HHClogo"></td>
                      <td style="width:15%;text-align:right;"><img src="${labLogoBase64}" class="Lablogo"></td>
                      <td style="width:15%;text-align:center;"><img src="${pharmacyLogoBase64}" class="Medicologo"></td>
                      <td style="width:40%;">
                        <table width='100%' border='0'>    
                          <tr>
                            <td>Receipt No. &nbsp;&nbsp;<b>${
                              formData.receipt_id
                            }</b></td>
                          </tr>
                        </table>
                        <br>
                        <table width='100%' border='0'>    
                          <tr>
                            <td>Date : &nbsp;&nbsp;<b>${
                              selectedAppointment?.date
                            }</b></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <br>
                  <table width='100%' border='0'>
                    <tr>
                      <td style="width:15%;"><img src="${receiptLogo}" class="receipt"></td>
                      <td style="width:85%;">
                        <table width='100%' border='0'>
                          <tr>
                            <td style="width:30%;line-height:40px;">Received From : </td>
                            <td><p style="border-bottom: dotted;border-color: #ccc;font-weight: 600;text-transform: uppercase;">${
                              selectedAppointment?.patientName
                            }</p></td>
                          </tr>
                        </table>
                        <table width='100%' border='0'>
                          <tr>
                            <td>
                              <div style="width:100%;display: inline-block;">
                                For <span style="font-weight:600;text-transform:uppercase;border-bottom: dotted;border-color: #ccc;">
                                  ${receipts
                                    .map((receipt) => receipt.consultation)
                                    .join(", ")}
                                </span>
                              </div>
                            </td>
                          </tr>
                        </table>
                        <table width='100%' border='0'>
                          <tr>
                            <td style="line-height:40px;">
                              <i class="fa fa-phone"></i>&nbsp;8888288884&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;020 - 26164488/99
                            </td>
                          </tr>
                        </table>
                        <table width='100%' border='0'>
                          <tr>
                            <td>
                              Email: info@healinghandsclinic.co.in
                              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                              Website: www.healinghandsclinic.co.in
                            </td>
                          </tr>
                        </table>
                        <br>
                        <table width='100%' border='0'>
                          <tbody>
                            <tr>
                              <td style="width:60%;vertical-align: top;">
                                Payment Mode: &nbsp;<b>${
                                  formData.paymentmode
                                }</b><br>
                                ${
                                  discount > 0
                                    ? `
                                  Subtotal: &nbsp;<b>Rs. ${subtotal.toFixed(
                                    2
                                  )}</b><br>
                                  Discount: &nbsp;<b>${
                                    discountType === "percentage"
                                      ? `${discount}% (Rs. ${(
                                          (subtotal * discount) /
                                          100
                                        ).toFixed(2)})`
                                      : `Rs. ${parseFloat(discount).toFixed(2)}`
                                  }</b><br>
                                `
                                    : ""
                                }
                                In Words: &nbsp;<b>${numberToWords(
                                  Math.round(finalAmount)
                                )}</b>
                              </td>
                              <td style="width:30%;">
                                <p style="padding:10px;border:1px solid grey;border-radius:10px;font-weight:600;">
                                  Rs.&nbsp;${finalAmount.toFixed(2)}/-
                                </p>
                              </td>
                              <td style="width:10%"></td>
                            </tr>
                          </tbody>
                        </table>
                        <table width='100%' border='0'>
                          <tr>
                            <td style="width:100%;" colspan="3">
                              <b>Next Appointment: </b>No appointment scheduled
                            </td>
                          </tr>
                          <tr>
                            <td style="width:60%;">
                              <b>Dhole Patil Road: </b><br>
                              Healing Hands Clinic Pvt Ltd<br>
                              DP Road, Ground Floor, Millenium Star Extension,<br>
                              Adjacent to Ruby Hall Clinic, Pune 411001
                            </td>
                            <td style="width:30%;vertical-align: bottom;">
                              <p style="border-top: 1px solid #000; text-align: center;">Signature</p>
                            </td>
                            <td style="width:10%"></td>
                          </tr>
                          <tr>
                            <td style="width:100%;" colspan="3">
                              <br><br>
                              <p>In case you have not received the correct receipt for the paid amount, or for any discrepancies in transaction please write us on 
                                <a href="mailto:info@healinghandsclinic.co.in">info@healinghandsclinic.co.in</a> 
                                or whatsapp on 
                                <a href="https://wa.me/+918888988882?text=Hello Doctor, I would like to know more about your treatments" target="_blank">+91 8888988882</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
  
                    <!-- Added Footer Section -->
        <div style="clear:both;color:#aaa; padding:20px;">
          <hr />
          <center>&copy;2025 <a target="_blank" href="http://www.innothoughts.com/" style="color:grey;">Innothoughts System Pvt. Ltd</a></center>
        </div>
            </body>
          </html>
        `;

      receiptWindow.document.write(receiptContent);
      receiptWindow.document.close();

      // Print after images have loaded
      setTimeout(() => {
        receiptWindow.print();
      }, 1000);
    });
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
      ); // Start from the next 15-minute slot
    } else {
      startTime.setHours(7, 0, 0); // Start from 7 AM for future dates
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

  const fetchAppointmentData = async () => {
    setLoading(true);
    try {
      if (!fromDate || !toDate) {
        alert("Error: From Date and To Date cannot be empty.");
        return;
      }

      // Convert Date object to `DD-MM-YYYY` format before sending to API
      const formattedFromDate = formatDateToDDMMYYYY(fromDate);
      const formattedToDate = formatDateToDDMMYYYY(toDate);

      console.log("Final API Dates:", formattedFromDate, formattedToDate);

      const url = `${BASE_URL}/V1/appointment/listAppointments?from=${formattedFromDate}&to=${formattedToDate}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Fetched Appointments:", data.data);
        setAppointmentdata(data.data);
      } else {
        console.error(
          "Error fetching appointments:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Error fetching appointments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateToDDMMYYYY = (date) => {
    if (!date) return "";

    // If `date` is already a Date object, format it
    if (date instanceof Date) {
      return moment(date).format("DD-MM-YYYY");
    }

    // If `date` is a string (DD-MM-YYYY), convert it to a Date object first
    if (typeof date === "string") {
      return moment(date, "DD-MM-YYYY").format("DD-MM-YYYY");
    }

    return ""; // Return empty if invalid input
  };

  const handleFromDateChange = (date) => {
    if (!date) return;
    setFromDate(date); // Store as Date object
    console.log("From Date Selected:", moment(date).format("DD-MM-YYYY"));
  };

  const handleToDateChange = (date) => {
    if (!date) return;
    setToDate(date); // Store as Date object
    console.log("To Date Selected:", moment(date).format("DD-MM-YYYY"));
  };

  useEffect(() => {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setFormData((prev) => ({
      ...prev,
      appointmentTime: currentTime,
    }));
  }, []);

  useEffect(() => {
    fetchAppointmentData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const consultationResponse = await fetch(
        `${BASE_URL}/V1/appointment/consultationDropdown`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (consultationResponse.ok) {
        const consultationData = await consultationResponse.json();
        console.log("Consultation API Response:", consultationData);
        setConsultationList(
          Array.isArray(consultationData.data) ? consultationData.data : []
        );
      } else {
        console.error(
          "Failed to fetch consultations:",
          consultationResponse.statusText
        );
      }

      const doctorResponse = await fetch(
        `${BASE_URL}/V1/appointment/doctorDropdown`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        console.log("Doctors API Response:", doctorData);
        setDoctors(Array.isArray(doctorData.data) ? doctorData.data : []);
      } else {
        console.error("Failed to fetch doctors:", doctorResponse.statusText);
      }

      const fdeResponse = await fetch(
        `${BASE_URL}/V1/appointment/fdeDropdown`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (fdeResponse.ok) {
        const fdeData = await fdeResponse.json();
        console.log("FDE API Response:", fdeData);
        setFdeList(Array.isArray(fdeData.data) ? fdeData.data : []);
      } else {
        console.error("Failed to fetch FDE list:", fdeResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Update the time slots when the date changes
  // const handleDateChange = (date) => {
  //   handleInputChange({
  //     target: {
  //       name: "date",
  //       value: date ? date.toISOString().split("T")[0] : "",
  //     },
  //   });
  //   // Regenerate time slots when the date changes
  //   setTimeSlots(generateTimeSlots());
  // };

  const handleDateChange = (date) => {
    if (!date || !selectedAppointment) return; // Ensure selectedAppointment is not null

    const formattedDate = date.toISOString().split("T")[0];

    // Avoid setting state if the value hasn't changed
    if (formattedDate !== selectedAppointment.date) {
      setSelectedAppointment((prev) => ({
        ...prev,
        date: formattedDate,
      }));
    }
  };

  useEffect(() => {
    if (!selectedAppointment || !selectedAppointment.appointment_timestamp)
      return; // Add null check

    setTimeSlots(generateTimeSlots());
  }, [selectedAppointment?.appointment_timestamp]); // Use optional chaining

  const actionBodyTemplate = (rowData) => {
    const [actionStage, setActionStage] = useState(1); // Start from Stage 1

    const [rowColors, setRowColors] = useState({}); // State for row colors

    const moveToPatientList = async (appointment) => {
      try {
        const response = await fetch(`${BASE_URL}/V1/patient/addPatient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName: appointment.patientName,
            patient_phone: appointment.patient_phone,
            doctorName: appointment.doctorName,
            appointmentDate: appointment.date,
            patient_location: appointment.patient_location,
          }),
        });

        if (response.ok) {
          alert("Appointment moved to patient list!");
        } else {
          const errorData = await response.json();
          alert(`Error moving appointment: ${errorData.message}`);
        }
      } catch (error) {
        alert("Network error: " + error.message);
      }
    };

    // Modify the Confirm Button to also move to the patient list
    const handleConfirmClick = async (appointment_id) => {
      if (!appointment_id) {
        console.error("Invalid appointment ID");
        return;
      }

      try {
        const confirmResponse = await fetch(
          `${BASE_URL}/V1/appointment/confirmAppointment/${appointment_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirmAppointment: 1 }),
          }
        );

        const confirmData = await confirmResponse.json();

        if (confirmResponse.ok) {
          const confirmTime = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          setAppointments((prevAppointments) =>
            prevAppointments.map((appointment) =>
              appointment.appointment_id === appointment_id
                ? { ...appointment, confirm_time: confirmTime }
                : appointment
            )
          );

          alert(`Appointment confirmed at ${confirmTime}`);
          fetchAppointmentData(); // Refresh the data
          setActionStage(2);
        } else {
          alert(`Failed to confirm the appointment: ${confirmData.message}`);
        }
      } catch (error) {
        alert("Error confirming appointment. Please try again.");
        console.error(error);
      }
    };

    const handleHistoryClick = async () => {
      const appointment_id = rowData.appointment_id;

      try {
        const historyResponse = await fetch(
          `${BASE_URL}/V1/appointment/updateHistoryChk/${appointment_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ historychk: 3 }),
          }
        );

        if (historyResponse.ok) {
          // const data = await historyResponse.json();
          setRowColors((prevColors) => ({
            ...prevColors,
            [appointment_id]: "orange",
          }));
          alert("History process completed!");
          fetchAppointmentData();
          setActionStage(3);
        } else {
          alert(
            `Failed to process history. Error: ${historyResponse.statusText}`
          );
        }
      } catch (error) {
        alert("An error occurred while processing history. Please try again.");
      }
    };

    const handleExecutionClick = async () => {
      const appointment_id = rowData.appointment_id;

      try {
        const executiveResponse = await fetch(
          `${BASE_URL}/V1/appointment/updateExecutionChk/${appointment_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ executivechk: 1 }),
          }
        );

        if (executiveResponse.ok) {
          // const data = await executiveResponse.json();
          setRowColors((prevColors) => ({
            ...prevColors,
            [appointment_id]: "yellow",
          }));
          alert("Execution process completed!");
          fetchAppointmentData();
          setActionStage(4);
        } else {
          alert(
            `Failed to process execution. Error: ${executiveResponse.statusText}`
          );
        }
      } catch (error) {
        alert(
          "An error occurred while processing execution. Please try again."
        );
      }
    };

    const handleConsultationClick = async () => {
      const appointment_id = rowData.appointment_id;

      try {
        const consultationResponse = await fetch(
          `${BASE_URL}/V1/appointment/updateConsultationChk/${appointment_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consultationchk: 2 }),
          }
        );

        if (consultationResponse.ok) {
          const data = await consultationResponse.json();
          setRowColors((prevColors) => ({
            ...prevColors,
            [appointment_id]: "purple",
          }));
          alert("Consultation process completed!");
          fetchAppointmentData();
          setActionStage(5);
        } else {
          alert(
            `Failed to process consultation. Error: ${consultationResponse.statusText}`
          );
        }
      } catch (error) {
        alert(
          "An error occurred while processing consultation. Please try again."
        );
      }
    };

    // const handleReceiptsClick = async () => {
    //   const appointment_id = rowData.appointment_id;

    //   try {
    //     const receiptsResponse = await fetch(
    //       `${BASE_URL}/V1/appointment/updateExecutionChkToFour/${appointment_id}`,
    //       {
    //         method: "PUT",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ executivechk: 4 }),
    //       }
    //     );

    //     if (receiptsResponse.ok) {
    //       const data = await receiptsResponse.json();
    //       setRowColors((prevColors) => ({
    //         ...prevColors,
    //         [appointment_id]: "green",
    //       }));
    //       alert(
    //         "Receipts process completed and execution status updated to 4!"
    //       );
    //       fetchAppointmentData();
    //       setActionStage(6);
    //     } else {
    //       alert(
    //         `Failed to process receipts. Error: ${receiptsResponse.statusText}`
    //       );
    //     }
    //   } catch (error) {
    //     alert("An error occurred while processing receipts. Please try again.");
    //   }
    // };
    const getProcessColor = (process) => {
      // 1. Destructure relevant properties from rowData
      const { ConfirmPatient, historychk, executivechk, consultationchk } =
        rowData;

      // 2. Convert numeric values to boolean flags for readability
      const isConfirmed = ConfirmPatient === 1;
      const hasHistory = historychk === 3;
      const hasExecution = executivechk === 1;
      const hasConsultation = consultationchk === 2;
      const hasReceipt = executivechk === 4;

      // 3. Color logic based on appointment status

      // Initial state - No processes completed
      if (!isConfirmed) {
        return "#fff"; // White - Initial state
      }

      // Only proceed if appointment is confirmed
      if (isConfirmed) {
        // Receipt completed
        if (hasReceipt) {
          return "#b2ff8e"; // Green - Receipt completed
        }

        // Consultation completed
        if (hasConsultation) {
          return "#ccb3f0"; // Purple - Consultation completed
        }

        // Execution completed
        if (hasExecution) {
          return "#faff61"; // Yellow - Execution completed
        }

        // History completed
        if (hasHistory) {
          return "#ff9861"; // Orange - History completed
        }
      }

      // Default fallback color
      return "#fff"; // White
    };

    return (
      <div
        className="cart-action"
        style={{
          backgroundColor: getProcessColor(), // backgroundColor: rowColors[rowData.appointment_id] || "", // Set background color dynamically
          margin: "5px",
          display: "flex",
          gap: "5px",
          border: "3px solid #ccc",
          padding: "10px",
          borderRadius: "8px",
          transition: "background-color 0.3s ease",
        }}
      >
        {/* Buttons */}
        <Link
          title="Edit"
          style={{
            width: "35px",
            height: "35px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
            padding: "0",
            border: "2px solid #ddd",
            margin: "2px",
            pointerEvents: rowData.ConfirmPatient === 1 ? "none" : "auto",
            opacity: rowData.ConfirmPatient === 1 ? 0.5 : 1,
          }}
          onClick={() => {
            setSelectedAppointment(rowData);
            setShowEditModal(true);
          }}
          disabled={rowData.ConfirmPatient === 1}
        >
          <FeatherIcon icon="edit" className="w-18" />
        </Link>

        <Link
          className="delete text-danger"
          title="Cancel"
          style={{
            width: "35px",
            height: "35px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
            padding: "0",
            border: "1px solid #ddd",
            margin: "2px",
            pointerEvents: rowData.ConfirmPatient === 1 ? "none" : "auto",
            opacity: rowData.ConfirmPatient === 1 ? 0.5 : 1,
          }}
          onClick={() => openDeleteModal(rowData.appointment_id)}
          disabled={rowData.ConfirmPatient === 1}
        >
          <FeatherIcon icon="trash-2" className="w-18" />
        </Link>

        <Link
          className="appointment"
          title="Confirm"
          style={{
            width: "35px",
            height: "35px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
            padding: "0",
            border: "1px solid #ddd",
            margin: "2px",
            pointerEvents: rowData.ConfirmPatient === 1 ? "none" : "auto",
            opacity: rowData.ConfirmPatient === 1 ? 0.5 : 1,
          }}
          onClick={() => handleConfirmClick(rowData.appointment_id)}
          disabled={rowData.ConfirmPatient === 1}
        >
          <FeatherIcon icon="check" className="w-18" />
        </Link>

        <Link
          className="history"
          title="History"
          style={{
            width: "35px",
            height: "35px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
            padding: "0",
            border: "1px solid #ddd",
            margin: "2px",
            pointerEvents:
              rowData.ConfirmPatient !== 1 || rowData.historychk === 3
                ? "none"
                : "auto", // Disable interaction when button is disabled
            opacity:
              rowData.ConfirmPatient === 1 && rowData.historychk !== 3
                ? 1
                : 0.5,
          }}
          onClick={() => handleHistoryClick()}
          disabled={rowData.ConfirmPatient !== 1 || rowData.historychk === 3}
        >
          <FeatherIcon icon="clock" className="w-18" />
        </Link>

        <Link
          className="appointment"
          title="Execution"
          style={{
            width: "35px",
            height: "35px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
            padding: "0",
            border: "1px solid #ddd",
            margin: "2px",
            pointerEvents:
              rowData.historychk !== 3 ||
              rowData.executivechk === 1 ||
              rowData.executivechk === 4
                ? "none"
                : "auto",
            opacity:
              rowData.historychk === 3 ||
              rowData.executivechk !== 4 ||
              rowData.executivechk !== 1
                ? 1
                : 0.5,
          }}
          onClick={handleExecutionClick}
          disabled={
            rowData.historychk !== 3 ||
            rowData.executivechk === 1 ||
            rowData.executivechk === 4
          }
        >
          <FeatherIcon icon="list" className="w-18" />
        </Link>

        <Link
          className="consultation"
          title="Consultation"
          style={{
            width: "35px",
            height: "35px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
            padding: "0",
            border: "1px solid #ddd",
            margin: "2px",
            pointerEvents:
              rowData.executivechk !== 1 || rowData.consultationchk === 2
                ? "none"
                : "auto",
            opacity:
              rowData.consultationchk !== 2 ||
              rowData.executivechk === 4 ||
              rowData.executivechk === 1
                ? 0.5
                : 1,
          }}
          onClick={handleConsultationClick}
          disabled={rowData.executivechk !== 1 || rowData.consultationchk === 2}
        >
          <FeatherIcon icon="user-check" className="w-18" />
        </Link>

        <Link
          className="receipts"
          title="Receipts"
          style={{
            width: "35px",
            height: "35px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
            padding: "0",
            border: "1px solid #ddd",
            margin: "2px",
            pointerEvents: rowData.consultationchk !== 2 ? "none" : "auto",
            opacity: rowData.consultationchk === 2 ? 1 : 0.5,
          }}
          disabled={rowData.consultationchk !== 2}
          onClick={() => {
            setSelectedAppointment(rowData);
            setShowReceiptModal(true);
            // Find the matching doctor from the list
            const selectedDoctor = doctors.find(
              (doc) => doc.name === rowData?.doctorName
            );

            setFormData((prevFormData) => ({
              ...prevFormData,
              doctor_id: selectedDoctor ? selectedDoctor.doctor_id : "", // Prefill with doctor_id if found
            }));
            //handleReceiptsClick();
          }}
        >
          <FeatherIcon icon="file-text" className="w-18" />
        </Link>
      </div>
    );
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openDeleteModal = (id) => {
    console.log("Opening delete modal for appointment ID:", id); // Debug log
    setAppointmentId(id); // Set the appointment ID to delete
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    console.log("Deleting appointment with ID:", appointmentId); // Debug log
    if (appointmentId === null) {
      console.error("No appointment ID set for deletion."); // Error log
      return; // Exit if no ID is set
    }

    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/delete/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Log the response status and body for debugging
      console.log("API Response Status:", response.status);
      const responseBody = await response.text(); // Get the response body
      console.log("API Response Body:", responseBody);

      if (response.ok) {
        // Mark the appointment as deleted instead of removing it
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, is_deleted: true }
              : appointment
          )
        );
        fetchAppointmentData({ cache: "no-cache" });
        setShowDeleteModal(false);
        setCancellationReason(""); // Clear the cancellation reason
      } else {
        console.error("Delete Error:", responseBody);
        alert("Failed to delete appointment."); // Alert user on failure
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("An error occurred while deleting the appointment.");
    }
  };

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
              selected={moment(fromDate, "DD-MM-YYYY").toDate()}
              onChange={handleFromDateChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
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
              selected={moment(toDate, "DD-MM-YYYY").toDate()}
              onChange={handleToDateChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
              minDate={fromDate ? new Date(fromDate + "T00:00:00") : null}
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
          </div>

          <Button
            variant="primary"
            onClick={() => fetchAppointmentData(true)}
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

  const handleSaveChanges = async () => {
    try {
      if (!selectedAppointment || !selectedAppointment.patient_phone) {
        alert("Error: Patient Phone number is missing!");
        return;
      }
      const response = await fetch(
        `${BASE_URL}/V1/appointment/editAppointment/${selectedAppointment.patient_phone}`,
        {
          method: "PUT", // Assuming you use PUT for updating
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedAppointment), // Send the updated appointment data
        }
      );

      if (response.ok) {
        alert("Appointment updated successfully!");
        // fetchAppointmentData(); // Refresh the appointment list
        // Update the local state to reflect changes
        setAppointmentdata((prevData) =>
          prevData.map((appointment) =>
            appointment.appointment_id === selectedAppointment.appointment_id
              ? {
                  ...appointment,
                  doctorName: selectedAppointment.doctorName,
                  FDE_Name: selectedAppointment.FDE_Name,
                  patientName: selectedAppointment.patientName,
                  patient_type: selectedAppointment.patient_type,
                  patient_location: selectedAppointment.patient_location,
                  appointmentTime: selectedAppointment.appointmentTime,
                  date: selectedAppointment.date,
                  reference: selectedAppointment.reference,
                  patient_phone: selectedAppointment.patient_phone,
                  note: selectedAppointment.note,
                }
              : appointment
          )
        );
        setShowEditModal(false); // Close the modal
      } else {
        const errorData = await response.json();
        console.error("Failed to update appointment:", errorData.message);
        alert(
          "Failed to update appointment: " +
            (errorData.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating appointment:", error.message);
      alert("Error updating appointment: " + error.message);
    }
  };

  const calculateFinalAmount = (subtotal, discount) => {
    const parsedSubtotal = parseFloat(subtotal) || 0;
    const parsedDiscount = parseFloat(discount) || 0;
    return Math.max(0, parsedSubtotal - parsedDiscount);
  };

  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value);
    if (!isNaN(amount) && amount >= 0) {
      setFormData({ ...formData, totalamt: amount });
    }
  };

  const handleSaveReceipt = async () => {
    try {
      if (receipts.length === 0) {
        alert("Please add at least one receipt before saving.");
        return;
      }

      const appointment_id = selectedAppointment.appointment_id;
      let newReceiptId = "";

      // ✅ Sum total amount across all receipts
      const totalAmountSum = receipts.reduce(
        (sum, receipt) => sum + (parseFloat(receipt.totalamt) || 0),
        0
      );

      // ✅ Calculate total discount based on total amount (not per receipt)
      const totalDiscountSum = parseFloat(discount) || 0;
      const finalAmount = Math.max(0, totalAmountSum - totalDiscountSum);

      for (const receipt of receipts) {
        const receiptData = {
          receipt_id: receipt.receipt_id || "",
          receipt_date: new Date().toISOString().split("T")[0],
          patient_id: selectedAppointment.patient_id,
          appointment_id: selectedAppointment.appointment_id,
          doctor_id: receipt.doctor_id,
          consultation: receipts.map((r) => r.consultation).join(", "), // ✅ Ensure this exists
          comment: receipt.comment,
          sprayqty: receipt.sprayqty,
          totalamt: finalAmount, // ✅ Apply discount after summing receipts
          discountnote: receipt.discountnote,
          discountamt: Math.round(totalDiscountSum), // ✅ Correct discount
          paymentmode: receipt.paymentmode,
          otherdetails: receipt.otherdetails || "",
          is_deleted: 0,
        };

        console.log("Saving Receipt Data:", receiptData);

        const saveReceiptResponse = await fetch(
          `${BASE_URL}/V1/appointment/saveReceipt`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(receiptData),
          }
        );

        if (!saveReceiptResponse.ok) {
          throw new Error("Failed to save receipt. Server returned an error.");
        }

        // ✅ Log full API response
        const responseJson = await saveReceiptResponse.json();
        console.log("API Response:", responseJson);

        // ✅ Extract receipt_id from different possible locations
        let newReceiptId =
          responseJson?.data?.mainReceipt?.receipt_id ||
          responseJson?.data?.receipt_id ||
          responseJson?.receipt_id ||
          null;

        // if (!newReceiptId) {
        //   throw new Error("Error: API did not return a valid receipt ID!");
        // }
      }
      console.log("New Receipt ID:", newReceiptId);
      // ✅ Update formData with correct total & discount amount
      // // ✅ Update Execution Status after saving receipts
      const executionUpdateResponse = await fetch(
        `${BASE_URL}/V1/appointment/updateExecutionChkToFour/${appointment_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ executivechk: 4 }),
        }
      );

      // if (!executionUpdateResponse.ok) {
      //   throw new Error("Failed to update execution status");
      // }

      setFormData({
        receipt_id: newReceiptId,
        receipt_date: new Date().toISOString().split("T")[0],
        patient_id: selectedAppointment.patient_id,
        appointment_id: selectedAppointment.appointment_id,
        doctor_id: "",
        consultation: "",
        chargeCondition: "",
        comment: "",
        sprayqty: "",
        totalamt: "",
        discountnote: "",
        discountamt: "",
        paymentmode: receipts.paymentmode,
        otherdetails: "",
      });

      setFormData((prev) => ({
        ...prev,
        totalamt: (totalAmountSum - totalDiscountSum).toFixed(2), // ✅ Set final amount after discount
        discountamt: totalDiscountSum.toFixed(2), // ✅ Preserve correct discount amount
        receipt_id: newReceiptId, // ✅ Ensure receipt_id is stored
      }));

      // ✅ Reset form and allow new receipt entry
      //setReceipts([]);
      setDiscount(0);
      // setDiscountType("percentage");

      setShowReceiptView(true);

      alert(
        `Receipt saved successfully!\nTotal Amount: ₹${totalAmountSum.toFixed(
          2
        )}\nDiscount: ₹${totalDiscountSum.toFixed(
          2
        )}\nFinal Amount: ₹${finalAmount}`
      );
    } catch (error) {
      console.error("Error saving receipts:", error);
      alert(`Failed to save receipts: ${error.message}`);
    }
  };

  // Add this helper function for number to words conversion
  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    if (num === 0) return "Zero";

    const convertLessThanThousand = (n) => {
      if (n === 0) return "";

      if (n < 10) return ones[n];

      if (n < 20) return teens[n - 10];

      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      }

      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convertLessThanThousand(n % 100) : "")
      );
    };

    const convert = (n) => {
      if (n === 0) return "";

      let result = "";

      if (n >= 100000) {
        result += convertLessThanThousand(Math.floor(n / 100000)) + " Lakh ";
        n %= 100000;
      }

      if (n >= 1000) {
        result += convertLessThanThousand(Math.floor(n / 1000)) + " Thousand ";
        n %= 1000;
      }

      if (n > 0) {
        result += convertLessThanThousand(n);
      }

      return result.trim();
    };

    return convert(num) + " Rupees Only";
  };

  // Update the total calculation to use the already discounted amounts
  const calculateFinalTotal = () => {
    return receipts.reduce(
      (sum, receipt) => sum + parseFloat(receipt.totalamt),
      0
    );
  };

  // Use this when showing the final receipt
  const finalAmount = calculateFinalTotal();

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="card-body">
          {" "}
          {/* Add this class */}
          {selectedAppointment ? (
            <Form className="form-section">
              {" "}
              {/* Add this class */}
              <Row>
                <Col md={4} className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Control
                      as="select"
                      name="patient_type"
                      value={selectedAppointment.patient_type || ""}
                      onChange={(e) => {
                        setSelectedAppointment({
                          ...selectedAppointment,
                          patient_type: e.target.value,
                        });
                      }}
                    >
                      <option value="">Select Type</option>
                      {typeList.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-20">
                    <Form.Label>Doctor Name</Form.Label>
                    <Form.Select
                      name="doctorName"
                      value={selectedAppointment.doctorName || ""}
                      // onChange={handleInputChange}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          doctorName: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a Doctor</option>
                      {doctors && doctors.length > 0 ? (
                        doctors.map((doctor) => (
                          <option
                            key={doctor.doctor_id}
                            value={doctor.doctorName}
                          >
                            {doctor.doctor_id} - {doctor.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No doctors available</option>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Patient Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedAppointment.patientName || ""}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          patientName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact No</Form.Label>
                    <Form.Control
                      type="text"
                      name="patient_phone"
                      value={selectedAppointment.patient_phone || ""}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          patient_phone: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedAppointment.patient_location || ""}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          patient_location: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                {/* Reference */}
                <Col md={4}>
                  <Form.Group controlId="reference">
                    <Form.Label>Reference</Form.Label>
                    <Form.Control
                      as="select"
                      name="reference"
                      placeholder="Enter Reference"
                      value={selectedAppointment.reference || ""}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          reference: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Reference</option>
                      {[
                        "Newspaper",
                        "Doctor Reference",
                        "Internet",
                        "Entertainment Media",
                        "TV Show",
                        "Patient Reference",
                        "Other",
                        "HHC Board",
                        "HHF",
                        "Word of Mouth",
                      ].map((ref) => (
                        <option key={ref} value={ref}>
                          {ref}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Appointment Date</Form.Label>
                    <DatePicker
                      // selected={
                      //   selectedAppointment.date
                      //     ? new Date(selectedAppointment.date)
                      //     : null
                      // }
                      selected={
                        selectedAppointment.appointment_timestamp &&
                        !isNaN(
                          new Date(selectedAppointment.appointment_timestamp)
                        )
                          ? new Date(selectedAppointment.appointment_timestamp)
                          : null
                      }
                      onChange={(appointment_timestamp) => {
                        if (appointment_timestamp) {
                          // Check if date is valid
                          handleDateChange(appointment_timestamp);
                        } else {
                          console.error("Invalid date selected"); // Log error for invalid date
                        }
                      }}
                      value={selectedAppointment.appointment_timestamp}
                      className="form-control"
                      // value={selectedAppointment.date}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select Date"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Appointment Time</Form.Label>
                    <Form.Select
                      name="appointmentTime"
                      value={selectedAppointment.appointmentTime || ""}
                      // onChange={handleInputChange}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          appointmentTime: e.target.value,
                        })
                      }
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
                <Col md={4}>
                  <Form.Group className="mb-20">
                    <Form.Label>FDE Name</Form.Label>
                    <Form.Select
                      name="fdeId"
                      value={selectedAppointment.FDE_Name || ""}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          FDE_Name: e.target.value,
                        })
                      }
                    >
                      <option value="">Select FDE Name</option>
                      {fdeList &&
                        fdeList.length > 0 &&
                        fdeList.map((fde) => (
                          <option key={fde.FDEID} value={fde.FDEName}>
                            {fde.FDEName}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Note</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedAppointment.note || ""}
                      onChange={(e) =>
                        setSelectedAppointment({
                          ...selectedAppointment,
                          note: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button
                variant="primary"
                onClick={handleSaveChanges} // Call the save function
                style={{
                  float: "right",
                }}
              >
                Save Changes
              </Button>
            </Form>
          ) : (
            <p>Loading appointment details...</p>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reason of Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            className="form-control"
            placeholder="Enter the cancellation reason..."
            rows="4"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          ></textarea>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showReceiptModal}
        onHide={() => {
          setShowReceiptModal(false);
          setShowReceiptView(false);
        }}
        size={showReceiptView ? "xl" : "lg"}
        centered
      >
        {showReceiptView ? (
          <>
            <Modal.Body style={{ padding: 0 }}>
              <div
                className="bgdiv"
                style={{ background: "#2b9163", padding: "15px" }}
              >
                <div
                  className="maindiv"
                  style={{
                    background: "white",
                    border: "1px solid white",
                    borderRadius: "15px",
                    padding: "20px",
                  }}
                >
                  {/* Header Section */}
                  <div style={{ display: "flex", marginBottom: "20px" }}>
                    <div style={{ width: "30%" }}>
                      <img
                        src={logo}
                        alt="HHC Logo"
                        style={{
                          width: "100%",
                          maxWidth: "200px",
                          borderRight: "1px dotted #ccc",
                          paddingRight: "20px",
                        }}
                      />
                    </div>
                    <div style={{ width: "70%", paddingLeft: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ display: "flex", gap: "20px" }}>
                          <img
                            src={labLogo}
                            alt="Lab Logo"
                            style={{ width: "60px" }}
                          />
                          <img
                            src={pharmacyLogo}
                            alt="Pharmacy Logo"
                            style={{ width: "60px" }}
                          />
                        </div>
                        <div>
                          <p style={{ margin: "0", fontSize: "14px" }}>
                            {receipts.length > 0 && receipts[0].mainReceipt ? (
                              <p>
                                Receipt No:{" "}
                                <b>
                                  {receipts[0].mainReceipt.receipt_id || "N/A"}
                                </b>
                              </p>
                            ) : (
                              <p>
                                <b>Receipt ID Not Available</b>
                              </p>
                            )}
                          </p>
                          <p style={{ margin: "10px 0 0 0", fontSize: "14px" }}>
                            Date: <b>{formData.receipt_date}</b>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div style={{ display: "flex", gap: "20px" }}>
                    {/* Vertical Logo */}
                    <div style={{ width: "15%" }}>
                      <img
                        src={receiptLogo}
                        alt="Vertical Logo"
                        style={{
                          width: "100%",
                          height: "380px",
                          objectFit: "contain",
                        }}
                      />
                    </div>

                    {/* Receipt Details */}
                    <div style={{ width: "85%" }}>
                      <div style={{ marginBottom: "20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "15px",
                          }}
                        >
                          <span style={{ width: "120px" }}>Received From:</span>
                          <div
                            style={{
                              flex: 1,
                              borderBottom: "1px dotted #ccc",
                              paddingBottom: "5px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            {selectedAppointment?.patientName}
                          </div>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                          <span>For </span>
                          <span
                            style={{
                              fontWeight: 600,
                              textTransform: "uppercase",
                              borderBottom: "1px dotted #ccc",
                              paddingBottom: "5px",
                            }}
                          >
                            {receipts
                              .map((receipt) => receipt.consultation)
                              .join(", ")}
                          </span>
                        </div>

                        <div style={{ marginBottom: "15px", fontSize: "13px" }}>
                          <i
                            className="fa fa-phone"
                            style={{
                              padding: "3px 4px",
                              border: "1px solid grey",
                              borderRadius: "50%",
                            }}
                          ></i>
                          &nbsp;8888288884&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;020
                          - 26164488/99
                        </div>

                        <div style={{ marginBottom: "20px", fontSize: "13px" }}>
                          Email: info@healinghandsclinic.co.in
                          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Website:
                          www.healinghandsclinic.co.in
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "20px",
                          }}
                        >
                          <div style={{ width: "60%" }}>
                            <p style={{ margin: "0 0 5px 0" }}>
                              Payment Mode: <b>{receipts.paymentmode}</b>
                            </p>
                            <p style={{ margin: "0" }}>
                              In Words:{" "}
                              <b>
                                {numberToWords(
                                  Math.round(
                                    calculateFinalAmount(
                                      parseFloat(formData.totalamt || 0),
                                      discount,
                                      discountType
                                    )
                                  )
                                )}
                              </b>
                            </p>
                          </div>
                          <div style={{ width: "30%" }}>
                            <p
                              style={{
                                padding: "10px",
                                border: "1px solid grey",
                                borderRadius: "10px",
                                fontWeight: 600,
                                textAlign: "center",
                                margin: "0",
                              }}
                            >
                              Rs.&nbsp;
                              {parseFloat(formData.totalamt || 0).toFixed(2)}
                              /-
                            </p>
                          </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                          <p style={{ margin: "0 0 15px 0" }}>
                            <b>Next Appointment: </b>No appointment scheduled
                          </p>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ width: "60%" }}>
                              <p style={{ margin: "0 0 5px 0" }}>
                                <b>Dhole Patil Road: </b>
                              </p>
                              <p style={{ margin: "0", lineHeight: "1.4" }}>
                                Healing Hands Clinic Pvt Ltd
                                <br />
                                DP Road, Ground Floor, Millenium Star Extension,
                                <br />
                                Adjacent to Ruby Hall Clinic, Pune 411001
                              </p>
                            </div>
                            <div style={{ width: "30%" }}>
                              <div
                                style={{
                                  borderTop: "1px solid #000",
                                  paddingTop: "5px",
                                  textAlign: "center",
                                }}
                              >
                                Signature
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "30px",
                          }}
                        >
                          <p style={{ margin: "0" }}>
                            In case you have not received the correct receipt
                            for the paid amount, or for any discrepancies in
                            transaction please write us on&nbsp;
                            <a href="mailto:info@healinghandsclinic.co.in">
                              info@healinghandsclinic.co.in
                            </a>
                            &nbsp;or whatsapp on&nbsp;
                            <a
                              href="https://wa.me/+918888988882?text=Hello Doctor, I would like to know more about your treatments"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              +91 8888988882
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowReceiptView(false)}
              >
                Back
              </Button>
              <Button variant="primary" onClick={handlePrintReceipt}>
                Print
              </Button>
            </Modal.Footer>
          </>
        ) : (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Add Receipt</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedAppointment && (
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Patient Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedAppointment.patientName || ""}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Consultant Doctor</Form.Label>
                        <Form.Select
                          type="text"
                          name="doctor_id"
                          value={formData.doctor_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              doctor_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Select a Doctor</option>
                          {doctors.length > 0 ? (
                            doctors.map((doctor) => (
                              <option
                                key={doctor.doctor_id}
                                value={doctor.doctor_id}
                              >
                                {doctor.doctor_id} - {doctor.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No doctors available</option>
                          )}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <br />
                  {/* Payment Type */}
                  <Row>
                    <Form.Group>
                      <Row>
                        <Col md={2}>
                          <Form.Check
                            type="radio"
                            label="DNC"
                            checked={isDNC}
                            onChange={() => {
                              setIsDNC(true);
                              setIsDNW(false);
                              setIsDNP(false);
                            }}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Check
                            type="radio"
                            label="DNW"
                            checked={isDNW}
                            onChange={() => {
                              setIsDNW(true);
                              setIsDNC(false);
                              setIsDNP(false);
                            }}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Check
                            type="radio"
                            label="DNP"
                            checked={isDNP}
                            onChange={() => {
                              setIsDNP(true);
                              setIsDNC(false);
                              setIsDNW(false);
                            }}
                          />
                        </Col>
                      </Row>
                    </Form.Group>

                    {/* Textarea appears only after selecting any radio button */}
                    {(isDNC || isDNW || isDNP) && (
                      <Form.Group>
                        {/* <Form.Label>Additional Notes</Form.Label> */}
                        <Form.Control
                          as="textarea"
                          placeholder="DNC/DNW/DNP Comment Box"
                          rows={3}
                          value={textareaValue}
                          onChange={(e) => setTextareaValue(e.target.value)}
                        />
                      </Form.Group>
                    )}
                  </Row>
                  <br />

                  {/* Discount Fields */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Discount (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          value={discount}
                          onChange={(e) =>
                            setDiscount(parseFloat(e.target.value))
                          }
                        />
                      </Form.Group>
                    </Col>
                    <br />
                    {/* Consultation Name & Total Amount */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Discount Note</Form.Label>
                        <Form.Control
                          type="text"
                          name="discountnote"
                          value={formData.discountnote || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discountnote: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Consultant Name</Form.Label>
                        <Form.Select
                          name="consultation_name"
                          value={formData.consultation || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              consultation: e.target.value,
                            })
                          }
                        >
                          <option value="">Select a Consultant</option>
                          {consultationList.map((consultation) => (
                            <option
                              key={consultation.consultation_id}
                              value={consultation.consultation_name}
                            >
                              {consultation.consultation_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    {/* Payment Mode */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Payment Mode</Form.Label>
                        <Form.Select
                          name="paymentmode"
                          value={formData.paymentmode || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentmode: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Payment Mode</option>
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Total Amount</Form.Label>
                        <Form.Control
                          type="number"
                          name="totalamt"
                          value={formData.totalamt || ""}
                          onChange={handleAmountChange}
                          placeholder="Enter amount"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Receipts Table */}
                  <Card className="mt-3">
                    <Card.Body>
                      <h5>Receipts for {selectedAppointment.patientName}</h5>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Consultation Name</th>
                            <th>Total Amount</th>
                            <th>Payment Mode</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receipts.map((receipt, index) => (
                            <tr key={index}>
                              <td>{receipt.consultation}</td>
                              <td>{receipt.totalamt}</td>
                              <td>{receipt.paymentmode}</td>
                              <td>
                                <Button
                                  variant="danger"
                                  onClick={() =>
                                    setReceipts(
                                      receipts.filter((_, i) => i !== index)
                                    )
                                  }
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <br />
                      <Button
                        variant="secondary"
                        className="mt-3"
                        onClick={handleAddReceipt}
                      >
                        + Add Receipt
                      </Button>

                      <Button
                        variant="primary"
                        className="mt-3 ms-3"
                        onClick={() => {
                          if (receipts.length === 0) {
                            alert(
                              "Please add at least one receipt before saving."
                            );
                            return;
                          }

                          // Calculate total from all receipts
                          const totalamt = receipts.reduce(
                            (sum, receipt) =>
                              sum + (parseFloat(receipt.totalamt) || 0),
                            0
                          );

                          // Combine all consultation names
                          const allConsultations = receipts
                            .map((r) => r.consultation)
                            .join(", ");

                          // Update formData with the total and all consultations
                          setFormData((prev) => ({
                            ...prev,
                            totalamt: totalamt.toString(),
                            consultation: allConsultations,
                          }));

                          console.log("Form data being set:", {
                            receipt_id: receipts.receipt_id,
                            receipt_date: formData.receipt_date,
                            patient_id: selectedAppointment.patient_id,
                            appointment_id: selectedAppointment.appointment_id,
                            doctor_id: formData.doctor_id,
                            consultation: receipts
                              .map((receipt) => receipt.consultation)
                              .join(", "),
                            comment: formData.comment,
                            sprayqty: formData.sprayqty,
                            totalamt: formData.totalamt,
                            discountnote: formData.discountnote,
                            discountamt: formData.discountamt,
                            paymentmode: receipts.paymentmode,
                            otherdetails: formData.otherdetails,
                            is_deleted: false,
                          }); // Debug log

                          setShowReceiptView(true);
                          handleSaveReceipt();
                        }}
                      >
                        Save
                      </Button>
                    </Card.Body>
                  </Card>
                </Form>
              )}
            </Modal.Body>
          </>
        )}
      </Modal>

      {/* Breadcrumb */}
      <NavBarA pagename="Appointment List" />
      {/* Theme body */}
      <div
        className="theme-body"
        style={{
          background: "linear-gradient(to right, #e0f7fa, #80deea)",
          fontFamily: "'Poppins', Arial, sans-serif",
          minHeight: "100vh",
        }}
      >
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  marginLeft:
                    "-30px" /* Pull the card out by 20px on the left */,
                  marginRight:
                    "-30px" /* Pull the card out by 20px on the right */,
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                }}
              >
                <Card.Body>
                  {loading ? ( // Show loader if data is being fetched
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
                      value={appointment}
                      paginator
                      rows={10}
                      filters={filters1}
                      header={renderHeader}
                      globalFilterFields={[
                        "appointment_id",
                        // "date",
                        "appointment_timestamp",
                        "appointmentTime",
                        "confirm_time",
                        "patient_type",
                        "patientName",
                        "patient_phone",
                        "type",
                        "doctorName",
                        "FDE_Name",
                        "note",
                        // "patient_id",
                        // "appointmentTimestamp",
                      ]}
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                      responsiveLayout="scroll"
                      className="p-datatable-customers"
                      rowClassName={(rowData, { rowIndex }) => ({
                        style: {
                          backgroundColor:
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white", // Alternating colors
                          transition: "background-color 0.3s ease",
                        },
                        onMouseOver: (e) => {
                          e.currentTarget.style.backgroundColor = "#b2ebf2"; // Hover effect
                        },
                        onMouseOut: (e) => {
                          e.currentTarget.style.backgroundColor =
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white"; // Revert on mouse out
                        },
                      })}
                      style={{
                        border: "1px solid #4dd0e1", // Add a visible border
                        marginTop: "-10px", // Slightly reduce top margin
                        marginLeft: "-30px", // Increase left margin pull
                        marginRight: "-30px", // Increase right margin pull
                        width: "calc(100% + 30px + 30px)", // Compensate for negative margins
                        background: "white", // Ensure a clean background
                        borderRadius: "12px", // Smoother corners
                        overflow: "hidden", // Hide content overflow
                        padding: "15px", // Add padding for inner content
                      }}
                    >
                      <Column
                        field="appointment_id"
                        header="Sr.No"
                        style={{
                          width: "60px",
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.2rem",
                        }}
                      />
                      <Column
                        field="appointment_timestamp" // Directly use the formatted date from the backend
                        header="Date"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.5rem",
                        }}
                      />

                      <Column
                        field="appointmentTime"
                        header="Appo.Time"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.1rem",
                        }}
                      />
                      <Column
                        field="confirm_time"
                        header="Confirm Time"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.2rem",
                        }}
                      />
                      <Column
                        field="patient_type"
                        header="Type"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="patientName"
                        header="Patient Name"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="patient_phone"
                        header="Contact No"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="doctorName"
                        header="Doctor Details"
                        // body={(rowData) =>
                        //   `${rowData.doctorName}`
                        // }
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />

                      <Column
                        field="FDE_Name"
                        header="FDE Name"
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
