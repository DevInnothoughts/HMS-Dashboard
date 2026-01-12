import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import Textarea from '../inputs/Textarea';
import SignatureInput from '../inputs/SignatureInput';
import './Forms.css';

const PreAnesthesiaCheckupForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        assessmentDateTime: '',
        sbDoctor: '',
        asaGrade: '',
        diagnosis: '',
        postedFor: '',
        hasDM: '',
        hasHypertension: '',
        hasIHD: '',
        hasAsthma: '',
        hasTB: '',
        hasEpilepsy: '',
        hasSurgery: '',
        dmDuration: '',
        hypertensionDuration: '',
        ihdDuration: '',
        asthmaDuration: '',
        tbDuration: '',
        epilepsyDuration: '',
        surgeryDuration: '',
        history: '',
        medicationHistory: '',
        personalHistory: '',
        height: '',
        weight: '',
        pulse: '',
        bp: '',
        rr: '',
        generalFindings: '',
        systemicRS: '',
        systemicCVS: '',
        systemicCNS: '',
        systemicPA: '',
        mpc: '',
        neckMovement: '',
        mouthOpening: '',
        teeth: '',
        investigations: '',
        ecg: '',
        chestXray: '',
        anesthesiaPlan: '',
        anesthetistName: '',
        anesthetistSignature: '',
        anesthetistDateTime: ''
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
            <h2 className="form-title">PRE-ANESTHESIA CHECKUP (PAC)</h2>

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
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <MuiDateTimePicker label="PAC Date & Time" name="assessmentDateTime" value={formData.assessmentDateTime} onChange={handleChange} />
                    <TextInput label="S/B Doctor" name="sbDoctor" value={formData.sbDoctor} onChange={handleChange} />
                </div>

                <div className="form-field">
                    <label className="field-label">ASA Physical Status Classification</label>
                    <div className="radio-group">
                        {['I', 'II', 'III', 'IV', 'V', 'VI'].map(opt => (
                            <label key={opt} className={`radio-option ${formData.asaGrade === opt ? 'selected' : ''}`}>
                                <input type="radio" name="asaGrade" value={opt} checked={formData.asaGrade === opt} onChange={handleChange} />
                                <span>ASA {opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="two-col">
                    <TextInput label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
                    <TextInput label="Posted For (Surgery)" name="postedFor" value={formData.postedFor} onChange={handleChange} />
                </div>

                <h3 className="form-section-title">Co-morbidities & Relevant History</h3>
                <div className="section-box" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                        {[
                            { label: 'DM', name: 'hasDM', dur: 'dmDuration' },
                            { label: 'Hypertension', name: 'hasHypertension', dur: 'hypertensionDuration' },
                            { label: 'IHD', name: 'hasIHD', dur: 'ihdDuration' },
                            { label: 'Asthma', name: 'hasAsthma', dur: 'asthmaDuration' },
                            { label: 'TB', name: 'hasTB', dur: 'tbDuration' },
                            { label: 'Epilepsy', name: 'hasEpilepsy', dur: 'epilepsyDuration' },
                            { label: 'Prior Surgery', name: 'hasSurgery', dur: 'surgeryDuration' }
                        ].map((item) => (
                            <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{item.label}</span>
                                    <div className="radio-group" style={{ margin: 0 }}>
                                        {['Yes', 'No'].map(opt => (
                                            <label key={opt} className={`radio-option ${formData[item.name] === opt ? 'selected' : ''}`} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                                                <input type="radio" name={item.name} value={opt} checked={formData[item.name] === opt} onChange={handleChange} />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {formData[item.name] === 'Yes' && (
                                    <TextInput hideLabel name={item.dur} value={formData[item.dur]} onChange={handleChange} placeholder="Duration/Notes..." />
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                        <Textarea label="Other Medical History" name="history" value={formData.history} onChange={handleChange} rows={2} />
                    </div>
                </div>

                <div className="two-col">
                    <Textarea label="Current Medications" name="medicationHistory" value={formData.medicationHistory} onChange={handleChange} rows={3} />
                    <Textarea label="Personal History (Allergies/Habits)" name="personalHistory" value={formData.personalHistory} onChange={handleChange} rows={3} />
                </div>

                <h3 className="form-section-title">Physical & Airway Examination</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <TextInput label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
                    <TextInput label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
                    <TextInput label="Pulse" name="pulse" value={formData.pulse} onChange={handleChange} />
                    <TextInput label="BP" name="bp" value={formData.bp} onChange={handleChange} />
                    <TextInput label="RR" name="rr" value={formData.rr} onChange={handleChange} />
                </div>

                <Textarea label="General Physical Examination" name="generalFindings" value={formData.generalFindings} onChange={handleChange} rows={2} placeholder="Pallor, Icterus, Cyanosis, Edema, etc." />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                    <TextInput label="RS" name="systemicRS" value={formData.systemicRS} onChange={handleChange} placeholder="Respiratory System" />
                    <TextInput label="CVS" name="systemicCVS" value={formData.systemicCVS} onChange={handleChange} placeholder="Cardiovascular" />
                    <TextInput label="CNS" name="systemicCNS" value={formData.systemicCNS} onChange={handleChange} placeholder="Central Nervous System" />
                    <TextInput label="P/A" name="systemicPA" value={formData.systemicPA} onChange={handleChange} placeholder="Per Abdomen" />
                </div>

                <h4 style={{ margin: '2rem 0 1rem', color: 'var(--primary-color)', fontWeight: '700' }}>Airway Assessment</h4>
                <div className="section-box" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <TextInput label="MP Class" name="mpc" value={formData.mpc} onChange={handleChange} placeholder="Mallampati" />
                    <TextInput label="Neck Move." name="neckMovement" value={formData.neckMovement} onChange={handleChange} />
                    <TextInput label="Mouth Open." name="mouthOpening" value={formData.mouthOpening} onChange={handleChange} />
                    <TextInput label="Teeth/Dentition" name="teeth" value={formData.teeth} onChange={handleChange} />
                </div>

                <h3 className="form-section-title">Investigations & Plan</h3>
                <Textarea label="Routine & Special Investigations" name="investigations" value={formData.investigations} onChange={handleChange} rows={3} />

                <div className="two-col" style={{ marginTop: '1.5rem' }}>
                    <TextInput label="ECG Findings" name="ecg" value={formData.ecg} onChange={handleChange} />
                    <TextInput label="Chest X-Ray Findings" name="chestXray" value={formData.chestXray} onChange={handleChange} />
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <Textarea label="Anesthesia Plan" name="anesthesiaPlan" value={formData.anesthesiaPlan} onChange={handleChange} rows={3} placeholder="GA / Spinal / Epidural / Regional / MAC..." />
                </div>

                <div className="section-box" style={{ marginTop: '3rem', padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '2rem', alignItems: 'end' }}>
                        <TextInput label="Consultant Anesthetist" name="anesthetistName" value={formData.anesthetistName} onChange={handleChange} />
                        <SignatureInput label="Digital Signature" name="anesthetistSignature" value={formData.anesthetistSignature} onChange={handleChange} />
                        <MuiDateTimePicker label="Signed Date & Time" name="anesthetistDateTime" value={formData.anesthetistDateTime} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '3rem' }}>
                    Successfully Complete PAC
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

export default PreAnesthesiaCheckupForm;
