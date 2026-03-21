import { computeBoxplotStats } from './boxplotStats';

export const GRANULARITIES = {
    TIME_OF_DAY: 'timeOfDay',
    DAY:         'day',
    WEEK:        'week',
    MONTH:       'month',
    YEAR:        'year',
};

const GT_TIMEZONE = 'America/Guatemala';

const toGTDate = (dateString) => new Date(new Date(dateString).toLocaleString('en-US', { timeZone: GT_TIMEZONE }));

const isoWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return `${d.getFullYear()}-W${String(Math.ceil(d.getDate() / 7)).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getTimeBucketKey = (dateString, granularity) => {
    const d = toGTDate(dateString);
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

// metric: 'ph' | 'waterTemp' | 'secchiDepth'
export const buildBoxplotSeries = (sessions, metric, granularity) => {
    const buckets = new Map();

    for (const session of sessions) {
        if (metric === 'secchiDepth') {
            const val = session.analogReading?.secchiDepth;
            if (val == null) continue;
            const key = getTimeBucketKey(session.oldestReadingTime, granularity);
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key).push(Number(val));
        } else {
            for (const reading of session.readings || []) {
                const val = reading[metric];
                if (val == null) continue;
                const key = getTimeBucketKey(reading.readDate, granularity);
                if (!buckets.has(key)) buckets.set(key, []);
                buckets.get(key).push(Number(val));
            }
        }
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
