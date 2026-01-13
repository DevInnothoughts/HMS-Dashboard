import React, { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './Forms.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#00acc1',
        },
    },
    typography: {
        fontSize: 13,
    }
});

const AdmissionChecklist = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        admissionDateTime: '',
        consentTaken: [],
        roomCategory: [],
        amenities: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (name, optionValue, currentValues) => {
        let newValue;
        if (currentValues.includes(optionValue)) {
            newValue = currentValues.filter(v => v !== optionValue);
        } else {
            newValue = [...currentValues, optionValue];
        }
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    };

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="medical-form-container">
                    <form onSubmit={handleSubmit} className="medical-form compact-form">
                        <h2 className="form-title">
                            ADMISSION CHECKLIST
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

                        {/* Admission Date & Time */}
                        <div className="form-field">
                            <label className="field-label fw-bold" style={{ fontSize: "13px" }}>
                                1] Admission Date & Time <span className="required">*</span>
                            </label>
                            <DateTimePicker
                                value={formData.admissionDateTime ? dayjs(formData.admissionDateTime, ['DD-MM-YYYY HH:mm', 'YYYY-MM-DDTHH:mm:ss.SSSZ']) : null}
                                format="DD-MM-YYYY HH:mm"
                                onChange={(newValue) => {
                                    let formattedValue = '';
                                    if (newValue && newValue.isValid()) {
                                        formattedValue = newValue.format('DD-MM-YYYY HH:mm');
                                    }
                                    const event = {
                                        target: {
                                            name: 'admissionDateTime',
                                            value: formattedValue
                                        }
                                    };
                                    handleChange(event);
                                }}
                                slotProps={{
                                    textField: {
                                        required: true,
                                        fullWidth: true,
                                        variant: 'outlined',
                                        size: 'small',
                                        sx: {
                                            '& .MuiOutlinedInput-root, & .MuiInputBase-root': {
                                                borderRadius: '5px',
                                                backgroundColor: '#ffffff !important',
                                                '& fieldset': {
                                                    borderWidth: '1.5px',
                                                    borderColor: '#e2e8f0',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#cbd5e0',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#00acc1',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                padding: '6px 10px',
                                                fontSize: '0.8rem',
                                                height: 'auto',
                                                backgroundColor: '#ffffff !important',
                                            }
                                        }
                                    }
                                }}
                            />
                        </div> <br></br>

                        {/* General Consent */}
                        <div className="form-field d-flex align-items-center gap-2">
                            <label className="field-label mb-0 fw-bold" style={{ fontSize: "13px" }}>
                                2] General consent of admission taken:
                            </label>
                            <div className="checkbox-group mt-0">
                                <label className={`checkbox-option ${formData.consentTaken.includes('Yes') ? 'selected' : ''}`} style={{ padding: '2px', border: 'none', background: 'transparent' }}>
                                    <input
                                        type="checkbox"
                                        name="consentTaken"
                                        value="Yes"
                                        checked={formData.consentTaken.includes('Yes')}
                                        onChange={() => handleCheckboxChange('consentTaken', 'Yes', formData.consentTaken)}
                                        style={{ margin: 0 }}
                                    />
                                </label>
                            </div>
                        </div> <br></br>

                        {/* Room Category */}
                        <div className="form-field">
                            <label className="field-label fw-bold" style={{ fontSize: "13px" }}>
                                3] Allotment of room as per category-
                            </label>
                            <div className="checkbox-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                {['General', 'Semi-private', 'Private', 'Deluxe', 'Super-deluxe', 'Suite'].map((option, index) => (
                                    <label key={index} className={`checkbox-option ${formData.roomCategory.includes(option) ? 'selected' : ''}`} style={{ width: '100%', border: 'none', background: 'transparent', padding: '2px' }}>
                                        <input
                                            type="checkbox"
                                            name="roomCategory"
                                            value={option}
                                            checked={formData.roomCategory.includes(option)}
                                            onChange={() => handleCheckboxChange('roomCategory', option, formData.roomCategory)}
                                        />
                                        <span style={{ marginLeft: '8px' }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div> <br></br>

                        {/* ALL Basic Amenities */}
                        <div className="form-field">
                            <label className="field-label fw-bold" style={{ fontSize: "13px" }}>
                                4] Basic amenities given (as per room): Admission
                            </label>
                            <div className="checkbox-group three-col">
                                {[
                                    'Paper napkins',
                                    'Soap',
                                    'Room orientation',
                                    'Water mug with glass',
                                    'Pillow cover & bed sheet',
                                    'Dress of patient',
                                    'T.V with remote',
                                    'A.C. with remote',
                                    'Geyser in condition',
                                    'Mug, bucket & dustbin',
                                    'Spoons',
                                    'Plates',
                                    'Dental kit',
                                    'Cup and bowls',
                                    'Trey & kettles',
                                    'Tissue paper & stands',
                                    'Dish TV with remote',
                                    'Slippers',
                                    'Door mats',
                                    'Call bell',
                                    'Wifi password'
                                ].map((option, index) => (
                                    <label key={index} className={`checkbox-option ${formData.amenities.includes(option) ? 'selected' : ''}`} style={{ border: 'none', background: 'transparent', padding: '2px' }}>
                                        <input
                                            type="checkbox"
                                            name="amenities"
                                            value={option}
                                            checked={formData.amenities.includes(option)}
                                            onChange={() => handleCheckboxChange('amenities', option, formData.amenities)}
                                        />
                                        <span style={{ marginLeft: '8px' }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">
                            Complete Admission Checklist
                        </button>
                    </form>
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default AdmissionChecklist;
