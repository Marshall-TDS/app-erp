import { Box, Switch, Typography } from '@mui/material'

type SwitchPickerProps = {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
    className?: string
}

const SwitchPicker = ({
    label,
    checked,
    onChange,
    disabled = false,
    className = ''
}: SwitchPickerProps) => {
    const handleClick = () => {
        if (!disabled) {
            onChange(!checked)
        }
    }

    return (
        <Box
            className={`switch-picker-container ${disabled ? 'Mui-disabled' : ''} ${className}`}
            onClick={handleClick}
        >
            <Typography className="switch-picker-label">
                {label}
            </Typography>
            <Switch
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
                color="primary"
            />
        </Box>
    )
}

export default SwitchPicker
