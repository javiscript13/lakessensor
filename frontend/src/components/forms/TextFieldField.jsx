import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

const itemStyle = {
  width: '75%',
  margin: '10px',
}

export const TextFieldField = ({ name, control, label, rules, sx, type, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <TextField
          onChange={onChange}
          value={value}
          label={label}
          sx={{ ...itemStyle, ...sx }}
          {...props}
        />
      )
      }
    />
  )
}