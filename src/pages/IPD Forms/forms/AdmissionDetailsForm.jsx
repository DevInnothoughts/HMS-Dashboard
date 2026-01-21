import React, { useState, useEffect } from 'react';
import TextInput from '../inputs/TextInput';
import DateInput from '../inputs/DateInput';
import SelectInput from '../inputs/SelectInput';
import RadioGroup from '../inputs/RadioGroup';
import FileInput from '../inputs/FileInput';
import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
import './Forms.css';
import { decodeJwt } from '../../../utils/decode-jwt';
import Swal from "sweetalert2";

const BASE_URL = "http://194.195.117.79:5100/api";


// admissionJSON = {
//     "admission_details": {
//       "admission_date": null,
//       "admission_time": null,
//       "surgery_procedure_date": null,
//       "provisional_diagnosis": "",
//       "final_diagnosis": "",
//       "plan": "",
//       "allergies": "",
//       "special_consideration": ""
//     },
//     "lab_investigations": {
//       "tests_done_outside": null,
//       "sample_collected_for_lab": null,
//       "investigation_orders": "",
//       "pre_op_imaging_orders": {
//         "status": "Pending",
//         "checked_by_rmo": false
//       }
//     },
//     "patient_status": {
//       "nbm_status": {
//         "is_nbm": false,
//         "nbm_since": null
//       },
//       "had_food_before_arrival": false
//     },
//     "billing_administration": {
//       "payment_method": {
//         "cash": false,
//         "insurance": false,
//         "reimbursement": false
//       },
//       "cash_verification": {
//         "advance_paid": false,
//         "pending": false
//       },
//       "insurance_verification": {
//         "pre_approval_received": null
//       },
//       "coordinator_details": {
//         "name_and_signature": "",
//         "date_and_time": null
//       }
//     },
//     "document_metadata": {
//       "form_code": "AAC-F-2.2-01",
//       "page_number": 1
//     }
//   }

