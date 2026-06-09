import React, { useState, useEffect, useRef } from "react";
import NavbarIpdBills from "../../components/NavbarIpdBills";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  ListGroup,
  Table,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { FaPrint, FaPlus, FaListUl, FaTasks } from "react-icons/fa";
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";
import logo from "../../assets/images/3.png";
import receiptLogo from "../../assets/images/4.png";
import { clinincLoc } from "../../utils/clinic_locations-invoice.js";
import { receiptlocations } from "../../utils/clinic_locations-receipt.js";

const BASE_URL = "http://localhost:5100/api";
const IMAGE_BASE_URL = "http://localhost:5100";

const convertToWords = (number) => {
  if (number === 0) return "Zero";
  const words = {
    0: "",
    1: "One",
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
    6: "Six",
    7: "Seven",
    8: "Eight",
    9: "Nine",
    10: "Ten",
    11: "Eleven",
    12: "Twelve",
    13: "Thirteen",
    14: "Fourteen",
    15: "Fifteen",
    16: "Sixteen",
    17: "Seventeen",
    18: "Eighteen",
    19: "Nineteen",
    20: "Twenty",
    30: "Thirty",
    40: "Forty",
    50: "Fifty",
    60: "Sixty",
    70: "Seventy",
    80: "Eighty",
    90: "Ninety",
  };
  const digits = ["", "Hundred", "Thousand", "Lakh", "Crore"];
  let no = Math.floor(number);
  let str = [];
  let i = 0;
  while (i < 9) {
    let divider = i === 2 ? 10 : 100;
    let n = Math.floor(no % divider);
    no = Math.floor(no / divider);
    i += divider === 10 ? 1 : 2;
    if (n) {
      let counter = str.length;
      let plural = counter > 0 && n > 9 ? "s" : "";
      let hundred = counter === 1 && str[0] ? " and " : "";
      if (n < 21) {
        str.push(words[n] + " " + digits[counter] + plural + " " + hundred);
      } else {
        str.push(
          words[Math.floor(n / 10) * 10] +
          " " +
          words[n % 10] +
          " " +
          digits[counter] +
          plural +
          " " +
          hundred,
        );
      }
    } else {
      str.push(null);
    }
  }
  return str
    .reverse()
    .filter((x) => x)
    .join("")
    .trim();
};

