import React, { useState } from 'react';

const SBP = Array.from({ length: 121 }, (_, i) => 80 + i);
const DBP = Array.from({ length: 81 }, (_, i) => 40 + i);
const HR = Array.from({ length: 121 }, (_, i) => 40 + i);
const TEMP = ['95','96','97','98','99','100','101','102','103'];
const SPO2 = Array.from({ length: 41 }, (_, i) => 60 + i);
const RR = Array.from({ length: 31 }, (_, i) => 10 + i);

const AnesthesiaRecordForm = ({ onSubmit, patientData }) => {
    const [agents, setAgents] = useState([{ agent: '', dose: '' }]);

    const [monitoring, setMonitoring] = useState([
        { time: '', sbp: '', dbp: '', hr: '', temp: '', spo2: '', rr: '' }
    ]);

    const addAgent = () =>
        setAgents([...agents, { agent: '', dose: '' }]);

    const updateAgent = (i, field, value) => {
        const copy = [...agents];
        copy[i][field] = value;
        setAgents(copy);
    };

    const addMonitoringRow = () =>
        setMonitoring([
            ...monitoring,
            { time: '', sbp: '', dbp: '', hr: '', temp: '', spo2: '', rr: '' }
        ]);

    const updateMonitoring = (i, field, value) => {
        const copy = [...monitoring];
        copy[i][field] = value;
        setMonitoring(copy);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit &&
            onSubmit({
                agents,
                monitoring,
                patientHeader: patientData
            });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center' }}>
                ANESTHESIA RECORD
            </h2>

            {/* Patient Header */}
            {patientData && (
                <div className="patient-compact-header">
                    <div className="info-item">
                        <span className="info-label">UHID</span>
                        <span className="info-value">{patientData.uhid}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Name</span>
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
                </div>
            )}

            {/* Basic Details */}
            <label>Date</label>
            <input type="date" />

            <label>Start Time</label>
            <input type="time" />

            <label>End Time</label>
            <input type="time" />

            <label>Diagnosis</label>
            <input type="text" />

            <label>Surgery</label>
            <input type="text" />

            <label>Pre-operative airway assessment</label>
            <textarea rows="2" />

            <label>Pre-operative anesthetic re-evaluation</label>
            <textarea rows="2" />

            <label>ASA Grade</label>
            <select>
                <option value="">Select</option>
                {['I','II','III','IV','V','VI','E'].map(v => (
                    <option key={v}>{v}</option>
                ))}
            </select>

            <label>Machine Check</label>
            <input type="text" />

            <label>Type of Anesthesia</label>
            {['Standby','Sedation','Regional','General anesthesia'].map(v => (
                <label key={v} style={{ display: 'block' }}>
                    <input type="checkbox" /> {v}
                </label>
            ))}

            {/* Agents */}
            <h3>Agents</h3>
            {agents.map((a, i) => (
                <div key={i}>
                    <label>Agent</label>
                    <input
                        value={a.agent}
                        onChange={e => updateAgent(i, 'agent', e.target.value)}
                    />

                    <label>Dose</label>
                    <input
                        value={a.dose}
                        onChange={e => updateAgent(i, 'dose', e.target.value)}
                    />
                </div>
            ))}
            <button type="button" onClick={addAgent}>+ Add Agent</button>

            {/* Intravenous Monitoring */}
            <h3>Intravenous Monitoring</h3>

            {monitoring.map((m, i) => (
                <div key={i} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
                    <strong>Entry {i + 1}</strong>

                    <label>Time</label>
                    <input
                        type="time"
                        value={m.time}
                        onChange={e => updateMonitoring(i, 'time', e.target.value)}
                    />

                    <label>SBP</label>
                    <select onChange={e => updateMonitoring(i, 'sbp', e.target.value)}>
                        <option value="">Select</option>
                        {SBP.map(v => <option key={v}>{v}</option>)}
                    </select>

                    <label>DBP</label>
                    <select onChange={e => updateMonitoring(i, 'dbp', e.target.value)}>
                        <option value="">Select</option>
                        {DBP.map(v => <option key={v}>{v}</option>)}
                    </select>

                    <label>HR / Pulse</label>
                    <select onChange={e => updateMonitoring(i, 'hr', e.target.value)}>
                        <option value="">Select</option>
                        {HR.map(v => <option key={v}>{v}</option>)}
                    </select>

                    <label>Temperature</label>
                    <select onChange={e => updateMonitoring(i, 'temp', e.target.value)}>
                        <option value="">Select</option>
                        {TEMP.map(v => <option key={v}>{v}</option>)}
                    </select>

                    <label>SpO₂</label>
                    <select onChange={e => updateMonitoring(i, 'spo2', e.target.value)}>
                        <option value="">Select</option>
                        {SPO2.map(v => <option key={v}>{v}</option>)}
                    </select>

                    <label>RR</label>
                    <select onChange={e => updateMonitoring(i, 'rr', e.target.value)}>
                        <option value="">Select</option>
                        {RR.map(v => <option key={v}>{v}</option>)}
                    </select>
                </div>
            ))}

            <button type="button" onClick={addMonitoringRow}>
                + Add Monitoring Entry
            </button>

            <label>IV Fluids</label>
            <textarea rows="2" />

            <label>Advice</label>
            <textarea rows="2" />

            <label>Anesthetist Name</label>
            <input type="text" />

            <label>Date & Time</label>
            <input type="datetime-local" />

            <button type="submit" className="submit-btn">
                Submit Anesthesia Record
            </button>
        </form>
    );
};

export default AnesthesiaRecordForm;
