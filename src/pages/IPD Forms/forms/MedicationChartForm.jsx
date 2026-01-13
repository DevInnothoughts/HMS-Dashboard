import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const MedicationChartForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        knownAllergies: '',
        medications: [
            {
                drugName: '',
                dose: '',
                route: '',
                frequency: '',
                drSign: '',
                orderDateTime: '',
                admins: Array(4).fill({ time: '', sign: '' })
            }
        ]
    });

    const handleAllergyChange = (e) => {
        setFormData(prev => ({ ...prev, knownAllergies: e.target.value }));
    };

    const handleMedChange = (index, field, value) => {
        const updatedMeds = [...formData.medications];
        updatedMeds[index] = { ...updatedMeds[index], [field]: value };
        setFormData(prev => ({ ...prev, medications: updatedMeds }));
    };

    const handleAdminChange = (medIndex, adminIndex, field, value) => {
        const updatedMeds = [...formData.medications];
        const updatedAdmins = [...updatedMeds[medIndex].admins];
        updatedAdmins[adminIndex] = { ...updatedAdmins[adminIndex], [field]: value };
        updatedMeds[medIndex] = { ...updatedMeds[medIndex], admins: updatedAdmins };
        setFormData(prev => ({ ...prev, medications: updatedMeds }));
    };

    const addMedication = () => {
        setFormData(prev => ({
            ...prev,
            medications: [
                ...prev.medications,
                {
                    drugName: '',
                    dose: '',
                    route: '',
                    frequency: '',
                    drSign: '',
                    orderDateTime: '',
                    admins: Array(4).fill({ time: '', sign: '' })
                }
            ]
        }));
    };

    const removeMedication = (index) => {
        if (formData.medications.length === 1) return;
        const updatedMeds = formData.medications.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, medications: updatedMeds }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                MEDICATION CHART
            </h2>

            {/* Compact Patient Header */}
            <div className="patient-compact-header">
                <div className="info-item">
                    <span className="info-label">UHID</span>
                    <span className="info-value">{patientData?.uhid}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Patient Name</span>
                    <span className="info-value">{patientData?.name}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{patientData?.age}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{patientData?.gender}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">IP No</span>
                    <span className="info-value">{patientData?.ipNo}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="medical-form">
                <div style={{ marginBottom: '1rem' }}>
                    <TextInput
                        label="Known allergies:"
                        name="knownAllergies"
                        value={formData.knownAllergies}
                        onChange={handleAllergyChange}
                        placeholder="Specify allergies or N/A..."
                    />
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '940px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <th style={{ padding: '8px', borderBottom: '1.5px solid var(--border-color)', fontWeight: '700', fontSize: '13px', textAlign: 'left', width: '38%' }}>Medicine Order</th>
                                <th style={{ padding: '8px', borderBottom: '1.5px solid var(--border-color)', fontWeight: '700', fontSize: '13px', textAlign: 'center' }}>Admin Record</th>
                                <th style={{ padding: '8px', borderBottom: '1.5px solid var(--border-color)', width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.medications.map((med, medIndex) => (
                                <tr key={medIndex} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <TextInput
                                                placeholder="Drug Name"
                                                value={med.drugName}
                                                onChange={(e) => handleMedChange(medIndex, 'drugName', e.target.value)}
                                                hideLabel
                                                style={{ fontWeight: '700', fontSize: '13px' }}
                                            />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                                                <TextInput placeholder="Dose" value={med.dose} onChange={(e) => handleMedChange(medIndex, 'dose', e.target.value)} hideLabel style={{ fontSize: '12px' }} />
                                                <TextInput placeholder="Route" value={med.route} onChange={(e) => handleMedChange(medIndex, 'route', e.target.value)} hideLabel style={{ fontSize: '12px' }} />
                                                <TextInput placeholder="Freq" value={med.frequency} onChange={(e) => handleMedChange(medIndex, 'frequency', e.target.value)} hideLabel style={{ fontSize: '12px' }} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)' }}>
                                                <TextInput placeholder="Dr. Sign" value={med.drSign} onChange={(e) => handleMedChange(medIndex, 'drSign', e.target.value)} hideLabel style={{ fontSize: '12px' }} />
                                                <MuiDateTimePicker label="Order Date" name="orderDateTime" value={med.orderDateTime} onChange={(e) => handleMedChange(medIndex, 'orderDateTime', e.target.value)} hideLabel />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0', verticalAlign: 'top', borderLeft: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', height: '100%' }}>
                                            {med.admins.map((admin, adminIndex) => (
                                                <div key={adminIndex} style={{
                                                    borderRight: adminIndex < 3 ? '1px solid var(--border-color)' : 'none',
                                                    padding: '8px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.4rem',
                                                    background: adminIndex % 2 === 0 ? 'transparent' : '#f8fafc'
                                                }}>
                                                    <MuiDateTimePicker
                                                        type="time"
                                                        label="Time"
                                                        name="time"
                                                        value={admin.time}
                                                        onChange={(e) => handleAdminChange(medIndex, adminIndex, 'time', e.target.value)}
                                                        hideLabel
                                                    />
                                                    <TextInput
                                                        placeholder="S.N. Sign"
                                                        value={admin.sign}
                                                        onChange={(e) => handleAdminChange(medIndex, adminIndex, 'sign', e.target.value)}
                                                        hideLabel
                                                        style={{ fontSize: '12px' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'middle', borderLeft: '1px solid var(--border-color)' }}>
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(medIndex)}
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
                                            title="Remove Row"
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button type="button" onClick={addMedication} className="submit-btn" style={{ backgroundColor: '#64748b', maxWidth: '200px' }}>
                        + Add Medication
                    </button>
                    <button type="submit" className="submit-btn" style={{ maxWidth: '200px' }}>
                        Save Chart
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MedicationChartForm;
