import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import RadioGroup from '../inputs/RadioGroup';

const CaseSheetForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',

        // General Examination
        height: '',
        weight: '',
        pulse: '',
        bp: '',
        temp: '',
        rr: '',
        pallor: '',
        edema: '',

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
        detailedScreeningNote: '',

        // Clinical Details
        nbmFrom: '',
        provisionalDiagnosis: '',
        investigationOrders: '',
        finalDiagnosis: '',
        plan: '',

        // Signatures
        residentDoctorName: '',
        residentDoctorSign: '',
        residentDoctorDate: '',
        residentDoctorTime: '',
        consultantName: '',
        consultantSign: '',
        consultantDate: '',
        consultantTime: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    const yesNoOptions = [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
    ];

    const presentAbsentOptions = [
        { value: 'Present', label: 'Present' },
        { value: 'Absent', label: 'Absent' }
    ];

    return (
        <form onSubmit={handleSubmit} className="medical-form" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '10px', borderRadius: '4px', margin: '0 0 30px 0', fontSize: '1.4rem' }}>
                CASE SHEET
            </h2>

            {/* Patient Header */}
            <div className="patient-compact-header" style={{ marginBottom: '30px' }}>
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

            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '15px', borderBottom: '1px solid #80deea', paddingBottom: '5px' }}>General Examination</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <TextInput label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
                    <TextInput label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
                    <TextInput label="Pulse (/min)" name="pulse" value={formData.pulse} onChange={handleChange} />
                    <TextInput label="BP (mmHg)" name="bp" value={formData.bp} onChange={handleChange} />
                    <TextInput label="Temp (°F)" name="temp" value={formData.temp} onChange={handleChange} />
                    <TextInput label="RR (/min)" name="rr" value={formData.rr} onChange={handleChange} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    <RadioGroup label="Pallor" name="pallor" value={formData.pallor} onChange={handleChange} options={presentAbsentOptions} />
                    <RadioGroup label="Edema" name="edema" value={formData.edema} onChange={handleChange} options={presentAbsentOptions} />
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '15px', borderBottom: '1px solid #80deea', paddingBottom: '5px' }}>Systemic Examination</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <TextInput label="RS" name="rs" value={formData.rs} onChange={handleChange} />
                    <TextInput label="CVS" name="cvs" value={formData.cvs} onChange={handleChange} />
                    <TextInput label="CNS" name="cns" value={formData.cns} onChange={handleChange} />
                    <TextInput label="Others" name="others" value={formData.others} onChange={handleChange} />
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <RadioGroup label="Vulnerable patient" name="vulnerablePatient" value={formData.vulnerablePatient} onChange={handleChange} options={yesNoOptions} />
            </div>

            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '15px' }}>Nutritional Screening</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <RadioGroup label="Loss of weight in past 3 months" name="lossOfWeight" value={formData.lossOfWeight} onChange={handleChange} options={yesNoOptions} />
                    <RadioGroup label="Food intake reduced in last week" name="foodIntakeReduced" value={formData.foodIntakeReduced} onChange={handleChange} options={yesNoOptions} />
                </div>
                <div style={{ marginTop: '15px' }}>
                    <TextInput label="If any 'Yes', detailed screening note" name="detailedScreeningNote" value={formData.detailedScreeningNote} onChange={handleChange} />
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <Textarea label="NBM from" name="nbmFrom" value={formData.nbmFrom} onChange={handleChange} />
                <Textarea label="Provisional diagnosis" name="provisionalDiagnosis" value={formData.provisionalDiagnosis} onChange={handleChange} />
                <Textarea label="Investigation orders" name="investigationOrders" value={formData.investigationOrders} onChange={handleChange} />
                <Textarea label="Final diagnosis" name="finalDiagnosis" value={formData.finalDiagnosis} onChange={handleChange} />
                <Textarea label="Plan" name="plan" value={formData.plan} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', borderTop: '2px solid #80deea', paddingTop: '30px' }}>
                {/* Resident Doctor */}
                <div>
                    <TextInput label="Name of Resident Doctor" name="residentDoctorName" value={formData.residentDoctorName} onChange={handleChange} />
                    <TextInput label="Sign" name="residentDoctorSign" value={formData.residentDoctorSign} onChange={handleChange} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="residentDoctorDate" value={formData.residentDoctorDate} onChange={handleChange} type="date" /></div>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="residentDoctorTime" value={formData.residentDoctorTime} onChange={handleChange} type="time" /></div>
                    </div>
                </div>
                {/* Consultant */}
                <div>
                    <TextInput label="Name of Consultant" name="consultantName" value={formData.consultantName} onChange={handleChange} />
                    <TextInput label="Sign" name="consultantSign" value={formData.consultantSign} onChange={handleChange} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="consultantDate" value={formData.consultantDate} onChange={handleChange} type="date" /></div>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="consultantTime" value={formData.consultantTime} onChange={handleChange} type="time" /></div>
                    </div>
                </div>
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '40px', width: '100%' }}>Complete Case Sheet</button>
        </form>
    );
};

export default CaseSheetForm;
