import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import Textarea from '../inputs/Textarea';
import SignatureInput from '../inputs/SignatureInput';

const InitialNursingCarePlanForm = ({ onSubmit, patientData }) => {
    const [rows, setRows] = useState([
        {
            assessment: '',
            diagnosis: '',
            goal: '',
            carePlan: '',
            implementation: '',
            evaluation: '',
            furtherIntervention: ''
        }
    ]);

    const [footer, setFooter] = useState({
        nurseSign: '',
        dateTime: ''
    });

    const updateRow = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;
        setRows(updated);
    };

    const addRow = () => {
        setRows([
            ...rows,
            {
                assessment: '',
                diagnosis: '',
                goal: '',
                carePlan: '',
                implementation: '',
                evaluation: '',
                furtherIntervention: ''
            }
        ]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit &&
            onSubmit({
                carePlanRows: rows,
                footer,
                patientHeader: patientData
            });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center' }}>
                INITIAL NURSING CARE PLAN
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

            {/* Care Plan Table */}
            <table className="medical-table">
                <thead>
                    <tr>
                        <th>Nursing Assessment</th>
                        <th>Diagnosis</th>
                        <th>Goal</th>
                        <th>Care Plan</th>
                        <th>Implementation</th>
                        <th>Evaluation</th>
                        <th>Further Intervention Required</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td>
                                <Textarea
                                    value={row.assessment}
                                    onChange={e =>
                                        updateRow(index, 'assessment', e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <Textarea
                                    value={row.diagnosis}
                                    onChange={e =>
                                        updateRow(index, 'diagnosis', e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <Textarea
                                    value={row.goal}
                                    onChange={e =>
                                        updateRow(index, 'goal', e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <Textarea
                                    value={row.carePlan}
                                    onChange={e =>
                                        updateRow(index, 'carePlan', e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <Textarea
                                    value={row.implementation}
                                    onChange={e =>
                                        updateRow(index, 'implementation', e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <Textarea
                                    value={row.evaluation}
                                    onChange={e =>
                                        updateRow(index, 'evaluation', e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <Textarea
                                    value={row.furtherIntervention}
                                    onChange={e =>
                                        updateRow(index, 'furtherIntervention', e.target.value)
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button type="button" onClick={addRow} style={{ marginTop: '10px' }}>
                + Add Row
            </button>

            {/* Footer */}
            <div className="grid-2" style={{ marginTop: '20px' }}>
                <SignatureInput
                    label="S/N Name & Sign"
                    value={footer.nurseSign}
                    onChange={e =>
                        setFooter({ ...footer, nurseSign: e.target.value })
                    }
                />
                <TextInput
                    label="Date & Time"
                    value={footer.dateTime}
                    onChange={e =>
                        setFooter({ ...footer, dateTime: e.target.value })
                    }
                />
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
                Submit Initial Nursing Care Plan
            </button>
        </form>
    );
};

export default InitialNursingCarePlanForm;
