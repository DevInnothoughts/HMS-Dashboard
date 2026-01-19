import React, { useState } from 'react';

const NutritionalReassessmentForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    dietCounselingProvided: '',
    assessmentDateTime: '',
    dietitianName: '',
    dietitianSignature: '',
    consultantName: '',
    consultantSignature: '',
    reassessments: [
      {
        dateTime: '',
        remark: '',
        prescribedDiet: '',
        dietitianSign: ''
      }
    ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReassessmentChange = (index, field, value) => {
    const updated = [...formData.reassessments];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, reassessments: updated }));
  };

  const addRow = () => {
    setFormData(prev => ({
      ...prev,
      reassessments: [
        ...prev.reassessments,
        {
          dateTime: '',
          remark: '',
          prescribedDiet: '',
          dietitianSign: ''
        }
      ]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({
      ...formData,
      patientHeader: patientData
    });
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form compact-form">

      <h2 className="form-title">NUTRITIONAL ASSESSMENT</h2>

      {/* ================= Patient Header (DB Driven – Read Only) ================= */}
      {patientData && (
        <div className="patient-compact-header">
          <div>UHID: {patientData.uhid}</div>
          <div>Patient Name: {patientData.name}</div>
          <div>Age: {patientData.age}</div>
          <div>Gender: {patientData.gender}</div>
          <div>IP No: {patientData.ipNo}</div>
        </div>
      )}

      {/* ================= Upper Nutritional Assessment Section ================= */}
      <fieldset>
        <legend>Nutritional Assessment</legend>

        <label>
          Diet Counseling / Education Provided
          <select
            name="dietCounselingProvided"
            value={formData.dietCounselingProvided}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>

        <label>
          Date & Time of Assessment
          <input
            type="datetime-local"
            name="assessmentDateTime"
            value={formData.assessmentDateTime}
            onChange={handleChange}
          />
        </label>

        <label>
          Name of Dietitian
          <input
            type="text"
            name="dietitianName"
            value={formData.dietitianName}
            onChange={handleChange}
          />
        </label>

        <label>
          Dietitian Signature
          <input
            type="text"
            name="dietitianSignature"
            value={formData.dietitianSignature}
            onChange={handleChange}
          />
        </label>

        <label>
          Name of Consultant / Resident
          <input
            type="text"
            name="consultantName"
            value={formData.consultantName}
            onChange={handleChange}
          />
        </label>

        <label>
          Consultant / Resident Signature
          <input
            type="text"
            name="consultantSignature"
            value={formData.consultantSignature}
            onChange={handleChange}
          />
        </label>
      </fieldset>

      {/* ================= Nutritional Reassessment Section ================= */}
      <h3 style={{ marginTop: '25px' }}>Nutritional Reassessment</h3>

      {formData.reassessments.map((row, index) => (
        <fieldset key={index} style={{ marginBottom: '15px' }}>
          <legend>Reassessment {index + 1}</legend>

          <label>
            Date & Time
            <input
              type="datetime-local"
              value={row.dateTime}
              onChange={(e) =>
                handleReassessmentChange(index, 'dateTime', e.target.value)
              }
            />
          </label>

          <label>
            Remark
            <input
              type="text"
              value={row.remark}
              onChange={(e) =>
                handleReassessmentChange(index, 'remark', e.target.value)
              }
            />
          </label>

          <label>
            Prescribed Diet
            <input
              type="text"
              value={row.prescribedDiet}
              onChange={(e) =>
                handleReassessmentChange(index, 'prescribedDiet', e.target.value)
              }
            />
          </label>

          <label>
            Name & Signature of Dietitian
            <input
              type="text"
              value={row.dietitianSign}
              onChange={(e) =>
                handleReassessmentChange(index, 'dietitianSign', e.target.value)
              }
            />
          </label>
        </fieldset>
      ))}

      <button
        type="button"
        className="secondary-btn"
        onClick={addRow}
        style={{ marginBottom: '20px' }}
      >
        + Add Reassessment Entry
      </button>

      <button type="submit" className="submit-btn">
        Submit Nutritional Assessment
      </button>
    </form>
  );
};

export default NutritionalReassessmentForm;
