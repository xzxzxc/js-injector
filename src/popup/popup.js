const save = () => {
  const tab_url = document.getElementById("url_text").value;
  const js_text = window.editor.getValue();

  chrome.storage.sync.get("container", items => {
    const container = items.container ?? {};

    container[tab_url] = js_text;
    chrome.storage.sync.set({container: container});
  });
};

const remove = () => {
  const tab_url = document.getElementById("url_text").value;
  chrome.storage.sync.get("container", items => {
    const container = items.container;

    container[tab_url] = undefined;
    chrome.storage.sync.set({container: container});
  });
};

const escapeRegExp = string => {
  return string.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); // $& means the whole matched string
};

const getCurrentTabUrl = async () => {
  let queryOptions = {active: true, currentWindow: true};
  let tabs = await chrome.tabs.query(queryOptions);
  return tabs[0].url;
};

const defaultText = `callWhen({
  predicate: () => $('body').length > 0,
  action: () => { console.log("Hello world!") },
  endless: false,
});`

document.addEventListener('DOMContentLoaded', () => {
  require.config({paths: {vs: '../../node_modules/monaco-editor/min/vs'}});
  require(['vs/editor/editor.main'], async () => {
    for (const fileName of ['jquery.d.ts', 'common.d.ts']) {
      const fileUri = `./dist/${fileName}`;
      const fileText = await (await fetch(chrome.runtime.getURL(fileUri))).text();
      monaco.languages.typescript.javascriptDefaults.addExtraLib(fileText, fileUri);
      monaco.editor.createModel(fileText, "typescript", monaco.Uri.parse(fileUri));
    }

    document.getElementById("save").onclick = save;
    document.getElementById("remove").onclick = remove;
    let tab_url = await getCurrentTabUrl();

    chrome.storage.sync.get("container", items => {
      let container = items.container;
      let pageData = null;
      for (const key_url in container) {
        if (tab_url.match(new RegExp(key_url)))
          pageData = {urlRegex: key_url, text: container[key_url]}
      }
      pageData = pageData ?? {
        urlRegex: `^${escapeRegExp(tab_url)}$`,
        text: defaultText,
      };

      document.getElementById("url_text").value = pageData.urlRegex;
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
