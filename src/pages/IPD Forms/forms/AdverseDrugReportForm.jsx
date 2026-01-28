import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import Textarea from '../inputs/Textarea';
import CheckboxGroup from '../inputs/CheckboxGroup';
import RadioGroup from '../inputs/RadioGroup';
import './Forms.css'; // Importing your shared CSS

const AdverseDrugReportForm = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        incidentDateTime: '',
        reportingDateTime: '',
        ward: '',
        bed: '',
        prn: '',
        consultant: '',
        nurse: '',
        drugName: '',
        dose: '',
        route: '',
        manufacturer: '',
        batchNo: '',
        expiry: '',
        highRisk: '',
        seriousness: [],
        reactionDetails: '',
        outcome: '',
        labData: '',
        relevantHistory: '',
        treatmentDetails: '',
        staffNurse: '',
        investigationTeam: '',
        administratorName: '',
        adminDateTime: '',
        actionPlan: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <div className="medical-form-container">
            <form onSubmit={handleSubmit}>
                <h2 className="form-title">ADVERSE DRUG REPORT FORM</h2>

                {/* Patient Header - Standard across all forms */}
                {patientData && (
                    <div className="patient-compact-header">
                        <div className="info-item">
                            <span className="info-label">UHID</span>
                            <span className="info-value">{patientData.uhid || '—'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Patient Name</span>
                            <span className="info-value">{patientData.name || '—'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Age/Sex</span>
                            <span className="info-value">{patientData.age || '—'}/{patientData.gender || '—'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">IP No</span>
                            <span className="info-value">{patientData.ipNo || '—'}</span>
                        </div>
                    </div>
                )}

                {/* Section 1: Incident Logistics */}
                <div className="section-box">
                    <div className="form-section-title">Incident Details</div>
                    <div className="two-col">
                        <MuiDateTimePicker label="Date & Time of Incidence" name="incidentDateTime" value={formData.incidentDateTime} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time of Reporting" name="reportingDateTime" value={formData.reportingDateTime} onChange={handleChange} />
                    </div>

                    <div className="form-grid" style={{ marginTop: '10px' }}>
                        <TextInput label="Ward" name="ward" value={formData.ward} onChange={handleChange} />
                        <TextInput label="Bed No" name="bed" value={formData.bed} onChange={handleChange} />
                        <TextInput label="PRN" name="prn" value={formData.prn} onChange={handleChange} />
                        <TextInput label="Consultant In-charge" name="consultant" value={formData.consultant} onChange={handleChange} />
                    </div>
                    <TextInput label="Nurse on Duty" name="nurse" value={formData.nurse} onChange={handleChange} />
                </div>

                {/* Section 2: Medication Details */}
                <div className="section-box">
                    <div className="form-section-title">Suspected Medication Details</div>
                    <div className="three-col">
                        <TextInput label="Drug Name" name="drugName" value={formData.drugName} onChange={handleChange} />
                        <TextInput label="Dose" name="dose" value={formData.dose} onChange={handleChange} />
                        <TextInput label="Route" name="route" value={formData.route} onChange={handleChange} />
                    </div>

                    <div className="three-col" style={{ marginTop: '10px' }}>
                        <TextInput label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
                        <TextInput label="Batch No" name="batchNo" value={formData.batchNo} onChange={handleChange} />
                        <TextInput label="Expiry Date" name="expiry" value={formData.expiry} onChange={handleChange} />
                    </div>

                    <div className="form-field" style={{ marginTop: '15px' }}>
                        <label className="field-label">High Risk Drug Status</label>
                        <RadioGroup
                            name="highRisk"
                            value={formData.highRisk}
                            onChange={handleChange}
                            options={[
                                { label: 'Yes', value: 'yes' },
                                { label: 'No', value: 'no' }
                            ]}
                        />
                    </div>
                </div>

                {/* Section 3: Reaction & Outcome */}
                <div className="section-box">
                    <div className="form-section-title">Reaction Assessment</div>
                    
                    <div className="form-field">
                        <label className="field-label">Seriousness of Reaction (Select all that apply)</label>
                        <CheckboxGroup
                            name="seriousness"
                            value={formData.seriousness}
                            onChange={handleChange}
                            options={[
                                'Death', 'Life threatening', 'Hospitalization', 
                                'Disability', 'Congenital anomaly', 'Required intervention', 'Other'
                            ]}
                        />
                    </div>

                    <Textarea label="Clinical Details of Reaction" name="reactionDetails" value={formData.reactionDetails} onChange={handleChange} rows={3} />

                    <div className="form-field" style={{ marginTop: '15px' }}>
                        <label className="field-label">Outcome of Reaction</label>
                        <RadioGroup
                            name="outcome"
                            value={formData.outcome}
                            onChange={handleChange}
                            options={[
                                { label: 'Fatal', value: 'fatal' },
                                { label: 'Recovering', value: 'recovering' },
                                { label: 'Recovered', value: 'recovered' },
                                { label: 'Continuing', value: 'continuing' },
                                { label: 'Unknown', value: 'unknown' }
                            ]}
                        />
                    </div>
                </div>

                {/* Section 4: History & Lab Data */}
                <div className="section-box">
                    <div className="form-section-title">Clinical History & Treatment</div>
                    <div className="two-col">
                        <Textarea label="Laboratory Data / Test Results" name="labData" value={formData.labData} onChange={handleChange} rows={4} />
                        <Textarea label="Other Relevant Medical History" name="relevantHistory" value={formData.relevantHistory} onChange={handleChange} rows={4} />
                    </div>
                    <Textarea label="Details of Treatment Given for Reaction" name="treatmentDetails" value={formData.treatmentDetails} onChange={handleChange} rows={3} />
                </div>

                {/* Section 5: Investigation & Admin */}
                <div className="section-box">
                    <div className="form-section-title">Administrative Investigation</div>
                    <div className="form-grid">
                        <TextInput label="SNDT of Staff Nurse" name="staffNurse" value={formData.staffNurse} onChange={handleChange} />
                        <Textarea label="Investigation Team Members" name="investigationTeam" value={formData.investigationTeam} onChange={handleChange} rows={2} />
                    </div>

                    <div className="two-col" style={{ marginTop: '15px' }}>
                        <TextInput label="Medical Administrator Name" name="administratorName" value={formData.administratorName} onChange={handleChange} />
                        <MuiDateTimePicker label="Verification Date & Time" name="adminDateTime" value={formData.adminDateTime} onChange={handleChange} />
                    </div>

                    <Textarea 
                        label="Action Plan with Time Commitment" 
                        name="actionPlan" 
                        value={formData.actionPlan} 
                        onChange={handleChange} 
                        rows={3} 
                        style={{ marginTop: '10px' }}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Submit Adverse Drug Report
                </button>
            </form>
        </div>
    );
};

export default AdverseDrugReportForm;