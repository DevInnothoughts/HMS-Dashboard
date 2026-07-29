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
        <div className="form-field" style={{ marginBottom: hideLabel ? 0 : '20px', ...style }}>
            {!hideLabel && (
                <label htmlFor={name}>
                    {label} {required && <span className="required">*</span>}
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
                className={displayError && touched ? 'error' : ''}
                style={textareaStyle}
            />
            {!hideLabel && (
                <div className="char-count">
                    {value.length} / {maxLength}
                </div>
            )}
            {touched && displayError && (
                <span className="error-message">{displayError}</span>
            )}
        </div>
    );
};

export default Textarea;
