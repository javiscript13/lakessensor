import { Controller, useForm } from 'react-hook-form';
import { Input } from '@mui/material';

const itemStyle = {
    width: '75%',
    margin: '10px',
}

export const InputField = ({ name, control, label, rules, ...props }) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => (
                <Input
                    onChange={onChange}
                    value={value}
                    label={label}
                    sx={itemStyle}
                    {...props}
                />
            )}
        />
    )
}