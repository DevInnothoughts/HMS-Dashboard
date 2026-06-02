import React from "react";
import nabhLogo from "../../assets/images/nabh-logo.png";

const OpdPrescriptionPrintView = React.forwardRef(
  ({ prescriptionData, formData, historyData, doctors = [], location: sitelocation }, ref) => {
    const d = prescriptionData || {};
    const patient = formData || {};
    const history = historyData || {};

    const assistantDoc = doctors.find(
      (doc) => String(doc.doctor_id || doc.id) === String(d.doctor_id || d.udoctor_id)
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
          @media screen, print {
            .opd-print-container {
              font-family: Arial, sans-serif;
              font-size: 15px;
              margin: 0;
              padding: 20px;
              background-color: white !important;
              color: #000 !important;
            }
            .opd-print-container p, .opd-print-container span, .opd-print-container div {
              color: #000 !important;
            }
            .opd-print-container .row-flex {
              display: flex;
              flex-wrap: wrap;
            }
            .opd-print-container p {
              margin: 5px 0;
            }
            .opd-print-container .fw-bold {
              font-weight: 700 !important;
            }
            .opd-print-container .text-right {
              text-align: right;
            }
            .opd-print-container .medicine-header {
              font-weight: 700 !important;
              border-bottom: 2px solid #000;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
          }
        `}</style>

        <div style={{ padding: "20px" }}>
          <div className="row-flex" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}></div>
            <h3 style={{ margin: 0, textAlign: "center", fontWeight: "bold", flex: 1, textDecoration: "underline" }}>PRESCRIPTION</h3>
            <div style={{ flex: 1 }}>
              <p className="text-right fw-bold" style={{ margin: 0 }}>DATE : {cdate}</p>
            </div>
          </div>

          <div className="row-flex">
            <div style={{ width: "100%" }}>
              <p>
                <span className="fw-bold">NAME :</span> {patient.name || patient.Name} ({" "}
                {patient.age || patient.Age} / {patient.sex || patient.Sex} ) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">UID NO :</span> {patient.Uid_no || patient.uid_no || patient.UID_NO || patient.uid || ""}
              </p>
              <p>
                <span className="fw-bold">BP : </span> {history.vital_bp || history.Vital_bp || history.VITAL_BP || ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">Pulse : </span>{" "}
                {history.vital_pulse || history.Vital_pulse || history.VITAL_PULSE || ""}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">SPO2 : </span> {history.spo2 || history.Spo2 || history.SPO2 || ""} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">Height : </span>{" "}
                {history.height_feet || history.Height_feet || history.HEIGHT_FEET || ""} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">Weight : </span>{" "}
                {history.weight_kg || history.Weight_kg || history.WEIGHT_KG || ""}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </p>
              <p>
                <span className="fw-bold">RS : </span> {history.rs || history.Rs || history.RS || ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">CVS : </span> {history.cvs || history.Cvs || history.CVS || ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">CNS : </span> {history.cns || history.Cns || history.CNS || ""}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">PA : </span> {history["p/a"] || history["P/A"] || history.pa || history.PA || ""}{" "}
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
          <div className="row-flex medicine-header">
            <div style={{ width: "30%" }}>Medicine</div>
            <div style={{ width: "45%" }}>Dosage</div>
            <div style={{ width: "15%" }}>Days</div>
            <div style={{ width: "10%", textAlign: "right" }}>Qty</div>
          </div>

          {medicines.map((med, idx) => {
            const isAnoacCream =
              med.name?.toLowerCase().includes("cream") ||
              med.name?.toLowerCase().includes("gel") ||
              med.name?.toLowerCase().includes("ointment");
            const isConstac = med.name?.toLowerCase().includes("constac");
            const isAnospray = med.name?.toLowerCase().includes("anospray");
            let timeString = formatMedicineTime(med.times || []);
            if (isConstac) {
              timeString = "1 spoon At Night ( Before sleep )";
            }
            const medName = med.name?.replace(/\([^)]*\)/, "").trim();
            const note = med.note || "";

            if (isAhmedabadLocationClass) {
              return (
                <div
                  className="row-flex"
                  key={idx}
                  style={{ marginBottom: "10px" }}
                >
                  <div style={{ width: "30%" }}>
                    <span style={{ textTransform: "uppercase", fontWeight: 600 }}>
                      {medName}
                    </span>
                  </div>
                  <div style={{ width: "45%" }}>
                    <span>{timeString}</span>
                  </div>
                  <div style={{ width: "15%" }}>
                    <span>{med.days}</span>
                  </div>
                  <div style={{ width: "10%", textAlign: "right" }}>
                    <span>{med.qty}</span>
                  </div>
                  {note && (
                    <div style={{ width: "100%", marginTop: "5px" }}>
                      <span>({note})</span>
                    </div>
                  )}
                </div>
              );
            }

            // Normal location rendering
            return (
              <div
                className="row-flex"
                key={idx}
                style={{ marginBottom: "10px" }}
              >
                <div style={{ width: "30%" }}>
                  <span style={{ textTransform: "uppercase", fontWeight: 600 }}>
                    {medName}
                  </span>
                </div>
                <div style={{ width: "45%" }}>
                  <span>{timeString}</span>
                </div>
                <div style={{ width: "15%" }}>
                  <span>{med.days} Days</span>
                </div>
                <div style={{ width: "10%", textAlign: "right" }}>
                  <span>{med.qty}</span>
                </div>

                {isAnoacCream && (
                  <div
                    style={{
                      width: "100%",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontStyle: "italic" }}>
                      ( Keep the area clean and dry. Apply locally as directed. Massage gently with a fingertip for approximately 5 minutes. )
                    </span>
                  </div>
                )}
                {isConstac && (
                  <div style={{ width: "100%" }}>
                    <span style={{ fontSize: "12px", fontStyle: "italic" }}>
                      ( Just put the powder over tongue and chew it Or Mix it in 100ml of water.
                      Can be increased to 1.5 or 2 spoon if one spoon is not effective )
                    </span>
                  </div>
                )}
                {isAnospray && (
                  <div style={{ width: "100%", paddingTop: "5px" }}>
                    <span style={{ fontSize: "12px", fontStyle: "italic" }}>
                      ( For instant pain relief, spray 1-2 puffs at the anal opening before and after passing stools. )
                    </span>
                  </div>
                )}
                {!isAnoacCream && !isConstac && !isAnospray && note && (
                  <div style={{ width: "100%", paddingTop: "5px" }}>
                    <span>{note}</span>
                  </div>
                )}
              </div>
            );
          })}
          <br />
          <div className="row-flex">
            <div style={{ width: "100%" }}>
              <p>
                <span className="fw-bold">Next Appointment :</span>{" "}
                {nextAppoDate}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="fw-bold">Assistant Doctor :</span> {doctorName}{" "}
                {doctorPhone}
              </p>
            </div>
          </div><br />

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
  }
);

export default OpdPrescriptionPrintView;
