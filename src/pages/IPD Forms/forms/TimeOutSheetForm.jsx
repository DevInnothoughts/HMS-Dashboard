import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const TimeOutSheetForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        uhid: patientData?.uhid || '',
        patientName: patientData?.name || '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        ipNo: patientData?.ipNo || '',

        doctorPerforming: '',
        procedureConducted: '',

        checklist: {
            teamIntroduced: '',
            patientIdentified: '',
            procedureVerified: '',
            allergyCheck: '',
            criticalEvents: '',
            siteVerification: '',
            siteMarked: '',
            imagingConfirmed: '',
            implantsAvailable: '',
            specialEquipment: '',
            prophylacticAntibiotic: '',
            thromboProphylaxis: '',
            preProceduralMeds: ''
        },

        completedByName: '',
        designation: '',
        completionDateTime: ''
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

    const checklistItems = [
        { id: 'teamIntroduced', label: 'All team members introduced by Name and Role' },
        { id: 'patientIdentified', label: 'Patient identity verified' },
        { id: 'procedureVerified', label: 'Procedure matches consent form' },
        { id: 'allergyCheck', label: 'Allergy / Adverse reaction checked' },
        { id: 'criticalEvents', label: 'Anticipated critical events discussed' },
        { id: 'siteVerification', label: 'Correct site / side / level verified' },
        { id: 'siteMarked', label: 'Surgical site marked' },
        { id: 'imagingConfirmed', label: 'Pre-op imaging data confirmed' },
        { id: 'implantsAvailable', label: 'Correct implants / prosthesis available' },
        { id: 'specialEquipment', label: 'Special equipment requirements met' },
        { id: 'prophylacticAntibiotic', label: 'Prophylactic antibiotics given' },
        { id: 'thromboProphylaxis', label: 'Thrombo prophylaxis received', options: ['Yes', 'Not reqd'] },
        { id: 'preProceduralMeds', label: 'Pre-procedural medications given' }
    ];

    return (
        <div className="medical-form-container">
            <h2 className="form-title">SURGICAL / PROCEDURAL TIME OUT SHEET</h2>

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
                <div className="two-col">
                    <TextInput label="Performing Physician" name="doctorPerforming" value={formData.doctorPerforming} onChange={handleChange} />
                    <TextInput label="Scheduled Procedure" name="procedureConducted" value={formData.procedureConducted} onChange={handleChange} />
                </div>

                <div className="section-box" style={{ background: '#fffbeb', border: '1px solid #fde68a', margin: '2rem 0', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <span style={{ color: '#92400e', fontWeight: '800', fontSize: '0.9rem' }}>
                        ⚠️ TIME OUT MUST BE COMPLETED IMMEDIATELY BEFORE THE PROCEDURE COMMENCES
                    </span>
                </div>

                <h3 className="form-section-title">Safety Checklist</h3>
                <div className="section-box" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--primary-color)', fontWeight: '800' }}>Assessment Criteria</th>
                                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', color: 'var(--primary-color)', fontWeight: '800', width: '250px' }}>Confirmation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checklistItems.map((item, idx) => (
                                <tr key={item.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', fontWeight: '600' }}>{item.label}</td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                                        <div className="radio-group" style={{ margin: 0, justifyContent: 'center' }}>
                                            {(item.options || ['Yes', 'No', 'NA']).map(opt => (
                                                <label key={opt} className={`radio-option ${formData.checklist[item.id] === opt.toLowerCase() ? 'selected' : ''}`} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                                    <input
                                                        type="radio"
                                                        name={`checklist.${item.id}`}
                                                        value={opt.toLowerCase()}
                                                        checked={formData.checklist[item.id] === opt.toLowerCase()}
                                                        onChange={handleChange}
                                                    />
                                                    <span>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="section-box" style={{ marginTop: '3rem', padding: '2rem' }}>
                    <h3 className="form-section-title" style={{ marginTop: 0 }}>Final Authentication</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <TextInput label="Verified By" name="completedByName" value={formData.completedByName} onChange={handleChange} />
                        <TextInput label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
                        <MuiDateTimePicker label="Auth Date & Time" name="completionDateTime" value={formData.completionDateTime} onChange={handleChange} />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', borderLeft: '4px solid var(--primary-color)', background: '#f8fafc', fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                    <strong>Post-procedure:</strong> Ensure clinical handover is documented. Label all specimens. Provide post-procedure education to the patient.
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '3rem' }}>
                    Finalize Time-Out & Proceed
                </button>
            </form>

            <style>{`
                .section-box {
                    background: #ffffff;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
            `}</style>
        </div>
    );
};

export default TimeOutSheetForm;
