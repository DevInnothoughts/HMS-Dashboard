import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import RadioGroup from '../inputs/RadioGroup';
import CheckboxGroup from '../inputs/CheckboxGroup';
import './Forms.css';

const InitialAssessmentForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        // Pre-filled from backend
        name: patientData.name || '',
        uhid: patientData.uhid || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        address: patientData.address || '',

        // User input fields
        hasAllergiesCheckbox: false,
        allergiesNotKnown: false,
        allergiesDetails: '',
        painScore: '',
        chiefComplaints: '',
        historyOfPresentIllness: '',
        familyHistory: '',

        // Medical History - Yes/No radios
        hasDM: '',
        hasHypertension: '',
        hasAllergies: '',
        hasThyroid: '',
        hasAsthma: '',

        // Additional fields
        dmDuration: '',
        hypertensionDuration: '',
        allergiesDuration: '',
        thyroidDuration: '',
        asthmaDuration: '',

        otherMedicalHistory: '',
        ongoingMedications: '',
        surgicalHistory: '',
        historyGivenBy: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: checked };
            if (name === 'hasAllergiesCheckbox' && checked) {
                newState.allergiesNotKnown = false;
            } else if (name === 'allergiesNotKnown' && checked) {
                newState.hasAllergiesCheckbox = false;
                // Optionally clear details if not known
                newState.allergiesDetails = '';
            }
            return newState;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedData = { ...formData };
        Object.keys(trimmedData).forEach(key => {
            if (typeof trimmedData[key] === 'string') {
                trimmedData[key] = trimmedData[key].trim();
            }
        });

        onSubmit && onSubmit(trimmedData);
    };

    const painScoreOptions = [
        { value: '0', label: '0 - No Pain' },
        { value: '1', label: '1' },
        { value: '2', label: '2 - Mild' },
        { value: '3', label: '3' },
        { value: '4', label: '4 - Moderate' },
        { value: '5', label: '5' },
        { value: '6', label: '6 - Severe' },
        { value: '7', label: '7' },
        { value: '8', label: '8 - Very Severe' },
        { value: '9', label: '9' },
        { value: '10', label: '10 - Worst Pain' }
    ];

    return (
        <div className="medical-form-container">
            <form onSubmit={handleSubmit} className="medical-form initial-assessment">
                <h2 className="form-title">Initial Assessment</h2>

                {/* Compact Patient Header */}
                <div className="patient-compact-header">
                    <div className="info-item">
                        <span className="info-label">UHID</span>
                        <span className="info-value">{formData.uhid || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Patient Name</span>
                        <span className="info-value">{formData.name || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Age</span>
                        <span className="info-value">{formData.age || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Gender</span>
                        <span className="info-value">{formData.gender || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">IP No</span>
                        <span className="info-value">{patientData.ipNo || '—'}</span>
                    </div>
                    <div className="info-item" style={{ gridColumn: '1 / -1', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <span className="info-label">Address</span>
                        <span className="info-value">{formData.address || '—'}</span>
                    </div>
                </div>

                <div className="form-body-split">
                    <div className="left-side">
                        <div className="section-box">
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Allergies & Complaints</h3>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <label className={`checkbox-option ${formData.hasAllergiesCheckbox ? 'selected' : ''}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                                    <input type="checkbox" name="hasAllergiesCheckbox" checked={formData.hasAllergiesCheckbox} onChange={handleCheckboxChange} />
                                    <span>Any Allergies</span>
                                </label>
                                <label className={`checkbox-option ${formData.allergiesNotKnown ? 'selected' : ''}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                                    <input type="checkbox" name="allergiesNotKnown" checked={formData.allergiesNotKnown} onChange={handleCheckboxChange} />
                                    <span>Not Known</span>
                                </label>
                            </div>

                            {formData.hasAllergiesCheckbox && (
                                <TextInput label="Details" name="allergiesDetails" value={formData.allergiesDetails} onChange={handleChange} placeholder="Specify..." />
                            )}

                            <div className="form-field" style={{ marginTop: '1rem' }}>
                                <label className="field-label">Chief Complaints</label>
                                <Textarea name="chiefComplaints" value={formData.chiefComplaints} onChange={handleChange} rows={3} placeholder="Patient's primary issues..." />
                            </div>
                        </div>

                        <div className="section-box">
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Pain Score</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                                {painScoreOptions.map((option) => (
                                    <label key={option.value} className={`radio-option ${formData.painScore === option.value ? 'selected' : ''}`} style={{ padding: '0.2rem', minWidth: 'unset', textAlign: 'center' }}>
                                        <input type="radio" name="painScore" value={option.value} checked={formData.painScore === option.value} onChange={handleChange} />
                                        <span style={{ fontSize: '0.75rem' }}>{option.value}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-side">
                        <div className="section-box">
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Clinical History</h3>
                            <div className="history-compact-grid">
                                {[
                                    ['hasDM', 'DM', 'dmDuration', 'Duration'],
                                    ['hasHypertension', 'HTN', 'hypertensionDuration', 'Duration'],
                                    ['hasThyroid', 'Thyroid', 'thyroidDuration', 'Duration'],
                                    ['hasAsthma', 'Asthma', 'asthmaDuration', 'Duration']
                                ].map(([flag, label, dur, durLabel]) => (
                                    <div key={flag} className="history-row" style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{label}</span>
                                        <div className="radio-group" style={{ margin: 0 }}>
                                            {['Yes', 'No'].map(opt => (
                                                <label key={opt} className={`radio-option ${formData[flag] === opt ? 'selected' : ''}`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>
                                                    <input type="radio" name={flag} value={opt} checked={formData[flag] === opt} onChange={handleChange} />
                                                    <span>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {formData[flag] === 'Yes' && (
                                            <input type="text" name={dur} value={formData[dur]} onChange={handleChange} placeholder={durLabel} style={{ fontSize: '0.7rem', padding: '0.2rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <Textarea label="Other History" name="otherMedicalHistory" value={formData.otherMedicalHistory} onChange={handleChange} rows={2} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-box" style={{ marginTop: '1.5rem' }}>
                    <div className="two-col">
                        <Textarea label="Ongoing Meds" name="ongoingMedications" value={formData.ongoingMedications} onChange={handleChange} rows={2} />
                        <Textarea label="Surgical History" name="surgicalHistory" value={formData.surgicalHistory} onChange={handleChange} rows={2} />
                    </div>
                </div>

                <div className="two-col" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <TextInput label="History Given By" name="historyGivenBy" value={formData.historyGivenBy} onChange={handleChange} />
                    <button type="submit" className="submit-btn" style={{ height: 'fit-content', alignSelf: 'flex-end' }}>Finalize Assessment Report</button>
                </div>
            </form>
        </div>
    );
};

export default InitialAssessmentForm;
