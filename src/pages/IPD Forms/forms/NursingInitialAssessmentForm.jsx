import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import RadioGroup from '../inputs/RadioGroup';
import CheckboxGroup from '../inputs/CheckboxGroup';
import SelectInput from '../inputs/SelectInput';

const NursingInitialAssessmentForm = ({ onSubmit, patientData = {} }) => {
    const [formData, setFormData] = useState({
        uhid: patientData.uhid || '',
        name: patientData.name || '',
        age: patientData.age || '',
        gender: patientData.gender || '',
        ipNo: patientData.ipNo || '',

        patientReceivedDate: '',
        patientReceivedTime: '',
        generalConsentTaken: '',
        idBand: '',
        language: '',
        temp: '',
        bp: '',
        pulse: '',
        rr: '',

        valuables: '', // With patient, Given to relative
        vulnerablePatient: '',

        neurological: {},
        cardiovascular: {},
        urinary: {},
        respiratory: {},
        gastrointestinal: {},
        skin: {},
        communication: {},
        allergies: {},

        walking: '',
        eating: '',
        dressing: '',
        bathing: '',
        toileting: '',

        // Fall Risk and other bottom sections
        morseFallScore: '',
        riskLevel: '',
        painScore: '',
        painLocation: '',
        bradenScore: '',
        pressureSore: '',
        devices: {},
        assessmentDoneByName: '',
        assessmentDate: '',
        assessmentTime: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: type === 'checkbox' ? (checked ? 'Yes' : 'No') : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? (checked ? 'Yes' : 'No') : value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit(formData);
    };

    const yesNoOptions = [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }];

    const functionalOptions = [
        { value: 'Independent', label: 'Indep' },
        { value: 'Assistant', label: 'Assist' },
        { value: 'Dependent', label: 'Dep' }
    ];

    const cardStyle = {
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        marginBottom: '25px',
        border: '1px solid #e0f7fa'
    };

    const sectionHeaderStyle = {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#00838f',
        marginBottom: '15px',
        borderBottom: '2px solid #80deea',
        paddingBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const AssessmentSection = ({ title, section, items, icon }) => (
        <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span> {title}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                {items.map(item => (
                    <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '8px 12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item}</span>
                        <RadioGroup
                            name={`${section}.${item}`}
                            value={formData[section][item]}
                            onChange={handleChange}
                            options={yesNoOptions}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="medical-form" style={{ maxWidth: '1100px', margin: '0 auto', backgroundColor: '#fcfcfc', padding: '20px' }}>
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '15px', borderRadius: '8px', margin: '0 0 40px 0', fontSize: '1.6rem', fontWeight: 'bold' }}>
                NURSING INITIAL ASSESSMENT
            </h2>

            {/* Patient Header */}
            <div className="patient-compact-header" style={{ marginBottom: '40px' }}>
                <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{formData.uhid || '—'}</span></div>
                <div className="info-item"><span className="info-label">Patient Name</span><span className="info-value">{formData.name || '—'}</span></div>
                <div className="info-item"><span className="info-label">Age</span><span className="info-value">{formData.age || '—'}</span></div>
                <div className="info-item"><span className="info-label">Gender</span><span className="info-value">{formData.gender || '—'}</span></div>
                <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{formData.ipNo || '—'}</span></div>
            </div>

            {/* Quick Stats & Core Info */}
            <div style={cardStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <MuiDateTimePicker label="Patient received Date" name="patientReceivedDate" value={formData.patientReceivedDate} onChange={handleChange} type="date" />
                        <MuiDateTimePicker label="Time" name="patientReceivedTime" value={formData.patientReceivedTime} onChange={handleChange} type="time" />
                    </div>
                    <TextInput label="Primary Language" name="language" value={formData.language} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                    <TextInput label="Temperature" name="temp" value={formData.temp} onChange={handleChange} />
                    <TextInput label="B.P." name="bp" value={formData.bp} onChange={handleChange} />
                    <TextInput label="Pulse" name="pulse" value={formData.pulse} onChange={handleChange} />
                    <TextInput label="R.R." name="rr" value={formData.rr} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    <RadioGroup label="General Consent" name="generalConsentTaken" value={formData.generalConsentTaken} onChange={handleChange} options={yesNoOptions} />
                    <RadioGroup label="ID Band Proper" name="idBand" value={formData.idBand} onChange={handleChange} options={yesNoOptions} />
                    <RadioGroup label="Vulnerable Patient" name="vulnerablePatient" value={formData.vulnerablePatient} onChange={handleChange} options={yesNoOptions} />
                    <div className="form-field">
                        <label className="field-label" style={{ fontSize: '0.8rem' }}>Valuables / Belongings</label>
                        <SelectInput
                            name="valuables"
                            value={formData.valuables}
                            onChange={handleChange}
                            options={[{ value: 'With patient', label: 'With patient' }, { value: 'Given to relative', label: 'Given to relative' }]}
                        />
                    </div>
                </div>
            </div>

            {/* Systems Review */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <AssessmentSection title="Neurological" section="neurological" icon="" items={['Paralysis', 'Dizziness', 'Oriented', 'Responsive']} />
                <AssessmentSection title="Cardiovascular" section="cardiovascular" icon="" items={['Chest pain', 'Hypertensive', 'Hypotensive', 'Pulse regular']} />
                <AssessmentSection title="Urinary" section="urinary" icon="" items={['Catheter', 'Retention', 'Haematuria', 'Incontinence']} />
                <AssessmentSection title="Respiratory" section="respiratory" icon="" items={['Gasping', 'Tachypnea', 'Bradypnea', 'Dyspnea', 'Cough']} />
                <AssessmentSection title="Gastrointestinal" section="gastrointestinal" icon="" items={['Constipation', 'Distention', 'Nausea', 'Diarrhea', 'Tenderness', 'Vomiting', 'Colostomy', 'NBM']} />
                <AssessmentSection title="Skin Status" section="skin" icon="" items={['Pale', 'Cyanotic', 'Dehydration', 'Jaundiced', 'Normal']} />
            </div>

            {/* Communication */}
            <div style={cardStyle}>
                <div style={sectionHeaderStyle}>Communication Status</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    {['Vision', 'Hearing', 'Speech', 'Obey'].map(sense => (
                        <div key={sense} style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '8px' }}>{sense}</div>
                            <RadioGroup
                                name={`communication.${sense}`}
                                value={formData.communication[sense]}
                                onChange={handleChange}
                                options={[{ value: 'OK', label: 'OK' }, { value: 'Impaired', label: 'Imp' }]}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Functional Status */}
            <div style={cardStyle}>
                <div style={sectionHeaderStyle}>Functional Independence</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                    {['Walking', 'Eating', 'Dressing', 'Bathing', 'Toileting'].map(act => (
                        <div key={act} style={{ backgroundColor: '#fff', border: '1px solid #efefef', padding: '12px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#006064' }}>{act}</div>
                            <RadioGroup
                                name={act.toLowerCase()}
                                value={formData[act.toLowerCase()]}
                                onChange={handleChange}
                                options={functionalOptions}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Allergies & Devices */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>Allergies / Adverse Reactions</div>
                    {['Medication / Drug', 'Blood transfusion', 'Food'].map(type => (
                        <div key={type} style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <span style={{ fontWeight: '500' }}>{type}</span>
                                <RadioGroup name={`allergies.${type}`} value={formData.allergies[type]} onChange={handleChange} options={yesNoOptions} />
                            </div>
                            {formData.allergies[type] === 'Yes' && <TextInput label="Reaction Details" name={`allergies.${type}_details`} value={formData.allergies[`${type}_details`]} onChange={handleChange} />}
                        </div>
                    ))}
                </div>

                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>Patient Having Devices</div>
                    {['Central line', 'Foleys catheter', 'Peripheral line', 'RT tube', 'Any other'].map(device => (
                        <div key={device} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <span style={{ fontSize: '0.85rem', flex: 1 }}>{device}</span>
                            <RadioGroup name={`devices.${device}`} value={formData.devices[device]} onChange={handleChange} options={yesNoOptions} />
                            {formData.devices[device] === 'Yes' && <input type="date" name={`devices.${device}_date`} value={formData.devices[`${device}_date`]} onChange={handleChange} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.8rem' }} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Scores & Risks */}
            <div style={cardStyle}>
                <div style={sectionHeaderStyle}>Assessment Scores</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <TextInput label="Morse Fall Score" name="morseFallScore" value={formData.morseFallScore} onChange={handleChange} />
                    <SelectInput label="Risk Level" name="riskLevel" value={formData.riskLevel} onChange={handleChange} options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }]} />
                    <TextInput label="Pain Score (0-10)" name="painScore" value={formData.painScore} onChange={handleChange} />
                    <TextInput label="Pain Location" name="painLocation" value={formData.painLocation} onChange={handleChange} />
                    <TextInput label="Braden Score" name="bradenScore" value={formData.bradenScore} onChange={handleChange} />
                    <RadioGroup label="Pressure Sore" name="pressureSore" value={formData.pressureSore} onChange={handleChange} options={[{ value: 'Existing', label: 'Existing' }, { value: 'Prospective', label: 'Prospective' }]} />
                </div>

                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fffde7', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #fff9c4' }}>
                    <strong>Note:</strong> Calculate Morse Fall Scale based on history of falling, secondary diagnosis, ambulatory aid, IV access, gait, and mental status.
                    <br /><i>0-24: No Risk | 25-50: Low Risk | &gt;50: High Risk</i>
                </div>
            </div>

            {/* Footer */}
            <div style={{ ...cardStyle, borderTop: '4px solid #80deea' }}>
                <TextInput label="Assessment done by (Name & Sign)" name="assessmentDoneByName" value={formData.assessmentDoneByName} onChange={handleChange} />
                <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                    <MuiDateTimePicker label="Assessment Date" name="assessmentDate" value={formData.assessmentDate} onChange={handleChange} type="date" />
                    <MuiDateTimePicker label="Assessment Time" name="assessmentTime" value={formData.assessmentTime} onChange={handleChange} type="time" />
                </div>
            </div>

            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '15px', fontSize: '1.1rem', backgroundColor: '#80deea', fontWeight: 'bold' }}>
                Finalize Nursing Assessment
            </button>
        </form>
    );
};

export default NursingInitialAssessmentForm;
