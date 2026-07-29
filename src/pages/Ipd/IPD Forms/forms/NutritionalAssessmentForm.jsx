import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Textarea from "../inputs/Textarea";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const NutritionalAssessmentForm = ({ onSubmit, patientData = {} }) => {
  const [formData, setFormData] = useState({
    uhid: patientData.uhid || "",
    name: patientData.name || "",
    age: patientData.age || "",
    gender: patientData.gender || "",
    ipNo: patientData.ipNo || "",

    referredBy: "",
    referralDate: "",
    provisionalDiagnosis: "",

    anthropometric: { height: "", weight: "", bmi: "", status: "" },
    foodHabits: "",
    habitsOther: "",
    foodRestriction: "",
    appetite: "",

    pastHistory: [],
    historyOther: "",

    clinicalStatus: {},
    investigations: {
      bloodSugar: "",
      calcium: "",
      chloride: "",
      sodium: "",
      creatinine: "",
      uricAcid: "",
      potassium: "",
      urea: "",
      others: "",
    },

    plan: {
      typeOfDiet: "",
      requirement: "",
      otherRequirement: "",
      restrictions: "",
      typeOfFeed: [],
      frequency: [],
      reAssessmentType: [],
      reAssessmentSpecify: "",
    },

    nutritionCounseling: "", // Yes/No
    assessmentDate: "",
    assessmentTime: "",
    dietitianName: "",
    dietitianSignature: "",
    consultantName: "",
    consultantSignature: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleListChange = (field, value) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((i) => i !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleNestedListChange = (section, field, value) => {
    setFormData((prev) => {
      const current = prev[section][field] || [];
      const updated = current.includes(value)
        ? current.filter((i) => i !== value)
        : [...current, value];
      return {
        ...prev,
        [section]: { ...prev[section], [field]: updated },
      };
    });
  };

  const handleStatusChange = (condition, value) => {
    setFormData((prev) => ({
      ...prev,
      clinicalStatus: { ...prev.clinicalStatus, [condition]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const conditions = [
    ["Weight: Over/Under/Normal", "Febrile condition"],
    ["Weight loss", "Lactose intolerance"],
    ["Diarrhea", "Gluten intolerance"],
    ["Constipation", "Anemia"],
    ["Malignancy", "Impaired CNS functions"],
    ["Burn", "Pregnancy"],
    ["Lactation", "Immunodeficiency diseases"],
  ];

  const radioRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "4px 0",
    borderBottom: "1px solid #f0f0f0",
  };

  const displayVal = (val) => val || "_______";
  const isChecked = (category, item, value) => {
    // Assuming formData.clinicalStatus handles these yes/no values
    // 'item' is the label (e.g., "Diarrhea : ")
    return formData.clinicalStatus && formData.clinicalStatus[item] === value
      ? "checked"
      : "";
  };

  const generatePrintContent = () => {
    const getClinicalChecked = (item, value) => {
      // We trim and remove the colon to match the keys stored by handleStatusChange
      const key = item.replace(" : ", "").replace(" :", "").trim();
      return formData.clinicalStatus && formData.clinicalStatus[key] === value
        ? "checked"
        : "";
    };
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
                          .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 10px 0; }
                          .row { display: flex; align-items: baseline; font-size: 14px;}
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
                          .fs-14{font-size:14px; font-weight:normal; margin: 10px 0px;}
    
                        .line { border-bottom: 1px solid #000; flex: 1; padding: 0 5px; min-height: 15px; display:inline-block;}
                          
                        .systems-container { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            border-top: 1px solid #000; 
                            border-left: 1px solid #000;
                            margin-top: 10px;
                            font-size:14px;
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

                        .checkBox{display: flex;gap: 15px;flex-wrap: wrap;margin-top: 10px;}
                       
                      </style>
                  </head>
                  <body>
                    
                    <div>
                      <div class="form-type">Form 6 - Front</div>
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
                      
                            <div class="row">
                                <b>Referred by : Dr </b> <div class="dotted-line">${formData.referredBy || ""}</div>
                                Referral Date & Time : <div class="dotted-line">${formData.referralDate || ""}</div> 
                            </div>

                            <div class="row">
                                Provisional Diagnosis : <div class="dotted-line">${formData.provisionalDiagnosis}</div>
                            </div>

                            <div class="row fs-14">
                                <span>Height: <span class="line">${formData.anthropometric.height || ""}</span>meters</span>
                                <span>Weight: <span class="line">${formData.anthropometric.weight || ""}</span>Kg.</span>
                                <span>BMI : <span class="line">${formData.anthropometric.bmi || ""}</span>kg/m</span>
                                <span>Status: <span class="line">${formData.anthropometric.status || ""}</span></span>
                            </div>
    
                            <div class="row fs-14">
                                <div style="display: flex; gap: 15px;">
                                    <span>Food habits : </span>
                                    <div class="box-wrap"><div class="box ${formData.foodHabits === "Vegetarian" ? "checked" : ""}"></div> Vegetarian</div>
                                    <div class="box-wrap"><div class="box ${formData.foodHabits === "Non vegetarian" ? "checked" : ""}"></div> Non vegetarian</div>
                                    <div class="box-wrap"><div class="box ${formData.foodHabits === "Mixed diet" ? "checked" : ""}"></div> Mixed diet</div>
                                    <div class="box-wrap"><div class="box ${formData.foodHabits === "Other" ? "checked" : ""}"></div>  Other <div class="dotted-line"></div></div>
                                </div>
                            </div>

                            <div class="row">
                                <div style="display: flex; gap: 15px;">
                                    <span>Appetite at present : </span>
                                    <div class="box-wrap"><div class="box ${formData.appetite === "Good" ? "checked" : ""}"></div> Good</div>
                                    <div class="box-wrap"><div class="box ${formData.appetite === "Poor" ? "checked" : ""}"></div> Poor</div>
                                    <div class="box-wrap"><div class="box ${formData.appetite === "Compulsive" ? "checked" : ""}"></div> Compulsive </div>
                                    <div class="box-wrap"><div class="box ${formData.appetite === "Other" ? "checked" : ""}"></div>  Other </div><div class="dotted-line"></div>
                                </div>
                            </div>





                            <div class="systems-container">
    <div class="system-box">
        <div class="system-title">Present Clinical Condition/ Status</div>
        ${[
          "Weight: Over/Under/Normal ",
          "Febrile condition : ",
          "Diarrhea : ",
          "Constipation :",
          "Malignancy : ",
          "Burn : ",
          "Pregnancy : ",
        ]
          .map(
            (item) => `
            <div class="item-row">
                <span>${item}</span>
                <div class="checkbox-group">
                    <div class="box-wrap"><div class="box ${getClinicalChecked(item, "Yes")}"></div> Yes</div>
                    <div class="box-wrap"><div class="box ${getClinicalChecked(item, "No")}"></div> No</div>
                </div>
            </div>
        `,
          )
          .join("")}
    </div>

    <div class="system-box">
        <div class="system-title" style="visibility:hidden">.</div>
        ${[
          "Lactation : ",
          "Immunodeficiency diseases : ",
          "Lactose intolerance : ",
          "Gluten intolerance : ",
          "Impaired CNS functions : ",
          "Other",
        ]
          .map(
            (item) => `
            <div class="item-row">
                <span>${item}</span>
                <div class="checkbox-group">
                    <div class="box-wrap"><div class="box ${getClinicalChecked(item, "Yes")}"></div> Yes</div>
                    <div class="box-wrap"><div class="box ${getClinicalChecked(item, "No")}"></div> No</div>
                </div>
            </div>
        `,
          )
          .join("")}
    </div>
</div>



    
                           
                            

                            <div class="fs-14">
                                <span><b>Investigation findings used for assessment : </b></span><br>
                                <div class="row">Blood sugar : <div class="dotted-line">${formData.investigations.bloodSugar || ""}</div> 
                                Sr. Calcium : <div class="dotted-line">${formData.investigations.chloride || ""}</div> 
                                Sr. Chloride : <div class="dotted-line">${formData.investigations.chloride || ""}</div> 
                                </div>
                                <div class="row">Sr. Sodium : <div class="dotted-line">${formData.investigations.sodium || ""}</div> 
                                Sr. Creatinine : <div class="dotted-line">${formData.investigations.creatinine || ""}</div> 
                                Sr. Uric acid : <div class="dotted-line">${formData.investigations.uricAcid || ""}</div> 
                                </div>
                                <div class="row">Sr. Potassium : <div class="dotted-line">${formData.investigations.potassium || ""}</div> 
                                Sr. Urea : <div class="dotted-line">${formData.investigations.urea || ""}</div> 
                                Others : <div class="dotted-line">${formData.investigations.others || ""}</div> 
                                </div>
                            </div>

                            <div class="" style="font-size: 14px;">
                                <span><b>Nutritional plan based on assessment : </b></span><br>
                                
                                <div class="row">
                                    Type of diet : <div class="dotted-line">${formData.plan.typeOfDiet || ""}</div> 
                                </div>

                                <div class="checkBox">
                                    <span>Requirement: Calories/ day : </span>
                                    ${[
                                      "1000 kcal",
                                      "1500 kcal",
                                      "2000 kcal",
                                      "2500 kcal",
                                    ]
                                      .map(
                                        (opt) => `
                                        <div class="box-wrap">
                                            <div class="box ${formData.plan.requirement === opt ? "checked" : ""}"></div> 
                                            ${opt}
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>

                            </div>


                            <div class="">
                                <div class="row">Other requirement : <div class="dotted-line">${formData.plan.otherRequirement || ""}</div> </div>
                            </div>

                            <div class="">
                                <div class="row">Restrictions : <div class="dotted-line">${formData.plan.restrictions || ""}</div> </div>
                            </div>

                            <div style="font-size: 14px;">
                                <div class="checkBox">
                                    <span>Type of feed required : </span>
                                    ${[
                                      "Oral",
                                      "Tube= RT/ JJ",
                                      "PEP",
                                      "PPN",
                                      "TPN",
                                    ]
                                      .map(
                                        (item) => `
                                        <div class="box-wrap">
                                            <div class="box ${formData.plan.typeOfFeed.includes(item) ? "checked" : ""}"></div> ${item}
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            </div>

                            <div style="font-size: 14px;">
                                <div class="checkBox">
                                    <span>Frequency of re-assessment : </span>
                                    ${[
                                      "Daily",
                                      "Alternate day",
                                      "Twice a week",
                                      "Weekly",
                                      "SOS",
                                    ]
                                      .map(
                                        (item) => `
                                        <div class="box-wrap">
                                            <div class="box ${formData.plan.frequency.includes(item) ? "checked" : ""}"></div> ${item}
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            </div>

                            <div style="font-size: 14px;">
                                <div class="checkBox">
                                    <span>Type of re-assessment required : </span>
                                    ${["Clinical", "Calorie count", "Weight"]
                                      .map(
                                        (item) => `
                                        <div class="box-wrap">
                                            <div class="box ${formData.plan.reAssessmentType.includes(item) ? "checked" : ""}"></div> ${item}
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                                <div class="row">
                                    Other : <div class="dotted-line">${formData.plan.reAssessmentSpecify || ""}</div>
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

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <h2
        style={{
          color: "#80deea",
          borderBottom: "2px solid #80deea",
          paddingBottom: "10px",
          marginBottom: "30px",
        }}
      >
        NUTRITIONAL ASSESSMENT FORM
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
          gridTemplateColumns: "2fr 1.5fr",
          gap: "20px",
          marginTop: "10px",
        }}
      >
        <TextInput
          label="Referred by: Dr."
          name="referredBy"
          value={formData.referredBy}
          onChange={handleChange}
        />
        <MuiDateTimePicker
          label="Date & Time"
          name="referralDate"
          value={formData.referralDate}
          onChange={handleChange}
        />
      </div>
      <TextInput
        label="Provisional Diagnosis"
        name="provisionalDiagnosis"
        value={formData.provisionalDiagnosis}
        onChange={handleChange}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
        }}
      >
        <TextInput
          label="Height (m)"
          name="anthropometric.height"
          value={formData.anthropometric.height}
          onChange={handleChange}
        />
        <TextInput
          label="Weight (kg)"
          name="anthropometric.weight"
          value={formData.anthropometric.weight}
          onChange={handleChange}
        />
        <TextInput
          label="BMI (kg/m²)"
          name="anthropometric.bmi"
          value={formData.anthropometric.bmi}
          onChange={handleChange}
        />
        <TextInput
          label="Status"
          name="anthropometric.status"
          value={formData.anthropometric.status}
          onChange={handleChange}
          placeholder="Over/Under/Normal"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          margin: "10px 0",
        }}
      >
        <div className="form-field">
          <label className="field-label">Food habits</label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["Vegetarian", "Non vegetarian", "Mixed diet"].map((opt) => (
              <label
                key={opt}
                className="radio-option"
                style={{ fontSize: "0.8rem" }}
              >
                <input
                  type="radio"
                  name="foodHabits"
                  value={opt}
                  checked={formData.foodHabits === opt}
                  onChange={handleChange}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label className="field-label">Appetite</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {["Good", "Poor", "Compulsive"].map((opt) => (
              <label key={opt} className="radio-option">
                <input
                  type="radio"
                  name="appetite"
                  value={opt}
                  checked={formData.appetite === opt}
                  onChange={handleChange}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <h3>Past history & presence of:</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        {[
          "Diabetes",
          "Hypertension",
          "Cardiac",
          "Renal Hepatic",
          "Pancreastic",
          "Tuberculosis",
          "COPD",
          "Hypothyroidien",
          "None",
        ].map((item) => (
          <label
            key={item}
            className="checkbox-label"
            style={{ border: "none", padding: 0 }}
          >
            <input
              type="checkbox"
              checked={formData.pastHistory.includes(item)}
              onChange={() => handleListChange("pastHistory", item)}
            />
            <span style={{ marginLeft: "4px", fontSize: "0.85rem" }}>
              {item}
            </span>
          </label>
        ))}
      </div>

      <h3
        style={{
          color: "#80deea",
          borderBottom: "1px solid #80deea",
          paddingBottom: "5px",
        }}
      >
        Clinical Condition / Status (Yes/No)
      </h3>
      <div className="medical-history-grid">
        {conditions.flat().map((cond) => (
          <div key={cond} className="history-item">
            <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>
              {cond}
            </span>
            <div style={{ display: "flex", gap: "15px" }}>
              <label className="radio-option" style={{ gap: "6px" }}>
                <input
                  type="radio"
                  name={`status_${cond}`}
                  value="Yes"
                  checked={formData.clinicalStatus[cond] === "Yes"}
                  onChange={() => handleStatusChange(cond, "Yes")}
                />
                <span>Yes</span>
              </label>
              <label className="radio-option" style={{ gap: "6px" }}>
                <input
                  type="radio"
                  name={`status_${cond}`}
                  value="No"
                  checked={formData.clinicalStatus[cond] === "No"}
                  onChange={() => handleStatusChange(cond, "No")}
                />
                <span>No</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <h3
        style={{
          color: "#80deea",
          borderBottom: "1px solid #80deea",
          paddingBottom: "5px",
        }}
      >
        Investigation findings used for assessment
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        {[
          ["bloodSugar", "Blood sugar"],
          ["sodium", "Sr. Sodium"],
          ["potassium", "Sr. Potassium"],
          ["calcium", "Sr. Calcium"],
          ["creatinine", "Sr. Creatinine"],
          ["urea", "Sr. Urea"],
          ["chloride", "Sr. Chloride"],
          ["uricAcid", "Sr. Uric acid"],
          ["others", "Others"],
        ].map(([key, label]) => (
          <TextInput
            key={key}
            label={label}
            name={`investigations.${key}`}
            value={formData.investigations[key]}
            onChange={handleChange}
          />
        ))}
      </div>

      <h3
        style={{
          color: "#80deea",
          borderBottom: "1px solid #80deea",
          paddingBottom: "5px",
        }}
      >
        Nutritional plan based on assessment
      </h3>

      <div style={{ marginBottom: "15px" }}>
        <TextInput
          label="Type of diet"
          name="plan.typeOfDiet"
          value={formData.plan.typeOfDiet}
          onChange={handleChange}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "20px",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#fdfdfd",
          borderRadius: "8px",
        }}
      >
        <span style={{ fontWeight: "600", color: "#666", fontSize: "0.9rem" }}>
          Requirement: Calories/ day
        </span>
        {["1000 kcal", "1500 kcal", "2000 kcal", "2500 kcal"].map((opt) => (
          <label key={opt} className="radio-option">
            <input
              type="radio"
              name="plan.requirement"
              value={opt}
              checked={formData.plan.requirement === opt}
              onChange={handleChange}
            />
            <span style={{ fontSize: "0.85rem" }}>{opt}</span>
          </label>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "15px",
        }}
      >
        <TextInput
          label="Other requirement"
          name="plan.otherRequirement"
          value={formData.plan.otherRequirement}
          onChange={handleChange}
        />
        <TextInput
          label="Restrictions"
          name="plan.restrictions"
          value={formData.plan.restrictions}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          className="field-label"
          style={{
            fontWeight: "600",
            marginBottom: "10px",
            display: "block",
          }}
        >
          Type of feed required
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
          {["Oral", "Tube= RT/ JJ", "PEP", "PPN", "TPN"].map((opt) => (
            <label key={opt} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.plan.typeOfFeed.includes(opt)}
                onChange={() =>
                  handleNestedListChange("plan", "typeOfFeed", opt)
                }
              />
              <span style={{ fontSize: "0.85rem" }}>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          className="field-label"
          style={{
            fontWeight: "600",
            marginBottom: "10px",
            display: "block",
          }}
        >
          Frequency of re-assessment
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
          {["Daily", "Alternate day", "Twice a week", "Weekly", "SOS"].map(
            (opt) => (
              <label key={opt} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.plan.frequency.includes(opt)}
                  onChange={() =>
                    handleNestedListChange("plan", "frequency", opt)
                  }
                />
                <span style={{ fontSize: "0.85rem" }}>{opt}</span>
              </label>
            ),
          )}
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <label
          className="field-label"
          style={{
            fontWeight: "600",
            marginBottom: "10px",
            display: "block",
          }}
        >
          Type of re-assessment required
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            alignItems: "center",
          }}
        >
          {["Clinical", "Calorie count", "Weight"].map((opt) => (
            <label key={opt} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.plan.reAssessmentType.includes(opt)}
                onChange={() =>
                  handleNestedListChange("plan", "reAssessmentType", opt)
                }
              />
              <span style={{ fontSize: "0.85rem" }}>{opt}</span>
            </label>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: 1,
              minWidth: "300px",
            }}
          >
            <TextInput
              label="Other specify"
              name="plan.reAssessmentSpecify"
              value={formData.plan.reAssessmentSpecify}
              onChange={handleChange}
              hideLabel
              placeholder="Other (specify)"
            />
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "25px",
          border: "1px solid #80deea",
          borderRadius: "12px",
          backgroundColor: "#fdfdfd",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "center",
            marginBottom: "25px",
            paddingBottom: "15px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <span style={{ fontWeight: "bold", color: "#444" }}>
            Diet counselling / Education provided:
          </span>
          <label className="radio-option">
            <input
              type="radio"
              name="nutritionCounseling"
              value="Yes"
              checked={formData.nutritionCounseling === "Yes"}
              onChange={handleChange}
            />
            <span>Yes</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="nutritionCounseling"
              value="No"
              checked={formData.nutritionCounseling === "No"}
              onChange={handleChange}
            />
            <span>No</span>
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            marginBottom: "30px",
          }}
        >
          <MuiDateTimePicker
            type="date"
            label="Date of Assessment"
            name="assessmentDate"
            value={formData.assessmentDate}
            onChange={handleChange}
          />
          <MuiDateTimePicker
            type="time"
            label="Time of Assessment"
            name="assessmentTime"
            value={formData.assessmentTime}
            onChange={handleChange}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "50px",
          }}
        >
          {/* Dietitian Column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <TextInput
              label="Name of Dietitian"
              name="dietitianName"
              value={formData.dietitianName}
              onChange={handleChange}
            />
            <TextInput
              label="Dietitian Signature (Type full name)"
              name="dietitianSignature"
              value={formData.dietitianSignature}
              onChange={handleChange}
              placeholder="Type for digital signature"
              style={{
                fontFamily: "cursive",
                fontSize: "1.2rem",
                color: "#1a365d",
              }}
            />
          </div>

          {/* Consultant Column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <TextInput
              label="Consultant / Resident Name"
              name="consultantName"
              value={formData.consultantName}
              onChange={handleChange}
            />
            <TextInput
              label="Consultant / Resident Signature"
              name="consultantSignature"
              value={formData.consultantSignature}
              onChange={handleChange}
              placeholder="Type for digital signature"
              style={{
                fontFamily: "cursive",
                fontSize: "1.2rem",
                color: "#1a365d",
              }}
            />
          </div>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Submit Nutritional Assessment
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
          <span>🖨️</span> Print Nutritional Assessment
        </button>
      </div>

      {/* <button type="submit" className="submit-btn">
          Submit Nutritional Assessment
        </button> */}
    </form>
  );
};

export default NutritionalAssessmentForm;
