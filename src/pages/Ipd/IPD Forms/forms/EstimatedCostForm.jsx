import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import CheckboxGroup from "../inputs/CheckboxGroup";
import SignatureInput from "../inputs/SignatureInput";
import "./Forms.css"; // Importing your shared CSS
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const EstimatedCostForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    surgeryName: "",
    estimatedAmount: "",
    exclusionsAcknowledged: [],
    patientSignature: "",
    patientDateTime: null,
    counsellorName: "",
    counsellorSignature: "",
    counsellorDateTime: null,
  });

  const handleChange = (e) => {
    // If e is not a standard event (some MUI components do this),
    // or if name is missing, exit safely.
    if (!e || !e.target) return;

    const { name, value } = e.target;

    // STOP the generic handler from touching the array field
    if (name === "exclusionsAcknowledged") return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ ...formData, patientHeader: patientData });
  };

  // print form starts
  const generatePrintContent = () => {
    // Access local state variables directly
    const dateTimeParts = formData?.admissionDateTime
      ? formData.admissionDateTime.split(" ")
      : ["", ""];
    const admissionDate = dateTimeParts[0] || "________________";
    const admissionTime = dateTimeParts[1] || "________________";

    const isChecked = (value) => {
      // We check if the value exists inside the specific array in your state
      return formData?.exclusionsAcknowledged?.includes(value) ? "checked" : "";
    };

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ADMISSION CHECK LIST</title>
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
            .cb-item { display: flex; align-items: center; margin-bottom: 6px; font-size: 14px; }
            .box { width: 18px; height: 18px; border: 1px solid #cbd5e0; border-radius: 4px; margin-top: 5px; margin-right: 5px; position: relative; flex-shrink: 0; background-color: #fff; }
            .box.checked { background-color: #00bcd4; border-color: #00bcd4; }
            .box.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); color: #333; font-weight: bold; font-size: 14px; }
            .amenities-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; margin-left: 30px; gap: 5px 2px; }
            .section-title { margin-bottom: 5px; margin-top: 5px; font-size: 14px; font-weight:bold; }
            .indent { margin-left: 30px; }
            .sig-flex { display: flex; gap:40%; margin-top: 20px; }
            .line-solid { border-bottom: 1px solid #333; width: 225px; display: inline-block; height: 1.1em; text-align: center; padding: 4px 10px;  }
            .line-long { border-bottom: 1px solid #333; flex: 1; margin-left: 10px; height: 1.1em; text-align: left; padding-left: 10px; padding: 4px 10px; }
            @media print { .no-print { display: none; } outer-border { height: 90vh; }}
        </style>
    </head>
    <body>
        <div class="form-type">Form 2 - Back</div>
        <div class="outer-border">
            <div class="header-flex">
                <div class="logo-area">
                    <img src="${window.location.origin}${hhcLogo}" class="logo-img" alt="HHC Logo">
                </div>
                <div class="patient-info-block">
                    <div><span class="label-teal">Name:</span>${patientData?.name || ""}</div>
                    <div><span class="label-teal">Age/Gender:</span>${patientData?.age || ""} / ${patientData?.gender || ""}</div>
                    <div><span class="label-teal">UHID:</span>${patientData?.uhid || ""}</div>
                    <div><span class="label-teal">I/P:</span>${patientData?.ipNo || ""}</div>
                    <div><span class="label-teal">DOA:</span>${formData?.admissionDateTime || ""}</div>
                    <div><span class="label-teal">Contact No:</span>${patientData?.contact || ""}</div>
                </div>
            </div>
            
            <div class="main-title">ESTIMATED COST OF TREATMENT</div>
        
            
            <div class="row">
                TOTAL TENTATIVE ESTIMATE FOR THE SURGERY
                <div class="dotted-line">${formData.estimatedAmount || ""}</div>
            </div>

            <div>
                <p>Including , nursing charges , physio charges, diet consultation charges, surgeon charges , anaesthesia charges, OT Drugs , Consumables and Disposables)</p>
            </div>

            <div class="section-title">The above estimate excludes :  </div>
            <div class="indent">
                <div class="cb-item"><div class="box ${isChecked("Pre and post operative lab tests")}"></div> Pre and post operative lab test</div>
                <div class="cb-item"><div class="box ${isChecked("Speciality consultants visit")}"></div> Speciality consultants visit</div>
                <div class="cb-item"><div class="box ${isChecked("Blood transfusion")}"></div>  Blood transfusion</div>
                <div class="cb-item"><div class="box ${isChecked("Discharge medications")}"></div> Discharge medications</div>
                <div class="cb-item"><div class="box ${isChecked("Unforeseen charges due to complications")}"></div> Other unforeseen charges arising out of complications if any</div>
                <div class="cb-item"><div class="box ${isChecked("ICU stay & higher antibiotics")}"></div> ICU stay & higher antibiotics</div>
                <div class="cb-item"><div class="box ${isChecked("Prolonged stay beyond package duration")}"></div>  Prolonged stay of more than 1 Night</div>
            </div>

            <div>
                <p>Please note that this is only an estimate. If patient medical condition after or other medical problems are
discovered after the admission, estimate shall be revised. The estimate has been clearly explained to me,
has been fully understood and accepted by me.</p>
                <p>Please note that this is only an estimate. If patient medical condition after or other medical problems
are discovered after the admission, estimate shall be revised.
</p>
                <p>The estimate has been clearly explained to me, has been fully understood and accepted by me</p>
            </div>

            

            <div class="footer">
                <div class="row"><span style="font-weight: bold;">Name of Patient / Legal representative Name:</span><div class="line-long" style="font-weight: normal; text-align: center;">${patientData?.name || ""}</div></div>
                <div class="sig-flex">
                    <div style="font-size:14px"><span style="font-weight: bold;">Signature : ${formData.patientSignature || ""}</span></div>
                    <div style="font-size:14px"><span style="font-weight: bold;">Date : ${formData.patientDateTime || ""}</span> </div>
                </div>
                <div class="sig-flex">
                    <div style="font-size:14px"><span style="font-weight: bold;"> Time:</span> </div>
                    
                </div>
            </div>

            <div class="footer" style=" margin-top:20px">
                <div class="row"><span style="font-weight: bold;">Counselled by , name : </span><div class="line-long" style="font-weight: normal; text-align: center;">${formData.counsellorName || ""}</div></div>
                <div class="sig-flex">
                    <div style="font-size:14px"><span style="font-weight: bold;">Signature : ${formData.counsellorSignature || ""}</span></div>
                    <div style="font-size:14px"><span style="font-weight: bold;">Date & Time : ${formData.counsellorDateTime || ""}</span> </div>
                </div>
                <div class="sig-flex">
                    <div style="font-size:14px"><span style="font-weight: bold;"> Time:</span> </div>
                    
                </div>
            </div>
        </div>
        <div class="no-print" style="text-align:center; padding: 20px;">
            <button onclick="window.print()" style="padding: 10px 40px; background:#008080; color:white; border:none; border-radius:5px; cursor:pointer;">Print Form</button>
        </div>
    </body>
    </html>
    `;

    const blob = new Blob(["\ufeff" + htmlContent], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(
      url,
      "PrintChecklist",
      `width=800,height=900,scrollbars=yes`,
    );
    if (printWindow) printWindow.onload = () => URL.revokeObjectURL(url);
  };
  // print form ends

  return (
    <div className="medical-form-container">
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">ESTIMATED COST OF TREATMENT</h2>

        {/* Patient Header */}
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

        {/* Section 1: Treatment Details */}
        <div className="section-box">
          <div className="form-section-title">Estimation Details</div>
          <div className="two-col">
            <TextInput
              label="Surgery / Treatment Name"
              name="surgeryName"
              value={formData.surgeryName}
              onChange={handleChange}
              required
            />
            <TextInput
              label="Total Tentative Estimated Amount (₹)"
              name="estimatedAmount"
              value={formData.estimatedAmount}
              onChange={handleChange}
              placeholder="e.g. 50,000"
              required
            />
          </div>
        </div>

        {/* Section 2: Exclusions */}
        <div className="section-box">
          <div className="form-section-title">Exclusions Acknowledgement</div>
          <div className="form-field">
            <label className="field-label">The above estimate excludes:</label>
            <CheckboxGroup
              name="exclusionsAcknowledged"
              // 1. Ensure the value is always an array
              value={
                Array.isArray(formData.exclusionsAcknowledged)
                  ? formData.exclusionsAcknowledged
                  : []
              }
              // 2. Updated onChange to be more robust
              onChange={(e) => {
                // Check if 'e' is a standard event or a direct array
                const newValue = e?.target ? e.target.value : e;

                setFormData((prev) => ({
                  ...prev,
                  exclusionsAcknowledged: newValue,
                }));
              }}
              options={[
                "Pre and post operative lab tests",
                "Speciality consultants visit",
                "Blood transfusion",
                "Discharge medications",
                "Unforeseen charges due to complications",
                "ICU stay & higher antibiotics",
                "Prolonged stay beyond package duration",
              ]}
            />
          </div>
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "#f8fafc",
              borderLeft: "4px solid var(--primary-color)",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              fontStyle: "italic",
            }}
          >
            * This is only a tentative estimate. If patient medical condition
            changes or additional procedures are required, the estimate may be
            revised accordingly.
          </div>
        </div>

        {/* Section 3: Patient Acceptance */}
        <div className="section-box">
          <div className="form-section-title">
            Patient / Legal Representative Acceptance
          </div>
          <div className="three-col" style={{ alignItems: "flex-end" }}>
            <TextInput label="Name" value={patientData?.name || ""} readOnly />
            <SignatureInput
              label="Signature"
              name="patientSignature"
              value={formData.patientSignature}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="patientDateTime"
              value={formData.patientDateTime}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 4: Counsellor Section */}
        <div
          className="section-box"
          style={{ borderTop: "3px solid var(--primary-color)" }}
        >
          <div className="form-section-title">
            Financial Counselling Provided By
          </div>
          <div className="three-col" style={{ alignItems: "flex-end" }}>
            <TextInput
              label="Counsellor Name"
              name="counsellorName"
              value={formData.counsellorName}
              onChange={handleChange}
            />
            <SignatureInput
              label="Signature"
              name="counsellorSignature"
              value={formData.counsellorSignature}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="counsellorDateTime"
              value={formData.counsellorDateTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Confirm & Save Estimate
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
            <span>🖨️</span> Print Estimate Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstimatedCostForm;
