import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const WHOSignOutForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        procedureNameConfirmed: false,
        countsCompleted: false,
        specimenLabeled: false,
        equipmentProblems: false,
        recoveryConcerns: false,
        scrubNurseName: '',
        scrubNurseSignature: '',
        scrubNurseDate: '',
        anaesthetistName: '',
        anaesthetistSignature: '',
        anaesthetistDate: '',
        surgeonName: '',
        surgeonSignature: '',
        surgeonDate: ''
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
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '8px', borderRadius: '4px', margin: '10px 0 20px 0', fontSize: '1.2rem' }}>
                WHO SURGICAL SAFETY CHECKLIST - SIGN OUT
            </h2>

            {/* Compact Patient Header */}
            {patientData && (
                <div className="patient-compact-header">
                    <div className="info-item">
                        <span className="info-label">UHID</span>
                        <span className="info-value">{patientData.uhid}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Patient Name</span>
                        <span className="info-value">{patientData.name}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Age</span>
                        <span className="info-value">{patientData.age}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Gender</span>
                        <span className="info-value">{patientData.gender}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">IP No</span>
                        <span className="info-value">{patientData.ipNo}</span>
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0' }}>Before patient leaves operation theatre (Sign out)</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', margin: '5px 0' }}>
                    (With nurse, anaesthetist and surgeon)
                </p>
            </div>

            <div className="form-section">
                <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '10px' }}>Nurse verbally confirms:</p>
                <div style={{ paddingLeft: '20px' }}>
                    <label className="checkbox-option" style={{ display: 'block', marginBottom: '10px' }}>
                        <input type="checkbox" name="procedureNameConfirmed" checked={formData.procedureNameConfirmed} onChange={handleChange} />
                        <span>The name of the procedure</span>
                    </label>
                    <label className="checkbox-option" style={{ display: 'block', marginBottom: '10px' }}>
                        <input type="checkbox" name="countsCompleted" checked={formData.countsCompleted} onChange={handleChange} />
                        <span>Completion of instrument, sponge and needle counts</span>
                    </label>
                    <label className="checkbox-option" style={{ display: 'block', marginBottom: '10px' }}>
                        <input type="checkbox" name="specimenLabeled" checked={formData.specimenLabeled} onChange={handleChange} />
                        <span>Specimen labeling (read specimen labels aloud, including patient name)</span>
                    </label>
                    <label className="checkbox-option" style={{ display: 'block', marginBottom: '20px' }}>
                        <input type="checkbox" name="equipmentProblems" checked={formData.equipmentProblems} onChange={handleChange} />
                        <span>Whether there are any equipment problems to be addressed</span>
                    </label>
                </div>

                <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '10px' }}>To Surgeon, Anaesthetist and Nursing team:</p>
                <div style={{ paddingLeft: '20px' }}>
                    <label className="checkbox-option" style={{ display: 'block', marginBottom: '10px' }}>
                        <input type="checkbox" name="recoveryConcerns" checked={formData.recoveryConcerns} onChange={handleChange} />
                        <span>What are the key concerns for recovery and management of this patient?</span>
                    </label>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <TextInput
                    label="Scrub Nurse Name"
                    name="scrubNurseName"
                    value={formData.scrubNurseName}
                    onChange={handleChange}
                />
                <SignatureInput
                    label="Signature"
                    name="scrubNurseSignature"
                    value={formData.scrubNurseSignature}
                    onChange={handleChange}
                />
                <MuiDateTimePicker
                    label="Date & Time"
                    name="scrubNurseDate"
                    value={formData.scrubNurseDate}
                    onChange={handleChange}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <TextInput
                    label="Anaesthetist's Name : Dr."
                    name="anaesthetistName"
                    value={formData.anaesthetistName}
                    onChange={handleChange}
                    placeholder="Enter Name"
                />
                <SignatureInput
                    label="Signature"
                    name="anaesthetistSignature"
                    value={formData.anaesthetistSignature}
                    onChange={handleChange}
                />
                <MuiDateTimePicker
                    label="Date & Time"
                    name="anaesthetistDate"
                    value={formData.anaesthetistDate}
                    onChange={handleChange}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <TextInput
                    label="Surgeon Name : Dr."
                    name="surgeonName"
                    value={formData.surgeonName}
                    onChange={handleChange}
                    placeholder="Enter Name"
                />
                <SignatureInput
                    label="Signature"
                    name="surgeonSignature"
                    value={formData.surgeonSignature}
                    onChange={handleChange}
                />
                <MuiDateTimePicker
                    label="Date & Time"
                    name="surgeonDate"
                    value={formData.surgeonDate}
                    onChange={handleChange}
                />
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '30px' }}>
                Submit Sign Out
            </button>
        </form>
    );
};

export default WHOSignOutForm;
