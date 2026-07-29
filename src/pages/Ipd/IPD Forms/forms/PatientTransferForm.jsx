import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Textarea from "../inputs/Textarea";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const PatientTransferForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    uhid: patientData?.uhid || "",
    patientName: patientData?.name || "",
    age: patientData?.age || "",
    gender: patientData?.gender || "",
    ipNo: patientData?.ipNo || "",

    diagnosis: "",
    surgeryName: "",

    transferDate: "",
    transferTime: "",
    reasonForTransfer: "",
    transferOutToDept: "",

    vitals: {
      temp: "",
      bp: "",
      rr: "",
      pulse: "",
      painScore: "",
    },

    totalIntakeOutput: "",
    totalDrainOut: "",
    presentAppliances: "",
    investigationHandover: "",
    medicineHandover: "",
    anyOther: "",

    shiftingNurseNameSign: "",
    shiftingNurseDateTime: "",
    shiftingRmoNameSign: "",
    shiftingRmoDateTime: "",

    receivingNurseNameSign: "",
    receivingNurseDateTime: "",
    receivingDoctorNameSign: "",
    receivingDoctorDateTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const sectionTitleStyle = {
    fontWeight: "bold",
    fontSize: "0.9rem",
    color: "#333",
    marginBottom: "10px",
    display: "block",
  };

  const boxStyle = {
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "4px",
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
                    .outer-border { border: 3px solid #00a99d; padding: 15px 25px; display: flex; flex-direction: column; min-height: 95vh; box-sizing: border-box; }
                    .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px; }
                    .header-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                    .logo-img { height: 65px; width: auto; }           
                    .patient-info-block { color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
                    .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
                    .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 20px 0; text-align: left; }
                    
                    /* Form Row Styles */
                    .row { display: flex; align-items: baseline; margin-bottom: 5px; font-size: 14px; }
                    .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; min-height: 1.2em; font-weight: normal; }
                    
                    /* Vitals Table */
                    .vitals-table { width: 100%; border-collapse: collapse; margin: 5px 0 15px; }
                    .vitals-table td { border: 1px solid #000; padding: 8px; width: 20%; font-size: 13px; font-weight: bold; }
                    .vitals-val { font-weight: normal; margin-left: 5px; }

                    /* Expanding Lined Sections */
                    .section-header { font-weight: bold; font-size: 14px; margin-top: 15px; margin-bottom: 5px; }
                    .medical-lined-section { 
                        width: 100%;
                        line-height: 30px; 
                        background-image: linear-gradient(to bottom, transparent 29px, #000 30px); 
                        background-size: 100% 30px; 
                       min-height: 30px;
                        font-size: 14px;
                        font-weight: normal;
                        word-wrap: break-word;
                        print-color-adjust: exact;
                    }

                    /* Handover Tables */
                    .handover-table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
                    .handover-table td { border: 1px solid #000; padding: 10px; vertical-align: top; font-size: 12px; }
                    .handover-table p { font-size:14px;}

                    .footer-code { font-size: 12px; margin-top: auto; padding-top: 10px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="form-type">Form 5 - Front</div>
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

                    <div class="main-title">PATIENT TRANSFER FORM</div>

                    <div style="border: 1px solid #000; margin-bottom: 5px;">
                        <div class="row" style="padding: 10px 10px 5px 10px; margin-bottom: 0;">Diagnosis : ${formData.diagnosis}</div>
                        <div style="border-top: 1px solid #000;"></div> <div class="row" style="padding: 5px 10px 10px 10px; margin-bottom: 0;">Surgery Name: ${formData.surgeryName}</div>
                    </div>

                    <div class="section-header">Transfer Details-</div>
                    <div class="row">Transfer Date & Time: ${formData.transferDate} ${formData.transferTime} </div>
                    <div class="row">Reason for transfer: ${formData.reasonForTransfer} </div>
                    <div class="row">Transfer out to department: ${formData.transferOutToDept}</div>

                    <div class="section-header">Vitals-</div>
                    <table class="vitals-table">
                        <tr>
                            <td>Temp: <span class="vitals-val">${formData.vitals.temp || ""}</span></td>
                            <td>B.P.: <span class="vitals-val">${formData.vitals.bp || ""}</span></td>
                            <td>RR: <span class="vitals-val">${formData.vitals.rr || ""}</span></td>
                            <td>Pulse: <span class="vitals-val">${formData.vitals.pulse || ""}</span></td>
                            <td>Pain Score: <span class="vitals-val">${formData.vitals.painScore || ""}</span></td>
                        </tr>
                    </table>

                    <div class="row">Total Intake/Output: </div>
                    <div class="row">Total Drain Out: </div>

                    <div class="section-header">Present Appliances-</div>
                    <div class="medical-lined-section">${formData.presentAppliances || ""}</div>

                    <div class="section-header">Investigation Handover-</div>
                    <div class="medical-lined-section">${formData.investigationHandover || ""}</div>

                    <div class="section-header">Medicine Handover-</div>
                    <div class="medical-lined-section">${formData.medicineHandover || ""}</div>

                    <div class="section-header">Any Other-</div>
                    <div class="medical-lined-section">${formData.anyOther || ""}</div>

                    <table class="handover-table">
                        <tr>
                            <td>
                                <p><b>Name & Sign of Shifting Nurse with</b> : ${formData.shiftingNurseNameSign}</p>
                                <p><b>Date & Time : </b> ${formData.shiftingNurseDateTime}</p>
                            </td>
                            <td>
                                <p><b>Name & Sign of shifting RMO with : </b> ${formData.shiftingRmoNameSign}</p>
                                <p><b>Date & Time : </b> ${formData.shiftingRmoDateTime}</p>
                            </td>
                        </tr>
                    </table>

                    <div class="section-header">Patient Condition at the time of receiving</div>
                    <div class="medical-lined-section">${formData.receivingCondition || ""}</div>

                    <table class="handover-table" style="margin-bottom: 20px;">
                        <tr>
                            <td>
                                <p><b>Name & Sign of receiving Nurse with : </b> ${formData.receivingNurseNameSign}</p>
                                <p><b>Date & Time : </b> ${formData.receivingNurseDateTime}</p>
                            </td>
                            <td>
                                <p><b>Name & Sign of receiving doctor with : </b> ${formData.receivingDoctorNameSign}</p>
                                <p><b>Date & Time : </b> ${formData.receivingDoctorDateTime}</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="footer-code">AAC-F-2.2-01</div>
                <div class="no-print" style="text-align:center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 30px; background:#008080; color:white; border:none; border-radius:4px; cursor:pointer;">Confirm Print</button>
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
    <div
      className="medical-form patient-transfer-form"
      style={{
        maxWidth: "950px",
        margin: "0 auto",
        fontSize: "0.85rem",
        padding: "30px 20px",
      }}
    >
      <h2
        className="form-title"
        style={{
          textAlign: "center",
          backgroundColor: "#80deea",
          color: "white",
          padding: "10px",
          borderRadius: "4px",
          margin: "0 0 30px 0",
          fontSize: "1.4rem",
        }}
      >
        PATIENT TRANSFER FORM
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Compact Patient Header */}
        <div className="patient-compact-header">
          <div className="info-item">
            <span className="info-label">UHID</span>
            <span className="info-value">{formData.uhid}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Patient Name</span>
            <span className="info-value">{formData.patientName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Age</span>
            <span className="info-value">{formData.age}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Gender</span>
            <span className="info-value">{formData.gender}</span>
          </div>
          <div className="info-item">
            <span className="info-label">IP No</span>
            <span className="info-value">{formData.ipNo}</span>
          </div>
        </div>

        {/* Diagnosis & Surgery Section */}
        <div style={boxStyle}>
          <TextInput
            label="Diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
          />
          <TextInput
            label="Surgery Name"
            name="surgeryName"
            value={formData.surgeryName}
            onChange={handleChange}
          />
        </div>

        {/* Transfer Details */}
        <div style={{ marginBottom: "20px" }}>
          <label style={sectionTitleStyle}>Transfer Details-</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "15px",
              alignItems: "end",
            }}
          >
            <MuiDateTimePicker
              label="Transfer Date"
              name="transferDate"
              value={formData.transferDate}
              onChange={handleChange}
              type="date"
            />
            <MuiDateTimePicker
              label="Time"
              name="transferTime"
              value={formData.transferTime}
              onChange={handleChange}
              type="time"
            />
            <TextInput
              label="Reason for transfer"
              name="reasonForTransfer"
              value={formData.reasonForTransfer}
              onChange={handleChange}
            />
            <TextInput
              label="Transfer out to department"
              name="transferOutToDept"
              value={formData.transferOutToDept}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Vitals Section */}
        <div style={{ marginBottom: "20px" }}>
          <label style={sectionTitleStyle}>Vitals-</label>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      backgroundColor: "#f9f9f9",
                      fontWeight: "bold",
                    }}
                  >
                    Temp-
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="text"
                      name="vitals.temp"
                      value={formData.vitals.temp}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                      }}
                    />
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      backgroundColor: "#f9f9f9",
                      fontWeight: "bold",
                    }}
                  >
                    B.P.-
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="text"
                      name="vitals.bp"
                      value={formData.vitals.bp}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                      }}
                    />
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      backgroundColor: "#f9f9f9",
                      fontWeight: "bold",
                    }}
                  >
                    RR-
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="text"
                      name="vitals.rr"
                      value={formData.vitals.rr}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                      }}
                    />
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      backgroundColor: "#f9f9f9",
                      fontWeight: "bold",
                    }}
                  >
                    Pulse-
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="text"
                      name="vitals.pulse"
                      value={formData.vitals.pulse}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                      }}
                    />
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      backgroundColor: "#f9f9f9",
                      fontWeight: "bold",
                    }}
                  >
                    Pain Score-
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <input
                      type="text"
                      name="vitals.painScore"
                      value={formData.vitals.painScore}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Handover Sections */}
        <div style={{ display: "grid", gap: "5px", marginBottom: "25px" }}>
          <TextInput
            label="Total Intake/Output"
            name="totalIntakeOutput"
            value={formData.totalIntakeOutput}
            onChange={handleChange}
          />
          <TextInput
            label="Total Drain Out"
            name="totalDrainOut"
            value={formData.totalDrainOut}
            onChange={handleChange}
          />
          <TextInput
            label="Present Appliances"
            name="presentAppliances"
            value={formData.presentAppliances}
            onChange={handleChange}
          />
          <TextInput
            label="Investigation Handover"
            name="investigationHandover"
            value={formData.investigationHandover}
            onChange={handleChange}
          />
          <TextInput
            label="Medicine Handover"
            name="medicineHandover"
            value={formData.medicineHandover}
            onChange={handleChange}
          />
          <TextInput
            label="Any Other"
            name="anyOther"
            value={formData.anyOther}
            onChange={handleChange}
          />
        </div>

        {/* Shifting Signature Area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0",
            marginBottom: "20px",
            border: "1px solid #ddd",
          }}
        >
          <div style={{ padding: "10px", borderRight: "1px solid #ddd" }}>
            <TextInput
              label="Name & Sign of Shifting Nurse with -"
              name="shiftingNurseNameSign"
              value={formData.shiftingNurseNameSign}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="shiftingNurseDateTime"
              value={formData.shiftingNurseDateTime}
              onChange={handleChange}
            />
          </div>
          <div style={{ padding: "10px" }}>
            <TextInput
              label="Name & Sign of shifting RMO with -"
              name="shiftingRmoNameSign"
              value={formData.shiftingRmoNameSign}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="shiftingRmoDateTime"
              value={formData.shiftingRmoDateTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ marginBottom: "20px", fontWeight: "bold" }}>
          Patient Condition at the time of receiving
        </div>

        {/* Receiving Signature Area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0",
            marginBottom: "30px",
            border: "1px solid #ddd",
          }}
        >
          <div style={{ padding: "10px", borderRight: "1px solid #ddd" }}>
            <TextInput
              label="Name & Sign of receiving Nurse with -"
              name="receivingNurseNameSign"
              value={formData.receivingNurseNameSign}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="receivingNurseDateTime"
              value={formData.receivingNurseDateTime}
              onChange={handleChange}
            />
          </div>
          <div style={{ padding: "10px" }}>
            <TextInput
              label="Name & Sign of receiving doctor with -"
              name="receivingDoctorNameSign"
              value={formData.receivingDoctorNameSign}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="receivingDoctorDateTime"
              value={formData.receivingDoctorDateTime}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Confirm Transfer
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
            <span>🖨️</span> Print Transfer
          </button>
        </div>

        {/* <button
            type="submit"
            className="submit-btn"
            style={{ width: "100%" }}
          >
            Confirm Transfer
          </button> */}
      </form>
    </div>
  );
};

export default PatientTransferForm;
