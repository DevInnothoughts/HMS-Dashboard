import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import CheckboxGroup from '../inputs/CheckboxGroup';

const GeneralConsentForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',
        doctorsName: patientData.doctorName || '',

        doa: '',
        doaTime: '',
        dod: '',
        dodTime: '',
        examiningDoctor: '',
        surgeryTreatment: '',

        consentChecked: false,
        patientSignDate: '',
        patientSignTime: '',
        relativeName: '',
        relativeSignDate: '',
        relativeSignTime: '',
        admittingDoctorSignDate: '',
        admittingDoctorSignTime: '',
        regNo: ''
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
        onSubmit && onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '10px', borderRadius: '4px', margin: '0 0 30px 0', fontSize: '1.4rem' }}>
                GENERAL CONSENT FOR ADMISSION<br />
                रुग्णालयात दाखल होण्यासाठी संमतीपत्र
            </h2>

            {/* Patient Header using project standard */}
            <div className="patient-compact-header" style={{ marginBottom: '30px' }}>
                <div className="info-item">
                    <span className="info-label">UHID</span>
                    <span className="info-value">{formData.uhid || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Patient Name</span>
                    <span className="info-value">{formData.name || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{formData.age || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{formData.gender || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">IP No</span>
                    <span className="info-value">{formData.ipNo || '—'}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}><MuiDateTimePicker label="DOA" name="doa" value={formData.doa} onChange={handleChange} type="date" /></div>
                    <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="doaTime" value={formData.doaTime} onChange={handleChange} type="time" /></div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}><MuiDateTimePicker label="DOD" name="dod" value={formData.dod} onChange={handleChange} type="date" /></div>
                    <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="dodTime" value={formData.dodTime} onChange={handleChange} type="time" /></div>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <TextInput label="Doctor's name:" name="doctorsName" value={formData.doctorsName} onChange={handleChange} />
            </div>

            <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#f9f9f9', lineHeight: '1.8' }}>
                On arrival Dr. <input type="text" name="examiningDoctor" value={formData.examiningDoctor} onChange={handleChange} style={{ border: 'none', borderBottom: '1px solid #999', outline: 'none', backgroundColor: 'transparent', width: '200px', padding: '0 5px' }} />
                conducted examination and has advised me admission into the hospital for
                this surgery / treatment <input type="text" name="surgeryTreatment" value={formData.surgeryTreatment} onChange={handleChange} style={{ border: 'none', borderBottom: '1px solid #999', outline: 'none', backgroundColor: 'transparent', width: '200px', padding: '0 5px' }} />.
            </div>

            <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '30px' }}>
                <p>1. I have been given a clear idea about the investigations needed and procedures / treatment / interventions that may be required to be carried out. I have been informed about associated / possible complications, if any.</p>
                <p>2. I allow the treating doctor, the team and staff of the hospital including nurses, technicians, paramedics and support services personnel to render necessary services.</p>
                <p>3. I am also willing to allow involvement of other specialists to participate in assessment and management, as required. I also give my consent to perform necessary investigations, procedures, interventions, medications and nursing care, including admission to Intensive care areas, Operation room etc.</p>
                <p>4. I shall get informed on the treatment being given, changes in the conditions etc. from time to time. I am also told that after the admission (where and when necessary) I shall be further informed of significant change in my condition necessitating further investigations/ change of treatment/ interventions.</p>
                <p>5. I hereby give my consent for taking clinical photographs/videos as may be required as a part of my clinical records and to also use the same for any clinical research/ educational purpose that may be undertaken by the hospital without ever revealing my identity in any form.</p>
                <p>6. I authorize the hospital to take necessary precautions in view of preventing possibility of cross infections to care providers, other patients and visitors.</p>
                <p>7. I am also aware that drugs, medications and medical disposables used in the hospital are of reputed makes and comply with all statutory requirements.</p>
                <p>8. I have been given a fair idea on the cost of the treatment, including day to day expenses, which I agree to bear. I shall abide by rules and regulations of the hospital.</p>
            </div>

            <div style={{ border: '1px solid #80deea', padding: '20px', borderRadius: '8px', backgroundColor: '#f0fbfa', marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <input type="checkbox" name="consentChecked" checked={formData.consentChecked} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                    <div style={{ fontSize: '0.9rem' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>I hereby give my consent for admission in the hospital and the necessary treatment.</div>
                        <div>1. I have been apprised of my rights to refuse.</div>
                        <div>2. I fully understand medical consequences & expenses of such refusal. So I opt to give my consent for admission.</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', borderTop: '2px solid #80deea', paddingTop: '30px' }}>
                {/* Patient / Doctor Column */}
                <div>
                    <TextInput label="Patient's Name" value={formData.name} readOnly />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="patientSignDate" value={formData.patientSignDate} onChange={handleChange} type="date" /></div>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="patientSignTime" value={formData.patientSignTime} onChange={handleChange} type="time" /></div>
                    </div>

                    <div style={{ marginTop: '40px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '10px', color: '#666' }}>Sign of admitting doctor</div>
                        <TextInput label="Reg no:" name="regNo" value={formData.regNo} onChange={handleChange} />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="admittingDoctorSignDate" value={formData.admittingDoctorSignDate} onChange={handleChange} type="date" /></div>
                            <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="admittingDoctorSignTime" value={formData.admittingDoctorSignTime} onChange={handleChange} type="time" /></div>
                        </div>
                    </div>
                </div>

                {/* Relative Column */}
                <div>
                    <TextInput label="Name of the relative with relation" name="relativeName" value={formData.relativeName} onChange={handleChange} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="relativeSignDate" value={formData.relativeSignDate} onChange={handleChange} type="date" /></div>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="relativeSignTime" value={formData.relativeSignTime} onChange={handleChange} type="time" /></div>
                    </div>
                </div>
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '40px', width: '100%' }}>Complete General Consent</button>
        </form>
    );
};

export default GeneralConsentForm;
