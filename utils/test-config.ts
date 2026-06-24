export const config = {
  baseUrl: process.env.BASE_URL || 'https://gxcapture-redbird-dc.galaxe.com:6500',
  portalUrl: '/portal#/',
  credentials: {
    username: process.env.USERNAME || 'slogan11',
    password: process.env.PASSWORD || 'Simlaworld@123',
  },
  timeouts: {
    navigation: 60000,
    action: 30000,
    assertion: 15000,
  },
};
