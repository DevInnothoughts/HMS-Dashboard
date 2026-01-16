import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const SurgeryConsentForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        uhid: patientData?.uhid || '',
        patientName: patientData?.name || '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        ipNo: patientData?.ipNo || '',

        authorizedPerson: '',
        authorizingDr: '',
        procedureName: '',
        specificRisks: '',

        agreementChecked: false,

        patientSign: '',
        patientSignDateTime: '',
        patientSignDate: '',
        patientSignTime: '',

        witnessName: '',
        witnessSign: '',
        relationWithPatient: '',
        witnessDateTime: '',
        witnessDate: '',
        witnessTime: '',

        surgeonName: patientData?.doctorName || '',
        surgeonSign: '',
        surgeonStamp: '',
        surgeonDateTime: '',
        surgeonDate: '',
        surgeonTime: ''
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
        if (!formData.agreementChecked) {
            alert('Please agree to the terms and policy before submitting.');
            return;
        }
        onSubmit && onSubmit(formData);
    };

    return (
        <div className="medical-form surgery-consent-form" style={{ maxWidth: '950px', margin: '0 auto', fontSize: '0.9rem', padding: '40px 20px' }}>
            {/* Blank Top Header Area */}
            <div style={{ height: '80px' }}></div>

            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '12px', borderRadius: '4px', margin: '0 0 40px 0', fontSize: '1.6rem', fontWeight: 'bold' }}>
                CONSENT FOR SURGERY
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

                {/* Authorization Details Section */}
                <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <TextInput label="1) I (patient or guardian):" name="authorizedPerson" value={formData.authorizedPerson} onChange={handleChange} placeholder="Enter name" />
                        <TextInput label="authorise Dr:" name="authorizingDr" value={formData.authorizingDr} onChange={handleChange} placeholder="Enter doctor's name" />
                    </div>
                    <TextInput label="to perform (operation / procedure):" name="procedureName" value={formData.procedureName} onChange={handleChange} placeholder="Enter procedure details" />
                </div>

                {/* Specific Risks Section */}
                <div style={{ marginBottom: '40px' }}>
                    <TextInput label="2) Some significant and substantial risks of this particular operation are:" name="specificRisks" value={formData.specificRisks} onChange={handleChange} placeholder="Specify risks if any" />
                </div>

                {/* Patient Signature Block */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '20px', borderTop: '2px solid #80deea', paddingTop: '30px', marginTop: '30px' }}>
                    <div className="left-signs" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <div style={{ height: '60px', borderBottom: '1px solid #333', marginBottom: '8px' }}></div>
                            <small style={{ color: '#666', fontWeight: '600' }}>Patient's signature</small>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                                <MuiDateTimePicker type="date" label="Date" name="patientSignDate" value={formData.patientSignDate} onChange={handleChange} />
                                <MuiDateTimePicker type="time" label="Time" name="patientSignTime" value={formData.patientSignTime} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <TextInput label="Name of surgeon:" name="surgeonName" value={formData.surgeonName} onChange={handleChange} />
                            <div style={{ height: '60px', borderBottom: '1px solid #333', marginBottom: '8px', marginTop: '10px' }}></div>
                            <small style={{ color: '#666', fontWeight: '600' }}>Signature & Stamp</small>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                                <MuiDateTimePicker type="date" label="Date" name="surgeonDate" value={formData.surgeonDate} onChange={handleChange} />
                                <MuiDateTimePicker type="time" label="Time" name="surgeonTime" value={formData.surgeonTime} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="right-signs" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <TextInput label="Witness name:" name="witnessName" value={formData.witnessName} onChange={handleChange} />
                            <div style={{ height: '60px', borderBottom: '1px solid #333', marginBottom: '8px', marginTop: '10px' }}></div>
                            <small style={{ color: '#666', fontWeight: '600' }}>Witness sign</small>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <TextInput label="Relation with patient:" name="relationWithPatient" value={formData.relationWithPatient} onChange={handleChange} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                                <MuiDateTimePicker type="date" label="Date" name="witnessDate" value={formData.witnessDate} onChange={handleChange} />
                                <MuiDateTimePicker type="time" label="Time" name="witnessTime" value={formData.witnessTime} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Agreement Section */}
                <div style={{ marginTop: '40px', padding: '25px', backgroundColor: '#f0fbfa', border: '1px solid #80deea', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            name="agreementChecked"
                            id="surgeryAgreementChecked"
                            checked={formData.agreementChecked}
                            onChange={handleChange}
                            style={{ width: '28px', height: '28px', cursor: 'pointer' }}
                            required
                        />
                        <label htmlFor="surgeryAgreementChecked" style={{ cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', color: '#008b8b' }}>
                            I have read, understood and agree to the consent terms for surgery.
                        </label>
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '40px' }}>
                    Confirm Surgery Consent
                </button>
            </form>
        </div>
    );
};

export default SurgeryConsentForm;
