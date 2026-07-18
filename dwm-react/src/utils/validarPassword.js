// Requisitos minimos de contraseña (mismo criterio que el backend):
// 8+ caracteres, con mayuscula, minuscula y numero.
export function validarPassword(p) {
  if (!p || p.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(p)) return 'Debe incluir al menos una letra mayúscula';
  if (!/[a-z]/.test(p)) return 'Debe incluir al menos una letra minúscula';
  if (!/[0-9]/.test(p)) return 'Debe incluir al menos un número';
  return null;
}

export const REQ_PASSWORD = 'Mínimo 8 caracteres, con mayúscula, minúscula y número.';
