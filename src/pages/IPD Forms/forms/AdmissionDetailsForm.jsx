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

const BASE_URL = "http://localhost:5100/api";


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
        <div className="medical-form-container">
            <h2 className="form-title">ADMISSION FORM</h2>

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

            <form onSubmit={handleSubmit} className="form-content">
                <section className="form-section">
                    <h3 className="form-section-title">Admission details (to be filled by RMO)</h3>
                    <MuiDateTimePicker label="Admission Date & Time" name="admissionDateTime" value={formData.admissionDateTime} onChange={handleChange} required />

                    <div className="two-col" style={{ marginTop: '1.5rem' }}>
                        <DateInput label="Surgery/Procedure Date" name="surgeryDate" value={formData.surgeryDate} onChange={handleChange} allowFuture={true} />
                        <TextInput label="Provisional diagnosis" name="provisionalDiagnosis" value={formData.provisionalDiagnosis} onChange={handleChange} />
                    </div>

                    <div className="two-col">
                        <TextInput label="Final diagnosis" name="finalDiagnosis" value={formData.finalDiagnosis} onChange={handleChange} />
                        <TextInput label="ICD-10 coding" name="icdCoding" value={formData.icdCoding} onChange={handleChange} />
                    </div>

                    <div className="two-col">
                        <TextInput label="Plan" name="plan" value={formData.plan} onChange={handleChange} />
                        <TextInput label="Allergies if any" name="allergies" value={formData.allergies} onChange={handleChange} />
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="form-section-title">Special consideration</h3>

                    <div className="form-field">
                        <RadioGroup
                            label="Lab tests"
                            name="labTests"
                            value={formData.labTests}
                            onChange={handleChange}
                            options={['Done outside', 'Not done']}
                        />
                        <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>If done - Attach lab reports to file.</p>
                    </div>

                    {(formData.labTests === 'Done outside') && (
                        <div style={{ margin: '1rem 0', padding: '1.5rem', background: '#f0fdfa', borderRadius: '12px', border: '1px dashed var(--primary-color)' }}>
                            <FileInput
                                label="Attach lab reports"
                                name="labReports"
                                onChange={handleChange}
                                multiple={true}
                            />
                        </div>
                    )}

                    <div className="form-field">
                        <RadioGroup
                            label="If not done -"
                            name="labStatus"
                            value={formData.labStatus}
                            onChange={handleChange}
                            options={['Sample collected for lab', 'Not collected']}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>If not collected-RMO to give orders to nursing staff & write in progress sheet</p>
                    </div>
                </section>

                <section className="form-section">
                    <div className="form-field">
                        <RadioGroup
                            label="Investigation orders - RMO to check pre op orders for imaging"
                            name="investigationOrders"
                            value={formData.investigationOrders}
                            onChange={handleChange}
                            options={['Followed', 'Pending', 'NA']}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>RMO to act- in case pending or any additional test is required.</p>
                    </div>
                </section >

                <div className="two-col">
                    <section className="form-section">
                        <h3 className="form-section-title">NBM status</h3>
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex align-items-center gap-2">
                                <label className="checkbox-option mb-0">
                                    <input
                                        type="checkbox"
                                        name="nbmStatus"
                                        value="NBM since"
                                        checked={formData.nbmStatus === 'NBM since'}
                                        onChange={(e) => handleChange({ target: { name: 'nbmStatus', value: e.target.checked ? 'NBM since' : '' } })}
                                    />
                                    <span>NBM since</span>
                                </label>
                                {/* <input
                                    type="text"
                                    name="nbmSince"
                                    value={formData.nbmSince}
                                    onChange={handleChange}
                                    disabled={formData.nbmStatus !== 'NBM since'}
                                    style={{
                                        border: 'none',
                                        borderBottom: '1px solid #ccc',
                                        padding: '0 5px',
                                        outline: 'none',
                                        width: '100px'
                                    }}
                                /> */}
                            </div>
                            <label className="checkbox-option">
                                <input
                                    type="checkbox"
                                    name="hadFoodBeforeComing"
                                    checked={formData.nbmStatus === 'Patient had food before coming'}
                                    onChange={(e) => handleChange({ target: { name: 'nbmStatus', value: e.target.checked ? 'Patient had food before coming' : '' } })}
                                />
                                <span>Patient had food before coming</span>
                            </label>
                        </div>
                    </section>

                    <section className="form-section">
                        <h3 className="form-section-title">Payment method</h3>
                        <RadioGroup
                            label="Select Method"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            options={['Cash', 'Insurance', 'Reimbursement']}
                        />
                    </section>
                </div>

                <section style={{ margin: '2rem 0', background: '#f8fafc', padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                    <div className="form-field">
                        <RadioGroup
                            label="In case of cash payment, floor coordinator to verify"
                            name="cashVerification"
                            value={formData.cashVerification}
                            onChange={handleChange}
                            options={['Advance paid', 'Pending']}
                        />
                    </div>
                    <div className="form-field">
                        <RadioGroup
                            label="In case of insurance, floor coordinator to verify"
                            name="insuranceVerification"
                            value={formData.insuranceVerification}
                            onChange={handleChange}
                            options={['Pre approval received', 'Not received']}
                        />
                    </div>
                </section>

                <footer className="form-footer">
                    <div className="two-col">
                        <TextInput label="Name & Sign of the floor coordinator" name="coordinatorName" value={formData.coordinatorName} onChange={handleChange} />
                        <MuiDateTimePicker label="Date & Time" name="coordinatorDateTime" value={formData.coordinatorDateTime} onChange={handleChange} />
                    </div>
                </footer>

                <button type="submit" className="submit-btn">Submit Admission Form</button>
            </form >
        </div >
    );
};

export default AdmissionDetailsForm;
