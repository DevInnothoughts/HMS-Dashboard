// import React, { useState, useEffect } from "react";
// import TextInput from "../inputs/TextInput";
// import DateInput from "../inputs/DateInput";
// import SelectInput from "../inputs/SelectInput";
// import RadioGroup from "../inputs/RadioGroup";
// import FileInput from "../inputs/FileInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
// import "./Forms.css";
// import { decodeJwt } from "../../../utils/decode-jwt";
// import Swal from "sweetalert2";

// const BASE_URL = "http://localhost:5100/api";

// // admissionJSON = {
// //     "admission_details": {
// //       "admission_date": null,
// //       "admission_time": null,
// //       "surgery_procedure_date": null,
// //       "provisional_diagnosis": "",
// //       "final_diagnosis": "",
// //       "plan": "",
// //       "allergies": "",
// //       "special_consideration": ""
// //     },
// //     "lab_investigations": {
// //       "tests_done_outside": null,
// //       "sample_collected_for_lab": null,
// //       "investigation_orders": "",
// //       "pre_op_imaging_orders": {
// //         "status": "Pending",
// //         "checked_by_rmo": false
// //       }
// //     },
// //     "patient_status": {
// //       "nbm_status": {
// //         "is_nbm": false,
// //         "nbm_since": null
// //       },
// //       "had_food_before_arrival": false
// //     },
// //     "billing_administration": {
// //       "payment_method": {
// //         "cash": false,
// //         "insurance": false,
// //         "reimbursement": false
// //       },
// //       "cash_verification": {
// //         "advance_paid": false,
// //         "pending": false
// //       },
// //       "insurance_verification": {
// //         "pre_approval_received": null
// //       },
// //       "coordinator_details": {
// //         "name_and_signature": "",
// //         "date_and_time": null
// //       }
// //     },
// //     "document_metadata": {
// //       "form_code": "AAC-F-2.2-01",
// //       "page_number": 1
// //     }
// //   }

// const AdmissionDetailsForm = ({ onSubmit, patientData }) => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [formData, setFormData] = useState({
//     admissionDateTime: "",
//     surgeryDate: "",
//     provisionalDiagnosis: "",
//     finalDiagnosis: "",
//     icdCoding: "",
//     plan: "",
//     allergies: "",
//     labTests: "",
//     labReports: null,
//     labStatus: "",
//     investigationOrders: "",
//     nbmStatus: "",
//     hadFoodBeforeComing: false,
//     paymentMethod: "",
//     cashVerification: "",
//     insuranceVerification: "",
//     coordinatorName: "",
//     coordinatorDateTime: "",
//   });

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       const payload = decodeJwt(token);
//       if (payload && payload.jobLocation) {
//         setCurrentLocation(payload.jobLocation);
//       }
//     }
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, type, checked, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : files ? files : value,
//     }));
//   };

//   const cardStyle = {
//     padding: "20px",
//     borderRadius: "12px",
//     backgroundColor: "#fff",
//     boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
//     marginBottom: "25px",
//     border: "1px solid #e0f7fa",
//   };

//   const sectionHeaderStyle = {
//     fontSize: "1rem",
//     fontWeight: "bold",
//     color: "#00838f",
//     marginBottom: "15px",
//     borderBottom: "2px solid #80deea",
//     paddingBottom: "5px",
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Mapping to your required nested JSON structure
//     const finalPayload = {
//       "admission-details": {
//         admission_details: {
//           admission_date: formData.admissionDateTime
//             ? formData.admissionDateTime.split(" ")[0]
//             : null,
//           admission_time: formData.admissionDateTime
//             ? formData.admissionDateTime.split(" ")[1]
//             : null,
//           surgery_procedure_date: formData.surgeryDate || null,
//           provisional_diagnosis: formData.provisionalDiagnosis,
//           final_diagnosis: formData.finalDiagnosis,
//           icd_coding: formData.icdCoding,
//           plan: formData.plan,
//           allergies: formData.allergies,
//         },
//         lab_investigations: {
//           tests_done_outside: formData.labTests === "Done outside",
//           sample_collected_for_lab:
//             formData.labStatus === "Sample collected for lab",
//           investigation_orders: formData.investigationOrders,
//         },
//         patient_status: {
//           nbm_status: {
//             is_nbm: formData.nbmStatus === "NBM since",
//             status_text: formData.nbmStatus,
//           },
//           had_food_before_arrival: formData.hadFoodBeforeComing,
//         },
//         billing_administration: {
//           payment_method: {
//             cash: formData.paymentMethod === "Cash",
//             insurance: formData.paymentMethod === "Insurance",
//             reimbursement: formData.paymentMethod === "Reimbursement",
//           },
//           cash_verification: {
//             advance_paid: formData.cashVerification === "Advance paid",
//             pending: formData.cashVerification === "Pending",
//           },
//           insurance_verification: {
//             pre_approval_received:
//               formData.insuranceVerification === "Pre approval received",
//           },
//           coordinator_details: {
//             name: formData.coordinatorName,
//             date_and_time: formData.coordinatorDateTime,
//           },
//         },
//         document_metadata: {
//           form_code: "AAC-F-2.2-01",
//           page_number: 1,
//         },
//       },
//     };

