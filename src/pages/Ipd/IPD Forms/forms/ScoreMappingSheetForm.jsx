import React, { useState } from "react";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const ScoreMappingSheetForm = ({ onSubmit, patientData }) => {
  const scoreItems = [
    { id: "vip", name: "VIP Score" },
    { id: "braden", name: "Braden Score" },
    { id: "morse", name: "Morse Fall Score" },
    { id: "must", name: "MUST Score" },
    { id: "mews", name: "MEW's Score" },
    { id: "pain", name: "Pain Score" },
  ];

  // 4 Monitoring Slots
  const [dates, setDates] = useState(["", "", "", ""]);
  const [scores, setScores] = useState(
    scoreItems.reduce((acc, score) => {
      acc[score.id] = Array(4)
        .fill(null)
        .map(() => ({ M: "", E: "", N: "" }));
      return acc;
    }, {}),
  );
  const [nurseSigns, setNurseSigns] = useState(
    Array(4)
      .fill(null)
      .map(() => ({ M: "", E: "", N: "" })),
  );

  const handleDateChange = (index, value) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
  };

  const handleScoreChange = (scoreId, dateIndex, shift, value) => {
    setScores((prev) => ({
      ...prev,
      [scoreId]: prev[scoreId].map((d, i) =>
        i === dateIndex ? { ...d, [shift]: value } : d,
      ),
    }));
  };

  const handleSignChange = (dateIndex, shift, value) => {
    setNurseSigns((prev) =>
      prev.map((d, i) => (i === dateIndex ? { ...d, [shift]: value } : d)),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ dates, scores, nurseSigns });
  };

  // Styling
  const cardStyle = {
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  const shiftInputStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    fontSize: "0.85rem",
    outline: "none",
    textAlign: "center",
  };

  const dateBlockStyle = {
    padding: "10px",
    backgroundColor: "#f8fbfc",
    borderRadius: "8px",
    border: "1px solid #e1f5fe",
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "__________";
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? dateValue : d.toLocaleDateString("en-GB");
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
                              font-size: 13px;
                              margin-top: 10px;
                          }
                          .mar-table th, .mar-table td {
                              border: 1px solid black;
                              height: 50px; 
                              padding: 2px 5px;
                          }
                          .col-label { width: 15%; } 
                          .col-value { width: 35%; } 
                          .col-admin { width: 6.25%; text-align: center; }
      
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
                          <div class="main-title">SCORE MAPPING SHEET</div>
    
                            <table class="mar-table">
                                <thead>
                                    <tr>
                                        <th rowspan="2" style="width: 40px;">Sr No.</th>
                                        <th rowspan="2" style="width: 140px;">Score</th>
                                        ${dates
                                          .map(
                                            (date) => `
                                           
                                    <th colspan="3">
                                      Date: ${formatDate(date)}
                                    </th>
                                        `,
                                          )
                                          .join("")}
                                    </tr>
                                    <tr>
                                        ${dates.map(() => `<th>M</th><th>E</th><th>N</th>`).join("")}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${scoreItems
                                      .map(
                                        (item, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td class="score-label">${item.name}</td>
                                            ${[0, 1, 2, 3]
                                              .map(
                                                (dateIdx) => `
                                                <td>${scores[item.id][dateIdx].M || ""}</td>
                                                <td>${scores[item.id][dateIdx].E || ""}</td>
                                                <td>${scores[item.id][dateIdx].N || ""}</td>
                                            `,
                                              )
                                              .join("")}
                                        </tr>
                                    `,
                                      )
                                      .join("")}
                                    
                                    <tr style="height: 45px;">
                                        <td colspan="2" style="text-align: right; padding-right: 10px; font-weight: bold;">Staff nurse sign</td>
                                        ${[0, 1, 2, 3]
                                          .map(
                                            (dateIdx) => `
                                            <td>${nurseSigns[dateIdx].M || ""}</td>
                                            <td>${nurseSigns[dateIdx].E || ""}</td>
                                            <td>${nurseSigns[dateIdx].N || ""}</td>
                                        `,
                                          )
                                          .join("")}
                                    </tr>
                                </tbody>
                            </table>
    
                        
      
      
                      </div>
                      <div class="fs-14">COP-F-16.7-00</div>
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
      className="medical-form score-mapping-sheet-form"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "10px" }}
    >
      {/* Removed redundant top spacer */}

      <h2
        style={{
          textAlign: "center",
          color: "#80deea",
          marginBottom: "30px",
          fontSize: "1.6rem",
          fontWeight: "bold",
        }}
      >
        SCORE MAPPING SHEET
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
        {/* Global Date Selection */}
        <div
          style={{ ...cardStyle, backgroundColor: "#e0f2f1", padding: "15px" }}
        >
          <h4
            style={{
              margin: "0 0 15px 0",
              color: "#80deea",
              fontSize: "0.9rem",
              textTransform: "uppercase",
            }}
          >
            Monitoring Period Dates
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "10px",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <MuiDateTimePicker
                  label={`Date ${i + 1}`}
                  name={`date${i}`}
                  value={dates[i]}
                  onChange={(e) => handleDateChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Score Sections as Cards */}
        {scoreItems.map((item) => (
          <div key={item.id} style={cardStyle}>
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "1.1rem",
                color: "#80deea",
                borderBottom: "2px solid #f0f0f0",
                paddingBottom: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  backgroundColor: "#80deea",
                  color: "#fff",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "10px",
                  fontSize: "0.8rem",
                }}
              >
                S
              </span>
              {item.name}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "10px",
              }}
            >
              {[0, 1, 2, 3].map((dateIdx) => (
                <div key={dateIdx} style={dateBlockStyle}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      color: "#80deea",
                      marginBottom: "10px",
                      textAlign: "center",
                    }}
                  >
                    {dates[dateIdx]
                      ? new Date(dates[dateIdx]).toLocaleDateString()
                      : `Day ${dateIdx + 1}`}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          display: "block",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        M
                      </span>
                      <input
                        style={shiftInputStyle}
                        value={scores[item.id][dateIdx].M}
                        onChange={(e) =>
                          handleScoreChange(
                            item.id,
                            dateIdx,
                            "M",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          display: "block",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        E
                      </span>
                      <input
                        style={shiftInputStyle}
                        value={scores[item.id][dateIdx].E}
                        onChange={(e) =>
                          handleScoreChange(
                            item.id,
                            dateIdx,
                            "E",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          display: "block",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        N
                      </span>
                      <input
                        style={shiftInputStyle}
                        value={scores[item.id][dateIdx].N}
                        onChange={(e) =>
                          handleScoreChange(
                            item.id,
                            dateIdx,
                            "N",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Nurse Signature Card */}
        <div style={{ ...cardStyle, borderTop: "4px solid #80deea" }}>
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.1rem",
              color: "#80deea",
            }}
          >
            Staff Nurse Signatures
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "10px",
            }}
          >
            {[0, 1, 2, 3].map((dateIdx) => (
              <div
                key={dateIdx}
                style={{ ...dateBlockStyle, backgroundColor: "#fff" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <input
                    placeholder="Sign M"
                    style={shiftInputStyle}
                    value={nurseSigns[dateIdx].M}
                    onChange={(e) =>
                      handleSignChange(dateIdx, "M", e.target.value)
                    }
                  />
                  <input
                    placeholder="Sign E"
                    style={shiftInputStyle}
                    value={nurseSigns[dateIdx].E}
                    onChange={(e) =>
                      handleSignChange(dateIdx, "E", e.target.value)
                    }
                  />
                  <input
                    placeholder="Sign N"
                    style={shiftInputStyle}
                    value={nurseSigns[dateIdx].N}
                    onChange={(e) =>
                      handleSignChange(dateIdx, "N", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Finalize & Save All Scores
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
            <span>🖨️</span> Print Scores
          </button>
        </div>

        {/* <button
          type="submit"
          className="submit-btn"
          style={{ width: "100%", marginTop: "30px" }}
        >
          Finalize & Save All Scores
        </button> */}
      </form>
    </div>
  );
};

export default ScoreMappingSheetForm;
