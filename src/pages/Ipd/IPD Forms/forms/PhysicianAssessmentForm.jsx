import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Textarea from "../inputs/Textarea";
import RadioGroup from "../inputs/RadioGroup";
import CheckboxGroup from "../inputs/CheckboxGroup";
import SelectInput from "../inputs/SelectInput";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const PhysicianAssessmentForm = ({ onSubmit, patientData = {} }) => {
  const [formData, setFormData] = useState({
    uhid: patientData.uhid || "",
    name: patientData.name || "",
    age: patientData.age || "",
    gender: patientData.gender || "",
    ipNo: patientData.ipNo || "",

    allergies: "",
    surgeryPlanned: "",
    medicalHistory: "",
    habits: [],
    habitsOther: "",

    reviewOfSystems: {
      constitutional: { status: "", details: "" },
      headNeck: { status: "", details: "" },
      heartDisease: { options: [], dyspneaClass: "" },
      respiration: { options: [] },
      gastrointestinal: { status: "", details: "" },
      genitoUrinary: { status: "", details: "" },
      hematologic: { options: [] },
      neurologic: { status: "", details: "" },
      psychiatric: { status: "", details: "" },
      endocrine: { options: [], other: "" },
    },

    presentMedications: {
      status: "",
      list: [{ medication: "", dose: "", freq: "", lastDose: "" }],
    },

    investigations: {
      echo2D: "",
      ecg: "",
      xray: "",
      other: "",
    },

    physicalExam: { bp: "", pulse: "", rr: "", temp: "" },
    riskAssessment: "",
    medicalConditionsStatus: "",
    result: "",
    resultNote: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => {
        let updated = { ...prev };
        let current = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxArrayChange = (name, value) => {
    setFormData((prev) => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const handleNestedCheckboxChange = (section, field, value) => {
    setFormData((prev) => {
      const current = prev.reviewOfSystems[section][field] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        reviewOfSystems: {
          ...prev.reviewOfSystems,
          [section]: {
            ...prev.reviewOfSystems[section],
            [field]: updated,
          },
        },
      };
    });
  };

  const handleMedRowChange = (index, field, value) => {
    setFormData((prev) => {
      const newList = [...prev.presentMedications.list];
      newList[index] = { ...newList[index], [field]: value };
      return {
        ...prev,
        presentMedications: { ...prev.presentMedications, list: newList },
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const noneYesOptions = [
    { value: "None", label: "None" },
    { value: "Yes", label: "Yes" },
  ];

  const riskOptions = [
    { value: "High", label: "High" },
    { value: "Moderate", label: "Moderate" },
    { value: "Low", label: "Low" },
  ];

  const medicalStatusOptions = [
    { value: "Controlled", label: "Controlled" },
    { value: "Partially controlled", label: "Partially controlled" },
    { value: "Uncontrolled", label: "Uncontrolled" },
  ];

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
                .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; height: 1.1em; font-weight: normal; padding: 4px 10px; min-width: 50px; }
                .line { border-bottom: 1px solid #646363; flex: 1; margin: 0 8px; height: 1.2em; text-align: center; font-size: 14px; font-weight: normal; padding: 0px 10px; min-width: 50px; }
                .cb-item { display: flex; align-items: center; margin-bottom: 6px; font-size: 14px; }
                .box { width: 15px; height: 15px; border: 1px solid #cbd5e0; border-radius: 4px; margin-top: 5px; margin-right: 5px; position: relative; flex-shrink: 0; background-color: #fff; }
                .box.checked { background-color: #00bcd4; border-color: #00bcd4; }
                .box.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); color: #333; font-weight: bold; font-size: 14px; }
                .amenities-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; margin-left: 30px; gap: 5px 2px; }
                .section-title { margin-bottom: 5px; font-size: 14px; font-weight:bold; }
                .indent { margin-left: 65px; }
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
                .section{margin-bottom:5px; font-size:14px}

                .investigation-table { width: 100%; border-collapse: collapse;     margin-top: 5px; }
                .investigation-table td {border: 1px solid #000; padding: 8px;     width: 50%; font-size: 14px;}
     
            </style>
        </head>
        <body>
          <div>
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
    
                <div class="main-title">PHYSICIAN ASSESSMENT FORM <br /> FOR SURGICAL FITNESS</div>
    
    
                <div class="row fs-14">
                    Allergies: <div class="dotted-line">${formData.allergies || ""}</div>
                </div>
    
                <div class="row fs-14">
                    Surgery planned : <div class="dotted-line">${formData.surgeryPlanned}</div>
                </div>
    
                <div class="row fs-14">
                    Medical history <div class="dotted-line">${formData.medicalHistory || ""}</div>
                </div>

               <div class="section">
                    <div class="inline-row">
                      <div class="cb-item"><div class="box ${formData.habits.includes("Smoking") ? "checked" : ""}"></div> Smoking</div>
                      <div class="cb-item"><div class="box ${formData.habits.includes("Alcohol") ? "checked" : ""}"></div> Alcohol</div>
                      <div class="cb-item"><div class="box ${formData.habits.includes("Tobacco") ? "checked" : ""}"></div> Tobacco</div>
                      <div class="cb-item"><div class="box ${formData.habits.includes("None") ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.labTests === "Not done" ? "checked" : ""}"></div> Other if any</div><div class="dotted-line">${formData.habitsOther || ""}</div>
                    </div>
                </div>


                <div class="section">
                    <div class="section-title">Review of systems </div>
                    <div class="inline-row">
                      <span>Constitutional : </span>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.constitutional.status === "None" ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.constitutional.status === "Yes" ? "checked" : ""}"></div> Yes </div><div class="dotted-line"> Details : ${formData.reviewOfSystems.constitutional.details || ""}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="inline-row">
                      <span>Head & Neck : </span>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.headNeck.status === "None" ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.headNeck.status === "Yes" ? "checked" : ""}"></div> Yes </div><div class="dotted-line"> Details : ${formData.reviewOfSystems.headNeck.details || ""}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="inline-row">
                      <span>Heart disease : </span>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.heartDisease.options.includes("None") ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.heartDisease.options.includes("HTN") ? "checked" : ""}"></div> HTN </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.heartDisease.options.includes("CAD") ? "checked" : ""}"></div> CAD </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.heartDisease.options.includes("Vascular") ? "checked" : ""}"></div> Vascular </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.heartDisease.options.includes("Exercise intolerance") ? "checked" : ""}"></div> Exercise intolerance </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.heartDisease.options.includes("Angina") ? "checked" : ""}"></div> Angina </div>
                    </div>
                </div>

                <div class="row fs-14">
                    Dyspnea on exertion(Class) : <div class="dotted-line">${formData.reviewOfSystems.heartDisease.dyspneaClass || ""}</div>
                </div>

                <div class="section">
                    <div class="inline-row">
                      <span>Respiration : </span>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.respiration.options.includes("None") ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.respiration.options.includes("Cough") ? "checked" : ""}"></div> Cough </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.respiration.options.includes("Koch's") ? "checked" : ""}"></div> Koch’s </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.respiration.options.includes("Asthma") ? "checked" : ""}"></div> Asthma </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.respiration.options.includes("COPD") ? "checked" : ""}"></div> COPD </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.respiration.options.includes("Pleural effusion") ? "checked" : ""}"></div> Pleural effusion </div>
                    </div>
                </div>
    
                <div class="section">
                    <div class="inline-row">
                      <span>Gastrointestinal : </span>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.gastrointestinal.status === "None" ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.gastrointestinal.status === "Yes" ? "checked" : ""}"></div> Yes </div><div class="dotted-line"> Details : ${formData.reviewOfSystems.gastrointestinal.details || ""}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="inline-row">
                      <span>Genito- Urinary : </span>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.genitoUrinary.status === "None" ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.genitoUrinary.status === "Yes" ? "checked" : ""}"></div> Yes </div><div class="dotted-line"> Details : ${formData.reviewOfSystems.genitoUrinary.details || ""}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="inline-row">
                      <span>Hematologic : </span>
                      <div class="cb-item"><div class="box ${formData.labTests === "Done outside" ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.labTests === "Not done" ? "checked" : ""}"></div> Bleeding Diathesis </div>
                      <div class="cb-item"><div class="box ${formData.labTests === "Not done" ? "checked" : ""}"></div> Malignancy </div>
                      <div class="cb-item"><div class="box ${formData.labTests === "Not done" ? "checked" : ""}"></div> Blood Transfusion </div>
                    </div>
                </div>

                <div class="section">
                    <div class="inline-row">
                      <span>Neurologic : </span>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.neurologic.status === "None" ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.neurologic.status === "Yes" ? "checked" : ""}"></div> Yes </div><div class="dotted-line"> Details : ${formData.reviewOfSystems.neurologic.details || ""}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="inline-row">
                      <span>Psychiatric : </span>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.psychiatric.status === "None" ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.psychiatric.status === "Yes" ? "checked" : ""}"></div> Yes </div><div class="dotted-line"> Details : ${formData.reviewOfSystems.psychiatric.details || ""}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="inline-row">
                      <span>Endocrine : </span>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.endocrine.options.includes("None") ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.endocrine.options.includes("Diabetes") ? "checked" : ""}"></div> Diabetes </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.endocrine.options.includes("Thyroid") ? "checked" : ""}"></div> Thyroid </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.endocrine.options.includes("Adrenal") ? "checked" : ""}"></div> Adrenal </div>
                      <div class="cb-item"><div class="box ${formData.reviewOfSystems.endocrine.options.includes("Other") ? "checked" : ""}"></div> Other </div>
                      <div class="dotted-line"> Details : ${formData.reviewOfSystems.endocrine.other || ""}</div>
                    </div>
                </div>

                 <div class="section">
                    <div class="inline-row">
                      <span>Present medications : </span>
                      <div class="cb-item"><div class="box ${formData.presentMedications.status === "None" ? "checked" : ""}"></div> None</div>
                      <div class="cb-item"><div class="box ${formData.presentMedications.status === "Yes" ? "checked" : ""}"></div> Yes </div>
                    </div>
                </div>
                ${
                  formData.presentMedications.status === "Yes"
                    ? `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #000; padding: 5px; font-size: 13px; text-align: left;">Medication</th>
          <th style="border: 1px solid #000; padding: 5px; font-size: 13px; text-align: left;">Dose</th>
          <th style="border: 1px solid #000; padding: 5px; font-size: 13px; text-align: left;">Freq</th>
          <th style="border: 1px solid #000; padding: 5px; font-size: 13px; text-align: left;">Last taken</th>
        </tr>
      </thead>
      <tbody>
        ${formData.presentMedications.list
          .map(
            (row) => `
              <tr>
                <td style="border:1px solid #000;padding:5px;">${row.medication || ""}</td>
                <td style="border:1px solid #000;padding:5px;">${row.dose || ""}</td>
                <td style="border:1px solid #000;padding:5px;">${row.freq || ""}</td>
                <td style="border:1px solid #000;padding:5px;">${row.lastDose || ""}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `
                    : ""
                }

                <div class="section-title">Specific investigation:</div>
                <table class="investigation-table">
                    <tr>
                        <td class="fs-14">2D Echo: <span style="font-weight:normal;">${formData.echo || ""}</span></td>
                        <td class="fs-14">ECG: <span style="font-weight:normal;">${formData.ecg || ""}</span></td>
                    </tr>
                    <tr>
                        <td class="fs-14">Xray: <span style="font-weight:normal;">${formData.xray || ""}</span></td>
                        <td class="fs-14">Other: <span style="font-weight:normal;">${formData.otherInv || ""}</span></td>
                    </tr>
                </table>

                <div class="row fs-14" style="margin-top: 15px;">
                    Physical examination: 
                    BP <div class="dotted-line" style="max-width:80px">${formData.physicalExam.bp || ""}</div>
                    Pulse <div class="dotted-line" style="max-width:80px">${formData.physicalExam.pulse || ""}</div>
                    RR <div class="dotted-line" style="max-width:80px">${formData.physicalExam.rr || ""}</div>
                    Temp <div class="dotted-line" style="max-width:80px">${formData.physicalExam.temp || ""}</div>
                </div>
    
                <div class="section">
                    <div class="inline-row">
                      <span>Risk assessment : </span>
                      <div class="cb-item"><div class="box ${formData.riskAssessment === "High" ? "checked" : ""}"></div> High</div>
                      <div class="cb-item"><div class="box ${formData.riskAssessment === "Moderate" ? "checked" : ""}"></div> Moderate</div>
                      <div class="cb-item"><div class="box ${formData.riskAssessment === "Low" ? "checked" : ""}"></div> Low</div>
                    </div>
                </div>
    
    
                <div class="section">
                    <div class="section-title">Factors</div>
                       <div class="inline-row">
                      <div class="cb-item"><div class="box ${formData.medicalConditionsStatus === "Medical condition" ? "checked" : ""}"></div>Medical condition</div>
                      <div class="cb-item"><div class="box ${formData.medicalConditionsStatus === "Controlled" ? "checked" : ""}"></div> Controlled</div>
                      <div class="cb-item"><div class="box ${formData.medicalConditionsStatus === "Partially controlled" ? "checked" : ""}"></div> Partially controlled</div>
                      <div class="cb-item"><div class="box ${formData.medicalConditionsStatus === "Uncontrolled" ? "checked" : ""}"></div> Uncontrolled </div>
                    </div>
                </div>

                <div class="section">
                    <div class="inline-row">
                      <span>Result  : </span>
                      <div class="cb-item"><div class="box ${formData.result === "Fit" ? "checked" : ""}"></div> Fit to undergo surgical procedure within next 24 hrs </div>
                    </div>
                </div>
                <div class="section indent">
                    <div class="inline-row">
                      <div class="cb-item"><div class="box ${formData.result === "Not Fit" ? "checked" : ""}"></div> Not fit, advise as follows </div><div class="dotted-line">  ${formData.resultNote || ""}</div>
                    </div>
                </div>
               
    
                <div class="row">
                    <div class="section-title">Name of the Physician :  </div>
                    <div class="dotted-line">${formData.coordinatorDateTime || ""}</div>
                    <div class="section-title">Sign :  </div>
                    <div class="dotted-line">${formData.coordinatorDateTime || ""}</div>
                    <div class="section-title">Date :  </div>
                    <div class="dotted-line">${formData.coordinatorDateTime || ""}</div>
                    <div class="section-title">Time :  </div>
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
    <form
      onSubmit={handleSubmit}
      className="medical-form"
      style={{ maxWidth: "950px", margin: "0 auto" }}
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
        PHYSICIAN ASSESSMENT FORM FOR SURGICAL FITNESS
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <TextInput
          label="Allergies"
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
        />
        <TextInput
          label="Surgery planned"
          name="surgeryPlanned"
          value={formData.surgeryPlanned}
          onChange={handleChange}
        />
      </div>

      <TextInput
        label="Medical history"
        name="medicalHistory"
        value={formData.medicalHistory}
        onChange={handleChange}
      />

      <div
        style={{
          padding: "15px",
          border: "1px solid #efefef",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <label
          style={{
            fontWeight: "bold",
            fontSize: "0.9rem",
            display: "block",
            marginBottom: "10px",
          }}
        >
          Habits:
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {["Smoking", "Alcohol", "Tobacco", "None"].map((opt) => (
            <label
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.habits.includes(opt)}
                onChange={() => handleCheckboxArrayChange("habits", opt)}
              />
              {opt}
            </label>
          ))}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <TextInput
              label="Other if any"
              name="habitsOther"
              value={formData.habitsOther}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <label
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "15px",
            borderBottom: "1px solid #80deea",
            paddingBottom: "5px",
          }}
        >
          Review of Systems
        </label>

        {[
          "constitutional",
          "headNeck",
          "gastrointestinal",
          "genitoUrinary",
          "neurologic",
          "psychiatric",
        ].map((sys) => (
          <div
            key={sys}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 150px 1fr",
              gap: "20px",
              marginBottom: "15px",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "500", textTransform: "capitalize" }}>
              {sys.replace(/([A-Z])/g, " $1")}:
            </span>
            <RadioGroup
              name={`reviewOfSystems.${sys}.status`}
              value={formData.reviewOfSystems[sys].status}
              onChange={handleChange}
              options={noneYesOptions}
            />
            <TextInput
              label="Details"
              name={`reviewOfSystems.${sys}.details`}
              value={formData.reviewOfSystems[sys].details}
              onChange={handleChange}
            />
          </div>
        ))}

        <div
          style={{
            padding: "15px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          <label
            style={{
              fontWeight: "500",
              display: "block",
              marginBottom: "10px",
            }}
          >
            Heart Disease:
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {["HTN", "CAD", "Vascular", "Exercise intolerance", "Angina"].map(
              (opt) => (
                <label
                  key={opt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "0.85rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.reviewOfSystems.heartDisease.options.includes(
                      opt,
                    )}
                    onChange={() =>
                      handleNestedCheckboxChange("heartDisease", "options", opt)
                    }
                  />
                  {opt}
                </label>
              ),
            )}
          </div>
          <div style={{ marginTop: "10px" }}>
            <TextInput
              label="Dyspnea on exertion (Class)"
              name="reviewOfSystems.heartDisease.dyspneaClass"
              value={formData.reviewOfSystems.heartDisease.dyspneaClass}
              onChange={handleChange}
            />
          </div>
        </div>

        <div
          style={{
            padding: "15px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          <label
            style={{
              fontWeight: "500",
              display: "block",
              marginBottom: "10px",
            }}
          >
            Respiration:
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {[
              "None",
              "Cough",
              "Koch's",
              "Asthma",
              "COPD",
              "Pleural effusion",
            ].map((opt) => (
              <label
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "0.85rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.reviewOfSystems.respiration.options.includes(
                    opt,
                  )}
                  onChange={() =>
                    handleNestedCheckboxChange("respiration", "options", opt)
                  }
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <RadioGroup
          label="Present medications"
          name="presentMedications.status"
          value={formData.presentMedications.status}
          onChange={handleChange}
          options={noneYesOptions}
        />
        {formData.presentMedications.status === "Yes" && (
          <div style={{ marginTop: "10px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #eee",
              }}
            >
              <thead style={{ backgroundColor: "#f5f5f5" }}>
                <tr>
                  <th style={{ padding: "8px", border: "1px solid #eee" }}>
                    Medication
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #eee" }}>
                    Dose
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #eee" }}>
                    Freq
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #eee" }}>
                    Last taken
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.presentMedications.list.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "2px", border: "1px solid #eee" }}>
                      <input
                        type="text"
                        value={row.medication}
                        onChange={(e) =>
                          handleMedRowChange(idx, "medication", e.target.value)
                        }
                        style={{
                          width: "100%",
                          border: "none",
                          padding: "5px",
                        }}
                      />
                    </td>
                    <td style={{ padding: "2px", border: "1px solid #eee" }}>
                      <input
                        type="text"
                        value={row.dose}
                        onChange={(e) =>
                          handleMedRowChange(idx, "dose", e.target.value)
                        }
                        style={{
                          width: "100%",
                          border: "none",
                          padding: "5px",
                        }}
                      />
                    </td>
                    <td style={{ padding: "2px", border: "1px solid #eee" }}>
                      <input
                        type="text"
                        value={row.freq}
                        onChange={(e) =>
                          handleMedRowChange(idx, "freq", e.target.value)
                        }
                        style={{
                          width: "100%",
                          border: "none",
                          padding: "5px",
                        }}
                      />
                    </td>
                    <td style={{ padding: "2px", border: "1px solid #eee" }}>
                      <input
                        type="text"
                        value={row.lastDose}
                        onChange={(e) =>
                          handleMedRowChange(idx, "lastDose", e.target.value)
                        }
                        style={{
                          width: "100%",
                          border: "none",
                          padding: "5px",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "30px" }}>
        <label
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "10px",
          }}
        >
          Physical examination:
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
          }}
        >
          <TextInput
            label="BP"
            name="physicalExam.bp"
            value={formData.physicalExam.bp}
            onChange={handleChange}
          />
          <TextInput
            label="Pulse"
            name="physicalExam.pulse"
            value={formData.physicalExam.pulse}
            onChange={handleChange}
          />
          <TextInput
            label="RR"
            name="physicalExam.rr"
            value={formData.physicalExam.rr}
            onChange={handleChange}
          />
          <TextInput
            label="Temp"
            name="physicalExam.temp"
            value={formData.physicalExam.temp}
            onChange={handleChange}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            padding: "15px",
            border: "1px solid #efefef",
            borderRadius: "8px",
          }}
        >
          <RadioGroup
            label="Risk assessment"
            name="riskAssessment"
            value={formData.riskAssessment}
            onChange={handleChange}
            options={riskOptions}
          />
        </div>
        <div
          style={{
            padding: "15px",
            border: "1px solid #efefef",
            borderRadius: "8px",
          }}
        >
          <RadioGroup
            label="Medical conditions status"
            name="medicalConditionsStatus"
            value={formData.medicalConditionsStatus}
            onChange={handleChange}
            options={medicalStatusOptions}
          />
        </div>
      </div>

      <div style={{ borderTop: "2px solid #80deea", paddingTop: "20px" }}>
        <label
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "10px",
          }}
        >
          Result:
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="result"
              value="Fit"
              checked={formData.result === "Fit"}
              onChange={handleChange}
            />
            Fit to undergo surgical procedure within next 24hrs
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="result"
              value="Not Fit"
              checked={formData.result === "Not Fit"}
              onChange={handleChange}
            />
            Not fit, advise as follows:
          </label>
          {formData.result === "Not Fit" && (
            <Textarea
              name="resultNote"
              value={formData.resultNote}
              onChange={handleChange}
            />
          )}
        </div>
      </div>

      {/* <button
          type="submit"
          className="submit-btn"
          style={{ marginTop: "40px", width: "100%" }}
        >
          Complete Physician Assessment
        </button> */}

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Complete Physician Assessment
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
          <span>🖨️</span> Print Physician Assessment
        </button>
      </div>
    </form>
  );
};

export default PhysicianAssessmentForm;
