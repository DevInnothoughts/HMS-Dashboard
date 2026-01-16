import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

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
        ['Weight: Over/Under/Normal', 'Febrile condition'], ['Weight loss', 'Lactose intolerance'],
        ['Diarrhea', 'Gluten intolerance'], ['Constipation', 'Anemia'],
        ['Malignancy', 'Impaired CNS functions'], ['Burn', 'Pregnancy'], ['Lactation', 'Immunodeficiency diseases']
    ];

    const radioRowStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '4px 0', borderBottom: '1px solid #f0f0f0' };

    return (
        <form onSubmit={handleSubmit} className="medical-form">
            <h2 style={{ color: '#80deea', borderBottom: '2px solid #80deea', paddingBottom: '10px', marginBottom: '30px' }}>NUTRITIONAL ASSESSMENT FORM</h2>

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

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '20px', marginTop: '10px' }}>
                <TextInput label="Referred by: Dr." name="referredBy" value={formData.referredBy} onChange={handleChange} />
                <MuiDateTimePicker label="Date & Time" name="referralDate" value={formData.referralDate} onChange={handleChange} />
            </div>
            <TextInput label="Provisional Diagnosis" name="provisionalDiagnosis" value={formData.provisionalDiagnosis} onChange={handleChange} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <TextInput label="Height (m)" name="anthropometric.height" value={formData.anthropometric.height} onChange={handleChange} />
                <TextInput label="Weight (kg)" name="anthropometric.weight" value={formData.anthropometric.weight} onChange={handleChange} />
                <TextInput label="BMI (kg/m²)" name="anthropometric.bmi" value={formData.anthropometric.bmi} onChange={handleChange} />
                <TextInput label="Status" name="anthropometric.status" value={formData.anthropometric.status} onChange={handleChange} placeholder="Over/Under/Normal" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '10px 0' }}>
                <div className="form-field">
                    <label className="field-label">Food habits</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['Vegetarian', 'Non vegetarian', 'Mixed diet'].map(opt => (
                            <label key={opt} className="radio-option" style={{ fontSize: '0.8rem' }}>
                                <input type="radio" name="foodHabits" value={opt} checked={formData.foodHabits === opt} onChange={handleChange} />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="form-field">
                    <label className="field-label">Appetite</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['Good', 'Poor', 'Compulsive'].map(opt => (
                            <label key={opt} className="radio-option">
                                <input type="radio" name="appetite" value={opt} checked={formData.appetite === opt} onChange={handleChange} />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <h3>Past history & presence of:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {['Diabetes', 'Hypertension', 'Cardiac', 'Renal Hepatic', 'Pancreastic', 'Tuberculosis', 'COPD', 'Hypothyroidien', 'None'].map(item => (
                    <label key={item} className="checkbox-label" style={{ border: 'none', padding: 0 }}>
                        <input type="checkbox" checked={formData.pastHistory.includes(item)} onChange={() => handleListChange('pastHistory', item)} />
                        <span style={{ marginLeft: '4px', fontSize: '0.85rem' }}>{item}</span>
                    </label>
                ))}
            </div>

            <h3 style={{ color: '#80deea', borderBottom: '1px solid #80deea', paddingBottom: '5px' }}>Clinical Condition / Status (Yes/No)</h3>
            <div className="medical-history-grid">
                {conditions.flat().map(cond => (
                    <div key={cond} className="history-item">
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{cond}</span>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <label className="radio-option" style={{ gap: '6px' }}>
                                <input type="radio" name={`status_${cond}`} value="Yes" checked={formData.clinicalStatus[cond] === 'Yes'} onChange={() => handleStatusChange(cond, 'Yes')} />
                                <span>Yes</span>
                            </label>
                            <label className="radio-option" style={{ gap: '6px' }}>
                                <input type="radio" name={`status_${cond}`} value="No" checked={formData.clinicalStatus[cond] === 'No'} onChange={() => handleStatusChange(cond, 'No')} />
                                <span>No</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <h3 style={{ color: '#80deea', borderBottom: '1px solid #80deea', paddingBottom: '5px' }}>Investigation findings used for assessment</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
                {[
                    ['bloodSugar', 'Blood sugar'], ['sodium', 'Sr. Sodium'], ['potassium', 'Sr. Potassium'],
                    ['calcium', 'Sr. Calcium'], ['creatinine', 'Sr. Creatinine'], ['urea', 'Sr. Urea'],
                    ['chloride', 'Sr. Chloride'], ['uricAcid', 'Sr. Uric acid'], ['others', 'Others']
                ].map(([key, label]) => (
                    <TextInput
                        key={key}
                        label={label}
                        name={`investigations.${key}`}
                        value={formData.investigations[key]}
                        onChange={handleChange}
                    />
                ))}
            </div>

            <h3 style={{ color: '#80deea', borderBottom: '1px solid #80deea', paddingBottom: '5px' }}>Nutritional plan based on assessment</h3>

            <div style={{ marginBottom: '15px' }}>
                <TextInput
                    label="Type of diet"
                    name="plan.typeOfDiet"
                    value={formData.plan.typeOfDiet}
                    onChange={handleChange}
                />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', marginBottom: '20px', padding: '10px', backgroundColor: '#fdfdfd', borderRadius: '8px' }}>
                <span style={{ fontWeight: '600', color: '#666', fontSize: '0.9rem' }}>Requirement: Calories/ day</span>
                {['1000 kcal', '1500 kcal', '2000 kcal', '2500 kcal'].map(opt => (
                    <label key={opt} className="radio-option">
                        <input type="radio" name="plan.requirement" value={opt} checked={formData.plan.requirement === opt} onChange={handleChange} />
                        <span style={{ fontSize: '0.85rem' }}>{opt}</span>
                    </label>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                <TextInput
                    label="Other requirement"
                    name="plan.otherRequirement"
                    value={formData.plan.otherRequirement}
                    onChange={handleChange}
                />
                <TextInput
                    label="Restrictions"
                    name="plan.restrictions"
                    value={formData.plan.restrictions}
                    onChange={handleChange}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label className="field-label" style={{ fontWeight: '600', marginBottom: '10px', display: 'block' }}>Type of feed required</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    {['Oral', 'Tube= RT/ JJ', 'PEP', 'PPN', 'TPN'].map(opt => (
                        <label key={opt} className="checkbox-label">
                            <input type="checkbox" checked={formData.plan.typeOfFeed.includes(opt)} onChange={() => handleNestedListChange('plan', 'typeOfFeed', opt)} />
                            <span style={{ fontSize: '0.85rem' }}>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label className="field-label" style={{ fontWeight: '600', marginBottom: '10px', display: 'block' }}>Frequency of re-assessment</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    {['Daily', 'Alternate day', 'Twice a week', 'Weekly', 'SOS'].map(opt => (
                        <label key={opt} className="checkbox-label">
                            <input type="checkbox" checked={formData.plan.frequency.includes(opt)} onChange={() => handleNestedListChange('plan', 'frequency', opt)} />
                            <span style={{ fontSize: '0.85rem' }}>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <label className="field-label" style={{ fontWeight: '600', marginBottom: '10px', display: 'block' }}>Type of re-assessment required</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                    {['Clinical', 'Calorie count', 'Weight'].map(opt => (
                        <label key={opt} className="checkbox-label">
                            <input type="checkbox" checked={formData.plan.reAssessmentType.includes(opt)} onChange={() => handleNestedListChange('plan', 'reAssessmentType', opt)} />
                            <span style={{ fontSize: '0.85rem' }}>{opt}</span>
                        </label>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '300px' }}>
                        <TextInput
                            label="Other specify"
                            name="plan.reAssessmentSpecify"
                            value={formData.plan.reAssessmentSpecify}
                            onChange={handleChange}
                            hideLabel
                            placeholder="Other (specify)"
                        />
                    </div>
                </div>
            </div>

            <div style={{ padding: '25px', border: '1px solid #80deea', borderRadius: '12px', backgroundColor: '#fdfdfd', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ fontWeight: 'bold', color: '#444' }}>Diet counselling / Education provided:</span>
                    <label className="radio-option">
                        <input type="radio" name="nutritionCounseling" value="Yes" checked={formData.nutritionCounseling === 'Yes'} onChange={handleChange} />
                        <span>Yes</span>
                    </label>
                    <label className="radio-option">
                        <input type="radio" name="nutritionCounseling" value="No" checked={formData.nutritionCounseling === 'No'} onChange={handleChange} />
                        <span>No</span>
                    </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <MuiDateTimePicker type="date" label="Date of Assessment" name="assessmentDate" value={formData.assessmentDate} onChange={handleChange} />
                    <MuiDateTimePicker type="time" label="Time of Assessment" name="assessmentTime" value={formData.assessmentTime} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                    {/* Dietitian Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <TextInput label="Name of Dietitian" name="dietitianName" value={formData.dietitianName} onChange={handleChange} />
                        <TextInput
                            label="Dietitian Signature (Type full name)"
                            name="dietitianSignature"
                            value={formData.dietitianSignature}
                            onChange={handleChange}
                            placeholder="Type for digital signature"
                            style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#1a365d' }}
                        />
                    </div>

                    {/* Consultant Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <TextInput label="Consultant / Resident Name" name="consultantName" value={formData.consultantName} onChange={handleChange} />
                        <TextInput
                            label="Consultant / Resident Signature"
                            name="consultantSignature"
                            value={formData.consultantSignature}
                            onChange={handleChange}
                            placeholder="Type for digital signature"
                            style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#1a365d' }}
                        />
                    </div>
                </div>
            </div>

            <button type="submit" className="submit-btn">
                Submit Nutritional Assessment
            </button>
        </form>
    );
};

export default NutritionalAssessmentForm;
