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
        <div className="form-field">
            <label htmlFor={name}>
                {label} {required && <span className="required">*</span>}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                required={required}
                className={displayError && touched ? 'error' : ''}
            >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value || option}>
                        {option.label || option}
                    </option>
                ))}
            </select>
            {touched && displayError && (
                <span className="error-message">{displayError}</span>
            )}
        </div>
    );
};

export default SelectInput;
