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
        <div className="form-field signature-field">
            <label htmlFor={name}>
                {label} {required && <span className="required">*</span>}
            </label>
            <input
                type="text"
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Type your full name"
                className={`signature-input ${displayError && touched ? 'error' : ''}`}
            />
            {touched && displayError && (
                <span className="error-message">{displayError}</span>
            )}

        </div>
    );
};

export default SignatureInput;
