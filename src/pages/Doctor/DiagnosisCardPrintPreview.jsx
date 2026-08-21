import React, { useEffect, useState, useRef } from "react";
import { Button, Container } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { useReactToPrint } from "react-to-print";
import DiagnosisPrintView from "./DiagnosisPrintView";

export default function DiagnosisCardPrintPreview() {
  const [printData, setPrintData] = useState(null);
  const masterPrintRef = useRef();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("masterPrintData");
      if (stored) {
        setPrintData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading master print data:", e);
    }
  }, []);

  const triggerPrint = useReactToPrint({
    contentRef: masterPrintRef,
    content: () => masterPrintRef.current,
  });

  if (!printData) {
    return (
      <Container className="text-center py-5">
        <h4>No Diagnosis Data Available</h4>
        <p className="text-muted">Please select a patient visit to preview.</p>
        <Button variant="secondary" onClick={() => window.close()}>
          Close Tab
        </Button>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "20px" }}>
      {/* Top Header Bar */}
      <div
        className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded border no-print mx-auto"
        style={{ maxWidth: "210mm" }}
      >
        <div className="d-flex align-items-center gap-2">
          <FeatherIcon icon="file-text" className="text-info" size={24} />
          <h5 className="mb-0 fw-bold" style={{ color: "#333" }}>
            Patient Diagnosis & History Card
          </h5>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => window.close()}
            style={{ borderRadius: "6px", fontWeight: "600" }}
          >
            Close Tab
          </Button>
          <Button
            variant="info"
            className="text-white"
            onClick={triggerPrint}
            style={{ borderRadius: "6px", fontWeight: "600" }}
          >
            <FeatherIcon icon="printer" size={16} className="me-2" />
            Print Card
          </Button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div
        className="p-4 bg-white shadow-sm mx-auto rounded"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <DiagnosisPrintView
          ref={masterPrintRef}
          patient={printData.patient}
          historyList={printData.history || []}
          diagnosisList={printData.diagnosis || []}
        />
      </div>
    </div>
  );
}
