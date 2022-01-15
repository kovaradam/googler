customElements.define(
  'pretty-button',
  class extends HTMLButtonElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addEventListener('mousemove', (event) => {
        const position = getRelativeCursorPosition(event);
        setPseudoPosition(this, position);
      });

      this.addEventListener('mouseleave', (event) => {
        setPseudoPosition(this, [50, 50]);
      });
    }
  },
  {
    extends: 'button',
  }
);

function getRelativeCursorPosition(event) {
  const element = event.target;
  const { clientX, clientY } = event;
  const { left, right, top, bottom } = element.getBoundingClientRect();
  const width = right - left;
  const height = bottom - top;

  return [((clientX - left) * 100) / width, ((clientY - top) * 100) / height];
}

function setPseudoPosition(element, [left, top]) {
  element.style.setProperty('--pseudo-left', `${left}%`);
  element.style.setProperty('--pseudo-top', `${top}%`);
}