const AdmissionDetailsForm = ({ onSubmit, patientData }) => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [formData, setFormData] = useState({
        admissionDateTime: '',
        surgeryDate: '',
        provisionalDiagnosis: '',
        finalDiagnosis: '',
        icdCoding: '',
        plan: '',
        allergies: '',
        labTests: '', 
        labReports: null,
        labStatus: '', 
        investigationOrders: '', 
        nbmStatus: '', 
        hadFoodBeforeComing: false,
        paymentMethod: '', 
        cashVerification: '', 
        insuranceVerification: '', 
        coordinatorName: '',
        coordinatorDateTime: ''
    });

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
        const { name, value, type, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (files ? files : value)
        }));
    };

    const labTestOptions = [
        { value: 'Done outside', label: 'Done outside' },
        { value: 'Not done', label: 'Not done' }
    ];

    const sampleOptions = [
        { value: 'Sample collected for lab', label: 'Sample collected' },
        { value: 'Not collected', label: 'Not collected' }
    ];

    const investigationOptions = [
        { value: 'Followed', label: 'Followed' },
        { value: 'Pending', label: 'Pending' },
        { value: 'NA', label: 'NA' }
    ];

    const nbmOptions = [
        { value: 'NBM since', label: 'NBM since' },
        { value: 'Patient had food before coming', label: 'Had food' }
    ];

    const paymentOptions = [
        { value: 'Cash', label: 'Cash' },
        { value: 'Insurance', label: 'Insurance' },
        { value: 'Reimbursement', label: 'Reimbursement' }
    ];

    const cardStyle = {
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        marginBottom: '25px',
        border: '1px solid #e0f7fa'
    };

    const sectionHeaderStyle = {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#00838f',
        marginBottom: '15px',
        borderBottom: '2px solid #80deea',
        paddingBottom: '5px'
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mapping to your required nested JSON structure
        const finalPayload = { 
            "admission-details" : {
                "admission_details": {
                    "admission_date": formData.admissionDateTime ? formData.admissionDateTime.split(' ')[0] : null,
                    "admission_time": formData.admissionDateTime ? formData.admissionDateTime.split(' ')[1] : null,
                    "surgery_procedure_date": formData.surgeryDate || null,
                    "provisional_diagnosis": formData.provisionalDiagnosis,
                    "final_diagnosis": formData.finalDiagnosis,
                    "icd_coding": formData.icdCoding,
                    "plan": formData.plan,
                    "allergies": formData.allergies
                },
                "lab_investigations": {
                    "tests_done_outside": formData.labTests === 'Done outside',
                    "sample_collected_for_lab": formData.labStatus === 'Sample collected for lab',
                    "investigation_orders": formData.investigationOrders
                },
                "patient_status": {
                    "nbm_status": {
                        "is_nbm": formData.nbmStatus === 'NBM since',
                        "status_text": formData.nbmStatus
                    },
                    "had_food_before_arrival": formData.hadFoodBeforeComing
                },
                "billing_administration": {
                    "payment_method": {
                        "cash": formData.paymentMethod === 'Cash',
                        "insurance": formData.paymentMethod === 'Insurance',
                        "reimbursement": formData.paymentMethod === 'Reimbursement'
                    },
                    "cash_verification": {
                        "advance_paid": formData.cashVerification === 'Advance paid',
                        "pending": formData.cashVerification === 'Pending'
                    },
                    "insurance_verification": {
                        "pre_approval_received": formData.insuranceVerification === 'Pre approval received'
                    },
                    "coordinator_details": {
                        "name": formData.coordinatorName,
                        "date_and_time": formData.coordinatorDateTime
                    }
                },
                "document_metadata": {
                    "form_code": "AAC-F-2.2-01",
                    "page_number": 1
                }
            }       
        };

        try {
            Swal.fire({
                title: 'Saving Admission Form...',
                didOpen: () => { Swal.showLoading(); },
                allowOutsideClick: false
            });

            const bodyPayload = {
                title: "admission-details", // Unique key for this form in the JSON column
                location: currentLocation,
                patient_id: patientData.uhid,
                admissionData: finalPayload
            };
            console.log(finalPayload);
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
                Swal.fire({
                    icon: "success",
                    title: "Saved!",
                    text: "Admission Details have been submitted successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => {
                    if (onSubmit) onSubmit(result);
                });
            } else {
                throw new Error(result.message || "Failed to save data");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            Swal.fire("Error", error.message || "Server connection failed", "error");
        }
    };

    return (
            <form onSubmit={handleSubmit} className="medical-form" style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fcfcfc', padding: '20px' }}>
                <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '15px', borderRadius: '8px', margin: '0 0 40px 0', fontSize: '1.6rem', fontWeight: 'bold' }}>
                    ADMISSION FORM
                </h2>
    
                {/* Patient Header */}
                <div className="patient-compact-header" style={{ marginBottom: '40px' }}>
                    <div className="info-item"><span className="info-label">UHID</span><span className="info-value">{formData.uhid || '—'}</span></div>
                    <div className="info-item"><span className="info-label">Patient Name</span><span className="info-value">{formData.name || '—'}</span></div>
                    <div className="info-item"><span className="info-label">Age</span><span className="info-value">{formData.age || '—'}</span></div>
                    <div className="info-item"><span className="info-label">Gender</span><span className="info-value">{formData.gender || '—'}</span></div>
                    <div className="info-item"><span className="info-label">IP No</span><span className="info-value">{formData.ipNo || '—'}</span></div>
                </div>
    
                {/* Admission Details (to be filled by RMO) */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>Admission details (to be filled by RMO)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <MuiDateTimePicker label="Admission Date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} type="date" />
                        <MuiDateTimePicker label="Admission Time" name="admissionTime" value={formData.admissionTime} onChange={handleChange} type="time" />
                    </div>
                    <MuiDateTimePicker label="Surgery/Procedure Date" name="surgeryProcedureDate" value={formData.surgeryProcedureDate} onChange={handleChange} type="date" />
                    <div style={{ marginTop: '20px' }}>
                        <TextInput label="Provisional diagnosis" name="provisionalDiagnosis" value={formData.provisionalDiagnosis} onChange={handleChange} />
                        <TextInput label="Final diagnosis" name="finalDiagnosis" value={formData.finalDiagnosis} onChange={handleChange} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <TextInput label="ICD-10 coding" name="icd10Coding" value={formData.icd10Coding} onChange={handleChange} />
                            <TextInput label="Plan" name="plan" value={formData.plan} onChange={handleChange} />
                        </div>
                        <TextInput label="Allergies if any" name="allergies" value={formData.allergies} onChange={handleChange} />
                    </div>
                </div>
    
                {/* Lab & Investigation Section */}
                <div style={cardStyle}>
                    {/* Lab Tests */}
                    <div style={{ marginBottom: '25px' }}>
                        <div style={{ fontWeight: '600', color: '#00838f', marginBottom: '10px' }}>Lab tests</div>
                        <RadioGroup name="labTests" value={formData.labTests} onChange={handleChange} options={labTestOptions} />
    
                        {formData.labTests === 'Done outside' && (
                            <div style={{ marginTop: '12px', padding: '15px', backgroundColor: '#f0faff', borderRadius: '8px', border: '1px dashed #80deea' }}>
                                <div style={{ fontSize: '0.85rem', color: '#006064', marginBottom: '8px', fontWeight: 'bold' }}>If done - Attach lab reports to file.</div>
                                <input
                                    type="file"
                                    id="labReportImport"
                                    style={{ display: 'none' }}
                                    onChange={(e) => alert('Reports imported successfully!')}
                                />
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => document.getElementById('labReportImport').click()}
                                    style={{ fontSize: '0.8rem', padding: '6px 15px' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    Import Lab Reports
                                </button>
                            </div>
                        )}
    
                        {formData.labTests === 'Not done' && (
                            <div style={{ marginTop: '12px', padding: '15px', backgroundColor: '#fff9f9', borderRadius: '8px', border: '1px dashed #ffcdd2' }}>
                                <div style={{ fontSize: '0.85rem', color: '#c62828', marginBottom: '10px', fontWeight: 'bold' }}>If not done:</div>
                                <RadioGroup name="sampleCollected" value={formData.sampleCollected} onChange={handleChange} options={sampleOptions} />
                                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#7f8c8d', fontStyle: 'italic' }}>
                                    * If not collected - RMO to give orders to nursing staff & write in progress sheet
                                </div>
                            </div>
                        )}
                    </div>
    
                    {/* Investigation Orders */}
                    <div style={{ marginBottom: '25px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                        <div style={{ fontWeight: '600', color: '#00838f', marginBottom: '10px' }}>Investigation orders - RMO to check pre op orders for imaging</div>
                        <RadioGroup name="investigationOrders" value={formData.investigationOrders} onChange={handleChange} options={investigationOptions} />
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#546e7a' }}>
                            * RMO to act - In case pending or any additional test is required.
                        </div>
                    </div>
    
                    {/* NBM Status */}
                    <div style={{ marginBottom: '25px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                        <div style={{ fontWeight: '600', color: '#00838f', marginBottom: '10px' }}>NBM status</div>
                        <RadioGroup name="nbmStatus" value={formData.nbmStatus} onChange={handleChange} options={nbmOptions} />
                    </div>
                </div>
    
                {/* Payment & Coordinator Verification */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>Payment & Coordinator Verification</div>
    
                    <TextInput label="Estimated length of stay" name="estimatedStay" value={formData.estimatedStay} onChange={handleChange} />
    
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ fontWeight: '600', color: '#00838f', marginBottom: '10px' }}>Payment method</div>
                        <RadioGroup name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} options={paymentOptions} />
                    </div>
    
                    {formData.paymentMethod === 'Cash' && (
                        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f7f9', borderRadius: '10px', borderLeft: '4px solid #80deea' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '10px' }}>In case of cash payment, floor coordinator to verify:</div>
                            <RadioGroup name="cashPaymentStatus" value={formData.cashPaymentStatus} onChange={handleChange} options={[{ value: 'Advance paid', label: 'Advance paid' }, { value: 'Pending', label: 'Pending' }]} />
                        </div>
                    )}
    
                    {formData.paymentMethod === 'Insurance' && (
                        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f7f9', borderRadius: '10px', borderLeft: '4px solid #80deea' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '10px' }}>In case of insurance, floor coordinator to verify:</div>
                            <RadioGroup name="insuranceApprovalStatus" value={formData.insuranceApprovalStatus} onChange={handleChange} options={[{ value: 'Pre approval received', label: 'Pre approval received' }, { value: 'Not received', label: 'Not received' }]} />
                        </div>
                    )}
    
                    <div style={{ marginTop: '30px', borderTop: '1px solid #efefef', paddingTop: '20px' }}>
                        <TextInput label="Name & Sign of the floor coordinator" name="coordinatorNameSign" value={formData.coordinatorNameSign} onChange={handleChange} />
                        <div style={{ maxWidth: '300px' }}>
                            <MuiDateTimePicker label="Date & Time" name="coordinatorDateTime" value={formData.coordinatorDateTime} onChange={handleChange} />
                        </div>
                    </div>
                </div>
    
                {/* Final Footer */}
                <div style={{ ...cardStyle, borderTop: '4px solid #80deea' }}>
                    <TextInput label="Admission done by (Name & Sign)" name="admissionDoneByNameSign" value={formData.admissionDoneByNameSign} onChange={handleChange} />
                    <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="admissionDoneDate" value={formData.admissionDoneDate} onChange={handleChange} type="date" /></div>
                        <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="admissionDoneTime" value={formData.admissionDoneTime} onChange={handleChange} type="time" /></div>
                    </div>
                </div>
    
                <button type="submit" className="submit-btn" style={{ width: '100%', padding: '15px', fontSize: '1.1rem', backgroundColor: '#80deea', fontWeight: 'bold' }}>
                    Complete Admission Verification
                </button>
            </form>
        );
    };
    
    export default AdmissionDetailsForm;
    