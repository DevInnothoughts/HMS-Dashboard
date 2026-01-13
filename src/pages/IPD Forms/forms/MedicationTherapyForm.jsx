import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const MedicationTherapyForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        allergy: '',
        statMeds: [{}],
        ivInfusion: [{}],
        verbalOrders: [{}],
        bloodSugar: [{}],
        highRiskMeds: [{}]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTableChange = (section, index, field, value) => {
        const updated = [...formData[section]];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, [section]: updated }));
    };

    const addRow = (section) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], {}]
        }));
    };

    const removeRow = (section, index) => {
        if (formData[section].length > 1) {
            const updated = formData[section].filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, [section]: updated }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    const TableSection = ({ title, section, columns }) => (
        <div style={{ marginBottom: '3rem' }}>
            <h3 className="form-section-title">{title}</h3>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>
                                    {col.label}
                                </th>
                            ))}
                            <th style={{ width: '50px', borderBottom: '1.5px solid var(--border-color)' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData[section].map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {columns.map((col, idx) => (
                                    <td key={idx} style={{ padding: '8px' }}>
                                        {col.type === 'datetime' ? (
                                            <MuiDateTimePicker
                                                value={row[col.field] || ''}
                                                onChange={e => handleTableChange(section, i, col.field, e.target.value)}
                                                hideLabel
                                            />
                                        ) : (
                                            <TextInput
                                                value={row[col.field] || ''}
                                                onChange={e => handleTableChange(section, i, col.field, e.target.value)}
                                                hideLabel
                                                placeholder={col.label}
                                            />
                                        )}
                                    </td>
                                ))}
                                <td style={{ textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => removeRow(section, i)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.25rem', cursor: 'pointer', visibility: formData[section].length > 1 ? 'visible' : 'hidden' }}
                                    >
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => addRow(section)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}>
                    + Add Row
                </button>
            </div>
        </div>
    );

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                MEDICATION & THERAPY RECORD
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

            <form onSubmit={handleSubmit} className="medical-form">
                <div className="form-field">
                    <TextInput
                        label="Allergy (if any)"
                        name="allergy"
                        value={formData.allergy}
                        onChange={handleChange}
                        placeholder="Specify allergies or N.A."
                    />
                </div>

                <TableSection
                    title="(STAT) Once Only Medicines"
                    section="statMeds"
                    columns={[
                        { label: 'Date', field: 'date', type: 'datetime' },
                        { label: 'Drug Name', field: 'drug' },
                        { label: 'Dose', field: 'dose' },
                        { label: 'Route', field: 'route' },
                        { label: 'Nurse Sign', field: 'nurse' }
                    ]}
                />

                <TableSection
                    title="Intravenous Infusion Therapy"
                    section="ivInfusion"
                    columns={[
                        { label: 'Date', field: 'date', type: 'datetime' },
                        { label: 'IV Fluid', field: 'fluid' },
                        { label: 'Rate', field: 'rate' },
                        { label: 'Doctor Sign', field: 'doctor' },
                        { label: 'Nurse Sign', field: 'nurse' }
                    ]}
                />

                <TableSection
                    title="For Verbal Orders Only"
                    section="verbalOrders"
                    columns={[
                        { label: 'Date', field: 'date', type: 'datetime' },
                        { label: 'Drug', field: 'drug' },
                        { label: 'Dose', field: 'dose' },
                        { label: 'Doctor', field: 'doctor' },
                        { label: 'Remarks', field: 'remarks' }
                    ]}
                />

                <TableSection
                    title="Blood Sugar & Insulin Record"
                    section="bloodSugar"
                    columns={[
                        { label: 'BSL', field: 'bsl' },
                        { label: 'Drug', field: 'drug' },
                        { label: 'Dose', field: 'dose' },
                        { label: 'Doctor', field: 'doctor' },
                        { label: 'Nurse', field: 'nurse' }
                    ]}
                />

                <TableSection
                    title="High Risk Medication"
                    section="highRiskMeds"
                    columns={[
                        { label: 'Drug', field: 'drug' },
                        { label: 'Dose', field: 'dose' },
                        { label: 'Doctor', field: 'doctor' },
                        { label: 'Nurse', field: 'nurse' },
                        { label: 'Remarks', field: 'remarks' }
                    ]}
                />

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <button type="submit" className="submit-btn" style={{ minWidth: '320px' }}>
                        Complete Medication Review
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MedicationTherapyForm;
