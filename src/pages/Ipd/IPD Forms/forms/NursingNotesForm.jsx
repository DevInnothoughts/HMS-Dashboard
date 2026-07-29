import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import Textarea from "../inputs/Textarea";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const NursingNotesForm = ({ onSubmit, patientData }) => {
  const [headerData, setHeaderData] = useState({
    uhid: patientData?.uhid || "",
    name: patientData?.name || "",
    age: patientData?.age || "",
    gender: patientData?.gender || "",
    ipNo: patientData?.ipNo || "",
    doa: patientData?.doa || "",
    dod: patientData?.dod || "",
    diagnosis: "",
    surgery: "",
    surgeonName: patientData?.doctorName || "",
  });

  const [noteRows, setNoteRows] = useState([
    { dateTime: "", morning: "", evening: "", night: "" },
  ]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeaderData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...noteRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setNoteRows(updatedRows);
  };

  const addRow = () => {
    setNoteRows([
      ...noteRows,
      { dateTime: "", morning: "", evening: "", night: "" },
    ]);
  };

  const removeRow = (index) => {
    if (noteRows.length === 1) return;
    setNoteRows(noteRows.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ header: headerData, notes: noteRows });
  };

  const cellStyle = {
    padding: "8px",
    border: "1px solid #ddd",
    verticalAlign: "middle",
  };

  const inputStyle = {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "0.9rem",
    minHeight: "60px",
    resize: "none",
    fontFamily: "inherit",
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
                        .header-flex { display: flex; gap:20px; align-items: flex-start; }
                        .logo-area { display: flex; align-items: center; }
                        .logo-img { height: 65px; width: auto; margin-top:10px }           
                        .patient-info-block { position: absolute; right: 25px; color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
                        .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
                        .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 10px 0; }
                        .footer { margin-top: 10px; padding-top: 20px; }
                        
                        .inline-row {display:flex; gap:20px;}
                        @media print { .no-print { display: none; } outer-border { height: 90vh; }}
                        
                        .mar-table {width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; }
    
                        .mar-table th, .mar-table td { border: 1px solid black;  height: 25px; padding: 10px 10px;}
                          .form-type {
                          color: red;
                          font-weight: bold;
                          font-size: 11px;
                          margin-bottom: 5px;
                      }
                        .col-label { width: 15%; } 
                        .col-value { width: 35%; } 
                        .col-admin { width: 6.25%; text-align: center; }
    
                        /* Helper for the Dr. Sign row labels */
                        .dt-flex {display: flex; justify-content: space-around; align-items: center; height: 100%; }
                        .title-bar{margin-top:10px}

                        .admission-box {border: 1px solid #333; padding: 10px; width: 40vw; margin-top: 10px;}
                        .info-row {display: flex; margin-bottom: 8px; font-size: 13px; font-weight: bold;}
                        .underline { border-bottom: 1px solid #333; flex: 1; margin-left: 5px; font-weight: normal; padding-left: 5px;}
    
             
                    </style>
                </head>
                <body>
                  
                  <div>
                    <div class="form-type">Form 14 - Back</div>
                      <div class="outer-border">
                        <div class="header-flex">
                          <img src="${window.location.origin}${hhcLogo}" class="logo-img">

                          <div class="admission-box">
                            <div class="info-row">
                                DOA: <span class="underline">${headerData.doa || ""}</span>
                                <span style="margin-left:20px">DOD:</span> <span class="underline">${headerData.dod || ""}</span>
                            </div>
                            <div class="info-row">
                                Diagnosis: <span class="underline">${headerData.diagnosis || ""}</span>
                            </div>
                            <div class="info-row">
                                Surgery: <span class="underline">${headerData.surgery || ""}</span>
                            </div>
                            <div class="info-row" style="margin-bottom: 0;">
                                Surgeon Name: <span class="underline">${headerData.surgeonName || ""}</span>
                            </div>
                          </div>

                          <div class="patient-info-block">
                              <div><span class="label-teal">UHID:</span> ${patientData?.uhid || ""}</div>
                              <div><span class="label-teal">NAME:</span> ${patientData?.name || ""}</div>
                              <div><span class="label-teal">AGE/SEX:</span> ${patientData?.age || ""}/${patientData?.gender || ""}</div>
                              <div><span class="label-teal">IP NO:</span> ${patientData?.ipNo || ""}</div>
                          </div>

                        </div>
                       

                        <div class="main-title">NURSING NOTES</div>
    
                        <table class="mar-table">
                            <thead>
                                <tr>
                                    <th style="width: 15%">Date & Time</th>
                                    <th style="width: 28%">Morning Shift</th>
                                    <th style="width: 28%">Evening Shift</th>
                                    <th style="width: 29%">Night Shift</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${noteRows
                                  .map(
                                    (row) => `
                                    <tr>
                                        <td>${row.dateTime ? new Date(row.dateTime).toLocaleString() : ""}</td>
                                        <td>${row.morning || ""}</td>
                                        <td>${row.evening || ""}</td>
                                        <td>${row.night || ""}</td>
                                    </tr>
                                `,
                                  )
                                  .join("")}
                            </tbody>
                        </table>
  
                      </div>
                      <div class="fs-14">COP-F-6.3-00</div>
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
    <div
      className="medical-form nursing-notes-form"
      style={{ maxWidth: "1000px", margin: "0 auto", padding: "10px" }}
    >
      <h2
        className="form-title"
        style={{
          textAlign: "center",
          backgroundColor: "#80deea",
          color: "white",
          padding: "8px",
          borderRadius: "4px",
          margin: "10px 0 20px 0",
          fontSize: "1.2rem",
        }}
      >
        NURSING NOTES
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Compact Patient Header */}
        <div className="patient-compact-header">
          <div className="info-item">
            <span className="info-label">UHID</span>
            <span className="info-value">{headerData.uhid}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Patient Name</span>
            <span className="info-value">{headerData.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Age</span>
            <span className="info-value">{headerData.age}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Gender</span>
            <span className="info-value">{headerData.gender}</span>
          </div>
          <div className="info-item">
            <span className="info-label">IP No</span>
            <span className="info-value">{headerData.ipNo}</span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            margin: "15px 0",
            padding: "10px",
            border: "1px solid #eee",
            borderRadius: "8px",
            backgroundColor: "#fdfdfd",
          }}
        >
          <TextInput
            label="Diagnosis"
            name="diagnosis"
            value={headerData.diagnosis}
            onChange={handleHeaderChange}
          />
          <TextInput
            label="Surgery"
            name="surgery"
            value={headerData.surgery}
            onChange={handleHeaderChange}
          />
          <TextInput
            label="Surgeon Name"
            name="surgeonName"
            value={headerData.surgeonName}
            onChange={handleHeaderChange}
          />
        </div>

        <div
          style={{
            overflowX: "auto",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f4f7f6" }}>
              <tr>
                <th
                  style={{
                    ...cellStyle,
                    width: "180px",
                    fontWeight: "bold",
                    color: "#80deea",
                    textAlign: "center",
                  }}
                >
                  DATE & TIME
                </th>
                <th
                  style={{
                    ...cellStyle,
                    fontWeight: "bold",
                    color: "#80deea",
                    textAlign: "center",
                  }}
                >
                  MORNING
                </th>
                <th
                  style={{
                    ...cellStyle,
                    fontWeight: "bold",
                    color: "#80deea",
                    textAlign: "center",
                  }}
                >
                  EVENING
                </th>
                <th
                  style={{
                    ...cellStyle,
                    fontWeight: "bold",
                    color: "#80deea",
                    textAlign: "center",
                  }}
                >
                  NIGHT
                </th>
                <th style={{ ...cellStyle, width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {noteRows.map((row, index) => (
                <tr key={index}>
                  <td style={cellStyle}>
                    <MuiDateTimePicker
                      value={row.dateTime}
                      onChange={(e) =>
                        handleRowChange(index, "dateTime", e.target.value)
                      }
                      hideLabel
                      style={{ marginBottom: 0 }}
                    />
                  </td>
                  <td style={cellStyle}>
                    <Textarea
                      value={row.morning}
                      onChange={(e) =>
                        handleRowChange(index, "morning", e.target.value)
                      }
                      placeholder="Morning shift notes..."
                      hideLabel
                      rows={2}
                      textareaStyle={{ minHeight: "unset" }}
                    />
                  </td>
                  <td style={cellStyle}>
                    <Textarea
                      value={row.evening}
                      onChange={(e) =>
                        handleRowChange(index, "evening", e.target.value)
                      }
                      placeholder="Evening shift notes..."
                      hideLabel
                      rows={2}
                      textareaStyle={{ minHeight: "unset" }}
                    />
                  </td>
                  <td style={cellStyle}>
                    <Textarea
                      value={row.night}
                      onChange={(e) =>
                        handleRowChange(index, "night", e.target.value)
                      }
                      placeholder="Night shift notes..."
                      hideLabel
                      rows={2}
                      textareaStyle={{ minHeight: "unset" }}
                    />
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="remove-btn"
                      title="Remove Row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <button type="button" onClick={addRow} className="secondary-btn">
            + Add Notes Row
          </button>
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Save Nursing Entry
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
            <span>🖨️</span> Print Nursing Entry
          </button>
        </div>

        {/* <button type="submit" className="submit-btn">
          Save Nursing Entry
        </button> */}
      </form>
    </div>
  );
};

export default NursingNotesForm;
