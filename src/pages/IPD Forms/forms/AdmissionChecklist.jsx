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
const BASE_URL = "http://194.195.117.79:5100/api";

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
        const dateTimeParts = formData?.admissionDateTime ? formData.admissionDateTime.split(' ') : ['', ''];
        const admissionDate = dateTimeParts[0] || '________________';
        const admissionTime = dateTimeParts[1] || '________________';
        const isChecked = (category, value) => formData?.[category]?.includes(value) ? 'checked' : '';

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ADMISSION CHECK LIST</title>
            <style>
                @page { margin: 5mm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #333; }
                .outer-border { border: 3px solid #00a99d; padding: 15px 25px; display: flex; flex-direction: column; min-height: 90vh; position: relative; }
                .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px; }
                .header-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .logo-img { height: 65px; width: auto; }           
                .patient-info-block { color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
                .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
                .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0; }
                .row { display: flex; align-items: baseline; margin-bottom: 15px; font-size: 14px; font-weight:bold; }
                .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; height: 1.1em; text-align: center; }
                .cb-item { display: flex; align-items: center; margin-bottom: 6px; font-size: 14px; }
                .box { width: 18px; height: 18px; border: 1px solid #cbd5e0; border-radius: 4px; margin-right: 8px; background-color: #fff; position: relative; }
                .box.checked { background-color: #00bcd4; border-color: #00bcd4; }
                .box.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); color: white; font-weight: bold; }
                .amenities-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px 15px; margin-top: 10px; }
                .footer { margin-top: auto; padding-top: 20px; }
                .line-solid { border-bottom: 1px solid #333; width: 200px; display: inline-block; height: 1.1em; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="form-type">Form 2 - Front</div>
            <div class="outer-border">
                <div class="header-flex">
                    <img src="${window.location.origin}${hhcLogo}" class="logo-img">
                    <div class="patient-info-block">
                        <div><span class="label-teal">Name:</span>${patientData?.name || ''}</div>
                        <div><span class="label-teal">UHID:</span>${patientData?.uhid || ''}</div>
                        <div><span class="label-teal">DOA:</span>${formData?.admissionDateTime || ''}</div>
                    </div>
                </div>
                <div class="main-title">ADMISSION CHECK LIST</div>
                <div class="row">1] Date: <div class="dotted-line">${admissionDate}</div> Time: <div class="dotted-line">${admissionTime}</div></div>
                <div class="row">2] Consent taken: <div class="box ${formData.consentTaken.includes('Yes') ? 'checked' : ''}" style="margin-left:10px"></div></div>
                <div style="font-weight:bold; margin: 10px 0;">3] Room Category:</div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; margin-left:20px;">
                    ${['General', 'Semi-Private', 'Private', 'Deluxe', 'Super Deluxe', 'Suite'].map(cat => `
                        <div class="cb-item"><div class="box ${isChecked('roomCategory', cat)}"></div> ${cat}</div>
                    `).join('')}
                </div>
                <div style="font-weight:bold; margin-top:20px;">4] Amenities:</div>
                <div class="amenities-grid">
                    ${['Paper napkins', 'Soap', 'Room orientation', 'Water mug with glass', 'Pillow cover & bed sheet', 'Dress of patient', 'T.V with remote', 'A.C. with remote', 'Geyser in condition', 'Mug, bucket & dustbin', 'Spoons', 'Plates', 'Dental kit', 'Cup and bowls', 'Trey & kettles', 'Tissue paper & stands', 'Dish TV with remote', 'Slippers', 'Door mats', 'Call bell', 'Wifi password'].map(item => `
                        <div class="cb-item"><div class="box ${isChecked('amenities', item)}"></div> ${item}</div>
                    `).join('')}
                </div>
                <div class="footer">
                    <div class="row">Admission by: <div class="dotted-line" style="flex:2">${formData.admissionTakenBy}</div></div>
                    <div style="display:flex; justify-content: space-between;">
                        <div>Signature: <div class="line-solid"></div></div>
                        <div>Date/Time: <div class="line-solid">${formData.staffActionDateTime}</div></div>
                    </div>
                </div>
            </div>
            <div class="no-print" style="text-align:center; padding:20px;"><button onclick="window.print()">Print Now</button></div>
        </body>
        </html>`;

        const blob = new Blob(['\ufeff' + htmlContent], { type: 'text/html;charset=utf-8' });
        window.open(URL.createObjectURL(blob), '_blank', 'width=800,height=900');
    };

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <form onSubmit={handleSubmit} className="medical-form compact-form">
                    <h2 className="form-title" style={{ textAlign: 'center', marginBottom: '30px', color: '#008080', borderBottom: '2px solid #80deea', paddingBottom: '10px' }}>
                        ADMISSION CHECKLIST
                    </h2>

                    {patientData && (
                        <div className="patient-compact-header">
                            <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{patientData.uhid}</span></div>
                            <div className="info-item"><span className="info-label">Name</span><span className="info-value">{patientData.name}</span></div>
                            <div className="info-item"><span className="info-label">Age/Sex</span><span className="info-value">{patientData.age}/{patientData.gender}</span></div>
                            <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{patientData.ipNo}</span></div>
                        </div>
                    )}

                    <div className="form-field" style={{ marginBottom: '15px' }}>
                        <label className="field-label">Admission Date & Time <span style={{ color: '#e74c3c' }}>*</span></label>
                        <DateTimePicker
                            value={formData.admissionDateTime ? dayjs(formData.admissionDateTime, 'DD-MM-YYYY HH:mm') : null}
                            format="DD-MM-YYYY HH:mm"
                            onChange={(newValue) => setFormData(prev => ({ ...prev, admissionDateTime: newValue ? newValue.format('DD-MM-YYYY HH:mm') : '' }))}
                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                    </div>

                    <div className="form-field mb-10" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label className="field-label" style={{ marginBottom: 0 }}>General Consent for Admission *</label>
                        <input type="checkbox" checked={formData.consentTaken.includes('Yes')} onChange={() => handleCheckboxChange('consentTaken', 'Yes', formData.consentTaken)} />
                    </div>

                    <div className="form-field mb-20">
                        <label className="field-label">Allotment of room category *</label>
                        <div className="checkbox-group">
                            {['General', 'Semi-Private', 'Private', 'Deluxe', 'Super Deluxe', 'Suite'].map(option => (
                                <label key={option} className="checkbox-option">
                                    <input type="checkbox" checked={formData.roomCategory.includes(option)} onChange={() => handleCheckboxChange('roomCategory', option, formData.roomCategory)} />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-field mb-20">
                        <label className="field-label">Basic amenities given</label>
                        <div className="checkbox-group">
                            {['Paper napkins', 'Soap', 'Water mug with glass', 'Pillow cover & bed sheet', 'Dress of patient', 'T.V with remote', 'A.C. with remote', 'Geyser in condition', 'Mug, bucket & dustbin', 'Spoons', 'Plates', 'Dental kit', 'Cup and bowls', 'Trey & kettles', 'Tissue paper & stands', 'Dish TV with remote', 'Slippers', 'Door mats', 'Call bell', 'Wifi password', 'Room orientation'].map(option => (
                                <label key={option} className="checkbox-option">
                                    <input type="checkbox" checked={formData.amenities.includes(option)} onChange={() => handleCheckboxChange('amenities', option, formData.amenities)} />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ flex: '1' }}>
                            <label className="field-label">Admission taken by:</label>
                            <input type="text" name="admissionTakenBy" className="form-input" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={formData.admissionTakenBy} onChange={handleChange} />
                        </div>
                        <div style={{ flex: '1' }}>
                            <label className="field-label">Signature:</label>
                            <input type="text" name="staffSignature" className="form-input" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} value={formData.staffSignature} onChange={handleChange} />
                        </div>
                        <div style={{ flex: '1' }}>
                            <label className="field-label">Date & Time:</label>
                            <DateTimePicker
                                value={formData.staffActionDateTime ? dayjs(formData.staffActionDateTime, 'DD-MM-YYYY HH:mm') : null}
                                format="DD-MM-YYYY HH:mm"
                                onChange={(newValue) => setFormData(prev => ({ ...prev, staffActionDateTime: newValue ? newValue.format('DD-MM-YYYY HH:mm') : '' }))}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="submit" className="submit-btn" style={{ flex: 1 }}>Save / Update Data</button>
                        <button type="button" className="submit-btn" style={{ flex: 1, backgroundColor: '#008080' }} onClick={generatePrintContent}>Print Form</button>
                    </div>
                </form>
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default AdmissionChecklist;