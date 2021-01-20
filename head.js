console.log('head.js');

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
        str.split(/[?&]/).filter((a, i) => i).forEach(a => {
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
    let href = a.pathname + removeQueryParam(a.search, ['m']);
    return { htm, title, href };
}

function showContent(cache) {
    $('#app').innerHTML = cache.htm;
    document.title = cache.title;
}

function getCache(a) {
    let path = a.pathname + removeQueryParam(a.search, ['m']);
    let storage = path.indexOf('.html') != -1 ? localStorage : sessionStorage;
    return storage[path] ? JSON.parse(storage[path]) : null;
}

function setCache(cache) {
    let s = cache.href.indexOf('.html') != -1 ? localStorage : sessionStorage;
    try {
        s[cache.href] = JSON.stringify({ ts: Date.now(), ...cache });
    } catch (e) {
        console.log(e);
    }
}

function removeQueryParam(str, params) {
    let qObj = qs.parse(str);
    params.forEach(p => {
        delete qObj[p];
    });
    return qs.stringify(qObj);
}