const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value) => typeof value === 'string' && value.length <= 254 && EMAIL_REGEX.test(value.trim());

export const normalizeEmail = (value) => String(value).trim().toLowerCase();

export const parseId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

// Keeps only the listed keys whose value is not undefined.
export const pick = (obj, keys) =>
    Object.fromEntries(keys.filter((k) => obj?.[k] !== undefined).map((k) => [k, obj[k]]));

export const isNonEmptyString = (value, max = 255) =>
    typeof value === 'string' && value.trim().length > 0 && value.length <= max;

export const optionalString = (value, max = 255) =>
    value === undefined || value === null || (typeof value === 'string' && value.length <= max);
