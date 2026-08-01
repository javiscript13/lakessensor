export const GT_TIMEZONE = 'America/Guatemala';

// toLocaleString's first argument is locale (formatting conventions), not timezone -
// without an explicit `timeZone`, it renders in the viewer's own device/browser
// timezone, which silently shows the wrong wall-clock time for anyone not set to
// Guatemala's zone (e.g. a UTC-configured dev machine).
export const formatDateTimeGT = (dateString) =>
    new Date(dateString).toLocaleString('es-GT', { timeZone: GT_TIMEZONE });
