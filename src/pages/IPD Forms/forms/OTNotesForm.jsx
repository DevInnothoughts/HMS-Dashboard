import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import SelectInput from '../inputs/SelectInput';
import Textarea from '../inputs/Textarea';

const OTNotesForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',

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
        otherEquipment: '',
        operativeNotesText: '' // From simple notes
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    const anesthesiaOptions = [
        { value: 'General', label: 'General' },
        { value: 'Spinal', label: 'Spinal' },
        { value: 'Epidural', label: 'Epidural' },
        { value: 'Local', label: 'Local' },
        { value: 'Sedation', label: 'Sedation' },
        { value: 'Other', label: 'Other' }
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
        <form onSubmit={handleSubmit} className="medical-form" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '15px', borderRadius: '8px', margin: '0 0 30px 0', fontSize: '1.6rem', fontWeight: 'bold' }}>
                OT NOTES
            </h2>

            {/* Patient Header */}
            <div className="patient-compact-header" style={{ marginBottom: '30px' }}>
                <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{formData.uhid || '—'}</span></div>
                <div className="info-item"><span className="info-label">Patient Name</span><span className="info-value">{formData.name || '—'}</span></div>
                <div className="info-item"><span className="info-label">Age</span><span className="info-value">{formData.age || '—'}</span></div>
                <div className="info-item"><span className="info-label">Gender</span><span className="info-value">{formData.gender || '—'}</span></div>
                <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{formData.ipNo || '—'}</span></div>
            </div>

            <div style={cardStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '20px' }}>
                    <MuiDateTimePicker label="Date :" name="date" value={formData.date} onChange={handleChange} type="date" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <MuiDateTimePicker label="Start Time:" name="startTime" value={formData.startTime} onChange={handleChange} type="time" />
                        <MuiDateTimePicker label="End Time:" name="endTime" value={formData.endTime} onChange={handleChange} type="time" />
                    </div>
                </div>

                <TextInput label="Diagnosis:" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
                <TextInput label="Surgery:" name="surgery" value={formData.surgery} onChange={handleChange} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <TextInput label="Name of Surgeon:" name="surgeonName" value={formData.surgeonName} onChange={handleChange} />
                    <TextInput label="Name of Assistant Surgeon:" name="assistantSurgeonName" value={formData.assistantSurgeonName} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <TextInput label="Name of Anaesthetist:" name="anaesthetistName" value={formData.anaesthetistName} onChange={handleChange} />
                    <SelectInput label="Type of Anaesthesia:" name="anesthesiaType" value={formData.anesthesiaType} onChange={handleChange} options={anesthesiaOptions} />
                </div>

                <TextInput label="Operative findings:" name="operativeFindings" value={formData.operativeFindings} onChange={handleChange} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <TextInput label="Approximate blood loss:" name="bloodLoss" value={formData.bloodLoss} onChange={handleChange} />
                    <TextInput label="Blood transfusion:" name="bloodTransfusion" value={formData.bloodTransfusion} onChange={handleChange} />
                </div>

                <TextInput label="Drainage:" name="drainage" value={formData.drainage} onChange={handleChange} />
                <TextInput label="Details of implants (if used):" name="implantDetails" value={formData.implantDetails} onChange={handleChange} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <TextInput label="C - Arm:" name="cArm" value={formData.cArm} onChange={handleChange} />
                </div>

                <TextInput label="Other equipment used:" name="otherEquipment" value={formData.otherEquipment} onChange={handleChange} />
            </div>

            {/* Section 2: Procedure (From Page 2) */}
            <div style={cardStyle}>
                <TextInput label="Procedure:" name="procedure" value={formData.procedure} onChange={handleChange} />

                <div style={{ marginTop: '10px' }}>
                    <Textarea
                        name="operativeNotesText"
                        value={formData.operativeNotesText}
                        onChange={handleChange}
                        rows={15}
                        style={{
                            lineHeight: '32px',
                            background: 'repeating-linear-gradient(white, white 31px, #e1f5fe 32px)',
                            padding: '8px 15px',
                            border: '2px solid #e1e8ed',
                            borderRadius: '8px',
                            minHeight: '400px'
                        }}
                    />
                </div>
            </div>

            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '15px', fontSize: '1.2rem' }}>
                Save Complete OT Note
            </button>
        </form>
    );
};

export default OTNotesForm;

