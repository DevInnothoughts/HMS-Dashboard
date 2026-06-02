import React, { useState, useEffect, useCallback } from 'react';
import FeatherIcon from 'feather-icons-react';
import SimpleBar from 'simplebar-react';
import { useNavigate } from 'react-router-dom';
import { useSidebarContext } from '../pages/api/useSidebarContext';
import 'font-awesome/css/font-awesome.min.css';
import { decodeJwt } from "../utils/decode-jwt";

export default function DoctorHeader() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [accountType, setAccountType] = useState("");
  const [department, setDepartment] = useState("");

  const [stats, setStats] = useState({
    counts: {
      total: 0,
      new: 0,
      follow: 0,
      postop: 0,
      other: 0,
      ipd: 0
    },
    lists: {
      new: [],
      follow: [],
      postop: [],
      other: [],
      ipd: []
    }
  });

  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showFollowDropdown, setShowFollowDropdown] = useState(false);
  const [showPostopDropdown, setShowPostopDropdown] = useState(false);
  const [showOtherDropdown, setShowOtherDropdown] = useState(false);
  const [showIpdDropdown, setShowIpdDropdown] = useState(false);

  const fetchDoctorStats = useCallback(async () => {
    if (!currentLocation || !doctorId) {
      console.warn('⚠️ [DoctorHeader] fetchDoctorStats skipped — location:', currentLocation, 'doctorId:', doctorId);
      return;
    }
    try {
      const url = `http://194.195.117.79:5100/api/V1/doctor/header-stats?location=${currentLocation}&doctorId=${doctorId}`;
      console.log('📡 [DoctorHeader] Fetching:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('📦 [DoctorHeader] API Response:', JSON.stringify(data));
      if (data.statusCode === 200 && data.data) {
        setStats(data.data);
        console.log('✅ [DoctorHeader] Stats set:', data.data.counts);
      } else {
        console.warn('⚠️ [DoctorHeader] Unexpected response structure:', data);
      }
    } catch (error) {
      console.error("❌ Error fetching doctor header stats:", error);
    }
  }, [currentLocation, doctorId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJwt(token);
      console.log('🔑 [DoctorHeader] JWT Payload:', payload);
      if (payload) {
        if (payload.jobLocation) {
          setCurrentLocation(payload.jobLocation);
        }
        if (payload.userId) {
          setDoctorId(payload.userId);
        }
      }
    } else {
      console.warn('⚠️ [DoctorHeader] No token found in localStorage!');
    }
    setAccountType(localStorage.getItem("accountType") || "");
    setDepartment(localStorage.getItem("department") || "");
  }, []);

  useEffect(() => {
    if (currentLocation && doctorId) {
      fetchDoctorStats();

      const interval = setInterval(fetchDoctorStats, 30000); // Update every 30 seconds

      // Handler for global refresh event
      const handleRefresh = () => {
        fetchDoctorStats(); // Instant update
        setTimeout(fetchDoctorStats, 600); // 1st fallback
        setTimeout(fetchDoctorStats, 1200); // 2nd fallback
      };

      window.addEventListener("refreshApptCounts", handleRefresh);

      return () => {
        clearInterval(interval);
        window.removeEventListener("refreshApptCounts", handleRefresh);
      };
    }
  }, [currentLocation, doctorId, fetchDoctorStats]);

  const handlePatientClick = (app) => {
    // Store in localStorage for cross-page persistence
    localStorage.setItem("autoSelectAppointmentId", app.appointment_id);

    // Dispatch event for instant selection if already on dashboard
    window.dispatchEvent(new CustomEvent("selectAppointment", {
      detail: {
        appointmentId: app.appointment_id,
        patientName: app.patient_name
      }
    }));

    setShowNewDropdown(false);
    setShowFollowDropdown(false);
    setShowPostopDropdown(false);
    setShowOtherDropdown(false);

    navigate("/doctor-dashboard");
  };

  const handleIpdClick = (ipd) => {
    // Store appointment_id for cross-page persistence (same as other patient types)
    localStorage.setItem("autoSelectAppointmentId", ipd.appointment_id);

    // Dispatch event for instant selection if already on dashboard
    window.dispatchEvent(new CustomEvent("selectAppointment", {
      detail: {
        appointmentId: ipd.appointment_id,
        patientName: ipd.patient_name
      }
    }));

    setShowIpdDropdown(false);
    navigate("/doctor-dashboard");
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    document.body.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const { toggleSidebar } = useSidebarContext();

  return (
    <>
      <header className="codex-header">
        <div className="flex-between">
          <div className="header-left d-flex align-items-center">
            {currentLocation && (
              <div className="appointment-summary-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa fa-user-md" style={{ color: '#00838f', fontSize: '14px' }}></i>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#000000ff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Doctor's Today Summary</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#000000ff', fontWeight: '750', marginLeft: '30px' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>

                <div className="appointment-stats" style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8f9fa', padding: '2px 10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #d1d3d4ff' }}>
                    <span style={{ fontSize: '11px', color: '#636c74ff', fontWeight: '700', textTransform: 'uppercase' }}>Total</span>
                    <span style={{ fontSize: '14px', color: '#212529', fontWeight: '800' }}>{stats.counts.total}</span>
                  </div>

                  {/* New Dropdown */}
                  <div
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setShowNewDropdown(true)}
                    onMouseLeave={() => setShowNewDropdown(false)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(2, 132, 199, 0.1)', padding: '2px 10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                      <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase' }}>New</span>
                      <span style={{ fontSize: '14px', color: '#0284c7', fontWeight: '800' }}>{stats.counts.new}</span>
                    </div>

                    {showNewDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '320px',
                        zIndex: 1000,
                        paddingTop: '8px',
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(15px)',
                          borderRadius: '12px',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                          border: '1px solid rgba(2, 132, 199, 0.3)',
                          overflow: 'hidden',
                          animation: 'fadeInUp 0.2s ease-out'
                        }}>
                          <div style={{ padding: '12px 15px', background: 'rgba(2, 132, 199, 0.1)', borderBottom: '1px solid rgba(2, 132, 199, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', fontSize: '11px', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Patients</span>
                              <span style={{ fontSize: '10px', background: '#0284c7', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>{stats.lists.new.length}</span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: '295px' }}>
                            <div style={{ padding: '2px' }}>
                              {stats.lists.new.length > 0 ? (
                                stats.lists.new.map((app, idx) => (
                                  <div key={idx} onClick={() => handlePatientClick(app)} style={{
                                    padding: '12px',
                                    borderBottom: idx === stats.lists.new.length - 1 ? 'none' : '1px solid #f1f5f9',
                                    transition: 'background 0.2s',
                                    borderRadius: '8px', cursor: 'pointer'
                                  }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f0f9ff'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{app.patient_name}</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '1px 6px', borderRadius: '4px' }}>
                                        <i className="fa fa-clock-o" style={{ fontSize: '10px', color: '#64748b' }}></i>
                                        <span style={{ fontSize: '10px', color: '#475569', fontWeight: '700' }}>{app.appointment_time}</span>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fa fa-user-md" style={{ fontSize: '10px', color: '#94a3b8' }}></i>
                                      </div>
                                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{app.doctor_name}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                                  <i className="fa fa-users" style={{ fontSize: '24px', color: '#e2e8f0', marginBottom: '10px', display: 'block' }}></i>
                                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>No New patients for today</span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow Dropdown */}
                  <div
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setShowFollowDropdown(true)}
                    onMouseLeave={() => setShowFollowDropdown(false)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>Follow</span>
                      <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '800' }}>{stats.counts.follow}</span>
                    </div>

                    {showFollowDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '320px',
                        zIndex: 1000,
                        paddingTop: '8px',
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(15px)',
                          borderRadius: '12px',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          overflow: 'hidden',
                          animation: 'fadeInUp 0.2s ease-out'
                        }}>
                          <div style={{ padding: '12px 15px', background: 'rgba(16, 185, 129, 0.1)', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', fontSize: '11px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Follow Patients</span>
                              <span style={{ fontSize: '10px', background: '#10b981', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>{stats.lists.follow.length}</span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: '295px' }}>
                            <div style={{ padding: '2px' }}>
                              {stats.lists.follow.length > 0 ? (
                                stats.lists.follow.map((app, idx) => (
                                  <div key={idx} onClick={() => handlePatientClick(app)} style={{
                                    padding: '12px',
                                    borderBottom: idx === stats.lists.follow.length - 1 ? 'none' : '1px solid #f1f5f9',
                                    transition: 'background 0.2s',
                                    borderRadius: '8px', cursor: 'pointer'
                                  }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#ecfdf5'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{app.patient_name}</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '1px 6px', borderRadius: '4px' }}>
                                        <i className="fa fa-clock-o" style={{ fontSize: '10px', color: '#64748b' }}></i>
                                        <span style={{ fontSize: '10px', color: '#475569', fontWeight: '700' }}>{app.appointment_time}</span>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fa fa-user-md" style={{ fontSize: '10px', color: '#94a3b8' }}></i>
                                      </div>
                                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{app.doctor_name}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                                  <i className="fa fa-users" style={{ fontSize: '24px', color: '#e2e8f0', marginBottom: '10px', display: 'block' }}></i>
                                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>No Follow patients for today</span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Postop Dropdown */}
                  <div
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setShowPostopDropdown(true)}
                    onMouseLeave={() => setShowPostopDropdown(false)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '700', textTransform: 'uppercase' }}>Postop</span>
                      <span style={{ fontSize: '14px', color: '#8b5cf6', fontWeight: '800' }}>{stats.counts.postop}</span>
                    </div>

                    {showPostopDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '320px',
                        zIndex: 1000,
                        paddingTop: '8px',
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(15px)',
                          borderRadius: '12px',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          overflow: 'hidden',
                          animation: 'fadeInUp 0.2s ease-out'
                        }}>
                          <div style={{ padding: '12px 15px', background: 'rgba(139, 92, 246, 0.1)', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', fontSize: '11px', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Postop Patients</span>
                              <span style={{ fontSize: '10px', background: '#8b5cf6', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>{stats.lists.postop.length}</span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: '295px' }}>
                            <div style={{ padding: '2px' }}>
                              {stats.lists.postop.length > 0 ? (
                                stats.lists.postop.map((app, idx) => (
                                  <div key={idx} onClick={() => handlePatientClick(app)} style={{
                                    padding: '12px',
                                    borderBottom: idx === stats.lists.postop.length - 1 ? 'none' : '1px solid #f1f5f9',
                                    transition: 'background 0.2s',
                                    borderRadius: '8px', cursor: 'pointer'
                                  }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f5f3ff'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{app.patient_name}</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '1px 6px', borderRadius: '4px' }}>
                                        <i className="fa fa-clock-o" style={{ fontSize: '10px', color: '#64748b' }}></i>
                                        <span style={{ fontSize: '10px', color: '#475569', fontWeight: '700' }}>{app.appointment_time}</span>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fa fa-user-md" style={{ fontSize: '10px', color: '#94a3b8' }}></i>
                                      </div>
                                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{app.doctor_name}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                                  <i className="fa fa-users" style={{ fontSize: '24px', color: '#e2e8f0', marginBottom: '10px', display: 'block' }}></i>
                                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>No Postop patients for today</span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Other Dropdown */}
                  <div
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setShowOtherDropdown(true)}
                    onMouseLeave={() => setShowOtherDropdown(false)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase' }}>Other</span>
                      <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '800' }}>{stats.counts.other}</span>
                    </div>

                    {showOtherDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '320px',
                        zIndex: 1000,
                        paddingTop: '8px',
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(15px)',
                          borderRadius: '12px',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          overflow: 'hidden',
                          animation: 'fadeInUp 0.2s ease-out'
                        }}>
                          <div style={{ padding: '12px 15px', background: 'rgba(245, 158, 11, 0.1)', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Other Patients</span>
                              <span style={{ fontSize: '10px', background: '#f59e0b', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>{stats.lists.other.length}</span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: '295px' }}>
                            <div style={{ padding: '2px' }}>
                              {stats.lists.other.length > 0 ? (
                                stats.lists.other.map((app, idx) => (
                                  <div key={idx} onClick={() => handlePatientClick(app)} style={{
                                    padding: '12px',
                                    borderBottom: idx === stats.lists.other.length - 1 ? 'none' : '1px solid #f1f5f9',
                                    transition: 'background 0.2s',
                                    borderRadius: '8px', cursor: 'pointer'
                                  }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#fffbeb'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{app.patient_name}</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '1px 6px', borderRadius: '4px' }}>
                                        <i className="fa fa-clock-o" style={{ fontSize: '10px', color: '#64748b' }}></i>
                                        <span style={{ fontSize: '10px', color: '#475569', fontWeight: '700' }}>{app.appointment_time}</span>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fa fa-user-md" style={{ fontSize: '10px', color: '#94a3b8' }}></i>
                                      </div>
                                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{app.doctor_name}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                                  <i className="fa fa-users" style={{ fontSize: '24px', color: '#e2e8f0', marginBottom: '10px', display: 'block' }}></i>
                                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>No Other patients for today</span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* IPD Dropdown */}
                  <div
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setShowIpdDropdown(true)}
                    onMouseLeave={() => setShowIpdDropdown(false)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(217, 70, 239, 0.1)', padding: '2px 10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(217, 70, 239, 0.2)' }}>
                      <span style={{ fontSize: '11px', color: '#d946ef', fontWeight: '700', textTransform: 'uppercase' }}>IPD</span>
                      <span style={{ fontSize: '14px', color: '#d946ef', fontWeight: '800' }}>{stats.counts.ipd || 0}</span>
                    </div>

                    {showIpdDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '320px',
                        zIndex: 1000,
                        paddingTop: '8px',
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(15px)',
                          borderRadius: '12px',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                          border: '1px solid rgba(217, 70, 239, 0.3)',
                          overflow: 'hidden',
                          animation: 'fadeInUp 0.2s ease-out'
                        }}>
                          <div style={{ padding: '12px 15px', background: 'rgba(217, 70, 239, 0.1)', borderBottom: '1px solid rgba(217, 70, 239, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', fontSize: '11px', color: '#d946ef', textTransform: 'uppercase', letterSpacing: '0.5px' }}>IPD Admissions</span>
                              <span style={{ fontSize: '10px', background: '#d946ef', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>{stats.lists.ipd ? stats.lists.ipd.length : 0}</span>
                            </div>
                          </div>
                          <SimpleBar style={{ maxHeight: '295px' }}>
                            <div style={{ padding: '2px' }}>
                              {stats.lists.ipd && stats.lists.ipd.length > 0 ? (
                                stats.lists.ipd.map((app, idx) => (
                                  <div key={idx} onClick={() => handleIpdClick(app)} style={{
                                    padding: '12px',
                                    borderBottom: idx === stats.lists.ipd.length - 1 ? 'none' : '1px solid #f1f5f9',
                                    transition: 'background 0.2s',
                                    borderRadius: '8px', cursor: 'pointer'
                                  }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#fdf4ff'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{app.patient_name}</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '1px 6px', borderRadius: '4px' }}>
                                        <i className="fa fa-hospital-o" style={{ fontSize: '10px', color: '#64748b' }}></i>
                                        <span style={{ fontSize: '10px', color: '#475569', fontWeight: '700' }}>{app.appointment_time || "00:00"}</span>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          <i className="fa fa-bed" style={{ fontSize: '10px', color: '#94a3b8' }}></i>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Room: {app.room_no || "N/A"} ({app.room_type || "N/A"})</span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                                  <i className="fa fa-hospital-o" style={{ fontSize: '24px', color: '#e2e8f0', marginBottom: '10px', display: 'block' }}></i>
                                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>No IPD Admissions today</span>
                                </div>
                              )}
                            </div>
                          </SimpleBar>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>

          <div className="header-right">
            <ul className="nav-iconlist">

              <li className="nav-profile" style={{ display: "flex", alignItems: "center" }}>
                {currentLocation && (
                  <div
                    className="location-badge"
                    style={{
                      marginRight: "0",
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 12px',
                      background: 'rgba(26, 110, 124, 0.14)',
                      border: '1px solid #2a96d087',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    <i className="fa fa-map-marker" style={{ color: '#2a96d0ff', fontSize: '14px' }}></i>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '12px',
                      color: '#2a96d0ff',
                    }}>
                      {currentLocation}
                    </span>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
