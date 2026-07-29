import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';

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
        <div className="medical-form operative-notes-form">
            <h2 className="form-title" style={{ textAlign: 'center', marginBottom: '30px', color: '#80deea', borderBottom: '2px solid #80deea', paddingBottom: '10px' }}>
                OT NOTES
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

            <form onSubmit={handleSubmit} className="compact-form">
                <TextInput
                    label="Procedure:"
                    name="procedure"
                    value={formData.procedure}
                    onChange={handleChange}
                    placeholder="Enter procedure..."
                />

                <div className="notes-container" style={{ position: 'relative', marginTop: '15px' }}>
                    <Textarea
                        name="operativeNotesDetails"
                        value={formData.operativeNotesDetails}
                        onChange={handleChange}
                        rows={20}
                        placeholder="Enter operative notes here..."
                        style={{
                            lineHeight: '32px',
                            padding: '8px 15px',
                            border: '2px solid #e1e8ed',
                            borderRadius: '6px',
                            width: '100%',
                            fontSize: '1rem',
                            minHeight: '500px'
                        }}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Save Operative Notes
                </button>
            </form>
        </div>
    );
};

export default OperativeNotesForm;
