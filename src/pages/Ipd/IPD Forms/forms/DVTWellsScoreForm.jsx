import React, { useState } from 'react';
import CheckboxGroup from '../inputs/CheckboxGroup';
import TextInput from '../inputs/TextInput';

const DVT_CRITERIA = [
  { key: 'activeCancer', label: 'Active cancer (treatment ongoing, within 6 months, or palliative)', points: 1 },
  { key: 'paralysis', label: 'Paralysis, paresis or recent plaster immobilization of the lower extremities', points: 1 },
  { key: 'bedridden', label: 'Recently bedridden for 3 days or more or major surgery within 12 weeks requiring anesthesia', points: 1 },
  { key: 'tenderness', label: 'Localized tenderness along the distribution of the deep venous system', points: 1 },
  { key: 'legSwelling', label: 'Entire leg swollen', points: 1 },
  { key: 'calfSwelling', label: 'Calf swelling ≥ 3 cm compared to asymptomatic side', points: 1 },
  { key: 'pittingEdema', label: 'Pitting edema confined to the symptomatic leg', points: 1 },
  { key: 'collateralVeins', label: 'Collateral superficial veins (non-varicose)', points: 1 },
  { key: 'previousDVT', label: 'Previously documented DVT', points: 1 },
  { key: 'alternativeDx', label: 'Alternative diagnosis as likely as DVT', points: 2 }
];

const DVTWellsScoreForm = ({ onSubmit, patientData }) => {
  const [selected, setSelected] = useState([]);

  const handleChange = (e) => {
    setSelected(e.target.value);
  };

  const totalScore = selected.reduce((sum, key) => {
    const item = DVT_CRITERIA.find(c => c.key === key);
    return sum + (item ? item.points : 0);
  }, 0);

  const probability =
    totalScore >= 2 ? 'DVT Likely' : 'DVT Unlikely';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit &&
      onSubmit({
        selectedCriteria: selected,
        totalScore,
        probability,
        patientHeader: patientData
      });
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form compact-form">
      <h2 className="form-title" style={{ textAlign: 'center' }}>
        DVT WELL’S SCORE
      </h2>

      {/* Patient Header */}
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

      {/* Clinical Features */}
      <CheckboxGroup
        label="Clinical feature points"
        name="dvtCriteria"
        value={selected}
        onChange={handleChange}
        options={DVT_CRITERIA.map(c => ({
          label: `${c.label} (+${c.points})`,
          value: c.key
        }))}
      />

      {/* Score Summary */}
      <div style={{ marginTop: '15px' }}>
        <TextInput label="Total Score" value={totalScore} readOnly />
      </div>

      {/* Clinical Probability – STATIC TEXT (PDF FAITHFUL) */}
      <div style={{ marginTop: '15px' }}>
        <b>Clinical Probability (Simplified Score):</b>
        <div style={{ marginTop: '5px' }}>
          • <b>DVT Likely</b> (2 points or more)
        </div>
        <div>
          • <b>DVT Unlikely</b> (1 point or less)
        </div>
      </div>

      <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
        Submit DVT Well’s Score
      </button>
    </form>
  );
};

export default DVTWellsScoreForm;
