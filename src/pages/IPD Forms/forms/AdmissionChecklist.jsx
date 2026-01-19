import React, { useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './Forms.css';
import { decodeJwt } from '../../../utils/decode-jwt';
import Swal from "sweetalert2";

const BASE_URL = "http://localhost:5100/api";


// const admissionJSON = {"admission-checklist":
//     {
//       "hospital_info": {
//         "name": "HEALING HANDS CLINIC",
//         "uhid": ""
//       },
//       "admission_tracking": {
//         "admission_date": null,
//         "admission_time": null,
//         "general_consent_taken": false
//       },
//       "room_allotment": {
//         "category": {
//           "general": false,
//           "semi_private": false,
//           "private": false,
//           "deluxe": false,
//           "super_deluxe": false,
//           "suite": false
//         }
//       },
//       "basic_amenities_on_admission": {
//         "hygiene_and_linens": {
//           "paper_napkins": false,
//           "soap": false,
//           "pillow_cover_and_bed_sheet": false,
//           "dental_kit": false,
//           "tissue_paper_and_stands": false,
//           "door_mats": false
//         },
//         "patient_comfort": {
//           "dress_of_patient": false,
//           "room_orientation": false,
//           "slippers": false,
//           "wifi_password": null
//         },
//         "room_utilities": {
//           "ac_with_remote": false,
//           "tv_with_remote": false,
//           "geyser_in_condition": false,
//           "call_bell": false
//         },
//         "dining_and_bath": {
//           "water_mug_with_glass": false,
//           "mug_bucket_and_dustbin": false,
//           "plates": false,
//           "spoons": false,
//           "cups_and_bowls": false,
//           "tray_and_kettle": false
//         }
//       },
//       "staff_verification": {
//         "admission_taken_by_name": null,
//         "signature": null
//       },
//       "document_control": {
//         "form_code": "AAC-F-2.2-00",
//         "page_number": 5,
//         "status": "CONTROL DOCUMENT"
//       }
//     }
// }

const theme = createTheme({
    palette: {
        primary: {
            main: '#80deea',
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
    const [currentLocation, setCurrentLocation] = useState(null);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = decodeJwt(token);
          if (payload && payload.jobLocation) {
            setCurrentLocation(payload.jobLocation);
          }
        }
      }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const isSelected = (arr, val) => arr.some(item => item.toLowerCase() === val.toLowerCase().replace(/_/g, ' '));

    const handleCheckboxChange = (name, optionValue, currentValues) => {
        let newValue;
        if (currentValues.includes(optionValue)) {
            newValue = currentValues.filter(v => v !== optionValue);
        } else {
            newValue = [...currentValues, optionValue];
        }
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     onSubmit && onSubmit({ ...formData, patientHeader: patientData });
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Map the flat formData to the nested admissionJSON structure
        const finalPayload = {
            "admission-checklist": {
                "hospital_info": {
                    "name": "HEALING HANDS CLINIC",
                    "uhid": patientData?.uhid || ""
                },
                "admission_tracking": {
                    "admission_date": formData.admissionDateTime ? formData.admissionDateTime.split(' ')[0] : null,
                    "admission_time": formData.admissionDateTime ? formData.admissionDateTime.split(' ')[1] : null,
                    "general_consent_taken": formData.consentTaken.includes('Yes')
                },
                "room_allotment": {
                    "category": {
                        "general": formData.roomCategory.includes('General'),
                        "semi_private": formData.roomCategory.includes('Semi-private'),
                        "private": formData.roomCategory.includes('Private'),
                        "deluxe": formData.roomCategory.includes('Deluxe'),
                        "super_deluxe": formData.roomCategory.includes('Super-deluxe'),
                        "suite": formData.roomCategory.includes('Suite')
                    }
                },
                "basic_amenities_on_admission": {
                    "hygiene_and_linens": {
                        "paper_napkins": formData.amenities.includes('Paper napkins'),
                        "soap": formData.amenities.includes('Soap'),
                        "pillow_cover_and_bed_sheet": formData.amenities.includes('Pillow cover & bed sheet'),
                        "dental_kit": formData.amenities.includes('Dental kit'),
                        "tissue_paper_and_stands": formData.amenities.includes('Tissue paper & stands'),
                        "door_mats": formData.amenities.includes('Door mats')
                    },
                    "patient_comfort": {
                        "dress_of_patient": formData.amenities.includes('Dress of patient'),
                        "room_orientation": formData.amenities.includes('Room orientation'),
                        "slippers": formData.amenities.includes('Slippers'),
                        "wifi_password": formData.amenities.includes('Wifi password') ? "PROVIDED" : null
                    },
                    "room_utilities": {
                        "ac_with_remote": formData.amenities.includes('A.C. with remote'),
                        "tv_with_remote": formData.amenities.includes('T.V with remote'),
                        "geyser_in_condition": formData.amenities.includes('Geyser in condition'),
                        "call_bell": formData.amenities.includes('Call bell')
                    },
                    "dining_and_bath": {
                        "water_mug_with_glass": formData.amenities.includes('Water mug with glass'),
                        "mug_bucket_and_dustbin": formData.amenities.includes('Mug, bucket & dustbin'),
                        "plates": formData.amenities.includes('Plates'),
                        "spoons": formData.amenities.includes('Spoons'),
                        "cups_and_bowls": formData.amenities.includes('Cup and bowls'),
                        "tray_and_kettle": formData.amenities.includes('Trey & kettles')
                    }
                },
                "staff_verification": {
                    "admission_taken_by_name": null,
                    "signature": null
                },
                "document_control": {
                    "form_code": "AAC-F-2.2-00",
                    "page_number": 5,
                    "status": "CONTROL DOCUMENT"
                }
            }
        };

        try {
            // 2. Show loading state
            Swal.fire({
                title: 'Saving Checklist...',
                didOpen: () => { Swal.showLoading(); },
                allowOutsideClick: false
            });
            // console.log("formdata:", formData);
            const bodyPayload = {
                title: "admission-checklist",
                location: currentLocation,
                patient_id: patientData.uhid, // Ensure this matches backend expectation
                admissionData: finalPayload
            };
            // 3. API Call
            const response = await fetch(`${BASE_URL}/V1/ipd/admission/insertAdmission`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(bodyPayload)
            });
    
            const result = await response.json();
    
            if (response.ok) {
                // 4. Success Handling
                Swal.fire({
                    icon: "success",
                    title: "Saved!",
                    text: "Admission Checklist has been submitted successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => {
                    // Trigger the original onSubmit if you need to close a modal or update parent state
                    if (onSubmit) onSubmit(result); 
                });
            } else {
                throw new Error(result.message || "Failed to save checklist");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            Swal.fire("Error", error.message || "Server connection failed", "error");
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form onSubmit={handleSubmit} className="medical-form compact-form">
                    <h2 className="form-title" style={{ textAlign: 'center', marginBottom: '30px', color: '#80deea', borderBottom: '2px solid #80deea', paddingBottom: '10px' }}>
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
                        <div className="form-field" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
                        <label style={{
                            fontWeight: '600',
                            marginBottom: '8px',
                            fontSize: '0.85rem',
                            color: '#34495e',
                            display: 'block'
                        }}>
                            Admission Date & Time <span style={{ color: '#e74c3c' }}>*</span>
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
                                                borderRadius: '6px',
                                                backgroundColor: '#ffffff !important',
                                                '& fieldset': {
                                                    borderWidth: '2px',
                                                    borderColor: '#e1e8ed',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#cbd5e0',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#80deea',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                padding: '8px 12px',
                                                fontSize: '0.85rem',
                                                height: 'auto',
                                                backgroundColor: '#ffffff !important',
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
    
                        {/* General Consent */}
                        <div className="form-field">
                            <label className="field-label">
                                General Consent for Admission <span className="required">*</span>
                            </label>
                            <div className="checkbox-group">
                                {['Yes', 'No'].map((option, index) => (
                                    <label key={index} className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            name="consentTaken"
                                            value={option}
                                            checked={formData.consentTaken.includes(option)}
                                            onChange={() => handleCheckboxChange('consentTaken', option, formData.consentTaken)}
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
    
                        {/* Room Category */}
                        <div className="form-field">
                            <label className="field-label">
                                Room Category <span className="required">*</span>
                            </label>
                            <div className="checkbox-group">
                                {['General', 'Semi-Private', 'Private', 'Deluxe', 'Super Deluxe', 'Suite'].map((option, index) => (
                                    <label key={index} className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            name="roomCategory"
                                            value={option}
                                            checked={formData.roomCategory.includes(option)}
                                            onChange={() => handleCheckboxChange('roomCategory', option, formData.roomCategory)}
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
    
                        {/* ALL Basic Amenities */}
                        <div className="form-field">
                            <label className="field-label">
                                Basic Amenities Provided (as per room)
                            </label>
                            <div className="checkbox-group">
                                {[
                                    'Paper napkins',
                                    'Soap',
                                    'Water mug with glass',
                                    'Pillow cover & bed sheet',
                                    'Dress of patient',
                                    'T.V with remote',
                                    'A.C with remote',
                                    'Geyser in condition',
                                    'Mug, bucket & dustbin',
                                    'Spoons',
                                    'Plates',
                                    'Dental kit',
                                    'Cup and bowls',
                                    'Tray & kettles',
                                    'Tissue paper & stands',
                                    'Dish TV with remote',
                                    'Slippers',
                                    'Door mats',
                                    'Call bell',
                                    'Wifi password',
                                    'Room orientation'
                                ].map((option, index) => (
                                    <label key={index} className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            name="amenities"
                                            value={option}
                                            checked={formData.amenities.includes(option)}
                                            onChange={() => handleCheckboxChange('amenities', option, formData.amenities)}
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
    
                        <button type="submit" className="submit-btn">
                            Complete Admission Checklist
                        </button>
                    </form>
                </LocalizationProvider>
            </ThemeProvider>
        );
    };
    
    export default AdmissionChecklist;
    