import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import SignatureInput from "../inputs/SignatureInput";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const IpdClearanceForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    uhid: patientData?.uhid || "",
    name: patientData?.name || "",
    age: patientData?.age || "",
    gender: patientData?.gender || "",
    ipNo: patientData?.ipNo || "",

    clearances: {
      ipdPayment: { name: "", sign: "" },
      pharmacy: { name: "", sign: "" },
      lab: { name: "", sign: "" },
      histopathology: { name: "", sign: "" },
      canteen: { name: "", sign: "" },
      pocRounds: { name: "", sign: "" },
    },
  });

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      clearances: {
        ...prev.clearances,
        [section]: {
          ...prev.clearances[section],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const departments = [
    { id: "ipdPayment", label: "1. IPD PAYMENT" },
    { id: "pharmacy", label: "2. PHARMACY" },
    { id: "lab", label: "3. LAB" },
    { id: "histopathology", label: "4. HISTOPATHOLOGY" },
    { id: "canteen", label: "5. CANTEEN" },
    { id: "pocRounds", label: "6. POC ROUNDS" },
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
                .sign-row {display: flex; flex-direction: column; height: 100%;}
                .page-break {page-break-before: always; break-before: page;}
    
     
            </style>
        </head>
        <body>
          
          <div>
            <div class="form-type">Form 17 - Back</div>
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
                <div class="main-title">IPD CLEARANCE SHEET</div>
            <table class="signature-table">
                    ${departments
                      .map((dept) => {
                        const data = formData.clearances[dept.id];
                        return `
                        <tr>
                            <td class="dept-column">${dept.label}</td>
                            <td class="sign-column">
                                <div class="sign-row">
                                    <div>NAME: <span class="sig-data">${data.name || ""}</span></div>
                                    <div style="margin-top: 10px;">SIGN: 
                                        ${data.sign || ""}
                                    </div>
                                </div>
                            </td>
                        </tr>
                      `;
                      })
                      .join("")}
                </table>
             </div>
           <div class="fs-14">AAC-F-2.3-00</div>
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
    <div className="medical-form ipd-clearance-form">
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
        IPD CLEARANCE SHEET
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

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "25px",
            marginTop: "20px",
          }}
        >
          {departments.map((dept) => (
            <div
              key={dept.id}
              style={{
                padding: "25px",
                border: "1px solid #e0f7fa",
                borderRadius: "12px",
                backgroundColor: "#fdfdfd",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "1.1rem",
                  color: "#00796b",
                  borderBottom: "2px solid #80deea",
                  paddingBottom: "10px",
                  fontWeight: "bold",
                }}
              >
                {dept.label}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <TextInput
                  label="NAME OF STAFF"
                  value={formData.clearances[dept.id].name}
                  onChange={(e) =>
                    handleChange(dept.id, "name", e.target.value)
                  }
                  placeholder="Enter full name"
                />
                <SignatureInput
                  label="SIGNATURE"
                  name={`${dept.id}_sign`}
                  value={formData.clearances[dept.id].sign}
                  onChange={(e) =>
                    handleChange(dept.id, "sign", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Approve IPD Clearance
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
            <span>🖨️</span> Print IPD Clearance Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default IpdClearanceForm;
