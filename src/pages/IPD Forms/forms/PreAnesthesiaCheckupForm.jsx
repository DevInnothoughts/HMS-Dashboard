import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import RadioGroup from '../inputs/RadioGroup';
import Textarea from '../inputs/Textarea';
import SignatureInput from '../inputs/SignatureInput';

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
        history: '', // For other history
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
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center', marginBottom: '20px', color: '#80deea', borderBottom: '2px solid #80deea', paddingBottom: '10px' }}>
                PRE-ANESTHESIA CHECKUP
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

            {/* Date & Doctor */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                <MuiDateTimePicker label="Date & Time" name="assessmentDateTime" value={formData.assessmentDateTime} onChange={handleChange} />
                <TextInput label="S/B Doctor" name="sbDoctor" value={formData.sbDoctor} onChange={handleChange} />
            </div>

            {/* ASA Grade */}
            <RadioGroup
                label="ASA Grade"
                name="asaGrade"
                value={formData.asaGrade}
                onChange={handleChange}
                options={[
                    { label: 'I', value: 'I' },
                    { label: 'II', value: 'II' },
                    { label: 'III', value: 'III' },
                    { label: 'IV', value: 'IV' },
                    { label: 'V', value: 'V' },
                    { label: 'VI', value: 'VI' }
                ]}
            />

            <TextInput label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
            <TextInput label="Posted For" name="postedFor" value={formData.postedFor} onChange={handleChange} />

            {/* Relevant History Section */}
            <div className="medical-history-section" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #80deea', paddingBottom: '8px', marginBottom: '15px', fontSize: '1rem' }}>Relevant History</h3>
                <div className="medical-history-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    columnGap: '40px',
                    rowGap: '10px',
                    marginBottom: '15px'
                }}>
                    {[
                        { label: 'DM (Diabetes Mellitus)', name: 'hasDM', duration: 'dmDuration' },
                        { label: 'Hypertension', name: 'hasHypertension', duration: 'hypertensionDuration' },
                        { label: 'IHD', name: 'hasIHD', duration: 'ihdDuration' },
                        { label: 'Asthma', name: 'hasAsthma', duration: 'asthmaDuration' },
                        { label: 'TB (Tuberculosis)', name: 'hasTB', duration: 'tbDuration' },
                        { label: 'Epilepsy', name: 'hasEpilepsy', duration: 'epilepsyDuration' },
                        { label: 'Previous Hospitalization', name: 'hasSurgery', duration: 'surgeryDuration' }
                    ].map((item) => (
                        <div key={item.name} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '8px',
                            borderBottom: '1px solid #f0f4f8'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#4a5568' }}>{item.label}</span>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    {['Yes', 'No'].map(opt => (
                                        <label key={opt} className="radio-option" style={{ border: 'none', padding: 0 }}>
                                            <input
                                                type="radio"
                                                name={item.name}
                                                value={opt}
                                                checked={formData[item.name] === opt}
                                                onChange={handleChange}
                                            />
                                            <span style={{ fontSize: '0.8rem' }}>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {formData[item.name] === 'Yes' && (
                                <div style={{ marginTop: '5px' }}>
                                    <input
                                        type="text"
                                        name={item.duration}
                                        value={formData[item.duration]}
                                        onChange={handleChange}
                                        placeholder="Duration / Details"
                                        style={{
                                            padding: '6px 10px',
                                            fontSize: '0.8rem',
                                            borderRadius: '4px',
                                            border: '1px solid #e2e8f0',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <Textarea label="Other History (Details)" name="history" value={formData.history} onChange={handleChange} rows={2} />
            </div>
            <Textarea label="Medication (Drug History)" name="medicationHistory" value={formData.medicationHistory} onChange={handleChange} />
            <Textarea label="Personal History (habits / allergies)" name="personalHistory" value={formData.personalHistory} onChange={handleChange} />

            {/* Vitals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                <TextInput label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
                <TextInput label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
                <TextInput label="G.C." name="gc" value={formData.gc} onChange={handleChange} />
                <TextInput label="Pulse" name="pulse" value={formData.pulse} onChange={handleChange} />
                <TextInput label="BP" name="bp" value={formData.bp} onChange={handleChange} />
                <TextInput label="RR" name="rr" value={formData.rr} onChange={handleChange} />
            </div>

            <Textarea label="General Examination (Pallor / Icterus / Clubbing /  Lymphadenopathy / Cyanosis / Edema)" name="generalFindings" value={formData.generalFindings} onChange={handleChange} />

            {/* Systemic History */}
<h3 style={{ marginTop: '20px', marginBottom: '10px' }}>
    Systemic History
</h3>

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
    <TextInput label="RS" name="systemicRS" value={formData.systemicRS} onChange={handleChange} />
    <TextInput label="CVS" name="systemicCVS" value={formData.systemicCVS} onChange={handleChange} />
    <TextInput label="CNS" name="systemicCNS" value={formData.systemicCNS} onChange={handleChange} />
    <TextInput label="PA" name="systemicPA" value={formData.systemicPA} onChange={handleChange} />
</div>

{/* Airway Examination */}
<h3 style={{ marginTop: '20px', marginBottom: '10px' }}>
    Airway Examination
</h3>

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
    <TextInput label="MPC" name="mpc" value={formData.mpc} onChange={handleChange} />
    <TextInput label="Neck Movement" name="neckMovement" value={formData.neckMovement} onChange={handleChange} />
    <TextInput label="Mouth Opening" name="mouthOpening" value={formData.mouthOpening} onChange={handleChange} />
    <TextInput label="Teeth" name="teeth" value={formData.teeth} onChange={handleChange} />
</div>


            <Textarea label="Investigations" name="investigations" value={formData.investigations} onChange={handleChange} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <TextInput label="ECG" name="ecg" value={formData.ecg} onChange={handleChange} />
                <TextInput label="Chest X-ray" name="chestXray" value={formData.chestXray} onChange={handleChange} />
            </div>

            <Textarea label="Plan of Anesthesia" name="anesthesiaPlan" value={formData.anesthesiaPlan} onChange={handleChange} />

            {/* Signature */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '10px', marginTop: '15px' }}>
                <TextInput label="Name of Anesthetist" name="anesthetistName" value={formData.anesthetistName} onChange={handleChange} />
                <SignatureInput label="Signature" name="anesthetistSignature" value={formData.anesthetistSignature} onChange={handleChange} />
                <MuiDateTimePicker label="Date & Time" name="anesthetistDateTime" value={formData.anesthetistDateTime} onChange={handleChange} />
            </div>

            <button type="submit" className="submit-btn">
                Submit PAC Form
            </button>
        </form>
    );
};

export default PreAnesthesiaCheckupForm;
