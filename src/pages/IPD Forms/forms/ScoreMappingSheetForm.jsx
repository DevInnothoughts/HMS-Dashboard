import React, { useState } from 'react';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const ScoreMappingSheetForm = ({ onSubmit, patientData }) => {
    const scoreItems = [
        { id: 'vip', name: 'VIP Score' },
        { id: 'braden', name: 'Braden Score' },
        { id: 'morse', name: 'Morse Fall Score' },
        { id: 'must', name: 'MUST Score' },
        { id: 'mews', name: 'MEW\'s Score' },
        { id: 'pain', name: 'Pain Score' }
    ];

    // 4 Monitoring Slots
    const [dates, setDates] = useState(['', '', '', '']);
    const [scores, setScores] = useState(
        scoreItems.reduce((acc, score) => {
            acc[score.id] = Array(4).fill(null).map(() => ({ M: '', E: '', N: '' }));
            return acc;
        }, {})
    );
    const [nurseSigns, setNurseSigns] = useState(
        Array(4).fill(null).map(() => ({ M: '', E: '', N: '' }))
    );

    const handleDateChange = (index, value) => {
        const newDates = [...dates];
        newDates[index] = value;
        setDates(newDates);
    };

    const handleScoreChange = (scoreId, dateIndex, shift, value) => {
        setScores(prev => ({
            ...prev,
            [scoreId]: prev[scoreId].map((d, i) => i === dateIndex ? { ...d, [shift]: value } : d)
        }));
    };

    const handleSignChange = (dateIndex, shift, value) => {
        setNurseSigns(prev => prev.map((d, i) => i === dateIndex ? { ...d, [shift]: value } : d));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ dates, scores, nurseSigns });
    };

    // Styling
    const cardStyle = {
        backgroundColor: '#fff',
        border: '1px solid #eee',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    };

    const shiftInputStyle = {
        width: '100%',
        padding: '8px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        fontSize: '0.85rem',
        outline: 'none',
        textAlign: 'center'
    };

    const dateBlockStyle = {
        padding: '10px',
        backgroundColor: '#f8fbfc',
        borderRadius: '8px',
        border: '1px solid #e1f5fe'
    };

    return (
        <div className="medical-form score-mapping-sheet-form" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px' }}>
            {/* Removed redundant top spacer */}

            <h2 style={{ textAlign: 'center', color: '#80deea', marginBottom: '30px', fontSize: '1.6rem', fontWeight: 'bold' }}>
                SCORE MAPPING SHEET
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
                {/* Global Date Selection */}
                <div style={{ ...cardStyle, backgroundColor: '#e0f2f1', padding: '15px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#80deea', fontSize: '0.9rem', textTransform: 'uppercase' }}>Monitoring Period Dates</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div key={i}>
                                <MuiDateTimePicker
                                    label={`Date ${i + 1}`}
                                    name={`date${i}`}
                                    value={dates[i]}
                                    onChange={(e) => handleDateChange(i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Score Sections as Cards */}
                {scoreItems.map((item) => (
                    <div key={item.id} style={cardStyle}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#80deea', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', display: 'flex', alignItems: 'center' }}>
                            <span style={{ backgroundColor: '#80deea', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', fontSize: '0.8rem' }}>S</span>
                            {item.name}
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
                            {[0, 1, 2, 3].map(dateIdx => (
                                <div key={dateIdx} style={dateBlockStyle}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#80deea', marginBottom: '10px', textAlign: 'center' }}>
                                        {dates[dateIdx] ? new Date(dates[dateIdx]).toLocaleDateString() : `Day ${dateIdx + 1}`}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.65rem', display: 'block', textAlign: 'center', color: '#666' }}>M</span>
                                            <input style={shiftInputStyle} value={scores[item.id][dateIdx].M} onChange={(e) => handleScoreChange(item.id, dateIdx, 'M', e.target.value)} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.65rem', display: 'block', textAlign: 'center', color: '#666' }}>E</span>
                                            <input style={shiftInputStyle} value={scores[item.id][dateIdx].E} onChange={(e) => handleScoreChange(item.id, dateIdx, 'E', e.target.value)} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.65rem', display: 'block', textAlign: 'center', color: '#666' }}>N</span>
                                            <input style={shiftInputStyle} value={scores[item.id][dateIdx].N} onChange={(e) => handleScoreChange(item.id, dateIdx, 'N', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Nurse Signature Card */}
                <div style={{ ...cardStyle, borderTop: '4px solid #80deea' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#80deea' }}>Staff Nurse Signatures</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
                        {[0, 1, 2, 3].map(dateIdx => (
                            <div key={dateIdx} style={{ ...dateBlockStyle, backgroundColor: '#fff' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    <input placeholder="Sign M" style={shiftInputStyle} value={nurseSigns[dateIdx].M} onChange={(e) => handleSignChange(dateIdx, 'M', e.target.value)} />
                                    <input placeholder="Sign E" style={shiftInputStyle} value={nurseSigns[dateIdx].E} onChange={(e) => handleSignChange(dateIdx, 'E', e.target.value)} />
                                    <input placeholder="Sign N" style={shiftInputStyle} value={nurseSigns[dateIdx].N} onChange={(e) => handleSignChange(dateIdx, 'N', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '30px' }}>
                    Finalize & Save All Scores
                </button>
            </form>
        </div>
    );
};

export default ScoreMappingSheetForm;
