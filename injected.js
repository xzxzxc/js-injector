const _wr = function (type) {
  const orig = history[type];
  return function () {
    const rv = orig.apply(this, arguments);
    const e = new Event(type);
    e.arguments = arguments;
    document.dispatchEvent(e);
    return rv;
  };
};
history.pushState = _wr('pushState'), history.replaceState = _wr('replaceState');
