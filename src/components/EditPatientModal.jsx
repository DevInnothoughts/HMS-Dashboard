import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const BASE_URL = 'http://194.195.117.79:5100/api';
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const dob = new Date(birthDate);
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970).toString();
};

export default function EditPatientModal({ show, onHide, patientData, currentLocation, doctors, fdeList, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [workPatterns, setWorkPatterns] = useState({
    Sedentary: false,
    Travelling: false,
    'Strenuous (Physical Activity)': false,
    'Mentally Stressful': false,
  });
  const [selectedReference, setSelectedReference] = useState('');
  const [referenceDetails, setReferenceDetails] = useState({
    newspaper: '',
    dr_name: '',
    dr_id: '',
    internet: '',
    MediaRef: '',
    TVShow: '',
    Other_Newspaper: '',
    friendname: '',
    friendno: '',
    HHC_board: '',
    HHF: '',
    other: '',
    WOM: '',
    awareness_lecture: '',
    treated_past_status: '',
    hhc_branch: '',
    aggregators: '',
  });
  const [oldPatientDetails, setOldPatientDetails] = useState({
    patient_ref_no: '',
    old_patient_name: '',
    old_patient_id_value: '',
    old_patient_pincode: '',
  });

  useEffect(() => {
    if (show && patientData) {
      handleEditPatient(patientData);
    }
  }, [show, patientData]);

  const handleEditPatient = (patient) => {
    console.log("Editing patient:", patient);

    const formattedBirthDate = patient.birth_date || "";
    const workPatternsArray = (patient.specific_work || "")
      .split(",")
      .map((item) => item.trim());

    const age = patient.age || calculateAge(formattedBirthDate) || "";

    if (patient.reference_type === "old_ref") {
      const parts = (patient.ref || "").split(",");
      setOldPatientDetails({
        patient_ref_no: parts[0] || "",
        old_patient_name: parts[1] || "",
        old_patient_id_value: parts[2] || "",
        old_patient_pincode: parts[3] || "",
      });
    } else if (patient.reference_type === "dr_ref") {
      setReferenceDetails((prev) => ({
        ...prev,
        dr_name: patient.ref_doctor_name || patient.ref || "",
        dr_id: patient.ref_doctor_name ? patient.ref || "" : "",
      }));
    } else {
      const standardNewspapers = [
        "Sakal",
        "TOI",
        "MT",
        "Lokmat",
        "Pune Mirror",
      ];
      setReferenceDetails((prev) => ({
        ...prev,
        [patient.reference_type]: patient.ref || "",
        Other_Newspaper:
          patient.reference_type === "newspaper" &&
            !standardNewspapers.includes(patient.ref)
            ? patient.ref
            : "",
      }));
    }

    console.log("Setting formData for prefix:", patient.prefix);
    setFormData({
      // Uid_no: patient.uid || "",
      Uid_no: patient.Uid_no || patient.uid || "",
      date: patient.date || "",
      prefix: (patient.prefix || "").trim().toUpperCase(),
      name: patient.name || "",
      patient_type: Boolean(patient.patient_type),
      email: patient.email || "",
      address: patient.address || "",
      // country: patient.country || "",
      // state: patient.state || "",
      // city: patient.city || "",
      sex: patient.sex || "",
      phone: patient.phone || "",
      mobile_2: patient.mobile_2 || "",
      pincode: patient.pincode || "",
      blood_group: patient.blood_group || "",
      identity: patient.identity || "",
      identityNumber: patient.identityNumber || "",
      birth_date: formattedBirthDate,
      age: age,
      occupation: patient.occupation || "",
      companyname: patient.companyname || "",
      reference_type: patient.reference_type || "",
      ref: patient.ref || "",
      // specific_work: Boolean(patient.specific_work) || "",
      specific_work: patient.specific_work || "",
      patient_id: patient.patient_id || "",
      nationality: patient.additional_info?.nationality || "",
      language: patient.additional_info?.language || "",
    });

    setWorkPatterns({
      Sedentary: workPatternsArray.includes("Sedentary"),
      Travelling: workPatternsArray.includes("Travelling"),
      "Strenuous (Physical Activity)": workPatternsArray.includes(
        "Strenuous (Physical Activity)",
      ),
      "Mentally Stressful": workPatternsArray.includes("Mentally Stressful"),
    });
    setSelectedReference(patient.reference_type || "");
    
    
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!patientData) {
      toast.error("No patient selected for editing.");
      return;
    }

    let reference_type = patientData.ref;
    let ref = "";

    switch (selectedReference) {
      case "newspaper":
        reference_type = "newspaper";
        ref = referenceDetails.newspaper || formData.ref || "";
        break;
      case "dr_ref":
        reference_type = "dr_ref";
        ref = referenceDetails.dr_id || referenceDetails.dr_name || "";
        break;
      case "internet":
        reference_type = "internet";
        ref = referenceDetails.internet || formData.ref || "";
        break;
      case "MediaRef":
        reference_type = "MediaRef";
        ref = referenceDetails.MediaRef || formData.ref || "";
        break;
      case "TVShow":
        reference_type = "TVShow";
        ref = referenceDetails.TVShow || formData.ref || "";
        break;
      case "old_ref":
        reference_type = "old_ref";
        ref = `${oldPatientDetails.patient_ref_no || ""},${oldPatientDetails.old_patient_name || ""
          },${oldPatientDetails.old_patient_id_value || ""},${oldPatientDetails.old_patient_pincode || ""
          }`;
        break;
      case "family_friends":
        reference_type = "family_friends";
        ref = `${referenceDetails.friendname || ""},${referenceDetails.friendno || ""
          }`;
        break;
      case "hhc_board":
        reference_type = "hhc_board";
        ref = referenceDetails.HHC_board || formData.ref || "";
        break;
      case "HHF":
        reference_type = "HHF";
        ref = referenceDetails.HHF || formData.ref || "";
        break;
      case "other":
        reference_type = "other";
        ref = referenceDetails.other || formData.ref || "";
        break;
      case "WOM":
        reference_type = "WOM";
        ref = referenceDetails.WOM || formData.ref || "";
        break;
      case "awareness_lecture":
        reference_type = "awareness_lecture";
        ref = referenceDetails.awareness_lecture || formData.ref || "";
        break;
      case "treated_past":
        reference_type = "treated_past";
        ref = referenceDetails.treated_past_status || formData.ref || "";
        break;
      case "hhc_branch":
        reference_type = "hhc_branch";
        ref = referenceDetails.hhc_branch || formData.ref || "";
        break;
      case "aggregators":
        reference_type = "aggregators";
        ref = referenceDetails.aggregators || formData.ref || "";
        break;
      default:
        reference_type = null;
        ref = referenceDetails[selectedReference] || formData.ref;
    }

    console.log("Reference Type:", reference_type);
    console.log("Reference:", ref);

    const specificWork = Object.entries(workPatterns)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(",");

    const updatedPatientData = {
      ...formData,
      prefix: (formData.prefix || "").toUpperCase(),
      patientName: formData.name,
      mobileNo: formData.phone,
      date: formData.date || "",
      birth_date: formData.birth_date,
      age: calculateAge(formData.birth_date),
      specific_work: specificWork,
      // reference_type: formData.reference_type,
      // ref: formData.ref
      reference_type: reference_type,
      ref: ref,
      additional_info: {
        nationality: formData.nationality,
        language: formData.language,
      },
    };

    console.log("Updated Patient Data:", updatedPatientData);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/patient/editPatient?patient_id=${patientData.patient_id}&location=${currentLocation}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPatientData),
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: "Patient information updated successfully",
        });
        

        if (onSuccess) onSuccess();

        onHide();
        setSelectedPatient(null);
        setFormData({});
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: responseData.message || "Failed to update patient",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please check your connection and try again.",
      });
    }
  };

        "Mysore",
        "Kalaburagi",
      ].includes(location)
    ) {
      regionalConsent = `<p>ನಾನು, ಕೆಳಗೆ ಸಹಿ ಮಾಡಿದ ರೋಗಿ ಅಥವಾ ಜವಾಬ್ದಾರಿಯುತ ಸಂಬಂಧಿ ..........................................................................................................<br> ಈ ಮೂಲಕ ಹೀಲಿಂಗ್ ಹ್ಯಾಂಡ್ಸ್ ಕ್ಲಿನಿಕ್ ವೈದ್ಯರಿಗೆ ಒಪ್ಪಿಗೆ ಮತ್ತು ಅಧಿಕಾರವನ್ನು ನೀಡಿ , ಶಸ್ತ್ರಚಿಕಿತ್ಸಕರು ಮತ್ತು ವೈದ್ಯಕೀಯ ವ್ಯಕ್ತಿಗಳು ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು, ತನಿಖೆಗಳು, ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಗಳು ಮತ್ತು ಹೊರರೋಗಿ ಕಾರ್ಯವಿಧಾನವನ್ನು ಹೊರರೋಗಿಯಾಗಿ, ಸಲಹೆ ಅಥವಾ ಅಗತ್ಯವೆಂದು ಪರಿಗಣಿಸಿ ವೈದ್ಯಕೀಯ ಆರೈಕೆಯ ಸಮಯದಲ್ಲಿ ನಿರ್ವಹಿಸುತ್ತಾರೆ ಮತ್ತು ನಿರ್ವಹಿಸುತ್ತಾರೆ.<br>ನಾನು ಹೀಲಿಂಗ್ ಹ್ಯಾಂಡ್ಸ್ ಕ್ಲಿನಿಕ್ ನೀತಿಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಮತ್ತು ಸ್ವೀಕರಿಸುತ್ತೇನೆ ಮತ್ತು ಅವುಗಳನ್ನು ಪಾಲಿಸಲು ಒಪ್ಪುತ್ತೇನೆ. ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು ಮತ್ತು ಫಾಲೋ-ಅಪ್‌ಗಳ ಬಗ್ಗೆ ಅಗತ್ಯವಿದ್ದರೆ ನನ್ನನ್ನು/ಅವನನ್ನು/ಅವಳನ್ನು ದೂರವಾಣಿ ಮೂಲಕ ಸಂಪರ್ಕಿಸಲು ನಾನು ಕ್ಲಿನಿಕ್‌ಗೆ ಒಪ್ಪಿಗೆ ನೀಡುತ್ತೇನೆ.| ಖಾಸಗಿತನವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲಾಗುವುದು ಎಂದು ತಿಳಿದುಕೊಂಡು ಕ್ಲಿನಿಕ್ ಮತ್ತು ವೈದ್ಯರು ನನ್ನ/ಅವನ/ಅವಳ ವೈದ್ಯಕೀಯ ಸಮಸ್ಯೆಗಳ ಬಗ್ಗೆ ಚರ್ಚಿಸಲು ಅವಕಾಶ ಮಾಡಿಕೊಡಿ.<br>ನಾನು ಕೆಳಗೆ ಸಹಿ ಮಾಡಿದ್ದೇನೆ, ನನ್ನ ಸಮಾಲೋಚನೆ/ಚಿಕಿತ್ಸೆಯ ಸಮಯದಲ್ಲಿ ಕಂಡುಬರುವ ಯಾವುದೇ ಗಮನಿಸಿದ/ಚರ್ಚಿತ/ಹೊಸ ಮಾಹಿತಿಯನ್ನು ಭವಿಷ್ಯದಲ್ಲಿ ಅಧ್ಯಯನ ಉದ್ದೇಶಗಳಿಗೆ/ಸಂಶೋಧನೆಗಾಗಿ ಬಳಸಲು ಅನುಮತಿಯನ್ನು ನೀಡುತ್ತೇನೆ</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (ರೋಗಿಯ ಹೆಸರು):</b></p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(ರೋಗಿಯ ಸಹಿ)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(ಸಾಕ್ಷಿದಾರರ ಸಹಿ)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(ಸಮಯ ಮತ್ತು ದಿನಾಂಕ)`;
    } else if (["Ludhiana", "Mohali"].includes(location)) {
      regionalConsent = `<p>ਮੈਂ, ਹੇਠਾਂ ਹਸਤਾਖਰ ਕਰਨ ਵਾਲਾ ਮਰੀਜ਼ ਜਾਂ ਜ਼ਿੰਮੇਵਾਰ ਰਿਸ਼ਤੇਦਾਰ ..........................................................................................................<br> ਇਸ ਦੁਆਰਾ ਹੀਲਿੰਗ ਹੈਂਡਸ ਕਲੀਨਿਕ ਦੇ ਡਾਕਟਰਾਂ, ਸਰਜਨਾਂ ਅਤੇ ਮੈਡੀਕਲ ਕਰਮਚਾਰੀਆਂ ਨੂੰ ਡਾਕਟਰੀ ਜਾਂਚ, ਤਫਤੀਸ਼, ਡਾਕਟਰੀ ਇਲਾਜ ਅਤੇ ਆਊਟ-ਪੇਸ਼ੈਂਟ ਪ੍ਰਕਿਰਿਆ ਕਰਨ ਦੀ ਸਹਿਮਤੀ ਅਤੇ ਅਧਿਕਾਰ ਦਿੰਦਾ ਹਾਂ, ਜੋ ਕਿ ਡਾਕਟਰੀ ਦੇਖਭਾਲ ਦੇ ਦੌਰਾਨ ਇੱਕ ਆਊਟ-ਪੇਸ਼ੈਂਟ ਵਜੋਂ ਉਚਿਤ ਜਾਂ ਜ਼ਰੂਰੀ ਸਮਝਿਆ ਜਾਂਦਾ ਹੈ।<br>ਮੈਂ ਹੀਲਿੰਗ ਹੈਂਡਸ ਕਲੀਨਿਕ ਦੀਆਂ ਨੀਤੀਆਂ ਨੂੰ ਸਮਝਦਾ ਅਤੇ ਸਵੀਕਾਰ ਕਰਦਾ ਹਾਂ ਅਤੇ ਉਹਨਾਂ ਦੀ ਪਾਲਣਾ ਕਰਨ ਲਈ ਸਹਿਮਤ ਹਾਂ। ਮੈਂ ਕਲੀਨਿਕ ਨੂੰ ਨਿਯੁਕਤੀਆਂ ਅਤੇ ਫਾਲੋ-ਅਪਸ ਦੇ ਸਬੰਧ ਵਿੱਚ ਲੋੜ ਪੈਣ 'ਤੇ ਟੈਲੀਫੋਨ ਰਾਹੀਂ ਮੇਰੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਦੀ ਸਹਿਮਤੀ ਵੀ ਦਿੰਦਾ ਹਾਂ। ਮੈਂ ਕਲੀਨਿਕ ਅਤੇ ਡਾਕਟਰਾਂ ਨੂੰ ਮੇਰੇ ਮੈਡੀਕਲ ਮੁੱਦਿਆਂ ਬਾਰੇ ਆਪਸ ਵਿੱਚ ਚਰਚਾ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿੰਦਾ ਹਾਂ, ਇਹ ਜਾਣਦੇ ਹੋਏ ਕਿ ਗੋਪਨੀਯਤਾ ਬਣਾਈ ਰੱਖੀ ਜਾਵੇਗੀ।<br>ਮੈਂ, ਹੇਠਾਂ ਹਸਤਾਖਰ ਕਰਕੇ, ਮੇਰੀ ਸਲਾਹ/ਇਲਾਜ ਦੌਰਾਨ ਮਿਲੀ ਕਿਸੇ ਵੀ ਨਵੀਂ ਜਾਣਕਾਰੀ ਨੂੰ ਭਵਿੱਖ ਵਿੱਚ ਅਧਿਐਨ ਦੇ ਉਦੇਸ਼ਾਂ/ਖੋਜ ਲਈ ਵਰਤਣ ਦੀ ਇਜਾਜ਼ਤ ਦਿੰਦਾ ਹਾਂ।</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (ਮਰੀਜ਼ ਦਾ ਨਾਮ):</b></p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(ਮਰੀਜ਼ ਦੇ ਦਸਤਖਤ)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(ਗਵਾਹ ਦੇ ਦਸਤਖਤ)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(ਸਮਾਂ ਅਤੇ ਮਿਤੀ)`;
    } else if (["Surat", "Ahmedabad"].includes(location)) {
      regionalConsent = `<p>હું, નીચે સહી કરનાર દર્દી અથવા જવાબદાર સંબંધી ..........................................................................................................<br> આથી હીલિંગ હેન્ડ્સ ક્લિનિકના ડોકટરો, સર્જનો અને તબીબી વ્યક્તિઓને તબીબી તપાસ, તપાસ, તબીબી સારવાર અને આઉટ-પેશન્ટ પ્રક્રિયા કરવા માટે સંમતિ અને અધિકાર આપું છું, જે તબીબી સંભાળ દરમિયાન આઉટ-પેશન્ટ તરીકે યોગ્ય અથવા જરૂરી માનવામાં આવે છે.<br>હું હીલિંગ હેન્ડ્સ ક્લિનિકની નીતિઓને સમજું છું અને સ્વીકારું છું અને તેનું પાલન કરવા સંમત થાઉં છું। એપોઇન્ટમેન્ટ અને ફોલો-અપ્સ અંગે જરૂર પડે તો ટેલિફોન દ્વારા મારો સંપર્ક કરવા માટે હું ક્લિનિકને સંમતિ પણ આપું છું। હું ક્લિનિક અને ડોકટરોને મારી તબીબી સમસ્યાઓ વિશે આપસમાં ચર્ચા કરવાની મંજૂરી આપું છું, એ જાણીને કે ગોપનીયતા જાળવવામાં આવશે।<br>હું, નીચે સહી કરનાર, મારી પરામર્શ/સારવાર દરમિયાન મળેલી કોઈપણ નવી માહિતીનો ભવિષ્યમાં અભ્યાસના હેતુઓ/સંશોધન માટે ઉપયોગ કરવાની પરવાનગી આપું છું।</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (દર્દીનું નામ):</b></p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(દર્દીની સહી)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(સાક્ષીની સહી)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(સમય અને તારીખ)`;
    } else if (
      [
        "DP Road",
        "Baner",
        "Tilak Road",
        "Salunkhe Vihar",
        "Chinchwad",
        "Chakan",
        "Dighi",
        "Katraj",
        "Navi Mumbai",
        "Kemps Corner",
        "Andheri",
        "Thane",
        "Kolhapur",
        "Latur",
        "Nashik",
        "Undri",
        "Hinjewadi",
        "Vashi",
      ].includes(location)
    ) {
      regionalConsent = `<p>मी खाली सही करणारा रुग्ण / रुग्णाचा जबाबदार पालक/ नातेवाईक ..........................................................................................................<br> हीलींग हॅन्डस् क्लिनीक येथिल चिकिसक शल्यविशाराद व वैधकीय कर्मचारी याना बाहय रुग्ण म्हणून सदर रुग्णाच्या हितासाठी / आरोग्यासाठी आवश्यक त्या सर्व नैदानिक तपासण्या परीक्षणे, वैद्यकीय औषधोपचार व लघुशस्त्रक्रिया करण्यास परवानगी देतो. मला हीलींग हॅन्डस क्लिनीकची सर्व धोरणे ज्ञात सून मी त्याचे पालन करण्यास तयार आहे. मी खाली सही करणार अशी ही संमती देतो की मला तपासणीच्या वेळेतील बदल किंवा फेरतपासणीबाबतच्या वेळेतील व इतर अन्य बदल कळविण्याकरीता केलेल्या दूरध्वनी संपर्कबद्दल मला आक्षेप असणार नाही. मी, क्लिनिक व डॉक्टर यांना माझ्या / त्याच्या/ तिच्या वैदयकिय समस्थाची आपआपसांत चर्चा करण्याची परवानगी देत आहे तसेच यांची गोपनियता राखण्यात येईल याची मला माहीती दिलेली आहे. मी खाली सही करणारा/करणारी, माझ्या उपचाराच्या दरम्यान प्राप्त झालेली / सापडलेली कोणत्याही प्रकारच्या माहितीचे उपयोग भविष्यकालीन अभ्यासासाठी / संशोधनासाठी करण्याची परवानगी देत आहे.</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (रुग्णाचे नाव):</b>:</p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(रुग्णाची सही)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(साक्षीदाराची सही)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(वेळ व दिनांक)`;
    } else {
      regionalConsent = `<p>मैं, निम्नलिखित मरीज या जिम्मेदार रिश्तेदार ..........................................................................................................<br> यहाँ इलाज के दौरान चिकित्सक, सर्जन और चिकित्सा व्यक्तियों को अनुमति और अधिकार देता हूँ कि वे चिकित्सा परीक्षण, जांच, चिकित्सा उपचार और बाह्य दूरस्थ प्रक्रिया कार्यान्वित करें, जो उपयुक्त या आवश्यक माने जाते हैं।<br>मैं हीलिंग हैंड्स क्लिनिक की नीतियों को समझता और स्वीकार करता हूँ और उनका पालन करने के लिए सहमत हूँ। मैं यह भी स्वीकार करता हूँ कि क्लिनिक को मुझसे / उससे फोन पर संपर्क करने की अनुमति है यदि अपॉइंटमेंट और फॉलो-अप के संबंध में जरूरत हो। मैं क्लिनिक और डॉक्टरों को यहाँ बताए गए चिकित्सा मुद्दों के बारे में चर्चा करने की अनुमति देता हूँ, जानते हुए कि गोपनीयता का पालन किया जाएगा।<br>मैं, नीचे लिखे गए, अपनी परमिशन देता हूँ कि मेरी परामर्श / उपचार के दौरान किसी भी देखी गई / चर्चित / नई जानकारी का भविष्य में अध्ययन के उद्देश्यों / अनुसंधान के लिए उपयोग किया जा सकता है।</p>`;

      regionalPatientSignature = `<p><b>Patients Signature:<br>(रोगी के हस्ताक्षर)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(गवाह के हस्ताक्षर)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(समय और दिनांक)`;
    }

    const patientName = `${patient.prefix ? patient.prefix + "." : ""}${patient.name || ""}`;
    const today = moment().format("DD-MM-YYYY");

    printWindow.document.write(`
    <html>
      <head>
        <title>Print Registration Form</title>
        <style>
          .vip-logo-img {
              width: 20px; 
              height: auto;
              vertical-align: middle;
              margin-bottom:1.5px;
          }
          body, table, tr, td, p { font-size: 11px !important; text-align: justify; font-family: Arial, sans-serif; }
          .HHClogo { width: 50%; }
          .bgdiv { padding: 10px; }
          h1 { font-size: 22px; text-align: right; color: #509286; font-weight: 600; margin: 0; }
          h2 { font-size: 18px; text-align: right; color: #509286; font-weight: 600; margin: 0; }
          hr { margin: 10px 0; border: 0; border-top: 1px solid rgb(75,137,126); border-bottom: 1px solid rgb(75,137,126); }
          @media print {
  .no-print {
    display: none !important;
  }
}
.print-btn-container {
  text-align: center;
  padding: 20px;
}
.actual-print-button {
  padding: 10px 10px;
  background-color: #427269;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}
          </style>

      <body>
        <div class="bgdiv">
          <table width="100%" border="0">
            <tr>
              <td style="width:50%;"><img src="${logo}" class="HHClogo"></td>
              <td style="width:50%;">
                <h1>Registration Form</h1>
                <p style="text-align:right"><b>Date:</b> ${today}</p>
              </td>
            </tr>
          </table>
          <br><br>
          <table width="100%" border="0">
            <tr>
            <td style="width:50%; vertical-align: top; line-height: 1.3;">
              <p><b>UID No :-</b>&nbsp;&nbsp;${patient.Uid_no || "-"}</p>
              <p style="margin:0;"><b>Name :-</b>&nbsp;&nbsp;${patientName}${vipIcon}</p>
              <p><b>Gender :-</b>&nbsp;&nbsp;${patient.sex || "-"}</p>
              <p><b>Address :-</b>&nbsp;&nbsp;${patient.address || "-"}</p>
              <p><b>Contact No :-</b>&nbsp;&nbsp;${patient.phone || "-"}</p>
              <p><b>Alternate Contact No :-</b>&nbsp;&nbsp;${patient.mobile_2 || "-"}</p>
            </td>
            <td style="width:50%; vertical-align: top; line-height: 1.3;">
              <p><b>D.O.B :-</b>&nbsp;&nbsp;${patient.birth_date || "-"}</p>
              <p><b>Age :-</b>&nbsp;&nbsp;${patient.age || "-"}</p>
              <p><b>Email :-</b>&nbsp;&nbsp;${patient.email || "-"}</p>
              <p><b>Occupation :-</b>&nbsp;&nbsp;${patient.occupation || "-"}</p>
              ${patient.companyname ? `<p><b>Company Name :-</b>&nbsp;&nbsp;${patient.companyname}</p>` : ""}
              ${patient.ref_doctor_name || patient.ref ? `<p><b>Reference :-</b>&nbsp;&nbsp;${patient.ref_doctor_name || patient.ref}</p>` : ""}
            </td>
          </tr>
          </table>
          <hr>
          <table width="100%" border="0">
            <tr><td><h2 style="margin-top:10px;">OPD CONSENT FORM</h2></td></tr>

  return (
        show={show}
        onHide={() => onHide()}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }}
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          >
            <FeatherIcon icon="edit" className="me-2" size="16" />
            Edit Patient Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            backgroundColor: "#f8fbfc",
            fontSize: "13px",
            padding: "5px",
          }}
        >
          <Form id="edit-patient-form" onSubmit={handleSaveChanges}>
            <div
              className="p-3 mb-4 bg-white rounded shadow-sm border"
              style={{ borderLeft: "5px solid rgb(77, 208, 225)" }}
            >
              <h5
                style={{
                  color: "rgba(67, 162, 174, 1)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  padding: "5px",
                }}
              >
                Basic Registration Info
              </h5>
              <Row>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      UID No <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="Uid_no"
                      value={formData.Uid_no}
                      readOnly
                      required
                      style={{
                        backgroundColor: "#e7ebebff",
                        cursor: "not-allowed",
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Prefix <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      required
                      name="prefix"
                      value={formData.prefix || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select Prefix</option>
                      <option value="MR">MR</option>
                      <option value="MRS">MRS</option>
                      <option value="MASTER">MASTER</option>
                      <option value="MISS">MISS</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Patient Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      required
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Patient Name"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col
                  md={2}
                  className="mb-3 align-items-center justify-content-center"
                >
                  <Form.Group
                    className="rounded border text-center"
                    style={{ backgroundColor: "#94e2eeff" }}
                  >
                    <Form.Label
                      className="small fw-bold d-block mb-5"
                      style={{ marginTop: "5px", fontSize: "12px" }}
                    >
                      VIP Patient
                    </Form.Label>
                    <Form.Check
                      type="checkbox"
                      id="patient_type"
                      name="patient_type"
                      checked={
                        formData.patient_type === 1 ||
                        formData.patient_type === true
                      }
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          patient_type: e.target.checked ? 1 : 0,
                        });
                      }}
                      style={{
                        transform: "scale(1.4)",
                        cursor: "pointer",
                        marginBottom: "5px",
                        fontSize: "12px",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="p-3 mb-4 bg-white rounded shadow-sm border">
              <h4
                style={{
                  color: "rgba(67, 162, 174, 1)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  padding: "5px",
                }}
              >
                Contact & Personal Details
              </h4>
              <Row>
                <Col md={4} className="mb-15">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Email ID
                      {/* <span className="text-danger">*</span> */}
                    </Form.Label>
                    <Form.Control
                      // required
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Email"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Gender <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      required
                      name="sex"
                      value={formData.sex || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Contact Number <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="number"
                      name="phone"
                      value={formData.phone}
                      onWheel={(e) => e.target.blur()}
                      onChange={handleInputChange}
                      placeholder="Enter Contact Number"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Alt. Contact Number
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="mobile_2"
                      value={formData.mobile_2}
                      onWheel={(e) => e.target.blur()}
                      onChange={handleInputChange}
                      placeholder="Enter Secondary Contact No"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-15">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Nationality <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      required
                    >
                      <option value="">Select Nationality</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={7} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Address <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="address"
                      onWheel={(e) => e.target.blur()}
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Residential Address"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Pincode <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="number"
                      name="pincode"
                      onWheel={(e) => e.target.blur()}
                      value={formData.pincode || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Pincode"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="p-3 mb-4 bg-white rounded shadow-sm border">
              <h4
                style={{
                  color: "rgba(67, 162, 174, 1)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  padding: "5px",
                }}
              >
                Identity & Clinical Info
              </h4>
              <Row>
                <Col md={3} className="mb-15">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Identity Proof Type
                    </Form.Label>
                    <Form.Select
                      name="identity"
                      value={
                        formData.identity ? formData.identity.split(",")[0] : ""
                      }
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select Document</option>
                      <option value="Aadhaar No">Aadhaar No</option>
                      <option value="Passport No">Passport No</option>
                      <option value="Voter No">Voter No</option>
                      <option value="Pan No">PAN No</option>
                      <option value="Driving Licence No">
                        Driving Licence No
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Identity Proof Details
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="identityNumber"
                      value={
                        formData.identity
                          ? formData.identity.split(",")[1] || ""
                          : ""
                      }
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Enter ID Number"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Blood Group
                      {/* <span className="text-danger">*</span> */}
                    </Form.Label>
                    <Form.Select
                      // required
                      name="blood_group"
                      value={formData.blood_group || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Birth Date <span className="text-danger">*</span>
                    </Form.Label>
                    <DatePicker
                      required
                      selected={
                        formData?.birth_date
                          ? parseDate(formData.birth_date)
                          : null
                      }
                      onChange={(date) =>
                        date &&
                        handleInputChange({
                          target: { name: "birth_date", value: date },
                        })
                      }
                      className="form-control custom-datepicker"
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select Date"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Age
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.age || ""}
                      readOnly
                      style={{
                        backgroundColor: "#e7ebebff",
                        cursor: "not-allowed",
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Occupation
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="occupation"
                      placeholder="Enter Occupation"
                      value={formData.occupation || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Company Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="companyname"
                      placeholder="Enter Company Name"
                      value={formData.companyname || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Preferred Language
                    </Form.Label>
                    <Form.Select
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Assamese">Assamese</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Bodo">Bodo</option>
                      <option value="Dogri">Dogri</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Kashmiri">Kashmiri</option>
                      <option value="Konkani">Konkani</option>
                      <option value="Maithili">Maithili</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Manipuri">Manipuri</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Nepali">Nepali</option>
                      <option value="Odia">Odia</option>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Sanskrit">Sanskrit</option>
                      <option value="Santali">Santali</option>
                      <option value="Sindhi">Sindhi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Urdu">Urdu</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="p-3 bg-white rounded shadow-sm border">
              <h4
                style={{
                  color: "rgba(67, 162, 174, 1)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  padding: "5px",
                }}
              >
                Work Pattern & Referral
              </h4>
              <Row>
                <Col md={10} className="mb-15">
                  <Form.Label
                    className="small fw-bold mb-3"
                    style={{ fontSize: "12px" }}
                  >
                    Work Type
                  </Form.Label>
                  <div
                    className="p-3 border rounded d-flex flex-wrap gap-4"
                    style={{
                      backgroundColor: "#94e2eeff",
                      border: "2px solid rgb(77, 208, 225)",
                    }}
                  >
                    {[
                      { name: "Sedentary", label: "Sedentary" },
                      { name: "Travelling", label: "Travelling" },
                      {
                        name: "Mentally Stressful",
                        label: "Mentally Stressful",
                      },
                      {
                        name: "Strenuous (Physical Activity)",
                        label: "Strenuous (Physical Activity)",
                      },
                    ].map((pattern) => (
                      <Form.Check
                        key={pattern.name}
                        type="checkbox"
                        id={`pattern-${pattern.name}`}
                        label={pattern.label}
                        name={pattern.name}
                        checked={workPatterns[pattern.name]}
                        onChange={handleWorkPatternChange}
                        style={{
                          cursor: "pointer",
                          fontWeight: "500",
                          margin: "3px",
                          fontSize: "12px",
                          marginLeft: "10px",
                        }}
                      />
                    ))}
                  </div>
                </Col>

                <Col md={12}>
                  <Form.Label
                    className="small fw-bold mb-1"
                    style={{ fontSize: "12px" }}
                  >
                    Reference
                  </Form.Label>
                  <div className="d-flex gap-3 align-items-start p-3 rounded bg-white">
                    <Form.Select
                      name="reference"
                      className="w-auto"
                      value={formData.reference_type}
                      onChange={handleReferenceChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        minWidth: "270px",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Choose Reference</option>
                      <option value="family_friends">Family / Friends</option>
                      <option value="dr_ref">Referred By Another Doctor</option>
                      <option value="old_ref">
                        Referred By Another Patient
                      </option>
                      <option value="internet">Internet / Social Media</option>
                      <option value="MediaRef">Entertainment Media</option>
                      <option value="TVShow">Tv Show</option>
                      <option value="newspaper">Newspaper / Magazine</option>
                      <option value="awareness_lecture">
                        Awareness Lecture
                      </option>
                      <option value="hhc_board">HHC Board On Building</option>
                      <option value="treated_past">
                        I Was Treated Here In Past
                      </option>
                      <option value="hhc_branch">
                        Healing Hands Clinic Branch
                      </option>
                      <option value="aggregators">Aggregators</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </div>
                  <div className="flex">{renderReferenceDetails()}</div>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: "#f1f4f6", padding: "5px" }}>
          <Button
            variant="info"
            className="px-3"
            style={{
              borderRadius: "10px",
              backgroundColor: "#00bcd4",
              borderColor: "#00bcd4",
              fontSize: "12px",
              padding: "10px",
            }}
            onClick={() => handlePrint(selectedPatient)}
          >
            <FeatherIcon icon="printer" size="14" className="me-1" />{" "}
            Registration Form
          </Button>
          <Button
            variant="secondary"
            className="px-3"
            style={{ borderRadius: "10px", fontSize: "12px", padding: "10px" }}
            onClick={() => {
              onHide();
              setSelectedPatient(null);
              setFormData({
                prefix: "",
                date: new Date().toISOString().split("T")[0],
                uid: "",
                patientName: "",
                sex: "",
                mobileNo: "",
                mobile_2: "",
                age: "",
                blood_group: "",
                email: "",
                address: "",
                pincode: "",
                identity: "",
                occupation: "",
                companyname: "",
                Sedentary: false,
                Travelling: false,
                "Strenuous (Physical Activity)": false,
                "Mentally Stressful": false,
                reference: "",
                referenceDetails: "",
                patient_type: false,
                patient_id: "",
              });
              setErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="px-4"
            type="submit"
            form="edit-patient-form"
  );
}
