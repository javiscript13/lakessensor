import React, { useState } from 'react';
import {
    Drawer, Box, Typography, IconButton, Grid, Divider, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimeBucketSelector from './TimeBucketSelector';
import ZoneBoxplot from './ZoneBoxplot';
import { GRANULARITIES, buildBoxplotSeries } from '../utils/timeBuckets';

const METRICS = [
    { key: 'ph',          title: 'pH',                  unit: 'pH' },
    { key: 'waterTemp',   title: 'Temperatura del agua', unit: '°C' },
    { key: 'secchiDepth', title: 'Disco Secchi',         unit: 'cm' },
];

const ZoneBoxplotPanel = ({ open, onClose, cellSessions }) => {
    const [granularity, setGranularity] = useState(GRANULARITIES.MONTH);

    const digitalCount = (cellSessions || []).reduce((acc, s) => acc + (s.readings?.length || 0), 0);
    const analogCount  = (cellSessions || []).filter(s => s.analogReading).length;

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 600 }, p: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Análisis temporal</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {cellSessions?.length || 0} sesiones · {digitalCount} lecturas digitales · {analogCount} lecturas análogas
            </Typography>

            <TimeBucketSelector value={granularity} onChange={setGranularity} />
            <Divider sx={{ mb: 2 }} />

            {analogCount < 3 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Pocos datos análogos en esta zona. El disco Secchi puede no ser representativo.
                </Alert>
            )}

            <Grid container spacing={2}>
                {METRICS.map(({ key, title, unit }) => {
                    const { categories, boxData, counts } = buildBoxplotSeries(cellSessions || [], key, granularity);
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

export default ZoneBoxplotPanel;
