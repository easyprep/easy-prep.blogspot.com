console.log('head.js');

// Query String
const qs = {
  stringify: (json) => {
    let qs = Object.keys(json)
      .map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
      })
      .join('&');
    return qs ? '?' + qs : '';
  },
  parse: (str) => {
    let json = {};
    str
      .split(/[?&]/)
      .filter((a, i) => i)
      .forEach((a) => {
        let f = a.split('=');
        json[f[0]] = f[1];
      });
    return json;
  },
};

// Dom Selector
const $ = function (selector, doc = document) {
  return selector.split(/[ >]/).pop().indexOf('#') == 0
    ? doc.querySelector(selector)
    : doc.querySelectorAll(selector);
};

const appendChild = (html, parent) => {
  let child = document.createElement('div');
  child.innerHTML = html;
  parent.appendChild(child);
};

const prependChild = (html, parent) => {
  let child = document.createElement('div');
  child.innerHTML = html;
  parent.insertBefore(child, parent.firstChild);
};

//Main
window.qObj = qs.parse(location.search);

// Events
window.onload = (e) => {
  attachEventListener();
  let cache = parseContent(document);
  setCache(location, cache);
  window.history.pushState(cache, cache.title, location.href);
};

window.onpopstate = (e) => {
  showContent(e.state);
};

// Common Functions
function GoUsingAjax(event) {
  //console.log(event);

  event.preventDefault();

  let a = event.target;

  if (a.nodeName == 'FORM') {
    let url = a.action + '?' + new URLSearchParams(new FormData(a)).toString();
    a = document.createElement('a');
    a.href = url;
  } else {
    a = a.closest('a');
  }

  if (window.qObj.m) {
    let qObj = qs.parse(a.search);
    qObj.m = window.qObj.m;
    a.search = qs.stringify(qObj);
  }

  if (location.href == a.href) return;

  let cache = getCache(a);

  if (cache) {
    $('#main').style.opacity = 0;
    setTimeout(function () {
      showContent(cache);
      window.history.pushState(cache, cache.title, a.href);
      console.log('From Cache : ', a.href);
      $('#main').style.opacity = 1;
    }, 300);
    // if(Date.now()-cache.ts > 60*1000){
    //     prependChild('<p class="cache-ts">Page is ' + getCacheAge(cache.ts).filter(item=>item.value).map(item=>`<b>${item.value}</b> ${item.key}`).join(' ') + ' old. Refresh to get latest.</p>', $('#main'));
    // }
  } else {
    loadFromServer(a);
  }
}

function loadFromServer(a) {
  $('#loading').style.display = '';

  fetch(a.href)
    .then((res) => res.text())
    .then((html) => {
      $('#loading').style.display = 'none';

      let doc = document.createElement('html');
      doc.innerHTML = html;

      let cache = parseContent(doc);
      setCache(a, cache);
      showContent(cache);
      window.history.pushState(cache, cache.title, a.href);

      console.log('From Server : ', a.href);
    })
    .catch((e) => {
      $('#loading').style.display = 'none';
      console.log(e);
    });
}

function parseContent(doc) {
  let content = $('#app', doc).innerHTML;
  let title = $('title', doc)[0].text;
  return { title, content };
}

function showContent(cache) {
  document.title = cache.title;
  $('#app').innerHTML = cache.content;
  attachEventListener();
  scrollTo(0, 0);
}

function attachEventListener() {
  $('#app a').forEach(function (a) {
    a.removeEventListener('click', GoUsingAjax);
    a.addEventListener('click', GoUsingAjax);
  });
  $('#app #BlogSearch1 form').forEach(function (a) {
    a.removeEventListener('submit', GoUsingAjax);
    a.addEventListener('submit', GoUsingAjax);
  });
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
  params.forEach((p) => {
    delete qObj[p];
  });
  return qs.stringify(qObj);
}

function getCacheAge(ts) {
  let d = Math.abs(Date.now() - ts) / 1000; // delta
  let r = []; // result
  let s = {
    // structure
    year: 31536000,
    month: 2592000,
    week: 604800, // uncomment row to ignore
    day: 86400, // feel free to add your own row
    hour: 3600,
    minute: 60,
    second: 1,
  };

  Object.keys(s).forEach(function (key) {
    let item = { key };
    item.value = Math.floor(d / s[key]);
    if (item.value > 1) item.key += 's';
    r.push(item);
    d -= item.value * s[key];
  });

  return r;
}
