import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const WHOSignInForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        confirmedIdentity: '',
        siteMarked: '',
        anaesthesiaCheck: '',
        knownAllergy: '',
        difficultAirway: '',
        bloodLossRisk: '',
        circulatingNurse: '',
        circulatingSignature: '',
        circulatingDate: '',
        anaesthetistName: '',
        anaesthetistSignature: '',
        anaesthetistDate: ''
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
            <h2 className="form-title">
                WHO SURGICAL SAFETY CHECKLIST: SIGN IN
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
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontWeight: '800' }}>PHASE 1: BEFORE INDUCTION OF ANAESTHESIA</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                    Requirement: Presence of at least Nurse and Anaesthetist
                </p>
            </div>

            <form onSubmit={handleSubmit} className="medical-form">
                <div className="section-box" style={{ padding: '2rem' }}>
                    <div className="form-field">
                        <label className="field-label">Patient has confirmed Identity, Site, Procedure & Consent?</label>
                        <div className="radio-group">
                            {['Yes', 'No'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.confirmedIdentity === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="confirmedIdentity" value={opt} checked={formData.confirmedIdentity === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">Is the surgical site marked?</label>
                        <div className="radio-group">
                            {['Yes', 'Not applicable'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.siteMarked === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="siteMarked" value={opt} checked={formData.siteMarked === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">Anaesthesia machine and medication check complete?</label>
                        <div className="radio-group">
                            {['Yes', 'No'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.anaesthesiaCheck === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="anaesthesiaCheck" value={opt} checked={formData.anaesthesiaCheck === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <h4 style={{ margin: '2rem 0 1rem', color: 'var(--primary-color)', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Risk Assessment</h4>

                    <div className="form-field">
                        <label className="field-label">Does the patient have a known allergy?</label>
                        <div className="radio-group">
                            {['No', 'Yes'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.knownAllergy === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="knownAllergy" value={opt} checked={formData.knownAllergy === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">Difficult airway or aspiration risk?</label>
                        <div className="radio-group">
                            {['No', 'Yes and equipment/assistance available'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.difficultAirway === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="difficultAirway" value={opt} checked={formData.difficultAirway === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="field-label">Risk of &gt;500ml blood loss (7ml/kg in children)?</label>
                        <div className="radio-group">
                            {['No', 'Yes and two IV/Central access and fluids planned'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.bloodLossRisk === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="bloodLossRisk" value={opt} checked={formData.bloodLossRisk === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="two-col" style={{ marginTop: '3rem' }}>
                    <div className="section-box" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                        <h4 style={{ margin: '0 0 1.5rem', fontWeight: '800', fontSize: '0.9rem' }}>CIRCULATING NURSE</h4>
                        <TextInput label="Name" name="circulatingNurse" value={formData.circulatingNurse} onChange={handleChange} />
                        <SignatureInput label="Digital Signature" name="circulatingSignature" value={formData.circulatingSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Signed On" name="circulatingDate" value={formData.circulatingDate} onChange={handleChange} />
                    </div>

                    <div className="section-box" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                        <h4 style={{ margin: '0 0 1.5rem', fontWeight: '800', fontSize: '0.9rem' }}>ANAESTHETIST</h4>
                        <TextInput label="Dr. Name" name="anaesthetistName" value={formData.anaesthetistName} onChange={handleChange} />
                        <SignatureInput label="Digital Signature" name="anaesthetistSignature" value={formData.anaesthetistSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Signed On" name="anaesthetistDate" value={formData.anaesthetistDate} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '4rem' }}>
                    Complete Sign In Checklist
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

export default WHOSignInForm;
