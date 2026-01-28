import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import SignatureInput from '../inputs/SignatureInput';
import './Forms.css'; // Importing your shared CSS

const AnesthesiaConsentForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        anesthesiaType: '',
        patientSignature: '',
        patientDate: null,
        witnessName: '',
        witnessSignature: '',
        witnessDate: null,
        anaesthetistName: '',
        anaesthetistSignature: '',
        anaesthetistDate: null,
        reason: '',
        attendantName: '',
        relationship: '',
        attendantSignature: '',
        attendantDateTime: null,
        attendantWitness: '',
        attendantWitnessSignature: '',
        attendantWitnessDateTime: null,
        attendantAnaesthetistName: '',
        attendantAnaesthetistSignature: '',
        attendantAnaesthetistDateTime: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <div className="medical-form-container">
            <form onSubmit={handleSubmit}>
                <h2 className="form-title">ANESTHESIA CONSENT FORM</h2>

                {/* Patient Header */}
                {patientData && (
                    <div className="patient-compact-header">
                        <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{patientData.uhid}</span></div>
                        <div className="info-item"><span className="info-label">Patient Name</span><span className="info-value">{patientData.name}</span></div>
                        <div className="info-item"><span className="info-label">Age/Sex</span><span className="info-value">{patientData.age}/{patientData.gender}</span></div>
                        <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{patientData.ipNo}</span></div>
                    </div>
                )}

                {/* Anesthesia Details */}
                <div className="section-box">
                    <div className="form-section-title">Consent Details</div>
                    <div className="form-field">
                        <TextInput
                            label="Proposed Type of Anesthesia"
                            name="anesthesiaType"
                            value={formData.anesthesiaType}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Primary Signatures */}
                <div className="section-box">
                    <div className="form-section-title">Primary Signatures (Patient)</div>
                    
                    <div className="three-col" style={{ alignItems: 'flex-end', marginBottom: '15px' }}>
                        <TextInput label="Patient Name" value={patientData?.name || ''} readOnly />
                        <SignatureInput label="Signature" name="patientSignature" value={formData.patientSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="patientDate" value={formData.patientDate} onChange={handleChange} />
                    </div>

                    <div className="three-col" style={{ alignItems: 'flex-end', marginBottom: '15px' }}>
                        <TextInput label="Witness Name" name="witnessName" value={formData.witnessName} onChange={handleChange} />
                        <SignatureInput label="Signature" name="witnessSignature" value={formData.witnessSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="witnessDate" value={formData.witnessDate} onChange={handleChange} />
                    </div>

                    <div className="three-col" style={{ alignItems: 'flex-end' }}>
                        <TextInput label="Anaesthetist Name" name="anaesthetistName" value={formData.anaesthetistName} onChange={handleChange} />
                        <SignatureInput label="Signature" name="anaesthetistSignature" value={formData.anaesthetistSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="anaesthetistDate" value={formData.anaesthetistDate} onChange={handleChange} />
                    </div>
                </div>

                {/* Attendant Consent */}
                <div className="section-box" style={{ borderTop: '3px solid var(--primary-color)' }}>
                    <div className="form-section-title">Attendant's Consent (If Applicable)</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Required if patient is a minor, unconscious, or otherwise incapacitated.
                    </p>
                    
                    <div className="form-field">
                        <TextInput
                            label="Reason for Attendant Consent"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="e.g., Minor, Unconscious, Sedation"
                        />
                    </div>

                    <div className="two-col">
                        <TextInput label="Attendant Name" name="attendantName" value={formData.attendantName} onChange={handleChange} />
                        <TextInput label="Relationship with Patient" name="relationship" value={formData.relationship} onChange={handleChange} />
                    </div>

                    <div className="two-col" style={{ alignItems: 'flex-end', marginTop: '10px' }}>
                        <SignatureInput label="Attendant Signature" name="attendantSignature" value={formData.attendantSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="attendantDateTime" value={formData.attendantDateTime} onChange={handleChange} />
                    </div>

                    <div className="three-col" style={{ alignItems: 'flex-end', marginTop: '15px' }}>
                        <TextInput label="Witness Name" name="attendantWitness" value={formData.attendantWitness} onChange={handleChange} />
                        <SignatureInput label="Signature" name="attendantWitnessSignature" value={formData.attendantWitnessSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="attendantWitnessDate" value={formData.attendantWitnessDateTime} onChange={handleChange} />
                    </div>

                    <div className="three-col" style={{ alignItems: 'flex-end', marginTop: '15px' }}>
                        <TextInput label="Anaesthetist Name" name="attendantAnaesthetistName" value={formData.attendantAnaesthetistName} onChange={handleChange} />
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