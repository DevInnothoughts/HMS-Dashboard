import React, { useState } from 'react';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import Textarea from '../inputs/Textarea';
import './Forms.css';

const ProgressSheetForm = ({ onSubmit, patientData }) => {
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
        <div className="medical-form-container">
            <h2 className="form-title">
                PATIENT PROGRESS SHEET
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

            <form onSubmit={handleSubmit} className="medical-form">
                <h3 className="form-section-title">Timeline of Care</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {rows.map((row, index) => (
                        <div
                            key={index}
                            className="section-box"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(200px, 0.8fr) 1.5fr 1fr auto',
                                gap: '1.5rem',
                                alignItems: 'start',
                                padding: '1.5rem',
                                borderLeft: '4px solid var(--primary-color)'
                            }}
                        >
                            <div style={{ paddingTop: '0.25rem' }}>
                                <MuiDateTimePicker
                                    label="Date & Time"
                                    value={row.dateTime}
                                    onChange={(e) => handleRowChange(index, 'dateTime', e.target.value)}
                                />
                            </div>
                            <div>
                                <Textarea
                                    label="Clinical Progress Note"
                                    placeholder="Vital trends, physical findings..."
                                    value={row.note}
                                    onChange={(e) => handleRowChange(index, 'note', e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Textarea
                                    label="Advised Orders"
                                    placeholder="New meds, investigations..."
                                    value={row.advisedOrders}
                                    onChange={(e) => handleRowChange(index, 'advisedOrders', e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                className="remove-row-btn"
                                style={{
                                    marginTop: '2.5rem',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    visibility: rows.length > 1 ? 'visible' : 'hidden'
                                }}
                                title="Delete Entry"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={addRow}
                        className="secondary-btn"
                        style={{ padding: '0.75rem 2rem', border: '2px dashed var(--primary-color)', background: 'transparent', color: 'var(--primary-color)' }}
                    >
                        + Append New Progress Row
                    </button>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '4rem' }}>
                    Save Full Progress Sheet
                </button>
            </form>

            <style>{`
                .section-box {
                    background: #ffffff;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
                .remove-row-btn:hover {
                    background: #fecaca;
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
};

export default ProgressSheetForm;
