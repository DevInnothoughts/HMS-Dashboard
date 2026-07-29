// import React, { useState } from 'react';
// import TextInput from '../inputs/TextInput';
// import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

// const BloodTransfusionRecordForm = ({ onSubmit, patientData }) => {
//   const [formData, setFormData] = useState({
//     routeLocation: '',
//     routeOk: '',

//     cannulaGauge: '',
//     gaugeOk: '',

//     nsText: '',
//     nsOk: '',

//     bloodTemp: { room: false, cold: false, ok: '' },
//     bagContains: { whole: false, pcv: false, ffp: false, ok: '' },

//     orderedHrs: '',
//     orderedMin: '',
//     orderedOk: '',

//     dripRate: '',
//     dripOk: '',

//     preMedOrdered: '',
//     preMedStatus: '',
//     preMedOk: '',

//     bloodBagNo: '',
//     bloodBagOk: '',

//     btLocation: '',
//     btLocationOk: '',

//     btStartTime: '',
//     btEndTime: '',

//     monitoring: [
//       { time: '', bp: '', pulse: '', rr: '', temp: '', drip: '', uo: '' }
//     ]
//   });

//   const set = (key, value) =>
//     setFormData(prev => ({ ...prev, [key]: value }));

//   const setNested = (section, key, value) =>
//     setFormData(prev => ({
//       ...prev,
//       [section]: { ...prev[section], [key]: value }
//     }));

//   const yesNo = (name, value, setter) => (
//     <>
//       <label>
//         <input
//           type="radio"
//           name={name}
//           checked={value === 'yes'}
//           onChange={() => setter('yes')}
//         /> Yes
//       </label>
//       <label style={{ marginLeft: 10 }}>
//         <input
//           type="radio"
//           name={name}
//           checked={value === 'no'}
//           onChange={() => setter('no')}
//         /> No
//       </label>
//     </>
//   );

//   /* ===== Monitoring logic (UNCHANGED) ===== */

//   const handleMonitoringChange = (i, field, value) => {
//     const updated = [...formData.monitoring];
//     updated[i][field] = value;
//     setFormData(prev => ({ ...prev, monitoring: updated }));
//   };

//   const addMonitoringRow = () => {
//     setFormData(prev => ({
//       ...prev,
//       monitoring: [
//         ...prev.monitoring,
//         { time: '', bp: '', pulse: '', rr: '', temp: '', drip: '', uo: '' }
//       ]
//     }));
//   };

//   const removeMonitoringRow = (i) => {
//     if (formData.monitoring.length > 1) {
//       setFormData(prev => ({
//         ...prev,
//         monitoring: prev.monitoring.filter((_, idx) => idx !== i)
//       }));
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit && onSubmit({ ...formData, patientHeader: patientData });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="medical-form compact-form">

//       <h2 className="form-title" style={{ textAlign: 'center' }}>
//         BLOOD TRANSFUSION RECORD & MONITORING
//       </h2>

//       {/* Patient Header */}
//       {patientData && (
//         <div className="patient-compact-header">
//           <div>UHID: {patientData.uhid}</div>
//           <div>Name: {patientData.name}</div>
//           <div>Age: {patientData.age}</div>
//           <div>Gender: {patientData.gender}</div>
//           <div>IP No: {patientData.ipNo}</div>
//         </div>
//       )}

//       {/* ================= NURSE’S PART (TABLE) ================= */}
//       <h3>Nurse’s Part</h3>

//       <table className="medical-table">
//         <thead>
//           <tr>
//             <th>Check point</th>
//             <th>Requirement / compliance</th>
//             <th>OK / NO</th>
//           </tr>
//         </thead>
//         <tbody>

//           <tr>
//             <td>Route / Location</td>
//             <td><input value={formData.routeLocation} onChange={e => set('routeLocation', e.target.value)} /></td>
//             <td>{yesNo('routeOk', formData.routeOk, v => set('routeOk', v))}</td>
//           </tr>

