import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const WHOTimeOutForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        allTeamMembersIntroduced: '',
        patientNameProcedureConfirmed: '',
        antibioticProphylaxis: '',
        antibioticTime: '',
        surgeonCriticalSteps: false,
        surgeonCaseDuration: false,
        surgeonBloodLoss: false,
        anaesthetistConcerns: false,
        nursingSterility: false,
        nursingEquipmentIssues: false,
        essentialImagingDisplayed: '',
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
                WHO SURGICAL SAFETY CHECKLIST: TIME OUT
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
                <h3 style={{ margin: 0, color: '#10b981', fontWeight: '800' }}>PHASE 2: BEFORE SKIN INCISION</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                    Requirement: Presence of Nurse, Anaesthetist and Surgeon
                </p>
            </div>

            <form onSubmit={handleSubmit} className="medical-form">
                <div className="section-box" style={{ padding: '2rem' }}>
                    <div className="form-field">
                        <label className="field-label">1) Confirm all team members have introduced themselves by name and role?</label>
                        <div className="radio-group">
                            {['Yes', 'No'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.allTeamMembersIntroduced === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="allTeamMembersIntroduced" value={opt} checked={formData.allTeamMembersIntroduced === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">2) Confirm patient's name, procedure, and where the incision will be made?</label>
                        <div className="radio-group">
                            {['Yes', 'No'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.patientNameProcedureConfirmed === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="patientNameProcedureConfirmed" value={opt} checked={formData.patientNameProcedureConfirmed === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">3) Antibiotic prophylaxis given within the last 60 minutes?</label>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <label className={`radio-option ${formData.antibioticProphylaxis === 'Yes' ? 'selected' : ''}`}>
                                <input type="radio" name="antibioticProphylaxis" value="Yes" checked={formData.antibioticProphylaxis === 'Yes'} onChange={handleChange} />
                                <span>Yes, administered at:</span>
                            </label>
                            <input
                                type="text"
                                name="antibioticTime"
                                value={formData.antibioticTime}
                                onChange={handleChange}
                                placeholder="HH:MM AM/PM"
                                style={{
                                    width: '140px',
                                    padding: '0.6rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    background: formData.antibioticProphylaxis === 'Yes' ? '#fff' : '#f1f5f9'
                                }}
                                disabled={formData.antibioticProphylaxis !== 'Yes'}
                            />
                            <label className={`radio-option ${formData.antibioticProphylaxis === 'Not applicable' ? 'selected' : ''}`}>
                                <input type="radio" name="antibioticProphylaxis" value="Not applicable" checked={formData.antibioticProphylaxis === 'Not applicable'} onChange={handleChange} />
                                <span>Not applicable</span>
                            </label>
                        </div>
                    </div>

                    <h4 style={{ margin: '2.5rem 0 1.5rem', color: '#10b981', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>4) Anticipated Critical Events</h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <p style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-main)' }}>SURGEON CONFIRMS:</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    { name: 'surgeonCriticalSteps', label: 'Critical or non-routine steps' },
                                    { name: 'surgeonCaseDuration', label: 'Expected case duration' },
                                    { name: 'surgeonBloodLoss', label: 'Anticipated blood loss' }
                                ].map(item => (
                                    <label key={item.name} className={`checkbox-option ${formData[item.name] ? 'selected' : ''}`} style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}>
                                        <input type="checkbox" name={item.name} checked={formData[item.name]} onChange={handleChange} />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-main)' }}>NURSING TEAM CONFIRMS:</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    { name: 'nursingSterility', label: 'Sterility (indicators results)' },
                                    { name: 'nursingEquipmentIssues', label: 'Equipment issues or concerns' }
                                ].map(item => (
                                    <label key={item.name} className={`checkbox-option ${formData[item.name] ? 'selected' : ''}`} style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}>
                                        <input type="checkbox" name={item.name} checked={formData[item.name]} onChange={handleChange} />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>

                            <p style={{ fontWeight: '800', fontSize: '0.85rem', margin: '1.5rem 0 1rem', color: 'var(--text-main)' }}>ANAESTHETIST CONFIRMS:</p>
                            <label className={`checkbox-option ${formData.anaesthetistConcerns ? 'selected' : ''}`} style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}>
                                <input type="checkbox" name="anaesthetistConcerns" checked={formData.anaesthetistConcerns} onChange={handleChange} />
                                <span>Patient-specific concerns</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-field" style={{ marginTop: '2.5rem' }}>
                        <label className="field-label">Is essential imaging displayed?</label>
                        <div className="radio-group">
                            {['Yes', 'Not applicable'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.essentialImagingDisplayed === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="essentialImagingDisplayed" value={opt} checked={formData.essentialImagingDisplayed === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="section-box" style={{ marginTop: '3rem', padding: '2rem', borderTop: '4px solid #10b981' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '2rem', alignItems: 'end' }}>
                        <TextInput label="Surgeon Name" name="surgeonName" value={formData.surgeonName} onChange={handleChange} />
                        <SignatureInput label="Digital Signature" name="surgeonSignature" value={formData.surgeonSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Auth Date & Time" name="surgeonDate" value={formData.surgeonDate} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '4rem' }}>
                    Complete Time Out Checklist
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

export default WHOTimeOutForm;
