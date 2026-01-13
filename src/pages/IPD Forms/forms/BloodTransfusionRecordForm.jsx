import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import RadioGroup from '../inputs/RadioGroup';
import Textarea from '../inputs/Textarea';
import './Forms.css';

const BloodTransfusionRecordForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        routeLocation: '',
        cannulaGauge: '',
        nsReady: '',
        bloodTemp: '',
        bloodContains: '',
        orderedHours: '',
        orderedMinutes: '',
        dripRate: '',
        preMedication: '',
        bloodBagNo: '',
        btLocation: '',
        btStartTime: '',
        btEndTime: '',
        monitoring: [{ time: '', bp: '', pulse: '', rr: '', temp: '', drip: '', uo: '' }]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMonitoringChange = (index, field, value) => {
        const updated = [...formData.monitoring];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, monitoring: updated }));
    };

    const addMonitoringRow = () => {
        setFormData(prev => ({
            ...prev,
            monitoring: [...prev.monitoring, { time: '', bp: '', pulse: '', rr: '', temp: '', drip: '', uo: '' }]
        }));
    };

    const removeMonitoringRow = (index) => {
        if (formData.monitoring.length > 1) {
            const updated = formData.monitoring.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, monitoring: updated }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <div className="medical-form-container">
            <form onSubmit={handleSubmit} className="medical-form">
                <h2 className="form-title">
                    BLOOD TRANSFUSION RECORD & MONITORING
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

                {/* Nurse’s Checklist */}
                <h3 className="form-section-title">Nurse's Checklist</h3>
                <div className="two-col">
                    <TextInput label="Route / Location" name="routeLocation" value={formData.routeLocation} onChange={handleChange} />
                    <TextInput label="Cannula Gauge" name="cannulaGauge" value={formData.cannulaGauge} onChange={handleChange} />
                </div>

                <div className="two-col">
                    <RadioGroup
                        label="NS 0.9% Available on IV Stand"
                        name="nsReady"
                        value={formData.nsReady}
                        onChange={handleChange}
                        options={[
                            { label: 'Yes', value: 'yes' },
                            { label: 'No', value: 'no' }
                        ]}
                    />

                    <RadioGroup
                        label="Blood Bag Temperature"
                        name="bloodTemp"
                        value={formData.bloodTemp}
                        onChange={handleChange}
                        options={[
                            { label: 'Room Temperature', value: 'room' },
                            { label: 'Cold', value: 'cold' }
                        ]}
                    />
                </div>

                <div className="form-field">
                    <TextInput label="Blood Contains (Whole Blood / PCV / FFP)" name="bloodContains" value={formData.bloodContains} onChange={handleChange} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                    <TextInput label="Drip Rate (drops/min)" name="dripRate" value={formData.dripRate} onChange={handleChange} />
                    <TextInput label="Ordered Time (Hours)" name="orderedHours" value={formData.orderedHours} onChange={handleChange} />
                    <TextInput label="Ordered Time (Minutes)" name="orderedMinutes" value={formData.orderedMinutes} onChange={handleChange} />
                </div>

                <div className="form-field">
                    <RadioGroup
                        label="Pre-medication Ordered"
                        name="preMedication"
                        value={formData.preMedication}
                        onChange={handleChange}
                        options={[
                            { label: 'Ready', value: 'ready' },
                            { label: 'Given', value: 'given' }
                        ]}
                    />
                </div>

                <TextInput label="Blood Bag Number" name="bloodBagNo" value={formData.bloodBagNo} onChange={handleChange} />

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                    <TextInput label="BT Started At (OT / Ward)" name="btLocation" value={formData.btLocation} onChange={handleChange} />
                    <MuiDateTimePicker type="time" label="BT Start Time" name="btStartTime" value={formData.btStartTime} onChange={handleChange} />
                    <MuiDateTimePicker type="time" label="BT End Time" name="btEndTime" value={formData.btEndTime} onChange={handleChange} />
                </div>

                <hr style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                {/* Monitoring Chart */}
                <h3 className="form-section-title">BT MONITORING CHART</h3>

                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <div style={{ minWidth: '800px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr 1fr 1fr 1fr 50px', gap: '10px', padding: '12px', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.85rem', textAlign: 'center' }}>
                            <div>Time</div>
                            <div>BP</div>
                            <div>Pulse</div>
                            <div>RR</div>
                            <div>Temp</div>
                            <div>Drip Rate</div>
                            <div>U/O</div>
                            <div></div>
                        </div>

                        {formData.monitoring.map((row, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '120px 1fr 1fr 1fr 1fr 1fr 1fr 50px',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderTop: '1px solid var(--border-color)',
                                    alignItems: 'center'
                                }}
                            >
                                <MuiDateTimePicker hideLabel type="time" value={row.time} onChange={e => handleMonitoringChange(index, 'time', e.target.value)} />
                                <TextInput hideLabel value={row.bp} onChange={e => handleMonitoringChange(index, 'bp', e.target.value)} placeholder="BP" />
                                <TextInput hideLabel value={row.pulse} onChange={e => handleMonitoringChange(index, 'pulse', e.target.value)} placeholder="P" />
                                <TextInput hideLabel value={row.rr} onChange={e => handleMonitoringChange(index, 'rr', e.target.value)} placeholder="RR" />
                                <TextInput hideLabel value={row.temp} onChange={e => handleMonitoringChange(index, 'temp', e.target.value)} placeholder="T" />
                                <TextInput hideLabel value={row.drip} onChange={e => handleMonitoringChange(index, 'drip', e.target.value)} placeholder="Drip" />
                                <TextInput hideLabel value={row.uo} onChange={e => handleMonitoringChange(index, 'uo', e.target.value)} placeholder="U/O" />
                                <div style={{ textAlign: 'center' }}>
                                    {formData.monitoring.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMonitoringRow(index)}
                                            style={{
                                                background: '#fee2e2',
                                                color: '#ef4444',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                lineHeight: '24px'
                                            }}
                                            title="Remove Entry"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                    <button
                        type="button"
                        onClick={addMonitoringRow}
                        style={{
                            padding: '0.625rem 1.25rem',
                            background: '#f0fdf4',
                            color: '#16a34a',
                            border: '1.5px solid #bbf7d0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }}
                    >
                        + Add Monitoring Entry
                    </button>
                </div>

                <button type="submit" className="submit-btn">
                    Submit Blood Transfusion Record
                </button>
            </form>
        </div>
    );
};

export default BloodTransfusionRecordForm;
