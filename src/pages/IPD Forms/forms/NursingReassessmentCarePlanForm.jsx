import React, { useState } from 'react';
import Textarea from '../inputs/Textarea';
import TextInput from '../inputs/TextInput';
import SignatureInput from '../inputs/SignatureInput';

const emptyRow = {
    assessment: '',
    carePlan: '',
    implementation: '',
    evaluation: ''
};

const emptyBlock = {
    rows: [ { ...emptyRow } ],
    nurseSign: '',
    dateTime: ''
};

const NursingReassessmentCarePlanForm = ({ onSubmit, patientData }) => {
    const [blocks, setBlocks] = useState([
        { ...emptyBlock },
        { ...emptyBlock },
        { ...emptyBlock }
    ]);

    const updateRow = (blockIndex, rowIndex, field, value) => {
        const updated = [...blocks];
        updated[blockIndex].rows[rowIndex][field] = value;
        setBlocks(updated);
    };

    const addRow = (blockIndex) => {
        const updated = [...blocks];
        updated[blockIndex].rows.push({ ...emptyRow });
        setBlocks(updated);
    };

    const updateFooter = (blockIndex, field, value) => {
        const updated = [...blocks];
        updated[blockIndex][field] = value;
        setBlocks(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit &&
            onSubmit({
                reassessmentBlocks: blocks,
                patientHeader: patientData
            });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center' }}>
                NURSING REASSESSMENT CARE PLAN
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

            {blocks.map((block, bIndex) => (
                <div key={bIndex} style={{ marginBottom: '25px' }}>
                    <table className="medical-table">
                        <thead>
                            <tr>
                                <th>Assessment</th>
                                <th>Care Plan</th>
                                <th>Implementation</th>
                                <th>Evaluation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map((row, rIndex) => (
                                <tr key={rIndex}>
                                    <td>
                                        <Textarea
                                            value={row.assessment}
                                            onChange={e =>
                                                updateRow(bIndex, rIndex, 'assessment', e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Textarea
                                            value={row.carePlan}
                                            onChange={e =>
                                                updateRow(bIndex, rIndex, 'carePlan', e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Textarea
                                            value={row.implementation}
                                            onChange={e =>
                                                updateRow(bIndex, rIndex, 'implementation', e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Textarea
                                            value={row.evaluation}
                                            onChange={e =>
                                                updateRow(bIndex, rIndex, 'evaluation', e.target.value)
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        type="button"
                        onClick={() => addRow(bIndex)}
                        style={{ marginTop: '8px' }}
                    >
                        + Add Row
                    </button>

                    <div className="grid-2" style={{ marginTop: '15px' }}>
                        <SignatureInput
                            label="S/N Name & Sign"
                            value={block.nurseSign}
                            onChange={e =>
                                updateFooter(bIndex, 'nurseSign', e.target.value)
                            }
                        />
                        <TextInput
                            label="Date & Time"
                            value={block.dateTime}
                            onChange={e =>
                                updateFooter(bIndex, 'dateTime', e.target.value)
                            }
                        />
                    </div>
                </div>
            ))}

            <button type="submit" className="submit-btn">
                Submit Nursing Reassessment Care Plan
            </button>
        </form>
    );
};

export default NursingReassessmentCarePlanForm;
