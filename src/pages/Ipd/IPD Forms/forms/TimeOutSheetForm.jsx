import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import RadioGroup from '../inputs/RadioGroup';

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
        completionDate: '',
        completionTime: ''
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
        { id: 'teamIntroduced', label: '1. Confirm all team members have introduced themselves by Name and Role' },
        { id: 'patientIdentified', label: '2. Patient identification confirmed' },
        { id: 'procedureVerified', label: '3. Procedure verified and matches consent' },
        { id: 'allergyCheck', label: '4. Allergy / Adverse reaction check' },
        { id: 'criticalEvents', label: '5. Anticipated critical events' },
        { id: 'siteVerification', label: '6. Correct site / side / level verification and matches consent' },
        { id: 'siteMarked', label: '7. Site marked' },
        { id: 'imagingConfirmed', label: '8. Imaging data confirmed' },
        { id: 'implantsAvailable', label: '9. Correct implants / prosthesis (type / size / side) are available' },
        { id: 'specialEquipment', label: '10. Any special equipment needed is available' },
        { id: 'prophylacticAntibiotic', label: '11. Does the patient need prophylactic antibiotic? if yes, has it been given according to the guidelines' },
        { id: 'thromboProphylaxis', label: '12. Has the patient received thrombo prophylaxis?' },
        { id: 'preProceduralMeds', label: '13. Does the patient need any pre-procedural medications? if yes, have they been given' }
    ];

    const cardStyle = {
        padding: '25px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        marginBottom: '25px',
        border: '1px solid #e0f7fa'
    };

    const sectionHeaderStyle = {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#00838f',
        marginBottom: '20px',
        borderBottom: '2px solid #80deea',
        paddingBottom: '8px'
    };

    return (
        <div className="medical-form timeout-sheet-form" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '15px', borderRadius: '8px', margin: '0 0 30px 0', fontSize: '1.6rem', fontWeight: 'bold' }}>
                TIME OUT SHEET FOR PROCEDURES
            </h2>

            <form onSubmit={handleSubmit}>
                {/* Compact Patient Header */}
                <div className="patient-compact-header" style={{ marginBottom: '30px' }}>
                    <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{formData.uhid || '—'}</span></div>
                    <div className="info-item"><span className="info-label">Patient Name</span><span className="info-value">{formData.patientName || '—'}</span></div>
                    <div className="info-item"><span className="info-label">Age</span><span className="info-value">{formData.age || '—'}</span></div>
                    <div className="info-item"><span className="info-label">Gender</span><span className="info-value">{formData.gender || '—'}</span></div>
                    <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{formData.ipNo || '—'}</span></div>
                </div>

                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>Procedure Information</div>
                    <div style={{ marginBottom: '15px', fontWeight: '600', color: '#546e7a', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        * Time out is to be completed immediately before the procedure starts.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <TextInput label="Doctor performing procedure" name="doctorPerforming" value={formData.doctorPerforming} onChange={handleChange} />
                        <TextInput label="Name of the procedure" name="procedureConducted" value={formData.procedureConducted} onChange={handleChange} />
                    </div>
                </div>

                {/* Checklist Section */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>Safety Checklist</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {checklistItems.map((item, index) => (
                            <div key={item.id} style={{
                                padding: '15px',
                                backgroundColor: index % 2 === 0 ? '#f9fefe' : '#fff',
                                borderRadius: '8px',
                                border: '1px solid #f0faff'
                            }}>
                                <RadioGroup
                                    label={item.label}
                                    name={`checklist.${item.id}`}
                                    value={formData.checklist[item.id]}
                                    onChange={handleChange}
                                    options={item.options || [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'na', label: 'N/A' }]}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Completion Section */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>Final Confirmation</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px', marginBottom: '20px' }}>
                        <TextInput label="Form completed by (Name)" name="completedByName" value={formData.completedByName} onChange={handleChange} />
                        <TextInput label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
                    </div>
                    <div style={{ display: 'flex', gap: '20px', maxWidth: '500px' }}>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="completionDate" value={formData.completionDate} onChange={handleChange} type="date" /></div>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="completionTime" value={formData.completionTime} onChange={handleChange} type="time" /></div>
                    </div>

                    <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#fff8e1', borderRadius: '8px', borderLeft: '4px solid #ffb300', fontSize: '0.85rem', color: '#5d4037', lineHeight: '1.6' }}>
                        <strong>Post procedure:</strong> Document the procedure and advice of clinical handover in the patient's healthcare record. Ensure patient is aware of post procedure health advice. Label any specimens/images correctly. Document any post-procedure tests where clinically relevant.
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ width: '100%', padding: '15px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    Confirm Time Out & Proceed
                </button>
            </form>
        </div>
    );
};

export default TimeOutSheetForm;
