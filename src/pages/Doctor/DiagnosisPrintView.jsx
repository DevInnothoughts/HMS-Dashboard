import React from "react";

const DiagnosisPrintView = React.forwardRef(
  (
    {
      patient,
      historyList = [],
      diagnosisList = [],
      selectedDiagnosisId,
      onPrint,
      doctors = [],
    },
    ref,
  ) => {
    const currentDate = new Date().toISOString().split("T")[0];

    const [insuranceMap, setInsuranceMap] = React.useState({});
    const [tpaMap, setTpaMap] = React.useState({});

    React.useEffect(() => {
      const fetchCompanies = async () => {
        try {
          const BASE_URL = "http://localhost:5100/api";
          const [iRes, tRes] = await Promise.all([
            fetch(`${BASE_URL}/V1/doctor/insurance-companies`),
            fetch(`${BASE_URL}/V1/doctor/tpa-companies`),
          ]);
          const [iData, tData] = await Promise.all([iRes.json(), tRes.json()]);

          if (iRes.ok && iData.data) {
            const insMap = {};
            iData.data.forEach((co) => {
              insMap[String(co.comapny_id)] = co.companyname;
            });
            setInsuranceMap(insMap);
          }

          if (tRes.ok && tData.data) {
            const tpaCombinedMap = {};
            tData.data.forEach((t) => {
              tpaCombinedMap[String(t.comapny_id || t.tpaid)] = t.companyname || t.tpaname;
            });
            setTpaMap(tpaCombinedMap);
          }
        } catch (err) {
          console.error("Failed to fetch insurance/TPA map in print view:", err);
        }
      };
      fetchCompanies();
    }, []);

    const formatDateDisplay = (dateVal) => {
      if (!dateVal) return "";
      try {
        const str = String(dateVal).trim();
        if (str.includes("T")) {
          const datePart = str.split("T")[0];
          const parts = datePart.split("-");
          if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
          return datePart;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
          const parts = str.split("-");
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return str;
      } catch (e) {
        return String(dateVal);
      }
    };

    // Helper to format referral name based on legacy logic
    const getReferralName = (patient) => {
      if (!patient) return "";
      if (patient.ref_doctor_name) {
        return patient.ref_doctor_name + (patient.ref_doctor_phone ? ` (${patient.ref_doctor_phone})` : "");
      }
      if (patient.reference_type === "dr_ref") {
        return patient.ref_doctor_name
          ? patient.ref_doctor_name + (patient.ref_doctor_phone ? ` (${patient.ref_doctor_phone})` : "")
          : patient.ref || "";
      }
      if (patient.reference_type === "online") return "Online / Social Media";
      if (patient.reference_type === "walkin") return "Walk-In";
      if (patient.reference_type === "self") return "Self / Word of Mouth";
      if (patient.reference_type === "camp") return "Camp";
      return patient.ref || patient.reference_type || "";
    };

    return (
      <div ref={ref} className="diagnosis-print-container">
        <style>{`
       @page { size: A4; margin: 12mm; }

@media screen, print {
  .diagnosis-print-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #000 !important;
    padding: 12px;
    font-size: 12px !important;
    line-height: 1.25;
    background-color: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .diagnosis-print-container * { box-sizing: border-box; }

  .diagnosis-print-container h4 {
    text-align: center;
    font-weight: 700;
    margin: 6px 0 8px 0;
    font-size: 15px;
    text-transform: uppercase;
  }

  .diagnosis-print-container p { margin: 0 0 2px 0; color: #000 !important; }
  .diagnosis-print-container b { font-weight: 700 !important; color: #000 !important; }

  /* Row grid — kept flex so 2-column blocks (patient info) stay side-by-side */
  .diagnosis-print-container .row {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    align-items: flex-start;
  }
  .diagnosis-print-container .col-md-12 { width: 100%; }
  .diagnosis-print-container .col-md-6  { width: 50%; }
  .diagnosis-print-container .col-md-4  { width: 33.33%; }
  .diagnosis-print-container .col-md-3  { width: 25%; }

  .diagnosis-print-container .record-box {
    border: 1px solid #d7d7d7;
    padding: 8px 10px;
    margin-bottom: 8px;
  }
  .diagnosis-print-container .record-box p { font-size: 13px !important; }

  /* VITALS FIX: the only class-less cells in a record box.
     Overrides inline width:20%;float:left so they sit grouped + auto-width. */
  .diagnosis-print-container .record-box .row > div:not([class]) {
    width: auto !important;
    float: none !important;
    flex: 0 0 auto;
    margin: 0 26px 2px 0;
  }
  .diagnosis-print-container .record-box .row > div:not([class]) p { margin: 0; }

  /* LABEL/VALUE FIX: drop the floats, fixed compact label column */
  .diagnosis-print-container .symptom-label {
    float: none !important;
    flex: 0 0 18%;
    width: 18%;
    padding-right: 8px;
  }
  .diagnosis-print-container .symptom-values {
    float: none !important;
    flex: 0 0 82%;
    width: 82%;
  }
  .diagnosis-print-container .symptom-values p { margin: 0 0 2px 0; }

  /* TABLE FIX: full width + readable headers (overrides inline width:80% / 9px) */
  .diagnosis-print-container table {
    width: 100% !important;
    float: none !important;
    border-collapse: collapse;
    margin: 2px 0 4px 0;
    font-size: 12px !important;
  }
  .diagnosis-print-container table.blank-section-table,
  .diagnosis-print-container table.blank-section-table td { font-size: 13px !important; }
  .diagnosis-print-container table,
  .diagnosis-print-container th,
  .diagnosis-print-container td { border: 1px solid #d7d7d7; }
  .diagnosis-print-container th,
  .diagnosis-print-container td {
    padding: 2px 8px;
    text-align: left;
    font-weight: normal;
    color: #000 !important;
    vertical-align: top;
  }
  .diagnosis-print-container .medi_th { font-size: 12px !important; font-weight: 700; }
  .diagnosis-print-container .text-right { text-align: right; }
  .diagnosis-print-container hr { border-top: 1px solid grey !important; margin: 8px 0; }
}
      `}</style>

        <div className="padded">
          {/* PATIENT INFORMATION */}
          <div className="row">
            <div className="col-md-12">
              <h4 style={{ fontWeight: "bold", fontSize: "20px" }}>
                PATIENT INFORMATION
              </h4>
            </div>
          </div>
          <div className="record-box">
            <div className="row">
              <div className="col-md-6">
                <p>
                  <b>Name : </b>
                  {(() => {
                    const prefix = (patient?.prefix || "").trim();
                    if (!prefix) return "";
                    const clean = prefix.replace(/\.$/, "");
                    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() + ". ";
                  })()}
                  {patient?.name || ""}
                </p>
                <p>
                  <b>Mobile No : </b>
                  {patient?.phone || ""}
                </p>
                <p>
                  <b>Address : </b>
                  {patient?.address || ""}
                </p>
                <p>
                  <b>Email ID : </b>
                  {patient?.email || ""}
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <b>UID NO : </b>
                  {patient?.Uid_no || ""}
                </p>
                <p>
                  <b>Age : </b>
                  {patient?.age || ""}
                </p>
                <p>
                  <b>Occupation : </b>
                  {patient?.occupation || ""}
                </p>
                <p>
                  <b>Referral Name : </b>
                  {getReferralName(patient)}
                </p>
              </div>
            </div>
          </div>

          {/* PATIENT HISTORY */}
          <div className="row">
            <div className="col-md-12">
              <h4 style={{ fontWeight: "bold", fontSize: "20px" }}>
                PATIENT HISTORY
              </h4>
            </div>
          </div>
          {historyList.map((row2, idx) => (
            <div key={idx} className="record-box">
              <div className="row">
                <div className="col-md-12">
                  <p className="text-right">
                    <b>Date : </b>
                    {formatDateDisplay(row2.patient_date)}
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <p>
                    <b>Pain Scale : </b>
                    {row2.painscale || row2.painScale || 0}
                  </p>
                </div>
              </div>
              <div className="row">
                {[
                  ["Height", row2.height || row2.Height || "", ""],
                  ["BP", row2.BP || row2.bp || "", "/mm of Hg"],
                  ["RS", row2.RS || row2.rs || "", ""],
                  ["Weight", row2.weight || row2.Weight || "", " kgs"],
                  ["Pulse", row2.Pulse || row2.pulse || "", "/ Min"],
                  ["CVS", row2.CVS || row2.cvs || "", ""],
                  ["RR", row2.RR || row2.rr || "", "/ Min"],
                  ["CNS", row2.CNS || row2.cns || "", ""],
                  [
                    "PA",
                    row2.PA || row2.pa || row2["p/a"] || row2["P/A"] || "",
                    "",
                  ],
                ].map(([label, value, unit], i) =>
                  value ? (
                    <div key={i} style={{ width: "20%", float: "left" }}>
                      <p>
                        <b>{label} : </b>
                        {value}
                        {unit}
                      </p>
                    </div>
                  ) : null,
                )}
              </div>

              {/* Piles */}
              {(() => {
                const symptoms = (row2.symptoms || "")
                  .split(",")
                  .map((s) => s.trim());
                const pilesSymptoms = [
                  "PR Bleeding:Painless",
                  "PR Bleeding:Painful",
                  "Burning",
                  "Pricking",
                  "Itching",
                  "Incomplete Evacuation",
                  "Prolapse",
                  "Swelling",
                  "Pain at Anal Region",
                ];
                const hasPiles =
                  pilesSymptoms.some((s) => symptoms.includes(s)) ||
                  row2.piles_duration;
                if (hasPiles) {
                  return (
                    <div className="row">
                      <div className="symptom-label">
                        <b>Piles :</b>
                      </div>
                      <div className="symptom-values">
                        {pilesSymptoms
                          .filter((s) => symptoms.includes(s))
                          .map((s, i, arr) => (
                            <span key={s}>
                              {s}
                              {i < arr.length - 1 ? " , " : ""}
                            </span>
                          ))}
                        {row2.piles_duration && (
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Duration :</b> {row2.piles_duration}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Fistula */}
              {(() => {
                const symptoms = (row2.symptoms || "")
                  .split(",")
                  .map((s) => s.trim());
                const fistulaSymptoms = [
                  "Pus Discharge",
                  "Boil",
                  "Watery Discharge",
                  "Swelling near anal region",
                ];
                const hasFistula =
                  fistulaSymptoms.some((s) => symptoms.includes(s)) ||
                  row2.fistula_duration;
                if (hasFistula) {
                  return (
                    <div className="row">
                      <div className="symptom-label">
                        <b>Fistula :</b>
                      </div>
                      <div className="symptom-values">
                        {fistulaSymptoms
                          .filter((s) => symptoms.includes(s))
                          .map((s, i, arr) => (
                            <span key={s}>
                              {s}
                              {i < arr.length - 1 ? " , " : ""}
                            </span>
                          ))}
                        {row2.fistula_duration && (
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Duration :</b> {row2.fistula_duration}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Hernia */}
              {(() => {
                const symptoms = (row2.symptoms || "")
                  .split(",")
                  .map((s) => s.trim());
                const herniaSymptoms = [
                  "Swelling:Umbilical",
                  "Right Inguinal",
                  "Left Inguinal",
                  "Swelling:Abdominal",
                  "Reducible",
                  "Nonreducible",
                  "Past Sx",
                ];
                const hasHernia =
                  herniaSymptoms.some((s) => symptoms.includes(s)) ||
                  row2.hernia_duration;
                if (hasHernia) {
                  return (
                    <div className="row">
                      <div className="symptom-label">
                        <b>Hernia :</b>
                      </div>
                      <div className="symptom-values">
                        {herniaSymptoms
                          .filter((s) => symptoms.includes(s))
                          .map((s, i, arr) => (
                            <span key={s}>
                              {s}
                              {i < arr.length - 1 ? " , " : ""}
                            </span>
                          ))}
                        {row2.hernia_duration && (
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Duration :</b> {row2.hernia_duration}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Varicose Veins */}
              {(() => {
                const symptoms = (row2.symptoms || "")
                  .split(",")
                  .map((s) => s.trim());
                const veinsSymptoms = [
                  "Pain on Leg",
                  "Enlarged veins",
                  "Swelling on Leg",
                  "Ulcer",
                  "Right",
                  "Left",
                  "B/L",
                ];
                const hasVeins =
                  veinsSymptoms.some((s) => symptoms.includes(s)) ||
                  row2.varicose_duration;
                if (hasVeins) {
                  return (
                    <div className="row">
                      <div className="symptom-label">
                        <b>Varicose Veins :</b>
                      </div>
                      <div className="symptom-values">
                        {veinsSymptoms
                          .filter((s) => symptoms.includes(s))
                          .map((s, i, arr) => (
                            <span key={s}>
                              {s}
                              {i < arr.length - 1 ? " , " : ""}
                            </span>
                          ))}
                        {row2.varicose_duration && (
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Duration :</b> {row2.varicose_duration}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Pilonidal Sinus */}
              {(() => {
                const symptoms = (row2.symptoms || "")
                  .split(",")
                  .map((s) => s.trim());
                const sinusSymptoms = [
                  "Pain:Tailbone",
                  "Boil:Tailbone",
                  "Swelling:Tailbone",
                  "Pus / Watery Discharge",
                ];
                const hasSinus =
                  sinusSymptoms.some((s) => symptoms.includes(s)) ||
                  row2.pilonidalsinus;
                if (hasSinus) {
                  return (
                    <div className="row">
                      <div className="symptom-label">
                        <b>Pilonidal Sinus :</b>
                      </div>
                      <div className="symptom-values">
                        {sinusSymptoms
                          .filter((s) => symptoms.includes(s))
                          .map((s, i, arr) => (
                            <span key={s}>
                              {s}
                              {i < arr.length - 1 ? " , " : ""}
                            </span>
                          ))}
                        {row2.pilonidalsinus && (
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Duration :</b> {row2.pilonidalsinus}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Urinary Incontinence */}
              {(() => {
                const symptoms = (row2.symptoms || "")
                  .split(",")
                  .map((s) => s.trim());
                if (
                  symptoms.includes("Urinary Incontinence") ||
                  row2.Urinary_incontinence_duration
                ) {
                  return (
                    <div className="row">
                      <div
                        className="col-md-6"
                        style={{ width: "50%", float: "left" }}
                      >
                        <div style={{ width: "31%", float: "left" }}>
                          <b>Urinary Incontinence :</b>
                        </div>
                        <div style={{ width: "69%", float: "left" }}>
                          {symptoms.includes("Urinary Incontinence") && (
                            <span>Urinary Incontinence : </span>
                          )}
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Duration : </b>
                            {row2.Urinary_incontinence_duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Fecal Incontinence */}
              {(() => {
                const symptoms = (row2.symptoms || "")
                  .split(",")
                  .map((s) => s.trim());
                if (
                  symptoms.includes("Fecal Incontinence") ||
                  row2.Fecal_incontinence_duration
                ) {
                  return (
                    <div className="row">
                      <div
                        className="col-md-6"
                        style={{ width: "50%", float: "left" }}
                      >
                        <div style={{ width: "31%", float: "left" }}>
                          <b>Fecal Incontinence :</b>
                        </div>
                        <div style={{ width: "69%", float: "left" }}>
                          {symptoms.includes("Fecal Incontinence") && (
                            <span>Fecal Incontinence : </span>
                          )}
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Duration : </b>
                            {row2.Fecal_incontinence_duration ||
                              row2.Urinary_incontinence_duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* ODS */}
              {(() => {
                const symptoms = (row2.symptoms || "")
                  .split(",")
                  .map((s) => s.trim());
                const ODSSymptoms = [
                  "Excessive Straining",
                  "Digitation",
                  "Hard Stools",
                  "Enema / Laxative",
                  "Fragmented Defecation",
                  "Chronic constipation",
                  "Urgency",
                  "Frequency",
                ];
                let odsData = [];
                const rawOds = row2.ODS_duration || row2.ods_duration;
                if (rawOds) {
                  if (Array.isArray(rawOds)) {
                    odsData = rawOds;
                  } else if (typeof rawOds === "string") {
                    try {
                      const parsed = JSON.parse(rawOds);
                      if (Array.isArray(parsed)) {
                        odsData = parsed;
                      } else {
                        odsData = ["", rawOds];
                      }
                    } catch (e) {
                      odsData = ["", rawOds];
                    }
                  } else {
                    odsData = ["", String(rawOds)];
                  }
                }
                const hasODS =
                  ODSSymptoms.some((s) => symptoms.includes(s)) ||
                  (odsData && odsData.length > 0 && (odsData[0] || odsData[1]));
                if (hasODS) {
                  return (
                    <div className="row">
                      <div className="symptom-label">
                        <b>ODS :</b>
                      </div>
                      <div className="symptom-values">
                        {ODSSymptoms.filter((s) => symptoms.includes(s)).map(
                          (s, i, arr) => (
                            <span key={s}>
                              {s}
                              {i < arr.length - 1 ? " , " : ""}
                            </span>
                          ),
                        )}
                        {odsData[0] && (
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Bowel habits :</b> {odsData[0]}
                          </span>
                        )}
                        {odsData[1] && (
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Duration :</b> {odsData[1]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Circumcision */}
              {row2.circumcision && (
                <div className="row" style={{ marginTop: "10px" }}>
                  <div className="symptom-label">
                    <b>Circumcision :</b>
                  </div>
                  <div className="symptom-values">{row2.circumcision}</div>
                </div>
              )}

              {/* Urology */}
              {(() => {
                const symptoms = (row2.symptoms || "")
                  .split(",")
                  .map((s) => s.trim());
                const urologySymptoms = [
                  "Pain",
                  "Burning urination",
                  "Nausea",
                  "Vomiting",
                  "LUTS",
                  "Urgency of urination",
                  "Incomplete evacuation",
                  "Stream of urine",
                  "Nocturia",
                ];
                const uroDuration = row2.urology || row2.uro_duration;
                const hasUrology =
                  urologySymptoms.some((s) => symptoms.includes(s)) ||
                  uroDuration;
                if (hasUrology) {
                  return (
                    <div className="row">
                      <div className="symptom-label">
                        <b>Urology :</b>
                      </div>
                      <div className="symptom-values">
                        {urologySymptoms
                          .filter((s) => symptoms.includes(s))
                          .map((s, i, arr) => (
                            <span key={s}>
                              {s}
                              {i < arr.length - 1 ? " , " : ""}
                            </span>
                          ))}
                        {uroDuration && (
                          <span style={{ width: "100%", float: "left" }}>
                            <b>Duration :</b> {uroDuration}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Family History */}
              {(() => {
                const rawFam = row2.family_history;
                const extraOther = row2.family_history_other || row2.family_other || "";
                if (!rawFam && !extraOther) return null;

                const items = (
                  Array.isArray(rawFam)
                    ? rawFam
                    : String(rawFam || "").split(",")
                )
                  .map((s) => String(s).trim())
                  .filter(Boolean);

                const known = ["Piles", "Constipation", "DM", "HTN", "Heart Disease"];
                const knownItems = items.filter((k) => known.includes(k));
                const customItems = items.filter((k) => !known.includes(k));
                if (extraOther && !customItems.includes(extraOther)) {
                  customItems.push(extraOther);
                }

                if (knownItems.length === 0 && customItems.length === 0) return null;

                return (
                  <div className="row">
                    <div className="symptom-label">
                      <b>Family History:</b>
                    </div>
                    <div className="symptom-values">
                      {knownItems.length > 0 && (
                        <span>
                          {knownItems.join(" , ")}
                          {customItems.length > 0 ? " , " : ""}
                        </span>
                      )}
                      {customItems.length > 0 && (
                        <span style={{ width: "100%", float: "left", paddingTop: knownItems.length > 0 ? "3px" : "0" }}>
                          <b>Any Other :</b> {customItems.join(" , ")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* General History */}
              {(() => {
                const rawGen = row2.general_history;
                const weightLossComment = row2.weightloss_comment || "";
                if (!rawGen && !weightLossComment) return null;

                const items = (
                  Array.isArray(rawGen)
                    ? rawGen
                    : String(rawGen || "").split(",")
                )
                  .map((s) => String(s).trim())
                  .filter(Boolean);

                const generalList = [
                  "H/O Wt Loss",
                  "History of Weight Loss",
                  "Dec Appetite",
                  "Decreased Appetite",
                  "H/O Straining for urination",
                  "Straining for Urination",
                  "Acidity",
                  "Gas",
                  "Bloating",
                ];
                const knownItems = items.filter((g) => generalList.some((gl) => gl.toLowerCase() === g.toLowerCase()));
                const customItems = items.filter((g) => !generalList.some((gl) => gl.toLowerCase() === g.toLowerCase()));
                if (weightLossComment && !customItems.includes(weightLossComment)) {
                  customItems.push(weightLossComment);
                }

                if (knownItems.length === 0 && customItems.length === 0) return null;

                return (
                  <div className="row">
                    <div className="symptom-label">
                      <b>General History:</b>
                    </div>
                    <div className="symptom-values">
                      {knownItems.length > 0 && (
                        <span>
                          {knownItems.join(" , ")}
                          {customItems.length > 0 ? " , " : ""}
                        </span>
                      )}
                      {customItems.length > 0 && (
                        <span style={{ width: "100%", float: "left", paddingTop: knownItems.length > 0 ? "3px" : "0" }}>
                          <b>Weight Loss / Other Comment :</b> {customItems.join(" , ")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Past Medical History */}
              {(() => {
                const pastVal = row2.past_history || row2.past_medical_history;
                if (!pastVal) return null;
                const items = (
                  Array.isArray(pastVal)
                    ? pastVal
                    : String(pastVal).split(",")
                )
                  .map((s) => String(s).trim())
                  .filter(Boolean);

                if (items.length === 0) return null;

                return (
                  <div className="row">
                    <div className="symptom-label">
                      <b>Past Medical History :</b>
                    </div>
                    <div className="symptom-values">
                      {items.map((s, idx, arr) => {
                        let dur = null;
                        if (row2.pastmedicalduration) {
                          let pmDur = row2.pastmedicalduration;
                          if (typeof pmDur === "string") {
                            try {
                              pmDur = JSON.parse(pmDur);
                            } catch (e) {
                              pmDur = {};
                            }
                          }
                          if (pmDur[s]) {
                            dur = (
                              <>
                                <br />
                                <b>Duration:</b> {pmDur[s]}
                              </>
                            );
                          }
                        }
                        return (
                          <span
                            key={idx}
                            style={{
                              display: "inline-block",
                              verticalAlign: "top",
                              marginRight: "20px",
                              marginBottom: "4px",
                            }}
                          >
                            {s}
                            {idx < arr.length - 1 ? "," : ""}
                            {dur}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Habits */}
              {(() => {
                const rawHab = row2.habits;
                if (!rawHab) return null;
                const items = (
                  Array.isArray(rawHab)
                    ? rawHab
                    : String(rawHab).split(",")
                )
                  .map((s) => String(s).trim())
                  .filter(Boolean);

                if (items.length === 0) return null;

                return (
                  <div className="row">
                    <div className="symptom-label">
                      <b>Habits :</b>
                    </div>
                    <div className="symptom-values">
                      <p>{items.join(" , ")}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Allergy To Any Drugs */}
              {row2.drugs_allery && (
                <div className="row">
                  <div className="symptom-label">
                    <b>Allergy To Any Drugs :</b>
                  </div>
                  <div className="symptom-values">{row2.drugs_allery}</div>
                </div>
              )}

              {/* Medication History Table */}
              {(() => {
                let medHist = row2.medication_history;
                if (typeof medHist === "string") {
                  try {
                    medHist = JSON.parse(medHist);
                  } catch (e) {
                    medHist = [];
                  }
                }
                if (!Array.isArray(medHist) || medHist.length === 0) return null;

                const validRows = medHist.filter(
                  (m) =>
                    m &&
                    (m.medicine ||
                      m.name ||
                      m.medicine_name ||
                      m.indication ||
                      m.since),
                );
                if (validRows.length === 0) return null;

                return (
                  <div className="row">
                    <div className="symptom-label">
                      <b>Medication History :</b>
                    </div>
                    <div className="symptom-values">
                      <table style={{ width: "80%", float: "left" }}>
                        <thead>
                          <tr>
                            <th className="medi_th">Sr.no</th>
                            <th className="medi_th">Name Of Medication</th>
                            <th className="medi_th">Indication</th>
                            <th className="medi_th">since</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validRows.map((m, i) => (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>{m.medicine || m.name || m.medicine_name || ""}</td>
                              <td>{m.indication || ""}</td>
                              <td>{m.since || m.duration || ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Past Surgical History (Comment) */}
              {row2.comment && (
                <div className="row">
                  <div className="symptom-label">
                    <b>Past Surgical History</b>
                  </div>
                  <div className="symptom-values">
                    <p>{row2.comment}</p>
                  </div>
                </div>
              )}

              {/* Any Other Complaints */}
              {(row2.complaints || row2.any_other_complaints || row2.other_complaints) && (
                <div className="row">
                  <div className="symptom-label">
                    <b>Any Other Complaints :</b>
                  </div>
                  <div className="symptom-values">
                    <p>{row2.complaints || row2.any_other_complaints || row2.other_complaints}</p>
                  </div>
                </div>
              )}

              {/* Present Complaints */}
              {row2.presentcomplaints && (
                <div className="row">
                  <div className="symptom-label">
                    <b>Present Complaints :</b>
                  </div>
                  <div className="symptom-values">
                    <p>{row2.presentcomplaints}</p>
                  </div>
                </div>
              )}

              {/* Ongoing Medicines */}
              {row2.ongoing_medicines && (
                <div className="row">
                  <div className="symptom-label">
                    <b>Ongoing Medicines :</b>
                  </div>
                  <div className="symptom-values">
                    {Array.isArray(row2.ongoing_medicines)
                      ? row2.ongoing_medicines.join(", ")
                      : row2.ongoing_medicines}
                  </div>
                </div>
              )}

              {/* Previous Investigation */}
              {(() => {
                const rawInv = row2.newInvestigation;
                if (!rawInv) return null;
                const checksub = (
                  Array.isArray(rawInv)
                    ? rawInv
                    : String(rawInv).split(",")
                )
                  .map((s) => String(s).trim())
                  .filter(Boolean);

                if (checksub.length === 0) return null;

                const rawComment = row2.newInvestigation_comment;
                const commentbox = (
                  Array.isArray(rawComment)
                    ? rawComment
                    : (rawComment || "").split(",")
                ).map((s) => String(s).trim());

                const investigationTypes = [
                  "HB",
                  "BSL-R",
                  "Bleding Time-BT",
                  "Clotting Time-BT",
                  "PT INR",
                  "HIV",
                  "Hbsag",
                  "SR.Creatinine",
                  "Vit B12",
                  "HbA1C",
                  "Thyroid",
                  "LVEF",
                  "Glucose Fasting",
                  "Glucose Fasting & PP",
                ];

                return (
                  <div className="row">
                    <div className="symptom-label">
                      <b>Previous Investigation:</b>
                    </div>
                    <div className="symptom-values">
                      {checksub.map((test, idx) => {
                        let noteIndex = investigationTypes.findIndex(
                          (t) => t.toLowerCase() === test.toLowerCase()
                        );
                        if (noteIndex === -1) noteIndex = idx;
                        const note = commentbox[noteIndex] || "";
                        return (
                          <span key={idx}>
                            {test}{note ? ` - ${note}` : ""}
                            {idx < checksub.length - 1 ? " , " : ""}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Investigation Details */}
              {row2.investigation && (
                <div className="row">
                  <div className="symptom-label">
                    <b>Investigation Details</b>
                  </div>
                  <div className="symptom-values">
                    <p>{row2.investigation}</p>
                  </div>
                </div>
              )}

              {/* Known Case Of */}
              {row2.knowncaseof && (
                <div className="row">
                  <div className="symptom-label">
                    <b>Known Case Of:</b>
                  </div>
                  <div className="symptom-values">
                    <p>{row2.knowncaseof}</p>
                  </div>
                </div>
              )}

              {/* Assistant Doctor */}
              {(() => {
                const asstId =
                  row2.assistance_doctor ||
                  row2.assistanceDoctor ||
                  row2.doctor_id ||
                  row2.assistance_doctor_id;
                const asstDoc = doctors.find(
                  (d) => String(d.doctor_id) === String(asstId)
                );
                const asstName = asstDoc
                  ? asstDoc.name
                  : row2.assistanceDoctorName ||
                    (asstId && isNaN(asstId) ? asstId : "");
                if (!asstName) return null;
                return (
                  <div className="row">
                    <div className="symptom-label">
                      <b>Assistant Doctor:</b>
                    </div>
                    <div className="symptom-values">
                      <p>{asstName}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}

          {/* DIAGNOSIS */}
          {/* DIAGNOSIS */}
          {diagnosisList && diagnosisList.length > 0 && (
            <>
              <div className="row">
                <div className="col-md-12">
                  <h4 style={{ fontWeight: "bold", fontSize: "20px" }}>
                    DIAGNOSIS
                  </h4>
                </div>
              </div>
              {diagnosisList.map((row3, idx) => (
                <div key={idx} className="record-box">
                  <div className="row">
                    <div className="col-md-12">
                      <p className="text-right">
                        <b>Date : </b>
                        {formatDateDisplay(row3.date_diagnosis)}
                      </p>
                    </div>
                  </div>
                  {/* Diagnosis Text */}
                  {(() => {
                    const diagText = row3.diagnosis_text || row3.diagnosis;
                    if (!diagText) return null;
                    return (
                      <div className="row">
                        <div className="symptom-label">
                          <b>Diagnosis: </b>
                        </div>
                        <div className="symptom-values">
                          <p>{String(diagText).replace(/\bo clock\b/gi, "o'clock")}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Investigation Orders */}
                  {(() => {
                    const invOrders = row3.investigation_orders || row3.investigationorders;
                    if (!invOrders) return null;
                    return (
                      <div className="row">
                        <div className="symptom-label">
                          <b>Investigation Orders: </b>
                        </div>
                        <div className="symptom-values">
                          <p>{invOrders}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Advice Treatment */}
                  {(() => {
                    let adviceTypes = row3.advice_types;
                    let diagComment = row3.diagnosis_comment;

                    if (!Array.isArray(adviceTypes) && row3.diagnosisAdvice) {
                      if (row3.diagnosisAdvice.includes("Comment:")) {
                        const parts = row3.diagnosisAdvice.split("Comment:");
                        adviceTypes = (parts[0] || "").split(",").map((s) => s.trim()).filter(Boolean);
                        if (!diagComment) diagComment = (parts[1] || "").trim();
                      } else {
                        adviceTypes = row3.diagnosisAdvice.split(",").map((s) => s.trim()).filter(Boolean);
                      }
                    }

                    if ((!adviceTypes || adviceTypes.length === 0) && !diagComment) return null;

                    return (
                      <div className="row">
                        <div className="symptom-label">
                          <b>Advice Treatment: </b>
                        </div>
                        <div className="symptom-values">
                          <p>
                            {Array.isArray(adviceTypes) ? adviceTypes.join(" , ") : ""}
                            {Array.isArray(adviceTypes) && adviceTypes.length > 0 && diagComment ? " , " : ""}
                            {diagComment ? `Comment: ${diagComment}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {row3.advice && (
                    <div className="row">
                      <div className="symptom-label">
                        <b>Surgical Advice: </b>
                      </div>
                      <div className="symptom-values">
                        <p>{row3.advice}</p>
                      </div>
                    </div>
                  )}
                  {(row3.surgical_advice || row3.adviceComment) && (
                    <div className="row">
                      <div className="symptom-label">
                        <b> Advice Comment: </b>
                      </div>
                      <div className="symptom-values">
                        <p>{row3.surgical_advice || row3.adviceComment}</p>
                      </div>
                    </div>
                  )}

                  {(() => {
                    const checksub = Array.isArray(row3.medical_advice)
                      ? row3.medical_advice
                      : typeof row3.medical_advice === "string"
                        ? row3.medical_advice.split(",").map((s) => s.trim()).filter(Boolean)
                        : typeof row3.medical_mx === "string"
                          ? row3.medical_mx.split(",").map((s) => s.trim()).filter(Boolean)
                          : [];
                    if (checksub.length > 0) {
                      return (
                        <div className="row">
                          <div className="symptom-label">
                            <b>Test Adviced: </b>
                          </div>
                          <div className="symptom-values">
                            <p>
                              {checksub
                                .map((adv) => {
                                  const noteKey = Object.keys(row3.medical_advice_notes || {}).find(
                                    (k) => k.toLowerCase() === adv.toLowerCase()
                                  ) || adv;
                                  const note = row3.medical_advice_notes?.[noteKey];
                                  return note ? `${adv} (${note})` : adv;
                                })
                                .join(" , ")}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Medicines Prescribed */}
                  {(() => {
                    const checksub = row3.medicines_prescribed || [];
                    const fixed = [
                      "AAC",
                      "IBS",
                      "NSAIDS",
                      "ANTIBIOTICS",
                      "ANTACID",
                    ];
                    const filteredFixed = fixed.filter((m) =>
                      checksub.includes(m),
                    );
                    const other = checksub
                      .filter((m) => m && !fixed.includes(m))
                      .join(", ");
                    if (filteredFixed.length > 0 || other) {
                      return (
                        <div className="row">
                          <div className="symptom-label">
                            <b>Medicines Prescribed :</b>
                          </div>
                          <div className="symptom-values">
                            {filteredFixed.map((m, i, arr) => (
                              <span key={m}>
                                {m}
                                {i < arr.length - 1 || other ? " , " : ""}
                              </span>
                            ))}
                            {other && (
                              <span
                                style={{
                                  width: "100%",
                                  float: "left",
                                  paddingTop: "5px",
                                }}
                              >
                                <b>Any other : </b>
                                {other}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Comment */}
                  {(() => {
                    const genComment = row3.general_comment || row3.comment;
                    if (!genComment) return null;
                    return (
                      <div className="row">
                        <div className="symptom-label">
                          <b>Comment: </b>
                        </div>
                        <div className="symptom-values">
                          <p>{genComment}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment Category */}
                  {(() => {
                    const checksub = Array.isArray(row3.categories)
                      ? row3.categories
                      : typeof row3.categories === "string"
                        ? row3.categories.split(",").map((s) => s.trim()).filter(Boolean)
                        : typeof row3.other === "string"
                          ? row3.other.split(",").map((s) => s.trim()).filter(Boolean)
                          : [];
                    if (checksub.length > 0) {
                      return (
                        <div className="row">
                          <div className="symptom-label">
                            <b>Payment Category: </b>
                          </div>
                          <div className="symptom-values">
                            <p>{checksub.join(" , ")}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Insurance Company */}
                  {(() => {
                    const insId =
                      row3.insuranceCompany ||
                      row3.insurance_company_id ||
                      row3.insurancecompany;
                    if (!insId || String(insId).trim() === "" || String(insId) === "0") {
                      return null;
                    }
                    const insName =
                      insuranceMap[String(insId)] ||
                      row3.insurance_company_name ||
                      insId;
                    return (
                      <div className="row">
                        <div className="symptom-label">
                          <b>Insurance Company: </b>
                        </div>
                        <div className="symptom-values">
                          <p>{insName}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* TPA */}
                  {(() => {
                    const tpaId = row3.tpa_id || row3.tpa;
                    if (!tpaId || String(tpaId).trim() === "" || String(tpaId) === "0") {
                      return null;
                    }
                    const tpaName =
                      tpaMap[String(tpaId)] ||
                      row3.tpa_name ||
                      tpaId;
                    return (
                      <div className="row">
                        <div className="symptom-label">
                          <b>TPA: </b>
                        </div>
                        <div className="symptom-values">
                          <p>{tpaName}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Estimate Package/Insurance Details */}
                  {(() => {
                    const catComment = row3.category_comment || row3.categoryComment;
                    if (!catComment) return null;
                    return (
                      <div className="row">
                        <div className="symptom-label">
                          <b>Estimate Package/Insurance Details: </b>
                        </div>
                        <div className="symptom-values">
                          <p>{catComment}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Consultant Doctor & Assistant Doctor */}
                  {(() => {
                    const consultId =
                      row3.consultant_doctor || row3.consultantDoctor;
                    const consultDoc = doctors.find(
                      (d) => String(d.doctor_id) === String(consultId),
                    );
                    const consultName = consultDoc
                      ? consultDoc.name
                      : row3.consultantDoctorName || consultId || "";

                    const assistId =
                      row3.assistance_doctor || row3.assistanceDoctor;
                    const assistDoc = doctors.find(
                      (d) => String(d.doctor_id) === String(assistId),
                    );
                    const assistName = assistDoc
                      ? assistDoc.name
                      : row3.assistanceDoctorName || assistId || "";

                    if (!consultName && !assistName) return null;

                    return (
                      <div className="row align-items-center" style={{ width: "100%", margin: "0" }}>
                        <div className="col-md-6 p-0">
                          {consultName && (
                            <p className="mb-0">
                              <b>Consultant Doctor: </b>
                              {consultName}
                            </p>
                          )}
                        </div>
                        <div className="col-md-6 p-0 text-right text-end" style={{ textAlign: "right" }}>
                          {assistName && (
                            <p className="mb-0">
                              <b>Assistant Doctor: </b>
                              {assistName}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </>
          )}

          {/* BLANK SECTION (FOR PRINTING) */}
          <div style={{ padding: "10px 5px", border: "1px solid #d7d7d7" }}>
            <div className="row">
              <div className="col-md-12">
                <p className="text-right">
                  <b>Date : </b>
                  {currentDate}
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12" style={{ fontSize: "14px" }}>
                <b>Diagnosis Details: </b>
              </div>
              <div className="col-md-12">
                <p
                  style={{
                    border: "1px solid #d7d7d7",
                    height: "20px",
                    margin: "0px",
                  }}
                ></p>
                <p
                  style={{
                    border: "1px solid #d7d7d7",
                    height: "20px",
                    borderTop: "0px",
                    margin: "0px",
                  }}
                ></p>
                <p
                  style={{
                    border: "1px solid #d7d7d7",
                    height: "20px",
                    borderTop: "0px",
                  }}
                ></p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12" style={{ fontSize: "14px" }}>
                <b>Plan: </b>
              </div>
              <div className="col-md-12">
                <p
                  style={{
                    border: "1px solid #d7d7d7",
                    height: "20px",
                    margin: "0px",
                  }}
                ></p>
                <p
                  style={{
                    border: "1px solid #d7d7d7",
                    height: "20px",
                    borderTop: "0px",
                    margin: "0px",
                  }}
                ></p>
                <p
                  style={{
                    border: "1px solid #d7d7d7",
                    height: "20px",
                    borderTop: "0px",
                  }}
                ></p>
              </div>
            </div>
            <br />
            <div className="row">
              <div className="col-md-12">
                <table
                  className="blank-section-table"
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr>
                      <td>RF</td>
                      <td>LASER</td>
                      <td>Monday/Wednesday</td>
                      <td>Reimbursement:HHC/SC</td>
                      <td>LRPTC</td>
                      <td>Workshop</td>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <br />
            <div className="row">
              <div className="col-md-12">
                <table
                  className="blank-section-table"
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr>
                      <td>Constac/Plus</td>
                      <td>Anoac H</td>
                      <td>Anoac Cream</td>
                      <td>Diclofenac</td>
                      <td>Acideem</td>
                      <td>Kiwibiotic</td>
                    </tr>
                    <tr>
                      <td>Rifaximin 400 mg</td>
                      <td>Tumocin|Plus|Cream</td>
                      <td colSpan="4">Others : </td>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <br />
            <div className="row">
              <div className="col-md-12">
                <table
                  className="blank-section-table"
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr>
                      <td>3D Endoanal imaging</td>
                      <td>Echo Defecography</td>
                      <td>USG Abd & Pelvis</td>
                      <td>Venous Doppler Rt/Lt</td>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <br />
            <div className="row">
              <div className="col-md-12">
                <table
                  className="blank-section-table"
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr>
                      <td>CHT</td>
                      <td>Colonoscopy</td>
                      <td>Gastroscopy</td>
                      <td>BugSpeaks</td>
                      <td>MCDPA</td>
                      <td>Manometry</td>
                      <td>Biofeedback</td>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <br />
            <div className="row">
              <div className="col-md-12">
                <table
                  className="blank-section-table"
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr>
                      <td>Cashless</td>
                      <td>Reimbursement : HHC/Govt</td>
                      <td>Healing Hands Foundation</td>
                      <td>PDC</td>
                      <td>EMI</td>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <br />
            <div className="row">
              <div className="col-md-12">
                <table
                  className="blank-section-table"
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr>
                      <td style={{ width: "40%" }}>Next FU : </td>
                      <td style={{ width: "60%" }}>
                        Post Operative FU :1wk / 3wk / 6wk
                      </td>
                    </tr>
                    <tr>
                      <td style={{ width: "40%" }}>Consultant Doctor : </td>
                      <td style={{ width: "60%" }}>Assistant Doctor : </td>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default DiagnosisPrintView;
