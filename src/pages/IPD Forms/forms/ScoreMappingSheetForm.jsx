import React, { useState } from 'react';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';

const ScoreMappingSheetForm = ({ onSubmit, patientData }) => {
    const scoreItems = [
        { id: 'vip', name: 'VIP Score' },
        { id: 'braden', name: 'Braden Score' },
        { id: 'morse', name: 'Morse Fall Score' },
        { id: 'must', name: 'MUST Score' },
        { id: 'mews', name: 'MEW\'s Score' },
        { id: 'pain', name: 'Pain Score' }
    ];

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

    return (
        <div className="medical-form-container">
            <h2 className="form-title">NURSING SCORE MAPPING SHEET</h2>

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
                <h3 className="form-section-title">Monitoring Period Selection</h3>
                <div className="section-box" style={{ background: '#f8fafc', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        {[0, 1, 2, 3].map(i => (
                            <MuiDateTimePicker
                                key={i}
                                label={`Monitoring Day ${i + 1}`}
                                value={dates[i]}
                                onChange={(e) => handleDateChange(i, e.target.value)}
                                type="date"
                            />
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    {scoreItems.map((item) => (
                        <div key={item.id} className="section-box score-card">
                            <h4 style={{ margin: '0 0 1.5rem', color: 'var(--primary-color)', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                {item.name}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                {[0, 1, 2, 3].map(dateIdx => (
                                    <div key={dateIdx} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '0.75rem', textAlign: 'center', fontWeight: '800' }}>
                                            {dates[dateIdx] ? new Date(dates[dateIdx]).toLocaleDateString() : `DAY ${dateIdx + 1}`}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                            {['M', 'E', 'N'].map(shift => (
                                                <div key={shift}>
                                                    <span style={{ fontSize: '0.65rem', display: 'block', textAlign: 'center', fontWeight: '600' }}>{shift}</span>
                                                    <input
                                                        className="score-input"
                                                        value={scores[item.id][dateIdx][shift]}
                                                        onChange={(e) => handleScoreChange(item.id, dateIdx, shift, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <h3 className="form-section-title" style={{ marginTop: '3rem' }}>Staff Nurse Responsibilities</h3>
                <div className="section-box" style={{ borderTop: '4px solid var(--primary-color)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        {[0, 1, 2, 3].map(dateIdx => (
                            <div key={dateIdx} style={{ padding: '0.5rem' }}>
                                <div style={{ fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: '700' }}>Signatures (D{dateIdx + 1})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {['M', 'E', 'N'].map(shift => (
                                        <input
                                            key={shift}
                                            placeholder={`Sign ${shift}`}
                                            className="score-input"
                                            style={{ textAlign: 'left', padding: '0.5rem' }}
                                            value={nurseSigns[dateIdx][shift]}
                                            onChange={(e) => handleSignChange(dateIdx, shift, e.target.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '4rem' }}>
                    Successfully Finalize Score Mapping
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
                .score-input {
                    width: 100%;
                    padding: 6px;
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    font-size: 0.85rem;
                    outline: none;
                    text-align: center;
                    transition: border-color 0.2s;
                }
                .score-input:focus {
                    border-color: var(--primary-color);
                }
                .score-card:hover {
                    box-shadow: 0 6px 16px rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    );
};

export default ScoreMappingSheetForm;
