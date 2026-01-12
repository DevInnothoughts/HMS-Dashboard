import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const PhysicianAssessmentForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',

        allergies: '',
        surgeryPlanned: '',
        medicalHistoryNone: false,
        hasDM: '',
        hasHypertension: '',
        hasAllergies: '',
        hasThyroid: '',
        hasAsthma: '',
        dmDuration: '',
        hypertensionDuration: '',
        allergiesDuration: '',
        thyroidDuration: '',
        asthmaDuration: '',
        medicalHistory: '',

        habits: [],
        habitsOther: '',

        reviewOfSystems: {
            constitutionalNone: false,
            constitutionalDetails: '',
            headNeckNone: false,
            headNeckDetails: '',
            heartDiseaseNone: false,
            heartDisease: [],
            dyspneaClass: '',
            respirationNone: false,
            respiration: [],
            gastrointestinalNone: false,
            gastrointestinalDetails: '',
            genitoUrinaryNone: false,
            genitoUrinaryDetails: '',
            hematologicNone: false,
            hematologic: [],
            neurologicNone: false,
            neurologicDetails: '',
            psychiatricNone: false,
            psychiatricDetails: '',
            endocrineNone: false,
            endocrine: [],
            endocrineOther: ''
        },

        presentMedicationsNone: false,
        presentMedicationsYes: false,
        medications: Array(4).fill({ drug: '', dose: '', freq: '', route: '' }),

        investigations: {
            details: ''
        },

        physicalExam: {
            bp: '',
            pulse: '',
            rr: '',
            temp: ''
        },

        riskAssessment: '',
        factorsMedicalConditions: '',
        result: '',
        resultDetails: '',

        physicianName: '',
        assessmentDateTime: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCheckboxChange = (name, value) => {
        setFormData(prev => {
            const current = prev[name] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [name]: updated };
        });
    };

    const handleNestedCheckboxChange = (section, field, value) => {
        setFormData(prev => {
            const current = prev[section][field] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: updated
                }
            };
        });
    };

    const handleMedTableChange = (index, field, value) => {
        setFormData(prev => {
            const updatedMeds = [...prev.medications];
            updatedMeds[index] = { ...updatedMeds[index], [field]: value };
            return { ...prev, medications: updatedMeds };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">PHYSICIAN ASSESSMENT FOR SURGICAL FITNESS</h2>

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
                <div className="two-col">
                    <TextInput label="Allergies (if any)" name="allergies" value={formData.allergies} onChange={handleChange} />
                    <TextInput label="Surgery Planned" name="surgeryPlanned" value={formData.surgeryPlanned} onChange={handleChange} />
                </div>

                <div className="form-body-split">
                    <div className="left-side">
                        <h3 className="form-section-title">Medical History</h3>
                        <div className="section-box">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: '700' }}>History Present?</span>
                                <label className={`checkbox-option ${formData.medicalHistoryNone ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.medicalHistoryNone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, medicalHistoryNone: e.target.checked }))}
                                    />
                                    <span>None</span>
                                </label>
                            </div>

                            {!formData.medicalHistoryNone && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[
                                        { label: 'DM', name: 'hasDM', duration: 'dmDuration' },
                                        { label: 'HTN', name: 'hasHypertension', duration: 'hypertensionDuration' },
                                        { label: 'Allergies', name: 'hasAllergies', duration: 'allergiesDuration' },
                                        { label: 'Thyroid', name: 'hasThyroid', duration: 'thyroidDuration' },
                                        { label: 'Asthma', name: 'hasAsthma', duration: 'asthmaDuration' }
                                    ].map((item) => (
                                        <div key={item.name} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '600' }}>{item.label}</span>
                                                <div className="radio-group" style={{ margin: 0 }}>
                                                    {['Yes', 'No'].map(opt => (
                                                        <label key={opt} className={`radio-option ${formData[item.name] === opt ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                                            <input type="radio" name={item.name} value={opt} checked={formData[item.name] === opt} onChange={handleChange} />
                                                            <span>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            {formData[item.name] === 'Yes' && (
                                                <TextInput
                                                    hideLabel
                                                    name={item.duration}
                                                    value={formData[item.duration]}
                                                    onChange={handleChange}
                                                    placeholder="Duration/Details..."
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ marginTop: '1rem' }}>
                                <TextInput label="Other History Notes" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="section-box">
                            <label className="field-label">Social Habits</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                {['Smoking', 'Alcohol', 'Tobacco', 'None'].map(habit => (
                                    <label key={habit} className={`checkbox-option ${formData.habits.includes(habit) ? 'selected' : ''}`} style={{ padding: '0.3rem 0.6rem' }}>
                                        <input type="checkbox" checked={formData.habits.includes(habit)} onChange={() => handleCheckboxChange('habits', habit)} />
                                        <span>{habit}</span>
                                    </label>
                                ))}
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <TextInput hideLabel name="habitsOther" value={formData.habitsOther} onChange={handleChange} placeholder="Other habits details..." />
                            </div>
                        </div>
                    </div>

                    <div className="right-side">
                        <h3 className="form-section-title">Review of Systems</h3>
                        <div className="section-box">
                            {[
                                { label: 'Constitutional', field: 'constitutional' },
                                { label: 'Head & Neck', field: 'headNeck' },
                                { label: 'Gastrointestinal', field: 'gastrointestinal' },
                                { label: 'Genito-Urinary', field: 'genitoUrinary' },
                                { label: 'Neurologic', field: 'neurologic' },
                                { label: 'Psychiatric', field: 'psychiatric' }
                            ].map(sys => (
                                <div key={sys.field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600' }}>{sys.label}</span>
                                        <label className={`checkbox-option ${formData.reviewOfSystems[`${sys.field}None`] ? 'selected' : ''}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                            <input type="checkbox" checked={formData.reviewOfSystems[`${sys.field}None`]} onChange={(e) => handleChange({ target: { name: `reviewOfSystems.${sys.field}None`, value: e.target.checked } })} />
                                            <span>None</span>
                                        </label>
                                    </div>
                                    <TextInput
                                        hideLabel
                                        placeholder="Findings/Details..."
                                        value={formData.reviewOfSystems[`${sys.field}Details`]}
                                        onChange={(e) => handleChange({ target: { name: `reviewOfSystems.${sys.field}Details`, value: e.target.value } })}
                                    />
                                </div>
                            ))}

                            <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ fontWeight: '600' }}>Heart Disease</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                                    <label className={`checkbox-option ${formData.reviewOfSystems.heartDiseaseNone ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem' }}>
                                        <input type="checkbox" checked={formData.reviewOfSystems.heartDiseaseNone} onChange={(e) => handleChange({ target: { name: 'reviewOfSystems.heartDiseaseNone', value: e.target.checked } })} />
                                        <span>None</span>
                                    </label>
                                    {['HTN', 'CAD', 'Angina'].map(opt => (
                                        <label key={opt} className={`checkbox-option ${formData.reviewOfSystems.heartDisease.includes(opt) ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem' }}>
                                            <input type="checkbox" checked={formData.reviewOfSystems.heartDisease.includes(opt)} onChange={() => handleNestedCheckboxChange('reviewOfSystems', 'heartDisease', opt)} />
                                            <span>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <TextInput label="Dyspnea Class" name="reviewOfSystems.dyspneaClass" value={formData.reviewOfSystems.dyspneaClass} onChange={handleChange} hideLabel placeholder="Dyspnea class..." />
                                </div>
                            </div>

                            <div style={{ padding: '0.75rem 0' }}>
                                <span style={{ fontWeight: '600' }}>Respiration</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                                    <label className={`checkbox-option ${formData.reviewOfSystems.respirationNone ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem' }}>
                                        <input type="checkbox" checked={formData.reviewOfSystems.respirationNone} onChange={(e) => handleChange({ target: { name: 'reviewOfSystems.respirationNone', value: e.target.checked } })} />
                                        <span>None</span>
                                    </label>
                                    {['Cough', 'Asthma', 'COPD'].map(opt => (
                                        <label key={opt} className={`checkbox-option ${formData.reviewOfSystems.respiration.includes(opt) ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem' }}>
                                            <input type="checkbox" checked={formData.reviewOfSystems.respiration.includes(opt)} onChange={() => handleNestedCheckboxChange('reviewOfSystems', 'respiration', opt)} />
                                            <span>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 className="form-section-title">Vitals & Meds</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    <TextInput label="BP" name="physicalExam.bp" value={formData.physicalExam.bp} onChange={handleChange} />
                    <TextInput label="Pulse" name="physicalExam.pulse" value={formData.physicalExam.pulse} onChange={handleChange} />
                    <TextInput label="RR" name="physicalExam.rr" value={formData.physicalExam.rr} onChange={handleChange} />
                    <TextInput label="Temp" name="physicalExam.temp" value={formData.physicalExam.temp} onChange={handleChange} />
                </div>

                <div className="section-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: '700' }}>Present Medications?</span>
                        <div className="radio-group" style={{ margin: 0 }}>
                            <label className={`radio-option ${formData.presentMedicationsNone ? 'selected' : ''}`}>
                                <input type="checkbox" checked={formData.presentMedicationsNone} onChange={(e) => setFormData(prev => ({ ...prev, presentMedicationsNone: e.target.checked, presentMedicationsYes: !e.target.checked }))} />
                                <span>None</span>
                            </label>
                            <label className={`radio-option ${formData.presentMedicationsYes ? 'selected' : ''}`}>
                                <input type="checkbox" checked={formData.presentMedicationsYes} onChange={(e) => setFormData(prev => ({ ...prev, presentMedicationsYes: e.target.checked, presentMedicationsNone: !e.target.checked }))} />
                                <span>Yes</span>
                            </label>
                        </div>
                    </div>

                    {formData.presentMedicationsYes && (
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        {['DRUG', 'DOSE', 'FREQ', 'ROUTE'].map(h => <th key={h} style={{ padding: '8px', fontSize: '0.7rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}
                                        <th style={{ width: '30px', borderBottom: '1px solid var(--border-color)' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.medications.map((med, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            {['drug', 'dose', 'freq', 'route'].map(f => (
                                                <td key={f} style={{ padding: '2px' }}>
                                                    <input type="text" value={med[f]} onChange={(e) => handleMedTableChange(idx, f, e.target.value)} style={{ width: '100%', border: 'none', padding: '6px', fontSize: '0.8rem', background: 'transparent' }} />
                                                </td>
                                            ))}
                                            <td style={{ textAlign: 'center' }}>
                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, medications: prev.medications.filter((_, i) => i !== idx) }))} style={{ color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, medications: [...prev.medications, { drug: '', dose: '', freq: '', route: '' }] }))} className="secondary-btn" style={{ margin: '0.75rem', fontSize: '0.75rem' }}>+ Add Row</button>
                        </div>
                    )}
                </div>

                <div className="two-col" style={{ marginTop: '1.5rem' }}>
                    <div className="form-field">
                        <label className="field-label">Risk Assessment</label>
                        <div className="radio-group">
                            {['High', 'Moderate', 'Low'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.riskAssessment === opt ? 'selected' : ''}`} style={{ padding: '0.3rem 0.6rem' }}>
                                    <input type="radio" name="riskAssessment" value={opt} checked={formData.riskAssessment === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="form-field">
                        <label className="field-label">Medical Control</label>
                        <div className="radio-group">
                            {['Controlled', 'Partially', 'Uncontrolled'].map(opt => (
                                <label key={opt} className={`radio-option ${formData.factorsMedicalConditions === opt ? 'selected' : ''}`} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                    <input type="radio" name="factorsMedicalConditions" value={opt} checked={formData.factorsMedicalConditions === opt} onChange={handleChange} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="section-box" style={{ padding: '1.5rem', marginTop: '1.5rem', borderLeft: '6px solid var(--primary-color)' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary-color)' }}>Fitness Determination</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label className={`radio-option ${formData.result === 'Fit' ? 'selected' : ''}`} style={{ padding: '0.6rem 1rem' }}>
                            <input type="radio" name="result" value="Fit" checked={formData.result === 'Fit'} onChange={handleChange} />
                            <span style={{ fontWeight: '700' }}>FIT for surgery</span>
                        </label>
                        <label className={`radio-option ${formData.result === 'NotFit' ? 'selected' : ''}`} style={{ padding: '0.6rem 1rem' }}>
                            <input type="radio" name="result" value="NotFit" checked={formData.result === 'NotFit'} onChange={handleChange} />
                            <span style={{ fontWeight: '700' }}>NOT FIT</span>
                        </label>
                        {formData.result === 'NotFit' && <Textarea label="Advise Details" name="resultDetails" value={formData.resultDetails} onChange={handleChange} rows={2} />}
                    </div>

                    <div className="two-col" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <TextInput label="Physician" name="physicianName" value={formData.physicianName} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="assessmentDateTime" value={formData.assessmentDateTime} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn">
                    Finalize Fitness Report
                </button>
            </form>
        </div>
    );
};

export default PhysicianAssessmentForm;
