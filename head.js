console.log('head.js');
// Constants
const noCachePaths = ["/search"];

// Dom Selector
const $ = function (selector, doc = document) {

    if (selector.indexOf('#') == 0) {
        return doc.querySelector(selector);
    } else {
        return doc.querySelectorAll(selector);
    }

}

// Events
window.onload = function (e) {
    let cahce = cacheDocument(document, location);
    window.history.pushState(cache, cache.title, cache.path);
}

window.onpopstate = function (e) {
    showContent(e.state, false);
}

// Common Functions
function GoUsingAjax(a) {

    if (location.pathname == a.pathname) return;

    let cache = localStorage['cache:/' + a.pathname];

    if (cache) {
        cache = JSON.parse(cache);

        showContent(cache, true);

        console.log('From Cache : ', a.pathname);

        if ((Date.now() - cache.ts) > (cache.expiry * 60000)) {
            loadFromServer(a);
        }

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

        let cache = cacheDocument(doc, a);

        showContent(cache, true);

        console.log('From Server : ', a.pathname);

    }).catch();
}

function cacheDocument(doc, a) {

    let htm = $('#main', doc).innerHTML;
    let title = $('title', doc)[0].text;
    let expiry = (parseInt(localStorage.cacheExpiry) || 30);

    if (a.pathname == '/') expiry = 1;

    cache = { htm, title, expiry, ts: Date.now(), path: a.pathname };

    if(noCachePaths.indexOf(a.pathname) == -1){
        localStorage['cache:/' + a.pathname] = JSON.stringify(cache);
    }else{
        cache.path = a.href;
    }

    return cache;
}

function showContent(cache, pushHistory) {

    $('#main').innerHTML = cache.htm;
    document.title = cache.title;

    if (pushHistory) {
        window.history.pushState(cache, cache.title, cache.path);
    }
}
