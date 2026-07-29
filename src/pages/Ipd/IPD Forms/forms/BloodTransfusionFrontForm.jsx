// import React, { useState } from 'react';

// const BloodTransfusionFrontForm = ({ onSubmit, patientData }) => {
//   const [formData, setFormData] = useState({
//     ordered: { type: '', ok: '' },
//     bagContains: { value: '', ok: '' },

//     bloodGroupLab: { gr: '', rh: '', ok: '' },
//     bloodGroupBag: { gr: '', rh: '', ok: '' },

//     doCollection: { date: '', expired: '', ok: '' },
//     doExpiry: { date: '', expired: '', ok: '' },
//     doIssue: { date: '', expired: '', ok: '' },

//     patientNameOnBag: { value: '', ok: '' },
//     patientIdentified: { value: '', ok: '' },

//     seroStatus: {
//       hiv: false,
//       hbsag: false,
//       vdrdl: false,
//       hcv: false,
//       mp: false,
//       result: '',
//       ok: ''
//     },

//     visual: {
//       clotting: { value: '', ok: '' },
//       bubbling: { value: '', ok: '' },
//       leakage: { value: '', ok: '' }
//     },

//     btConsent: { value: '', ok: '' },
//     patientEducated: { value: '', ok: '' },

//     preMedication: { value: '', ok: '' },

//     rmoName: '',
//     rmoDate: '',
//     rmoTime: ''
//   });

//   const setField = (path, value) => {
//     setFormData(prev => {
//       const updated = { ...prev };
//       path.reduce((obj, key, idx) => {
//         if (idx === path.length - 1) obj[key] = value;
//         return obj[key];
//       }, updated);
//       return updated;
//     });
//   };

//   const yesNo = (name, value) => (
//     <>
//       <label>
//         <input
//           type="radio"
//           name={name}
//           checked={value === 'yes'}
//           onChange={() => setField(name.split('.'), 'yes')}
//         /> Yes
//       </label>
//       <label style={{ marginLeft: 10 }}>
//         <input
//           type="radio"
//           name={name}
//           checked={value === 'no'}
//           onChange={() => setField(name.split('.'), 'no')}
//         /> No
//       </label>
//     </>
//   );

//   return (
//     <form className="medical-form compact-form" onSubmit={e => { e.preventDefault(); onSubmit(formData); }}>

//       <h2 className="form-title" style={{ textAlign: 'center' }}>
//         BLOOD TRANSFUSION RECORD & MONITORING FORM
//       </h2>

//       {patientData && (
//         <div className="patient-info-header">
//           <div className="grid-4">
//             <div><b>UHID:</b> {patientData.uhid}</div>
//             <div><b>Name:</b> {patientData.name}</div>
//             <div><b>Age:</b> {patientData.age}</div>
//             <div><b>Gender:</b> {patientData.gender}</div>
//           </div>
//         </div>
//       )}

//       <h3>Pre-Transfusion Checklist</h3>

//       <table className="medical-table">
//         <thead>
//           <tr>
//             <th>Check Point</th>
//             <th>Requirement</th>
//             <th>Entry</th>
//             <th>OK (Y/N)</th>
//           </tr>
//         </thead>

//         <tbody>

//           {/* Ordered */}
//           <tr>
//             <td>Ordered</td>
//             <td>Whole blood / PCV / FFP</td>
//             <td>
//               <input style={{ width: 140 }}
//                 onChange={e => setField(['ordered','type'], e.target.value)} />
//             </td>
//             <td>{yesNo('ordered.ok', formData.ordered.ok)}</td>
//           </tr>

//           {/* Bag contains */}
//           <tr>
//             <td>Bag contains</td>
//             <td></td>
//             <td>
//               <input style={{ width: 140 }}
//                 onChange={e => setField(['bagContains','value'], e.target.value)} />
//             </td>
//             <td>{yesNo('bagContains.ok', formData.bagContains.ok)}</td>
//           </tr>

