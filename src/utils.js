'use strict';
class Store {
  static listeners = [];
  static state = {};

  static subscribe(listener, selector) {
    const listenerRecord = { listener, selector };
    Store.listeners.push(listenerRecord);
    return () => Store.listeners.filter((record) => record !== listenerRecord);
  }

  static setState(updater) {
    const prevState = Store.state;
    if (typeof updater === 'function') {
      Store.state = updater(prevState);
    } else {
      Store.state = { ...prevState, ...updater };
    }

    Store.listeners.forEach(({ listener, selector }) => {
      const isUpdate =
        !selector || selector(prevState) !== selector(Store.state);
      if (!isUpdate) {
        return;
      }
      listener(Store.state);
    });
  }
}

function isScrollEnd(element) {
  const { scrollHeight, scrollTop, offsetHeight } = element;
  const margin = 10;
  return scrollTop + offsetHeight + margin >= element.scrollHeight;
}
