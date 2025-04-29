// Simple validation utilities

export const isRequired = (value) => {
  return value ? '' : 'Field is required';
};

export const isEmail = (value) => {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(value) ? '' : 'Invalid email format';
};

export const isPhoneNumber = (value) => {
  const regex = /^\\+[1-9]\\d{1,14}$/;
  return regex.test(value) ? '' : 'Invalid phone number format';
};

export const minLength = (value, length) => {
  return value && value.length >= length ? '' : `Minimum length is ${length}`;
};

export const maxLength = (value, length) => {
  return value && value.length <= length ? '' : `Maximum length is ${length}`;
};

export const isNumber = (value) => {
  return !isNaN(value) ? '' : 'Must be a number';
};

export const isPositiveNumber = (value) => {
  return !isNaN(value) && Number(value) > 0 ? '' : 'Must be a positive number';
};
