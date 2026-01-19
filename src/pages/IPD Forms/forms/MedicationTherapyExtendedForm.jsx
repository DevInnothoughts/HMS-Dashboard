import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';

const MedicationTherapyExtendedForm = ({ onSubmit, patientData }) => {
    const emptyRow = {};

    const [formData, setFormData] = useState({
        statMeds: [{}],
        ivTherapy: [{}],
        verbalOrders: [{}],
        bslInsulin: [{}],
        highRiskMeds: [{}]
    });

    const updateRow = (section, index, field, value) => {
        const copy = [...formData[section]];
        copy[index] = { ...copy[index], [field]: value };
        setFormData(prev => ({ ...prev, [section]: copy }));
    };

    const addRow = (section) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], emptyRow]
        }));
    };

    const renderTable = (title, section, columns) => (
        <>
            <h3>{title}</h3>
            <table className="medical-table">
                <thead>
                    <tr>
                        {columns.map(c => <th key={c}>{c}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {formData[section].map((row, i) => (
                        <tr key={i}>
                            {columns.map(col => (
                                <td key={col}>
                                    <TextInput
                                        hideLabel
                                        value={row[col] || ''}
                                        onChange={e =>
                                            updateRow(section, i, col, e.target.value)
                                        }
                                        style={{ maxWidth: '90px' }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                type="button"
                className="secondary-btn"
                onClick={() => addRow(section)}
                style={{ marginBottom: '20px' }}
            >
                + Add Row
            </button>
        </>
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">

            <h2 className="form-title">(STAT) ONCE ONLY MEDICINES & THERAPY</h2>

            {patientData && (
                <div className="patient-compact-header">
                    <div>UHID: {patientData.uhid}</div>
                    <div>Name: {patientData.name}</div>
                    <div>Age: {patientData.age}</div>
                    <div>Gender: {patientData.gender}</div>
                    <div>IP No: {patientData.ipNo}</div>
                </div>
            )}

            {renderTable(
                '(STAT) Once Only Medicines',
                'statMeds',
                [
                    'Date',
                    'Time',
                    'Drug Name',
                    'Type',
                    'Dose',
                    'Unit',
                    'Route',
                    'Dr Sign',
                    'Administration Time',
                    'Nurse Sign'
                ]
            )}

            {renderTable(
                'Intravenous Infusion Therapy',
                'ivTherapy',
                [
                    'Date',
                    'IV Fluids',
                    'Vol',
                    'Drug Added',
                    'Dose',
                    'Rate of Infusion',
                    'Doctor Sign',
                    'Additional Remarks',
                    'Nurse Sign',
                    'Time Started',
                    'Time Ended'
                ]
            )}

            {renderTable(
                'For Verbal Orders Only',
                'verbalOrders',
                [
                    'Date',
                    'Time',
                    'Drug (Approved Name)',
                    'Dose',
                    'Route',
                    'Doctor Name',
                    'Read Back',
                    'Nurse Sign',
                    'Remarks'
                ]
            )}

            {renderTable(
                'Report of Blood Sugar Level & Insulin Dose Prescription',
                'bslInsulin',
                [
                    'Date & Time',
                    'BSL',
                    'Drug Name',
                    'Dose',
                    'Tested By',
                    'Doctor Sign',
                    'Administration Time',
                    'Second Verification',
                    'Remarks'
                ]
            )}

            {renderTable(
                'High Risk Medication',
                'highRiskMeds',
                [
                    'Date & Time',
                    'Drug Name',
                    'Dose',
                    'Doctor Name',
                    'Doctor Sign',
                    'Allergic To',
                    'Nurse Sign',
                    'Second Verification',
                    'Remarks'
                ]
            )}

            <button type="submit" className="submit-btn">
                Submit Medication & Therapy (Extended)
            </button>
        </form>
    );
};

export default MedicationTherapyExtendedForm;
