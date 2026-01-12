import React, { useState } from 'react';

const DateInput = ({
    label,
    name,
    value,
    onChange,
    required = false,
    allowFuture = false,
    error = ''
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const validate = (val) => {
        if (required && val === '') {
            return `${label} is required`;
        }

        if (val !== '' && !allowFuture) {
            const selectedDate = new Date(val);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate > today) {
                return 'Future dates are not allowed';
            }
        }

        return '';
    };

    const handleBlur = () => {
        setTouched(true);
        const validationError = validate(value);
        setLocalError(validationError);
    };

    const handleChange = (e) => {
        onChange(e);
        if (touched) {
            const validationError = validate(e.target.value);
            setLocalError(validationError);
        }
    };

    const displayError = error || localError;

    return (
        <div className="form-field" style={{ marginBottom: '15px' }}>
            <label
                htmlFor={name}
                className="fw-bold text-muted small uppercase mb-1 d-block"
                style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
            >
                {label} {required && <span className="text-danger">*</span>}
            </label>
            <input
                type="date"
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                required={required}
                className={`form-control ${displayError && touched ? 'is-invalid' : ''}`}
                style={{
                    borderRadius: "8px",
                    border: "1px solid #6db8c2ff",
                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    backgroundColor: "#fafdff"
                }}
            />
            {touched && displayError && (
                <div className="text-danger" style={{ fontSize: '0.7rem', marginTop: '2px' }}>{displayError}</div>
            )}
        </div>
    );
};

export default DateInput;
