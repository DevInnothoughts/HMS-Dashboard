import React, { useState } from 'react';

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
      hiv: false,
      hbsag: false,
      vdrdl: false,
      hcv: false,
      mp: false,
      result: '',
      ok: ''
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
      path.reduce((obj, key, idx) => {
        if (idx === path.length - 1) obj[key] = value;
        return obj[key];
      }, updated);
      return updated;
    });
  };

  const yesNo = (name, value) => (
    <>
      <label>
        <input
          type="radio"
          name={name}
          checked={value === 'yes'}
          onChange={() => setField(name.split('.'), 'yes')}
        /> Yes
      </label>
      <label style={{ marginLeft: 10 }}>
        <input
          type="radio"
          name={name}
          checked={value === 'no'}
          onChange={() => setField(name.split('.'), 'no')}
        /> No
      </label>
    </>
  );

  return (
    <form className="medical-form compact-form" onSubmit={e => { e.preventDefault(); onSubmit(formData); }}>

      <h2 className="form-title" style={{ textAlign: 'center' }}>
        BLOOD TRANSFUSION RECORD & MONITORING FORM
      </h2>

      {patientData && (
        <div className="patient-info-header">
          <div className="grid-4">
            <div><b>UHID:</b> {patientData.uhid}</div>
            <div><b>Name:</b> {patientData.name}</div>
            <div><b>Age:</b> {patientData.age}</div>
            <div><b>Gender:</b> {patientData.gender}</div>
          </div>
        </div>
      )}

      <h3>Pre-Transfusion Checklist</h3>

      <table className="medical-table">
        <thead>
          <tr>
            <th>Check Point</th>
            <th>Requirement</th>
            <th>Entry</th>
            <th>OK (Y/N)</th>
          </tr>
        </thead>

        <tbody>

          {/* Ordered */}
          <tr>
            <td>Ordered</td>
            <td>Whole blood / PCV / FFP</td>
            <td>
              <input style={{ width: 140 }}
                onChange={e => setField(['ordered','type'], e.target.value)} />
            </td>
            <td>{yesNo('ordered.ok', formData.ordered.ok)}</td>
          </tr>

          {/* Bag contains */}
          <tr>
            <td>Bag contains</td>
            <td></td>
            <td>
              <input style={{ width: 140 }}
                onChange={e => setField(['bagContains','value'], e.target.value)} />
            </td>
            <td>{yesNo('bagContains.ok', formData.bagContains.ok)}</td>
          </tr>

          {/* Blood group lab */}
          <tr>
            <td>Blood group on Lab report</td>
            <td>Gr / Rh</td>
            <td>
              Gr <input style={{ width: 40 }}
                onChange={e => setField(['bloodGroupLab','gr'], e.target.value)} />
              Rh <input style={{ width: 40, marginLeft: 8 }}
                onChange={e => setField(['bloodGroupLab','rh'], e.target.value)} />
            </td>
            <td>{yesNo('bloodGroupLab.ok', formData.bloodGroupLab.ok)}</td>
          </tr>

          {/* Blood group bag */}
          <tr>
            <td>Blood group on Bag</td>
            <td>Gr / Rh</td>
            <td>
              Gr <input style={{ width: 40 }}
                onChange={e => setField(['bloodGroupBag','gr'], e.target.value)} />
              Rh <input style={{ width: 40, marginLeft: 8 }}
                onChange={e => setField(['bloodGroupBag','rh'], e.target.value)} />
            </td>
            <td>{yesNo('bloodGroupBag.ok', formData.bloodGroupBag.ok)}</td>
          </tr>

          {/* DO rows */}
          {['Collection','Expiry','Issue'].map((t,i) => {
            const key = ['doCollection','doExpiry','doIssue'][i];
            return (
              <tr key={key}>
                <td>DO {t}</td>
                <td>Date not expired</td>
                <td>
                  <input type="date" style={{ width: 130 }}
                    onChange={e => setField([key,'date'], e.target.value)} />
                  <div>
                    <label>
                      <input type="radio" name={`${key}.expired`}
                        onChange={() => setField([key,'expired'], 'yes')} /> Yes
                    </label>
                    <label style={{ marginLeft: 10 }}>
                      <input type="radio" name={`${key}.expired`}
                        onChange={() => setField([key,'expired'], 'no')} /> No
                    </label>
                  </div>
                </td>
                <td>{yesNo(`${key}.ok`, formData[key].ok)}</td>
              </tr>
            );
          })}

          {/* Names */}
          {[
            ['Name of patient on bag','patientNameOnBag'],
            ['Name as identified','patientIdentified']
          ].map(([label,key]) => (
            <tr key={key}>
              <td>{label}</td>
              <td></td>
              <td>
                <input style={{ width: 180 }}
                  onChange={e => setField([key,'value'], e.target.value)} />
              </td>
              <td>{yesNo(`${key}.ok`, formData[key].ok)}</td>
            </tr>
          ))}

          {/* Sero status */}
          <tr>
            <td>Sero status</td>
            <td>
              {['hiv','hbsag','vdrdl','hcv','mp'].map(k => (
                <label key={k} style={{ marginRight: 15 }}>
                  <input type="checkbox"
                    onChange={e => setField(['seroStatus',k], e.target.checked)} /> {k.toUpperCase()}
                </label>
              ))}
              <div>
                <label>
                  <input type="radio" name="seroResult"
                    onChange={() => setField(['seroStatus','result'], '-ve')} /> -ve
                </label>
                <label style={{ marginLeft: 10 }}>
                  <input type="radio" name="seroResult"
                    onChange={() => setField(['seroStatus','result'], '+ve')} /> +ve
                </label>
              </div>
            </td>
            <td>{yesNo('seroStatus.ok', formData.seroStatus.ok)}</td>
          </tr>

          {/* Visual inspection */}
          {['clotting','bubbling','leakage'].map(v => (
            <tr key={v}>
              <td>Visual inspection – {v}</td>
              <td></td>
              <td>
                <input style={{ width: 140 }}
                  onChange={e => setField(['visual',v,'value'], e.target.value)} />
              </td>
              <td>{yesNo(`visual.${v}.ok`, formData.visual[v].ok)}</td>
            </tr>
          ))}

          {/* BT consent */}
          <tr>
            <td>BT consent</td>
            <td>
              <label>
                <input type="radio" name="btConsent"
                  onChange={() => setField(['btConsent','value'], 'taken')} /> Taken
              </label>
              <label style={{ marginLeft: 10 }}>
                <input type="radio" name="btConsent"
                  onChange={() => setField(['btConsent','value'], 'not taken')} /> Not taken
              </label>
            </td>
            <td>{yesNo('btConsent.ok', formData.btConsent.ok)}</td>
          </tr>

          {/* Patient educated */}
          <tr>
            <td>Patient educated on BTR symptoms</td>
            <td>
              <label>
                <input type="radio" name="patientEducated"
                  onChange={() => setField(['patientEducated','value'], 'done')} /> Done
              </label>
              <label style={{ marginLeft: 10 }}>
                <input type="radio" name="patientEducated"
                  onChange={() => setField(['patientEducated','value'], 'not done')} /> Not done
              </label>
            </td>
            <td>{yesNo('patientEducated.ok', formData.patientEducated.ok)}</td>
          </tr>

          {/* Pre medication */}
          <tr>
            <td>Pre medication</td>
            <td></td>
            <td>
              <input style={{ width: 140 }}
                onChange={e => setField(['preMedication','value'], e.target.value)} />
            </td>
            <td>{yesNo('preMedication.ok', formData.preMedication.ok)}</td>
          </tr>

        </tbody>
      </table>

      <h3>RMO Endorsement</h3>
      <div style={{ display: 'flex', gap: 10 }}>
        <input placeholder="RMO Name" style={{ width: 180 }}
          onChange={e => setFormData({ ...formData, rmoName: e.target.value })} />
        <input type="date" style={{ width: 130 }}
          onChange={e => setFormData({ ...formData, rmoDate: e.target.value })} />
        <input type="time" style={{ width: 100 }}
          onChange={e => setFormData({ ...formData, rmoTime: e.target.value })} />
      </div>

      <button type="submit" className="submit-btn" style={{ marginTop: 20 }}>
        Submit
      </button>

    </form>
  );
};

export default BloodTransfusionFrontForm;
