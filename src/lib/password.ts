// Account password rule: more than 10 characters, with uppercase, lowercase and a special character.
export const PASSWORD_MIN = 11;

export function passwordChecks(pw: string) {
  return {
    length: pw.length >= PASSWORD_MIN,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

export function isStrongPassword(pw: string) {
  return Object.values(passwordChecks(pw)).every(Boolean);
}
