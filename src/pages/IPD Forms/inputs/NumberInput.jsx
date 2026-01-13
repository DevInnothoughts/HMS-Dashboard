import React, { useState } from 'react';

const NumberInput = ({
    label,
    name,
    value,
    onChange,
    required = false,
    min = 0,
    max = 999999,
    allowDecimal = false,
    placeholder = '',
    error = ''
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const validate = (val) => {
        if (required && val === '') {
            return `${label} is required`;
        }

        if (val !== '') {
            const num = parseFloat(val);
            if (isNaN(num)) {
                return 'Please enter a valid number';
            }
            if (num < min) {
                return `${label} must be at least ${min}`;
            }
            if (num > max) {
                return `${label} cannot exceed ${max}`;
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

        // Block letters, only allow digits and decimal point
        const regex = allowDecimal ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;

        if (val === '' || regex.test(val)) {
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
                type="text"
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

export default NumberInput;
