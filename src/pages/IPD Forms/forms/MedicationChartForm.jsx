import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

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

    const cellStyle = {
        padding: '8px',
        border: '1px solid #ddd',
        fontSize: '0.85rem'
    };

    return (
        <div className="medical-form medication-chart-form" style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px' }}>
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '8px', borderRadius: '4px', margin: '10px 0 20px 0', fontSize: '1.2rem' }}>
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

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <TextInput
                        label="Known allergies:"
                        name="knownAllergies"
                        value={formData.knownAllergies}
                        onChange={handleAllergyChange}
                        placeholder="Specify allergies or N.A."
                    />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f4f7f6' }}>
                                <th style={{ ...cellStyle, width: '40%', fontWeight: 'bold', color: '#008b8b' }}>Medicine Order</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#008b8b' }}>Medicine Administration Record</th>
                                <th style={{ ...cellStyle, width: '50px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.medications.map((med, medIndex) => (
                                <tr key={medIndex}>
                                    <td style={{ ...cellStyle, padding: '0' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
                                            <div style={{ padding: '4px' }}>
                                                <TextInput
                                                    placeholder="Drug Name"
                                                    value={med.drugName}
                                                    onChange={(e) => handleMedChange(medIndex, 'drugName', e.target.value)}
                                                    hideLabel
                                                    style={{ fontWeight: 'bold' }}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                                                <TextInput
                                                    placeholder="Dose"
                                                    value={med.dose}
                                                    onChange={(e) => handleMedChange(medIndex, 'dose', e.target.value)}
                                                    hideLabel
                                                />
                                                <TextInput
                                                    placeholder="Route"
                                                    value={med.route}
                                                    onChange={(e) => handleMedChange(medIndex, 'route', e.target.value)}
                                                    hideLabel
                                                />
                                                <TextInput
                                                    placeholder="Freq"
                                                    value={med.frequency}
                                                    onChange={(e) => handleMedChange(medIndex, 'frequency', e.target.value)}
                                                    hideLabel
                                                />
                                            </div>
                                            <div style={{ padding: '8px', borderTop: '1px solid #eee' }}>
                                                <TextInput
                                                    placeholder="Dr. Sign"
                                                    value={med.drSign}
                                                    onChange={(e) => handleMedChange(medIndex, 'drSign', e.target.value)}
                                                    hideLabel
                                                />
                                                <div style={{ marginTop: '5px' }}>
                                                    <MuiDateTimePicker
                                                        label="Order Date & Time"
                                                        name="orderDateTime"
                                                        value={med.orderDateTime}
                                                        onChange={(e) => handleMedChange(medIndex, 'orderDateTime', e.target.value)}
                                                        hideLabel
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ ...cellStyle, padding: '0' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', height: '100%', minHeight: '120px' }}>
                                            {med.admins.map((admin, adminIndex) => (
                                                <div key={adminIndex} style={{ borderRight: adminIndex < 3 ? '1px solid #eee' : 'none', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <MuiDateTimePicker
                                                        type="time"
                                                        label="Time"
                                                        name="time"
                                                        value={admin.time}
                                                        onChange={(e) => handleAdminChange(medIndex, adminIndex, 'time', e.target.value)}
                                                        hideLabel
                                                    />
                                                    <TextInput
                                                        placeholder="Sign"
                                                        value={admin.sign}
                                                        onChange={(e) => handleAdminChange(medIndex, adminIndex, 'sign', e.target.value)}
                                                        hideLabel
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(medIndex)}
                                            className="remove-btn"
                                            title="Remove Medication"
                                        >
                                            &times;
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                    <button
                        type="button"
                        onClick={addMedication}
                        className="secondary-btn"
                    >
                        + Add Medication Order
                    </button>
                </div>

                <button type="submit" className="submit-btn">
                    Save Medication Chart
                </button>
            </form>
        </div>
    );
};

export default MedicationChartForm;