//     try {
//       Swal.fire({
//         title: "Saving Admission Form...",
//         didOpen: () => {
//           Swal.showLoading();
//         },
//         allowOutsideClick: false,
//       });

//       const bodyPayload = {
//         title: "admission-details", // Unique key for this form in the JSON column
//         location: currentLocation,
//         patient_id: patientData.uhid,
//         admissionData: finalPayload,
//       };
//       console.log(finalPayload);
//       const response = await fetch(
//         `${BASE_URL}/V1/ipd/admission/insertAdmission`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify(bodyPayload),
//         },
//       );

//       const result = await response.json();

//       if (response.ok) {
//         Swal.fire({
//           icon: "success",
//           title: "Saved!",
//           text: "Admission Details have been submitted successfully.",
//           timer: 2000,
//           showConfirmButton: false,
//         }).then(() => {
//           if (onSubmit) onSubmit(result);
//         });
//       } else {
//         throw new Error(result.message || "Failed to save data");
//       }
//     } catch (error) {
//       console.error("Submission Error:", error);
//       Swal.fire("Error", error.message || "Server connection failed", "error");
//     }
//   };

//   return (
//     <div className="medical-form-container">
//       <form onSubmit={handleSubmit}>
//         <h2 className="form-title">ADMISSION FORM</h2>

//         {/* Patient Header - Using shared CSS classes */}
//         <div className="patient-compact-header">
//           <div className="info-item">
//             <span className="info-label">UHID</span>
//             <span className="info-value">{formData.uhid || "—"}</span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Patient Name</span>
//             <span className="info-value">{formData.name || "—"}</span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Age</span>
//             <span className="info-value">{formData.age || "—"}</span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Gender</span>
//             <span className="info-value">{formData.gender || "—"}</span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">IP No</span>
//             <span className="info-value">{formData.ipNo || "—"}</span>
//           </div>
//         </div>

//         {/* Section 1: Clinical Details */}
//         <div className="section-box">
//           <div className="form-section-title">
//             Admission details (to be filled by RMO)
//           </div>
//           <div className="three-col">
//             <div className="form-field">
//               <MuiDateTimePicker
//                 label="Admission Date"
//                 name="admissionDate"
//                 value={formData.admissionDateTime[0]}
//                 onChange={handleChange}
//                 type="date"
//               />
//             </div>
//             <div className="form-field">
//               <MuiDateTimePicker
//                 label="Admission Time"
//                 name="admissionTime"
//                 value={formData.admissionDateTime[1]}
//                 onChange={handleChange}
//                 type="time"
//               />
//             </div>
//             <div className="form-field">
//               <MuiDateTimePicker
//                 label="Surgery/Procedure Date"
//                 name="surgeryProcedureDate"
//                 value={formData.surgeryProcedureDate}
//                 onChange={handleChange}
//                 type="date"
//               />
//             </div>
//           </div>

//           <div className="form-grid" style={{ marginTop: "10px" }}>
//             <TextInput
//               label="Provisional diagnosis"
//               name="provisionalDiagnosis"
//               value={formData.provisionalDiagnosis}
//               onChange={handleChange}
//             />
//             <TextInput
//               label="Final diagnosis"
//               name="finalDiagnosis"
//               value={formData.finalDiagnosis}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="three-col">
//             <TextInput
//               label="ICD-10 coding"
//               name="icd10Coding"
//               value={formData.icdCoding}
//               onChange={handleChange}
//             />
//             <TextInput
//               label="Plan"
//               name="plan"
//               value={formData.plan}
//               onChange={handleChange}
//             />
//             <TextInput
//               label="Allergies if any"
//               name="allergies"
//               value={formData.allergies}
//               onChange={handleChange}
//             />
//           </div>
//         </div>

