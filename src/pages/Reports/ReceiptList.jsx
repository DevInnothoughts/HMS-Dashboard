import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { decodeJwt } from "../../utils/decode-jwt";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import Swal from "sweetalert2";
import { clinincLoc } from "../../utils/clinic_locations";
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
const BASE_URL = "http://194.195.117.79:5100/api";
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
  const [currentLocation, setCurrentLocation] = useState("default");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(moment().startOf("day").toDate());
  const [toDate, setToDate] = useState(moment().endOf("day").toDate());
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [filters, setFilters] = useState({
    // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.EQUALS }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
        console.log(`Location set from JWT: ${payload.jobLocation}`);
      }
    } else {
      console.warn("JWT Token not found in localStorage.");
    }
  }, []);

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
        location: currentLocation, 
      };
      // console.log(params);
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

  useEffect(() => {
    if (currentLocation !== "default") {
      fetchReceiptsData();
    }
  }, [fetchReceiptsData, currentLocation]);

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
      const lakhs = Math.floor(num / 100000);
      const remainder = num % 100000;
      result = toWords(lakhs) + " Lakh " + toWords(remainder);
    }
    return result.trim() + " Rupees Only";
  };

  const handlePrintReceipt = (selectedReceipt) => {
    if (!selectedReceipt) return;
    console.log(" printing  RECEPT: ", selectedReceipt);

    const clinicAddr = clinincLoc[currentLocation] || {
      address: "Healing Hands Clinic Pvt Ltd, DP Road, Ground Floor, Millenium Star Extension, Adjacent to Ruby Hall Clinic, Pune 411001",
      phone: "8888288884 | 020-26164488/99"
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
      getBase64Image(receiptLogo)
    ]).then(([mainLogo, horizontalReceiptLogo]) => {
      const receiptWindow = window.open("", "_blank", "width=800,height=850");
      if (!receiptWindow) return;

      const netAmount = (parseFloat(selectedReceipt.totalamt) - parseFloat(selectedReceipt.discountamt || 0)).toFixed(2);
      const amountInWords = numberToWords(netAmount);

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Healing Hands</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <style>
          body { 
            font-family: 'Poppins', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            display: flex; 
            flex-direction: column;
            align-items: center; 
            font-size: 10.5px !important; 
          }
          
          .receipt-border { 
            border: 10px solid #2b9163;
            width: 720px; 
            padding: 20px; 
            box-sizing: border-box;
            background: #fff;
          }

          .addr-cell {
      padding-left: 2px; 
      vertical-align: top;
      line-height: 1.5;
      margin-top: 5px;
      margin-right: 40px; 
      display: block;
    }

          .header-table { 
            width: 100%; 
            border-bottom: 1px dotted #ccc; 
            padding-bottom: 10px; 
            margin-bottom: 15px; 
          }

          .content-table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          
          .receipt-label-cell { 
            width: 12%; 
            vertical-align: top; 
          }
          
          .receipt-label-img { 
            width: 100%; 
            height: auto; 
            display: block;
          }

          .data-cell { 
            width: 88%; 
            padding-left: 25px; 
            vertical-align: top; 
            padding-top: 10px; 
          }

          .meta-table { 
            width: 100%; 
            margin-top: 5px; 
            margin-bottom: 20px; 
          }
          
          .meta-table td { 
            padding-bottom: 8px; 
          }

          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .items-table th { background: #f4f4f4; padding: 6px; text-align: left; border-bottom: 1px solid #ddd; }
          .items-table td { padding: 8px; border-bottom: 1px dotted #eee; }

          .summary-section { float: right; width: 220px; text-align: right; margin-top: 10px; line-height: 1.6; }
          
          .footer-details { 
            margin-top: 40px; 
            clear: both; 
          }

          .flex-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end; 
            margin-top: 5px;
          }

          .legal-text { 
            margin-top: 25px; 
            font-size: 9.5px; 
            color: #333; 
            border-top: 1px solid #eee; 
            padding-top: 10px;
            line-height: 1.4;
          }

         .signature-area { 
  text-align: center; 
  width: 140px; 
  font-weight: bold;
  border-top: 1px solid #000; 
  padding-top: 8px;           
  margin-left: 20px;       
  margin-top: 15px;      
}

          @media print { .no-print { display: none; } }
          .print-btn { padding: 10px 20px; background: #2b9163; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="receipt-border">
          <table class="header-table">
            <tr>
              <td class="logo-cell"><img src="${mainLogo}" style="width: 160px;"></td>
              <td class="addr-cell">
                <b style="font-size: 11px;">
                ${clinicAddr.address}<br>
                <i class="fa fa-phone"></i> ${clinicAddr.phone}
              </td>
            </tr>
          </table>

          <table class="content-table">
            <tr>
              <td class="receipt-label-cell">
                <img src="${horizontalReceiptLogo}" class="receipt-label-img">
              </td>
              <td class="data-cell">
                <table class="meta-table">
                  <tr>
                    <td width="55%">Patient Name : <b style="text-transform: uppercase;">${selectedReceipt.patientName}</b></td>
                    <td width="45%">Receipt No : <b>${selectedReceipt.receipt_id}</b></td>
                  </tr>
                  <tr>
                    <td>Doctor Name : <b>${selectedReceipt.doctorName || '-'}</b></td>
                    <td>Date : <b>${moment(selectedReceipt.receipt_date).format("DD-MM-YYYY")}</b></td>
                  </tr>
                </table>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th width="15%">Sr. No</th>
                      <th width="60%">Description</th>
                      <th width="25%" align="right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selectedReceipt.item_details
                      ? selectedReceipt.item_details.split(",").map((itemGroup, index) => {
                          // Split "USG ABDOMEN AND PELVIS: 100" into ["USG ABDOMEN AND PELVIS", "100"]
                          const parts = itemGroup.split(":");
                          const label = parts[0] ? parts[0].trim() : "-";
                          const amount = parts[1] ? parseFloat(parts[1].trim()) : 0;

                          return `
                            <tr>
                              <td>${index + 1}</td>
                              <td>${label}</td>
                              <td align="right"><b>${amount.toFixed(2)}</b></td>
                            </tr>
                          `;
                        }).join("")
                      : `<tr><td>1</td><td>-</td><td align="right">0.00</td></tr>`
                    }
                  </tbody>
                </table>
                <div class="summary-section">
                  Sub Total : <b>${parseFloat(selectedReceipt.totalamt).toFixed(2)}</b><br>
                  Discount (If Any) : <b>${parseFloat(selectedReceipt.discountamt || 0).toFixed(2)}</b><br>
                  Payable Amount : <b>${netAmount}</b>
                </div>

                <div class="footer-details">
                  In Words : <b>${amountInWords}</b><br>
                  <div class="flex-footer">
                    <div>Payment Mode : <span style="text-transform: capitalize;"><b>${selectedReceipt.paymentmode}</b></span></div>
                    <div class="signature-area">Signature</div>
                  </div>
                </div>

                <div class="legal-text">
                  In case you have not received the correct receipt for the paid amount, or for any discrepancies in transaction please write us on info@healinghandsclinic.co.in or whatsapp on +91 8888988882
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div class="btn-container no-print">
          <button onclick="window.print()" class="print-btn">Print Receipt</button>
        </div>
      </body>
      </html>
    `;

      receiptWindow.document.write(htmlContent);
      receiptWindow.document.close();
    });
  };

  const sendMail = (receipt) => {
    Swal.fire({
      title: "Feature Coming Soon!",
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
                setFirst(0);
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
