import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

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

    const cellStyle = {
        padding: '8px',
        border: '1px solid #ddd',
        verticalAlign: 'middle'
    };

    const inputStyle = {
        width: '100%',
        border: 'none',
        outline: 'none',
        fontSize: '0.9rem',
        minHeight: '60px',
        resize: 'none',
        fontFamily: 'inherit'
    };

    return (
        <div className="medical-form nursing-notes-form" style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px' }}>
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '8px', borderRadius: '4px', margin: '10px 0 20px 0', fontSize: '1.2rem' }}>
                NURSING NOTES
            </h2>

            <form onSubmit={handleSubmit}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', margin: '15px 0', padding: '10px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                    <TextInput label="Diagnosis" name="diagnosis" value={headerData.diagnosis} onChange={handleHeaderChange} />
                    <TextInput label="Surgery" name="surgery" value={headerData.surgery} onChange={handleHeaderChange} />
                    <TextInput label="Surgeon Name" name="surgeonName" value={headerData.surgeonName} onChange={handleHeaderChange} />
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f4f7f6' }}>
                            <tr>
                                <th style={{ ...cellStyle, width: '180px', fontWeight: 'bold', color: '#80deea', textAlign: 'center' }}>DATE & TIME</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#80deea', textAlign: 'center' }}>MORNING</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#80deea', textAlign: 'center' }}>EVENING</th>
                                <th style={{ ...cellStyle, fontWeight: 'bold', color: '#80deea', textAlign: 'center' }}>NIGHT</th>
                                <th style={{ ...cellStyle, width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {noteRows.map((row, index) => (
                                <tr key={index}>
                                    <td style={cellStyle}>
                                        <MuiDateTimePicker
                                            value={row.dateTime}
                                            onChange={(e) => handleRowChange(index, 'dateTime', e.target.value)}
                                            hideLabel
                                            style={{ marginBottom: 0 }}
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <Textarea
                                            value={row.morning}
                                            onChange={(e) => handleRowChange(index, 'morning', e.target.value)}
                                            placeholder="Morning shift notes..."
                                            hideLabel
                                            rows={2}
                                            textareaStyle={{ minHeight: 'unset' }}
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <Textarea
                                            value={row.evening}
                                            onChange={(e) => handleRowChange(index, 'evening', e.target.value)}
                                            placeholder="Evening shift notes..."
                                            hideLabel
                                            rows={2}
                                            textareaStyle={{ minHeight: 'unset' }}
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <Textarea
                                            value={row.night}
                                            onChange={(e) => handleRowChange(index, 'night', e.target.value)}
                                            placeholder="Night shift notes..."
                                            hideLabel
                                            rows={2}
                                            textareaStyle={{ minHeight: 'unset' }}
                                        />
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'center', verticalAlign: 'middle' }}>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="remove-btn"
                                            title="Remove Row"
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button
                        type="button"
                        onClick={addRow}
                        className="secondary-btn"
                    >
                        + Add Notes Row
                    </button>
                </div>

                <button type="submit" className="submit-btn">
                    Save Nursing Entry
                </button>
            </form>
        </div>
    );
};

export default NursingNotesForm;
