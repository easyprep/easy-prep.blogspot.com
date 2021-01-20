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

const appendChild = (html, parent)=>{
let child = document.createElement('div');
child.innerHTML = html;
parent.appendChild(child);
}

const prependChild = (html, parent)=>{
let child = document.createElement('div');
child.innerHTML = html;
parent.insertBefore(child,parent.firstChild);
}

//Main
window.qObj = qs.parse(location.search);

// Events
window.onload = (e) => {
    let cache = parseContent(document);
    setCache(location, cache);
    window.history.pushState(cache, cache.title, location.href);
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
        window.history.pushState(cache, cache.title, a.href);
        console.log('From Cache : ', a.href);
        prependChild('<p>'+cache.ts+'</p>',$('#main'));
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

        let cache = parseContent(doc);
        setCache(a, cache);
        showContent(cache);
        window.history.pushState(cache, cache.title, a.href);

        console.log('From Server : ', a.href);
    }).catch(e => {
        $('#loading').style.display = "none";
        console.log(e);
    });
}

function parseContent(doc) {
    let content = $('#app', doc).innerHTML;
    let title = $('title', doc)[0].text;
    return { title, content };
}

function showContent(cache) {
    $('#app').innerHTML = cache.content;
    document.title = cache.title;
}

function getCache(a) {
    let path = a.pathname + removeQueryParam(a.search, ['m']);
    let storage = path.indexOf('.html') != -1 ? localStorage : sessionStorage;
    return storage[path] ? JSON.parse(storage[path]) : null;
}

function setCache(a, cache) {
    let path = a.pathname + removeQueryParam(a.search, ['m']);
    let storage = path.indexOf('.html') != -1 ? localStorage : sessionStorage;
    try {
        storage[path] = JSON.stringify({ ts: Date.now(), ...cache });
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