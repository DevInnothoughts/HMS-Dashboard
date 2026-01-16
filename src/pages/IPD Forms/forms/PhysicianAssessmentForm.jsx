import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import RadioGroup from '../inputs/RadioGroup';
import CheckboxGroup from '../inputs/CheckboxGroup';
import SelectInput from '../inputs/SelectInput';

const PhysicianAssessmentForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',

        allergies: '',
        surgeryPlanned: '',
        medicalHistory: '',
        habits: [],
        habitsOther: '',

        reviewOfSystems: {
            constitutional: { status: '', details: '' },
            headNeck: { status: '', details: '' },
            heartDisease: { options: [], dyspneaClass: '' },
            respiration: { options: [] },
            gastrointestinal: { status: '', details: '' },
            genitoUrinary: { status: '', details: '' },
            hematologic: { options: [] },
            neurologic: { status: '', details: '' },
            psychiatric: { status: '', details: '' },
            endocrine: { options: [], other: '' }
        },

        presentMedications: {
            status: '',
            list: [{ medication: '', dose: '', freq: '', lastDose: '' }]
        },

        investigations: {
            echo2D: '',
            ecg: '',
            xray: '',
            other: ''
        },

        physicalExam: { bp: '', pulse: '', rr: '', temp: '' },
        riskAssessment: '',
        medicalConditionsStatus: '',
        result: '',
        resultNote: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData(prev => {
                let updated = { ...prev };
                let current = updated;
                for (let i = 0; i < keys.length - 1; i++) {
                    current[keys[i]] = { ...current[keys[i]] };
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
                return updated;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxArrayChange = (name, value) => {
        setFormData(prev => {
            const current = prev[name] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [name]: updated };
        });
    };

    const handleNestedCheckboxChange = (section, field, value) => {
        setFormData(prev => {
            const current = prev.reviewOfSystems[section][field] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return {
                ...prev,
                reviewOfSystems: {
                    ...prev.reviewOfSystems,
                    [section]: {
                        ...prev.reviewOfSystems[section],
                        [field]: updated
                    }
                }
            };
        });
    };

    const handleMedRowChange = (index, field, value) => {
        setFormData(prev => {
            const newList = [...prev.presentMedications.list];
            newList[index] = { ...newList[index], [field]: value };
            return {
                ...prev,
                presentMedications: { ...prev.presentMedications, list: newList }
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    const noneYesOptions = [
        { value: 'None', label: 'None' },
        { value: 'Yes', label: 'Yes' }
    ];

    const riskOptions = [
        { value: 'High', label: 'High' },
        { value: 'Moderate', label: 'Moderate' },
        { value: 'Low', label: 'Low' }
    ];

    const medicalStatusOptions = [
        { value: 'Controlled', label: 'Controlled' },
        { value: 'Partially controlled', label: 'Partially controlled' },
        { value: 'Uncontrolled', label: 'Uncontrolled' }
    ];

    return (
        <form onSubmit={handleSubmit} className="medical-form" style={{ maxWidth: '950px', margin: '0 auto' }}>
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '10px', borderRadius: '4px', margin: '0 0 30px 0', fontSize: '1.4rem' }}>
                PHYSICIAN ASSESSMENT FORM FOR SURGICAL FITNESS
            </h2>

            {/* Patient Header */}
            <div className="patient-compact-header" style={{ marginBottom: '30px' }}>
                <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{formData.uhid || '—'}</span></div>
                <div className="info-item"><span className="info-label">Patient Name</span><span className="info-value">{formData.name || '—'}</span></div>
                <div className="info-item"><span className="info-label">Age</span><span className="info-value">{formData.age || '—'}</span></div>
                <div className="info-item"><span className="info-label">Gender</span><span className="info-value">{formData.gender || '—'}</span></div>
                <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{formData.ipNo || '—'}</span></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <TextInput label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} />
                <TextInput label="Surgery planned" name="surgeryPlanned" value={formData.surgeryPlanned} onChange={handleChange} />
            </div>

            <TextInput label="Medical history" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} />

            <div style={{ padding: '15px', border: '1px solid #efefef', borderRadius: '8px', marginBottom: '30px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>Habits:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {['Smoking', 'Alcohol', 'Tobacco', 'None'].map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.habits.includes(opt)} onChange={() => handleCheckboxArrayChange('habits', opt)} />
                            {opt}
                        </label>
                    ))}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <TextInput label="Other if any" name="habitsOther" value={formData.habitsOther} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '15px', borderBottom: '1px solid #80deea', paddingBottom: '5px' }}>Review of Systems</label>

                {['constitutional', 'headNeck', 'gastrointestinal', 'genitoUrinary', 'neurologic', 'psychiatric'].map(sys => (
                    <div key={sys} style={{ display: 'grid', gridTemplateColumns: '150px 150px 1fr', gap: '20px', marginBottom: '15px', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{sys.replace(/([A-Z])/g, ' $1')}:</span>
                        <RadioGroup name={`reviewOfSystems.${sys}.status`} value={formData.reviewOfSystems[sys].status} onChange={handleChange} options={noneYesOptions} />
                        <TextInput label="Details" name={`reviewOfSystems.${sys}.details`} value={formData.reviewOfSystems[sys].details} onChange={handleChange} />
                    </div>
                ))}

                <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '15px' }}>
                    <label style={{ fontWeight: '500', display: 'block', marginBottom: '10px' }}>Heart Disease:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {['HTN', 'CAD', 'Vascular', 'Exercise intolerance', 'Angina'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                <input type="checkbox" checked={formData.reviewOfSystems.heartDisease.options.includes(opt)} onChange={() => handleNestedCheckboxChange('heartDisease', 'options', opt)} />
                                {opt}
                            </label>
                        ))}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <TextInput label="Dyspnea on exertion (Class)" name="reviewOfSystems.heartDisease.dyspneaClass" value={formData.reviewOfSystems.heartDisease.dyspneaClass} onChange={handleChange} />
                    </div>
                </div>

                <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '15px' }}>
                    <label style={{ fontWeight: '500', display: 'block', marginBottom: '10px' }}>Respiration:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {['None', 'Cough', "Koch's", 'Asthma', 'COPD', 'Pleural effusion'].map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                <input type="checkbox" checked={formData.reviewOfSystems.respiration.options.includes(opt)} onChange={() => handleNestedCheckboxChange('respiration', 'options', opt)} />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <RadioGroup label="Present medications" name="presentMedications.status" value={formData.presentMedications.status} onChange={handleChange} options={noneYesOptions} />
                {formData.presentMedications.status === 'Yes' && (
                    <div style={{ marginTop: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee' }}>
                            <thead style={{ backgroundColor: '#f5f5f5' }}>
                                <tr>
                                    <th style={{ padding: '8px', border: '1px solid #eee' }}>Medication</th>
                                    <th style={{ padding: '8px', border: '1px solid #eee' }}>Dose</th>
                                    <th style={{ padding: '8px', border: '1px solid #eee' }}>Freq</th>
                                    <th style={{ padding: '8px', border: '1px solid #eee' }}>Last taken</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.presentMedications.list.map((row, idx) => (
                                    <tr key={idx}>
                                        <td style={{ padding: '2px', border: '1px solid #eee' }}><input type="text" value={row.medication} onChange={(e) => handleMedRowChange(idx, 'medication', e.target.value)} style={{ width: '100%', border: 'none', padding: '5px' }} /></td>
                                        <td style={{ padding: '2px', border: '1px solid #eee' }}><input type="text" value={row.dose} onChange={(e) => handleMedRowChange(idx, 'dose', e.target.value)} style={{ width: '100%', border: 'none', padding: '5px' }} /></td>
                                        <td style={{ padding: '2px', border: '1px solid #eee' }}><input type="text" value={row.freq} onChange={(e) => handleMedRowChange(idx, 'freq', e.target.value)} style={{ width: '100%', border: 'none', padding: '5px' }} /></td>
                                        <td style={{ padding: '2px', border: '1px solid #eee' }}><input type="text" value={row.lastDose} onChange={(e) => handleMedRowChange(idx, 'lastDose', e.target.value)} style={{ width: '100%', border: 'none', padding: '5px' }} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '30px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Physical examination:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    <TextInput label="BP" name="physicalExam.bp" value={formData.physicalExam.bp} onChange={handleChange} />
                    <TextInput label="Pulse" name="physicalExam.pulse" value={formData.physicalExam.pulse} onChange={handleChange} />
                    <TextInput label="RR" name="physicalExam.rr" value={formData.physicalExam.rr} onChange={handleChange} />
                    <TextInput label="Temp" name="physicalExam.temp" value={formData.physicalExam.temp} onChange={handleChange} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div style={{ padding: '15px', border: '1px solid #efefef', borderRadius: '8px' }}>
                    <RadioGroup label="Risk assessment" name="riskAssessment" value={formData.riskAssessment} onChange={handleChange} options={riskOptions} />
                </div>
                <div style={{ padding: '15px', border: '1px solid #efefef', borderRadius: '8px' }}>
                    <RadioGroup label="Medical conditions status" name="medicalConditionsStatus" value={formData.medicalConditionsStatus} onChange={handleChange} options={medicalStatusOptions} />
                </div>
            </div>

            <div style={{ borderTop: '2px solid #80deea', paddingTop: '20px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Result:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input type="radio" name="result" value="Fit" checked={formData.result === 'Fit'} onChange={handleChange} />
                        Fit to undergo surgical procedure within next 24hrs
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input type="radio" name="result" value="Not Fit" checked={formData.result === 'Not Fit'} onChange={handleChange} />
                        Not fit, advise as follows:
                    </label>
                    {formData.result === 'Not Fit' && <Textarea name="resultNote" value={formData.resultNote} onChange={handleChange} />}
                </div>
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '40px', width: '100%' }}>Complete Physician Assessment</button>
        </form>
    );
};

export default PhysicianAssessmentForm;
