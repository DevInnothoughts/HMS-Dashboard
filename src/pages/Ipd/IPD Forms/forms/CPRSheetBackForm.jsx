import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import RadioGroup from '../inputs/RadioGroup';
import SignatureInput from '../inputs/SignatureInput';

/* ====== FIELD GROUPS (DO NOT RENAME) ====== */

// 1️⃣ No heading section
const BASIC_FIELDS = [
  'Time',
  'HR',
  'Rhythm',
  'BP',
  'PR',
  'SpO2',
  'Defeb Joules'
];

// 2️⃣ Medication section
const MEDICATION_FIELDS = [
  'Atropine',
  'Adrenaline',
  'Amino anon',
  'MgSO4',
  'Sodium bicarbonate',
  'Calcium',
  'Dopamine',
  'Noradrenaline',
  'IV fluids',
  'Other',
  'Any drug through ETT'
];

// 3️⃣ Investigation & Procedure section
const INVESTIGATION_FIELDS = [
  'CPR cycle',
  'ABG',
  'BSL',
  'Electrolyte',
  'Other investigation',
  'Other procedure if any'
];

const CPRSheetBackForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    medEntries: [{}],

    resuscitated: '',
    postVitalsMentalStatus: '',
    expiredAt: '',
    pronouncedBy: '',
    timeCodeTerminated: '',
    familyNotified: '',
    individualsPresent: '',
    cprRegisterEntry: '',
    clinicianSignature: ''
  });

  const updateMedEntry = (index, field, value) => {
    const updated = [...formData.medEntries];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, medEntries: updated }));
  };

  const addMedEntry = () => {
    setFormData(prev => ({
      ...prev,
      medEntries: [...prev.medEntries, {}]
    }));
  };

  const update = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ ...formData, patientHeader: patientData });
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form compact-form">

      <h2 className="form-title" style={{ textAlign: 'center' }}>
        CPR SHEET – MEDICATION / INVESTIGATION / PROCEDURE LOG
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

      {/* ================= LOG ENTRIES ================= */}
      {formData.medEntries.map((entry, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ddd',
            padding: '10px',
            marginBottom: '15px'
          }}
        >
          <strong>Entry #{index + 1}</strong>

          {/* ===== BASIC (NO HEADING) ===== */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginTop: '10px'
            }}
          >
            {BASIC_FIELDS.map(field => (
              <TextInput
                key={field}
                label={field}
                value={entry[field] || ''}
                onChange={e =>
                  updateMedEntry(index, field, e.target.value)
                }
              />
            ))}
          </div>

          {/* ===== MEDICATION ===== */}
          <h4 style={{ marginTop: '15px' }}>Medication</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px'
            }}
          >
            {MEDICATION_FIELDS.map(field => (
              <TextInput
                key={field}
                label={field}
                value={entry[field] || ''}
                onChange={e =>
                  updateMedEntry(index, field, e.target.value)
                }
              />
            ))}
          </div>

          {/* ===== INVESTIGATION & PROCEDURE ===== */}
          <h4 style={{ marginTop: '15px' }}>Investigation & Procedure</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px'
            }}
          >
            {INVESTIGATION_FIELDS.map(field => (
              <TextInput
                key={field}
                label={field}
                value={entry[field] || ''}
                onChange={e =>
                  updateMedEntry(index, field, e.target.value)
                }
              />
            ))}
          </div>
        </div>
      ))}

      <button type="button" onClick={addMedEntry}>
        + Add Entry
      </button>

      {/* ================= OUTCOME ================= */}
      <h3>Outcome</h3>

      <RadioGroup
        label="Was the patient successfully resuscitated?"
        name="resuscitated"
        value={formData.resuscitated}
        onChange={e => update('resuscitated', e.target.value)}
        options={[
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ]}
      />

      <Textarea
        label="If yes, vitals with mental status"
        value={formData.postVitalsMentalStatus}
        onChange={e => update('postVitalsMentalStatus', e.target.value)}
      />

      <div className="grid-2">
        <TextInput
          label="Patient expired at"
          value={formData.expiredAt}
          onChange={e => update('expiredAt', e.target.value)}
        />
        <TextInput
          label="Pronounced by"
          value={formData.pronouncedBy}
          onChange={e => update('pronouncedBy', e.target.value)}
        />
      </div>

      <TextInput
        label="Time at which code terminated / cleared"
        value={formData.timeCodeTerminated}
        onChange={e => update('timeCodeTerminated', e.target.value)}
      />

      <TextInput
        label="Family notified"
        value={formData.familyNotified}
        onChange={e => update('familyNotified', e.target.value)}
      />

      <Textarea
        label="Name of individuals present at code"
        value={formData.individualsPresent}
        onChange={e => update('individualsPresent', e.target.value)}
      />

      <RadioGroup
        label="CPR register entry"
        name="cprRegisterEntry"
        value={formData.cprRegisterEntry}
        onChange={e => update('cprRegisterEntry', e.target.value)}
        options={[
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ]}
      />

      <SignatureInput
        label="Clinician Signature / Arrest order verification"
        value={formData.clinicianSignature}
        onChange={e => update('clinicianSignature', e.target.value)}
      />

      <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
        Submit CPR Sheet (Back)
      </button>
    </form>
  );
};

export default CPRSheetBackForm;
