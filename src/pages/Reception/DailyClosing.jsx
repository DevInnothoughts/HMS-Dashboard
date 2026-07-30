import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Tabs,
  Tab,
  Alert,
  InputGroup,
  Modal,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import Swal from "sweetalert2";
import { decodeJwt } from "../../utils/decode-jwt";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const BASE_URL = "http://194.195.117.79:5100/api";

const DailyClosing = () => {
  const formatToIndianCommas = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const clean = String(val).replace(/[^0-9]/g, "");
    if (!clean) return "";
    return Number(clean).toLocaleString("en-IN");
  };

  const [currentDate, setCurrentDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [isYesterdayFilled, setIsYesterdayFilled] = useState(null);
  const [checkingYesterday, setCheckingYesterday] = useState(false);
  const [receiptsList, setReceiptsList] = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [pharmacySystemCash, setPharmacySystemCash] = useState(0);
  const [ipdSystemCash, setIpdSystemCash] = useState(0);

  const isPreviousDate = currentDate && currentDate !== moment().format("DD-MM-YYYY");

  const [cashDepositFile, setCashDepositFile] = useState(null);
  const [cardSettlementFile, setCardSettlementFile] = useState(null);

  // Preview Modal States
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [previewType, setPreviewType] = useState("");

  // Local file previews
  const [cashDepositPreviewUrl, setCashDepositPreviewUrl] = useState(null);
  const [cardSettlementPreviewUrl, setCardSettlementPreviewUrl] = useState(null);

  // Active focus tracking for row container highlight
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!cashDepositFile) {
      setCashDepositPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(cashDepositFile);
    setCashDepositPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [cashDepositFile]);

  useEffect(() => {
    if (!cardSettlementFile) {
      setCardSettlementPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(cardSettlementFile);
    setCardSettlementPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [cardSettlementFile]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

  const [formData, setFormData] = useState({
    opdCash: "",
    ipdCash: "",
    pharmacyCash: "",
    upiSettlement: "",
    cardSettlement: "",
    bankDeposit: "",
    manualCIH: "",
    comment: "",
    cashDepositReceipt: "",
    cardSettlementSlip: "",
  });

  const fetchTodayReceipts = async (dateStr, loc) => {
    if (!loc || loc === "default") return;
    setReceiptsLoading(true);
    try {
      const [dd, mm, yyyy] = dateStr.split("-");
      const entryDate = `${yyyy}-${mm}-${dd}`;
      const url = `${BASE_URL}/V1/appointment/listReceipt?from=${entryDate}&to=${entryDate}&location=${loc}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data.data)) {
        setReceiptsList(data.data);
      } else {
        console.error(
          "Failed to load receipts for reconciliation:",
          data.message,
        );
        setReceiptsList([]);
      }

      // Fetch Daily OPD Report for Pharmacy Cash
      const opdReportUrl = `${BASE_URL}/V1/daily-opd-report?location=${loc}&date=${entryDate}`;
      const opdReportResponse = await fetch(opdReportUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const opdReportResult = await opdReportResponse.json();
      if (opdReportResponse.ok && opdReportResult.statusCode === 200) {
        const pharmacyColl =
          opdReportResult.description?.pharmacyCollection || [];
        const cashRow = pharmacyColl.find((item) => item[0] === "Cash");
        const cashAmt = cashRow ? Number(cashRow[1]) : 0;
        setPharmacySystemCash(cashAmt);
      } else {
        setPharmacySystemCash(0);
      }

      // Fetch IPD payments report for IPD Cash reconciliation
      const ipdReportUrl = `${BASE_URL}/V1/managereports/getIPDPaymentReport`;
      const ipdReportResponse = await fetch(ipdReportUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          location: loc,
          Fromdate: entryDate,
          Todate: entryDate,
        }),
      });
      const ipdReportResult = await ipdReportResponse.json();
      if (ipdReportResponse.ok && Array.isArray(ipdReportResult)) {
        const ipdCashSum = ipdReportResult.reduce(
          (sum, item) => sum + Number(item.cashamt || 0),
          0,
        );
        setIpdSystemCash(ipdCashSum);
      } else {
        setIpdSystemCash(0);
      }

      // Fetch Daily Closing Status from Backend database
      const closingStatusUrl = `${BASE_URL}/V1/managereports/dailyclosing-status?location=${loc}&date=${entryDate}`;
      const closingStatusResponse = await fetch(closingStatusUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (closingStatusResponse.ok) {
        const closingStatusResult = await closingStatusResponse.json();
        if (closingStatusResult.success && closingStatusResult.data) {
          const dbData = closingStatusResult.data;
          const updatedData = {
            opdCash:
              dbData.opdcash !== null && dbData.opdcash !== undefined
                ? formatToIndianCommas(dbData.opdcash)
                : "",
            ipdCash:
              dbData.ipdcash !== null && dbData.ipdcash !== undefined
                ? formatToIndianCommas(dbData.ipdcash)
                : "",
            pharmacyCash:
              dbData.pharmacycash !== null && dbData.pharmacycash !== undefined
                ? formatToIndianCommas(dbData.pharmacycash)
                : "",
            upiSettlement:
              dbData.upiamt !== null && dbData.upiamt !== undefined
                ? formatToIndianCommas(dbData.upiamt)
                : "",
            cardSettlement:
              dbData.cardamt !== null && dbData.cardamt !== undefined
                ? formatToIndianCommas(dbData.cardamt)
                : "",
            bankDeposit:
              dbData.bankdeposit !== null && dbData.bankdeposit !== undefined
                ? formatToIndianCommas(dbData.bankdeposit)
                : "",
            manualCIH:
              dbData.manualCIH !== null && dbData.manualCIH !== undefined
                ? formatToIndianCommas(dbData.manualCIH)
                : (dbData.manualcih !== null && dbData.manualcih !== undefined
                  ? formatToIndianCommas(dbData.manualcih)
                  : ""),
            comment: dbData.comment || "",
            cashDepositReceipt: dbData.cash_deposit_receipt || "",
            cardSettlementSlip: dbData.card_settlement_slip || "",
          };
          setFormData(updatedData);
          setIsSubmitted(true);
          // Sync to localStorage
          localStorage.setItem(
            "hms_daily_closing",
            JSON.stringify({
              date: dateStr,
              data: updatedData,
            }),
          );
        } else {
          setIsSubmitted(false);
          const savedData = localStorage.getItem("hms_daily_closing");
          let shouldUseLocal = false;
          let localParsed = null;
          if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.date === dateStr) {
              shouldUseLocal = true;
              localParsed = parsed.data;
            }
          }
          if (shouldUseLocal && localParsed) {
            setFormData({
              opdCash: localParsed.opdCash || "",
              ipdCash: localParsed.ipdCash || "",
              pharmacyCash: localParsed.pharmacyCash || "",
              upiSettlement: localParsed.upiSettlement || "",
              cardSettlement: localParsed.cardSettlement || "",
              bankDeposit: localParsed.bankDeposit || "",
              manualCIH: localParsed.manualCIH || "",
              comment: localParsed.comment || "",
              cashDepositReceipt: localParsed.cashDepositReceipt || "",
              cardSettlementSlip: localParsed.cardSettlementSlip || "",
            });
          } else {
            setFormData({
              opdCash: "",
              ipdCash: "",
              pharmacyCash: "",
              upiSettlement: "",
              cardSettlement: "",
              bankDeposit: "",
              manualCIH: "",
              comment: "",
              cashDepositReceipt: "",
              cardSettlementSlip: "",
            });
            setCashDepositFile(null);
            setCardSettlementFile(null);
          }
        }
      }
    } catch (error) {
      console.error(
        "Error fetching receipts/reports for reconciliation:",
        error,
      );
      setReceiptsList([]);
      setPharmacySystemCash(0);
      setIpdSystemCash(0);
    } finally {
      setReceiptsLoading(false);
    }
  };

  useEffect(() => {
    const checkYesterdayAndSetDate = async () => {
      if (!currentLocation || currentLocation === "default") return;

      setCheckingYesterday(true);
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yyyy = yesterday.getFullYear();
        const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
        const dd = String(yesterday.getDate()).padStart(2, "0");
        const yesterdayYMD = `${yyyy}-${mm}-${dd}`;
        const yesterdayDMY = `${dd}-${mm}-${yyyy}`;

        const url = `${BASE_URL}/V1/managereports/dailyclosing-status?location=${currentLocation}&date=${yesterdayYMD}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setIsYesterdayFilled(true);
            const tdd = String(today.getDate()).padStart(2, "0");
            const tmm = String(today.getMonth() + 1).padStart(2, "0");
            const tyyyy = today.getFullYear();
            setCurrentDate(`${tdd}-${tmm}-${tyyyy}`);
          } else {
            setIsYesterdayFilled(false);
            setCurrentDate(yesterdayDMY);
          }
        } else {
          setIsYesterdayFilled(false);
          setCurrentDate(yesterdayDMY);
        }
      } catch (error) {
        console.error("Error checking yesterday closing status:", error);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yyyy = yesterday.getFullYear();
        const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
        const dd = String(yesterday.getDate()).padStart(2, "0");
        setCurrentDate(`${dd}-${mm}-${yyyy}`);
        setIsYesterdayFilled(false);
      } finally {
        setCheckingYesterday(false);
      }
    };

    checkYesterdayAndSetDate();
  }, [currentLocation]);

  useEffect(() => {
    if (currentDate && currentLocation && currentLocation !== "default") {
      fetchTodayReceipts(currentDate, currentLocation);
    }
  }, [currentDate, currentLocation]);

  const handleChange = (e) => {
    if (isSubmitted) return;
    const { name, value } = e.target;
    const numericFields = [
      "opdCash",
      "ipdCash",
      "pharmacyCash",
      "upiSettlement",
      "cardSettlement",
      "bankDeposit",
      "manualCIH",
    ];
    if (numericFields.includes(name)) {
      const cleanValue = value.replace(/\D/g, "");
      const formattedValue = cleanValue ? Number(cleanValue).toLocaleString("en-IN") : "";
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkFields = [
    "opdCash",
    "ipdCash",
    "pharmacyCash",
    "upiSettlement",
    "cardSettlement",
    "bankDeposit",
  ];
  const allEntered = checkFields.every((key) => formData[key] !== "");
  const totalSum = checkFields.reduce((sum, key) => sum + Number(String(formData[key] || "").replace(/,/g, "") || 0), 0);
  const isSumZero = allEntered && totalSum === 0;

  const isSaveDisabled =
    isSubmitted ||
    loading ||
    (isSumZero && (!formData.comment || !formData.comment.trim()));

  const handleSave = async () => {
    // Basic Validation
    const requiredFields = [
      { name: "opdCash", label: "OPD Cash" },
      { name: "ipdCash", label: "IPD Cash" },
      { name: "pharmacyCash", label: "Pharmacy Cash" },
      { name: "upiSettlement", label: "UPI Settlement" },
      { name: "cardSettlement", label: "Card Settlement" },
      { name: "bankDeposit", label: "Bank Deposit" },
      { name: "manualCIH", label: "Cash in Hand" }
    ];

    for (const field of requiredFields) {
      const val = formData[field.name];
      const cleanVal = val !== null && val !== undefined ? String(val).trim() : "";
      if (cleanVal === "") {
        return Swal.fire(
          "Required Field Missing",
          `Please fill the ${field.label} field (enter 0 if there is no amount)`,
          "warning"
        );
      }
    }

    if (isSumZero && (!formData.comment || !formData.comment.trim())) {
      return Swal.fire(
        "Justification Required",
        "Please provide a justification for the zero balance.",
        "warning",
      );
    }

    setLoading(true);
    try {
      // Convert DD-MM-YYYY to YYYY-MM-DD for backend
      const [dd, mm, yyyy] = currentDate.split("-");
      const entryDate = `${yyyy}-${mm}-${dd}`;

      const fd = new FormData();
      fd.append("entryDate", entryDate);
      fd.append("opdCash", formData.opdCash.replace(/,/g, ""));
      fd.append("ipdCash", formData.ipdCash.replace(/,/g, ""));
      fd.append("pharmacyCash", formData.pharmacyCash.replace(/,/g, ""));
      fd.append("upiSettlement", formData.upiSettlement.replace(/,/g, ""));
      fd.append("cardSettlement", formData.cardSettlement.replace(/,/g, ""));
      fd.append("bankDeposit", formData.bankDeposit.replace(/,/g, ""));
      fd.append("manualCIH", formData.manualCIH.replace(/,/g, ""));
      fd.append("comment", formData.comment || "");

      if (cashDepositFile) {
        fd.append("cashDepositReceipt", cashDepositFile);
      }
      if (cardSettlementFile) {
        fd.append("cardSettlementSlip", cardSettlementFile);
      }

      const response = await fetch(
        `${BASE_URL}/V1/managereports/dailyclosing?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: fd,
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const updatedFormData = {
          ...formData,
          cashDepositReceipt: result.cash_deposit_receipt || "",
          cardSettlementSlip: result.card_settlement_slip || "",
        };
        const submission = {
          date: currentDate,
          data: updatedFormData,
          isSubmitted: true,
        };
        localStorage.setItem("hms_daily_closing", JSON.stringify(submission));
        setFormData(updatedFormData);
        setIsSubmitted(true);

        Toast.fire({
          icon: "success",
          title: "Daily closing saved to database",
        });
      } else {
        throw new Error(result.error || "Save failed");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "10px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Daily Closing" />
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "5px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "1px solid #00bcd4",
                margin: "10px 5px 12px 5px",
              }}
            >
              <Card.Body
                style={{
                  padding: "10px",
                  background: "#ffffff",
                  borderRadius: "5px",
                }}
              >
                {isYesterdayFilled !== null && (isYesterdayFilled || isPreviousDate) && (
                  <Alert
                    variant={isYesterdayFilled ? "success" : "warning"}
                    className="mb-3 d-flex align-items-center gap-2"
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      borderRadius: "6px",
                      border: isYesterdayFilled ? "1px solid #c3e6cb" : "1px solid #ffeeba",
                      backgroundColor: isYesterdayFilled ? "#d4edda" : "#fff3cd",
                      color: isYesterdayFilled ? "#155724" : "#856404",
                    }}
                  >
                    <FeatherIcon
                      icon={isYesterdayFilled ? "check-circle" : "alert-triangle"}
                      size="16"
                    />
                    <div>
                      {isYesterdayFilled
                        ? "Yesterday's daily closing has been submitted. Showing today's date for entry."
                        : "Yesterday's daily closing is pending submission! Defaulted to yesterday's date to fill. Please submit the closing data for this date."}
                    </div>
                  </Alert>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", padding: "10px" }}>
                  {/* Date Banner */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 15px",
                      borderRadius: "10px",
                      border: "1px solid #4dd0e1",
                      backgroundColor: "#e0f7fa",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <i className="fa fa-calendar" style={{ fontSize: "15px", color: "#006064" }}></i>
                      <span style={{ fontWeight: "500", color: "#006064", fontSize: "13.5px" }}>Closing Date:</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: isPreviousDate ? "#d84315" : "#2e7d32" }}>{currentDate}</span>
                    </div>
                  </div>

                  {/* Form Grid / Card list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      {
                        label: "OPD Cash",
                        icon: "fa fa-stethoscope",
                        iconColor: "#0288d1",
                        name: "opdCash",
                        value: formData.opdCash,
                        placeholder: "0.00",
                        showWarning: isSumZero,
                        required: true,
                      },
                      {
                        label: "IPD Cash",
                        icon: "fa fa-bed",
                        iconColor: "#7b1fa2",
                        name: "ipdCash",
                        value: formData.ipdCash,
                        placeholder: "0.00",
                        showWarning: isSumZero,
                        required: true,
                      },
                      {
                        label: "Pharmacy Cash",
                        icon: "fa fa-medkit",
                        iconColor: "#388e3c",
                        name: "pharmacyCash",
                        value: formData.pharmacyCash,
                        placeholder: "0.00",
                        showWarning: isSumZero,
                        required: true,
                      },
                      {
                        label: "UPI Settlement",
                        icon: "fa fa-qrcode",
                        iconColor: "#f57c00",
                        name: "upiSettlement",
                        value: formData.upiSettlement,
                        placeholder: "0.00",
                        showWarning: isSumZero,
                        required: true,
                      },
                      {
                        label: "Card Settlement",
                        icon: "fa fa-credit-card",
                        iconColor: "#d32f2f",
                        name: "cardSettlement",
                        value: formData.cardSettlement,
                        placeholder: "0.00",
                        showWarning: isSumZero,
                        required: true,
                      },
                      {
                        label: "Bank Deposit",
                        icon: "fa fa-university",
                        iconColor: "#00796b",
                        name: "bankDeposit",
                        value: formData.bankDeposit,
                        placeholder: "0.00",
                        showWarning: isSumZero,
                        required: true,
                      },
                      {
                        label: "Cash in Hand",
                        icon: "fa fa-money",
                        iconColor: "#afb42b",
                        name: "manualCIH",
                        value: formData.manualCIH,
                        placeholder: "0.00",
                        showWarning: false,
                        required: true,
                      },
                    ].map((field) => {
                      const isFocused = focusedField === field.name;
                      const hasValue =
                        field.value !== "" &&
                        field.value !== null &&
                        field.value !== undefined;

                      const rowBgColor = isFocused
                        ? `${field.iconColor}18`
                        : hasValue
                        ? `${field.iconColor}0a`
                        : "#f9fdfd";

                      const rowBorderColor = isFocused
                        ? field.iconColor
                        : hasValue
                        ? `${field.iconColor}80`
                        : "#d7d5d5ff";

                      const rowBoxShadow = isFocused
                        ? `0 4px 12px ${field.iconColor}33`
                        : "0 1px 3px rgba(0,0,0,0.02)";

                      return (
                        <div
                          key={field.name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 15px",
                            borderRadius: "8px",
                            border: `1px solid ${rowBorderColor}`,
                            backgroundColor: rowBgColor,
                            transition: "all 0.25s ease",
                            boxShadow: rowBoxShadow,
                            flexWrap: "wrap",
                            gap: "10px",
                            transform: isFocused ? "translateY(-1px)" : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "200px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                backgroundColor: isFocused ? field.iconColor : `${field.iconColor}18`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: isFocused ? "#ffffff" : field.iconColor,
                                transition: "all 0.2s ease",
                                boxShadow: isFocused ? `0 2px 6px ${field.iconColor}40` : "none",
                              }}
                            >
                              <i className={field.icon} style={{ fontSize: "13px" }}></i>
                            </div>
                            <span style={{ fontWeight: "700", color: isFocused ? field.iconColor : "#37474f", fontSize: "12.5px", transition: "color 0.2s ease" }}>
                              {field.label}
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                            <InputGroup style={{ width: "240px" }}>
                              <InputGroup.Text
                                style={{
                                  border: `1px solid ${isFocused ? field.iconColor : "#4dd0e1"}`,
                                  borderRight: "none",
                                  backgroundColor: isFocused ? `${field.iconColor}15` : "#f8f9fa",
                                  color: isFocused ? field.iconColor : "inherit",
                                  fontWeight: isFocused ? "bold" : "normal",
                                  fontSize: "12px",
                                  borderTopLeftRadius: "6px",
                                  borderBottomLeftRadius: "6px",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                ₹
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder={field.placeholder}
                                name={field.name}
                                onWheel={(e) => e.target.blur()}
                                value={field.value}
                                onChange={handleChange}
                                onFocus={() => !isSubmitted && setFocusedField(field.name)}
                                onBlur={() => setFocusedField(null)}
                                readOnly={isSubmitted}
                                style={{
                                  border: `1px solid ${isFocused ? field.iconColor : "#4dd0e1"}`,
                                  borderTopRightRadius: "6px",
                                  borderBottomRightRadius: "6px",
                                  borderTopLeftRadius: "0",
                                  borderBottomLeftRadius: "0",
                                  padding: "5px 10px",
                                  fontSize: "12.5px",
                                  fontWeight: "600",
                                  transition: "all 0.3s ease",
                                  boxShadow: isFocused ? `0 0 0 3px ${field.iconColor}25` : "none",
                                  cursor: isSubmitted ? "not-allowed" : "text",
                                  backgroundColor: isSubmitted ? "#f8f9fa" : "white",
                                }}
                              />
                            </InputGroup>
                            {field.showWarning && (
                              <div style={{ color: "#d32f2f", fontSize: "11px", fontWeight: "600", marginRight: "5px" }}>
                                <i className="fa fa-warning me-1"></i>0 entered
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Cash Deposit Receipt */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 15px",
                        borderRadius: "8px",
                        border: "1px solid #d7d5d5ff",
                        backgroundColor: "#f9fdfd",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "200px" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#00bcd412",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#00bcd4",
                          }}
                        >
                          <i className="fa fa-file-image-o" style={{ fontSize: "13px" }}></i>
                        </div>
                        <span style={{ fontWeight: "700", color: "#37474f", fontSize: "12.5px" }}>Cash Deposit Receipt</span>
                      </div>
                      <div style={{ width: "240px", display: "flex", justifyContent: "flex-end" }}>
                        {isSubmitted ? (
                          formData.cashDepositReceipt ? (
                            <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: "100%" }}>
                              <Form.Control
                                type="text"
                                readOnly
                                value={`${BASE_URL.replace("/api", "")}${formData.cashDepositReceipt}`}
                                style={{
                                  fontSize: "12.5px",
                                  textAlign: "left",
                                  flex: 1,
                                  minWidth: 0,
                                  textOverflow: "ellipsis",
                                  border: "1px solid #4dd0e1",
                                  padding: "5px 10px",
                                }}
                                onClick={(e) => e.target.select()}
                              />
                              <Button
                                variant="outline-info"
                                style={{ fontSize: "12px", padding: "5px 12px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const url = `${BASE_URL.replace("/api", "")}${formData.cashDepositReceipt}`;
                                  setPreviewUrl(url);
                                  setPreviewName("Cash Deposit Receipt");
                                  setPreviewType(url.toLowerCase().split("?")[0].endsWith(".pdf") ? "pdf" : "image");
                                  setShowPreview(true);
                                }}
                              >
                                <i className="fa fa-eye me-1"></i>View
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>-</span>
                          )
                        ) : (<div className="d-flex align-items-center justify-content-end gap-2" style={{ width: "100%" }}>
                          {cashDepositFile && cashDepositPreviewUrl && (
                            <div
                              style={{
                                padding: "6px",
                                borderRadius: "8px",
                                backgroundColor: "#f0fdfa",
                                border: "1px dashed #00acc1",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {cashDepositFile.type === "application/pdf" || cashDepositFile.name.toLowerCase().endsWith(".pdf") ? (
                                <div
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "4px",
                                    backgroundColor: "#ffebee",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#c62828",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  <i className="fa fa-file-pdf-o"></i>
                                </div>
                              ) : (
                                <img
                                  src={cashDepositPreviewUrl}
                                  alt="Selected preview"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                                    border: "1px solid #e0e0e0",
                                  }}
                                />
                              )}
                              <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    color: "#37474f",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  title={cashDepositFile.name}
                                >
                                  {cashDepositFile.name}
                                </div>
                                <Button
                                  variant="link"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPreviewUrl(cashDepositPreviewUrl);
                                    setPreviewName(cashDepositFile.name);
                                    setPreviewType(
                                      cashDepositFile.type === "application/pdf" || cashDepositFile.name.toLowerCase().endsWith(".pdf")
                                        ? "pdf"
                                        : "image"
                                    );
                                    setShowPreview(true);
                                  }}
                                  style={{
                                    color: "#00acc1",
                                    fontWeight: "bold",
                                    textDecoration: "underline",
                                    padding: 0,
                                    fontSize: "9px",
                                    border: "none",
                                    background: "none",
                                    lineHeight: 1,
                                    marginTop: "2px",
                                  }}
                                >
                                  Preview
                                </Button>
                              </div>
                              <Button
                                variant="link"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCashDepositFile(null);
                                  const input = document.getElementById("cashDepositReceiptFile");
                                  if (input) input.value = "";
                                }}
                                style={{
                                  color: "#d32f2f",
                                  padding: "2px",
                                  fontSize: "13px",
                                  border: "none",
                                  background: "none",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginLeft: "auto",
                                }}
                                title="Remove file"
                              >
                                <i className="fa fa-times-circle"></i>
                              </Button>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            id="cashDepositReceiptFile"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files[0] || null;
                              setCashDepositFile(file);
                            }}
                          />
                          <label
                            htmlFor="cashDepositReceiptFile"
                            className="btn btn-sm btn-info text-white mb-0"
                            style={{
                              cursor: "pointer",
                              fontSize: "11px",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              backgroundColor: cashDepositFile ? "#0097a7" : "#00bcd4",
                              borderColor: cashDepositFile ? "#0097a7" : "#00bcd4",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cashDepositFile ? "Change" : "Choose File"}
                          </label>
                        </div>
                        )}
                      </div>
                    </div>

                    {/* Card Settlement Slip */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 15px",
                        borderRadius: "8px",
                        border: "1px solid #d7d5d5ff",
                        backgroundColor: "#f9fdfd",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "200px" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#00bcd412",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#00bcd4",
                          }}
                        >
                          <i className="fa fa-credit-card" style={{ fontSize: "13px" }}></i>
                        </div>
                        <span style={{ fontWeight: "700", color: "#37474f", fontSize: "12.5px" }}>Card Settlement Slip</span>
                      </div>
                      <div style={{ width: "240px", display: "flex", justifyContent: "flex-end" }}>
                        {isSubmitted ? (
                          formData.cardSettlementSlip ? (
                            <div className="d-flex align-items-center justify-content-end gap-2" style={{ width: "100%" }}>
                              <Form.Control
                                type="text"
                                readOnly
                                value={`${BASE_URL.replace("/api", "")}${formData.cardSettlementSlip}`}
                                style={{
                                  fontSize: "12.5px",
                                  textAlign: "left",
                                  flex: 1,
                                  minWidth: 0,
                                  textOverflow: "ellipsis",
                                  border: "1px solid #4dd0e1",
                                  padding: "5px 10px",
                                }}
                                onClick={(e) => e.target.select()}
                              />
                              <Button
                                variant="outline-info"
                                style={{ fontSize: "12px", padding: "5px 12px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const url = `${BASE_URL.replace("/api", "")}${formData.cardSettlementSlip}`;
                                  setPreviewUrl(url);
                                  setPreviewName("Card Settlement Slip");
                                  setPreviewType(url.toLowerCase().split("?")[0].endsWith(".pdf") ? "pdf" : "image");
                                  setShowPreview(true);
                                }}
                              >
                                <i className="fa fa-eye me-1"></i>View
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>-</span>
                          )
                        ) : (<div className="d-flex align-items-center justify-content-end gap-2" style={{ width: "100%" }}>
                          {cardSettlementFile && cardSettlementPreviewUrl && (
                            <div
                              style={{
                                padding: "6px",
                                borderRadius: "8px",
                                backgroundColor: "#f0fdfa",
                                border: "1px dashed #00acc1",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {cardSettlementFile.type === "application/pdf" || cardSettlementFile.name.toLowerCase().endsWith(".pdf") ? (
                                <div
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "4px",
                                    backgroundColor: "#ffebee",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#c62828",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  <i className="fa fa-file-pdf-o"></i>
                                </div>
                              ) : (
                                <img
                                  src={cardSettlementPreviewUrl}
                                  alt="Selected preview"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                                    border: "1px solid #e0e0e0",
                                  }}
                                />
                              )}
                              <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    color: "#37474f",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  title={cardSettlementFile.name}
                                >
                                  {cardSettlementFile.name}
                                </div>
                                <Button
                                  variant="link"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPreviewUrl(cardSettlementPreviewUrl);
                                    setPreviewName(cardSettlementFile.name);
                                    setPreviewType(
                                      cardSettlementFile.type === "application/pdf" || cardSettlementFile.name.toLowerCase().endsWith(".pdf")
                                        ? "pdf"
                                        : "image"
                                    );
                                    setShowPreview(true);
                                  }}
                                  style={{
                                    color: "#00acc1",
                                    fontWeight: "bold",
                                    textDecoration: "underline",
                                    padding: 0,
                                    fontSize: "9px",
                                    border: "none",
                                    background: "none",
                                    lineHeight: 1,
                                    marginTop: "2px",
                                  }}
                                >
                                  Preview
                                </Button>
                              </div>
                              <Button
                                variant="link"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCardSettlementFile(null);
                                  const input = document.getElementById("cardSettlementSlipFile");
                                  if (input) input.value = "";
                                }}
                                style={{
                                  color: "#d32f2f",
                                  padding: "2px",
                                  fontSize: "13px",
                                  border: "none",
                                  background: "none",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginLeft: "auto",
                                }}
                                title="Remove file"
                              >
                                <i className="fa fa-times-circle"></i>
                              </Button>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            id="cardSettlementSlipFile"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files[0] || null;
                              setCardSettlementFile(file);
                            }}
                          />
                          <label
                            htmlFor="cardSettlementSlipFile"
                            className="btn btn-sm btn-info text-white mb-0"
                            style={{
                              cursor: "pointer",
                              fontSize: "11px",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              backgroundColor: cardSettlementFile ? "#0097a7" : "#00bcd4",
                              borderColor: cardSettlementFile ? "#0097a7" : "#00bcd4",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cardSettlementFile ? "Change" : "Choose File"}
                          </label>
                        </div>
                        )}
                      </div>
                    </div>

                    {/* Justification for Zero Balance / Remarks */}
                    {(isSumZero || formData.comment) && (
                      <div
                        style={{
                          padding: "10px 10px",
                          backgroundColor: focusedField === "comment" ? "#00bcd418" : formData.comment ? "#00bcd40a" : "#fff5f5",
                          borderRadius: "8px",
                          border: `1px solid ${focusedField === "comment" ? "#00bcd4" : "#ffe3e3"}`,
                          boxShadow: focusedField === "comment" ? "0 4px 12px rgba(0,188,212,0.2)" : "0 1px 3px rgba(0,0,0,0.02)",
                          transition: "all 0.25s ease",
                          marginTop: "5px",
                        }}
                      >
                        {isSumZero && !isSubmitted && (
                          <div
                            style={{
                              color: "#e53e3e",
                              fontSize: "13px",
                              fontWeight: "bold",
                              marginBottom: "10px",
                            }}
                          >
                            <i className="fa fa-exclamation-triangle me-2"></i>A
                            zero balance is recorded in all fields. Please
                            provide a justification below to save the daily closing.
                          </div>
                        )}
                        <Form.Group>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            onFocus={() => !isSubmitted && setFocusedField("comment")}
                            onBlur={() => setFocusedField(null)}
                            readOnly={isSubmitted}
                            placeholder="Enter justification or remarks..."
                            style={{
                              fontSize: "13px",
                              border: `1px solid ${focusedField === "comment" ? "#00bcd4" : "#cbd5e0"}`,
                              borderRadius: "6px",
                              transition: "all 0.3s ease",
                              boxShadow: focusedField === "comment" ? "0 0 0 3px rgba(0,188,212,0.25)" : "none",
                            }}
                          />
                        </Form.Group>
                      </div>
                    )}

                    {/* Action Button Panel */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "10px",
                      }}
                    >
                      <Button
                        variant="success"
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        style={{
                          borderRadius: "8px",
                          padding: "8px 15px",
                          fontSize: "13px",
                          fontWeight: "bold",
                          backgroundColor: isSaveDisabled ? "#ccc" : "#00bcd4",
                          borderColor: isSaveDisabled ? "#ccc" : "#00bcd4",
                          boxShadow: isSaveDisabled ? "none" : "0 3px 6px rgba(0,0,0,0.12)",
                          transition: "all 0.3s ease",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isSaveDisabled ? "not-allowed" : "pointer",
                        }}
                      >
                        <FeatherIcon
                          icon={isSubmitted ? "check-circle" : "save"}
                          size="15"
                          className="me-2"
                        />
                        {isSubmitted ? "SUBMITTED TO DATABASE" : "SAVE DAILY CLOSING"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* Document Preview Modal Popup */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ background: "#e0f7fa", borderBottom: "2px solid #00bcd4" }}>
          <Modal.Title style={{ color: "#006064", fontWeight: "bold", fontSize: "16px" }}>
            <i className="fa fa-eye me-2"></i> {previewName} Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "center", backgroundColor: "#f5fcfd", padding: "15px" }}>
          {previewType === "pdf" ? (
            <iframe
              src={previewUrl}
              title={previewName}
              width="100%"
              height="550px"
              style={{ border: "none", borderRadius: "8px" }}
            />
          ) : (
            <img
              src={previewUrl}
              alt={previewName}
              style={{
                maxWidth: "100%",
                maxHeight: "550px",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
              }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DailyClosing;
