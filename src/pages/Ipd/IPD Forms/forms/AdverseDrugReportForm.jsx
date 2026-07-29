import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import Textarea from "../inputs/Textarea";
import CheckboxGroup from "../inputs/CheckboxGroup";
import RadioGroup from "../inputs/RadioGroup";
import "./Forms.css"; // Importing your shared CSS
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const AdverseDrugReportForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    incidentDateTime: "",
    reportingDateTime: "",
    ward: "",
    bed: "",
    prn: "",
    consultant: "",
    nurse: "",
    drugName: "",
    dose: "",
    route: "",
    manufacturer: "",
    batchNo: "",
    expiry: "",
    highRisk: "",
    seriousness: [],
    reactionDetails: "",
    outcome: "",
    labData: "",
    relevantHistory: "",
    relevantLaboratory: "",
    treatmentDetails: "",
    staffNurse: "",
    investigationTeam: "",
    administratorName: "",
    adminDateTime: "",
    actionPlan: "",
    member1: "",
    member2: "",
    member3: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            /* Table Styling */
            .medical-grid { width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid #000; }
            .medical-grid td { border: 1px solid #000; padding: 6px; vertical-align: top; word-wrap: break-word; }
            
            /* Elements */
            .cb-group { display: flex; flex-direction: row; flex-wrap: wrap; gap: 12px; margin-top: 5px; }
            .cb-item { display: flex; align-items: center; font-size: 12px; }
            .box { width: 14px; height: 14px; border: 1px solid #000; margin-right: 5px; flex-shrink: 0; }
            .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; height: 1.1em; }
            
            .fs-14 { font-size: 14px; margin-top: 10px; }

            /* Page Break Logic */
            .page-break { page-break-before: always; clear: both; display: block; height: 0; }

            @media print { .no-print { display: none; } outer-border { height: 90vh; }}
        </style>
    </head>
    <body>
        <div class="page-container">
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

                <div class="main-title">ADVERSE DRUG REPORT FORM</div>

                <table class="medical-grid">
                    <tr>
                        <td colspan="3"><b>Date & Time of incidence:</b> ${formData.incidentDateTime} </td>
                        <td colspan="3"><b>Date & Time of reporting:</b>${formData.reportingDateTime} </td>
                    </tr>
                    <tr>
                        <td colspan="6"><b>Place of incidence: Ward: </b> ${formData.ward}  <b style={{marginLeft:10px}}>Bed: </b> ${formData.bed}</td>
                    </tr>
                    <tr>
                        <td colspan="1"><b>PRN:</b> ${formData.prn || ""}</td>
                        <td colspan="3"><b>Consultant: </b> ${formData.consultant}</td>
                        <td colspan="2"><b>Nurse: </b>  ${formData.nurse}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><b>Drug: </b> ${formData.drugName}</td>
                        <td colspan="2"><b>Dose: </b> ${formData.dose}</td>
                        <td colspan="2"><b>Route: </b> ${formData.route}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><b>Manufacturer:</b> ${formData.manufacturer}</td>
                        <td colspan="2"><b>Batch No & Expiry:</b> ${formData.batchNo} | ${formData.expiry}</td>
                       
                        <td colspan="2"><b>High risk:</b> ${formData.highRisk}</td>
                    </tr>
                    <tr>
                        <td colspan="6" style="height: 60px;">
                            <b>Seriousness of the reaction</b>
                            <div class="cb-group">
                                <div class="cb-item">
                                    <div class="box ${formData.seriousness.includes("Death") ? "checked" : ""}"></div> 
                                    Death (dd/mm/yy) _______
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.seriousness.includes("Congenital anomaly") ? "checked" : ""}"></div> 
                                    Congenital anomaly
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.seriousness.includes("Life threatening") ? "checked" : ""}"></div> 
                                    Life threatening
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.seriousness.includes("Required intervention") ? "checked" : ""}"></div> 
                                    Required intervention
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.seriousness.includes("Disability") ? "checked" : ""}"></div> 
                                    Disability
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.seriousness.includes("Other") ? "checked" : ""}"></div> 
                                    Other(specify)
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr> 
                        <td colspan="6">
                            <b>Details of reaction:</b>
                            <div style="margin-top: 5px;">${formData.reactionDetails || ""}</div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="6">
                            <b>Outcomes</b>
                           <div class="cb-group">
                                <div class="cb-item">
                                    <div class="box ${formData.outcome === "fatal" ? "checked" : ""}"></div> 
                                    Fatal
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.outcome === "recovering" ? "checked" : ""}"></div> 
                                    Recovering
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.outcome === "unknown" ? "checked" : ""}"></div> 
                                    Unknown
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.outcome === "continuing" ? "checked" : ""}"></div> 
                                    Continuing
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.outcome === "recovered" ? "checked" : ""}"></div> 
                                    Recovered
                                </div>
                                <div class="cb-item">
                                    <div class="box ${formData.outcome === "other" ? "checked" : ""}"></div> 
                                    Other: ________
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="6"><b>Relevant laboratory Data/ tests/ results etc with dates:</b>
                            <div class="data-content">
                            ${formData.labData || "No laboratory data recorded."}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="6">
                            <b>Other relevant history (Allergies, pregnancy, etc.):</b>
                            <div style="margin-top: 5px;">${formData.relevantHistory || ""}</div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="6"><b>Details of treatment given:</b> ${formData.treatmentDetails || ""}</td>
                    </tr>
                    <tr>
                        <td colspan="6"><b>SNDT of Staff Nurse:</b> ${formData.staffNurse || ""}</td>
                    </tr>
                    <tr>
                        <td colspan="6" style="height: 100px;">
                            <b>Investigation by MDE Team.</b>
                            1. <u>${formData.member1 || "___________"}</u> &nbsp;&nbsp; 2. <u>${formData.member2 || "___________"}</u> &nbsp;&nbsp; 3. <u>${formData.member3 || "___________"}</u>
                            <p margin-top: 10px;">Please investigate all root causes of the incident and the report with recommendations may please be submitted at the earliest (not later than 3 days).</p>
                            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                                <span>Signature Medical Administrator</span>
                                <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                                <span>Name :  </span>
                                <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;">${formData.administratorName}</span>
                                <span>Date : </span>
                                <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"> ${formData.adminDateTime}</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="6">
                            <b>Action Plan with time commitment:</b>
                            <div style="display: flex; align-items: baseline; margin-top: 10px;">
                                <span>Signature</span>
                                <span style="width: 250px; border-bottom: 1px dotted #000; margin-left: 10px;"></span>
                            </div>
                        </td>
                    </tr>
                </table>
               
            </div>
        </div>

        <div class="page-break"></div>

        <div class="page-container">
            <div class="form-type">Form 19 - Back</div>
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
                
                <div class="main-title">INVESTIGATION & ACTION PLAN</div>

                <table class="medical-grid">
                    <tr>
                        <td colspan="2"><b>Medical administrator</b></td>
                        <td colspan="2"><b>Name:</b></td>
                        <td colspan="2"><b>Date & Time:</b></td>
                    </tr>
                    <tr>
                        <td colspan="6" style="height: 120px;">
                            <span style="font-weight:bold;">Medical director's comments</span>
                            <div style="display: flex; justify-content: space-between; margin-top: 70px;">
                                <span>Sign: ____________________</span>
                                <span>Date: ____________________</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="height: 250px;"><b>Corrective action -</b></td>
                        <td colspan="3" style="height: 250px;"><b>Preventive action -</b></td>
                    </tr>
                    <tr>
                        <td colspan="3" style="height: 120px;"><b>Action plan:</b></td>
                        <td colspan="3" style="height: 120px;">
                            <b>Action verified by:</b>
                            <div style="margin-top: 15px;">Name:</div>
                            <div style="display: flex; justify-content: space-between; margin-top: 35px;">
                                <span>Date:</span>
                                <span>Sign:</span>
                                <span>Time:</span>
                            </div>
                        </td>
                    </tr>
                </table>
                
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
        <h2 className="form-title">ADVERSE DRUG REPORT FORM</h2>

        {/* Patient Header - Standard across all forms */}
        {patientData && (
          <div className="patient-compact-header">
            <div className="info-item">
              <span className="info-label">UHID</span>
              <span className="info-value">{patientData.uhid || "—"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Patient Name</span>
              <span className="info-value">{patientData.name || "—"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Age/Sex</span>
              <span className="info-value">
                {patientData.age || "—"}/{patientData.gender || "—"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">IP No</span>
              <span className="info-value">{patientData.ipNo || "—"}</span>
            </div>
          </div>
        )}

        {/* Section 1: Incident Logistics */}
        <div className="section-box">
          <div className="form-section-title">Incident Details</div>
          <div className="two-col">
            <MuiDateTimePicker
              label="Date & Time of Incidence"
              name="incidentDateTime"
              value={formData.incidentDateTime}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time of Reporting"
              name="reportingDateTime"
              value={formData.reportingDateTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-grid" style={{ marginTop: "10px" }}>
            <TextInput
              label="Ward"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
            />
            <TextInput
              label="Bed No"
              name="bed"
              value={formData.bed}
              onChange={handleChange}
            />
            <TextInput
              label="PRN"
              name="prn"
              value={formData.prn}
              onChange={handleChange}
            />
            <TextInput
              label="Consultant In-charge"
              name="consultant"
              value={formData.consultant}
              onChange={handleChange}
            />
          </div>
          <TextInput
            label="Nurse on Duty"
            name="nurse"
            value={formData.nurse}
            onChange={handleChange}
          />
        </div>

        {/* Section 2: Medication Details */}
        <div className="section-box">
          <div className="form-section-title">Suspected Medication Details</div>
          <div className="three-col">
            <TextInput
              label="Drug Name"
              name="drugName"
              value={formData.drugName}
              onChange={handleChange}
            />
            <TextInput
              label="Dose"
              name="dose"
              value={formData.dose}
              onChange={handleChange}
            />
            <TextInput
              label="Route"
              name="route"
              value={formData.route}
              onChange={handleChange}
            />
          </div>

          <div className="three-col" style={{ marginTop: "10px" }}>
            <TextInput
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
            />
            <TextInput
              label="Batch No"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
            />
            {/* <TextInput
              label="Expiry Date"
              name="expiry"
              value={formData.expiry}
              onChange={handleChange}
            /> */}
            <MuiDateTimePicker
              label="Expiry Date"
              name="expiry"
              value={formData.expiry}
              onChange={handleChange}
            />
          </div>

          <div className="form-field" style={{ marginTop: "15px" }}>
            <label className="field-label">High Risk Drug Status</label>
            <RadioGroup
              name="highRisk"
              value={formData.highRisk}
              onChange={handleChange}
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
            />
          </div>
        </div>

        {/* Section 3: Reaction & Outcome */}
        <div className="section-box">
          <div className="form-section-title">Reaction Assessment</div>

          <div className="form-field">
            <label className="field-label">
              Seriousness of Reaction (Select all that apply)
            </label>
            <CheckboxGroup
              name="seriousness"
              value={formData.seriousness}
              onChange={handleChange}
              options={[
                "Death",
                "Life threatening",
                "Hospitalization",
                "Disability",
                "Congenital anomaly",
                "Required intervention",
                "Other",
              ]}
            />
          </div>

          <Textarea
            label="Clinical Details of Reaction"
            name="reactionDetails"
            value={formData.reactionDetails}
            onChange={handleChange}
            rows={3}
          />

          <div className="form-field" style={{ marginTop: "15px" }}>
            <label className="field-label">Outcome of Reaction</label>
            <RadioGroup
              name="outcome"
              value={formData.outcome}
              onChange={handleChange}
              options={[
                { label: "Fatal", value: "fatal" },
                { label: "Recovering", value: "recovering" },
                { label: "Recovered", value: "recovered" },
                { label: "Continuing", value: "continuing" },
                { label: "Unknown", value: "unknown" },
              ]}
            />
          </div>
        </div>

        {/* Section 4: History & Lab Data */}
        <div className="section-box">
          <div className="form-section-title">Clinical History & Treatment</div>
          <div className="two-col">
            <Textarea
              label="Laboratory Data / Test Results"
              name="labData"
              value={formData.labData}
              onChange={handleChange}
              rows={4}
            />
            <Textarea
              label="Other Relevant Medical History"
              name="relevantHistory"
              placeholder="(e.g., allergies, race, pregnancy,
smoking alcohol use, hepatic/ renal dysfunction, etc.):
"
              value={formData.relevantHistory}
              onChange={handleChange}
              rows={4}
            />
          </div>
          <Textarea
            label="Details of Treatment Given for Reaction"
            name="treatmentDetails"
            value={formData.treatmentDetails}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* Section 5: Investigation & Admin */}
        <div className="section-box">
          <div className="form-section-title">Administrative Investigation</div>
          <div className="two-col" style={{ marginTop: "15px" }}>
            <TextInput
              label="SNDT of Staff Nurse"
              name="staffNurse"
              value={formData.staffNurse}
              onChange={handleChange}
            />
            <div className="">
              Administrative Investigation Team members:
              <TextInput
                label=" Team 1."
                name="member1"
                value={formData.member1}
                onChange={handleChange}
              />
              <TextInput
                label="Team 2."
                name="member2"
                value={formData.member2}
                onChange={handleChange}
              />
              <TextInput
                label="Team 3."
                name="member3"
                value={formData.member3}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="two-col" style={{ marginTop: "15px" }}>
            <TextInput
              label="Medical Administrator Name"
              name="administratorName"
              value={formData.administratorName}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Verification Date & Time"
              name="adminDateTime"
              value={formData.adminDateTime}
              onChange={handleChange}
            />
          </div>

          <Textarea
            label="Action Plan with Time Commitment"
            name="actionPlan"
            value={formData.actionPlan}
            onChange={handleChange}
            rows={3}
            style={{ marginTop: "10px" }}
          />
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Submit Adverse Drug Report
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
            <span>🖨️</span> Print Admission Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdverseDrugReportForm;
