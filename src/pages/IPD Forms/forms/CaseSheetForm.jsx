import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import './Forms.css';

const CaseSheetForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        // Pre-filled from backend
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        address: patientData.address || '',

        // General Examination
        height: '',
        weight: '',
        pulse: '',
        bp: '',
        temp: '',
        rr: '',

        // Systemic Examination
        rs: '',
        cvs: '',
        cns: '',
        others: '',

        // Vulnerable Patient
        vulnerablePatient: '',

        // Nutritional Screening
        lossOfWeight: '',
        foodIntakeReduced: '',

        // Other fields
        bmiName: '',
        provisionalDiagnosis: '',
        investigationOrders: '',
        finalDiagnosis: '',
        plan: '',
        residentDoctorName: '',
        consultantName: ''
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
        const trimmedData = { ...formData };
        Object.keys(trimmedData).forEach(key => {
            if (typeof trimmedData[key] === 'string') {
                trimmedData[key] = trimmedData[key].trim();
            }
        });

        onSubmit && onSubmit(trimmedData);
    };

    return (
        <div className="medical-form-container">
            <form onSubmit={handleSubmit} className="medical-form case-sheet">
                <h2 className="form-title">Case Sheet</h2>

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
                        <span className="info-value">{patientData.ipNo || '—'}</span>
                    </div>
                    <div className="info-item" style={{ gridColumn: '1 / -1', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <span className="info-label">Address</span>
                        <span className="info-value">{formData.address || '—'}</span>
                    </div>
                </div>

                {/* General Examination */}
                <h3 className="form-section-title">General Examination</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <TextInput
                        label="Height (cm)"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="Enter height"
                    />
                    <TextInput
                        label="Weight (kg)"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="Enter weight"
                    />
                    <TextInput
                        label="Pulse (/min)"
                        name="pulse"
                        value={formData.pulse}
                        onChange={handleChange}
                        placeholder="Enter pulse"
                    />
                    <TextInput
                        label="BP (mmHg)"
                        name="bp"
                        value={formData.bp}
                        onChange={handleChange}
                        placeholder="e.g., 120/80"
                    />
                    <TextInput
                        label="Temp (°F)"
                        name="temp"
                        value={formData.temp}
                        onChange={handleChange}
                        placeholder="Enter temperature"
                    />
                    <TextInput
                        label="RR (/min)"
                        name="rr"
                        value={formData.rr}
                        onChange={handleChange}
                        placeholder="Enter RR"
                    />
                </div>

                {/* Systemic Examination */}
                <h3 className="form-section-title">Systemic Examination</h3>
                <div className="two-col">
                    <TextInput
                        label="RS"
                        name="rs"
                        value={formData.rs}
                        onChange={handleChange}
                        placeholder="Respiratory System"
                    />
                    <TextInput
                        label="CVS"
                        name="cvs"
                        value={formData.cvs}
                        onChange={handleChange}
                        placeholder="Cardiovascular System"
                    />
                    <TextInput
                        label="CNS"
                        name="cns"
                        value={formData.cns}
                        onChange={handleChange}
                        placeholder="Central Nervous System"
                    />
                    <TextInput
                        label="Others"
                        name="others"
                        value={formData.others}
                        onChange={handleChange}
                        placeholder="Other systems"
                    />
                </div>

                {/* Vulnerable Patient */}
                <div className="form-field">
                    <label className="field-label">Vulnerable Patient</label>
                    <div className="radio-group">
                        <label className={`radio-option ${formData.vulnerablePatient === 'Yes' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="vulnerablePatient"
                                value="Yes"
                                checked={formData.vulnerablePatient === 'Yes'}
                                onChange={handleChange}
                            />
                            <span>Yes</span>
                        </label>
                        <label className={`radio-option ${formData.vulnerablePatient === 'No' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="vulnerablePatient"
                                value="No"
                                checked={formData.vulnerablePatient === 'No'}
                                onChange={handleChange}
                            />
                            <span>No</span>
                        </label>
                    </div>
                </div>

                {/* Nutritional Screening */}
                <h3 className="form-section-title">Nutritional Screening</h3>
                <div className="form-field">
                    <label className="field-label">Loss of weight in past 3 months</label>
                    <div className="radio-group">
                        <label className={`radio-option ${formData.lossOfWeight === 'Yes' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="lossOfWeight"
                                value="Yes"
                                checked={formData.lossOfWeight === 'Yes'}
                                onChange={handleChange}
                            />
                            <span>Yes</span>
                        </label>
                        <label className={`radio-option ${formData.lossOfWeight === 'No' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="lossOfWeight"
                                value="No"
                                checked={formData.lossOfWeight === 'No'}
                                onChange={handleChange}
                            />
                            <span>No</span>
                        </label>
                    </div>
                </div>

                <div className="form-field">
                    <label className="field-label">Food intake reduced in last week</label>
                    <div className="radio-group">
                        <label className={`radio-option ${formData.foodIntakeReduced === 'Yes' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="foodIntakeReduced"
                                value="Yes"
                                checked={formData.foodIntakeReduced === 'Yes'}
                                onChange={handleChange}
                            />
                            <span>Yes</span>
                        </label>
                        <label className={`radio-option ${formData.foodIntakeReduced === 'No' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="foodIntakeReduced"
                                value="No"
                                checked={formData.foodIntakeReduced === 'No'}
                                onChange={handleChange}
                            />
                            <span>No</span>
                        </label>
                    </div>
                </div>

                {/* BMI Name */}
                <TextInput
                    label="BMI Name"
                    name="bmiName"
                    value={formData.bmiName}
                    onChange={handleChange}
                    placeholder="Enter BMI name"
                />

                {/* Diagnosis and Plan */}
                <div className="two-col">
                    <Textarea
                        label="Provisional Diagnosis"
                        name="provisionalDiagnosis"
                        value={formData.provisionalDiagnosis}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter provisional diagnosis"
                    />
                    <Textarea
                        label="Investigation Orders"
                        name="investigationOrders"
                        value={formData.investigationOrders}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter investigation orders"
                    />
                </div>

                <div className="two-col">
                    <Textarea
                        label="Final Diagnosis"
                        name="finalDiagnosis"
                        value={formData.finalDiagnosis}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter final diagnosis"
                    />
                    <Textarea
                        label="Plan"
                        name="plan"
                        value={formData.plan}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter treatment plan"
                    />
                </div>

                {/* Doctor Names */}
                <h3 className="form-section-title">Verified By</h3>
                <div className="two-col">
                    <TextInput
                        label="Name of Resident Doctor"
                        name="residentDoctorName"
                        value={formData.residentDoctorName}
                        onChange={handleChange}
                        placeholder="Enter resident doctor name"
                    />
                    <TextInput
                        label="Name of Consultant"
                        name="consultantName"
                        value={formData.consultantName}
                        onChange={handleChange}
                        placeholder="Enter consultant name"
                    />
                </div>

                <button type="submit" className="submit-btn">Submit Case Sheet</button>
            </form>
        </div>
    );
};

export default CaseSheetForm;
