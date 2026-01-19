import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import Textarea from '../inputs/Textarea';
import CheckboxGroup from '../inputs/CheckboxGroup';
import RadioGroup from '../inputs/RadioGroup';

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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <form onSubmit={handleSubmit} className="medical-form compact-form">
            <h2 className="form-title" style={{ textAlign: 'center', marginBottom: '20px', color: '#80deea', borderBottom: '2px solid #80deea', paddingBottom: '10px' }}>
                ADVERSE DRUG REPORT FORM
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

            {/* Incident details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <MuiDateTimePicker label="Date & Time of Incidence" name="incidentDateTime" value={formData.incidentDateTime} onChange={handleChange} />
                <MuiDateTimePicker label="Date & Time of Reporting" name="reportingDateTime" value={formData.reportingDateTime} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                <TextInput label="Ward" name="ward" value={formData.ward} onChange={handleChange} />
                <TextInput label="Bed" name="bed" value={formData.bed} onChange={handleChange} />
                <TextInput label="PRN" name="prn" value={formData.prn} onChange={handleChange} />
                <TextInput label="Consultant" name="consultant" value={formData.consultant} onChange={handleChange} />
            </div>

            <TextInput label="Nurse" name="nurse" value={formData.nurse} onChange={handleChange} />

            {/* Drug details */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                <TextInput label="Drug Name" name="drugName" value={formData.drugName} onChange={handleChange} />
                <TextInput label="Dose" name="dose" value={formData.dose} onChange={handleChange} />
                <TextInput label="Route" name="route" value={formData.route} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <TextInput label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
                <TextInput label="Batch No" name="batchNo" value={formData.batchNo} onChange={handleChange} />
                <TextInput label="Expiry" name="expiry" value={formData.expiry} onChange={handleChange} />
            </div>

            <RadioGroup
                label="High Risk Drug"
                name="highRisk"
                value={formData.highRisk}
                onChange={handleChange}
                options={[
                    { label: 'Yes', value: 'yes' },
                    { label: 'No', value: 'no' }
                ]}
            />

            {/* Seriousness */}
            <CheckboxGroup
                label="Seriousness of Reaction"
                name="seriousness"
                value={formData.seriousness}
                onChange={handleChange}
                options={[
                    'Death',
                    'Life threatening',
                    'Hospitalization',
                    'Disability',
                    'Congenital anomaly',
                    'Required intervention',
                    'Other'
                ]}
            />

            <Textarea label="Details of Reaction" name="reactionDetails" value={formData.reactionDetails} onChange={handleChange} />

            <RadioGroup
                label="Outcome"
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

            <Textarea label="Relevant Laboratory Data / Test Results" name="labData" value={formData.labData} onChange={handleChange} />
            <Textarea label="Other Relevant History" name="relevantHistory" value={formData.relevantHistory} onChange={handleChange} />
            <Textarea label="Details of Treatment Given" name="treatmentDetails" value={formData.treatmentDetails} onChange={handleChange} />

            <TextInput label="SNDT of Staff Nurse" name="staffNurse" value={formData.staffNurse} onChange={handleChange} />
            <Textarea label="Investigation by MDE Team (Members)" name="investigationTeam" value={formData.investigationTeam} onChange={handleChange} />

            <TextInput label="Medical Administrator Name" name="administratorName" value={formData.administratorName} onChange={handleChange} />
            <MuiDateTimePicker label="Date & Time" name="adminDateTime" value={formData.adminDateTime} onChange={handleChange} />

            <Textarea label="Action Plan with Time Commitment" name="actionPlan" value={formData.actionPlan} onChange={handleChange} />

            <button type="submit" className="submit-btn">
                Submit Adverse Drug Report
            </button>
        </form>
    );
};

export default AdverseDrugReportForm;
