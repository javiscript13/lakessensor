import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from "react-hook-form";
import { SelectField } from "./SelectField";
import { TextFieldField } from "./TextFieldField";
import {
    Grid, Button, Snackbar, CircularProgress, Typography, Divider, InputAdornment,
} from '@mui/material';
import {
    getLakes, getLakeSamples, postLakeSample, patchLakeSample,
} from '../../services/apiService';

const gridStyles = {
    paddingTop: 20,
    paddingLeft: { xs: 10, lg: 30, xl: 50 },
    paddingRight: { xs: 10, lg: 30, xl: 50 },
};

const sectionTitleStyle = {
    width: '100%',
    marginTop: '16px',
    marginBottom: '4px',
};

const firstSectionTitleStyle = {
    ...sectionTitleStyle,
    marginTop: '32px',
};

const dividerStyle = {
    width: '100%',
    marginBottom: '12px',
};

const PHYSICOCHEMICAL_FIELDS = [
    { name: 'conductivity', label: 'Conductividad (CE)', unit: 'µS/cm', min: 0, max: 10000 },
    { name: 'totalDissolvedSolids', label: 'Sólidos disueltos totales (SDT)', unit: 'mg/L', min: 0, max: 10000 },
    { name: 'nitrates', label: 'Nitratos (NO3)', unit: 'mg/L', min: 0, max: 100 },
    { name: 'nitrites', label: 'Nitritos (NO2)', unit: 'mg/L', min: 0, max: 20 },
    { name: 'phosphates', label: 'Fosfatos (PO4)', unit: 'mg/L', min: 0, max: 50 },
    { name: 'ammonium', label: 'Amonio (NH4)', unit: 'mg/L', min: 0, max: 50 },
    { name: 'totalPhosphorus', label: 'Fósforo total (PT)', unit: 'mg/L', min: 0, max: 50 },
    { name: 'totalNitrogen', label: 'Nitrógeno total (NT)', unit: 'mg/L', min: 0, max: 200 },
    { name: 'sulfates', label: 'Sulfatos (SO4)', unit: 'mg/L', min: 0, max: 2000 },
];

const NUMERIC_FIELDS = ['lat', 'long', ...PHYSICOCHEMICAL_FIELDS.map(f => f.name)];

// Mirrors the backend DecimalField/validators on LakeSample (decimal_places=2, Min/MaxValueValidator).
const decimalRule = (min, max, decimalPlaces = 2) => ({
    validate: (v) => {
        if (v === '' || v === null || v === undefined) return true;
        const num = Number(v);
        if (Number.isNaN(num)) return 'Debe ser un número';
        const decimalPattern = new RegExp(`^-?\\d+(\\.\\d{1,${decimalPlaces}})?$`);
        if (!decimalPattern.test(String(v))) return `Máximo ${decimalPlaces} decimales`;
        if (min !== undefined && num < min) return `El valor mínimo es ${min}`;
        if (max !== undefined && num > max) return `El valor máximo es ${max}`;
        return true;
    },
});

// lat/long: DecimalField(max_digits=9, decimal_places=6) — no min/max validators on the backend.
const coordinateRule = decimalRule(undefined, undefined, 6);

// YYYY-MM-DD in local time, matching the <input type="date"> value format.
const todayISO = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const samplingDateRule = {
    required: "La fecha de muestreo es obligatoria",
    validate: (value) => {
        if (!value) return true;
        return value <= todayISO() || "La fecha de muestreo no puede ser en el futuro";
    },
};

const analysisDateRule = {
    required: "La fecha de análisis es obligatoria",
    validate: (value, formValues) => {
        if (!value || !formValues.samplingDate) return true;
        return value >= formValues.samplingDate || "La fecha de análisis no puede ser anterior a la fecha de muestreo";
    },
};

const DEFAULT_VALUES = {
    existingSample: '',
    lake: '',
    lat: '',
    long: '',
    samplingDate: '',
    analysisDate: '',
    laboratory: '',
    analyst: '',
    observations: '',
    conductivity: '',
    totalDissolvedSolids: '',
    nitrates: '',
    nitrites: '',
    phosphates: '',
    ammonium: '',
    totalPhosphorus: '',
    totalNitrogen: '',
    sulfates: '',
};

