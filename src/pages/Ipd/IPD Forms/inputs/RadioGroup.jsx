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
        <div className="form-field">
            <label className="field-label">
                {label} {required && <span className="required">*</span>}
            </label>
            <div className="radio-group">
                {options.map((option, index) => (
                    <label key={index} className="radio-option">
                        <input
                            type="radio"
                            name={name}
                            value={option.value || option}
                            checked={value === (option.value || option)}
                            onChange={handleChange}
                        />
                        <span>{option.label || option}</span>
                    </label>
                ))}
            </div>
            {touched && displayError && (
                <span className="error-message">{displayError}</span>
            )}
        </div>
    );
};

export default RadioGroup;
