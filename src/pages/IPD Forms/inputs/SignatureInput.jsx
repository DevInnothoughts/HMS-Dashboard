import React, { useState } from 'react';

const SignatureInput = ({
    label,
    name,
    value,
    onChange,
    required = false,
    error = ''
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const validate = (val) => {
        const trimmed = val.trim();

        if (required && trimmed.length === 0) {
            return `${label} is required`;
        }

        if (trimmed.length > 0 && trimmed.length < 2) {
            return 'Please enter your full name for signature';
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
        <div className="form-field signature-field mb-2">
            <label htmlFor={name} className="fw-bold text-muted small uppercase mb-1 d-block" style={{ fontSize: '0.75rem' }}>
                {label} {required && <span className="required text-danger">*</span>}
            </label>
            <input
                type="text"
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Type your full name to sign"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #6db8c2ff',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.9rem',
                    fontFamily: "'Poppins', sans-serif",
                    width: '100%',
                    fontStyle: 'italic',
                    color: '#1a5b61ff'
                }}
                className={`signature-input ${displayError && touched ? 'is-invalid' : ''}`}
            />
            {touched && displayError && (
                <div className="invalid-feedback d-block" style={{ fontSize: '0.75rem' }}>{displayError}</div>
            )}
        </div>
    );
};

export default SignatureInput;
