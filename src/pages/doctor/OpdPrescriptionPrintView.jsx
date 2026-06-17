import React from "react";
import nabhLogo from "../../assets/images/nabh-logo.png";

const OpdPrescriptionPrintView = React.forwardRef(
  (
    {
      prescriptionData,
      formData,
      historyData,
      doctors = [],
      location: sitelocation,
    },
    ref,
  ) => {
    const d = prescriptionData || {};
    const patient = formData || {};
    const history = historyData || {};

    const patientPrefixRaw = patient.prefix || "";
    const patientPrefix = patientPrefixRaw.trim() ? patientPrefixRaw.trim().replace(/\.$/, "").charAt(0).toUpperCase() + patientPrefixRaw.trim().replace(/\.$/, "").slice(1).toLowerCase() + ". " : "";
    const patientName = patientPrefix + (patient.name || patient.Name || "");
    const patientAge = patient.age || patient.Age || "";
    const patientSex = patient.sex || patient.Sex || patient.gender || "";
    const patientUid =
      patient.Uid_no || patient.uid_no || patient.uid || patient.uhid || "";



    const assistantDoc = doctors.find(
      (doc) =>
        String(doc.doctor_id || doc.id) === String(d.doctor_id || d.udoctor_id),
    );
    const doctorName = assistantDoc ? assistantDoc.name : "";
    const doctorPhone = assistantDoc ? assistantDoc.phone : "";

    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "0000-00-00") return "0000-00-00";
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      } catch {
        return dateStr;
      }
    };

    const cdate = formatDate(d.creation_timestamp);
    const nextAppoDate = formatDate(d["next-appo-date"]);

    const testAdvice =
      d.prescription_type === "Urology"
        ? d.uroadvice?.join(", ")
        : d.surgical_advice?.join(", ");

    const medicines = d.medicines || [];

    const formatMedicineTime = (timesArr) => {
      if (!timesArr || timesArr.length === 0) return "";
      if (timesArr.length > 1) {
        return timesArr.join(".......");
      }
      const time = timesArr[0];
      if (time === "Before Breakfast" || time === "After Breakfast") {
        return `${time}.......`;
      }
      if (time === "Before Lunch" || time === "After Lunch") {
        return `.......${time}.......`;
      }
      if (time === "Before Dinner" || time === "After Dinner") {
        return `.......${time}`;
      }
      return time;
    };

    const isAhmedabadLocationClass = [
      "Ahmedabad",
      "Lucknow",
      "Secunderabad",
      "Salunkhe-Vihar",
      "Mohali",
      "Katraj",
      "Chakan",
      "Ludhiana",
      "Sarjapura",
      "Rajajinagar",
      "Pimpri-Chinchwad",
    ].includes(sitelocation);

    return (
      <div ref={ref} className="opd-print-container">
        <style>{`
          @page { size: A4; margin: 12mm; }

@media screen, print {
  .opd-print-container {
    font-family: Arial, sans-serif;
    font-size: 14px;
    margin: 0;
    padding: 0;
    line-height: 1.35;
    background-color: #fff !important;
    color: #000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .opd-print-container * { box-sizing: border-box; }
  .opd-print-container p, .opd-print-container span, .opd-print-container div { color: #000 !important; }
  .opd-print-container p { margin: 3px 0; }
  .opd-print-container .fw-bold { font-weight: 700 !important; }
  .opd-print-container .text-right { text-align: right; }
  .opd-print-container .row-flex { display: flex; flex-wrap: wrap; }

  /* Universal medicine table: fixed layout + colgroup lock the columns on every
     printer/PDF engine, regardless of how the dosage or notes wrap. */
  .opd-print-container .med-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-top: 4px;
  }
  .opd-print-container .med-table th {
    border-bottom: 2px solid #000;
    padding: 4px 6px;
    text-align: left;
    font-weight: 700;
  }
  .opd-print-container .med-table td {
    padding: 3px 6px;
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .opd-print-container .med-note td {
    padding-top: 0;
    font-size: 12px;
    font-style: italic;
  }
  .opd-print-container .med-table tr { page-break-inside: avoid; }
}
        `}</style>

        <div style={{ padding: "20px" }}>
          <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
          <div
            className="row-flex"
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div style={{ flex: 1 }}></div>

            <div style={{ flex: 1 }}>
              <p className="text-right fw-bold" style={{ margin: 0 }}>
                DATE : {cdate}
              </p>
            </div>
          </div>

          <div className="row-flex">
            <div style={{ width: "100%" }}>
              <p>
                <span className="fw-bold">NAME :</span> {patientName} ({" "}
                {patientAge} / {patientSex} )
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">UID NO :</span> {patientUid}
              </p>
              <p>
                <span className="fw-bold">BP : </span>{" "}
                {history.vital_bp || history.Vital_bp || history.VITAL_BP || ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">Pulse : </span>{" "}
                {history.vital_pulse ||
                  history.Vital_pulse ||
                  history.VITAL_PULSE ||
                  ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">SPO2 : </span>{" "}
                {history.spo2 || history.Spo2 || history.SPO2 || ""}{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">Height : </span>{" "}
                {history.height_feet ||
                  history.Height_feet ||
                  history.HEIGHT_FEET ||
                  ""}{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">Weight : </span>{" "}
                {history.weight_kg ||
                  history.Weight_kg ||
                  history.WEIGHT_KG ||
                  ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </p>
              <p>
                <span className="fw-bold">RS : </span>{" "}
                {history.rs || history.Rs || history.RS || ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">CVS : </span>{" "}
                {history.cvs || history.Cvs || history.CVS || ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">CNS : </span>{" "}
                {history.cns || history.Cns || history.CNS || ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">PA : </span>{" "}
                {history["p/a"] ||
                  history["P/A"] ||
                  history.pa ||
                  history.PA ||
                  ""}{" "}
              </p>
            </div>
          </div>

          <div className="row-flex">
            <div style={{ width: "50%" }}>
              <p>
                <span className="fw-bold">Allergy :</span>{" "}
                {d.allergy ? d.allergy : "Unknown"}
              </p>
            </div>
            <div style={{ width: "50%" }}>
              <p>
                <span className="fw-bold">Test Advice :</span> {testAdvice}
              </p>
            </div>
          </div>
          <br />
          <table className="med-table">
            <colgroup>
              <col style={{ width: "32%" }} />
              <col style={{ width: "43%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Days</th>
                <th style={{ textAlign: "right" }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {d.no_medicines_prescribed && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    <i>No Medicines Prescribed</i>
                  </td>
                </tr>
              )}

              {medicines.map((med, idx) => {
                const isAnoacCream =
                  med.name?.toLowerCase().includes("cream") ||
                  med.name?.toLowerCase().includes("gel") ||
                  med.name?.toLowerCase().includes("ointment");
                const isConstac = med.name?.toLowerCase().includes("constac");
                const isAnospray = med.name?.toLowerCase().includes("anospray");

                let timeString = formatMedicineTime(med.times || []);
                if (isConstac) timeString = "1 spoon At Night ( Before sleep )";

                const medName = med.name?.replace(/\([^)]*\)/, "").trim();
                const note = med.note || "";
                const daysText = isAhmedabadLocationClass
                  ? med.days
                  : `${med.days} Days`;

                let noteText = "";
                if (isAhmedabadLocationClass) {
                  noteText = note ? `( ${note} )` : "";
                } else if (isAnoacCream) {
                  noteText =
                    "( Keep the area clean and dry. Apply locally as directed. Massage gently with a fingertip for approximately 5 minutes. )";
                } else if (isConstac) {
                  noteText =
                    "( Just put the powder over tongue and chew it Or Mix it in 100ml of water. Can be increased to 1.5 or 2 spoon if one spoon is not effective )";
                } else if (isAnospray) {
                  noteText =
                    "( For instant pain relief, spray 1-2 puffs at the anal opening before and after passing stools. )";
                } else if (note) {
                  noteText = note;
                }

                return (
                  <React.Fragment key={idx}>
                    <tr>
                      <td
                        style={{ textTransform: "uppercase", fontWeight: 600 }}
                      >
                        {medName}
                      </td>
                      <td>{timeString}</td>
                      <td>{daysText}</td>
                      <td style={{ textAlign: "right" }}>{med.qty}</td>
                    </tr>
                    {noteText && (
                      <tr className="med-note">
                        <td colSpan={4}>{noteText}</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <br />
          <div className="row-flex">
            <div style={{ width: "100%" }}>
              {d.doctor_comment && (
                <p>
                  <span className="fw-bold">Doctor Comment :</span> {d.doctor_comment}
                </p>
              )}
              <p>
                <span className="fw-bold">Next Appointment :</span>{" "}
                {nextAppoDate}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">Assistant Doctor :</span> {doctorName}{" "}
                {doctorPhone}
              </p>
            </div>
          </div>
          <br />

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ width: "100%" }}>
                  <p>
                    <span className="fw-bold">Important Note :</span> In case
                    there is no relief with medications in 2 weeks of time...
                    Consult the surgeon immediately to evaluate the disease
                    again.
                  </p>
                  {/* Uncomment if footer images are needed */}
                  {/* {sitelocation === 'Pimpri-Chinchwad' ? (
                    <img src={prescriptionCh} alt="Footer" style={{width: '100%'}} />
                  ) : (
                    <img src={prescriptionBottom} alt="Footer" style={{width: '100%'}} />
                  )} */}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

export default OpdPrescriptionPrintView;
