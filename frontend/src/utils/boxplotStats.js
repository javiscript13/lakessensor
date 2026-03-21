// Returns [min, Q1, median, Q3, max] or null if fewer than 3 values
export const computeBoxplotStats = (values) => {
    if (!values || values.length < 3) return null;
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
