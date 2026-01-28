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

import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css'; // Importing your shared CSS

const BloodTransfusionRecordForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    routeLocation: '',
    routeOk: '',
    cannulaGauge: '',
    gaugeOk: '',
    nsText: '',
    nsOk: '',
    bloodTemp: { room: false, cold: false, ok: '' },
    bagContains: { whole: false, pcv: false, ffp: false, ok: '' },
    orderedHrs: '',
    orderedMin: '',
    orderedOk: '',
    dripRate: '',
    dripOk: '',
    preMedOrdered: '',
    preMedStatus: '',
    preMedOk: '',
    bloodBagNo: '',
    bloodBagOk: '',
    btLocation: '',
    btLocationOk: '',
    btStartTime: '',
    btEndTime: '',
    monitoring: [{ time: '', bp: '', pulse: '', rr: '', temp: '', drip: '', uo: '' }]
  });

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const setNested = (section, key, value) =>
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));

  const yesNo = (name, value, setter) => (
    <div className="radio-group">
      <label className={`radio-option ${value === 'yes' ? 'selected' : ''}`}>
        <input type="radio" checked={value === 'yes'} onChange={() => setter('yes')} /> Y
      </label>
      <label className={`radio-option ${value === 'no' ? 'selected' : ''}`}>
        <input type="radio" checked={value === 'no'} onChange={() => setter('no')} /> N
      </label>
    </div>
  );

  const handleMonitoringChange = (i, field, value) => {
    const updated = [...formData.monitoring];
    updated[i][field] = value;
    setFormData(prev => ({ ...prev, monitoring: updated }));
  };

  const addMonitoringRow = () => {
    setFormData(prev => ({
      ...prev,
      monitoring: [...prev.monitoring, { time: '', bp: '', pulse: '', rr: '', temp: '', drip: '', uo: '' }]
    }));
  };

  const removeMonitoringRow = (i) => {
    if (formData.monitoring.length > 1) {
      setFormData(prev => ({
        ...prev,
        monitoring: prev.monitoring.filter((_, idx) => idx !== i)
      }));
    }
  };

  return (
    <div className="medical-form-container">
      <form onSubmit={e => { e.preventDefault(); onSubmit && onSubmit(formData); }}>
        <h2 className="form-title">BLOOD TRANSFUSION RECORD & MONITORING</h2>

        {/* Patient Header */}
        {patientData && (
          <div className="patient-compact-header">
            <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{patientData.uhid}</span></div>
            <div className="info-item"><span className="info-label">Name</span><span className="info-value">{patientData.name}</span></div>
            <div className="info-item"><span className="info-label">Age/Sex</span><span className="info-value">{patientData.age}/{patientData.gender}</span></div>
            <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{patientData.ipNo}</span></div>
          </div>
        )}

        <div className="section-box">
          <div className="form-section-title">Nurse’s Pre-Transfusion Checklist</div>
          <table className="medical-table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Check Point</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Entry / Requirement</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>OK / NO</th>
              </tr>
            </thead>
            <tbody>
              {/* Route / Location */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Route / Location</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <input 
                    className="form-control" 
                    value={formData.routeLocation} 
                    onChange={e => set('routeLocation', e.target.value)} 
                    placeholder="Enter location"
                  />
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('routeOk', formData.routeOk, v => set('routeOk', v))}
                </td>
              </tr>

              {/* Cannula Gauge */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Cannula with BT set</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="info-label">Gauge no.</span>
                    <input 
                      className="form-control" 
                      style={{ width: '80px' }} 
                      value={formData.cannulaGauge} 
                      onChange={e => set('cannulaGauge', e.target.value)} 
                    />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('gaugeOk', formData.gaugeOk, v => set('gaugeOk', v))}
                </td>
              </tr>

              {/* NS 0.9% */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>NS 0.9% available on IV stand</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <input 
                    className="form-control" 
                    value={formData.nsText} 
                    onChange={e => set('nsText', e.target.value)} 
                  />
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('nsOk', formData.nsOk, v => set('nsOk', v))}
                </td>
              </tr>

              {/* Blood Temp */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Blood bag temperature</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div className="checkbox-group">
                    <label className={`checkbox-option ${formData.bloodTemp.room ? 'selected' : ''}`}>
                      <input type="checkbox" checked={formData.bloodTemp.room} onChange={e => setNested('bloodTemp', 'room', e.target.checked)} /> Room Temp
                    </label>
                    <label className={`checkbox-option ${formData.bloodTemp.cold ? 'selected' : ''}`}>
                      <input type="checkbox" checked={formData.bloodTemp.cold} onChange={e => setNested('bloodTemp', 'cold', e.target.checked)} /> Cold
                    </label>
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('bloodTempOk', formData.bloodTemp.ok, v => setNested('bloodTemp', 'ok', v))}
                </td>
              </tr>

              {/* Bag Contains */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Bag contains</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div className="checkbox-group">
                    {['whole', 'pcv', 'ffp'].map(type => (
                      <label key={type} className={`checkbox-option ${formData.bagContains[type] ? 'selected' : ''}`}>
                        <input type="checkbox" checked={formData.bagContains[type]} onChange={e => setNested('bagContains', type, e.target.checked)} /> 
                        {type.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('bagContainsOk', formData.bagContains.ok, v => setNested('bagContains', 'ok', v))}
                </td>
              </tr>

              {/* Ordered Time */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Transfusion ordered time</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="info-label">Hrs</span>
                    <input className="form-control" style={{ width: '60px' }} value={formData.orderedHrs} onChange={e => set('orderedHrs', e.target.value)} />
                    <span className="info-label">Min</span>
                    <input className="form-control" style={{ width: '60px' }} value={formData.orderedMin} onChange={e => set('orderedMin', e.target.value)} />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('orderedOk', formData.orderedOk, v => set('orderedOk', v))}
                </td>
              </tr>

              {/* Drip Rate */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Drip rate as ordered</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input className="form-control" style={{ width: '80px' }} value={formData.dripRate} onChange={e => set('dripRate', e.target.value)} />
                    <span className="info-label">Drops/min</span>
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('dripOk', formData.dripOk, v => set('dripOk', v))}
                </td>
              </tr>

              {/* Pre-medication */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Pre-medication ordered</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {yesNo('preMedOrdered', formData.preMedOrdered, v => set('preMedOrdered', v))}
                    <div className="radio-group">
                      <label className={`radio-option ${formData.preMedStatus === 'ready' ? 'selected' : ''}`}>
                        <input type="radio" checked={formData.preMedStatus === 'ready'} onChange={() => set('preMedStatus', 'ready')} /> Ready
                      </label>
                      <label className={`radio-option ${formData.preMedStatus === 'given' ? 'selected' : ''}`}>
                        <input type="radio" checked={formData.preMedStatus === 'given'} onChange={() => set('preMedStatus', 'given')} /> Given
                      </label>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('preMedOk', formData.preMedOk, v => set('preMedOk', v))}
                </td>
              </tr>

              {/* Blood Bag No */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Blood bag no.</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <input className="form-control" value={formData.bloodBagNo} onChange={e => set('bloodBagNo', e.target.value)} />
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('bloodBagOk', formData.bloodBagOk, v => set('bloodBagOk', v))}
                </td>
              </tr>

              {/* Location Started */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Location BT started</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div className="radio-group">
                    <label className={`radio-option ${formData.btLocation === 'OT' ? 'selected' : ''}`}>
                      <input type="radio" checked={formData.btLocation === 'OT'} onChange={() => set('btLocation', 'OT')} /> OT
                    </label>
                    <label className={`radio-option ${formData.btLocation === 'Ward' ? 'selected' : ''}`}>
                      <input type="radio" checked={formData.btLocation === 'Ward'} onChange={() => set('btLocation', 'Ward')} /> Ward
                    </label>
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  {yesNo('btLocationOk', formData.btLocationOk, v => set('btLocationOk', v))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section-box">
          <div className="form-section-title">BT Monitoring Chart</div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ minWidth: '800px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr 1fr 1fr 1fr 1fr 1fr 50px',
                padding: '10px',
                background: '#f1f5f9',
                fontWeight: '700',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>Time</div><div>BP</div><div>Pulse</div><div>RR</div><div>Temp</div><div>Drip</div><div>U/O</div><div></div>
              </div>
              {formData.monitoring.map((row, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 1fr 1fr 1fr 1fr 1fr 50px',
                  padding: '5px 10px',
                  borderBottom: '1px solid #f1f5f9',
                  alignItems: 'center'
                }}>
                  <MuiDateTimePicker hideLabel type="time" value={row.time} onChange={e => handleMonitoringChange(i, 'time', e.target.value)} />
                  <input className="form-control" value={row.bp} onChange={e => handleMonitoringChange(i, 'bp', e.target.value)} />
                  <input className="form-control" value={row.pulse} onChange={e => handleMonitoringChange(i, 'pulse', e.target.value)} />
                  <input className="form-control" value={row.rr} onChange={e => handleMonitoringChange(i, 'rr', e.target.value)} />
                  <input className="form-control" value={row.temp} onChange={e => handleMonitoringChange(i, 'temp', e.target.value)} />
                  <input className="form-control" value={row.drip} onChange={e => handleMonitoringChange(i, 'drip', e.target.value)} />
                  <input className="form-control" value={row.uo} onChange={e => handleMonitoringChange(i, 'uo', e.target.value)} />
                  <button type="button" className="secondary-btn" style={{ padding: '2px', color: 'var(--error-color)' }} onClick={() => removeMonitoringRow(i)}>×</button>
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="secondary-btn" style={{ marginTop: '10px' }} onClick={addMonitoringRow}>
            + Add Vital Entry
          </button>
        </div>

        <button type="submit" className="submit-btn">Submit Record</button>
      </form>
    </div>
  );
};

export default BloodTransfusionRecordForm;
