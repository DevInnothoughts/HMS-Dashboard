import React, { useState } from "react";
import TextInput from "../inputs/TextInput";
import MuiDateTimePicker from "../inputs/MuiDateTimePicker";
import SignatureInput from "../inputs/SignatureInput";
import "./Forms.css"; // Importing your shared CSS
import hhcLogo from "../../../../assets/images/logo/hhclogo.webp";

const AnesthesiaConsentForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    anesthesiaType: "",
    patientSignature: "",
    patientDate: null,
    witnessName: "",
    witnessSignature: "",
    witnessDate: null,
    anaesthetistName: "",
    anaesthetistSignature: "",
    anaesthetistDate: null,
    reason: "",
    attendantName: "",
    relationship: "",
    attendantSignature: "",
    attendantDateTime: null,
    attendantWitness: "",
    attendantWitnessSignature: "",
    attendantWitnessDateTime: null,
    attendantAnaesthetistName: "",
    attendantAnaesthetistSignature: "",
    attendantAnaesthetistDateTime: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ ...formData, patientHeader: patientData });
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
            
            .section-text { margin: 5px 0 0; text-align: justify; font-size: 13.5px; line-height: 1.6; }
            .fill-line { border-bottom: 1px solid #333; display: inline-block; min-width: 200px; padding: 0 5px; font-weight: bold; font-style: italic; }

            /* Checkbox Grid - To match your image layout */
            .cb-grid { display: flex; flex-wrap: wrap; gap: 15px; margin: 10px 0; font-weight: bold; font-size: 12px; }
            .cb-item { display: flex; align-items: center; }
            .box { width: 14px; height: 14px; border: 1px solid #000; margin-right: 6px; position: relative; background: #fff; }
            .checked::after { content: '✓'; position: absolute; top: -5px; left: 1px; font-size: 15px; color: #000; font-weight: bold; }

            /* Medical Table - Recreating the Benefits/Risks structure */
            .medical-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
            .medical-table th, .medical-table td { border: 1px solid #000; padding: 8px; vertical-align: top; text-align: left; }
            .medical-table th { background: #f2f2f2; font-weight: bold; }
            .bullet-list { margin: 0; padding-left: 18px; }
            .bullet-list li { margin-bottom: 4px; font-weight:normal; }
.page-break { page-break-before: always; clear: both; display: block; height: 0; }
            /* Signature Blocks */
            .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px; }
            .sig-item {  padding: 5px 0 5px 0; font-size: 12px; font-weight: bold; }

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

                <div class="section-text">
                INSTRUCTIONS: This consent form should be signed by the patient if an adult (18 years or older), by a parent/guardian if the patient is minor, by the
spouse / adult children / parents / adult siblings (in this order of priority) if the patient lacks the ability to make an informed decision. 
                </div>

                <div class="section-text">
                    1. I <span class="fill-line">${patientData?.name || ""}</span> (name of patient) understand that anaesthesia services are needed so that my doctor can perform the operation or procedure <span class="fill-line">${formData.surgeryName || ""}</span>. (name of surgery),<br>
                    I hereby consent to the anaesthesia service checked below:
                </div>

                <div class="cb-grid">
                    <div class="cb-item"><div class="box ${formData.anesthesiaType.includes("GA") ? "checked" : ""}"></div> GA_________________</div>
                    <div class="cb-item"><div class="box ${formData.anesthesiaType.includes("Nerve Block") ? "checked" : ""}"></div> Nerve Block</div>
                    <div class="cb-item"><div class="box ${formData.anesthesiaType.includes("GA with Elective Ventilation") ? "checked" : ""}"></div> GA with Elective Ventilation</div>
                    <div class="cb-item"><div class="box ${formData.anesthesiaType.includes("Monitored Anaesthesia Care") ? "checked" : ""}"></div> Monitored Anaesthesia Care</div>
                    <div class="cb-item"><div class="box ${formData.anesthesiaType.includes("Spinal / Epidural") ? "checked" : ""}"></div> Spinal / Epidural</div>
                </div>

                <div class="section-text">
                    2. I, hereby give my full voluntary consent for the administration of anaesthesia checked above & authorized by Dr. <span class="fill-line">${formData.anaesthetistName || ""}</span> or his/her associate. I also consent to alternative type of anaesthesia, necessary as deemed appropriate by them. I have understand the
risks, alternative & expected results of anaesthesia service. 
                </div>

                <table class="medical-table">
                    <tr>
                        <td class="label-col" rowspan="2">
                            General Anaesthesia<br><br>
                            <span style="font-weight:normal;">• With Sedation<br>• Without Sedation</span>
                        </td>
                        <td class="type-col">Benefits</td>
                        <td>
                            <ul class="bullet-list">
                                <li>Complete control of the airway, breathing and circulation...</li>
                                <li>Permits surgery in widely separated areas...</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="type-col">Risks</td>
                        <td>Mouth or throat pain, hoarseness, injury to mouth or teeth, awareness under
anaesthesia, injury to blood vessels, aspiration pneumonia
</td>
                    </tr>

                    <tr>
                        <td class="label-col" rowspan="3">
                            Spinal / Epidural<br><br>
                            <span style="font-weight:normal;">• With Sedation<br>• Without Sedation</span>
                        </td>
                        <td class="type-col">Benefits</td>
                        <td>
                            <ul class="bullet-list">
                                <li>Optimum method of anaesthesia for procedures needing anesthesia in lower half of the body, Easy post operative mobilization. </li>
                                <li>Reduced post operative pulmonary, thromboembolic and cardiac complications
</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="type-col">Risks</td>
                        <td>Headache, backache, buzzing in the ears, convulsions, infection, persistent weakness, numbness, residual pain. </td>
                    </tr>
                    <tr>
                        <td class="type-col">Alternative </td>
                        <td>May require conversion to GA</td>
                    </tr>

                    <tr>
                        <td class="label-col" rowspan="2">
                            Major/ Minor nerve block anaesthesia<br><br>
                            <span style="font-weight:normal;">• With Sedation<br>• Without Sedation</span>
                        </td>
                        <td class="type-col">Benefits</td>
                        <td>
                            <ul class="bullet-list">
                                <li>Patient can remain awake and breathe normally</li>
                                <li>Excellent pain relief</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="type-col">Risks</td>
                        <td>Infection, convulsions, persistent numbness, residual pain, injury to blood vessels</td>
                    </tr>

                    <tr>
                        <td class="label-col" rowspan="3">
                            Monitored Anaesthesia Care (Sedation)<br><br>
                            <span style="font-weight:normal;">• With Sedation<br>• Without Sedation</span>
                        </td>
                        <td class="type-col">Alternative Benefits</td>
                        <td>May require conversion to GA Safe sedation, control of patient anxiety Protection of airway</td>
                    </tr>
                    <tr>
                        <td class="type-col">Risks</td>
                        <td>Unconscious state, depressed breathing</td>
                    </tr>
                    <tr>
                        <td class="type-col">Alternative</td>
                        <td>May require conversion to GA</td>
                    </tr>
                    
                </table>

                <div class="section-text" style="font-size: 11px;">
                    3. I understand that there may be unforeseen complications in such an event the anaesthesia team may change the type Anaesthesia and take suitable
steps taking my best interest in mind and that i give my consent for the same.. <br>
                    4. I understand that during the invasive procedure may need special monitor and i give consent for the same.
                </div>

                <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <span>Patient Name : </span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    <span>Signature :  </span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    <span>Date/Time : </span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                </div>

                <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <span>Witness name : </span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    <span>Signature :  </span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    <span>Date/Time : </span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                </div>

                <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <span>Anaesthetist name : </span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    <span>Signature :  </span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    <span>Date/Time : </span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                </div>
               
                <div class="attendant-section">
                    <div style="text-align:center; font-weight:bold;">Attendant's Consent (If Applicable)</div>
                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                        <span>If patient unable to give consent, state the reason: (minor/unconscious/under-sedation/incapacity, if other please specify)</span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                        <span>Attendants name : </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        <span>Relationship with patient :  </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                        <span>Signature : </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        <span>Date :  </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        <span>Time : </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                        <span>Witness : </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        <span>Signature :  </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        <span>Date/Time : </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                        <span>Anaesthetist name : </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        <span>Signature :  </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        <span>Date/Time : </span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
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

                <div class="section-text" style="font-size: 11px; line-height: 1.4; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    सूचना : या संमती पत्रावर जर एखादा प्रौढ (१८ वर्षे किंवा त्याहून अधिक वयाचा) रुग्णाचा पालक / पालकाने किंवा पती / पत्नीच्या अल्पवयीन व्यक्तीने, किंवा प्रौढ मुले किंवा पालक, किंवा प्रौढ भाऊ किंवा वहिनीने या क्रमवारीने सही करावी. जर रुग्णाला माहितीपूर्ण निर्णय घेण्याची क्षमता नसेल तर डॉक्टर सूचित संमती मिळवण्यासाठी जबाबदार आहे.
                </div>

                <div class="sig-item" style="display: flex; align-items: flex-end; margin-top: 10px;">
                    <span>१) मी</span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 5px;">${patientData?.name || ""}</span>
                    <span>(रुग्णाचे नाव) असून मला पूर्ण माहित आहे की, माझ्या डॉक्टरांना</span>
                </div>

                <div class="sig-item" style="display: flex; align-items: flex-end; margin-top: 5px;">
                    <span>शस्त्रक्रिया करण्यासाठी भूलच्या सेवेची आवश्यकता आहे. शस्त्रक्रियेचे नाव:</span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 5px;">${formData.surgeryName || ""}</span>
                </div>

                <div class="cb-grid" style="margin-top: 15px;">
                    <div class="cb-item"><div class="box"></div> सामान्य भूल</div>
                    <div class="cb-item"><div class="box"></div> निवडक वायुविजम सह</div>
                    <div class="cb-item"><div class="box"></div> मज्जातंतू ब्लॉक</div>
                    <div class="cb-item"><div class="box"></div> पाठीचा कणा / एपिड्यूरल</div>
                    <div class="cb-item"><div class="box"></div> MAC</div>
                </div>

                <div class="sig-item" style="display: flex; align-items: flex-end; margin-top: 10px;">
                    <span>२) मी</span>
                    <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 5px;"></span>
                    <span>वर तपासलेल्या किंवा भूलतज्ञांच्या प्रशासनासाठी माझी पूर्ण ऐच्छिक संमती देतो आणि अधिकृत करतो आणि डॉ.</span><span style="flex:1; border-bottom: 1px dotted #000; margin-right: 5px;">${formData.anaesthetistName || ""}</span>
                </div>

                <div class="sig-item" style="display: flex; align-items: flex-end; margin-top: 5px;">
                    <span style="flex:1; border-bottom: 1px dotted #000; margin-right: 5px;">${formData.anaesthetistName || ""}</span>
                    <span>यांच्या / तिच्या सहयोगीद्वारे प्रशासित केले जाऊ शकते. त्यांना योग्य वाटेल त्या पर्यायी प्रकारच्या भूल देण्यास देखील मी संमती देतो. मला भुलीच्या सेवेचा धोका, पर्यायी आणि अपेक्षित परिणाम समजले आहेत.</span>
                </div>

                <table class="medical-table" style="font-size: 10px; line-height: 1.2;">
                    <tr>
                        <td class="label-col" rowspan="2" style="width: 20%;">
                            जेनरल ऍनस्थेशिया<br><br>
                            <span style="font-weight:normal;">• उपशामक औषधाशिवाय<br>• उपशामक औषधासह</span>
                        </td>
                        <td class="type-col" style="width: 10%;">फायदे</td>
                        <td>पूर्ण नियंत्रण वायुमार्ग, श्वासोच्छवास आणि रक्ताभिसरणामुळे रुग्णाला होणारा अवाजवी ताण कमी करणे आणि प्रक्रिया दरम्यान पूर्ण शांतता होणे यामुळे शरीराच्या मोठ्या प्रमाणात विभक्त भागात एकाच वेळी शस्त्रक्रिया रुग्णाला सुपाइन स्थितीतून न हलवता करता येते.</td>
                    </tr>
                    <tr>
                        <td class="type-col">धोका</td>
                        <td>तोंड किंवा घसा दुखणे, कर्कशपणा: तोंडाला दुखापत किंवा दातांना दुखापत होणे, रक्तवाहिन्यांना दुखापत होणे.</td>
                    </tr>

                    <tr>
                        <td class="label-col" rowspan="3">पाठीच्या कण्यात / एपिड्यूरल<br><br><span style="font-weight:normal;">• उपशामक औषधाशिवाय<br>• उपशामक औषधासह</span></td>
                        <td class="type-col">फायदे</td>
                        <td>शरीराच्या अर्ध्या भागात किंवा खालच्या भागात भूल देण्याच्या प्रक्रियेमध्ये ही भूलची इष्टतम पद्धत असून शस्त्रक्रियेनंतरची सुलभ गतिशीलता पोस्ट शस्त्रक्रिया पल्मोनरी, थ्रोम्बोइम्बोलिक आणि हृदयाची गुंतागुंत कमी होते.</td>
                    </tr>
                    <tr>
                        <td class="type-col">धोका</td>
                        <td>डोके दुखणे, पाठदुखी, कानात गुंजणे, आकडी येणे, आक्षेप संसर्गदोष, सतत अशक्तपणा येणे, सुन्नपणा, अवशिष्ट वेदना ब्लॉसेल वाहिन्यांना दुखापत होणे.</td>
                    </tr>
                    <tr>
                        <td class="type-col">पर्यायी</td>
                        <td>सामान्य भूलमध्ये रूपांतर असू शकते</td>
                    </tr>

                    <tr>
                        <td class="label-col" rowspan="2">प्रमुख / मायनर मज्जातंतू ब्लॉक भूल<br><br><span style="font-weight:normal;">• उपशामक औषधाशिवाय<br>• उपशामक औषधासह</span></td>
                        <td class="type-col">फायदे</td>
                        <td>रुग्ण जागरूक राहू शकतो आणि सामान्यपणे श्वास घेऊ शकतो.</td>
                    </tr>
                    <tr>
                        <td class="type-col">धोका</td>
                        <td>इंजेक्शन, आकुंचन, सतत, सुन्नपणा, अवशिष्ट वेदना, रक्तवाहिन्यांना दुखापत.</td>
                    </tr>

                    <tr>
                        <td class="label-col" rowspan="4">नियंत्रित ऍनेस्थेशिया केअर (शामक औषध)<br><br><span style="font-weight:normal;">• उपशामक औषधाशिवाय<br>• उपशामक औषधासह</span></td>
                        <td class="type-col">पर्यायी</td>
                        <td>सामान्य भूलमध्ये रूपांतर असू शकते</td>
                    </tr>
                    <tr>
                        <td class="type-col">फायदे</td>
                        <td>सुरक्षित उपशामक औषध, रुग्णाच्या चिंता आणि विरोधावर नियंत्रण वायुमार्गाचे संरक्षण.</td>
                    </tr>
                    <tr>
                        <td class="type-col">धोका</td>
                        <td>बेशुद्ध स्थिती, उदासीन श्वासोच्छवास पर्यायी.</td>
                    </tr>
                    <tr>
                        <td class="type-col">पर्यायी</td>
                        <td>सामान्य भूलमध्ये रूपांतर असू शकते</td>
                    </tr>
                </table>

                <div class="sig-item" style="display: flex; align-items: flex-end;">
                    <span>३. मला समजले आहे की काही वेळा अनपेक्षित गुंतागुंत होऊ शकते, अशा वेळी भूल देणारी टीम भुलीचा प्रकार बदलू शकते आणि माझ्या हितासाठी योग्य पावले उचलू शकते, त्यासाठी मी माझी संमती देतो.</span>
                </div>

                <div class="sig-item" style="display: flex; align-items: flex-end;">
                    <span>४) मला समजते की आक्रमक प्रक्रियेदरम्यान विशेष मॉनिटरची आवश्यकता असू शकते आणि त्यासाठी मी माझी संमती देतो.</span>
                </div>

                <div>
                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 10px;">
                        <div style="display: flex; flex: 1.2; align-items: flex-end;">
                            <span>रुग्णाचे पूर्ण नाव:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 5px;"></span>
                        </div>
                        <div style="display: flex; flex: 0.8; align-items: flex-end;">
                            <span>स्वाक्षरी:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 5px;"></span>
                        </div>
                        <div style="display: flex; flex: 0.8; align-items: flex-end;">
                            <span>दिनांक / वेळ:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 5px;"></span>
                        </div>
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 15px;">
                        <div style="display: flex; flex: 1.2; align-items: flex-end;">
                            <span>साक्षीदाराचे नाव:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 5px;"></span>
                        </div>
                        <div style="display: flex; flex: 0.8; align-items: flex-end;">
                            <span>स्वाक्षरी:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 5px;"></span>
                        </div>
                        <div style="display: flex; flex: 0.8; align-items: flex-end;">
                            <span>दिनांक / वेळ:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 5px;"></span>
                        </div>
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 15px;">
                        <div style="display: flex; flex: 1.2; align-items: flex-end;">
                            <span>सल्लागार नाव:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 5px;"></span>
                        </div>
                        <div style="display: flex; flex: 0.8; align-items: flex-end;">
                            <span>स्वाक्षरी:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 5px;"></span>
                        </div>
                        <div style="display: flex; flex: 0.8; align-items: flex-end;">
                            <span>दिनांक / वेळ:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 5px;"></span>
                        </div>
                    </div>
                </div>

                <div class="attendant-section" style=" margin-top: 8px; padding-top: 5px;">
                    <div style="text-align:center; font-weight:bold; margin-bottom: 10px;">उपस्थितांची संमती ( लागू असल्यास )</div>
                    
                    <div class="sig-item" style="display: flex; align-items: flex-end;">
                        <span>जर रुग्ण संमती देऊ शकत नसेल , तर कारण सांगा : (किरकोळ / बेशुद्ध /अशक्तपणा / अ क्षमता , इतर कृपया निर्दिष्ट करा:</span>
                        <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 5px;"></span>
                        <span>)</span>
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 15px;">
                        <div style="display: flex; flex: 1.5; align-items: flex-end;">
                            <span>परिचराचे नाव:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        </div>
                        <div style="display: flex; flex: 1; align-items: flex-end;">
                            <span>रुग्णाशी नाते:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 10px;"></span>
                        </div>
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 15px;">
                        <div style="display: flex; flex: 1; align-items: flex-end;">
                            <span>स्वाक्षरी:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        </div>
                        <div style="display: flex; flex: 1; align-items: flex-end;">
                            <span>दिनांक / वेळ:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 10px;"></span>
                        </div>
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 15px;">
                        <div style="display: flex; flex: 1; align-items: flex-end;">
                            <span>सल्लागार नाव :</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        </div>
                        <div style="display: flex; flex: 1; align-items: flex-end;">
                            <span>स्वाक्षरी:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        </div>
                        <div style="display: flex; flex: 1; align-items: flex-end;">
                            <span>दिनांक / वेळ:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 10px;"></span>
                        </div>
                    </div>

                    <div class="sig-item" style="display: flex; justify-content: space-between; margin-top: 15px;">
                        <div style="display: flex; flex: 1; align-items: flex-end;">
                            <span>साक्षीदाराचे नाव :</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        </div>
                        <div style="display: flex; flex: 1; align-items: flex-end;">
                            <span>स्वाक्षरी:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin: 0 10px;"></span>
                        </div>
                        <div style="display: flex; flex: 1; align-items: flex-end;">
                            <span>दिनांक / वेळ:</span>
                            <span style="flex:1; border-bottom: 1px dotted #000; margin-left: 10px;"></span>
                        </div>
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
  // print form format ends

  return (
    <div className="medical-form-container">
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">ANESTHESIA CONSENT FORM</h2>

        {/* Patient Header */}
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
              <span className="info-value">
                {patientData.age}/{patientData.gender}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">IP No</span>
              <span className="info-value">{patientData.ipNo}</span>
            </div>
          </div>
        )}

        {/* Anesthesia Details */}
        <div className="section-box">
          <div className="form-section-title">Consent Details</div>
          <div className="form-field">
            <TextInput
              label="Proposed Type of Anesthesia"
              name="anesthesiaType"
              value={formData.anesthesiaType}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Primary Signatures */}
        <div className="section-box">
          <div className="form-section-title">Primary Signatures (Patient)</div>

          <div
            className="three-col"
            style={{ alignItems: "flex-end", marginBottom: "15px" }}
          >
            <TextInput
              label="Patient Name"
              value={patientData?.name || ""}
              readOnly
            />
            <SignatureInput
              label="Signature"
              name="patientSignature"
              value={formData.patientSignature}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="patientDate"
              value={formData.patientDate}
              onChange={handleChange}
            />
          </div>

          <div
            className="three-col"
            style={{ alignItems: "flex-end", marginBottom: "15px" }}
          >
            <TextInput
              label="Witness Name"
              name="witnessName"
              value={formData.witnessName}
              onChange={handleChange}
            />
            <SignatureInput
              label="Signature"
              name="witnessSignature"
              value={formData.witnessSignature}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="witnessDate"
              value={formData.witnessDate}
              onChange={handleChange}
            />
          </div>

          <div className="three-col" style={{ alignItems: "flex-end" }}>
            <TextInput
              label="Anaesthetist Name"
              name="anaesthetistName"
              value={formData.anaesthetistName}
              onChange={handleChange}
            />
            <SignatureInput
              label="Signature"
              name="anaesthetistSignature"
              value={formData.anaesthetistSignature}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="anaesthetistDate"
              value={formData.anaesthetistDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Attendant Consent */}
        <div
          className="section-box"
          style={{ borderTop: "3px solid var(--primary-color)" }}
        >
          <div className="form-section-title">
            Attendant's Consent (If Applicable)
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginBottom: "10px",
            }}
          >
            Required if patient is a minor, unconscious, or otherwise
            incapacitated.
          </p>

          <div className="form-field">
            <TextInput
              label="Reason for Attendant Consent"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g., Minor, Unconscious, Sedation"
            />
          </div>

          <div className="two-col">
            <TextInput
              label="Attendant Name"
              name="attendantName"
              value={formData.attendantName}
              onChange={handleChange}
            />
            <TextInput
              label="Relationship with Patient"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
            />
          </div>

          <div
            className="two-col"
            style={{ alignItems: "flex-end", marginTop: "10px" }}
          >
            <SignatureInput
              label="Attendant Signature"
              name="attendantSignature"
              value={formData.attendantSignature}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="attendantDateTime"
              value={formData.attendantDateTime}
              onChange={handleChange}
            />
          </div>

          <div
            className="three-col"
            style={{ alignItems: "flex-end", marginTop: "15px" }}
          >
            <TextInput
              label="Witness Name"
              name="attendantWitness"
              value={formData.attendantWitness}
              onChange={handleChange}
            />
            <SignatureInput
              label="Signature"
              name="attendantWitnessSignature"
              value={formData.attendantWitnessSignature}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="attendantWitnessDate"
              value={formData.attendantWitnessDateTime}
              onChange={handleChange}
            />
          </div>

          <div
            className="three-col"
            style={{ alignItems: "flex-end", marginTop: "15px" }}
          >
            <TextInput
              label="Anaesthetist Name"
              name="attendantAnaesthetistName"
              value={formData.attendantAnaesthetistName}
              onChange={handleChange}
            />
            <SignatureInput
              label="Signature"
              name="attendantAnaesthetistSignature"
              value={formData.attendantAnaesthetistSignature}
              onChange={handleChange}
            />
            <MuiDateTimePicker
              label="Date & Time"
              name="attendantAnaesthetistDate"
              value={formData.attendantAnaesthetistDateTime}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* <button type="submit" className="submit-btn">
          Submit Anesthesia Consent
        </button> */}
        <div className="two-col" style={{ marginTop: "2rem", gap: "15px" }}>
          <button
            type="submit"
            className="submit-btn"
            style={{ margin: 0, width: "100%" }}
          >
            Submit Anesthesia Consent
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
            <span>🖨️</span> Print Anesthesia Consent Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnesthesiaConsentForm;
