import React, { useState } from 'react';

const RadioGroup = ({
    label,
    name,
    value,
    onChange,
    options = [],
    required = false,
    error = ''
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const validate = (val) => {
        if (required && val === '') {
            return `${label} is required`;
        }
        return '';
    };

    const handleChange = (e) => {
        setTouched(true);
        onChange(e);
        const validationError = validate(e.target.value);
        setLocalError(validationError);
    };

    const displayError = error || localError;

    return (
        <div className="form-field" style={{ marginBottom: '10px' }}>
            <label
                className="fw-bold text-muted small uppercase mb-1 d-block"
                style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
            >
                {label} {required && <span className="text-danger">*</span>}
            </label>
            <div className="d-flex flex-wrap gap-2">
                {options.map((option, index) => (
                    <label key={index} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                        <input
                            type="radio"
                            name={name}
                            value={option.value || option}
                            checked={value === (option.value || option)}
                            onChange={handleChange}
                            className="form-check-input mt-0"
                            style={{ width: '16px', height: '16px', border: '1px solid #6db8c2ff' }}
                        />
                        <span className="text-dark">{option.label || option}</span>
                    </label>
                ))}
            </div>
            {touched && displayError && (
                <div className="text-danger" style={{ fontSize: '0.7rem', marginTop: '2px' }}>{displayError}</div>
            )}
        </div>
    );
};

export default RadioGroup;
