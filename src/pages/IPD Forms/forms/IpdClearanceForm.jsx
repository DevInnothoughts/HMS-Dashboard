import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';
import './Forms.css';

const IpdClearanceForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        uhid: patientData?.uhid || '',
        name: patientData?.name || '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        ipNo: patientData?.ipNo || '',

        clearances: {
            ipdPayment: { name: '', sign: '' },
            pharmacy: { name: '', sign: '' },
            lab: { name: '', sign: '' },
            histopathology: { name: '', sign: '' },
            canteen: { name: '', sign: '' },
            pocRounds: { name: '', sign: '' }
        }
    });

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            clearances: {
                ...prev.clearances,
                [section]: {
                    ...prev.clearances[section],
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    const departments = [
        { id: 'ipdPayment', label: '1. IPD PAYMENT' },
        { id: 'pharmacy', label: '2. PHARMACY' },
        { id: 'lab', label: '3. LAB' },
        { id: 'histopathology', label: '4. HISTOPATHOLOGY' },
        { id: 'canteen', label: '5. CANTEEN' },
        { id: 'pocRounds', label: '6. POC ROUNDS' }
    ];

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                IPD CLEARANCE SHEET
            </h2>

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
                    {departments.map((dept) => (
                        <div key={dept.id} style={{
                            padding: '1.75rem',
                            border: '1.5px solid var(--border-color)',
                            borderRadius: '16px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            <h3 className="form-section-title" style={{ marginTop: 0, borderBottomWidth: '2px' }}>
                                {dept.label}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <TextInput
                                    label="NAME OF STAFF"
                                    value={formData.clearances[dept.id].name}
                                    onChange={(e) => handleChange(dept.id, 'name', e.target.value)}
                                    placeholder="Enter full name"
                                />
                                <SignatureInput
                                    label="SIGNATURE"
                                    name={`${dept.id}_sign`}
                                    value={formData.clearances[dept.id].sign}
                                    onChange={(e) => handleChange(dept.id, 'sign', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                    <button type="submit" className="submit-btn" style={{ minWidth: '320px' }}>
                        Approve IPD Clearance
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IpdClearanceForm;
