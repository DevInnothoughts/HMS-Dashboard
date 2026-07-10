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
                ? String(dbData.opdcash)
                : "",
            ipdCash:
              dbData.ipdcash !== null && dbData.ipdcash !== undefined
                ? String(dbData.ipdcash)
                : "",
            pharmacyCash:
              dbData.pharmacycash !== null && dbData.pharmacycash !== undefined
                ? String(dbData.pharmacycash)
                : "",
            upiSettlement:
              dbData.upiamt !== null && dbData.upiamt !== undefined
                ? String(dbData.upiamt)
                : "",
            cardSettlement:
              dbData.cardamt !== null && dbData.cardamt !== undefined
                ? String(dbData.cardamt)
                : "",
            bankDeposit:
              dbData.bankdeposit !== null && dbData.bankdeposit !== undefined
                ? String(dbData.bankdeposit)
                : "",
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
    ];
    if (numericFields.includes(name)) {
      const cleanValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: cleanValue,
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
  const totalSum = checkFields.reduce((sum, key) => sum + Number(formData[key] || 0), 0);
  const isSumZero = allEntered && totalSum === 0;

  const isSaveDisabled =
    isSubmitted ||
    loading ||
    (isSumZero && (!formData.comment || !formData.comment.trim()));

  const handleSave = async () => {
    // Basic Validation
    if (!formData.opdCash || !formData.bankDeposit) {
      return Swal.fire("Required", "Please fill essential fields", "warning");
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
      fd.append("opdCash", formData.opdCash);
      fd.append("ipdCash", formData.ipdCash);
      fd.append("pharmacyCash", formData.pharmacyCash);
      fd.append("upiSettlement", formData.upiSettlement);
      fd.append("cardSettlement", formData.cardSettlement);
      fd.append("bankDeposit", formData.bankDeposit);
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
              <Card.Header
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "1px solid #4dd0e1",
                  padding: "10px 15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i
                    className="fa fa-list"
                    style={{ marginRight: "8px", color: "#333" }}
                  ></i>
                  <h5
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: "bold",
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    Collection Summary
                  </h5>
                </div>
              </Card.Header>
              <Card.Body
                style={{
                  padding: "10px",
                  background: "#ffffff",
                  borderRadius: "0 0 5px 5px",
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
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  style={{ margin: 0, fontSize: "14px" }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          minWidth: "100px",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        OPD Cash
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        IPD Cash
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Pharmacy Cash
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        UPI Settlement
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Card Settlement
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Bank Deposit
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Cash Deposit Receipt
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Card Settlement Slip
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: "white" }}>
                      <td
                        style={{
                          border: isPreviousDate ? "2px solid #ff9800" : "2px solid #2e7d32",
                          backgroundColor: isPreviousDate ? "#fff3cd" : "#e8f5e9",
                          color: isPreviousDate ? "#d84315" : "#1b5e20",
                          verticalAlign: "middle",
                          textAlign: "center",
                          fontWeight: "700",
                          fontSize: "14px",
                          padding: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {currentDate}
                        {isPreviousDate ? (
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#e65100",
                              marginTop: "3px",
                              fontWeight: "bold",
                            }}
                          >
                            (PREVIOUS DATE)
                          </div>
                        ) : (
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#1b5e20",
                              marginTop: "3px",
                              fontWeight: "bold",
                            }}
                          >
                            (TODAY'S DATE)
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="opdCash"
                            onWheel={(e) => e.target.blur()}
                            value={formData.opdCash}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {isSumZero && (
                          <div
                            style={{
                              color: "#d32f2f",
                              fontSize: "11px",
                              marginTop: "4px",
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            <i className="fa fa-warning me-1"></i>0 has been
                            entered
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="ipdCash"
                            onWheel={(e) => e.target.blur()}
                            value={formData.ipdCash}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {isSumZero && (
                          <div
                            style={{
                              color: "#d32f2f",
                              fontSize: "11px",
                              marginTop: "4px",
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            <i className="fa fa-warning me-1"></i>0 has been
                            entered
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="pharmacyCash"
                            onWheel={(e) => e.target.blur()}
                            value={formData.pharmacyCash}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {isSumZero && (
                          <div
                            style={{
                              color: "#d32f2f",
                              fontSize: "11px",
                              marginTop: "4px",
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            <i className="fa fa-warning me-1"></i>0 has been
                            entered
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="upiSettlement"
                            onWheel={(e) => e.target.blur()}
                            value={formData.upiSettlement}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {isSumZero && (
                          <div
                            style={{
                              color: "#d32f2f",
                              fontSize: "11px",
                              marginTop: "4px",
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            <i className="fa fa-warning me-1"></i>0 has been
                            entered
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="cardSettlement"
                            onWheel={(e) => e.target.blur()}
                            value={formData.cardSettlement}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {isSumZero && (
                          <div
                            style={{
                              color: "#d32f2f",
                              fontSize: "11px",
                              marginTop: "4px",
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            <i className="fa fa-warning me-1"></i>0 has been
                            entered
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="bankDeposit"
                            onWheel={(e) => e.target.blur()}
                            value={formData.bankDeposit}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {isSumZero && (
                          <div
                            style={{
                              color: "#d32f2f",
                              fontSize: "11px",
                              marginTop: "4px",
                              textAlign: "center",
                              fontWeight: "600",
                            }}
                          >
                            <i className="fa fa-warning me-1"></i>0 has been
                            entered
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {isSubmitted ? (
                          formData.cashDepositReceipt ? (
                            <div className="d-flex flex-column align-items-center gap-1">
                              <Form.Control
                                type="text"
                                readOnly
                                value={`${BASE_URL.replace("/api", "")}${formData.cashDepositReceipt}`}
                                style={{
                                  fontSize: "11px",
                                  textAlign: "center",
                                  width: "130px",
                                  textOverflow: "ellipsis",
                                }}
                                onClick={(e) => e.target.select()}
                              />
                              <Button
                                variant="outline-info"
                                size="sm"
                                style={{ fontSize: "11px" }}
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
                            <span
                              className="text-muted"
                              style={{ fontSize: "12px" }}
                            >
                              -
                            </span>
                          )
                        ) : (
                          <div className="d-flex flex-column align-items-center gap-1">
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
                                fontSize: "12px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: cashDepositFile
                                  ? "#0097a7"
                                  : "#00bcd4",
                                borderColor: cashDepositFile
                                  ? "#0097a7"
                                  : "#00bcd4",
                              }}
                            >
                              {cashDepositFile ? "Change File" : "Choose File"}
                            </label>
                            {cashDepositFile && cashDepositPreviewUrl && (
                              <div
                                style={{
                                  marginTop: "8px",
                                  padding: "6px",
                                  borderRadius: "8px",
                                  backgroundColor: "#f0fdfa",
                                  border: "1px dashed #00acc1",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  width: "140px",
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
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {isSubmitted ? (
                          formData.cardSettlementSlip ? (
                            <div className="d-flex flex-column align-items-center gap-1">
                              <Form.Control
                                type="text"
                                readOnly
                                value={`${BASE_URL.replace("/api", "")}${formData.cardSettlementSlip}`}
                                style={{
                                  fontSize: "11px",
                                  textAlign: "center",
                                  width: "130px",
                                  textOverflow: "ellipsis",
                                }}
                                onClick={(e) => e.target.select()}
                              />
                              <Button
                                variant="outline-info"
                                size="sm"
                                style={{ fontSize: "11px" }}
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
                            <span
                              className="text-muted"
                              style={{ fontSize: "12px" }}
                            >
                              -
                            </span>
                          )
                        ) : (
                          <div className="d-flex flex-column align-items-center gap-1">
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
                                fontSize: "12px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: cardSettlementFile
                                  ? "#0097a7"
                                  : "#00bcd4",
                                borderColor: cardSettlementFile
                                  ? "#0097a7"
                                  : "#00bcd4",
                              }}
                            >
                              {cardSettlementFile
                                ? "Change File"
                                : "Choose File"}
                            </label>
                            {cardSettlementFile && cardSettlementPreviewUrl && (
                              <div
                                style={{
                                  marginTop: "8px",
                                  padding: "6px",
                                  borderRadius: "8px",
                                  backgroundColor: "#f0fdfa",
                                  border: "1px dashed #00acc1",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  width: "140px",
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
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          textAlign: "center",
                          verticalAlign: "middle",
                          padding: "12px",
                        }}
                      >
                        <Button
                          variant="success"
                          onClick={handleSave}
                          disabled={isSaveDisabled}
                          style={{
                            borderRadius: "8px",
                            padding: "8px 20px",
                            fontSize: "13px",
                            fontWeight: "bold",
                            backgroundColor: isSaveDisabled
                              ? "#ccc"
                              : "#00bcd4",
                            borderColor: isSaveDisabled ? "#ccc" : "#00bcd4",
                            boxShadow: isSaveDisabled
                              ? "none"
                              : "0 2px 4px rgba(0,0,0,0.1)",
                            transition: "all 0.3s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            whiteSpace: "nowrap",
                            justifyContent: "center",
                            cursor: isSaveDisabled ? "not-allowed" : "pointer",
                          }}
                        >
                          <FeatherIcon
                            icon={isSubmitted ? "check-circle" : "save"}
                            size="14"
                            className="me-1"
                          />
                          {isSubmitted ? "SUBMITTED" : "SAVE"}
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>

                {(isSumZero || formData.comment) && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "5px",
                      backgroundColor: "#f8d7da",
                      borderRadius: "5px",
                      border: "1px solid #f5c6cb",
                    }}
                  >
                    {isSumZero && !isSubmitted && (
                      <div
                        style={{
                          color: "#721c24",
                          fontSize: "13px",
                          fontWeight: "bold",
                          marginBottom: "10px",
                        }}
                      >
                        <i className="fa fa-exclamation-triangle me-2"></i>A
                        zero balance is recorded in all fields. Please
                        provide a justification below to proceed.
                      </div>
                    )}
                    <Form.Group>
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#721c24",
                        }}
                      >
                        {isSumZero ? "Justification for Zero Balance" : "Remarks"}{" "}
                        {isSumZero && !isSubmitted && (
                          <span className="text-danger">*</span>
                        )}
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="comment"
                        value={formData.comment}
                        onChange={handleChange}
                        readOnly={isSubmitted}
                        placeholder="Enter justification or remarks..."
                        style={{
                          fontSize: "13px",
                          border: "1px solid #f5c6cb",
                          borderRadius: "5px",
                        }}
                      />
                    </Form.Group>
                  </div>
                )}
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
        <Modal.Footer style={{ backgroundColor: "#e0f7fa", borderTop: "1px solid #4dd0e1", padding: "10px" }}>
          <Button variant="secondary" onClick={() => setShowPreview(false)} style={{ borderRadius: "8px", fontWeight: "bold" }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DailyClosing;
