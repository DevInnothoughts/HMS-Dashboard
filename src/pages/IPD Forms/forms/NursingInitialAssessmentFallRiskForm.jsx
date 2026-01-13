import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import RadioGroup from '../inputs/RadioGroup';
import CheckboxGroup from '../inputs/CheckboxGroup';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const NursingInitialAssessmentFallRiskForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        morseFallScore: '',
        riskLevel: '',
        painScore: '',
        painLocation: '',
        bradenScore: '',
        pressureSore: '',
        devices: [],
        centralLineDate: '',
        foleyDate: '',
        peripheralDate: '',
        rtDate: '',
        otherDeviceDate: '',
        assessedBy: '',
        assessmentDate: '',
        assessmentTime: ''
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
                NURSING INITIAL ASSESSMENT (FALL RISK)
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
                <h3 className="form-section-title">Fall Risk Assessment (Morse Scale)</h3>
                <div className="two-col">
                    <TextInput
                        label="Morse Fall Scale Score"
                        name="morseFallScore"
                        value={formData.morseFallScore}
                        onChange={handleChange}
                        placeholder="Enter total score"
                    />
                    <RadioGroup
                        label="Fall Risk Level"
                        name="riskLevel"
                        value={formData.riskLevel}
                        onChange={handleChange}
                        options={[
                            { label: 'No Risk (0–24)', value: 'no-risk' },
                            { label: 'Low Risk (25–50)', value: 'low-risk' },
                            { label: 'High Risk (>50)', value: 'high-risk' }
                        ]}
                    />
                </div>

                {/* Pain & Skin */}
                <h3 className="form-section-title">Pain & Skin Assessment</h3>
                <div className="two-col">
                    <div className="form-grid">
                        <TextInput
                            label="Pain Score"
                            name="painScore"
                            value={formData.painScore}
                            onChange={handleChange}
                        />
                        <TextInput
                            label="Pain Location"
                            name="painLocation"
                            value={formData.painLocation}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-grid">
                        <TextInput
                            label="Braden Score"
                            name="bradenScore"
                            value={formData.bradenScore}
                            onChange={handleChange}
                        />
                        <RadioGroup
                            label="Pressure Sore"
                            name="pressureSore"
                            value={formData.pressureSore}
                            onChange={handleChange}
                            options={[
                                { label: 'Existing', value: 'existing' },
                                { label: 'Prospective', value: 'prospective' }
                            ]}
                        />
                    </div>
                </div>

                {/* Devices */}
                <h3 className="form-section-title">Medical Devices</h3>
                <div className="form-field">
                    <CheckboxGroup
                        label="Patient Having Devices"
                        name="devices"
                        value={formData.devices}
                        onChange={(vals) => setFormData(prev => ({ ...prev, devices: vals }))}
                        options={[
                            'Central Line',
                            'Foleys Catheter',
                            'Peripheral Line',
                            'RT',
                            'Any Other'
                        ]}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                    <MuiDateTimePicker type="date" label="Central Line Date" name="centralLineDate" value={formData.centralLineDate} onChange={handleChange} />
                    <MuiDateTimePicker type="date" label="Foleys Catheter Date" name="foleyDate" value={formData.foleyDate} onChange={handleChange} />
                    <MuiDateTimePicker type="date" label="Peripheral Line Date" name="peripheralDate" value={formData.peripheralDate} onChange={handleChange} />
                    <MuiDateTimePicker type="date" label="RT Date" name="rtDate" value={formData.rtDate} onChange={handleChange} />
                </div>

                {/* Assessment */}
                <h3 className="form-section-title">Verification</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                    <TextInput
                        label="Assessment Done By (Name)"
                        name="assessedBy"
                        value={formData.assessedBy}
                        onChange={handleChange}
                    />
                    <MuiDateTimePicker
                        label="Assessment Date & Time"
                        name="assessmentDate"
                        value={formData.assessmentDate}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '2.5rem' }}>
                    Submit Nursing Assessment
                </button>
            </form>
        </div>
    );
};

export default NursingInitialAssessmentFallRiskForm;
