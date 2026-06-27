import React, { useState } from 'react';

const TimeInput = ({
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
        if (required && val === '') {
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
        <div className="form-field">
            <label htmlFor={name}>
                {label} {required && <span className="required">*</span>}
            </label>
            <input
                type="time"
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                required={required}
                className={displayError && touched ? 'error' : ''}
            />
            {touched && displayError && (
                <span className="error-message">{displayError}</span>
            )}
        </div>
    );
};

export default TimeInput;
