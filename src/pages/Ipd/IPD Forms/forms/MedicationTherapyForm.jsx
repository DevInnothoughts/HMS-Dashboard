import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const MedicationTherapyForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    allergy: "",
    statMeds: [{}],
    ivInfusion: [{}],
    verbalOrders: [{}],
    bloodSugar: [{}],
    highRiskMeds: [{}],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (section, index, field, value) => {
    const updated = [...formData[section]];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, [section]: updated }));
  };

  const addRow = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], {}],
    }));
  };

  const removeRow = (section, index) => {
    if (formData[section].length > 1) {
      const updated = formData[section].filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, [section]: updated }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ ...formData, patientHeader: patientData });
  };

  const gridContainerStyle = {
    overflowX: "auto",
    marginBottom: "25px",
    paddingBottom: "5px",
  };

  const gridRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr) auto",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
    minWidth: "900px",
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
                      
          
                      .mar-table {
                          width: 100%;
                          border-collapse: collapse;
                          font-family: Arial, sans-serif;
                          font-size: 11px;
                          margin-top: 10px;
                      }
  
                      .mar-table th, .mar-table td {
                          border: 1px solid black;
                          height: 25px; /* Fixed height to match form appearance */
                          padding: 2px 5px;
                      }
  
                      .col-label { width: 15%; } 
                      .col-value { width: 35%; } 
                      .col-admin { width: 6.25%; text-align: center; }
  
                      /* Helper for the Dr. Sign row labels */
                      .dt-flex {
                          display: flex;
                          justify-content: space-around;
                          align-items: center;
                          height: 100%;
                      }
                          .title-bar{margin-top:10px}
  
           
                  </style>
              </head>
              <body>
                
                <div>
                  <div class="form-type">Form 11 - Back</div>
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
                      <div class="main-title">MEDICATION & THERAPY RECORD</div>
                  
  
                      <div class="row">
                          <div class="section-title">Allergy if any :</div>
                          <div class="dotted-line"></div>
                      </div>

                    <div class="title-bar"><b>(STAT) Once Only Medicines</b></div>
                    <table class="mar-table">
                        <thead>
                            <tr class="header-row">
                                <th style="width: 8%">Date</th>
                                <th style="width: 8%">Time</th>
                                <th style="width: 25%">DRUG NAME</th>
                                <th style="width: 10%">Type (TAB/CAP/INJ)</th>
                                <th style="width: 8%">Dose</th>
                                <th style="width: 8%">Unit</th>
                                <th style="width: 10%">Route (IM/IV/SC)</th>
                                <th style="width: 8%">Dr Sign</th>
                                <th style="width: 8%">Admin Time</th>
                                <th style="width: 8%">Nurse Sign</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formData.statMeds
                              .map(
                                (row) => `
                                <tr>
                                    <td>${row.date || ""}</td>
                                    <td>${row.time || ""}</td>
                                    <td>${row.drug || ""}</td>
                                    <td>${row.type || ""}</td>
                                    <td>${row.dose || ""}</td>
                                    <td>${row.unit || ""}</td>
                                    <td>${row.route || ""}</td>
                                    <td></td>
                                    <td></td>
                                    <td>${row.nurse || ""}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>

                    <div class="title-bar"><b>Intravenous Infusion Therapy</b></div>
                    <table class="mar-table">
                        <thead>
                            <tr class="header-row">
                                <th>Date</th>
                                <th>I.V. Fluids</th>
                                <th>Vol</th>
                                <th>Drug Added</th>
                                <th>Dose</th>
                                <th>Rate of Infusion</th>
                                <th>Doctor's Signature</th>
                                <th>Additional Remarks</th>
                                <th>Nurse's Signature</th>
                                <th>Time Started</th>
                                <th>Time Ended</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formData.ivInfusion
                              .map(
                                (row) => `
                                <tr>
                                    <td>${row.date || ""}</td>
                                    <td>${row.fluid || ""}</td>
                                    <td>${row.vol || ""}</td>
                                    <td>${row.drugAdded || ""}</td>
                                    <td>${row.dose || ""}</td>
                                    <td>${row.rate || ""}</td>
                                    <td></td>
                                    <td>${row.remarks || ""}</td>
                                    <td>${row.nurse || ""}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>

                    <div class="title-bar"><b>For Verbal Orders Only</b></div>
                    <table class="mar-table">
                        <thead>
                            <tr class="header-row">
                                <th>Date</th>
                                <th>Time</th>
                                <th>Drug (Approved Name)</th>
                                <th>Dose</th>
                                <th>Route</th>
                                <th>Doctor's Name</th>
                                <th>Read back</th>
                                <th>Nurse's Signature</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formData.verbalOrders
                              .map(
                                (row) => `
                                <tr>
                                    <td>${row.date || ""}</td>
                                    <td>${row.time || ""}</td>
                                    <td>${row.drug || ""}</td>
                                    <td>${row.dose || ""}</td>
                                    <td>${row.route || ""}</td>
                                    <td>${row.doctor || ""}</td>
                                    <td></td>
                                    <td></td>
                                    <td>${row.remarks || ""}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>

                    <div class="title-bar"><b>Report of Blood Sugar Level and Insulin Dose Prescription</b></div>
                    <table class="mar-table">
                        <thead>
                            <tr class="header-row">
                                <th rowspan="2">Date & Time</th>
                                <th rowspan="2">BSL</th>
                                <th rowspan="2">Drug Name</th>
                                <th rowspan="2">Dose</th>
                                <th colspan="2">Test done by</th>
                                <th colspan="2">Doctor's</th>
                                <th colspan="2">Administration by</th>
                                <th colspan="2">Second verification</th>
                                <th rowspan="2">Remarks</th>
                            </tr>
                            <tr class="sub-header">
                                <th>Sign</th><th>Time</th>
                                <th>Name</th><th>Sign</th>
                                <th>Sign</th><th>Time</th>
                                <th>Sign</th><th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formData.bloodSugar
                              .map(
                                (row) => `
                                <tr>
                                    <td>${row.date || ""}</td>
                                    <td>${row.bsl || ""}</td>
                                    <td>${row.drug || ""}</td>
                                    <td>${row.dose || ""}</td>
                                    <td></td><td></td>
                                    <td>${row.doctor || ""}</td><td></td>
                                    <td>${row.nurse || ""}</td><td></td>
                                    <td></td><td></td>
                                    <td></td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>

                    <div class="title-bar" style="display:flex; gap:50%;">
                        <b>High Risk Medication</b> 
                        <div><span style="font-size: 12px;">Allergic to</span></div>
                    </div>
                    <table class="mar-table">
                        <thead>
                            <tr class="header-row">
                                <th rowspan="2">Date & Time</th>
                                <th rowspan="2" style="width: 25%">Drug Name</th>
                                <th rowspan="2">Dose</th>
                                <th colspan="2">Doctor's</th>
                                <th colspan="2">Nurses</th>
                                <th colspan="2">Second verification</th>
                                <th rowspan="2">Remarks</th>
                            </tr>
                            <tr class="sub-header">
                                <th>Name</th><th>Sign</th>
                                <th>Sign</th><th>Time</th>
                                <th>Sign</th><th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formData.highRiskMeds
                              .map(
                                (row) => `
                                <tr>
                                    <td>${row.date || ""}</td>
                                    <td>${row.drug || ""}</td>
                                    <td>${row.dose || ""}</td>
                                    <td>${row.doctor || ""}</td><td></td>
                                    <td>${row.nurse || ""}</td><td></td>
                                    <td></td><td></td>
                                    <td>${row.remarks || ""}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
  
  
                  </div>
                  <div class="fs-14">MOM-F-5.1-00</div>
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
      <h2
        className="form-title"
        style={{
          textAlign: "center",
          backgroundColor: "#80deea",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        MEDICATION & THERAPY RECORD
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

      <div style={{ marginBottom: "30px" }}>
        <TextInput
          label="Allergy (if any)"
          name="allergy"
          value={formData.allergy}
          onChange={handleChange}
          placeholder="Specify allergies or N.A."
        />
      </div>

      {/* STAT Medicines */}
      <h3
        style={{
          color: "#00796b",
          borderBottom: "2px solid #80deea",
          paddingBottom: "8px",
          marginBottom: "15px",
          fontWeight: "bold",
        }}
      >
        (STAT) Once Only Medicines
      </h3>
      <div style={gridContainerStyle}>
        {formData.statMeds.map((row, i) => (
          <div key={i} style={gridRowStyle}>
            <MuiDateTimePicker
              label="Date"
              name="date"
              value={row.date || ""}
              onChange={(e) =>
                handleTableChange("statMeds", i, "date", e.target.value)
              }
              hideLabel
            />
            <TextInput
              label="Drug Name"
              value={row.drug || ""}
              onChange={(e) =>
                handleTableChange("statMeds", i, "drug", e.target.value)
              }
              hideLabel
              placeholder="Drug Name"
            />
            <TextInput
              label="Dose"
              value={row.dose || ""}
              onChange={(e) =>
                handleTableChange("statMeds", i, "dose", e.target.value)
              }
              hideLabel
              placeholder="Dose"
            />
            <TextInput
              label="Route"
              value={row.route || ""}
              onChange={(e) =>
                handleTableChange("statMeds", i, "route", e.target.value)
              }
              hideLabel
              placeholder="Route"
            />
            <TextInput
              label="Nurse Sign"
              value={row.nurse || ""}
              onChange={(e) =>
                handleTableChange("statMeds", i, "nurse", e.target.value)
              }
              hideLabel
              placeholder="Nurse Sign"
            />
            <button
              type="button"
              onClick={() => removeRow("statMeds", i)}
              className="remove-btn"
              title="Remove Row"
              style={{
                visibility: formData.statMeds.length > 1 ? "visible" : "hidden",
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRow("statMeds")}
          className="secondary-btn"
        >
          + Add Row
        </button>
      </div>

      <hr
        style={{
          margin: "30px 0",
          border: "none",
          borderTop: "1px solid #e0f7fa",
        }}
      />

      {/* IV Infusion */}
      <h3
        style={{
          color: "#00796b",
          borderBottom: "2px solid #80deea",
          paddingBottom: "8px",
          marginBottom: "15px",
          fontWeight: "bold",
        }}
      >
        Intravenous Infusion Therapy
      </h3>
      <div style={gridContainerStyle} id="iv-infusion-section">
        {formData.ivInfusion.map((row, i) => (
          <div key={i} style={gridRowStyle}>
            <MuiDateTimePicker
              label="Date"
              name="date"
              value={row.date || ""}
              onChange={(e) =>
                handleTableChange("ivInfusion", i, "date", e.target.value)
              }
              hideLabel
            />
            <TextInput
              label="IV Fluid"
              value={row.fluid || ""}
              onChange={(e) =>
                handleTableChange("ivInfusion", i, "fluid", e.target.value)
              }
              hideLabel
              placeholder="IV Fluid"
            />
            <TextInput
              label="Rate"
              value={row.rate || ""}
              onChange={(e) =>
                handleTableChange("ivInfusion", i, "rate", e.target.value)
              }
              hideLabel
              placeholder="Rate"
            />
            <TextInput
              label="Doctor Sign"
              value={row.doctor || ""}
              onChange={(e) =>
                handleTableChange("ivInfusion", i, "doctor", e.target.value)
              }
              hideLabel
              placeholder="Doctor Sign"
            />
            <TextInput
              label="Nurse Sign"
              value={row.nurse || ""}
              onChange={(e) =>
                handleTableChange("ivInfusion", i, "nurse", e.target.value)
              }
              hideLabel
              placeholder="Nurse Sign"
            />
            <button
              type="button"
              onClick={() => removeRow("ivInfusion", i)}
              className="remove-btn"
              title="Remove Row"
              style={{
                visibility:
                  formData.ivInfusion.length > 1 ? "visible" : "hidden",
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRow("ivInfusion")}
          className="secondary-btn"
        >
          + Add Row
        </button>
      </div>

      <hr
        style={{
          margin: "30px 0",
          border: "none",
          borderTop: "1px solid #e0f7fa",
        }}
      />

      {/* Verbal Orders */}
      <h3
        style={{
          color: "#00796b",
          borderBottom: "2px solid #80deea",
          paddingBottom: "8px",
          marginBottom: "15px",
          fontWeight: "bold",
        }}
      >
        For Verbal Orders Only
      </h3>
      <div style={gridContainerStyle}>
        {formData.verbalOrders.map((row, i) => (
          <div key={i} style={gridRowStyle}>
            <MuiDateTimePicker
              label="Date"
              name="date"
              value={row.date || ""}
              onChange={(e) =>
                handleTableChange("verbalOrders", i, "date", e.target.value)
              }
              hideLabel
            />
            <TextInput
              label="Drug"
              value={row.drug || ""}
              onChange={(e) =>
                handleTableChange("verbalOrders", i, "drug", e.target.value)
              }
              hideLabel
              placeholder="Drug"
            />
            <TextInput
              label="Dose"
              value={row.dose || ""}
              onChange={(e) =>
                handleTableChange("verbalOrders", i, "dose", e.target.value)
              }
              hideLabel
              placeholder="Dose"
            />
            <TextInput
              label="Doctor"
              value={row.doctor || ""}
              onChange={(e) =>
                handleTableChange("verbalOrders", i, "doctor", e.target.value)
              }
              hideLabel
              placeholder="Doctor"
            />
            <TextInput
              label="Remarks"
              value={row.remarks || ""}
              onChange={(e) =>
                handleTableChange("verbalOrders", i, "remarks", e.target.value)
              }
              hideLabel
              placeholder="Remarks"
            />
            <button
              type="button"
              onClick={() => removeRow("verbalOrders", i)}
              className="remove-btn"
              title="Remove Row"
              style={{
                visibility:
                  formData.verbalOrders.length > 1 ? "visible" : "hidden",
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRow("verbalOrders")}
          className="secondary-btn"
        >
          + Add Row
        </button>
      </div>

      <hr
        style={{
          margin: "30px 0",
          border: "none",
          borderTop: "1px solid #e0f7fa",
        }}
      />

      {/* Blood Sugar */}
      <h3
        style={{
          color: "#00796b",
          borderBottom: "2px solid #80deea",
          paddingBottom: "8px",
          marginBottom: "15px",
          fontWeight: "bold",
        }}
      >
        Blood Sugar & Insulin Record
      </h3>
      <div style={gridContainerStyle}>
        {formData.bloodSugar.map((row, i) => (
          <div key={i} style={gridRowStyle}>
            <TextInput
              label="BSL"
              value={row.bsl || ""}
              onChange={(e) =>
                handleTableChange("bloodSugar", i, "bsl", e.target.value)
              }
              hideLabel
              placeholder="BSL"
            />
            <TextInput
              label="Drug"
              value={row.drug || ""}
              onChange={(e) =>
                handleTableChange("bloodSugar", i, "drug", e.target.value)
              }
              hideLabel
              placeholder="Drug"
            />
            <TextInput
              label="Dose"
              value={row.dose || ""}
              onChange={(e) =>
                handleTableChange("bloodSugar", i, "dose", e.target.value)
              }
              hideLabel
              placeholder="Dose"
            />
            <TextInput
              label="Doctor"
              value={row.doctor || ""}
              onChange={(e) =>
                handleTableChange("bloodSugar", i, "doctor", e.target.value)
              }
              hideLabel
              placeholder="Doctor"
            />
            <TextInput
              label="Nurse"
              value={row.nurse || ""}
              onChange={(e) =>
                handleTableChange("bloodSugar", i, "nurse", e.target.value)
              }
              hideLabel
              placeholder="Nurse"
            />
            <button
              type="button"
              onClick={() => removeRow("bloodSugar", i)}
              className="remove-btn"
              title="Remove Row"
              style={{
                visibility:
                  formData.bloodSugar.length > 1 ? "visible" : "hidden",
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRow("bloodSugar")}
          className="secondary-btn"
        >
          + Add Row
        </button>
      </div>

      <hr
        style={{
          margin: "30px 0",
          border: "none",
          borderTop: "1px solid #e0f7fa",
        }}
      />

      {/* High Risk */}
      <h3
        style={{
          color: "#00796b",
          borderBottom: "2px solid #80deea",
          paddingBottom: "8px",
          marginBottom: "15px",
          fontWeight: "bold",
        }}
      >
        High Risk Medication
      </h3>
      <div style={gridContainerStyle}>
        {formData.highRiskMeds.map((row, i) => (
          <div key={i} style={gridRowStyle}>
            <TextInput
              label="Drug"
              value={row.drug || ""}
              onChange={(e) =>
                handleTableChange("highRiskMeds", i, "drug", e.target.value)
              }
              hideLabel
              placeholder="Drug"
            />
            <TextInput
              label="Dose"
              value={row.dose || ""}
              onChange={(e) =>
                handleTableChange("highRiskMeds", i, "dose", e.target.value)
              }
              hideLabel
              placeholder="Dose"
            />
            <TextInput
              label="Doctor"
              value={row.doctor || ""}
              onChange={(e) =>
                handleTableChange("highRiskMeds", i, "doctor", e.target.value)
              }
              hideLabel
              placeholder="Doctor"
            />
            <TextInput
              label="Nurse"
              value={row.nurse || ""}
              onChange={(e) =>
                handleTableChange("highRiskMeds", i, "nurse", e.target.value)
              }
              hideLabel
              placeholder="Nurse"
            />
            <TextInput
              label="Remarks"
              value={row.remarks || ""}
              onChange={(e) =>
                handleTableChange("highRiskMeds", i, "remarks", e.target.value)
              }
              hideLabel
              placeholder="Remarks"
            />
            <button
              type="button"
              onClick={() => removeRow("highRiskMeds", i)}
              className="remove-btn"
              title="Remove Row"
              style={{
                visibility:
                  formData.highRiskMeds.length > 1 ? "visible" : "hidden",
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRow("highRiskMeds")}
          className="secondary-btn"
        >
          + Add Row
        </button>
      </div>

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Complete Medication Review
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
          <span>🖨️</span> Print Medication Review
        </button>
      </div>

      {/* <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            type="submit"
            className="submit-btn"
            style={{ minWidth: "300px" }}
          >
            Complete Medication Review
          </button>
        </div> */}
    </form>
  );
};

export default MedicationTherapyForm;
