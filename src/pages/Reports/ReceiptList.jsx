import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { decodeJwt } from "../../utils/decode-jwt";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import Swal from "sweetalert2";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { Link } from "react-router-dom";
import NavBarA from "../../components/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css";
import { FilterMatchMode } from "primereact/api";
import moment from "moment";
import { Button } from "react-bootstrap";
import logo from "../../assets/images/3.png";
import labLogo from "../../assets/images/1.png";
import pharmacyLogo from "../../assets/images/2.png";
import receiptLogo from "../../assets/images/4.png";
const BASE_URL = "http://localhost:5100/api";
const LOCATION = "demo";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export default function ReceiptList() {
  // --- State Management ---
  const [currentLocation, setCurrentLocation] = useState("default");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(moment().startOf("day").toDate());
  const [toDate, setToDate] = useState(moment().endOf("day").toDate());
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    // 1. Get the token
    const token = localStorage.getItem("token");
    if (token) {
      // 2. Decode the token
      const payload = decodeJwt(token);
      // 3. Set the location state from the payload
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
        console.log(`Location set from JWT: ${payload.jobLocation}`);
      }
    } else {
      console.warn("JWT Token not found in localStorage.");
    }
  }, []);
  // ------------------------- API & Data Fetching -------------------------

  // Helper to format Date objects to YYYY-MM-DD string for API
  const formatToYYYYMMDD = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  const fetchReceiptsData = useCallback(async () => {
    setLoading(true);
    try {
      if (!currentLocation || !fromDate || !toDate) {
        if (!currentLocation)
          console.warn("Waiting for location to be set from JWT...");
        return;
      }

      const finalFromDate = formatToYYYYMMDD(fromDate);
      const finalToDate = formatToYYYYMMDD(toDate);

      const url = new URL(`${BASE_URL}/V1/appointment/listReceipt`);

      const params = {
        from: finalFromDate,
        to: finalToDate,
        location: currentLocation, // <--- Use the state location here
      };

      // Ensure the dates are formatted correctly for the API, then append all params
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key])
      );

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data.data)) {
        console.log(data.data);
        setReceipts(data.data);
        console.log("📥 Fetched Receipts:", data.data.length);
      } else {
        Toast.fire({
          icon: "error",
          title: "Failed to load receipts",
        });
        console.error(
          "❌ Error fetching receipts:",
          data.message || "Unknown error"
        );
        setReceipts([]);
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Network error occurred",
      });
      console.error("❌ Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, currentLocation]);

  // Load data on date filter change or component mount
  useEffect(() => {
    // Check currentLocation dependency here
    if (currentLocation !== "default") {
      fetchReceiptsData();
    }
  }, [fetchReceiptsData, currentLocation]);

  // ------------------------- Print & Action Logic -------------------------

  // Helper function for converting number to words (kept isolated)
  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const toWords = (n) => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10];
      if (n < 1000)
        return ones[Math.floor(n / 100)] + " Hundred " + toWords(n % 100);
      return toWords(Math.floor(n / 1000)) + " Thousand " + toWords(n % 1000);
    };

    let result = toWords(Math.round(num));
    if (num >= 100000) {
      // Simple logic for Lakhs (adjust based on required regional format)
      const lakhs = Math.floor(num / 100000);
      const remainder = num % 100000;
      result = toWords(lakhs) + " Lakh " + toWords(remainder);
    }
    return result.trim() + " Rupees Only";
  };

  // Handles the complex logic of fetching images, creating the HTML, and printing
  const handlePrintReceipt = (selectedReceipt) => {
    if (!selectedReceipt) {
      Swal.fire({
        title: "Preparing Print",
        text: `Opening receipt for ${receipt.patient_name}`,
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const receiptWindow = window.open("", "_blank", "width=800,height=800");
    if (!receiptWindow) {
      alert("Please allow pop-ups to print the receipt.");
      return;
    }

    const handleDeleteReceipt = async (receiptId) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this receipt deletion!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${BASE_URL}/V1/receipt/delete/${receiptId}?location=${currentLocation}`,
            {
              method: "DELETE",
            }
          );
          if (response.ok) {
            Swal.fire("Deleted!", "Receipt has been deleted.", "success");
            fetchReceipts();
          } else {
            Toast.fire({ icon: "error", title: "Delete failed" });
          }
        } catch (error) {
          Toast.fire({ icon: "error", title: "Error connecting to server" });
        }
      }
    };

    const getBase64Image = (imgUrl) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve("");
        img.src = imgUrl;
      });
    };

    Promise.all([
      getBase64Image(logo),
      getBase64Image(labLogo),
      getBase64Image(pharmacyLogo),
      getBase64Image(receiptLogo),
    ])
      .then(
        ([mainLogo, labLogoBase64, pharmacyLogoBase64, receiptLogoBase64]) => {
          const amountInWords = numberToWords(
            selectedReceipt.totalamt - selectedReceipt.discountamt
          );

          const receiptContent = `
            <html>
                <head>
                <title>Receipt- Healing Hands</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
                <style>
                  body, table, tr, td, p {
                    font-size: 13px !important;
                    margin: 0;
                    padding: 0;
                  }
                  .bgdiv { background: #2b9163; padding: 15px; }
                  .maindiv { background: white; border: 1px solid white; border-radius: 15px; padding: 10px; }
                  .Lablogo, .Medicologo { margin-right: 10px; width: 60px; }
                  .HHClogo { width: 200px; }
                  .receipt { width: 80%; height: 380px; }
                  .fa-phone { padding: 3px 4px; border: 1px solid grey; border-radius: 50%; }
                  .amount-box-container { display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start; }
                  .amount-box { border: 1px solid #ccc; padding: 10px; width: 180px; text-align: center; background-color: #f9f9f9; }
                  .print-btn { display: block; width: 20%; padding: 10px; background-color: #2b9163; color: white; text-align: center; font-size: 14px; font-weight: bold; cursor: pointer; border: none; border-radius: 5px; margin-top: 10px; }
                  @media print { .print-btn { display: none; } .bgdiv { background-color: #2b9163 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
              </head>
              <body>
                <div class="bgdiv">
                  <div class="maindiv">
                    <table width='100%' border='0'>
                      <tr>
                        <td style="width:30%;"><img src="${mainLogo}" class="HHClogo"></td>
                        <td style="width:15%; text-align:right;"><img src="${labLogoBase64}" class="Lablogo"></td>
                        <td style="width:15%; text-align:center; "><img src="${pharmacyLogoBase64}" class="Medicologo"></td>
                        <td style="width:40%;">
                          <table width='100%' border='0' style= "margin-left:180px;">
                          <tr><td>Date:&nbsp;<b>${moment(
                            selectedReceipt.receipt_date
                          ).format("DD-MM-YYYY")}</b></td></tr>
                          <tr margin><td>Receipt No:&nbsp;<b>${
                            selectedReceipt.receipt_id
                          }</b></td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <br>
                    <table width='100%' border='0'>
                      <tr>
                        <td style="width:15%;"><img src="${receiptLogoBase64}" class="receipt"></td>
                        <td style="width:85%;">
                          <table width='100%' border='0'>
                        <tr>
                        <td style="width:85px; line-height:40px;">Received From: </td>
                        <td><p style="font-weight: 600; text-transform: uppercase;">${
                          selectedReceipt.patientName
                        }</p></td>
                        </tr>
                         </table>
                          <table width='100%' border='0'>
                            <tr>
                              <td>
                                For:  <span style="font-weight:600; text-transform:uppercase;">${
                                  selectedReceipt.consultation
                                }</span>
                              </td>
                            </tr>
                          </table>                         
                          <br>
                          <table width='100%' border='0'>
                            <tbody>
                              <tr>
                                <td style="width:60%; vertical-align: top;">
                                  Payment Mode: &nbsp;<b>${
                                    selectedReceipt.paymentmode
                                  }</b><br>
                                  In Words: &nbsp;<b>${amountInWords}</b><br><br>
                                  <b>Next Appointment: </b>No appointment scheduled<br>
                                  <br>
                                  Healing Hands Clinic Pvt Ltd,<br>
                                  Dhole Patil Road,<br>
                                  DP Road, Ground Floor, Millenium Star Extension,<br>
                                  Adjacent to Ruby Hall Clinic, Pune, 411001.
                                </td>
                                <td style="width:40%; vertical-align: top;">
                                  <div class="amount-box-container">
                                    <div class="amount-box"><b>Total:</b> Rs. ${
                                      selectedReceipt.totalamt
                                    }/-</div>
                                    <div class="amount-box" style="margin-top: 5px;"><b>Discount:</b> Rs. ${
                                      selectedReceipt.discountamt
                                    }/-</div>
                                    <div class="amount-box" style="margin-top: 5px;"><b>Net Amount:</b> Rs. ${
                                      selectedReceipt.totalamt -
                                      selectedReceipt.discountamt
                                    }/-</div>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table width='100%' border='0'>
                            <tr>
                              <td style="width:100%;" colspan="3">
                                <br>
                                <p>In case you have not received the correct receipt for the paid amount. Please contact the clinic.</p>
                                <table width='100%' border='0'>
                            <tr>
                              <td>
                                <i class="fa fa-phone"></i>&nbsp;8888288884&nbsp;|&nbsp;020-26164488/99
                              </td>
                            </tr>
                          </table>
                          <table width='100%' border='0'>
                            <tr>
                            <td> 
                            <i class="fa fa-envelope-open"></i>&nbsp;info@healinghandsclinic.co.in
                            </td>
                          </tr>
                          </table>
                            <table width='100%' border='0'>
                            <tr>
                            <td> 
                            <i class="fa fa-globe"></i>&nbsp;www.healinghandsclinic.co.in</td></tr>
                          </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
                <button class="print-btn" onclick="window.print()" style="margin-left:40%; margin-top:20px;">Print</button >
              </body>
            </html>
          `;
          receiptWindow.document.write(receiptContent);
          receiptWindow.document.close();
        }
      )
      .catch((error) => console.error("Error loading images:", error));
  };

  const sendMail = (receipt) => {
    Swal.fire({
      title: "Feature Coming Soon!",
      // text: `Emailing receipt for ID: ${receipt.receipt_id} is currently under development.`,
      text: `Emailing receipt feature is currently under development.`,
      icon: "info",
      confirmButtonColor: "#00bcd4",
    });
  };

  const actionBodyTemplate = (receipt) => (
    <div className="d-flex align-items-center justify-content-center">
      {/* Mail Button */}
      <Button
        onClick={() => sendMail(receipt)}
        className="btn btn-extra-small btn-icon  me-2"
        variant="primary"
        title="Mail"
      >
        <FeatherIcon icon="mail" size="14" />
      </Button>
      {/* Print Button */}
      <Button
        onClick={() => handlePrintReceipt(receipt)}
        className="btn btn-extra-small btn-icon "
        variant="primary"
        title="Print"
      >
        <FeatherIcon icon="printer" size="14" />
      </Button>
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        border: "1px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "8px",
        padding: "10px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                marginRight: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Show
            </span>
            <Form.Select
              size="sm"
              value={rows}
              onChange={(e) => {
                setRows(parseInt(e.target.value));
                setFirst(0); // Reset to first page when changing row count
              }}
              style={{
                width: "70px",
                height: "30px",
                border: "1px solid #4dd0e1",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>
          <Form.Group
            className="ms-2"
            style={{ display: "flex", alignItems: "center", margin: 0 }}
          >
            <span
              style={{
                marginRight: "10px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Search
            </span>
            <InputGroup>
              <Form.Control
                type="search"
                value={filters.global.value || ""}
                onChange={(e) =>
                  setFilters({
                    global: {
                      value: e.target.value,
                      matchMode: FilterMatchMode.CONTAINS,
                    },
                  })
                }
                placeholder="Global Search"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
                  transition: "all 0.3s ease",
                }}
              />
            </InputGroup>
          </Form.Group>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #4dd0e1",
            borderRadius: "8px",
            padding: "8px",
            backgroundColor: "#f5fcfd",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              From Date
            </div>
            <DatePicker
              selected={fromDate}
              onChange={setFromDate}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>

          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              To Date
            </div>
            <DatePicker
              selected={toDate}
              onChange={setToDate}
              dateFormat="dd-MM-yyyy"
              minDate={fromDate}
              placeholderText="Select to date"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>

          <Button
            variant="primary"
            onClick={fetchReceiptsData}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "6px",
              padding: "6px 7px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "15px",
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={13} className="me-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <PageBreadcrumb pagename="Receipt List" />
      <NavBarA pagename="Receipt List" />
      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1.5px solid #00bcd4",
                }}
              >
                <Card.Body>
                  {loading ? (
                    <div
                      className="d-flex justify-content-center py-5"
                      style={{ color: "#00bcd4" }}
                    >
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : (
                    <DataTable
                      value={receipts}
                      paginator
                      rows={rows}
                      first={first}
                      onPage={(e) => {
                        setFirst(e.first);
                        setRows(e.rows);
                      }}
                      header={renderHeader}
                      filters={filters}
                      globalFilterFields={[
                        "receipt_id",
                        "receipt_date",
                        "patientName",
                        "consultation",
                        "doctorName",
                        "totalamt",
                      ]}
                      responsiveLayout="scroll"
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      className="datatable-compact-style datatable-medium-small"
                      rowClassName={(rowData, { rowIndex }) => ({
                        style: {
                          backgroundColor:
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white",
                          transition: "background-color 0.3s ease",
                        },
                        onMouseOver: (e) => {
                          e.currentTarget.style.backgroundColor = "#b2ebf2";
                        },
                        onMouseOut: (e) => {
                          e.currentTarget.style.backgroundColor =
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white";
                        },
                      })}
                    >
                      <Column
                        field="srNo"
                        header="Sr No"
                        body={(rowData, { rowIndex }) => rowIndex + 1}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "70px",
                        }}
                      />
                      <Column
                        field="receipt_id"
                        header="Receipt ID"
                        body={(rowData) => rowData.receipt_id || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "110px",
                        }}
                      />
                      <Column
                        field="receipt_date"
                        header="Date"
                        body={(rowData) =>
                          rowData.receipt_date
                            ? moment(rowData.receipt_date).format("DD-MM-YYYY")
                            : "-"
                        }
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "100px",
                        }}
                      />
                      <Column
                        field="patientName"
                        header="Patient Name"
                        body={(rowData) => rowData.patientName || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          wordBreak: "break-word",
                          width: "180px",
                        }}
                      />
                      <Column
                        field="consultation"
                        header="Consultation"
                        body={(rowData) => rowData.consultation || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          wordBreak: "break-word",
                          width: "140px",
                        }}
                      />
                      <Column
                        field="doctorName"
                        header="Doctor Name"
                        body={(rowData) => rowData.doctorName || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          wordBreak: "break-word",
                          width: "180px",
                        }}
                      />
                      <Column
                        field="totalamt"
                        header="Total Amount"
                        headerClassName="datatable-header-center"
                        body={(rowData) =>
                          `₹ ${parseFloat(rowData.totalamt).toFixed(2)}`
                        }
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />
                      <Column
                        field="discountamt"
                        header="Discount Amount"
                        headerClassName="datatable-header-center"
                        body={(rowData) =>
                          `₹ ${parseFloat(rowData.discountamt || 0).toFixed(2)}`
                        }
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />
                      <Column
                        header="Actions"
                        body={actionBodyTemplate}
                        exportable={false}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          alignContent: "center",
                          padding: "0.75rem",
                          width: "100px",
                        }}
                      />
                    </DataTable>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
