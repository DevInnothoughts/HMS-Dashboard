import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const GeneralConsentForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        uhid: patientData?.uhid || '',
        doaDateTime: (patientData?.doa && patientData?.doaTime) ? `${patientData.doa}T${patientData.doaTime}` : '',
        dodDateTime: (patientData?.dod && patientData?.dodTime) ? `${patientData.dod}T${patientData.dodTime}` : '',
        patientName: patientData?.name || '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        ipNo: patientData?.ipNo || '',
        doctorName: patientData?.doctorName || '',

        agreementChecked: false,
        patientSignDateTime: '',
        relativeName: '',
        relativeRelation: '',
        relativeSignDateTime: '',
        admittingDoctorRegNo: '',
        admittingDoctorDateTime: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.agreementChecked) {
            alert('Please agree to the terms and policy before submitting.');
            return;
        }
        onSubmit && onSubmit(formData);
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                GENERAL CONSENT FOR ADMISSION
            </h2>

            <form onSubmit={handleSubmit} className="medical-form">
                {/* Compact Patient Header */}
                {patientData && (
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
                )}

                <div className="form-field">
                    <TextInput label="Doctor's name:" name="doctorName" value={formData.doctorName} onChange={handleChange} required />
                </div>

                {/* Signatures Section */}
                <h3 className="form-section-title">Signatures</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '1.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '2.5rem' }}>
                    <div className="patient-sign-col">
                        <TextInput label="Patient's Name" name="patientName" value={formData.patientName} readOnly />
                        <div style={{ height: '80px', borderBottom: '2.5px solid #1e293b', marginBottom: '0.75rem', background: '#f8fafc', borderRadius: '4px' }}></div>
                        <small style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.7rem' }}>Patient's signature</small>
                        <div style={{ marginTop: '1.5rem' }}>
                            <MuiDateTimePicker label="Date & Time" name="patientSignDateTime" value={formData.patientSignDateTime} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="relative-sign-col">
                        <TextInput label="Relative Name / Relation" name="relativeName" value={formData.relativeName} onChange={handleChange} placeholder="e.g. Rahul (Son)" />
                        <div style={{ height: '80px', borderBottom: '2.5px solid #1e293b', marginBottom: '0.75rem', background: '#f8fafc', borderRadius: '4px' }}></div>
                        <small style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.7rem' }}>Relative's signature</small>
                        <div style={{ marginTop: '1.5rem' }}>
                            <MuiDateTimePicker label="Date & Time" name="relativeSignDateTime" value={formData.relativeSignDateTime} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', borderTop: '2px solid var(--primary-color)', paddingTop: '2rem' }}>
                    <h3 className="form-section-title">Admitting Doctor</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                        <div>
                            <div style={{ height: '60px', borderBottom: '2px solid #1e293b', marginBottom: '0.5rem', background: '#f8fafc', borderRadius: '4px' }}></div>
                            <small style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.65rem' }}>Sign of admitting doctor:</small>
                        </div>
                        <TextInput label="Reg no:" name="admittingDoctorRegNo" value={formData.admittingDoctorRegNo} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="admittingDoctorDateTime" value={formData.admittingDoctorDateTime} onChange={handleChange} />
                    </div>
                </div>

                {/* Final Agreement Section */}
                <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: '#f0fdfa', border: '1.5px solid var(--primary-color)', borderRadius: '12px' }}>
                    <label style={{ display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="agreementChecked"
                            id="agreementChecked"
                            checked={formData.agreementChecked}
                            onChange={handleChange}
                            style={{ width: '24px', height: '24px', accentColor: 'var(--primary-color)' }}
                            required
                        />
                        <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                            I agree to the hospital's terms, policy, and clinical consent.
                        </span>
                    </label>
                </div>

                <button type="submit" className="submit-btn" disabled={!formData.agreementChecked}>
                    Submit General Consent
                </button>
            </form>
        </div>
    );
};

export default GeneralConsentForm;
