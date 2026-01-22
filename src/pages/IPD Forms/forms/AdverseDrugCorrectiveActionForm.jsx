import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import SignatureInput from '../inputs/SignatureInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const AdverseDrugCorrectiveActionForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        medicalAdministratorName: '',
        adminDateTime: '',
        medicalDirectorComments: '',
        medicalDirectorSign: '',
        medicalDirectorDate: '',
        correctiveAction: '',
        preventiveAction: '',
        actionPlan: '',
        verifiedByName: '',
        verifiedBySign: '',
        verifiedDate: '',
        verifiedTime: ''
    });

    const [isListening, setIsListening] = useState(false);

    const handleVoiceToText = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support voice recognition. Please try Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({
                ...prev,
                medicalDirectorComments: prev.medicalDirectorComments
                    ? `${prev.medicalDirectorComments} ${transcript}`
                    : transcript
            }));
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

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

    const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
};

    return (
        <div className="medical-form-container">
            <style>
            {`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                .listening-animation {
                    animation: pulse 1.5s infinite;
                }
            `}
        </style>
            <form onSubmit={handleSubmit} className="medical-form">
                <h2 className="form-title">
                    ADVERSE DRUG REPORT – CORRECTIVE & PREVENTIVE ACTION
                </h2>

            {/* Patient Header */}
            <div className="patient-compact-header" style={{ marginBottom: '30px' }}>
                <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{formData.uhid || '—'}</span></div>
                <div className="info-item"><span className="info-label">Patient Name</span><span className="info-value">{formData.name || '—'}</span></div>
                <div className="info-item"><span className="info-label">Age</span><span className="info-value">{formData.age || '—'}</span></div>
                <div className="info-item"><span className="info-label">Gender</span><span className="info-value">{formData.gender || '—'}</span></div>
                <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{formData.ipNo || '—'}</span></div>
            </div>

            {/* Administrator Header */}
            <div style={{ ...cardStyle, padding: '0', border: '1px solid #333' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', borderBottom: '1px solid #333' }}>
                    <div style={{ padding: '10px', borderRight: '1px solid #333' }}>
                        <TextInput label="Medical administrator Name:" name="medicalAdministratorName" value={formData.medicalAdministratorName} onChange={handleChange} />
                    </div>
                    <div style={{ padding: '10px' }}>
                        <MuiDateTimePicker label="Date & Time:" name="adminDateTime" value={formData.adminDateTime} onChange={handleChange} />
                    </div>
                </div>

                {/* <Textarea
                    label="Medical Director’s Comments"
                    name="medicalDirectorComments"
                    value={formData.medicalDirectorComments}
                    onChange={handleChange}
                    rows={4}
                /> */}
                <div style={{ position: 'relative' }}>
                    <Textarea
                        label="Medical Director’s Comments"
                        name="medicalDirectorComments"
                        value={formData.medicalDirectorComments}
                        onChange={handleChange}
                        rows={4}
                    />
                    <button
                        type="button"
                        onClick={handleVoiceToText}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '35px', // Adjust based on your label height
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isListening ? 'red' : 'inherit'
                        }}
                    >
                        {isListening ? '🛑' : '🎤'}
                    </button>
                </div>

                <div className="two-col">
                    <SignatureInput
                        label="Medical Director Signature"
                        name="medicalDirectorSign"
                        value={formData.medicalDirectorSign}
                        onChange={handleChange}
                    />
                    <MuiDateTimePicker
                        type="date"
                        label="Date"
                        name="medicalDirectorDate"
                        value={formData.medicalDirectorDate}
                        onChange={handleChange}
                    />
                </div>

                {/* Actions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #333' }}>
                    <div style={{ padding: '10px', borderRight: '1px solid #333' }}>
                        <Textarea label="Corrective action-" name="correctiveAction" value={formData.correctiveAction} onChange={handleChange} rows={5} />
                    </div>
                    <div style={{ padding: '10px' }}>
                        <Textarea label="Preventive action-" name="preventiveAction" value={formData.preventiveAction} onChange={handleChange} rows={5} />
                    </div>
                </div>

                {/* Plan and Verification Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ padding: '10px', borderRight: '1px solid #333' }}>
                        <Textarea label="Action plan:" name="actionPlan" value={formData.actionPlan} onChange={handleChange} rows={6} />
                    </div>
                    <div style={{ padding: '10px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '10px', color: '#333' }}>Action verified by:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <TextInput label="Name:" name="verifiedByName" value={formData.verifiedByName} onChange={handleChange} />
                            <TextInput label="Sign:" name="verifiedBySign" value={formData.verifiedBySign} onChange={handleChange} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <MuiDateTimePicker label="Date:" name="verifiedDate" value={formData.verifiedDate} onChange={handleChange} type="date" />
                                <MuiDateTimePicker label="Time" name="verifiedTime" value={formData.verifiedTime} onChange={handleChange} type="time" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '15px', marginTop: '20px' }}>
                Save Report & Actions
            </button>
        </form>
        </div>
    );
};

export default AdverseDrugCorrectiveActionForm;
