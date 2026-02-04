export const formatJson = (jsonString: string): string => {
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        throw new Error("No se puede formatear: JSON inválido");
    }
};

export const minifyJson = (jsonString: string): string => {
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed);
    } catch (error) {
        throw new Error("No se puede minificar: JSON inválido");
    }
};