import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const SurgeryConsentForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    uhid: patientData?.uhid || "",
    patientName: patientData?.name || "",
    age: patientData?.age || "",
    gender: patientData?.gender || "",
    ipNo: patientData?.ipNo || "",

    authorizedPerson: "",
    authorizingDr: "",
    procedureName: "",
    specificRisks: "",

    agreementChecked: false,

    patientSign: "",
    patientSignDateTime: "",
    patientSignDate: "",
    patientSignTime: "",

    witnessName: "",
    witnessSign: "",
    relationWithPatient: "",
    witnessDateTime: "",
    witnessDate: "",
    witnessTime: "",

    surgeonName: "",
    surgeonSign: "",
    surgeonStamp: "",
    surgeonDateTime: "",
    surgeonDate: "",
    surgeonTime: "",
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
    if (!formData.agreementChecked) {
      alert("Please agree to the terms and policy before submitting.");
      return;
    }
    onSubmit && onSubmit(formData);
  };

  const checkClass = formData.agreementChecked ? "checked" : "";

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
                
                .section-text { margin: 5px 0 0; text-align: justify; font-size: 13.5px; line-height: 1.6; }
                .fill-line { border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 0 5px; font-weight: bold; font-style: italic; }
    
                /* Checkbox Grid - To match your image layout */
                .cb-grid { display: flex; flex-wrap: wrap; gap: 15px; margin: 10px 0; font-weight: bold; font-size: 12px; }
                .cb-item { display: flex; align-items: center; }
                .box { width: 30px; height: 14px; border: 1px solid #000; margin-right: 6px; position: relative; background: #fff; }
                .checked::after { content: '✓'; position: absolute; top: -5px; left: 1px; font-size: 15px; color: #000; font-weight: bold; }
                .box.checked {    background-color: #00bcd4;    border-color: #00bcd4;}
                /* Medical Table - Recreating the Benefits/Risks structure */
                .medical-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
                .medical-table th, .medical-table td { border: 1px solid #000; padding: 8px; vertical-align: top; text-align: left; }
                .medical-table th { background: #f2f2f2; font-weight: bold; }
                .bullet-list { margin: 0; padding-left: 18px; }
                .bullet-list li { margin-bottom: 4px; font-weight:normal; }
                .page-break { page-break-before: always; clear: both; display: block; height: 0; }
                /* Signature Blocks */
                .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px; }
                .sig-item {  padding: 5px 0 5px 0; font-size: 13px; display: flex; justify-content: space-between; margin-top: 10px;}
                .attendant-section {padding-top: 10px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="page-container">
            <div class="form-type">Form 3 - Front</div>
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
    
                    <div class="main-title">CONSENT FOR SURGERY</div>
    
    
                    <div class="section-text">
                        1.  I (patient or guardian <span class="fill-line">${formData.authorizedPerson || ""}</span> authorise Dr <span class="fill-line">${formData.authorizingDr || ""}</span> to perform (operation / procedure)
                        <span class="fill-line">${formData.procedureName || ""}</span>
                    </div>
    
                    <div class="section-text">
                        2.  I understand that any operation or procedure involves some risks and hazards. The more common risks include - infection, bleeding, nerve injury, blood clots, and allergic reactions and pneumonia and in rare circumstances may include cardiac arrest Implants used during surgery may fail / get loosened. Some significant and substantial risks of this particular operation are <span class="fill-line">${formData.specificRisks || ""}</span>
                    </div>

                    <div class="section-text">
                        3.  The administration of anaesthesia also involves risk, more importantly a rare risk of reaction to
                        medications causing death. I consent to the use of such anaesthetics as may be considered necessary by
                        the person responsible for these services.
                    </div>

                    <div class="section-text">
                        4.  If my consultant discovers a different, unsuspected condition at the time of surgery, I authorise him to perform such treatment as he seems necessary, including transfusion of blood / blood products as required.
                    </div>

                    <div class="section-text">
                        5. I understand that no guarantee or assurance has been made as to the results of the procedure and that it may not cure the condition.
                    </div>

                    <div class="section-text">
                        6.   I authorise the examination by an authorised individual of any tissue, organ (s) removed during the procedure and the disposal of such tissue, organ (s) or body part (s) in accordance with hospital policies.
                    </div>

                    <div class="section-text">
                        7.  I give consent to the taking and publication of any photographs in the course of this procedure for the purpose of medical education/research/awareness. I understand that my identity will remain confidential.
                    </div>

                    <div class="section-text">
                        8.  I hereby consent to use re-sterilized material if necessary.
                    </div>

                    <div class="section-text">
                      <h4>PATIENT'S CONSENT</h4>

                      <div class="section-text">
                            <div style="display:flex; align-items:flex-start;">
                                <div class="box ${checkClass}"> </div>
                                <div>
                               I have read and fully understood this consent form and I understand that I should not sign this form if all items, including all my questions, have not been explained or answered to my satisfaction or if I do not understand any of the terms or words contained in this consent form.
                                </div>
                            </div>
                      </div>
                    
                    </div>
                   
                      <div class="attendant-section">
                        <div style="text-align:center; font-weight:bold;">*DO NOT SIGN UNLESS YOU HAVE READ AND THOROUGHLY UNDERSTOOD THIS FORM.*</div>
    
                        <div class="sig-item" >
                            <span>Patient's signature : </span>
                            <span style="flex:1;"> <strong> ${formData.patientSign || ""}</strong></span>
                            <span>Witness name :  </span>
                            <span style="flex:1; "><strong>${formData.witnessName || ""}</strong></span>
                        </div>
    
                        <div class="sig-item" >
                            <span>Date and time : </span>
                            <span style="flex:1;"><strong>${formData.patientSignDate}  ${formData.patientSignTime}</strong></span>
                           
                            <span>Witness sign : </span>
                            <span style="flex:1;"><strong>${formData.witnessSign || ""}</strong></span>
                        </div>
    
                        <div class="sig-item" >
                            <span>Name of surgeon : </span>
                            <span style="flex:1; "><strong>${formData.surgeonName || ""}</strong></span>
                            <span>Relation with patient :  </span>
                            <span style="flex:1;"><strong>${formData.relationWithPatient || ""}</strong></span>
                           
                        </div>
    
                        <div class="sig-item" >
                            <span>Signature  : </span>
                            <span style="flex:1;"> <strong>${formData.surgeonSign || ""}</strong></span>
                           
                            <span>Date/Time : </span>
                            <span style="flex:1; "><strong>${formData.surgeonDateTime || ""}  ${formData.surgeonDateTime || ""}</strong></span>
                        </div>

                        <div class="sig-item" >
                            <span>Stamp  : </span>
                            <span style="flex:1; "></span>
                            
                        </div>
                        <div class="sig-item" >
                           
                            <span>Date/Time : </span>
                            <span style="flex:1; "></span>
                        </div>
                       
                      </div>
                </div>
                
            <div class="page-break"></div>

            <div class="page-container">
              <div class="form-type">Form 3 - Back</div>
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

                <div class="main-title">शस्त्रक्रिया संमती पत्र</div>

                <div class="section-text">
                    1) मी (स्वत: रुग्ण किंवा रुग्णाचा पालक) <span class="fill-line">${formData.authorizedPerson || ""}</span> 
                    डॉ <span class="fill-line">${formData.authorizingDr || ""}</span> (सर्जन) यांना माझ्यावर 
                    <span class="fill-line">${formData.procedureName || ""}</span> ही शस्त्रक्रिया करण्याची परवानगी देतो.
                </div>

                <div class="section-text">
                    2) मला मान्य आहे की शस्त्रक्रिया किंवा लघुशस्त्रक्रिया करताना नेहमी धोका किंवा काही उपद्रव होण्याची शक्यता असते. 
                    तसेच वरती नमूद केलेल्या शस्त्रक्रिये मधील व नंतर होणारे धोके यांची कल्पना मला डॉक्टरांनी दिली आहे. 
                    <p style="font-weight:normal;">• यांपैकी संसर्ग (इन्फेक्शन), रक्तस्त्राव, नसांना दुखापत, रक्ताची गुठळी होणे, हृदयविकाराचा तीव्र झटका, औषधांची प्रतिक्रिया (ॲलर्जिक रिॲक्शन) व न्युमोनिया हे धोके आढळण्याची शक्यता असते. </p>

                    <p style="font-weight:normal;">•  शस्त्रक्रियेमध्ये वापरले जाणारे प्रत्यारोपण केलेल्या वस्तू या अनुपयुक्त ठरू शकतात किंवा विरघळून जाऊ शकतात. </p>

                    <p style="font-weight:normal;">•   शस्त्रक्रियेनंतरच्या जखमा भरण्यासाठी व्यक्तिपरत्वे भिन्न काळ लागू शकतो तो कधी कमी तर कधी अधिक असू शकतो. 
                    हे संभाव्य धोके व त्यांचे परिणाम कधी गंभीर व कदाचित मृत्यू पर्यंतही असू शकतात. </p>

                    <p style="font-weight:normal;">•   उपरोक्त शस्त्रक्रियेचे काही संभाव्य धोके व गंभीर उपद्रव खालीलपैकीही असू शकतात:<span class="fill-line">${formData.specificRisks || ""}</span></p>

                    <p>3) भूल घेणे यामध्येही धोक्याची शक्यता असते. मुख्य म्हणजे हा धोका मृत्यू येणे इथपर्यंतही असू शकतो, हे औषधाच्या प्रतिक्रियेमुळे (रिॲक्शनमुळे) घडते. 
                    मी अशी भूल देण्याची औषधे वापरली जाण्याची परवानगी देतो व भूल देणाऱ्या व्यक्तीवर याची कसलीही जबाबदारी नसल्याची मला जाणीव आहे.</p>

                    <p>4) शस्त्रक्रिया करताना काही वेगळे निदान किंवा आजार किंवा अनपेक्षित विकृती आढळल्यास त्याबद्दल आवश्यक चिकित्सा / शस्त्रोपचार / रक्त व रक्तातील घटक देणे या क्रिया करण्यास मी संबंधित डॉक्टरांना अनुमती देतो.</p>

                    <p>5) शस्त्रक्रिया व चिकित्सा करताना काढलेल्या आवश्यक भागांची प्रयोगशाळेय नैदानिक तपासणी योग्य व प्रशिक्षित व्यक्तीकडून करून घेण्यास माझी हरकत असणार नाही.</p>

                    <p> 6) तसेच दरम्यानच्या संपूर्ण चिकित्सा काळामध्ये माझे छायाचित्रण, ध्वनीचित्रमुद्रण चा वापर शैक्षणिक दर्जा / जागरूकता वाढवण्यासाठी करण्यास माझी परवानगी आहे. त्यामध्ये माझ्या बद्दलची गुप्तता अबाधित ठेवली जाईल याची मला पूर्ण जाणीव आहे.</p>

                    <p>7) निर्जंतुकीकरण केलेले साहित्य वापरण्यास संमती देतो.</p>

                    <div class="section-text">
                    <h4>रुग्णाची संमती</h4>
                   
                    </div>

                    <div class="section-text">
                            <div style="display:flex; align-items:flex-start;">
                                <div class="box ${checkClass}"> </div>
                                <div>
                                मी वरील सर्व माहिती पूर्णपणे वाचली आहे व मला समजली आहे, तसेच वरील सर्व गोष्टींची कल्पना असून मला याची जाणीव आहे की, जर माझ्या पूर्ण प्रश्नांचे समाधान झाले नसेल, वरील सर्व माहिती मला समजावून सांगितली गेली नसेल, माझ्या शंकांचे समाधान झाले नसेल, मला एखाद्या शब्दाचा अर्थ समजला नसेल तर मी सही करणार नाही.
                                </div>
                            </div>
                      </div>
                    
                </div>

                <div class="">
                  <div style="text-align:center; font-weight:bold;">** जर तुम्ही पूर्णपणे वाचले नसेल व समजून घेतले नसेल तर सही करू नका. **</div>

                  <div class="sig-item">
                      <span style="flex:1;">रुग्णाची स्वाक्षरी : ${formData.patientSign || ""}</span>
                      <span style="flex:1;">सर्जन स्वाक्षरी : ${formData.surgeonSign || ""}</span>
                  </div>

                  <div class="sig-item">
                      <span style="flex:1;">दिनांक :  वेळ : <strong>${formData.patientSignDate || ""} ${formData.patientSignTime || ""}</strong></span>
                      <span style="flex:1;">दिनांक : वेळ : </span>
                  </div>

                  <div class="sig-item" style="margin-top: 20px;">
                      <span style="flex:1;">साक्षीदार: <strong>${formData.relationWithPatient || ""}</strong></span>
                  </div>

                  <div class="sig-item" style="margin-top: 20px;">
                      <span style="flex:1;">दिनांक : वेळ : <strong>${formData.witnessDate || ""}  ${formData.witnessTime || ""}</strong></span>
                  </div>

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
    <div
      className="medical-form surgery-consent-form"
      style={{
        maxWidth: "950px",
        margin: "0 auto",
        fontSize: "0.9rem",
        padding: "40px 20px",
      }}
    >
      {/* Blank Top Header Area */}
      <div style={{ height: "80px" }}></div>

      <h2
        className="form-title"
        style={{
          textAlign: "center",
          backgroundColor: "#80deea",
          color: "white",
          padding: "12px",
          borderRadius: "4px",
          margin: "0 0 40px 0",
          fontSize: "1.6rem",
          fontWeight: "bold",
        }}
      >
        CONSENT FOR SURGERY
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Compact Patient Header */}
        <div className="patient-compact-header">
          <div className="info-item">
            <span className="info-label">UHID</span>
            <span className="info-value">{formData.uhid}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Patient Name</span>
            <span className="info-value">{formData.patientName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Age</span>
            <span className="info-value">{formData.age}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Gender</span>
            <span className="info-value">{formData.gender}</span>
          </div>
          <div className="info-item">
            <span className="info-label">IP No</span>
            <span className="info-value">{formData.ipNo}</span>
          </div>
        </div>

        {/* Authorization Details Section */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <TextInput
              label="1) I (patient or guardian):"
              name="authorizedPerson"
              value={formData.authorizedPerson}
              onChange={handleChange}
              placeholder="Enter name"
            />
            <TextInput
              label="authorise Dr:"
              name="authorizingDr"
              value={formData.authorizingDr}
              onChange={handleChange}
              placeholder="Enter doctor's name"
            />
          </div>
          <TextInput
            label="to perform (operation / procedure):"
            name="procedureName"
            value={formData.procedureName}
            onChange={handleChange}
            placeholder="Enter procedure details"
          />
        </div>

        {/* Specific Risks Section */}
        <div style={{ marginBottom: "40px" }}>
          <TextInput
            label="2) Some significant and substantial risks of this particular operation are:"
            name="specificRisks"
            value={formData.specificRisks}
            onChange={handleChange}
            placeholder="Specify risks if any"
          />
        </div>

        {/* Patient Signature Block */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            padding: "20px",
            borderTop: "2px solid #80deea",
            paddingTop: "30px",
            marginTop: "30px",
          }}
        >
          <div
            className="left-signs"
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            <div>
              <div
                style={{
                  height: "60px",
                  borderBottom: "1px solid #333",
                  marginBottom: "8px",
                }}
              ></div>
              <small style={{ color: "#666", fontWeight: "600" }}>
                Patient's signature
              </small>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <MuiDateTimePicker
                  type="date"
                  label="Date"
                  name="patientSignDate"
                  value={formData.patientSignDate}
                  onChange={handleChange}
                />
                <MuiDateTimePicker
                  type="time"
                  label="Time"
                  name="patientSignTime"
                  value={formData.patientSignTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <TextInput
                label="Name of surgeon:"
                name="surgeonName"
                value={formData.surgeonName}
                onChange={handleChange}
              />
              <div
                style={{
                  height: "60px",
                  borderBottom: "1px solid #333",
                  marginBottom: "8px",
                  marginTop: "10px",
                }}
              ></div>
              <small style={{ color: "#666", fontWeight: "600" }}>
                Signature & Stamp
              </small>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <MuiDateTimePicker
                  type="date"
                  label="Date"
                  name="surgeonDate"
                  value={formData.surgeonDate}
                  onChange={handleChange}
                />
                <MuiDateTimePicker
                  type="time"
                  label="Time"
                  name="surgeonTime"
                  value={formData.surgeonTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div
            className="right-signs"
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            <div>
              <TextInput
                label="Witness name:"
                name="witnessName"
                value={formData.witnessName}
                onChange={handleChange}
              />
              <div
                style={{
                  height: "60px",
                  borderBottom: "1px solid #333",
                  marginBottom: "8px",
                  marginTop: "10px",
                }}
              ></div>
              <small style={{ color: "#666", fontWeight: "600" }}>
                Witness sign
              </small>
            </div>

            <div style={{ marginTop: "auto" }}>
              <TextInput
                label="Relation with patient:"
                name="relationWithPatient"
                value={formData.relationWithPatient}
                onChange={handleChange}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <MuiDateTimePicker
                  type="date"
                  label="Date"
                  name="witnessDate"
                  value={formData.witnessDate}
                  onChange={handleChange}
                />
                <MuiDateTimePicker
                  type="time"
                  label="Time"
                  name="witnessTime"
                  value={formData.witnessTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Final Agreement Section */}
        <div
          style={{
            marginTop: "40px",
            padding: "25px",
            backgroundColor: "#f0fbfa",
            border: "1px solid #80deea",
            borderRadius: "10px",
          }}
        >
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <input
              type="checkbox"
              name="agreementChecked"
              id="surgeryAgreementChecked"
              checked={formData.agreementChecked}
              onChange={handleChange}
              style={{ width: "28px", height: "28px", cursor: "pointer" }}
              required
            />
            <label
              htmlFor="surgeryAgreementChecked"
              style={{
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: "#008b8b",
              }}
            >
              I have read, understood and agree to the consent terms for
              surgery.
            </label>
          </div>
        </div>

        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Confirm Surgery Consent
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
            <span>🖨️</span> Print Surgery Consent
          </button>
        </div>

        {/* <button
            type="submit"
            className="submit-btn"
            style={{ marginTop: "40px" }}
          >
            Confirm Surgery Consent
          </button> */}
      </form>
    </div>
  );
};

export default SurgeryConsentForm;
