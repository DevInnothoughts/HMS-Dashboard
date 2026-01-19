import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';

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
        <div className="medical-form ipd-clearance-form">
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
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

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginTop: '20px' }}>
                    {departments.map((dept) => (
                        <div key={dept.id} style={{
                            padding: '25px',
                            border: '1px solid #e0f7fa',
                            borderRadius: '12px',
                            backgroundColor: '#fdfdfd',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            transition: 'transform 0.2s ease'
                        }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#00796b', borderBottom: '2px solid #80deea', paddingBottom: '10px', fontWeight: 'bold' }}>
                                {dept.label}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                    <button type="submit" className="submit-btn" style={{ minWidth: '300px' }}>
                        Approve IPD Clearance
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IpdClearanceForm;
