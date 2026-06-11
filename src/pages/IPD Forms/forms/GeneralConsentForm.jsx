// import React, { useState } from 'react';
// import TextInput from '../inputs/TextInput';
// import MuiDateTimePicker from '../inputs/MuiDateTimePicker';
// import CheckboxGroup from '../inputs/CheckboxGroup';

// const GeneralConsentForm = ({ onSubmit, patientData = {} }) => {
//     const [formData, setFormData] = useState({
//         uhid: patientData.uhid || '',
//         name: patientData.name || '',
//         age: patientData.age || '',
//         gender: patientData.gender || '',
//         ipNo: patientData.ipNo || '',
//         doctorsName: patientData.doctorName || '',

//         doa: '',
//         doaTime: '',
//         dod: '',
//         dodTime: '',
//         examiningDoctor: '',
//         surgeryTreatment: '',

//         consentChecked: false,
//         patientSignDate: '',
//         patientSignTime: '',
//         relativeName: '',
//         relativeSignDate: '',
//         relativeSignTime: '',
//         admittingDoctorSignDate: '',
//         admittingDoctorSignTime: '',
//         regNo: ''
//     });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onSubmit && onSubmit(formData);
//     };

//     return (
//         <form onSubmit={handleSubmit} className="medical-form" style={{ maxWidth: '900px', margin: '0 auto' }}>
//             <h2 className="form-title" style={{ textAlign: 'center', backgroundColor: '#80deea', color: 'white', padding: '10px', borderRadius: '4px', margin: '0 0 30px 0', fontSize: '1.4rem' }}>
//                 GENERAL CONSENT FOR ADMISSION<br />
//                 रुग्णालयात दाखल होण्यासाठी संमतीपत्र
//             </h2>

//             {/* Patient Header using project standard */}
//             <div className="patient-compact-header" style={{ marginBottom: '30px' }}>
//                 <div className="info-item">
//                     <span className="info-label">UHID</span>
//                     <span className="info-value">{formData.uhid || '—'}</span>
//                 </div>
//                 <div className="info-item">
//                     <span className="info-label">Patient Name</span>
//                     <span className="info-value">{formData.name || '—'}</span>
//                 </div>
//                 <div className="info-item">
//                     <span className="info-label">Age</span>
//                     <span className="info-value">{formData.age || '—'}</span>
//                 </div>
//                 <div className="info-item">
//                     <span className="info-label">Gender</span>
//                     <span className="info-value">{formData.gender || '—'}</span>
//                 </div>
//                 <div className="info-item">
//                     <span className="info-label">IP No</span>
//                     <span className="info-value">{formData.ipNo || '—'}</span>
//                 </div>
//             </div>

//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
//                 <div style={{ display: 'flex', gap: '10px' }}>
//                     <div style={{ flex: 1 }}><MuiDateTimePicker label="DOA" name="doa" value={formData.doa} onChange={handleChange} type="date" /></div>
//                     <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="doaTime" value={formData.doaTime} onChange={handleChange} type="time" /></div>
//                 </div>
//                 <div style={{ display: 'flex', gap: '10px' }}>
//                     <div style={{ flex: 1 }}><MuiDateTimePicker label="DOD" name="dod" value={formData.dod} onChange={handleChange} type="date" /></div>
//                     <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="dodTime" value={formData.dodTime} onChange={handleChange} type="time" /></div>
//                 </div>
//             </div>

//             <div style={{ marginBottom: '30px' }}>
//                 <TextInput label="Doctor's name:" name="doctorsName" value={formData.doctorsName} onChange={handleChange} />
//             </div>

//             <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#f9f9f9', lineHeight: '1.8' }}>
//                 On arrival Dr. <input type="text" name="examiningDoctor" value={formData.examiningDoctor} onChange={handleChange} style={{ border: 'none', borderBottom: '1px solid #999', outline: 'none', backgroundColor: 'transparent', width: '200px', padding: '0 5px' }} />
//                 conducted examination and has advised me admission into the hospital for
//                 this surgery / treatment <input type="text" name="surgeryTreatment" value={formData.surgeryTreatment} onChange={handleChange} style={{ border: 'none', borderBottom: '1px solid #999', outline: 'none', backgroundColor: 'transparent', width: '200px', padding: '0 5px' }} />.
//             </div>

