import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import RadioGroup from '../inputs/RadioGroup';
import './Forms.css'; // Importing your shared CSS

const CaseSheetForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',
        height: '', weight: '', pulse: '', bp: '', temp: '', rr: '',
        pallor: '', edema: '',
        rs: '', cvs: '', cns: '', others: '',
        vulnerablePatient: '',
        lossOfWeight: '', foodIntakeReduced: '', detailedScreeningNote: '',
        nbmFrom: '', provisionalDiagnosis: '', investigationOrders: '', finalDiagnosis: '', plan: '',
        residentDoctorName: '', residentDoctorSign: '', residentDoctorDate: '', residentDoctorTime: '',
        consultantName: '', consultantSign: '', consultantDate: '', consultantTime: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    const yesNoOptions = [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }];
    const presentAbsentOptions = [{ value: 'Present', label: 'Present' }, { value: 'Absent', label: 'Absent' }];

    return (
        <div className="medical-form-container">
            <form onSubmit={handleSubmit}>
                <h2 className="form-title">CASE SHEET</h2>

                {/* Patient Header - Reusing standard IPD style */}
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
                        <span className="info-label">Age/Sex</span>
                        <span className="info-value">{formData.age || '—'}/{formData.gender || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">IP No</span>
                        <span className="info-value">{formData.ipNo || '—'}</span>
                    </div>
                </div>

                {/* Section 1: General Examination */}
                <div className="section-box">
                    <div className="form-section-title">General Examination</div>
                    <div className="three-col">
                        <TextInput label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
                        <TextInput label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
                        <TextInput label="Pulse (/min)" name="pulse" value={formData.pulse} onChange={handleChange} />
                    </div>
                    <div className="three-col" style={{ marginTop: '10px' }}>
                        <TextInput label="BP (mmHg)" name="bp" value={formData.bp} onChange={handleChange} />
                        <TextInput label="Temp (°F)" name="temp" value={formData.temp} onChange={handleChange} />
                        <TextInput label="RR (/min)" name="rr" value={formData.rr} onChange={handleChange} />
                    </div>
                    <div className="two-col" style={{ marginTop: '15px' }}>
                        <div className="form-field">
                            <label className="field-label">Pallor</label>
                            <RadioGroup name="pallor" value={formData.pallor} onChange={handleChange} options={presentAbsentOptions} />
                        </div>
                        <div className="form-field">
                            <label className="field-label">Edema</label>
                            <RadioGroup name="edema" value={formData.edema} onChange={handleChange} options={presentAbsentOptions} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Systemic Examination */}
                <div className="section-box">
                    <div className="form-section-title">Systemic Examination</div>
                    <div className="two-col">
                        <TextInput label="RS (Respiratory)" name="rs" value={formData.rs} onChange={handleChange} />
                        <TextInput label="CVS (Cardiovascular)" name="cvs" value={formData.cvs} onChange={handleChange} />
                        <TextInput label="CNS (Central Nervous)" name="cns" value={formData.cns} onChange={handleChange} />
                        <TextInput label="Others" name="others" value={formData.others} onChange={handleChange} />
                    </div>
                    <div className="form-field" style={{ marginTop: '15px' }}>
                        <label className="field-label">Vulnerable Patient Status</label>
                        <RadioGroup name="vulnerablePatient" value={formData.vulnerablePatient} onChange={handleChange} options={yesNoOptions} />
                    </div>
                </div>

                {/* Section 3: Nutritional Screening */}
                <div className="section-box" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="form-section-title">Nutritional Screening</div>
                    <div className="two-col">
                        <div className="form-field">
                            <label className="field-label">Loss of weight in past 3 months?</label>
                            <RadioGroup name="lossOfWeight" value={formData.lossOfWeight} onChange={handleChange} options={yesNoOptions} />
                        </div>
                        <div className="form-field">
                            <label className="field-label">Food intake reduced in last week?</label>
                            <RadioGroup name="foodIntakeReduced" value={formData.foodIntakeReduced} onChange={handleChange} options={yesNoOptions} />
                        </div>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <TextInput label="Detailed screening note (if 'Yes' to any)" name="detailedScreeningNote" value={formData.detailedScreeningNote} onChange={handleChange} />
                    </div>
                </div>

                {/* Section 4: Clinical Diagnosis & Plan */}
                <div className="section-box">
                    <div className="form-section-title">Clinical Details</div>
                    <Textarea label="NBM Status / Instructions" name="nbmFrom" value={formData.nbmFrom} onChange={handleChange} rows={2} />
                    <div className="two-col">
                        <Textarea label="Provisional Diagnosis" name="provisionalDiagnosis" value={formData.provisionalDiagnosis} onChange={handleChange} rows={3} />
                        <Textarea label="Final Diagnosis" name="finalDiagnosis" value={formData.finalDiagnosis} onChange={handleChange} rows={3} />
                    </div>
                    <Textarea label="Investigation Orders" name="investigationOrders" value={formData.investigationOrders} onChange={handleChange} rows={2} />
                    <Textarea label="Management Plan" name="plan" value={formData.plan} onChange={handleChange} rows={3} />
                </div>

                {/* Section 5: Authorization */}
                <div className="section-box" style={{ borderTop: '4px solid var(--primary-color)' }}>
                    <div className="form-body-split">
                        <div className="section-box" style={{ margin: 0 }}>
                            <div className="info-label" style={{ marginBottom: '10px' }}>Resident Doctor</div>
                            <TextInput label="Doctor Name" name="residentDoctorName" value={formData.residentDoctorName} onChange={handleChange} />
                            <TextInput label="Signature" name="residentDoctorSign" value={formData.residentDoctorSign} onChange={handleChange} />
                            <div className="two-col" style={{ marginTop: '10px' }}>
                                <MuiDateTimePicker label="Date" name="residentDoctorDate" value={formData.residentDoctorDate} onChange={handleChange} type="date" />
                                <MuiDateTimePicker label="Time" name="residentDoctorTime" value={formData.residentDoctorTime} onChange={handleChange} type="time" />
                            </div>
                        </div>
                        <div className="section-box" style={{ margin: 0 }}>
                            <div className="info-label" style={{ marginBottom: '10px' }}>Consultant In-Charge</div>
                            <TextInput label="Consultant Name" name="consultantName" value={formData.consultantName} onChange={handleChange} />
                            <TextInput label="Signature" name="consultantSign" value={formData.consultantSign} onChange={handleChange} />
                            <div className="two-col" style={{ marginTop: '10px' }}>
                                <MuiDateTimePicker label="Date" name="consultantDate" value={formData.consultantDate} onChange={handleChange} type="date" />
                                <MuiDateTimePicker label="Time" name="consultantTime" value={formData.consultantTime} onChange={handleChange} type="time" />
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" className="submit-btn">Complete Case Sheet</button>
            </form>
        </div>
    );
};

export default CaseSheetForm;