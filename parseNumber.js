function parseOptionalNumber(value, fieldName) {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

module.exports = parseOptionalNumber;
