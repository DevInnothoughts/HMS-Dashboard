import React from "react";
import { QRCodeSVG } from "qrcode.react";
import nabhLogo from "../../assets/images/nabh-logo.png";
import painScoreChart from "../../assets/images/pain-score-chart.jpg";
import fistulaImg from "../../assets/images/fistula.jpg";

const DischargePrintView = React.forwardRef(({ dischargeData, formData, doctors, location: sitelocation }, ref) => {
  const d = dischargeData || {};
  const consultantDoc = doctors.find(doc => String(doc.doctor_id) === String(d.consultant_doctor));
  const consultantName = consultantDoc ? consultantDoc.name : (d.consultant_doctor || '');
  
  const madeByDoc = doctors.find(doc => String(doc.doctor_id) === String(d.madeby));
  const checkedByDoc = doctors.find(doc => String(doc.doctor_id) === String(d.checkedby));
  const assistantDoc = doctors.find(doc => String(doc.doctor_id) === String(d.assistance_doctor));
  const prescriptionAssignDoc = doctors.find(doc => String(doc.doctor_id) === String(d.assistance_surgeon || d.prescriptionAssign));

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch { return dateStr; }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      // Handle HH:mm:ss or HH:mm formats
      const [h, m] = timeStr.split(':');
      let hour = parseInt(h);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${m} ${suffix}`;
    } catch { return timeStr; }
  };

  const formatDoctorName = (name) => {
    if (!name) return "";
    return name.replace(/^dr(?!\.)/i, "Dr.");
  };

  const qrData = {
    timeStamp: d.doa ? Math.floor(new Date(d.doa).getTime() / 1000) : 0,
    branchName: sitelocation || "",
    mobileno: d.phone || formData.phone || "",
    uidNo: d.Uid_no || formData.Uid_no || "",
    name: d.patient_name || formData.name || "",
    medicalHistory: d.past_history || d.medical_history || "",
    surgicalHistory: d.surgical_history || "",
    investigation: d.investigation || (d.investigations ? Object.entries(d.investigations).filter(([_,v]) => v).map(([k,v]) => `${k}:${v}`).join(", ") : ""),
    diagnosis: d.diagnosis || "",
    surgery: d.surgical_procedure || d.plan_of_treatment || "",
    surgicalType: Array.isArray(d.surgery_type) ? d.surgery_type.join(", ") : (d.surgery_type || ""),
    doctorsAction: "false",
    POCEmail: consultantDoc?.email || "",
    currentDay: 1
  };
  const qrString = JSON.stringify(qrData);

  const locationData = {
    "DP Road": {
      AssistantSurgeon: "8888288885 / 8888288886",
      Physiotherapist: "7391078008",
      Nutritionist: "7391000340",
      Insurance: "7774053187",
      QueriesSMS: "8554800800",
      Helpline: "88888288884",
      Address: "<b>Healing Hands Clinic </b><br> Ground Floor, Millenium Star Extension, Adjacent to Ruby Hall Entrance Gate, Dhole Patil Road 411001."
    },
    "Tilak Road": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "8888288884",
      Address: "<b>Healing Hands Clinic </b><br> Mangalmurti Complex, 105, First floor, Near Hirabaug, Tilak Road,Pune - 411002"
    },
    "Salunkhe-Vihar": {
      AssistantSurgeon: "9970178542",
      Insurance: "8956713063",
      QueriesSMS: "8888522226",
      Helpline: "8888522226",
      Address: "<b>Healing Hands Clinic </b><br> 101/102 Girme Towers, Salunkhe Vihar Road, Next to HDFC Bank, Opp. Kotak Mahindra Bank, Oxford Village, Kedari Nagar, Wanowrie, Pune, Maharashtra 411004."
    },
    "Kimaya-Clinic": {
      AssistantSurgeon: "",
      Insurance: "",
      QueriesSMS: "",
      Helpline: "7773974668",
      Address: "<b>Kimaya Clinic </b><br> 501B, 5th floor, One Place, SN 61/1/1, 61/1/3, near Salunke Vihar Road, Oxford Village, Wanowrie, Pune, Maharashtra 411040."
    },
    "Baner": {
      AssistantSurgeon: "8888166669",
      Physiotherapist: "8956889648",
      Nutritionist: "8888611114",
      Insurance: "8888366668",
      QueriesSMS: "8888622221",
      Helpline: "8888622221",
      Address: "<b>Healing Hands Clinic </b><br> 1st Floor, Crystal Empire Building, Laxman Nagar, Baner-411007"
    },
    "Pimpri-Chinchwad": {
      AssistantSurgeon: "8888200006",
      Physiotherapist: "8888200006",
      Nutritionist: "8888200004",
      Insurance: "8888200003",
      QueriesSMS: "DR CHAITANYA SHAH ON 9325072224",
      Helpline: "8888200004",
      Address: "<b>Healing Hands Clinic </b><br> Premier Plaza,Anand Nagar, Pimpri-Chinchwad-411019"
    },
    "Chakan": {
      AssistantSurgeon: "8888296666",
      Physiotherapist: "PHYSIOTHERAPIST :",
      Nutritionist: "",
      Insurance: "8888596666",
      QueriesSMS: "DR YOGESH YELWANDE ON 8888376666",
      Helpline: "8888622221",
      Address: "<b>Healing Hands Clinic </b><br> Gokul Complex, Near HDFC Bank,Wage Vasti Nashik Road,Chakan, Pune -410501 Tal : Khed, Dist: Pune"
    },
    "Dighi": {
      AssistantSurgeon: "9130000908",
      Physiotherapist: "9130000908",
      Nutritionist: "9130000908",
      Insurance: "8483999588",
      QueriesSMS: "DR ATUL TAMBADE ON 9226333400",
      Helpline: "8483999588",
      Address: "<b>Healing Hands Clinic </b><br> Sr No.123, Amrutdhara Commercial Hub, Alandi Rd, next to Sai Mandir, Wadmukhwadi,Charholi Budruk, Pune, Maharashtra 412105"
    },
    "Navi-Mumbai": {
      AssistantSurgeon: "8693850006",
      Insurance: "8693850004",
      Physiotherapist: "8693850004",
      Nutritionist: "8693850004",
      QueriesSMS: "DR NEHAL PATEL 9702020433",
      Helpline: "8888166667",
      Address: "<b>Healing Hands Clinic </b><br> Plot No.5, Gahlot Majesty, Sector 46, Seawoods, Navi Mumbai-400706"
    },
    "Kemps-Corner": {
      AssistantSurgeon: "8390848433",
      Insurance: "8888066664",
      Nutritionist: "",
      Physiotherapist: "8888066664",
      QueriesSMS: "DR GIRISH HATALKAR ON 9881012888",
      Helpline: "8888266664",
      Address: "<b>Healing Hands Clinic </b><br> 3rd Floor, Advani Chambers, August Kranti Marg, Kemps Corner-400036"
    },
    "Andheri": {
      AssistantSurgeon: "8956223458",
      Insurance: "9156634201",
      Nutritionist: "",
      Physiotherapist: "9156634201",
      QueriesSMS: "DR. AKASH BAGADE ON 9892780492",
      Helpline: "9156634201",
      Address: "<b>Healing Hands Clinic </b><br> Unit no 18 at Palm Beach Galleria, 1st Floor, Palm Beach Road, Vashi, New Mumbai - 400703"
    },
    "Nashik": {
      AssistantSurgeon: "ASSISTANT SURGEON :",
      Insurance: "",
      Nutritionist: "",
      Physiotherapist: "",
      QueriesSMS: "",
      Helpline: "8888366662",
      Address: "<b>Healing Hands Clinic </b><br> 3rd Floor, Above Mac Donald, Opp. Big Bazaar, College Road, Nashik-422005"
    },
    "Kolhapur": {
      AssistantSurgeon: "8888296666",
      Physiotherapist: "PHYSIOTHERAPIST :",
      Nutritionist: "",
      Insurance: "8956223460",
      QueriesSMS: "DR VISHWAJIT ON 8275479090",
      Helpline: "8956223460",
      Address: "<b>Healing Hands Clinic </b><br> Kukreja Nursing Home, 232 3b 2a, Near Telephone Bhavan, Tarabai Park, Kolhapur, Maharashtra 416003."
    },
    "Latur": {
      AssistantSurgeon: "8600619506",
      Physiotherapist: "8600619506",
      Insurance: "8600619506",
      Nutritionist: "8600619506",
      QueriesSMS: "8956223459",
      Helpline: "8956223459",
      Address: "<b>Healing Hands Clinic </b><br> MG Rd, opp. LDCC Bank, Sawe Wadi, Latur, Maharashtra 413512."
    },
    "Lucknow": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "",
      Address: "<b>Healing Hands Clinic </b><br> B-2/885, Vinay Khand 2 Husariya, Amar Shaheed Path, Gomti Nagar, Lucknow, Uttar Pradesh 226010."
    },
    "Belagavi": {
      AssistantSurgeon: "8600002156",
      Physiotherapist: "8600002156",
      Insurance: "8600002156",
      Nutritionist: "8600002156",
      QueriesSMS: "8600002156",
      Helpline: "8600002156",
      Address: "<b>Healing hands clinic,</b><br>C/O Sbg hospital, Opposite federal bank, Ganeshpur Rd, Laxmi Tek, Belagavi, Karnataka 590001."
    },
    "Bangalore": {
      AssistantSurgeon: "9538870033",
      Physiotherapist: "",
      Insurance: "9538870066",
      Nutritionist: "",
      QueriesSMS: "DR AYESHA ON 9538870033",
      Helpline: "8888133338",
      Address: "<b>Healing Hands Clinic </b><br> #281, Ground Floor, 15th Cross, 5th Phase, J.P. Nagar,Bengaluru-560078"
    },
    "Indiranagar": {
      AssistantSurgeon: "8971718692",
      Physiotherapist: "8197978642",
      Insurance: "8197978659",
      Nutritionist: "8197978642",
      QueriesSMS: "8197978651",
      Helpline: "8197978641",
      Address: "<b>Healing Hands Clinic </b><br>#516, 3rd Floor, Krishvi Aspire, Opp. Nature's Basket, CMH Road, Indiranagar, Bengaluru - 560038"
    },
    "Whitefield": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "9271066070",
      Helpline: "9271066070",
      Address: "<b>Healing Hands Clinic </b><br>Zenya Signature, 4th Floor, ITPL Main Road, Beside BMW Showroom, KIADB Export Promotion Industrial Area, Krishnarajapuram, Whitefield, Bengaluru, Karnataka-560066"
    },
    "HSR": {
      AssistantSurgeon: "8792950456",
      Physiotherapist: "8792950455",
      Insurance: "8792950457",
      Nutritionist: "8792950455",
      QueriesSMS: "8792950455",
      Helpline: "8792950455",
      Address: "<b>Healing Hands Clinic </b><br> 1st Floor, Krishna Complex, HSR Layout - 1st Sector, 17th Cross Road, 27th Main Road, Opposite to Sri Basaveshwara Gayatri Temple, Above More Supermarket, Bengaluru – 560102"
    },
    "Sahakarnagar": {
      AssistantSurgeon: "9731117656",
      Physiotherapist: "9731117656",
      Insurance: "9731118056",
      Nutritionist: "9731117656",
      QueriesSMS: "9731118056",
      Helpline: "7680862049",
      Address: "<b>Healing Hands Clinic </b><br> 1st Floor, 490/8, above McDonalds,F Block, Sahakar Nagar,Byatarayanapura, Bengaluru,Karnataka 560092."
    },
    "Rajajinagar": {
      AssistantSurgeon: "7996126669",
      Physiotherapist: "7996126669",
      Insurance: "7996126669",
      Nutritionist: "7996126669",
      QueriesSMS: "7996126669",
      Helpline: "7996126669",
      Address: "<b>Healing Hands Clinic </b><br> 2nd floor, 9th Cross, Dr MC Modi Hospital Rd, above HDFC Bank, West of Chord Road, Rajajinagar, Bengaluru, Karnataka 560079."
    },
    "Hyderabad": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "DR ASHWIN PORWAL ON 7680862049",
      Helpline: "7680862049",
      Address: "<b>Healing Hands Clinic </b><br> MCH No.8-2-293/82/A/729/1/1F1, 1st Floor, DK's Kavya House Road No.36, Opposite Neeru's Emporio Madhapur Metro station Piller number 1698, Beside Indian oil petrol pump, Jubilee Hills Main Road, Jubilee Hills, Hyderabad, Telangana."
    },
    "Secunderabad": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "DR ASHWIN PORWAL ON 8977520083",
      Helpline: "8977520083",
      Address: "<b>Healing Hands Clinic </b><br> 1st floor, plot no 4, beside SBI Bank, Chandragiri Colony, Tirumalgiri, Secunderabad, Hyderabad, Telangana"
    },
    "Surat": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "7874134000",
      Address: "<b>Healing Hands Clinic </b><br> Healing Hands Clinic F1, Third Floor, VIP Plaza, VIP Road, Near Shyam Baba Mandir, Bharthana, Surat, Gujarat 395007"
    },
    "Aurangabad": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "9271066069",
      Address: "<b>Healing Hands Clinic </b><br> Healing Hands Clinic, 4th Above PUMA Store, Jalna Road, Near Seven Hill Flyover, Near Yashodeep Hotel Akashwani, Chhatrapati Sambhajinagar, Aurangabad, Maharashtra-431001"
    },
    "Ludhiana": {
      AssistantSurgeon: "7814070884",
      Physiotherapist: "7814070884",
      Insurance: "7814070884",
      Nutritionist: "7814070884",
      QueriesSMS: "7814070884",
      Helpline: "7986935908",
      Address: "<b>Healing Hands Clinic </b><br> Healing Hands Clinic 2117/1457, Gobind Nagar, Opp. hotel onn, Near Yes Bank,Ferozepur Road, Ludhiana. Punjab 141001."
    },
    "Undri": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "",
      Address: "<b>Healing Hands Clinic </b><br> 2nd floor 220, Healing hands clinic, Marvel sangria, NIBM Rd, Mohammed Wadi,Pune, Maharashtra 411060"
    },
    "Indore": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "",
      Address: "<b>Healing Hands Clinic </b><br> LIG Link Rd, near Genesis Hospital,Shree Nagar Ext, Anurag Nagar, Ext,Indore, Madhya Pradesh 452011"
    },
    "Mysore": {
      AssistantSurgeon: "8884884485",
      Physiotherapist: "9066466113",
      Insurance: "7259605091",
      Nutritionist: "8884884496",
      QueriesSMS: "8884884496",
      Helpline: "8884884496",
      Address: "<b>Healing Hands Clinic </b><br> 1st and 2nd Floor, 13/2,Scarlet Towers, Temple Road,Jayalakshmipuram, Mysore,Karnataka - 570012."
    },
    "Gurgaon-49": {
      AssistantSurgeon: "9990063530",
      Physiotherapist: "9990479800",
      Insurance: "9266383090",
      Nutritionist: "9990479800",
      QueriesSMS: "9990479800",
      Helpline: "9990479800",
      Address: "<b>Healing Hands Clinic </b><br>Spaze ITech Park Tower C, Ground Floor, Unit no 06,07 and 08 Sohna road, Sector 49, Gurugram, Haryana 122018"
    },
    "Gurgaon-14": {
      AssistantSurgeon: "9990063530",
      Physiotherapist: "9990063530",
      Insurance: "9266383090",
      Nutritionist: "9990063530",
      QueriesSMS: "9990479800",
      Helpline: "9990479800",
      Address: "<b>Healing Hands Clinic </b><br>1st Floor Sheetla Chamber,Old Delhi Road, Opposite Air Force School,Sector 14, Gurugram,Harayana 122002"
    },
    "Hinjewadi": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "9175232340",
      Helpline: "9175232340",
      Address: "<b>Healing Hands Clinic, </b><br>AH Infotech, 3rd Floor,Above. SBI MIDC Hinjewadi Branch, Hinjewadi Phase 1 Rd,Hinjawadi, Pune, Maharashtra 411057"
    },
    "Vashi": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "9175232308",
      Helpline: "9175232308",
      Address: "<b>Healing Hands Clinic, </b><br>Unit no 18 at Palm Beach Galleria, 1st Floor, Palm Beach Road, Vashi, New Mumbai - 400703"
    },
    "Kalaburagi": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "8554800800",
      Helpline: "9164045999",
      Address: "<b>Healing Hands Clinic, </b><br>Shanta hospital 4 th floor Plot # 93/1 Akkamahadevi colony near high court Kalaburagi 585103"
    },
    "Mohali": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "",
      Address: "<b>Healing Hands Clinic, </b><br>SCO 7,8,9, 10, opposite Daily Post, Sector 66 A, Sahibzada Ajit Singh Nagar, Punjab 140306"
    },
    "Ahmedabad": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "",
      Address: "<b>Healing Hands Clinic, </b><br>Office No. 601 to 607 and 613, Mehta 531, Beside V S Hospital, Ashram Road, Ellisbridge, Ahmedabad, Gujarat - 380006"
    },
    "Thane": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "8575999994",
      Address: "<b>Healing Hands Clinic </b><br> Plot No.5, Gahlot Majesty, Sector 46, Seawoods, Navi Mumbai-400706"
    },
    "Katraj": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Nutritionist: "",
      Insurance: "",
      QueriesSMS: "DR ATUL TAMBADE ON ",
      Helpline: "",
      Address: "<b>Healing Hands Clinic </b><br> Ground Floor, Atmosphere Building, Ambegaon Pathar, Ambegaon Budruk, Pune 411046"
    },
    "Kothrud": {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "8575999993",
      Address: "<b>Healing Hands Clinic </b>"
    },
    default: {
      AssistantSurgeon: "",
      Physiotherapist: "",
      Insurance: "",
      Nutritionist: "",
      QueriesSMS: "",
      Helpline: "8888288884",
      Address: "<b>Healing Hands Clinic </b>"
    }
  };

  const normalizeLocation = (locName) => {
    if (!locName) return "default";
    const keys = Object.keys(locationData);
    const matchedKey = keys.find(k => k.toLowerCase() === locName.trim().toLowerCase());
    return matchedKey || "default";
  };
  const locKey = normalizeLocation(sitelocation);
  const loc = locationData[locKey];

  // Build investigations rows
  const invObj = d.investigations || {};
  const units = { HB: 'g/dL', WBC: 'cells/mcL', PLT: 'lakhs/mcL', BSL: 'mg/dL', 'SR.CREATININE': 'mg/dL', BILLIRUBIN: 'mg/dL', PSA: 'ng/mL', BT: 'min', CT: 'min', PT: 'sec', INR: 'ratio', HIV: '', HCV: '', HBSAG: '' };
  
  const isValueEmpty = (val) => {
    if (!val) return true;
    const v = val.trim().toLowerCase();
    return ['', '-', 'na', 'n/a', 'normal'].includes(v);
  };

  const invPairs = Object.entries(invObj).filter(([, v]) => !isValueEmpty(v));
  
  const renderInvestigationRows = () => {
    const rows = [];
    for (let i = 0; i < invPairs.length; i += 4) {
      const chunk = invPairs.slice(i, i + 4);
      rows.push(
        <tr key={i}>
          {chunk.map(([key, val], idx) => (
            <td key={idx} style={{ width: '25%' }}>
              {key} : {val}{units[key] ? ` ${units[key]}` : ''}
            </td>
          ))}
          {Array(4 - chunk.length).fill(0).map((_, idx) => (
            <td key={`empty-${idx}`} style={{ width: '25%' }}></td>
          ))}
        </tr>
      );
    }
    return rows;
  };

  const formatWithLineBreaks = (text) => {
    if (!text) return "";
    return text.split(/(\d+\.)/).map((part, i) => {
      if (/^\d+\.$/.test(part)) return <React.Fragment key={i}><br />{part}</React.Fragment>;
      return part;
    });
  };

  return (
    <div ref={ref} className="discharge-print-container">
      <style>{`
        @media screen, print {
          .discharge-print-container {
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin: 0;
            padding: 10px;
            background-color: white;
            color: black;
          }
          .discharge-print-container table {
            width: 100%;
            border-collapse: collapse;
          }
          .discharge-print-container table.bordered td, 
          .discharge-print-container table.bordered th {
            border: 1px solid black;
            padding: 5px 10px;
          }
          .discharge-print-container .MedicineTable {
            border-collapse: collapse;
            width: 100%;
            font-size: 12px;
          }
          .discharge-print-container .MedicineTable td, 
          .discharge-print-container .MedicineTable th {
            border: 1px solid black;
            padding: 5px 10px;
          }
          .discharge-print-container .dischargetitle {
            width: 100%;
            display: flex;
            align-items: center;
            padding: 5px 0px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            margin-bottom: 20px;
          }
          .discharge-print-container .dischargetitle img.hhc-logo {
            width: 80%;
          }
          .discharge-print-container .dischargetitle img.nabh-logo {
            width: 95px;
          }
          .discharge-print-container .FontAdjustment {
            font-size: 14px;
          }
          .discharge-print-container b, .discharge-print-container strong {
            font-weight: 700;
          }
          .discharge-print-container .NABH {
            display: none !important;
          }
        }
      `}</style>

      {sitelocation === "DP Road" ? (
        <div className="row" style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "5%" }}></div>
          <div style={{ width: "30%" }}>
            <img src="https://www.healinghandsclinic.co.in/images/LP/HHC-LOGO.webp" alt="Healing Hands Clinic" className="hhc-logo" />
          </div>
          <div style={{ width: "50%", textAlign: "center" }}>
            <h4 style={{ margin: 0 }}><b>Discharge Summary</b></h4>
            <p style={{ margin: 0 }}>(AAC-F-14.1-00)</p>
          </div>
          <div style={{ width: "15%" }}>
            <img src={nabhLogo} alt="NABH" className="nabh-logo" />
          </div>
        </div>
      ) : (
        <div className="dischargetitle">
          <div style={{ width: "5%" }}></div>
          <div style={{ width: "25%" }}>
            <img src="https://www.healinghandsclinic.co.in/images/LP/HHC-LOGO.webp" alt="Healing Hands Clinic" className="hhc-logo" />
          </div>
          <div style={{ width: "55%", textAlign: "center" }}>
            <h4 style={{ margin: 0 }}><b>DISCHARGE CARD</b></h4>
          </div>
          <div style={{ width: "15%" }}>
            <img src={nabhLogo} alt="NABH" className="nabh-logo NABH" />
          </div>
        </div>
      )}

      <div style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}>
          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td style={{ width: "50%", borderRight: "0px" }}>
                  <b>PATIENT'S NAME : </b>
                  {(() => {
                    const prefix = (d.prefix || formData.prefix || "").trim();
                    if (!prefix) return "";
                    const clean = prefix.replace(/\.$/, "");
                    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() + ". ";
                  })()}
                  {d.patient_name || formData.name || ""}
                </td>
                <td style={{ width: "50%" }}><b>UHID. NO : </b>{d.Uid_no || formData.Uid_no || ""}</td>
              </tr>
              <tr>
                <td style={{ width: "50%", borderRight: "0px" }}><b>SEX : </b>{d.patient_sex || formData.sex || ""}&nbsp;&nbsp;<b>Age : </b>{d.patient_age || formData.age || ""}&nbsp;&nbsp;<b>Height : </b>{d.height || ""}cm&nbsp;&nbsp;<b> Weight : </b>{d.weight || ""}kg</td>
                <td style={{ width: "50%" }}><b>PATIENT'S IPD NO. : </b>{d.ipd_no || d.IPDNo || ""}</td>
              </tr>
              <tr>
                <td colSpan="2"><b>PATIENT ADDRESS : </b>{d.address || formData.address || ""}</td>
              </tr>
              <tr>
                <td style={{ width: "50%", borderRight: "0px" }}><b>DATE OF ADMISSION : </b>{formatDate(d.doa || d.DOA)}</td>
                <td style={{ width: "50%" }}><b> TIME OF ADMISSION : </b> {formatTime(d.admission_time || d.DOA_time)}</td>
              </tr>
              <tr>
                <td style={{ width: "50%", borderRight: "0px" }}><b> DATE OF DISCHARGE : </b>{formatDate(d.dod || d.DOD)}</td>
                <td style={{ width: "50%" }}><b>TIME OF DISCHARGE : </b> {formatTime(d.discharge_time || d.DOD_time)}</td>
              </tr>
              <tr>
                <td style={{ width: "50%", borderRight: "0px" }}><b>ADMITTED UNDER </b>{formatDoctorName(consultantName)}</td>
                <td style={{ width: "50%" }}>
                  <b>REF.BY :</b> {(d.reference_type === "dr_ref" || formData.reference_type === "dr_ref") ? (
                    <span>
                      {d.ref_doctor_name || formData.ref_doctor_name || formData.ref || "NA"}
                      {(d.ref_doctor_phone || formData.ref_doctor_phone) ? ` (${d.ref_doctor_phone || formData.ref_doctor_phone})` : ""}
                    </span>
                  ) : "NA"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <br />

      <div style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}>
          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top", height: "50px" }}><b>REASON FOR ADMISSION / CHIEF COMPLAINT : </b> {d.reason_for_admission || d.chife_complaints || ""}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top", height: "50px" }}><b>MEDICAL HISTORY / SURGICAL HISTORY / GYNAECOLOGY HISTORY : </b> {d.medical_history || d.surgical_history || ""}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top", height: "50px" }}><b>DIAGNOSIS : </b> {d.diagnosis || ""}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top", height: "50px" }}><b>PLAN OF TREATMENT : </b>{d.plan_of_treatment || d.surgical_procedure || ""}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top", height: "50px" }}><b>KNOWN ALLERGIES : </b>{d.allergies || ""}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <br />

      <div className="FontAdjustment" style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}><b>MEDICATION GIVEN DURING TREATMENT</b></div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}>
          <table className="MedicineTable FontAdjustment">
            <thead>
              <tr style={{ textAlign: "center", background: "#E7E9EB" }}>
                <td style={{ width: "5%" }}><b>Sr. No</b></td>
                <td style={{ width: "5%" }}><b>Type</b></td>
                <td style={{ width: "33%" }}><b>Medicine Name</b></td>
                <td style={{ width: "10%" }}><b>Strength</b></td>
                <td style={{ width: "30%" }}><b>Frequency<br />With special instructions</b></td>
                <td style={{ width: "8%" }}><b>Route</b></td>
                <td style={{ width: "9%" }}><b>Duration<br />(Days)</b></td>
              </tr>
            </thead>
            <tbody>
              {(d.treatment_given || []).length > 0 ? (
                d.treatment_given.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.medicine_type || ""}</td>
                    <td>{item.medicine_name || item.name || ""}</td>
                    <td>{item.medicine_strength ? (item.medicine_strength + (item.medicine_unit ? "/" + item.medicine_unit : "")) : (item.strength || "")}</td>
                    <td>{item.medicine_time || item.times || ""}</td>
                    <td>{item.medicine_route || item.route || ""}</td>
                    <td>{item.medicine_duration || item.duration || ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>No medication recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <br />

      <div className="FontAdjustment" style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}><b>DETAILS OF TESTS CONDUCTED WITH RESULTS</b></div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}>
          <table className="bordered FontAdjustment">
            <tbody>
              {invPairs.length > 0 ? renderInvestigationRows() : (
                <tr>
                  <td colSpan="4">No investigations recorded</td>
                </tr>
              )}
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top" }}><b>DETAILS OF OTHER TESTS CONDUCTED AND RESULTS </b> {d.other_investigations || d.extranote || ""}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <br />

      <div className="FontAdjustment" style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}><b>DETAILS OF SURGERY PERFORMED</b></div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}>
          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top" }}><b>DATE OF SURGERY :</b> {formatDate(d.surgery_date)}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top" }}><b>SURGERY NOTES : </b>{d.surgery_note || ""}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <br />

      <div className="FontAdjustment" style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}><b>PATIENT'S CONDITION AT THE TIME OF DISCHARGE</b></div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}>
          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td style={{ width: "33%" }}><b>B.P : </b>{d.bp || d.BP || ""} mm/Hg</td>
                <td style={{ width: "33%" }}><b>Pulse Rate : </b>{d.pulse || ""} /min</td>
                <td style={{ width: "33%" }}><b>Respiratory Rate : </b>{d.rr || d.RR || ""} /min</td>
              </tr>
              <tr>
                <td style={{ width: "33%" }}><b>Temp : </b>{d.temp || d.Temp || ""} &deg;F</td>
                <td style={{ width: "33%" }}><b>Pain Score : </b>{d.pain_score || d.painscore || ""}</td>
                <td style={{ width: "33%" }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <br />

      <div className="FontAdjustment" style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}><b>MEDICINES ADVISED AT THE TIME OF DISCHARGE</b></div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}>
          <table className="MedicineTable FontAdjustment">
            <thead>
              <tr style={{ textAlign: "center", background: "#E7E9EB" }}>
                <td style={{ width: "5%" }}><b>Sr. No</b></td>
                <td style={{ width: "5%" }}><b>Type</b></td>
                <td style={{ width: "25%" }}><b>Medicine Name</b></td>
                <td style={{ width: "15%" }}><b>Strength/Unit</b></td>
                <td style={{ width: "30%" }}><b>Frequency<br />With special instructions</b></td>
                <td style={{ width: "8%" }}><b>Route</b></td>
                <td style={{ width: "9%" }}><b>Duration<br />(Days)</b></td>
                <td style={{ width: "8%" }}><b>Total Qty</b></td>
              </tr>
            </thead>
            <tbody>
              {(d.treatment_on_discharge || []).length > 0 ? (
                d.treatment_on_discharge.map((item, idx) => {
                  const name = (item.medicine_name || item.name || "").toUpperCase().trim();
                  const medTime = (item.medicine_time || item.times || []).join(", ");
                  const dosageFreq = item.dosage_frequency || "";
                  
                  let frequencyDisplay;
                  if (name === "PRILOX CREAM") {
                    frequencyDisplay = (
                      <span>
                        {medTime}
                        <span style={{ fontSize: "10px" }}>&nbsp;(1st thing in the morning..massage for 5 minutes. Repeat every 6 hours or SOS)</span>
                      </span>
                    );
                  } else if (name === "ANOSPRAY") {
                    frequencyDisplay = (
                      <span>
                        {medTime}
                        <span style={{ fontSize: "10px" }}>&nbsp;(For instant pain relief use 2-3 puffs before and after passing stools)</span>
                      </span>
                    );
                  } else {
                    const times = medTime.split(",").map(t => t.trim()).filter(t => t !== "");
                    const displayTimes = times.map(t => `${t} (${dosageFreq})`);
                    frequencyDisplay = displayTimes.join(" ....... ");
                  }

                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{item.medicine_type || ""}</td>
                      <td>{item.medicine_name || item.name || ""}</td>
                      <td>{item.strengthunit || item.strength_unit || ""}</td>
                      <td>{frequencyDisplay}</td>
                      <td>{item.medicine_route || item.route || ""}</td>
                      <td>{item.medicine_days || item.days || ""}</td>
                      <td>{item.medicine_quantity || item.qty || ""}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>No medication advised</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <br />

      <div style={{ display: "flex" }}>
        <div style={{ width: "5%" }}></div>
        <div style={{ width: "95%" }}>
          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td colSpan="4"><b>FOLLOW-UP ADVICE / LOCAL CARE</b> <br />{formatWithLineBreaks(d.local_care)}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top" }}><b>NOTE / INSTRUCTIONS :</b> {formatWithLineBreaks(d.note_advice || d.carenote)}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ verticalAlign: "top" }}><b>CONSENT :</b> {formatWithLineBreaks(d.consent || `1. PATIENT HAEMODYNAMICALLY STABLE, VITALS NORMAL.
2. PATIENT HAS BEEN ADVISED TO FOLLOW ALL POST OPERATIVE INSTRUCTIONS, INCLUDING MEDICINES, WOUND CARE, DIET PLAN, POST OP EXCERSISE AND SCHEDULED FOLLOW UPS UNTIL DECLARED HEALED BY THE SURGEON, NON COMPLIANCE WITH THESE INSTRUCTIONS MAY RESULT IN RELAPSE, RECURRENCE OR OTHER COMPLICATIONS FOR WHICH THE TREATING DOCTOR OR HOSPITAL SHALL NOT BE HELD RESPONSIBLE
3. PATIENT IS COMFORTABLE AND IS WILLING TO GET DISCHARGED`)}</td>
              </tr>
              {(d.fistula_cases || d.fistula_image_required) && (
                <tr>
                  <td colSpan="4" style={{ verticalAlign: "top" }}><b>FISTULA IMAGE :</b><br />
                    <img src={fistulaImg} alt="Fistula" style={{ width: "220px", margin: "10px 15px 10px 0px" }} />
                    {d.fistula_cases && String(d.fistula_cases).split(",").map((img, i) => (
                      <img key={i} src={`/fistulacases/${img.trim()}.jpg`} alt={`Fistula ${img}`} style={{ width: "220px", margin: "10px 15px 10px 0px" }} onError={(e) => e.target.style.display = 'none'} />
                    ))}
                  </td>
                </tr>
              )}
              {d.balloon_drain && (
                <tr>
                  <td colSpan="4" style={{ verticalAlign: "top" }}><b>BALLOON DRAIN :</b> {formatWithLineBreaks(d.balloon_drain)}</td>
                </tr>
              )}
            </tbody>
          </table>
          <br />

          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  <img src={painScoreChart} alt="Pain Score Chart" style={{ width: "70%", margin: "10px 0px" }} />
                  <p style={{ textAlign: "left" }}>In case of Pain score ≥5 & / or unanswered queries SMS or Call your assistant surgeon. If it is unanswered, kindly call on {loc.QueriesSMS}. You can also contact the above number in case of emergency or if you notice any of the following symptoms.</p>
                </td>
              </tr>
              <tr>
                <td style={{ width: "70%", verticalAlign: "top" }}>
                  1) Fever of 101 F or more<br />
                  2) Bleeding from operation site <br />
                  3) Worsening of any symptoms <br />
                  4) Other significant concerns
                </td>
                <td style={{ width: "30%", textAlign: "center" }}>
                  <b>Care Buddy App QR code</b><br />
                  <div style={{ margin: "10px auto" }}>
                    <QRCodeSVG 
                      value={qrString} 
                      size={180} 
                      level="H" 
                      includeMargin={false}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <br />

          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td colSpan="2" style={{ width: "50%" }}><b>FOLLOW UP DATE :</b> {formatDate(d.follow_date || d.Follow_date)}</td>
                <td colSpan="2" style={{ width: "50%", color: d.euapatient === 1 ? "red" : "inherit" }}>
                  <b>FOLLOW UP DATE :</b> {d.euafollow_date ? String(d.euafollow_date).split(",").map(d => formatDate(d)).join(", ") : ""}
                </td>
              </tr>
            </tbody>
          </table>
          <br />

          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td colSpan="2" style={{ width: "50%", borderRight: "0px", borderBottom: "0px" }}>
                  <b>Assistant Surgeon :</b> {prescriptionAssignDoc ? `${prescriptionAssignDoc.name} (${prescriptionAssignDoc.phone})` : "NA"}<br />
                  <b>Assistant Doctor : </b>{assistantDoc ? `${assistantDoc.name} (${assistantDoc.phone})` : "NA"}<br />
                  <b>Physiotherapist : </b>{loc.Physiotherapist}
                </td>
                <td colSpan="2" style={{ width: "50%", borderLeft: "0px", borderBottom: "0px" }}>
                  <b>Insurance : </b>{loc.Insurance}<br />
                  <b>Nutritionist : </b>{loc.Nutritionist}<br />
                  <b>Post operative follow-up appointment : </b>{loc.QueriesSMS}
                </td>
              </tr>
              <tr>
                <td colSpan="4" style={{ borderTop: "0px" }}>
                  <p>If any of the above numbers are not answered, please reach out to your assistant doctor or call on our 24X7 helpline at <b>{loc.Helpline}</b>, and our executive will connect you with the respective department.</p>
                </td>
              </tr>
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>Please bring this Discharge Summary for all your next follow-up visits with us.</td>
              </tr>
            </tbody>
          </table>
          <br />

          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td style={{ width: "50%" }}><b>Made by : </b>{madeByDoc ? formatDoctorName(madeByDoc.name) : ""}</td>
                <td style={{ width: "50%" }}><b>Checked by : </b>{checkedByDoc ? formatDoctorName(checkedByDoc.name) : ""}</td>
              </tr>
            </tbody>
          </table>
          <br />

          <table className="bordered FontAdjustment">
            <tbody>
              <tr>
                <td style={{ width: "50%" }}>Name of Doctor<br /><br /></td>
                <td style={{ width: "50%" }}>Name of Patient / Relative receiving Discharge Summary<br /><br /></td>
              </tr>
              <tr>
                <td style={{ width: "50%" }}>Doctor’s Sign, Date & Time<br /><br /></td>
                <td style={{ width: "50%" }}>Patient / Relative’s Sign, Date and Time<br /><br /></td>
              </tr>
              <tr>
                <td colSpan="2" style={{ width: "100%" }}>
                  <p><b>ADDRESS : </b></p>
                  <div dangerouslySetInnerHTML={{ __html: loc.Address }} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default DischargePrintView;
