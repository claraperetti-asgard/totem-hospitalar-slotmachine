const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';
const normalizedApiBaseUrl = configuredApiBaseUrl.endsWith('/')
    ? configuredApiBaseUrl.slice(0, -1)
    : configuredApiBaseUrl;

export function apiUrl(path: string) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedApiBaseUrl}${normalizedPath}`;
}
