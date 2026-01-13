import React, { useState } from 'react';

const TextInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  minLength = 2,
  placeholder = '',
  error = '',
  hideLabel = false
}) => {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState('');

  const validate = (val) => {
    const trimmed = val.trim();

    // Block emoji
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(trimmed)) {
      return 'Emojis are not allowed';
    }

    if (required && trimmed.length === 0) {
      return `${label} is required`;
    }

    if (trimmed.length > 0 && trimmed.length < minLength) {
      return `${label} must be at least ${minLength} characters`;
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
    <div className="form-field" style={{ marginBottom: hideLabel ? 0 : '10px' }}>
      {!hideLabel && (
        <label
          htmlFor={name}
          className="fw-bold text-muted small uppercase mb-1 d-block"
          style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
        >
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={`form-control ${displayError && touched ? 'is-invalid' : ''}`}
        style={{
          borderRadius: "5px",
          border: "1px solid #6db8c2ff",
          padding: "5px 10px",
          fontSize: "0.8rem",
          backgroundColor: "#fafdff",
          transition: "border-color 0.2s ease-in-out"
        }}
      />
      {touched && displayError && (
        <div className="text-danger" style={{ fontSize: '0.7rem', marginTop: '2px' }}>{displayError}</div>
      )}
    </div>
  );
};

export default TextInput;
