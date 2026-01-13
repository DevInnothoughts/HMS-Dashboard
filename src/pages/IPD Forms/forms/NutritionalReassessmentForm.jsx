import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const NutritionalReassessmentForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        reassessments: [
            { dateTime: '', remark: '', prescribedDiet: '', dietitianSign: '' }
        ]
    });

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
                { dateTime: '', remark: '', prescribedDiet: '', dietitianSign: '' }
            ]
        }));
    };

    const removeRow = (index) => {
        if (formData.reassessments.length > 1) {
            const updated = formData.reassessments.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, reassessments: updated }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                NUTRITIONAL REASSESSMENT
            </h2>

            {/* Compact Patient Header */}
            {patientData && (
                <div className="patient-compact-header">
                    <div className="info-item">
                        <span className="info-label">UHID</span>
                        <span className="info-value">{patientData.uhid}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Patient Name</span>
                        <span className="info-value">{patientData.name}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Age</span>
                        <span className="info-value">{patientData.age}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Gender</span>
                        <span className="info-value">{patientData.gender}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">IP No</span>
                        <span className="info-value">{patientData.ipNo}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="medical-form">
                <h3 className="form-section-title">Reassessment Log</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {formData.reassessments.map((row, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1.2fr 2fr 1.5fr 1.5fr auto',
                                gap: '1rem',
                                padding: '1.25rem',
                                background: '#ffffff',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                alignItems: 'end',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        >
                            <MuiDateTimePicker
                                label="Date & Time"
                                value={row.dateTime}
                                onChange={(e) => handleReassessmentChange(index, 'dateTime', e.target.value)}
                            />
                            <TextInput
                                label="Clinical Remark"
                                value={row.remark}
                                onChange={(e) => handleReassessmentChange(index, 'remark', e.target.value)}
                            />
                            <TextInput
                                label="Prescribed Diet"
                                value={row.prescribedDiet}
                                onChange={(e) => handleReassessmentChange(index, 'prescribedDiet', e.target.value)}
                            />
                            <TextInput
                                label="Dietitian Name"
                                value={row.dietitianSign}
                                onChange={(e) => handleReassessmentChange(index, 'dietitianSign', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem', visibility: formData.reassessments.length > 1 ? 'visible' : 'hidden' }}
                                title="Remove Entry"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button
                        type="button"
                        onClick={addRow}
                        className="secondary-btn"
                    >
                        + Add Reassessment Note
                    </button>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '3rem' }}>
                    Save Reassessment Log
                </button>
            </form>
        </div>
    );
};

export default NutritionalReassessmentForm;
