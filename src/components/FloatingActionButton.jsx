import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fabRef.current && !fabRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div
      ref={fabRef}
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px'
      }}
    >
      {/* Menu Items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <button
          onClick={() => handleNavigate('/reports/enquiry/add')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'white',
            color: '#e65100',
            border: '2px solid #ff9800',
            borderRadius: '24px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
          className="fab-item"
        >
          <div style={{ backgroundColor: '#ffe0b2', padding: '6px', borderRadius: '50%', display: 'flex' }}>
            <FeatherIcon icon="help-circle" size="14" />
          </div>
          <span>Add Enquiry</span>
        </button>
        <button
          onClick={() => handleNavigate('/appointment/add')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'white',
            color: '#00838f',
            border: '2px solid #00bcd4',
            borderRadius: '24px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
          className="fab-item"
        >
          <div style={{ backgroundColor: '#e0f7fa', padding: '6px', borderRadius: '50%', display: 'flex' }}>
            <FeatherIcon icon="calendar" size="14" />
          </div>
          <span>Add Appointment</span>
        </button>
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#e53935',
          color: 'white',
          border: 'none',
          boxShadow: '0 6px 16px rgba(229, 57, 53, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        <FeatherIcon icon="plus" size="24" />
      </button>

      <style>
        {`
          .fab-item:hover {
            transform: scale(1.05) translateX(5px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </div>
  );
};

export default FloatingActionButton;
