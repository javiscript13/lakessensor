import React from 'react';
import { ToggleButtonGroup, ToggleButton, Typography, Box } from '@mui/material';
import { GRANULARITIES } from '../utils/timeBuckets';

const options = [
    { value: GRANULARITIES.TIME_OF_DAY, label: 'Hora del día' },
    { value: GRANULARITIES.DAY,         label: 'Día' },
    { value: GRANULARITIES.WEEK,        label: 'Semana' },
    { value: GRANULARITIES.MONTH,       label: 'Mes' },
    { value: GRANULARITIES.YEAR,        label: 'Año' },
];

const TimeBucketSelector = ({ value, onChange }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            Agrupar por
        </Typography>
        <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, val) => { if (val) onChange(val); }}
            size="small"
        >
            {options.map(opt => (
                <ToggleButton key={opt.value} value={opt.value}>
                    {opt.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    </Box>
);

export default TimeBucketSelector;
