import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';

const MedicationTherapyForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        allergy: '',
        statMeds: [{}],
        ivInfusion: [{}],
        verbalOrders: [{}],
        bloodSugar: [{}],
        highRiskMeds: [{}]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTableChange = (section, index, field, value) => {
        const updated = [...formData[section]];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, [section]: updated }));
    };

    const addRow = (section) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], {}]
        }));
    };

    const removeRow = (section, index) => {
        if (formData[section].length > 1) {
            const updated = formData[section].filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, [section]: updated }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    const gridContainerStyle = {
        overflowX: 'auto',
        marginBottom: '25px',
        paddingBottom: '5px'
    };

    const gridRowStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr) auto',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '10px',
        minWidth: '900px'
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                MEDICATION & THERAPY RECORD
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

            <div style={{ marginBottom: '30px' }}>
                <TextInput
                    label="Allergy (if any)"
                    name="allergy"
                    value={formData.allergy}
                    onChange={handleChange}
                    placeholder="Specify allergies or N.A."
                />
            </div>

            {/* STAT Medicines */}
            <h3 style={{ color: '#00796b', borderBottom: '2px solid #80deea', paddingBottom: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
                (STAT) Once Only Medicines
            </h3>
            <div style={gridContainerStyle}>
                {formData.statMeds.map((row, i) => (
                    <div key={i} style={gridRowStyle}>
                        <MuiDateTimePicker label="Date" name="date" value={row.date || ''} onChange={e => handleTableChange('statMeds', i, 'date', e.target.value)} hideLabel />
                        <TextInput label="Drug Name" value={row.drug || ''} onChange={e => handleTableChange('statMeds', i, 'drug', e.target.value)} hideLabel placeholder="Drug Name" />
                        <TextInput label="Dose" value={row.dose || ''} onChange={e => handleTableChange('statMeds', i, 'dose', e.target.value)} hideLabel placeholder="Dose" />
                        <TextInput label="Route" value={row.route || ''} onChange={e => handleTableChange('statMeds', i, 'route', e.target.value)} hideLabel placeholder="Route" />
                        <TextInput label="Nurse Sign" value={row.nurse || ''} onChange={e => handleTableChange('statMeds', i, 'nurse', e.target.value)} hideLabel placeholder="Nurse Sign" />
                        <button type="button" onClick={() => removeRow('statMeds', i)} className="remove-btn" title="Remove Row" style={{ visibility: formData.statMeds.length > 1 ? 'visible' : 'hidden' }}>×</button>
                    </div>
                ))}
                <button type="button" onClick={() => addRow('statMeds')} className="secondary-btn">+ Add Row</button>
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e0f7fa' }} />

            {/* IV Infusion */}
            <h3 style={{ color: '#00796b', borderBottom: '2px solid #80deea', paddingBottom: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
                Intravenous Infusion Therapy
            </h3>
            <div style={gridContainerStyle} id="iv-infusion-section">
                {formData.ivInfusion.map((row, i) => (
                    <div key={i} style={gridRowStyle}>
                        <MuiDateTimePicker label="Date" name="date" value={row.date || ''} onChange={e => handleTableChange('ivInfusion', i, 'date', e.target.value)} hideLabel />
                        <TextInput label="IV Fluid" value={row.fluid || ''} onChange={e => handleTableChange('ivInfusion', i, 'fluid', e.target.value)} hideLabel placeholder="IV Fluid" />
                        <TextInput label="Rate" value={row.rate || ''} onChange={e => handleTableChange('ivInfusion', i, 'rate', e.target.value)} hideLabel placeholder="Rate" />
                        <TextInput label="Doctor Sign" value={row.doctor || ''} onChange={e => handleTableChange('ivInfusion', i, 'doctor', e.target.value)} hideLabel placeholder="Doctor Sign" />
                        <TextInput label="Nurse Sign" value={row.nurse || ''} onChange={e => handleTableChange('ivInfusion', i, 'nurse', e.target.value)} hideLabel placeholder="Nurse Sign" />
                        <button type="button" onClick={() => removeRow('ivInfusion', i)} className="remove-btn" title="Remove Row" style={{ visibility: formData.ivInfusion.length > 1 ? 'visible' : 'hidden' }}>×</button>
                    </div>
                ))}
                <button type="button" onClick={() => addRow('ivInfusion')} className="secondary-btn">+ Add Row</button>
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e0f7fa' }} />

            {/* Verbal Orders */}
            <h3 style={{ color: '#00796b', borderBottom: '2px solid #80deea', paddingBottom: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
                For Verbal Orders Only
            </h3>
            <div style={gridContainerStyle}>
                {formData.verbalOrders.map((row, i) => (
                    <div key={i} style={gridRowStyle}>
                        <MuiDateTimePicker label="Date" name="date" value={row.date || ''} onChange={e => handleTableChange('verbalOrders', i, 'date', e.target.value)} hideLabel />
                        <TextInput label="Drug" value={row.drug || ''} onChange={e => handleTableChange('verbalOrders', i, 'drug', e.target.value)} hideLabel placeholder="Drug" />
                        <TextInput label="Dose" value={row.dose || ''} onChange={e => handleTableChange('verbalOrders', i, 'dose', e.target.value)} hideLabel placeholder="Dose" />
                        <TextInput label="Doctor" value={row.doctor || ''} onChange={e => handleTableChange('verbalOrders', i, 'doctor', e.target.value)} hideLabel placeholder="Doctor" />
                        <TextInput label="Remarks" value={row.remarks || ''} onChange={e => handleTableChange('verbalOrders', i, 'remarks', e.target.value)} hideLabel placeholder="Remarks" />
                        <button type="button" onClick={() => removeRow('verbalOrders', i)} className="remove-btn" title="Remove Row" style={{ visibility: formData.verbalOrders.length > 1 ? 'visible' : 'hidden' }}>×</button>
                    </div>
                ))}
                <button type="button" onClick={() => addRow('verbalOrders')} className="secondary-btn">+ Add Row</button>
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e0f7fa' }} />

            {/* Blood Sugar */}
            <h3 style={{ color: '#00796b', borderBottom: '2px solid #80deea', paddingBottom: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
                Blood Sugar & Insulin Record
            </h3>
            <div style={gridContainerStyle}>
                {formData.bloodSugar.map((row, i) => (
                    <div key={i} style={gridRowStyle}>
                        <TextInput label="BSL" value={row.bsl || ''} onChange={e => handleTableChange('bloodSugar', i, 'bsl', e.target.value)} hideLabel placeholder="BSL" />
                        <TextInput label="Drug" value={row.drug || ''} onChange={e => handleTableChange('bloodSugar', i, 'drug', e.target.value)} hideLabel placeholder="Drug" />
                        <TextInput label="Dose" value={row.dose || ''} onChange={e => handleTableChange('bloodSugar', i, 'dose', e.target.value)} hideLabel placeholder="Dose" />
                        <TextInput label="Doctor" value={row.doctor || ''} onChange={e => handleTableChange('bloodSugar', i, 'doctor', e.target.value)} hideLabel placeholder="Doctor" />
                        <TextInput label="Nurse" value={row.nurse || ''} onChange={e => handleTableChange('bloodSugar', i, 'nurse', e.target.value)} hideLabel placeholder="Nurse" />
                        <button type="button" onClick={() => removeRow('bloodSugar', i)} className="remove-btn" title="Remove Row" style={{ visibility: formData.bloodSugar.length > 1 ? 'visible' : 'hidden' }}>×</button>
                    </div>
                ))}
                <button type="button" onClick={() => addRow('bloodSugar')} className="secondary-btn">+ Add Row</button>
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e0f7fa' }} />

            {/* High Risk */}
            <h3 style={{ color: '#00796b', borderBottom: '2px solid #80deea', paddingBottom: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
                High Risk Medication
            </h3>
            <div style={gridContainerStyle}>
                {formData.highRiskMeds.map((row, i) => (
                    <div key={i} style={gridRowStyle}>
                        <TextInput label="Drug" value={row.drug || ''} onChange={e => handleTableChange('highRiskMeds', i, 'drug', e.target.value)} hideLabel placeholder="Drug" />
                        <TextInput label="Dose" value={row.dose || ''} onChange={e => handleTableChange('highRiskMeds', i, 'dose', e.target.value)} hideLabel placeholder="Dose" />
                        <TextInput label="Doctor" value={row.doctor || ''} onChange={e => handleTableChange('highRiskMeds', i, 'doctor', e.target.value)} hideLabel placeholder="Doctor" />
                        <TextInput label="Nurse" value={row.nurse || ''} onChange={e => handleTableChange('highRiskMeds', i, 'nurse', e.target.value)} hideLabel placeholder="Nurse" />
                        <TextInput label="Remarks" value={row.remarks || ''} onChange={e => handleTableChange('highRiskMeds', i, 'remarks', e.target.value)} hideLabel placeholder="Remarks" />
                        <button type="button" onClick={() => removeRow('highRiskMeds', i)} className="remove-btn" title="Remove Row" style={{ visibility: formData.highRiskMeds.length > 1 ? 'visible' : 'hidden' }}>×</button>
                    </div>
                ))}
                <button type="button" onClick={() => addRow('highRiskMeds')} className="secondary-btn">+ Add Row</button>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                <button type="submit" className="submit-btn" style={{ minWidth: '300px' }}>
                    Complete Medication Review
                </button>
            </div>
        </form>
    );
};

export default MedicationTherapyForm;