const IpdPaymentData = () => {
  const [invoiceId, setInvoiceId] = useState("");
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    uhid: "",
    patient_id: "",
    phone: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [summary, setSummary] = useState({
    totalBill: 0,
    insuranceApproved: 0,
    patientPayable: 0,
    totalDue: 0,
  });
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({
    date: new Date().toISOString().split("T")[0],
    cash: 0,
    card: 0,
    cheque: 0,
    online: 0,
    internalDiscount: 0,
    tds: 0,
  });

  const dropdownRef = useRef(null);
  const isManualSelection = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

  useEffect(() => {
    if (isManualSelection.current) {
      isManualSelection.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      if (String(invoiceId).trim().length > 0) {
        fetchAutocompleteInvoices();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [invoiceId]);

  const fetchAutocompleteInvoices = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/V1/invoice/searchByInvoiceId?invoice_id=${invoiceId}&location=${currentLocation}`,
      );
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
      setShowDropdown(true);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setSearchResults([]);
    }
  };

  const handleSelectInvoice = (inv) => {
    isManualSelection.current = true;
    setInvoiceId(inv.invoice_id);
    setPatientDetails({
      name: inv.name,
      uhid: inv.Uid_no,
      patient_id: inv.patient_id,
      phone: inv.phone,
    });
    setShowDropdown(false);
  };

  const handleViewBillDetails = async () => {
    setLoading(true);
    try {
      const resTotal = await fetch(
        `${BASE_URL}/V1/invoice/searchInvoiceTotal?invoice_id=${invoiceId}&location=${currentLocation}`,
      );
      const totalData = await resTotal.json();
      const financialInfo = Array.isArray(totalData) ? totalData[0] : totalData;

      if (financialInfo) {
        setSummary({
          totalBill: financialInfo.totalamt || 0,
          insuranceApproved: financialInfo.receivedamt || 0,
          patientPayable: financialInfo.payableamt || 0,
          totalDue: financialInfo.totalduedamt || 0,
        });

        const resHistory = await fetch(
          `${BASE_URL}/V1/invoice/searchInvoiceDetails?invoice_id=${invoiceId}&location=${currentLocation}`,
        );
        const historyData = await resHistory.json();
        setPayments(Array.isArray(historyData) ? historyData : []);
        setShowBillDetails(true);
      } else {
        Swal.fire("Error", "Invoice financial data not found", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to fetch bill details", "error");
    } finally {
      setLoading(false);
    }
  };

  // ... inside your IpdPaymentData component ...

  // 1. Updated cancelPayment logic to match IPD requirements
  const cancelPayment = async (referenceId, originalPayload, apidata) => {
    try {
      // Prepare the specific cancellation payload for IPD
      const cancelPayload = {
        reference_id: referenceId,
        transaction_id: originalPayload.transaction_id || referenceId,
        PosMachine: originalPayload.PosMachine,
        MachineType: "IPD", // Explicitly set to IPD
        // Pass along financial context if needed by backend cancel logic
        InvoiceId: originalPayload.InvoiceId,
        PatientId: originalPayload.PatientId,
        apidata: apidata,
      };
      console.log(cancelPayload);
      const response = await fetch(
        `${BASE_URL}/V1/invoice/cancelIPDPaymentStatus?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cancelPayload),
        },
      );

      return await response.json();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // 2. Updated showPaymentPendingPopup to handle the IPD status check loop
  const showPaymentPendingPopup = (referenceId, originalPayload, apidata) => {
    Swal.fire({
      title: "Transaction in Progress",
      html: `
            <div style="padding: 10px;">
                <div class="spinner-border text-info mb-3" role="status"></div>
                <p><strong>Waiting for card swipe...</strong></p>
                <p class="text-muted small">Reference ID: ${referenceId}</p>
                <hr/>
                <p style="font-size: 13px;">Please check the POS terminal and click "Check Status" once the swipe is completed.</p>
            </div>
        `,
      icon: "info",
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: "Check Status",
      cancelButtonText: "Cancel Payment",
      confirmButtonColor: "#00bcd4",
      cancelButtonColor: "#cfd8dc",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          // Prepare payload for status check
          const statusPayload = {
            receiptData: originalPayload, // Contains all CashAmt, CardAmt, etc.
            reference_id: apidata.reference_id,
            transaction_id: referenceId,
            PosMachine: originalPayload.PosMachine,
            MachineType: "IPD",
            InvoiceId: originalPayload.InvoiceId,
            PatientId: originalPayload.PatientId,
            Totalinvoiceamt: originalPayload.Totalinvoiceamt,
          };
          console.log("INITITATION DATA IN PENDING POPUP: ", apidata);
          2;
          console.log(statusPayload);
          const response = await fetch(
            `${BASE_URL}/V1/invoice/checkIPDPaymentStatus?location=${currentLocation}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(statusPayload),
            },
          );

          const result = await response.json();

          // If status check returns 200/201, the payment is recorded in DB
          if (
            response.ok &&
            (result.success ||
              result.statusCode === 201 ||
              result.statusCode === 200)
          ) {
            return result;
          } else {
            Swal.showValidationMessage(
              result.message ||
              "Swipe not detected yet. Please try again after swiping.",
            );
            return false;
          }
        } catch (error) {
          Swal.showValidationMessage(`Check failed: ${error.message}`);
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Paid!",
          text: "IPD Receipt Generated Successfully",
          icon: "success",
          timer: 2000,
        });
        setShowAddRow(false);
        handleViewBillDetails(); // Refresh the table and summary
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Confirmation before calling the actual backend cancellation
        const confirmCancel = await Swal.fire({
          title: "Are you sure?",
          text: "This will attempt to stop the current payment request on the terminal.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Cancel it!",
          cancelButtonText: "No, Keep Waiting",
        });

        if (confirmCancel.isConfirmed) {
          try {
            Swal.fire({
              title: "Processing Cancellation...",
              allowOutsideClick: false,
              didOpen: () => Swal.showLoading(),
            });

            const cancelResult = await cancelPayment(
              referenceId,
              originalPayload,
              apidata,
            );

            if (cancelResult?.success || cancelResult?.statusCode === 200) {
              await Swal.fire(
                "Cancelled",
                "Transaction has been cancelled successfully.",
                "success",
              );
              setShowAddRow(false);
            } else {
              Swal.fire(
                "Cancellation Error",
                cancelResult?.message ||
                "Remote cancel failed. Please cancel manually on the POS machine.",
                "error",
              );
            }
          } catch (err) {
            Swal.fire(
              "Error",
              "Server error during cancellation process",
              "error",
            );
          }
        } else {
          // If user backs out of cancellation, re-open the pending popup
          showPaymentPendingPopup(referenceId, originalPayload, apidata);
        }
      }
    });
  };

  const handleSavePayment = async () => {
    const totalEntered = Object.values(newPayment).reduce(
      (a, b) => (typeof b === "number" ? a + b : a),
      0,
    );
    if (totalEntered <= 0)
      return Swal.fire(
        "Invalid Amount",
        "Please enter a payment value",
        "warning",
      );

    setLoading(true);
    try {
      const endpoint =
        newPayment.card > 0 || newPayment.online > 0
          ? "/V1/invoice/IPDDigitalPayment"
          : "/V1/invoice/SaveIPDPayment";

      const payload = {
        PatientId: patientDetails.patient_id,
        InvoiceId: invoiceId,
        InvoiceDate: newPayment.date,
        CashAmt: newPayment.cash,
        CardAmt: newPayment.card,
        ChequeAmt: newPayment.cheque,
        OnlineAmt: newPayment.online,
        DiscountAmt: newPayment.internalDiscount,
        TdsAmt: newPayment.tds,
        Totalinvoiceamt: summary.patientPayable,
        PosMachine: selectedTerminal,
        location: currentLocation,
      };
      console.log(endpoint);
      console.log(payload);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("INITIATION RESULT: ", result);
      if (
        result.statusCode === 201 ||
        result.statusCode === 200 ||
        result.status === true
      ) {
        Swal.fire(
          "Success",
          result.message || "Receipt Generated Successfully",
          "success",
        );
        setShowAddRow(false);
        setNewPayment({
          date: new Date().toISOString().split("T")[0],
          cash: 0,
          card: 0,
          cheque: 0,
          online: 0,
          internalDiscount: 0,
          tds: 0,
        });
        handleViewBillDetails();
      } else if (
        result.statusCode === 202 &&
        (result.data?.result === "success" || result.data?.stat === "success")
      ) {
        // ...
        showPaymentPendingPopup(
          result.data.transaction_id,
          payload,
          result.data,
        );
      } else {
        Swal.fire(
          "Error",
          result.message || "Failed to initiate payment",
          "error",
        );
      }
    } catch (error) {
      Swal.fire("Error", "Server communication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const terminalOptions = [
    "HDFC",
    "PineLabs",
    "OFFLINE",
    "BharatPe1",
    "BharatPe2",
  ];

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

  const handlePrintReceipt = async (pay) => {
    const totalAmt =
      Number(pay.cashamt || 0) +
      Number(pay.cardamt || 0) +
      Number(pay.chequeamt || 0) +
      Number(pay.onlineamt || 0);
    const words = convertToWords(totalAmt);
    const trimmedLocation = currentLocation ? currentLocation.trim() : "";
    const invoiceInfo = clinincLoc[trimmedLocation] ||
      clinincLoc[currentLocation] || {
      invoiceAddress: "<b>Healing Hands Clinic</b>",
      invoiceHelplineNo: "8888288884",
      EmergencySMS: "",
    };
    const receiptInfo = receiptlocations[currentLocation] || {
      hospitalcode: "HHC",
    };
    const hospitalCode = receiptInfo.hospitalcode;
    const year = new Date().getFullYear();
    const receiptNo = `HHC/${hospitalCode}/${year}/${pay.ipdpaymentid}`;
    const dateFormatted = formatDate(pay.receipt_date);

    const cashPayment = pay.cashamt != 0 ? "Cash " : "";
    const cardPayment = pay.cardamt != 0 ? "Card " : "";
    const onlinePayment = pay.onlineamt != 0 ? "Online " : "";
    const chequePayment = pay.chequeamt != 0 ? "Cheque " : "";

    const [mainLogoBase64, horizontalReceiptLogoBase64] = await Promise.all([
      getBase64Image(logo),
      getBase64Image(receiptLogo),
    ]);

    const printWindow = window.open("", "_blank", "width=800,height=800");
    printWindow.document.write(`
            <html>
            <head>
                <title>Healing Hands Clinic</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
                <style>
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
                    body, table, tr, td, p { font-size: 11px !important; margin: 0; padding: 0; font-family: sans-serif; }
                    .print-container { width: 630px; margin: 20px auto; }
                    .bgdiv { background: #2b9163 !important; padding: 15px; width: 100%; }
                    .maindiv { background: white !important; border: 1px solid #ccc; border-radius: 15px; padding: 10px; width: 100%; }
                    .HHClogo { width: 160px; border-color: #ccc; padding-right: 20px; }
                    .fa-phone { padding: 3px 4px; border: 1px solid grey; border-radius: 50%; font-size: 10px; }
                    .receipt { width: 100%; height: auto; display: block; }
                    .print-btn {
                        background-color: #2b9163;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        font-size: 15px;
                        font-weight: bold;
                        border-radius: 6px;
                        cursor: pointer;
                        margin: 20px auto;
                        display: block;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .print-btn:hover {
                        background-color: #237a53;
                    }
                    @media print {
                        body { margin: 0; padding: 0; background: white; width: 100%; }
                        .print-container { width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; }
                        .bgdiv { padding: 10px !important; margin: 0 !important; border-radius: 0 !important; width: 100% !important; }
                        .maindiv { border: 1px solid #eee !important; border-radius: 12px !important; width: 100% !important; }
                        .no-print { display: none !important; }
                        @page { size: auto; margin: 10mm; }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="bgdiv">
                        <div class="maindiv">
                            <table width="100%" border="0">
                                <tr>
                                    <td style="width:50%;"><img src="${mainLogoBase64}" class="HHClogo"></td>
                                    <td style="width:50%; text-align: right;">
                                        <table width="100%" border="0">
                                            <tr><td style="text-align: right;">Receipt No:&nbsp;<b>${receiptNo}</b></td></tr>
                                        </table><br>
                                        <table width="100%" border="0">
                                            <tr><td style="text-align: right;">Date:&nbsp;<b>${dateFormatted}</b></td></tr>
                                        </table>
                                    </td>
                                </tr>
                            </table><br>
                            <table width="100%" border="0">
                                <tr>
                                    <td style="width:9%; vertical-align: top;"><img src="${horizontalReceiptLogoBase64}" class="receipt"></td>
                                    <td style="width:88%; padding-left: 10px; vertical-align: top;">
                                        <table width="100%" border="0">
                                            <tr>
                                                <td style="width:1%; white-space: nowrap; line-height:30px;">Received From ${pay.patientprefix || "Mr/Ms"} : &nbsp;</td>
                                                <td><p style="border-bottom: dotted; border-color: #ccc; font-weight: 600; text-transform: uppercase;">${patientDetails.name}</p></td>
                                            </tr>
                                        </table>
                                        <table width="100%" border="0">
                                            <tr>
                                                <td><div style="width:100%; display: inline-block;">For <span style="font-weight:600; text-transform:uppercase; border-bottom: dotted; border-color: #ccc;">IPD Payment</span></div></td>
                                            </tr>
                                        </table>
                                        <table width="100%" border="0">
                                            <tr>
                                                <td style="line-height:30px;">
                                                    <i class="fa fa-phone"></i>&nbsp; ${invoiceInfo.invoiceHelplineNo}
                                                </td>
                                            </tr>
                                        </table>
                                        <table width="100%" border="0">
                                            <tr><td>Email : <b>info@healinghandsclinic.co.in</b> | Website : <b>www.healinghandsclinic.co.in</b></td></tr>
                                        </table><br>
                                        <table width="100%" border="0">
                                            <tr>
                                                <td style="width:60%; vertical-align: top;">
                                                    Payment Mode :&nbsp;<b>${cashPayment}${cardPayment}${onlinePayment}${chequePayment}</b><br>
                                                    In Words :&nbsp;<b>${words} Rupees Only.</b>
                                                </td>
                                                <td style="width:30%;"><p style="padding:10px; border:1px solid grey; border-radius:10px; font-weight:600;">Rs.&nbsp;${totalAmt} /-</p></td>
                                                <td style="width:10%"></td>
                                            </tr>
                                        </table>
                                        <table width="100%" border="0">
                                            <tr>
                                                <td style="width:60%;">${invoiceInfo.invoiceAddress}</td>
                                                 <td style="width:40%; vertical-align: bottom; font-weight:500; text-align: center; padding-top: 50px;"><b>Signature</b></td>
                                            </tr>
                                            <tr>
                                                <td colspan="3"><br><p>In case you have not received the correct receipt for the paid amount, or for any discrepancies in transaction please write us on <b>info@healinghandsclinic.co.in</b> or whatsapp on <b>${invoiceInfo.EmergencySMS}</b></p></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <button onclick="window.print()" class="print-btn no-print">Print Receipt</button>
                </div>
            </body>
            </html>
        `);
    printWindow.document.close();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString.split("T")[0].split("-").reverse().join("-");
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="themebody-wrap custom-ipd-styles">
      <PageBreadcrumb pagename="IPD Payment Data" />
      <NavbarIpdBills />
      <Container fluid className="p-0">
        <Row>
          <Col>
            <Card
              className="shadow-sm border-cyan mb-20 mt-1 overflow-visible"
              style={{ marginLeft: "17px", marginRight: "17px" }}
            >
              <Card.Body>
                <Row className="align-items-end">
                  <Col
                    lg={3}
                    md={6}
                    className="mb-3 position-relative"
                    ref={dropdownRef}
                  >
                    <Form.Label className="label-style">Invoice ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={invoiceId}
                      onChange={(e) => {
                        setInvoiceId(e.target.value);
                        setPatientDetails({
                          name: "",
                          uhid: "",
                          patient_id: "",
                          phone: "",
                        });
                        setShowBillDetails(false);
                      }}
                      placeholder="Enter Invoice ID..."
                      className="input-style"
                    />
                    {showDropdown && (
                      <ListGroup className="position-absolute w-300 z-index-dropdown shadow custom-list">
                        {Array.isArray(searchResults) &&
                          searchResults.map((inv) => (
                            <ListGroup.Item
                              key={inv.invoice_id}
                              action
                              onClick={() => handleSelectInvoice(inv)}
                            >
                              {inv.invoice_id} - {inv.name}
                            </ListGroup.Item>
                          ))}
                        {searchResults.length === 0 && (
                          <ListGroup.Item className="text-danger">
                            No Invoice Id Found
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    )}
                  </Col>
                  <Col lg={3} md={6} className="mb-3">
                    <Form.Label className="label-style">
                      Patient Name
                    </Form.Label>
                    <Form.Control
                      readOnly
                      value={patientDetails.name}
                      className="input-style"
                    />
                  </Col>
                  <Col lg={3} md={6} className="mb-3">
                    <Form.Label className="label-style">UID Number</Form.Label>
                    <Form.Control
                      readOnly
                      value={patientDetails.uhid}
                      className="input-style"
                    />
                  </Col>
                  <Col lg={3} md={6} className="mb-3">
                    <Button
                      variant="primary"
                      className="w-200 text-white fw-bold btn-view"
                      disabled={!patientDetails.patient_id || loading}
                      onClick={handleViewBillDetails}
                    >
                      {loading ? <Spinner size="sm" /> : "View Bill Details"}
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {showBillDetails && (
              <Card
                className="shadow-sm border-0 overflow-hidden"
                style={{ marginLeft: "22px", marginRight: "20px" }}
              >
                <div className="summary-header">
                  <span>
                    <FaListUl className="me-1" />
                    Total Bill:  ₹ {summary.totalBill}
                  </span>
                  <span>
                    <FaTasks className="me-1" />
                    Insurance Approved: ₹ {summary.insuranceApproved}
                  </span>
                  <span>
                    <FaListUl className="me-1" />
                    Patient Payable: ₹ {summary.patientPayable}
                  </span>
                  <span>
                    <FaListUl className="me-1" />
                    Total Due: ₹ {summary.totalDue}
                  </span>
                </div>
                <Card.Body>
                  <Table
                    responsive
                    borderless
                    className="align-middle custom-table"
                  >
                    <thead>
                      <tr>
                        <th style={{ width: "5%" }}>Sr No</th>
                        <th style={{ width: "9%" }}>Date</th>
                        <th style={{ width: "10%" }}>Cash</th>
                        <th style={{ width: "10%" }}>Card</th>
                        <th style={{ width: "10%" }}>Cheque</th>
                        <th style={{ width: "10%" }}>Online</th>
                        <th style={{ width: "10%" }}>Internal Discount</th>
                        <th style={{ width: "3%" }}>Hospital Discount</th>
                        <th style={{ width: "1%" }} className="text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((pay, idx) => (
                        <tr key={pay.ipdpaymentid}>
                          <td>
                            <Form.Control
                              className="table-input"
                              style={{ width: "55px" }}
                              readOnly
                              value={idx + 1}
                            />
                          </td>
                          <td>
                            <Form.Control
                              className="table-input"
                              style={{ width: "110px" }}
                              readOnly
                              value={formatDate(pay.receipt_date)}
                            />
                          </td>
                          <td>
                            <InputGroup size="sm" style={{ width: "135px", flexWrap: "nowrap" }}>
                              <InputGroup.Text className="table-input-group-text">₹</InputGroup.Text>
                              <Form.Control
                                className="table-input-group-control"
                                readOnly
                                value={pay.cashamt}
                              />
                            </InputGroup>
                          </td>
                          <td>
                            <InputGroup size="sm" style={{ width: "135px", flexWrap: "nowrap" }}>
                              <InputGroup.Text className="table-input-group-text">₹</InputGroup.Text>
                              <Form.Control
                                className="table-input-group-control"
                                readOnly
                                value={pay.cardamt}
                              />
                            </InputGroup>
                          </td>
                          <td>
                            <InputGroup size="sm" style={{ width: "135px", flexWrap: "nowrap" }}>
                              <InputGroup.Text className="table-input-group-text">₹</InputGroup.Text>
                              <Form.Control
                                className="table-input-group-control"
                                readOnly
                                value={pay.chequeamt}
                              />
                            </InputGroup>
                          </td>
                          <td>
                            <InputGroup size="sm" style={{ width: "135px", flexWrap: "nowrap" }}>
                              <InputGroup.Text className="table-input-group-text">₹</InputGroup.Text>
                              <Form.Control
                                className="table-input-group-control"
                                readOnly
                                value={pay.onlineamt}
                              />
                            </InputGroup>
                          </td>
                          <td>
                            <InputGroup size="sm" style={{ width: "135px", flexWrap: "nowrap" }}>
                              <InputGroup.Text className="table-input-group-text">₹</InputGroup.Text>
                              <Form.Control
                                className="table-input-group-control"
                                readOnly
                                value={pay.discountamt}
                              />
                            </InputGroup>
                          </td>
                          <td>
                            <InputGroup size="sm" style={{ width: "135px", flexWrap: "nowrap" }}>
                              <InputGroup.Text className="table-input-group-text">₹</InputGroup.Text>
                              <Form.Control
                                className="table-input-group-control"
                                readOnly
                                value={pay.tdsamt}
                              />
                            </InputGroup>
                          </td>
                          <td className="text-center">
                            <Button
                              title="Print Receipt"
                              variant="outline-secondary"
                              className="btn-print"
                              onClick={() => handlePrintReceipt(pay)}
                            >
                              <FaPrint />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {summary.totalDue === 0 && (
                    <div
                      className="alert alert-success mx-3 mt-3 text-center fw-bold"
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #2b9163",
                      }}
                    >
                      <i className="fa fa-check-circle me-2"></i>
                      This bill is already fully paid. No further payments are
                      required.
                    </div>
                  )}

                  <div className="d-flex justify-content-between mt-4 pt-8 border-top align-items-center">
                    <div className="pos-terminal-box">
                      <span
                        className="fw-bold text-cyan-dark"
                        style={{ fontSize: "14px" }}
                      >
                        PoS Terminal:
                      </span>
                      {terminalOptions.map((opt) => (
                        <Form.Check
                          key={opt}
                          inline
                          type="radio"
                          label={opt}
                          checked={selectedTerminal === opt}
                          onChange={() => setSelectedTerminal(opt)}
                          className="fw-bold text-secondary"
                          style={{ cursor: "pointer", fontSize: "12px" }}
                        />
                      ))}
                    </div>
                    <Button
                      variant="info"
                      className="btn-add"
                      onClick={() => setShowAddRow(!showAddRow)}
                      disabled={summary.totalDue <= 0}
                    >
                      <FaPlus className="me-2" /> <span>Add Entry</span>
                    </Button>
                  </div>

                  {showAddRow && (
                    <div className="mt-3 p-3 border rounded bg-white add-payment-box">
                      {(() => {
                        const currentTotal =
                          (Number(newPayment.cash) || 0) +
                          (Number(newPayment.card) || 0) +
                          (Number(newPayment.cheque) || 0) +
                          (Number(newPayment.online) || 0) +
                          (Number(newPayment.internalDiscount) || 0) +
                          (Number(newPayment.tds) || 0);
                        const isOverpaid = currentTotal > summary.totalDue;

                        return (
                          <>
                            {isOverpaid && (
                              <div className="alert alert-danger p-2 mb-3 text-center small fw-bold">
                                Warning: Entered amount (₹{currentTotal})
                                exceeds the remaining due (₹{summary.totalDue}).
                                Please correct the values.
                              </div>
                            )}
                            <Row className="g-2">
                              <Col md={2}>
                                <Form.Control
                                  type="date"
                                  className="input-style"
                                  value={newPayment.date}
                                  onChange={(e) =>
                                    setNewPayment({
                                      ...newPayment,
                                      date: e.target.value,
                                    })
                                  }
                                />
                              </Col>
                              <Col>
                                <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                                  <InputGroup.Text className="input-group-text-rupee">₹</InputGroup.Text>
                                  <Form.Control
                                    type="number"
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      ["e", "E", "+", "-"].includes(e.key) &&
                                      e.preventDefault()
                                    }
                                    placeholder="Cash"
                                    className="input-group-control-rupee"
                                    value={newPayment.cash || ""}
                                    onChange={(e) =>
                                      setNewPayment({
                                        ...newPayment,
                                        cash: +e.target.value,
                                      })
                                    }
                                  />
                                </InputGroup>
                              </Col>
                              <Col>
                                <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                                  <InputGroup.Text className="input-group-text-rupee">₹</InputGroup.Text>
                                  <Form.Control
                                    type="number"
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      ["e", "E", "+", "-"].includes(e.key) &&
                                      e.preventDefault()
                                    }
                                    placeholder="Card"
                                    className="input-group-control-rupee"
                                    value={newPayment.card || ""}
                                    disabled={newPayment.online > 0}
                                    onChange={(e) =>
                                      setNewPayment({
                                        ...newPayment,
                                        card: +e.target.value,
                                      })
                                    }
                                  />
                                </InputGroup>
                              </Col>
                              <Col>
                                <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                                  <InputGroup.Text className="input-group-text-rupee">₹</InputGroup.Text>
                                  <Form.Control
                                    type="number"
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      ["e", "E", "+", "-"].includes(e.key) &&
                                      e.preventDefault()
                                    }
                                    placeholder="Cheque"
                                    className="input-group-control-rupee"
                                    value={newPayment.cheque || ""}
                                    onChange={(e) =>
                                      setNewPayment({
                                        ...newPayment,
                                        cheque: +e.target.value,
                                      })
                                    }
                                  />
                                </InputGroup>
                              </Col>
                              <Col>
                                <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                                  <InputGroup.Text className="input-group-text-rupee">₹</InputGroup.Text>
                                  <Form.Control
                                    type="number"
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      ["e", "E", "+", "-"].includes(e.key) &&
                                      e.preventDefault()
                                    }
                                    placeholder="Online"
                                    className="input-group-control-rupee"
                                    value={newPayment.online || ""}
                                    disabled={newPayment.card > 0}
                                    onChange={(e) =>
                                      setNewPayment({
                                        ...newPayment,
                                        online: +e.target.value,
                                      })
                                    }
                                  />
                                </InputGroup>
                              </Col>
                              <Col>
                                <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                                  <InputGroup.Text className="input-group-text-rupee">₹</InputGroup.Text>
                                  <Form.Control
                                    type="number"
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      ["e", "E", "+", "-"].includes(e.key) &&
                                      e.preventDefault()
                                    }
                                    placeholder="Internal Discount"
                                    className="input-group-control-rupee"
                                    value={newPayment.internalDiscount || ""}
                                    onChange={(e) =>
                                      setNewPayment({
                                        ...newPayment,
                                        internalDiscount: +e.target.value,
                                      })
                                    }
                                  />
                                </InputGroup>
                              </Col>
                              <Col>
                                <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                                  <InputGroup.Text className="input-group-text-rupee">₹</InputGroup.Text>
                                  <Form.Control
                                    type="number"
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      ["e", "E", "+", "-"].includes(e.key) &&
                                      e.preventDefault()
                                    }
                                    placeholder="Hospital Discount"
                                    className="input-group-control-rupee"
                                    value={newPayment.tds || ""}
                                    onChange={(e) =>
                                      setNewPayment({
                                        ...newPayment,
                                        tds: +e.target.value,
                                      })
                                    }
                                  />
                                </InputGroup>
                              </Col>
                              <Col md={1}>
                                <Button
                                  variant="primary"
                                  className="w-100 btn-save"
                                  onClick={handleSavePayment}
                                  disabled={loading || isOverpaid}
                                >
                                  Save
                                </Button>
                              </Col>
                            </Row>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      <style>{`
                .custom-ipd-styles {
                    background: linear-gradient(to right, #e0f7fa, #80deea);
                    min-height: 100vh;
                    padding: 10px;
                    font-family: 'Poppins', sans-serif;
                }
                .input-style { 
                    border-radius: 10px !important; 
                    border: 1px solid #80deea !important; 
                    height: 30px !important; 
                    background-color: #ffffff !important; 
                    font-size: 14px;
                }
                .input-style:disabled, 
                .input-style[readonly] { 
                    background-color: #e7ebebff !important; 
                    cursor: not-allowed !important; 
                }
                .input-group-text-rupee {
                    border-radius: 10px 0 0 10px !important;
                    border: 1px solid #80deea !important;
                    border-right: none !important;
                    height: 30px !important;
                    background-color: #f8f9fa !important;
                    font-size: 14px;
                    padding-right: 5px;
                    display: flex;
                    align-items: center;
                }
                .input-group-control-rupee {
                    border-radius: 0 10px 10px 0 !important;
                    border: 1px solid #80deea !important;
                    border-left: none !important;
                    height: 30px !important;
                    background-color: #ffffff !important;
                    font-size: 14px;
                    padding-left: 5px;
                }
                .input-group-control-rupee:disabled, 
                .input-group-control-rupee[readonly] { 
                    background-color: #e7ebebff !important; 
                    cursor: not-allowed !important; 
                }
                .label-style { font-size: 13px; fontWeight: 600; color: #00838f; }
                .border-cyan { border: 1px solid #00bcd4; }
                .z-index-dropdown { z-index: 1050; }
                .summary-header {
                    background: #1099ab;
                    padding: 10px 15px;
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 18px;
                    font-weight: 700;
                    color: white;
                }

                .custom-table {
                    border: none !important;    
                }

                .custom-table thead th { 
                    background-color: transparent; 
                    color: #006064; 
                    border: none !important;
                    border-bottom: 2px solid #80deea !important;
                    padding-bottom: 10px;
                    font-size: 14px;
                    text-align: left;
                }

                .custom-table tbody td {
                    border: none !important;
                    padding: 5px 2px !important;
                    text-align: left;
                }

                .table-input {
                    border: 1px solid #80deea !important;
                    border-radius: 6px !important;
                    height: 32px !important;
                     background-color: #f1f3f5 !important; /* Consistent with header read-only */
                     text-align: left; 
                     padding-left: 8px;
                     width: 100px; 
                     max-width: 100%; 
                     cursor: not-allowed !important; 
                     box-shadow: none !important;
                     font-size: 13px;
                }
                .table-input-group-text {
                    border-radius: 6px 0 0 6px !important;
                    border: 1px solid #80deea !important;
                    border-right: none !important;
                    height: 32px !important;
                    background-color: #f1f3f5 !important;
                    font-size: 13px;
                    padding-right: 5px;
                    display: flex;
                    align-items: center;
                }
                .table-input-group-control {
                    border-radius: 0 6px 6px 0 !important;
                    border: 1px solid #80deea !important;
                    border-left: none !important;
                    height: 32px !important;
                    background-color: #f1f3f5 !important;
                    font-size: 13px;
                    padding-left: 5px;
                    cursor: not-allowed !important;
                    box-shadow: none !important;
                }
                .btn-view { 
                    background-color: #00bcd4; 
                    border: none; 
                    height: 30px !important; 
                    border-radius: 10px; 
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                }
                .btn-add { 
                    background-color: #00bcd4; 
                    border: none; 
                    border-radius: 6px; 
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 15px;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                }
                .btn-save { 
                    border-radius: 10px !important; 
                    height: 30px !important; 
                    font-weight: 600; 
                    color: white;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-print { 
        width: 40px;      /* Reduced width */
        height: 35px;     /* Reduced height */
        padding: 0;       /* Remove default padding to center icon */
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px !important; /* Requested border radius */
    }
                .text-cyan-dark { color: #00838f; }
                .pos-terminal-box {
                    background-color: #94e2eeff;
                    border: 2px solid rgb(77, 208, 225) !important;
                    padding: 8px 15px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .pos-terminal-box .form-check {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0 !important;
                    padding-left: 0;
                    gap: 8px;
                    margin-left: 5px;
                }
                .pos-terminal-box .form-check-input {
                    margin-top: 0 !important;
                    cursor: pointer;
                    width: 16px;
                    height: 16px;
                }
                .pos-terminal-box .form-check-label {
                    cursor: pointer;
                    line-height: 1;
                    padding-bottom: 2px;
                    
                }
                .custom-list .list-group-item:hover { background-color: #e0f7fa; }
            `}</style>
    </div>
  );
};

export default IpdPaymentData;
