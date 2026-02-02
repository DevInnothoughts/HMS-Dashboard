import React, { useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './Forms.css';
import { decodeJwt } from '../../../utils/decode-jwt';
import Swal from "sweetalert2";
import hhcLogo from '../../../assets/images/logo/hhclogo.webp';

const pageTitle = "admission-checklist";
const BASE_URL = "http://localhost:5100/api";

const theme = createTheme({
    palette: {
        primary: { main: '#80deea' },
    },
    typography: { fontSize: 13 }
});

const AdmissionChecklist = ({ onSubmit, patientData }) => {
    const [formData, setFormData] = useState({
        admissionDateTime: '',
        consentTaken: [],
        roomCategory: [],
        amenities: [],
        admissionTakenBy: '',
        staffSignature: '',
        staffActionDateTime: ''
    });
    const [loading, setLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);

    // Helpers
    const extractAmenities = (amenitiesObj) => {
        if (!amenitiesObj) return [];
        const found = [];

        // Map DB keys to EXACT UI Labels used in your checkboxes
        const keyToLabelMap = {
            "paper_napkins": "Paper napkins",
            "soap": "Soap",
            "room_orientation": "Room orientation",
            "water_mug_with_glass": "Water mug with glass",
            "pillow_cover_and_bed_sheet": "Pillow cover & bed sheet",
            "dress_of_patient": "Dress of patient",
            "tv_with_remote": "T.V with remote",
            "ac_with_remote": "A.C. with remote",
            "geyser_in_condition": "Geyser in condition",
            "mug_bucket_and_dustbin": "Mug, bucket & dustbin",
            "spoons": "Spoons",
            "plates": "Plates",
            "dental_kit": "Dental kit",
            "cups_and_bowls": "Cup and bowls",
            "tray_and_kettle": "Trey & kettles",
            "tissue_paper_and_stands": "Tissue paper & stands",
            "dish_tv_with_remote": "Dish TV with remote",
            "slippers": "Slippers",
            "door_mats": "Door mats",
            "call_bell": "Call bell",
            "wifi_password": "Wifi password"
        };

        // Iterate through categories: room_utilities, patient_comfort, etc.
        Object.values(amenitiesObj).forEach(group => {
            Object.entries(group).forEach(([key, value]) => {
                // Check for true OR the string "PROVIDED" (from your JSON)
                if (value === true || value === "PROVIDED") {
                    const label = keyToLabelMap[key];
                    if (label) found.push(label);
                }
            });
        });

        return found;
    };

    const getRoomCategoryArray = (catObj) => {
        if (!catObj) return [];
        return Object.entries(catObj)
            .filter(([_, val]) => val)
            .map(([key]) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-'));
    };

    // Initialize Location and Fetch Data
    useEffect(() => {
        const token = localStorage.getItem("token");
        let loc = currentLocation;
        if (token) {
            const payload = decodeJwt(token);
            if (payload && payload.jobLocation) {
                loc = payload.jobLocation;
                setCurrentLocation(loc);
            }
        }

        const fetchExistingChecklist = async () => {
            if (!patientData?.uhid || !loc) return;
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/V1/ipd/admission/listAdmissionEntry?location=${loc}&uhid=${patientData.uhid}&title=${pageTitle}`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                const result = await response.json();

                if (response.ok && result.data) {
                    const existing = result.data;
                    setFormData({
                        admissionDateTime: existing.admission_tracking?.admission_date
                            ? `${existing.admission_tracking.admission_date} ${existing.admission_tracking.admission_time}`
                            : '',
                        consentTaken: existing.admission_tracking?.general_consent_taken ? ['Yes'] : [],
                        roomCategory: getRoomCategoryArray(existing.room_allotment?.category),
                        amenities: extractAmenities(existing.basic_amenities_on_admission),
                        admissionTakenBy: existing.staff_verification?.admission_taken_by_name || '',
                        staffSignature: existing.staff_verification?.signature || '',
                        staffActionDateTime: existing.staff_verification?.date_time || ''
                    });
                }
            } catch (error) {
                console.error("Error fetching checklist:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExistingChecklist();
    }, [patientData?.uhid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isSelected = (arr, val) => arr.some(item => item.toLowerCase() === val.toLowerCase().replace(/_/g, ' '));

    // Add this function after isSelected
    const isFormComplete = () => {
        // Check all required fields
        const requiredFields = [
            formData.admissionDateTime,
            formData.consentTaken.length > 0,
            formData.roomCategory.length > 0,
            formData.admissionTakenBy,
            formData.staffActionDateTime
        ];

        return requiredFields.every(field => field);
    };

    const handleCheckboxChange = (name, optionValue, currentValues) => {
        let newValue = currentValues.includes(optionValue)
            ? currentValues.filter(v => v !== optionValue)
            : [...currentValues, optionValue];
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalPayload = {
            "admission-checklist": {
                "hospital_info": { "name": "HEALING HANDS CLINIC", "uhid": patientData?.uhid || "" },
                "admission_tracking": {
                    "admission_date": formData.admissionDateTime ? formData.admissionDateTime.split(' ')[0] : null,
                    "admission_time": formData.admissionDateTime ? formData.admissionDateTime.split(' ')[1] : null,
                    "general_consent_taken": formData.consentTaken.includes('Yes')
                },
                "room_allotment": {
                    "category": {
                        "general": formData.roomCategory.includes('General'),
                        "semi_private": formData.roomCategory.includes('Semi-Private'),
                        "private": formData.roomCategory.includes('Private'),
                        "deluxe": formData.roomCategory.includes('Deluxe'),
                        "super_deluxe": formData.roomCategory.includes('Super-Deluxe'),
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
                    "admission_taken_by_name": formData.admissionTakenBy,
                    "signature": formData.staffSignature,
                    "date_time": formData.staffActionDateTime
                },
                "document_control": { "form_code": "AAC-F-2.2-00", "page_number": 5, "status": "CONTROL DOCUMENT" }
            }
        };

        try {
            console.log("final payload:", finalPayload);
            Swal.fire({ title: 'Saving...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
            const response = await fetch(`${BASE_URL}/V1/ipd/admission/insertAdmission`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ title: pageTitle, location: currentLocation, patient_id: patientData.uhid, admissionData: finalPayload })
            });

            if (response.ok) {
                Swal.fire({ icon: "success", title: "Saved!", timer: 2000, showConfirmButton: false });
                if (onSubmit) onSubmit();
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const generatePrintContent = () => {
        // Access local state variables directly
        const dateTimeParts = formData?.admissionDateTime ? formData.admissionDateTime.split(' ') : ['', ''];
        const admissionDate = dateTimeParts[0] || '________________';
        const admissionTime = dateTimeParts[1] || '________________';

        const isChecked = (category, value) => {
            // Add safety check ?. to prevent "is undefined" errors
            return formData?.[category]?.includes(value) ? 'checked' : '';
        };

        const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ADMISSION CHECK LIST</title>
        <style>
            @page { margin: 5mm; }
             body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #333; }
            .outer-border { border: 3px solid #00a99d; padding: 5px 25px; display: flex; flex-direction: column; min-height: 80vh; }
            .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px; }
            .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
            .logo-area { display: flex; align-items: center; }
            .logo-img { height: 65px; width: auto; margin-top:10px }           
            .patient-info-block { position: absolute; right: 25px; color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
            .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
            .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 30px 0; }
            .row { display: flex; align-items: baseline; margin-bottom: 15px; font-size: 14px; font-weight:bold; }
            .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; height: 1.1em; text-align: center; font-weight: normal; padding: 4px 10px; min-width: 50px; }
            .cb-item { display: flex; align-items: center; margin-bottom: 6px; font-size: 14px; }
            .box { width: 18px; height: 18px; border: 1px solid #cbd5e0; border-radius: 4px; margin-top: 5px; margin-right: 5px; position: relative; flex-shrink: 0; background-color: #fff; }
            .box.checked { background-color: #00bcd4; border-color: #00bcd4; }
            .box.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); color: #333; font-weight: bold; font-size: 14px; }
            .amenities-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; margin-left: 30px; gap: 5px 2px; }
            .section-title { margin-bottom: 5px; margin-top: 5px; font-size: 14px; font-weight:bold; }
            .indent { margin-left: 30px; }
            .footer { margin-top: 10px; padding-top: 20px; }
            .sig-flex { display: flex; justify-content: space-between; margin-top: 20px; }
            .line-solid { border-bottom: 1px solid #333; width: 225px; display: inline-block; height: 1.1em; text-align: center; padding: 4px 10px;  }
            .line-long { border-bottom: 1px solid #333; flex: 1; margin-left: 10px; height: 1.1em; text-align: left; padding-left: 10px; padding: 4px 10px; }
            @media print { .no-print { display: none; } outer-border { height: 90vh; }}
        </style>
    </head>
    <body>
        <div class="form-type">Form 2 - Front</div>
        <div class="outer-border">
            <div class="header-flex">
                <div class="logo-area">
                    <img src="${window.location.origin}${hhcLogo}" class="logo-img" alt="HHC Logo">
                </div>
                <div class="patient-info-block">
                    <div><span class="label-teal">Name:</span>${patientData?.name || ''}</div>
                    <div><span class="label-teal">Age/Gender:</span>${patientData?.age || ''} / ${patientData?.gender || ''}</div>
                    <div><span class="label-teal">UHID:</span>${patientData?.uhid || ''}</div>
                    <div><span class="label-teal">I/P:</span>${patientData?.ipNo || ''}</div>
                    <div><span class="label-teal">DOA:</span>${formData?.admissionDateTime || ''}</div>
                    <div><span class="label-teal">Contact No:</span>${patientData?.contact || ''}</div>
                </div>
            </div>
            
            <div class="main-title">ADMISSION CHECK LIST</div>
            
            <div class="row">
                1] Admission Date: <div class="dotted-line">${admissionDate}</div> 
                Admission Time: <div class="dotted-line">${admissionTime}</div>
            </div>
            
            <div class="row">
                2] General consent of admission taken: 
                <div class="box ${formData?.consentTaken.includes('Yes') ? 'checked' : ''}" style="margin-left:5px; margin-top:10px;"></div>
            </div>

            <div class="section-title">3] Allotment of room as per category-</div>
            <div class="indent">
                <div class="cb-item"><div class="box ${isChecked('roomCategory', 'General')}"></div> General</div>
                <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Semi-Private')}"></div> Semi-Private</div>
                <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Private')}"></div> Private</div>
                <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Deluxe')}"></div> Deluxe</div>
                <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Super Deluxe')}"></div> Super Deluxe</div>
                <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Suite')}"></div> Suite</div>
            </div>

            <div class="row" style="margin-top:20px"><span>4] Basic amenities given (as per room):</span><span style="margin-left: 5px">Admission</span></div>

            <div class="amenities-grid">
                ${['Paper napkins', 'Soap', 'Room orientation', 'Water mug with glass', 'Pillow cover & bed sheet', '', 'Dress of patient', 'T.V with remote', '', 'A.C. with remote', 'Geyser in condition', '', 'Mug, bucket & dustbin', 'Spoons', '', 'Plates', 'Dental kit', '', 'Cup and bowls', 'Trey & kettles', '', 'Tissue paper & stands', 'Dish TV with remote', '', 'Slippers', 'Door mats', '', 'Call bell', 'Wifi password'].map(item =>
            item === '' ? '<div></div>' : `<div class="cb-item"><div class="box ${isChecked('amenities', item)}"></div> ${item}</div>`
        ).join('')}
            </div>

            <div class="footer" style=" margin-bottom:20px">
    <div class="row"><span style="font-weight: bold;">Admission taken by (Full Name):</span><div class="line-long" style="font-weight: normal; text-align: center;">${formData?.admissionTakenBy || ''}</div></div>
    <div class="sig-flex">
        <div style="font-size:14px"><span style="font-weight: bold;">Signature:</span> <div class="line-solid" style="font-weight: normal;">${formData?.staffSignature || ''}</div></div>
        <div style="font-size:14px"><span style="font-weight: bold;">Date & Time:</span> <div class="line-solid" style="font-weight: normal;">${formData?.staffActionDateTime || ''}</div></div>
    </div>
</div>
        </div>
        <div class="no-print" style="text-align:center; padding: 20px;">
            <button onclick="window.print()" style="padding: 10px 40px; background:#008080; color:white; border:none; border-radius:5px; cursor:pointer;">Print Form</button>
        </div>
    </body>
    </html>
    `;

        const blob = new Blob(['\ufeff' + htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, 'PrintChecklist', `width=800,height=900,scrollbars=yes`);
        if (printWindow) printWindow.onload = () => URL.revokeObjectURL(url);
    };

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="medical-form-container">
                    <form onSubmit={handleSubmit}>
                        <h2 className="form-title">ADMISSION CHECKLIST</h2>

                        {/* Patient Header - Using shared CSS classes */}
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
                                    <span className="info-label">Age/Sex</span>
                                    <span className="info-value">{patientData.age}/{patientData.gender}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">IP No</span>
                                    <span className="info-value">{patientData.ipNo}</span>
                                </div>
                            </div>
                        )}

                        {/* Verification Section */}
                        <div className="section-box">
                            <div className="form-section-title">Admission Verification</div>
                            <div className="two-col">
                                <div className="form-field">
                                    <label className="field-label">Admission Date & Time <span className="required">*</span></label>
                                    <DateTimePicker
                                        value={formData.admissionDateTime ? dayjs(formData.admissionDateTime, 'DD-MM-YYYY HH:mm') : null}
                                        format="DD-MM-YYYY HH:mm"
                                        onChange={(newValue) => setFormData(prev => ({ ...prev, admissionDateTime: newValue ? newValue.format('DD-MM-YYYY HH:mm') : '' }))}
                                        slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">General Consent for Admission <span className="required">*</span></label>
                                    <div className="checkbox-group">
                                        <label className={`checkbox-option ${formData.consentTaken.includes('Yes') ? 'selected' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={formData.consentTaken.includes('Yes')}
                                                onChange={() => handleCheckboxChange('consentTaken', 'Yes', formData.consentTaken)}
                                                required
                                            />
                                            <span>Consent Obtained</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Allotment Section */}
                        <div className="section-box">
                            <div className="form-section-title">Allotment of Room Category</div>
                            <div className="checkbox-group">
                                {['General', 'Semi-Private', 'Private', 'Deluxe', 'Super Deluxe', 'Suite'].map(option => (
                                    <label key={option} className={`checkbox-option ${formData.roomCategory.includes(option) ? 'selected' : ''}`}>
                                        <input 
                                            type="checkbox"
                                            checked={formData.roomCategory.includes(option)}
                                            onChange={() => handleCheckboxChange('roomCategory', option, formData.roomCategory)} 
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Amenities Section - Using Medical History Grid for better spacing */}
                        <div className="section-box">
                            <div className="form-section-title">Basic Amenities Given</div>
                            <div className="medical-history-grid">
                                {['Paper napkins', 'Soap', 'Water mug with glass', 'Pillow cover & bed sheet', 'Dress of patient', 'T.V with remote', 'A.C. with remote', 'Geyser in condition', 'Mug, bucket & dustbin', 'Spoons', 'Plates', 'Dental kit', 'Cup and bowls', 'Trey & kettles', 'Tissue paper & stands', 'Dish TV with remote', 'Slippers', 'Door mats', 'Call bell', 'Wifi password', 'Room orientation'].map(option => (
                                    <label key={option} className={`checkbox-option ${formData.amenities.includes(option) ? 'selected' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.amenities.includes(option)} 
                                            onChange={() => handleCheckboxChange('amenities', option, formData.amenities)} 
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Sign-off Section */}
                        <div className="section-box">
                            <div className="form-section-title">Staff Acknowledgement</div>
                            <div className="three-col">
                                <div className="form-field">
                                    <label className="field-label">Admission Taken By <span className="required">*</span></label>
                                    <input 
                                        type="text" 
                                        name="admissionTakenBy" 
                                        className="form-control" 
                                        value={formData.admissionTakenBy} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Signature / ID</label>
                                    <input 
                                        type="text" 
                                        name="staffSignature" 
                                        className="form-control" 
                                        value={formData.staffSignature} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="field-label">Date & Time <span className="required">*</span></label>
                                    <DateTimePicker
                                        value={formData.staffActionDateTime ? dayjs(formData.staffActionDateTime, 'DD-MM-YYYY HH:mm') : null}
                                        format="DD-MM-YYYY HH:mm"
                                        onChange={(newValue) => setFormData(prev => ({ ...prev, staffActionDateTime: newValue ? newValue.format('DD-MM-YYYY HH:mm') : '' }))}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="two-col" style={{ marginTop: '1rem' }}>
                            <button type="submit" className="submit-btn" style={{ margin: 0, width: '100%' }}>
                                Save / Update Data
                            </button>
                            <button
                                type="button"
                                className="submit-btn"
                                style={{
                                    margin: 0,
                                    width: '100%',
                                    backgroundColor: isFormComplete() ? '#10b981' : '#cbd5e1', 
                                    cursor: isFormComplete() ? 'pointer' : 'not-allowed'
                                }}
                                onClick={generatePrintContent}
                                disabled={!isFormComplete()}
                            >
                                Print Form
                            </button>
                        </div>
                    </form>
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default AdmissionChecklist;