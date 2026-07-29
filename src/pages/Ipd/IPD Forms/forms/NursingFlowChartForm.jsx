import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const NursingFlowChartForm = ({ onSubmit, patientData }) => {
  const [rows, setRows] = useState([
    {
      //   date: new Date().toISOString().split("T")[0],
      date: "",

      time: "",
      bp: "",
      pulse: "",
      temp: "",
      rr: "",
      spo2: "",
      intake: "",
      urineOutput: "",
      drain: "",
      sign: "",
    },
  ]);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        // date: new Date().toISOString().split("T")[0],
        date: "",

        time: "",
        bp: "",
        pulse: "",
        temp: "",
        rr: "",
        spo2: "",
        intake: "",
        urineOutput: "",
        drain: "",
        sign: "",
      },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ nursingFlowData: rows });
  };

  const cellStyle = {
    padding: "4px",
    border: "1px solid #ddd",
    verticalAlign: "middle",
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
                          
              
                          .mar-table {
                              width: 100%;
                              border-collapse: collapse;
                              font-family: Arial, sans-serif;
                              font-size: 11px;
                              margin-top: 10px;
                          }
      
                          .mar-table th, .mar-table td {
                              border: 1px solid black;
                              height: 25px; /* Fixed height to match form appearance */
                              padding: 2px 5px;
                          }
      
                          .col-label { width: 15%; } 
                          .col-value { width: 35%; } 
                          .col-admin { width: 6.25%; text-align: center; }
      
                          /* Helper for the Dr. Sign row labels */
                          .dt-flex {
                              display: flex;
                              justify-content: space-around;
                              align-items: center;
                              height: 100%;
                          }
                              .title-bar{margin-top:10px}
      
               
                      </style>
                  </head>
                  <body>
                    
                    <div>
                      <div class="form-type">Form 14 - Front</div>
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
                          <div class="main-title">NURSING FLOW CHART</div>
                      
                            <table class="mar-table">
                                <thead>
                                    <tr class="header-row">
                                        <th style="width: 8%">Date</th>
                                        <th style="width: 8%">Time</th>
                                        <th style="width: 10%">BP mmHg</th>
                                        <th style="width: 8%">Pulse/min</th>
                                        <th style="width: 8%">Temp °F</th>
                                        <th style="width: 6%">RR</th>
                                        <th style="width: 8%">SPO2%</th>
                                        <th style="width: 10%">Intake(ml)</th>
                                        <th style="width: 10%">Urine Output (ml)</th>
                                        <th style="width: 12%">Drain</th>
                                        <th style="width: 12%">S/N Sign</th>
                                    </tr>
                                </thead>
                                <tbody>
                            ${
                              rows && rows.length > 0
                                ? rows
                                    .map(
                                      (row) => `
                                    <tr>
                                        <td>${row.date || ""}</td>
                                        <td>${row.time || ""}</td>
                                        <td>${row.bp || ""}</td>
                                        <td>${row.pulse || ""}</td>
                                        <td>${row.temp || ""}</td>
                                        <td>${row.rr || ""}</td>
                                        <td>${row.spo2 || ""}</td>
                                        <td>${row.intake || ""}</td>
                                        <td>${row.urineOutput || ""}</td> <td>${row.drain || ""}</td>
                                        <td>${row.sign || ""}</td> </tr>
                                    `,
                                    )
                                    .join("")
                                : `${Array(5).fill("<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>").join("")}`
                            }
                            </tbody>
                            </table>
      
      
                      </div>
                      <div class="fs-14">COP-F-6.2-00</div>
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
      className="medical-form nursing-flow-chart-form"
      style={{ maxWidth: "100%", margin: "0 auto" }}
    >
      <div style={{ height: "50px" }}></div>

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
        NURSING FLOW CHART
      </h2>

      {/* Compact Patient Header */}
      <div className="patient-compact-header">
        <div className="info-item">
          <span className="info-label">UHID</span>
          <span className="info-value">{patientData?.uhid}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Patient Name</span>
          <span className="info-value">{patientData?.name}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Age</span>
          <span className="info-value">{patientData?.age}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Gender</span>
          <span className="info-value">{patientData?.gender}</span>
        </div>
        <div className="info-item">
          <span className="info-label">IP No</span>
          <span className="info-value">{patientData?.ipNo}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #80deea",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1100px",
            }}
          >
            <thead style={{ backgroundColor: "#e0f7fa" }}>
              <tr>
                <th
                  style={{
                    ...cellStyle,
                    width: "130px",
                    fontWeight: "bold",
                    color: "#00796b",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    ...cellStyle,
                    width: "120px",
                    fontWeight: "bold",
                    color: "#00796b",
                  }}
                >
                  Time
                </th>
                <th
                  style={{ ...cellStyle, fontWeight: "bold", color: "#00796b" }}
                >
                  BP mmHg
                </th>
                <th
                  style={{ ...cellStyle, fontWeight: "bold", color: "#00796b" }}
                >
                  Pulse/min
                </th>
                <th
                  style={{ ...cellStyle, fontWeight: "bold", color: "#00796b" }}
                >
                  Temp F
                </th>
                <th
                  style={{ ...cellStyle, fontWeight: "bold", color: "#00796b" }}
                >
                  RR
                </th>
                <th
                  style={{ ...cellStyle, fontWeight: "bold", color: "#00796b" }}
                >
                  SPO2 %
                </th>
                <th
                  style={{ ...cellStyle, fontWeight: "bold", color: "#00796b" }}
                >
                  Intake (ml)
                </th>
                <th
                  style={{ ...cellStyle, fontWeight: "bold", color: "#00796b" }}
                >
                  Urine (ml)
                </th>
                <th
                  style={{ ...cellStyle, fontWeight: "bold", color: "#00796b" }}
                >
                  Drain
                </th>
                <th
                  style={{ ...cellStyle, fontWeight: "bold", color: "#00796b" }}
                >
                  S/N Sign
                </th>
                <th style={{ ...cellStyle, width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td style={cellStyle}>
                    <MuiDateTimePicker
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        handleRowChange(index, "date", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={cellStyle}>
                    <MuiDateTimePicker
                      type="time"
                      value={row.time}
                      onChange={(e) =>
                        handleRowChange(index, "time", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={cellStyle}>
                    <TextInput
                      value={row.bp}
                      onChange={(e) =>
                        handleRowChange(index, "bp", e.target.value)
                      }
                      hideLabel
                      placeholder="120/80"
                    />
                  </td>
                  <td style={cellStyle}>
                    <TextInput
                      value={row.pulse}
                      onChange={(e) =>
                        handleRowChange(index, "pulse", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={cellStyle}>
                    <TextInput
                      value={row.temp}
                      onChange={(e) =>
                        handleRowChange(index, "temp", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={cellStyle}>
                    <TextInput
                      value={row.rr}
                      onChange={(e) =>
                        handleRowChange(index, "rr", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={cellStyle}>
                    <TextInput
                      value={row.spo2}
                      onChange={(e) =>
                        handleRowChange(index, "spo2", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={cellStyle}>
                    <TextInput
                      value={row.intake}
                      onChange={(e) =>
                        handleRowChange(index, "intake", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={cellStyle}>
                    <TextInput
                      value={row.urineOutput}
                      onChange={(e) =>
                        handleRowChange(index, "urineOutput", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={cellStyle}>
                    <TextInput
                      value={row.drain}
                      onChange={(e) =>
                        handleRowChange(index, "drain", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={cellStyle}>
                    <TextInput
                      value={row.sign}
                      onChange={(e) =>
                        handleRowChange(index, "sign", e.target.value)
                      }
                      hideLabel
                    />
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="remove-btn"
                      title="Remove Row"
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
            + Add Monitoring Entry
          </button>
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Save Nursing Flow Record
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
            <span>🖨️</span> Print Nursing Flow Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default NursingFlowChartForm;
