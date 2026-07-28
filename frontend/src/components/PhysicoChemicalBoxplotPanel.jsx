import React, { useState } from 'react';
import {
    Drawer, Box, Typography, IconButton, Grid, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimeBucketSelector from './TimeBucketSelector';
import ZoneBoxplot from './ZoneBoxplot';
import { GRANULARITIES, buildPhysicoChemicalBoxplotSeries } from '../utils/timeBuckets';

const METRICS = [
    { key: 'conductivity',         title: 'Conductividad (CE)',              unit: 'µS/cm' },
    { key: 'totalDissolvedSolids', title: 'Sólidos disueltos totales (SDT)', unit: 'mg/L' },
    { key: 'nitrates',             title: 'Nitratos (NO3)',                  unit: 'mg/L' },
    { key: 'nitrites',             title: 'Nitritos (NO2)',                  unit: 'mg/L' },
    { key: 'phosphates',           title: 'Fosfatos (PO4)',                  unit: 'mg/L' },
    { key: 'ammonium',             title: 'Amonio (NH4)',                    unit: 'mg/L' },
    { key: 'totalPhosphorus',      title: 'Fósforo total (PT)',              unit: 'mg/L' },
    { key: 'totalNitrogen',        title: 'Nitrógeno total (NT)',            unit: 'mg/L' },
    { key: 'sulfates',             title: 'Sulfatos (SO4)',                  unit: 'mg/L' },
];

const PhysicoChemicalBoxplotPanel = ({ open, onClose, cellSamples }) => {
    const [granularity, setGranularity] = useState(GRANULARITIES.MONTH);

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 600 }, p: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Análisis temporal de variables fisicoquímicas</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {cellSamples?.length || 0} muestras de laboratorio
            </Typography>

            <TimeBucketSelector value={granularity} onChange={setGranularity} exclude={[GRANULARITIES.TIME_OF_DAY]} />
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
                {METRICS.map(({ key, title, unit }) => {
                    const { categories, boxData, counts } = buildPhysicoChemicalBoxplotSeries(cellSamples || [], key, granularity);
                    return (
                        <Grid item xs={12} key={key}>
                            <ZoneBoxplot
                                title={title}
                                unit={unit}
                                categories={categories}
                                boxData={boxData}
                                counts={counts}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Drawer>
    );
};

export default PhysicoChemicalBoxplotPanel;
