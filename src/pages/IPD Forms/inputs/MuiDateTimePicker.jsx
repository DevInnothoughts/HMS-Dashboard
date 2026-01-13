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
            main: '#80deea',
        },
    },
    typography: {
        fontSize: 13,
    }
});

const MuiDateTimePicker = ({ label, value, onChange, name, required = false, type = 'datetime', style = {}, hideLabel = false }) => {
    const PickerComponent = type === 'date' ? DatePicker : (type === 'time' ? TimePicker : DateTimePicker);

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="form-field" style={{ marginBottom: hideLabel ? '0' : '10px', display: 'flex', flexDirection: 'column', ...style }}>
                    {!hideLabel && label && (
                        <label style={{
                            fontWeight: '600',
                            marginBottom: '4px',
                            fontSize: '0.75rem',
                            color: '#34495e',
                            display: 'block'
                        }}>
                            {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
                        </label>
                    )}
                    <PickerComponent
                        value={value ? dayjs(value, type === 'time' ? 'HH:mm' : (type === 'date' ? 'DD-MM-YYYY' : ['DD-MM-YYYY HH:mm', 'YYYY-MM-DDTHH:mm:ss.SSSZ'])) : null}
                        format={type === 'date' ? 'DD-MM-YYYY' : (type === 'time' ? 'HH:mm' : 'DD-MM-YYYY HH:mm')}
                        onChange={(newValue) => {
                            let formattedValue = '';
                            if (newValue && newValue.isValid()) {
                                if (type === 'date') formattedValue = newValue.format('DD-MM-YYYY');
                                else if (type === 'time') formattedValue = newValue.format('HH:mm');
                                else formattedValue = newValue.format('DD-MM-YYYY HH:mm');
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
                            textField: {
                                required: required,
                                fullWidth: true,
                                variant: 'outlined',
                                size: 'small',
                                sx: {
                                    '& .MuiOutlinedInput-root, & .MuiInputBase-root': {
                                        borderRadius: '5px',
                                        backgroundColor: '#ffffff !important',
                                        '& fieldset': {
                                            borderWidth: '1.5px',
                                            borderColor: '#e2e8f0',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#cbd5e0',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#80deea',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        padding: '6px 10px',
                                        fontSize: '0.8rem',
                                        height: 'auto',
                                        backgroundColor: '#ffffff !important',
                                    }
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
