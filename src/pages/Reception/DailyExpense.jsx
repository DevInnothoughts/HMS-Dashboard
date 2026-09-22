import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
  Spinner,
  Button,
  Modal,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import { decodeJwt } from "../Utility/decode-jwt";
import FeatherIcon from "feather-icons-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Swal from "sweetalert2";

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

const DailyExpense = () => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [currentLocation, setCurrentLocation] = useState("");
  const [userName, setUserName] = useState("");
  const [summary, setSummary] = useState({
    totalAdvance: 0,
    totalExpenses: 0,
    remainingBalance: 0,
  });

  // Modal states for Adding Expenses
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpenses, setNewExpenses] = useState([
    { date: new Date(), purpose: "", amount: "" },
  ]);

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        if (payload.jobLocation) {
          setCurrentLocation(payload.jobLocation);
        }
        if (payload.userName) {
          setUserName(payload.userName);
        } else if (payload.name) {
          setUserName(payload.name);
        }
      }
    }
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  const fetchExpensesData = useCallback(async () => {
    if (!currentLocation || currentLocation === "default") return;

    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/managereports/dailyexpense-status`);
      const finalFromDate = fromDate
        ? moment(fromDate).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD");
      const finalToDate = toDate
        ? moment(toDate).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD");
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const resJson = await response.json();
      if (response.ok && resJson.data) {
        const responseData = resJson.data;
        const formattedData = (
          Array.isArray(responseData.data) ? responseData.data : []
        ).map((item) => ({
          ...item,
          formatted_expenseamt: `₹ ${Math.round(parseFloat(item.expenseamt || 0)).toLocaleString("en-IN")}`,
        }));
        setExpenses(formattedData);
        setSummary(
          responseData.summary || {
            totalAdvance: 0,
            totalExpenses: 0,
            remainingBalance: 0,
          },
        );
      } else {
        setExpenses([]);
        setSummary({ totalAdvance: 0, totalExpenses: 0, remainingBalance: 0 });
      }
    } catch (error) {
      console.error("❌ Error fetching expenses:", error);
      setExpenses([]);
      setSummary({ totalAdvance: 0, totalExpenses: 0, remainingBalance: 0 });
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, currentLocation]);

  // Load/Refetch data whenever location or selected dates change
  useEffect(() => {
    if (currentLocation && currentLocation !== "default") {
      fetchExpensesData();
    }
  }, [currentLocation, fetchExpensesData]);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    return moment(dateStr).format("DD-MM-YYYY");
  };

  // Add Row inside modal
  const handleAddRow = () => {
    setNewExpenses([
      ...newExpenses,
      { date: new Date(), purpose: "", amount: "" },
    ]);
  };

  // Delete Row inside modal
  const handleDeleteRow = (index) => {
    if (newExpenses.length > 1) {
      setNewExpenses(newExpenses.filter((_, i) => i !== index));
    }
  };

  // Change fields inside modal
  const handleFieldChange = (index, field, value) => {
    const updated = [...newExpenses];
    updated[index][field] = value;
    setNewExpenses(updated);
  };

  // Validate and restrict input in amount field to positive integers only with commas formatting
  const handleAmountChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    const formattedValue = cleanValue
      ? Number(cleanValue).toLocaleString("en-IN")
      : "";
    const updated = [...newExpenses];
    updated[index].amount = formattedValue;
    setNewExpenses(updated);
  };

  // Save dynamically added expenses to backend
  const handleSaveExpenses = async () => {
    // Validate
    for (let i = 0; i < newExpenses.length; i++) {
      const exp = newExpenses[i];
      if (!exp.purpose.trim()) {
        Swal.fire(
          "Validation Error",
          `Please enter a purpose for Row ${i + 1}`,
          "warning",
        );
        return;
      }
      const rawAmount = exp.amount ? exp.amount.replace(/,/g, "") : "";
      if (!rawAmount || parseInt(rawAmount) <= 0) {
        Swal.fire(
          "Validation Error",
          `Please enter a valid amount for Row ${i + 1}`,
          "warning",
        );
        return;
      }
    }

    const totalEnteredAmount = newExpenses.reduce((sum, exp) => {
      const rawAmt = exp.amount ? exp.amount.replace(/,/g, "") : "0";
      return sum + (parseInt(rawAmt) || 0);
    }, 0);

    if (totalEnteredAmount > summary.remainingBalance) {
      Swal.fire(
        "Warning",
        `Total entered amount (₹ ${totalEnteredAmount.toLocaleString("en-IN")}) exceeds the remaining balance (₹ ${Math.round(summary.remainingBalance).toLocaleString("en-IN")})!`,
        "warning",
      );
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/V1/managereports/dailyexpense?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            expenses: newExpenses.map((exp) => ({
              date: moment(exp.date).format("YYYY-MM-DD"),
              purpose: exp.purpose,
              amount: parseInt(exp.amount.replace(/,/g, "")),
            })),
            madeBy: userName,
          }),
        },
      );

      const resJson = await response.json();
      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: resJson.message || "Expenses saved successfully!",
        });
        setShowAddModal(false);
        // Refresh list
        fetchExpensesData();
      } else {
        Swal.fire(
          "Error",
          resJson.message || "Failed to save expenses.",
          "error",
        );
      }
    } catch (err) {
      console.error("Error saving expenses:", err);
      Swal.fire(
        "Error",
        "An unexpected error occurred while saving expenses.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this expense record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${BASE_URL}/V1/managereports/dailyexpense?location=${currentLocation}&id=${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const resJson = await response.json();
          if (response.ok) {
            Toast.fire({
              icon: "success",
              title: resJson.message || "Expense deleted successfully",
            });
            fetchExpensesData();
          } else {
            Swal.fire(
              "Error",
              resJson.message || "Failed to delete expense.",
              "error",
            );
          }
        } catch (error) {
          console.error("Delete Error:", error);
          Swal.fire(
            "Error",
            "An unexpected error occurred while deleting the expense.",
            "error",
          );
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleAdvanceAmountChange = (val) => {
    const clean = val.replace(/,/g, "");
    if (/^\d*$/.test(clean)) {
      setAdvanceAmount(clean ? parseInt(clean).toLocaleString("en-IN") : "");
    }
  };

  const handleSaveFunds = async (e) => {
    if (e) e.preventDefault();
    const cleanAmt = advanceAmount.replace(/,/g, "");
    if (!cleanAmt || parseInt(cleanAmt) <= 0) {
      Swal.fire(
        "Validation Error",
        "Please enter a valid advance amount.",
        "warning",
      );
      return;
    }

    Swal.fire({
      title: "Confirm Add Funds",
      html: `Are you sure you want to add <strong>₹ ${parseInt(cleanAmt).toLocaleString("en-IN")}</strong>?<br/><span style="color: #d32f2f; font-weight: bold;">Warning: Once added, this entry cannot be edited or deleted. Please add carefully.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Yes, add it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${BASE_URL}/V1/managereports/expense-advance?location=${currentLocation}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                date: moment().format("YYYY-MM-DD"),
                amount: parseInt(cleanAmt),
              }),
            },
          );

          const resJson = await response.json();
          if (response.ok) {
            Toast.fire({
              icon: "success",
              title: "Funds added successfully!",
            });
            setShowAddFundsModal(false);
            setAdvanceAmount("");
            fetchExpensesData();
          } else {
            Swal.fire(
              "Error",
              resJson.message || "Failed to add funds.",
              "error",
            );
          }
        } catch (err) {
          console.error("Error saving funds:", err);
          Swal.fire(
            "Error",
            "An unexpected error occurred while saving funds.",
            "error",
          );
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const renderHeader = () => {
    return (
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
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
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
                onChange={(e) => setRows(Number(e.target.value))}
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
              style={{
                display: "flex",
                alignItems: "center",
                margin: 0,
              }}
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
              <span className="p-input-icon-left">
                <InputText
                  value={searchText}
                  onChange={onGlobalFilterChange}
                  placeholder="Global Search..."
                  className="p-inputtext-sm"
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
              </span>
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
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#00838f",
                  marginBottom: "3px",
                  textAlign: "left",
                }}
              >
                From Date
              </div>
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select from date"
                customInput={
                  <Form.Control
                    style={{
                      padding: "5px 8px",
                      fontSize: "12px",
                      height: "30px",
                    }}
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
                  textAlign: "left",
                }}
              >
                To Date
              </div>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select to date"
                customInput={
                  <Form.Control
                    style={{
                      padding: "5px 8px",
                      fontSize: "12px",
                      height: "30px",
                    }}
                  />
                }
              />
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                const today = new Date();
                setFromDate(today);
                setToDate(today);
                setFilters({
                  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                });
                setSearchText("");
              }}
              style={{
                backgroundColor: "#ff9800",
                border: "none",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "500",
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                marginTop: "15px",
              }}
            >
              <FeatherIcon icon="filter" size={12} className="me-1" />
              Clear Filter
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const formatValue = (val) => {
    if (
      val === null ||
      val === undefined ||
      val === "" ||
      val === 0 ||
      val === "0"
    ) {
      return "-";
    }
    return val;
  };

  const header = renderHeader();

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
      <style>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
        }
      `}</style>
      <PageBreadcrumb pagename="Daily Expense List" />

      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          {/* Table Card */}
          <Row>
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "10px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1.5px solid #00bcd4",
                  margin: "10px -10px 12px -10px",
                }}
              >
                <Card.Header
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd",
                    borderBottom: "2px solid #0288d1",
                    padding: "0.6rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Daily Expense List</h4>
                  {/* Center: Remaining Balance in Capsule styling with Add option */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor:
                        summary.remainingBalance <= 1000
                          ? "#d32f2f"
                          : "#2e7d32",
                      borderRadius: "50px",
                      padding: "8px 16px",
                      fontSize: "14px",
                      fontWeight: "400",
                      color: "white",
                      margin: "0 auto",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {summary.remainingBalance <= 1000 ? (
                      <FeatherIcon
                        icon="alert-triangle"
                        size={15}
                        style={{ marginRight: "6px" }}
                      />
                    ) : (
                      <FeatherIcon
                        icon="credit-card"
                        size={15}
                        style={{ marginRight: "6px" }}
                      />
                    )}
                    <span style={{ marginRight: "6px", fontWeight: "500" }}>
                      {summary.remainingBalance <= 1000
                        ? "Warning! Remaining Balance:"
                        : "Remaining Balance:"}
                    </span>
                    <span style={{ color: "white", fontWeight: "800" }}>
                      ₹{" "}
                      {Math.round(summary.remainingBalance).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                    <span
                      style={{
                        cursor: "pointer",
                        marginLeft: "8px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        borderRadius: "50%",
                        padding: "4px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => {
                        setAdvanceAmount("");
                        setShowAddFundsModal(true);
                      }}
                      title="Add Funds"
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.4)";
                        e.currentTarget.style.transform = "scale(1.15)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.25)";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <FeatherIcon
                        icon="plus"
                        size={13}
                        style={{ strokeWidth: 3 }}
                      />
                    </span>
                  </div>

                  <button
                    className="btn btn-warning btn-sm"
                    style={{
                      height: "35px",
                      borderColor: "#ffc107",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      padding: "0 15px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                    onClick={() => {
                      setNewExpenses([
                        { date: new Date(), purpose: "", amount: "" },
                      ]);
                      setShowAddModal(true);
                    }}
                  >
                    <FeatherIcon icon="plus" size={16} /> Add Expense Entry
                  </button>
                </Card.Header>
                <Card.Body style={{ marginTop: "-6px", padding: "5px" }}>
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
                      value={expenses}
                      paginator
                      rows={rows}
                      first={first}
                      onPage={(e) => {
                        setFirst(e.first);
                        setRows(e.rows);
                      }}
                      filters={filters}
                      globalFilterFields={[
                        "date",
                        "reason",
                        "formatted_expenseamt",
                      ]}
                      header={header}
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      emptyMessage={
                        <div
                          style={{
                            textAlign: "center",
                            padding: "10px",
                            fontWeight: "bold",
                          }}
                        >
                          No records found.
                        </div>
                      }
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
                      responsiveLayout="scroll"
                    >
                      <Column
                        header="Sr No"
                        body={(rowData, { rowIndex }) => rowIndex + 1}
                        headerClassName="datatable-header-center"
                        headerStyle={{ fontWeight: "bold" }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "130px",
                        }}
                      />
                      <Column
                        field="date"
                        header="Date"
                        body={(rowData) =>
                          formatValue(formatDateDisplay(rowData.date))
                        }
                        headerClassName="datatable-header-center"
                        headerStyle={{ fontWeight: "bold" }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "160px",
                        }}
                      />
                      <Column
                        field="reason"
                        header="Purpose"
                        body={(rowData) => formatValue(rowData.reason)}
                        headerClassName="datatable-header-center"
                        headerStyle={{ fontWeight: "bold" }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          minWidth: "200px",
                        }}
                      />
                      <Column
                        field="expenseamt"
                        header="Amount"
                        body={(rowData) =>
                          `₹ ${Math.round(parseFloat(rowData.expenseamt || 0)).toLocaleString("en-IN")}`
                        }
                        headerClassName="datatable-header-center"
                        headerStyle={{ fontWeight: "bold" }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "250px",
                        }}
                      />
                      <Column
                        header="Action"
                        headerClassName="datatable-header-center"
                        headerStyle={{ fontWeight: "bold" }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "120px",
                        }}
                        body={(rowData) => {
                          const isToday = moment(rowData.date).isSame(
                            moment(),
                            "day",
                          );
                          return (
                            <div className="d-flex align-items-center justify-content-center">
                              <Button
                                style={{
                                  borderRadius: "8px",
                                  cursor: isToday ? "pointer" : "not-allowed",
                                }}
                                onClick={() =>
                                  isToday && handleDeleteClick(rowData.id)
                                }
                                disabled={!isToday}
                                className="btn btn-extra-small btn-icon"
                                variant={isToday ? "danger" : "secondary"}
                                title={
                                  isToday
                                    ? "Delete Expense"
                                    : "Cannot delete previous date expenses"
                                }
                              >
                                <FeatherIcon icon="trash-2" size={14} />
                              </Button>
                            </div>
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
      </SimpleBar>

      {/* Add Entry Modal Form */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px",
          }}
        >
          <Modal.Title
            style={{
              color: "#006064",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FeatherIcon icon="plus" size={20} />
            Add Expense Entry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "15px" }}>
          {newExpenses.map((exp, index) => (
            <Row
              key={index}
              className="align-items-center mb-3 p-3 rounded position-relative"
            >
              <Col md={2} className="mb-2 mb-md-0">
                <Form.Label className="small mb-3" style={{ fontSize: "13px" }}>
                  Date
                </Form.Label>
                <DatePicker
                  selected={exp.date ? new Date(exp.date) : new Date()}
                  onChange={(date) => handleFieldChange(index, "date", date)}
                  dateFormat="dd-MM-yyyy"
                  minDate={moment().subtract(1, "day").toDate()}
                  maxDate={new Date()}
                  customInput={
                    <Form.Control
                      readOnly
                      onKeyDown={(e) => e.preventDefault()}
                      style={{
                        border: "1px solid #90caf9",
                        fontSize: "12px",
                        fontWeight: "500",
                        height: "35px",
                        cursor: "pointer",
                      }}
                    />
                  }
                />
              </Col>
              <Col md={5} className="mb-2 mb-md-0">
                <Form.Label className="small mb-3" style={{ fontSize: "13px" }}>
                  Purpose <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter purpose"
                  value={exp.purpose}
                  onChange={(e) =>
                    handleFieldChange(index, "purpose", e.target.value)
                  }
                  style={{
                    fontSize: "12px",
                    height: "35px",
                    border: "1px solid #90caf9",
                  }}
                  required
                />
              </Col>
              <Col md={3} className="mb-2 mb-md-0">
                <Form.Label className="small mb-3" style={{ fontSize: "13px" }}>
                  Amount <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <InputGroup style={{ height: "35px" }}>
                  <InputGroup.Text
                    style={{
                      fontSize: "12px",
                      border: "1px solid #90caf9",
                      borderRight: "none",
                      backgroundColor: "#e0f7fa",
                    }}
                  >
                    ₹
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter amount"
                    value={exp.amount}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    style={{
                      fontSize: "12px",
                      height: "35px",
                      border: "1px solid #90caf9",
                      borderLeft: "none",
                    }}
                    required
                  />
                </InputGroup>
              </Col>
              <Col md={2} className="mb-2 mb-md-0">
                <Form.Label
                  className="small mb-3 d-block"
                  style={{ fontSize: "11px" }}
                >
                  &nbsp;
                </Form.Label>
                <div className="d-flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteRow(index)}
                    disabled={newExpenses.length <= 1}
                    style={{
                      borderRadius: "6px",
                      height: "35px",
                      width: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    title="Delete Row"
                  >
                    <FeatherIcon icon="trash-2" size={16} />
                  </Button>
                  {index === newExpenses.length - 1 && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleAddRow}
                      style={{
                        borderRadius: "6px",
                        height: "35px",
                        width: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                      title="Add Row"
                    >
                      <FeatherIcon icon="plus" size={16} />
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          ))}
        </Modal.Body>
        <Modal.Footer
          style={{
            backgroundColor: "#f1f4f6",
            padding: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              flex: 1,
              marginRight: "15px",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            {newExpenses.reduce(
              (sum, exp) =>
                sum +
                (parseInt(exp.amount ? exp.amount.replace(/,/g, "") : "0") ||
                  0),
              0,
            ) > summary.remainingBalance && (
              <Alert
                variant="danger"
                className="mb-0"
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 10px",
                  margin: 0,
                  width: "100%",
                  maxWidth: "500px",
                }}
              >
                <FeatherIcon
                  icon="alert-triangle"
                  size={14}
                  style={{ flexShrink: 0 }}
                />
                <span>
                  Warning: Entered ₹{" "}
                  {newExpenses
                    .reduce(
                      (sum, exp) =>
                        sum +
                        (parseInt(
                          exp.amount ? exp.amount.replace(/,/g, "") : "0",
                        ) || 0),
                      0,
                    )
                    .toLocaleString("en-IN")}{" "}
                  amount exceeds remaining balance ₹{" "}
                  {Math.round(summary.remainingBalance).toLocaleString("en-IN")}
                  .
                </span>
              </Alert>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              style={{
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                padding: "10px 12px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveExpenses}
              disabled={loading}
              style={{
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                padding: "12px 35px",
                backgroundColor: "#00bcd4",
                borderColor: "#00bcd4",
              }}
            >
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Add Expense Funds Modal */}
      <Modal
        show={showAddFundsModal}
        onHide={() => setShowAddFundsModal(false)}
        size="md"
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px",
          }}
        >
          <Modal.Title
            style={{
              color: "#006064",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FeatherIcon icon="plus" size={20} />
            Add Advance Amount
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveFunds}>
          <Modal.Body style={{ padding: "15px" }}>
            <Row className="mb-3">
              <Col md={5}>
                <Form.Label className="small mb-2" style={{ fontSize: "13px" }}>
                  Date
                </Form.Label>
                <Form.Control
                  type="text"
                  value={moment().format("DD-MM-YYYY")}
                  readOnly
                  style={{
                    backgroundColor: "#e9ecef",
                    border: "1px solid #90caf9",
                    cursor: "not-allowed",
                    fontSize: "12px",
                    fontWeight: "500",
                    height: "35px",
                  }}
                />
              </Col>
              <Col md={7}>
                <Form.Label className="small mb-2" style={{ fontSize: "13px" }}>
                  Advance Amount <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <InputGroup style={{ height: "35px" }}>
                  <InputGroup.Text
                    style={{
                      fontSize: "12px",
                      border: "1px solid #90caf9",
                      borderRight: "none",
                      backgroundColor: "#e0f7fa",
                    }}
                  >
                    ₹
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter advance amount"
                    value={advanceAmount}
                    onChange={(e) => handleAdvanceAmountChange(e.target.value)}
                    style={{
                      border: "1px solid #90caf9",
                      borderLeft: "none",
                      fontSize: "12px",
                      fontWeight: "500",
                      height: "35px",
                    }}
                    required
                  />
                </InputGroup>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer
            style={{
              backgroundColor: "#f1f4f6",
              padding: "8px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setShowAddFundsModal(false)}
              style={{
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                padding: "12px 12px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              style={{
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                padding: "12px 35px",
                backgroundColor: "#00bcd4",
                borderColor: "#00bcd4",
              }}
            >
              {loading ? "Adding..." : "Add"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DailyExpense;
