import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const NursingInitialAssessmentForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',

        patientReceivedDateTime: '',
        generalCondition: '',
        ipBand: '',
        language: '',
        temp: '',
        bp: '',
        pulse: '',
        rr: '',

        volunteer: '',
        givenToPatient: false,
        vulnerablePatient: '',

        neurological: {},
        cardiovascular: {},
        urinary: {},
        respiratory: {},
        gastrointestinal: {},
        skin: {},
        communication: {},
        allergies: {},

        functional: {
            walking: '', eating: '', dressing: ''
        },
        bathing: '',
        toileting: ''
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
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleCheckboxGroup = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    const CheckboxRow = ({ section, label }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.625rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)' }}>{label}</span>
            <div className="radio-group" style={{ margin: 0 }}>
                <label className={`radio-option ${formData[section]?.[label] === 'Yes' ? 'selected' : ''}`} style={{ padding: '0.25rem 0.75rem' }}>
                    <input type="checkbox" checked={formData[section]?.[label] === 'Yes'} onChange={() => handleCheckboxGroup(section, label, 'Yes')} />
                    <span>Yes</span>
                </label>
                <label className={`radio-option ${formData[section]?.[label] === 'No' ? 'selected' : ''}`} style={{ padding: '0.25rem 0.75rem' }}>
                    <input type="checkbox" checked={formData[section]?.[label] === 'No'} onChange={() => handleCheckboxGroup(section, label, 'No')} />
                    <span>No</span>
                </label>
            </div>
        </div>
    );

    return (
        <div className="medical-form-container">
            <h2 className="form-title">NURSING INITIAL ASSESSMENTS</h2>

            {/* Compact Patient Header */}
            <div className="patient-compact-header">
                <div className="info-item">
                    <span className="info-label">UHID</span>
                    <span className="info-value">{formData.uhid || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Patient Name</span>
                    <span className="info-value">{formData.name || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{formData.age || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{formData.gender || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">IP No</span>
                    <span className="info-value">{formData.ipNo || '—'}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="medical-form">
                <div className="two-col" style={{ alignItems: 'end' }}>
                    <MuiDateTimePicker
                        label="Patient received Date & Time"
                        name="patientReceivedDateTime"
                        value={formData.patientReceivedDateTime}
                        onChange={handleChange}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-field">
                            <label className="field-label">General condition taken</label>
                            <div className="radio-group">
                                {['Yes', 'No'].map(opt => (
                                    <label key={opt} className={`radio-option ${formData.generalCondition === opt ? 'selected' : ''}`}>
                                        <input type="radio" name="generalCondition" value={opt} checked={formData.generalCondition === opt} onChange={handleChange} />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="field-label">IP Band</label>
                            <div className="radio-group">
                                {['Yes', 'No'].map(opt => (
                                    <label key={opt} className={`radio-option ${formData.ipBand === opt ? 'selected' : ''}`}>
                                        <input type="radio" name="ipBand" value={opt} checked={formData.ipBand === opt} onChange={handleChange} />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 0.8fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <TextInput label="Language" name="language" value={formData.language} onChange={handleChange} />
                    <TextInput label="Temp" name="temp" value={formData.temp} onChange={handleChange} />
                    <TextInput label="BP" name="bp" value={formData.bp} onChange={handleChange} />
                    <TextInput label="Pulse" name="pulse" value={formData.pulse} onChange={handleChange} />
                    <TextInput label="RR" name="rr" value={formData.rr} onChange={handleChange} />
                </div>

                <div className="two-col" style={{ margin: '1.5rem 0' }}>
                    <div className="form-field">
                        <label className="field-label">Volunteer / Bystander</label>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            {['With patient', 'Given to patient'].map(opt => (
                                <label key={opt} className={`checkbox-option ${formData.volunteer === opt ? 'selected' : ''}`}>
                                    <input type="checkbox" checked={formData.volunteer === opt} onChange={() => setFormData(prev => ({ ...prev, volunteer: opt }))} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="form-field">
                        <label className="field-label">Vulnerable patient</label>
                        <div className="radio-group">
                            {['Yes', 'No'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.vulnerablePatient === opt ? 'selected' : ''}`}>
                                    <input type="radio" name="vulnerablePatient" value={opt} checked={formData.vulnerablePatient === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-body-split">
                    <div className="left-side">
                        {/* Neurological */}
                        <div className="section-box">
                            <h3 className="form-section-title">Neurological</h3>
                            {['Paralysis', 'Dizziness', 'Seizures', 'Sleepiness'].map(item => (
                                <CheckboxRow key={item} section="neurological" label={item} />
                            ))}
                        </div>

                        {/* Cardiovascular */}
                        <div className="section-box">
                            <h3 className="form-section-title">Cardiovascular</h3>
                            {['Chest pain', 'Hypertensive', 'Hypotensive', 'Palpitation'].map(item => (
                                <CheckboxRow key={item} section="cardiovascular" label={item} />
                            ))}
                        </div>

                        {/* Urinary */}
                        <div className="section-box">
                            <h3 className="form-section-title">Urinary</h3>
                            {['Catheter', 'Hematuria', 'Incontinence', 'Hesitance'].map(item => (
                                <CheckboxRow key={item} section="urinary" label={item} />
                            ))}
                        </div>

                        {/* Respiratory */}
                        <div className="section-box">
                            <h3 className="form-section-title">Respiratory</h3>
                            {['Gravity', 'Tachypnea', 'Bradypnea', 'Dyspnea', 'Cough'].map(item => (
                                <CheckboxRow key={item} section="respiratory" label={item} />
                            ))}
                        </div>
                    </div>

                    <div className="right-side">
                        {/* Gastrointestinal */}
                        <div className="section-box">
                            <h3 className="form-section-title">Gastrointestinal</h3>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {['Constipation', 'Distention', 'Nausea', 'Diarrhea', 'Tenderness', 'Vomiting', 'Colostomy', 'NGM'].map(item => (
                                    <CheckboxRow key={item} section="gastrointestinal" label={item} />
                                ))}
                            </div>
                        </div>

                        {/* Skin */}
                        <div className="section-box">
                            <h3 className="form-section-title">Skin</h3>
                            {['Pale', 'Cyanotic', 'Diaphoretic', 'Jaundiced', 'Normal'].map(item => (
                                <CheckboxRow key={item} section="skin" label={item} />
                            ))}
                        </div>

                        {/* Communication */}
                        <div className="section-box">
                            <h3 className="form-section-title">Communication</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[['Vision', ['OK', 'Impaired']], ['Hearing', ['OK', 'Impaired']], ['Speech', ['OK', 'Impaired']], ['Obey', ['OK', 'Impaired']]].map(([label, options]) => (
                                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{label}</span>
                                        <div className="radio-group" style={{ margin: 0 }}>
                                            {options.map(opt => (
                                                <label key={opt} className={`radio-option ${formData.communication?.[label] === opt ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                                    <input type="checkbox" checked={formData.communication?.[label] === opt} onChange={() => handleCheckboxGroup('communication', label, opt)} />
                                                    <span>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Allergies */}
                        <div className="section-box">
                            <h3 className="form-section-title">Allergies / Adverse Reaction</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[['Medication / Drug', 'Yes', 'No'], ['Blood transfusion', 'Yes', 'No'], ['Food', 'Yes', 'No']].map((item, idx) => (
                                    <div key={idx} style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{item[0]}</span>
                                            <div className="radio-group" style={{ margin: 0 }}>
                                                {[item[1], item[2]].map(opt => (
                                                    <label key={opt} className={`radio-option ${formData.allergies?.[item[0]] === opt ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                                        <input type="checkbox" checked={formData.allergies?.[item[0]] === opt} onChange={() => handleCheckboxGroup('allergies', item[0], opt)} />
                                                        <span>{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <TextInput hideLabel label="Details" placeholder={`Specify if Yes...`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3 className="form-section-title">Functional Assessment</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {[
                            ['Walking', 'Independent', 'Assisted', 'Dependent', 'functional.walking'],
                            ['Eating', 'Independent', 'Assisted', 'Dependent', 'functional.eating'],
                            ['Dressing', 'Independent', 'Assisted', 'Dependent', 'functional.dressing'],
                            ['Bathing', 'Independent', 'Assisted', 'Dependent', 'bathing'],
                            ['Toileting', 'Independent', 'Assisted', 'Dependent', 'toileting']
                        ].map(([label, ...options]) => {
                            const name = options.pop();
                            const val = name.includes('.') ? formData.functional[name.split('.')[1]] : formData[name];
                            return (
                                <div key={label} className="form-field">
                                    <label className="field-label" style={{ marginBottom: '0.25rem' }}>{label}</label>
                                    <div className="radio-group">
                                        {options.map(opt => (
                                            <label key={opt} className={`radio-option ${val === opt ? 'selected' : ''}`} style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }}>
                                                <input type="radio" name={name} value={opt} checked={val === opt} onChange={handleChange} />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button type="submit" className="submit-btn">Submit Nursing Assessment</button>
            </form>
        </div>
    );
};

export default NursingInitialAssessmentForm;
