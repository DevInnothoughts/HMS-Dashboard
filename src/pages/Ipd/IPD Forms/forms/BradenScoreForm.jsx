import React, { useState } from 'react';
import RadioGroup from '../inputs/RadioGroup';
import TextInput from '../inputs/TextInput';

const BRADEN_FACTORS = [
    { key: 'sensory', label: 'Sensory perception', max: 4 },
    { key: 'moisture', label: 'Moisture', max: 4 },
    { key: 'activity', label: 'Activity', max: 4 },
    { key: 'mobility', label: 'Mobility', max: 4 },
    { key: 'nutrition', label: 'Nutrition', max: 4 },
    { key: 'friction', label: 'Friction & Shear', max: 3 }
];

const BradenScoreForm = ({ onSubmit, patientData }) => {
    const [scores, setScores] = useState({});
    const [nurseSign, setNurseSign] = useState('');

    const handleScoreChange = (factor, value) => {
        setScores(prev => ({ ...prev, [factor]: Number(value) }));
    };

    const totalScore = BRADEN_FACTORS.reduce(
        (sum, f) => sum + (scores[f.key] || 0),
        0
    );

    const riskLevel = () => {
    if (totalScore === '' || totalScore === null || totalScore === undefined) return '';

    if (totalScore <= 9) return 'Severe risk';
    if (totalScore >= 10 && totalScore <= 12) return 'High risk';
    if (totalScore >= 13 && totalScore <= 14) return 'Moderate risk';
    if (totalScore >= 15 && totalScore <= 18) return 'Low risk';

    return '';
};


    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit &&
            onSubmit({
                scores,
                totalScore,
                riskLevel: riskLevel(),
                nurseSign,
                patientHeader: patientData
            });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center' }}>
                BRADEN SCORING SHEET
            </h2>

            {/* Patient Header */}
            {patientData && (
                <div className="patient-info-header">
                    <div className="grid-4">
                        <div><b>UHID:</b> {patientData.uhid}</div>
                        <div><b>Name:</b> {patientData.name}</div>
                        <div><b>Age:</b> {patientData.age}</div>
                        <div><b>Gender:</b> {patientData.gender}</div>
                    </div>
                </div>
            )}

            {/* ================= SCORING OPTIONS ================= */}
            <h3>Braden Scale</h3>

            {BRADEN_FACTORS.map(factor => (
                <RadioGroup
                    key={factor.key}
                    label={factor.label}
                    name={factor.key}
                    value={scores[factor.key] || ''}
                    onChange={e =>
                        handleScoreChange(factor.key, e.target.value)
                    }
                    options={Array.from(
                        { length: factor.max },
                        (_, i) => ({
                            label: `${i + 1}`,
                            value: i + 1
                        })
                    )}
                />
            ))}

            {/* ================= RECORDING FORM ================= */}
            <h3>Recording Form for Braden Score</h3>

            <table className="medical-table">
                <thead>
                    <tr>
                        <th>Sr No</th>
                        <th>Risk factor</th>
                        <th>1</th>
                        <th>2</th>
                        <th>3</th>
                        <th>4</th>
                    </tr>
                </thead>
                <tbody>
                    {BRADEN_FACTORS.map((factor, index) => (
                        <tr key={factor.key}>
                            <td>{index + 1}</td>
                            <td>{factor.label}</td>
                            {[1, 2, 3, 4].map(val => (
                                <td key={val} style={{ textAlign: 'center' }}>
                                    {val <= factor.max ? (
                                        <input
                                            type="radio"
                                            name={`record-${factor.key}`}
                                            checked={scores[factor.key] === val}
                                            onChange={() =>
                                                handleScoreChange(factor.key, val)
                                            }
                                        />
                                    ) : null}
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="5"><b>Total score</b></td>
                        <td><b>{totalScore}</b></td>
                    </tr>
                </tbody>
            </table>

            {/* ================= RISK INTERPRETATION ================= */}
            <div style={{ marginTop: '15px' }}>
                <TextInput
                    label="Risk Level"
                    value={riskLevel()}
                    readOnly
                />
            </div>

            <TextInput
                label="Sign of nurse"
                value={nurseSign}
                onChange={e => setNurseSign(e.target.value)}
            />

            <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
                Submit Braden Score
            </button>
        </form>
    );
};

export default BradenScoreForm;
