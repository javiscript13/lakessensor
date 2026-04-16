// Returns [min, Q1, median, Q3, max] or null if no values
export const computeBoxplotStats = (values) => {
    if (!values || values.length === 0) return null;
    if (values.length === 1) {
        const v = values[0];
        return [v, v, v, v, v];
    }
    if (values.length === 2) {
        const [a, b] = values.slice().sort((x, y) => x - y);
        const mid = (a + b) / 2;
        return [a, a, mid, b, b];
    }
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;

    const quantile = (arr, q) => {
        const pos = (arr.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (arr[base + 1] !== undefined) {
            return arr[base] + rest * (arr[base + 1] - arr[base]);
        }
        return arr[base];
    };

    return [
        sorted[0],
        quantile(sorted, 0.25),
        quantile(sorted, 0.5),
        quantile(sorted, 0.75),
        sorted[n - 1],
    ];
};
