import fsPromises from 'fs/promises';
import axios      from 'axios';
import log4js     from 'log4js';

import appConfig  from './config.js';

log4js.configure({
  appenders: {
    consoleAppender: {type: 'console', category: 'app'},
    fileAppender:    {type: 'file',    category: 'app', filename: 'app.log'},
  },
  categories: {
    default: {appenders: ['consoleAppender', 'fileAppender'], level: 'debug'},
    extra:   {appenders: ['fileAppender'],                    level: 'trace'},
  },
});

const logger = log4js.getLogger('app');
const extra  = log4js.getLogger('extra');

const {proxyHost, proxyPort} = appConfig;

const setProxy = () => {
  logger.debug(`Setting proxy`);
  process.env.http_proxy  = `http://${proxyHost}:${proxyPort}`;
  process.env.https_proxy = `http://${proxyHost}:${proxyPort}`;
  // https_proxy over http.
  // if using https:
  // https://github.com/axios/axios/issues/3459
  // unless we are using some https agent, explicitly in the code
};

const setNoproxy = (noProxy) => {
  logger.debug(`Setting no_proxy to ${noProxy}`);
  process.env.no_proxy = noProxy;
};

const unsetNoproxy = () => {
  if(process.env.no_proxy) {
    logger.debug(`Unsetting no_proxy`);
    delete process.env.no_proxy;
  }
};

const unsetProxy = () => {
  logger.debug(`Unsetting proxy`);
  delete process.env.http_proxy;
  delete process.env.https_proxy;
  // If setting them to null/undefined, axios would try to make the request to 127.0.0.1:80
  // process.env.http_proxy  = null; 
  // process.env.https_proxy = null;
};

const configs = [
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
];

const axiosRequest = async(options) => {
  let attempts   = 2;
  let result     = null;

  while(attempts > 0 && !result) {
    try {
      result = await axios(options);
    } catch(err) {
      if(err.response && err.response.status === 429) {
        // try again
        attempts -= 1;
      } else {
        attempts = 0;
        throw err;
      }
    }
  }

  return result || {};
};

const clearLogFile = async() => {
  try {
    await fsPromises.unlink('./app.log')
  } catch {
    // ...
  }
};

(async() => {
  await clearLogFile();
  logger.info(`
  Started checking proxy handling with axios.
  Configurations found ${configs.length}.
  Proxy server that would be used: ${proxyHost}:${proxyPort}
  `
  );
  logger.info('----------------------------------------------------------------------------------------------------------------')

  const onlyConfigs  = configs.filter(item => item.only);
  const finalConfigs = onlyConfigs.length ? onlyConfigs : configs;

  for(const config of finalConfigs) {
    const {name, proxy, expectation, noProxy, apiUrl} = config;

    logger.info(`[${name}] Start`);

    if(proxy) {
      setProxy();
    } else {
      unsetProxy();
    }

    if(noProxy) {
      setNoproxy(noProxy);
    } else {
      unsetNoproxy();
    }

    try {
      logger.info(`[${name}] Sending request`);
      const options = {
        method:        'get',
        responseType:  'json',
        url:           apiUrl,
        timeout:       40000, // proxy server might be slow, so take a reasonable timeout value
        // proxy: false,
      };
      const response = await axiosRequest(options);

      if(response && response.request) {
        logger.info(`[${name}] Host on response.request is ${response.request.host}`);
      }
    
      extra.trace(`Response \n`, response.data);
  
      if(response.data.query) {
        // for ip-api.com responses
        logger.info(`[${name}] Result: Request came from ${response.data.country}/${response.data.query}`);
      }
      if(response.data.country_name) {
        // for ipapi.co responses
        logger.info(`[${name}] Result: Request came from ${response.data.country_name}`);
      }


      // Check if expectation meets reality
      const {ip, query} = response.data;
      const source     = ip || query;

      if(expectation === 'proxy') {
        if(source === proxyHost) {
          logger.info(`[${name}] Expectation met. Request came from Proxy Server: ${source}`);
        } else {
          logger.warn(`[${name}] Expectation not met. Request did not came from Proxy server: ${source}`);
        }
      } else if(expectation === 'direct') {
        if(source !== proxyHost) {
          logger.info(`[${name}] Expectation met. Request did not came from Proxy Server: ${source}`);
        } else {
          logger.warn(`[${name}] Expectation not met. Request came from Proxy server: ${source}`);
        }
      }
    } catch(err) {
      logger.warn(`[${name}] Failed`, err.message);
    } finally {
      logger.info('----------------------------------------------------------------------------------------------------------------');
    }
  }
})();