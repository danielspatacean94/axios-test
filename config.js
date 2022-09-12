export default {
  // using a proxy server that I found on https://www.freeproxylists.net/?s=u and/or https://www.sslproxies.org/
  proxyHost: '104.161.21.107',
  proxyPort: '2019',

  testCases: [
    {
      name:  'http://ip-api.com/json using proxy',
      apiUrl: 'http://ip-api.com/json',
      proxy: true,
      expectation: 'proxy',
    },
    {
      name: 'http://ip-api.com/json without proxy',
      apiUrl: 'http://ip-api.com/json',
      proxy: false,
      expectation: 'direct',
    },
    {
      name:  'http://ip-api.com/json using proxy and no_proxy = *',
      apiUrl: 'http://ip-api.com/json',
      proxy: true,
      noProxy: '*',
      expectation: 'direct',
    },
    {
      name: 'https://ipapi.co/json using proxy',
      apiUrl: 'https://ipapi.co/json',
      proxy: true,
      expectation: 'proxy',
    },
    {
      name: 'https://ipapi.co/json without proxy',
      apiUrl: 'https://ipapi.co/json',
      proxy: false,
      expectation: 'direct',
    },
    {
      name: 'http://ipapi.co/json with proxy + no_proxy = ipapi.co',
      apiUrl: 'http://ipapi.co/json',
      proxy: true,
      noProxy: 'ipapi.co',
      expectation: 'direct',
    },
    {
      name: 'http://ipapi.co/json with proxy + no_proxy = ipapi.co:443',
      apiUrl: 'http://ipapi.co/json',
      proxy: true,
      noProxy: 'ipapi.co:443',
      expectation: 'direct',
    },
    {
      name: 'https://ipapi.co/json with proxy + no_proxy = ipapi.co',
      apiUrl: 'https://ipapi.co/json',
      proxy: true,
      noProxy: 'ipapi.co',
      expectation: 'direct',
    },
    {
      name: 'https://ipapi.co/json with proxy + no_proxy = ipapi.co:443',
      apiUrl: 'https://ipapi.co/json',
      proxy: true,
      noProxy: 'ipapi.co:443',
      expectation: 'direct',
    },
  ]
};