//           <tr>
//             <td>Cannula with BT set</td>
//             <td>Gauge no. <input style={{ width: 80 }} value={formData.cannulaGauge} onChange={e => set('cannulaGauge', e.target.value)} /></td>
//             <td>{yesNo('gaugeOk', formData.gaugeOk, v => set('gaugeOk', v))}</td>
//           </tr>

//           <tr>
//             <td>NS 0.9% available on IV stand</td>
//             <td><input value={formData.nsText} onChange={e => set('nsText', e.target.value)} /></td>
//             <td>{yesNo('nsOk', formData.nsOk, v => set('nsOk', v))}</td>
//           </tr>

//           <tr>
//             <td>Blood bag temperature</td>
//             <td>
//               <label><input type="checkbox" onChange={e => setNested('bloodTemp', 'room', e.target.checked)} /> Room Temp</label>
//               <label style={{ marginLeft: 10 }}><input type="checkbox" onChange={e => setNested('bloodTemp', 'cold', e.target.checked)} /> Cold</label>
//             </td>
//             <td>{yesNo('bloodTempOk', formData.bloodTemp.ok, v => setNested('bloodTemp', 'ok', v))}</td>
//           </tr>

//           <tr>
//             <td>Bag contains</td>
//             <td>
//               <label><input type="checkbox" onChange={e => setNested('bagContains', 'whole', e.target.checked)} /> Whole blood</label>
//               <label><input type="checkbox" onChange={e => setNested('bagContains', 'pcv', e.target.checked)} /> PCV</label>
//               <label><input type="checkbox" onChange={e => setNested('bagContains', 'ffp', e.target.checked)} /> FFP</label>
//             </td>
//             <td>{yesNo('bagContainsOk', formData.bagContains.ok, v => setNested('bagContains', 'ok', v))}</td>
//           </tr>

//           <tr>
//             <td>Transfusion ordered time</td>
//             <td>
//               Hrs <input style={{ width: 50 }} value={formData.orderedHrs} onChange={e => set('orderedHrs', e.target.value)} />
//               Min <input style={{ width: 50 }} value={formData.orderedMin} onChange={e => set('orderedMin', e.target.value)} />
//             </td>
//             <td>{yesNo('orderedOk', formData.orderedOk, v => set('orderedOk', v))}</td>
//           </tr>

//           <tr>
//             <td>Drip rate as ordered</td>
//             <td>Drops/min <input style={{ width: 80 }} value={formData.dripRate} onChange={e => set('dripRate', e.target.value)} /></td>
//             <td>{yesNo('dripOk', formData.dripOk, v => set('dripOk', v))}</td>
//           </tr>

//           <tr>
//             <td>Pre-medication ordered</td>
//             <td>
//               {yesNo('preMedOrdered', formData.preMedOrdered, v => set('preMedOrdered', v))}
//               <br />
//               <label><input type="radio" name="preMedStatus" onChange={() => set('preMedStatus', 'ready')} /> Ready</label>
//               <label><input type="radio" name="preMedStatus" onChange={() => set('preMedStatus', 'given')} /> Given</label>
//             </td>
//             <td>{yesNo('preMedOk', formData.preMedOk, v => set('preMedOk', v))}</td>
//           </tr>

//           <tr>
//             <td>Blood bag no.</td>
//             <td><input value={formData.bloodBagNo} onChange={e => set('bloodBagNo', e.target.value)} /></td>
//             <td>{yesNo('bloodBagOk', formData.bloodBagOk, v => set('bloodBagOk', v))}</td>
//           </tr>

//           <tr>
//             <td>Location BT started</td>
//             <td>
//               <label><input type="radio" name="btLoc" onChange={() => set('btLocation', 'OT')} /> OT</label>
//               <label><input type="radio" name="btLoc" onChange={() => set('btLocation', 'Ward')} /> Ward</label>
//             </td>
//             <td>{yesNo('btLocationOk', formData.btLocationOk, v => set('btLocationOk', v))}</td>
//           </tr>

//         </tbody>
//       </table>

