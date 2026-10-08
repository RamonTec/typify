export const fetchJsonText = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
    }
    const content = await response.text();
    JSON.parse(content);
    return content;
};
