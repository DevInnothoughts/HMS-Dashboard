import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const PreOpOrderForm = ({ onSubmit, patientData = {} }) => {
  const [formData, setFormData] = useState({
    uhid: patientData.uhid || "",
    name: patientData.name || "",
    age: patientData.age || "",
    gender: patientData.gender || "",
    ipNo: patientData.ipNo || "",

    vitals: { temp: "", pulse: "", resp: "", bp: "" },
    consents: {
      highRisk: false,
      surgery: false,
      anesthesia: false,
      implant: false,
    },
    preparation: { enema: false, colonHydrotherapy: false },

    investigations: [],
    investigationsOther: "",

    fitness: [],

    medications: {
      antibiotics: [],
      antibioticsOther: "",
      antacid: [],
      fluids: [],
      fluidsOther: "",
      other: "",
    },

    specialRequirements: [],
    specialOther: "",

    doctorName: "",
    dateTime: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleListChange = (section, item) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[section])
        ? prev[section]
        : prev.medications[section];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];

      if (Array.isArray(prev[section])) {
        return { ...prev, [section]: updated };
      } else {
        return {
          ...prev,
          medications: { ...prev.medications, [section]: updated },
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const checkboxStyle = {
    border: "none",
    padding: "4px 0",
    fontSize: "0.85rem",
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
  };

  const isChecked = (section, field, value = null) => {
    // 1. Get the target data safely
    const target = section ? formData[section] : formData;
    if (!target) return "";

    const data = target[field];

    // 2. Handle Booleans (for consents/preparation)
    if (typeof data === "boolean") {
      return data ? "checked" : "";
    }

    // 3. Handle Arrays (for investigations/medications)
    // We use Array.isArray and optional chaining to prevent the '.includes' crash
    if (Array.isArray(data)) {
      return data.includes(value || field) ? "checked" : "";
    }

    return "";
  };

  //   const isChecked = (section, field, value) => {
  //     // Handles both nested objects and top-level fields
  //     const data = section ? formData[section]?.[field] : formData[field];
  //     return data === value ? "checked" : "";
  //   };

  // print form format starts
  // print form format starts
  const generatePrintContent = () => {
    const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                  <title>PRE-OP CHECKLIST</title>
                  <style>
                      @page { margin: 5mm; }
                      body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #333; }
                      .outer-border { border: 3px solid #00a99d; padding: 5px 25px; display: flex; flex-direction: column; min-height: 90vh; }
                      .header-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                      .logo-img { height: 65px; width: auto; margin-top:10px }           
                      .patient-info-block { position: absolute; right: 25px; color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
                      .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
                      
                      .vitals-row { display: flex; align-items: baseline; margin-bottom: 15px; font-size: 13px; gap: 10px; }
                      .line { border-bottom: 1px solid #646363; flex: 1; min-width: 50px; height: 1.2em;  font-weight: normal; }
                      
                      .section-row { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 12px; font-size: 13px; }
                      .checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
                      .box { width: 14px; height: 14px; border: 1px solid #000; position: relative; flex-shrink: 0; }
                      .box.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); color: #333; font-weight: bold; font-size: 14px; }
                      
                      .sub-heading { font-size: 13px; font-weight: bold; margin: 15px 0 8px 0; text-transform: uppercase; }
                      .main-title {    color: #008080;    font-size: 24px;    font-weight: bold;    margin: 10px 0 30px 0;}
                      .medication-grid { display: grid; grid-template-columns: 1.2fr 1.2fr 1fr; gap: 20px; font-size: 13px; margin-top: 5px; }
                      .col-flex { display: flex; flex-direction: column; gap: 5px; }
                      .other-write-line { border-top: 1px solid #333; height: 22px; width: 100%; margin-bottom: 5px; }
                      
                      .indent { margin-left: 30px; }
                      .fs-14 { font-size: 14px; }
                      .footer-flex { margin-top: 15px; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 14px; font-weight: bold; }
                      .checked::after { content: '✓'; position: absolute; top: -4px; left: 1px; font-size: 12px; font-weight: bold; }
                      
                      @media print { .no-print { display: none; } }
                  </style>
              </head>
              <body>
              <div class="form-type">Form 5 - Back</div>
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

                    <div class="main-title">PRE OP ORDER</div>

                    <div class="vitals-row">
                        TEMPERATURE <div class="line">${formData.vitals.temp || ""}</div>
                        PULSE <div class="line">${formData.vitals.pulse || ""}</div>
                        RESPIRATION <div class="line">${formData.vitals.resp || ""}</div>
                        BLOOD PRESSURE <div class="line">${formData.vitals.bp || ""}</div>
                    </div>

                    <div class="section-row">
                        <div class="checkbox-item">CONSENT - HIGH RISK <div class="box ${formData.consents.highRisk ? "checked" : ""}"></div></div>
                        <div class="checkbox-item">SURGERY CONSENT <div class="box ${formData.consents.surgery ? "checked" : ""}"></div></div>
                        <div class="checkbox-item">ANESTHESIA CONSENT <div class="box ${formData.consents.anesthesia ? "checked" : ""}"></div></div>
                        <div class="checkbox-item">IMPLANT CONSENT <div class="box ${formData.consents.implant ? "checked" : ""}"></div></div>
                    </div>

                    <div class="section-row">
                        <div class="checkbox-item">PART PREPARATION 
                            <div class="box ${formData.preparation?.partPreparation ? "checked" : ""}"></div>
                        </div>
                        
                        <div class="checkbox-item">ENEMA 
                            <div class="box ${formData.preparation?.enema ? "checked" : ""}"></div>
                        </div>
                        
                        <div class="checkbox-item">COLON HYDROTHERAPY 
                            <div class="box ${formData.preparation?.colonHydrotherapy ? "checked" : ""}"></div>
                        </div>
                    </div>

                    <div class="sub-heading">PRE- OP INVESTIGATIONS</div>
                    <div class="section-row" style="gap: 10px;">
                        ${[
                          "CBC",
                          "BSL",
                          "CREATININE LEVEL",
                          "BT CT",
                          "PT/INR",
                          "HIV",
                          "HBsAg",
                          "HCV",
                          "USG",
                          "ECG",
                        ]
                          .map(
                            (item) => `
                            <div class="checkbox-item">
                              ${item} 
                              <div class="box ${formData.investigations.includes(item) ? "checked" : ""}"></div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>

                    <div class="section-row" style="margin-top:5px;">
                        <div class="checkbox-item">VENOUS DOPPLER <div class="box ${formData.investigations.includes("VENOUS DOPPLER") ? "checked" : ""}"></div></div>
                        <div class="checkbox-item">CT SCAN <div class="box ${formData.investigations.includes("CT SCAN") ? "checked" : ""}"></div></div>
                        <div class="checkbox-item">X-RAY <div class="box ${formData.investigations.includes("X-RAY") ? "checked" : ""}"></div></div>
                        <div class="checkbox-item">2D ECHO <div class="box ${formData.investigations.includes("2D ECHO") ? "checked" : ""}"></div></div>
                        <div class="checkbox-item">MRI <div class="box ${formData.investigations.includes("MRI") ? "checked" : ""}"></div></div>
                        OTHER: <div class="line" style="flex:2">${formData.investigationsOther || ""}</div>
                    </div>

                    <div style="margin: 10px 0;">
                        <div class="checkbox-item"><div class="box ${formData.fitness.includes("ANESTHESIA") ? "checked" : ""}"></div> ANESTHESIA FITNESS</div>
                        <div class="checkbox-item" style="margin: 6px 0;"><div class="box ${formData.fitness.includes("PHYSICIAN") ? "checked" : ""}"></div> PHYSICIAN FITNESS</div>
                        <div class="checkbox-item"><div class="box ${formData.fitness.includes("CARD AC") ? "checked" : ""}"></div> CARDIAC FITNESS</div>
                    </div>

                    <div class="sub-heading">MEDICATIONS : IV ANTIBIOTICS</div>
                    <div class="medication-grid">
                        <div class="col-flex">
                            <div class="checkbox-item"><div class="box ${formData.medications.antibiotics.includes("Inj. CEFTRIAXONE 1GM IV STAT") ? "checked" : ""}"></div> INJ. CEFTRIAXONE 1GM IV STAT</div>
                            <div class="checkbox-item"><div class="box ${formData.medications.antibiotics.includes("Inj. METRONIDAZOLE 100MG IV STAT") ? "checked" : ""}"></div> INJ. METRONIDAZOLE 500MG IV STAT</div>
                            <div class="checkbox-item"><div class="box ${formData.medications.antibiotics.includes("Inj. AMOXICILLIN + CLAVULANIC ACID 1.2 GM IV STAT") ? "checked" : ""}"></div> INJ. AMOXICILLIN + CLAVULANIC ACID 1.2 GM IV STAT</div>
                            <div class="checkbox-item"><div class="box ${formData.medications.antibiotics.includes("Inj. DEXAMETHASONE 4MG") ? "checked" : ""}"></div> INJ. DEXAMETHASONE 4MG</div>
                            <div class="checkbox-item"><div class="box ${formData.medications.antibiotics.includes("Inj. HYDROCORTISONE 100 MG") ? "checked" : ""}"></div> INJ. HYDROCORTISONE 100 MG</div>
                            <div class="checkbox-item"><div class="box ${formData.medications.antibiotics.includes("Inj. AVIL (PHENIRAMINE) 2ML") ? "checked" : ""}"></div> INJ. AVIL (PHENIRAMINE) 2ML</div>
                        </div>
                        <div class="col-flex">
                            <div class="checkbox-item"><div class="box ${formData.medications.antibiotics.includes("Inj. CEFOTAXIME 1GM IV STAT") ? "checked" : ""}"></div> INJ. CEFOTAXIME 1GM IV STAT</div>
                            <div class="checkbox-item"><div class="box ${formData.medications.antibiotics.includes("Inj. CEFUROXIME 1.5 GM IV STAT") ? "checked" : ""}"></div> INJ. CEFUROXIME 1.5 GM IV STAT</div>
                            <div class="checkbox-item"><div class="box ${formData.medications.antibiotics.includes("Inj. AMIKACIN 750 MG IV STAT") ? "checked" : ""}"></div> INJ. AMIKACIN 750 MG IV STAT</div>
                            <div class="sub-heading" style="margin: 5px 0 2px 0;"><div class="checkbox-item"><div class="box"></div> NEBULIZATION</div></div>
                            <div class="checkbox-item indent"><div class="box"></div> BUDESONIDE</div>
                            <div class="checkbox-item indent"><div class="box"></div> DUOLIN</div>
                            <div class="checkbox-item indent"><div class="box"></div> ASTHALIN</div>
                        </div>
                        <div class="col-flex">
                            <div class="sub-heading" style="margin:0">OTHER</div>
                            <div class="other-write-line" style="font-size: 11px;">${formData.medications.antibioticsOther || ""}</div>
                            <div class="other-write-line"></div>
                            <div class="other-write-line"></div>
                            <div class="other-write-line"></div>
                        </div>
                    </div>

                    <div class="sub-heading">PRE-OP ANTACID</div>
                    <div class="checkbox-item"><div class="box ${formData.medications.antacid.includes("Inj. PAN-40 MG IV STAT") ? "checked" : ""}"></div> INJ. PAN-40 MG IV STAT</div>

                    <div class="sub-heading">IV FLUIDS FOR MAINTENANCE</div>
                    <div class="checkbox-item"><div class="box ${formData.medications.fluids.includes("IVF RL 500ML") ? "checked" : ""}"></div> IVF RL 500ML</div>
                    <div class="checkbox-item" style="margin: 4px 0;"><div class="box ${formData.medications.fluids.includes("IVF NS 500ML") ? "checked" : ""}"></div> IVF NS 500ML</div>
                    <div class="checkbox-item"><div class="box ${formData.medications.fluids.includes("IVF DNS 500ML") ? "checked" : ""}"></div> IVF DNS 500ML</div>
                    <div class="checkbox-item" style="margin-top:5px;">OTHER: <div class="line">${formData.medications.fluidsOther || ""}</div></div>

                    <div class="sub-heading">IF REQUIRED</div>
                    <div class="checkbox-item"><div class="box ${formData.specialRequirements.includes("Inj. HUMAN ACTRAPID INSULIN") ? "checked" : ""}"></div> INJ. HUMEN ACTRAPID INSULIN</div>
                    <div class="checkbox-item" style="margin: 4px 0;"><div class="box ${formData.specialRequirements.includes("BSL MONITORING") ? "checked" : ""}"></div> BSL MONITORING</div>
                    <div class="checkbox-item"><div class="box ${formData.specialRequirements.includes("BLOOD TRANSFUSION") ? "checked" : ""}"></div> BLOOD TRANSFUSION</div>
                    <div class="checkbox-item" style="margin: 4px 0;"><div class="box ${formData.specialRequirements.includes("INFORM SOS") ? "checked" : ""}"></div> INFORM SOS</div>
                    <div class="checkbox-item"><div class="box ${formData.specialRequirements.includes("SHIFT TO OT ON CALL") ? "checked" : ""}"></div> SHIFT TO OT ON CALL</div>

                    <div class="footer-flex">
                        <div>CHECKED BY DOCTORS NAME & SIGN: ${formData.doctorName || ""}</div>
                        <div style="width: 40%; text-align: right;">DATE & TIME: <span style="border-bottom: 1px solid #000; min-width: 180px; display: inline-block;">${formData.dateTime || ""}</span></div>
                    </div>
                </div>
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
  // print form format ends

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <h2
        style={{
          color: "#80deea",
          borderBottom: "2px solid #80deea",
          paddingBottom: "10px",
          marginBottom: "25px",
        }}
      >
        PRE OP ORDER
      </h2>

      {/* Compact Patient Header */}
      <div className="patient-compact-header">
        <div className="info-item">
          <span className="info-label">UHID</span>
          <span className="info-value">{formData.uhid}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Patient Name</span>
          <span className="info-value">{formData.name}</span>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
        }}
      >
        <TextInput
          label="TEMP"
          name="vitals.temp"
          value={formData.vitals.temp}
          onChange={handleChange}
        />
        <TextInput
          label="PULSE"
          name="vitals.pulse"
          value={formData.vitals.pulse}
          onChange={handleChange}
        />
        <TextInput
          label="RESP"
          name="vitals.resp"
          value={formData.vitals.resp}
          onChange={handleChange}
        />
        <TextInput
          label="BP"
          name="vitals.bp"
          value={formData.vitals.bp}
          onChange={handleChange}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "10px",
        }}
      >
        <div className="form-field">
          <label className="field-label">CONSENT</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {[
              ["highRisk", "HIGH RISK"],
              ["surgery", "SURGERY"],
              ["anesthesia", "ANESTHESIA"],
              ["implant", "IMPLANT"],
            ].map(([key, label]) => (
              <label key={key} className="checkbox-label" style={checkboxStyle}>
                <input
                  type="checkbox"
                  name={`consents.${key}`}
                  checked={formData.consents[key]}
                  onChange={handleChange}
                />
                <span style={{ marginLeft: "4px" }}>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label className="field-label">PART PREPARATION</label>
          <div style={{ display: "flex", gap: "15px" }}>
            {[
              ["enema", "ENEMA"],
              ["colonHydrotherapy", "COLON HYDROTHERAPY"],
            ].map(([key, label]) => (
              <label key={key} className="checkbox-label" style={checkboxStyle}>
                <input
                  type="checkbox"
                  name={`preparation.${key}`}
                  checked={formData.preparation[key]}
                  onChange={handleChange}
                />
                <span style={{ marginLeft: "4px" }}>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <h3>PRE-OP INVESTIGATIONS</h3>
      <div style={gridStyle}>
        {[
          "CBC",
          "BSL",
          "CREATININE LEVEL",
          "BT CT",
          "PT/INR",
          "HIV",
          "HBsAg",
          "HCV",
          "USG",
          "ECG",
          "VENOUS DOPPLER",
          "CT SCAN",
          "X-RAY",
          "2D ECHO",
          "MRI",
        ].map((item) => (
          <label key={item} className="checkbox-label" style={checkboxStyle}>
            <input
              type="checkbox"
              checked={formData.investigations.includes(item)}
              onChange={() => handleListChange("investigations", item)}
            />
            <span style={{ marginLeft: "4px" }}>{item}</span>
          </label>
        ))}
        <TextInput
          placeholder="OTHER"
          name="investigationsOther"
          value={formData.investigationsOther}
          onChange={handleChange}
          style={{ gridColumn: "span 2" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          margin: "10px 0",
          alignItems: "center",
        }}
      >
        <label className="field-label" style={{ marginBottom: 0 }}>
          FITNESS:
        </label>
        {["ANESTHESIA", "PHYSICIAN", "CARD AC"].map((item) => (
          <label key={item} className="checkbox-label" style={checkboxStyle}>
            <input
              type="checkbox"
              checked={formData.fitness.includes(item)}
              onChange={() => handleListChange("fitness", item)}
            />
            <span style={{ marginLeft: "4px" }}>{item}</span>
          </label>
        ))}
      </div>

      <h3>MEDICATIONS: IV ANTIBIOTICS</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        {[
          "Inj. CEFTRIAXONE 1GM IV STAT",
          "Inj. METRONIDAZOLE 100MG IV STAT",
          "Inj. AMOXICILLIN + CLAVULANIC ACID 1.2 GM IV STAT",
          "Inj. DEXAMETHASONE 4MG",
          "Inj. HYDROCORTISONE 100 MG",
          "Inj. AVIL (PHENIRAMINE) 2ML",
          "Inj. CEFOTAXIME 1GM IV STAT",
          "Inj. CEFUROXIME 1.5 GM IV STAT",
          "Inj. AMIKACIN 750 MG IV STAT",
        ].map((item) => (
          <label key={item} className="checkbox-label" style={checkboxStyle}>
            <input
              type="checkbox"
              checked={formData.medications.antibiotics.includes(item)}
              onChange={() => handleListChange("antibiotics", item)}
            />
            <span style={{ marginLeft: "4px", fontSize: "0.75rem" }}>
              {item}
            </span>
          </label>
        ))}
        <label className="checkbox-label" style={checkboxStyle}>
          <input
            type="checkbox"
            checked={formData.medications.antibiotics.includes("Other")}
            onChange={() => handleListChange("antibiotics", "Other")}
          />
          <span style={{ marginLeft: "4px", fontSize: "0.75rem" }}>Other</span>
        </label>
      </div>
      {formData.medications.antibiotics.includes("Other") && (
        <div style={{ marginTop: "5px" }}>
          <TextInput
            placeholder="Specify other antibiotics"
            name="medications.antibioticsOther"
            value={formData.medications.antibioticsOther}
            onChange={handleChange}
          />
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "10px",
        }}
      >
        <div className="form-field">
          <label className="field-label">PRE-OP ANTACID</label>
          <label className="checkbox-label" style={checkboxStyle}>
            <input
              type="checkbox"
              checked={formData.medications.antacid.includes(
                "Inj. PAN-40 MG IV STAT",
              )}
              onChange={() =>
                handleListChange("antacid", "Inj. PAN-40 MG IV STAT")
              }
            />
            <span style={{ marginLeft: "4px" }}>Inj. PAN-40 MG IV STAT</span>
          </label>
        </div>
        <div className="form-field">
          <label className="field-label">IV FLUIDS FOR MAINTENANCE</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {["IVF RL 500ML", "IVF NS 500ML", "IVF DNS 500ML"].map((item) => (
              <label
                key={item}
                className="checkbox-label"
                style={checkboxStyle}
              >
                <input
                  type="checkbox"
                  checked={formData.medications.fluids.includes(item)}
                  onChange={() => handleListChange("fluids", item)}
                />
                <span style={{ marginLeft: "4px", fontSize: "0.8rem" }}>
                  {item}
                </span>
              </label>
            ))}
            <label className="checkbox-label" style={checkboxStyle}>
              <input
                type="checkbox"
                checked={formData.medications.fluids.includes("Other")}
                onChange={() => handleListChange("fluids", "Other")}
              />
              <span style={{ marginLeft: "4px", fontSize: "0.8rem" }}>
                Other
              </span>
            </label>
          </div>
          {formData.medications.fluids.includes("Other") && (
            <div style={{ marginTop: "5px" }}>
              <TextInput
                placeholder="Specify other fluids"
                name="medications.fluidsOther"
                value={formData.medications.fluidsOther}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      </div>

      <div className="form-field">
        <label className="field-label">IF REQUIRED</label>
        <div style={gridStyle}>
          {[
            "Inj. HUMAN ACTRAPID INSULIN",
            "BSL MONITORING",
            "BLOOD TRANSFUSION",
            "INFORM SOS",
            "SHIFT TO OT ON CALL",
          ].map((item) => (
            <label key={item} className="checkbox-label" style={checkboxStyle}>
              <input
                type="checkbox"
                checked={formData.specialRequirements.includes(item)}
                onChange={() => handleListChange("specialRequirements", item)}
              />
              <span style={{ marginLeft: "4px", fontSize: "0.75rem" }}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <TextInput
          label="CHECKED BY DOCTOR'S NAME"
          name="doctorName"
          value={formData.doctorName}
          onChange={handleChange}
        />
        <MuiDateTimePicker
          label="DATE & TIME"
          name="dateTime"
          value={formData.dateTime}
          onChange={handleChange}
        />
      </div>

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Submit Pre Op Order
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
          <span>🖨️</span> Print Pre Op Order
        </button>
      </div>

      {/* <button type="submit" className="submit-btn">
          Submit Pre Op Order
        </button> */}
    </form>
  );
};

export default PreOpOrderForm;
