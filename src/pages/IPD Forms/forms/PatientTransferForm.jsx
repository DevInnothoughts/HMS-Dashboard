import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const PatientTransferForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        uhid: patientData?.uhid || '',
        patientName: patientData?.name || '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        ipNo: patientData?.ipNo || '',

        diagnosis: '',
        surgeryName: '',

        transferDate: '',
        transferTime: '',
        reasonForTransfer: '',
        transferOutToDept: '',

        vitals: {
            temp: '',
            bp: '',
            rr: '',
            pulse: '',
            painScore: ''
        },

        totalIntakeOutput: '',
        totalDrainOut: '',
        presentAppliances: '',
        investigationHandover: '',
        medicineHandover: '',
        anyOther: '',

        shiftingNurseNameSign: '',
        shiftingNurseDateTime: '',
        shiftingRmoNameSign: '',
        shiftingRmoDateTime: '',

        receivingNurseNameSign: '',
        receivingNurseDateTime: '',
        receivingDoctorNameSign: '',
        receivingDoctorDateTime: ''
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

    const sectionTitleStyle = {
        fontWeight: 'bold',
        fontSize: '0.9rem',
        color: '#333',
        marginBottom: '10px',
        display: 'block'
    };

    const boxStyle = {
        border: '1px solid #ddd',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '4px'
    };

    return (
        <div className="medical-form patient-transfer-form" style={{ maxWidth: '950px', margin: '0 auto', fontSize: '0.85rem', padding: '30px 20px' }}>
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '10px', borderRadius: '4px', margin: '0 0 30px 0', fontSize: '1.4rem' }}>
                PATIENT TRANSFER FORM
            </h2>

            <form onSubmit={handleSubmit}>
                {/* Compact Patient Header */}
                <div className="patient-compact-header">
                    <div className="info-item">
                        <span className="info-label">UHID</span>
                        <span className="info-value">{formData.uhid}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Patient Name</span>
                        <span className="info-value">{formData.patientName}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Age</span>
                        <span className="info-value">{formData.age}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Gender</span>
                        <span className="info-value">{formData.gender}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">IP No</span>
                        <span className="info-value">{formData.ipNo}</span>
                    </div>
                </div>

                {/* Diagnosis & Surgery Section */}
                <div style={boxStyle}>
                    <TextInput label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
                    <TextInput label="Surgery Name" name="surgeryName" value={formData.surgeryName} onChange={handleChange} />
                </div>

                {/* Transfer Details */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={sectionTitleStyle}>Transfer Details-</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', alignItems: 'end' }}>
                        <MuiDateTimePicker label="Transfer Date" name="transferDate" value={formData.transferDate} onChange={handleChange} type="date" />
                        <MuiDateTimePicker label="Time" name="transferTime" value={formData.transferTime} onChange={handleChange} type="time" />
                        <TextInput label="Reason for transfer" name="reasonForTransfer" value={formData.reasonForTransfer} onChange={handleChange} />
                        <TextInput label="Transfer out to department" name="transferOutToDept" value={formData.transferOutToDept} onChange={handleChange} />
                    </div>
                </div>

                {/* Vitals Section */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={sectionTitleStyle}>Vitals-</label>
                    <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>Temp-</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="text" name="vitals.temp" value={formData.vitals.temp} onChange={handleChange} style={{ width: '100%', border: 'none', outline: 'none' }} /></td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>B.P.-</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="text" name="vitals.bp" value={formData.vitals.bp} onChange={handleChange} style={{ width: '100%', border: 'none', outline: 'none' }} /></td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>RR-</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="text" name="vitals.rr" value={formData.vitals.rr} onChange={handleChange} style={{ width: '100%', border: 'none', outline: 'none' }} /></td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>Pulse-</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="text" name="vitals.pulse" value={formData.vitals.pulse} onChange={handleChange} style={{ width: '100%', border: 'none', outline: 'none' }} /></td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>Pain Score-</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="text" name="vitals.painScore" value={formData.vitals.painScore} onChange={handleChange} style={{ width: '100%', border: 'none', outline: 'none' }} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Handover Sections */}
                <div style={{ display: 'grid', gap: '5px', marginBottom: '25px' }}>
                    <TextInput label="Total Intake/Output" name="totalIntakeOutput" value={formData.totalIntakeOutput} onChange={handleChange} />
                    <TextInput label="Total Drain Out" name="totalDrainOut" value={formData.totalDrainOut} onChange={handleChange} />
                    <TextInput label="Present Appliances" name="presentAppliances" value={formData.presentAppliances} onChange={handleChange} />
                    <TextInput label="Investigation Handover" name="investigationHandover" value={formData.investigationHandover} onChange={handleChange} />
                    <TextInput label="Medicine Handover" name="medicineHandover" value={formData.medicineHandover} onChange={handleChange} />
                    <TextInput label="Any Other" name="anyOther" value={formData.anyOther} onChange={handleChange} />
                </div>

                {/* Shifting Signature Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', marginBottom: '20px', border: '1px solid #ddd' }}>
                    <div style={{ padding: '10px', borderRight: '1px solid #ddd' }}>
                        <TextInput label="Name & Sign of Shifting Nurse with -" name="shiftingNurseNameSign" value={formData.shiftingNurseNameSign} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="shiftingNurseDateTime" value={formData.shiftingNurseDateTime} onChange={handleChange} />
                    </div>
                    <div style={{ padding: '10px' }}>
                        <TextInput label="Name & Sign of shifting RMO with -" name="shiftingRmoNameSign" value={formData.shiftingRmoNameSign} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="shiftingRmoDateTime" value={formData.shiftingRmoDateTime} onChange={handleChange} />
                    </div>
                </div>

                <div style={{ marginBottom: '20px', fontWeight: 'bold' }}>
                    Patient Condition at the time of receiving
                </div>

                {/* Receiving Signature Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', marginBottom: '30px', border: '1px solid #ddd' }}>
                    <div style={{ padding: '10px', borderRight: '1px solid #ddd' }}>
                        <TextInput label="Name & Sign of receiving Nurse with -" name="receivingNurseNameSign" value={formData.receivingNurseNameSign} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="receivingNurseDateTime" value={formData.receivingNurseDateTime} onChange={handleChange} />
                    </div>
                    <div style={{ padding: '10px' }}>
                        <TextInput label="Name & Sign of receiving doctor with -" name="receivingDoctorNameSign" value={formData.receivingDoctorNameSign} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="receivingDoctorDateTime" value={formData.receivingDoctorDateTime} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ width: '100%' }}>
                    Confirm Transfer
                </button>
            </form>
        </div>
    );
};

export default PatientTransferForm;
