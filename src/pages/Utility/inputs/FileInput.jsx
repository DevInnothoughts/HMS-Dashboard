import React, { useState, useRef } from 'react';

const FileInput = ({
    label,
    name,
    onChange,
    multiple = false,
    required = false,
    accept = "*",
    error = ''
}) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        onChange({
            target: {
                name,
                value: multiple ? files : files[0]
            }
        });
    };

    return (
        <div className="form-field file-input-container">
            <label htmlFor={name}>
                {label} {required && <span className="required">*</span>}
            </label>
            <div className="file-input-wrapper">
                <input
                    type="file"
                    id={name}
                    name={name}
                    onChange={handleFileChange}
                    multiple={multiple}
                    accept={accept}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                />
                <button
                    type="button"
                    className="file-btn"
                    onClick={() => fileInputRef.current.click()}
                >
                    Choose Files
                </button>
                <span className="file-name">
                    {selectedFiles.length > 0
                        ? `${selectedFiles.length} file(s) selected`
                        : 'No file chosen'}
                </span>
            </div>
            {error && <span className="error-message">{error}</span>}

            <style jsx="true">{`
                .file-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-top: 5px;
                }
                .file-btn {
                    padding: 6px 15px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                .file-btn:hover {
                    background: #2980b9;
                }
                .file-name {
                    font-size: 0.8rem;
                    color: #666;
                }
            `}</style>
        </div>
    );
};

export default FileInput;
