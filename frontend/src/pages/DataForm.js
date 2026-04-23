import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from "react-hook-form";
import { SelectField } from "../components/forms/SelectField";
import { SwitchField } from '../components/forms/SwitchField';
import { SliderField } from '../components/forms/SliderField'
import {
    Grid, ToggleButton, Button, Snackbar, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { ToggleButtonGroupField } from '../components/forms/ToggleButtonGroupField';
import { postAnalogData, patchAnalogData, getUserReadings } from '../services/apiService';

const gridStyles = {
    paddingTop: 20,
    paddingLeft: { xs: 10, lg: 50 },
    paddingRight: { xs: 10, lg: 50 },
};

const gridItem = {
    paddingBottom: 5,
};

const DEFAULT_VALUES = {
    digitalReading: '',
    rainPast24hrs: false,
    readingPlace: 'IN',
    forelUleScale: 0,
    secchiDepth: 0,
};

const DEFAULT_INITIALS = {
    forelUleScale: 0,
    secchiDepth: 0,
    readingPlace: 'IN',
};

const DataForm = () => {
    const { handleSubmit, control, setValue, formState: { errors }, reset } = useForm({
        defaultValues: DEFAULT_VALUES,
    });

    const [readings, setReadings] = useState([]);
    const [loadingReadings, setLoadingReadings] = useState(true);
    const readingsDataRef = useRef([]);
    const [savingResult, setSavingResult] = useState("");
    const [formKey, setFormKey] = useState(0);
    const [selectedReading, setSelectedReading] = useState(null);
    const [analogInitials, setAnalogInitials] = useState(DEFAULT_INITIALS);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingData, setPendingData] = useState(null);

    const digitalReadingValue = useWatch({ control, name: 'digitalReading' });
    const digitalReadingRef = useRef(null);

    useEffect(() => {
        if (errors.digitalReading && digitalReadingRef.current) {
            digitalReadingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [errors.digitalReading]);

    const fetchReadings = async () => {
        setLoadingReadings(true);
        try {
            const data = await getUserReadings();
            readingsDataRef.current = data;
            const options = data.map((reading) => ({
                value: reading.id,
                label: `Dispositivo ${reading.deviceName} - sesión ${new Date(reading.oldestReadingTime).toLocaleString('es-GT')} - (${(reading.analogReading ? 'con lectura análoga' : 'sin lectura análoga')})`,
            }));
            setReadings(options);
        } catch (err) {
            console.error("User readings could not be loaded", err);
        } finally {
            setLoadingReadings(false);
        }
    };

    useEffect(() => {
        fetchReadings();
    }, []);

    useEffect(() => {
        const reading = readingsDataRef.current.find(r => r.id === digitalReadingValue);
        setSelectedReading(reading || null);
        if (reading?.analogReading) {
            const ar = reading.analogReading;
            setAnalogInitials({
                forelUleScale: ar.forelUleScale,
                secchiDepth: ar.secchiDepth,
                readingPlace: ar.readingPlace,
            });
            reset({
                digitalReading: reading.id,
                rainPast24hrs: ar.rainPast24hrs,
                readingPlace: ar.readingPlace,
                forelUleScale: ar.forelUleScale,
                secchiDepth: ar.secchiDepth,
            });
            setFormKey(k => k + 1);
        } else if (reading) {
            setAnalogInitials(DEFAULT_INITIALS);
            reset({ ...DEFAULT_VALUES, digitalReading: reading.id });
            setFormKey(k => k + 1);
        }
    }, [digitalReadingValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const clearForm = () => {
        setSelectedReading(null);
        setAnalogInitials(DEFAULT_INITIALS);
        reset(DEFAULT_VALUES);
        setFormKey(k => k + 1);
    };

    const saveData = async (data) => {
        try {
            setSavingResult("Guardando");
            if (selectedReading?.analogReading) {
                await patchAnalogData(selectedReading.analogReading.id, data);
            } else {
                await postAnalogData(data);
            }
            setSavingResult("Guardado");
            clearForm();
            fetchReadings();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error saving data:', error);
            setSavingResult("Error al guardar, intenta de nuevo.");
        }
    };

    const onSubmit = async (data) => {
        data.digitalReading = +data.digitalReading;
        if (selectedReading?.analogReading) {
            setPendingData(data);
            setConfirmOpen(true);
        } else {
            await saveData(data);
        }
    };

    const handleConfirmYes = async () => {
        setConfirmOpen(false);
        await saveData(pendingData);
        setPendingData(null);
    };

    const handleConfirmNo = () => {
        setConfirmOpen(false);
        setPendingData(null);
        clearForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (loadingReadings) {
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
                <div ref={digitalReadingRef} style={{ width: '100%' }}>
                <SelectField
                    name="digitalReading"
                    label="Lectura digital"
                    control={control}
                    options={readings}
                    error={!!errors.digitalReading}
                    helperText={errors.digitalReading?.message}
                    rules={{ required: "La lectura digital es obligatoria" }}
                />
                </div>
                <SwitchField
                    name={"rainPast24hrs"}
                    control={control}
                    label={"Llovió en las últimas 24hrs"}
                    sx={gridItem}
                />
                <SliderField
                    key={`forelUleScale-${formKey}`}
                    name="forelUleScale"
                    control={control}
                    label="Escala Forel-Ule"
                    setValue={setValue}
                    initialValue={analogInitials.forelUleScale}
                    step={1}
                    shiftStep={3}
                    min={1}
                    max={21}
                    marks={forelUleMarks}
                    sx={gridItem}
                />
                <SliderField
                    key={`secchiDepth-${formKey}`}
                    name="secchiDepth"
                    control={control}
                    label="Disco Secchi (en cm)"
                    setValue={setValue}
                    initialValue={analogInitials.secchiDepth}
                    shiftStep={5}
                    step={1}
                    min={1}
                    max={60}
                    marks={secchiMarks}
                    sx={gridItem}
                />
                <ToggleButtonGroupField
                    key={`readingPlace-${formKey}`}
                    name="readingPlace"
                    value={analogInitials.readingPlace}
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
                <Snackbar
                    open={!!savingResult && savingResult.length > 0}
                    message={savingResult}
                    autoHideDuration={1200}
                    onClose={() => setSavingResult("")}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </Grid>
            <Dialog open={confirmOpen}>
                <DialogTitle>Confirmar modificación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Esto modificará la lectura análoga guardada, ¿desea continuar?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmNo}>No</Button>
                    <Button onClick={handleConfirmYes} variant="contained">Sí</Button>
                </DialogActions>
            </Dialog>
        </form>
    );
}

export default DataForm;
