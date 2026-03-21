import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Typography, Box } from '@mui/material';

const ZoneBoxplot = ({ title, unit, categories, boxData, counts }) => {
    const chartRef = useRef(null);

    // Force resize when data changes (handles MUI Drawer visibility quirk)
    useEffect(() => {
        setTimeout(() => {
            chartRef.current?.getEchartsInstance().resize();
        }, 100);
    }, [categories, boxData]);

    const validData = boxData.filter(Boolean);
    if (validData.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                    Sin suficientes datos
                </Typography>
            </Box>
        );
    }

    const option = {
        title: { text: title, left: 'center', textStyle: { fontSize: 13 } },
        tooltip: {
            trigger: 'item',
            formatter: (params) => {
                if (params.seriesType !== 'boxplot') return '';
                const [min, q1, med, q3, max] = params.data;
                const n = counts[params.dataIndex];
                return `
                    <b>${params.name}</b><br/>
                    Máx: ${max?.toFixed(2)} ${unit}<br/>
                    Q3: ${q3?.toFixed(2)} ${unit}<br/>
                    Mediana: ${med?.toFixed(2)} ${unit}<br/>
                    Q1: ${q1?.toFixed(2)} ${unit}<br/>
                    Mín: ${min?.toFixed(2)} ${unit}<br/>
                    n = ${n}
                `;
            },
        },
        grid: { left: 40, right: 10, bottom: 60, top: 40 },
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: { rotate: 30, fontSize: 10 },
        },
        yAxis: {
            type: 'value',
            name: unit,
            nameTextStyle: { fontSize: 10 },
        },
        series: [
            {
                type: 'boxplot',
                data: boxData,
                itemStyle: { color: '#90caf9', borderColor: '#1565c0' },
            },
        ],
    };

    return (
        <ReactECharts
            ref={chartRef}
            option={option}
            notMerge
            style={{ height: 280 }}
        />
    );
};

export default ZoneBoxplot;