const LakeSampleForm = () => {
    const { handleSubmit, control, formState: { errors }, reset, trigger } = useForm({
        defaultValues: DEFAULT_VALUES,
        mode: 'onChange',
    });

    const [lakes, setLakes] = useState([]);
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const samplesDataRef = useRef([]);
    const [savingResult, setSavingResult] = useState("");
    const [selectedSample, setSelectedSample] = useState(null);

    const existingSampleValue = useWatch({ control, name: 'existingSample' });
    const samplingDateValue = useWatch({ control, name: 'samplingDate' });

    useEffect(() => {
        trigger('analysisDate');
    }, [samplingDateValue, trigger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [lakesData, samplesData] = await Promise.all([getLakes(), getLakeSamples()]);
            setLakes(lakesData.map((lake) => ({ value: lake.id, label: lake.name })));
            samplesDataRef.current = samplesData;
            setSamples(samplesData.map((sample) => ({
                value: sample.id,
                label: `#${sample.id} — ${sample.lakeName} — ${sample.samplingDate}`,
            })));
        } catch (err) {
            console.error("Lake samples could not be loaded", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!existingSampleValue) {
            setSelectedSample(null);
            reset(DEFAULT_VALUES);
            return;
        }
        const sample = samplesDataRef.current.find(s => s.id === existingSampleValue);
        setSelectedSample(sample || null);
        if (sample) {
            const values = { ...DEFAULT_VALUES, existingSample: sample.id, lake: sample.lake };
            ['samplingDate', 'analysisDate', 'laboratory', 'analyst', 'observations', ...NUMERIC_FIELDS].forEach((field) => {
                values[field] = sample[field] ?? '';
            });
            reset(values);
        }
    }, [existingSampleValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const clearForm = () => {
        setSelectedSample(null);
        reset(DEFAULT_VALUES);
    };

    const onSubmit = async (data) => {
        const payload = { ...data };
        delete payload.existingSample;
        payload.lake = +payload.lake;
        NUMERIC_FIELDS.forEach((field) => {
            payload[field] = payload[field] === '' ? null : +payload[field];
        });

        try {
            setSavingResult("Guardando");
            if (selectedSample) {
                await patchLakeSample(selectedSample.id, payload);
            } else {
                await postLakeSample(payload);
            }
            setSavingResult("Guardado");
            clearForm();
            fetchData();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error saving lake sample:', error);
            setSavingResult("Error al guardar, intenta de nuevo.");
        }
    };

    if (loading) {
        return (
            <Grid container justifyContent="center" sx={{ paddingTop: 10 }}>
                <CircularProgress />
            </Grid>
        );
    }

    return (
        <form>
            <Grid
                container
                alignItems="center"
                direction="column"
                sx={gridStyles}
            >
                <SelectField
                    name="existingSample"
                    label="Muestra existente"
                    control={control}
                    options={[{ value: '', label: 'Nueva muestra' }, ...samples]}
                />

                <Typography variant="h5" sx={firstSectionTitleStyle}>Información de muestra</Typography>
                <Divider sx={dividerStyle} />

                <SelectField
                    name="lake"
                    label="Lago"
                    control={control}
                    options={lakes}
                    error={!!errors.lake}
                    helperText={errors.lake?.message}
                    rules={{ required: "El lago es obligatorio" }}
                />
                <TextFieldField
                    name="samplingDate"
                    label="Fecha de muestreo"
                    control={control}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.samplingDate}
                    helperText={errors.samplingDate?.message}
                    rules={samplingDateRule}
                    inputProps={{ max: todayISO() }}
                />
                <TextFieldField
                    name="analysisDate"
                    label="Fecha de análisis"
                    control={control}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.analysisDate}
                    helperText={errors.analysisDate?.message}
                    rules={analysisDateRule}
                />
                <TextFieldField
                    name="laboratory"
                    label="Laboratorio"
                    control={control}
                    error={!!errors.laboratory}
                    helperText={errors.laboratory?.message}
                    rules={{
                        required: "El laboratorio es obligatorio",
                        maxLength: { value: 100, message: "Máximo 100 caracteres" },
                    }}
                    inputProps={{ maxLength: 100 }}
                />
                <TextFieldField
                    name="analyst"
                    label="Analista"
                    control={control}
                    error={!!errors.analyst}
                    helperText={errors.analyst?.message}
                    rules={{
                        required: "El analista es obligatorio",
                        maxLength: { value: 100, message: "Máximo 100 caracteres" },
                    }}
                    inputProps={{ maxLength: 100 }}
                />
                <TextFieldField
                    name="lat"
                    label="Latitud"
                    control={control}
                    type="text"
                    error={!!errors.lat}
                    helperText={errors.lat?.message}
                    rules={coordinateRule}
                    inputProps={{ inputMode: 'decimal' }}
                />
                <TextFieldField
                    name="long"
                    label="Longitud"
                    control={control}
                    type="text"
                    error={!!errors.long}
                    helperText={errors.long?.message}
                    rules={coordinateRule}
                    inputProps={{ inputMode: 'decimal' }}
                />
                <TextFieldField
                    name="observations"
                    label="Observaciones"
                    control={control}
                    multiline
                    minRows={3}
                />

                <Typography variant="h5" sx={sectionTitleStyle}>Variables fisicoquímicas</Typography>
                <Divider sx={dividerStyle} />

                {PHYSICOCHEMICAL_FIELDS.map(({ name, label, unit, min, max }) => (
                    <TextFieldField
                        key={name}
                        name={name}
                        label={label}
                        control={control}
                        type="text"
                        error={!!errors[name]}
                        helperText={errors[name]?.message}
                        rules={decimalRule(min, max)}
                        inputProps={{ inputMode: 'decimal' }}
                        InputProps={{ endAdornment: <InputAdornment position="end">{unit}</InputAdornment> }}
                    />
                ))}

                <Button
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                    sx={{ marginTop: 10, marginBottom: 10 }}
                >
                    Enviar
                </Button>
                <Snackbar
                    open={!!savingResult && savingResult.length > 0}
                    message={savingResult}
                    autoHideDuration={1200}
                    onClose={() => setSavingResult("")}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </Grid>
        </form>
    );
}

export default LakeSampleForm;