//             <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '30px' }}>
//                 <p>1. I have been given a clear idea about the investigations needed and procedures / treatment / interventions that may be required to be carried out. I have been informed about associated / possible complications, if any.</p>
//                 <p>2. I allow the treating doctor, the team and staff of the hospital including nurses, technicians, paramedics and support services personnel to render necessary services.</p>
//                 <p>3. I am also willing to allow involvement of other specialists to participate in assessment and management, as required. I also give my consent to perform necessary investigations, procedures, interventions, medications and nursing care, including admission to Intensive care areas, Operation room etc.</p>
//                 <p>4. I shall get informed on the treatment being given, changes in the conditions etc. from time to time. I am also told that after the admission (where and when necessary) I shall be further informed of significant change in my condition necessitating further investigations/ change of treatment/ interventions.</p>
//                 <p>5. I hereby give my consent for taking clinical photographs/videos as may be required as a part of my clinical records and to also use the same for any clinical research/ educational purpose that may be undertaken by the hospital without ever revealing my identity in any form.</p>
//                 <p>6. I authorize the hospital to take necessary precautions in view of preventing possibility of cross infections to care providers, other patients and visitors.</p>
//                 <p>7. I am also aware that drugs, medications and medical disposables used in the hospital are of reputed makes and comply with all statutory requirements.</p>
//                 <p>8. I have been given a fair idea on the cost of the treatment, including day to day expenses, which I agree to bear. I shall abide by rules and regulations of the hospital.</p>
//             </div>

//             <div style={{ border: '1px solid #80deea', padding: '20px', borderRadius: '8px', backgroundColor: '#f0fbfa', marginBottom: '40px' }}>
//                 <div style={{ display: 'flex', gap: '15px' }}>
//                     <input type="checkbox" name="consentChecked" checked={formData.consentChecked} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
//                     <div style={{ fontSize: '0.9rem' }}>
//                         <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>I hereby give my consent for admission in the hospital and the necessary treatment.</div>
//                         <div>1. I have been apprised of my rights to refuse.</div>
//                         <div>2. I fully understand medical consequences & expenses of such refusal. So I opt to give my consent for admission.</div>
//                     </div>
//                 </div>
//             </div>

//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', borderTop: '2px solid #80deea', paddingTop: '30px' }}>
//                 {/* Patient / Doctor Column */}
//                 <div>
//                     <TextInput label="Patient's Name" value={formData.name} readOnly />
//                     <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
//                         <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="patientSignDate" value={formData.patientSignDate} onChange={handleChange} type="date" /></div>
//                         <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="patientSignTime" value={formData.patientSignTime} onChange={handleChange} type="time" /></div>
//                     </div>

//                     <div style={{ marginTop: '40px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
//                         <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '10px', color: '#666' }}>Sign of admitting doctor</div>
//                         <TextInput label="Reg no:" name="regNo" value={formData.regNo} onChange={handleChange} />
//                         <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
//                             <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="admittingDoctorSignDate" value={formData.admittingDoctorSignDate} onChange={handleChange} type="date" /></div>
//                             <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="admittingDoctorSignTime" value={formData.admittingDoctorSignTime} onChange={handleChange} type="time" /></div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Relative Column */}
//                 <div>
//                     <TextInput label="Name of the relative with relation" name="relativeName" value={formData.relativeName} onChange={handleChange} />
//                     <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
//                         <div style={{ flex: 1 }}><MuiDateTimePicker label="Date" name="relativeSignDate" value={formData.relativeSignDate} onChange={handleChange} type="date" /></div>
//                         <div style={{ flex: 1 }}><MuiDateTimePicker label="Time" name="relativeSignTime" value={formData.relativeSignTime} onChange={handleChange} type="time" /></div>
//                     </div>
//                 </div>
//             </div>

//             <button type="submit" className="submit-btn" style={{ marginTop: '40px', width: '100%' }}>Complete General Consent</button>
//         </form>
//     );
// };

// export default GeneralConsentForm;

import React, { useState, useEffect } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./Forms.css";
import { decodeJwt } from "../../../utils/decode-jwt";
import Swal from "sweetalert2";
import hhcLogo from "../../../assets/images/logo/hhclogo.webp";

const pageTitle = "general-consent";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const theme = createTheme({
  palette: { primary: { main: "#80deea" } },
  typography: { fontSize: 13 },
});

