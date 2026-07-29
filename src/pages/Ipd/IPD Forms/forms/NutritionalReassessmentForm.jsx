import React, { useState } from "react";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const NutritionalReassessmentForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    dietCounselingProvided: "",
    assessmentDateTime: "",
    dietitianName: "",
    dietitianSignature: "",
    consultantName: "",
    consultantSignature: "",
    reassessments: [
      {
        dateTime: "",
        remark: "",
        prescribedDiet: "",
        dietitianSign: "",
      },
    ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReassessmentChange = (index, field, value) => {
    const updated = [...formData.reassessments];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, reassessments: updated }));
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      reassessments: [
        ...prev.reassessments,
        {
          dateTime: "",
          remark: "",
          prescribedDiet: "",
          dietitianSign: "",
        },
      ],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit &&
      onSubmit({
        ...formData,
        patientHeader: patientData,
      });
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
                          .header-flex { display: flex; gap:20px; align-items: flex-start; }
                          .logo-area { display: flex; align-items: center; }
                          .logo-img { height: 65px; width: auto; margin-top:10px }           
                          .patient-info-block { position: absolute; right: 25px; color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
                          .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
                          .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 30px 0; }
                          .footer { margin-top: 10px; padding-top: 20px; }
                          .form-type {color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px;}
                          .inline-row {display:flex; gap:20px;}
                          @media print { .no-print { display: none; } outer-border { height: 90vh; }}
                          
                          .mar-table {width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; }
      
                          .mar-table th, .mar-table td { border: 1px solid black;  height: 25px; padding: 10px 10px;}
      
                          .col-label { width: 15%; } 
                          .col-value { width: 35%; } 
                          .col-admin { width: 6.25%; text-align: center; }
      
                          /* Helper for the Dr. Sign row labels */
                          .dt-flex {display: flex; gap: 20%; margin-top: 20px; align-items: center; }
                          .dt-flex2 {margin-top: 20px; align-items: center;}
                          .title-bar{margin-top:10px; margin-bottom:10px;}
  
                          .admission-box {border: 1px solid #333; padding: 10px; width: 40vw; margin-top: 10px;}
                          .info-row {display: flex; margin-bottom: 8px; font-size: 13px; font-weight: bold;}
                          .underline { border-bottom: 1px solid #333; flex: 1; margin-left: 5px; font-weight: normal; padding-left: 5px;}
      
               
                      </style>
                  </head>
                  <body>
                    
                    <div>
                      <div class="form-type">Form 6 - Back </div>
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
                         
  
                          <div class="main-title">NUTRITIONAL ASSESSMENT FORM</div>



                    
                          <table class="mar-table" style="margin-bottom: 20px;">
                            <tbody>
                              <tr>
                                <td rowspan="2" style="width: 40%; vertical-align: top;">
                                  Diet counseling / Education provided
                                </td>
                                <td style="width: 60%;">
                                  <strong>${formData.dietCounselingProvided || ""}</strong>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                 Patient name: <strong>${patientData?.name || ""}</strong>
                                 <div class="dt-flex">
                                    <span>Sign: <strong>${formData.patientSignature || ""}</strong></span>
                                    <span>Date & Time : <strong>${formData.assessmentDateTime || ""}</strong></span>
                                  </div>
                                </td>
                              </tr>
                              
                              <tr>
                                <td>Date & Time of assessment:</td>
                                <td>
                                  Name of the Dietitian : <strong>${formData.dietitianName || ""}</strong><br/>
                                  <div class="dt-flex2">Signature : <strong>${formData.dietitianSignature || ""}</strong></div>
                                </td>
                              </tr>
                              <tr>
                                <td>Date & Time</td>
                                <td>
                                  Name of the Consultant / Resident : <strong>${formData.consultantName || ""}</strong><br/>
                                 
                                 <div class="dt-flex2">Signature : <strong>${formData.consultantSignature || ""}</strong></div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
      
                          <div class="title-bar">NUTRITIONAL REASSESSMENT</div>
                          <table class="mar-table">
                              <thead>
                                  <tr>
                                      <th style="width: 15%">Date & Time</th>
                                      <th style="width: 28%">Remark</th>
                                      <th style="width: 28%">Prescribed diet </th>
                                      <th style="width: 29%">Name & Sign of dietician </th>
                                  </tr>
                              </thead>
                              <tbody>
                                 ${formData.reassessments
                                   .map(
                                     (row) => `
                                        <tr>
                                            <td>${row.dateTime ? new Date(row.dateTime).toLocaleString() : ""}</td>
                                            <td>${row.remark || ""}</td>
                                            <td>${row.prescribedDiet || ""}</td>
                                            <td>${row.dietitianSign || ""}</td>
                                        </tr>
                                        `,
                                   )
                                   .join("")}
                              </tbody>
                          </table>
    
                        </div>
                        <div class="fs-14">COP-F-19.1-00</div>
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
    <form onSubmit={handleSubmit} className="medical-form compact-form">
      <h2 className="form-title">NUTRITIONAL ASSESSMENT</h2>

      {/* ================= Patient Header (DB Driven – Read Only) ================= */}
      {patientData && (
        <div className="patient-compact-header">
          <div>UHID: {patientData.uhid}</div>
          <div>Patient Name: {patientData.name}</div>
          <div>Age: {patientData.age}</div>
          <div>Gender: {patientData.gender}</div>
          <div>IP No: {patientData.ipNo}</div>
        </div>
      )}

      {/* ================= Upper Nutritional Assessment Section ================= */}
      <fieldset>
        <legend>Nutritional Assessment</legend>

        <label>
          Diet Counseling / Education Provided
          <select
            name="dietCounselingProvided"
            value={formData.dietCounselingProvided}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>

        <label>
          Date & Time of Assessment
          <input
            type="datetime-local"
            name="assessmentDateTime"
            value={formData.assessmentDateTime}
            onChange={handleChange}
          />
        </label>

        <label>
          Name of Dietitian
          <input
            type="text"
            name="dietitianName"
            value={formData.dietitianName}
            onChange={handleChange}
          />
        </label>

        <label>
          Dietitian Signature
          <input
            type="text"
            name="dietitianSignature"
            value={formData.dietitianSignature}
            onChange={handleChange}
          />
        </label>

        <label>
          Name of Consultant / Resident
          <input
            type="text"
            name="consultantName"
            value={formData.consultantName}
            onChange={handleChange}
          />
        </label>

        <label>
          Consultant / Resident Signature
          <input
            type="text"
            name="consultantSignature"
            value={formData.consultantSignature}
            onChange={handleChange}
          />
        </label>
      </fieldset>

      {/* ================= Nutritional Reassessment Section ================= */}
      <h3 style={{ marginTop: "25px" }}>Nutritional Reassessment</h3>

      {formData.reassessments.map((row, index) => (
        <fieldset key={index} style={{ marginBottom: "15px" }}>
          <legend>Reassessment {index + 1}</legend>

          <label>
            Date & Time
            <input
              type="datetime-local"
              value={row.dateTime}
              onChange={(e) =>
                handleReassessmentChange(index, "dateTime", e.target.value)
              }
            />
          </label>

          <label>
            Remark
            <input
              type="text"
              value={row.remark}
              onChange={(e) =>
                handleReassessmentChange(index, "remark", e.target.value)
              }
            />
          </label>

          <label>
            Prescribed Diet
            <input
              type="text"
              value={row.prescribedDiet}
              onChange={(e) =>
                handleReassessmentChange(
                  index,
                  "prescribedDiet",
                  e.target.value,
                )
              }
            />
          </label>

          <label>
            Name & Signature of Dietitian
            <input
              type="text"
              value={row.dietitianSign}
              onChange={(e) =>
                handleReassessmentChange(index, "dietitianSign", e.target.value)
              }
            />
          </label>
        </fieldset>
      ))}

      <button
        type="button"
        className="secondary-btn"
        onClick={addRow}
        style={{ marginBottom: "20px" }}
      >
        + Add Reassessment Entry
      </button>

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Submit Nutritional Reassessment
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
          <span>🖨️</span> Print Nutritional Reassessment
        </button>
      </div>

      {/* <button type="submit" className="submit-btn">
        Submit Nutritional Reassessment
      </button> */}
    </form>
  );
};

export default NutritionalReassessmentForm;
