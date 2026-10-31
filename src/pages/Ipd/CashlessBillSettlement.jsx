import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Modal,
  Spinner,
} from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import FeatherIcon from "feather-icons-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import moment from "moment";
import * as XLSX from "xlsx";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../Utility/decode-jwt";
import "../../styles/styles.css";

const BASE_URL = "http://194.195.117.79:5100/api";
const CUTOFF_DATE = "2026-06-30";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const getLocationFromStorage = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const payload = decodeJwt(token);
    if (payload?.jobLocation) return payload.jobLocation;
  }
  return (
    localStorage.getItem("location") ||
    localStorage.getItem("jobLocation") ||
    "default"
  );
};

const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return "-";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return String(dateValue);
  }
};

const formatAmount = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  const num = Math.round(parseFloat(String(val).replace(/,/g, "")) || 0);
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const formatNumberWithCommas = (val) => {
  if (val === null || val === undefined || val === "") return "";
  const rawNum = String(val).replace(/\D/g, "");
  if (!rawNum) return "";
  const num = parseInt(rawNum, 10);
  if (isNaN(num)) return "";
  return num.toLocaleString("en-IN");
};

const CashlessBillSettlement = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(
    getLocationFromStorage(),
  );
  const [insuranceOptions, setInsuranceOptions] = useState([]);
  const [tpaOptions, setTpaOptions] = useState([]);
  const [masterInsuranceOptions, setMasterInsuranceOptions] = useState([]);
  const [masterTpaOptions, setMasterTpaOptions] = useState([]);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Modal State for "Add Data" / Settlement
  const [showModal, setShowModal] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    invoice_id: "",
    patientname: "",
    patient_location: "",
    totalbill: "0",
    authoamt: "0",
    receivedamt: "",
    tdsamt: "",
    utrno: "",
    paymentdate: "",
    settlementletter: null,
    isReceivedAmtSubmitted: false,
    isUtrSubmitted: false,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

  // Fetch Insurance Co and TPA dropdown options (both local and master) for resolving numeric IDs to names
  useEffect(() => {
    const loc = currentLocation || getLocationFromStorage();
    if (!loc) return;

    const fetchDropdowns = async () => {
      try {
        const [localIRep, localTRep, masterIRep, masterTRep] = await Promise.all([
          fetch(
            `${BASE_URL}/V1/invoice/insurance_co_dropdown?location=${encodeURIComponent(loc)}&date=2026-06-30`,
          ),
          fetch(
            `${BASE_URL}/V1/invoice/tpa_dropdown?location=${encodeURIComponent(loc)}&date=2026-06-30`,
          ),
          fetch(
            `${BASE_URL}/V1/invoice/insurance_co_dropdown?location=${encodeURIComponent(loc)}&date=2026-07-01`,
          ),
          fetch(
            `${BASE_URL}/V1/invoice/tpa_dropdown?location=${encodeURIComponent(loc)}&date=2026-07-01`,
          ),
        ]);

        if (localIRep.ok) {
          const iData = await localIRep.json();
          setInsuranceOptions(iData.data || []);
        }
        if (localTRep.ok) {
          const tData = await localTRep.json();
          setTpaOptions(tData.data || []);
        }
        if (masterIRep.ok) {
          const miData = await masterIRep.json();
          setMasterInsuranceOptions(miData.data || []);
        }
        if (masterTRep.ok) {
          const mtData = await masterTRep.json();
          setMasterTpaOptions(mtData.data || []);
        }
      } catch (err) {
        console.error("Error fetching insurance/TPA dropdowns:", err);
      }
    };

    fetchDropdowns();
  }, [currentLocation]);

  const resolveInsuranceName = useCallback(
    (val, date) => {
      if (!val || val === "0" || val === 0 || val === "NULL" || val === "null")
        return "-";
      const strVal = String(val).trim();
      const isMaster =
        date && moment(date).isValid() && moment(date).isAfter(CUTOFF_DATE);

      const primaryList = isMaster ? masterInsuranceOptions : insuranceOptions;
      const secondaryList = isMaster ? insuranceOptions : masterInsuranceOptions;

      const match =
        primaryList.find(
          (i) =>
            String(i.comapny_id) === strVal ||
            String(i.company_id) === strVal ||
            String(i.id) === strVal,
        ) ||
        secondaryList.find(
          (i) =>
            String(i.comapny_id) === strVal ||
            String(i.company_id) === strVal ||
            String(i.id) === strVal,
        );

      if (match)
        return match.companyname || match.company_name || match.name || strVal;
      return strVal;
    },
    [insuranceOptions, masterInsuranceOptions],
  );

  const resolveTpaName = useCallback(
    (val, date) => {
      if (!val || val === "0" || val === 0 || val === "NULL" || val === "null")
        return "-";
      const strVal = String(val).trim();
      const isMaster =
        date && moment(date).isValid() && moment(date).isAfter(CUTOFF_DATE);

      const primaryList = isMaster ? masterTpaOptions : tpaOptions;
      const secondaryList = isMaster ? tpaOptions : masterTpaOptions;

      const match =
        primaryList.find(
          (t) =>
            String(t.comapny_id) === strVal ||
            String(t.company_id) === strVal ||
            String(t.id) === strVal ||
            String(t.tpa_id) === strVal,
        ) ||
        secondaryList.find(
          (t) =>
            String(t.comapny_id) === strVal ||
            String(t.company_id) === strVal ||
            String(t.id) === strVal,
        );

      if (match)
        return (
          match.companyname ||
          match.company_name ||
          match.name ||
          match.tpaname ||
          strVal
        );
      return strVal;
    },
    [tpaOptions, masterTpaOptions],
  );

  const dropdownCache = useRef({});

  const getDropdownsForDate = useCallback(
    async (loc, dateStr) => {
      const isMaster =
        dateStr &&
        moment(dateStr).isValid() &&
        moment(dateStr).isAfter(CUTOFF_DATE);

      if (isMaster && masterInsuranceOptions.length > 0) {
        return {
          insurance: masterInsuranceOptions,
          tpa: masterTpaOptions,
        };
      }
      if (!isMaster && insuranceOptions.length > 0) {
        return {
          insurance: insuranceOptions,
          tpa: tpaOptions,
        };
      }

      const key = `${loc}_${isMaster ? "master" : "local"}`;
      if (dropdownCache.current[key]) {
        return dropdownCache.current[key];
      }

      try {
        const dateQuery = isMaster ? `&date=2026-07-01` : `&date=2026-06-30`;
        const [iRes, tRes] = await Promise.all([
          fetch(
            `${BASE_URL}/V1/invoice/insurance_co_dropdown?location=${encodeURIComponent(loc)}${dateQuery}`,
          ),
          fetch(
            `${BASE_URL}/V1/invoice/tpa_dropdown?location=${encodeURIComponent(loc)}${dateQuery}`,
          ),
        ]);

        const iData = iRes.ok ? await iRes.json() : {};
        const tData = tRes.ok ? await tRes.json() : {};

        const result = {
          insurance: iData.data || [],
          tpa: tData.data || [],
        };
        dropdownCache.current[key] = result;
        return result;
      } catch (e) {
        console.error("Error fetching date dropdowns:", e);
        return { insurance: [], tpa: [] };
      }
    },
    [insuranceOptions, masterInsuranceOptions, tpaOptions, masterTpaOptions],
  );

  const formatApiDate = (date) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };

  const fetchInsuranceData = useCallback(async () => {
    const loc = currentLocation || getLocationFromStorage();
    setLoading(true);

    try {
      const fromStr = formatApiDate(fromDate);
      const toStr = formatApiDate(toDate);
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let fetchedData = null;

      // 1. Try manageInsuranceData / InsuranceDetails endpoint
      try {
        let url = `${BASE_URL}/V1/managereports/manageInsuranceData?location=${encodeURIComponent(loc)}`;
        let options = {
          method: "POST",
          headers,
          body: JSON.stringify({
            isAjax: "true",
            location: loc,
            Fromdate: fromStr,
            Todate: toStr,
          }),
        };

        if (fromStr && toStr) {
          url = `${BASE_URL}/V1/managereports/InsuranceDetails`;
          options = {
            method: "POST",
            headers,
            body: JSON.stringify({
              Fromdate: fromStr,
              Todate: toStr,
              location: loc,
            }),
          };
        }

        let res = await fetch(url, options);
        if (!res.ok) {
          // Retry with GET
          url = `${BASE_URL}/V1/managereports/manageInsuranceData?location=${encodeURIComponent(loc)}${fromStr ? `&Fromdate=${fromStr}&Todate=${toStr}` : ""}`;
          res = await fetch(url, { method: "GET", headers });
        }

        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json)
            ? json
            : json.data || json.companydetails;
          if (Array.isArray(list) && list.length > 0) {
            fetchedData = list;
          }
        }
      } catch (e) {
        console.warn("manageInsuranceData primary fetch notice:", e);
      }

      // 2. Fallback to getInsuranceDueReport
      if (!fetchedData) {
        try {
          const res = await fetch(
            `${BASE_URL}/V1/managereports/getInsuranceDueReport`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                location: loc,
                Fromdate: fromStr || "2020-01-01",
                Todate: toStr || moment().format("YYYY-MM-DD"),
              }),
            },
          );
          if (res.ok) {
            const json = await res.json();
            const list = Array.isArray(json) ? json : json.data;
            if (Array.isArray(list) && list.length > 0) {
              fetchedData = list;
            }
          }
        } catch (e) {
          console.warn("getInsuranceDueReport notice:", e);
        }
      }

      // 3. Fallback to listInvoice
      if (!fetchedData) {
        try {
          const url = `${BASE_URL}/V1/invoice/listInvoice?location=${encodeURIComponent(loc)}${fromStr ? `&from=${fromStr}&to=${toStr}` : ""}`;
          const res = await fetch(url, { method: "GET", headers });
          if (res.ok) {
            const json = await res.json();
            const raw = Array.isArray(json.data?.[0])
              ? json.data[0]
              : json.data || [];
            const insuranceInvoices = raw.filter((inv) => {
              const st = (inv.status || "").toLowerCase();
              const bm = (inv.bill_method || "").toLowerCase();
              const bt = (inv.bill_Type || inv.bill_type || "").toLowerCase();
              return (
                st === "cashless" ||
                bm === "cashless" ||
                bt === "insurance" ||
                inv.insurancecompany ||
                inv.companyname
              );
            });
            if (insuranceInvoices.length > 0) {
              fetchedData = insuranceInvoices;
            }
          }
        } catch (e) {
          console.warn("listInvoice fallback notice:", e);
        }
      }

      if (fetchedData && Array.isArray(fetchedData)) {
        const processed = await Promise.all(
          fetchedData.map(async (item) => {
            const rawComp =
              item.companyname &&
                item.companyname !== "0" &&
                item.companyname !== "NULL" &&
                item.companyname !== "null"
                ? item.companyname
                : item.companyName &&
                  item.companyName !== "0" &&
                  item.companyName !== "NULL"
                  ? item.companyName
                  : item.insurance_company_name &&
                    item.insurance_company_name !== "0"
                    ? item.insurance_company_name
                    : item.invoice_insurancecompany &&
                      item.invoice_insurancecompany !== "0"
                      ? item.invoice_insurancecompany
                      : item.insurancecompany || item.insurance_name || "-";

            const rawTpa =
              item.tpaname &&
                item.tpaname !== "0" &&
                item.tpaname !== "NULL" &&
                item.tpaname !== "null"
                ? item.tpaname
                : item.tpa_name &&
                  item.tpa_name !== "0" &&
                  item.tpa_name !== "NULL"
                  ? item.tpa_name
                  : item.invoice_tpa && item.invoice_tpa !== "0"
                    ? item.invoice_tpa
                    : item.tpa || "-";
            const creationDate =
              item.creationdate || item.creation_date || item.date || "";

            let finalComp = rawComp;
            let finalTpa = rawTpa;

            const isPostCutoff =
              creationDate &&
              moment(creationDate).isValid() &&
              moment(creationDate).isAfter(CUTOFF_DATE);

            const isCompNumeric = /^\d+$/.test(String(rawComp).trim());
            const isTpaNumeric = /^\d+$/.test(String(rawTpa).trim());

            const dateDropdowns = await getDropdownsForDate(
              loc,
              creationDate,
            );

            if (isCompNumeric) {
              const match = dateDropdowns.insurance.find(
                (i) =>
                  String(i.comapny_id) === String(rawComp).trim() ||
                  String(i.company_id) === String(rawComp).trim() ||
                  String(i.id) === String(rawComp).trim(),
              );
              if (match) {
                finalComp =
                  match.companyname ||
                  match.company_name ||
                  match.name ||
                  rawComp;
              } else {
                finalComp = resolveInsuranceName(rawComp, creationDate);
              }
            } else if (isPostCutoff && item.invoice_insurancecompany) {
              const match = dateDropdowns.insurance.find(
                (i) =>
                  String(i.comapny_id) === String(item.invoice_insurancecompany).trim() ||
                  String(i.company_id) === String(item.invoice_insurancecompany).trim() ||
                  String(i.id) === String(item.invoice_insurancecompany).trim(),
              );
              if (match) {
                finalComp =
                  match.companyname ||
                  match.company_name ||
                  match.name ||
                  finalComp;
              } else {
                finalComp = resolveInsuranceName(rawComp, creationDate);
              }
            } else {
              finalComp = resolveInsuranceName(rawComp, creationDate);
            }

            if (isTpaNumeric) {
              const match = dateDropdowns.tpa.find(
                (t) =>
                  String(t.comapny_id) === String(rawTpa).trim() ||
                  String(t.company_id) === String(rawTpa).trim() ||
                  String(t.id) === String(rawTpa).trim() ||
                  String(t.tpa_id) === String(rawTpa).trim(),
              );
              if (match) {
                finalTpa =
                  match.companyname ||
                  match.company_name ||
                  match.name ||
                  match.tpaname ||
                  rawTpa;
              } else {
                finalTpa = resolveTpaName(rawTpa, creationDate);
              }
            } else if (isPostCutoff && item.invoice_tpa) {
              const match = dateDropdowns.tpa.find(
                (t) =>
                  String(t.comapny_id) === String(item.invoice_tpa).trim() ||
                  String(t.company_id) === String(item.invoice_tpa).trim() ||
                  String(t.id) === String(item.invoice_tpa).trim() ||
                  String(t.tpa_id) === String(item.invoice_tpa).trim(),
              );
              if (match) {
                finalTpa =
                  match.companyname ||
                  match.company_name ||
                  match.name ||
                  match.tpaname ||
                  finalTpa;
              } else {
                finalTpa = resolveTpaName(rawTpa, creationDate);
              }
            } else {
              finalTpa = resolveTpaName(rawTpa, creationDate);
            }

            const totalAmt = parseFloat(
              item.totalamt || item.total_amt || item.totalAmt || 0,
            );
            const autoAmt = parseFloat(
              item.autoamt !== undefined
                ? item.autoamt
                : item.authoamt || item.approvedAmt || 0,
            );
            const recAmt = parseFloat(
              item.receivedamt || item.received_amt || item.receivedAmt || 0,
            );
            const tdsAmt = parseFloat(item.tdsamt || item.tds_amt || 0);

            const totalDue = parseFloat(
              item.invoice_totaldue !== undefined &&
                item.invoice_totaldue !== null
                ? item.invoice_totaldue
                : item.totaldue !== undefined && item.totaldue !== null
                  ? item.totaldue
                  : item.total_due !== undefined && item.total_due !== null
                    ? item.total_due
                    : item.due_amt || 0,
            );

            const companyDue = parseFloat(
              item.companydue !== undefined && item.companydue !== null
                ? item.companydue
                : item.company_due || 0,
            );

            return {
              ...item,
              invoiceid:
                item.invoiceid || item.invoice_id || item.invoiceNo || item.id,
              creationdate: creationDate,
              patientname:
                item.patientname ||
                (item.prefix && item.patient_name
                  ? `${item.prefix} ${item.patient_name}`
                  : item.patient_name) ||
                item.patientName ||
                item.name ||
                "-",
              patient_location:
                item.patient_location !== undefined &&
                  item.patient_location !== null &&
                  item.patient_location !== "NULL"
                  ? item.patient_location
                  : item.patientLocation || "",
              companyname: finalComp,
              tpaname: finalTpa,
              totalamt: totalAmt,
              autoamt: autoAmt,
              receivedamt: recAmt,
              tdsamt: tdsAmt,
              totaldue: totalDue,
              companydue: companyDue,
            };
          }),
        );
        // Sort data: latest date first, and higher bill number at top
        processed.sort((a, b) => {
          const rawDateA = a.creationdate || a.creation_date || a.date;
          const rawDateB = b.creationdate || b.creation_date || b.date;

          const mA = rawDateA ? moment(rawDateA) : null;
          const mB = rawDateB ? moment(rawDateB) : null;

          const validA = mA && mA.isValid();
          const validB = mB && mB.isValid();

          if (validA && validB) {
            const dayA = mA.format("YYYY-MM-DD");
            const dayB = mB.format("YYYY-MM-DD");
            if (dayA !== dayB) {
              return dayB.localeCompare(dayA); // Latest date first
            }
          } else if (validA && !validB) {
            return -1;
          } else if (!validA && validB) {
            return 1;
          }

          // Same date or both invalid: higher bill no at top
          const billA =
            parseInt(
              String(a.invoiceid || a.invoice_id || "").replace(/\D/g, ""),
              10,
            ) || 0;
          const billB =
            parseInt(
              String(b.invoiceid || b.invoice_id || "").replace(/\D/g, ""),
              10,
            ) || 0;
          return billB - billA;
        });

        setData(processed);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error in fetchInsuranceData:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentLocation,
    fromDate,
    toDate,
    getDropdownsForDate,
    resolveInsuranceName,
    resolveTpaName,
  ]);

  useEffect(() => {
    fetchInsuranceData();
  }, [fetchInsuranceData]);

  const handleGlobalSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters({
      global: { value: value || null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const handleClearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setSearchTerm("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "There is no data to export for the selected date range.",
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    let exportList = data;
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      exportList = data.filter((item) => {
        const pName = String(item.patientname || "").toLowerCase();
        const pLoc = String(item.patient_location || "").toLowerCase();
        const comp = String(
          resolveInsuranceName(item.companyname, item.creationdate) || "",
        ).toLowerCase();
        const tpa = String(
          resolveTpaName(item.tpaname, item.creationdate) || "",
        ).toLowerCase();
        const dateStr = String(
          formatDateForDisplay(item.creationdate) || "",
        ).toLowerCase();
        const invId = String(item.invoiceid || "").toLowerCase();
        return (
          pName.includes(term) ||
          pLoc.includes(term) ||
          comp.includes(term) ||
          tpa.includes(term) ||
          dateStr.includes(term) ||
          invId.includes(term)
        );
      });
    }

    if (exportList.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Matching Records",
        text: "No records match your search criteria to export.",
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    const excelData = exportList.map((item, index) => ({
      "Sr.No": index + 1,
      Date: formatDateForDisplay(item.creationdate),
      "Invoice ID": item.invoiceid || item.invoice_id || "-",
      "Patient Name": item.patientname || "-",
      "Insurance Name": resolveInsuranceName(item.companyname, item.creationdate),
      "TPA Name": resolveTpaName(item.tpaname, item.creationdate),
      "Total Bill": formatAmount(item.totalamt),
      "Authorised Amt": formatAmount(item.autoamt),
      "Received Amt": formatAmount(item.receivedamt),
      TDS: formatAmount(item.tdsamt),
      "Total Due": formatAmount(item.totaldue),
      "Company Due": formatAmount(item.companydue),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cashless Settlements");

    const formattedFromDate = fromDate
      ? moment(fromDate).format("DD-MM-YYYY")
      : "All";
    const formattedToDate = toDate
      ? moment(toDate).format("DD-MM-YYYY")
      : "All";
    const fileName = `Cashless_Bill_Settlement_${formattedFromDate}_to_${formattedToDate}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const handleOpenModal = (rowData) => {
    const isMirror =
      rowData.status === "Interbranch-Bill" ||
      (rowData.interbranch_id !== null &&
        rowData.interbranch_id !== undefined &&
        rowData.interbranch_id !== "" &&
        rowData.interbranch_id !== 0 &&
        rowData.interbranch_id !== "0");

    const isDpRoad =
      String(currentLocation || getLocationFromStorage() || "")
        .trim()
        .toLowerCase() === "dp road";

    if (isMirror && !isDpRoad) {
      Swal.fire({
        icon: "warning",
        title: "Action Restricted",
        text: "Settlement for interbranch bills can only be added at the billing branch or DP Road.",
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    const invoiceId = rowData.invoiceid || rowData.invoice_id || "";
    const totalBill = rowData.totalamt || 0;
    const authoAmt =
      rowData.autoamt !== undefined ? rowData.autoamt : rowData.authoamt || 0;
    const patientName = rowData.patientname || rowData.patient_name || "-";
    const existingLetter =
      rowData.settlementLetter ||
      rowData.settlementletter ||
      rowData.settlement_letter ||
      null;
    const totalDue =
      rowData.totaldue !== undefined && rowData.totaldue !== null
        ? rowData.totaldue
        : 0;

    const hasSubmittedReceivedAmt = Boolean(
      rowData.receivedamt !== undefined &&
      rowData.receivedamt !== null &&
      parseFloat(String(rowData.receivedamt).replace(/,/g, "")) > 0
    );
    const hasSubmittedUtr = Boolean(
      rowData.utrno !== undefined &&
      rowData.utrno !== null &&
      String(rowData.utrno).trim() !== "" &&
      String(rowData.utrno).trim().toLowerCase() !== "null" &&
      String(rowData.utrno).trim().toLowerCase() !== "undefined"
    );

    setSettlementForm({
      invoice_id: invoiceId,
      patientname: patientName,
      patient_location:
        rowData.patient_location && rowData.patient_location !== "NULL"
          ? rowData.patient_location
          : "",
      totalbill: totalBill,
      authoamt: authoAmt,
      totaldue: totalDue,
      receivedamt: rowData.receivedamt
        ? formatNumberWithCommas(rowData.receivedamt)
        : "",
      tdsamt: rowData.tdsamt ? formatNumberWithCommas(rowData.tdsamt) : "",
      utrno:
        rowData.utrno &&
          String(rowData.utrno).trim().toLowerCase() !== "null" &&
          String(rowData.utrno).trim().toLowerCase() !== "undefined"
          ? String(rowData.utrno).trim()
          : "",
      paymentdate:
        rowData.paymentdate &&
          rowData.paymentdate !== "0000-00-00" &&
          moment(rowData.paymentdate).isValid()
          ? moment(rowData.paymentdate).format("YYYY-MM-DD")
          : rowData.payment_date &&
            rowData.payment_date !== "0000-00-00" &&
            moment(rowData.payment_date).isValid()
            ? moment(rowData.payment_date).format("YYYY-MM-DD")
            : "",
      settlementletter: null,
      existingSettlementLetter: existingLetter,
      isReceivedAmtSubmitted: hasSubmittedReceivedAmt,
      isUtrSubmitted: hasSubmittedUtr,
    });
    setShowModal(true);
  };

  const handleSettlementSubmit = async (e) => {
    e.preventDefault();

    const receivedamt =
      parseFloat(String(settlementForm.receivedamt).replace(/,/g, "")) || 0;
    const tdsamt =
      parseFloat(String(settlementForm.tdsamt).replace(/,/g, "")) || 0;
    const authoamt = parseFloat(settlementForm.authoamt) || 0;
    const total = receivedamt + tdsamt;

    if (total > authoamt) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Received Amount + TDS Amount should not be greater than Authorized Amount.",
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    if (
      !settlementForm.paymentdate ||
      !settlementForm.receivedamt ||
      !settlementForm.tdsamt ||
      !settlementForm.utrno ||
      (!settlementForm.settlementletter &&
        !settlementForm.existingSettlementLetter)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please select Payment Date, enter Received Amount, TDS Amount, UTR No, and upload Settlement Letter (PDF).",
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("invoice_id", settlementForm.invoice_id);
      formData.append("receivedamt", receivedamt);
      formData.append("tdsamt", tdsamt);
      formData.append("totalbill", parseFloat(settlementForm.totalbill) || 0);
      formData.append("authoamt", authoamt);
      formData.append("utrno", settlementForm.utrno);
      formData.append("paymentdate", settlementForm.paymentdate);
      formData.append("location", currentLocation || getLocationFromStorage());
      if (settlementForm.settlementletter) {
        formData.append("settlementletter", settlementForm.settlementletter);
      }

      const token = localStorage.getItem("token");
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let res = await fetch(`${BASE_URL}/V1/managereports/enquiryrequest`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        res = await fetch(`${BASE_URL}/V1/invoice/enquiryrequest`, {
          method: "POST",
          headers,
          body: formData,
        });
      }

      if (!res.ok) {
        res = await fetch(`${BASE_URL}/V1/invoice/insuranceSettlement`, {
          method: "POST",
          headers,
          body: formData,
        });
      }

      const resData = await res.json();

      if (
        res.ok &&
        (resData.status === "success" ||
          resData.statusCode === 200 ||
          resData.status === true)
      ) {
        Toast.fire({
          icon: "success",
          title: "Insurance data updated successfully.",
        });
        setShowModal(false);
        fetchInsuranceData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: resData.message || "Failed to update insurance data.",
          confirmButtonColor: "#00acc1",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.message || "Network error occurred. Please try again.",
        confirmButtonColor: "#00acc1",
      });
    } finally {
      setSubmitting(false);
    }
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
              onChange={(e) => setRows(parseInt(e.target.value))}
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
                value={searchTerm}
                onChange={handleGlobalSearchChange}
                placeholder="Global Search"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
                }}
              />
            </InputGroup>
          </Form.Group>
          <Button
            variant="success"
            onClick={handleExportExcel}
            style={{
              backgroundColor: "#2e7d32",
              border: "none",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              height: "25px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            title="Download Excel for selected date range"
          >
            <FeatherIcon icon="download" size={14} />
            Download Excel
          </Button>
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
              onChange={(date) => setFromDate(date)}
              dateFormat="dd-MM-yyyy"
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
              onChange={(date) => setToDate(date)}
              dateFormat="dd-MM-yyyy"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleClearFilters}
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

  const recAmtNum =
    parseFloat(String(settlementForm.receivedamt || "").replace(/,/g, "")) || 0;
  const tdsAmtNum =
    parseFloat(String(settlementForm.tdsamt || "").replace(/,/g, "")) || 0;
  const authoAmtNum = parseFloat(settlementForm.authoamt) || 0;
  const totalDueNum = parseFloat(settlementForm.totaldue) || 0;

  const recAmtExceeded = authoAmtNum > 0 && recAmtNum > authoAmtNum;
  const totalAmtExceeded =
    authoAmtNum > 0 && recAmtNum + tdsAmtNum > authoAmtNum;
  const isAmountExceeded = recAmtExceeded || totalAmtExceeded;
  const isTotalDueZero =
    settlementForm.totaldue !== undefined &&
    settlementForm.totaldue !== null &&
    totalDueNum <= 0;

  const isReceivedAmtDisabled = Boolean(settlementForm.isReceivedAmtSubmitted);
  const isUtrDisabled = Boolean(settlementForm.isUtrSubmitted);

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
      <PageBreadcrumb pagename="Cashless Bill Settlement" />

      <Container fluid className="p-0">
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "1px solid #00bcd4",
                marginLeft: "17px",
                marginRight: "17px",
              }}
            >
              <Card.Body style={{ margin: "4px" }}>
                {renderHeader()}

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
                    value={data}
                    paginator
                    rows={rows}
                    first={first}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    filters={filters}
                    showGridlines
                    style={{ fontSize: "14px", marginTop: "10px" }}
                    pt={{
                      header: { style: { padding: "10px 12px" } },
                      bodyRow: { style: { height: "40px" } },
                      column: {
                        headerCell: {
                          style: {
                            padding: "10px 8px",
                            backgroundColor: "#f8f9fa",
                            textAlign: "center",
                            justifyContent: "center",
                          },
                        },
                        bodyCell: {
                          style: {
                            padding: "8px 10px",
                            textAlign: "center",
                          },
                        },
                      },
                    }}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    responsiveLayout="scroll"
                    className="custom-datatable-centered datatable-medium-small"
                    emptyMessage="No records found."
                  >
                    <Column
                      header="Sr.No"
                      headerClassName="datatable-header-center"
                      style={{ width: "50px", border: "1px solid #4dd0e1" }}
                      body={(rowData, options) => options.rowIndex + 1}
                    />
                    <Column
                      field="creationdate"
                      header="Date"
                      headerClassName="datatable-header-center"
                      body={(rowData) =>
                        formatDateForDisplay(rowData.creationdate)
                      }
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="invoiceid"
                      header="Bill No"
                      headerClassName="datatable-header-center"
                      body={(rowData) =>
                        rowData.invoiceid || rowData.invoice_id || "-"
                      }
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="patientname"
                      header="Patient Name"
                      headerClassName="datatable-header-center"
                      body={(rowData) => {
                        const hasPatientLocation =
                          rowData.patient_location !== null &&
                          rowData.patient_location !== undefined &&
                          rowData.patient_location !== "" &&
                          rowData.patient_location !== "NULL";
                        return (
                          <span>
                            {hasPatientLocation && (
                              <small
                                style={{
                                  color: "red",
                                  fontWeight: "bold",
                                  marginRight: "5px",
                                }}
                              >
                                (Interbranch: {rowData.patient_location})
                                <br></br>
                              </small>
                            )}
                            {rowData.prefix &&
                              !rowData.patientname?.startsWith(rowData.prefix)
                              ? `${rowData.prefix} `
                              : ""}
                            {rowData.patientname || rowData.patient_name || "-"}
                          </span>
                        );
                      }}
                      style={{
                        width: "200px",
                        border: "1px solid #4dd0e1",
                        wordBreak: "break-word",
                      }}
                    />
                    <Column
                      field="companyname"
                      header="Insurance Name"
                      headerClassName="datatable-header-center"
                      body={(rowData) =>
                        resolveInsuranceName(
                          rowData.companyname,
                          rowData.creationdate,
                        )
                      }
                      style={{ width: "180px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="tpaname"
                      header="TPA Name"
                      headerClassName="datatable-header-center"
                      body={(rowData) =>
                        resolveTpaName(rowData.tpaname, rowData.creationdate)
                      }
                      style={{ width: "180px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="totalamt"
                      header="Total Bill"
                      headerClassName="datatable-header-center"
                      body={(rowData) => formatAmount(rowData.totalamt)}
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="autoamt"
                      header="Approved Amt"
                      headerClassName="datatable-header-center"
                      body={(rowData) => formatAmount(rowData.autoamt)}
                      style={{ width: "120px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="receivedamt"
                      header="Received Amt"
                      headerClassName="datatable-header-center"
                      body={(rowData) => formatAmount(rowData.receivedamt)}
                      style={{ width: "110px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="tdsamt"
                      header="TDS"
                      headerClassName="datatable-header-center"
                      body={(rowData) => formatAmount(rowData.tdsamt)}
                      style={{ width: "90px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="totaldue"
                      header="Total Due"
                      headerClassName="datatable-header-center"
                      body={(rowData) => formatAmount(rowData.totaldue)}
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      field="companydue"
                      header="Company Due"
                      headerClassName="datatable-header-center"
                      body={(rowData) => formatAmount(rowData.companydue)}
                      style={{ width: "110px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      header="Action"
                      headerClassName="datatable-header-center"
                      style={{ width: "90px", border: "1px solid #4dd0e1" }}
                      body={(rowData) => {
                        const isMirror =
                          rowData.status === "Interbranch-Bill" ||
                          (rowData.interbranch_id !== null &&
                            rowData.interbranch_id !== undefined &&
                            rowData.interbranch_id !== "" &&
                            rowData.interbranch_id !== 0 &&
                            rowData.interbranch_id !== "0");

                        const isDpRoad =
                          String(
                            currentLocation || getLocationFromStorage() || "",
                          )
                            .trim()
                            .toLowerCase() === "dp road";

                        const isDisabled = isMirror && !isDpRoad;

                        return (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isDisabled}
                            style={{
                              borderRadius: "6px",
                              padding: "8px 10px",
                              backgroundColor: isDisabled
                                ? "#b0bec5"
                                : "#e53935",
                              borderColor: isDisabled ? "#b0bec5" : "#d32f2f",
                              cursor: isDisabled ? "not-allowed" : "pointer",
                              opacity: isDisabled ? 0.65 : 1,
                            }}
                            title={
                              isDisabled
                                ? "Action restricted: Interbranch cashless settlements can only be added at the billing branch or DP Road."
                                : "Add Cashless Details"
                            }
                            onClick={() =>
                              !isDisabled && handleOpenModal(rowData)
                            }
                          >
                            <FeatherIcon icon="plus" size={14} />
                          </Button>
                        );
                      }}
                    />
                  </DataTable>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add Data / Settlement Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }}
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          >
            <FeatherIcon icon="edit" className="me-2" size="16" />
            Add Cashless Bill Settlement Details
          </Modal.Title>
        </Modal.Header>
        <Form id="settlement-form" onSubmit={handleSettlementSubmit}>
          <Modal.Body
            style={{
              backgroundColor: "#f8fbfc",
              fontSize: "13px",
              padding: "10px",
            }}
          >
            {/* Header info banner showing Bill No & Patient Name */}
            <div
              style={{
                backgroundColor: "#e0f7fa",
                border: "1px solid #4dd0e1",
                borderRadius: "8px",
                padding: "10px 15px",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#00838f",
                    fontWeight: "bold",
                  }}
                >
                  Bill No:
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#006064",
                    fontWeight: "bold",
                    backgroundColor: "#ffffff",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    border: "1px solid #80deea",
                  }}
                >
                  {settlementForm.invoice_id || "-"}
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#00838f",
                    fontWeight: "bold",
                  }}
                >
                  Patient Name:
                </span>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: "#333",
                    fontWeight: "600",
                  }}
                >
                  {settlementForm.patient_location &&
                    settlementForm.patient_location !== "NULL" && (
                      <small
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          marginRight: "5px",
                          display: "block",
                        }}
                      >
                        (Interbranch: {settlementForm.patient_location})
                      </small>
                    )}
                  {settlementForm.patientname || "-"}
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#00838f",
                    fontWeight: "bold",
                  }}
                >
                  Approved Amt:
                </span>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: "#000000ff",
                    fontWeight: "bold",
                  }}
                >
                  {formatAmount(settlementForm.authoamt)}
                </span>
              </div>
            </div>

            <Row>
              <Col md={6} className="mb-12">
                <Form.Group>
                  <Form.Label
                    className="small fw-bold mb-1"
                    style={{ fontSize: "12px", color: "#333" }}
                  >
                    Payment Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={settlementForm.paymentdate || ""}
                    max={moment().format("YYYY-MM-DD")}
                    onChange={(e) =>
                      setSettlementForm((prev) => ({
                        ...prev,
                        paymentdate: e.target.value,
                      }))
                    }
                    style={{
                      height: "35px",
                      fontSize: "12px",
                      border: "1px solid #4dd0e1",
                      borderRadius: "6px",
                    }}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-15">
                <Form.Group>
                  <Form.Label
                    className="small fw-bold mb-1"
                    style={{ fontSize: "12px", color: "#333" }}
                  >
                    Received Amount <span className="text-danger">*</span>
                    {/* {isReceivedAmtDisabled && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#6c757d",
                          color: "#ffffff",
                          fontSize: "10px",
                          fontWeight: "500",
                          padding: "3px 7px",
                          borderRadius: "4px",
                        }}
                      >
                        <FeatherIcon icon="lock" size={10} className="me-1" />
                        Submitted
                      </span>
                    )} */}
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      style={{
                        backgroundColor: isReceivedAmtDisabled
                          ? "#eceff1"
                          : "#e0f7fa",
                        border: "1px solid #4dd0e1",
                        borderRight: "none",
                        color: isReceivedAmtDisabled ? "#78909c" : "#00838f",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      ₹
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter Received Amount"
                      value={settlementForm.receivedamt}
                      disabled={isReceivedAmtDisabled}
                      readOnly={isReceivedAmtDisabled}
                      onChange={(e) => {
                        if (isReceivedAmtDisabled) return;
                        const val = formatNumberWithCommas(e.target.value);
                        setSettlementForm((prev) => ({
                          ...prev,
                          receivedamt: val,
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (isReceivedAmtDisabled) {
                          e.preventDefault();
                          return;
                        }
                        if (
                          !/[0-9]/.test(e.key) &&
                          ![
                            "Backspace",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                            "Tab",
                            "Home",
                            "End",
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        height: "35px",
                        fontSize: "12px",
                        border: "1px solid #4dd0e1",
                        borderLeft: "none",
                        borderTopRightRadius: "6px",
                        borderBottomRightRadius: "6px",
                        backgroundColor: isReceivedAmtDisabled
                          ? "#f1f3f5"
                          : "#ffffff",
                        cursor: isReceivedAmtDisabled ? "not-allowed" : "text",
                        color: isReceivedAmtDisabled ? "#495057" : "#000000",
                      }}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-15">
                <Form.Group>
                  <Form.Label
                    className="small fw-bold mb-1"
                    style={{ fontSize: "12px", color: "#333" }}
                  >
                    TDS Amount <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      style={{
                        backgroundColor: "#e0f7fa",
                        border: "1px solid #4dd0e1",
                        borderRight: "none",
                        color: "#00838f",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      ₹
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter TDS Amount"
                      value={settlementForm.tdsamt}
                      onChange={(e) => {
                        const val = formatNumberWithCommas(e.target.value);
                        setSettlementForm((prev) => ({
                          ...prev,
                          tdsamt: val,
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          ![
                            "Backspace",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                            "Tab",
                            "Home",
                            "End",
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        height: "35px",
                        fontSize: "12px",
                        border: "1px solid #4dd0e1",
                        borderLeft: "none",
                        borderTopRightRadius: "6px",
                        borderBottomRightRadius: "6px",
                      }}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label
                    className="small fw-bold mb-1"
                    style={{ fontSize: "12px", color: "#333" }}
                  >
                    UTR Number <span className="text-danger">*</span>
                    {/* {isUtrDisabled && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#6c757d",
                          color: "#ffffff",
                          fontSize: "10px",
                          fontWeight: "500",
                          padding: "3px 7px",
                          borderRadius: "4px",
                        }}
                      >
                        <FeatherIcon icon="lock" size={10} className="me-1" />
                        Submitted
                      </span>
                    )} */}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter UTR Number"
                    value={settlementForm.utrno}
                    disabled={isUtrDisabled}
                    readOnly={isUtrDisabled}
                    onChange={(e) => {
                      if (isUtrDisabled) return;
                      setSettlementForm((prev) => ({
                        ...prev,
                        utrno: e.target.value,
                      }));
                    }}
                    onKeyDown={(e) => {
                      if (isUtrDisabled) {
                        e.preventDefault();
                        return;
                      }
                    }}
                    style={{
                      height: "35px",
                      fontSize: "12px",
                      border: "1px solid #4dd0e1",
                      borderRadius: "6px",
                      backgroundColor: isUtrDisabled ? "#f1f3f5" : "#ffffff",
                      cursor: isUtrDisabled ? "not-allowed" : "text",
                      color: isUtrDisabled ? "#495057" : "#000000",
                    }}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label
                    className="small fw-bold mb-1"
                    style={{ fontSize: "12px", color: "#333" }}
                  >
                    Upload Settlement Letter{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    id="settlementLetterFileInput"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (
                        file &&
                        file.type !== "application/pdf" &&
                        !file.name.toLowerCase().endsWith(".pdf")
                      ) {
                        Swal.fire({
                          icon: "warning",
                          title: "Invalid File Type",
                          text: "Please upload a PDF file only.",
                          confirmButtonColor: "#00acc1",
                        });
                        e.target.value = null;
                        setSettlementForm((prev) => ({
                          ...prev,
                          settlementletter: null,
                        }));
                        return;
                      }
                      setSettlementForm((prev) => ({
                        ...prev,
                        settlementletter: file || null,
                      }));
                    }}
                    style={{
                      height: "35px",
                      fontSize: "12px",
                      border: "1px solid #4dd0e1",
                      borderRadius: "6px",
                    }}
                    required={
                      !settlementForm.settlementletter &&
                      !settlementForm.existingSettlementLetter
                    }
                  />
                  {settlementForm.settlementletter ? (
                    <div
                      className="mt-2 d-flex align-items-center justify-content-between p-2"
                      style={{
                        backgroundColor: "#e0f7fa33",
                        border: "1px dashed #4dd0e1",
                        borderRadius: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#00838f",
                          fontWeight: "600",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "170px",
                        }}
                        title={settlementForm.settlementletter.name}
                      >
                        📄 {settlementForm.settlementletter.name}
                      </span>
                      <div className="d-flex align-items-center gap-1">
                        <Button
                          type="button"
                          variant="info"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            const url = URL.createObjectURL(
                              settlementForm.settlementletter,
                            );
                            setPreviewUrl(url);
                            setPreviewName(
                              settlementForm.settlementletter.name,
                            );
                            setShowPreview(true);
                          }}
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            backgroundColor: "#00bcd4",
                            borderColor: "#00bcd4",
                            color: "#fff",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            height: "25px",
                          }}
                        >
                          <FeatherIcon icon="eye" size={12} />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setSettlementForm((prev) => ({
                              ...prev,
                              settlementletter: null,
                            }));
                            const inputEl = document.getElementById(
                              "settlementLetterFileInput",
                            );
                            if (inputEl) inputEl.value = "";
                          }}
                          style={{
                            fontSize: "11px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            height: "25px",
                          }}
                          title="Remove file"
                        >
                          <FeatherIcon icon="x" size={12} />
                        </Button>
                      </div>
                    </div>
                  ) : settlementForm.existingSettlementLetter ? (
                    <div
                      className="mt-2 d-flex align-items-center justify-content-between p-2"
                      style={{
                        backgroundColor: "#e8f5e9",
                        border: "1px solid #81c784",
                        borderRadius: "6px",
                        height: "30px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#2e7d32",
                          fontWeight: "600",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                        }}
                      >
                        ✅ Submitted Settlement Letter
                      </span>
                      <Button
                        type="button"
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          const letter =
                            settlementForm.existingSettlementLetter;
                          const fullUrl = letter.startsWith("http")
                            ? letter
                            : `${BASE_URL.replace("/api", "")}${letter}`;
                          setPreviewUrl(fullUrl);
                          setPreviewName(
                            `Submitted Settlement Letter (${settlementForm.invoice_id})`,
                          );
                          setShowPreview(true);
                        }}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          backgroundColor: "#2e7d32",
                          borderColor: "#2e7d32",
                          color: "#fff",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FeatherIcon icon="eye" size={12} />
                        View Submitted
                      </Button>
                    </div>
                  ) : null}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer
            style={{
              backgroundColor: "#f8fbfc",
              padding: "8px 15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, textAlign: "left", paddingRight: "10px" }}>
              {isAmountExceeded ? (
                <span
                  style={{
                    color: "#d32f2f",
                    fontWeight: "600",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <FeatherIcon icon="alert-triangle" size={14} />
                  {recAmtExceeded
                    ? `Received Amount cannot exceed Authorised Amount (₹ ${Math.round(authoAmtNum).toLocaleString("en-IN")})`
                    : `Received + TDS Amount cannot exceed Authorised Amount (₹ ${Math.round(authoAmtNum).toLocaleString("en-IN")})`}
                </span>
              ) : isTotalDueZero ? (
                <span
                  style={{
                    color: "#2e7d32",
                    fontWeight: "600",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <FeatherIcon icon="check-circle" size={14} />
                  Total Due is ₹ 0. Settlement is already completed.
                </span>
              ) : isReceivedAmtDisabled && isUtrDisabled ? (
                <span
                  style={{
                    color: "#006064",
                    fontWeight: "600",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <FeatherIcon icon="lock" size={14} />
                  Received Amount and UTR Number are submitted and locked.
                </span>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                style={{
                  borderRadius: "8px",
                  fontSize: "12px",
                  padding: "8px 16px",
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="settlement-form"
                disabled={submitting || isAmountExceeded || isTotalDueZero}
                style={{
                  backgroundColor:
                    isAmountExceeded || isTotalDueZero
                      ? "#b0bec5"
                      : "rgb(77, 208, 225)",
                  borderColor:
                    isAmountExceeded || isTotalDueZero
                      ? "#b0bec5"
                      : "rgb(77, 208, 225)",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "12px",
                  padding: "8px 30px",
                  fontWeight: "600",
                  cursor:
                    isAmountExceeded || isTotalDueZero
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {submitting ? "Adding..." : "Add"}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
          }}
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          >
            <FeatherIcon icon="eye" className="me-2" size="16" />
            {previewName} Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            textAlign: "center",
            backgroundColor: "#f5fcfd",
            padding: "15px",
          }}
        >
          {previewUrl && (
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0`}
              title={previewName || "Settlement Letter Preview"}
              width="100%"
              height="550px"
              onContextMenu={(e) => e.preventDefault()}
              style={{ border: "none", borderRadius: "8px" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CashlessBillSettlement;
