import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import RadioGroup from "../inputs/RadioGroup";
import Textarea from "../inputs/Textarea";
import SignatureInput from "../inputs/SignatureInput";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const PreAnesthesiaCheckupForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    assessmentDateTime: "",
    sbDoctor: "",
    asaGrade: "",
    diagnosis: "",
    postedFor: "",
    hasDM: "",
    hasHypertension: "",
    hasIHD: "",
    hasAsthma: "",
    hasTB: "",
    hasEpilepsy: "",
    hasSurgery: "",
    dmDuration: "",
    hypertensionDuration: "",
    ihdDuration: "",
    asthmaDuration: "",
    tbDuration: "",
    epilepsyDuration: "",
    surgeryDuration: "",
    history: "", // For other history
    medicationHistory: "",
    personalHistory: "",
    height: "",
    weight: "",
    pulse: "",
    bp: "",
    rr: "",
    generalFindings: "",
    systemicRS: "",
    systemicCVS: "",
    systemicCNS: "",
    systemicPA: "",
    mpc: "",
    neckMovement: "",
    mouthOpening: "",
    teeth: "",
    investigations: "",
    ecg: "",
    chestXray: "",
    anesthesiaPlan: "",
    anesthetistName: "",
    anesthetistSignature: "",
    anesthetistDateTime: "",
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
  const isChecked = (value) => (value === "Yes" ? "checked" : "");

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
                      .fill-line { border-bottom: 1px solid #333; display: inline-block; min-width: 80px; padding: 0 5px; }
          
                      /* Checkbox Grid - To match your image layout */
                      .cb-grid { display: flex; flex-wrap: wrap; gap: 15px; margin: 10px 0; font-weight: bold; font-size: 12px; }
                      .cb-item { display: flex; align-items: center; }
                      .box { width: 14px; height: 14px; border: 1px solid #000; margin-right: 6px; position: relative; background: #fff; }
                      .checked::after { content: '✓'; position: absolute; top: -5px; left: 1px; font-size: 15px; color: #000; font-weight: bold; }
          
                      .attendant-section {padding-top: 10px; }
                      .signature-section {page-break-inside: avoid; break-inside: avoid;}
      
                      .section-label {display:flex; margin-top:15px; font-size:16px;}
      
                      .notebook-container { background-image: linear-gradient(#646363 1px, transparent 1px);   background-size: 100% 31px; line-height: 31px; background-position: 0 30px; background-repeat: repeat;                   width: 100%; margin-top:10px;}
      
                      .notebook-row { align-items: flex-start; padding: 5px 0; }
                      .notebook-row2 { display: flex;  align-items: flex-start;}
      
                      .label-bold { font-weight: bold; padding-right: 8px; white-space: nowrap;  background-color: white; }
      
                      .content-fill { flex: 1; word-break: break-word; min-height: 30px;}
        
                      
                      @media print { .no-print { display: none; } }

                      .grid-row { display: grid; gap: 15px; width: 100%; margin-bottom: 5px; }
                    .grid-4 { grid-template-columns: repeat(4, 1fr); }
                    .grid-3 { grid-template-columns: repeat(3, 1fr); }
  
                      .row{display: flex; margin-top:10px; margin-bottom: 14px; width: 100%;}

                    .signature-section {margin-top: auto; align-self: flex-end; width: 300px; padding-top: 20px;}

                    .section-head {font-weight: bold; margin-top: 10px; font-size: 15px;}

                    .asa-box { width: 16px; height: 16px; border: 1px solid #000; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-left: 4px; background: #fff;}

                    .inline-row {display: flex; gap: 20px;}
                    .cb-item { display: flex; align-items: center; font-size: 14px;}
    
                    .box { width: 18px; height: 18px; border: 1px solid #cbd5e0; border-radius: 4px; margin-top: 5px; margin-right: 5px; position: relative; flex-shrink: 0; background-color: #fff;}
                    .box.checked { background-color: #00bcd4; border-color: #00bcd4;}
                    .asa-container {  display: flex; flex-direction: row; gap: 15px; align-items: center;  margin: 10px 0 0; font-weight: bold;}
                    .box.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); color: #333;  font-weight: bold; font-size: 14px;}

                    .asa-container { display: flex; flex-wrap: wrap; gap: 10px 20px; align-items: center;}

                    .cb-item { display: flex; align-items: center; white-space: nowrap; }
                  </style>
              </head>
              <body>
                  <div class="page-container">
                  <div class="form-type">Form 8 - Front</div>
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
          
                          <div class="main-title">PRE ANESTHESIA CHECKUP </div>

                          <div class="">
                              <div class="notebook-row2">
                                  <span class="label-bold">Date & Time : ${formData.assessmentDateTime || ""}
                                     </span>
                                  
                              </div>
                          </div>

                          <div class="" style="margin-top: 12px;">
                              <div class="notebook-row2">
                                  <span class="label-bold">S/B Doctor  : </span>${formData.sbDoctor || ""}
                              </div>
                          </div>


                          <div class="asa-container">
                            <span>ASA Grade:</span>
                            ${["I", "II", "III", "IV", "V", "VI"]
                              .map(
                                (grade) => `
                              <div class="cb-item"><div class="box ${formData.asaGrade === grade ? "checked" : ""}"></div> ${grade}</div>
                            `,
                              )
                              .join("")}
                          </div>


                          <div class="notebook-container">
                              <div class="notebook-row2">
                                  <span class="label-bold">Diagnosis :</span>
                                  <div class="content-fill">
                                      ${formData.diagnosis || ""}
                                  </div>
                              </div>
                          </div>

                          <div class="notebook-container">
                              <div class="notebook-row2">
                                  <span class="label-bold">Posted For :</span>
                                  <div class="content-fill">
                                      ${formData.postedFor || ""}
                                  </div>
                              </div>
                          </div>


                          <div class="asa-container">
                            <span>Relevant History:</span>
                            <div class="cb-item">
                              <div class="box ${isChecked(formData.hasDM)}"></div> 
                              DM ${formData.hasDM === "Yes" ? `(${formData.dmDuration})` : ""}
                            </div>
                            
                            <div class="cb-item">
                              <div class="box ${isChecked(formData.hasHypertension)}"></div> 
                              Htn ${formData.hasHypertension === "Yes" ? `(${formData.hypertensionDuration})` : ""}
                            </div>

                            <div class="cb-item">
                              <div class="box ${isChecked(formData.hasIHD)}"></div> 
                              IHD ${formData.hasIHD === "Yes" ? `(${formData.ihdDuration})` : ""}
                            </div>

                            <div class="cb-item">
                              <div class="box ${isChecked(formData.hasTB)}"></div> 
                              TB ${formData.hasTB === "Yes" ? `(${formData.tbDuration})` : ""}
                            </div>

                            <div class="cb-item">
                              <div class="box ${isChecked(formData.hasEpilepsy)}"></div> 
                              Epilepsy ${formData.hasEpilepsy === "Yes" ? `(${formData.epilepsyDuration})` : ""}
                            </div>

                            <div class="cb-item">
                              <div class="box ${isChecked(formData.hasSurgery)}"></div> 
                              Previous hospitalization ${formData.hasSurgery === "Yes" ? `(${formData.surgeryDuration})` : ""}
                            </div>

                            <div class="cb-item">
                              <div class="box ${isChecked(formData.hasSurgery)}"></div> 
                              Surgery ${formData.hasSurgery === "Yes" ? `(${formData.surgeryDuration})` : ""}
                            </div>

                          </div>

                          
      
                          <div class="notebook-container">
                              <div class="notebook-row">
                                  <span class="label-bold">Medication (drug history : </span>
                                  <div class="content-fill">
                                      ${formData.medicationHistory || ""}
                                  </div>
                              </div>
                          </div>

                          <div class="notebook-container">
                              <div class="notebook-row">
                                  <span class="label-bold">Personal history (habits, allergies) :</span>
                                  <div class="content-fill">
                                      ${formData.personalHistory || ""}
                                  </div>
                              </div>
                          </div>

                          <div class="grid-row grid-4">
                            <div class="row"><span class="label-bold">Height : </span><div class="fill-line">${formData.height || ""}</div>cm</div>
                            <div class="row"><span class="label-bold">Weight : </span><div class="fill-line">${formData.weight || ""}</div>kg</div>
                            
                        </div>
  
                         <div class="grid-row grid-4">
                            <div class="row"><span class="label-bold">General history : G.C</span><div class="fill-line">${formData.gc || ""}</div></div>
                            <div class="row"><span class="label-bold">Pulse</span><div class="fill-line">${formData.pulse || ""}</div></div>
                            <div class="row"><span class="label-bold">BP</span><div class="fill-line">${formData.bp || ""}</div></div>
                            <div class="row"><span class="label-bold">RR</span><div class="fill-line">${formData.rr || ""}</div></div>
                        </div>
                         
                        <div class="notebook-container">
                            <div class="notebook-row">
                                <span class="label-bold"> Pallor / Icterus / Clubbing / Lymphadenopathy / Cyanosis / Edema : </span>
                                <div class="content-fill">
                                    ${formData.generalFindings || ""}
                                </div>
                            </div>
                        </div>

                        <div class="section-head">Systemic history</div>
                        <div class="grid-row grid-4">
                            <div class="row"><span class="label-bold">RS</span><div class="fill-line">${formData.systemicRS || ""}</div></div>
                            <div class="row"><span class="label-bold">CVS</span><div class="fill-line">${formData.systemicCVS || ""}</div></div>
                            <div class="row"><span class="label-bold">CNS</span><div class="fill-line">${formData.systemicCNS || ""}</div></div>
                            <div class="row"><span class="label-bold">PA</span><div class="fill-line">${formData.systemicPA || ""}</div></div>
                        </div>

                        <div class="section-head">Airway examination</div>
                        <div class="grid-row grid-4">
                            <div class="row"><span class="label-bold">MPC</span><div class="fill-line">${formData.mpc || ""}</div></div>
                            <div class="row"><span class="label-bold">Neck movement</span><div class="fill-line">${formData.neckMovement || ""}</div></div>
                            <div class="row"><span class="label-bold">Mouth opening</span><div class="fill-line">${formData.mouthOpening || ""}</div></div>
                            
                        </div>

                        <div class="grid-row grid-4">
                            <div class="row"><span class="label-bold">Teeth</span><div class="fill-line">${formData.teeth || ""}</div></div>
                        </div>

                        <div class="notebook-container">
                            <div class="notebook-row">
                                <span class="label-bold">Investigation :</span>
                                <div class="content-fill">
                                    ${formData.investigations || ""}
                                </div>
                            </div>
                        </div>
  
                        <div class="notebook-container">
                            <div class="notebook-row2">
                                <span class="label-bold">ECG  : </span>
                                <div class="content-fill">
                                    ${formData.ecg || ""}
                                </div>
                                <span class="label-bold"> Chest X-ray   : </span>
                                <div class="content-fill">
                                    ${formData.chestXray || ""}
                                </div>
                            </div>
                        </div>

                        <div class="notebook-container">
                              <div class="notebook-row">
                                  <span class="label-bold"> Plan of anesthesia : </span>
                                  <div class="content-fill">
                                      ${formData.anesthesiaPlan || ""}
                                  </div>
                              </div>
                          </div>


                          <div class="signature-section">
                            <div class="sig-row"><span class="label-bold">Name of anesthetist: ${formData.anesthetistName || ""}</span></div>
                            <div class="sig-row"><span class="label-bold">Sign: ${formData.anesthetistSignature || ""}</span></div>
                            <div class="sig-row">
                                <span class="label-bold">Date / Time :  ${formData.anesthetistDateTime || ""}</span>
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
    <form onSubmit={handleSubmit} className="medical-form compact-form">
      <h2
        className="form-title"
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#80deea",
          borderBottom: "2px solid #80deea",
          paddingBottom: "10px",
        }}
      >
        PRE-ANESTHESIA CHECKUP
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

      {/* Date & Doctor */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "15px",
        }}
      >
        <MuiDateTimePicker
          label="Date & Time"
          name="assessmentDateTime"
          value={formData.assessmentDateTime}
          onChange={handleChange}
        />
        <TextInput
          label="S/B Doctor"
          name="sbDoctor"
          value={formData.sbDoctor}
          onChange={handleChange}
        />
      </div>

      {/* ASA Grade */}
      <RadioGroup
        label="ASA Grade"
        name="asaGrade"
        value={formData.asaGrade}
        onChange={handleChange}
        options={[
          { label: "I", value: "I" },
          { label: "II", value: "II" },
          { label: "III", value: "III" },
          { label: "IV", value: "IV" },
          { label: "V", value: "V" },
          { label: "VI", value: "VI" },
        ]}
      />

      <TextInput
        label="Diagnosis"
        name="diagnosis"
        value={formData.diagnosis}
        onChange={handleChange}
      />
      <TextInput
        label="Posted For"
        name="postedFor"
        value={formData.postedFor}
        onChange={handleChange}
      />

      {/* Relevant History Section */}
      <div
        className="medical-history-section"
        style={{ marginTop: "20px", marginBottom: "20px" }}
      >
        <h3
          style={{
            borderBottom: "1px solid #80deea",
            paddingBottom: "8px",
            marginBottom: "15px",
            fontSize: "1rem",
          }}
        >
          Relevant History
        </h3>
        <div
          className="medical-history-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: "40px",
            rowGap: "10px",
            marginBottom: "15px",
          }}
        >
          {[
            {
              label: "DM (Diabetes Mellitus)",
              name: "hasDM",
              duration: "dmDuration",
            },
            {
              label: "Hypertension",
              name: "hasHypertension",
              duration: "hypertensionDuration",
            },
            { label: "IHD", name: "hasIHD", duration: "ihdDuration" },
            {
              label: "Asthma",
              name: "hasAsthma",
              duration: "asthmaDuration",
            },
            {
              label: "TB (Tuberculosis)",
              name: "hasTB",
              duration: "tbDuration",
            },
            {
              label: "Epilepsy",
              name: "hasEpilepsy",
              duration: "epilepsyDuration",
            },
            {
              label: "Previous Hospitalization",
              name: "hasSurgery",
              duration: "surgeryDuration",
            },
          ].map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "8px",
                borderBottom: "1px solid #f0f4f8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    color: "#4a5568",
                  }}
                >
                  {item.label}
                </span>
                <div style={{ display: "flex", gap: "15px" }}>
                  {["Yes", "No"].map((opt) => (
                    <label
                      key={opt}
                      className="radio-option"
                      style={{ border: "none", padding: 0 }}
                    >
                      <input
                        type="radio"
                        name={item.name}
                        value={opt}
                        checked={formData[item.name] === opt}
                        onChange={handleChange}
                      />
                      <span style={{ fontSize: "0.8rem" }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formData[item.name] === "Yes" && (
                <div style={{ marginTop: "5px" }}>
                  <input
                    type="text"
                    name={item.duration}
                    value={formData[item.duration]}
                    onChange={handleChange}
                    placeholder="Duration / Details"
                    style={{
                      padding: "6px 10px",
                      fontSize: "0.8rem",
                      borderRadius: "4px",
                      border: "1px solid #e2e8f0",
                      width: "100%",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <Textarea
          label="Other History (Details)"
          name="history"
          value={formData.history}
          onChange={handleChange}
          rows={2}
        />
      </div>
      <Textarea
        label="Medication (Drug History)"
        name="medicationHistory"
        value={formData.medicationHistory}
        onChange={handleChange}
      />
      <Textarea
        label="Personal History (habits / allergies)"
        name="personalHistory"
        value={formData.personalHistory}
        onChange={handleChange}
      />

      {/* Vitals */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
        }}
      >
        <TextInput
          label="Height (cm)"
          name="height"
          value={formData.height}
          onChange={handleChange}
        />
        <TextInput
          label="Weight (kg)"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
        />
        <TextInput
          label="G.C."
          name="gc"
          value={formData.gc}
          onChange={handleChange}
        />
        <TextInput
          label="Pulse"
          name="pulse"
          value={formData.pulse}
          onChange={handleChange}
        />
        <TextInput
          label="BP"
          name="bp"
          value={formData.bp}
          onChange={handleChange}
        />
        <TextInput
          label="RR"
          name="rr"
          value={formData.rr}
          onChange={handleChange}
        />
      </div>

      <Textarea
        label="General Examination (Pallor / Icterus / Clubbing /  Lymphadenopathy / Cyanosis / Edema)"
        name="generalFindings"
        value={formData.generalFindings}
        onChange={handleChange}
      />

      {/* Systemic History */}
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>
        Systemic History
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
        }}
      >
        <TextInput
          label="RS"
          name="systemicRS"
          value={formData.systemicRS}
          onChange={handleChange}
        />
        <TextInput
          label="CVS"
          name="systemicCVS"
          value={formData.systemicCVS}
          onChange={handleChange}
        />
        <TextInput
          label="CNS"
          name="systemicCNS"
          value={formData.systemicCNS}
          onChange={handleChange}
        />
        <TextInput
          label="PA"
          name="systemicPA"
          value={formData.systemicPA}
          onChange={handleChange}
        />
      </div>

      {/* Airway Examination */}
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>
        Airway Examination
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
        }}
      >
        <TextInput
          label="MPC"
          name="mpc"
          value={formData.mpc}
          onChange={handleChange}
        />
        <TextInput
          label="Neck Movement"
          name="neckMovement"
          value={formData.neckMovement}
          onChange={handleChange}
        />
        <TextInput
          label="Mouth Opening"
          name="mouthOpening"
          value={formData.mouthOpening}
          onChange={handleChange}
        />
        <TextInput
          label="Teeth"
          name="teeth"
          value={formData.teeth}
          onChange={handleChange}
        />
      </div>

      <Textarea
        label="Investigations"
        name="investigations"
        value={formData.investigations}
        onChange={handleChange}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
        }}
      >
        <TextInput
          label="ECG"
          name="ecg"
          value={formData.ecg}
          onChange={handleChange}
        />
        <TextInput
          label="Chest X-ray"
          name="chestXray"
          value={formData.chestXray}
          onChange={handleChange}
        />
      </div>

      <Textarea
        label="Plan of Anesthesia"
        name="anesthesiaPlan"
        value={formData.anesthesiaPlan}
        onChange={handleChange}
      />

      {/* Signature */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1.5fr",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        <TextInput
          label="Name of Anesthetist"
          name="anesthetistName"
          value={formData.anesthetistName}
          onChange={handleChange}
        />
        <SignatureInput
          label="Signature"
          name="anesthetistSignature"
          value={formData.anesthetistSignature}
          onChange={handleChange}
        />
        <MuiDateTimePicker
          label="Date & Time"
          name="anesthetistDateTime"
          value={formData.anesthetistDateTime}
          onChange={handleChange}
        />
      </div>

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Submit PAC Form
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
          <span>🖨️</span> Print PAC Form
        </button>
      </div>

      {/* <button type="submit" className="submit-btn">
          Submit PAC Form
        </button> */}
    </form>
  );
};

export default PreAnesthesiaCheckupForm;
