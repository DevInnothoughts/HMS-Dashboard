import React from "react";
import logo from "../../assets/images/logo/icon-logo.png";

const FollowUpPrintView = React.forwardRef(
  (
    { patient, followUpData = {}, historyList = [], diagnosisList = [] },
    ref,
  ) => {
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "-") return "-";
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
      } catch (e) {
        return dateStr;
      }
    };

    const currentDate = formatDate(new Date());

    return (
      <div ref={ref} className="followup-print-container">
        <style>{`
        @page { size: A4; margin: 12mm; }

@media screen, print {
  .followup-print-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #000 !important;
    padding: 0;
    font-size: 12px !important;
    line-height: 1.3;
    background-color: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .followup-print-container * { box-sizing: border-box; }

  .followup-print-container .padded { padding: 10px; }
  .followup-print-container #divToPrint { padding: 0; margin: 0; }

  /* Flex rows (kept so 2-col blocks stay side-by-side); floats removed so they
     don't fight flex and cause inconsistent spacing across browsers. */
  .followup-print-container .row {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    align-items: flex-start;
  }
  .followup-print-container .col-md-4-left  { width: 50%; }
  .followup-print-container .col-md-8-right { width: 50%; }
  .followup-print-container .col-md-4-33 { width: 33.33%; }
  .followup-print-container .col-md-4-50 { width: 50%; }
  .followup-print-container .col-md-4-30 { width: 30%; }
  .followup-print-container .col-md-4-20 { width: 20%; }
  .followup-print-container .col-md-12 { width: 100%; }
  .followup-print-container .col-md-3 { width: 25%; }
  .followup-print-container .col-md-6 { width: 50%; }
  .followup-print-container .col-md-9 { width: 75%; }

  .followup-print-container h2 {
    font-size: 26px; font-weight: 600; text-align: right;
    text-transform: uppercase; margin: 0;
  }
  .followup-print-container h4 {
    font-weight: 700; margin: 6px 0 8px; font-size: 16px; text-align: center;
  }

  .followup-print-container .inner-border-box {
    border: 2px solid #777;
    padding: 8px 10px;
    margin-bottom: 10px;
  }

  .followup-print-container p { margin: 0 0 2px 0; color: #000 !important; }
  /* The optional RF/Laser/MW line renders as an empty <p> when none are set.
     Collapsing it removes the stray blank gaps (notably between Advice and the
     doctor line on page 2). Labels like "Next FU :" hold a <b>, so they stay. */
  .followup-print-container p:empty { display: none; }
  .followup-print-container b { font-weight: 700 !important; color: #000 !important; }

  .followup-print-container hr { border: 0; border-top: 1px solid #4b897e; margin: 6px 0; }

  .followup-print-container table { width: 100%; border-collapse: collapse; margin: 2px 0 4px 0; }
  .followup-print-container table th,
  .followup-print-container table td {
    border: 1px solid #b9acac;
    padding: 2px 8px;
    text-align: left;
    vertical-align: top;
  }
  .followup-print-container .text-right { text-align: right; }
}
      `}</style>

        <div className="padded">
          <div id="divToPrint">
            {/* Header Row */}
            <div
              className="row"
              style={{ alignItems: "center", padding: "0 15px 10px" }}
            >
              <div className="col-md-4-left">
                <img src={logo} alt="Logo" style={{ width: "60px" }} />
              </div>
              <div className="col-md-8-right">
                <h2>Follow Up Details</h2>
              </div>
            </div>
            <div style={{ clear: "both" }}></div>
            {/* Main Border Container (PHP Line 51 logic) */}
            <div
              style={{
                border: "2px solid green",
                padding: "15px",
                borderRadius: "25px",
                marginBottom: "20px",
              }}
            >
              {/* Patient Header Box */}
              <div className="inner-border-box" style={{ padding: "10px 5px" }}>
                <div className="row">
                  <div className="col-md-4-50">
                    <p>
                      <b>Patient Name :</b>&nbsp;
                      {(() => {
                        const prefix = (patient?.prefix || "").trim();
                        if (!prefix) return "";
                        const clean = prefix.replace(/\.$/, "");
                        return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() + ". ";
                      })()}
                      {patient?.name || "-"}
                    </p>
                  </div>
                  <div className="col-md-4-30">
                    <p>
                      <b>UID No :</b>&nbsp;{patient?.Uid_no || "-"}
                    </p>
                  </div>
                  <div className="col-md-4-20">
                    <p>
                      <b>Date :</b>&nbsp;{currentDate}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4-50">
                    <p>
                      <b>Age / Sex :</b>&nbsp;{patient?.age || "-"} yrs /{" "}
                      {patient?.sex || "-"}
                    </p>
                  </div>
                  <div className="col-md-4-50">
                    <p>
                      <b>Contact No :</b>&nbsp;{patient?.phone || "-"}
                      {patient?.mobile_2 ? ` / ${patient?.mobile_2}` : ""}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4-50">
                    <p>
                      <b>Address :</b>&nbsp;{patient?.address || "-"}
                    </p>
                  </div>
                  <div className="col-md-4-50">
                    <p>
                      <b>Occupation :</b>&nbsp;{patient?.occupation || "-"}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4-50">
                    <p>
                      <b>Email Id :</b>&nbsp;{patient?.email || "-"}
                    </p>
                  </div>
                  <div className="col-md-4-50">
                    <p>
                      <b>Referred By :</b>&nbsp;
                      {patient?.reference_type === "dr_ref"
                        ? patient?.ref_doctor_name || patient?.ref || "-"
                        : patient?.ref || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <h4 style={{ textAlign: "center" }}>Patient History</h4>
                </div>
              </div>

              {/* Patient History Box */}
              <div className="inner-border-box" style={{ padding: "10px 5px" }}>
                {historyList.length > 0 ? (
                  historyList.map((row2, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom:
                          idx < historyList.length - 1 ? "15px" : "0",
                      }}
                    >
                      <div className="row">
                        <div className="col-md-3"></div>
                        <div className="col-md-3"></div>
                        <div className="col-md-3"></div>
                        <div className="col-md-3">
                          <p className="text-right">
                            <b>Date : </b>
                            {formatDate(row2.patient_date)}
                          </p>
                        </div>
                      </div>

                      {/* Family History */}
                      {(() => {
                        const fam = (row2.family_history || "").split(",");
                        const known = [
                          "Piles",
                          "Constipation",
                          "DM",
                          "HTN",
                          "Heart Disease",
                        ];
                        const filteredFam = known.filter((k) =>
                          fam.includes(k),
                        );
                        const anyother = fam[fam.length - 1];
                        if (
                          filteredFam.length > 0 ||
                          (anyother && !known.includes(anyother))
                        ) {
                          return (
                            <div className="row">
                              <div
                                className="col-md-3"
                                style={{ width: "15%" }}
                              >
                                <b>Family History: </b>
                              </div>
                              <div
                                className="col-md-9"
                                style={{ width: "85%" }}
                              >
                                {filteredFam.join(", ")}
                                {anyother && !known.includes(anyother) && (
                                  <span
                                    style={{
                                      width: "100%",
                                      float: "left",
                                      paddingTop: "5px",
                                    }}
                                  >
                                    <b>Any Other : </b>
                                    {anyother}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* General History */}
                      {(() => {
                        const gen = (row2.general_history || "").split(",");
                        const items = [
                          "H/O Wt Loss",
                          "Dec Appetite",
                          "H/O Straining for urination",
                          "Acidity",
                          "Gas",
                          "Bloating",
                        ];
                        const filteredGen = items.filter((i) =>
                          gen.includes(i),
                        );
                        const comment = gen[gen.length - 1];
                        if (
                          filteredGen.length > 0 ||
                          (comment && !items.includes(comment))
                        ) {
                          return (
                            <div className="row">
                              <div
                                className="col-md-3"
                                style={{ width: "15%" }}
                              >
                                <b>General History: </b>
                              </div>
                              <div
                                className="col-md-9"
                                style={{ width: "85%" }}
                              >
                                {filteredGen.join(", ")}
                                {comment && !items.includes(comment) && (
                                  <span
                                    style={{
                                      width: "100%",
                                      float: "left",
                                      paddingTop: "5px",
                                    }}
                                  >
                                    <b>Comment : </b>
                                    {comment}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {row2.past_history && (
                        <div className="row">
                          <div className="col-md-3" style={{ width: "16%" }}>
                            <b>Past Medical History : </b>
                          </div>
                          <div className="col-md-9" style={{ width: "84%" }}>
                            {row2.past_history}
                          </div>
                        </div>
                      )}

                      {/* Habits */}
                      {(() => {
                        const habitsArr = (row2.habits || "").split(",");
                        const items = [
                          "Smoking",
                          "Alcohol",
                          "Tobacco",
                          "Drugs",
                        ];
                        const filtered = items.filter((i) =>
                          habitsArr.includes(i),
                        );
                        if (filtered.length > 0) {
                          return (
                            <div className="row">
                              <div
                                className="col-md-3"
                                style={{ width: "15%" }}
                              >
                                <b>Habits : </b>
                              </div>
                              <div
                                className="col-md-9"
                                style={{ width: "85%" }}
                              >
                                {filtered.join(", ")}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {row2.drugs_allery && (
                        <div className="row">
                          <div className="col-md-3" style={{ width: "15%" }}>
                            <b>Allergy To Any Drugs : </b>
                          </div>
                          <div className="col-md-9" style={{ width: "85%" }}>
                            {row2.drugs_allery}
                          </div>
                        </div>
                      )}

                      {/* Ongoing Medicines */}
                      {row2.ongoing_medicines && (
                        <div className="row">
                          <div className="col-md-3" style={{ width: "15%" }}>
                            <b>Ongoing Medicines : </b>
                          </div>
                          <div className="col-md-9" style={{ width: "85%" }}>
                            {row2.ongoing_medicines}
                          </div>
                        </div>
                      )}

                      {row2.comment && (
                        <div className="row">
                          <div className="col-md-3" style={{ width: "15%" }}>
                            <b>Past Surgical History: </b>
                          </div>
                          <div className="col-md-9" style={{ width: "85%" }}>
                            <p>{row2.comment}</p>
                          </div>
                        </div>
                      )}
                      {row2.presentcomplaints && (
                        <div className="row">
                          <div className="col-md-3" style={{ width: "15%" }}>
                            <b>Present Complaints : </b>
                          </div>
                          <div className="col-md-9" style={{ width: "85%" }}>
                            <p>{row2.presentcomplaints}</p>
                          </div>
                        </div>
                      )}

                      {row2.complaints && (
                        <div className="row">
                          <div className="col-md-3" style={{ width: "15%" }}>
                            <b>Any Other Complaints : </b>
                          </div>
                          <div className="col-md-9" style={{ width: "85%" }}>
                            <p>{row2.complaints}</p>
                          </div>
                        </div>
                      )}

                      {/* Medication History Table */}
                      {row2.medication_history &&
                        row2.medication_history.length > 0 && (
                          <div className="row" style={{ marginTop: "10px" }}>
                            <div className="col-md-3" style={{ width: "15%" }}>
                              <b>Medication History : </b>
                            </div>
                            <div className="col-md-9" style={{ width: "85%" }}>
                              <table style={{ border: "1px solid #b9acac" }}>
                                <thead>
                                  <tr>
                                    <th>
                                      <b>Sr.no</b>
                                    </th>
                                    <th>
                                      <b>Name Of Medication</b>
                                    </th>
                                    <th>
                                      <b>Indication</b>
                                    </th>
                                    <th>
                                      <b>since</b>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row2.medication_history.map((med, mIdx) => (
                                    <tr key={mIdx}>
                                      <td>{mIdx + 1}</td>
                                      <td>{med.medicine}</td>
                                      <td>{med.indication}</td>
                                      <td>{med.since}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                      {/* Previous Investigation */}
                      {(() => {
                        const invList = (row2.newInvestigation || "").split(
                          ",",
                        );
                        const invComments = (
                          row2.newInvestigation_comment || ""
                        ).split(",");
                        const knownInv = [
                          "HB",
                          "BSL-R",
                          "Bleding Time-BT",
                          "Clotting Time-BT",
                          "PT INR",
                          "HIV",
                          "Hbsag",
                          "SR.Creatinine",
                          "Vit B12",
                        ];
                        const filtered = knownInv.filter((k) =>
                          invList.includes(k),
                        );

                        if (filtered.length > 0) {
                          return (
                            <div className="row">
                              <div
                                className="col-md-3"
                                style={{ width: "15%" }}
                              >
                                <b>Previous Investigation: </b>
                              </div>
                              <div
                                className="col-md-9"
                                style={{ width: "85%" }}
                              >
                                {filtered.map((inv, i) => {
                                  const idx = knownInv.indexOf(inv);
                                  const comment = invComments[idx];
                                  return (
                                    <span key={i}>
                                      {inv} {comment ? `- ${comment}` : ""}
                                      {i < filtered.length - 1 ? " , " : ""}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {row2.investigation && (
                        <div className="row">
                          <div className="col-md-3" style={{ width: "15%" }}>
                            <b>Investigation Details: </b>
                          </div>
                          <div className="col-md-9" style={{ width: "85%" }}>
                            {row2.investigation}
                          </div>
                        </div>
                      )}

                      {row2.knowncaseof && (
                        <div className="row">
                          <div className="col-md-3" style={{ width: "15%" }}>
                            <b>Known Case Of: </b>
                          </div>
                          <div className="col-md-9" style={{ width: "85%" }}>
                            {row2.knowncaseof}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center">No history records found.</p>
                )}
              </div>

              {/* Diagnosis History Box */}
              <div className="inner-border-box" style={{ padding: "10px 5px" }}>
                {diagnosisList.length > 0 ? (
                  diagnosisList.map((diag, idx) => (
                    <div key={idx} style={{ marginBottom: "10px" }}>
                      <div className="row">
                        <div className="col-md-9" style={{ width: "75%" }}>
                          <p>
                            <b>Diagnosis :</b>&nbsp;
                            {diag.diagnosis_text || diag.diagnosis || "-"}
                          </p>
                        </div>
                        <div className="col-md-3" style={{ width: "20%" }}>
                          <p className="text-right">
                            <b>Date : </b>
                            {formatDate(diag.date_diagnosis)}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <p>
                            <b>Advice :</b>&nbsp;
                            {diag.advice || diag.surgical_advice || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <p>
                            {diag.RF && (
                              <span>
                                <b>RF :</b>&nbsp;
                                {(diag.RF || "").split(",").join(" / ")}{" "}
                                &nbsp;&nbsp;&nbsp;
                              </span>
                            )}
                            {diag.Laser && (
                              <span>
                                &nbsp;&nbsp;&nbsp;<b>Laser :</b>&nbsp;
                                {(diag.Laser || "").split(",").join(" / ")}{" "}
                                &nbsp;&nbsp;&nbsp;
                              </span>
                            )}
                            {diag.MW && (
                              <span>
                                &nbsp;&nbsp;&nbsp;<b>MW :</b>&nbsp;
                                {(diag.MW || "").split(",").join(" / ")}{" "}
                                &nbsp;&nbsp;&nbsp;
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6" style={{ width: "55%" }}>
                          <p>
                            <b>Last Time Assisted By :</b>&nbsp;
                            {diag.assistanceDoctorName ||
                              diag.assistanceDoctor ||
                              "-"}
                          </p>
                        </div>
                        <div
                          className="col-md-6"
                          style={{
                            width: "45%",
                            float: "right",
                            textAlign: "right",
                          }}
                        >
                          <p>
                            <b>Consulted By :</b>&nbsp;
                            {diag.consultantDoctorName ||
                              diag.consultantDoctor ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      {/* PHP mapping for follow up complaints on same date */}
                      {followUpData?.followup_date === diag.date_diagnosis && (
                        <div className="row">
                          <div className="col-md-12">
                            <p>
                              <b>Present Complaints :&nbsp;&nbsp;</b>
                              {followUpData?.present_complaints}
                            </p>
                          </div>
                        </div>
                      )}
                      {idx < diagnosisList.length - 1 && (
                        <hr style={{ marginTop: "0", marginBottom: "10px" }} />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center">No diagnosis records found.</p>
                )}
              </div>

              {/* Bottom Visit Placeholder Box (Match PHP Line 529+) */}
              <div className="inner-border-box" style={{ padding: "10px 5px" }}>
                <div className="row">
                  <div className="col-md-6" style={{ width: "30%" }}>
                    <p>
                      <b>First visit Date :</b>&nbsp;
                      {formatDate(patient?.date) || "-"}
                    </p>
                  </div>
                  <div
                    className="col-md-6"
                    style={{ width: "68%", textAlign: "right", float: "right" }}
                  >
                    <p>
                      <b>Last visit Date :</b>&nbsp;
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div
                    className="col-md-12"
                    style={{ width: "100%", height: "30px" }}
                  >
                    <p>
                      <b>Present Complaints :</b>{" "}
                      {followUpData?.present_complaints || ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div
                  className="col-md-12"
                  style={{ width: "100%", height: "40px" }}
                >
                  <p>
                    <b>Diagnosis :</b>{" "}
                    {followUpData?.diagnosis_text ||
                      followUpData?.diagnosis ||
                      ""}
                  </p>
                </div>
              </div>
              <div className="row">
                <div
                  className="col-md-12"
                  style={{ width: "100%", height: "40px" }}
                >
                  <p>
                    <b>Advice :</b> {followUpData?.advice || ""}
                  </p>
                </div>
              </div>
              <div className="row">
                <div
                  className="col-md-9"
                  style={{ width: "35%", height: "40px" }}
                >
                  <p>
                    <b>Next FU :</b>{" "}
                  </p>
                </div>
                <div
                  className="col-md-3"
                  style={{ width: "65%", height: "40px", textAlign: "center" }}
                >
                  <p>
                    <b>Assistant Doctor :</b>{" "}
                  </p>
                </div>
              </div>
            </div>{" "}
            {/* Main Border End */}
          </div>{" "}
          {/* divToPrint End */}
        </div>
      </div>
    );
  },
);

export default FollowUpPrintView;
