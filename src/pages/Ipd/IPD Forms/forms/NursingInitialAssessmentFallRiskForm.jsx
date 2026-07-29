import React, { useState } from "react";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const NursingInitialAssessment = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    morseFallScale: {
      historyOfFalling: "",
      secondaryDiagnosis: "",
      ambulatoryAid: "",
      ivHeparin: "",
      gait: "",
      mentalStatus: "",
    },
    painScore: "",
    painLocation: "",
    bradenScore: "",
    pressureSore: {
      existing: false,
      prospective: false,
    },
    devices: {
      centralLine: { present: "", date: "" },
      foleys: { present: "", date: "" },
      peripheralLine: { present: "", date: "" },
      rt: { present: "", date: "" },
      other: { present: "", date: "" },
    },
    assessmentBy: "",
    assessmentDate: "",
    assessmentTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeviceChange = (device, field, value) => {
    setFormData((prev) => ({
      ...prev,
      devices: {
        ...prev.devices,
        [device]: {
          ...prev.devices[device],
          [field]: value,
        },
      },
    }));
  };

  const handleMorseChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      morseFallScale: {
        ...prev.morseFallScale,
        [field]: value,
      },
    }));
  };

  const morseScores = {
    historyOfFalling: { Yes: 25, No: 0 },
    secondaryDiagnosis: { Yes: 15, No: 0 },
    ambulatoryAid: {
      "Bed rest / Nurse assist": 0,
      "Crutches / cane / walker": 15,
      Furniture: 30,
    },
    ivHeparin: { Yes: 20, No: 0 },
    gait: {
      "Normal / Bedrest / Immobile": 0,
      Weak: 10,
      Impaired: 20,
    },
    mentalStatus: {
      "Oriented to own ability": 0,
      "Forgets limitation": 15,
    },
  };

  const totalMorseScore =
    (morseScores.historyOfFalling[formData.morseFallScale.historyOfFalling] ||
      0) +
    (morseScores.secondaryDiagnosis[
      formData.morseFallScale.secondaryDiagnosis
    ] || 0) +
    (morseScores.ambulatoryAid[formData.morseFallScale.ambulatoryAid] || 0) +
    (morseScores.ivHeparin[formData.morseFallScale.ivHeparin] || 0) +
    (morseScores.gait[formData.morseFallScale.gait] || 0) +
    (morseScores.mentalStatus[formData.morseFallScale.mentalStatus] || 0);

  const morseRisk =
    totalMorseScore >= 50
      ? "High Risk"
      : totalMorseScore >= 25
        ? "Low Risk"
        : "No Risk";

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
            <title>ADMISSION DETAILS</title>
            <style>
                @page { margin: 5mm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #333; }
                .outer-border { border: 3px solid #00a99d; padding: 20px; display: flex; flex-direction: column; min-height: 95vh; }
                .header-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .logo-img { height: 65px; width: auto; }           
                .patient-info-block { color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
                .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
                .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 30px 0; }
                .box { width: 12px; height: 12px; border: 1px solid #000; position: relative; }
                .box.checked { background-color: #00bcd4; border-color: #00bcd4; }
                .box.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); color: #333; font-weight: bold; font-size: 14px; }
                .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px; }
                .scale-container { display: flex; gap: 20px; margin-top: 10px; }
                .left-panel { flex: 1.2; }
                .right-panel { flex: 1; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px; }
                th, td { border: 1px solid #333; padding: 4px 8px; text-align: left; }
                th { background-color: #f2f2f2; color: #008080; }
                .score-col { width: 60px; }
                .sub-text { font-style: italic; font-size: 10px; color: #555; display: block; }
                .device-section { margin-top: 20px; font-size: 14px; }
                .device-row { display: flex; align-items: center; margin-bottom: 10px; }
                .checkbox-group { display: flex; align-items: center; gap: 15px; margin: 0 20px; }
                .cb-item { display: flex; align-items: center; gap: 5px; font-weight: normal; }
                .box { width: 14px; height: 14px; border: 1px solid #333; display: inline-block; }
                .line-dotted { border-bottom: 1px dotted #333; flex: 1; min-width: 200px; height: 20px; margin-left: 5px; display: inline-block; }
                .footer-section { margin-top: auto; padding-top: 20px; border-top: 1px solid #ccc; }
                .sig-row { display: flex; justify-content: space-between; margin-top: 20px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
        <div class="form-type">Form 19 - Front</div>
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

                <div class="main-title">NURSING INITIAL ASSESSMENTS</div>

                <div class="label-teal" style="font-size: 18px;">Morse fall scale-</div>
                <div class="scale-container">
                    <div class="left-panel">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width:30px">Sr No</th>
                                    <th>Criteria for rating</th>
                                    <th style="width:80px">Scale</th>
                                    <th class="score-col">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td><b>History of falling:</b><span class="sub-text">Immediate or within last 3 months</span></td>
                                    <td>Yes (25) / No (0)</td>
                                    <td>${morseScores.historyOfFalling[formData.morseFallScale.historyOfFalling] || 0}</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td><b>Secondary diagnosis</b></td>
                                    <td>Yes (15) / No (0)</td>
                                    <td>${morseScores.secondaryDiagnosis[formData.morseFallScale.secondaryDiagnosis] ?? 0}</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td><b>Ambulatory aid:</b><br><span class="sub-text">Bed rest/Nurse assist (0)<br>Crutches/cane/walker (15)<br>Furniture (30)</span></td>
                                    <td>0 / 15 / 30</td>
                                    <td>${morseScores.ambulatoryAid[formData.morseFallScale.ambulatoryAid] ?? 0}</td>
                                </tr>
                                <tr>
                                    <td>4</td>
                                    <td><b>IV / Heparin Lock:</b></td>
                                    <td>Yes (20) / No (0)</td>
                                    <td>${morseScores.ivHeparin[formData.morseFallScale.ivHeparin] ?? 0}</td>
                                </tr>
                                <tr>
                                    <td>5</td>
                                    <td><b>Gait / Transferring:</b><br><span class="sub-text">Normal/Bedrest/Immobile (0)<br>Weak (10)<br>Impaired (20)</span></td>
                                    <td>0 / 10 / 20</td>
                                    <td>${morseScores.gait[formData.morseFallScale.gait] ?? 0}</td>
                                </tr>
                                <tr>
                                    <td>6</td>
                                    <td><b>Mental status:</b><br><span class="sub-text">Oriented to own ability (0)<br>Forgets limitation (15)</span></td>
                                    <td>0 / 15</td>
                                    <td>${morseScores.mentalStatus[formData.morseFallScale.mentalStatus] ?? 0}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" style="text-align:right; font-weight:bold">Total Score</td>
                                    <td>${totalMorseScore}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="right-panel">
                        <div class="label-teal" style="font-size: 18px; margin-bottom: 5px;">Interpretation-</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Risk level:</th>
                                    <th>MFS score</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="${morseRisk === "No Risk" ? "background:#e0f7fa; font-weight:bold" : ""}"><td>No risk</td><td>0 - 24</td><td>Good basic nursing care</td></tr>
                                <tr style="${morseRisk === "Low Risk" ? "background:#e0f7fa; font-weight:bold" : ""}"><td>Low risk</td><td>25 - 50</td><td>Implement Standard Fall prevention</td></tr>
                                <tr style="${morseRisk === "High Risk" ? "background:#e0f7fa; font-weight:bold" : ""}"><td>High risk</td><td>>= 50</td><td>Implement high risk fall Prevention</td></tr>
                            </tbody>
                        </table>

                        <div style="font-weight:bold; font-size:11px; margin-top:10px;">Standard fall prevention actions</div>
                        <table style="font-size:10px">
                            <tr><td>1</td><td>Identify as vulnerable</td></tr>
                            <tr><td>2</td><td>Educate regarding ambulation with assistance</td></tr>
                            <tr><td>3</td><td>Bed pan for necessities; do not allow out of bed</td></tr>
                            <tr><td>4</td><td>Taper medicines if possible</td></tr>
                        </table>

                        <div style="font-weight:bold; font-size:11px; margin-top:10px;">High risk fall prevention actions</div>
                        <table style="font-size:10px">
                            <tr><td>1</td><td>Identify as vulnerable</td></tr>
                            <tr><td>2</td><td>One relative/attendant should be with patient at all times</td></tr>
                            <tr><td>3</td><td>Patient should be regularly assessed for fall risk</td></tr>
                        </table>
                    </div>
                </div>

                <div class="device-section">
                    <div style="margin-bottom:15px">Pain score: <span class="line-dotted">${formData.painScore || ""}</span> Location: <span class="line-dotted">${formData.painLocation || ""}</span></div>
                    <div style="margin-bottom:15px">Braden score: <span class="line-dotted">${formData.bradenScore || ""}</span>
                    Pressure sore:

                      <span class="cb-item" style="display:inline-flex">
                        <span class="box ${formData.pressureSore.existing ? "checked" : ""}"></span>
                        Existing
                      </span>

                      <span class="cb-item" style="display:inline-flex">
                        <span class="box ${formData.pressureSore.prospective ? "checked" : ""}"></span>
                        Prospective
                      </span>
                     </div>
                    
                   <div style="margin-bottom:10px; font-weight: bold;">Patient having devices:</div>
                    ${Object.entries(formData.devices)
                      .map(
                        ([key, device]) => `
                        <div class="device-row">
                            <div style="width: 150px; text-transform: capitalize;">${key.replace(/([A-Z])/g, " $1")}</div>
                            <div class="checkbox-group">
                                <span class="cb-item">
                                    <span class="box ${device.present === "Yes" ? "checked" : ""}"></span> Yes
                                </span>
                                <span class="cb-item">
                                    <span class="box ${device.present === "No" ? "checked" : ""}"></span> No
                                </span>
                            </div>
                            <span>If Yes: <b>Date</b></span>
                            <span class="line-dotted" style="width: 150px; border-bottom: 1px dotted #333; display: inline-block;">
                                ${device.date || ""}
                            </span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>

                <div class="footer-section">
                    <div>Assessment done by (Name & Sign): <span class="line-dotted" style="display:inline-block; width:400px">${formData.assessmentBy || ""}</span></div>
                    <div class="sig-row">
                        <div>Date: <span class="line-dotted">${formData.assessmentDate || ""}</span></div>
                        <div>Time: <span class="line-dotted">${formData.assessmentTime || ""}</span></div>
                    </div>
                </div>
                
            </div>
            <div style="font-size: 10px; margin-top: 10px;">AAC-F-4.1-00</div>
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
    <form className="medical-form compact-form" onSubmit={handleSubmit}>
      <h2 className="form-title">NURSING INITIAL ASSESSMENT</h2>

      {/* Patient Header (DB driven) */}
      {patientData && (
        <div className="patient-compact-header">
          <div>UHID: {patientData.uhid}</div>
          <div>Name: {patientData.name}</div>
          <div>Age: {patientData.age}</div>
          <div>Gender: {patientData.gender}</div>
          <div>IP No: {patientData.ipNo}</div>
        </div>
      )}

      {/* ================= Morse Fall Scale ================= */}
      <h3>Morse Fall Scale</h3>

      {[
        ["historyOfFalling", "History of falling (last 3 months)"],
        ["secondaryDiagnosis", "Secondary diagnosis"],
        ["ambulatoryAid", "Ambulatory aid"],
        ["ivHeparin", "IV / Heparin Lock"],
        ["gait", "Gait / Transferring"],
        ["mentalStatus", "Mental status"],
      ].map(([field, label]) => (
        <fieldset key={field}>
          <legend>{label}</legend>
          {Object.keys(morseScores[field]).map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={field}
                checked={formData.morseFallScale[field] === option}
                onChange={() => handleMorseChange(field, option)}
              />
              {option} ({morseScores[field][option]})
            </label>
          ))}
        </fieldset>
      ))}

      <div style={{ fontWeight: "bold", marginTop: "10px" }}>
        Total Morse Score: {totalMorseScore}
      </div>
      <div>
        Risk Level: <strong>{morseRisk}</strong>
      </div>

      {/* ================= Pain & Pressure ================= */}
      <h3>Pain & Pressure Assessment</h3>

      <label>
        Pain Score
        <input
          name="painScore"
          value={formData.painScore}
          onChange={handleChange}
        />
      </label>

      <label>
        Pain Location
        <input
          name="painLocation"
          value={formData.painLocation}
          onChange={handleChange}
        />
      </label>

      <label>
        Braden Score
        <input
          name="bradenScore"
          value={formData.bradenScore}
          onChange={handleChange}
        />
      </label>

      <div>
        <strong>Pressure Sore:</strong>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="checkbox"
            checked={formData.pressureSore.existing}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pressureSore: {
                  ...prev.pressureSore,
                  existing: e.target.checked,
                },
              }))
            }
          />{" "}
          Existing
        </label>

        <label style={{ marginLeft: "15px" }}>
          <input
            type="checkbox"
            checked={formData.pressureSore.prospective}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pressureSore: {
                  ...prev.pressureSore,
                  prospective: e.target.checked,
                },
              }))
            }
          />{" "}
          Prospective
        </label>
      </div>

      {/* ================= Devices ================= */}
      <h3>Patient Having Devices</h3>

      {Object.keys(formData.devices).map((device) => (
        <fieldset key={device}>
          <legend>{device}</legend>

          <label>
            <input
              type="radio"
              checked={formData.devices[device].present === "Yes"}
              onChange={() => handleDeviceChange(device, "present", "Yes")}
            />{" "}
            Yes
          </label>

          <label>
            <input
              type="radio"
              checked={formData.devices[device].present === "No"}
              onChange={() => handleDeviceChange(device, "present", "No")}
            />{" "}
            No
          </label>

          {formData.devices[device].present === "Yes" && (
            <input
              type="date"
              value={formData.devices[device].date}
              onChange={(e) =>
                handleDeviceChange(device, "date", e.target.value)
              }
            />
          )}
        </fieldset>
      ))}

      {/* ================= Assessment (ONE LINE) ================= */}
      <h3>Assessment</h3>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <label style={{ flex: 2 }}>
          Assessment done by (Name & Sign)
          <input
            name="assessmentBy"
            value={formData.assessmentBy}
            onChange={handleChange}
          />
        </label>

        <label style={{ flex: 1 }}>
          Date
          <input
            type="date"
            name="assessmentDate"
            value={formData.assessmentDate}
            onChange={handleChange}
          />
        </label>

        <label style={{ flex: 1 }}>
          Time
          <input
            type="time"
            name="assessmentTime"
            value={formData.assessmentTime}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Finalize Nursing Assessment
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
          <span>🖨️</span> Print Nursing Assessment
        </button>
      </div>

      {/* <button
        type="submit"
        className="submit-btn"
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "1.1rem",
          backgroundColor: "#80deea",
          fontWeight: "bold",
        }}
      >
        Finalize Nursing Assessment
      </button> */}
    </form>
  );
};

export default NursingInitialAssessment;
