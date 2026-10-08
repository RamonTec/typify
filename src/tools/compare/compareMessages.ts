export interface CompareEmptyMessage {
    title: string;
    description: string;
}

export const compareEmptyMessage = (expected: string, actual: string): CompareEmptyMessage | null => {
    const hasExpected = expected.trim() !== "";
    const hasActual = actual.trim() !== "";

    if (hasExpected && hasActual) return null;

    if (!hasExpected && !hasActual) {
        return {
            title: "Esperando datos...",
            description: "Pega el JSON esperado y el actual en el panel de entrada para compararlos.",
        };
    }

    if (!hasExpected) {
        return {
            title: "Falta el JSON esperado",
            description: "Pega la estructura que la API espera (el DTO o contrato) en el editor «Esperado».",
        };
    }

    return {
        title: "Falta el JSON actual",
        description: "Pega el payload real (la respuesta o la petición) en el editor «Actual».",
    };
};
