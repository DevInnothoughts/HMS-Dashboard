import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Textarea from "../inputs/Textarea";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import RadioGroup from "../inputs/RadioGroup";
import CheckboxGroup from "../inputs/CheckboxGroup";
import SelectInput from "../inputs/SelectInput";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const NursingInitialAssessmentForm = ({ onSubmit, patientData = {} }) => {
  const [formData, setFormData] = useState({
    uhid: patientData.uhid || "",
    name: patientData.name || "",
    age: patientData.age || "",
    gender: patientData.gender || "",
    ipNo: patientData.ipNo || "",

    patientReceivedDate: "",
    patientReceivedTime: "",
    generalConsentTaken: "",
    idBand: "",
    language: "",
    temp: "",
    bp: "",
    pulse: "",
    rr: "",

    valuables: "", // With patient, Given to relative
    vulnerablePatient: "",

    neurological: {},
    cardiovascular: {},
    urinary: {},
    respiratory: {},
    gastrointestinal: {},
    skin: {},
    communication: {},
    allergies: {},

    walking: "",
    eating: "",
    dressing: "",
    bathing: "",
    toileting: "",

    // Fall Risk and other bottom sections
    morseFallScore: "",
    riskLevel: "",
    painScore: "",
    painLocation: "",
    bradenScore: "",
    pressureSore: "",
    devices: {},
    assessmentDoneByName: "",
    assessmentDate: "",
    assessmentTime: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === "checkbox" ? (checked ? "Yes" : "No") : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (checked ? "Yes" : "No") : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const yesNoOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  const functionalOptions = [
    { value: "Independent", label: "Indep" },
    { value: "Assistant", label: "Assist" },
    { value: "Dependent", label: "Dep" },
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
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const AssessmentSection = ({ title, section, items, icon }) => (
    <div style={cardStyle}>
      <div style={sectionHeaderStyle}>
        <span style={{ fontSize: "1.2rem" }}>{icon}</span> {title}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "15px",
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f9f9f9",
              padding: "8px 12px",
              borderRadius: "8px",
            }}
          >
            <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>
              {item}
            </span>
            <RadioGroup
              name={`${section}.${item}`}
              value={formData[section][item]}
              onChange={handleChange}
              options={yesNoOptions}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const displayVal = (val) => val || "_______";
  const isChecked = (section, field, value) => {
    // Handles both nested objects and top-level fields
    const data = section ? formData[section]?.[field] : formData[field];
    return data === value ? "checked" : "";
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

                    .line { border-bottom: 1px solid #000; flex: 1; padding: 0 5px; min-height: 15px; display:inline-block;}
                            /* System Grid */
                    .systems-container { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr 1fr; 
                        border-top: 1px solid #000; 
                        border-left: 1px solid #000;
                        margin-top: 10px;
                    }
                    .system-box { border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 6px; }
                    .system-title { font-weight: bold; margin-bottom: 10px;  }
                    
                    /* Items and Checkboxes */
                    .item-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
                    .checkbox-group { display: flex; gap: 8px; }
                    .box-wrap { display: flex; align-items: center; gap: 4px; }
                    .box { width: 12px; height: 12px; border: 1px solid #000; position: relative; }
                    .checked::after { content: '✓'; position: absolute; top: -4px; left: 1px; font-size: 12px; font-weight: bold; }

                    /* Functional Section */
                    .functional-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; margin-top: 5px; }
                   
                  </style>
              </head>
              <body>
                
                <div>
                  <div class="form-type">Form 12 - Front</div>
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
                  
                        <div class="row fs-14">
                            Patient received Date: <div class="dotted-line">${formData.patientReceivedDate || ""}</div>
                            Time: <div class="dotted-line">${formData.patientReceivedTime || ""}</div> 
                        </div>

                        <div class="row fs-14">
                            <div style="display: flex; gap: 15px;">
                                <span>General consent taken:</span>
                                <div class="box-wrap"><div class="box ${isChecked(null, "generalConsentTaken", "Yes")}"></div> Yes</div>
                                <div class="box-wrap"><div class="box ${isChecked(null, "generalConsentTaken", "No")}"></div> No</div>
                            </div>
                            <div style="display: flex; gap: 15px; margin-left: 20px;">
                            <span style="margin-left:20px">ID Band:</span>
                            <div class="box-wrap"><div class="box ${isChecked(null, "idBand", "Yes")}"></div> Yes</div>
                            <div class="box-wrap"><div class="box ${isChecked(null, "idBand", "No")}"></div> No</div>
                            </div>
                        </div>

                        <div class="row fs-14">
                            <span>Language: <span class="line">${formData.language}</span></span>
                            <span>Temp: <span class="line">${formData.temp}</span></span>
                            <span>B.P: <span class="line">${formData.bp}</span></span>
                            <span>Pulse: <span class="line">${formData.pulse}</span></span>
                            <span>RR: <span class="line">${formData.rr}</span></span>
                        </div>

                       <div class="row fs-14">
                            <div style="display: flex; gap: 15px;">
                                <span>Valuables / Belongings</span>
                                <div class="box-wrap"><div class="box ${isChecked(null, "generalConsentTaken", "Yes")}"></div> With patient</div>
                                <div class="box-wrap"><div class="box ${isChecked(null, "generalConsentTaken", "No")}"></div> Given to patient</div>
                            </div>
                        </div>

                        <div class="row fs-14">
                            <div style="display: flex; gap: 15px;">
                                <span>Vulnerable patient : </span>
                                <div class="box-wrap"><div class="box ${isChecked(null, "generalConsentTaken", "Yes")}"></div> Yes</div>
                                <div class="box-wrap"><div class="box ${isChecked(null, "generalConsentTaken", "No")}"></div> No</div>
                            </div>
                        </div>

                        <div class="systems-container">
                            <div class="system-box">
                                <div class="system-title">Neurological</div>
                                ${[
                                  "Paralysis",
                                  "Dizziness",
                                  "Oriented",
                                  "Responsive",
                                ]
                                  .map(
                                    (item) => `
                                    <div class="item-row">
                                        <span>${item}</span>
                                        <div class="checkbox-group">
                                            <div class="box-wrap"><div class="box ${isChecked("neurological", item, "Yes")}"></div> Yes</div>
                                            <div class="box-wrap"><div class="box ${isChecked("neurological", item, "No")}"></div> No</div>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>

                            <div class="system-box">
                                <div class="system-title">Cardiovascular</div>
                                ${[
                                  "Chest pain",
                                  "Hypertensive",
                                  "Hypotensive",
                                  "Pulse regular",
                                ]
                                  .map(
                                    (item) => `
                                    <div class="item-row">
                                        <span>${item}</span>
                                        <div class="checkbox-group">
                                            <div class="box-wrap"><div class="box ${isChecked("cardiovascular", item, "Yes")}"></div> Yes</div>
                                            <div class="box-wrap"><div class="box ${isChecked("cardiovascular", item, "No")}"></div> No</div>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>

                            <div class="system-box">
                                <div class="system-title">Urinary</div>
                                ${[
                                  "Catheter",
                                  "Retention",
                                  "Haematuria",
                                  "Incontinence",
                                ]
                                  .map(
                                    (item) => `
                                    <div class="item-row">
                                        <span>${item}</span>
                                        <div class="checkbox-group">
                                            <div class="box-wrap"><div class="box ${isChecked("urinary", item, "Yes")}"></div> Yes</div>
                                            <div class="box-wrap"><div class="box ${isChecked("urinary", item, "No")}"></div> No</div>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>

                            <div class="system-box">
                                <div class="system-title">Respiratory</div>
                                ${[
                                  "Gasping",
                                  "Tachypnea",
                                  "Bradypnea",
                                  "Dyspnea",
                                  "Cough",
                                ]
                                  .map(
                                    (item) => `
                                    <div class="item-row">
                                        <span>${item}</span>
                                        <div class="checkbox-group">
                                            <div class="box-wrap"><div class="box ${isChecked("respiratory", item, "Yes")}"></div> Yes</div>
                                            <div class="box-wrap"><div class="box ${isChecked("respiratory", item, "No")}"></div> No</div>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>

                            <div class="system-box" style="grid-column: span 2;">
                                <div class="system-title">Gastro-Intestinal</div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <div>
                                    ${[
                                      "Constipation",
                                      "Distention",
                                      "Nausea",
                                      "Diarrhea",
                                    ]
                                      .map(
                                        (item) => `
                                        <div class="item-row">
                                            <span>${item}</span>
                                            <div class="checkbox-group">
                                                <div class="box-wrap"><div class="box ${isChecked("gastrointestinal", item, "Yes")}"></div> Yes</div>
                                                <div class="box-wrap"><div class="box ${isChecked("gastrointestinal", item, "No")}"></div> No</div>
                                            </div>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                    </div>
                                    <div>
                                    ${[
                                      "Tenderness",
                                      "Vomiting",
                                      "Colostomy",
                                      "NBM",
                                    ]
                                      .map(
                                        (item) => `
                                        <div class="item-row">
                                            <span>${item}</span>
                                            <div class="checkbox-group">
                                                <div class="box-wrap"><div class="box ${isChecked("gastrointestinal", item, "Yes")}"></div> Yes</div>
                                                <div class="box-wrap"><div class="box ${isChecked("gastrointestinal", item, "No")}"></div> No</div>
                                            </div>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                    </div>
                                </div>
                            </div>

                            <div class="system-box">
                                <div class="system-title">Skin</div>
                                ${[
                                  "Pale",
                                  "Cyanotic",
                                  "Dehydration",
                                  "Jaundiced",
                                  "Normal",
                                ]
                                  .map(
                                    (item) => `
                                    <div class="item-row">
                                        <span>${item}</span>
                                        <div class="checkbox-group">
                                            <div class="box-wrap"><div class="box ${isChecked("skin", item, "Yes")}"></div> Yes</div>
                                            <div class="box-wrap"><div class="box ${isChecked("skin", item, "No")}"></div> No</div>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>

                            <div class="system-box">
                                <div class="system-title">Communication</div>
                                ${["Vision", "Hearing", "Speech", "Obey"]
                                  .map(
                                    (item) => `
                                    <div class="item-row">
                                        <span>${item}</span>
                                        <div class="checkbox-group">
                                            <div class="box-wrap"><div class="box ${isChecked("communication", item, "OK")}"></div> OK</div>
                                            
                                            <div class="box-wrap"><div class="box ${isChecked("communication", item, "Impaired")}"></div> Impaired</div>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>

                            <div class="system-box">
                                <div class="system-title">Allergies / Adverse Reaction</div>
                                ${[
                                  "Medication/Drug",
                                  "Blood transfusion",
                                  "Food",
                                ]
                                  .map(
                                    (item) => `
                                    <div class="item-row">
                                        <span>${item}</span>
                                        <div class="checkbox-group">
                                            <div class="box-wrap"><div class="box ${isChecked("allergies", item, "Yes")}"></div> Yes</div>

                                            <div class="box-wrap"><div class="box ${isChecked("allergies", item, "No")}"></div> No</div>
                                            
                                        </div>
                                    </div>
                                    ${
                                      formData.allergies[item] === "Yes"
                                        ? `<div style="margin-top:5px; margin-bottom:5px;">
                                            If yes: ${formData.allergies[`${item}_details`] || ""}<span class="line">${formData.allergies[`${item}_details`] || "________"}</span>
                                        </div>`
                                        : ""
                                    }
                                `,
                                  )
                                  .join("")}
                            </div>

                            
                        </div>

                        <div style="margin-top: 15px;">
                            <div class="system-title">Functional</div>
                            <div class="functional-grid">
                                ${[
                                  "Walking",
                                  "Eating",
                                  "Dressing",
                                  "Bathing",
                                  "Toileting",
                                ]
                                  .map(
                                    (act) => `
                                    <div>${act}:
                                        <span>
                                            ${formData[act.toLowerCase()] || "Not Assessed"}
                                        </span>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
  
                    </div>
                  <div class="fs-14">AAC-F-4.1-00</div>
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
    <form
      onSubmit={handleSubmit}
      className="medical-form"
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        backgroundColor: "#fcfcfc",
        padding: "20px",
      }}
    >
      <h2
        className="form-title"
        style={{
          textAlign: "center",
          backgroundColor: "#80deea",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          margin: "0 0 40px 0",
          fontSize: "1.6rem",
          fontWeight: "bold",
        }}
      >
        NURSING INITIAL ASSESSMENT
      </h2>

      {/* Patient Header */}
      <div className="patient-compact-header" style={{ marginBottom: "40px" }}>
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

      {/* Quick Stats & Core Info */}
      <div style={cardStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <MuiDateTimePicker
              label="Patient received Date"
              name="patientReceivedDate"
              value={formData.patientReceivedDate}
              onChange={handleChange}
              type="date"
            />
            <MuiDateTimePicker
              label="Time"
              name="patientReceivedTime"
              value={formData.patientReceivedTime}
              onChange={handleChange}
              type="time"
            />
          </div>
          <TextInput
            label="Primary Language"
            name="language"
            value={formData.language}
            onChange={handleChange}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <TextInput
            label="Temperature"
            name="temp"
            value={formData.temp}
            onChange={handleChange}
          />
          <TextInput
            label="B.P."
            name="bp"
            value={formData.bp}
            onChange={handleChange}
          />
          <TextInput
            label="Pulse"
            name="pulse"
            value={formData.pulse}
            onChange={handleChange}
          />
          <TextInput
            label="R.R."
            name="rr"
            value={formData.rr}
            onChange={handleChange}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
          }}
        >
          <RadioGroup
            label="General Consent"
            name="generalConsentTaken"
            value={formData.generalConsentTaken}
            onChange={handleChange}
            options={yesNoOptions}
          />
          <RadioGroup
            label="ID Band Proper"
            name="idBand"
            value={formData.idBand}
            onChange={handleChange}
            options={yesNoOptions}
          />
          <RadioGroup
            label="Vulnerable Patient"
            name="vulnerablePatient"
            value={formData.vulnerablePatient}
            onChange={handleChange}
            options={yesNoOptions}
          />
          <div className="form-field">
            <label className="field-label" style={{ fontSize: "0.8rem" }}>
              Valuables / Belongings
            </label>
            <SelectInput
              name="valuables"
              value={formData.valuables}
              onChange={handleChange}
              options={[
                { value: "With patient", label: "With patient" },
                { value: "Given to relative", label: "Given to relative" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Systems Review */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}
      >
        <AssessmentSection
          title="Neurological"
          section="neurological"
          icon=""
          items={["Paralysis", "Dizziness", "Oriented", "Responsive"]}
        />
        <AssessmentSection
          title="Cardiovascular"
          section="cardiovascular"
          icon=""
          items={["Chest pain", "Hypertensive", "Hypotensive", "Pulse regular"]}
        />
        <AssessmentSection
          title="Urinary"
          section="urinary"
          icon=""
          items={["Catheter", "Retention", "Haematuria", "Incontinence"]}
        />
        <AssessmentSection
          title="Respiratory"
          section="respiratory"
          icon=""
          items={["Gasping", "Tachypnea", "Bradypnea", "Dyspnea", "Cough"]}
        />
        <AssessmentSection
          title="Gastrointestinal"
          section="gastrointestinal"
          icon=""
          items={[
            "Constipation",
            "Distention",
            "Nausea",
            "Diarrhea",
            "Tenderness",
            "Vomiting",
            "Colostomy",
            "NBM",
          ]}
        />
        <AssessmentSection
          title="Skin Status"
          section="skin"
          icon=""
          items={["Pale", "Cyanotic", "Dehydration", "Jaundiced", "Normal"]}
        />
      </div>

      {/* Communication */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>Communication Status</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
          }}
        >
          {["Vision", "Hearing", "Speech", "Obey"].map((sense) => (
            <div
              key={sense}
              style={{
                backgroundColor: "#f9f9f9",
                padding: "12px",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  marginBottom: "8px",
                }}
              >
                {sense}
              </div>
              <RadioGroup
                name={`communication.${sense}`}
                value={formData.communication[sense]}
                onChange={handleChange}
                options={[
                  { value: "OK", label: "OK" },
                  { value: "Impaired", label: "Imp" },
                ]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Functional Status */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>Functional Independence</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "15px",
          }}
        >
          {["Walking", "Eating", "Dressing", "Bathing", "Toileting"].map(
            (act) => (
              <div
                key={act}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #efefef",
                  padding: "12px",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#006064",
                  }}
                >
                  {act}
                </div>
                <RadioGroup
                  name={act.toLowerCase()}
                  value={formData[act.toLowerCase()]}
                  onChange={handleChange}
                  options={functionalOptions}
                />
              </div>
            ),
          )}
        </div>
      </div>

      {/* Allergies & Devices */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}
      >
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>Allergies / Adverse Reactions</div>
          {["Medication/Drug", "Blood transfusion", "Food"].map((type) => (
            <div key={type} style={{ marginBottom: "15px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "5px",
                }}
              >
                <span style={{ fontWeight: "500" }}>{type}</span>
                <RadioGroup
                  name={`allergies.${type}`}
                  value={formData.allergies[type]}
                  onChange={handleChange}
                  options={yesNoOptions}
                />
              </div>
              {formData.allergies[type] === "Yes" && (
                <TextInput
                  label="Reaction Details"
                  name={`allergies.${type}_details`}
                  value={formData.allergies[`${type}_details`]}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>Patient Having Devices</div>
          {[
            "Central line",
            "Foleys catheter",
            "Peripheral line",
            "RT tube",
            "Any other",
          ].map((device) => (
            <div
              key={device}
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "0.85rem", flex: 1 }}>{device}</span>
              <RadioGroup
                name={`devices.${device}`}
                value={formData.devices[device]}
                onChange={handleChange}
                options={yesNoOptions}
              />
              {formData.devices[device] === "Yes" && (
                <input
                  type="date"
                  name={`devices.${device}_date`}
                  value={formData.devices[`${device}_date`]}
                  onChange={handleChange}
                  style={{
                    padding: "4px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "0.8rem",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scores & Risks */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>Assessment Scores</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          <TextInput
            label="Morse Fall Score"
            name="morseFallScore"
            value={formData.morseFallScore}
            onChange={handleChange}
          />
          <SelectInput
            label="Risk Level"
            name="riskLevel"
            value={formData.riskLevel}
            onChange={handleChange}
            options={[
              { value: "Low", label: "Low" },
              { value: "Medium", label: "Medium" },
              { value: "High", label: "High" },
            ]}
          />
          <TextInput
            label="Pain Score (0-10)"
            name="painScore"
            value={formData.painScore}
            onChange={handleChange}
          />
          <TextInput
            label="Pain Location"
            name="painLocation"
            value={formData.painLocation}
            onChange={handleChange}
          />
          <TextInput
            label="Braden Score"
            name="bradenScore"
            value={formData.bradenScore}
            onChange={handleChange}
          />
          <RadioGroup
            label="Pressure Sore"
            name="pressureSore"
            value={formData.pressureSore}
            onChange={handleChange}
            options={[
              { value: "Existing", label: "Existing" },
              { value: "Prospective", label: "Prospective" },
            ]}
          />
        </div>

        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#fffde7",
            borderRadius: "8px",
            fontSize: "0.8rem",
            border: "1px solid #fff9c4",
          }}
        >
          <strong>Note:</strong> Calculate Morse Fall Scale based on history of
          falling, secondary diagnosis, ambulatory aid, IV access, gait, and
          mental status.
          <br />
          <i>0-24: No Risk | 25-50: Low Risk | &gt;50: High Risk</i>
        </div>
      </div>

      {/* Footer */}
      <div style={{ ...cardStyle, borderTop: "4px solid #80deea" }}>
        <TextInput
          label="Assessment done by (Name & Sign)"
          name="assessmentDoneByName"
          value={formData.assessmentDoneByName}
          onChange={handleChange}
        />
        <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
          <MuiDateTimePicker
            label="Assessment Date"
            name="assessmentDate"
            value={formData.assessmentDate}
            onChange={handleChange}
            type="date"
          />
          <MuiDateTimePicker
            label="Assessment Time"
            name="assessmentTime"
            value={formData.assessmentTime}
            onChange={handleChange}
            type="time"
          />
        </div>
      </div>

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Submit Finalize Nursing Assessment
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
          <span>🖨️</span> Print Finalize Nursing Assessment
        </button>
      </div>
    </form>
  );
};

export default NursingInitialAssessmentForm;
