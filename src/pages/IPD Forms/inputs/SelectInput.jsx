import React, { useState } from 'react';

const SelectInput = ({
    label,
    name,
    value,
    onChange,
    options = [],
    required = false,
    placeholder = 'Select...',
    error = ''
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const validate = (val) => {
        if (required && (val === '' || val === placeholder)) {
            return `${label} is required`;
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
        <div className="form-field" style={{ marginBottom: '10px' }}>
            <label
                htmlFor={name}
                className="fw-bold text-muted small uppercase mb-1 d-block"
                style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
            >
                {label} {required && <span className="text-danger">*</span>}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                required={required}
                className={`form-select ${displayError && touched ? 'is-invalid' : ''}`}
                style={{
                    borderRadius: "5px",
                    border: "1px solid #6db8c2ff",
                    padding: "6px 10px",
                    fontSize: "0.8rem",
                    backgroundColor: "#fafdff",
                    cursor: "pointer"
                }}
            >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value || option}>
                        {option.label || option}
                    </option>
                ))}
            </select>
            {touched && displayError && (
                <div className="text-danger" style={{ fontSize: '0.7rem', marginTop: '2px' }}>{displayError}</div>
            )}
        </div>
    );
};

export default SelectInput;