//           {/* Blood group lab */}
//           <tr>
//             <td>Blood group on Lab report</td>
//             <td>Gr / Rh</td>
//             <td>
//               Gr <input style={{ width: 40 }}
//                 onChange={e => setField(['bloodGroupLab','gr'], e.target.value)} />
//               Rh <input style={{ width: 40, marginLeft: 8 }}
//                 onChange={e => setField(['bloodGroupLab','rh'], e.target.value)} />
//             </td>
//             <td>{yesNo('bloodGroupLab.ok', formData.bloodGroupLab.ok)}</td>
//           </tr>

//           {/* Blood group bag */}
//           <tr>
//             <td>Blood group on Bag</td>
//             <td>Gr / Rh</td>
//             <td>
//               Gr <input style={{ width: 40 }}
//                 onChange={e => setField(['bloodGroupBag','gr'], e.target.value)} />
//               Rh <input style={{ width: 40, marginLeft: 8 }}
//                 onChange={e => setField(['bloodGroupBag','rh'], e.target.value)} />
//             </td>
//             <td>{yesNo('bloodGroupBag.ok', formData.bloodGroupBag.ok)}</td>
//           </tr>

//           {/* DO rows */}
//           {['Collection','Expiry','Issue'].map((t,i) => {
//             const key = ['doCollection','doExpiry','doIssue'][i];
//             return (
//               <tr key={key}>
//                 <td>DO {t}</td>
//                 <td>Date not expired</td>
//                 <td>
//                   <input type="date" style={{ width: 130 }}
//                     onChange={e => setField([key,'date'], e.target.value)} />
//                   <div>
//                     <label>
//                       <input type="radio" name={`${key}.expired`}
//                         onChange={() => setField([key,'expired'], 'yes')} /> Yes
//                     </label>
//                     <label style={{ marginLeft: 10 }}>
//                       <input type="radio" name={`${key}.expired`}
//                         onChange={() => setField([key,'expired'], 'no')} /> No
//                     </label>
//                   </div>
//                 </td>
//                 <td>{yesNo(`${key}.ok`, formData[key].ok)}</td>
//               </tr>
//             );
//           })}

//           {/* Names */}
//           {[
//             ['Name of patient on bag','patientNameOnBag'],
//             ['Name as identified','patientIdentified']
//           ].map(([label,key]) => (
//             <tr key={key}>
//               <td>{label}</td>
//               <td></td>
//               <td>
//                 <input style={{ width: 180 }}
//                   onChange={e => setField([key,'value'], e.target.value)} />
//               </td>
//               <td>{yesNo(`${key}.ok`, formData[key].ok)}</td>
//             </tr>
//           ))}

//           {/* Sero status */}
//           <tr>
//             <td>Sero status</td>
//             <td>
//               {['hiv','hbsag','vdrdl','hcv','mp'].map(k => (
//                 <label key={k} style={{ marginRight: 15 }}>
//                   <input type="checkbox"
//                     onChange={e => setField(['seroStatus',k], e.target.checked)} /> {k.toUpperCase()}
//                 </label>
//               ))}
//               <div>
//                 <label>
//                   <input type="radio" name="seroResult"
//                     onChange={() => setField(['seroStatus','result'], '-ve')} /> -ve
//                 </label>
//                 <label style={{ marginLeft: 10 }}>
//                   <input type="radio" name="seroResult"
//                     onChange={() => setField(['seroStatus','result'], '+ve')} /> +ve
//                 </label>
//               </div>
//             </td>
//             <td>{yesNo('seroStatus.ok', formData.seroStatus.ok)}</td>
//           </tr>

//           {/* Visual inspection */}
//           {['clotting','bubbling','leakage'].map(v => (
//             <tr key={v}>
//               <td>Visual inspection – {v}</td>
//               <td></td>
//               <td>
//                 <input style={{ width: 140 }}
//                   onChange={e => setField(['visual',v,'value'], e.target.value)} />
//               </td>
//               <td>{yesNo(`visual.${v}.ok`, formData.visual[v].ok)}</td>
//             </tr>
//           ))}

