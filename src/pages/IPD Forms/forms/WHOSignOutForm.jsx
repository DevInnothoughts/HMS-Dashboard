import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const WHOSignOutForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        procedureNameConfirmed: false,
        countsCompleted: false,
        specimenLabeled: false,
        equipmentProblems: false,
        recoveryConcerns: false,
        scrubNurseName: '',
        scrubNurseSignature: '',
        scrubNurseDate: '',
        anaesthetistName: '',
        anaesthetistSignature: '',
        anaesthetistDate: '',
        surgeonName: '',
        surgeonSignature: '',
        surgeonDate: ''
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
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                WHO SURGICAL SAFETY CHECKLIST: SIGN OUT
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

            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontWeight: '800' }}>PHASE 3: BEFORE PATIENT LEAVES OPERATION THEATRE</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                    Requirement: Presence of Nurse, Anaesthetist and Surgeon
                </p>
            </div>

            <form onSubmit={handleSubmit} className="medical-form">
                <div className="section-box" style={{ padding: '2rem' }}>
                    <h4 style={{ margin: '0 0 1.5rem', color: 'var(--primary-color)', fontWeight: '700' }}>Nurse Verbally Confirms:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { name: 'procedureNameConfirmed', label: 'The name of the procedure' },
                            { name: 'countsCompleted', label: 'Completion of instrument, sponge and needle counts' },
                            { name: 'specimenLabeled', label: 'Specimen labeling (Read specimen labels aloud, including patient name)' },
                            { name: 'equipmentProblems', label: 'Whether there are any equipment problems to be addressed' }
                        ].map(item => (
                            <label key={item.name} className={`checkbox-option ${formData[item.name] ? 'selected' : ''}`} style={{ fontSize: '1rem', padding: '1rem' }}>
                                <input type="checkbox" name={item.name} checked={formData[item.name]} onChange={handleChange} />
                                <span>{item.label}</span>
                            </label>
                        ))}
                    </div>

                    <h4 style={{ margin: '2.5rem 0 1.5rem', color: 'var(--primary-color)', fontWeight: '700' }}>To Surgeon, Anaesthetist & Nursing Team:</h4>
                    <label className={`checkbox-option ${formData.recoveryConcerns ? 'selected' : ''}`} style={{ fontSize: '1rem', padding: '1rem', border: '2px solid #fbbf24', background: formData.recoveryConcerns ? '#fffbeb' : 'transparent' }}>
                        <input type="checkbox" name="recoveryConcerns" checked={formData.recoveryConcerns} onChange={handleChange} />
                        <span>What are the key concerns for recovery and management of this patient?</span>
                    </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '3rem' }}>
                    <div className="section-box" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary-color)' }}>
                        <h4 style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.85rem' }}>SCRUB NURSE</h4>
                        <TextInput label="Name" name="scrubNurseName" value={formData.scrubNurseName} onChange={handleChange} />
                        <SignatureInput label="Signature" name="scrubNurseSignature" value={formData.scrubNurseSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Signed On" name="scrubNurseDate" value={formData.scrubNurseDate} onChange={handleChange} />
                    </div>

                    <div className="section-box" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
                        <h4 style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.85rem' }}>ANAESTHETIST</h4>
                        <TextInput label="Dr. Name" name="anaesthetistName" value={formData.anaesthetistName} onChange={handleChange} />
                        <SignatureInput label="Signature" name="anaesthetistSignature" value={formData.anaesthetistSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Signed On" name="anaesthetistDate" value={formData.anaesthetistDate} onChange={handleChange} />
                    </div>

                    <div className="section-box" style={{ padding: '1.5rem', borderTop: '4px solid #3b82f6' }}>
                        <h4 style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.85rem' }}>SURGEON</h4>
                        <TextInput label="Dr. Name" name="surgeonName" value={formData.surgeonName} onChange={handleChange} />
                        <SignatureInput label="Signature" name="surgeonSignature" value={formData.surgeonSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Signed On" name="surgeonDate" value={formData.surgeonDate} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '4rem' }}>
                    Successfully Complete Sign Out
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

export default WHOSignOutForm;
