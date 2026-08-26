import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
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
  InputGroup
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { FaPrint, FaPlus, FaListUl, FaTasks, FaFileInvoiceDollar, FaInfoCircle, FaPlusCircle, FaSave } from "react-icons/fa";
import { decodeJwt } from "../Utility/decode-jwt";
import Swal from "sweetalert2";
import logo from "../../assets/images/3.png";
import receiptLogo from "../../assets/images/4.png";
import { clinincLoc } from "../Utility/IpdBill_ClinicLocations";
import { receiptlocations } from "../Utility/OpdReceipt_ClinicLocations";
import FeatherIcon from "feather-icons-react";
const BASE_URL = "http://localhost:5100/api";
const IMAGE_BASE_URL = "http://localhost:5100";
const getLocalDateString = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1e3);
  return localDate.toISOString().split("T")[0];
};
const today = /* @__PURE__ */ new Date();
const maxDate = getLocalDateString(today);
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
    90: "Ninety"
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
          words[Math.floor(n / 10) * 10] + " " + words[n % 10] + " " + digits[counter] + plural + " " + hundred
        );
      }
    } else {
      str.push(null);
    }
  }
  return str.reverse().filter((x) => x).join("").trim();
};
const IpdCollection = () => {
  const location = useLocation();
  const [invoiceId, setInvoiceId] = useState(
    () => location.state?.invoiceId || ""
  );
  const [patientDetails, setPatientDetails] = useState(() => ({
    name: location.state?.patientDetails?.name || "",
    uhid: location.state?.patientDetails?.uhid || "",
    patient_id: location.state?.patientDetails?.patient_id || "",
    phone: location.state?.patientDetails?.phone || ""
  }));
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [loading, setLoading] = useState(() => Boolean(location.state?.invoiceId));
  const [selectedTerminal, setSelectedTerminal] = useState("");
  const [currentLocation, setCurrentLocation] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      return payload?.jobLocation || "";
    }
    return "";
  });
  const [summary, setSummary] = useState({
    totalBill: 0,
    insuranceApproved: 0,
    patientPayable: 0,
    totalDue: 0,
    status: "",
    isCashless: false
  });
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({
    date: maxDate,
    cash: 0,
    card: 0,
    cheque: 0,
    online: 0,
    internalDiscount: 0,
    tds: 0,
    pdcCheque: 0
  });
  const [showPdcInfo, setShowPdcInfo] = useState(false);
  const dropdownRef = useRef(null);
  const isManualSelection = useRef(false);
  const initialLoadDone = useRef(false);
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
    if (location.state?.invoiceId) {
      isManualSelection.current = true;
      setInvoiceId(location.state.invoiceId);
      if (location.state.patientDetails) {
        setPatientDetails(location.state.patientDetails);
      }
    }
  }, [location.state]);
  useEffect(() => {
    if (location.state?.invoiceId && currentLocation && !initialLoadDone.current) {
      initialLoadDone.current = true;
      handleViewBillDetails(location.state.invoiceId, currentLocation);
    }
  }, [location.state, currentLocation]);
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
        `${BASE_URL}/V1/invoice/searchByInvoiceId?invoice_id=${invoiceId}&location=${currentLocation}`
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
      phone: inv.phone
    });
    setShowDropdown(false);
  };
  const handleViewBillDetails = async (id = invoiceId, loc = currentLocation) => {
    setLoading(true);
    try {
      const resTotal = await fetch(
        `${BASE_URL}/V1/invoice/searchInvoiceTotal?invoice_id=${id}&location=${loc}`
      );
      const totalData = await resTotal.json();
      const financialInfo = Array.isArray(totalData) ? totalData[0] : totalData;
      if (financialInfo) {
        if ((financialInfo.status || "").trim().toLowerCase() === "interbranch-bill" || financialInfo.interbranch_id !== null && financialInfo.interbranch_id !== void 0 && financialInfo.interbranch_id !== "" && financialInfo.interbranch_id !== 0 && financialInfo.interbranch_id !== "0") {
          Swal.fire({
            icon: "warning",
            title: "Payment Restricted",
            text: "Payments for interbranch bills must be collected at the origin clinic location.",
            confirmButtonColor: "#00acc1"
          });
          setLoading(false);
          setShowBillDetails(false);
          return;
        }
        const isPdc = (financialInfo.status || "").toLowerCase() === "pdc";
        const isCashless = (financialInfo.status || "").trim().toLowerCase() === "cashless";
        const isCashlessNotSettled = isCashless && (parseFloat(financialInfo.receivedamt) || 0) === 0;
        setSummary({
          totalBill: financialInfo.totalamt || 0,
          insuranceApproved: isPdc ? financialInfo.receivedamt || financialInfo.advance_amt || 0 : financialInfo.receivedamt || 0,
          patientPayable: financialInfo.payableamt || 0,
          totalDue: isCashlessNotSettled ? 0 : financialInfo.totalduedamt || 0,
          status: financialInfo.status || "",
          isCashless
        });
        const resHistory = await fetch(
          `${BASE_URL}/V1/invoice/searchInvoiceDetails?invoice_id=${id}&location=${loc}`
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
  const cancelPayment = async (referenceId, originalPayload, apidata) => {
    try {
      const cancelPayload = {
        reference_id: referenceId,
        transaction_id: originalPayload.transaction_id || referenceId,
        PosMachine: originalPayload.PosMachine,
        MachineType: "IPD",
        // Explicitly set to IPD
        // Pass along financial context if needed by backend cancel logic
        InvoiceId: originalPayload.InvoiceId,
        PatientId: originalPayload.PatientId,
        apidata
      };
      const response = await fetch(
        `${BASE_URL}/V1/invoice/cancelIPDPaymentStatus?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cancelPayload)
        }
      );
      return await response.json();
    } catch (err) {
      throw new Error(err.message);
    }
  };
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
      cancelButtonColor: "#dc3545",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const statusPayload = {
            receiptData: originalPayload,
            // Contains all CashAmt, CardAmt, etc.
            reference_id: apidata.reference_id,
            transaction_id: referenceId,
            PosMachine: originalPayload.PosMachine,
            MachineType: "IPD",
            InvoiceId: originalPayload.InvoiceId,
            PatientId: originalPayload.PatientId,
            Totalinvoiceamt: originalPayload.Totalinvoiceamt
          };
          2;
          const response = await fetch(
            `${BASE_URL}/V1/invoice/checkIPDPaymentStatus?location=${currentLocation}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(statusPayload)
            }
          );
          const result = await response.json();
          if (response.ok && (result.success || result.statusCode === 201 || result.statusCode === 200)) {
            return result;
          } else {
            Swal.showValidationMessage(
              result.message || "Swipe not detected yet. Please try again after swiping."
            );
            return false;
          }
        } catch (error) {
          Swal.showValidationMessage(`Check failed: ${error.message}`);
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Paid!",
          text: "IPD Receipt Generated Successfully",
          icon: "success",
          timer: 2e3
        });
        handleViewBillDetails();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        const confirmCancel = await Swal.fire({
          title: "Are you sure?",
          text: "This will attempt to stop the current payment request on the terminal.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Cancel it!",
          cancelButtonText: "No, Keep Waiting",
          confirmButtonColor: "#dc3545",
          cancelButtonColor: "#0d6efd"
        });
        if (confirmCancel.isConfirmed) {
          try {
            Swal.fire({
              title: "Processing Cancellation...",
              allowOutsideClick: false,
              didOpen: () => Swal.showLoading()
            });
            const cancelResult = await cancelPayment(
              referenceId,
              originalPayload,
              apidata
            );
            if (cancelResult?.success || cancelResult?.statusCode === 200) {
              await Swal.fire(
                "Cancelled",
                "Transaction has been cancelled successfully.",
                "success"
              );
            } else {
              Swal.fire(
                "Cancellation Error",
                cancelResult?.message || "Remote cancel failed. Please cancel manually on the POS machine.",
                "error"
              );
            }
          } catch (err) {
            Swal.fire(
              "Error",
              "Server error during cancellation process",
              "error"
            );
          }
        } else {
          showPaymentPendingPopup(referenceId, originalPayload, apidata);
        }
      }
    });
  };
  const handleSavePayment = async () => {
    const totalEntered = Object.values(newPayment).reduce(
      (a, b) => typeof b === "number" ? a + b : a,
      0
    );
    if (totalEntered <= 0)
      return Swal.fire(
        "Invalid Amount",
        "Please enter a payment value",
        "warning"
      );
    if ((newPayment.card > 0 || newPayment.online > 0) && !selectedTerminal) {
      return Swal.fire(
        "Terminal Required",
        "Please select a PoS Terminal for payment.",
        "warning"
      );
    }
    setLoading(true);
    try {
      const endpoint = newPayment.card > 0 || newPayment.online > 0 ? "/V1/invoice/IPDDigitalPayment" : "/V1/invoice/SaveIPDPayment";
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
        PdcCheque: newPayment.pdcCheque,
        Totalinvoiceamt: summary.totalDue,
        PosMachine: selectedTerminal,
        location: currentLocation
      };
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.statusCode === 201 || result.statusCode === 200 || result.status === true) {
        Swal.fire(
          "Success",
          result.message || "Receipt Generated Successfully",
          "success"
        );
        setSelectedTerminal("");
        setNewPayment({
          date: maxDate,
          cash: 0,
          card: 0,
          cheque: 0,
          online: 0,
          internalDiscount: 0,
          tds: 0,
          pdcCheque: 0
        });
        handleViewBillDetails();
      } else if (result.statusCode === 202 && (result.data?.result === "success" || result.data?.stat === "success")) {
        showPaymentPendingPopup(
          result.data.transaction_id,
          payload,
          result.data
        );
      } else {
        Swal.fire(
          "Error",
          result.message || "Failed to initiate payment",
          "error"
        );
      }
    } catch (error) {
      Swal.fire("Error", "Server communication failed", "error");
    } finally {
      setLoading(false);
    }
  };
  const terminalOptions = [
    // "HDFC",
    // "PineLabs",
    // "BharatPe1",
    // "BharatPe2",
    "Federal",
    "OFFLINE"
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
    const totalAmt = Number(pay.cashamt || 0) + Number(pay.cardamt || 0) + Number(pay.chequeamt || 0) + Number(pay.onlineamt || 0);
    const words = convertToWords(totalAmt);
    const trimmedLocation = currentLocation ? currentLocation.trim() : "";
    const invoiceInfo = clinincLoc[trimmedLocation] || clinincLoc[currentLocation] || {
      invoiceAddress: "<b>Healing Hands Clinic</b>",
      invoiceHelplineNo: "8888288884",
      EmergencySMS: ""
    };
    const receiptInfo = receiptlocations[currentLocation] || {
      hospitalcode: "HHC"
    };
    const hospitalCode = receiptInfo.hospitalcode;
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const receiptNo = `HHC/${hospitalCode}/${year}/${pay.ipdpaymentid}`;
    const dateFormatted = formatDate(pay.receipt_date);
    const cashPayment = pay.cashamt != 0 ? "Cash " : "";
    const cardPayment = pay.cardamt != 0 ? "Card " : "";
    const onlinePayment = pay.onlineamt != 0 ? "Online " : "";
    const chequePayment = pay.chequeamt != 0 ? "Cheque " : "";
    const [mainLogoBase64, horizontalReceiptLogoBase64] = await Promise.all([
      getBase64Image(logo),
      getBase64Image(receiptLogo)
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
                                                <td style="width:30%;"><p style="padding:10px; border:1px solid grey; border-radius:10px; font-weight:600;">Rs.&nbsp;${Math.round(totalAmt).toLocaleString("en-IN")} /-</p></td>
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
  return /* @__PURE__ */ React.createElement("div", { className: "themebody-wrap custom-ipd-styles" }, /* @__PURE__ */ React.createElement(PageBreadcrumb, { pagename: "IPD Collection" }), /* @__PURE__ */ React.createElement(Container, { fluid: true, className: "p-0" }, /* @__PURE__ */ React.createElement(Row, null, /* @__PURE__ */ React.createElement(Col, null, /* @__PURE__ */ React.createElement(
    Card,
    {
      className: "shadow-sm border-0 overflow-hidden",
      style: { marginLeft: "22px", marginRight: "20px" }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "patient-meta-header",
        style: {
          background: "#e0f7fa",
          color: "#006064",
          padding: "12px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          fontWeight: "600",
          borderBottom: "1px solid #b2ebf2"
        }
      },
      /* @__PURE__ */ React.createElement(
        Link,
        {
          to: "/ipd-bill-list",
          className: "btn btn-sm text-white",
          style: { backgroundColor: "#00838f", border: "none", fontSize: "12px", padding: "8px 12px", borderRadius: "6px" }
        },
        /* @__PURE__ */ React.createElement(FeatherIcon, { icon: "arrow-left", size: "15", className: "me-1" }),
        "Back to IPD Bill List"
      ),
      /* @__PURE__ */ React.createElement("div", { className: "d-flex gap-4 flex-wrap" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Invoice ID:"), " ", invoiceId), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "UID Number:"), " ", patientDetails.uhid), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Patient Name:"), " ", patientDetails.name), patientDetails.phone && /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Contact No:"), " ", patientDetails.phone))
    ),
    /* @__PURE__ */ React.createElement("div", { className: "summary-header", style: { borderRadius: "0" } }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(FaListUl, { className: "me-1" }), "Total Bill: \u20B9 ", Math.round(parseFloat(summary.totalBill || 0)).toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(FaTasks, { className: "me-1" }), "Insurance Approved: \u20B9 ", Math.round(parseFloat(summary.insuranceApproved || 0)).toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(FaListUl, { className: "me-1" }), "Patient Payable: \u20B9 ", Math.round(parseFloat(summary.patientPayable || 0)).toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement(FaListUl, { className: "me-1" }), "Total Due: \u20B9 ", Math.round(parseFloat(summary.totalDue || 0)).toLocaleString("en-IN"))),
    /* @__PURE__ */ React.createElement(Card.Body, null, /* @__PURE__ */ React.createElement(
      Table,
      {
        responsive: true,
        borderless: true,
        className: "align-middle custom-table"
      },
      /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "6%" } }, "Sr No"), /* @__PURE__ */ React.createElement("th", { style: { width: "10%" } }, "Date"), /* @__PURE__ */ React.createElement("th", { style: { width: "11.5%" } }, "Cash"), /* @__PURE__ */ React.createElement("th", { style: { width: "11.5%" } }, "Card"), /* @__PURE__ */ React.createElement("th", { style: { width: "11.5%" } }, "Cheque"), /* @__PURE__ */ React.createElement("th", { style: { width: "11.5%" } }, "Online"), /* @__PURE__ */ React.createElement("th", { style: { width: "11.5%" } }, "Internal Discount"), /* @__PURE__ */ React.createElement("th", { style: { width: "11.5%" } }, "Hospital Discount"), /* @__PURE__ */ React.createElement("th", { style: { width: "11%", position: "relative" } }, "PDC Cheque", " ", /* @__PURE__ */ React.createElement(
        "span",
        {
          style: { position: "relative", display: "inline-block", cursor: "pointer", verticalAlign: "middle" },
          onMouseEnter: () => setShowPdcInfo(true),
          onMouseLeave: () => setShowPdcInfo(false)
        },
        /* @__PURE__ */ React.createElement(FaInfoCircle, { size: 13, style: { marginLeft: "2px", color: "#0f7b63" } }),
        showPdcInfo && /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          top: "125%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#ffffff",
          color: "#1a2b26",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "1px solid #d4e8e3",
          fontSize: "11px",
          whiteSpace: "normal",
          width: "200px",
          zIndex: 1050,
          textAlign: "center",
          fontWeight: "normal",
          textTransform: "none",
          lineHeight: "1.4"
        } }, "Amount of PDC Cheque taken during admission", /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          borderWidth: "5px",
          borderStyle: "solid",
          borderColor: "transparent transparent #ffffff transparent"
        } }), /* @__PURE__ */ React.createElement("div", { style: {
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%) translateY(1px)",
          borderWidth: "5px",
          borderStyle: "solid",
          borderColor: "transparent transparent #d4e8e3 transparent",
          zIndex: -1
        } }))
      )), /* @__PURE__ */ React.createElement("th", { style: { width: "4.5%" }, className: "text-center" }, "Action"))),
      /* @__PURE__ */ React.createElement("tbody", null, payments.length > 0 ? payments.map((pay, idx) => /* @__PURE__ */ React.createElement("tr", { key: pay.ipdpaymentid }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        Form.Control,
        {
          className: "table-input",
          style: { width: "55px" },
          readOnly: true,
          value: idx + 1
        }
      )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        Form.Control,
        {
          className: "table-input",
          style: { width: "110px" },
          readOnly: true,
          value: formatDate(pay.receipt_date)
        }
      )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        InputGroup,
        {
          size: "sm",
          style: { width: "135px", flexWrap: "nowrap" }
        },
        /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "table-input-group-text" }, "\u20B9"),
        /* @__PURE__ */ React.createElement(
          Form.Control,
          {
            className: "table-input-group-control",
            readOnly: true,
            value: Math.round(parseFloat(pay.cashamt || 0)).toLocaleString("en-IN")
          }
        )
      )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        InputGroup,
        {
          size: "sm",
          style: { width: "135px", flexWrap: "nowrap" }
        },
        /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "table-input-group-text" }, "\u20B9"),
        /* @__PURE__ */ React.createElement(
          Form.Control,
          {
            className: "table-input-group-control",
            readOnly: true,
            value: Math.round(parseFloat(pay.cardamt || 0)).toLocaleString("en-IN")
          }
        )
      )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        InputGroup,
        {
          size: "sm",
          style: { width: "135px", flexWrap: "nowrap" }
        },
        /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "table-input-group-text" }, "\u20B9"),
        /* @__PURE__ */ React.createElement(
          Form.Control,
          {
            className: "table-input-group-control",
            readOnly: true,
            value: Math.round(parseFloat(pay.chequeamt || 0)).toLocaleString("en-IN")
          }
        )
      )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        InputGroup,
        {
          size: "sm",
          style: { width: "135px", flexWrap: "nowrap" }
        },
        /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "table-input-group-text" }, "\u20B9"),
        /* @__PURE__ */ React.createElement(
          Form.Control,
          {
            className: "table-input-group-control",
            readOnly: true,
            value: Math.round(parseFloat(pay.onlineamt || 0)).toLocaleString("en-IN")
          }
        )
      )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        InputGroup,
        {
          size: "sm",
          style: { width: "135px", flexWrap: "nowrap" }
        },
        /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "table-input-group-text" }, "\u20B9"),
        /* @__PURE__ */ React.createElement(
          Form.Control,
          {
            className: "table-input-group-control",
            readOnly: true,
            value: Math.round(parseFloat(pay.discountamt || 0)).toLocaleString("en-IN")
          }
        )
      )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        InputGroup,
        {
          size: "sm",
          style: { width: "135px", flexWrap: "nowrap" }
        },
        /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "table-input-group-text" }, "\u20B9"),
        /* @__PURE__ */ React.createElement(
          Form.Control,
          {
            className: "table-input-group-control",
            readOnly: true,
            value: Math.round(parseFloat(pay.tdsamt || 0)).toLocaleString("en-IN")
          }
        )
      )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        InputGroup,
        {
          size: "sm",
          style: { width: "135px", flexWrap: "nowrap" }
        },
        /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "table-input-group-text" }, "\u20B9"),
        /* @__PURE__ */ React.createElement(
          Form.Control,
          {
            className: "table-input-group-control",
            readOnly: true,
            value: Math.round(parseFloat(pay.pdcCheque || 0)).toLocaleString("en-IN")
          }
        )
      )), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, /* @__PURE__ */ React.createElement(
        Button,
        {
          title: "Print Receipt",
          variant: "outline-secondary",
          className: "btn-print",
          onClick: () => handlePrintReceipt(pay)
        },
        /* @__PURE__ */ React.createElement(FaPrint, null)
      )))) : /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 10, className: "text-center py-5" }, /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "d-flex flex-column align-items-center justify-content-center p-4",
          style: {
            background: "rgba(255, 255, 255, 0.4)",
            borderRadius: "12px",
            border: "1px dashed #80deea",
            maxWidth: "500px",
            margin: "10px auto"
          }
        },
        /* @__PURE__ */ React.createElement("div", { className: "mb-3", style: { fontSize: "2.5rem", color: "#00acc1" } }, /* @__PURE__ */ React.createElement(FaFileInvoiceDollar, { className: "opacity-75" })),
        /* @__PURE__ */ React.createElement("h5", { className: "fw-bold text-cyan-dark mb-1" }, "No Payments Found"),
        /* @__PURE__ */ React.createElement("p", { className: "text-secondary small mb-0" }, "No payment entries have been recorded for this invoice yet.")
      ))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 10, style: { padding: "10px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { borderTop: "2px solid #80deea" } }))), (() => {
        const currentTotal = (Number(newPayment.cash) || 0) + (Number(newPayment.card) || 0) + (Number(newPayment.cheque) || 0) + (Number(newPayment.online) || 0) + (Number(newPayment.internalDiscount) || 0) + (Number(newPayment.tds) || 0);
        const isOverpaid = currentTotal > summary.totalDue;
        return /* @__PURE__ */ React.createElement(React.Fragment, null, isOverpaid && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 10 }, /* @__PURE__ */ React.createElement("div", { className: "alert alert-danger p-5 mb-2 text-center small fw-bold" }, /* @__PURE__ */ React.createElement(FeatherIcon, { icon: "alert-triangle", size: "16", className: "me-2 align-middle" }), "Warning: Entered amount (\u20B9 ", Math.round(currentTotal).toLocaleString("en-IN"), ") exceeds the remaining due (\u20B9 ", Math.round(summary.totalDue).toLocaleString("en-IN"), "). Please correct the values."))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { className: "text-center" }, /* @__PURE__ */ React.createElement(FaPlusCircle, { size: 22, color: "#0f7b63", title: "Add Entry" })), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
          Form.Control,
          {
            type: "date",
            className: "input-style",
            style: { width: "110px", fontSize: "12px" },
            value: newPayment.date,
            max: maxDate,
            onChange: (e) => {
              const val = e.target.value;
              if (val && val > maxDate) return;
              setNewPayment({
                ...newPayment,
                date: val
              });
            },
            onKeyDown: (e) => e.preventDefault(),
            onPaste: (e) => e.preventDefault(),
            onWheel: (e) => e.target.blur()
          }
        )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
          InputGroup,
          {
            size: "sm",
            style: { width: "135px", flexWrap: "nowrap" }
          },
          /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "input-group-text-rupee" }, "\u20B9"),
          /* @__PURE__ */ React.createElement(
            Form.Control,
            {
              type: "text",
              onWheel: (e) => e.target.blur(),
              onKeyDown: (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
              placeholder: "Cash",
              className: "input-group-control-rupee",
              value: newPayment.cash ? Number(String(newPayment.cash).replace(/,/g, "")).toLocaleString("en-IN") : "",
              onChange: (e) => setNewPayment({
                ...newPayment,
                cash: +e.target.value.replace(/[^0-9]/g, "")
              })
            }
          )
        )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
          InputGroup,
          {
            size: "sm",
            style: { width: "135px", flexWrap: "nowrap" }
          },
          /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "input-group-text-rupee" }, "\u20B9"),
          /* @__PURE__ */ React.createElement(
            Form.Control,
            {
              type: "number",
              onWheel: (e) => e.target.blur(),
              onKeyDown: (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
              placeholder: "Card",
              className: "input-group-control-rupee",
              value: newPayment.card || "",
              disabled: newPayment.online > 0,
              onChange: (e) => setNewPayment({
                ...newPayment,
                card: +e.target.value
              })
            }
          )
        )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
          InputGroup,
          {
            size: "sm",
            style: { width: "135px", flexWrap: "nowrap" }
          },
          /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "input-group-text-rupee" }, "\u20B9"),
          /* @__PURE__ */ React.createElement(
            Form.Control,
            {
              type: "number",
              onWheel: (e) => e.target.blur(),
              onKeyDown: (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
              placeholder: "Cheque",
              className: "input-group-control-rupee",
              value: newPayment.cheque || "",
              onChange: (e) => setNewPayment({
                ...newPayment,
                cheque: +e.target.value
              })
            }
          )
        )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
          InputGroup,
          {
            size: "sm",
            style: { width: "135px", flexWrap: "nowrap" }
          },
          /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "input-group-text-rupee" }, "\u20B9"),
          /* @__PURE__ */ React.createElement(
            Form.Control,
            {
              type: "number",
              onWheel: (e) => e.target.blur(),
              onKeyDown: (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
              placeholder: "Online",
              className: "input-group-control-rupee",
              value: newPayment.online || "",
              disabled: newPayment.card > 0,
              onChange: (e) => setNewPayment({
                ...newPayment,
                online: +e.target.value
              })
            }
          )
        )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
          InputGroup,
          {
            size: "sm",
            style: { width: "135px", flexWrap: "nowrap" }
          },
          /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "input-group-text-rupee" }, "\u20B9"),
          /* @__PURE__ */ React.createElement(
            Form.Control,
            {
              type: "text",
              onWheel: (e) => e.target.blur(),
              onKeyDown: (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
              placeholder: "Internal Disc",
              className: "input-group-control-rupee",
              value: newPayment.internalDiscount ? Number(String(newPayment.internalDiscount).replace(/,/g, "")).toLocaleString("en-IN") : "",
              onChange: (e) => setNewPayment({
                ...newPayment,
                internalDiscount: +e.target.value.replace(/[^0-9]/g, "")
              })
            }
          )
        )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
          InputGroup,
          {
            size: "sm",
            style: { width: "135px", flexWrap: "nowrap" }
          },
          /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "input-group-text-rupee" }, "\u20B9"),
          /* @__PURE__ */ React.createElement(
            Form.Control,
            {
              type: "text",
              onWheel: (e) => e.target.blur(),
              onKeyDown: (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
              placeholder: "Hospital Disc",
              className: "input-group-control-rupee",
              value: newPayment.tds ? Number(String(newPayment.tds).replace(/,/g, "")).toLocaleString("en-IN") : "",
              onChange: (e) => setNewPayment({
                ...newPayment,
                tds: +e.target.value.replace(/[^0-9]/g, "")
              })
            }
          )
        )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
          InputGroup,
          {
            size: "sm",
            style: { width: "135px", flexWrap: "nowrap" }
          },
          /* @__PURE__ */ React.createElement(InputGroup.Text, { className: "input-group-text-rupee" }, "\u20B9"),
          /* @__PURE__ */ React.createElement(
            Form.Control,
            {
              type: "number",
              onWheel: (e) => e.target.blur(),
              onKeyDown: (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
              placeholder: "PDC Cheque",
              className: "input-group-control-rupee",
              value: newPayment.pdcCheque || "",
              disabled: payments.some((pay) => (parseFloat(pay.pdcCheque) || 0) > 0),
              onChange: (e) => setNewPayment({
                ...newPayment,
                pdcCheque: +e.target.value
              })
            }
          )
        )), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, /* @__PURE__ */ React.createElement(
          Button,
          {
            variant: "primary",
            className: "btn-save",
            onClick: handleSavePayment,
            disabled: loading || isOverpaid || summary.totalDue <= 0,
            title: "Save Payment"
          },
          /* @__PURE__ */ React.createElement(FaSave, { size: 16 })
        ))));
      })())
    ), summary.totalDue === 0 && (summary.isCashless && parseFloat(summary.insuranceApproved || 0) === 0 ? /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "alert alert-warning mx-3 mt-3 text-center fw-bold",
        style: {
          borderRadius: "10px",
          border: "2px solid #f59e0b",
          color: "#92400e",
          backgroundColor: "#fef3c7"
        }
      },
      /* @__PURE__ */ React.createElement(FeatherIcon, { icon: "alert-circle", size: "18", className: "me-2 align-middle" }),
      "To add entry to this bill, please first add approved amount."
    ) : /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "alert alert-success mx-3 mt-3 text-center fw-bold",
        style: {
          borderRadius: "10px",
          border: "2px solid #2b9163"
        }
      },
      /* @__PURE__ */ React.createElement("i", { className: "fa fa-check-circle me-2" }),
      "This bill is already fully paid. No further payments are required."
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-4 border-top" }, /* @__PURE__ */ React.createElement("div", { className: "pos-terminal-box" }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "fw-bold text-cyan-dark",
        style: { fontSize: "14px" }
      },
      "PoS Terminal",
      /* @__PURE__ */ React.createElement("span", { className: "text-danger" }, "*"),
      " : ",
      newPayment.card > 0 || newPayment.online > 0
    ), terminalOptions.map((opt) => /* @__PURE__ */ React.createElement(
      Form.Check,
      {
        key: opt,
        inline: true,
        type: "radio",
        label: opt,
        checked: selectedTerminal === opt,
        onChange: () => setSelectedTerminal(opt),
        className: "fw-bold text-secondary",
        style: { cursor: "pointer", fontSize: "12px" }
      }
    )))))
  )))), /* @__PURE__ */ React.createElement("style", null, `
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
            `));
};
export default IpdCollection;
