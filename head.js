console.log('head.js');
const m = parseInt(location.search.split(/[?&]/).filter(a=>a.split('=')[0]=='m').map(a=>a.split('=')[1]).join());
console.log(m);

// Constants
const shortTermCache = 1; //minute
const longTermCache = 30; //minutes


// Dom Selector
const $ = function (selector, doc = document) {
    return selector.split(/[ >]/).pop().indexOf('#') == 0 ? doc.querySelector(selector) : doc.querySelectorAll(selector);
}

// Events
window.onload = (e)=>{
    let cache = parseContent(document, location);
    setCache(cache);
    window.history.pushState(cache, cache.title, cache.href);
}

window.onpopstate = (e)=>{
    showContent(e.state);
}

// Common Functions
function GoUsingAjax(a) {
    
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

        let cache = parseContent(doc,a);
        setCache(cache);
        showContent(cache);

        console.log('From Server : ', a.href);
    }).catch(e => {
        $('#loading').style.display = "none";
        console.log(e);
    });
}

function parseContent(doc,a) {
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
    let s = a.href.indexOf('.html') != -1 ? localStorage : sessionStorage;
    return s[a.href] ? JSON.parse(s[a.href]) : null;
}

function setCache(cache) {
    let s = cache.href.indexOf('.html') != -1 ? localStorage : sessionStorage;
    try {
        s[cache.href] = JSON.stringify(cache);
    } catch (e) {
        console.log(e);
    }
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