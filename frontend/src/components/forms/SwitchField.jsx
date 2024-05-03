import { Controller } from 'react-hook-form';
import { Switch, FormControlLabel } from '@mui/material';

const itemStyle = {
    margin: '10px',
}

export const SwitchField = ({ name, control, label, rules, ...props }) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => (
                <FormControlLabel control={
                    <Switch
                        onChange={onChange}
                        value={value}
                        sx={itemStyle}
                        {...props}
                    />
                }
                    label={label}
                />
            )}
        />
    )
}