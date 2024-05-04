import React, { useEffect, useState } from "react";
import { FormLabel, ToggleButtonGroup } from "@mui/material";
import { Controller } from "react-hook-form";
export const ToggleButtonGroupField = ({
    name,
    value,
    control,
    setValue,
    label,
    children,
    sx,
    allowBlank = true,
    ...props
}) => {
    const [toggleValue, setToggleValue] = useState(value);
    useEffect(() => {
        setValue(name, toggleValue);
    }, [name, setValue, toggleValue]);
    const handleChange = (event, newValue) => {
        if (allowBlank) setToggleValue(newValue);
        if ((!allowBlank) && (newValue !== null)) setToggleValue(newValue);
    };
    return (
        <>
            <FormLabel component="legend">{label}</FormLabel>
            <Controller
                name={name}
                control={control}
                render={({ field, fieldState, formState }) => (
                    <ToggleButtonGroup
                        value={toggleValue}
                        onChange={handleChange}
                        setValue={setValue}
                        sx={sx}
                        {...props}
                    >
                        {children}
                    </ToggleButtonGroup>
                )}
            />
        </>
    );
};