//       {/* ================= BT MONITORING CHART (UNCHANGED) ================= */}
//       <hr style={{ margin: '30px 0' }} />

//       <h3>BT Monitoring Chart</h3>

//       <div style={{ overflowX: 'auto', border: '1px solid #80deea', borderRadius: '8px' }}>
//         <div style={{ minWidth: '800px' }}>
//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: '120px 1fr 1fr 1fr 1fr 1fr 1fr 50px',
//             padding: '10px',
//             background: '#e0f7fa',
//             fontWeight: 'bold'
//           }}>
//             <div>Time</div><div>BP</div><div>Pulse</div><div>RR</div>
//             <div>Temp</div><div>Drip</div><div>U/O</div><div></div>
//           </div>

//           {formData.monitoring.map((row, i) => (
//             <div key={i} style={{
//               display: 'grid',
//               gridTemplateColumns: '120px 1fr 1fr 1fr 1fr 1fr 1fr 50px',
//               padding: '8px'
//             }}>
//               <MuiDateTimePicker hideLabel type="time" value={row.time} onChange={e => handleMonitoringChange(i, 'time', e.target.value)} />
//               <TextInput hideLabel value={row.bp} onChange={e => handleMonitoringChange(i, 'bp', e.target.value)} />
//               <TextInput hideLabel value={row.pulse} onChange={e => handleMonitoringChange(i, 'pulse', e.target.value)} />
//               <TextInput hideLabel value={row.rr} onChange={e => handleMonitoringChange(i, 'rr', e.target.value)} />
//               <TextInput hideLabel value={row.temp} onChange={e => handleMonitoringChange(i, 'temp', e.target.value)} />
//               <TextInput hideLabel value={row.drip} onChange={e => handleMonitoringChange(i, 'drip', e.target.value)} />
//               <TextInput hideLabel value={row.uo} onChange={e => handleMonitoringChange(i, 'uo', e.target.value)} />
//               {formData.monitoring.length > 1 && (
//                 <button type="button" onClick={() => removeMonitoringRow(i)}>×</button>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       <button type="button" onClick={addMonitoringRow} style={{ marginTop: 10 }}>
//         + Add Monitoring Entry
//       </button>

//       <button type="submit" className="submit-btn" style={{ marginTop: 20 }}>
//         Submit Blood Transfusion Record
//       </button>

//     </form>
//   );
// };

// export default BloodTransfusionRecordForm;

