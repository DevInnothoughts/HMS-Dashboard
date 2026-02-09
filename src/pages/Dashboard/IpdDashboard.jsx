import React, { useEffect, useState, useCallback, useMemo } from "react";
import FeatherIcon from "feather-icons-react";
import {
    Row,
    Col,
    Card,
    Container,
    Button,
    Badge,
    Spinner,
    Form,
    Modal,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Swal from "sweetalert2";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { decodeJwt } from "../../utils/decode-jwt";

const localizer = momentLocalizer(moment);

const CustomEvent = ({ event }) => (
    <div style={{ fontSize: "11px", lineHeight: "1.2" }}>
        <strong>{event.time}</strong>
        <div
            style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}
        >
            {event.patientName}
        </div>
    </div>
);

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

const BASE_URL = "http://194.195.117.79:5100/api";

export default function IpdDashboard() {
    const [surgeries, setSurgeries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState("default");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentView, setCurrentView] = useState("month");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelComment, setCancelComment] = useState("");
    const calendarRef = React.useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const payload = decodeJwt(token);
            if (payload && payload.jobLocation) {
                setCurrentLocation(payload.jobLocation);
            }
        }
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatSurgeries = useCallback((data) => {
        return data.map((p) => {
            const surgeryDate = moment(p.created_at);
            const startTime = surgeryDate.toDate();
            const endTime = surgeryDate.clone().add(1, "hour").toDate();

            return {
                title: `${surgeryDate.format("hh:mm A")} — ${p.name || "Patient"}`,
                start: startTime,
                end: endTime,
                phone: p.patient_phone,
                date: formatDate(p.created_at),
                time: surgeryDate.format("hh:mm A"),
                patientName: p.name,
                uhid: p.uid,
                age: p.age,
                gender: p.sex,
                patientid: p.patient_id,
                isConfirmed: p.admission_no !== 0 && p.admission_no !== "0" && p.admission_no !== null,
                admissionNo: p.admission_no
            };
        });
    }, []);

    const fetchSurgeries = useCallback(async () => {
        if (currentLocation === "default") return;
        setLoading(true);
        try {
            const fromDate = moment(selectedDate).startOf("month").format("YYYY-MM-DD");
            const toDate = moment(selectedDate).endOf("month").format("YYYY-MM-DD");

            const response = await fetch(
                `${BASE_URL}/V1/ipd/admin/listVerifiedPatients?location=${currentLocation}&from=${fromDate}&to=${toDate}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                const formattedEvents = formatSurgeries(result);
                setSurgeries(formattedEvents);
            }
        } catch (error) {
            console.error("Error fetching surgeries:", error);
        } finally {
            setLoading(false);
        }
    }, [currentLocation, selectedDate, formatSurgeries]);

    useEffect(() => {
        fetchSurgeries();
    }, [fetchSurgeries]);

    const handleCalendarNavigate = (newDate) => setSelectedDate(newDate);
    const handleCalendarView = (newView) => setCurrentView(newView);
    const handleRefreshClick = () => fetchSurgeries();

    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    const handleConfirmSurgery = () => {
        Swal.fire({
            title: "Confirm Surgery?",
            text: "This action will be implemented in the backend later.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                Toast.fire({ icon: "success", title: "Surgery Confirmed (Frontend Only)" });
            }
        });
    };

    const handleCancelSurgery = () => {
        if (!selectedEvent) return;
        setCancelComment("");
        setShowCancelModal(true);
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Cancel Surgery?",
            text: `Reason: ${cancelComment}. This action will be implemented in the backend later.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Cancel",
            cancelButtonText: "No",
            confirmButtonColor: "#d33",
        }).then((result) => {
            if (result.isConfirmed) {
                setShowCancelModal(false);
                setCancelComment("");
                Toast.fire({ icon: "success", title: "Surgery Cancelled (Frontend Only)" });
            }
        });
    };

    const eventStyleGetter = useCallback((event) => {
        return {
            style: {
                backgroundColor: "#1eb3caff",
                borderRadius: "4px",
                border: "none",
                color: "white",
                display: "block",
            },
        };
    }, []);

    const SurgeryDetailsCard = () => {
        if (!selectedEvent) {
            return (
                <div className="text-center py-5">
                    <FeatherIcon
                        icon="layers"
                        size={45}
                        className="text-muted opacity-25 mb-3"
                    />
                    <p className="text-muted" style={{ padding: "5px" }}>
                        Select a surgery entry to view the patient detail and status.
                    </p>
                </div>
            );
        }

        return (
            <div className="clinical-card" style={{ margin: "10px" }}>
                <div className="clinical-body">
                    <div className="data-item-inline mt-4">
                        <label>
                            <FeatherIcon icon="calendar" size={14} /> Surgery Date:
                        </label>
                        <span className="data-value fw-bold">
                            {selectedEvent.date}
                        </span>
                    </div>

                    <div className="data-item-inline">
                        <label>
                            <FeatherIcon icon="hash" size={14} /> UHID No:
                        </label>
                        <span className="data-value fw-bold">{selectedEvent.uhid}</span>
                    </div>

                    <div className="data-item-inline">
                        <label>
                            <FeatherIcon icon="user" size={14} />
                            Patient Name:
                        </label>
                        <span className="data-value fw-bold">{selectedEvent.patientName}</span>
                    </div>

                    <div className="data-item-inline">
                        <label>
                            <FeatherIcon icon="phone" size={14} /> Contact No:
                        </label>
                        <span className="data-value fw-bold">{selectedEvent.phone}</span>
                    </div>
                    <div className="data-item-inline">
                        <label>
                            <FeatherIcon icon="info" size={14} /> Age/Gender:
                        </label>
                        <span className="data-value fw-bold">
                            {selectedEvent.age} / {selectedEvent.gender}
                        </span>
                    </div>
                </div>

                <div
                    className="mb-3"
                    style={{ borderTop: "1px solid #a3b1b4ff" }}
                ></div>

                <div className="clinical-actions pt-2">
                    <div className="d-grid gap-1">
                        <Button
                            variant="primary"
                            className="confirm-btn"
                            style={{ borderRadius: "10px" }}
                            onClick={handleConfirmSurgery}
                        >
                            <FeatherIcon icon="check-circle" size={16} className="me-1" />{" "}
                            Confirm Surgery
                        </Button>
                        <Button
                            variant="danger"
                            className="btn-sm border-0 mt-1"
                            style={{ borderRadius: "10px" }}
                            onClick={handleCancelSurgery}
                        >
                            <FeatherIcon icon="x-circle" size={14} className="me-1" /> Cancel
                            Surgery
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className="themebody-wrap"
            style={{
                background: "linear-gradient(to right, #e0f7fa, #80deea)",
                minHeight: "100vh",
            }}
        >
            <style>{`
.sidebar-wrapper, 
.header-wrapper, 
.page-main-header { 
    z-index: 9999 !important; 
}

.theme-body { 
    position: relative; 
    z-index: 1; 
}

.dashboard-header-bar {
    background: #fff; 
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.03); 
    margin-bottom: 10px;
    border: 2px solid rgb(77, 208, 225);
    padding: 1px;
    position: relative;
    z-index: 5;
}

.legend-title { 
    font-size: 7px; 
    color: #1eb3caff; 
    font-weight: 700; 
    margin-bottom: 5px; 
    letter-spacing: 0.4px; 
    text-transform: uppercase;
}

.legend-item { 
    display: flex; 
    align-items: center; 
    margin-right: 22px; 
    font-size: 13px; 
    font-weight: 600; 
    color: rgb(0, 0, 0); 
}

.dot { 
    width: 9px; 
    height: 9px; 
    border-radius: 50%; 
    margin-right: 6px; 
}

.rbc-calendar { 
    background: #fff; 
    border-radius: 12px; 
    padding: 3px;
    position: relative;
    z-index: 1;
    overflow: visible !important; 
}

.rbc-header { 
    padding: 12px 0 !important; 
    font-weight: 7000 !important; 
    color: rgb(0, 0, 0) !important; 
    border-bottom: 2px solid #f1f5f9 !important; 
}

.rbc-show-more { 
    color: #016f69ff !important; 
    background: #b0eff3ff !important; 
    border-radius: 4px !important; 
    font-weight: 900 !important; 
    font-size: 11px !important; 
    padding: 2px 6px !important; 
}

.rbc-overlay { 
    position: absolute !important;
    z-index: 10000 !important; 
    background: #fff;
    border: 1px solid #ccc;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.rbc-row-segment .rbc-show-more {
    margin-top: 2px;
    display: block;
    text-align: center;
}

.rbc-month-row {
    overflow: visible !important;
}

.clinical-header-centered {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
}

.patient-name { 
    margin: 5px 0; 
    font-weight: 700; 
    color: #0447a5ff; 
    font-size: 15px;
}

.data-item-inline {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
}

.data-item-inline label {
    display: flex;
    align-items: center;
    width: 130px; 
    color: #575d66ff;
    font-weight: 600;
    margin-bottom: 0;
}

.data-item-inline label svg { margin-right: 9px; }

.confirm-btn {
    background-color: #1eb3caff;
    border: none;
    padding: 10px;
    font-weight: 600;
}

.confirm-btn:hover {
    background-color: #178aaeff;
}
                `}</style>
            <PageBreadcrumb pagename="IPD Dashboard" />
            <div className="theme-body">
                <Container fluid>
                    <div className="dashboard-header-bar" style={{ marginTop: "10px" }}>
                        <Row className="align-items-center">
                            <Col lg={8}>
                                <div className="legend-title">
                                    <h4 className="fw-bold mb-10">
                                        Patient Surgery Statistics for {moment(selectedDate).format("MMMM YYYY")}
                                    </h4>
                                </div>
                                <div className="d-flex align-items-center flex-wrap">
                                    <div className="legend-item">
                                        <span
                                            className="dot"
                                            style={{ background: "#1eb3caff" }}
                                        ></span>
                                        Surgery Patient <span className="cnt ms-1 text-muted">({surgeries.length || 0})</span>
                                    </div>
                                </div>
                            </Col>
                            <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
                                <Button
                                    variant="primary"
                                    onClick={handleRefreshClick}
                                    style={{
                                        height: "35px",
                                        display: "inline-flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontSize: "14px",
                                        borderRadius: "8px"
                                    }}
                                >
                                    <FeatherIcon icon="refresh-cw" size={14} className="me-2" />
                                    Refresh
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col xxl={8} xl={8} lg={12} className="mb-4">
                            <Card
                                className="border-0 shadow-sm"
                                style={{ borderRadius: "10px" }}
                            >
                                <Card.Body
                                    className="p-3"
                                    style={{
                                        border: "2px solid rgb(77, 208, 225)",
                                        borderRadius: "10px",
                                    }}
                                >
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="info" />
                                        </div>
                                    ) : (
                                        <Calendar
                                            ref={calendarRef}
                                            localizer={localizer}
                                            events={surgeries}
                                            date={selectedDate}
                                            view={currentView}
                                            onNavigate={handleCalendarNavigate}
                                            onSelectEvent={handleEventClick}
                                            onView={handleCalendarView}
                                            eventPropGetter={eventStyleGetter}
                                            components={{ event: CustomEvent }}
                                            style={{ height: 580 }}
                                            popup={true}
                                        />
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xxl={4} xl={4} lg={12}>
                            <Card
                                className="shadow-sm border-0"
                                style={{
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    border: "2px solid rgb(77, 208, 225)",
                                }}
                            >
                                <Card.Header
                                    className="bg-white py-3 d-flex justify-content-center align-items-center"
                                    style={{ borderBottom: "1px solid rgb(77, 208, 225)" }}
                                >
                                    <div className="d-flex align-items-center justify-content-center w-100">
                                        <div
                                            className="d-flex align-items-center justify-content-center me-1"
                                            style={{
                                                background: "#e0f2fe",
                                                width: "27px",
                                                height: "27px",
                                                borderRadius: "10px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <FeatherIcon
                                                icon="clipboard"
                                                size={16}
                                                className="text-primary"
                                            />
                                        </div>
                                        <h5
                                            className="mb-0 fw-bold"
                                            style={{
                                                color: "#3f444bff",
                                                whiteSpace: "nowrap",
                                                fontSize: "16px",
                                                padding: "7px"
                                            }}
                                        >
                                            Surgery Detail
                                        </h5>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <SurgeryDetailsCard />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal
                show={showCancelModal}
                onHide={() => setShowCancelModal(false)}
                centered
            >
                <Modal.Header closeButton style={{
                    backgroundColor: "#67c5cfff",
                    borderBottom: "2px solid #1a5b61ff",
                    padding: "7px 15px",
                }}>
                    <Modal.Title style={{
                        color: "#1a5b61ff",
                        fontWeight: "600",
                        fontSize: "1.1rem",
                    }}>
                        REASON OF CANCELLATION
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-1 pt-0">
                    <Form style={{ padding: "10px" }} onSubmit={handleCancelSubmit}>
                        <Form.Group>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={cancelComment}
                                onChange={(e) => setCancelComment(e.target.value)}
                                placeholder="State the reason for cancellation (e.g., patient request, reschedule)..."
                                className="p-5"
                                style={{
                                    border: "1px solid #008cc8ff",
                                    borderRadius: "10px",
                                    marginBottom: "10px"
                                }}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button
                                variant="danger"
                                type="submit"
                                className="fw-bold px-4"
                                style={{ borderRadius: "10px", padding: "10px 0", minWidth: "150px" }}
                            >
                                Confirm & Cancel
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}
