import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import DigitalReadingForm from '../components/forms/DigitalReadingForm';
import LakeSampleForm from '../components/forms/LakeSampleForm';

const DataForm = () => {
    const [tab, setTab] = useState(0);

    return (
        <Box>
            <Tabs
                value={tab}
                onChange={(_, newTab) => setTab(newTab)}
                centered
                sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Lecturas digitales" />
                <Tab label="Muestras fisicoquímicas" />
            </Tabs>
            {tab === 0 && <DigitalReadingForm />}
            {tab === 1 && <LakeSampleForm />}
        </Box>
    );
}

export default DataForm;
