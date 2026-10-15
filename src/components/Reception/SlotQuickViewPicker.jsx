import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Modal,
  Badge,
  Spinner,
  ButtonGroup,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import moment from "moment";
import axios from "axios";

const BASE_URL = "http://194.195.117.79:5100/api";

/**
 * Reusable 15-Minute Slot Picker with Live Capacity & Quick View Modal
 * 
 * Rules:
 * - Option B: Max 3 appointments per 15-minute slot across the clinic location
 * - Counts all patient types (New, Follow-up, Postoperative, etc.) towards the 3-appointment cap
 * - Shows booked and open slots in a quick view modal with visual capacity indicators
 */
export default function SlotQuickViewPicker({
  date,
  location,
  value,
  onChange,
  name = "appointmentTime",
  required = true,
  disabled = false,
  style = {},
  className = "",
  format = "auto", // "12h" | "24h" | "auto"
  showQuickViewButton = true,
  hideDropdown = false,
  slotLimit = 3,
  startTime = "07:00",
  endTime = "23:45",
  intervalMinutes = 15,
}) {
  const [slotAvailability, setSlotAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("all"); // "all" | "morning" | "afternoon" | "evening"

  // Standardize the formatted date string (YYYY-MM-DD)
  const formattedDate = useMemo(() => {
    if (!date) return moment().format("YYYY-MM-DD");
    if (typeof date === "string") {
      // Could be DD-MM-YYYY or YYYY-MM-DD
      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
      }
      return moment(date).format("YYYY-MM-DD");
    }
    return moment(date).format("YYYY-MM-DD");
  }, [date]);

  // Robust location resolution with fallbacks
  const activeLocation = useMemo(() => {
    if (location && location !== "default") return location;
    return (
      localStorage.getItem("jobLocation") ||
      localStorage.getItem("location") ||
      "Baner"
    );
  }, [location]);

  // Fetch slot availability from backend
  const fetchAvailability = useCallback(async () => {
    if (!formattedDate || !activeLocation) return;
    try {
      setLoadingAvailability(true);
      const res = await axios.get(
        `${BASE_URL}/V1/appointment/getSlotAvailability`,
        {
          params: {
            date: formattedDate,
            location: activeLocation,
          },
        }
      );
      // Support all potential response wrapper structures
      const payload = res?.data?.data || res?.data?.description || res?.data;
      if (payload && payload.bookedSlots) {
        setSlotAvailability(payload.bookedSlots);
      } else {
        setSlotAvailability({});
      }
    } catch (err) {
      console.warn("Could not fetch slot availability:", err?.message);
      setSlotAvailability({});
    } finally {
      setLoadingAvailability(false);
    }
  }, [formattedDate, activeLocation]);

  useEffect(() => {
    fetchAvailability();

    // Auto-refresh when an appointment is booked anywhere in the app
    const handleRefresh = () => {
      fetchAvailability();
    };
    window.addEventListener("refreshApptCounts", handleRefresh);
    window.addEventListener("appointmentBooked", handleRefresh);

    return () => {
      window.removeEventListener("refreshApptCounts", handleRefresh);
      window.removeEventListener("appointmentBooked", handleRefresh);
    };
  }, [fetchAvailability]);

  const handleOpenQuickModal = () => {
    fetchAvailability();
    setShowQuickModal(true);
  };

  // Generate all 15-minute slots
  const allSlots = useMemo(() => {
    const slots = [];
    let curr = moment(startTime, "HH:mm");
    const end = moment(endTime, "HH:mm");

    while (curr <= end) {
      const time24 = curr.format("HH:mm");
      const time12 = curr.format("hh:mm A");
      const hour = curr.hour();

      let period = "morning";
      if (hour >= 12 && hour < 17) {
        period = "afternoon";
      } else if (hour >= 17) {
        period = "evening";
      }

      const bookedCount = slotAvailability[time24] || 0;
      const remainingSpots = Math.max(0, slotLimit - bookedCount);
      const isFull = bookedCount >= slotLimit;

      slots.push({
        time24,
        time12,
        period,
        bookedCount,
        remainingSpots,
        isFull,
      });

      curr.add(intervalMinutes, "minutes");
    }
    return slots;
  }, [startTime, endTime, intervalMinutes, slotAvailability, slotLimit]);

  // Summary counts
  const summary = useMemo(() => {
    let availableCount = 0;
    let fullCount = 0;
    let totalBooked = 0;

    allSlots.forEach((slot) => {
      totalBooked += slot.bookedCount;
      if (slot.isFull) {
        fullCount += 1;
      } else {
        availableCount += 1;
      }
    });

    return {
      total: allSlots.length,
      available: availableCount,
      full: fullCount,
      totalBooked,
    };
  }, [allSlots]);

  // Filter slots for Quick View
  const filteredSlots = useMemo(() => {
    if (periodFilter === "all") return allSlots;
    return allSlots.filter((s) => s.period === periodFilter);
  }, [allSlots, periodFilter]);

  // Check if a slot matches the currently selected value
  const isSlotSelected = (slot) => {
    if (!value) return false;
    const cleanValue = String(value).trim().toLowerCase();
    return (
      cleanValue === slot.time24.toLowerCase() ||
      cleanValue === slot.time12.toLowerCase()
    );
  };

  // Determine which format the parent expects
  const resolveTargetValue = (slot) => {
    if (format === "24h") return slot.time24;
    if (format === "12h") return slot.time12;
    // Auto-detect based on current value
    if (value && (value.includes("AM") || value.includes("PM"))) {
      return slot.time12;
    }
    return slot.time24;
  };

  // Handle slot selection
  const handleSelectSlot = (slot) => {
    if (slot.isFull || disabled) return;
    const targetVal = resolveTargetValue(slot);

    // Call onChange with synthetic event or direct value
    if (typeof onChange === "function") {
      onChange({
        target: {
          name,
          value: targetVal,
        },
      });
    }
    setShowQuickModal(false);
  };

  // Dropdown change handler
  const handleDropdownChange = (e) => {
    const selectedVal = e.target.value;
    if (typeof onChange === "function") {
      onChange(e);
    }
  };

  // Determine current value in dropdown (only if matched with a valid 15-minute slot)
  const currentSelectValue = useMemo(() => {
    if (!value) return "";
    const cleanVal = String(value).trim().toLowerCase();
    const matched = allSlots.find(
      (s) =>
        s.time24.toLowerCase() === cleanVal ||
        s.time12.toLowerCase() === cleanVal
    );
    if (matched) {
      return resolveTargetValue(matched);
    }
    return "";
  }, [value, allSlots, format]);

  // Determine display label for selected value (only if matched with a valid 15-minute slot)
  const currentDisplayTime = useMemo(() => {
    if (!value) return "";
    const cleanVal = String(value).trim().toLowerCase();
    const matched = allSlots.find(
      (s) =>
        s.time24.toLowerCase() === cleanVal ||
        s.time12.toLowerCase() === cleanVal
    );
    if (matched) {
      return matched.time12;
    }
    return "";
  }, [value, allSlots]);

  const hasSelectedSlot = Boolean(currentDisplayTime);

  return (
    <div className={`slot-quick-view-picker ${className}`}>
      <div className="d-flex align-items-center gap-1">
        {hideDropdown ? (
          <>
            <input
              type="text"
              name={name}
              value={value || ""}
              required={required}
              onChange={() => { }}
              tabIndex={-1}
              style={{
                position: "absolute",
                opacity: 0,
                width: 1,
                height: 1,
                pointerEvents: "none",
                border: 0,
                padding: 0,
                margin: 0,
              }}
            />
            <Button
              type="button"
              variant="outline-info"
              size="sm"
              onClick={handleOpenQuickModal}
              disabled={disabled}
              title="Open 15-Minute Slot Quick View"
              className="d-flex align-items-center justify-content-between"
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "5px",
                height: "31px",
                width: "100%",
                border: hasSelectedSlot ? "2px solid #10b981" : "2px solid rgb(77, 208, 225)",
                backgroundColor: hasSelectedSlot ? "#f0fdf4" : "#ffffff",
                color: hasSelectedSlot ? "#15803d" : "#00838f",
                ...style,
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FeatherIcon icon={hasSelectedSlot ? "clock" : "calendar"} size="15" />
                <span>
                  {hasSelectedSlot ? (
                    <span>
                      Selected: <strong>{currentDisplayTime}</strong>
                    </span>
                  ) : (
                    <span>Quick View</span>
                  )}
                </span>
              </div>
              <div className="d-flex align-items-center gap-1">
                {hasSelectedSlot && (
                  <span
                    className="badge text-primary border me-1"
                    style={{ fontSize: "10px", padding: "2px 6px", marginLeft: "10px" }}
                  >
                    Change
                  </span>
                )}
                {loadingAvailability ? (
                  <Spinner
                    animation="border"
                    size="sm"
                    style={{ width: 10, height: 10 }}
                  />
                ) : (
                  <Badge
                    bg="success"
                    style={{
                      fontSize: "10px",
                      padding: "3px 7px",
                      color: "#ffffff",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {summary.available} open
                  </Badge>
                )}
              </div>
            </Button>
          </>
        ) : (
          <>
            <Form.Select
              required={required}
              name={name}
              disabled={disabled}
              value={currentSelectValue}
              onChange={handleDropdownChange}
              style={{
                fontSize: "12px",
                borderRadius: "8px",
                flex: 1,
                ...style,
              }}
            >
              <option value="">Select Time Slot</option>
              {allSlots.map((slot) => {
                const optVal = resolveTargetValue(slot);
                const statusLabel = slot.isFull
                  ? `🔴 (FULL - ${slot.bookedCount}/${slotLimit})`
                  : slot.bookedCount === 0
                    ? `🟢 (3 Open)`
                    : `🟡 (${slot.remainingSpots} Open, ${slot.bookedCount} Booked)`;

                return (
                  <option
                    key={slot.time24}
                    value={optVal}
                    disabled={slot.isFull}
                    style={{
                      color: slot.isFull ? "#dc3545" : "#212529",
                      backgroundColor: slot.isFull ? "#fff5f5" : "#ffffff",
                    }}
                  >
                    {slot.time12} {statusLabel}
                  </option>
                );
              })}
            </Form.Select>

            {showQuickViewButton && (
              <Button
                type="button"
                variant="outline-info"
                size="sm"
                onClick={handleOpenQuickModal}
                disabled={disabled}
                title="Open 15-Minute Slot Quick View"
                style={{
                  padding: "4px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                  borderRadius: "8px",
                  height: "36px",
                  border: "1.5px solid rgb(77, 208, 225)",
                }}
              >
                <FeatherIcon icon="calendar" size="14" />
                <span>Quick View</span>
                {loadingAvailability ? (
                  <Spinner
                    animation="border"
                    size="sm"
                    style={{ width: 10, height: 10 }}
                  />
                ) : (
                  <Badge
                    bg="success"
                    style={{
                      fontSize: "10px",
                      padding: "3px 7px",
                      color: "#ffffff",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {summary.available} open
                  </Badge>
                )}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Quick View Modal */}
      <Modal
        show={showQuickModal}
        onHide={() => setShowQuickModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "15px" }}>
          <div>
            <Modal.Title style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "5px" }}>
              <FeatherIcon icon="clock" size="18" className="text-info" />
              15-Minute Appointment Slots — Quick View
            </Modal.Title>
            <div
              className="d-flex align-items-center gap-3"
              style={{ fontSize: "11px", marginTop: "4px", paddingLeft: "4px" }}
            >
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} /> 0/3 Taken (3 Open)
              </span>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" }} /> 1–2 Taken (Open)
              </span>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#dc2626", display: "inline-block" }} /> 3/3 Full (Disabled)
              </span>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body style={{ padding: "5px 5px", maxHeight: "75vh", overflowY: "auto" }}>
          {/* Quick Metrics Bar */}
          <Row className="g-2 mb-3">
            <Col xs={6} md={3}>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #ced2d8ff",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>🕒 Total Slots</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#334155" }}>{summary.total}</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #ace2bfff",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>🟢 Available Slots</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#15803d" }}>{summary.available}</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "#991b1b", fontWeight: 600 }}>🔴 Full Slots (3/3)</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#dc2626" }}>{summary.full}</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "#1e40af", fontWeight: 600 }}>👥 Booked Patients</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#2563eb" }}>{summary.totalBooked}</div>
              </div>
            </Col>
          </Row>

          {/* Time of Day Tabs */}
          <Row className="g-2 mb-3">
            <Col xs={12}>
              <div className="d-flex justify-content-between align-items-center gap-2 flex-nowrap" style={{ overflowX: "auto" }}>
                <ButtonGroup size="sm" className="flex-nowrap" style={{ flexShrink: 0 }}>
                  <Button
                    variant={periodFilter === "all" ? "primary" : "outline-secondary"}
                    onClick={() => setPeriodFilter("all")}
                    style={{ fontSize: "11px", whiteSpace: "nowrap" }}
                  >
                    All Slots ({allSlots.length})
                  </Button>
                  <Button
                    variant={periodFilter === "morning" ? "primary" : "outline-secondary"}
                    onClick={() => setPeriodFilter("morning")}
                    style={{ fontSize: "11px", whiteSpace: "nowrap" }}
                  >
                    🌅 Morning (7 AM - 12 PM)
                  </Button>
                  <Button
                    variant={periodFilter === "afternoon" ? "primary" : "outline-secondary"}
                    onClick={() => setPeriodFilter("afternoon")}
                    style={{ fontSize: "11px", whiteSpace: "nowrap" }}
                  >
                    ☀️ Afternoon (12 PM - 5 PM)
                  </Button>
                  <Button
                    variant={periodFilter === "evening" ? "primary" : "outline-secondary"}
                    onClick={() => setPeriodFilter("evening")}
                    style={{ fontSize: "11px", whiteSpace: "nowrap" }}
                  >
                    🌙 Evening (5 PM - 11:45 PM)
                  </Button>
                </ButtonGroup>

                <Button
                  variant="outline-primary"
                  size="sm"
                  title="Click to refresh"
                  onClick={fetchAvailability}
                  disabled={loadingAvailability}
                  style={{
                    fontSize: "11px",
                    padding: "6px 20px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "36px",
                    marginBottom: "2px",
                  }}
                >
                  <FeatherIcon icon="refresh-cw" size="12" className={loadingAvailability ? "animate-spin" : ""} />
                </Button>
              </div>
            </Col>
          </Row>

          {/* Slots Grid */}
          <Row className="g-2">
            {filteredSlots.map((slot) => {
              const selected = isSlotSelected(slot);
              const { time12, bookedCount, remainingSpots, isFull } = slot;

              // Card styling based on state
              let cardBg = "#ffffff";
              let cardBorder = "#c3cbd4ff";
              let badgeBg = "#dcfce7";
              let badgeColor = "#15803d";
              let badgeText = `${remainingSpots} Open`;

              if (isFull) {
                cardBg = "#fef2f2";
                cardBorder = "#fca5a5";
                badgeBg = "#fee2e2";
                badgeColor = "#b91c1c";
                badgeText = "FULL (3/3)";
              } else if (bookedCount === 2) {
                cardBg = "#fffbeb";
                cardBorder = "#fde68a";
                badgeBg = "#fef3c7";
                badgeColor = "#b45309";
                badgeText = "1 Left";
              }

              if (selected) {
                cardBg = "#eff6ff";
                cardBorder = "#3b82f6";
              }

              return (
                <Col key={slot.time24} xs={6} sm={4} md={3} lg={2}>
                  <div
                    onClick={() => handleSelectSlot(slot)}
                    style={{
                      background: cardBg,
                      border: selected ? "2px solid #2563eb" : `1px solid ${cardBorder}`,
                      borderRadius: "8px",
                      padding: "8px",
                      cursor: isFull ? "not-allowed" : "pointer",
                      opacity: isFull ? 0.6 : 1,
                      transition: "all 0.15s ease-in-out",
                      boxShadow: selected ? "0 0 0 2px rgba(37, 99, 235, 0.2)" : "0 1px 2px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: "72px",
                      userSelect: "none",
                    }}
                    title={
                      isFull
                        ? `Slot ${time12} is fully booked (${bookedCount}/${slotLimit} appointments).`
                        : `Click to select ${time12} (${remainingSpots} spots remaining)`
                    }
                  >
                    <div style={{ fontWeight: 700, fontSize: "12px", color: selected ? "#1d4ed8" : "#1e293b" }}>
                      {time12}
                    </div>

                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        padding: "2px 6px",
                        borderRadius: "10px",
                        marginTop: "4px",
                      }}
                    >
                      {badgeText}
                    </span>

                    {/* 3 mini capacity dots */}
                    <div className="d-flex gap-1 mt-1">
                      {[0, 1, 2].map((dotIdx) => {
                        const isTaken = dotIdx < bookedCount;
                        return (
                          <span
                            key={dotIdx}
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: isTaken ? (isFull ? "#dc2626" : "#f59e0b") : "#10b981",
                              display: "inline-block",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Modal.Body>

      </Modal>
    </div>
  );
}
