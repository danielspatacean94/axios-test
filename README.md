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

- Using some free APIs (`ip-api.com`, `ipapi.co`, `httpbin.org`), looks like the requests are, usually, coming from the expected place (proxy/local)
- Need a stable proxy server
- From my past experience with axios and proxy, behind a corporate proxy, I had to explicitly set the proxy in the request options. This might be fixed now.
- Found issues with `no_proxy` vs `https_proxy` and `http_proxy`, when working with ports, like :443, :80
- Using a proxy server over http for both, https_proxy and http_proxy + no_proxy containing values without ports, works fine
- For working properly with `https_proxy`, in most cases, an `https proxy agent` is required


## Related topics

- https://github.com/axios/axios/issues/4369
- https://github.com/axios/axios/pull/565
- https://github.com/axios/axios/issues/3459
