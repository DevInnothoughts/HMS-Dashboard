import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#4dd0e1',
        },
    },
    typography: {
        fontSize: 13,
    }
});

const MuiDateTimePicker = ({ label, value, onChange, name, required = false, type = 'datetime', style = {}, hideLabel = false, ampm = true, labelClassName = "", labelStyle = {}, disablePast = false, placeholder = "", inputSx = {}, minutesStep = 1, minDate = null }) => {
    const PickerComponent = type === 'date' ? DatePicker : (type === 'time' ? TimePicker : DateTimePicker);

    // Dynamic format based on type and ampm
    const getFormat = () => {
        if (type === 'date') return 'DD-MM-YYYY';
        if (type === 'time') return ampm ? 'hh:mm A' : 'HH:mm';
        return ampm ? 'DD-MM-YYYY hh:mm A' : 'DD-MM-YYYY HH:mm';
    };

    const displayFormat = getFormat();

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="form-field" style={{ marginBottom: hideLabel ? '0' : '20px', display: 'flex', flexDirection: 'column', ...style }}>
                    {!hideLabel && label && (
                        <label className={labelClassName} style={{
                            fontWeight: '600',
                            marginBottom: '8px',
                            fontSize: '0.85rem',
                            color: '#34495e',
                            display: 'block',
                            ...labelStyle
                        }}>
                            {label}{required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
                        </label>
                    )}
                    <PickerComponent
                        ampm={ampm}
                        minutesStep={minutesStep}
                        disablePast={disablePast}
                        minDate={minDate}
                        skipDisabled={true}
                        shouldDisableTime={(timeValue, view) => {
                            if (view === 'minutes' && minutesStep > 1) {
                                return timeValue.minute() % minutesStep !== 0;
                            }
                            return false;
                        }}
                        value={value ? dayjs(value, type === 'time' ? (ampm ? 'hh:mm A' : 'HH:mm') : (type === 'date' ? 'DD-MM-YYYY' : ['DD-MM-YYYY HH:mm', 'DD-MM-YYYY hh:mm A', 'YYYY-MM-DDTHH:mm:ss.SSSZ'])) : null}
                        format={displayFormat}
                        onChange={(newValue) => {
                            let formattedValue = '';
                            if (newValue && newValue.isValid()) {
                                if (type === 'date') formattedValue = newValue.format('DD-MM-YYYY');
                                else if (type === 'time') formattedValue = newValue.format(ampm ? 'hh:mm A' : 'HH:mm');
                                else formattedValue = newValue.format(ampm ? 'DD-MM-YYYY hh:mm A' : 'DD-MM-YYYY HH:mm');
                            }
                            const event = {
                                target: {
                                    name: name,
                                    value: formattedValue
                                }
                            };
                            onChange(event);
                        }}
                        slotProps={{
                            digitalClock: {
                                skipDisabled: true,
                            },
                            multiSectionDigitalClock: {
                                skipDisabled: true,
                            },
                            textField: {
                                required: required,
                                fullWidth: true,
                                variant: 'outlined',
                                size: 'small',
                                placeholder: placeholder || displayFormat,
                                InputProps: {
                                    readOnly: true,
                                },
                                onKeyDown: (e) => e.preventDefault(),
                                sx: {
                                    '& .MuiOutlinedInput-root, & .MuiInputBase-root': {
                                        borderRadius: '8px',
                                        backgroundColor: '#fafdff',
                                        height: 'min-content',
                                        '& fieldset': {
                                            borderWidth: '1.5px',
                                            borderColor: '#4dd0e1',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#4dd0e1',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#4dd0e1',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        padding: '4px 12px',
                                        fontSize: '0.8rem',
                                        height: 'auto',
                                    },
                                    ...inputSx
                                }
                            }
                        }}
                    />
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default MuiDateTimePicker;
