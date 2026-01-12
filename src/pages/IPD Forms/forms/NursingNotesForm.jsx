import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const NursingNotesForm = ({ onSubmit, patientData }) => {
    const [headerData, setHeaderData] = useState({
        uhid: patientData?.uhid || '',
        name: patientData?.name || '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        ipNo: patientData?.ipNo || '',
        doa: patientData?.doa || '',
        dod: patientData?.dod || '',
        diagnosis: '',
        surgery: '',
        surgeonName: patientData?.doctorName || ''
    });

    const [noteRows, setNoteRows] = useState([
        { dateTime: '', morning: '', evening: '', night: '' }
    ]);

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeaderData(prev => ({ ...prev, [name]: value }));
    };

    const handleRowChange = (index, field, value) => {
        const updatedRows = [...noteRows];
        updatedRows[index] = { ...updatedRows[index], [field]: value };
        setNoteRows(updatedRows);
    };

    const addRow = () => {
        setNoteRows([...noteRows, { dateTime: '', morning: '', evening: '', night: '' }]);
    };

    const removeRow = (index) => {
        if (noteRows.length === 1) return;
        setNoteRows(noteRows.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ header: headerData, notes: noteRows });
    };

    return (
        <div className="medical-form-container">
            <h2 className="form-title">
                NURSING NOTES
            </h2>

            <form onSubmit={handleSubmit} className="medical-form">
                {/* Compact Patient Header */}
                <div className="patient-compact-header">
                    <div className="info-item">
                        <span className="info-label">UHID</span>
                        <span className="info-value">{headerData.uhid}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Patient Name</span>
                        <span className="info-value">{headerData.name}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Age</span>
                        <span className="info-value">{headerData.age}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Gender</span>
                        <span className="info-value">{headerData.gender}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">IP No</span>
                        <span className="info-value">{headerData.ipNo}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', margin: '1.5rem 0' }}>
                    <TextInput label="Diagnosis" name="diagnosis" value={headerData.diagnosis} onChange={handleHeaderChange} />
                    <TextInput label="Surgery" name="surgery" value={headerData.surgery} onChange={handleHeaderChange} />
                    <TextInput label="Surgeon Name" name="surgeonName" value={headerData.surgeonName} onChange={handleHeaderChange} />
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '940px' }}>
                        <thead style={{ backgroundColor: '#f1f5f9' }}>
                            <tr>
                                <th style={{ padding: '12px', fontWeight: '700', color: 'var(--text-main)', textAlign: 'left', width: '220px', borderBottom: '1.5px solid var(--border-color)' }}>DATE & TIME</th>
                                <th style={{ padding: '12px', fontWeight: '700', color: 'var(--text-main)', textAlign: 'left', borderBottom: '1.5px solid var(--border-color)' }}>MORNING</th>
                                <th style={{ padding: '12px', fontWeight: '700', color: 'var(--text-main)', textAlign: 'left', borderBottom: '1.5px solid var(--border-color)' }}>EVENING</th>
                                <th style={{ padding: '12px', fontWeight: '700', color: 'var(--text-main)', textAlign: 'left', borderBottom: '1.5px solid var(--border-color)' }}>NIGHT</th>
                                <th style={{ padding: '12px', width: '50px', borderBottom: '1.5px solid var(--border-color)' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {noteRows.map((row, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                        <MuiDateTimePicker
                                            value={row.dateTime}
                                            onChange={(e) => handleRowChange(index, 'dateTime', e.target.value)}
                                            hideLabel
                                        />
                                    </td>
                                    <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                        <Textarea
                                            value={row.morning}
                                            onChange={(e) => handleRowChange(index, 'morning', e.target.value)}
                                            placeholder="Morning shift notes..."
                                            hideLabel
                                            rows={3}
                                            textareaStyle={{ minHeight: '100px', fontSize: '0.875rem' }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                        <Textarea
                                            value={row.evening}
                                            onChange={(e) => handleRowChange(index, 'evening', e.target.value)}
                                            placeholder="Evening shift notes..."
                                            hideLabel
                                            rows={3}
                                            textareaStyle={{ minHeight: '100px', fontSize: '0.875rem' }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                        <Textarea
                                            value={row.night}
                                            onChange={(e) => handleRowChange(index, 'night', e.target.value)}
                                            placeholder="Night shift notes..."
                                            hideLabel
                                            rows={3}
                                            textareaStyle={{ minHeight: '100px', fontSize: '0.875rem' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.25rem', cursor: 'pointer', visibility: noteRows.length > 1 ? 'visible' : 'hidden' }}
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

                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button
                        type="button"
                        onClick={addRow}
                        className="secondary-btn"
                    >
                        + Add Notes Row
                    </button>
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                    <button type="submit" className="submit-btn" style={{ minWidth: '300px' }}>
                        Save Nursing Entry
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NursingNotesForm;
