import React, { useState } from 'react';

const EmailInput = ({
    label,
    name,
    value,
    onChange,
    required = false,
    placeholder = 'example@email.com',
    error = ''
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const validate = (val) => {
        const trimmed = val.trim().toLowerCase();

        if (required && trimmed.length === 0) {
            return `${label} is required`;
        }

        if (trimmed.length > 0) {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmed)) {
                return 'Please enter a valid email address';
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
        // Convert to lowercase
        const lowercaseValue = e.target.value.toLowerCase();
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: lowercaseValue
            }
        };

        onChange(syntheticEvent);

        if (touched) {
            const validationError = validate(lowercaseValue);
            setLocalError(validationError);
        }
    };

    const displayError = error || localError;

    return (
        <div className="form-field">
            <label htmlFor={name}>
                {label} {required && <span className="required">*</span>}
            </label>
            <input
                type="email"
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

export default EmailInput;
