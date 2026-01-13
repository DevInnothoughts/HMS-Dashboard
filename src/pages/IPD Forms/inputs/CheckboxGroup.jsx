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
        <div className="form-field" style={{ marginBottom: '10px' }}>
            <label
                className="fw-bold text-muted small uppercase mb-1 d-block"
                style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
            >
                {label} {required && <span className="text-danger">*</span>}
            </label>
            <div className="d-flex flex-wrap gap-2">
                {options.map((option, index) => {
                    const optionValue = option.value || option;
                    const optionLabel = option.label || option;

                    return (
                        <label key={index} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                            <input
                                type="checkbox"
                                name={name}
                                value={optionValue}
                                checked={value.includes(optionValue)}
                                onChange={() => handleChange(optionValue)}
                                className="form-check-input mt-0"
                                style={{ width: '16px', height: '16px', border: '1px solid #6db8c2ff' }}
                            />
                            <span className="text-dark">{optionLabel}</span>
                        </label>
                    );
                })}
            </div>
            {touched && displayError && (
                <div className="text-danger" style={{ fontSize: '0.7rem', marginTop: '2px' }}>{displayError}</div>
            )}
        </div>
    );
};

export default CheckboxGroup;
