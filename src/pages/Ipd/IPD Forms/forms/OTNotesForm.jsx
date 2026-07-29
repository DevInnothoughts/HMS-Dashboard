import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import SelectInput from "../inputs/SelectInput";
import Textarea from "../inputs/Textarea";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const OTNotesForm = ({ onSubmit, patientData = {} }) => {
  const [formData, setFormData] = useState({
    uhid: patientData.uhid || "",
    name: patientData.name || "",
    age: patientData.age || "",
    gender: patientData.gender || "",
    ipNo: patientData.ipNo || "",

    date: "",
    startTime: "",
    endTime: "",
    diagnosis: "",
    surgery: "",
    surgeonName: "",
    assistantSurgeonName: "",
    anaesthetistName: "",
    anesthesiaType: "",
    operativeFindings: "",
    bloodLoss: "",
    bloodTransfusion: "",
    drainage: "",
    implantDetails: "",
    cArm: "",
    otherEquipment: "",
    operativeNotesText: "", // From simple notes
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const anesthesiaOptions = [
    { value: "General", label: "General" },
    { value: "Spinal", label: "Spinal" },
    { value: "Epidural", label: "Epidural" },
    { value: "Local", label: "Local" },
    { value: "Sedation", label: "Sedation" },
    { value: "Other", label: "Other" },
  ];

  const cardStyle = {
    padding: "25px",
    borderRadius: "12px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    marginBottom: "25px",
    border: "1px solid #e0f7fa",
  };

  const sectionHeaderStyle = {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#00838f",
    marginBottom: "20px",
    borderBottom: "2px solid #80deea",
    paddingBottom: "8px",
  };

  // print form format starts
  const generatePrintContent = () => {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ANESTHESIA CONSENT FORM</title>
            <style>
                @page { margin: 5mm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #333; }
                .outer-border { border: 3px solid #00a99d; padding: 5px 25px; display: flex; flex-direction: column; min-height: 95vh; position: relative; }
                
                /* Header Styling - Matching your ADR form exactly */
                .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
                .logo-img { height: 65px; width: auto; margin-top:10px; }           
                .patient-info-block { position: absolute; right: 25px; color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
                .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
                 .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 30px 0; }
                /* Typography */
                .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; height: 1.1em; }
               .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px; }
                .instruction-box { font-size: 9.5px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-style: italic; color: #666; line-height: 1.2; }
                
                .section-text { margin: 5px 0 0; text-align: justify; font-size: 13.5px; line-height: 1.6; }
                .fill-line { border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 0 5px; font-weight: bold; font-style: italic; }
    
                /* Checkbox Grid - To match your image layout */
                .cb-grid { display: flex; flex-wrap: wrap; gap: 15px; margin: 10px 0; font-weight: bold; font-size: 12px; }
                .cb-item { display: flex; align-items: center; }
                .box { width: 14px; height: 14px; border: 1px solid #000; margin-right: 6px; position: relative; background: #fff; }
                .checked::after { content: '✓'; position: absolute; top: -5px; left: 1px; font-size: 15px; color: #000; font-weight: bold; }
    
                .attendant-section {padding-top: 10px; }
                .signature-section {page-break-inside: avoid; break-inside: avoid;}

                .section-label {display:flex; margin-top:15px; font-size:16px;}

                .notebook-container { background-image: linear-gradient(#646363 1px, transparent 1px);   background-size: 100% 31px; line-height: 31px; background-position: 0 30px; background-repeat: repeat;                   width: 100%; margin-top:10px; }

                .notebook-row { display: flex;                }

                .label-bold { font-weight: bold; padding-right: 8px; white-space: nowrap;  background-color: white; }

                .content-fill { flex: 1; word-break: break-word; min-height: 30px;}
  
                
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="page-container">
            <div class="form-type">Form 10 - Front</div>
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
    
                    <div class="main-title">OT NOTES</div>

                        <div class="section-label">
                        <span style="font-weight:bold;">Date : </span>
                        <span class="dotted-line">${formData.date || ""}</span>
                        <span style="font-weight:bold;">Start Time : </span>
                        <span class="dotted-line">${formData.startTime || ""}</span>
                        <span style="font-weight:bold;">End Time : </span>
                        <span class="dotted-line">${formData.endTime || ""}</span>
                    </div>
                   
                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Diagnosis  : </span>
                            <div class="content-fill">
                                ${formData.diagnosis || ""}
                            </div>
                        </div>
                      </div>

                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Surgery  : </span>
                            <div class="content-fill">
                                ${formData.surgery || ""}
                            </div>
                        </div>
                      </div>

                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Name of Surgeon  : </span>
                            <div class="content-fill">
                                ${formData.surgeonName || ""}
                            </div>
                            <span class="label-bold">Name Assistant Surgeon  : </span>
                            <div class="content-fill">
                                ${formData.assistantSurgeonName || ""}
                            </div>
                        </div>
                      </div>

                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Name of Anaesthetist  : </span>
                            <div class="content-fill">
                                ${formData.anaesthetistName || ""}
                            </div>
                            <span class="label-bold">Type of Anaesthesia  : </span>
                            <div class="content-fill">
                                ${formData.anesthesiaType || ""}
                            </div>
                        </div>
                      </div>

                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Operative findings  : </span>
                            <div class="content-fill">
                                ${formData.operativeFindings || ""}
                            </div>
                        </div>
                      </div>

                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Approximate blood loss : </span>
                            <div class="content-fill">
                                ${formData.bloodLoss || ""}
                            </div>
                        </div>
                      </div>
                    
                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Blood transfusion : </span>
                            <div class="content-fill">
                                ${formData.bloodTransfusion || ""}
                            </div>
                        </div>
                      </div>
                    
                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Drainage : </span>
                            <div class="content-fill">
                                ${formData.drainage || ""}
                            </div>
                        </div>
                      </div>

                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Details of implants (if used)</span>
                            <div class="content-fill">
                                ${formData.implantDetails || ""}
                            </div>
                        </div>
                      </div>
                    
                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">C - Arm : </span>
                            <div class="content-fill">
                                ${formData.cArm || ""}
                            </div>
                        </div>
                      </div>

                      <div class="notebook-container">
                        <div class="notebook-row">
                            <span class="label-bold">Other equipment : </span>
                            <div class="content-fill">
                                ${formData.otherEquipment || ""}
                            </div>
                        </div>
                      </div>
  
                    </div>

                    <div class="page-break"></div>
                    <div>
                        <div class="form-type">Form 17 - Back</div>
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

                            <div class="main-title">OT NOTES</div>
                        
                            <div class="notebook-container">
                                <div class="notebook-row">
                                    <span class="label-bold">Procedure:</span>
                                    <div class="content-fill">
                                        ${formData.procedure || ""}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                
                  <div class="no-print" style="text-align:center; margin: 20px 0;">
                      <button onclick="window.print()" style="padding: 10px 30px; background:#008080; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Confirm Print</button>
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
    <form
      onSubmit={handleSubmit}
      className="medical-form"
      style={{ maxWidth: "1000px", margin: "0 auto" }}
    >
      <h2
        className="form-title"
        style={{
          textAlign: "center",
          backgroundColor: "#80deea",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          margin: "0 0 30px 0",
          fontSize: "1.6rem",
          fontWeight: "bold",
        }}
      >
        OT NOTES
      </h2>

      {/* Patient Header */}
      <div className="patient-compact-header" style={{ marginBottom: "30px" }}>
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

      <div style={cardStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            marginBottom: "20px",
          }}
        >
          <MuiDateTimePicker
            label="Date :"
            name="date"
            value={formData.date}
            onChange={handleChange}
            type="date"
          />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <MuiDateTimePicker
              label="Start Time:"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              type="time"
            />
            <MuiDateTimePicker
              label="End Time:"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              type="time"
            />
          </div>
        </div>

        <TextInput
          label="Diagnosis:"
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
        />
        <TextInput
          label="Surgery:"
          name="surgery"
          value={formData.surgery}
          onChange={handleChange}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <TextInput
            label="Name of Surgeon:"
            name="surgeonName"
            value={formData.surgeonName}
            onChange={handleChange}
          />
          <TextInput
            label="Name of Assistant Surgeon:"
            name="assistantSurgeonName"
            value={formData.assistantSurgeonName}
            onChange={handleChange}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <TextInput
            label="Name of Anaesthetist:"
            name="anaesthetistName"
            value={formData.anaesthetistName}
            onChange={handleChange}
          />
          <SelectInput
            label="Type of Anaesthesia:"
            name="anesthesiaType"
            value={formData.anesthesiaType}
            onChange={handleChange}
            options={anesthesiaOptions}
          />
        </div>

        <TextInput
          label="Operative findings:"
          name="operativeFindings"
          value={formData.operativeFindings}
          onChange={handleChange}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <TextInput
            label="Approximate blood loss:"
            name="bloodLoss"
            value={formData.bloodLoss}
            onChange={handleChange}
          />
          <TextInput
            label="Blood transfusion:"
            name="bloodTransfusion"
            value={formData.bloodTransfusion}
            onChange={handleChange}
          />
        </div>

        <TextInput
          label="Drainage:"
          name="drainage"
          value={formData.drainage}
          onChange={handleChange}
        />
        <TextInput
          label="Details of implants (if used):"
          name="implantDetails"
          value={formData.implantDetails}
          onChange={handleChange}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <TextInput
            label="C - Arm:"
            name="cArm"
            value={formData.cArm}
            onChange={handleChange}
          />
        </div>

        <TextInput
          label="Other equipment used:"
          name="otherEquipment"
          value={formData.otherEquipment}
          onChange={handleChange}
        />
      </div>

      {/* Section 2: Procedure (From Page 2) */}
      <div style={cardStyle}>
        <TextInput
          label="Procedure:"
          name="procedure"
          value={formData.procedure}
          onChange={handleChange}
        />

        <div style={{ marginTop: "10px" }}>
          <Textarea
            name="operativeNotesText"
            value={formData.operativeNotesText}
            onChange={handleChange}
            rows={15}
            style={{
              lineHeight: "32px",
              background:
                "repeating-linear-gradient(white, white 31px, #e1f5fe 32px)",
              padding: "8px 15px",
              border: "2px solid #e1e8ed",
              borderRadius: "8px",
              minHeight: "400px",
            }}
          />
        </div>
      </div>

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Save Complete OT Note
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
          <span>🖨️</span> Print OT Note Form
        </button>
      </div>

      {/* <button
          type="submit"
          className="submit-btn"
          style={{ width: "100%", padding: "15px", fontSize: "1.2rem" }}
        >
          Save Complete OT Note
        </button> */}
    </form>
  );
};

export default OTNotesForm;
