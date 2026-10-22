import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import FeatherIcon from "feather-icons-react";
import ReactApexChart from "react-apexcharts";
import moment from "moment";
import { LOCATIONS_LIST } from "../Auth/Login";

const BASE_URL = "http://194.195.117.79:5100/api";

const formatCurrency = (val) => {
  const num = Math.round(Number(val) || 0);
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const formatCompactCurrency = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(2)} L`;
  }
  return formatCurrency(num);
};

export default function SuperAdminDashboard() {
  // Filters
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [lastRefreshed, setLastRefreshed] = useState(moment());

  // Data States
  const [ipdBills, setIpdBills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loadingIpd, setLoadingIpd] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Process branches list
  const branchDisplayList = useMemo(() => {
    return LOCATIONS_LIST.map((loc) => ({
      label: typeof loc === "object" ? loc.label : loc,
      value: typeof loc === "object" ? loc.value : loc,
    }));
  }, []);

  const branchValues = useMemo(() => {
    return branchDisplayList.map((b) => b.value);
  }, [branchDisplayList]);

  // Certificate Status calculation matching SuperAdminHC
  const getCertStatus = (expiryDate) => {
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

  // Fetch IPD Due Invoices (>90 days overdue, from 2025-04-01, Cashless & PDC)
  const fetchIpdBills = useCallback(async () => {
    setLoadingIpd(true);
    try {
      const fromStr = "2025-04-01";
      const toStr = moment().format("YYYY-MM-DD");
      const locParam = encodeURIComponent(selectedBranch);
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${BASE_URL}/V1/invoice/getStatuswiseIPDDueListV2?location=${locParam}&fromDate=${fromStr}&toDate=${toStr}&dueCategory=>90 days`,
        { headers }
      );
      if (!res.ok) throw new Error("Failed to fetch IPD bills");

      const resData = await res.json();
      let list = [];
      if (resData && resData.data) {
        if (Array.isArray(resData.data.patients)) {
          list = resData.data.patients;
        } else if (Array.isArray(resData.data)) {
          list = resData.data;
        }
      } else if (Array.isArray(resData)) {
        list = resData;
      }

      // Filter matching IpdBillsDueList.jsx
      const filtered = list.filter((item) => {
        const creationDate = item.creation_date
          ? moment(item.creation_date).format("YYYY-MM-DD")
          : "";
        const isFromApril2025 = !creationDate || creationDate >= "2025-04-01";
        const totalDue = Number(item.totaldue) || 0;
        const dueDays =
          item.due_days !== undefined
            ? Number(item.due_days)
            : item.creation_date
              ? moment().diff(moment(item.creation_date), "days")
              : 100;
        const itemStatus = (item.bill_method || item.status || "")
          .toLowerCase()
          .trim();
        const matchesMethod = itemStatus === "cashless" || itemStatus === "pdc";
        return isFromApril2025 && totalDue > 0 && dueDays > 90 && matchesMethod;
      });

      setIpdBills(filtered);
    } catch (err) {
      console.error("Error fetching IPD Due Bills:", err);
      setIpdBills([]);
    } finally {
      setLoadingIpd(false);
    }
  }, [selectedBranch]);

  // Fetch Hospital Certificates across branches
  const fetchCertificates = useCallback(async () => {
    setLoadingCerts(true);
    const branches =
      selectedBranch === "ALL" ? branchValues : [selectedBranch];

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
      setCertificates([]);
    } finally {
      setLoadingCerts(false);
    }
  }, [selectedBranch, branchValues]);

  // Initial and branch change load
  useEffect(() => {
    fetchIpdBills();
    fetchCertificates();
    setLastRefreshed(moment());
  }, [fetchIpdBills, fetchCertificates]);

  const handleRefresh = () => {
    fetchIpdBills();
    fetchCertificates();
    setLastRefreshed(moment());
  };

  // Compute IPD Metrics
  const ipdStats = useMemo(() => {
    let totalDueAmount = 0;
    let cashlessAmount = 0;
    let cashlessCount = 0;
    let pdcAmount = 0;
    let pdcCount = 0;
    const branchMap = {};

    ipdBills.forEach((item) => {
      const amt = parseFloat(String(item.totaldue || 0).replace(/,/g, "")) || 0;
      const method = (item.bill_method || item.status || "").toLowerCase().trim();
      const branch = item.location || item.branch_name || "Unknown";

      totalDueAmount += amt;
      if (method === "cashless") {
        cashlessAmount += amt;
        cashlessCount++;
      } else if (method === "pdc") {
        pdcAmount += amt;
        pdcCount++;
      }

      if (!branchMap[branch]) {
        branchMap[branch] = { branch, amount: 0, count: 0 };
      }
      branchMap[branch].amount += amt;
      branchMap[branch].count += 1;
    });

    const sortedBranches = Object.values(branchMap).sort(
      (a, b) => b.amount - a.amount
    );

    // Top overdue invoices (sorted by due amount descending)
    const sortedInvoices = [...ipdBills].sort((a, b) => {
      const amtA = parseFloat(String(a.totaldue || 0).replace(/,/g, "")) || 0;
      const amtB = parseFloat(String(b.totaldue || 0).replace(/,/g, "")) || 0;
      return amtB - amtA;
    });

    return {
      totalDueAmount,
      totalInvoices: ipdBills.length,
      cashlessAmount,
      cashlessCount,
      pdcAmount,
      pdcCount,
      topBranches: sortedBranches.slice(0, 8),
      topInvoices: sortedInvoices.slice(0, 6),
    };
  }, [ipdBills]);

  // Compute Certificates Metrics
  const certStats = useMemo(() => {
    let active = 0;
    let expiresSoon = 0;
    let expired = 0;
    let expiringToday = 0;
    const typeMap = {};
    const branchMap = {};

    const enriched = certificates.map((cert) => {
      const expiry =
        cert.certificate_expiry || cert.expiry_date || cert.expiryDate;
      const status = getCertStatus(expiry);
      return {
        ...cert,
        status,
        calculatedExpiry: expiry,
      };
    });

    enriched.forEach((c) => {
      if (c.status === "Active") active++;
      else if (c.status === "Expires soon") expiresSoon++;
      else if (c.status === "Expired") expired++;
      else if (
        c.status === "Expiring today" ||
        c.status === "Expiring tomorrow"
      ) {
        expiringToday++;
      }

      const typeName = (c.certificate_name || c.name || "Other").trim();
      typeMap[typeName] = (typeMap[typeName] || 0) + 1;

      const loc = c.location || "Other";
      if (!branchMap[loc]) {
        branchMap[loc] = { branch: loc, total: 0, active: 0, attention: 0 };
      }
      branchMap[loc].total++;
      if (c.status === "Active") branchMap[loc].active++;
      else branchMap[loc].attention++;
    });

    // Certificates requiring attention sorted by expiry date ascending
    const attentionList = enriched
      .filter((c) => c.status !== "Active")
      .sort((a, b) => {
        const dateA = a.calculatedExpiry
          ? new Date(a.calculatedExpiry)
          : new Date(0);
        const dateB = b.calculatedExpiry
          ? new Date(b.calculatedExpiry)
          : new Date(0);
        return dateA - dateB;
      });

    // Top certificate types
    const sortedTypes = Object.entries(typeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: enriched.length,
      active,
      expiresSoon,
      expired,
      expiringToday,
      attentionCount: expired + expiresSoon + expiringToday,
      byType: sortedTypes,
      attentionList: attentionList.slice(0, 6),
      byBranch: Object.values(branchMap).sort((a, b) => b.total - a.total),
    };
  }, [certificates]);

  // Chart 1: Hospital Certificates Status Donut Chart
  const certStatusChart = useMemo(() => {
    const series = [
      certStats.active,
      certStats.expiresSoon,
      certStats.expired,
      certStats.expiringToday,
    ];
    const labels = [
      "Active",
      "Expires Soon (6 Mo)",
      "Expired",
      "Expiring Today/Tmrw",
    ];
    const colors = ["#10b981", "#f59e0b", "#ef4444", "#2563eb"];

    const options = {
      chart: {
        type: "donut",
        fontFamily: "'Poppins', Arial, sans-serif",
        toolbar: { show: false },
      },
      labels,
      colors,
      legend: {
        show: true,
        position: "right",
        horizontalAlign: "center",
        fontSize: "12px",
        fontFamily: "'Poppins', Arial, sans-serif",
        markers: { radius: 12, width: 10, height: 10 },
        itemMargin: { vertical: 6 },
        formatter: (seriesName, opts) => {
          const val = opts.w.globals.series[opts.seriesIndex];
          const total = certStats.total || 1;
          const pct = ((val / total) * 100).toFixed(0);
          return `${seriesName}: ${val} (${pct}%)`;
        },
      },
      responsive: [
        {
          breakpoint: 1200,
          options: {
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
        style: { fontSize: "11px", fontWeight: "600" },
      },
      stroke: { width: 2, colors: ["#ffffff"] },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: { show: true, fontSize: "12px", color: "#64748b" },
              value: {
                show: true,
                fontSize: "22px",
                fontWeight: "700",
                color: "#0f172a",
                formatter: () => `${certStats.total}`,
              },
              total: {
                show: true,
                label: "Total Certs",
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748b",
                formatter: () => `${certStats.total}`,
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} Certificates`,
        },
      },
    };

    return { series, options };
  }, [certStats]);

  // Chart 2: IPD Overdue Amount by Bill Method Donut Chart
  const ipdMethodChart = useMemo(() => {
    const hasData = ipdStats.cashlessAmount > 0 || ipdStats.pdcAmount > 0;
    const series = hasData
      ? [Math.round(ipdStats.cashlessAmount), Math.round(ipdStats.pdcAmount)]
      : [0, 0];
    const labels = ["Cashless", "PDC"];
    const colors = ["#00acc1", "#ff9800"];

    const options = {
      chart: {
        type: "donut",
        fontFamily: "'Poppins', Arial, sans-serif",
        toolbar: { show: false },
      },
      labels,
      colors,
      legend: {
        show: true,
        position: "right",
        horizontalAlign: "center",
        fontSize: "12px",
        fontFamily: "'Poppins', Arial, sans-serif",
        markers: { radius: 12, width: 10, height: 10 },
        itemMargin: { vertical: 10 },
        formatter: (seriesName, opts) => {
          const val = opts.w.globals.series[opts.seriesIndex];
          const total = ipdStats.totalDueAmount || 1;
          const pct = ((val / total) * 100).toFixed(1);
          const count =
            opts.seriesIndex === 0
              ? ipdStats.cashlessCount
              : ipdStats.pdcCount;
          return `${seriesName}: ${formatCompactCurrency(val)} (${pct}% • ${count} Bills)`;
        },
      },
      responsive: [
        {
          breakpoint: 1200,
          options: {
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
        style: { fontSize: "11px", fontWeight: "600" },
      },
      stroke: { width: 2, colors: ["#ffffff"] },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: { show: true, fontSize: "12px", color: "#64748b" },
              value: {
                show: true,
                fontSize: "18px",
                fontWeight: "700",
                color: "#0f172a",
                formatter: () => formatCompactCurrency(ipdStats.totalDueAmount),
              },
              total: {
                show: true,
                label: "Total Overdue",
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748b",
                formatter: () => formatCompactCurrency(ipdStats.totalDueAmount),
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val) => formatCurrency(val),
        },
      },
    };

    return { series, options };
  }, [ipdStats]);

  // Chart 3: Top Branches by Overdue IPD Amount Bar Chart
  const topBranchesChart = useMemo(() => {
    const branches = ipdStats.topBranches.slice(0, 7);
    const categories = branches.map((b) => b.branch);
    const series = [
      {
        name: "Overdue Amount",
        data: branches.map((b) => Math.round(b.amount)),
      },
    ];

    const options = {
      chart: {
        type: "bar",
        fontFamily: "'Poppins', Arial, sans-serif",
        toolbar: { show: false },
      },
      colors: ["#00bcd4"],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: "50%",
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => formatCompactCurrency(val),
        offsetY: -20,
        style: { fontSize: "10px", fontWeight: "600", colors: ["#006064"] },
      },
      xaxis: {
        categories,
        labels: {
          rotate: -20,
          style: { fontSize: "11px", fontWeight: "500", colors: "#64748b" },
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => formatCompactCurrency(val),
          style: { fontSize: "11px", colors: "#64748b" },
        },
      },
      grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 4,
        padding: {
          left: 10,
          right: 15,
          top: 0,
          bottom: 0,
        },
      },
      tooltip: {
        y: {
          formatter: (val) => formatCurrency(val),
        },
      },
    };

    return { series, options };
  }, [ipdStats.topBranches]);

  // Chart 4: Certificates Distribution by Category Bar Chart
  const certTypesChart = useMemo(() => {
    const topTypes = certStats.byType.slice(0, 8);
    const categories = topTypes.map((t) => t.name);
    const series = [
      {
        name: "Certificates",
        data: topTypes.map((t) => t.count),
      },
    ];

    const options = {
      chart: {
        type: "bar",
        fontFamily: "'Poppins', Arial, sans-serif",
        toolbar: { show: false },
      },
      colors: ["#2563eb"],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: "60%",
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val}`,
        offsetX: 14,
        style: {
          fontSize: "11px",
          fontWeight: "700",
          colors: ["#1e40af"],
        },
      },
      xaxis: {
        categories,
        max: Math.ceil((Math.max(...(topTypes.map((t) => t.count).concat([10]))) * 1.25) / 5) * 5,
        labels: {
          style: { fontSize: "11px", colors: "#64748b" },
        },
      },
      yaxis: {
        labels: {
          style: { fontSize: "11px", fontWeight: "500", colors: "#334155" },
        },
      },
      grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 4,
        padding: {
          left: 10,
          right: 35,
          top: 0,
          bottom: 0,
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} Certificates`,
        },
      },
    };

    return { series, options };
  }, [certStats.byType]);

  const isRefreshing = loadingIpd || loadingCerts;

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
      <PageBreadcrumb pagename="SuperAdmin Dashboard" />

      <SimpleBar className="theme-body common-dash">
        <Container fluid className="px-3 py-2">
          {/* Top Control Bar */}
          <Row className="g-3" style={{ marginBottom: "0px" }}>
            <Col xs={12}>
              <Card
                className="shadow-sm border-0"
                style={{
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #b2ebf2",
                }}
              >
                <Card.Body style={{ padding: "10px 10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                      direction: "ltr",
                    }}
                  >
                    {/* Left: Super Admin Executive Overview */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #00acc1, #00838f)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontSize: "20px",
                          boxShadow: "0 4px 10px rgba(0, 172, 193, 0.3)",
                          flexShrink: 0,
                        }}
                      >
                        <FeatherIcon icon="activity" size={22} />
                      </div>
                      <div>
                        <h5
                          style={{
                            margin: 0,
                            fontWeight: "700",
                            color: "#006064",
                            fontSize: "18px",
                            lineHeight: "1.2",
                          }}
                        >
                          Super Admin Executive Overview
                        </h5>
                        <small
                          style={{
                            color: "#64748b",
                            fontSize: "11px",
                            display: "block",
                            marginTop: "2px",
                          }}
                        >
                          Live metrics from IPD Due Bills &amp; Hospital Certificates
                        </small>
                      </div>
                    </div>

                    {/* Right: Branch Selector & Refresh Button */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#00838f",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <FeatherIcon icon="map-pin" size={14} className="me-1" />
                          Branch:
                        </span>
                        <Form.Select
                          size="sm"
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          style={{
                            width: "200px",
                            borderColor: "1px solid #4dd0e1",
                            borderRadius: "8px",
                            fontWeight: "300",
                            fontSize: "13px",
                            color: "#006064",
                            backgroundColor: "#f5fcfd",
                          }}
                        >
                          <option value="ALL">All Branches ({branchValues.length})</option>
                          {branchDisplayList.map((b) => (
                            <option key={b.value} value={b.value}>
                              {b.label}
                            </option>
                          ))}
                        </Form.Select>
                      </div>

                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        style={{
                          borderRadius: "8px",
                          borderColor: "#00acc1",
                          color: "#00838f",
                          fontWeight: "500",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          height: "32px",
                          padding: "0 14px",
                        }}
                      >
                        {isRefreshing ? (
                          <Spinner
                            animation="border"
                            size="sm"
                            style={{ width: "12px", height: "12px" }}
                          />
                        ) : (
                          <FeatherIcon icon="refresh-cw" size={13} />
                        )}
                        Refresh
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Key Metric Stat Cards */}
          <Row className="g-3 mb-10">
            {/* Card 1: Total Hospital Certificates */}
            <Col xl={3} md={6} xs={12}>
              <Card
                className="h-100 shadow-sm border-0 position-relative overflow-hidden"
                style={{
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #ffffff, #eff6ff)",
                  borderLeft: "5px solid #2563eb",
                  padding: "3px",
                  boxShadow: "0 4px 15px rgba(37, 99, 235, 0.08)",
                }}
              >
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span
                        className="text-uppercase fw-semibold"
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.5px",
                          color: "#1d4ed8",
                        }}
                      >
                        Hospital Certificates
                      </span>
                      <h3
                        className="fw-bold mb-0 mt-1"
                        style={{ color: "#1e3a8a", fontSize: "22px" }}
                      >
                        {loadingCerts ? (
                          <Spinner animation="border" size="sm" variant="primary" />
                        ) : (
                          `${certStats.total} Uploaded`
                        )}
                      </h3>
                    </div>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#2563eb",
                      }}
                    >
                      <FeatherIcon icon="award" size={22} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-auto pt-5 border-top border-light-subtle">
                    <span style={{ fontSize: "12px", color: "#15803d", fontWeight: "600" }}>
                      <FeatherIcon icon="check-circle" size={13} className="me-1" />
                      {certStats.active} Active ({certStats.total ? Math.round((certStats.active / certStats.total) * 100) : 0}%)
                    </span>
                    <Badge
                      bg="primary"
                      style={{ fontSize: "11px", fontWeight: "600" }}
                    >
                      {certStats.byType.length} Categories
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Card 2: Certificates Action Required */}
            <Col xl={3} md={6} xs={12}>
              <Card
                className="h-100 shadow-sm border-0 position-relative overflow-hidden"
                style={{
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #ffffff, #fffbeb)",
                  borderLeft: "5px solid #f59e0b",
                  padding: "3px",
                  boxShadow: "0 4px 15px rgba(245, 158, 11, 0.08)",
                }}
              >
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span
                        className="text-uppercase fw-semibold"
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.5px",
                          color: "#b45309",
                        }}
                      >
                        Certificates Need Attention
                      </span>
                      <h3
                        className="fw-bold mb-0 mt-1"
                        style={{ color: "#78350f", fontSize: "22px" }}
                      >
                        {loadingCerts ? (
                          <Spinner animation="border" size="sm" variant="warning" />
                        ) : (
                          `${certStats.attentionCount} Certificates`
                        )}
                      </h3>
                    </div>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#d97706",
                      }}
                    >
                      <FeatherIcon icon="alert-triangle" size={22} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-auto pt-5 border-top border-light-subtle">
                    <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "600" }}>
                      {certStats.expired} Expired
                    </span>
                    <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "500" }}>
                      {certStats.expiresSoon} Expiring Soon
                    </span>
                    <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "600" }}>
                      {certStats.expiringToday} Today
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Card 3: Total IPD Overdue Amount */}
            <Col xl={3} md={6} xs={12}>
              <Card
                className="h-100 shadow-sm border-0 position-relative overflow-hidden"
                style={{
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #ffffff, #fff5f5)",
                  borderLeft: "5px solid #ef4444",
                  padding: "3px",
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.08)",
                }}
              >
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span
                        className="text-uppercase fw-semibold"
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.5px",
                          color: "#b91c1c",
                        }}
                      >
                        Total IPD Overdue Amount
                      </span>
                      <h3
                        className="fw-bold mb-0 mt-1"
                        style={{ color: "#991b1b", fontSize: "22px" }}
                      >
                        {loadingIpd ? (
                          <Spinner animation="border" size="sm" variant="danger" />
                        ) : (
                          formatCurrency(ipdStats.totalDueAmount)
                        )}
                      </h3>
                    </div>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#dc2626",
                      }}
                    >
                      <FeatherIcon icon="dollar-sign" size={22} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-auto pt-5 border-top border-light-subtle">
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      &gt;90 Days Overdue Bills
                    </span>
                    <Badge
                      bg="danger"
                      style={{ fontSize: "11px", fontWeight: "600" }}
                    >
                      {formatCompactCurrency(ipdStats.totalDueAmount)}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Card 4: Cashless vs PDC Overdue Breakdown */}
            <Col xl={3} md={6} xs={12}>
              <Card
                className="h-100 shadow-sm border-0 position-relative overflow-hidden"
                style={{
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #ffffff, #f0fdf4)",
                  borderLeft: "5px solid #00acc1",
                  padding: "3px",
                  boxShadow: "0 4px 15px rgba(0, 172, 193, 0.08)",
                }}
              >
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span
                        className="text-uppercase fw-semibold"
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.5px",
                          color: "#006064",
                        }}
                      >
                        Pending Overdue Invoices
                      </span>
                      <h3
                        className="fw-bold mb-0 mt-1"
                        style={{ color: "#004d40", fontSize: "22px" }}
                      >
                        {loadingIpd ? (
                          <Spinner animation="border" size="sm" variant="info" />
                        ) : (
                          `${ipdStats.totalInvoices.toLocaleString("en-IN")} Invoices`
                        )}
                      </h3>
                    </div>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0284c7",
                      }}
                    >
                      <FeatherIcon icon="file-text" size={22} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-auto pt-5 border-top border-light-subtle">
                    <span style={{ fontSize: "11px", color: "#475569" }}>
                      Cashless: <b>{formatCompactCurrency(ipdStats.cashlessAmount)}</b> ({ipdStats.cashlessCount})
                    </span>
                    <span style={{ fontSize: "11px", color: "#e65100" }}>
                      PDC: <b>{formatCompactCurrency(ipdStats.pdcAmount)}</b> ({ipdStats.pdcCount})
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row 1: Donut / Pie Charts */}
          <Row className="g-3 mb-4">
            {/* Pie Chart 1: Hospital Certificates Status */}
            <Col lg={6} xs={12}>
              <Card
                className="h-70 shadow-sm border-0"
                style={{
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #b2ebf2",
                  boxShadow: "0 4px 15px rgba(0, 172, 193, 0.08)",
                  padding: "4px",
                }}
              >
                <Card.Header
                  className="bg-transparent border-0 d-flex justify-content-between align-items-center"
                  style={{ padding: "5px 10px 0 10px" }}
                >
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: "#006064", fontSize: "15px" }}>
                      <FeatherIcon icon="pie-chart" size={16} className="me-2 text-info" />
                      Hospital Certificates Compliance Status
                    </h6>
                    <small className="text-muted" style={{ fontSize: "12px" }}>
                      Breakdown of active, expiring, and expired accreditations
                    </small>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    as={Link}
                    to="/superadmin-hc"
                    style={{
                      textDecoration: "none",
                      fontSize: "12px",
                      color: "#00acc1",
                      fontWeight: "600",
                    }}
                  >
                    View All →
                  </Button>
                </Card.Header>
                <Card.Body style={{ padding: "10px 20px 16px 20px" }}>
                  {loadingCerts ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "290px" }}>
                      <Spinner animation="border" variant="info" />
                    </div>
                  ) : certStats.total === 0 ? (
                    <div className="text-center py-5 text-muted">No certificate records found for selected branch.</div>
                  ) : (
                    <ReactApexChart
                      options={certStatusChart.options}
                      series={certStatusChart.series}
                      type="donut"
                      height={290}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Pie Chart 2: IPD Overdue Amount by Bill Method */}
            <Col lg={6} xs={12}>
              <Card
                className="h-70 shadow-sm border-0"
                style={{
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #b2ebf2",
                  boxShadow: "0 4px 15px rgba(0, 172, 193, 0.08)",
                  padding: "4px",
                }}
              >
                <Card.Header
                  className="bg-transparent border-0 d-flex justify-content-between align-items-center"
                  style={{ padding: "5px 10px 0 10px" }}
                >
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: "#006064", fontSize: "15px" }}>
                      <FeatherIcon icon="credit-card" size={16} className="me-2 text-warning" />
                      IPD Overdue Amount by Payment Method
                    </h6>
                    <small className="text-muted" style={{ fontSize: "12px" }}>
                      Outstanding revenue distribution (Cashless vs PDC)
                    </small>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    as={Link}
                    to="/superadmin-ipd-bills-due-list"
                    style={{
                      textDecoration: "none",
                      fontSize: "12px",
                      color: "#00acc1",
                      fontWeight: "600",
                    }}
                  >
                    View Due Bills →
                  </Button>
                </Card.Header>
                <Card.Body style={{ padding: "10px 20px 16px 20px" }}>
                  {loadingIpd ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "290px" }}>
                      <Spinner animation="border" variant="info" />
                    </div>
                  ) : ipdStats.totalDueAmount === 0 ? (
                    <div className="text-center py-5 text-muted">No overdue IPD bills found for selected branch.</div>
                  ) : (
                    <ReactApexChart
                      options={ipdMethodChart.options}
                      series={ipdMethodChart.series}
                      type="donut"
                      height={290}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Row 2: Bar / Distribution Charts */}
          <Row className="g-3 mb-4">
            {/* Chart 3: Certificates Distribution by Category */}
            <Col lg={6} xs={12}>
              <Card
                className="h-70 shadow-sm border-0"
                style={{
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #b2ebf2",
                  boxShadow: "0 4px 15px rgba(0, 172, 193, 0.08)",
                  padding: "4px",
                }}
              >
                <Card.Header
                  className="bg-transparent border-0 d-flex justify-content-between align-items-center"
                  style={{ padding: "5px 10px 0 10px" }}
                >
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: "#006064", fontSize: "15px" }}>
                      <FeatherIcon icon="award" size={16} className="me-2 text-success" />
                      Certificates by Accreditation Type
                    </h6>
                    <small className="text-muted" style={{ fontSize: "12px" }}>
                      Upload counts across statutory and quality certificate categories
                    </small>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    as={Link}
                    to="/superadmin-hc"
                    style={{
                      textDecoration: "none",
                      fontSize: "12px",
                      color: "#00acc1",
                      fontWeight: "600",
                    }}
                  >
                    View All →
                  </Button>
                </Card.Header>
                <Card.Body style={{ padding: "10px 20px 16px 20px" }}>
                  {loadingCerts ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                      <Spinner animation="border" variant="info" />
                    </div>
                  ) : certStats.byType.length === 0 ? (
                    <div className="text-center py-5 text-muted">No certificates uploaded yet.</div>
                  ) : (
                    <ReactApexChart
                      options={certTypesChart.options}
                      series={certTypesChart.series}
                      type="bar"
                      height={300}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Chart 4: Top Branches by Overdue IPD Amount */}
            <Col lg={6} xs={12}>
              <Card
                className="h-70 shadow-sm border-0"
                style={{
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #b2ebf2",
                  boxShadow: "0 4px 15px rgba(0, 172, 193, 0.08)",
                  padding: "4px",
                }}
              >
                <Card.Header
                  className="bg-transparent border-0 d-flex justify-content-between align-items-center"
                  style={{ padding: "5px 10px 0 10px" }}
                >
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: "#006064", fontSize: "15px" }}>
                      <FeatherIcon icon="bar-chart-2" size={16} className="me-2 text-primary" />
                      Highest IPD Overdue Branches (&gt;90 Days)
                    </h6>
                    <small className="text-muted" style={{ fontSize: "12px" }}>
                      Branches ranked by outstanding recoverable amount
                    </small>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    as={Link}
                    to="/superadmin-ipd-bills-due-list"
                    style={{
                      textDecoration: "none",
                      fontSize: "12px",
                      color: "#00acc1",
                      fontWeight: "600",
                    }}
                  >
                    View Due Bills →
                  </Button>
                </Card.Header>
                <Card.Body style={{ padding: "10px 20px 16px 20px" }}>
                  {loadingIpd ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                      <Spinner animation="border" variant="info" />
                    </div>
                  ) : ipdStats.topBranches.length === 0 ? (
                    <div className="text-center py-5 text-muted">No branch overdue data available.</div>
                  ) : (
                    <ReactApexChart
                      options={topBranchesChart.options}
                      series={topBranchesChart.series}
                      type="bar"
                      height={300}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Container>
      </SimpleBar>
    </div>
  );
}
