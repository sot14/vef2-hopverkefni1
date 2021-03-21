const MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
];

export function isEmpty(s) {
  return s != null && !s;
}
export function isInt(i) {
  return i !== '' && Number.isInteger(Number(i));
}

export function isString(s) {
  return typeof s === 'string';
}

export function isBoolean(b) {
  return typeof b === 'boolean';
}

// validation fyrir date
export async function isDate(date) {
  var temp = date.split('-');
  var d = new Date(temp[2] + '-' + temp[0] + '-' + temp[1]);
  return (d && (d.getMonth() + 1) == temp[0] && d.getDate() == Number(temp[1]) && d.getFullYear() == Number(temp[2]));
}

export function lengthValidationError(s, min, max) {
  const length = s && s.length ? s.length : 'undefined';

  const minMsg = min ? `at least ${min} characters` : '';
  const maxMsg = max ? `at most ${max} characters` : '';
  const msg = [minMsg, maxMsg].filter(Boolean).join(', ');
  const lenMsg = `Current length is ${length}.`;

  return `Must be non empty string ${msg}. ${lenMsg}`;
}

export function isNotEmptyString(s, { min = undefined, max = undefined } = {}) {
  if (typeof s !== 'string' || s.length === 0) {
    return false;
  }

  if (max && s.length > max) {
    return false;
  }

  if (min && s.length < min) {
    return false;
  }

  return true;
}

export function toPositiveNumberOrDefault(value, defaultValue) {
  const cast = Number(value);
  const clean = Number.isInteger(cast) && cast > 0 ? cast : defaultValue;

  return clean;
}

export function validateImageMimetype(mimetype) {
  return MIMETYPES.indexOf(mimetype.toLowerCase()) >= 0;
}