import axios from 'axios';
import { getBaseUrl } from './llmConfig';

export const createApiClient = (apiKey: string) => {
  return axios.create({
    baseURL: getBaseUrl(),
    timeout: 60000,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
};
