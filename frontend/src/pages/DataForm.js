import React from 'react';
import { useForm } from "react-hook-form";
import { TextFieldField } from "../components/forms/TextFieldField";
import { SwitchField } from '../components/forms/SwitchField';
import { SliderField } from '../components/forms/SliderField'
import { Grid, ToggleButton, Button } from '@mui/material';
import { ToggleButtonGroupField } from '../components/forms/ToggleButtonGroupField';
import { postAnalogData } from '../services/apiService';

const gridStyles = {
    paddingTop: 20,
    paddingLeft: { xs: 10, lg: 50 },
    paddingRight: { xs: 10, lg: 50 },
};

const gridItem = {
    paddingBottom: 5,
};

const DataForm = () => {
    const { handleSubmit, control, setValue, formState: { errors } } = useForm({
        defaultValues: {
            digitalReading: '',
            rainPast24hrs: false,
            readingPlace: 'IN',
            forelUleScale: 0,
            secchiDepth: 0,
        },
    });

    const onSubmit = async (data) => {
        data.digitalReading = +data.digitalReading;
        try {
            const postDataResponse = await postAnalogData(data);
            console.log('Post data response:', postDataResponse);
        } catch (error) {
            console.error('Error posting data:', error);
        }
    };

    const forelUleMarks = [
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3" },
        { value: 4, label: "4" },
        { value: 5, label: "5" },
        { value: 6, label: "6" },
        { value: 7, label: "7" },
        { value: 8, label: "8" },
        { value: 9, label: "9" },
        { value: 10, label: "10" },
        { value: 11, label: "11" },
        { value: 12, label: "12" },
        { value: 13, label: "13" },
        { value: 14, label: "14" },
        { value: 15, label: "15" },
        { value: 16, label: "16" },
        { value: 17, label: "17" },
        { value: 18, label: "18" },
        { value: 19, label: "19" },
        { value: 20, label: "20" },
        { value: 21, label: "21" },

    ];

    const secchiMarks = [
        { value: 1, label: "" },
        { value: 2, label: "" },
        { value: 3, label: "" },
        { value: 4, label: "" },
        { value: 5, label: "5" },
        { value: 6, label: "" },
        { value: 7, label: "" },
        { value: 8, label: "" },
        { value: 9, label: "" },
        { value: 10, label: "10" },
        { value: 11, label: "" },
        { value: 12, label: "" },
        { value: 13, label: "" },
        { value: 14, label: "" },
        { value: 15, label: "15" },
        { value: 16, label: "" },
        { value: 17, label: "" },
        { value: 18, label: "" },
        { value: 19, label: "" },
        { value: 20, label: "20" },
        { value: 21, label: "" },
        { value: 22, label: "" },
        { value: 23, label: "" },
        { value: 24, label: "" },
        { value: 25, label: "25" },
        { value: 26, label: "" },
        { value: 27, label: "" },
        { value: 28, label: "" },
        { value: 29, label: "" },
        { value: 30, label: "30" },
        { value: 31, label: "" },
        { value: 32, label: "" },
        { value: 33, label: "" },
        { value: 34, label: "" },
        { value: 35, label: "35" },
        { value: 36, label: "" },
        { value: 37, label: "" },
        { value: 38, label: "" },
        { value: 39, label: "" },
        { value: 40, label: "40" },
        { value: 41, label: "" },
        { value: 42, label: "" },
        { value: 43, label: "" },
        { value: 44, label: "" },
        { value: 45, label: "45" },
        { value: 46, label: "" },
        { value: 47, label: "" },
        { value: 48, label: "" },
        { value: 49, label: "" },
        { value: 50, label: "50" },
        { value: 51, label: "" },
        { value: 52, label: "" },
        { value: 53, label: "" },
        { value: 54, label: "" },
        { value: 55, label: "55" },
        { value: 56, label: "" },
        { value: 57, label: "" },
        { value: 58, label: "" },
        { value: 59, label: "" },
        { value: 60, label: "60" },
    ];

    return (
        <form>
            <Grid
                container
                alignItems="center"
                direction="column"
                sx={gridStyles}
            >
                <TextFieldField
                    name="digitalReading"
                    placeholder="Id lectura digital"
                    control={control}
                    label={"Id lectura digital"}
                    type="number"
                    rules={{
                        required: "Id de lectura es obligatorio",
                        maxLength: {
                            value: 8,
                            message: "máximo 8 digitos"
                        },
                        minLength: {
                            value: 1,
                            message: "Ingrese al menos 1 digito"
                        },
                        pattern:{
                            value: /^(0|[1-9]\d*)(\.\d+)?$/,
                            message: "debe ser un número"
                        },
                    }}
                    error={errors?.digitalReading && errors.digitalReading?.message}
                    helperText={errors?.digitalReading?.message}
                    sx={gridItem}
                />
                <SwitchField
                    name={"rainPast24hrs"}
                    control={control}
                    label={"Llovió en las últimas 24hrs"}
                    sx={gridItem}
                />
                <SliderField
                    name="forelUleScale"
                    control={control}
                    label="Escala Forel-Ule"
                    setValue={setValue}
                    step={1}
                    shiftStep={3}
                    min={1}
                    max={21}
                    marks={forelUleMarks}
                    sx={gridItem}
                />
                <SliderField
                    name="secchiDepth"
                    control={control}
                    label="Discho Secchi"
                    setValue={setValue}
                    shiftStep={5}
                    step={1}
                    min={1}
                    max={60}
                    marks={secchiMarks}
                    sx={gridItem}
                />
                <ToggleButtonGroupField
                    name="readingPlace"
                    value="IN"
                    control={control}
                    setValue={setValue}
                    label="Lugar de la laguna donde se tomó la muestra"
                    exclusive
                    allowBlank={false}
                    sx={gridItem}
                >
                    <ToggleButton value="IN" key="in">ADENTRO</ToggleButton>
                    <ToggleButton value="SL" key="sl">AFUERA</ToggleButton>
                </ToggleButtonGroupField>
                <Button
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                    sx={{ marginBottom: 10 }}
                >
                    Enviar
                </Button>
            </Grid>
        </form>);
}

export default DataForm;