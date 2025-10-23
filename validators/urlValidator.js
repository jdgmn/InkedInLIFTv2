// Safe URL validator using the WHATWG URL API
module.exports = function validateUrl(value) {
  if (!value) return false;
  try {
    const u = new URL(String(value));
    return ["http:", "https:"].includes(u.protocol);
  } catch (err) {
    return false;
  }
};