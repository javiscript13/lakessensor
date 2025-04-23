import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  ListSubheader,
} from "@mui/material";
import { Controller } from "react-hook-form";

export const SelectField = ({
  name,
  label,
  control,
  options = [],
  groupedOptions = null, // [{ group: "Grupo 1", items: [{ value: 1, label: "A" }] }]
  error,
  helperText,
  disabled = false,
  rules = {},
  defaultValue = "",
  ...rest
}) => {
  return (
    <FormControl fullWidth error={!!error} disabled={disabled} sx={{ my: 1 }}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Select
            labelId={`${name}-label`}
            id={`${name}-select`}
            label={label}
            {...field}
            {...rest}
          >
            {groupedOptions
              ? groupedOptions.map((group, i) => [
                  <ListSubheader key={`group-${i}`}>{group.group}</ListSubheader>,
                  group.items.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  )),
                ])
              : options.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
          </Select>
        )}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};