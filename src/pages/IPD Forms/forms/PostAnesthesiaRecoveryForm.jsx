import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import DateInput from '../inputs/DateInput';
import SignatureInput from '../inputs/SignatureInput';

const PostAnesthesiaRecoveryForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        aldrete: {
            activity: '',
            consciousness: '',
            respiration: '',
            circulation: '',
            oxygenation: ''
        },

        anesthesiaType: {
            GA: false,
            SA: false,
            CSE: false,
            Block: false,
            MAC: false
        },

        nbmTill: '',
        ivFluids: '',

        timeInRecovery: '',
        timeShiftedOut: '',

        bloodLoss: '',
        urineOutput: '',
        drain: '',

        incidents: [{}],

        transfer: {
            cvp: {},
            ryles: {},
            ett: {},
            epidural: {},
            drains: {},
            reports: {},
            other: {},
            specimen: {}
        },

        anesthetistName: '',
        anesthetistSign: '',
        anesthetistDateTime: '',
        nurseName: '',
        nurseSign: '',
        nurseDateTime: ''
    });

    const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

    const setAldrete = (k, v) =>
        setFormData(p => ({
            ...p,
            aldrete: { ...p.aldrete, [k]: v }
        }));

    const toggleAnaesthesia = (k) =>
        setFormData(p => ({
            ...p,
            anesthesiaType: {
                ...p.anesthesiaType,
                [k]: !p.anesthesiaType[k]
            }
        }));

    const handleIncidentChange = (i, k, v) => {
        const copy = [...formData.incidents];
        copy[i][k] = v;
        setFormData(p => ({ ...p, incidents: copy }));
    };

    const addIncidentRow = () =>
        setFormData(p => ({ ...p, incidents: [...p.incidents, {}] }));

    const handleTransferChange = (row, col, v) =>
        setFormData(p => ({
            ...p,
            transfer: {
                ...p.transfer,
                [row]: { ...p.transfer[row], [col]: v }
            }
        }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">

            <h2 className="form-title" style={{ textAlign: 'center' }}>
                POST-ANESTHESIA ALDERETE RECOVERY SCORE
            </h2>

            {/* ================= ALDRETE SCORE TABLE ================= */}
            <table className="medical-table">
                <thead>
                    <tr>
                        <th>Original criteria</th>
                        <th>Modified criteria</th>
                        <th>Points</th>
                        <th>Patient score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <b>Activity</b><br />
                            Moves all extremities<br />
                            Moves two extremities<br />
                            No movement
                        </td>
                        <td>
                            Moves all extremities<br />
                            Moves two extremities<br />
                            No movement
                        </td>
                        <td>2<br />1<br />0</td>
                        <td><TextInput value={formData.aldrete.activity} onChange={e => setAldrete('activity', e.target.value)} /></td>
                    </tr>

                    <tr>
                        <td>
                            <b>Consciousness</b><br />
                            Awake, alert, oriented<br />
                            Arousable on calling<br />
                            No response
                        </td>
                        <td>
                            Fully awake<br />
                            Arousable on calling<br />
                            No movement
                        </td>
                        <td>2<br />1<br />0</td>
                        <td><TextInput value={formData.aldrete.consciousness} onChange={e => setAldrete('consciousness', e.target.value)} /></td>
                    </tr>

                    <tr>
                        <td>
                            <b>Respiration</b><br />
                            Can breathe deeply & cough<br />
                            Shallow but adequate<br />
                            Apnea
                        </td>
                        <td>
                            Breathes deeply & coughs freely<br />
                            Dyspnea / shallow<br />
                            Apnea
                        </td>
                        <td>2<br />1<br />0</td>
                        <td><TextInput value={formData.aldrete.respiration} onChange={e => setAldrete('respiration', e.target.value)} /></td>
                    </tr>

                    <tr>
                        <td>
                            <b>Circulation</b><br />
                            BP ±20% of normal<br />
                            BP ±20–50%<br />
                            BP {'>'}50%
                        </td>
                        <td>
                            BP ±20% of normal<br />
                            BP ±20–50%<br />
                            BP {'>'}50%
                        </td>
                        <td>2<br />1<br />0</td>
                        <td><TextInput value={formData.aldrete.circulation} onChange={e => setAldrete('circulation', e.target.value)} /></td>
                    </tr>

                    <tr>
                        <td>
                            <b>Color</b><br />
                            Pink<br />
                            Pale / dusky<br />
                            Cyanotic
                        </td>
                        <td>
                            <b>Oxygenation</b><br />
                            SpO₂ &gt;92% on room air<br />
                            SpO₂ &gt;92% on O₂<br />
                            SpO₂ &lt;92%
                        </td>
                        <td>2<br />1<br />0</td>
                        <td><TextInput value={formData.aldrete.oxygenation} onChange={e => setAldrete('oxygenation', e.target.value)} /></td>
                    </tr>
                </tbody>
            </table>

            {/* ================= POST OPERATIVE ORDERS ================= */}
            <h3>POST OPERATIVE ORDERS & PAIN MANAGEMENT PROTOCOL</h3>

            <div>
                <b>Type of Anaesthesia:</b>
                {['GA', 'SA', 'CSE', 'Block', 'MAC'].map(k => (
                    <label key={k} style={{ marginLeft: '10px' }}>
                        <input
                            type="checkbox"
                            checked={formData.anesthesiaType[k]}
                            onChange={() => toggleAnaesthesia(k)}
                        /> {k}
                    </label>
                ))}
            </div>

            <div style={{ marginTop: '10px' }}>
                <b>NBM Till:</b>
                <label style={{ marginLeft: '10px' }}>
                    <input type="radio" checked={formData.nbmTill === 'PM'} onChange={() => set('nbmTill', 'PM')} /> PM
                </label>
                <label style={{ marginLeft: '10px' }}>
                    <input type="radio" checked={formData.nbmTill === 'AM'} onChange={() => set('nbmTill', 'AM')} /> AM
                </label>
            </div>

            <TextInput
                label="I.V. Fluids"
                value={formData.ivFluids}
                onChange={e => set('ivFluids', e.target.value)}
            />

            {/* ================= TIMINGS & OUTPUT ================= */}
            <div className="grid-2">
                <TextInput label="Time shifted in Recovery / ICU" value={formData.timeInRecovery} onChange={e => set('timeInRecovery', e.target.value)} />
                <TextInput label="Time of shifting out" value={formData.timeShiftedOut} onChange={e => set('timeShiftedOut', e.target.value)} />
            </div>

            <div className="grid-3">
                <TextInput label="Blood Loss (ml)" value={formData.bloodLoss} onChange={e => set('bloodLoss', e.target.value)} />
                <TextInput label="Urine Output (ml)" value={formData.urineOutput} onChange={e => set('urineOutput', e.target.value)} />
                <TextInput label="Drain (ml)" value={formData.drain} onChange={e => set('drain', e.target.value)} />
            </div>

            {/* ================= MAJOR INCIDENTS (UNCHANGED) ================= */}
            <h3>Major Incidents</h3>
            <table className="medical-table">
                <thead>
                    <tr>
                        <th>Time</th><th>Pulse</th><th>BP</th><th>CVP</th>
                        <th>SpO₂</th><th>Resp</th><th>Drugs</th><th>IV Fluid</th>
                    </tr>
                </thead>
                <tbody>
                    {formData.incidents.map((_, i) => (
                        <tr key={i}>
                            {['time','pulse','bp','cvp','spo2','resp','drugs','iv'].map(f => (
                                <td key={f}>
                                    <TextInput onChange={e => handleIncidentChange(i, f, e.target.value)} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button type="button" onClick={addIncidentRow}>+ Add Row</button>

            {/* ================= TRANSFER TABLE (UNCHANGED) ================= */}
            <h3>Transfer Details</h3>
            <table className="medical-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Transfer out from OT</th>
                        <th>Transfer in wards</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(formData.transfer).map(k => (
                        <tr key={k}>
                            <td>{k.toUpperCase()}</td>
                            <td><TextInput onChange={e => handleTransferChange(k, 'out', e.target.value)} /></td>
                            <td><TextInput onChange={e => handleTransferChange(k, 'in', e.target.value)} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ================= SIGNATURES ================= */}
            <div className="grid-3">
                <TextInput label="Anaesthesiologist Name" value={formData.anesthetistName} onChange={e => set('anesthetistName', e.target.value)} />
                <SignatureInput label="Signature" value={formData.anesthetistSign} onChange={e => set('anesthetistSign', e.target.value)} />
                <DateInput label="Date & Time" value={formData.anesthetistDateTime} onChange={e => set('anesthetistDateTime', e.target.value)} />
            </div>

            <div className="grid-3">
                <TextInput label="Recovery / ICU Nurse Name" value={formData.nurseName} onChange={e => set('nurseName', e.target.value)} />
                <SignatureInput label="Signature" value={formData.nurseSign} onChange={e => set('nurseSign', e.target.value)} />
                <DateInput label="Date & Time" value={formData.nurseDateTime} onChange={e => set('nurseDateTime', e.target.value)} />
            </div>

            <button type="submit" className="submit-btn">Submit</button>
        </form>
    );
};

export default PostAnesthesiaRecoveryForm;
