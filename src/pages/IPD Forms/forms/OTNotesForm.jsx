import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import Textarea from '../inputs/Textarea';
import './Forms.css';

const OTNotesForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        diagnosis: '',
        surgery: '',
        surgeonName: '',
        assistantSurgeonName: '',
        anaesthetistName: '',
        anesthesiaType: '',
        operativeFindings: '',
        bloodLoss: '',
        bloodTransfusion: '',
        drainage: '',
        implantDetails: '',
        cArm: '',
        otherEquipment: ''
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
                OPERATION THEATRE NOTES
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
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <MuiDateTimePicker label="Surgery Date" name="date" value={formData.date} onChange={handleChange} type="date" />
                    <MuiDateTimePicker label="Start Time" name="startTime" value={formData.startTime} onChange={handleChange} type="time" />
                    <MuiDateTimePicker label="End Time" name="endTime" value={formData.endTime} onChange={handleChange} type="time" />
                </div>

                <div className="two-col">
                    <Textarea label="Pre-op Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} rows={2} />
                    <Textarea label="Procedure Performed" name="surgery" value={formData.surgery} onChange={handleChange} rows={2} />
                </div>

                <h3 className="form-section-title">Surgical Team</h3>
                <div className="two-col">
                    <TextInput label="Chief Surgeon" name="surgeonName" value={formData.surgeonName} onChange={handleChange} />
                    <TextInput label="Assistant Surgeon" name="assistantSurgeonName" value={formData.assistantSurgeonName} onChange={handleChange} />
                </div>

                <h3 className="form-section-title">Anesthesia Details</h3>
                <div className="two-col">
                    <TextInput label="Anaesthetist Name" name="anaesthetistName" value={formData.anaesthetistName} onChange={handleChange} />
                    <TextInput label="Type of Anesthesia" name="anesthesiaType" value={formData.anesthesiaType} onChange={handleChange} />
                </div>

                <h3 className="form-section-title">Intra-operative Record</h3>
                <Textarea label="Operative Findings" name="operativeFindings" value={formData.operativeFindings} onChange={handleChange} rows={4} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <TextInput label="Approx. Blood Loss (ml)" name="bloodLoss" value={formData.bloodLoss} onChange={handleChange} />
                    <TextInput label="Blood Transfusion (if any)" name="bloodTransfusion" value={formData.bloodTransfusion} onChange={handleChange} />
                    <TextInput label="Drainage / Output" name="drainage" value={formData.drainage} onChange={handleChange} />
                </div>

                <div className="two-col" style={{ marginTop: '1.5rem' }}>
                    <Textarea label="Implant Details" name="implantDetails" value={formData.implantDetails} onChange={handleChange} rows={2} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <TextInput label="C-Arm Usage" name="cArm" value={formData.cArm} onChange={handleChange} />
                        <TextInput label="Other Equipment" name="otherEquipment" value={formData.otherEquipment} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '3rem' }}>
                    Finalize OT Record
                </button>
            </form>
        </div>
    );
};

export default OTNotesForm;