//         {/* Section 2: Lab & Investigation */}
// <div className="section-box">
//   <div className="form-section-title">Investigations & Status</div>

//   <div className="form-field">
//     <label className="field-label">Lab tests</label>
//     <RadioGroup
//       name="labTests"
//       value={formData.labTests}
//       onChange={handleChange}
//       options={labTestOptions}
//     />

//     {formData.labTests === "Done outside" && (
//       <div
//         style={{
//           marginTop: "10px",
//           padding: "10px",
//           background: "#f0fdfa",
//           border: "1px dashed var(--primary-color)",
//           borderRadius: "6px",
//         }}
//       >
//         <span
//           className="info-label"
//           style={{ color: "var(--primary-color)" }}
//         >
//           Attach lab reports to file
//         </span>
//         <button
//           type="button"
//           className="secondary-btn"
//           style={{ marginLeft: "10px" }}
//         >
//           Import Reports
//         </button>
//       </div>
//     )}
//   </div>

//   <div
//     className="two-col"
//     style={{
//       borderTop: "1px solid var(--border-color)",
//       paddingTop: "10px",
//       marginTop: "10px",
//     }}
//   >
//     <div className="form-field">
//       <label className="field-label">
//         Investigation orders (Imaging)
//       </label>
//       <RadioGroup
//         name="investigationOrders"
//         value={formData.investigationOrders}
//         onChange={handleChange}
//         options={investigationOptions}
//       />
//     </div>
//     <div className="form-field">
//       <label className="field-label">NBM status</label>
//       <RadioGroup
//         name="nbmStatus"
//         value={formData.nbmStatus}
//         onChange={handleChange}
//         options={nbmOptions}
//       />
//     </div>
//   </div>
// </div>

//         {/* Section 3: Finance */}
// <div className="section-box">
//   <div className="form-section-title">
//     Payment & Coordinator Verification
//   </div>
//   <div className="two-col">
//     <TextInput
//       label="Estimated length of stay"
//       name="estimatedStay"
//       value={formData.estimatedStay}
//       onChange={handleChange}
//     />
//     <div className="form-field">
//       <label className="field-label">Payment method</label>
//       <RadioGroup
//         name="paymentMethod"
//         value={formData.paymentMethod}
//         onChange={handleChange}
//         options={paymentOptions}
//       />
//     </div>
//   </div>

//   {(formData.paymentMethod === "Cash" ||
//     formData.paymentMethod === "Insurance") && (
//     <div
//       style={{
//         background: "#f8fafc",
//         padding: "10px",
//         borderRadius: "6px",
//         marginTop: "10px",
//         borderLeft: "4px solid var(--primary-color)",
//       }}
//     >
//       <label className="field-label">Coordinator Verification</label>
//       <RadioGroup
//         name={
//           formData.paymentMethod === "Cash"
//             ? "cashPaymentStatus"
//             : "insuranceApprovalStatus"
//         }
//         value={
//           formData.paymentMethod === "Cash"
//             ? formData.cashPaymentStatus
//             : formData.insuranceApprovalStatus
//         }
//         onChange={handleChange}
//         options={
//           formData.paymentMethod === "Cash"
//             ? cashOptions
//             : insuranceOptions
//         }
//       />
//     </div>
//   )}

//   <div className="two-col" style={{ marginTop: "15px" }}>
//     <TextInput
//       label="Floor Coordinator Name & Sign"
//       name="coordinatorNameSign"
//       value={formData.coordinatorNameSign}
//       onChange={handleChange}
//     />
//     <MuiDateTimePicker
//       label="Verification Date & Time"
//       name="coordinatorDateTime"
//       value={formData.coordinatorDateTime}
//       onChange={handleChange}
//     />
//   </div>
// </div>

//         {/* Final Footer Section */}
//         <div
//           className="section-box"
//           style={{ borderTop: "3px solid var(--primary-color)" }}
//         >
//           <div className="three-col">
//             <TextInput
//               label="Admission done by (Name/Sign)"
//               name="admissionDoneByNameSign"
//               value={formData.admissionDoneByNameSign}
//               onChange={handleChange}
//             />
//             <MuiDateTimePicker
//               label="Date"
//               name="admissionDoneDate"
//               value={formData.admissionDoneDate}
//               onChange={handleChange}
//               type="date"
//             />
//             <MuiDateTimePicker
//               label="Time"
//               name="admissionDoneTime"
//               value={formData.admissionDoneTime}
//               onChange={handleChange}
//               type="time"
//             />
//           </div>
//         </div>

