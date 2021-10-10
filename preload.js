'use strict';

var port = 8080;

var Proxy = require('http-mitm-proxy');
var proxy = Proxy();


window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    proxy.onError(function (ctx, err, errorKind) {
        var url = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest.url : '';
        console.error(errorKind + ' on ' + url + ':', err);
    });

    //process incoming request
    proxy.onRequest(function (ctx, callback) {
        //console.log("url"+ctx.clientToProxyRequest.url)
        //console.log('REQUEST: http://' + ctx.clientToProxyRequest.headers.host + ctx.clientToProxyRequest.url);

        if (ctx.clientToProxyRequest.headers.host) {
            ctx.use(Proxy.gunzip);
            ctx.onResponseData(function (ctx, chunk, callback) {
                chunk = new Buffer(chunk.toString())
                return callback(null, chunk);
            });
        }
        return callback();
    });

    proxy.onRequestData(function (ctx, chunk, callback) {
        console.log('request data length: ' + chunk.length);
        return callback(null, chunk);
    });

    proxy.onResponse(function (ctx, callback) {
        console.log('RESPONSE: http://' + ctx.clientToProxyRequest.headers.host + ctx.clientToProxyRequest.url);
        return callback(null);
    });

    proxy.onResponseData(function (ctx, chunk, callback) {
        console.log('response data length: ' + chunk.length);
        return callback(null, chunk);
    });

    proxy.listen({ port: port });
    console.log('listening on ' + port);

    for (const dependency of ['port']) {
        replaceText(`${dependency}`, [port])
    }
})