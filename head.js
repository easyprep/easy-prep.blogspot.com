console.log('head.js');

// Constants
const shortTermCache = 1; //minute
const longTermCache = 30; //minutes

// Query String
const qs = {
    stringify: (json) => {
        let qs =
            Object.keys(json).map(function (key) {
                return encodeURIComponent(key) + '=' +
                    encodeURIComponent(json[key]);
            }).join('&');
        return qs ? '?' + qs : '';
    },
    parse: (str) => {
        let json = {};
        str.split(/[?&]/).filter(a => !!a).forEach(a => {
            let f = a.split('=');
            json[f[0]] = f[1];
        });
        return json;
    }
}

// Dom Selector
const $ = function (selector, doc = document) {
    return selector.split(/[ >]/).pop().indexOf('#') == 0 ? doc.querySelector(selector) : doc.querySelectorAll(selector);
}

//Main
window.qObj = qs.parse(location.search);

// Events
window.onload = (e) => {
    let cache = parseContent(document, location);
    setCache(cache);
    window.history.pushState(cache, cache.title, cache.href);
}

window.onpopstate = (e) => {
    showContent(e.state);
}

// Common Functions
function GoUsingAjax(a) {

    if (a.nodeName == 'FORM') {
        let url = a.action + '?' + new URLSearchParams(new FormData(a)).toString();
        a = document.createElement('a');
        a.href = url;
    }

    if (window.qObj.m) {
        let qObj = qs.parse(a.search);
        qObj.m = window.qObj.m;
        a.search = qs.stringify(qObj);
    }

    if (location.href == a.href) return;

    let cache = getCache(a);

    if (cache) {
        showContent(cache);
        window.history.pushState(cache, cache.title, cache.href);
        console.log('From Cache : ', a.href);
    } else {
        loadFromServer(a);
    }
}

function loadFromServer(a) {

    $('#loading').style.display = "";

    fetch(a.href).then(res => res.text()).then(html => {

        $('#loading').style.display = "none";

        let doc = document.createElement('html');
        doc.innerHTML = html;

        let cache = parseContent(doc, a);
        setCache(cache);
        showContent(cache);
        window.history.pushState(cache, cache.title, cache.href);

        console.log('From Server : ', a.href);
    }).catch(e => {
        $('#loading').style.display = "none";
        console.log(e);
    });
}

function parseContent(doc, a) {
    let htm = $('#app', doc).innerHTML;
    let title = $('title', doc)[0].text;
    let href = a.href;
    return { htm, title, href };
}

function showContent(cache) {
    $('#app').innerHTML = cache.htm;
    document.title = cache.title;
}

function getCache(a) {
    a = sanitizeLink(a);
    let storage = a.href.indexOf('.html') != -1 ? localStorage : sessionStorage;
    return storage[a.href] ? JSON.parse(storage[a.href]) : null;
}

function setCache(cache) {
    let a = document.createElement('a');
    a.href = cache.href;
    a = sanitizeLink(a);
    let s = a.href.indexOf('.html') != -1 ? localStorage : sessionStorage;
    try {
        s[a.href] = JSON.stringify({ ts: Date.now(), ...cache });
    } catch (e) {
        console.log(e);
    }
}

function sanitizeLink(a) {
    let qObj = qs.parse(a.search);
    delete qObj.m;
    a.search = qs.stringify(qObj);
    return a;
}


//Extra
    // if (a.pathname == '/' || a.pathname.indexOf('/search/') == 0) {
    //     expiry = shortTermCache;
    // }

    // if (!!a.search && a.pathname == '/search') {
    //     cache.path = a.pathname + a.search + a.hash;
    // } else {
    //     localStorage['cache:/' + a.pathname] = JSON.stringify(cache);
    // }