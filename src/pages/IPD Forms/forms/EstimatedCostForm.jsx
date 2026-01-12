import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import CheckboxGroup from '../inputs/CheckboxGroup';
import SignatureInput from '../inputs/SignatureInput';
import './Forms.css';

const EstimatedCostForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        surgeryName: '',
        estimatedAmount: '',
        exclusionsAcknowledged: [],
        patientSignature: '',
        patientDateTime: '',
        counsellorName: '',
        counsellorSignature: '',
        counsellorDateTime: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <div className="medical-form-container">
            <form onSubmit={handleSubmit} className="medical-form">
                <h2 className="form-title">
                    ESTIMATED COST OF TREATMENT
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

                {/* Surgery & Estimate */}
                <div className="two-col">
                    <TextInput
                        label="Surgery / Treatment Name"
                        name="surgeryName"
                        value={formData.surgeryName}
                        onChange={handleChange}
                        required
                    />
                    <TextInput
                        label="Total Tentative Estimated Amount (₹)"
                        name="estimatedAmount"
                        value={formData.estimatedAmount}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Exclusions */}
                <div className="form-field">
                    <CheckboxGroup
                        label="The above estimate excludes"
                        name="exclusionsAcknowledged"
                        value={formData.exclusionsAcknowledged}
                        onChange={(values) =>
                            setFormData(prev => ({ ...prev, exclusionsAcknowledged: values }))
                        }
                        options={[
                            'Pre and post operative lab tests',
                            'Speciality consultants visit',
                            'Blood transfusion',
                            'Discharge medications',
                            'Unforeseen charges due to complications',
                            'ICU stay & higher antibiotics',
                            'Prolonged stay beyond 1 night'
                        ]}
                    />
                </div>

                <div style={{ padding: '1rem', background: '#fff9eb', borderLeft: '4px solid #f59e0b', borderRadius: '4px', margin: '1rem 0' }}>
                    <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
                        <strong>Note:</strong> This is only an estimate. If patient medical condition changes or additional problems are
                        identified after admission, the estimate may be revised.
                    </p>
                </div>

                {/* Patient Acceptance */}
                <h3 className="form-section-title">Patient / Legal Representative Acceptance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                    <TextInput
                        label="Name"
                        name="patientName"
                        value={patientData?.name || ''}
                        readOnly
                    />
                    <SignatureInput
                        label="Signature"
                        name="patientSignature"
                        value={formData.patientSignature}
                        onChange={handleChange}
                    />
                    <MuiDateTimePicker
                        label="Date & Time"
                        name="patientDateTime"
                        value={formData.patientDateTime}
                        onChange={handleChange}
                    />
                </div>

                {/* Counsellor Section */}
                <h3 className="form-section-title">Counselled By</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                    <TextInput
                        label="Counsellor Name"
                        name="counsellorName"
                        value={formData.counsellorName}
                        onChange={handleChange}
                    />
                    <SignatureInput
                        label="Signature"
                        name="counsellorSignature"
                        value={formData.counsellorSignature}
                        onChange={handleChange}
                    />
                    <MuiDateTimePicker
                        label="Date & Time"
                        name="counsellorDateTime"
                        value={formData.counsellorDateTime}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Confirm Estimated Cost
                </button>
            </form>
        </div>
    );
};

export default EstimatedCostForm;
