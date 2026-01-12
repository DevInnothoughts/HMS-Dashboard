import React, { useState } from 'react';

const Textarea = ({
    label,
    name,
    value,
    onChange,
    required = false,
    maxLength = 1000,
    rows = 4,
    placeholder = '',
    error = '',
    hideLabel = false,
    style = {},
    textareaStyle = {}
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const validate = (val) => {
        const trimmed = val.trim();

        if (required && trimmed.length === 0) {
            return `${label} is required`;
        }

        if (val.length > maxLength) {
            return `${label} cannot exceed ${maxLength} characters`;
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
        <div className="form-field" style={{ marginBottom: hideLabel ? 0 : '10px', ...style }}>
            {!hideLabel && (
                <label
                    htmlFor={name}
                    className="fw-bold text-muted small uppercase mb-1 d-block"
                    style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
                >
                    {label} {required && <span className="text-danger">*</span>}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                required={required}
                className={`form-control ${displayError && touched ? 'is-invalid' : ''}`}
                style={{
                    borderRadius: "5px",
                    border: "1px solid #6db8c2ff",
                    padding: "6px 10px",
                    fontSize: "0.8rem",
                    backgroundColor: "#fafdff",
                    minHeight: "80px",
                    ...textareaStyle
                }}
            />
            <div className="d-flex justify-content-between align-items-center mt-1">
                {touched && displayError ? (
                    <div className="text-danger" style={{ fontSize: '0.7rem' }}>{displayError}</div>
                ) : <div />}
                {!hideLabel && (
                    <div className="text-muted small" style={{ fontSize: '0.65rem' }}>
                        {value.length} / {maxLength}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Textarea;
