import React, { useState } from 'react';

const PhoneInput = ({
    label,
    name,
    value,
    onChange,
    required = false,
    placeholder = '+91 1234567890',
    error = ''
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const validate = (val) => {
        const trimmed = val.trim();

        if (required && trimmed.length === 0) {
            return `${label} is required`;
        }

        if (trimmed.length > 0) {
            // Remove + and spaces for validation
            const digitsOnly = trimmed.replace(/[\s+]/g, '');

            if (!/^\d+$/.test(digitsOnly)) {
                return 'Phone number can only contain digits and +';
            }

            if (digitsOnly.length < 10 || digitsOnly.length > 15) {
                return 'Phone number must be between 10-15 digits';
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
        const val = e.target.value;

        // Allow only digits, +, and spaces
        if (val === '' || /^[\d\s+]*$/.test(val)) {
            onChange(e);
            if (touched) {
                const validationError = validate(val);
                setLocalError(validationError);
            }
        }
    };

    const displayError = error || localError;

    return (
        <div className="form-field">
            <label htmlFor={name}>
                {label} {required && <span className="required">*</span>}
            </label>
            <input
                type="tel"
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={displayError && touched ? 'error' : ''}
            />
            {touched && displayError && (
                <span className="error-message">{displayError}</span>
            )}
        </div>
    );
};

export default PhoneInput;
