require.config({ paths: { vs: './node_modules/monaco-editor/min/vs' } });

function save() {
  var tab_url = document.getElementById("url_text").value;
  var js_text = window.editor.getValue();

  chrome.storage.sync.get("container", function (items) {
    var container = items.container ?? {};

    container[tab_url] = js_text;
    chrome.storage.sync.set({ container: container });
  });
}

function remove() {
  var tab_url = document.getElementById("url_text").value;
  chrome.storage.sync.get("container", function (items) {
    var container = items.container;

    container[tab_url] = undefined;
    chrome.storage.sync.set({ container: container });
  });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); // $& means the whole matched string
}

async function getCurrentTabUrl() {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);
  return tabs[0].url;
}

const defaultText = `callWhen(
  () => $('body').length > 0,
  () => { console.log("Hello world!") });`

document.addEventListener('DOMContentLoaded', async function () {
  document.getElementById("save").onclick = save;
  document.getElementById("remove").onclick = remove;
  let tab_url = await getCurrentTabUrl();

  chrome.storage.sync.get("container", function (items) {
    let container = items.container;
    let pageData = null;
    for (var key_url in container) {
      if (tab_url.match(new RegExp(key_url)))
        pageData = { urlRegex: key_url, text: container[key_url] }
    }
    pageData = pageData ?? {
      urlRegex: `^${escapeRegExp(tab_url)}$`,
      text: defaultText,
    };

    document.getElementById("url_text").value = pageData.urlRegex;
    require(['vs/editor/editor.main'], function () {
      window.editor = monaco.editor.create(document.getElementById('container'), {
        value: pageData.text,
        language: 'javascript',
      });
    });
  });
});

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 's') {
    // Prevent the Save dialog to open
    e.preventDefault();

    save();
  }
});
