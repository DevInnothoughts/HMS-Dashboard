import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const MedicationChartForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    knownAllergies: "",
    medications: [
      {
        drugName: "",
        dose: "",
        route: "",
        frequency: "",
        drSign: "",
        orderDateTime: "",
        admins: Array(4).fill({ time: "", sign: "" }),
      },
    ],
  });

  const handleAllergyChange = (e) => {
    setFormData((prev) => ({ ...prev, knownAllergies: e.target.value }));
  };

  const handleMedChange = (index, field, value) => {
    const updatedMeds = [...formData.medications];
    updatedMeds[index] = { ...updatedMeds[index], [field]: value };
    setFormData((prev) => ({ ...prev, medications: updatedMeds }));
  };

  const handleAdminChange = (medIndex, adminIndex, field, value) => {
    const updatedMeds = [...formData.medications];
    const updatedAdmins = [...updatedMeds[medIndex].admins];
    updatedAdmins[adminIndex] = {
      ...updatedAdmins[adminIndex],
      [field]: value,
    };
    updatedMeds[medIndex] = { ...updatedMeds[medIndex], admins: updatedAdmins };
    setFormData((prev) => ({ ...prev, medications: updatedMeds }));
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          drugName: "",
          dose: "",
          route: "",
          frequency: "",
          drSign: "",
          orderDateTime: "",
          admins: Array(4).fill({ time: "", sign: "" }),
        },
      ],
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length === 1) return;
    const updatedMeds = formData.medications.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, medications: updatedMeds }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const cellStyle = {
    padding: "8px",
    border: "1px solid #ddd",
    fontSize: "0.85rem",
  };

  // print form format starts
  // 1. Pass your medications array into the function
  const generatePrintContent = (medications = []) => {
    // 2. Decide what to show: Use the data if it exists, otherwise show 1 empty slot
    const recordsToShow = medications.length > 0 ? medications : [{}];

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
                    @media print { .no-print { display: none; } outer-border { height: 90vh; } tr { page-break-inside: avoid; } }
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

.col-admin-cell {
    vertical-align: top; /* Ensures text stays at the top of the merged box */
    padding: 5px;
}
         
                </style>
            </head>
            <body>
              
              <div>
                <div class="form-type">Form 13 - Back</div>
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
                    <div class="main-title">MEDICATION CHART</div>
                

                    <div class="row">
                        <div class="section-title">Known allergies:-</div>
                        <div class="dotted-line">${formData.knownAllergies || ""}</div>
                    </div>
                    <table class="mar-table">
                        <thead>
                            <tr>
                                <th colspan="2">Medicine order</th>
                                <th colspan="8">Medicine administration record</th>
                            </tr>
                            <tr>
                                <th colspan="2" style="text-align: right; padding-right: 20px;">Date &rarr;</th>
                                <th colspan="2"></th>
                                <th colspan="2"></th>
                                <th colspan="2"></th>
                                <th colspan="2"></th>
                            </tr>
                            <tr>
                                <th colspan="2"></th>
                                <th class="col-admin">Time</th><th class="col-admin">Sign</th>
                                <th class="col-admin">Time</th><th class="col-admin">Sign</th>
                                <th class="col-admin">Time</th><th class="col-admin">Sign</th>
                                <th class="col-admin">Time</th><th class="col-admin">Sign</th>
                            </tr>
                        </thead>
                        <tbody>
                          ${recordsToShow
                            .map(
                              (item) => `
                            <tr style="border-top: 2px solid #000;">
                              <td class="col-label">Drug name</td>
                              <td class="col-value">${item.drugName || ""}</td>
                              
                              <td rowspan="5" class="col-admin-cell">${item.admins?.[0]?.time || ""}</td>
                              <td rowspan="5" class="col-admin-cell">${item.admins?.[0]?.sign || ""}</td>
                              
                              <td rowspan="5" class="col-admin-cell">${item.admins?.[1]?.time || ""}</td>
                              <td rowspan="5" class="col-admin-cell">${item.admins?.[1]?.sign || ""}</td>
                              
                              <td rowspan="5" class="col-admin-cell">${item.admins?.[2]?.time || ""}</td>
                              <td rowspan="5" class="col-admin-cell">${item.admins?.[2]?.sign || ""}</td>
                              
                              <td rowspan="5" class="col-admin-cell">${item.admins?.[3]?.time || ""}</td>
                              <td rowspan="5" class="col-admin-cell">${item.admins?.[3]?.sign || ""}</td>
                            </tr>

                            <tr>
                              <td class="col-label">Dose with unit</td>
                              <td class="col-value">${item.dose || ""}</td>
                            </tr>
                            <tr>
                              <td class="col-label">Route</td>
                              <td class="col-value">${item.route || ""}</td>
                            </tr>
                            <tr>
                              <td class="col-label">Frequency</td>
                              <td class="col-value">${item.frequency || ""}</td>
                            </tr>
                            <tr>
                              <td class="col-label">Dr. Sign ${item.drSign || ""}</td>
                              <td class="col-value">
                                <div class="dt-flex">
                                  <span>Date : ${item.orderDateTime ? new Date(item.orderDateTime).toLocaleDateString() : ""}</span>
                                  <span>Time ${item.orderDateTime ? new Date(item.orderDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                                </div>
                              </td>
                            </tr>
                          `,
                            )
                            .join("")}
                        </tbody>
                    </table>


                </div>

                <div class="fs-14">MOM-F-5.1-00</div>

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
      className="medical-form medication-chart-form"
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "10px" }}
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
        MEDICATION CHART
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
        <div style={{ marginBottom: "20px" }}>
          <TextInput
            label="Known allergies:"
            name="knownAllergies"
            value={formData.knownAllergies}
            onChange={handleAllergyChange}
            placeholder="Specify allergies or N.A."
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f7f6" }}>
                <th
                  style={{
                    ...cellStyle,
                    width: "40%",
                    fontWeight: "bold",
                    color: "#008b8b",
                  }}
                >
                  Medicine Order
                </th>
                <th
                  style={{
                    ...cellStyle,
                    fontWeight: "bold",
                    color: "#008b8b",
                  }}
                >
                  Medicine Administration Record
                </th>
                <th style={{ ...cellStyle, width: "50px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.medications.map((med, medIndex) => (
                <tr key={medIndex}>
                  <td style={{ ...cellStyle, padding: "0" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "0",
                      }}
                    >
                      <div style={{ padding: "4px" }}>
                        <TextInput
                          placeholder="Drug Name"
                          value={med.drugName}
                          onChange={(e) =>
                            handleMedChange(
                              medIndex,
                              "drugName",
                              e.target.value,
                            )
                          }
                          hideLabel
                          style={{ fontWeight: "bold" }}
                        />
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                        }}
                      >
                        <TextInput
                          placeholder="Dose"
                          value={med.dose}
                          onChange={(e) =>
                            handleMedChange(medIndex, "dose", e.target.value)
                          }
                          hideLabel
                        />
                        <TextInput
                          placeholder="Route"
                          value={med.route}
                          onChange={(e) =>
                            handleMedChange(medIndex, "route", e.target.value)
                          }
                          hideLabel
                        />
                        <TextInput
                          placeholder="Freq"
                          value={med.frequency}
                          onChange={(e) =>
                            handleMedChange(
                              medIndex,
                              "frequency",
                              e.target.value,
                            )
                          }
                          hideLabel
                        />
                      </div>
                      <div
                        style={{
                          padding: "8px",
                          borderTop: "1px solid #eee",
                        }}
                      >
                        <TextInput
                          placeholder="Dr. Sign"
                          value={med.drSign}
                          onChange={(e) =>
                            handleMedChange(medIndex, "drSign", e.target.value)
                          }
                          hideLabel
                        />
                        <div style={{ marginTop: "5px" }}>
                          <MuiDateTimePicker
                            label="Order Date & Time"
                            name="orderDateTime"
                            value={med.orderDateTime}
                            onChange={(e) =>
                              handleMedChange(
                                medIndex,
                                "orderDateTime",
                                e.target.value,
                              )
                            }
                            hideLabel
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...cellStyle, padding: "0" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        height: "100%",
                        minHeight: "120px",
                      }}
                    >
                      {med.admins.map((admin, adminIndex) => (
                        <div
                          key={adminIndex}
                          style={{
                            borderRight:
                              adminIndex < 3 ? "1px solid #eee" : "none",
                            padding: "4px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <MuiDateTimePicker
                            type="time"
                            label="Time"
                            name="time"
                            value={admin.time}
                            onChange={(e) =>
                              handleAdminChange(
                                medIndex,
                                adminIndex,
                                "time",
                                e.target.value,
                              )
                            }
                            hideLabel
                          />
                          <TextInput
                            placeholder="Sign"
                            value={admin.sign}
                            onChange={(e) =>
                              handleAdminChange(
                                medIndex,
                                adminIndex,
                                "sign",
                                e.target.value,
                              )
                            }
                            hideLabel
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => removeMedication(medIndex)}
                      className="remove-btn"
                      title="Remove Medication"
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
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "30px",
          }}
        >
          <button
            type="button"
            onClick={addMedication}
            className="secondary-btn"
          >
            + Add Medication Order
          </button>
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Save Medication Chart
          </button>

          <button
            type="button"
            className="submit-btn"
            onClick={() => generatePrintContent(formData.medications)}
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
            <span>🖨️</span> Print Medication Chart
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicationChartForm;
