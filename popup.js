function save() {
  var tab_url = document.getElementById("url_text").value;
  var js_text = document.getElementById("js_text").value;

  chrome.storage.sync.get("container", function (items) {
    var container = items.container ?? {};

    container[tab_url] = js_text;
    chrome.storage.sync.set({ container: container });
  });
}

function remove(){
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

document.addEventListener('DOMContentLoaded', async function () {
  document.getElementById("save").onclick = save;
  document.getElementById("remove").onclick = remove;
  var tab_url = await getCurrentTabUrl();

  chrome.storage.sync.get("container", function (items) {
    var container = items.container;
    var matched = false;
    for (var key_url in container)
    {
      if (tab_url.match(new RegExp(key_url)))
      {
        var js_text = container[key_url];
        document.getElementById("url_text").value = key_url;
        document.getElementById("js_text").value = js_text;
        matched = true;
      }
    }
    if (!matched)
    {
      document.getElementById("url_text").value = "^" + escapeRegExp(tab_url) + "$";
    }
  });
});

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 's') {
    // Prevent the Save dialog to open
    e.preventDefault();

    save();
  }
});
