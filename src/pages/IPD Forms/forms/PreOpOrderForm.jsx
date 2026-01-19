import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const PreOpOrderForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',

        vitals: { temp: '', pulse: '', resp: '', bp: '' },
        consents: { highRisk: false, surgery: false, anesthesia: false, implant: false },
        preparation: { enema: false, colonHydrotherapy: false },

        investigations: [],
        investigationsOther: '',

        fitness: [],

        medications: {
            antibiotics: [],
            antibioticsOther: '',
            antacid: [],
            fluids: [],
            fluidsOther: '',
            other: ''
        },

        specialRequirements: [],
        specialOther: '',

        doctorName: '',
        dateTime: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleListChange = (section, item) => {
        setFormData(prev => {
            const current = Array.isArray(prev[section]) ? prev[section] : prev.medications[section];
            const updated = current.includes(item)
                ? current.filter(i => i !== item)
                : [...current, item];

            if (Array.isArray(prev[section])) {
                return { ...prev, [section]: updated };
            } else {
                return {
                    ...prev,
                    medications: { ...prev.medications, [section]: updated }
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    const checkboxStyle = { border: 'none', padding: '4px 0', fontSize: '0.85rem' };
    const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' };

    return (
        <form onSubmit={handleSubmit} className="medical-form">
            <h2 style={{ color: '#80deea', borderBottom: '2px solid #80deea', paddingBottom: '10px', marginBottom: '25px' }}>PRE OP ORDER</h2>

            {/* Compact Patient Header */}
            <div className="patient-compact-header">
                <div className="info-item">
                    <span className="info-label">UHID</span>
                    <span className="info-value">{formData.uhid}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Patient Name</span>
                    <span className="info-value">{formData.name}</span>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <TextInput label="TEMP" name="vitals.temp" value={formData.vitals.temp} onChange={handleChange} />
                <TextInput label="PULSE" name="vitals.pulse" value={formData.vitals.pulse} onChange={handleChange} />
                <TextInput label="RESP" name="vitals.resp" value={formData.vitals.resp} onChange={handleChange} />
                <TextInput label="BP" name="vitals.bp" value={formData.vitals.bp} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                <div className="form-field">
                    <label className="field-label">CONSENT</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {[['highRisk', 'HIGH RISK'], ['surgery', 'SURGERY'], ['anesthesia', 'ANESTHESIA'], ['implant', 'IMPLANT']].map(([key, label]) => (
                            <label key={key} className="checkbox-label" style={checkboxStyle}>
                                <input type="checkbox" name={`consents.${key}`} checked={formData.consents[key]} onChange={handleChange} />
                                <span style={{ marginLeft: '4px' }}>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="form-field">
                    <label className="field-label">PART PREPARATION</label>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {[['enema', 'ENEMA'], ['colonHydrotherapy', 'COLON HYDROTHERAPY']].map(([key, label]) => (
                            <label key={key} className="checkbox-label" style={checkboxStyle}>
                                <input type="checkbox" name={`preparation.${key}`} checked={formData.preparation[key]} onChange={handleChange} />
                                <span style={{ marginLeft: '4px' }}>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <h3>PRE-OP INVESTIGATIONS</h3>
            <div style={gridStyle}>
                {['CBC', 'BSL', 'CREATININE LEVEL', 'BT CT', 'PT/INR', 'HIV', 'HBsAg', 'HCV', 'USG', 'ECG', 'VENOUS DOPPLER', 'CT SCAN', 'X-RAY', '2D ECHO', 'MRI'].map(item => (
                    <label key={item} className="checkbox-label" style={checkboxStyle}>
                        <input type="checkbox" checked={formData.investigations.includes(item)} onChange={() => handleListChange('investigations', item)} />
                        <span style={{ marginLeft: '4px' }}>{item}</span>
                    </label>
                ))}
                <TextInput placeholder="OTHER" name="investigationsOther" value={formData.investigationsOther} onChange={handleChange} style={{ gridColumn: 'span 2' }} />
            </div>

            <div style={{ display: 'flex', gap: '20px', margin: '10px 0', alignItems: 'center' }}>
                <label className="field-label" style={{ marginBottom: 0 }}>FITNESS:</label>
                {['ANESTHESIA', 'PHYSICIAN', 'CARD AC'].map(item => (
                    <label key={item} className="checkbox-label" style={checkboxStyle}>
                        <input type="checkbox" checked={formData.fitness.includes(item)} onChange={() => handleListChange('fitness', item)} />
                        <span style={{ marginLeft: '4px' }}>{item}</span>
                    </label>
                ))}
            </div>

            <h3>MEDICATIONS: IV ANTIBIOTICS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                    'Inj. CEFTRIAXONE 1GM IV STAT', 'Inj. METRONIDAZOLE 100MG IV STAT', 'Inj. AMOXICILLIN + CLAVULANIC ACID 1.2 GM IV STAT',
                    'Inj. DEXAMETHASONE 4MG', 'Inj. HYDROCORTISONE 100 MG', 'Inj. AVIL (PHENIRAMINE) 2ML',
                    'Inj. CEFOTAXIME 1GM IV STAT', 'Inj. CEFUROXIME 1.5 GM IV STAT', 'Inj. AMIKACIN 750 MG IV STAT'
                ].map(item => (
                    <label key={item} className="checkbox-label" style={checkboxStyle}>
                        <input type="checkbox" checked={formData.medications.antibiotics.includes(item)} onChange={() => handleListChange('antibiotics', item)} />
                        <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}>{item}</span>
                    </label>
                ))}
                <label className="checkbox-label" style={checkboxStyle}>
                    <input type="checkbox" checked={formData.medications.antibiotics.includes('Other')} onChange={() => handleListChange('antibiotics', 'Other')} />
                    <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}>Other</span>
                </label>
            </div>
            {formData.medications.antibiotics.includes('Other') && (
                <div style={{ marginTop: '5px' }}>
                    <TextInput
                        placeholder="Specify other antibiotics"
                        name="medications.antibioticsOther"
                        value={formData.medications.antibioticsOther}
                        onChange={handleChange}
                    />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                <div className="form-field">
                    <label className="field-label">PRE-OP ANTACID</label>
                    <label className="checkbox-label" style={checkboxStyle}>
                        <input type="checkbox" checked={formData.medications.antacid.includes('Inj. PAN-40 MG IV STAT')} onChange={() => handleListChange('antacid', 'Inj. PAN-40 MG IV STAT')} />
                        <span style={{ marginLeft: '4px' }}>Inj. PAN-40 MG IV STAT</span>
                    </label>
                </div>
                <div className="form-field">
                    <label className="field-label">IV FLUIDS FOR MAINTENANCE</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {['IVF RL 500ML', 'IVF NS 500ML', 'IVF DNS 500ML'].map(item => (
                            <label key={item} className="checkbox-label" style={checkboxStyle}>
                                <input type="checkbox" checked={formData.medications.fluids.includes(item)} onChange={() => handleListChange('fluids', item)} />
                                <span style={{ marginLeft: '4px', fontSize: '0.8rem' }}>{item}</span>
                            </label>
                        ))}
                        <label className="checkbox-label" style={checkboxStyle}>
                            <input type="checkbox" checked={formData.medications.fluids.includes('Other')} onChange={() => handleListChange('fluids', 'Other')} />
                            <span style={{ marginLeft: '4px', fontSize: '0.8rem' }}>Other</span>
                        </label>
                    </div>
                    {formData.medications.fluids.includes('Other') && (
                        <div style={{ marginTop: '5px' }}>
                            <TextInput
                                placeholder="Specify other fluids"
                                name="medications.fluidsOther"
                                value={formData.medications.fluidsOther}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="form-field">
                <label className="field-label">IF REQUIRED</label>
                <div style={gridStyle}>
                    {['Inj. HUMAN ACTRAPID INSULIN', 'BSL MONITORING', 'BLOOD TRANSFUSION', 'INFORM SOS', 'SHIFT TO OT ON CALL'].map(item => (
                        <label key={item} className="checkbox-label" style={checkboxStyle}>
                            <input type="checkbox" checked={formData.specialRequirements.includes(item)} onChange={() => handleListChange('specialRequirements', item)} />
                            <span style={{ marginLeft: '4px', fontSize: '0.75rem' }}>{item}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <TextInput label="CHECKED BY DOCTOR'S NAME" name="doctorName" value={formData.doctorName} onChange={handleChange} />
                <MuiDateTimePicker label="DATE & TIME" name="dateTime" value={formData.dateTime} onChange={handleChange} />
            </div>

            <button type="submit" className="submit-btn">Submit Pre Op Order</button>
        </form >
    );
};

export default PreOpOrderForm;
