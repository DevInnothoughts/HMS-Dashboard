import React, { useState } from 'react';
import CheckboxGroup from '../inputs/CheckboxGroup';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const WHOSurgicalSafetyChecklist = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        signIn: [],
        timeOut: [],
        signOut: [],
        circulatingNurse: '',
        circulatingSignature: '',
        circulatingDate: '',
        surgeonName: '',
        surgeonSignature: '',
        surgeonDate: '',
        scrubNurseName: '',
        scrubNurseSignature: '',
        scrubNurseDate: ''
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
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
                WHO SURGICAL SAFETY CHECKLIST
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

            {/* SIGN IN */}
            <h3>Before Induction of Anaesthesia (Sign In)</h3>
            <CheckboxGroup
                label=""
                name="signIn"
                value={formData.signIn}
                onChange={handleChange}
                options={[
                    'Patient identity, site & procedure confirmed',
                    'Consent obtained',
                    'Site marked / Not applicable',
                    'Anaesthesia machine & medication check complete',
                    'Known allergy checked',
                    'Difficult airway / aspiration risk assessed',
                    'Risk of >50 ml blood loss assessed',
                    'IV / Central access & fluids planned'
                ]}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px' }}>
                <TextInput
                    label="Circulating Nurse Name"
                    name="circulatingNurse"
                    value={formData.circulatingNurse}
                    onChange={handleChange}
                />
                <SignatureInput
                    label="Signature"
                    name="circulatingSignature"
                    value={formData.circulatingSignature}
                    onChange={handleChange}
                />
                <MuiDateTimePicker
                    label="Date & Time"
                    name="circulatingDate"
                    value={formData.circulatingDate}
                    onChange={handleChange}
                />
            </div>

            <hr />

            {/* TIME OUT */}
            <h3>Before Skin Incision (Time Out)</h3>
            <CheckboxGroup
                label=""
                name="timeOut"
                value={formData.timeOut}
                onChange={handleChange}
                options={[
                    'All team members introduced themselves',
                    'Patient name, procedure & incision site confirmed',
                    'Antibiotic prophylaxis given within 60 minutes',
                    'Critical steps & anticipated blood loss discussed',
                    'Anaesthesia concerns discussed',
                    'Sterility & equipment confirmed',
                    'Essential imaging displayed'
                ]}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px' }}>
                <TextInput
                    label="Surgeon Name"
                    name="surgeonName"
                    value={formData.surgeonName}
                    onChange={handleChange}
                />
                <SignatureInput
                    label="Signature"
                    name="surgeonSignature"
                    value={formData.surgeonSignature}
                    onChange={handleChange}
                />
                <MuiDateTimePicker
                    label="Date & Time"
                    name="surgeonDate"
                    value={formData.surgeonDate}
                    onChange={handleChange}
                />
            </div>

            <hr />

            {/* SIGN OUT */}
            <h3>Before Patient Leaves Operation Theatre (Sign Out)</h3>
            <CheckboxGroup
                label=""
                name="signOut"
                value={formData.signOut}
                onChange={handleChange}
                options={[
                    'Procedure name verbally confirmed',
                    'Instrument, sponge & needle counts complete',
                    'Specimen labeled correctly',
                    'Equipment problems addressed',
                    'Post-operative recovery concerns discussed'
                ]}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px' }}>
                <TextInput
                    label="Scrub Nurse Name"
                    name="scrubNurseName"
                    value={formData.scrubNurseName}
                    onChange={handleChange}
                />
                <SignatureInput
                    label="Signature"
                    name="scrubNurseSignature"
                    value={formData.scrubNurseSignature}
                    onChange={handleChange}
                />
                <MuiDateTimePicker
                    label="Date & Time"
                    name="scrubNurseDate"
                    value={formData.scrubNurseDate}
                    onChange={handleChange}
                />
            </div>

            <button type="submit" className="submit-btn">
                Submit WHO Surgical Checklist
            </button>
        </form>
    );
};

export default WHOSurgicalSafetyChecklist;
