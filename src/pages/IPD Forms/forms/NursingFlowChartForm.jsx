import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

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

    const cellStyle = {
        padding: '4px',
        border: '1px solid #ddd',
        verticalAlign: 'middle'
    };

    return (
        <div className="medical-form nursing-flow-chart-form" style={{ maxWidth: '100%', margin: '0 auto' }}>
            <div style={{ height: '50px' }}></div>

            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '30px', fontSize: '1.4rem' }}>
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

            <form onSubmit={handleSubmit}>
                <div style={{ overflowX: 'auto', border: '1px solid #80deea', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
                        <thead style={{ backgroundColor: '#e0f7fa' }}>
                            <tr>
                                <th style={{ ...cellStyle, width: '130px', fontWeight: 'bold', color: '#00796b' }}>Date</th>
                                <th style={{ ...cellStyle, width: '120px', fontWeight: 'bold', color: '#00796b' }}>Time</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#00796b' }}>BP mmHg</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#00796b' }}>Pulse/min</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#00796b' }}>Temp F</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#00796b' }}>RR</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#00796b' }}>SPO2 %</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#00796b' }}>Intake (ml)</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#00796b' }}>Urine (ml)</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#00796b' }}>Drain</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#00796b' }}>S/N Sign</th>
                                <th style={{ ...cellStyle, width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    <td style={cellStyle}>
                                        <MuiDateTimePicker
                                            type="date"
                                            value={row.date}
                                            onChange={(e) => handleRowChange(index, 'date', e.target.value)}
                                            hideLabel
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <MuiDateTimePicker
                                            type="time"
                                            value={row.time}
                                            onChange={(e) => handleRowChange(index, 'time', e.target.value)}
                                            hideLabel
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <TextInput
                                            value={row.bp}
                                            onChange={(e) => handleRowChange(index, 'bp', e.target.value)}
                                            hideLabel
                                            placeholder="120/80"
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <TextInput value={row.pulse} onChange={(e) => handleRowChange(index, 'pulse', e.target.value)} hideLabel />
                                    </td>
                                    <td style={cellStyle}>
                                        <TextInput value={row.temp} onChange={(e) => handleRowChange(index, 'temp', e.target.value)} hideLabel />
                                    </td>
                                    <td style={cellStyle}>
                                        <TextInput value={row.rr} onChange={(e) => handleRowChange(index, 'rr', e.target.value)} hideLabel />
                                    </td>
                                    <td style={cellStyle}>
                                        <TextInput value={row.spo2} onChange={(e) => handleRowChange(index, 'spo2', e.target.value)} hideLabel />
                                    </td>
                                    <td style={cellStyle}>
                                        <TextInput value={row.intake} onChange={(e) => handleRowChange(index, 'intake', e.target.value)} hideLabel />
                                    </td>
                                    <td style={cellStyle}>
                                        <TextInput value={row.urineOutput} onChange={(e) => handleRowChange(index, 'urineOutput', e.target.value)} hideLabel />
                                    </td>
                                    <td style={cellStyle}>
                                        <TextInput value={row.drain} onChange={(e) => handleRowChange(index, 'drain', e.target.value)} hideLabel />
                                    </td>
                                    <td style={cellStyle}>
                                        <TextInput value={row.sign} onChange={(e) => handleRowChange(index, 'sign', e.target.value)} hideLabel />
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="remove-btn"
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

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={addRow}
                        className="secondary-btn"
                    >
                        + Add Monitoring Entry
                    </button>
                </div>

                <button type="submit" className="submit-btn">
                    Save Nursing Flow Record
                </button>
            </form>
        </div>
    );
};

export default NursingFlowChartForm;
