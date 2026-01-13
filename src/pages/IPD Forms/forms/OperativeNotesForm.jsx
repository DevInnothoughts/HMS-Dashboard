import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import './Forms.css';

const OperativeNotesForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        procedure: '',
        operativeNotesDetails: '',
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
                OPERATIVE NOTES
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
                <TextInput
                    label="Surgical Procedure"
                    name="procedure"
                    value={formData.procedure}
                    onChange={handleChange}
                    placeholder="Enter procedure name..."
                />

                <div style={{ marginTop: '2rem' }}>
                    <label className="field-label">Detailed Operative Notes</label>
                    <Textarea
                        name="operativeNotesDetails"
                        value={formData.operativeNotesDetails}
                        onChange={handleChange}
                        rows={20}
                        placeholder="Type detailed intra-operative notes here..."
                        textareaStyle={{
                            lineHeight: '1.8',
                            padding: '1.5rem',
                            fontSize: '1rem',
                            minHeight: '600px',
                            backgroundImage: 'linear-gradient(#f1f5f9 1.1px, transparent 1.1px)',
                            backgroundSize: '100% 1.8em'
                        }}
                    />
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '3rem' }}>
                    Save Operative Notes
                </button>
            </form>
        </div>
    );
};

export default OperativeNotesForm;