//         <button type="submit" className="submit-btn">
//           Complete Admission Verification
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AdmissionDetailsForm;

import React, { useState, useEffect } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TextInput from "../inputs/TextInput";
import RadioGroup from "../inputs/RadioGroup";
import "./Forms.css";
import { decodeJwt } from "../../../utils/decode-jwt";
import Swal from "sweetalert2";
import hhcLogo from "../../../assets/images/logo/hhclogo.webp";

const pageTitle = "admission-details";
const BASE_URL = "http://localhost:5100/api";

const theme = createTheme({
  palette: {
    primary: { main: "#80deea" },
  },
  typography: { fontSize: 13 },
});

const AdmissionDetailsForm = ({ onSubmit, patientData }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    admissionDateTime: "",
    surgeryDate: "",
    provisionalDiagnosis: "",
    finalDiagnosis: "",
    icd10Coding: "",
    plan: "",
    allergies: "",
    labTests: "",
    sampleCollected: "",
    investigationOrders: "",
    nbmStatus: "",
    paymentMethod: "",
    cashPaymentStatus: "",
    insuranceApprovalStatus: "",
    coordinatorNameSign: "",
    coordinatorDateTime: "",
    admissionDoneByNameSign: "",
    estimatedStay: "",
  });

  // 1. Initialize Location and Fetch Data
  useEffect(() => {
    const token = localStorage.getItem("token");
    let loc = null;
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) {
        loc = payload.jobLocation;
        setCurrentLocation(loc);
      }
    }

    const fetchExistingDetails = async () => {
      if (!patientData?.uhid || !loc) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/V1/ipd/admission/listAdmissionEntry?location=${loc}&uhid=${patientData.uhid}&title=${pageTitle}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const result = await response.json();
        console.log("result.data: ", result.data);
        if (response.ok && result.data) {
          const existing = result.data;
          if (existing) {
            setFormData({
              admissionDateTime: existing.admission_details?.admission_date
                ? `${existing.admission_details.admission_date} ${existing.admission_details.admission_time || ""}`
                : "",
              surgeryDate:
                existing.admission_details?.surgery_procedure_date || "",
              provisionalDiagnosis:
                existing.admission_details?.provisional_diagnosis || "",
              finalDiagnosis: existing.admission_details?.final_diagnosis || "",
              icd10Coding: existing.admission_details?.icd_coding || "",
              plan: existing.admission_details?.plan || "",
              allergies: existing.admission_details?.allergies || "",
              labTests: existing.lab_investigations?.tests_done_outside
                ? "Done outside"
                : "Not done",
              sampleCollected: existing.lab_investigations
                ?.sample_collected_for_lab
                ? "Sample collected for lab"
                : "Not collected",
              investigationOrders:
                existing.lab_investigations?.investigation_orders || "",
              nbmStatus: existing.patient_status?.nbm_status?.status_text || "",
              paymentMethod: getPaymentMethod(
                existing.billing_administration?.payment_method,
              ),
              cashPaymentStatus: existing.billing_administration
                ?.cash_verification?.advance_paid
                ? "Advance paid"
                : "Pending",
              insuranceApprovalStatus: existing.billing_administration
                ?.insurance_verification?.pre_approval_received
                ? "Pre approval received"
                : "Not received",
              coordinatorNameSign:
                existing.billing_administration?.coordinator_details?.name ||
                "",
              coordinatorDateTime:
                existing.billing_administration?.coordinator_details
                  ?.date_and_time || "",
              admissionDoneByNameSign:
                existing.billing_administration?.coordinator_details
                  ?.admission_by || "", // or relevant field
              estimatedStay:
                existing.billing_administration?.estimated_stay || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching form details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingDetails();
  }, [patientData?.uhid]);

  // Helper to map backend payment booleans to string
  const getPaymentMethod = (pm) => {
    if (pm?.cash) return "Cash";
    if (pm?.insurance) return "Insurance";
    if (pm?.reimbursement) return "Reimbursement";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const labTestOptions = [
    { value: "Done outside", label: "Done outside" },
    { value: "Not done", label: "Not done" },
  ];

  const sampleOptions = [
    { value: "Sample collected for lab", label: "Sample collected" },
    { value: "Not collected", label: "Not collected" },
  ];

  const investigationOptions = [
    { value: "Followed", label: "Followed" },
    { value: "Pending", label: "Pending" },
    { value: "NA", label: "NA" },
  ];

  const nbmOptions = [
    { value: "NBM since", label: "NBM since" },
    { value: "Patient had food before coming", label: "Had food" },
  ];

  const paymentOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Insurance", label: "Insurance" },
    { value: "Reimbursement", label: "Reimbursement" },
  ];

  // Add these with your other option arrays
  const cashOptions = [
    { value: "Advance paid", label: "Advance paid" },
    { value: "Pending", label: "Pending" },
  ];

  const insuranceOptions = [
    { value: "Pre approval received", label: "Pre approval received" },
    { value: "Not received", label: "Not received" },
  ];

  const isFormComplete = () => {
    return (
      formData.admissionDateTime &&
      formData.provisionalDiagnosis &&
      formData.admissionDoneByNameSign
    );
  };

  // 2. Submit Logic (Mapping flat state to nested JSON)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalPayload = {
      "admission-details": {
        admission_details: {
          admission_date: formData.admissionDateTime?.split(" ")[0] || null,
          admission_time: formData.admissionDateTime?.split(" ")[1] || null,
          surgery_procedure_date: formData.surgeryDate || null,
          provisional_diagnosis: formData.provisionalDiagnosis,
          final_diagnosis: formData.finalDiagnosis,
          icd_coding: formData.icd10Coding,
          plan: formData.plan,
          allergies: formData.allergies,
        },
        lab_investigations: {
          tests_done_outside: formData.labTests === "Done outside",
          sample_collected_for_lab:
            formData.sampleCollected === "Sample collected for lab",
          investigation_orders: formData.investigationOrders,
        },
        patient_status: {
          nbm_status: {
            is_nbm: formData.nbmStatus === "NBM since",
            status_text: formData.nbmStatus,
          },
        },
        billing_administration: {
          estimated_stay: formData.estimatedStay,
          payment_method: {
            cash: formData.paymentMethod === "Cash",
            insurance: formData.paymentMethod === "Insurance",
            reimbursement: formData.paymentMethod === "Reimbursement",
          },
          cash_verification: {
            advance_paid: formData.cashPaymentStatus === "Advance paid",
            pending: formData.cashPaymentStatus === "Pending",
          },
          insurance_verification: {
            pre_approval_received:
              formData.insuranceApprovalStatus === "Pre approval received",
          },
          coordinator_details: {
            name: formData.coordinatorNameSign,
            date_and_time: formData.coordinatorDateTime,
            admission_by: formData.admissionDoneByNameSign,
          },
        },
        document_metadata: { form_code: "AAC-F-2.2-01", page_number: 1 },
      },
    };

    try {
      console.log("FINAL:", finalPayload);
      Swal.fire({
        title: "Saving...",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admission/insertAdmission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: pageTitle,
            location: currentLocation,
            patient_id: patientData.uhid,
            admissionData: finalPayload,
          }),
        },
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          timer: 2000,
          showConfirmButton: false,
        });
        if (onSubmit) onSubmit();
      } else {
        throw new Error("Failed to save data");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const generatePrintContent = () => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ADMISSION FORM</title>
        <style>
            @page { margin: 5mm; }
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; font-size: 12px; color: #333; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .header-logo { width: 150px; }
            .patient-info { border: 1px solid #00838f; padding: 10px; border-radius: 5px; background: #e0f7fa; margin-bottom: 20px; }
            .section-title { background: #00838f; color: white; padding: 5px 10px; font-weight: bold; margin-top: 15px; }
            .data-row { display: flex; border-bottom: 1px solid #eee; padding: 5px 0; }
            .label { font-weight: bold; width: 180px; color: #006064; }
            .value { flex: 1; }
            @media print { .no-print { display: none; } }
        </style>
    </head>
    <body>
        <table class="header-table">
            <tr>
                <td><img src="${window.location.origin}${hhcLogo}" class="header-logo"></td>
                <td style="text-align:right"><h2>ADMISSION FORM</h2></td>
            </tr>
        </table>
        <div class="patient-info">
            <strong>Patient:</strong> ${patientData?.name} | <strong>UHID:</strong> ${patientData?.uhid} | <strong>IP No:</strong> ${patientData?.ipNo}
        </div>
        
        <div class="section-title">CLINICAL DETAILS</div>
        <div class="data-row"><div class="label">Admission Dt/Time:</div><div class="value">${formData.admissionDateTime}</div></div>
        <div class="data-row"><div class="label">Provisional Diagnosis:</div><div class="value">${formData.provisionalDiagnosis}</div></div>
        <div class="data-row"><div class="label">Plan:</div><div class="value">${formData.plan}</div></div>
        
        <div class="section-title">INVESTIGATIONS</div>
        <div class="data-row"><div class="label">Lab Tests:</div><div class="value">${formData.labTests}</div></div>
        <div class="data-row"><div class="label">NBM Status:</div><div class="value">${formData.nbmStatus}</div></div>

        <div class="section-title">ADMINISTRATION</div>
        <div class="data-row"><div class="label">Stay Estimate:</div><div class="value">${formData.estimatedStay}</div></div>
        <div class="data-row"><div class="label">Payment Mode:</div><div class="value">${formData.paymentMethod}</div></div>
        <br><br>
        <div style="display:flex; justify-content:space-between">
            <div>________________________<br>Coordinator Sign</div>
            <div>________________________<br>RMO Sign</div>
        </div>
        <div class="no-print" style="margin-top:50px; text-align:center">
            <button onclick="window.print()" style="padding:10px 20px; background:#00838f; color:white; border:none; cursor:pointer">Print Document</button>
        </div>
    </body>
    </html>`;

    const blob = new Blob(["\ufeff" + htmlContent], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    window.open(url, "PrintForm", `width=850,height=900,scrollbars=yes`);
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="medical-form-container">
          <form onSubmit={handleSubmit}>
            <h2 className="form-title">ADMISSION DETAILS FORM</h2>

            {/* Patient Header */}
            {patientData && (
              <div className="patient-compact-header">
                <div className="info-item">
                  <span className="info-label">UHID</span>
                  <span className="info-value">{patientData.uhid}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Name</span>
                  <span className="info-value">{patientData.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Age/Sex</span>
                  <span className="info-value">
                    {patientData.age}/{patientData.gender}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">IP No</span>
                  <span className="info-value">{patientData.ipNo}</span>
                </div>
              </div>
            )}

            {/* Section 1: Clinical */}
            <div className="section-box">
              <div className="form-section-title">Admission Details (RMO)</div>
              <div className="two-col">
                <div className="form-field">
                  <label className="field-label">Admission Date & Time *</label>
                  <DateTimePicker
                    value={
                      formData.admissionDateTime
                        ? dayjs(formData.admissionDateTime, "DD-MM-YYYY HH:mm")
                        : null
                    }
                    format="DD-MM-YYYY HH:mm"
                    onChange={(val) =>
                      setFormData((p) => ({
                        ...p,
                        admissionDateTime: val
                          ? val.format("DD-MM-YYYY HH:mm")
                          : "",
                      }))
                    }
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">Surgery/Procedure Date</label>
                  <input
                    type="date"
                    name="surgeryDate"
                    className="form-control"
                    value={formData.surgeryDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-grid" style={{ marginTop: "10px" }}>
                <TextInput
                  label="Provisional Diagnosis *"
                  name="provisionalDiagnosis"
                  value={formData.provisionalDiagnosis}
                  onChange={handleChange}
                />
                <TextInput
                  label="Final Diagnosis"
                  name="finalDiagnosis"
                  value={formData.finalDiagnosis}
                  onChange={handleChange}
                />
              </div>
              <div className="three-col">
                <TextInput
                  label="ICD-10"
                  name="icd10Coding"
                  value={formData.icd10Coding}
                  onChange={handleChange}
                />
                <TextInput
                  label="Plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                />
                <TextInput
                  label="Allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Section 2: Labs */}
            {/* <div className="section-box">
              <div className="form-section-title">Investigations</div>
              <div className="form-field">
                <label className="field-label">Lab Tests</label>
                <RadioGroup name="labTests" value={formData.labTests} onChange={handleChange} options={labTestOptions} />
              </div>
              <div className="two-col">
                <TextInput label="Investigation Orders" name="investigationOrders" value={formData.investigationOrders} onChange={handleChange} />
                <div className="form-field">
                    <label className="field-label">NBM Status</label>
                    <RadioGroup name="nbmStatus" value={formData.nbmStatus} onChange={handleChange} options={nbmOptions} />
                </div>
              </div>
            </div> */}

            <div className="section-box">
              <div className="form-section-title">Investigations & Status</div>

              <div className="form-field">
                <label className="field-label">Lab tests</label>
                <RadioGroup
                  name="labTests"
                  value={formData.labTests}
                  onChange={handleChange}
                  options={labTestOptions}
                />

                {formData.labTests === "Done outside" && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      background: "#f0fdfa",
                      border: "1px dashed var(--primary-color)",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      className="info-label"
                      style={{ color: "var(--primary-color)" }}
                    >
                      Attach lab reports to file
                    </span>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ marginLeft: "10px" }}
                    >
                      Import Reports
                    </button>
                  </div>
                )}
              </div>

              <div
                className="two-col"
                style={{
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "10px",
                  marginTop: "10px",
                }}
              >
                <div className="form-field">
                  <label className="field-label">
                    Investigation orders (Imaging)
                  </label>
                  <RadioGroup
                    name="investigationOrders"
                    value={formData.investigationOrders}
                    onChange={handleChange}
                    options={investigationOptions}
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">NBM status</label>
                  <RadioGroup
                    name="nbmStatus"
                    value={formData.nbmStatus}
                    onChange={handleChange}
                    options={nbmOptions}
                  />
                </div>
              </div>
            </div>

            {/* 
            Section 3: Billing
            <div className="section-box">
                <div className="form-section-title">Billing & stay</div>
                <div className="three-col">
                    <TextInput label="Est. Stay" name="estimatedStay" value={formData.estimatedStay} onChange={handleChange} />
                    <div className="form-field">
                        <label className="field-label">Payment Method</label>
                        <RadioGroup name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} options={paymentOptions} />
                    </div>
                    <TextInput label="Admission Done By *" name="admissionDoneByNameSign" value={formData.admissionDoneByNameSign} onChange={handleChange} />
                </div>
            </div>
             */}

            <div className="section-box">
              <div className="form-section-title">
                Payment & Coordinator Verification
              </div>
              <div className="two-col">
                <TextInput
                  label="Estimated length of stay"
                  name="estimatedStay"
                  value={formData.estimatedStay}
                  onChange={handleChange}
                />
                <div className="form-field">
                  <label className="field-label">Payment method</label>
                  <RadioGroup
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    options={paymentOptions}
                  />
                </div>
              </div>

              {(formData.paymentMethod === "Cash" ||
                formData.paymentMethod === "Insurance") && (
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "10px",
                    borderRadius: "6px",
                    marginTop: "10px",
                    borderLeft: "4px solid var(--primary-color)",
                  }}
                >
                  <label className="field-label">
                    Coordinator Verification
                  </label>
                  <RadioGroup
                    name={
                      formData.paymentMethod === "Cash"
                        ? "cashPaymentStatus"
                        : "insuranceApprovalStatus"
                    }
                    value={
                      formData.paymentMethod === "Cash"
                        ? formData.cashPaymentStatus
                        : formData.insuranceApprovalStatus
                    }
                    onChange={handleChange}
                    options={
                      formData.paymentMethod === "Cash"
                        ? cashOptions
                        : insuranceOptions
                    }
                  />
                </div>
              )}

              <div className="two-col" style={{ marginTop: "15px" }}>
                <TextInput
                  label="Floor Coordinator Name & Sign"
                  name="coordinatorNameSign"
                  value={formData.coordinatorNameSign}
                  onChange={handleChange}
                />
                <MuiDateTimePicker
                  label="Verification Date & Time"
                  name="coordinatorDateTime"
                  value={formData.coordinatorDateTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="two-col" style={{ marginTop: "1rem" }}>
              <button
                type="submit"
                className="submit-btn"
                style={{ margin: 0, width: "100%" }}
              >
                Save Admission Data
              </button>
              <button
                type="button"
                className="submit-btn"
                style={{
                  margin: 0,
                  width: "100%",
                  backgroundColor: isFormComplete() ? "#10b981" : "#cbd5e1",
                }}
                onClick={generatePrintContent}
                disabled={!isFormComplete()}
              >
                Print Form
              </button>
            </div>
          </form>
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default AdmissionDetailsForm;