import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import "./Forms.css"; // Importing your shared CSS
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const BloodTransfusionRecordForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    routeLocation: "",
    routeOk: "",
    cannulaGauge: "",
    gaugeOk: "",
    nsText: "",
    nsOk: "",
    bloodTemp: { room: false, cold: false, ok: "" },
    bagContains: { whole: false, pcv: false, ffp: false, ok: "" },
    orderedHrs: "",
    orderedMin: "",
    orderedOk: "",
    dripRate: "",
    dripOk: "",
    preMedOrdered: "",
    preMedStatus: "",
    preMedOk: "",
    bloodBagNo: "",
    bloodBagOk: "",
    btLocation: "",
    btLocationOk: "",
    btStartTime: "",
    btEndTime: "",
    monitoring: [
      { time: "", bp: "", pulse: "", rr: "", temp: "", drip: "", uo: "" },
    ],
  });

  const set = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));
  const setNested = (section, key, value) =>
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));

  const yesNo = (name, value, setter) => (
    <div className="radio-group">
      <label className={`radio-option ${value === "yes" ? "selected" : ""}`}>
        <input
          type="radio"
          checked={value === "yes"}
          onChange={() => setter("yes")}
        />{" "}
        Y
      </label>
      <label className={`radio-option ${value === "no" ? "selected" : ""}`}>
        <input
          type="radio"
          checked={value === "no"}
          onChange={() => setter("no")}
        />{" "}
        N
      </label>
    </div>
  );

  const handleMonitoringChange = (i, field, value) => {
    const updated = [...formData.monitoring];
    updated[i][field] = value;
    setFormData((prev) => ({ ...prev, monitoring: updated }));
  };

  const addMonitoringRow = () => {
    setFormData((prev) => ({
      ...prev,
      monitoring: [
        ...prev.monitoring,
        { time: "", bp: "", pulse: "", rr: "", temp: "", drip: "", uo: "" },
      ],
    }));
  };

  const removeMonitoringRow = (i) => {
    if (formData.monitoring.length > 1) {
      setFormData((prev) => ({
        ...prev,
        monitoring: prev.monitoring.filter((_, idx) => idx !== i),
      }));
    }
  };

  // print form format starts
  const generatePrintContent = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>BLOOD TRANSFUSION RECORD & MONITORING FORM </title>
          <style>
              @page { margin: 5mm; }
              body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #333; }
              .outer-border { border: 3px solid #00a99d; padding: 5px 25px; display: flex; flex-direction: column; min-height: 95vh; position: relative; }
              
              /* Header Styling - Matching your ADR form exactly */
              .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
              .logo-img { height: 65px; width: auto; margin-top:10px; }           
              .patient-info-block { position: absolute; right: 25px; color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
              .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
               .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 30px 0; }
              /* Typography */
              .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; height: 1.1em; }
             .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px; }
              .instruction-box { font-size: 9.5px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-style: italic; color: #666; line-height: 1.2; }
              
              .section-text { margin: 5px 0 0; text-align: justify; font-size: 13.5px; line-height: 1.6; }
              .fill-line { border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 0 5px; font-weight: bold; font-style: italic; }
  
              /* Checkbox Grid - To match your image layout */
              .cb-grid { display: flex; flex-wrap: wrap; gap: 15px; margin: 10px 0; font-weight: bold; font-size: 12px; }
              .cb-item { display: flex; align-items: center; }
              .box { width: 14px; height: 14px; border: 1px solid #000; margin-right: 6px; position: relative; background: #fff; }
              .checked::after { content: '✓'; position: absolute; top: -5px; left: 1px; font-size: 15px; color: #000; font-weight: bold; }
  
              /* Medical Table - Recreating the Benefits/Risks structure */
              .medical-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
              .medical-table th, .medical-table td { border: 1px solid #000; padding: 8px; vertical-align: top; text-align: left; }
              .medical-table th { background: #f2f2f2; font-weight: bold; }
              .bullet-list { margin: 0; padding-left: 18px; }
              .bullet-list li { margin-bottom: 4px; font-weight:normal; }
  .page-break { page-break-before: always; clear: both; display: block; height: 0; }
              /* Signature Blocks */
              .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px; }
              .sig-item {  padding: 5px 0 5px 0; font-size: 12px; font-weight: bold; }
              .attendant-section {padding-top: 10px; }
              @media print { .no-print { display: none; } }
              
          </style>
      </head>
      <body>
          <div class="page-container">
          <div class="form-type">Form 18 - Front</div>
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
  
                  <div class="main-title">BLOOD TRANSFUSION RECORD & MONITORING FORM </div>
  
                  <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                    <tr>
                      <td style="width:38%; vertical-align:top; padding-right:10px;">
                        <div style="
                          border:3px solid #999;
                          border-radius:30px;
                          height:520px;
                        "></div>

                        <div style="margin-top:10px; font-size:11px;">
                          <strong>RMO</strong> to check all above and sign with date and time to endorse it.
                        </div>
                      </td>
                    <td style="width:62%; vertical-align:top;">

                      <div style="font-size:11px; line-height:1.4;">
                        <div><strong>BT ordered By Dr :</strong></div>
                        <div>Planned / Emergency transfusion</div>
                        <div><strong>Indications :</strong></div>
                        <div><strong>Blood bag No / Unit No :</strong></div>
                        <div><strong>BT history :</strong></div>
                      </div>

                    <table class="medical-table" style="margin-top:8px;">
                      <thead>
                        <tr>
                          <th>Check point</th>
                          <th>Requirement</th>
                          <th>Ok<br>Y / N</th>
                        </tr>
                      </thead>

                    <tbody>
                      <tr>
                        <td>Ordered</td>
                        <td>Whole blood / PCV / FFP</td>
                        <td></td>
                      </tr>

                    <tr>
                      <td>Bag contains</td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td rowspan="2">Blood group</td>
                      <td>Lab report &nbsp;&nbsp; Gr ___ &nbsp;&nbsp; Rh ___</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Bag &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Gr ___ &nbsp;&nbsp; Rh ___</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>DO collection</td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>DO expiry</td>
                      <td>Date not expired</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>DO issue</td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Name of patient on bag</td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Name as identified</td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Sero status</td>
                      <td>HIV, HBsAg, VDRL, HCV, MP &nbsp;&nbsp; -ve</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td rowspan="3">Visual inspection of bag</td>
                      <td>Clotting</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Bubbling</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Leakage</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>BT consent</td>
                      <td>Taken / Not taken</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Patient educated on BTR symptoms</td>
                      <td>Done / Not Done</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Pre medication</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

              <div style="margin-top:8px; font-size:11px; font-weight:bold;">
                I, (RMO) have checked all above details and BT may be started.
              </div>

            </td>
          </tr>
        </table>
        </div>
              
          <div class="page-break"></div>
  
          <div class="page-container">
              <div class="form-type">Form 18 - Back</div>
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
  
                  <div class="main-title">BLOOD TRANSFUSION RECORD & MONITORING FORM</div>
  
                  <table class="medical-table">
                    <tr>
                      <th>Check point</th>
                      <th>Requirement / compliance</th>
                      <th>Ok / NO</th>
                    </tr>

                    <tr>
                      <td>Route / Location</td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Cannula with BT set with gauge</td>
                      <td>Gauge no:</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>NS 0.9 Available and ready on IV stand</td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Blood bag temperature</td>
                      <td>Room Temp / Cold /</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Bag contains</td>
                      <td>Whole Blood / PCV / FFP /</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Transfusion ordered time</td>
                      <td>Hrs &nbsp; Min</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Drip rate as ordered</td>
                      <td>Drops / minute</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Pre-medication ordered Yes / No</td>
                      <td>Ready / Given</td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Blood bag no.</td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td>Location BT where started. OT / Ward</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </table>

                <div class="" style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <span><strong>BT Start time:</strong></span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    <span><strong>BT end time:</strong></span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                </div>

                <p>
                If patient has any adverse symptoms (Nausea, shivering, fever, rash, palpitation, dyspnoea, etc.)
                immediately stop BT & inform doctor.
                </p>

                <div style="text-align:center; font-weight:bold; margin-bottom: 10px;">BT Monitoring chart</div>

                <table class="medical-table">
                  <tr>
                    <th>Time</th>
                    <th class="vertical-text">Before starting BT</th>
                    <th></th><th></th><th></th><th></th><th></th>
                    <th></th><th></th><th></th><th></th>
                  </tr>

                  <tr><td>BP</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  <tr><td>Pulse</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  <tr><td>RR</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  <tr><td>Temp</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  <tr><td>Drip rate</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  <tr><td>U/O</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                </table>

              </div>
              </div>
          </div>
  
          <div class="no-print" style="text-align:center; margin: 20px 0;">
              <button onclick="window.print()" style="padding: 10px 30px; background:#008080; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Confirm Print</button>
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
    <div className="medical-form-container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit && onSubmit(formData);
        }}
      >
        <h2 className="form-title">BLOOD TRANSFUSION RECORD & MONITORING</h2>

        {/* Patient Header */}
        {patientData && (
          <div className="patient-compact-header">
            <div className="info-item">
              <span className="info-label">UHID</span>
              <span className="info-value">{patientData.uhid}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{patientData.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Age/Sex</span>
              <span className="info-value">
                {patientData.age}/{patientData.gender}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">IP No</span>
              <span className="info-value">{patientData.ipNo}</span>
            </div>
          </div>
        )}

        <div className="section-box">
          <div className="form-section-title">
            Nurse’s Pre-Transfusion Checklist
          </div>
          <table
            className="medical-table"
            style={{ width: "100%", fontSize: "12px" }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #e2e8f0",
                    textAlign: "left",
                  }}
                >
                  Check Point
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #e2e8f0",
                    textAlign: "left",
                  }}
                >
                  Entry / Requirement
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  OK / NO
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Route / Location */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  Route / Location
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <input
                    className="form-control"
                    value={formData.routeLocation}
                    onChange={(e) => set("routeLocation", e.target.value)}
                    placeholder="Enter location"
                  />
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("routeOk", formData.routeOk, (v) => set("routeOk", v))}
                </td>
              </tr>

              {/* Cannula Gauge */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  Cannula with BT set
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span className="info-label">Gauge no.</span>
                    <input
                      className="form-control"
                      style={{ width: "80px" }}
                      value={formData.cannulaGauge}
                      onChange={(e) => set("cannulaGauge", e.target.value)}
                    />
                  </div>
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("gaugeOk", formData.gaugeOk, (v) => set("gaugeOk", v))}
                </td>
              </tr>

              {/* NS 0.9% */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  NS 0.9% available on IV stand
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <input
                    className="form-control"
                    value={formData.nsText}
                    onChange={(e) => set("nsText", e.target.value)}
                  />
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("nsOk", formData.nsOk, (v) => set("nsOk", v))}
                </td>
              </tr>

              {/* Blood Temp */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  Blood bag temperature
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <div className="checkbox-group">
                    <label
                      className={`checkbox-option ${formData.bloodTemp.room ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.bloodTemp.room}
                        onChange={(e) =>
                          setNested("bloodTemp", "room", e.target.checked)
                        }
                      />{" "}
                      Room Temp
                    </label>
                    <label
                      className={`checkbox-option ${formData.bloodTemp.cold ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.bloodTemp.cold}
                        onChange={(e) =>
                          setNested("bloodTemp", "cold", e.target.checked)
                        }
                      />{" "}
                      Cold
                    </label>
                  </div>
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("bloodTempOk", formData.bloodTemp.ok, (v) =>
                    setNested("bloodTemp", "ok", v),
                  )}
                </td>
              </tr>

              {/* Bag Contains */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  Bag contains
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <div className="checkbox-group">
                    {["whole", "pcv", "ffp"].map((type) => (
                      <label
                        key={type}
                        className={`checkbox-option ${formData.bagContains[type] ? "selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.bagContains[type]}
                          onChange={(e) =>
                            setNested("bagContains", type, e.target.checked)
                          }
                        />
                        {type.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("bagContainsOk", formData.bagContains.ok, (v) =>
                    setNested("bagContains", "ok", v),
                  )}
                </td>
              </tr>

              {/* Ordered Time */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  Transfusion ordered time
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <span className="info-label">Hrs</span>
                    <input
                      className="form-control"
                      style={{ width: "60px" }}
                      value={formData.orderedHrs}
                      onChange={(e) => set("orderedHrs", e.target.value)}
                    />
                    <span className="info-label">Min</span>
                    <input
                      className="form-control"
                      style={{ width: "60px" }}
                      value={formData.orderedMin}
                      onChange={(e) => set("orderedMin", e.target.value)}
                    />
                  </div>
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("orderedOk", formData.orderedOk, (v) =>
                    set("orderedOk", v),
                  )}
                </td>
              </tr>

              {/* Drip Rate */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  Drip rate as ordered
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      className="form-control"
                      style={{ width: "80px" }}
                      value={formData.dripRate}
                      onChange={(e) => set("dripRate", e.target.value)}
                    />
                    <span className="info-label">Drops/min</span>
                  </div>
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("dripOk", formData.dripOk, (v) => set("dripOk", v))}
                </td>
              </tr>

              {/* Pre-medication */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  Pre-medication ordered
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {yesNo("preMedOrdered", formData.preMedOrdered, (v) =>
                      set("preMedOrdered", v),
                    )}
                    <div className="radio-group">
                      <label
                        className={`radio-option ${formData.preMedStatus === "ready" ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          checked={formData.preMedStatus === "ready"}
                          onChange={() => set("preMedStatus", "ready")}
                        />{" "}
                        Ready
                      </label>
                      <label
                        className={`radio-option ${formData.preMedStatus === "given" ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          checked={formData.preMedStatus === "given"}
                          onChange={() => set("preMedStatus", "given")}
                        />{" "}
                        Given
                      </label>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("preMedOk", formData.preMedOk, (v) =>
                    set("preMedOk", v),
                  )}
                </td>
              </tr>

              {/* Blood Bag No */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  Blood bag no.
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <input
                    className="form-control"
                    value={formData.bloodBagNo}
                    onChange={(e) => set("bloodBagNo", e.target.value)}
                  />
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("bloodBagOk", formData.bloodBagOk, (v) =>
                    set("bloodBagOk", v),
                  )}
                </td>
              </tr>

              {/* Location Started */}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  Location BT started
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  <div className="radio-group">
                    <label
                      className={`radio-option ${formData.btLocation === "OT" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        checked={formData.btLocation === "OT"}
                        onChange={() => set("btLocation", "OT")}
                      />{" "}
                      OT
                    </label>
                    <label
                      className={`radio-option ${formData.btLocation === "Ward" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        checked={formData.btLocation === "Ward"}
                        onChange={() => set("btLocation", "Ward")}
                      />{" "}
                      Ward
                    </label>
                  </div>
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  {yesNo("btLocationOk", formData.btLocationOk, (v) =>
                    set("btLocationOk", v),
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section-box">
          <div className="form-section-title">BT Monitoring Chart</div>
          <div
            style={{
              overflowX: "auto",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
            }}
          >
            <div style={{ minWidth: "800px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr 1fr 1fr 1fr 1fr 1fr 50px",
                  padding: "10px",
                  background: "#f1f5f9",
                  fontWeight: "700",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <div>Time</div>
                <div>BP</div>
                <div>Pulse</div>
                <div>RR</div>
                <div>Temp</div>
                <div>Drip</div>
                <div>U/O</div>
                <div></div>
              </div>
              {formData.monitoring.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr 1fr 1fr 1fr 1fr 1fr 50px",
                    padding: "5px 10px",
                    borderBottom: "1px solid #f1f5f9",
                    alignItems: "center",
                  }}
                >
                  <MuiDateTimePicker
                    hideLabel
                    type="time"
                    value={row.time}
                    onChange={(e) =>
                      handleMonitoringChange(i, "time", e.target.value)
                    }
                  />
                  <input
                    className="form-control"
                    value={row.bp}
                    onChange={(e) =>
                      handleMonitoringChange(i, "bp", e.target.value)
                    }
                  />
                  <input
                    className="form-control"
                    value={row.pulse}
                    onChange={(e) =>
                      handleMonitoringChange(i, "pulse", e.target.value)
                    }
                  />
                  <input
                    className="form-control"
                    value={row.rr}
                    onChange={(e) =>
                      handleMonitoringChange(i, "rr", e.target.value)
                    }
                  />
                  <input
                    className="form-control"
                    value={row.temp}
                    onChange={(e) =>
                      handleMonitoringChange(i, "temp", e.target.value)
                    }
                  />
                  <input
                    className="form-control"
                    value={row.drip}
                    onChange={(e) =>
                      handleMonitoringChange(i, "drip", e.target.value)
                    }
                  />
                  <input
                    className="form-control"
                    value={row.uo}
                    onChange={(e) =>
                      handleMonitoringChange(i, "uo", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ padding: "2px", color: "var(--error-color)" }}
                    onClick={() => removeMonitoringRow(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="secondary-btn"
            style={{ marginTop: "10px" }}
            onClick={addMonitoringRow}
          >
            + Add Vital Entry
          </button>
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Submit Record
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
            <span>🖨️</span> Print Anesthesia Consent Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default BloodTransfusionRecordForm;
