import { computeBoxplotStats } from './boxplotStats';

export const GRANULARITIES = {
    TIME_OF_DAY: 'timeOfDay',
    DAY:         'day',
    WEEK:        'week',
    MONTH:       'month',
    YEAR:        'year',
};

const GT_TIMEZONE = 'America/Guatemala';

// dateOnly: true for plain YYYY-MM-DD values (e.g. LakeSample.samplingDate) that have no
// time-of-day component — parsing those as UTC and reprojecting to Guatemala time (UTC-6)
// would push them back a calendar day, so they're read as local wall-clock dates instead.
const toGTDate = (dateString, dateOnly = false) => {
    if (dateOnly) return new Date(`${dateString}T00:00:00`);
    return new Date(new Date(dateString).toLocaleString('en-US', { timeZone: GT_TIMEZONE }));
};

const isoWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return `${d.getFullYear()}-W${String(Math.ceil(d.getDate() / 7)).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getTimeBucketKey = (dateString, granularity, dateOnly = false) => {
    const d = toGTDate(dateString, dateOnly);
    const h = d.getHours();
    switch (granularity) {
        case GRANULARITIES.TIME_OF_DAY:
            if (h < 12) return 'Mañana (0-11h)';
            if (h < 18) return 'Tarde (12-17h)';
            return 'Noche (18-23h)';
        case GRANULARITIES.DAY:
            return d.toLocaleDateString('es-GT');
        case GRANULARITIES.WEEK:
            return isoWeekStart(d);
        case GRANULARITIES.MONTH:
            return d.toLocaleDateString('es-GT', { year: 'numeric', month: 'long' });
        case GRANULARITIES.YEAR:
            return String(d.getFullYear());
        default:
            return String(d.getFullYear());
    }
};

const TIME_OF_DAY_ORDER = ['Mañana (0-11h)', 'Tarde (12-17h)', 'Noche (18-23h)'];

const sortedCategories = (keys, granularity) => {
    if (granularity === GRANULARITIES.TIME_OF_DAY) {
        return TIME_OF_DAY_ORDER.filter(k => keys.has(k));
    }
    return [...keys].sort();
};

// Buckets `items` by time (via getTime) and value (via getValue), then computes
// per-bucket boxplot stats. Shared by buildBoxplotSeries and
// buildPhysicoChemicalBoxplotSeries — they only differ in how time/value are read.
const buildSeriesFromItems = (items, granularity, getTime, getValue, dateOnly = false) => {
    const buckets = new Map();

    for (const item of items) {
        const val = getValue(item);
        if (val == null) continue;
        const time = getTime(item);
        if (!time) continue;
        const key = getTimeBucketKey(time, granularity, dateOnly);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(Number(val));
    }

    const categories = sortedCategories(new Set(buckets.keys()), granularity);
    const boxData = [];
    const counts = [];

    for (const cat of categories) {
        const values = buckets.get(cat) || [];
        boxData.push(computeBoxplotStats(values));
        counts.push(values.length);
    }

    return { categories, boxData, counts };
};

// metric: 'ph' | 'waterTemp' | 'secchiDepth'
export const buildBoxplotSeries = (sessions, metric, granularity) => {
    const getTime = (session) => session.oldestReadingTime;
    const getValue = (session) => {
        if (metric === 'secchiDepth') return session.analogReading?.secchiDepth;
        const metricToAvg = {
            ph:        'avgPh',
            waterTemp: 'avgWaterTemp',
        };
        const avgField = metricToAvg[metric];
        return avgField ? session[avgField] : null;
    };
    return buildSeriesFromItems(sessions, granularity, getTime, getValue);
};

// metric: any physicochemical field on LakeSample, e.g. 'conductivity', 'nitrates', ...
export const buildPhysicoChemicalBoxplotSeries = (samples, metric, granularity) => {
    const getTime = (sample) => sample.samplingDate;
    const getValue = (sample) => sample[metric];
    return buildSeriesFromItems(samples, granularity, getTime, getValue, true);
};
