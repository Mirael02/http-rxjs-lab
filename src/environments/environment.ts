export const environment = {
  production: false,
  apiBaseUrl: 'https://dummyjson.com',
  apiTimeout: 15000,
  enableLogging: true,
  pollInterval: 30000,
  newsApiUrl: 'https://gnews.io/api/v4',
  newsApiKey: process.env['NEWS_API_KEY'] || '648ab6b1c4830c76b931cef38337829f'
};