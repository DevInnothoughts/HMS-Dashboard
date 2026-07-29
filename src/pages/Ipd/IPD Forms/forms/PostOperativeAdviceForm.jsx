import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Textarea from "../inputs/Textarea";
import SignatureInput from "../inputs/SignatureInput";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const PostOperativeAdviceForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    postOperativeAdviceDetails: "",
    surgeonName: "",
    surgeonSignature: "",
    ipNo: patientData?.ipNo || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ ...formData, patientHeader: patientData });
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
    
                    .notebook-row { align-items: flex-start; padding: 5px 0; }
                    .notebook-row2 { display: flex;  align-items: flex-start;}
    
                    .label-bold { font-weight: bold; padding-right: 8px; white-space: nowrap;  background-color: white; }
    
                    .content-fill { flex: 1; word-break: break-word; min-height: 30px;}
      
                    
                    @media print { .no-print { display: none; } }

                    
                </style>
            </head>
            <body>
                <div class="page-container">
                <div class="form-type">Form 11 - Front</div>
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
        
                        <div class="main-title">POST OPERATIVE ADVICE</div>
    
                        <div class="notebook-container">
                            <div class="notebook-row">
                                <span class="label-bold"> Post Operative Advice : </span>
                                <div class="content-fill">
                                    ${formData.postOperativeAdviceDetails || ""}
                                </div>
                            </div>
                        </div>

                        <div class="notebook-container">
                            <div class="notebook-row2">
                                <span class="label-bold">Surgeon Name and Sign:</span>
                                <div class="content-fill">
                                    ${formData.surgeonName || ""}
                                    ${formData.surgeonSignature || ""}
                                </div>
                            </div>
                        </div>
                       

                        <div class="notebook-container">
                            <div class="notebook-row2">
                                <span class="label-bold">Date  : </span>
                                <div class="content-fill">
                                    ${formData.date || ""}
                                </div>
                                <span class="label-bold"> Time   : </span>
                                <div class="content-fill">
                                    ${formData.time || ""}
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
    <div className="medical-form post-operative-advice-form">
      <h2
        className="form-title"
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#80deea",
          borderBottom: "2px solid #80deea",
          paddingBottom: "10px",
        }}
      >
        POST OPERATIVE ADVICE
      </h2>

      {/* Compact Patient Header */}
      {patientData && (
        <div className="patient-compact-header">
          <div className="info-item">
            <span className="info-label">UHID</span>
            <span className="info-value">{patientData.uhid}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Patient Name</span>
            <span className="info-value">{patientData.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Age</span>
            <span className="info-value">{patientData.age}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Gender</span>
            <span className="info-value">{patientData.gender}</span>
          </div>
          <div className="info-item">
            <span className="info-label">IP No</span>
            <span className="info-value">{patientData.ipNo}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="compact-form">
        <div
          className="notes-container"
          style={{ position: "relative", marginTop: "10px" }}
        >
          <Textarea
            label="POST OPERATIVE ADVICE"
            name="postOperativeAdviceDetails"
            value={formData.postOperativeAdviceDetails}
            onChange={handleChange}
            rows={20}
            placeholder="Enter post operative advice here..."
            style={{
              lineHeight: "32px",
              padding: "8px 15px",
              border: "2px solid #e1e8ed",
              borderRadius: "6px",
              width: "100%",
              fontSize: "1rem",
              minHeight: "500px",
            }}
          />
        </div>

        <div
          style={{
            marginTop: "40px",
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: "30px",
            padding: "20px",
            backgroundColor: "#fdfdfd",
            borderRadius: "12px",
            border: "1px solid #e0f7fa",
          }}
        >
          <TextInput
            label="Surgeon Name"
            name="surgeonName"
            value={formData.surgeonName}
            onChange={handleChange}
          />
          <SignatureInput
            label="Surgeon Signature"
            name="surgeonSignature"
            value={formData.surgeonSignature}
            onChange={handleChange}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          {/* <button
            type="submit"
            className="submit-btn"
            style={{ minWidth: "300px" }}
          >
            Confirm Post-Op Advice
          </button> */}
        </div>
        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Confirm Post-Op Advice
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
            <span>🖨️</span> Print Post-Op Advice
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostOperativeAdviceForm;
