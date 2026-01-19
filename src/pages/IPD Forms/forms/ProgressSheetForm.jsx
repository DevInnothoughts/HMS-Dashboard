import React, { useState } from 'react';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import Textarea from '../inputs/Textarea';

const ProgressSheetForm = ({ onSubmit, patientData }) => {
    // Start with one record as requested
    const [rows, setRows] = useState([
        { dateTime: '', note: '', advisedOrders: '' }
    ]);

    const handleRowChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index] = { ...updatedRows[index], [field]: value };
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([...rows, { dateTime: '', note: '', advisedOrders: '' }]);
    };

    const removeRow = (index) => {
        if (rows.length === 1) return;
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ rows, patientHeader: patientData });
    };

    return (
        <div className="medical-form progress-sheet-form" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Blank Space at top for print header or layout */}
            <div style={{ height: '30px' }}></div>

            <h2 className="form-title" style={{
                textAlign: 'center',
                backgroundColor: '#80deea',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '30px',
                fontSize: '1.4rem'
            }}>
                PROGRESS SHEET
            </h2>

            {/* Compact Patient Header */}
            {patientData && (
                <div className="patient-compact-header">
                    <div className="info-item">
                        <span className="info-label">UHID</span>
                        <span className="info-value">{patientData.uhid}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Patient Name</span>
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
                    <div className="info-item">
                        <span className="info-label">IP No</span>
                        <span className="info-value">{patientData.ipNo}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ border: '1px solid #80deea', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#e0f7fa' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #80deea', width: '220px', color: '#00796b' }}>DATE & TIME</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #80deea', color: '#00796b' }}>PROGRESS NOTES</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #80deea', color: '#00796b' }}>ADVISED ORDERS</th>
                                <th style={{ padding: '12px', width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index} style={{ borderTop: '1px solid #80deea' }}>
                                    <td style={{ padding: '10px', borderRight: '1px solid #80deea', verticalAlign: 'top' }}>
                                        <MuiDateTimePicker
                                            value={row.dateTime}
                                            onChange={(e) => handleRowChange(index, 'dateTime', e.target.value)}
                                            hideLabel
                                        />
                                    </td>
                                    <td style={{ padding: '10px', borderRight: '1px solid #80deea', verticalAlign: 'top' }}>
                                        <Textarea
                                            placeholder="Enter clinical progress..."
                                            value={row.note}
                                            onChange={(e) => handleRowChange(index, 'note', e.target.value)}
                                            hideLabel
                                            rows={3}
                                        />
                                    </td>
                                    <td style={{ padding: '10px', borderRight: '1px solid #80deea', verticalAlign: 'top' }}>
                                        <Textarea
                                            placeholder="Enter advised orders..."
                                            value={row.advisedOrders}
                                            onChange={(e) => handleRowChange(index, 'advisedOrders', e.target.value)}
                                            hideLabel
                                            rows={2}
                                        />
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="remove-btn"
                                            title="Remove Note Row"
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
                        + Add Progress Note
                    </button>
                </div>

                <button type="submit" className="submit-btn">
                    Save Progress Sheet
                </button>
            </form>
        </div>
    );
};

export default ProgressSheetForm;
