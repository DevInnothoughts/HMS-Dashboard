import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import RadioGroup from '../inputs/RadioGroup';
import CheckboxGroup from '../inputs/CheckboxGroup';

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
        <form onSubmit={handleSubmit} className="medical-form initial-assessment">
            <h2 style={{ color: '#80deea', borderBottom: '2px solid #80deea', paddingBottom: '10px', marginBottom: '30px' }}>Initial Assessment</h2>

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
                <div className="info-item" style={{ flexBasis: '100%', marginTop: '5px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                    <span className="info-label">Address</span>
                    <span className="info-value">{formData.address || '—'}</span>
                </div>
            </div>

            {/* Allergies Selection */}
            <div className="form-field" style={{ display: 'flex', flexDirection: 'row', gap: '30px', marginBottom: '15px' }}>
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        name="hasAllergiesCheckbox"
                        checked={formData.hasAllergiesCheckbox}
                        onChange={handleCheckboxChange}
                    />
                    <span>Any Allergies</span>
                </label>

                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        name="allergiesNotKnown"
                        checked={formData.allergiesNotKnown}
                        onChange={handleCheckboxChange}
                    />
                    <span>Not Known</span>
                </label>
            </div>

            {formData.hasAllergiesCheckbox && (
                <div style={{ marginBottom: '20px' }}>
                    <TextInput
                        label="Specify Allergies"
                        name="allergiesDetails"
                        value={formData.allergiesDetails}
                        onChange={handleChange}
                        required={true}
                        placeholder="List specific allergies (e.g., Penicillin, Peanuts)"
                    />
                </div>
            )}

            {/* Pain Assessment Score */}
            <div className="pain-score-section">
                <label className="field-label">
                    Pain Assessment Score <span className="required">*</span>
                </label>
                <div className="pain-score-grid">
                    {painScoreOptions.map((option) => (
                        <label key={option.value} className={`pain-option ${formData.painScore === option.value ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="painScore"
                                value={option.value}
                                checked={formData.painScore === option.value}
                                onChange={handleChange}
                            />
                            <span className="pain-label">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Chief Complaints */}
            <Textarea
                label="Chief Complaints"
                name="chiefComplaints"
                value={formData.chiefComplaints}
                onChange={handleChange}
                required
                maxLength={1000}
                rows={4}
                placeholder="Enter patient's chief complaints"
            />

            {/* History of Present Illness */}
            <Textarea
                label="History of Present Illness"
                name="historyOfPresentIllness"
                value={formData.historyOfPresentIllness}
                onChange={handleChange}
                maxLength={1000}
                rows={4}
                placeholder="Enter detailed history of present illness"
            />

            {/* Family History */}
            <Textarea
                label="Family History"
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder="Enter relevant family medical history"
            />

            {/* Medical History Section */}
            <div className="medical-history-section" style={{ marginTop: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #80deea', paddingBottom: '8px', marginBottom: '15px' }}>Medical History</h3>
                <div className="medical-history-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    columnGap: '40px',
                    rowGap: '10px'
                }}>
                    {[
                        { label: 'DM (Diabetes Mellitus)', name: 'hasDM', duration: 'dmDuration' },
                        { label: 'Hypertension', name: 'hasHypertension', duration: 'hypertensionDuration' },
                        { label: 'Allergies', name: 'hasAllergies', duration: 'allergiesDuration' },
                        { label: 'Thyroid', name: 'hasThyroid', duration: 'thyroidDuration' },
                        { label: 'Asthma', name: 'hasAsthma', duration: 'asthmaDuration' }
                    ].map((item) => (
                        <div key={item.name} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '10px',
                            borderBottom: '1px solid #f0f4f8'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#4a5568' }}>{item.label}</span>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <label className="radio-option" style={{ border: 'none', padding: 0 }}>
                                        <input
                                            type="radio"
                                            name={item.name}
                                            value="Yes"
                                            checked={formData[item.name] === 'Yes'}
                                            onChange={handleChange}
                                        />
                                        <span style={{ fontSize: '0.85rem' }}>Yes</span>
                                    </label>
                                    <label className="radio-option" style={{ border: 'none', padding: 0 }}>
                                        <input
                                            type="radio"
                                            name={item.name}
                                            value="No"
                                            checked={formData[item.name] === 'No'}
                                            onChange={handleChange}
                                        />
                                        <span style={{ fontSize: '0.85rem' }}>No</span>
                                    </label>
                                </div>
                            </div>
                            {formData[item.name] === 'Yes' && (
                                <div style={{ marginTop: '5px' }}>
                                    <input
                                        type="text"
                                        name={item.duration}
                                        value={formData[item.duration]}
                                        onChange={handleChange}
                                        placeholder="Enter duration (e.g., 5 years)"
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '0.85rem',
                                            borderRadius: '4px',
                                            border: '1px solid #e2e8f0',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Other Medical History */}
            <Textarea
                label="Other Medical History"
                name="otherMedicalHistory"
                value={formData.otherMedicalHistory}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder="Any other relevant medical history"
            />

            {/* Ongoing Medications */}
            <Textarea
                label="Ongoing Medications"
                name="ongoingMedications"
                value={formData.ongoingMedications}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder="List all current medications"
            />

            {/* Surgical History */}
            <Textarea
                label="Surgical History"
                name="surgicalHistory"
                value={formData.surgicalHistory}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder="Previous surgeries and procedures"
            />

            {/* History Given By */}
            <TextInput
                label="History Given By"
                name="historyGivenBy"
                value={formData.historyGivenBy}
                onChange={handleChange}
                required
                placeholder="e.g., Patient, Relative, Guardian"
            />

            <button type="submit" className="submit-btn">Submit Initial Assessment</button>
        </form>
    );
};

export default InitialAssessmentForm;
