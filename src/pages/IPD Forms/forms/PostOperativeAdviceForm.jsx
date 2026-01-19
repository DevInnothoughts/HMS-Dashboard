import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import SignatureInput from '../inputs/SignatureInput';

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
        <div className="medical-form post-operative-advice-form">
            <h2 className="form-title" style={{ textAlign: 'center', marginBottom: '30px', color: '#80deea', borderBottom: '2px solid #80deea', paddingBottom: '10px' }}>
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

            <form onSubmit={handleSubmit} className="compact-form">
                <div className="notes-container" style={{ position: 'relative', marginTop: '10px' }}>
                    <Textarea
                        label="POST OPERATIVE ADVICE"
                        name="postOperativeAdviceDetails"
                        value={formData.postOperativeAdviceDetails}
                        onChange={handleChange}
                        rows={20}
                        placeholder="Enter post operative advice here..."
                        style={{
                            lineHeight: '32px',
                            padding: '8px 15px',
                            border: '2px solid #e1e8ed',
                            borderRadius: '6px',
                            width: '100%',
                            fontSize: '1rem',
                            minHeight: '500px'
                        }}
                    />
                </div>

                <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', padding: '20px', backgroundColor: '#fdfdfd', borderRadius: '12px', border: '1px solid #e0f7fa' }}>
                    <TextInput
                        label="Surgeon Name"
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

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                    <button type="submit" className="submit-btn" style={{ minWidth: '300px' }}>
                        Confirm Post-Op Advice
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostOperativeAdviceForm;
