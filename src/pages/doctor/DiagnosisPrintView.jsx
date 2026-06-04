import React from "react";

const DiagnosisPrintView = React.forwardRef(({ patient, historyList = [], diagnosisList = [], selectedDiagnosisId, onPrint }, ref) => {
  const currentDate = new Date().toISOString().split('T')[0];

  // Helper to format referral name based on legacy logic
  const getReferralName = (patient) => {
    if (!patient) return "";
    if (patient.reference_type === 'dr_ref') {
      return patient.ref_doctor_name ? (patient.ref_doctor_name + (patient.ref_doctor_phone ? ` ( ${patient.ref_doctor_phone} )` : "")) : (patient.ref || "");
    }
    return patient.ref || "";
  };

  return (
    <div ref={ref} className="diagnosis-print-container">
      <style>{`
        @media screen, print {
          .diagnosis-print-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #000 !important;
            padding: 10px;
            font-size: 12px !important;
            line-height: 1.2;
            background-color: white;
          }
          .diagnosis-print-container h4 {
            text-align: center;
            font-weight: 600;
            margin: 0px;
            margin-bottom: 10px;
            font-size: 12px;
            text-transform: uppercase;
          }
          .diagnosis-print-container p {
            margin: 0 0 5px 0;
            color: #000 !important;
          }
          .diagnosis-print-container b {
            font-weight: 700 !important;
            color: #000 !important;
          }
          .diagnosis-print-container .row {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
          }
          .diagnosis-print-container .col-md-12 { width: 100%; }
          .diagnosis-print-container .col-md-6 { width: 50%; }
          .diagnosis-print-container .col-md-4 { width: 33.33%; }
          .diagnosis-print-container .col-md-3 { width: 25%; }
          .diagnosis-print-container .record-box {
            border: 1px solid #d7d7d7;
            padding: 10px 5px;
            margin-bottom: 10px;
            font-size: 14px !important;
          }
          .diagnosis-print-container .record-box p {
            font-size: 14px !important;
          }
          .diagnosis-print-container table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
            font-size: 12px !important;
          }
          .diagnosis-print-container table.blank-section-table,
          .diagnosis-print-container table.blank-section-table td { 
            font-size: 14px !important;
          }
          .diagnosis-print-container table, .diagnosis-print-container th, .diagnosis-print-container td {
            border: 1px solid #d7d7d7;
          }
          .diagnosis-print-container th, .diagnosis-print-container td {
            padding: 1px 10px;
            text-align: left;
            font-weight: normal;
            color: #000 !important;
          }
          .diagnosis-print-container .text-right { text-align: right; }
          .diagnosis-print-container .medi_th { font-size: 9px !important; font-weight: bold; }
          .diagnosis-print-container hr {
            border-top: 1px solid grey !important;
            margin: 10px 0px;
          }
          .diagnosis-print-container .symptom-label {
            width: 15%;
            float: left;
          }
          .diagnosis-print-container .symptom-values {
            width: 85%;
            float: left;
          }
        }
      `}</style>

      <div className="padded">
        {/* PATIENT INFORMATION */}
        <div className="row">
          <div className="col-md-12">
            <h4 style={{ fontWeight: "bold", fontSize: "20px" }}>PATIENT INFORMATION</h4>
          </div>
        </div>
        <div className="record-box">
          <div className="row">
            <div className="col-md-6">
              <p><b>Name : </b>{patient?.name || ""}</p>
              <p><b>Mobile No : </b>{patient?.phone || ""}</p>
              <p><b>Address : </b>{patient?.address || ""}</p>
              <p><b>Email ID : </b>{patient?.email || ""}</p>
            </div>
            <div className="col-md-6">
              <p><b>UID NO : </b>{patient?.Uid_no || ""}</p>
              <p><b>Age : </b>{patient?.age || ""}</p>
              <p><b>Occupation : </b>{patient?.occupation || ""}</p>
              <p><b>Referral Name : </b>{getReferralName(patient)}</p>
            </div>
          </div>
        </div>

        {/* PATIENT HISTORY */}
        <div className="row">
          <div className="col-md-12">
            <h4 style={{ fontWeight: "bold", fontSize: "20px" }}>PATIENT HISTORY</h4>
          </div>
        </div>
        {historyList.map((row2, idx) => (
          <div key={idx} className="record-box">
            <div className="row">
              <div className="col-md-12">
                <p className="text-right"><b>Date : </b>{row2.patient_date}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <p><b>Pain Scale : </b>{row2.painscale || row2.painScale || 0}</p>
              </div>
            </div>
            <div className="row">
              {[
                ['Height', row2.height || row2.Height || '', ''],
                ['BP', row2.BP || row2.bp || '', '/mm of Hg'],
                ['RS', row2.RS || row2.rs || '', ''],
                ['Weight', row2.weight || row2.Weight || '', ' kgs'],
                ['Pulse', row2.Pulse || row2.pulse || '', '/ Min'],
                ['CVS', row2.CVS || row2.cvs || '', ''],
                ['RR', row2.RR || row2.rr || '', '/ Min'],
                ['CNS', row2.CNS || row2.cns || '', ''],
                ['PA', row2.PA || row2.pa || row2['p/a'] || row2['P/A'] || '', '']
              ].map(([label, value, unit], i) => (
                value ? (
                  <div key={i} style={{ width: "20%", float: "left" }}>
                    <p><b>{label} : </b>{value}{unit}</p>
                  </div>
                ) : null
              ))}
            </div>

            {/* Piles */}
            {(() => {
              const symptoms = (row2.symptoms || "").split(',').map(s => s.trim());
              const pilesSymptoms = ['PR Bleeding:Painless', 'PR Bleeding:Painful', 'Burning', 'Pricking', 'Itching', 'Incomplete Evacuation', 'Prolapse', 'Swelling', 'Pain at Anal Region'];
              const hasPiles = pilesSymptoms.some(s => symptoms.includes(s)) || row2.piles_duration;
              if (hasPiles) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>Piles :</b></div>
                    <div className="symptom-values">
                      {pilesSymptoms.filter(s => symptoms.includes(s)).map((s, i, arr) => (
                        <span key={s}>{s}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                      {row2.piles_duration && (
                        <span style={{ width: "100%", float: "left" }}><b>Duration :</b> {row2.piles_duration}</span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Fistula */}
            {(() => {
              const symptoms = (row2.symptoms || "").split(',').map(s => s.trim());
              const fistulaSymptoms = ['Pus Discharge', 'Boil', 'Watery Discharge', 'Swelling near anal region'];
              const hasFistula = fistulaSymptoms.some(s => symptoms.includes(s)) || row2.fistula_duration;
              if (hasFistula) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>Fistula :</b></div>
                    <div className="symptom-values">
                      {fistulaSymptoms.filter(s => symptoms.includes(s)).map((s, i, arr) => (
                        <span key={s}>{s}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                      {row2.fistula_duration && (
                        <span style={{ width: "100%", float: "left" }}><b>Duration :</b> {row2.fistula_duration}</span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Hernia */}
            {(() => {
              const symptoms = (row2.symptoms || "").split(',').map(s => s.trim());
              const herniaSymptoms = ['Swelling:Umbilical', 'Right Inguinal', 'Left Inguinal', 'Swelling:Abdominal', 'Reducible', 'Nonreducible', 'Past Sx'];
              const hasHernia = herniaSymptoms.some(s => symptoms.includes(s)) || row2.hernia_duration;
              if (hasHernia) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>Hernia :</b></div>
                    <div className="symptom-values">
                      {herniaSymptoms.filter(s => symptoms.includes(s)).map((s, i, arr) => (
                        <span key={s}>{s}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                      {row2.hernia_duration && (
                        <span style={{ width: "100%", float: "left" }}><b>Duration :</b> {row2.hernia_duration}</span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Varicose Veins */}
            {(() => {
              const symptoms = (row2.symptoms || "").split(',').map(s => s.trim());
              const veinsSymptoms = ['Pain on Leg', 'Enlarged veins', 'Swelling on Leg', 'Ulcer', 'Right', 'Left', 'B/L'];
              const hasVeins = veinsSymptoms.some(s => symptoms.includes(s)) || row2.varicose_duration;
              if (hasVeins) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>Varicose Veins :</b></div>
                    <div className="symptom-values">
                      {veinsSymptoms.filter(s => symptoms.includes(s)).map((s, i, arr) => (
                        <span key={s}>{s}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                      {row2.varicose_duration && (
                        <span style={{ width: "100%", float: "left" }}><b>Duration :</b> {row2.varicose_duration}</span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Pilonidal Sinus */}
            {(() => {
              const symptoms = (row2.symptoms || "").split(',').map(s => s.trim());
              const sinusSymptoms = ['Pain:Tailbone', 'Boil:Tailbone', 'Swelling:Tailbone', 'Pus / Watery Discharge'];
              const hasSinus = sinusSymptoms.some(s => symptoms.includes(s)) || row2.pilonidalsinus;
              if (hasSinus) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>Pilonidal Sinus :</b></div>
                    <div className="symptom-values">
                      {sinusSymptoms.filter(s => symptoms.includes(s)).map((s, i, arr) => (
                        <span key={s}>{s}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                      {row2.pilonidalsinus && (
                        <span style={{ width: "100%", float: "left" }}><b>Duration :</b> {row2.pilonidalsinus}</span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Urinary Incontinence */}
            {(() => {
              const symptoms = (row2.symptoms || "").split(',').map(s => s.trim());
              if (symptoms.includes('Urinary Incontinence') || row2.Urinary_incontinence_duration) {
                return (
                  <div className="row">
                    <div className="col-md-6" style={{ width: "50%", float: "left" }}>
                      <div style={{ width: "31%", float: "left" }}><b>Urinary Incontinence :</b></div>
                      <div style={{ width: "69%", float: "left" }}>
                        {symptoms.includes('Urinary Incontinence') && <span>Urinary Incontinence : </span>}
                        <span style={{ width: "100%", float: "left" }}><b>Duration : </b>{row2.Urinary_incontinence_duration}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Fecal Incontinence */}
            {(() => {
              const symptoms = (row2.symptoms || "").split(',').map(s => s.trim());
              if (symptoms.includes('Fecal Incontinence') || row2.Fecal_incontinence_duration) {
                return (
                  <div className="row">
                    <div className="col-md-6" style={{ width: "50%", float: "left" }}>
                      <div style={{ width: "31%", float: "left" }}><b>Fecal Incontinence :</b></div>
                      <div style={{ width: "69%", float: "left" }}>
                        {symptoms.includes('Fecal Incontinence') && <span>Fecal Incontinence : </span>}
                        <span style={{ width: "100%", float: "left" }}><b>Duration : </b>{row2.Fecal_incontinence_duration || row2.Urinary_incontinence_duration}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* ODS */}
            {(() => {
              const symptoms = (row2.symptoms || "").split(',').map(s => s.trim());
              const ODSSymptoms = ['Excessive Straining', 'Digitation', 'Hard Stools', 'Enema / Laxative', 'Fragmented Defecation', 'Chronic constipation', 'Urgency', 'Frequency'];
              let odsData = [];
              try {
                odsData = JSON.parse(row2.ODS_duration || "[]");
              } catch (e) {
                odsData = [];
              }
              const hasODS = ODSSymptoms.some(s => symptoms.includes(s)) || (odsData && odsData.length > 0 && (odsData[0] || odsData[1]));
              if (hasODS) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>ODS :</b></div>
                    <div className="symptom-values">
                      {ODSSymptoms.filter(s => symptoms.includes(s)).map((s, i, arr) => (
                        <span key={s}>{s}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                      {odsData[0] && <span style={{ width: "100%", float: "left" }}><b>Bowel habits :</b> {odsData[0]}</span>}
                      {odsData[1] && <span style={{ width: "100%", float: "left" }}><b>Duration :</b> {odsData[1]}</span>}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Circumcision */}
            {row2.circumcision && (
              <div className="row" style={{ marginTop: "10px" }}>
                <div className="symptom-label"><b>Circumcision :</b></div>
                <div className="symptom-values">{row2.circumcision}</div>
              </div>
            )}

            {/* Urology */}
            {(() => {
              const symptoms = (row2.symptoms || "").split(',').map(s => s.trim());
              const urologySymptoms = ['Pain', 'Burning urination', 'Nausea', 'Vomiting', 'LUTS', 'Urgency of urination', 'Incomplete evacuation', 'Stream of urine', 'Nocturia'];
              const uroDuration = row2.urology || row2.uro_duration;
              const hasUrology = urologySymptoms.some(s => symptoms.includes(s)) || uroDuration;
              if (hasUrology) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>Urology :</b></div>
                    <div className="symptom-values">
                      {urologySymptoms.filter(s => symptoms.includes(s)).map((s, i, arr) => (
                        <span key={s}>{s}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                      {uroDuration && <span style={{ width: "100%", float: "left" }}><b>Duration :</b> {uroDuration}</span>}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Family History */}
            {(() => {
              const checksub = (row2.family_history || "").split(',').map(s => s.trim());
              const known = ['Piles', 'Constipation', 'DM', 'HTN', 'Heart Disease'];
              const anyother = checksub[checksub.length - 1]; // In legacy, often the last item is "any other"
              if (known.some(k => checksub.includes(k)) || (checksub.length > 0 && !known.includes(anyother) && anyother)) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>Family History:</b></div>
                    <div className="symptom-values">
                      {known.filter(k => checksub.includes(k)).map((k, i, arr) => (
                        <span key={k}>{k}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                      {anyother && !known.includes(anyother) && (
                        <span style={{ width: "100%", float: "left", paddingTop: "5px" }}><b>Any Other :</b> {anyother}</span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* General History */}
            {(() => {
              const checksub = (row2.general_history || "").split(',').map(s => s.trim());
              const general_list = ['H/O Wt Loss', 'Dec Appetite', 'H/O Straining for urination', 'Acidity', 'Gas', 'Bloating'];
              const weightlossbox = checksub[checksub.length - 1];
              if (general_list.some(g => checksub.includes(g)) || (checksub.length > 0 && !general_list.includes(weightlossbox) && weightlossbox)) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>General History:</b></div>
                    <div className="symptom-values">
                      {general_list.filter(g => checksub.includes(g)).map((g, i, arr) => (
                        <span key={g}>{g}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                      {weightlossbox && !general_list.includes(weightlossbox) && (
                        <span style={{ width: "100%", float: "left", paddingTop: "5px" }}><b>Weight Loss Comment :</b> {weightlossbox}</span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Past Medical History */}
            {row2.past_history && (
              <div className="row">
                <div className="symptom-label"><b>Past Medical History :</b></div>
                <div className="symptom-values">{row2.past_history}</div>
              </div>
            )}

            {/* Habits */}
            {(() => {
              const checksub = (row2.habits || "").split(',').map(s => s.trim());
              const habits = ['Smoking', 'Alcohol', 'Tobacco', 'Drugs'];
              if (habits.some(h => checksub.includes(h))) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>Habits :</b></div>
                    <div className="symptom-values">
                      {habits.filter(h => checksub.includes(h)).map((h, i, arr) => (
                        <span key={h}>{h}{i < arr.length - 1 ? " , " : ""}</span>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Allergy To Any Drugs */}
            {row2.drugs_allery && (
              <div className="row">
                <div className="symptom-label"><b>Allergy To Any Drugs :</b></div>
                <div className="symptom-values">{row2.drugs_allery}</div>
              </div>
            )}

            {/* Medication History Table */}
            {row2.medication_history && row2.medication_history.length > 0 && (
              <div className="row">
                <div className="symptom-label"><b>Medication History :</b></div>
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
                      {row2.medication_history.map((m, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{m.medicine}</td>
                          <td>{m.indication}</td>
                          <td>{m.since}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Past Surgical History (Comment) */}
            {row2.comment && (
              <div className="row">
                <div className="symptom-label"><b>Past Surgical History</b></div>
                <div className="symptom-values"><p>{row2.comment}</p></div>
              </div>
            )}

            {/* Any Other Complaints */}
            {row2.complaints && (
              <div className="row">
                <div className="symptom-label"><b>Any Other Complaints :</b></div>
                <div className="symptom-values"><p>{row2.complaints}</p></div>
              </div>
            )}

            {/* Present Complaints */}
            {row2.presentcomplaints && (
              <div className="row">
                <div className="symptom-label"><b>Present Complaints :</b></div>
                <div className="symptom-values"><p>{row2.presentcomplaints}</p></div>
              </div>
            )}

            {/* Ongoing Medicines */}
            {row2.ongoing_medicines && (
              <div className="row">
                <div className="symptom-label"><b>Ongoing Medicines :</b></div>
                <div className="symptom-values">{row2.ongoing_medicines}</div>
              </div>
            )}

            {/* Previous Investigation */}
            {(() => {
              const checksub = (row2.newInvestigation || "").split(',').map(s => s.trim());
              const commentbox = (row2.newInvestigation_comment || "").split(',').map(s => s.trim());
              const investigations = ['HB', 'BSL-R', 'Bleding Time-BT', 'Clotting Time-BT', 'PT INR', 'HIV', 'Hbsag', 'SR.Creatinine', 'Vit B12', 'HbA1C', 'Thyroid', 'LVEF', 'Glucose Fasting & PP'];
              const filteredInv = investigations.filter(test => checksub.includes(test));
              if (filteredInv.length > 0) {
                return (
                  <div className="row">
                    <div className="symptom-label"><b>Previous Investigation</b></div>
                    <div className="symptom-values">
                      {filteredInv.map((test) => {
                        const index = investigations.indexOf(test);
                        return (
                          <span key={test}>{test} - {commentbox[index] || ""} ,&nbsp;</span>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Investigation Details */}
            {row2.investigation && (
              <div className="row">
                <div className="symptom-label"><b>Investigation Details</b></div>
                <div className="symptom-values"><p>{row2.investigation}</p></div>
              </div>
            )}

            {/* Known Case Of */}
            {row2.knowncaseof && (
              <div className="row">
                <div className="symptom-label"><b>Known Case Of:</b></div>
                <div className="symptom-values"><p>{row2.knowncaseof}</p></div>
              </div>
            )}
          </div>
        ))}

        {/* DIAGNOSIS */}
        {selectedDiagnosisId && (
          <>
            <div className="row">
              <div className="col-md-12">
                <h4 style={{ fontWeight: "bold", fontSize: "20px" }}>DIAGNOSIS</h4>
              </div>
            </div>
            {diagnosisList.map((row3, idx) => (
              <div key={idx} className="record-box">
                <div className="row">
                  <div className="col-md-12">
                    <p className="text-right"><b>Date : </b>{row3.date_diagnosis}</p>
                  </div>
                </div>
                {row3.diagnosis_text && (
                  <div className="row">
                    <div className="symptom-label"><b>Diagnosis: </b></div>
                    <div className="symptom-values"><p>{row3.diagnosis_text}</p></div>
                  </div>
                )}
                {row3.investigation_orders && (
                  <div className="row">
                    <div className="symptom-label"><b>Investigation Orders: </b></div>
                    <div className="symptom-values"><p>{row3.investigation_orders}</p></div>
                  </div>
                )}
                {(row3.advice_types?.length > 0 || row3.diagnosis_comment) && (
                  <div className="row">
                    <div className="symptom-label"><b>Advice Type: </b></div>
                    <div className="symptom-values">
                      <p>
                        {row3.advice_types?.join(' , ')}
                        {row3.advice_types?.length > 0 && row3.diagnosis_comment ? ' , ' : ''}
                        {row3.diagnosis_comment ? `Comment: ${row3.diagnosis_comment}` : ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Medicines Prescribed */}
                {(() => {
                  const checksub = row3.medicines_prescribed || [];
                  const fixed = ['AAC', 'IBS', 'NSAIDS', 'ANTIBIOTICS', 'ANTACID'];
                  const filteredFixed = fixed.filter(m => checksub.includes(m));
                  const other = checksub.filter(m => m && !fixed.includes(m)).join(', ');
                  if (filteredFixed.length > 0 || other) {
                    return (
                      <div className="row">
                        <div className="symptom-label"><b>Medicines Prescribed :</b></div>
                        <div className="symptom-values">
                          {filteredFixed.map((m, i, arr) => (
                            <span key={m}>{m}{i < arr.length - 1 || other ? " , " : ""}</span>
                          ))}
                          {other && <span style={{ width: "100%", float: "left", paddingTop: "5px" }}><b>Any other : </b>{other}</span>}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {row3.advice && (
                  <div className="row">
                    <div className="symptom-label"><b>Plan: </b></div>
                    <div className="symptom-values"><p>{row3.advice}</p></div>
                  </div>
                )}
                {row3.surgical_advice && (
                  <div className="row">
                    <div className="symptom-label"><b> Advice Comment: </b></div>
                    <div className="symptom-values"><p>{row3.surgical_advice}</p></div>
                  </div>
                )}
                {row3.general_comment && (
                  <div className="row">
                    <div className="symptom-label"><b> Comment: </b></div>
                    <div className="symptom-values"><p>{row3.general_comment}</p></div>
                  </div>
                )}
                {row3.category_comment && (
                  <div className="row">
                    <div className="symptom-label"><b>Category Comment: </b></div>
                    <div className="symptom-values"><p>{row3.category_comment}</p></div>
                  </div>
                )}

                {/* Advice */}
                {(() => {
                  const checksub = row3.medical_advice || [];
                  const advice = ['MCDPA', 'UROFLOWMETRY', 'CHT', 'BIOFEEDBACK', 'MANOMETRY', 'COLO', 'GASTRO', 'LAB INVESTIGATION', 'DIET', 'X-RAY', 'CT', 'ULTRASONOGRAPHY', 'ECHO', 'MRI', 'DOPPLER', '3D ENDO ANAL IMAGING', 'BUGSPEAKS'];
                  const filteredAdvice = advice.filter(a => checksub.includes(a));
                  if (filteredAdvice.length > 0) {
                    return (
                      <div className="row">
                        <div className="symptom-label"><b>Advice : </b></div>
                        <div className="symptom-values">{filteredAdvice.join(' , ')}</div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Other */}
                {(() => {
                  const checksub = row3.categories || [];
                  const options = ['Insurance', 'Reimbursement', 'Workshop', 'MCDPA', 'PDC'];
                  const filteredOther = options.filter(o => checksub.includes(o));
                  if (filteredOther.length > 0) {
                    return (
                      <div className="row">
                        <div className="symptom-label"><b>Other : </b></div>
                        <div className="symptom-values">{filteredOther.join(' , ')}</div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ))}
          </>
        )}

        {/* BLANK SECTION (FOR PRINTING) */}
        <div style={{ padding: "10px 5px", border: "1px solid #d7d7d7" }}>
          <div className="row">
            <div className="col-md-12">
              <p className="text-right"><b>Date : </b>{currentDate}</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12" style={{ fontSize: "14px" }}><b>Diagnosis Details: </b></div>
            <div className="col-md-12">
              <p style={{ border: "1px solid #d7d7d7", height: "20px", margin: "0px" }}></p>
              <p style={{ border: "1px solid #d7d7d7", height: "20px", borderTop: "0px", margin: "0px" }}></p>
              <p style={{ border: "1px solid #d7d7d7", height: "20px", borderTop: "0px" }}></p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12" style={{ fontSize: "14px" }}><b>Plan: </b></div>
            <div className="col-md-12">
              <p style={{ border: "1px solid #d7d7d7", height: "20px", margin: "0px" }}></p>
              <p style={{ border: "1px solid #d7d7d7", height: "20px", borderTop: "0px", margin: "0px" }}></p>
              <p style={{ border: "1px solid #d7d7d7", height: "20px", borderTop: "0px" }}></p>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="col-md-12">
              <table className="blank-section-table" style={{ width: "100%" }}>
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
              <table className="blank-section-table" style={{ width: "100%" }}>
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
              <table className="blank-section-table" style={{ width: "100%" }}>
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
              <table className="blank-section-table" style={{ width: "100%" }}>
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
              <table className="blank-section-table" style={{ width: "100%" }}>
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
              <table className="blank-section-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <td style={{ width: "40%" }}>Next FU : </td>
                    <td style={{ width: "60%" }}>Post Operative FU :1wk / 3wk / 6wk</td>
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
});

export default DiagnosisPrintView;