//           {/* BT consent */}
//           <tr>
//             <td>BT consent</td>
//             <td>
//               <label>
//                 <input type="radio" name="btConsent"
//                   onChange={() => setField(['btConsent','value'], 'taken')} /> Taken
//               </label>
//               <label style={{ marginLeft: 10 }}>
//                 <input type="radio" name="btConsent"
//                   onChange={() => setField(['btConsent','value'], 'not taken')} /> Not taken
//               </label>
//             </td>
//             <td>{yesNo('btConsent.ok', formData.btConsent.ok)}</td>
//           </tr>

//           {/* Patient educated */}
//           <tr>
//             <td>Patient educated on BTR symptoms</td>
//             <td>
//               <label>
//                 <input type="radio" name="patientEducated"
//                   onChange={() => setField(['patientEducated','value'], 'done')} /> Done
//               </label>
//               <label style={{ marginLeft: 10 }}>
//                 <input type="radio" name="patientEducated"
//                   onChange={() => setField(['patientEducated','value'], 'not done')} /> Not done
//               </label>
//             </td>
//             <td>{yesNo('patientEducated.ok', formData.patientEducated.ok)}</td>
//           </tr>

//           {/* Pre medication */}
//           <tr>
//             <td>Pre medication</td>
//             <td></td>
//             <td>
//               <input style={{ width: 140 }}
//                 onChange={e => setField(['preMedication','value'], e.target.value)} />
//             </td>
//             <td>{yesNo('preMedication.ok', formData.preMedication.ok)}</td>
//           </tr>

//         </tbody>
//       </table>

//       <h3>RMO Endorsement</h3>
//       <div style={{ display: 'flex', gap: 10 }}>
//         <input placeholder="RMO Name" style={{ width: 180 }}
//           onChange={e => setFormData({ ...formData, rmoName: e.target.value })} />
//         <input type="date" style={{ width: 130 }}
//           onChange={e => setFormData({ ...formData, rmoDate: e.target.value })} />
//         <input type="time" style={{ width: 100 }}
//           onChange={e => setFormData({ ...formData, rmoTime: e.target.value })} />
//       </div>

//       <button type="submit" className="submit-btn" style={{ marginTop: 20 }}>
//         Submit
//       </button>

//     </form>
//   );
// };

// export default BloodTransfusionFrontForm;

import React, { useState } from 'react';
import './Forms.css'; // Importing your shared CSS

const BloodTransfusionFrontForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    ordered: { type: '', ok: '' },
    bagContains: { value: '', ok: '' },
    bloodGroupLab: { gr: '', rh: '', ok: '' },
    bloodGroupBag: { gr: '', rh: '', ok: '' },
    doCollection: { date: '', expired: '', ok: '' },
    doExpiry: { date: '', expired: '', ok: '' },
    doIssue: { date: '', expired: '', ok: '' },
    patientNameOnBag: { value: '', ok: '' },
    patientIdentified: { value: '', ok: '' },
    seroStatus: {
      hiv: false, hbsag: false, vdrdl: false, hcv: false, mp: false,
      result: '', ok: ''
    },
    visual: {
      clotting: { value: '', ok: '' },
      bubbling: { value: '', ok: '' },
      leakage: { value: '', ok: '' }
    },
    btConsent: { value: '', ok: '' },
    patientEducated: { value: '', ok: '' },
    preMedication: { value: '', ok: '' },
    rmoName: '',
    rmoDate: '',
    rmoTime: ''
  });

  const setField = (path, value) => {
    setFormData(prev => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return { ...updated };
    });
  };

  // Reusable Radio logic using Forms.css classes
  const yesNo = (pathStr, value) => (
    <div className="radio-group" style={{ justifyContent: 'center' }}>
      <label className={`radio-option ${value === 'yes' ? 'selected' : ''}`}>
        <input
          type="radio"
          checked={value === 'yes'}
          onChange={() => setField(pathStr.split('.'), 'yes')}
        /> Y
      </label>
      <label className={`radio-option ${value === 'no' ? 'selected' : ''}`}>
        <input
          type="radio"
          checked={value === 'no'}
          onChange={() => setField(pathStr.split('.'), 'no')}
        /> N
      </label>
    </div>
  );

  return (
    <div className="medical-form-container">
      <form onSubmit={e => { e.preventDefault(); onSubmit(formData); }}>

        <h2 className="form-title">BLOOD TRANSFUSION RECORD & MONITORING</h2>

        {/* Patient Header */}
        {patientData && (
          <div className="patient-compact-header">
            <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{patientData.uhid}</span></div>
            <div className="info-item"><span className="info-label">Patient Name</span><span className="info-value">{patientData.name}</span></div>
            <div className="info-item"><span className="info-label">Age/Sex</span><span className="info-value">{patientData.age}/{patientData.gender}</span></div>
            <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{patientData.ipNo || '—'}</span></div>
          </div>
        )}

        <div className="section-box">
          <div className="form-section-title">Pre-Transfusion Checklist</div>
          
          <table className="medical-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Check Point</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Requirement</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Entry / Data</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>OK (Y/N)</th>
              </tr>
            </thead>
            <tbody>
              {/* Ordered */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Ordered</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>Whole blood / PCV / FFP</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <input className="form-control" placeholder="Type..." onChange={e => setField(['ordered','type'], e.target.value)} />
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{yesNo('ordered.ok', formData.ordered.ok)}</td>
              </tr>

              {/* Blood Groups */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Group (Lab Report)</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>Verify Gr / Rh</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input className="form-control" placeholder="Gr" style={{ width: '50px' }} onChange={e => setField(['bloodGroupLab','gr'], e.target.value)} />
                    <input className="form-control" placeholder="Rh" style={{ width: '50px' }} onChange={e => setField(['bloodGroupLab','rh'], e.target.value)} />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{yesNo('bloodGroupLab.ok', formData.bloodGroupLab.ok)}</td>
              </tr>

              {/* Sero Status */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Sero Status</td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                   <div className="checkbox-group">
                      {['hiv','hbsag','vdrdl','hcv','mp'].map(k => (
                        <label key={k} className={`checkbox-option ${formData.seroStatus[k] ? 'selected' : ''}`} style={{ fontSize: '10px', padding: '2px 5px' }}>
                          <input type="checkbox" onChange={e => setField(['seroStatus',k], e.target.checked)} /> {k.toUpperCase()}
                        </label>
                      ))}
                   </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div className="radio-group">
                    <label className={`radio-option ${formData.seroStatus.result === '-ve' ? 'selected' : ''}`}>
                      <input type="radio" name="seroResult" onChange={() => setField(['seroStatus','result'], '-ve')} /> -ve
                    </label>
                    <label className={`radio-option ${formData.seroStatus.result === '+ve' ? 'selected' : ''}`}>
                      <input type="radio" name="seroResult" onChange={() => setField(['seroStatus','result'], '+ve')} /> +ve
                    </label>
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{yesNo('seroStatus.ok', formData.seroStatus.ok)}</td>
              </tr>

              {/* Visual Inspections */}
              {['Clotting','Bubbling','Leakage'].map(v => (
                <tr key={v}>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Visual: {v}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>Inspection of bag</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>
                    <input className="form-control" placeholder="Observations" onChange={e => setField(['visual', v.toLowerCase(), 'value'], e.target.value)} />
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{yesNo(`visual.${v.toLowerCase()}.ok`, formData.visual[v.toLowerCase()].ok)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Endorsement */}
        <div className="section-box">
          <div className="form-section-title">RMO Endorsement</div>
          <div className="three-col">
            <div className="form-field">
              <label className="field-label">RMO Name</label>
              <input className="form-control" placeholder="Full Name" onChange={e => setFormData({ ...formData, rmoName: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="field-label">Date</label>
              <input type="date" className="form-control" onChange={e => setFormData({ ...formData, rmoDate: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="field-label">Time</label>
              <input type="time" className="form-control" onChange={e => setFormData({ ...formData, rmoTime: e.target.value })} />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Submit Transfusion Record
        </button>

      </form>
    </div>
  );
};

export default BloodTransfusionFrontForm;
