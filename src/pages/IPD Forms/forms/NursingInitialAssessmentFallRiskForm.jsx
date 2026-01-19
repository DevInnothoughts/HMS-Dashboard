import React, { useState } from 'react';

const NursingInitialAssessment = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    morseFallScale: {
      historyOfFalling: '',
      secondaryDiagnosis: '',
      ambulatoryAid: '',
      ivHeparin: '',
      gait: '',
      mentalStatus: ''
    },
    painScore: '',
    painLocation: '',
    bradenScore: '',
    pressureSore: {
      existing: false,
      prospective: false
    },
    devices: {
      centralLine: { present: '', date: '' },
      foleys: { present: '', date: '' },
      peripheralLine: { present: '', date: '' },
      rt: { present: '', date: '' },
      other: { present: '', date: '' }
    },
    assessmentBy: '',
    assessmentDate: '',
    assessmentTime: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeviceChange = (device, field, value) => {
    setFormData(prev => ({
      ...prev,
      devices: {
        ...prev.devices,
        [device]: {
          ...prev.devices[device],
          [field]: value
        }
      }
    }));
  };

  const handleMorseChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      morseFallScale: {
        ...prev.morseFallScale,
        [field]: value
      }
    }));
  };

  const morseScores = {
    historyOfFalling: { Yes: 25, No: 0 },
    secondaryDiagnosis: { Yes: 15, No: 0 },
    ambulatoryAid: {
      'Bed rest / Nurse assist': 0,
      'Crutches / cane / walker': 15,
      Furniture: 30
    },
    ivHeparin: { Yes: 20, No: 0 },
    gait: {
      'Normal / Bedrest / Immobile': 0,
      Weak: 10,
      Impaired: 20
    },
    mentalStatus: {
      'Oriented to own ability': 0,
      'Forgets limitation': 15
    }
  };

  const totalMorseScore =
    (morseScores.historyOfFalling[formData.morseFallScale.historyOfFalling] || 0) +
    (morseScores.secondaryDiagnosis[formData.morseFallScale.secondaryDiagnosis] || 0) +
    (morseScores.ambulatoryAid[formData.morseFallScale.ambulatoryAid] || 0) +
    (morseScores.ivHeparin[formData.morseFallScale.ivHeparin] || 0) +
    (morseScores.gait[formData.morseFallScale.gait] || 0) +
    (morseScores.mentalStatus[formData.morseFallScale.mentalStatus] || 0);

  const morseRisk =
    totalMorseScore >= 50 ? 'High Risk'
    : totalMorseScore >= 25 ? 'Low Risk'
    : 'No Risk';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ ...formData, patientHeader: patientData });
  };

  return (
    <form className="medical-form compact-form" onSubmit={handleSubmit}>

      <h2 className="form-title">NURSING INITIAL ASSESSMENT</h2>

      {/* Patient Header (DB driven) */}
      {patientData && (
        <div className="patient-compact-header">
          <div>UHID: {patientData.uhid}</div>
          <div>Name: {patientData.name}</div>
          <div>Age: {patientData.age}</div>
          <div>Gender: {patientData.gender}</div>
          <div>IP No: {patientData.ipNo}</div>
        </div>
      )}

      {/* ================= Morse Fall Scale ================= */}
      <h3>Morse Fall Scale</h3>

      {[
        ['historyOfFalling', 'History of falling (last 3 months)'],
        ['secondaryDiagnosis', 'Secondary diagnosis'],
        ['ambulatoryAid', 'Ambulatory aid'],
        ['ivHeparin', 'IV / Heparin Lock'],
        ['gait', 'Gait / Transferring'],
        ['mentalStatus', 'Mental status']
      ].map(([field, label]) => (
        <fieldset key={field}>
          <legend>{label}</legend>
          {Object.keys(morseScores[field]).map(option => (
            <label key={option}>
              <input
                type="radio"
                name={field}
                checked={formData.morseFallScale[field] === option}
                onChange={() => handleMorseChange(field, option)}
              />
              {option} ({morseScores[field][option]})
            </label>
          ))}
        </fieldset>
      ))}

      <div style={{ fontWeight: 'bold', marginTop: '10px' }}>
        Total Morse Score: {totalMorseScore}
      </div>
      <div>
        Risk Level: <strong>{morseRisk}</strong>
      </div>

      {/* ================= Pain & Pressure ================= */}
      <h3>Pain & Pressure Assessment</h3>

      <label>
        Pain Score
        <input name="painScore" value={formData.painScore} onChange={handleChange} />
      </label>

      <label>
        Pain Location
        <input name="painLocation" value={formData.painLocation} onChange={handleChange} />
      </label>

      <label>
        Braden Score
        <input name="bradenScore" value={formData.bradenScore} onChange={handleChange} />
      </label>

      <div>
        <strong>Pressure Sore:</strong>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="checkbox"
            checked={formData.pressureSore.existing}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                pressureSore: { ...prev.pressureSore, existing: e.target.checked }
              }))
            }
          /> Existing
        </label>

        <label style={{ marginLeft: '15px' }}>
          <input
            type="checkbox"
            checked={formData.pressureSore.prospective}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                pressureSore: { ...prev.pressureSore, prospective: e.target.checked }
              }))
            }
          /> Prospective
        </label>
      </div>

      {/* ================= Devices ================= */}
      <h3>Patient Having Devices</h3>

      {Object.keys(formData.devices).map(device => (
        <fieldset key={device}>
          <legend>{device}</legend>

          <label>
            <input
              type="radio"
              checked={formData.devices[device].present === 'Yes'}
              onChange={() => handleDeviceChange(device, 'present', 'Yes')}
            /> Yes
          </label>

          <label>
            <input
              type="radio"
              checked={formData.devices[device].present === 'No'}
              onChange={() => handleDeviceChange(device, 'present', 'No')}
            /> No
          </label>

          {formData.devices[device].present === 'Yes' && (
            <input
              type="date"
              value={formData.devices[device].date}
              onChange={(e) =>
                handleDeviceChange(device, 'date', e.target.value)
              }
            />
          )}
        </fieldset>
      ))}

      {/* ================= Assessment (ONE LINE) ================= */}
      <h3>Assessment</h3>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label style={{ flex: 2 }}>
          Assessment done by (Name & Sign)
          <input
            name="assessmentBy"
            value={formData.assessmentBy}
            onChange={handleChange}
          />
        </label>

        <label style={{ flex: 1 }}>
          Date
          <input
            type="date"
            name="assessmentDate"
            value={formData.assessmentDate}
            onChange={handleChange}
          />
        </label>

        <label style={{ flex: 1 }}>
          Time
          <input
            type="time"
            name="assessmentTime"
            value={formData.assessmentTime}
            onChange={handleChange}
          />
        </label>
      </div>

      <button type="submit" className="submit-btn">
        Submit Nursing Initial Assessment
      </button>
    </form>
  );
};

export default NursingInitialAssessment;
