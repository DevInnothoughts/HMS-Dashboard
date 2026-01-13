import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import SignatureInput from '../inputs/SignatureInput';
import './Forms.css';

const PostOperativeAdviceForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        postOperativeAdviceDetails: '',
        surgeonName: '',
        surgeonSignature: '',
        ipNo: patientData?.ipNo || ''
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
            <h2 className="form-title">
                POST OPERATIVE ADVICE
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
                <div style={{ marginTop: '1rem' }}>
                    <label className="field-label">Post Operative Advice & Instructions</label>
                    <Textarea
                        name="postOperativeAdviceDetails"
                        value={formData.postOperativeAdviceDetails}
                        onChange={handleChange}
                        rows={22}
                        placeholder="Enter detailed post-operative advice..."
                        textareaStyle={{
                            lineHeight: '1.8',
                            padding: '1.5rem',
                            fontSize: '1rem',
                            minHeight: '600px',
                            background: '#fff',
                            backgroundImage: 'linear-gradient(#f1f5f9 1.1px, transparent 1.1px)',
                            backgroundSize: '100% 1.8em',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px'
                        }}
                    />
                </div>

                <div className="section-box" style={{ marginTop: '3rem', padding: '2rem' }}>
                    <div className="two-col">
                        <TextInput
                            label="Name of Surgeon"
                            name="surgeonName"
                            value={formData.surgeonName}
                            onChange={handleChange}
                        />
                        <SignatureInput
                            label="Surgeon Signature"
                            name="surgeonSignature"
                            value={formData.surgeonSignature}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '3rem' }}>
                    Confirm & Save Post-Op Advice
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

export default PostOperativeAdviceForm;
