import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import Textarea from '../inputs/Textarea';
import './Forms.css';

const ProgressNotesForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        progressDateTime: '',
        clinicalNotes: '',
        ipNo: patientData?.ipNo || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                DOCTOR'S PROGRESS NOTES
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
                        <span className="info-value">{formData.ipNo || '—'}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="medical-form">
                <div style={{ maxWidth: '300px', marginBottom: '1rem' }}>
                    <MuiDateTimePicker
                        label="Date & Time"
                        name="progressDateTime"
                        value={formData.progressDateTime}
                        onChange={handleChange}
                    />
                </div>

                <div className="notes-canvas">
                    <label className="field-label" style={{ marginBottom: '0.5rem' }}>Clinical Observations</label>
                    <Textarea
                        name="clinicalNotes"
                        value={formData.clinicalNotes}
                        onChange={handleChange}
                        rows={15}
                        placeholder="Type progression notes..."
                        textareaStyle={{
                            lineHeight: '1.6',
                            padding: '1.2rem',
                            fontSize: '0.9rem',
                            minHeight: '400px',
                            background: '#fff',
                            backgroundImage: 'linear-gradient(var(--border-color) 1.1px, transparent 1.1px)',
                            backgroundSize: '100% 1.6em',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <button type="submit" className="submit-btn" style={{ maxWidth: '300px' }}>Save Entry</button>
                </div>
            </form>
        </div>
    );
};

export default ProgressNotesForm;
