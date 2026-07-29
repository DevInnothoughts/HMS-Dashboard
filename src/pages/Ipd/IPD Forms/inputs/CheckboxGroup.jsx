import React, { useState } from 'react';

const CheckboxGroup = ({
    label,
    name,
    value = [], // Array of selected values
    onChange,
    options = [],
    required = false,
    error = ''
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const validate = (val) => {
        if (required && val.length === 0) {
            return `At least one ${label} must be selected`;
        }
        return '';
    };

    const handleChange = (optionValue) => {
        setTouched(true);

        let newValue;
        if (value.includes(optionValue)) {
            newValue = value.filter(v => v !== optionValue);
        } else {
            newValue = [...value, optionValue];
        }

        // Create synthetic event
        const syntheticEvent = {
            target: {
                name: name,
                value: newValue
            }
        };

        onChange(syntheticEvent);
        const validationError = validate(newValue);
        setLocalError(validationError);
    };

    const displayError = error || localError;

    return (
        <div className="form-field">
            <label className="field-label">
                {label} {required && <span className="required">*</span>}
            </label>
            <div className="checkbox-group">
                {options.map((option, index) => {
                    const optionValue = option.value || option;
                    const optionLabel = option.label || option;

                    return (
                        <label key={index} className="checkbox-option">
                            <input
                                type="checkbox"
                                name={name}
                                value={optionValue}
                                checked={value.includes(optionValue)}
                                onChange={() => handleChange(optionValue)}
                            />
                            <span>{optionLabel}</span>
                        </label>
                    );
                })}
            </div>
            {touched && displayError && (
                <span className="error-message">{displayError}</span>
            )}
        </div>
    );
};

export default CheckboxGroup;
