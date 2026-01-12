import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const SurgeryConsentForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        uhid: patientData?.uhid || '',
        patientName: patientData?.name || '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        ipNo: patientData?.ipNo || '',

        authorizedPerson: '',
        authorizingDr: '',
        procedureName: '',
        specificRisks: '',

        agreementChecked: false,

        patientSignDate: '',
        patientSignTime: '',

        witnessName: '',
        relationWithPatient: '',
        witnessDate: '',
        witnessTime: '',

        surgeonName: patientData?.doctorName || '',
        surgeonDate: '',
        surgeonTime: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.agreementChecked) {
            alert('Please agree to the terms and policy before submitting.');
            return;
        }
        onSubmit && onSubmit(formData);
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                INFORMED CONSENT FOR SURGERY / PROCEDURE
            </h2>

            {/* Compact Patient Header */}
            <div className="patient-compact-header">
                <div className="info-item">
                    <span className="info-label">UHID</span>
                    <span className="info-value">{formData.uhid}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Patient Name</span>
                    <span className="info-value">{formData.patientName}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{formData.age}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{formData.gender}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">IP No</span>
                    <span className="info-value">{formData.ipNo}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="medical-form">
                <div className="section-box" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <p style={{ lineHeight: '1.8', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                        I/We hereby authorize
                        <span style={{ display: 'inline-block', minWidth: '200px', margin: '0 10px' }}>
                            <TextInput hideLabel name="authorizingDr" value={formData.authorizingDr} onChange={handleChange} placeholder="Dr. Name" />
                        </span>
                        and his/her assistants to perform the following operation/procedure:
                    </p>
                    <TextInput
                        label="Proposed Procedure"
                        name="procedureName"
                        value={formData.procedureName}
                        onChange={handleChange}
                        placeholder="Detailed surgical procedure name..."
                    />

                    <div style={{ marginTop: '2rem' }}>
                        <label className="field-label">Significant Risks / Complications associated with this procedure:</label>
                        <TextInput
                            hideLabel
                            name="specificRisks"
                            value={formData.specificRisks}
                            onChange={handleChange}
                            placeholder="Specify procedure-specific risks communicated..."
                        />
                    </div>
                </div>

                <div className="section-box" style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1.5rem', marginBottom: '3rem' }}>
                    <label className={`checkbox-option ${formData.agreementChecked ? 'selected' : ''}`} style={{ alignSelf: 'center', fontSize: '1rem', fontWeight: '700', color: '#0f766e' }}>
                        <input
                            type="checkbox"
                            name="agreementChecked"
                            checked={formData.agreementChecked}
                            onChange={handleChange}
                            required
                        />
                        <span>I have been explained the procedure, its benefits, risks, and alternatives in a language I understand. I give my voluntary consent.</span>
                    </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div className="sign-column">
                        <h3 className="form-section-title">Patient / Guardian</h3>
                        <div className="section-box" style={{ padding: '1.5rem' }}>
                            <TextInput label="Responsible Person Name" name="authorizedPerson" value={formData.authorizedPerson} onChange={handleChange} />
                            <div className="two-col" style={{ marginTop: '1rem' }}>
                                <MuiDateTimePicker type="date" label="Date" name="patientSignDate" value={formData.patientSignDate} onChange={handleChange} />
                                <MuiDateTimePicker type="time" label="Time" name="patientSignTime" value={formData.patientSignTime} onChange={handleChange} />
                            </div>
                        </div>

                        <h3 className="form-section-title" style={{ marginTop: '2rem' }}>Witness</h3>
                        <div className="section-box" style={{ padding: '1.5rem' }}>
                            <TextInput label="Full Name" name="witnessName" value={formData.witnessName} onChange={handleChange} />
                            <TextInput label="Relationship" name="relationWithPatient" value={formData.relationWithPatient} onChange={handleChange} />
                            <div className="two-col" style={{ marginTop: '1rem' }}>
                                <MuiDateTimePicker type="date" label="Date" name="witnessDate" value={formData.witnessDate} onChange={handleChange} />
                                <MuiDateTimePicker type="time" label="Time" name="witnessTime" value={formData.witnessTime} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="sign-column">
                        <h3 className="form-section-title">Surgeon Declaration</h3>
                        <div className="section-box" style={{ padding: '1.5rem', height: '100%' }}>
                            <TextInput label="Surgeon Name" name="surgeonName" value={formData.surgeonName} onChange={handleChange} />
                            <div className="two-col" style={{ marginTop: '1rem' }}>
                                <MuiDateTimePicker type="date" label="Date" name="surgeonDate" value={formData.surgeonDate} onChange={handleChange} />
                                <MuiDateTimePicker type="time" label="Time" name="surgeonTime" value={formData.surgeonTime} onChange={handleChange} />
                            </div>
                            <div style={{ marginTop: '2rem', border: '1px dashed var(--border-color)', borderRadius: '12px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                                ( Surgeon Signature & Stamp )
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '4rem' }}>
                    Accept & Finalize Consent
                </button>
            </form>

            <style>{`
                .section-box {
                    background: #ffffff;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
            `}</style>
        </div>
    );
};

export default SurgeryConsentForm;
