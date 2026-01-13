import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const PreOpOrderForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',

        vitals: { temp: '', pulse: '', resp: '', bp: '' },
        consents: { highRisk: false, surgery: false, anesthesia: false, implant: false },
        preparation: { enema: false, colonHydrotherapy: false },

        investigations: [],
        investigationsOther: '',

        fitness: [],

        medications: {
            antibiotics: [],
            antibioticsOther: '',
            antacid: [],
            fluids: [],
            fluidsOther: '',
            other: ''
        },

        specialRequirements: [],
        specialOther: '',

        doctorName: '',
        dateTime: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleListChange = (section, item) => {
        setFormData(prev => {
            const current = Array.isArray(prev[section]) ? prev[section] : prev.medications[section];
            const updated = current.includes(item)
                ? current.filter(i => i !== item)
                : [...current, item];

            if (Array.isArray(prev[section])) {
                return { ...prev, [section]: updated };
            } else {
                return {
                    ...prev,
                    medications: { ...prev.medications, [section]: updated }
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">PRE OPERATIVE ORDERS (PRE-OP)</h2>

            {/* Compact Patient Header */}
            <div className="patient-compact-header">
                <div className="info-item">
                    <span className="info-label">UHID</span>
                    <span className="info-value">{formData.uhid}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Patient Name</span>
                    <span className="info-value">{formData.name}</span>
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
                <div className="form-body-split">
                    <div className="left-side">
                        <div className="section-box">
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Vitals & Preparation</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                <TextInput label="Temp (°F)" name="vitals.temp" value={formData.vitals.temp} onChange={handleChange} />
                                <TextInput label="Pulse" name="vitals.pulse" value={formData.vitals.pulse} onChange={handleChange} />
                                <TextInput label="Resp" name="vitals.resp" value={formData.vitals.resp} onChange={handleChange} />
                                <TextInput label="BP" name="vitals.bp" value={formData.vitals.bp} onChange={handleChange} />
                            </div>

                            <div className="form-field" style={{ marginTop: '1rem' }}>
                                <label className="field-label">Part Preparation</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {[
                                        ['enema', 'Enema'], ['colonHydrotherapy', 'Hydrotherapy']
                                    ].map(([key, label]) => (
                                        <label key={key} className={`checkbox-option ${formData.preparation[key] ? 'selected' : ''}`} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                                            <input type="checkbox" name={`preparation.${key}`} checked={formData.preparation[key]} onChange={handleChange} />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="section-box">
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Consents obtained</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {[
                                    ['highRisk', 'High Risk'], ['surgery', 'Surgery'],
                                    ['anesthesia', 'Anesthesia'], ['implant', 'Implant']
                                ].map(([key, label]) => (
                                    <label key={key} className={`checkbox-option ${formData.consents[key] ? 'selected' : ''}`} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                                        <input type="checkbox" name={`consents.${key}`} checked={formData.consents[key]} onChange={handleChange} />
                                        <span>{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="section-box">
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Fitness Clearance</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {['ANESTHESIA', 'PHYSICIAN', 'CARDIAC'].map(item => (
                                    <label key={item} className={`checkbox-option ${formData.fitness.includes(item) ? 'selected' : ''}`} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                                        <input type="checkbox" checked={formData.fitness.includes(item)} onChange={() => handleListChange('fitness', item)} />
                                        <span>{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-side">
                        <div className="section-box">
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Investigations</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                                {[
                                    'CBC', 'BSL', 'Creatinine', 'BT/CT', 'PT/INR', 'HIV',
                                    'HBsAg', 'HCV', 'USG', 'ECG', 'Doppler',
                                    'CT Scan', 'X-Ray', '2D Echo', 'MRI'
                                ].map(item => (
                                    <label key={item} className={`checkbox-option ${formData.investigations.includes(item) ? 'selected' : ''}`} style={{ fontSize: '0.7rem', padding: '0.3rem' }}>
                                        <input type="checkbox" checked={formData.investigations.includes(item)} onChange={() => handleListChange('investigations', item)} />
                                        <span>{item}</span>
                                    </label>
                                ))}
                            </div>
                            <div style={{ marginTop: '0.75rem' }}>
                                <TextInput label="Other" name="investigationsOther" value={formData.investigationsOther} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-box" style={{ marginTop: '1.5rem', borderLeft: '6px solid var(--primary-color)' }}>
                    <h3 className="form-section-title">IV Antibiotics & Meds</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {[
                            'Inj. CEFTRIAXONE 1GM', 'Inj. METRONIDAZOLE 100MG',
                            'Inj. AMOXI-CLAV 1.2 GM', 'Inj. DEXAMETHASONE 4MG',
                            'Inj. HYDROCORTISONE 100 MG', 'Inj. AVIL 2ML',
                            'Inj. CEFOTAXIME 1GM', 'Inj. CEFUROXIME 1.5 GM',
                            'Inj. AMIKACIN 750 MG'
                        ].map(item => (
                            <label key={item} className={`checkbox-option ${formData.medications.antibiotics.includes(item) ? 'selected' : ''}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem' }}>
                                <input type="checkbox" checked={formData.medications.antibiotics.includes(item)} onChange={() => handleListChange('antibiotics', item)} />
                                <span>{item}</span>
                            </label>
                        ))}
                    </div>

                    <div className="two-col" style={{ marginTop: '1rem' }}>
                        <div className="form-field">
                            <label className="field-label">Antacids</label>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {['Inj. PANTO 40MG', 'Inj. RANITIDINE'].map(item => (
                                    <label key={item} className={`checkbox-option ${formData.medications.antacid.includes(item) ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                                        <input type="checkbox" checked={formData.medications.antacid.includes(item)} onChange={() => handleListChange('antacid', item)} />
                                        <span>{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="field-label">Fluids</label>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {['RL', 'NS', 'DNS'].map(item => (
                                    <label key={item} className={`checkbox-option ${formData.medications.fluids.includes(item) ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                                        <input type="checkbox" checked={formData.medications.fluids.includes(item)} onChange={() => handleListChange('fluids', item)} />
                                        <span>{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="two-col" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <TextInput label="Doctor Name" name="doctorName" value={formData.doctorName} onChange={handleChange} />
                    <MuiDateTimePicker label="Order Date & Time" name="dateTime" value={formData.dateTime} onChange={handleChange} />
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '3rem' }}>Authorize Pre-Op Orders</button>
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

export default PreOpOrderForm;
