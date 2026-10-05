export interface JwtDecodeResult {
  valid: boolean;
  payload: string;
  header: Record<string, unknown> | null;
  error?: string;
}

const base64UrlDecode = (str: string): string => {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  return atob(base64 + padding);
};

export const decodeJwtPayload = (token: string): JwtDecodeResult => {
  if (!token.trim()) {
    return { valid: false, payload: '', header: null, error: 'Token vacío' };
  }

  const parts = token.trim().split('.');

  if (parts.length !== 3) {
    if (parts.length === 5) {
      return {
        valid: false,
        payload: '',
        header: null,
        error: 'JWE (token encriptado) detectado. Typify solo decodifica tokens JWS sin encriptar.'
      };
    }
    return {
      valid: false,
      payload: '',
      header: null,
      error: `Token inválido: se esperaban 3 partes separadas por ".", se encontraron ${parts.length}`
    };
  }

  try {
    const headerStr = base64UrlDecode(parts[0]);
    const header = JSON.parse(headerStr) as Record<string, unknown>;

    const payloadStr = base64UrlDecode(parts[1]);
    const payloadObj = JSON.parse(payloadStr);

    return {
      valid: true,
      payload: JSON.stringify(payloadObj, null, 2),
      header,
    };
  } catch {
    return {
      valid: false,
      payload: '',
      header: null,
      error: 'Error al decodificar el token: base64 o JSON inválido en header/payload'
    };
  }
};
