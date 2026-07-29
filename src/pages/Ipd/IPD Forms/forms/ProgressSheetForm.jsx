import React, { useState } from "react";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import Textarea from "../inputs/Textarea";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const ProgressSheetForm = ({ onSubmit, patientData }) => {
  // Start with one record as requested
  const [rows, setRows] = useState([
    { dateTime: "", note: "", advisedOrders: "" },
  ]);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { dateTime: "", note: "", advisedOrders: "" }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ rows, patientHeader: patientData });
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
                            .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 30px 0; }
                            .footer { margin-top: 10px; padding-top: 20px; }
                            .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px;}
                            
                            .inline-row {display:flex; gap:20px;}
                            @media print { .no-print { display: none; } outer-border { height: 90vh; }}
                            
                            .mar-table {width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; }
        
                            .mar-table th, .mar-table td { border: 1px solid black;  height: 25px; padding: 10px 10px;}
        
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
                        <div class="form-type">Form 16 - Back</div>
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
                           
    
                            <div class="main-title">PROGRESS SHEET</div>
        
                            <table class="mar-table">

                                <thead>
                                    <tr>
                                        <th style="width: 20%">Date & Time</th>
                                        <th style="width: 50%">Progress Notes</th>
                                        <th style="width: 30%">Advised Orders</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    ${rows
                                      .map(
                                        (row) => `
                                        <tr>
                                            <td>${row.dateTime ? row.dateTime.toLocaleString() : ""}</td>
                                            <td>${row.note || ""}</td>
                                            <td>${row.advisedOrders || ""}</td>
                                        </tr>
                                    `,
                                      )
                                      .join("")}
                                </tbody>

                            </table>
      
                          </div>
                          <div class="fs-14">AAC-F-5.2-00 </div>
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
      className="medical-form progress-sheet-form"
      style={{ maxWidth: "1200px", margin: "0 auto" }}
    >
      {/* Blank Space at top for print header or layout */}
      <div style={{ height: "30px" }}></div>

      <h2
        className="form-title"
        style={{
          textAlign: "center",
          backgroundColor: "#80deea",
          color: "white",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "30px",
          fontSize: "1.4rem",
        }}
      >
        PROGRESS SHEET
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

      <form onSubmit={handleSubmit}>
        <div
          style={{
            border: "1px solid #80deea",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#e0f7fa" }}>
              <tr>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderRight: "1px solid #80deea",
                    width: "220px",
                    color: "#00796b",
                  }}
                >
                  DATE & TIME
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderRight: "1px solid #80deea",
                    color: "#00796b",
                  }}
                >
                  PROGRESS NOTES
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderRight: "1px solid #80deea",
                    color: "#00796b",
                  }}
                >
                  ADVISED ORDERS
                </th>
                <th style={{ padding: "12px", width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} style={{ borderTop: "1px solid #80deea" }}>
                  <td
                    style={{
                      padding: "10px",
                      borderRight: "1px solid #80deea",
                      verticalAlign: "top",
                    }}
                  >
                    <MuiDateTimePicker
                      value={row.dateTime}
                      onChange={(e) =>
                        handleRowChange(index, "dateTime", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderRight: "1px solid #80deea",
                      verticalAlign: "top",
                    }}
                  >
                    <Textarea
                      placeholder="Enter clinical progress..."
                      value={row.note}
                      onChange={(e) =>
                        handleRowChange(index, "note", e.target.value)
                      }
                      hideLabel
                      rows={3}
                    />
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderRight: "1px solid #80deea",
                      verticalAlign: "top",
                    }}
                  >
                    <Textarea
                      placeholder="Enter advised orders..."
                      value={row.advisedOrders}
                      onChange={(e) =>
                        handleRowChange(index, "advisedOrders", e.target.value)
                      }
                      hideLabel
                      rows={2}
                    />
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="remove-btn"
                      title="Remove Note Row"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button type="button" onClick={addRow} className="secondary-btn">
            + Add Progress Note
          </button>
        </div>

        {/* <button type="submit" className="submit-btn">
            Save Progress Sheet
          </button> */}

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Save Progress Sheet
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
            <span>🖨️</span> Print Progress Sheet
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgressSheetForm;
