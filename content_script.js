﻿// helper functions available for all page scripts
const commonFunctions = `
Promise.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const callWhen = async ({ predicate, action, endless, checkInterval } = { endless: false, checkInterval: 1000 }) => {
  while (true) {
    if (predicate()) {
      console.log('calling action');
      action();
      if (!endless) {
        break;
      }
    }
    await Promise.delay(checkInterval);
  }
};
`;

var s = document.createElement('script');
s.src = chrome.runtime.getURL('injected.js');
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

// create Sval interpreter.
// so code could run in content script context
// (could get chrome object)
const interpreter = new Sval({
  // ECMA Version of the code (5 | 6 | 7 | 8 | 9 | 10 | 2015 | 2016 | 2017 | 2018 | 2019)
  ecmaVer: 2019,
  // Whether the code runs in a sandbox
  sandBox: true,
});

// wraps code to isolated func.
// so page script couldn`t save state
// bettween pushState and replaceState events
const wrapCode = (code) => `(()=>{${commonFunctions}${code}})();`;

// runs scripts that matches specified url,
// inside DOM context or content script context
const doWorkOnUrl = (url) => {
  chrome.storage.sync.get('container', (items) => {

    const page_scripts = items.page_scripts ?? items.container;
    for (let key_url in page_scripts) {
      if (url.match(new RegExp(key_url))) {
        const val = page_scripts[key_url];
        const code = wrapCode(val.code ?? val);

        interpreter.run(code);
      }
    }
  });
}

const doWorkOnUrlOnCurrentUrl = () => doWorkOnUrl(location.href);

doWorkOnUrlOnCurrentUrl();

document.addEventListener('pushState', () => {
  doWorkOnUrlOnCurrentUrl();
});

document.addEventListener('replaceState', () => {
  doWorkOnUrlOnCurrentUrl();
});
