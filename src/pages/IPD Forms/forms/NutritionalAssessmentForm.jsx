import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const NutritionalAssessmentForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',

        referredBy: '',
        referralDate: '',
        provisionalDiagnosis: '',

        anthropometric: { height: '', weight: '', bmi: '', status: '' },
        foodHabits: '',
        habitsOther: '',
        foodRestriction: '',
        appetite: '',

        pastHistory: [],
        historyOther: '',

        clinicalStatus: {},
        investigations: {
            bloodSugar: '', calcium: '', chloride: '', sodium: '', creatinine: '', uricAcid: '', potassium: '', urea: '', others: ''
        },

        plan: {
            typeOfDiet: '',
            requirement: '',
            otherRequirement: '',
            restrictions: '',
            typeOfFeed: [],
            frequency: [],
            reAssessmentType: [],
            reAssessmentSpecify: ''
        },

        nutritionCounseling: '', // Yes/No
        assessmentDate: '',
        assessmentTime: '',
        dietitianName: '',
        dietitianSignature: '',
        consultantName: '',
        consultantSignature: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleListChange = (field, value) => {
        setFormData(prev => {
            const current = prev[field] || [];
            const updated = current.includes(value)
                ? current.filter(i => i !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const handleNestedListChange = (section, field, value) => {
        setFormData(prev => {
            const current = prev[section][field] || [];
            const updated = current.includes(value)
                ? current.filter(i => i !== value)
                : [...current, value];
            return {
                ...prev,
                [section]: { ...prev[section], [field]: updated }
            };
        });
    };

    const handleStatusChange = (condition, value) => {
        setFormData(prev => ({
            ...prev,
            clinicalStatus: { ...prev.clinicalStatus, [condition]: value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    const conditions = [
        'Weight: Over/Under/Normal', 'Febrile condition', 'Weight loss', 'Lactose intolerance',
        'Diarrhea', 'Gluten intolerance', 'Constipation', 'Anemia',
        'Malignancy', 'Impaired CNS functions', 'Burn', 'Pregnancy', 'Lactation', 'Immunodeficiency diseases'
    ];

    return (
        <div className="medical-form-container">
            <h2 className="form-title">NUTRITIONAL ASSESSMENT FORM</h2>

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
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Reference & Anthropometrics</h3>
                            <TextInput label="Referred by" name="referredBy" value={formData.referredBy} onChange={handleChange} />
                            <MuiDateTimePicker label="Referral Date" name="referralDate" value={formData.referralDate} onChange={handleChange} />
                            <TextInput label="Diagnosis" name="provisionalDiagnosis" value={formData.provisionalDiagnosis} onChange={handleChange} />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
                                <TextInput label="Height (m)" name="anthropometric.height" value={formData.anthropometric.height} onChange={handleChange} />
                                <TextInput label="Weight (kg)" name="anthropometric.weight" value={formData.anthropometric.weight} onChange={handleChange} />
                                <TextInput label="BMI" name="anthropometric.bmi" value={formData.anthropometric.bmi} onChange={handleChange} />
                                <TextInput label="Status" name="anthropometric.status" value={formData.anthropometric.status} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="section-box">
                            <div className="two-col">
                                <div className="form-field">
                                    <label className="field-label">Food Habits</label>
                                    <div className="radio-group">
                                        {['Veg', 'Non-Veg', 'Mixed'].map(opt => (
                                            <label key={opt} className={`radio-option ${formData.foodHabits === opt ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                                <input type="radio" name="foodHabits" value={opt} checked={formData.foodHabits === opt} onChange={handleChange} />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Appetite</label>
                                    <div className="radio-group">
                                        {['Good', 'Poor'].map(opt => (
                                            <label key={opt} className={`radio-option ${formData.appetite === opt ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                                <input type="radio" name="appetite" value={opt} checked={formData.appetite === opt} onChange={handleChange} />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section-box">
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Past History</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {['Diabetes', 'HTN', 'Cardiac', 'Renal', 'COPD', 'None'].map(item => (
                                    <label key={item} className={`checkbox-option ${formData.pastHistory.includes(item) ? 'selected' : ''}`} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>
                                        <input type="checkbox" checked={formData.pastHistory.includes(item)} onChange={() => handleListChange('pastHistory', item)} />
                                        <span>{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-side">
                        <div className="section-box">
                            <h3 className="form-section-title" style={{ marginTop: 0 }}>Clinical Status</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                {conditions.map(cond => (
                                    <div key={cond} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{cond}</span>
                                        <div className="radio-group" style={{ margin: 0 }}>
                                            {['Yes', 'No'].map(opt => (
                                                <label key={opt} className={`radio-option ${formData.clinicalStatus[cond] === opt ? 'selected' : ''}`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>
                                                    <input type="radio" name={`status_${cond}`} value={opt} checked={formData.clinicalStatus[cond] === opt} onChange={() => handleStatusChange(cond, opt)} />
                                                    <span>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-box" style={{ marginTop: '1.5rem' }}>
                    <h3 className="form-section-title">Investigations</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                        {[
                            ['bloodSugar', 'B. Sugar'], ['sodium', 'Sodium'], ['potassium', 'Potassium'],
                            ['calcium', 'Calcium'], ['creatinine', 'Creatinine'], ['urea', 'Urea'],
                            ['chloride', 'Chloride'], ['uricAcid', 'Uric Acid'], ['others', 'Others']
                        ].map(([key, label]) => (
                            <TextInput key={key} label={label} name={`investigations.${key}`} value={formData.investigations[key]} onChange={handleChange} />
                        ))}
                    </div>
                </div>

                <div className="section-box" style={{ marginTop: '1.5rem', borderLeft: '6px solid var(--secondary-color)' }}>
                    <h3 className="form-section-title">Nutritional Plan</h3>
                    <div className="two-col">
                        <TextInput label="Diet Prescribed" name="plan.typeOfDiet" value={formData.plan.typeOfDiet} onChange={handleChange} />
                        <TextInput label="Kcal Req." name="plan.requirement" value={formData.plan.requirement} onChange={handleChange} />
                    </div>
                    <div className="two-col" style={{ marginTop: '1rem' }}>
                        <div className="form-field">
                            <label className="field-label">Feed Type</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {['Oral', 'Tube', 'TPN'].map(opt => (
                                    <label key={opt} className={`checkbox-option ${formData.plan.typeOfFeed.includes(opt) ? 'selected' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                        <input type="checkbox" checked={formData.plan.typeOfFeed.includes(opt)} onChange={() => handleNestedListChange('plan', 'typeOfFeed', opt)} />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="field-label">Counselling Provided?</label>
                            <div className="radio-group">
                                {['Yes', 'No'].map(opt => (
                                    <label key={opt} className={`radio-option ${formData.nutritionCounseling === opt ? 'selected' : ''}`} style={{ padding: '0.2rem 0.6rem' }}>
                                        <input type="radio" name="nutritionCounseling" value={opt} checked={formData.nutritionCounseling === opt} onChange={handleChange} />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="two-col" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <div className="signature-area">
                        <TextInput label="Dietitian" name="dietitianName" value={formData.dietitianName} onChange={handleChange} />
                    </div>
                    <div className="signature-area">
                        <MuiDateTimePicker label="Assessment Time" name="assessmentDate" value={formData.assessmentDate} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn">Finalize Report</button>
            </form>
        </div>
    );
};

export default NutritionalAssessmentForm;
