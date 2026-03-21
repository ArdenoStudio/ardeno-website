export const setCookie = (
    name: string,
    value: string,
    days: number = 30
) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }

    return null;
};

export const deleteCookie = (name: string) => {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
};