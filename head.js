console.log('head.js');

window.onload = function (e) {
    let cahce = cacheDocument(document, location);
    window.history.pushState(cache, cache.title, location.pathname);
}

window.onpopstate = function (e) {
    console.log("popped!", e.state);
    showContent(e.state, false);
}

function GoUsingAjax(a) {

    if (location.pathname == a.pathname) return;

    let cache = localStorage['cache:/' + a.pathname];

    if (cache) {
        cache = JSON.parse(cache);

        showContent(cache, true);

        console.log('From Cache : ', a.pathname);

        if (cache.expiry < Date.now()) {
            loadFromServer(a);
        }
    } else {
        loadFromServer(a);
    }
}

function loadFromServer(a) {
    document.querySelector('#loading').style.display = "";
    fetch(a.href).then(res => res.text()).then(html => {
        document.querySelector('#loading').style.display = "none";
        let el = document.createElement('html');
        el.innerHTML = html;

        let cache = cacheDocument(el, a);

        showContent(cache, true);

        console.log('From Server : ', a.pathname);
    });
}

function cacheDocument(el, a) {
    console.log(el, a);

    let htm = el.querySelector('#main').innerHTML;
    let title = el.querySelectorAll('title')[0].text;
    let expiry = Date.now() + (parseInt(localStorage.cacheExpiry) || 5) * 60000;

    cache = { htm, title, expiry, path: a.pathname };
    localStorage['cache:/' + a.pathname] = JSON.stringify(cache);
    return cache;
}

function showContent(cache, pushHistory) {
    document.querySelector('#main').innerHTML = cache.htm;
    document.title = cache.title;
    if (pushHistory) {
        window.history.pushState(cache, cache.title, cache.path);
    }
}