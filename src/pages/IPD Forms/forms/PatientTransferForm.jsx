import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const PatientTransferForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        uhid: patientData?.uhid || '',
        patientName: patientData?.name || '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        ipNo: patientData?.ipNo || '',

        diagnosis: '',
        surgeryName: '',

        transferDateTime: '',
        reasonForTransfer: '',
        transferOutToDept: '',

        vitals: {
            temp: '',
            bp: '',
            rr: '',
            pulse: '',
            painScore: ''
        },

        totalIntakeOutput: '',
        totalDrainOut: '',
        presentAppliances: '',
        investigationHandover: '',
        medicineHandover: '',
        anyOther: '',

        shiftingNurseNameSign: '',
        shiftingNurseDateTime: '',
        shiftingRmoNameSign: '',
        shiftingRmoDateTime: '',

        receivingNurseNameSign: '',
        receivingNurseDateTime: '',
        receivingDoctorNameSign: '',
        receivingDoctorDateTime: ''
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">PATIENT TRANSFER FORM</h2>

            {/* Compact Patient Header */}
            <div className="patient-compact-header">
                <div className="info-item">
                    <span className="info-label">UHID</span>
                    <span className="info-value">{formData.uhid}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Patient Name</span>
                    <span className="info-value">{formData.patientName}</span>
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
                <div className="two-col">
                    <TextInput label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
                    <TextInput label="Surgery Name" name="surgeryName" value={formData.surgeryName} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.5rem', margin: '1.5rem 0', alignItems: 'end' }}>
                    <MuiDateTimePicker label="Transfer Date & Time" name="transferDateTime" value={formData.transferDateTime} onChange={handleChange} />
                    <TextInput label="Reason for Transfer" name="reasonForTransfer" value={formData.reasonForTransfer} onChange={handleChange} />
                    <TextInput label="Target Department" name="transferOutToDept" value={formData.transferOutToDept} onChange={handleChange} />
                </div>

                <h3 className="form-section-title">Current Vitals</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <TextInput label="Temp" name="vitals.temp" value={formData.vitals.temp} onChange={handleChange} />
                    <TextInput label="B.P." name="vitals.bp" value={formData.vitals.bp} onChange={handleChange} />
                    <TextInput label="RR" name="vitals.rr" value={formData.vitals.rr} onChange={handleChange} />
                    <TextInput label="Pulse" name="vitals.pulse" value={formData.vitals.pulse} onChange={handleChange} />
                    <TextInput label="Pain Score" name="vitals.painScore" value={formData.vitals.painScore} onChange={handleChange} />
                </div>

                <h3 className="form-section-title">Clinical Handover</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <TextInput label="Total Intake/Output" name="totalIntakeOutput" value={formData.totalIntakeOutput} onChange={handleChange} />
                    <TextInput label="Total Drain Out" name="totalDrainOut" value={formData.totalDrainOut} onChange={handleChange} />
                    <TextInput label="Present Appliances" name="presentAppliances" value={formData.presentAppliances} onChange={handleChange} />
                    <TextInput label="Investigation Handover" name="investigationHandover" value={formData.investigationHandover} onChange={handleChange} />
                    <TextInput label="Medicine Handover" name="medicineHandover" value={formData.medicineHandover} onChange={handleChange} />
                    <TextInput label="Any Other Notes" name="anyOther" value={formData.anyOther} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
                    <div style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', fontWeight: '700' }}>SHIFTING STAFF</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <TextInput label="Nurse Name & Sign" name="shiftingNurseNameSign" value={formData.shiftingNurseNameSign} onChange={handleChange} />
                                <MuiDateTimePicker label="DateTime" name="shiftingNurseDateTime" value={formData.shiftingNurseDateTime} onChange={handleChange} hideLabel />
                            </div>
                            <div>
                                <TextInput label="RMO Name & Sign" name="shiftingRmoNameSign" value={formData.shiftingRmoNameSign} onChange={handleChange} />
                                <MuiDateTimePicker label="DateTime" name="shiftingRmoDateTime" value={formData.shiftingRmoDateTime} onChange={handleChange} hideLabel />
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px' }}>
                        <h4 style={{ marginBottom: '1.5rem', color: '#0f766e', fontWeight: '700' }}>RECEIVING STAFF</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <TextInput label="Nurse Name & Sign" name="receivingNurseNameSign" value={formData.receivingNurseNameSign} onChange={handleChange} />
                                <MuiDateTimePicker label="DateTime" name="receivingNurseDateTime" value={formData.receivingNurseDateTime} onChange={handleChange} hideLabel />
                            </div>
                            <div>
                                <TextInput label="Doctor Name & Sign" name="receivingDoctorNameSign" value={formData.receivingDoctorNameSign} onChange={handleChange} />
                                <MuiDateTimePicker label="DateTime" name="receivingDoctorDateTime" value={formData.receivingDoctorDateTime} onChange={handleChange} hideLabel />
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '3rem' }}>
                    Finalize Transfer
                </button>
            </form>
        </div>
    );
};

export default PatientTransferForm;
