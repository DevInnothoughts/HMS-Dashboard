import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const AdverseDrugCorrectiveActionForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        medicalAdministratorName: '',
        adminDateTime: '',
        medicalDirectorComments: '',
        medicalDirectorSign: '',
        medicalDirectorDate: '',
        correctiveAction: '',
        preventiveAction: '',
        actionPlan: '',
        verifiedByName: '',
        verifiedBySign: '',
        verifiedDate: '',
        verifiedTime: ''
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
            <form onSubmit={handleSubmit} className="medical-form">
                <h2 className="form-title">
                    ADVERSE DRUG REPORT – CORRECTIVE & PREVENTIVE ACTION
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

                {/* Medical Administrator */}
                <div className="two-col">
                    <TextInput
                        label="Medical Administrator Name"
                        name="medicalAdministratorName"
                        value={formData.medicalAdministratorName}
                        onChange={handleChange}
                    />
                    <MuiDateTimePicker
                        label="Date & Time"
                        name="adminDateTime"
                        value={formData.adminDateTime}
                        onChange={handleChange}
                    />
                </div>

                <Textarea
                    label="Medical Director’s Comments"
                    name="medicalDirectorComments"
                    value={formData.medicalDirectorComments}
                    onChange={handleChange}
                    rows={4}
                />

                <div className="two-col">
                    <SignatureInput
                        label="Medical Director Signature"
                        name="medicalDirectorSign"
                        value={formData.medicalDirectorSign}
                        onChange={handleChange}
                    />
                    <MuiDateTimePicker
                        type="date"
                        label="Date"
                        name="medicalDirectorDate"
                        value={formData.medicalDirectorDate}
                        onChange={handleChange}
                    />
                </div>

                {/* Actions */}
                <div className="two-col">
                    <Textarea
                        label="Corrective Action"
                        name="correctiveAction"
                        value={formData.correctiveAction}
                        onChange={handleChange}
                        rows={3}
                    />
                    <Textarea
                        label="Preventive Action"
                        name="preventiveAction"
                        value={formData.preventiveAction}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>

                <Textarea
                    label="Action Plan"
                    name="actionPlan"
                    value={formData.actionPlan}
                    onChange={handleChange}
                    rows={3}
                />

                {/* Verification */}
                <h3 className="form-section-title">Action Verified By</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '1.5rem', alignItems: 'end' }}>
                    <TextInput
                        label="Name"
                        name="verifiedByName"
                        value={formData.verifiedByName}
                        onChange={handleChange}
                    />
                    <SignatureInput
                        label="Signature"
                        name="verifiedBySign"
                        value={formData.verifiedBySign}
                        onChange={handleChange}
                    />
                    <MuiDateTimePicker
                        label="Verification Date & Time"
                        name="verifiedDate"
                        value={formData.verifiedDate}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Submit Corrective Action Report
                </button>
            </form>
        </div>
    );
};

export default AdverseDrugCorrectiveActionForm;
