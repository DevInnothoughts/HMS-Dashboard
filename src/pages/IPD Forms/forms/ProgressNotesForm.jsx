import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import Textarea from '../inputs/Textarea';

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
        <div className="medical-form progress-notes-form">
            <h2 className="form-title" style={{ textAlign: 'center', marginBottom: '20px', color: '#80deea', borderBottom: '2px solid #80deea', paddingBottom: '10px' }}>
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

            <form onSubmit={handleSubmit} className="compact-form">
                <MuiDateTimePicker
                    label="Progress Date & Time"
                    name="progressDateTime"
                    value={formData.progressDateTime}
                    onChange={handleChange}
                />

                <div className="notes-container" style={{ position: 'relative' }}>
                    <Textarea
                        label="Clinical Notes / Progress"
                        name="clinicalNotes"
                        value={formData.clinicalNotes}
                        onChange={handleChange}
                        rows={25}
                        placeholder="Enter clinical progress notes here..."
                        style={{
                            lineHeight: '32px',
                            padding: '8px 15px',
                            border: '2px solid #e1e8ed',
                            borderRadius: '6px',
                            width: '100%',
                            fontSize: '1rem',
                            minHeight: '600px'
                        }}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Save Progress Notes
                </button>
            </form>
        </div>
    );
};

export default ProgressNotesForm;
