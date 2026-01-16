import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import CheckboxGroup from '../inputs/CheckboxGroup';

const MED_FIELDS = [
    'Time','Rhythm','BP','PR','RR','SpO₂',
    'Defib (J)','Adrenaline','Amiodarone',
    'Sodium Bicarbonate','Calcium',
    'Dopamine','Noradrenaline',
    'IV Fluids','ETT','CPR Cycle',
    'ABG','BSL','Electrolytes','ECG','Other'
];

const CPRSheetForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        unknownIdMark: '',
        date: '',
        timeArrivalED: '',
        timeLocationArrest: '',
        historyOfEvent: '',

        arrestType: [],
        witnessed: [],
        cprStartedBy: [],

        initialVS: { bp: '', r: '', t: '', spo2: '', p: '' },

        procedures: {
            ventilation: {}, intubation: {}, oralNasal: {}, cricTach: {},
            centralVenous: {}, venipuncture: {}, venesection: {}, intraosseous: {},
            tubeSecured: ''
        },

        medicationEntries: [{}]
    });

    const update = (key, value) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    const updateNested = (section, field, value) =>
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));

    const updateProcedure = (key, field, value) =>
        setFormData(prev => ({
            ...prev,
            procedures: {
                ...prev.procedures,
                [key]: { ...prev.procedures[key], [field]: value }
            }
        }));

    const updateMedication = (i, field, value) => {
        const copy = [...formData.medicationEntries];
        copy[i] = { ...copy[i], [field]: value };
        setFormData(prev => ({ ...prev, medicationEntries: copy }));
    };

    const addMedicationEntry = () =>
        setFormData(prev => ({
            ...prev,
            medicationEntries: [...prev.medicationEntries, {}]
        }));

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center' }}>CPR SHEET</h2>

            {/* ================= PATIENT & EVENT ================= */}
            <table className="medical-table">
                <tbody>
                    <tr>
                        <td>Name</td><td>{patientData?.name}</td>
                        <td>Age / Gender</td><td>{patientData?.age} / {patientData?.gender}</td>
                    </tr>
                    <tr>
                        <td>UHID</td><td>{patientData?.uhid}</td>
                        <td>Unknown ID Mark</td>
                        <td><TextInput value={formData.unknownIdMark} onChange={e => update('unknownIdMark', e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>Date</td>
                        <td><TextInput value={formData.date} onChange={e => update('date', e.target.value)} /></td>
                        <td>Arrival in ED</td>
                        <td><TextInput value={formData.timeArrivalED} onChange={e => update('timeArrivalED', e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>Time & Location of Arrest</td>
                        <td colSpan="3"><TextInput value={formData.timeLocationArrest} onChange={e => update('timeLocationArrest', e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>History of Event</td>
                        <td colSpan="3"><Textarea value={formData.historyOfEvent} onChange={e => update('historyOfEvent', e.target.value)} /></td>
                    </tr>
                </tbody>
            </table>

            {/* ================= ARREST DETAILS ================= */}
            <CheckboxGroup label="Type of Arrest" name="arrestType"
                value={formData.arrestType}
                onChange={e => update('arrestType', e.target.value)}
                options={['Cardiac', 'Respiratory']}
            />

            <CheckboxGroup label="Witnessed / Unwitnessed" name="witnessed"
                value={formData.witnessed}
                onChange={e => update('witnessed', e.target.value)}
                options={['Witnessed', 'Unwitnessed']}
            />

            <CheckboxGroup label="CPR Started By" name="cprStartedBy"
                value={formData.cprStartedBy}
                onChange={e => update('cprStartedBy', e.target.value)}
                options={['Bystander', 'EMS', 'ALS']}
            />

            {/* ================= INITIAL VITAL SIGNS ================= */}
            <h3>Initial Vital Signs</h3>
            <div className="grid-5">
                {['bp','r','t','spo2','p'].map(v => (
                    <TextInput key={v} label={v.toUpperCase()}
                        onChange={e => updateNested('initialVS', v, e.target.value)} />
                ))}
            </div>

            {/* ================= PROCEDURE PERFORMED ================= */}
            <h3>Procedure Performed</h3>
            <table className="medical-table">
                <thead>
                    <tr>
                        <th>Procedure</th><th>Time</th><th>Size</th><th>Attempts</th><th>By</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        ['Artificial ventilation (Bag/Mask/ETT)','ventilation'],
                        ['Intubated','intubation'],
                        ['Oral / Nasal','oralNasal'],
                        ['Cric / Tach','cricTach'],
                        ['Central Venous Catheter','centralVenous'],
                        ['Venipuncture','venipuncture'],
                        ['Venesection','venesection'],
                        ['Intraosseous','intraosseous']
                    ].map(([label,key]) => (
                        <tr key={key}>
                            <td>{label}</td>
                            {['time','size','attempts','by'].map(f => (
                                <td key={f}><TextInput onChange={e => updateProcedure(key, f, e.target.value)} /></td>
                            ))}
                        </tr>
                    ))}
                    <tr>
                        <td>Tube secured at (cm)</td>
                        <td colSpan="4"><TextInput onChange={e => updateProcedure('tubeSecured','value',e.target.value)} /></td>
                    </tr>
                </tbody>
            </table>

            {/* ================= MEDICATION & INVESTIGATION ================= */}
            <h3>Medication & Investigation / Procedure</h3>

            {formData.medicationEntries.map((entry, i) => (
                <div key={i} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
                    <strong>Entry #{i + 1}</strong>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {MED_FIELDS.map(field => (
                            <div key={field} style={{ maxWidth: '120px' }}>
                                <TextInput
                                    label={field}
                                    value={entry[field] || ''}
                                    onChange={e => updateMedication(i, field, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button type="button" onClick={addMedicationEntry}>+ Add Entry</button>

            <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
                Submit CPR Sheet
            </button>
        </form>
    );
};

export default CPRSheetForm;
