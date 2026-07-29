import React, { useState } from 'react';
import RadioGroup from '../inputs/RadioGroup';
import CheckboxGroup from '../inputs/CheckboxGroup';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const WHOTimeOutForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        allTeamMembersIntroduced: '',
        patientNameProcedureConfirmed: '',
        antibioticProphylaxis: '',
        antibioticTime: '',
        surgeonCriticalSteps: false,
        surgeonCaseDuration: false,
        surgeonBloodLoss: false,
        anaesthetistConcerns: false,
        nursingSterility: false,
        nursingEquipmentIssues: false,
        essentialImagingDisplayed: '',
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
                WHO SURGICAL SAFETY CHECKLIST - TIME OUT
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
                <h3 style={{ margin: '0' }}>Before skin incision (Time out)</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', margin: '5px 0' }}>
                    (With nurse, anaesthetist and surgeon)
                </p>
            </div>

            <div className="form-section">
                <RadioGroup
                    label="1) Confirm all team members have introduced themselves by name and role"
                    name="allTeamMembersIntroduced"
                    value={formData.allTeamMembersIntroduced}
                    onChange={handleChange}
                    options={['Yes', 'No']}
                />

                <RadioGroup
                    label="2) Confirm the patient's name, procedure, and where the incision will be made."
                    name="patientNameProcedureConfirmed"
                    value={formData.patientNameProcedureConfirmed}
                    onChange={handleChange}
                    options={['Yes', 'No']}
                />

                <div className="form-field">
                    <label className="field-label">3) Has antibiotic prophylaxis been given within the last 60 minutes?</label>
                    <div className="inline-radio-row" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="antibioticProphylaxis"
                                value="Yes"
                                checked={formData.antibioticProphylaxis === 'Yes'}
                                onChange={handleChange}
                            />
                            <span>Yes at</span>
                        </label>
                        <input
                            type="text"
                            name="antibioticTime"
                            value={formData.antibioticTime}
                            onChange={handleChange}
                            placeholder="am/pm"
                            style={{ width: '100px', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            disabled={formData.antibioticProphylaxis !== 'Yes'}
                        />
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="antibioticProphylaxis"
                                value="Not applicable"
                                checked={formData.antibioticProphylaxis === 'Not applicable'}
                                onChange={handleChange}
                            />
                            <span>Not applicable</span>
                        </label>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '10px' }}>4) Anticipated Critical Events</p>

                    <div style={{ paddingLeft: '20px' }}>
                        <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '5px' }}>By Surgeon:</p>
                        <div style={{ marginBottom: '10px' }}>
                            <label className="checkbox-option" style={{ display: 'block', marginBottom: '5px' }}>
                                <input type="checkbox" name="surgeonCriticalSteps" checked={formData.surgeonCriticalSteps} onChange={handleChange} />
                                <span>What are the critical or non-routine steps?</span>
                            </label>
                            <label className="checkbox-option" style={{ display: 'block', marginBottom: '5px' }}>
                                <input type="checkbox" name="surgeonCaseDuration" checked={formData.surgeonCaseDuration} onChange={handleChange} />
                                <span>How long will the case take?</span>
                            </label>
                            <label className="checkbox-option" style={{ display: 'block', marginBottom: '5px' }}>
                                <input type="checkbox" name="surgeonBloodLoss" checked={formData.surgeonBloodLoss} onChange={handleChange} />
                                <span>What is the anticipated blood loss?</span>
                            </label>
                        </div>

                        <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '5px' }}>By Anaesthetist:</p>
                        <div style={{ marginBottom: '10px' }}>
                            <label className="checkbox-option">
                                <input type="checkbox" name="anaesthetistConcerns" checked={formData.anaesthetistConcerns} onChange={handleChange} />
                                <span>Are there any patient-specific concerns?</span>
                            </label>
                        </div>

                        <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '5px' }}>By Nursing team:</p>
                        <div style={{ marginBottom: '10px' }}>
                            <label className="checkbox-option" style={{ display: 'block', marginBottom: '5px' }}>
                                <input type="checkbox" name="nursingSterility" checked={formData.nursingSterility} onChange={handleChange} />
                                <span>Has sterility (including indicators results) been confirmed?</span>
                            </label>
                            <label className="checkbox-option" style={{ display: 'block', marginBottom: '5px' }}>
                                <input type="checkbox" name="nursingEquipmentIssues" checked={formData.nursingEquipmentIssues} onChange={handleChange} />
                                <span>Are there equipment issues or any concerns?</span>
                            </label>
                        </div>
                    </div>
                </div>

                <RadioGroup
                    label="Is essential imaging displayed?"
                    name="essentialImagingDisplayed"
                    value={formData.essentialImagingDisplayed}
                    onChange={handleChange}
                    options={['Yes', 'Not applicable']}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <TextInput
                    label="Surgeon Name"
                    name="surgeonName"
                    value={formData.surgeonName}
                    onChange={handleChange}
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
                Submit Time Out
            </button>
        </form>
    );
};

export default WHOTimeOutForm;
