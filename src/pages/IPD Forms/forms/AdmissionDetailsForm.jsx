import React, { useState, useEffect } from "react";
import TextInput from "../inputs/TextInput";
import DateInput from "../inputs/DateInput";
import SelectInput from "../inputs/SelectInput";
import RadioGroup from "../inputs/RadioGroup";
import FileInput from "../inputs/FileInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import "./Forms.css";
import { decodeJwt } from "../../../utils/decode-jwt";
import Swal from "sweetalert2";

const BASE_URL = "http://localhost:5100/api";

// admissionJSON = {
//     "admission_details": {
//       "admission_date": null,
//       "admission_time": null,
//       "surgery_procedure_date": null,
//       "provisional_diagnosis": "",
//       "final_diagnosis": "",
//       "plan": "",
//       "allergies": "",
//       "special_consideration": ""
//     },
//     "lab_investigations": {
//       "tests_done_outside": null,
//       "sample_collected_for_lab": null,
//       "investigation_orders": "",
//       "pre_op_imaging_orders": {
//         "status": "Pending",
//         "checked_by_rmo": false
//       }
//     },
//     "patient_status": {
//       "nbm_status": {
//         "is_nbm": false,
//         "nbm_since": null
//       },
//       "had_food_before_arrival": false
//     },
//     "billing_administration": {
//       "payment_method": {
//         "cash": false,
//         "insurance": false,
//         "reimbursement": false
//       },
//       "cash_verification": {
//         "advance_paid": false,
//         "pending": false
//       },
//       "insurance_verification": {
//         "pre_approval_received": null
//       },
//       "coordinator_details": {
//         "name_and_signature": "",
//         "date_and_time": null
//       }
//     },
//     "document_metadata": {
//       "form_code": "AAC-F-2.2-01",
//       "page_number": 1
//     }
//   }

