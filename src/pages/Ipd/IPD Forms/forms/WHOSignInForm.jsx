import React, { useState } from 'react';
import RadioGroup from '../inputs/RadioGroup';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const WHOSignInForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        confirmedIdentity: '',
        siteMarked: '',
        anaesthesiaCheck: '',
        knownAllergy: '',
        difficultAirway: '',
        bloodLossRisk: '',
        circulatingNurse: '',
        circulatingSignature: '',
        circulatingDate: '',
        anaesthetistName: '',
        anaesthetistSignature: '',
        anaesthetistDate: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '8px', borderRadius: '4px', margin: '10px 0 20px 0', fontSize: '1.2rem' }}>
                WHO SURGICAL SAFETY CHECKLIST - SIGN IN
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
                <h3 style={{ margin: '0' }}>Before induction of anaesthesia (Sign in)</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', margin: '5px 0' }}>
                    (With at least nurse and anaesthetist)
                </p>
            </div>

            <div className="form-section">
                <RadioGroup
                    label="Has Patient confirmed his/her identity, site, procedure, and consent?"
                    name="confirmedIdentity"
                    value={formData.confirmedIdentity}
                    onChange={handleChange}
                    options={['Yes', 'No']}
                />

                <RadioGroup
                    label="Is the site marked?"
                    name="siteMarked"
                    value={formData.siteMarked}
                    onChange={handleChange}
                    options={['Yes', 'Not applicable']}
                />

                <RadioGroup
                    label="Is the anaesthesia machine and medication check complete?"
                    name="anaesthesiaCheck"
                    value={formData.anaesthesiaCheck}
                    onChange={handleChange}
                    options={['Yes', 'No']}
                />

                <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '10px' }}>Does the patient have:</p>

                <div style={{ paddingLeft: '20px' }}>
                    <RadioGroup
                        label="1) Known allergy?"
                        name="knownAllergy"
                        value={formData.knownAllergy}
                        onChange={handleChange}
                        options={['No', 'Yes']}
                    />

                    <RadioGroup
                        label="2) Difficult airway or aspiration risk?"
                        name="difficultAirway"
                        value={formData.difficultAirway}
                        onChange={handleChange}
                        options={['No', 'Yes and equipment / assistance available']}
                    />

                    <RadioGroup
                        label="3) Risk of >500ml blood loss (7ml/kg in children)?"
                        name="bloodLossRisk"
                        value={formData.bloodLossRisk}
                        onChange={handleChange}
                        options={['No', 'Yes and two i.v. / central access and fluids planned']}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <TextInput
                    label="Circulating Nurse Name"
                    name="circulatingNurse"
                    value={formData.circulatingNurse}
                    onChange={handleChange}
                />
                <SignatureInput
                    label="Signature"
                    name="circulatingSignature"
                    value={formData.circulatingSignature}
                    onChange={handleChange}
                />
                <MuiDateTimePicker
                    label="Date & Time"
                    name="circulatingDate"
                    value={formData.circulatingDate}
                    onChange={handleChange}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <TextInput
                    label="Anaesthetist's Name: Dr."
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

            <button type="submit" className="submit-btn" style={{ marginTop: '30px' }}>
                Submit Sign In
            </button>
        </form>
    );
};

export default WHOSignInForm;
