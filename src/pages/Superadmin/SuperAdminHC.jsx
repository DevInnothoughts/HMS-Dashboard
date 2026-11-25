import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import moment from "moment";
import Swal from "sweetalert2";
import { LOCATIONS_LIST } from "../Auth/Login";

const BASE_URL = "http://194.195.117.79:5100/api";

const SuperAdminHC = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search Box States
  const [searchCertName, setSearchCertName] = useState("");
  const [searchExpiryStatus, setSearchExpiryStatus] = useState("");
  const [searchBranch, setSearchBranch] = useState("ALL");

  // Applied Filter States (triggered on Search submit)
  const [appliedFilters, setAppliedFilters] = useState({
    certName: "",
    expiryStatus: "",
    branch: "ALL",
  });

  // Preview Modal States
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [previewLocation, setPreviewLocation] = useState("");
  const [previewType, setPreviewType] = useState("");

  const iframeRef = useRef(null);

  const certificateOptions = [
    "Bio Medical Certificate",
    "Drug License",
    "Fire NOC",
    "Franchise Certificate",
    "Hospital License",
    "ISO Certificate",
    "NABH Certificate",
    "Pollution Control Certificate",
    "Rent Agreement",
    "Rohini Certificate",
  ];

  // Process branches list from Login.jsx
  const branchDisplayList = useMemo(() => {
    return LOCATIONS_LIST.map((loc) => ({
      label: typeof loc === "object" ? loc.label : loc,
      value: typeof loc === "object" ? loc.value : loc,
    }));
  }, []);

  const branchValues = useMemo(() => {
    return branchDisplayList.map((b) => b.value);
  }, [branchDisplayList]);

  // Status calculation function matching Reception HospitalCertificates
  const getStatus = (expiryDate) => {
    if (!expiryDate) return "Active";
    const expiry = moment(expiryDate).startOf("day");
    const today = moment().startOf("day");
    const tomorrow = moment().startOf("day").add(1, "day");
    const sixMonthsFromNow = moment().startOf("day").add(6, "months");

    if (expiry.isBefore(today)) {
      return "Expired";
    } else if (expiry.isSame(today)) {
      return "Expiring today";
    } else if (expiry.isSame(tomorrow)) {
      return "Expiring tomorrow";
    } else if (expiry.isSameOrBefore(sixMonthsFromNow)) {
      return "Expires soon";
    } else {
      return "Active";
    }
  };

  const getFileUrl = (dbPath) => {
    if (!dbPath) return "";
    if (dbPath.startsWith("http://") || dbPath.startsWith("https://"))
      return dbPath;
    try {
      const url = new URL(BASE_URL);
      return `${url.origin}${dbPath}`;
    } catch (e) {
      return `http://194.195.117.79:5100${dbPath}`;
    }
  };

  // Fetch certificates from branch or all branches
  const fetchCertificates = useCallback(async (branchToFetch) => {
    setLoading(true);
    const branches =
      branchToFetch === "ALL" ? branchValues : [branchToFetch];

    try {
      const promises = branches.map(async (loc) => {
        try {
          const response = await fetch(
            `${BASE_URL}/V1/certificates?location=${encodeURIComponent(loc)}`
          );
          if (!response.ok) return [];
          const data = await response.json();
          if (data && Array.isArray(data.data)) {
            return data.data.map((item) => ({
              ...item,
              location: loc,
            }));
          }
          return [];
        } catch (err) {
          return [];
        }
      });

      const results = await Promise.allSettled(promises);
      const combined = [];
      results.forEach((r) => {
        if (r.status === "fulfilled" && Array.isArray(r.value)) {
          combined.push(...r.value);
        }
      });

      setCertificates(combined);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error fetching certificates across branches.",
        confirmButtonColor: "#00acc1",
      });
    } finally {
      setLoading(false);
    }
  }, [branchValues]);

  // Initial load
  useEffect(() => {
    fetchCertificates("ALL");
  }, [fetchCertificates]);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedFilters({
      certName: searchCertName,
      expiryStatus: searchExpiryStatus,
      branch: searchBranch,
    });
    fetchCertificates(searchBranch);
  };

  // Download certificate with certifactename_location.pdf
  const handleDownload = async (cert) => {
    const rawPath = cert.certificate_path || cert.previewUrl;
    const fileUrl = getFileUrl(rawPath);
    if (!fileUrl) {
      Swal.fire({
        icon: "error",
        title: "Not Found",
        text: "No file URL found for download.",
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    const certName = (cert.certificate_name || cert.name || "Certificate").trim();
    const certLocation = (cert.location || cert.branch || "Branch").trim();
    const isPdf = fileUrl.toLowerCase().split("?")[0].endsWith(".pdf");
    const extension = isPdf ? "pdf" : "png";
    const downloadFileName = `${certName}_${certLocation}.${extension}`;

    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: trigger download link directly
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = downloadFileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Print Preview
  const handlePrintPreview = async () => {
    try {
      const res = await fetch(previewUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (previewType === "pdf") {
        const printIframe = document.createElement("iframe");
        printIframe.style.position = "fixed";
        printIframe.style.right = "0";
        printIframe.style.bottom = "0";
        printIframe.style.width = "0";
        printIframe.style.height = "0";
        printIframe.style.border = "0";
        printIframe.src = blobUrl;
        document.body.appendChild(printIframe);
        printIframe.onload = () => {
          setTimeout(() => {
            try {
              printIframe.contentWindow.focus();
              printIframe.contentWindow.print();
            } catch (err) {
              const printWindow = window.open(blobUrl, "_blank");
              if (printWindow) {
                printWindow.onload = () => printWindow.print();
              }
            } finally {
              setTimeout(() => {
                try {
                  document.body.removeChild(printIframe);
                } catch (e) { }
                URL.revokeObjectURL(blobUrl);
              }, 60000);
            }
          }, 500);
        };
      } else {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>${previewName}_${previewLocation}</title>
                <style>
                  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
                  img { max-width: 95%; max-height: 95vh; object-fit: contain; }
                </style>
              </head>
              <body>
                <img src="${blobUrl}" onload="window.print(); window.close();" />
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (e) {
      console.warn("Print fallback to direct previewUrl:", e);
      const printWindow = window.open(previewUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
      }
    }
  };

  // Filter certificates based on applied filters
  const filteredCertificates = certificates.filter((cert) => {
    if (appliedFilters.certName && cert.certificate_name !== appliedFilters.certName) {
      return false;
    }
    if (
      appliedFilters.expiryStatus &&
      getStatus(cert.certificate_expiry) !== appliedFilters.expiryStatus
    ) {
      return false;
    }
    if (appliedFilters.branch !== "ALL" && cert.location !== appliedFilters.branch) {
      return false;
    }
    return true;
  });

  const statusBodyTemplate = (rowData) => {
    const status = getStatus(rowData.certificate_expiry);
    let badgeStyle = {
      padding: "4px 8px",
      borderRadius: "12px",
      fontWeight: "bold",
      fontSize: "12px",
    };

    if (status === "Active") {
      badgeStyle = {
        ...badgeStyle,
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
      };
    } else if (status === "Expires soon") {
      badgeStyle = {
        ...badgeStyle,
        backgroundColor: "#fff3e0",
        color: "#e65100",
      };
    } else {
      badgeStyle = {
        ...badgeStyle,
        backgroundColor: "#ffebee",
        color: "#c62828",
      };
    }

    return <span style={badgeStyle}>{status}</span>;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex justify-content-center align-items-center gap-2">
        {rowData.certificate_path ? (
          <Button
            variant="outline-info"
            size="sm"
            style={{
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "bold",
              padding: "5px 9px",
            }}
            title="Preview Certificate"
            onClick={() => {
              const url = getFileUrl(rowData.certificate_path);
              if (url) {
                setPreviewUrl(url);
                setPreviewName(rowData.certificate_name);
                setPreviewLocation(rowData.location || "");
                setPreviewType(
                  url.toLowerCase().split("?")[0].endsWith(".pdf")
                    ? "pdf"
                    : "image"
                );
                setShowPreview(true);
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Not Found",
                  text: "No file path found.",
                  confirmButtonColor: "#00acc1",
                });
              }
            }}
          >
            <i className="fa fa-eye"></i>
          </Button>
        ) : (
          <span
            style={{
              color: "#78909c",
              fontSize: "12px",
              fontStyle: "italic",
            }}
          >
            No file
          </span>
        )}
        {/* 
        <Button
          variant="outline-success"
          size="sm"
          style={{
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "bold",
            padding: "5px 9px",
          }}
          title={`Download as ${rowData.certificate_name}_${rowData.location || "Branch"}.pdf`}
          onClick={() => handleDownload(rowData)}
        >
          <i className="fa fa-download"></i>
        </Button> */}
      </div>
    );
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "10px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      <PageBreadcrumb pagename="Hospital Certificates" />

      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              {/* Search Certificate Card matching Add Certificate box in HospitalCertificates */}
              <Card
                className="mb-4"
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                  marginTop: "10px",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    borderBottom: "2px solid #0288d1",
                    padding: "0.6rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>
                    <i className="fa fa-search me-2"></i>Search Certificate
                  </h4>
                </Card.Header>
                <Card.Body style={{ padding: "6px" }}>
                  <form onSubmit={handleSearchSubmit}>
                    <div className="table-responsive add-cert-table-responsive">
                      <table
                        className="table text-center add-cert-table"
                        style={{ marginBottom: 0 }}
                      >
                        <thead>
                          <tr>
                            <th style={{ width: "30%" }}>Certificate Name</th>
                            <th style={{ width: "25%" }}>Certificate Expiry</th>
                            <th style={{ width: "30%" }}>Branch Name</th>
                            <th style={{ width: "15%" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <Form.Select
                                value={searchCertName}
                                onChange={(e) => setSearchCertName(e.target.value)}
                                style={{
                                  fontSize: "12px",
                                  borderRadius: "8px",
                                  border: "1px solid #4dd0e1",
                                }}
                              >
                                <option value="">--Select Certificate--</option>
                                {certificateOptions
                                  .sort((a, b) => a.localeCompare(b))
                                  .map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                              </Form.Select>
                            </td>

                            <td style={{ verticalAlign: "middle" }}>
                              <Form.Select
                                value={searchExpiryStatus}
                                onChange={(e) => setSearchExpiryStatus(e.target.value)}
                                style={{
                                  fontSize: "12px",
                                  borderRadius: "8px",
                                  border: "1px solid #4dd0e1",
                                }}
                              >
                                <option value="">Status (All)</option>
                                <option value="Active">Active</option>
                                <option value="Expires soon">Expires soon</option>
                                <option value="Expiring tomorrow">Expiring tomorrow</option>
                                <option value="Expiring today">Expiring today</option>
                                <option value="Expired">Expired</option>
                              </Form.Select>
                            </td>

                            <td style={{ verticalAlign: "middle" }}>
                              <Form.Select
                                value={searchBranch}
                                onChange={(e) => setSearchBranch(e.target.value)}
                                style={{
                                  fontSize: "12px",
                                  borderRadius: "8px",
                                  border: "1px solid #4dd0e1",
                                  fontWeight: "600",
                                }}
                              >
                                <option value="ALL">All</option>
                                {branchDisplayList.map((loc, idx) => (
                                  <option key={idx} value={loc.value}>
                                    {loc.label}
                                  </option>
                                ))}
                              </Form.Select>
                            </td>

                            <td style={{ verticalAlign: "middle" }}>
                              <Button
                                type="submit"
                                variant="info"
                                style={{
                                  width: "100%",
                                  color: "white",
                                  borderRadius: "8px",
                                  fontWeight: "bold",
                                  fontSize: "13px",
                                  padding: "5px 12px",
                                  backgroundColor: "#00acc1",
                                  borderColor: "#00acc1",
                                }}
                              >
                                <i className="fa fa-search me-1"></i>Search
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </form>
                </Card.Body>
              </Card>

              {/* Certificates List Card matching HospitalCertificates.jsx */}
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                  marginTop: "20px",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd",
                    borderBottom: "2px solid #0288d1",
                    padding: "0.6rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>
                    <i className="fa fa-certificate me-2"></i>Hospital Certificates
                  </h4>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <DataTable
                    value={filteredCertificates}
                    paginator
                    rows={10}
                    loading={loading}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    emptyMessage="No certificates found."
                    className="p-datatable-sm custom-datatable"
                    style={{ fontSize: "12px" }}
                    rowHover
                    stripedRows
                    responsiveLayout="scroll"
                  >
                    <Column
                      header="Sr No"
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{ width: "10%", textAlign: "center" }}
                    />
                    <Column
                      field="location"
                      header="Branch"
                      body={(rowData) => (
                        <span style={{ fontWeight: "700", color: "#00838f" }}>
                          📍 {rowData.location || "N/A"}
                        </span>
                      )}
                      style={{ width: "18%", textAlign: "center" }}
                    />
                    <Column
                      field="certificate_name"
                      header="Certificate Name"
                      style={{
                        width: "25%",
                        fontWeight: "600",
                        color: "#006064",
                        textAlign: "left",
                      }}
                    />
                    <Column
                      field="certificate_expiry"
                      header="Expiry Date"
                      body={(rowData) =>
                        rowData.certificate_expiry
                          ? moment(rowData.certificate_expiry).format("DD-MM-YYYY")
                          : "-"
                      }
                      style={{ width: "17%", textAlign: "center" }}
                    />
                    <Column
                      header="Status"
                      body={statusBodyTemplate}
                      style={{ width: "15%", textAlign: "center" }}
                    />
                    <Column
                      header="Action"
                      body={actionBodyTemplate}
                      style={{ width: "15%", textAlign: "center" }}
                    />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>

      {/* Document Preview Modal Popup with Print & Download Footer */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          style={{ background: "#e0f7fa", borderBottom: "2px solid #00bcd4" }}
        >
          <Modal.Title
            style={{ color: "#006064", fontWeight: "bold", fontSize: "16px" }}
          >
            <i className="fa fa-file-pdf-o me-2"></i> {previewName}{" "}
            - {previewLocation && `${previewLocation}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            textAlign: "center",
            backgroundColor: "#f5fcfd",
            padding: "15px",
          }}
        >
          {previewType === "pdf" ? (
            <iframe
              ref={iframeRef}
              src={`${previewUrl}#toolbar=0`}
              title={previewName}
              width="100%"
              height="550px"
              style={{ border: "none", borderRadius: "8px" }}
            />
          ) : (
            <img
              src={previewUrl}
              alt={previewName}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                maxWidth: "100%",
                maxHeight: "550px",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                userSelect: "none",
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer
          style={{
            background: "#e0f7fa",
            borderTop: "1px solid #b2ebf2",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "10px 16px",
            gap: "5px",
          }}
        >
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrintPreview}
            style={{
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              padding: "8px 16px",
              borderColor: "#00acc1",
              backgroundColor: "white",
            }}
          >
            <i className="fa fa-print me-1"></i> Print
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPreview(false)}
            style={{
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              padding: "8px 16px",
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .custom-datatable .p-datatable-header {
          background: #e0f7fa;
          border: 1px solid #4dd0e1;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 10px;
        }
        .custom-datatable .p-datatable-thead > tr > th {
          background-color: #b2ebf2 !important;
          color: black !important;
          font-size: 12px !important;
          padding: 10px 8px !important;
          border: 1px solid #90caf9 !important;
          text-align: center !important;
          font-weight: 600 !important;
          vertical-align: middle !important;
        }
        .custom-datatable .p-datatable-thead > tr > th * {
          color: black !important;
          justify-content: center !important;
        }
        .custom-datatable .p-datatable-tbody > tr > td {
          font-size: 12px !important;
          padding: 8px !important;
          border: 1px solid #90caf9 !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        .custom-datatable .p-paginator {
          background: #f8fdfe;
          border: 1px solid #4dd0e1;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          padding: 5px;
        }
        .add-cert-table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
          border: 1px solid #90caf9 !important;
          border-bottom-left-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
          overflow: hidden;
          width: 100%;
        }
        .add-cert-table th {
          background-color: #b2ebf2 !important;
          color: black !important;
          font-size: 12px !important;
          padding: 10px 8px !important;
          border-bottom: 1px solid #90caf9 !important;
          border-right: 1px solid #90caf9 !important;
          text-align: center !important;
          font-weight: 600 !important;
          vertical-align: middle !important;
        }
        .add-cert-table td {
          font-size: 12px !important;
          padding: 8px !important;
          border-bottom: 1px solid #90caf9 !important;
          border-right: 1px solid #90caf9 !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        .add-cert-table th:last-child,
        .add-cert-table td:last-child {
          border-right: none !important;
        }
        .add-cert-table tr:last-child td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
};

export default SuperAdminHC;
