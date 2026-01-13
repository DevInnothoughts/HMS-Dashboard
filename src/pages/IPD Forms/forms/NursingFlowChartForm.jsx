import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const NursingFlowChartForm = ({ onSubmit, patientData }) => {
    const [rows, setRows] = useState([
        {
            date: new Date().toISOString().split('T')[0],
            time: '',
            bp: '',
            pulse: '',
            temp: '',
            rr: '',
            spo2: '',
            intake: '',
            urineOutput: '',
            drain: '',
            sign: ''
        }
    ]);

    const handleRowChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index] = { ...updatedRows[index], [field]: value };
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([
            ...rows,
            {
                date: new Date().toISOString().split('T')[0],
                time: '',
                bp: '',
                pulse: '',
                temp: '',
                rr: '',
                spo2: '',
                intake: '',
                urineOutput: '',
                drain: '',
                sign: ''
            }
        ]);
    };

    const removeRow = (index) => {
        if (rows.length === 1) return;
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ nursingFlowData: rows });
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                NURSING FLOW CHART
            </h2>

            {/* Compact Patient Header */}
            <div className="patient-compact-header">
                <div className="info-item">
                    <span className="info-label">UHID</span>
                    <span className="info-value">{patientData?.uhid}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Patient Name</span>
                    <span className="info-value">{patientData?.name}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{patientData?.age}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{patientData?.gender}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">IP No</span>
                    <span className="info-value">{patientData?.ipNo}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="medical-form">
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
                        <thead style={{ backgroundColor: '#f1f5f9' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)', width: '130px' }}>Date</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)', width: '120px' }}>Time</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>BP mmHg</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>Pulse/min</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>Temp F</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>RR</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>SPO2 %</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>Intake (ml)</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>Urine (ml)</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>Drain</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1.5px solid var(--border-color)' }}>S/N Sign</th>
                                <th style={{ padding: '12px', borderBottom: '1.5px solid var(--border-color)', width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '8px' }}>
                                        <MuiDateTimePicker
                                            type="date"
                                            value={row.date}
                                            onChange={(e) => handleRowChange(index, 'date', e.target.value)}
                                            hideLabel
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <MuiDateTimePicker
                                            type="time"
                                            value={row.time}
                                            onChange={(e) => handleRowChange(index, 'time', e.target.value)}
                                            hideLabel
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextInput
                                            value={row.bp}
                                            onChange={(e) => handleRowChange(index, 'bp', e.target.value)}
                                            hideLabel
                                            placeholder="120/80"
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextInput value={row.pulse} onChange={(e) => handleRowChange(index, 'pulse', e.target.value)} hideLabel />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextInput value={row.temp} onChange={(e) => handleRowChange(index, 'temp', e.target.value)} hideLabel />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextInput value={row.rr} onChange={(e) => handleRowChange(index, 'rr', e.target.value)} hideLabel />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextInput value={row.spo2} onChange={(e) => handleRowChange(index, 'spo2', e.target.value)} hideLabel />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextInput value={row.intake} onChange={(e) => handleRowChange(index, 'intake', e.target.value)} hideLabel />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextInput value={row.urineOutput} onChange={(e) => handleRowChange(index, 'urineOutput', e.target.value)} hideLabel />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextInput value={row.drain} onChange={(e) => handleRowChange(index, 'drain', e.target.value)} hideLabel />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextInput value={row.sign} onChange={(e) => handleRowChange(index, 'sign', e.target.value)} hideLabel />
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.25rem', cursor: 'pointer', visibility: rows.length > 1 ? 'visible' : 'hidden' }}
                                            title="Remove Row"
                                        >
                                            &times;
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={addRow}
                        className="secondary-btn"
                    >
                        + Add Monitoring Entry
                    </button>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '2rem' }}>
                    Save Nursing Flow Record
                </button>
            </form>
        </div>
    );
};

export default NursingFlowChartForm;