const GeneralConsentForm = ({ onSubmit, patientData = {} }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uhid: patientData.uhid || "",
    name: patientData.name || "",
    age: patientData.age || "",
    gender: patientData.gender || "",
    ipNo: patientData.ipNo || "",
    doctorsName: patientData.doctorName || "",
    doa: "",
    doaTime: "",
    dod: "",
    dodTime: "",
    examiningDoctor: "",
    surgeryTreatment: "",
    consentChecked: false,
    patientSignDate: "",
    patientSignTime: "",
    relativeName: "",
    relativeSignDate: "",
    relativeSignTime: "",
    admittingDoctorSignDate: "",
    admittingDoctorSignTime: "",
    regNo: "",
  });

  // 1. Fetch Existing Data
  useEffect(() => {
    const token = localStorage.getItem("token");
    let loc = null;
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) {
        loc = payload.jobLocation;
        setCurrentLocation(loc);
      }
    }

    const fetchExistingData = async () => {
      if (!patientData?.uhid || !loc) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/V1/ipd/admission/listAdmissionEntry?location=${loc}&uhid=${patientData.uhid}&title=${pageTitle}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const result = await response.json();
        
        if (response.ok && result.data) {
          const existing = result.data;
          setFormData((prev) => ({
            ...prev,
            doa: existing.admission_info?.doa || "",
            doaTime: existing.admission_info?.doa_time || "",
            dod: existing.admission_info?.dod || "",
            dodTime: existing.admission_info?.dod_time || "",
            doctorsName:
              existing.admission_info?.doctors_name || prev.doctorsName,
            examiningDoctor: existing.consent_details?.examining_doctor || "",
            surgeryTreatment: existing.consent_details?.surgery_treatment || "",
            consentChecked: existing.consent_details?.is_consent_given || false,
            patientSignDate: existing.signatures?.patient?.date || "",
            patientSignTime: existing.signatures?.patient?.time || "",
            relativeName: existing.signatures?.relative?.name || "",
            relativeSignDate: existing.signatures?.relative?.date || "",
            relativeSignTime: existing.signatures?.relative?.time || "",
            admittingDoctorSignDate: existing.signatures?.doctor?.date || "",
            admittingDoctorSignTime: existing.signatures?.doctor?.time || "",
            regNo: existing.signatures?.doctor?.reg_no || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching consent data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingData();
  }, [patientData?.uhid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 2. Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalPayload = {
      [pageTitle]: {
        admission_info: {
          doa: formData.doa,
          doa_time: formData.doaTime,
          dod: formData.dod,
          dod_time: formData.dodTime,
          doctors_name: formData.doctorsName,
        },
        consent_details: {
          examining_doctor: formData.examiningDoctor,
          surgery_treatment: formData.surgeryTreatment,
          is_consent_given: formData.consentChecked,
        },
        signatures: {
          patient: {
            date: formData.patientSignDate,
            time: formData.patientSignTime,
          },
          relative: {
            name: formData.relativeName,
            date: formData.relativeSignDate,
            time: formData.relativeSignTime,
          },
          doctor: {
            reg_no: formData.regNo,
            date: formData.admittingDoctorSignDate,
            time: formData.admittingDoctorSignTime,
          },
        },
      },
    };

    try {
      Swal.fire({
        title: "Saving General Consent...",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admission/insertAdmission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: pageTitle,
            location: currentLocation,
            patient_id: patientData.uhid,
            admissionData: finalPayload,
          }),
        },
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Consent Saved!",
          timer: 2000,
          showConfirmButton: false,
        });
        if (onSubmit) onSubmit();
      } else {
        throw new Error("Failed to save consent");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const isFormComplete = () =>
    formData.consentChecked && formData.doa && formData.examiningDoctor;

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="medical-form-container">
          <form onSubmit={handleSubmit}>
            <h2 className="form-title">
              GENERAL CONSENT FOR ADMISSION
              <br />
              रुग्णालयात दाखल होण्यासाठी संमतीपत्र
            </h2>

            {/* Patient Header */}
            <div className="patient-compact-header">
              <div className="info-item">
                <span className="info-label">UHID</span>
                <span className="info-value">{formData.uhid || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Patient Name</span>
                <span className="info-value">{formData.name || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Age/Sex</span>
                <span className="info-value">
                  {formData.age || "—"}/{formData.gender || "—"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">IP No</span>
                <span className="info-value">{formData.ipNo || "—"}</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center p-4">Loading existing data...</div>
            ) : (
              <>
                <div className="section-box">
                  <div className="form-section-title">Admission Timeline</div>
                  <div className="two-col">
                    <div style={{ display: "flex", gap: "10px" }}>
                      <MuiDateTimePicker
                        label="DOA"
                        name="doa"
                        value={formData.doa}
                        onChange={handleChange}
                        type="date"
                      />
                      <MuiDateTimePicker
                        label="Time"
                        name="doaTime"
                        value={formData.doaTime}
                        onChange={handleChange}
                        type="time"
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <MuiDateTimePicker
                        label="DOD"
                        name="dod"
                        value={formData.dod}
                        onChange={handleChange}
                        type="date"
                      />
                      <MuiDateTimePicker
                        label="Time"
                        name="dodTime"
                        value={formData.dodTime}
                        onChange={handleChange}
                        type="time"
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: "15px" }}>
                    <TextInput
                      label="Doctor's name:"
                      name="doctorsName"
                      value={formData.doctorsName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div
                  className="section-box"
                  style={{ lineHeight: "2", padding: "20px" }}
                >
                  On arrival Dr.{" "}
                  <input
                    type="text"
                    name="examiningDoctor"
                    value={formData.examiningDoctor}
                    onChange={handleChange}
                    style={{
                      border: "none",
                      borderBottom: "1px solid #00838f",
                      outline: "none",
                      width: "200px",
                      textAlign: "center",
                    }}
                  />
                  conducted examination and has advised me admission into the
                  hospital for this surgery / treatment{" "}
                  <input
                    type="text"
                    name="surgeryTreatment"
                    value={formData.surgeryTreatment}
                    onChange={handleChange}
                    style={{
                      border: "none",
                      borderBottom: "1px solid #00838f",
                      outline: "none",
                      width: "200px",
                      textAlign: "center",
                    }}
                  />
                  .
                </div>

                <div
                  className="section-box"
                  style={{
                    fontSize: "0.85rem",
                    color: "#555",
                    background: "#fff",
                  }}
                >
                  <p>
                    1. I have been given a clear idea about investigations and
                    complications...
                  </p>
                  <p>
                    2. I allow the treating team and staff to render necessary
                    services...
                  </p>
                  <p>
                    3. I give consent for necessary investigations, procedures,
                    and ICU admission if required...
                  </p>
                  {/* ... other points ... */}
                </div>

                <div
                  className="section-box"
                  style={{ border: "1px solid #80deea", background: "#f0fbfa" }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      alignItems: "flex-start",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="consentChecked"
                      checked={formData.consentChecked}
                      onChange={handleChange}
                      style={{
                        width: "20px",
                        height: "20px",
                        marginTop: "4px",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: "bold", color: "#006064" }}>
                        I hereby give my consent for admission and treatment.
                      </div>
                      <div className="field-hint">
                        I understand my rights to refuse and the medical
                        consequences thereof.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="section-box">
                    <div className="form-section-title">
                      Patient / Doctor Confirmation
                    </div>
                    <TextInput
                      label="Patient's Name"
                      value={formData.name}
                      readOnly
                    />
                    <div className="two-col" style={{ marginTop: "10px" }}>
                      <MuiDateTimePicker
                        label="Date"
                        name="patientSignDate"
                        value={formData.patientSignDate}
                        onChange={handleChange}
                        type="date"
                      />
                      <MuiDateTimePicker
                        label="Time"
                        name="patientSignTime"
                        value={formData.patientSignTime}
                        onChange={handleChange}
                        type="time"
                      />
                    </div>
                    <hr style={{ margin: "20px 0", borderStyle: "dashed" }} />
                    <TextInput
                      label="Admitting Doctor Reg no:"
                      name="regNo"
                      value={formData.regNo}
                      onChange={handleChange}
                    />
                    <div className="two-col" style={{ marginTop: "10px" }}>
                      <MuiDateTimePicker
                        label="Date"
                        name="admittingDoctorSignDate"
                        value={formData.admittingDoctorSignDate}
                        onChange={handleChange}
                        type="date"
                      />
                      <MuiDateTimePicker
                        label="Time"
                        name="admittingDoctorSignTime"
                        value={formData.admittingDoctorSignTime}
                        onChange={handleChange}
                        type="time"
                      />
                    </div>
                  </div>

                  <div className="section-box">
                    <div className="form-section-title">
                      Relative Confirmation
                    </div>
                    <TextInput
                      label="Relative Name & Relation"
                      name="relativeName"
                      value={formData.relativeName}
                      onChange={handleChange}
                    />
                    <div className="two-col" style={{ marginTop: "10px" }}>
                      <MuiDateTimePicker
                        label="Date"
                        name="relativeSignDate"
                        value={formData.relativeSignDate}
                        onChange={handleChange}
                        type="date"
                      />
                      <MuiDateTimePicker
                        label="Time"
                        name="relativeSignTime"
                        value={formData.relativeSignTime}
                        onChange={handleChange}
                        type="time"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  style={{ width: "100%" }}
                >
                  {isFormComplete()
                    ? "Complete General Consent"
                    : "Fill Required Fields to Save"}
                </button>
              </>
            )}
          </form>
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default GeneralConsentForm;
