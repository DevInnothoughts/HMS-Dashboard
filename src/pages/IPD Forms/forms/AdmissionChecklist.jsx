import React, { useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './Forms.css';
import { decodeJwt } from '../../../utils/decode-jwt';
import Swal from "sweetalert2"
import hhcLogo from '../../../assets/images/logo/hhclogo.webp';

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
        amenities: [],
        admissionTakenBy: '', // New field
        staffSignature: '',   // New field
        staffActionDateTime: ''
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
                    "admission_taken_by_name": formData.admissionTakenBy,
                    "signature": formData.staffSignature,
                    "verification_date_time": formData.staffActionDateTime
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

    //     const generatePrintContent = (formData, patientData) => {
    //         // Helper to check if an item is in the array
    //         const dateTimeParts = formData?.admissionDateTime ? formData.admissionDateTime.split(' ') : ['', ''];
    //         const admissionDate = dateTimeParts[0] || '________________';
    //         const admissionTime = dateTimeParts[1] || '________________';

    //         const isChecked = (category, value) => {
    //             return formData?.[category]?.includes(value) ? 'checked' : '';
    //         };

    //         const htmlContent = `
    //         <!DOCTYPE html>
    //         <html>
    //         <head>
    //             <title>ADMISSION CHECK LIST</title>
    //             <style>
    //                 @page { margin: 5mm; }
    //                 body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #333; }

    //                 .outer-border { 
    //                     border: 2px solid #00a99d; 
    //                     padding: 25px; 
    //                     display: flex; 
    //                     flex-direction: column;
    //                 }

    //                 .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px; }

    //                 .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
    // .logo-area { display: flex; align-items: center; }
    //             .logo-img { 
    //                 height: 60px; /* Adjusted size since it now contains the brand name */
    //                 width: auto; 
    //             }           
    //                 .brand-text { 
    //                     color: #008080; 
    //                     font-weight: bold; 
    //                     font-size: 22px; 
    //                     line-height: 1; 
    //                     border-bottom: 2px solid #008080; 
    //                     padding-bottom: 2px;
    //                 }
    //                 .brand-text small { letter-spacing: 4px; font-size: 11px; display: block; margin-top: 3px; }

    // .patient-info-block { 
    //     color: #333; /* Data color: Black/Dark Grey */
    //     font-weight: bold; 
    //     font-size: 11px;
    //     text-align: right; 
    //     line-height: 1.4;
    // }

    // .label-teal { 
    //     color: #008080; /* Label color: Teal */
    //     font-weight: bold;
    //     margin-right: 4px;
    // }

    //                 .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 25px 0; }

    //                 .row { display: flex; align-items: baseline; margin-bottom: 15px; font-size: 14px; font-weight:bold; }
    //                 .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; height: 1.1em; }

    //                 .cb-item { display: flex; align-items: center; margin-bottom: 6px; font-size: 14px; }

    //                .box { 
    //                     width: 18px; 
    //                     height: 18px; 
    //                     border: 1px solid #cbd5e0; 
    //                     border-radius: 4px; /* Rounded corners like the image */
    //                     margin-right: 10px; 
    //                     position: relative; 
    //                     flex-shrink: 0; 
    //                     background-color: #fff;
    //                     -webkit-print-color-adjust: exact; /* Ensures color prints */
    //                 }
    //                 .box.checked {
    //                     background-color: #00bcd4; /* The teal color from your UI */
    //                     border-color: #00bcd4;
    //                 }
    //                     .box.checked::after { 
    //                     content: '✓'; 
    //                     position: absolute; 
    //                     top: 50%;
    //                     left: 50%;
    //                     transform: translate(-50%, -55%); /* Centers the tick */
    //                     color: #333; /* Darker tick color like the image */
    //                     font-weight: bold; 
    //                     font-size: 14px; 
    //                 }

    //                 .amenities-grid { 
    //                     display: grid; 
    //                     grid-template-columns: 1fr 1fr 1fr; 
    //                     margin-left: 20px; 
    //                     gap: 5px 15px; 
    //                 }

    //                 .section-title { margin-bottom: 5px; margin-top: 5px; font-size: 14px; font-weight:bold; }
    //                 .indent { margin-left: 30px; }

    //                 .footer { margin-top: 10px; padding-top: 20px; }
    //                 .sig-flex { display: flex; justify-content: space-between; margin-top: 20px; }
    //                 .line-solid { border-bottom: 1px solid #333; width: 240px; display: inline-block; height: 1.1em; }
    //                 .line-long { border-bottom: 1px solid #333; flex: 1; margin-left: 10px; height: 1.1em; }


    //                 .admission-row {
    //         display: flex;
    //         align-items: baseline;
    //         margin-bottom: 20px;
    //         font-size: 14px;
    //          font-weight:bold;
    //     }
    //                 @media print { 
    //                     .no-print { display: none; } 
    //                     .outer-border { height: 84vh; }
    //                 }
    //             </style>
    //         </head>
    //         <body>
    //         <div class="form-type">Form 2 - Front</div>
    //             <div class="outer-border">
    //                 <div class="header-flex">
    //     <div class="logo-area">
    //         <img src="${window.location.origin}${hhcLogo}" class="logo-img" alt="HHC Logo">
    //         </div>
    //  <div class="patient-info-block">
    //     <div><span class="label-teal">Name:</span> ${patientData?.name || '________________'}</div>
    //     <div><span class="label-teal">Age/Gender:</span> ${patientData?.age || '___'} / ${patientData?.gender || '___'}</div>
    //     <div><span class="label-teal">UHID:</span> ${patientData?.uhid || '________________'}</div>
    //     <div><span class="label-teal">I/P No:</span> ${patientData?.ipNo || '________________'}</div>
    //     <div><span class="label-teal">DOA:</span> ${formData?.admissionDateTime || '________________'}</div>
    //     <div><span class="label-teal">Contact No:</span> ${patientData?.contact || '________________'}</div>
    // </div>
    // </div>
    //                 <div class="main-title">ADMISSION CHECK LIST</div>
    //                 <div class="row">1] Admission Date: <div class="dotted-line"></div> Admission Time: <div class="dotted-line"></div></div>
    //                 <div class="row">2] General consent of admission taken: <div class="box ${formData?.consentTaken ? 'checked' : ''}" style="margin-left:5px;"></div></div>

    //                 <div class="section-title">3] Allotment of room as per category-</div>
    //                 <div class="indent">
    //                     <div class="cb-item"><div class="box ${isChecked('roomCategory', 'General')}"></div> General</div>
    //                     <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Semi-Private')}"></div> Semi-Private</div>
    //                     <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Private')}"></div> Private</div>
    //                     <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Deluxe')}"></div> Deluxe</div>
    //                     <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Super Deluxe')}"></div> Super Deluxe</div>
    //                     <div class="cb-item"><div class="box ${isChecked('roomCategory', 'Suite')}"></div> Suite</div>
    //                 </div>

    //                 <div class="row" style="margin-top:20px"><span>4] Basic amenities given (as per room):</span><span style="margin-left: 5px", margin-bottom:5px;>Admission</span></div>

    //                 <div class="amenities-grid">
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Paper napkins')}"></div> Paper napkins</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Soap')}"></div> Soap</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Room orientation')}"></div> Room orientation</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Water mug with glass')}"></div> Water mug with glass</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Pillow cover & bed sheet')}"></div> Pillow cover & bed sheet</div>
    //                     <div></div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Dress of patient')}"></div> Dress of patient</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'T.V with remote')}"></div> T.V with remote</div>
    //                     <div></div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'A.C. with remote')}"></div> A.C. with remote</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Geyser in condition')}"></div> Geyser in condition</div>
    //                     <div></div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Mug, bucket & dustbin')}"></div> Mug, bucket & dustbin</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Spoons')}"></div> Spoons</div>
    //                     <div></div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Plates')}"></div> Plates</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Dental kit')}"></div> Dental kit</div>
    //                     <div></div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Cup and bowls')}"></div> Cup and bowls</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Trey & kettles')}"></div> Trey & kettles</div>
    //                     <div></div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Tissue paper & stands')}"></div> Tissue paper & stands</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Dish TV with remote')}"></div> Dish TV with remote</div>
    //                     <div></div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Slippers')}"></div> Slippers</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Door mats')}"></div> Door mats</div>
    //                     <div></div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Call bell')}"></div> Call bell</div>
    //                     <div class="cb-item"><div class="box ${isChecked('amenities', 'Wifi password')}"></div> Wifi password</div>
    //                 </div>

    //                 <div class="footer">
    //                     <div class="row">Admission taken by (Full Name):<div class="line-long"></div></div>
    //                     <div class="sig-flex">
    //                         <div style="font-weight:bold; font-size:14px">Signature: <div class="line-solid"></div></div>
    //                         <div style="font-weight:bold; font-size:14px">Date & Time: <div class="line-solid"></div></div>
    //                     </div>
    //                 </div>
    //             </div>
    //             <div class="no-print" style="text-align:center; padding: 20px;">
    //                 <button onclick="window.print()" style="padding: 10px 40px; background:#008080; color:white; border:none; border-radius:5px; cursor:pointer;">Print Form</button>
    //             </div>
    //         </body>
    //         </html>
    //     `;

    //         // const blob = new Blob([htmlContent], { type: 'text/html' });
    //         const blob = new Blob(['\ufeff' + htmlContent], { type: 'text/html;charset=utf-8' });
    //         const url = URL.createObjectURL(blob);
    //         const width = 800;
    //         const height = 900;
    //         const left = (window.screen.width / 2) - (width / 2);
    //         const top = (window.screen.height / 2) - (height / 2);
    //         const printWindow = window.open(
    //             url,
    //             'PrintChecklist',
    //             `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    //         );

    //         if (printWindow) {
    //             printWindow.onload = () => URL.revokeObjectURL(url);
    //         }
    //     };

    const generatePrintContent = (formData, patientData) => {
        const dateTimeParts = formData?.admissionDateTime ? formData.admissionDateTime.split(' ') : ['', ''];
        const admissionDate = dateTimeParts[0] || '________________';
        const admissionTime = dateTimeParts[1] || '________________';

        const isChecked = (category, value) => {
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
            .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 5px 0 30px 0; }
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
            .line-solid { border-bottom: 1px solid #333; width: 225px; display: inline-block; height: 1.1em; text-align: center; padding: 4px 10px; }
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
                <div class="box ${formData?.consentTaken.includes('Yes') ? 'checked' : ''}" style="margin-left:5px;"></div>
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

            <div class="footer">
    <div class="row"><span style="font-weight: bold;">Admission taken by (Full Name):</span><div class="line-long" style="font-weight: normal;">${formData?.admissionTakenBy || ''}</div></div>
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
                    <div className="form-field" style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
                        <label className="field-label" style={{ marginBottom: 0 }}>
                            Admission Date & Time <span style={{ color: '#e74c3c' }}>*</span>
                        </label>
                        <DateTimePicker
                            value={formData.admissionDateTime ? dayjs(formData.admissionDateTime, ['DD-MM-YYYY HH:mm', 'YYYY-MM-DDTHH:mm:ss.SSSZ']) : null}
                            style={{ border: "2px solid rgb(77, 208, 225)" }}
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
                    <div className="form-field mb-10" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label className="field-label" style={{ marginBottom: 0 }}>
                            General Consent for Admission <span className="required">*</span>
                        </label>
                        <div className="checkbox-group" style={{ display: 'inline-block' }}>
                            <label className="checkbox-option" style={{ margin: 0 }}>
                                <input
                                    type="checkbox"
                                    name="consentTaken"
                                    value="Yes"
                                    checked={formData.consentTaken.includes('Yes')}
                                    onChange={() => handleCheckboxChange('consentTaken', 'Yes', formData.consentTaken)}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Room Category */}
                    <div className="form-field mb-20">
                        <label className="field-label">
                            Allotment of room as per category <span className="required">*</span>
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
                    <div className="form-field mb-20">
                        <label className="field-label">
                            Basic amenities given (as per room)
                        </label>
                        <div className="checkbox-group">
                            {[
                                'Paper napkins',
                                'Soap',
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

                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginTop: '10px',
                        alignItems: 'flex-end', // Ensures inputs and picker align at the bottom
                        marginBottom: '20px'
                    }}>
                        {/* Column 1: Admission Taken By */}
                        <div style={{ flex: '1' }}>
                            <label className="field-label" style={{ marginBottom: '8px', display: 'block' }}>
                                Admission taken by:
                            </label>
                            <input
                                type="text"
                                name="admissionTakenBy"
                                className="form-input"
                                style={{
                                    width: '100%',
                                    padding: '8.5px 12px',
                                    borderRadius: '6px',
                                    border: '2px solid #e1e8ed',
                                    fontSize: '0.85rem'
                                }}
                                value={formData.admissionTakenBy || ''}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Column 2: Signature */}
                        <div style={{ flex: '1' }}>
                            <label className="field-label" style={{ marginBottom: '8px', display: 'block' }}>
                                Signature:
                            </label>
                            <input
                                type="text"
                                // name="signature"
                                name="staffSignature"
                                className="form-input"
                                style={{
                                    width: '100%',
                                    padding: '8.5px 12px',
                                    borderRadius: '6px',
                                    border: '2px solid #e1e8ed',
                                    fontSize: '0.85rem'
                                }}
                                // value={formData.signature || ''}
                                value={formData.staffSignature || ''}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Column 3: Date & Time Picker */}
                        <div style={{ flex: '1' }}>
                            <label className="field-label" style={{ marginBottom: '8px', display: 'block' }}>
                                Date & Time:
                            </label>
                            <DateTimePicker
                                value={formData.staffActionDateTime ? dayjs(formData.staffActionDateTime, 'DD-MM-YYYY HH:mm') : null}
                                format="DD-MM-YYYY HH:mm"
                                onChange={(newValue) => {
                                    let formattedValue = newValue && newValue.isValid() ? newValue.format('DD-MM-YYYY HH:mm') : '';
                                    setFormData(prev => ({ ...prev, staffActionDateTime: formattedValue }));
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: 'outlined',
                                        size: 'small',
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '6px',
                                                backgroundColor: '#ffffff',
                                                '& fieldset': { borderWidth: '2px', borderColor: '#e1e8ed' },
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    {/* <button type="submit" className="submit-btn">
                        Complete Admission Checklist
                    </button>
                    <button
                        type="button"
                        className="submit-btn"
                        style={{ marginTop: '10px', backgroundColor: '#008080' }} 
                        onClick={() => generatePrintContent(formData, patientData)}
                        disabled={!isFormComplete()}
                    >
                        Print Checklist
                    </button> */}
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginTop: '20px',
                        width: '100%'
                    }}>
                        <button
                            type="submit"
                            className="submit-btn"
                            style={{ flex: 1, marginTop: 0 }}
                        >
                            Complete Admission Checklist
                        </button>

                        <button
                            type="button"
                            className="submit-btn"
                            style={{
                                flex: 1,
                                marginTop: 0,
                                backgroundColor: isFormComplete() ? '#008080' : '#cccccc',
                                cursor: isFormComplete() ? 'pointer' : 'not-allowed',
                                border: 'none'
                            }}
                            onClick={() => generatePrintContent(formData, patientData)}
                            disabled={!isFormComplete()}
                        >
                            Print Checklist
                        </button>
                    </div>
                </form>
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default AdmissionChecklist;
