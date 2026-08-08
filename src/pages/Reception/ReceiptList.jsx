import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { decodeJwt } from "../Utility/decode-jwt";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import Swal from "sweetalert2";
import { receiptlocations } from "../Utility/OpdReceipt_ClinicLocations";
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
import { Link, useLocation } from "react-router-dom";
import AppointmentNavbar from "../../components/Navbar/AppointmentNavbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css";
import { FilterMatchMode } from "primereact/api";
import moment from "moment";
import { Button } from "react-bootstrap";
import logo from "../../assets/images/3.png";
import receiptLogo from "../../assets/images/4.png";

const BASE_URL = "http://194.195.117.79:5100/api";

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
  const [isDbSearching, setIsDbSearching] = useState(false);
  const [fromDate, setFromDate] = useState(moment().startOf("day").toDate());
  const [toDate, setToDate] = useState(moment().endOf("day").toDate());
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    } else {
      console.warn("JWT Token not found in localStorage.");
    }
  }, []);

  const formatToYYYYMMDD = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  const searchFromDatabase = async (query) => {
    if (!currentLocation || currentLocation === "default" || isDbSearching)
      return;

    setIsDbSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/searchReceipts?query=${encodeURIComponent(
          query,
        )}&location=${currentLocation}`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const formattedData = data.data.map((r) => ({
            ...r,
            patient_phone: r.patient_phone ? String(r.patient_phone) : "",
          }));
          setReceipts((prev) => {
            const existingIds = new Set(prev.map((r) => r.receipt_id));
            const newUniqueReceipts = formattedData.filter(
              (r) => !existingIds.has(r.receipt_id),
            );
            return [...prev, ...newUniqueReceipts];
          });
        }
      }
    } catch (error) {
      console.error("Error searching receipts from database:", error);
    } finally {
      setIsDbSearching(false);
    }
  };

  useEffect(() => {
    const searchValue = filters.global.value;
    if (!searchValue || searchValue.length < 3) return;

    const hasLocalMatches = receipts.some((r) => {
      const lowerSearch = searchValue.toLowerCase();
      const phoneStr = String(r.patient_phone || r.phone || "");
      return (
        (r.receipt_id && String(r.receipt_id).includes(searchValue)) ||
        (r.patientName && r.patientName.toLowerCase().includes(lowerSearch)) ||
        phoneStr.includes(searchValue)
      );
    });

    if (!hasLocalMatches) {
      const delayDebounceFn = setTimeout(() => {
        searchFromDatabase(searchValue);
      }, 800);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [filters.global.value, receipts]);

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

      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key]),
      );

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data.data)) {
        const formattedData = data.data.map((r) => ({
          ...r,
          patient_phone: r.patient_phone ? String(r.patient_phone) : "",
        }));
        setReceipts(formattedData);
      } else {
        Toast.fire({
          icon: "error",
          title: "Failed to load receipts",
        });
        console.error(
          "❌ Error fetching receipts:",
          data.message || "Unknown error",
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
    if (num === null || num === undefined) return "Zero Rupees Only";
    if (typeof num === "string") {
      num = parseFloat(num.replace(/,/g, ""));
    }
    if (isNaN(num)) return "Zero Rupees Only";

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
      if (isNaN(n) || n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10];
      if (n < 1000)
        return ones[Math.floor(n / 100)] + " Hundred " + toWords(n % 100);
      return toWords(Math.floor(n / 1000)) + " Thousand " + toWords(n % 1000);
    };

    const rounded = Math.round(num);
    if (rounded === 0) {
      return "Zero Rupees Only";
    }

    let result = "";
    if (rounded >= 100000) {
      const lakhs = Math.floor(rounded / 100000);
      const remainder = rounded % 100000;
      result = toWords(lakhs) + " Lakh " + toWords(remainder);
    } else {
      result = toWords(rounded);
    }
    return result.trim() + " Rupees Only";
  };

  const handleDeleteReceipt = (receipt) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete receipt ${receipt.receipt_id}. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        confirmButton: "swal-button-radius",
        cancelButton: "swal-button-radius",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${BASE_URL}/V1/appointment/deleteReceipt?receipt_id=${receipt.receipt_id}&location=${currentLocation}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            },
          );

          if (response.ok) {
            Toast.fire({
              icon: "success",
              title: "Receipt deleted successfully",
            });
            fetchReceiptsData();
          } else {
            throw new Error("Failed to delete");
          }
        } catch (error) {
          console.error("❌ Error deleting receipt:", error);
          Swal.fire("Error!", "Could not delete the receipt.", "error");
        }
      }
    });
  };

  const handlePrintReceipt = (selectedReceipt) => {
    if (!selectedReceipt) return;

    const trimmedLocation = currentLocation ? currentLocation.trim() : "";
    const clinicAddr = receiptlocations[trimmedLocation] ||
      receiptlocations[currentLocation] || {
      address:
        "Healing Hands Clinic Pvt Ltd, DP Road, Ground Floor, Millenium Star Extension, Adjacent to Ruby Hall Clinic, Pune 411001",
      phone: "8888288884 | 020-26164488/99",
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

    Promise.all([getBase64Image(logo), getBase64Image(receiptLogo)]).then(
      ([mainLogo, horizontalReceiptLogo]) => {
        const receiptWindow = window.open("", "_blank", "width=800,height=850");
        if (!receiptWindow) return;

        let calculatedSubtotal = 0;
        if (selectedReceipt.item_details) {
          selectedReceipt.item_details.split(",").forEach((itemGroup) => {
            const parts = itemGroup.split(":");
            const amount = parts[1] ? parseFloat(String(parts[1]).replace(/,/g, "").trim()) || 0 : 0;
            calculatedSubtotal += amount;
          });
        }
        if (calculatedSubtotal === 0) {
          calculatedSubtotal = parseFloat(String(selectedReceipt.totalamt || "").replace(/,/g, "")) || 0;
        }

        const rawNet = (
          calculatedSubtotal -
          parseFloat(String(selectedReceipt.discountamt || 0).replace(/,/g, ""))
        );
        const netAmountVal = Math.round(rawNet);
        const netAmount = netAmountVal.toLocaleString("en-IN");
        const amountInWords = numberToWords(netAmountVal);

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
            border-bottom: 1px solid #ccc; 
            padding-bottom: 10px; 
            margin-bottom: 10px; 
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
            border-collapse: collapse;
          }
          
          .meta-left {
            text-align: left;
            width: 60%;
            padding-bottom: 8px;
           }

          .meta-right {
            text-align: right;
            width: 40%;
            padding-bottom: 8px;
            padding-right: 5px;
           }

          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .items-table th { background: #eeeeee; padding: 6px; border: 1px solid #bebebe; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .items-table td { padding: 8px; border: 1px solid #bebebe; }
          .col-sr { text-align: center; width: 15%; }
          .col-desc { text-align: center; width: 50%; } 
          .col-amt { text-align: center; width: 35%; }

          .summary-section { float: right; width: 180px; text-align: right; line-height: 1.6; }
          
          .footer-details { 
            margin-top: 40px; 
            clear: both; 
          }

          .flex-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end; 
          }

          .legal-text { 
            margin-top: 15px; 
            font-size: 9.5px; 
            color: #333; 
            border-top: 1px solid #b5b5b5; 
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
              <td class="meta-left">Patient Name : <b style="text-transform: uppercase;">${selectedReceipt.prefix ? `${selectedReceipt.prefix} ` : ""}${selectedReceipt.patientName}</b></td>
              <td class="meta-right">Receipt No : <b>${selectedReceipt.receipt_id}</b></td>
            </tr>
                  <tr>
              <td class="meta-left">Doctor Name : <b>${selectedReceipt.doctorName || "-"}</b></td>
              <td class="meta-right">Date : <b>${moment(selectedReceipt.receipt_date).format("DD-MM-YYYY")}</b></td>
            </tr>
                </table>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th class="col-sr">Sr. No</th>
                      <th class="col-desc">Description</th>
                      <th class="col-amt">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selectedReceipt.item_details
            ? selectedReceipt.item_details
              .split(",")
              .map((itemGroup, index) => {
                const parts = itemGroup.split(":");
                const label = parts[0] ? parts[0].trim() : "-";
                const amount = parts[1]
                  ? parseFloat(String(parts[1]).replace(/,/g, "").trim()) || 0
                  : 0;

                return `
                        <tr>
                              <td class="col-sr">${index + 1}</td>
                              <td class="col-desc">${label}</td>
                              <td class="col-amt">₹ ${Math.round(amount).toLocaleString("en-IN")}</td>
                            </tr>
                          `;
              })
              .join("")
            : `<tr><td class="col-sr">1</td><td class="col-desc">-</td><td class="col-amt">₹ 0</td></tr>`
          }
                  </tbody>
                </table>
                <div class="summary-section">
                  Sub Total : <b>₹ ${Math.round(calculatedSubtotal).toLocaleString("en-IN")}</b><br>
                  Discount (If Any) : <b>₹ ${Math.round(parseFloat(String(selectedReceipt.discountamt || 0).replace(/,/g, ""))).toLocaleString("en-IN")}</b><br>
                  Payable Amount : <b>₹ ${netAmount}</b>
                </div>

                <div class="footer-details">
                  In Words : <b>${amountInWords}</b><br><br>
                  Payment Mode : <span style="text-transform: capitalize;"><b>${selectedReceipt.paymentmode?.toLowerCase() === "upi" ? "UPI" : selectedReceipt.paymentmode}</b></span>
                  <div class="flex-footer">
                    <div></div>
                    <div class="signature-area">Signature</div>
                  </div>
                </div>

                <div class="legal-text">
                  In case you have not received the correct receipt for the paid amount, or for any discrepancies in transaction please write us on <b>info@healinghandsclinic.co.in</b> or whatsapp on <b>${clinicAddr.phone}</b>
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
      },
    );
  };

  useEffect(() => {
    if (location.state?.printReceiptId && receipts.length > 0) {
      const receiptToPrint = receipts.find(
        (r) => r.receipt_id === location.state.printReceiptId,
      );
      if (receiptToPrint) {
        handlePrintReceipt(receiptToPrint);
        window.history.replaceState({}, document.title);
      }
    }
  }, [receipts, location.state]);

  const actionBodyTemplate = (receipt) => {
    const isToday = moment(receipt.receipt_date).isSame(moment(), "day");

    return (
      <div className="d-flex align-items-center justify-content-center">
        {isToday && (
          <Button
            style={{ borderRadius: "8px" }}
            onClick={() => handleDeleteReceipt(receipt)}
            className="btn btn-extra-small btn-icon me-2"
            variant="danger"
            title="Delete"
          >
            <FeatherIcon icon="trash-2" size="14" />
          </Button>
        )}
        <Button
          onClick={() => handlePrintReceipt(receipt)}
          className="btn btn-extra-small btn-icon"
          variant="primary"
          title="Print"
        >
          <FeatherIcon icon="printer" size="14" />
        </Button>
      </div>
    );
  };

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
            <InputGroup style={{ position: "relative" }}>
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
              {isDbSearching && (
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                >
                  <Spinner
                    animation="border"
                    size="sm"
                    variant="info"
                    style={{ width: "12px", height: "12px" }}
                  />
                </div>
              )}
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
              placeholderText="Select to date"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setFromDate(null);
              setToDate(null);
              setFilters({
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
              });
            }}
            style={{
              backgroundColor: "#ff9800",
              border: "none",
              borderRadius: "8px",
              padding: "5px 5px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "13px",
            }}
          >
            <FeatherIcon icon="filter" size={12} className="me-1" />
            Clear Filter
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
        padding: "10px",
      }}
    >
      <PageBreadcrumb pagename="Receipt List" />
      <AppointmentNavbar pagename="Receipt List" />
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
                  margin: "-6px",
                }}
              >
                <Card.Body style={{ marginTop: "-5px" }}>
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
                        "patient_phone",
                        "phone",
                        "consultation",
                        "doctorName",
                        "paymentmode",
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
                        field="patientName"
                        header="Patient Name"
                        body={(rowData) => (
                          <span>
                            {rowData.prefix ? `${rowData.prefix} ` : ""}
                            {rowData.patientName || "-"}
                          </span>
                        )}
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
                        field="patient_phone"
                        header="Contact Number"
                        body={(rowData) => rowData.patient_phone || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
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
                          width: "180px",
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
                          width: "160px",
                        }}
                      />
                      <Column
                        field="paymentmode"
                        header="Payment Mode"
                        body={(rowData) => rowData.paymentmode || "-"}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          wordBreak: "break-word",
                          width: "120px",
                        }}
                      />
                      <Column
                        field="discountamt"
                        header="Discount Amount"
                        headerClassName="datatable-header-center"
                        body={(rowData) =>
                          `₹ ${Math.round(parseFloat(String(rowData.discountamt || 0).replace(/,/g, ""))).toLocaleString("en-IN")}`
                        }
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />
                      <Column
                        header="Payable Amount"
                        headerClassName="datatable-header-center"
                        body={(rowData) => {
                          const payable = (
                            parseFloat(String(rowData.totalamt || 0).replace(/,/g, "")) -
                            parseFloat(String(rowData.discountamt || 0).replace(/,/g, ""))
                          );
                          return `₹ ${Math.round(payable).toLocaleString("en-IN")}`;
                        }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                      />
                      <Column
                        field="madeby_name"
                        header="Made By"
                        headerClassName="datatable-header-center"
                        body={(rowData) => rowData.madeby_name || "-"}
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
