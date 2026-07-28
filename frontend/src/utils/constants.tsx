// In production nginx terminates TLS and proxies /api to the backend, so the
// API is same-origin. Dev still talks to the backend port directly.
export const BASE_URL = process.env.DEPLOY_MODE === "server"
? "/api"
: "http://localhost:7171";
export const audienceOptions = [
  { value: "scientists", label: "Scientists and Researchers" },
  { value: "students", label: "Students and Academics" },
  { value: "industry", label: "Industry Professionals" },
  { value: "journalists", label: "Journalists and Media Professionals" },
  { value: "general", label: "General Public (Non-Expert)" },
];
