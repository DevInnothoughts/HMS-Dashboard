import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import DateInput from '../inputs/DateInput';
import Textarea from '../inputs/Textarea';
import CheckboxGroup from '../inputs/CheckboxGroup';
import RadioGroup from '../inputs/RadioGroup';
import SignatureInput from '../inputs/SignatureInput';
import './Forms.css';

const AnesthesiaConsentForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        // Consent specific fields
        anesthesiaType: '',

        // Signatures section
        patientSignature: '',
        patientDate: '',
        witnessName: '',
        witnessSignature: '',
        witnessDate: '',
        anaesthetistName: '',
        anaesthetistSignature: '',
        anaesthetistDate: '',

        // Attendant's consent
        reason: '',
        attendantName: '',
        relationship: '',
        attendantSignature: '',
        attendantDateTime: '',
        attendantWitness: '',
        attendantWitnessSignature: '',
        attendantWitnessDateTime: '',
        attendantAnaesthetistName: '',
        attendantAnaesthetistSignature: '',
        attendantAnaesthetistDateTime: ''
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
                <h2 className="form-title">ANESTHESIA CONSENT FORM</h2>

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

                <div className="form-field">
                    <TextInput
                        label="Type of Anesthesia"
                        name="anesthesiaType"
                        value={formData.anesthesiaType}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Primary Signatures */}
                <h3 className="form-section-title">Signatures</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '1rem 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                        <TextInput label="Patient name" name="patientName" value={patientData?.name || ''} readOnly />
                        <SignatureInput label="Signature" name="patientSignature" value={formData.patientSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="patientDate" value={formData.patientDate} onChange={handleChange} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '1.5rem', alignItems: 'end' }}>
                        <TextInput label="Witness name" name="witnessName" value={formData.witnessName} onChange={handleChange} />
                        <SignatureInput label="Signature" name="witnessSignature" value={formData.witnessSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="witnessDate" value={formData.witnessDate} onChange={handleChange} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '1.5rem', alignItems: 'end' }}>
                        <TextInput label="Anaesthetist name" name="anaesthetistName" value={formData.anaesthetistName} onChange={handleChange} />
                        <SignatureInput label="Signature" name="anaesthetistSignature" value={formData.anaesthetistSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="anaesthetistDate" value={formData.anaesthetistDate} onChange={handleChange} />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2.5rem 0' }} />

                <h3 className="form-section-title" style={{ justifyContent: 'center' }}>Attendant's consent (if applicable)</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', fontStyle: 'italic' }}>
                    If patient unable to give consent, state the reason: (minor/unconscious/under-sedation/incapacity, if other please specify...)
                </p>

                <div className="form-field">
                    <TextInput
                        label="Reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="State reason here"
                    />
                </div>

                <div className="two-col">
                    <TextInput label="Attendants name" name="attendantName" value={formData.attendantName} onChange={handleChange} />
                    <TextInput label="Relationship with patient" name="relationship" value={formData.relationship} onChange={handleChange} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                    <div className="two-col" style={{ alignItems: 'end' }}>
                        <SignatureInput label="Signature" name="attendantSignature" value={formData.attendantSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="attendantDateTime" value={formData.attendantDateTime} onChange={handleChange} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '1.5rem', alignItems: 'end' }}>
                        <TextInput label="Witness" name="attendantWitness" value={formData.attendantWitness} onChange={handleChange} />
                        <SignatureInput label="Signature" name="attendantWitnessSignature" value={formData.attendantWitnessSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="attendantWitnessDate" value={formData.attendantWitnessDateTime} onChange={handleChange} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '1.5rem', alignItems: 'end' }}>
                        <TextInput label="Anaesthetist name" name="attendantAnaesthetistName" value={formData.attendantAnaesthetistName} onChange={handleChange} />
                        <SignatureInput label="Signature" name="attendantAnaesthetistSignature" value={formData.attendantAnaesthetistSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="attendantAnaesthetistDate" value={formData.attendantAnaesthetistDateTime} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn">Submit Anesthesia Consent</button>
            </form>
        </div>
    );
};

export default AnesthesiaConsentForm;
