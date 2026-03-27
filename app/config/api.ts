import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.apiUrl;

if (!API_BASE) {
    throw new Error("API URL not configured in app.json");
}

console.log("[PRODUCTION API BASE]:", API_BASE);

export const CHATBOT_URL = `${API_BASE}/api/chatbot`;
export const NOTIFICATIONS_URL = `${API_BASE}/api/notifications/send`;