const AdmissionDetailsForm = ({ onSubmit, patientData }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    admissionDateTime: "",
    surgeryDate: "",
    provisionalDiagnosis: "",
    finalDiagnosis: "",
    icdCoding: "",
    plan: "",
    allergies: "",
    labTests: "",
    labReports: null,
    labStatus: "",
    investigationOrders: "",
    nbmStatus: "",
    hadFoodBeforeComing: false,
    paymentMethod: "",
    cashVerification: "",
    insuranceVerification: "",
    coordinatorName: "",
    coordinatorDateTime: "",
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

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files : value,
    }));
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

  const cardStyle = {
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    marginBottom: "25px",
    border: "1px solid #e0f7fa",
  };

  const sectionHeaderStyle = {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#00838f",
    marginBottom: "15px",
    borderBottom: "2px solid #80deea",
    paddingBottom: "5px",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mapping to your required nested JSON structure
    const finalPayload = {
      "admission-details": {
        admission_details: {
          admission_date: formData.admissionDateTime
            ? formData.admissionDateTime.split(" ")[0]
            : null,
          admission_time: formData.admissionDateTime
            ? formData.admissionDateTime.split(" ")[1]
            : null,
          surgery_procedure_date: formData.surgeryDate || null,
          provisional_diagnosis: formData.provisionalDiagnosis,
          final_diagnosis: formData.finalDiagnosis,
          icd_coding: formData.icdCoding,
          plan: formData.plan,
          allergies: formData.allergies,
        },
        lab_investigations: {
          tests_done_outside: formData.labTests === "Done outside",
          sample_collected_for_lab:
            formData.labStatus === "Sample collected for lab",
          investigation_orders: formData.investigationOrders,
        },
        patient_status: {
          nbm_status: {
            is_nbm: formData.nbmStatus === "NBM since",
            status_text: formData.nbmStatus,
          },
          had_food_before_arrival: formData.hadFoodBeforeComing,
        },
        billing_administration: {
          payment_method: {
            cash: formData.paymentMethod === "Cash",
            insurance: formData.paymentMethod === "Insurance",
            reimbursement: formData.paymentMethod === "Reimbursement",
          },
          cash_verification: {
            advance_paid: formData.cashVerification === "Advance paid",
            pending: formData.cashVerification === "Pending",
          },
          insurance_verification: {
            pre_approval_received:
              formData.insuranceVerification === "Pre approval received",
          },
          coordinator_details: {
            name: formData.coordinatorName,
            date_and_time: formData.coordinatorDateTime,
          },
        },
        document_metadata: {
          form_code: "AAC-F-2.2-01",
          page_number: 1,
        },
      },
    };

    try {
      Swal.fire({
        title: "Saving Admission Form...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
      });

      const bodyPayload = {
        title: "admission-details", // Unique key for this form in the JSON column
        location: currentLocation,
        patient_id: patientData.uhid,
        admissionData: finalPayload,
      };
      console.log(finalPayload);
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admission/insertAdmission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(bodyPayload),
        },
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Admission Details have been submitted successfully.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          if (onSubmit) onSubmit(result);
        });
      } else {
        throw new Error(result.message || "Failed to save data");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire("Error", error.message || "Server connection failed", "error");
    }
  };

  return (
    <div className="medical-form-container">
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">ADMISSION FORM</h2>

        {/* Patient Header - Using shared CSS classes */}
        <div className="patient-compact-header">
          <div className="info-item">
            <span className="info-label">UHID</span>
            <span className="info-value">{formData.uhid || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Patient Name</span>
            <span className="info-value">{formData.name || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Age</span>
            <span className="info-value">{formData.age || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Gender</span>
            <span className="info-value">{formData.gender || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">IP No</span>
            <span className="info-value">{formData.ipNo || "—"}</span>
          </div>
        </div>

        {/* Section 1: Clinical Details */}
        <div className="section-box">
          <div className="form-section-title">
            Admission details (to be filled by RMO)
          </div>
          <div className="three-col">
            <div className="form-field">
              <MuiDateTimePicker
                label="Admission Date"
                name="admissionDate"
                value={formData.admissionDateTime[0]}
                onChange={handleChange}
                type="date"
              />
            </div>
            <div className="form-field">
              <MuiDateTimePicker
                label="Admission Time"
                name="admissionTime"
                value={formData.admissionDateTime[1]}
                onChange={handleChange}
                type="time"
              />
            </div>
            <div className="form-field">
              <MuiDateTimePicker
                label="Surgery/Procedure Date"
                name="surgeryProcedureDate"
                value={formData.surgeryProcedureDate}
                onChange={handleChange}
                type="date"
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: "10px" }}>
            <TextInput
              label="Provisional diagnosis"
              name="provisionalDiagnosis"
              value={formData.provisionalDiagnosis}
              onChange={handleChange}
            />
            <TextInput
              label="Final diagnosis"
              name="finalDiagnosis"
              value={formData.finalDiagnosis}
              onChange={handleChange}
            />
          </div>

          <div className="three-col">
            <TextInput
              label="ICD-10 coding"
              name="icd10Coding"
              value={formData.icdCoding}
              onChange={handleChange}
            />
            <TextInput
              label="Plan"
              name="plan"
              value={formData.plan}
              onChange={handleChange}
            />
            <TextInput
              label="Allergies if any"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 2: Lab & Investigation */}
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

        {/* Section 3: Finance */}
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
              <label className="field-label">Coordinator Verification</label>
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

        {/* Final Footer Section */}
        <div
          className="section-box"
          style={{ borderTop: "3px solid var(--primary-color)" }}
        >
          <div className="three-col">
            <TextInput
              label="Admission done by (Name/Sign)"
              name="admissionDoneByNameSign"
              value={formData.admissionDoneByNameSign}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date"
              name="admissionDoneDate"
              value={formData.admissionDoneDate}
              onChange={handleChange}
              type="date"
            />
            <MuiDateTimePicker
              label="Time"
              name="admissionDoneTime"
              value={formData.admissionDoneTime}
              onChange={handleChange}
              type="time"
            />
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Complete Admission Verification
        </button>
      </form>
    </div>
  );
};

export default AdmissionDetailsForm;
