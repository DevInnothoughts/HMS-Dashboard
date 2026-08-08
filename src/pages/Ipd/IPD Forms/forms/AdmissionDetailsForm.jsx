import React, { useState, useEffect } from "react";
import TextInput from "../inputs/TextInput";
import DateInput from "../inputs/DateInput";
import SelectInput from "../inputs/SelectInput";
import RadioGroup from "../inputs/RadioGroup";
import FileInput from "../inputs/FileInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import "./Forms.css";
import { decodeJwt } from "../../../Utility/decode-jwt";
import Swal from "sweetalert2";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const BASE_URL = "http://194.195.117.79:5100/api";

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
  const fileInputRef = React.useRef(null);

  const [formData, setFormData] = useState({
    admissionDate: "",
    admissionTime: "",
    surgeryProcedureDate: "",
    surgeryProcedureTime: "",
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

    // Mandatory lab report validation
    if (
      formData.labTests === "Done outside" &&
      (!formData.labReports || formData.labReports.length === 0)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Lab reports required",
        text: "Please attach lab reports when lab tests are done outside.",
      });
      return;
    }

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

  // print form format starts
  const generatePrintContent = () => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ADMISSION DETAILS</title>
        <style>
            @page { margin: 5mm; }
             body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #333; }
            .outer-border { border: 3px solid #00a99d; padding: 5px 25px; display: flex; flex-direction: column; min-height: 80vh; }
            .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px; }
            .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
            .logo-area { display: flex; align-items: center; }
            .logo-img { height: 65px; width: auto; margin-top:10px }           
            .patient-info-block { position: absolute; right: 25px; color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
            .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
            .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 30px 0; }
            .row { display: flex; align-items: baseline; margin-bottom: 15px; font-size: 14px; font-weight:bold; }
            .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; height: 1.1em; text-align: center; font-weight: normal; padding: 4px 10px; min-width: 50px; }
            .line { border-bottom: 1px solid #646363; flex: 1; margin: 0 8px; height: 1.2em; text-align: center; font-size: 14px; font-weight: normal; padding: 0px 10px; min-width: 50px; }
            .cb-item { display: flex; align-items: center; margin-bottom: 6px; font-size: 14px; }
            .box { width: 18px; height: 18px; border: 1px solid #cbd5e0; border-radius: 4px; margin-top: 5px; margin-right: 5px; position: relative; flex-shrink: 0; background-color: #fff; }
            .box.checked { background-color: #00bcd4; border-color: #00bcd4; }
            .box.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); color: #333; font-weight: bold; font-size: 14px; }
            .amenities-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; margin-left: 30px; gap: 5px 2px; }
            .section-title { margin-bottom: 5px; margin-top: 5px; font-size: 14px; font-weight:bold; }
            .indent { margin-left: 30px; }
            .footer { margin-top: 10px; padding-top: 20px; }
            .sig-flex { display: flex; justify-content: space-between; margin-top: 20px; }
            .line-solid { border-bottom: 1px solid #333; width: 225px; display: inline-block; height: 1.1em; text-align: center; padding: 4px 10px;  }
            .line-long { border-bottom: 1px solid #333; flex: 1; margin-left: 10px; height: 1.1em; text-align: left; padding-left: 10px; padding: 4px 10px; }
            .inline-row {display:flex; gap:20px;}
            @media print { .no-print { display: none; } outer-border { height: 90vh; }}
            .medical-lined-section {flex: 1; line-height: 30px; background-image: linear-gradient(to bottom, transparent 29px, #333 30px); background-size: 100% 30px; background-repeat: repeat;
                min-height: 60px; 
                padding: 0 5px;
                margin-bottom: 10px;
                word-wrap: break-word;
                font-size: 14px;
            }
            .fs-14{font-size:14px; font-weight:normal;}

            .signature-table {
              width: 80%;
              border-collapse: collapse;
              margin: 20px auto;
            }

          .signature-table th, .signature-table td {
              border: 1px solid #000; /* Solid black borders like the image */
              padding: 10px;
              vertical-align: top;
              height: 80px; /* Adjust height to give room for stamps/writing */
          }
            .dept-column {
                width: 60%;
                font-weight: bold;
                font-size: 13px;
                text-transform: uppercase;
            }
            .sign-column {width: 40%; font-size: 12px; }
            .sign-row {display: flex; flex-direction: column; justify-content: space-between; height: 100%;}
            .page-break {page-break-before: always; break-before: page;}

 
        </style>
    </head>
    <body>
      <div>
        <div class="form-type">Form 17 - Front</div>
        <div class="outer-border">
            <div class="header-flex">
                <img src="${window.location.origin}${hhcLogo}" class="logo-img">
                <div class="patient-info-block">
                    <div><span class="label-teal">UHID:</span> ${patientData?.uhid || ""}</div>
                    <div><span class="label-teal">NAME:</span> ${patientData?.name || ""}</div>
                    <div><span class="label-teal">AGE/SEX:</span> ${patientData?.age || ""}/${patientData?.gender || ""}</div>
                    <div><span class="label-teal">IP NO:</span> ${patientData?.ipNo || ""}</div>
                </div>
            </div>

            <div class="main-title">ADMISSION FORM</div>

            <div class="row">
              <div class="section-title">Admission details (to be filled by RMO):</div>
              <div class="dotted-line"></div>               
            </div>

            <div class="row fs-14">
                Admission Date: <div class="dotted-line">${formData.admissionDate || ""}</div>
                Admission Time: <div class="dotted-line">${formData.admissionTime || ""}</div> 
            </div>

            <div class="row fs-14">
                Surgery/Procedure Date <div class="dotted-line">${formData.surgeryProcedureDate}</div>
                
            </div>

            <div class="row fs-14">
                Provisional diagnosis <div class="dotted-line">${formData.provisionalDiagnosis || ""}</div>
            </div>

            <div class="row fs-14">
                Final diagnosis <div class="dotted-line">${formData.finalDiagnosis || ""}</div>
            </div>

            <div class="row fs-14">
                ICD-10 coding <div class="dotted-line">${formData.icdCoding}</div>
            </div>

            <div class="row fs-14">
                Plan <div class="dotted-line">${formData.plan || ""}</div>
            </div>

            <div class="row fs-14">
                Allergies if any <div class="dotted-line">${formData.allergies}</div>
            </div>


            <div class="section">
                <div class="section-title">Special consideration</div>
                <div class="inline-row">
                  <span>Lab tests: </span>
                  <div class="cb-item"><div class="box ${formData.labTests === "Done outside" ? "checked" : ""}"></div> Done outside</div>
                  <div class="cb-item"><div class="box ${formData.labTests === "Not done" ? "checked" : ""}"></div> Not done</div>
                </div>
            </div>

            ${
              formData.labTests === "Done outside" &&
              formData.labReports &&
              formData.labReports.length > 0
                ? `
                  <div style="margin-bottom: 5px; font-size: 14px;">
                    <strong>If done – Attach lab reports to file.</strong>
                  </div>
                `
                : ""
            }


              ${
                formData.labTests === "Not done"
                  ? `
                    <div class="section">
              <div class="section-title">If not done:</div>
                      <div class="inline-row">
                        <div class="cb-item">
                          <div class="box ${
                            formData.labStatus === "Sample collected for lab"
                              ? "checked"
                              : ""
                          }"></div>
                          Sample collected for lab
                        </div>

                        <div class="cb-item">
                          <div class="box ${
                            formData.labStatus === "Not collected"
                              ? "checked"
                              : ""
                          }"></div>
                          Not collected
                        </div>
                      </div>

                      ${
                        formData.labStatus === "Not collected"
                          ? `
                            <p style="margin-top:6px;">
                              If not collected – RMO to give orders to nursing staff &
                              write in progress sheet
                            </p>
                          `
                          : ""
                      }
                    </div>
                  `
                  : ""
              }

            <div class="section">
                <div class="section-title">Investigation orders - RMO to check pre op orders for imaging</div>
                   <div class="inline-row">
                  <div class="cb-item"><div class="box ${formData.investigationOrders === "Followed" ? "checked" : ""}"></div>Followed</div>
                  <div class="cb-item"><div class="box ${formData.investigationOrders === "Pending" ? "checked" : ""}"></div> Pending</div>
                  <div class="cb-item"><div class="box ${formData.investigationOrders === "NA" ? "checked" : ""}"></div> NA</div>
                </div>
                 
            </div>
            ${
              formData.investigationOrders === "Pending"
                ? `
                  <p style="margin-top:6px;">
                    RMO to act – in case pending or any additional test is required.
                  </p>
                `
                : ""
            }

            <div class="section">
              <div class="inline-row">
                <div class="section-title">NBM status</div>
                  <div class="cb-item"><div class="box ${formData.nbmStatus === "NBM since" ? "checked" : ""}"></div> NBM since</div>
                  <div class="cb-item"><div class="box ${formData.nbmStatus === "Patient had food before coming" ? "checked" : ""}"></div>Patient had food before coming</div>
                </div>
              </div>

              <div class="section">
                <div class="inline-row">
                  <div class="section-title">Payment method</div>

                  <div class="cb-item">
                    <div class="box ${formData.paymentMethod === "Cash" ? "checked" : ""}"></div>
                    Cash
                  </div>

                  <div class="cb-item">
                    <div class="box ${formData.paymentMethod === "Insurance" ? "checked" : ""}"></div>
                    Insurance
                  </div>

                  <div class="cb-item">
                    <div class="box ${formData.paymentMethod === "Reimbursement" ? "checked" : ""}"></div>
                    Reimbursement
                  </div>
                </div>
              </div>


             ${
               formData.paymentMethod === "Cash"
                 ? `
                  <div class="section">
                    <div class="inline-row">
                      <div class="section-title">
                        In case of cash payment, floor coordinator to verify
                      </div>

                      <div class="cb-item">
                        <div class="box ${formData.cashVerification === "Advance paid" ? "checked" : ""}"></div>
                        Advance paid
                      </div>

                      <div class="cb-item">
                        <div class="box ${formData.cashVerification === "Pending" ? "checked" : ""}"></div>
                        Pending
                      </div>
                    </div>
                  </div>
                  `
                 : ""
             }

             ${
               formData.paymentMethod === "Insurance"
                 ? `
                  <div class="section">
                    <div class="section-title">
                      In case of insurance, floor coordinator to verify
                    </div>
                    <div class="inline-row">
                      <div class="cb-item">
                        <div class="box ${formData.insuranceVerification === "Pre approval received" ? "checked" : ""}"></div>
                        Pre approval received
                      </div>
                      <div class="cb-item">
                        <div class="box ${formData.insuranceVerification === "Not received" ? "checked" : ""}"></div>
                        Not received
                      </div>
                    </div>
                  </div>
                `
                 : ``
             }

              <div class="row">
                <div class="section-title">Name & Sign of the floor coordinator</div>
                <div class="line">${formData.coordinatorName || ""}</div>               
              </div>

              <div class="row">
                <div class="section-title">Date & Time: </div>
                <div class="dotted-line">${formData.coordinatorDateTime || ""}</div>
              </div>

            </div>

            <div class="fs-14">AAC-F-2.2-01</div>
            
        </div>
        
      </div>

        <div class="no-print" style="text-align:center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 30px; background:#008080; color:white; border:none; border-radius:4px; cursor:pointer;">Confirm Print</button>
        </div>
      </div>
    </body>
    </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=1000");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  // print form format ends

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
                value={formData.admissionDate}
                onChange={handleChange}
                type="date"
              />
            </div>
            <div className="form-field">
              <MuiDateTimePicker
                label="Admission Time"
                name="admissionTime"
                value={formData.admissionTime}
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
              name="icdCoding"
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

            {formData.labTests === "Not done" && (
              <div style={{ marginTop: "12px" }}>
                <label className="field-label">If not done</label>

                <RadioGroup
                  name="labStatus"
                  value={formData.labStatus}
                  onChange={handleChange}
                  options={sampleOptions}
                />

                {formData.labStatus === "Not collected" && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "8px 12px",
                      background: "#fff7ed",
                      borderLeft: "4px solid var(--primary-color)",
                      fontSize: "13px",
                    }}
                  >
                    If not collected – RMO to give orders to nursing staff &
                    write in progress sheet
                  </div>
                )}
              </div>
            )}

            {/* <label className="field-label">
              If done - Attach lab reports to file.
            </label>
            <FileInput
              name="labReports"
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
            /> */}
            <input
              type="file"
              ref={fileInputRef}
              name="labReports"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              style={{ display: "none" }}
              onChange={handleChange}
            />

            {formData.labTests === "Done outside" && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  background: "#f0fdfa",
                  border: "1px dashed var(--primary-color)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
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
                  onClick={() => fileInputRef.current?.click()}
                  style={{ marginLeft: "10px" }}
                >
                  Import Reports
                </button>
                {formData.labReports && (
                  <div style={{ marginLeft: "10px", fontSize: "12px" }}>
                    {Array.from(formData.labReports)
                      .map((file) => file.name)
                      .join(", ")}
                  </div>
                )}
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
              {formData.investigationOrders === "Pending" && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    background: "#fff7ed",
                    borderLeft: "4px solid var(--primary-color)",
                    fontSize: "13px",
                    color: "#7c2d12",
                    borderRadius: "4px",
                  }}
                >
                  RMO to act – in case pending or any additional test is
                  required.
                </div>
              )}
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
            {/* <TextInput
              label="Estimated length of stay"
              name="estimatedStay"
              value={formData.estimatedStay}
              onChange={handleChange}
            /> */}
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
                    ? "cashVerification"
                    : "insuranceVerification"
                }
                value={
                  formData.paymentMethod === "Cash"
                    ? formData.cashVerification
                    : formData.insuranceVerification
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
              name="coordinatorName"
              value={formData.coordinatorName}
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
        {/* <div
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
        </div> */}

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Complete Admission Verification
          </button>

          <button
            type="button"
            className="submit-btn"
            onClick={generatePrintContent}
            style={{
              margin: 0,
              width: "100%",
              backgroundColor: "#607d8b", // Distinct color for print
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>🖨️</span> Print Admission Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmissionDetailsForm;
