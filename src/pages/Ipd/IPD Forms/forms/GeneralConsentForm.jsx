import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import CheckboxGroup from "../inputs/CheckboxGroup";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const GeneralConsentForm = ({ onSubmit, patientData = {} }) => {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  // print form format starts
  const generatePrintContent = () => {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ANESTHESIA CONSENT FORM</title>
            <style>
                @page { margin: 5mm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #333; }
                .outer-border { border: 3px solid #00a99d; padding: 5px 25px; display: flex; flex-direction: column; min-height: 95vh; position: relative; }
                
                /* Header Styling - Matching your ADR form exactly */
                .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
                .logo-img { height: 65px; width: auto; margin-top:10px; }           
                .patient-info-block { position: absolute; right: 25px; color: #333; font-weight: bold; font-size: 11px; text-align: left; line-height: 1.5; }
                .label-teal { color: #008080; font-weight: bold; margin-right: 4px; }
                 .main-title { color: #008080; font-size: 24px; font-weight: bold; margin: 10px 0 30px 0; }
                /* Typography */
                .dotted-line { border-bottom: 1px dotted #646363; flex: 1; margin: 0 8px; height: 1.1em; }
               .form-type { color: red; font-weight: bold; font-size: 11px; margin-bottom: 5px; }
                .instruction-box { font-size: 9.5px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-style: italic; color: #666; line-height: 1.2; }
                
                .section-text { text-align: justify; font-size: 13.5px; line-height: 1.6; }
                .fill-line { border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 0 5px; font-weight: bold; font-style: italic; }
    
                /* Checkbox Grid - To match your image layout */
                .cb-grid { display: flex; flex-wrap: wrap; gap: 15px; margin: 10px 0; font-weight: bold; font-size: 12px; }
                .cb-item { display: flex; align-items: center; }
                .box { width: 14px; height: 14px; border: 1px solid #000; margin-right: 6px; position: relative; background: #fff; }
                .box.checked { background-color: #00bcd4; border-color: #00bcd4; }
            .box.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); color: #333; font-weight: bold; font-size: 14px; }
    
                /* Medical Table - Recreating the Benefits/Risks structure */
                .medical-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
                .medical-table th, .medical-table td { border: 1px solid #000; padding: 8px; vertical-align: top; text-align: left; }
                .medical-table th { background: #f2f2f2; font-weight: bold; }
                .bullet-list { margin: 0; padding-left: 18px; }
                .bullet-list li { margin-bottom: 4px; font-weight:normal; }
                .page-break { page-break-before: always; clear: both; display: block; height: 0; }
                /* Signature Blocks */
                .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px; }
                .sig-item {  padding: 5px 0 5px 0; font-size: 14px; font-weight: bold; }
                .attendant-section {padding-top: 10px; }
                @media print { .no-print { display: none; } }
            </style>

        </head>

        <body>

            <div class="page-container">
                <div class="form-type">Form 7 - Front</div>
                    <div class="outer-border">
                        <div class="header-flex">
                            <img src="${window.location.origin}${hhcLogo}" class="logo-img">
                            <div class="patient-info-block">
                                <div><span class="label-teal">UHID:</span> ${patientData?.uhid || ""}</div>
                                <div><span class="label-teal">NAME:</span> ${patientData?.name || ""}</div>
                                <div><span class="label-teal">AGE/SEX:</span> ${patientData?.age || ""}/${patientData?.gender || ""}</div>
                                <div><span class="label-teal">IP NO:</span> ${patientData?.ipNo || ""}</div>
                            </div>
                        </div>
    
                        <div class="main-title">ANESTHESIA CONSENT FORM</div>

                        <div class="section-text" style="line-height:1.7;">

                            <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                                <span>Name of patient:</span>
                                <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;">${patientData?.name || ""}</span>
                                <span>Age : </span>
                                <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                                <span>Gender : </span>
                                <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                            </div>

                            <div class="sig-item" style="display: flex; justify-content: space-between;">
                                <span>IP No :</span>
                                <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"> ${patientData?.ipNo || ""}</span>
                                <span>Doctor's name : </span>
                                <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;">${formData.doctorsName}</span>
                            </div>

                            <p>
                                On arrival Dr.
                                <span class="dotted-line" class="dotted-line" style="display:inline-block; width:220px;">${formData.examiningDoctor}</span>
                                conducted examination and has advised me admission into the hospital for
                                the surgery / treatment.<span class="dotted-line" class="dotted-line" style="display:inline-block; width:220px;">${formData.surgeryTreatment}</span>
                            </p>

                            <p>
                                1) I have been given a clear idea about the investigations needed and procedures /
                                treatment / interventions that may be required to be carried out. I have been
                                informed about associated / possible complications, if any.
                            </p>

                            <p>
                                2) I allow the treating doctor, the team and staff of the hospital including nurses,
                                technicians, paramedics and support services personnel to render necessary services.
                            </p>

                            <p>
                                3) I am also willing to allow involvement of other specialists to participate in
                                assessment and management, as required. I also give my consent to perform necessary
                                investigations, procedures, interventions, medications and nursing care, including
                                admission to intensive care, Operation room etc.
                            </p>

                            <p>
                                4) I shall get informed on the treatment being given, changes in the conditions etc.
                                from time to time. I am also told that after the admission (here and when necessary)
                                I shall be further informed of significant change in my condition necessitating
                                further investigations / change of treatment / interventions.
                            </p>

                            <p>
                                5) I hereby give my consent for taking clinical photographs / videos as may be required
                                as a part of my clinical records and to also use the same for any clinical research /
                                educational purpose that may be undertaken by the hospital without ever revealing my
                                identity in any form.
                            </p>

                            <p>
                                6) I authorize the hospital to take necessary precautions in view of preventing
                                possibility of cross infections to care providers, other patients and visitors.
                            </p>

                            <p>
                                7) I am also aware that drugs, medications and medical disposables used in the hospital
                                are of reputed makes and comply with all statutory requirements.
                            </p>

                            <p>
                                8) I have been given a fair idea on the cost of the treatment, including day to day
                                expenses, which I agree to bear. I shall abide by rules and regulations of the hospital.
                            </p>

                        </div>

                        <div class="section-text" style="margin-top:15px;">
                            <div style="display:flex; align-items:flex-start;">
                                <div class="box ${formData.consentChecked ? "checked" : ""}"></div>
                                <div>
                                I hereby give my consent for admission in the hospital and the necessary treatment.
                                <br>
                                1) I have been apprised of my rights to refuse.
                                <br>
                                2) I fully understand medical consequences & expenses of such refusal.
                                So I opt to give my consent for admission.
                                </div>
                            </div>
                        </div>


                        <div style="margin-top:30px; font-size:13px;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                                <div style="width:45%;">
                                Patient’s Name : <b>${patientData?.name || ""}</b><br>
                                </div>

                                <div style="width:50%;">
                                Name of the relative with relation : <strong>${formData.relativeName}</strong><br>
                                </div>
                            </div>

                            <!-- Row 2 -->
                            <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                                <div style="width:45%;">
                                Patient’s sign<br>
                                </div>

                                <div style="width:50%;">
                                Relative’s sign:<br>
                                </div>
                            </div>

                            <!-- Row 3 -->
                            <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                                <div style="width:45%;">
                                Date :  <b> ${formData.patientSignDate}</b><br>
                                </div>

                                <div style="width:50%;">
                                Date : <b> ${formData.relativeSignDate}</b><br>
                                </div>
                            </div>

                            <!-- Row 4 -->
                            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                                <div style="width:45%;">
                                Time : <b> ${formData.patientSignTime} </b><br>
                                </div>

                                <div style="width:50%;">
                                Time : <b> ${formData.relativeSignTime}</b><br>
                                </div>
                            </div>

                            <div style="display:flex; justify-content:space-between;">
                                <div style="width:45%;">
                                Sign of admitting doctor : <br>
                                </div>

                                <div style="width:50%;">
                                Date : <b>${formData.admittingDoctorSignDate}</b><br>
                                </div>

                                <div style="width:50%;">
                                Time : <b>${formData.admittingDoctorSignTime}<br>
                                </div>
                            </div>
                            <div style="margin-top:16px;">
                                Reg no : <b>${formData.regNo}</b>
                            </div>

                        </div>
   
                    </div>
                
            <div class="page-break"></div>
    
            <div class="page-container">
                <div class="form-type">Form 7 - Back</div>
                <div class="outer-border">
                    <div class="header-flex">
                        <img src="${window.location.origin}${hhcLogo}" class="logo-img">
                        <div class="patient-info-block">
                            <div><span class="label-teal">UHID:</span> ${patientData?.uhid || ""}</div>
                            <div><span class="label-teal">NAME:</span> ${patientData?.name || ""}</div>
                            <div><span class="label-teal">AGE/SEX:</span> ${patientData?.age || ""}/${patientData?.gender || ""}</div>
                            <div><span class="label-teal">IP NO:</span> ${patientData?.ipNo || ""}</div>
                        </div>
                    </div>
    
                    <div class="main-title">भूल देण्यासाठी संमती पत्र</div>

                    <div style="font-size:13px; line-height:1.6; text-align:justify;">

                    <div style="margin-bottom:10px;">
                        रुग्णालयात आल्यानंतर डॉ.
                        <span style="display:inline-block; border-bottom:1px solid #000; width:300px;"></span>
                        यांनी तपासणी
                        केली आहे.
                    </div>

                    <div style="margin-bottom:10px;">
                        रुग्णालयात मला
                        <span style="display:inline-block; border-bottom:1px solid #000; width:300px;"></span>
                    या शस्त्रक्रियेसाठी अथवा उपचारासाठी दाखल होण्याचा सल्ला दिला आहे.
                    </div>

                    <p>
                        १) मला आवश्यक उपचार आणि त्यासंबंधी आवश्यक असणाऱ्या विविध तपासण्या करून घेण्याबाबत सुस्पष्टपणे कल्पना देण्यात आली आहे
                        आणि त्यामुळं होऊ शकणारे फायदे व धोके तसेच त्याच्याशी अनुषंगिक, जर असेल तर, असू शकणारी गुंतागुंत व तिचे धोके याबाबत प्रकाश
                        टाकून माझे अज्ञान दूर करण्यात आले आहे.
                    </p>

                    <p>
                        २) मी माझ्यावर उपचार करणारे डॉक्टर, त्यांचा संघ, परिचारिका, टेक्निशियन, वैद्यकीय पेशाशी सलग्न असलेले सर्व व्यक्ती अशा सर्व रुग्णालय
                        कर्मचारी वर्ग यांना माझ्यासाठी आवश्यक असणाऱ्या सेवा देण्यास परवानगी देत आहे. जरूरी असल्यास, मूल्यांकन व व्यवस्थापन करण्यास इतर
                        तज्ञांचा सहभाग घेण्यास परवानगी देण्याची माझी तयारी आहे. तसेच त्याकरिता आवश्यक तपासण्या करणे, वैद्यकीय उपचारपद्धती, औषधोपचार,
                        व सेवा व सुश्रूषा व वेळ आल्यास अतिदक्षता विभागात दाखल करण्यासही मी संमती देत आहे.
                    </p>

                    <p>
                        ३) मला देण्यात येणाऱ्या उपचार पद्धतीची, त्यातील बदलत जाणाऱ्या स्थितीची वेळोवेळी माहिती मला पुरवली जाईल.
                        मी आजाराच्या सद्यस्थितीवरून जरुरीनुसार इतर तज्ञ डॉक्टर व हॉस्पिटल व्यवस्थापनाला माझ्या उपचारप्रक्रियेत सहभागी होण्यास
                        परवानगी देत आहे. आवश्यक त्या निदान तपासण्या, छोट्या शस्त्रक्रिया, औषधोपचार, नर्सिंग सेवा व जरुरी पडल्यास अतिदक्षता विभागामध्ये उपचार
                        देण्यास संमती देत आहे.
                    </p>

                    <p>
                        ४) मला असेही सांगण्यात आले आहे की मला दाखल केल्यानंतर (जिथे व जेव्हा गरज पडल्यास) माझ्या स्थितीत होणाऱ्या लक्षणीय बदलांमुळे जरुरी
                        भासणाऱ्या पुढील तपासण्या व उपचारातील बदल करून घेण्यासाठी माझी संमती घेतली जाईल.
                    </p>

                    <p>
                        ५) माझ्या वैद्यकीय रेकॉर्ड्सचा एक भाग म्हणून आवश्यक असलेली वैद्यकीय छायाचित्रे व वैद्यकीय संशोधनासाठी संमती मी देत आहे, तसेच कोणतीही
                        वैयक्तिक माहिती जाहीर न करण्याची माहिती मला देण्यात आली आहे.
                    </p>

                    <p>
                        ६) मला समजू शकतील अशा भाषेमधून मला हे कळविण्यात आले आहे.
                    </p>

                    <p>
                        ७) माझी सेवा करणारे कर्मचारी, इतर रुग्ण व अभ्यागत यांना संसर्गजन्य रोग टाळण्यासाठी जरुरीचे प्रतिबंधात्मक उपचार घेण्यास रुग्णालयास
                        अधिकार देत आहे.
                    </p>

                    <p>
                        ८) रुग्णाच्या उपचारांसाठी लागणारी औषधे व मेडिकल डिस्पोजेबल सामान प्रमाणित व कायदेशीर रीतीने वैध असतील याची मला कल्पना दिली आहे.
                    </p>

                    <p>
                        ९) उपचारांसाठी लागणाऱ्या खर्चाची पूर्ण व योग्य कल्पना मला दिली आहे व तो खर्च करण्यास माझी तयारी आहे. हॉस्पिटलचे सर्व नियम व
                        अटी मला मान्य आहेत.
                    </p>

                    <p>
                        <b>रुग्णालयात दाखल होण्यासाठी व आवश्यक ते उपचार करविण्यासाठी मी याद्वारे माझी संमती देत आहे. मला रुग्णालयात दाखल होण्यासाठी संमती नाकारण्याचा अधिकार आहे, असे समजावून सांगण्यात आले आहे. नकार दिल्यास होणाऱ्या वैद्यकीय परिणामांची व खर्चाची मला पूर्ण कल्पना आहे. त्यामुळे सदर रुग्णालयात दाखल होण्यासाठी मी माझी संमती देत आहे.</b>
                    </p>

                    <div style="margin:15px 0; font-weight:bold; text-align:center;">
                        “ जर तुम्ही पूर्णपणे वाचले नसेल व समजून घेतले नसेल तर सही करू नका.”
                    </div>

                </div>

                <div style="margin-top:30px; font-size:13px;">

                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <div style="width:45%;">
                        नाव :
                        </div>
                        <div style="width:45%;">
                        साक्षीदाराचे नाव व नाते :
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <div style="width:45%;">
                        रुग्णाची स्वाक्षरी :
                        </div>
                        <div style="width:45%;">
                        साक्षीदाराची स्वाक्षरी :
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <div style="width:45%;">
                        दिनांक :
                        </div>
                        <div style="width:45%;">
                        वेळ :
                        </div>
                    </div>

                    <div style="margin-top:20px;">
                        उपचार करणाऱ्या डॉक्टरांचे नाव व स्वाक्षरी :
                    </div>

                    <div style="margin-top:10px;">
                        नोंदणी क्रमांक :
                    </div>

                </div>

                </div>
            </div>
    
            <div class="no-print" style="text-align:center; margin: 20px 0;">
                <button onclick="window.print()" style="padding: 10px 30px; background:#008080; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Confirm Print</button>
            </div>

        </body>
        </html>
      `;

    const printWindow = window.open("", "_blank", "width=900,height=1000");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  // print form format ends

  return (
    <form
      onSubmit={handleSubmit}
      className="medical-form"
      style={{ maxWidth: "900px", margin: "0 auto" }}
    >
      <h2
        className="form-title"
        style={{
          textAlign: "center",
          backgroundColor: "#80deea",
          color: "white",
          padding: "10px",
          borderRadius: "4px",
          margin: "0 0 30px 0",
          fontSize: "1.4rem",
        }}
      >
        GENERAL CONSENT FOR ADMISSION
        <br />
        रुग्णालयात दाखल होण्यासाठी संमतीपत्र
      </h2>

      {/* Patient Header using project standard */}
      <div className="patient-compact-header" style={{ marginBottom: "30px" }}>
        <div className="info-item">
          <span className="info-label">UHID</span>
          <span className="info-value">{formData.uhid || "—"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Patient Name</span>
          <span className="info-value">{formData.name || "—"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Age</span>
          <span className="info-value">{formData.age || "—"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Gender</span>
          <span className="info-value">{formData.gender || "—"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">IP No</span>
          <span className="info-value">{formData.ipNo || "—"}</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <MuiDateTimePicker
              label="DOA"
              name="doa"
              value={formData.doa}
              onChange={handleChange}
              type="date"
            />
          </div>
          <div style={{ flex: 1 }}>
            <MuiDateTimePicker
              label="Time"
              name="doaTime"
              value={formData.doaTime}
              onChange={handleChange}
              type="time"
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <MuiDateTimePicker
              label="DOD"
              name="dod"
              value={formData.dod}
              onChange={handleChange}
              type="date"
            />
          </div>
          <div style={{ flex: 1 }}>
            <MuiDateTimePicker
              label="Time"
              name="dodTime"
              value={formData.dodTime}
              onChange={handleChange}
              type="time"
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <TextInput
          label="Doctor's name:"
          name="doctorsName"
          value={formData.doctorsName}
          onChange={handleChange}
        />
      </div>

      <div
        style={{
          padding: "15px",
          border: "1px solid #eee",
          borderRadius: "8px",
          marginBottom: "30px",
          backgroundColor: "#f9f9f9",
          lineHeight: "1.8",
        }}
      >
        On arrival Dr.{" "}
        <input
          type="text"
          name="examiningDoctor"
          value={formData.examiningDoctor}
          onChange={handleChange}
          style={{
            border: "none",
            borderBottom: "1px solid #999",
            outline: "none",
            backgroundColor: "transparent",
            width: "200px",
            padding: "0 5px",
          }}
        />
        conducted examination and has advised me admission into the hospital for
        this surgery / treatment{" "}
        <input
          type="text"
          name="surgeryTreatment"
          value={formData.surgeryTreatment}
          onChange={handleChange}
          style={{
            border: "none",
            borderBottom: "1px solid #999",
            outline: "none",
            backgroundColor: "transparent",
            width: "200px",
            padding: "0 5px",
          }}
        />
        .
      </div>

      <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "30px" }}>
        <p>
          1. I have been given a clear idea about the investigations needed and
          procedures / treatment / interventions that may be required to be
          carried out. I have been informed about associated / possible
          complications, if any.
        </p>
        <p>
          2. I allow the treating doctor, the team and staff of the hospital
          including nurses, technicians, paramedics and support services
          personnel to render necessary services.
        </p>
        <p>
          3. I am also willing to allow involvement of other specialists to
          participate in assessment and management, as required. I also give my
          consent to perform necessary investigations, procedures,
          interventions, medications and nursing care, including admission to
          Intensive care areas, Operation room etc.
        </p>
        <p>
          4. I shall get informed on the treatment being given, changes in the
          conditions etc. from time to time. I am also told that after the
          admission (where and when necessary) I shall be further informed of
          significant change in my condition necessitating further
          investigations/ change of treatment/ interventions.
        </p>
        <p>
          5. I hereby give my consent for taking clinical photographs/videos as
          may be required as a part of my clinical records and to also use the
          same for any clinical research/ educational purpose that may be
          undertaken by the hospital without ever revealing my identity in any
          form.
        </p>
        <p>
          6. I authorize the hospital to take necessary precautions in view of
          preventing possibility of cross infections to care providers, other
          patients and visitors.
        </p>
        <p>
          7. I am also aware that drugs, medications and medical disposables
          used in the hospital are of reputed makes and comply with all
          statutory requirements.
        </p>
        <p>
          8. I have been given a fair idea on the cost of the treatment,
          including day to day expenses, which I agree to bear. I shall abide by
          rules and regulations of the hospital.
        </p>
      </div>

      <div
        style={{
          border: "1px solid #80deea",
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#f0fbfa",
          marginBottom: "40px",
        }}
      >
        <div style={{ display: "flex", gap: "15px" }}>
          <input
            type="checkbox"
            name="consentChecked"
            checked={formData.consentChecked}
            onChange={handleChange}
            style={{ width: "20px", height: "20px" }}
          />
          <div style={{ fontSize: "0.9rem" }}>
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
              I hereby give my consent for admission in the hospital and the
              necessary treatment.
            </div>
            <div>1. I have been apprised of my rights to refuse.</div>
            <div>
              2. I fully understand medical consequences & expenses of such
              refusal. So I opt to give my consent for admission.
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          borderTop: "2px solid #80deea",
          paddingTop: "30px",
        }}
      >
        {/* Patient / Doctor Column */}
        <div>
          <TextInput label="Patient's Name" value={formData.name} readOnly />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <div style={{ flex: 1 }}>
              <MuiDateTimePicker
                label="Date"
                name="patientSignDate"
                value={formData.patientSignDate}
                onChange={handleChange}
                type="date"
              />
            </div>
            <div style={{ flex: 1 }}>
              <MuiDateTimePicker
                label="Time"
                name="patientSignTime"
                value={formData.patientSignTime}
                onChange={handleChange}
                type="time"
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "40px",
              borderTop: "1px dashed #ccc",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "0.85rem",
                marginBottom: "10px",
                color: "#666",
              }}
            >
              Sign of admitting doctor
            </div>
            <TextInput
              label="Reg no:"
              name="regNo"
              value={formData.regNo}
              onChange={handleChange}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <div style={{ flex: 1 }}>
                <MuiDateTimePicker
                  label="Date"
                  name="admittingDoctorSignDate"
                  value={formData.admittingDoctorSignDate}
                  onChange={handleChange}
                  type="date"
                />
              </div>
              <div style={{ flex: 1 }}>
                <MuiDateTimePicker
                  label="Time"
                  name="admittingDoctorSignTime"
                  value={formData.admittingDoctorSignTime}
                  onChange={handleChange}
                  type="time"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Relative Column */}
        <div>
          <TextInput
            label="Name of the relative with relation"
            name="relativeName"
            value={formData.relativeName}
            onChange={handleChange}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <div style={{ flex: 1 }}>
              <MuiDateTimePicker
                label="Date"
                name="relativeSignDate"
                value={formData.relativeSignDate}
                onChange={handleChange}
                type="date"
              />
            </div>
            <div style={{ flex: 1 }}>
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
      </div>

      <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
        <button
          type="submit"
          className="submit-btn"
          style={{ margin: 0, width: "100%" }}
        >
          Complete General Consent
        </button>
        <button
          type="button"
          className="submit-btn"
          onClick={generatePrintContent}
          style={{
            margin: 0,
            width: "100%",
            backgroundColor: "#607d8b", // Distinct color for print
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>🖨️</span> Print General Consent Form
        </button>
      </div>
    </form>
  );
};

export default GeneralConsentForm;
