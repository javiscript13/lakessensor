import React, { useEffect, useState } from "react";
import { FormLabel, Slider } from "@mui/material";
import { Controller } from "react-hook-form";
export const SliderField = ({
    name,
    control,
    setValue,
    label,
    sx,
    initialValue = 0,
    ...props
}) => {
    const [sliderValue, setSliderValue] = useState(initialValue);
    useEffect(() => {
        if (sliderValue) setValue(name, sliderValue);
    }, [name, setValue, sliderValue]);
    const handleChange = (event, newValue) => {
        setSliderValue(newValue);
    };
    return (
        <>
            <FormLabel component="legend">{label}</FormLabel>
            <Controller
                name={name}
                control={control}
                render={() => (
                    <Slider
                        value={sliderValue}
                        onChange={handleChange}
                        setValue={setValue}
                        sx={{ paddingBottom: 20 }}
                        {...props}
                    />
                )}
            />
        </>
    );
};