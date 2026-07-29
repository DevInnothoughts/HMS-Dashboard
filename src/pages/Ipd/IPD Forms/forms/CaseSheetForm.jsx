import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Textarea from "../inputs/Textarea";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import RadioGroup from "../inputs/RadioGroup";
import "./Forms.css"; // Importing your shared CSS
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const CaseSheetForm = ({ onSubmit, patientData = {} }) => {
  const [formData, setFormData] = useState({
    uhid: patientData.uhid || "",
    name: patientData.name || "",
    age: patientData.age || "",
    gender: patientData.gender || "",
    ipNo: patientData.ipNo || "",
    height: "",
    weight: "",
    pulse: "",
    bp: "",
    temp: "",
    rr: "",
    pallor: "",
    edema: "",
    rs: "",
    cvs: "",
    cns: "",
    others: "",
    vulnerablePatient: "",
    lossOfWeight: "",
    foodIntakeReduced: "",
    detailedScreeningNote: "",
    nbmFrom: "",
    provisionalDiagnosis: "",
    investigationOrders: "",
    finalDiagnosis: "",
    plan: "",
    residentDoctorName: "",
    residentDoctorSign: "",
    residentDoctorDate: "",
    residentDoctorTime: "",
    consultantName: "",
    consultantSign: "",
    consultantDate: "",
    consultantTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const yesNoOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];
  const presentAbsentOptions = [
    { value: "Present", label: "Present" },
    { value: "Absent", label: "Absent" },
  ];

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
  
              /* Medical Table - Recreating the Benefits/Risks structure */
              .medical-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
              .medical-table th, .medical-table td { border: 1px solid #000; padding: 8px; vertical-align: top; text-align: left; }
              .medical-table th { background: #f2f2f2; font-weight: bold; }
              .bullet-list { margin: 0; padding-left: 18px; }
              .bullet-list li { margin-bottom: 4px; font-weight:normal; }
  .page-break { page-break-before: always; clear: both; display: block; height: 0; }
              /* Signature Blocks */
              .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px; }
              .sig-item {  padding: 5px 0 5px 0; font-size: 12px; font-weight: bold; }
  
              .attendant-section {padding-top: 10px; }
              .signature-section {
  page-break-inside: avoid;
  break-inside: avoid;
}

              
              @media print { .no-print { display: none; } }
          </style>
      </head>
      <body>
          <div class="page-container">
          <div class="form-type">Form 4 - Back</div>
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
  
                  <div class="main-title">CASE SHEET</div>

                  <!-- General Examination -->
                        <div style="display:flex; align-items:center; margin-top:10px; font-size:14px;">
                        <span style="font-weight:bold; width:160px;">General examination :</span>

                        <span>Height</span>
                        <span style="width:45px; border-bottom:1px dotted #000; margin:0 6px;"></span>cm

                        <span style="margin-left:12px;">Weight</span>
                        <span style="width:45px; border-bottom:1px dotted #000; margin:0 6px;"></span>kg

                        <span style="margin-left:12px;">Pulse</span>
                        <span style="width:45px; border-bottom:1px dotted #000; margin:0 6px;"></span>/min

                        <span style="margin-left:12px;">BP</span>
                        <span style="width:55px; border-bottom:1px dotted #000; margin:0 6px;"></span>mm/hg
                        </div>

                        <!-- Temp / RR aligned under Height -->
                        <div style="display:flex; align-items:center; margin-top:6px; font-size:14px;">
                        <span style="width:160px;"></span>

                        <span>Temp</span>
                        <span style="width:45px; border-bottom:1px dotted #000; margin:0 6px;"></span>°F

                        <span style="margin-left:35px;">RR</span>
                        <span style="width:45px; border-bottom:1px dotted #000; margin:0 6px;"></span>/min
                        </div>

                        <div style="display:flex; align-items:center; margin-top:6px; font-size:14px;">
                        <span style="width:160px;"></span>
                        <span>Pallor : </span>
                        <span style="margin-left:6px;">Absent</span>
                        <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin:0 8px;"></span>
                        <span>Present</span>
                        <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin:0 20px 0 8px;"></span>

                        <span>Oedema :</span>
                        <span style="margin-left:6px;">Absent</span>
                        <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin:0 8px;"></span>
                        <span>Present</span>
                        <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin-left:8px;"></span>
                        </div>

                    
                       <!-- ================= SYSTEMIC EXAMINATION ================= -->

                        <div style="font-size:14px; margin-top:15px;">

                        <!-- Row 1 : Systemic examination + RS + CVS -->
                        <div style="display:flex; align-items:center;">
                            <span style="font-weight:bold; width:160px;">Systemic examination -</span>

                            <span style="width:30px;">RS</span>
                            <span style="width:230px; border-bottom:1px dotted #000;"></span>

                            <span style="margin-left:25px; width:35px;">CVS</span>
                            <span style="width:230px; border-bottom:1px dotted #000;"></span>
                        </div>

                        <!-- Row 2 : CNS + Others (aligned under RS/CVS) -->
                        <div style="display:flex; align-items:center; margin-top:6px;">
                            <span style="width:160px;"></span>

                            <span style="width:30px;">CNS</span>
                            <span style="width:230px; border-bottom:1px dotted #000;"></span>

                            <span style="margin-left:25px; width:35px;">Others</span>
                            <span style="width:230px; border-bottom:1px dotted #000;"></span>
                        </div>

                        </div>

                        <!-- Vulnerable -->
                        <div style="display:flex; align-items:center; margin-top:15px; font-size:14px;">
                        <span style="font-weight:bold; width:160px;">Vulnerable patient-</span>
                        <span>Yes</span>
                        <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin:0 12px;"></span>
                        <span>No</span>
                        <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin-left:8px;"></span>
                        </div>

                        <!-- ================= NUTRITIONAL SCREENING ================= -->

                        <div style="font-size:14px; margin-top:15px;">
                            <div style="display:flex; align-items:center;">
                                <span style="font-weight:bold; width:160px;">Nutritional screening -</span>
                                <span style="width:260px;">Loss of weight in past 3 months</span>
                                <span style="margin-left:20px;">Yes</span>
                                <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin:0 10px;"></span>
                                <span>No</span>
                                <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin-left:6px;"></span>
                            </div>
                            <div style="display:flex; align-items:center; margin-top:6px;">
                                <span style="width:160px;"></span>
                                <span style="width:260px;">Food intake reduced in last week</span>
                                <span style="margin-left:20px;">Yes</span>
                                <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin:0 10px;"></span>
                                <span>No</span>
                                <span style="width:12px; height:12px; border:1px solid #000; display:inline-block; margin-left:6px;"></span>
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; margin-top:15px; font-size:14px;">
                        <span>If any “Yes” detailed screening is required</span>
                        <span style="flex:1; border-bottom:1px dotted #000; margin-left:10px;"></span>
                        </div>

                        <!-- NBM -->
                        <div style="display:flex; align-items:center; margin-top:15px; font-size:14px;">
                            <span style="font-weight:bold;">NBM from - </span>
                            <span style="flex:1; border-bottom:1px dotted #000;"></span>
                        </div>

                        <div style="display:flex; align-items:center; margin-top:15px; font-size:14px;">
                            <span style="font-weight:bold;">Provisional diagnosis - </span>
                            <span style="flex:1; border-bottom:1px dotted #000;"></span>
                        </div>

                        <div style="display:flex; align-items:center; margin-top:15px; font-size:14px;">
                            <span style="font-weight:bold;">Investigation orders - </span>
                            <span style="flex:1; border-bottom:1px dotted #000;"></span>
                        </div>

                        <div style="display:flex; align-items:center; margin-top:15px; font-size:14px;">
                            <span style="font-weight:bold;">Final diagnosis - </span>
                            <span style="flex:1; border-bottom:1px dotted #000;"></span>
                        </div>

                        <div style="display:flex; align-items:center; margin-top:15px; font-size:14px;">
                            <span style="font-weight:bold;">Plan  - </span>
                            <span style="flex:1; border-bottom:1px dotted #000;"></span>
                        </div>

                        
                        <div style="display:flex; justify-content:space-between; margin-top:15px; font-size:14px;">

                            <!-- Resident Doctor -->
                            <div style="width:48%; display:flex; flex-direction:column;">
                                <span style="font-weight:bold;">Name of Resident Doctor</span>

                                <div style="display:flex; align-items:center; margin-top:15px;">
                                <span>Sign :</span>
                                <span style="flex:1; border-bottom:1px dotted #000; margin-left:10px;"></span>
                                </div>

                                <div style="display:flex; align-items:center; margin-top:10px;">
                                <span>Date :</span>
                                <span style="flex:1; border-bottom:1px dotted #000; margin-left:10px;"></span>
                                </div>

                                <div style="display:flex; align-items:center; margin-top:10px;">
                                <span>Time :</span>
                                <span style="flex:1; border-bottom:1px dotted #000; margin-left:10px;"></span>
                                </div>
                            </div>

                            <!-- Consultant Doctor -->
                            <div style="width:48%; display:flex; flex-direction:column;">
                                <span style="font-weight:bold;">Name of Consultant</span>

                                <div style="display:flex; align-items:center; margin-top:15px;">
                                <span>Sign :</span>
                                <span style="flex:1; border-bottom:1px dotted #000; margin-left:10px;"></span>
                                </div>

                                <div style="display:flex; align-items:center; margin-top:10px;">
                                <span>Date :</span>
                                <span style="flex:1; border-bottom:1px dotted #000; margin-left:10px;"></span>
                                </div>
                                <div style="display:flex; align-items:center; margin-top:10px;">
                                <span>Time :</span>
                                <span style="flex:1; border-bottom:1px dotted #000; margin-left:10px;"></span>
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
    <div className="medical-form-container">
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">CASE SHEET</h2>

        {/* Patient Header - Reusing standard IPD style */}
        <div className="patient-compact-header">
          <div className="info-item">
            <span className="info-label">UHID</span>
            <span className="info-value">{formData.uhid || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Patient Name</span>
            <span className="info-value">{formData.name || "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Age/Sex</span>
            <span className="info-value">
              {formData.age || "—"}/{formData.gender || "—"}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">IP No</span>
            <span className="info-value">{formData.ipNo || "—"}</span>
          </div>
        </div>

        {/* Section 1: General Examination */}
        <div className="section-box">
          <div className="form-section-title">General Examination</div>
          <div className="three-col">
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
              label="Pulse (/min)"
              name="pulse"
              value={formData.pulse}
              onChange={handleChange}
            />
          </div>
          <div className="three-col" style={{ marginTop: "10px" }}>
            <TextInput
              label="BP (mmHg)"
              name="bp"
              value={formData.bp}
              onChange={handleChange}
            />
            <TextInput
              label="Temp (°F)"
              name="temp"
              value={formData.temp}
              onChange={handleChange}
            />
            <TextInput
              label="RR (/min)"
              name="rr"
              value={formData.rr}
              onChange={handleChange}
            />
          </div>
          <div className="two-col" style={{ marginTop: "15px" }}>
            <div className="form-field">
              <label className="field-label">Pallor</label>
              <RadioGroup
                name="pallor"
                value={formData.pallor}
                onChange={handleChange}
                options={presentAbsentOptions}
              />
            </div>
            <div className="form-field">
              <label className="field-label">Edema</label>
              <RadioGroup
                name="edema"
                value={formData.edema}
                onChange={handleChange}
                options={presentAbsentOptions}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Systemic Examination */}
        <div className="section-box">
          <div className="form-section-title">Systemic Examination</div>
          <div className="two-col">
            <TextInput
              label="RS (Respiratory)"
              name="rs"
              value={formData.rs}
              onChange={handleChange}
            />
            <TextInput
              label="CVS (Cardiovascular)"
              name="cvs"
              value={formData.cvs}
              onChange={handleChange}
            />
            <TextInput
              label="CNS (Central Nervous)"
              name="cns"
              value={formData.cns}
              onChange={handleChange}
            />
            <TextInput
              label="Others"
              name="others"
              value={formData.others}
              onChange={handleChange}
            />
          </div>
          <div className="form-field" style={{ marginTop: "15px" }}>
            <label className="field-label">Vulnerable Patient Status</label>
            <RadioGroup
              name="vulnerablePatient"
              value={formData.vulnerablePatient}
              onChange={handleChange}
              options={yesNoOptions}
            />
          </div>
        </div>

        {/* Section 3: Nutritional Screening */}
        <div className="section-box" style={{ backgroundColor: "#f8fafc" }}>
          <div className="form-section-title">Nutritional Screening</div>
          <div className="two-col">
            <div className="form-field">
              <label className="field-label">
                Loss of weight in past 3 months?
              </label>
              <RadioGroup
                name="lossOfWeight"
                value={formData.lossOfWeight}
                onChange={handleChange}
                options={yesNoOptions}
              />
            </div>
            <div className="form-field">
              <label className="field-label">
                Food intake reduced in last week?
              </label>
              <RadioGroup
                name="foodIntakeReduced"
                value={formData.foodIntakeReduced}
                onChange={handleChange}
                options={yesNoOptions}
              />
            </div>
          </div>
          <div style={{ marginTop: "10px" }}>
            <TextInput
              label="Detailed screening note (if 'Yes' to any)"
              name="detailedScreeningNote"
              value={formData.detailedScreeningNote}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 4: Clinical Diagnosis & Plan */}
        <div className="section-box">
          <div className="form-section-title">Clinical Details</div>
          <Textarea
            label="NBM Status / Instructions"
            name="nbmFrom"
            value={formData.nbmFrom}
            onChange={handleChange}
            rows={2}
          />
          <div className="two-col">
            <Textarea
              label="Provisional Diagnosis"
              name="provisionalDiagnosis"
              value={formData.provisionalDiagnosis}
              onChange={handleChange}
              rows={3}
            />
            <Textarea
              label="Final Diagnosis"
              name="finalDiagnosis"
              value={formData.finalDiagnosis}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <Textarea
            label="Investigation Orders"
            name="investigationOrders"
            value={formData.investigationOrders}
            onChange={handleChange}
            rows={2}
          />
          <Textarea
            label="Management Plan"
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* Section 5: Authorization */}
        <div
          className="section-box"
          style={{ borderTop: "4px solid var(--primary-color)" }}
        >
          <div className="form-body-split">
            <div className="section-box" style={{ margin: 0 }}>
              <div className="info-label" style={{ marginBottom: "10px" }}>
                Resident Doctor
              </div>
              <TextInput
                label="Doctor Name"
                name="residentDoctorName"
                value={formData.residentDoctorName}
                onChange={handleChange}
              />
              <TextInput
                label="Signature"
                name="residentDoctorSign"
                value={formData.residentDoctorSign}
                onChange={handleChange}
              />
              <div className="two-col" style={{ marginTop: "10px" }}>
                <MuiDateTimePicker
                  label="Date"
                  name="residentDoctorDate"
                  value={formData.residentDoctorDate}
                  onChange={handleChange}
                  type="date"
                />
                <MuiDateTimePicker
                  label="Time"
                  name="residentDoctorTime"
                  value={formData.residentDoctorTime}
                  onChange={handleChange}
                  type="time"
                />
              </div>
            </div>
            <div className="section-box" style={{ margin: 0 }}>
              <div className="info-label" style={{ marginBottom: "10px" }}>
                Consultant In-Charge
              </div>
              <TextInput
                label="Consultant Name"
                name="consultantName"
                value={formData.consultantName}
                onChange={handleChange}
              />
              <TextInput
                label="Signature"
                name="consultantSign"
                value={formData.consultantSign}
                onChange={handleChange}
              />
              <div className="two-col" style={{ marginTop: "10px" }}>
                <MuiDateTimePicker
                  label="Date"
                  name="consultantDate"
                  value={formData.consultantDate}
                  onChange={handleChange}
                  type="date"
                />
                <MuiDateTimePicker
                  label="Time"
                  name="consultantTime"
                  value={formData.consultantTime}
                  onChange={handleChange}
                  type="time"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Complete Case Sheet
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
            <span>🖨️</span> Print Case Sheet Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseSheetForm;
