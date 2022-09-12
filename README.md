# axios-test

## Purpose

Reasearch, check and test if axios handles correctly proxy, using its native functionality, based on environment variables: `http_proxy`, `https_proxy`, `no_proxy`


## Proxy server

- In order to simulate a `behind corporate proxy` situation, used a proxy server found on `https://www.freeproxylists.net/?s=u`
- They are pretty unstable, so we might have to switch the proxy server that we are using for test
- Feel free to overwrite `proxyHost` and `proxyPort` in `config.js`


## run
1. npm install
2. node app.js

### Output

Output will be written in standard output and also `app.log` (file logs contains a little bit more information)

## Findings

- Using some geolocation free APIs (`ip-api.com`, `ipapi.co`), looks like the requests are coming from the expected place (proxy/local)
- Need a stable proxy server
- From my past experience with axios and proxy, behind a corporate proxy, I had to explicitly set the proxy in the request options. This might be fixed now.
- axios still have problems handling correctly `https` topic (`no_proxy` with port or `https` related proxies). In different scenarios, weird ssl errors are thrown.
- Using a proxy server over http for both, https_proxy and http_proxy + no_proxy containing values without ports, works fine
- For working properly with `https_proxy`, in most cases, an `https proxy agent` is required


## Related topics

- https://github.com/axios/axios/issues/4369
- https://github.com/axios/axios/pull/565
- https://github.com/axios/axios/issues/3459
