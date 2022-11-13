
const templateHTML = `
<style>  
:host .center {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  text-align:center;
}

:host .wrapper {
  position:relative;
  width: fit-content;
}

:host .image-wrapper {
  -webkit-filter:blur(20px);
  filter: blur(20px);
  cursor: pointer;
}
</style>

<div class="wrapper">
<div class="center">Content Warning (Click to show)</br><span class="alt"></span></div>
<div class="image-wrapper">
  <slot>
</div>
</div>
`;

class ContentWarning extends HTMLElement {
  constructor() {
    super();
    
    const shadowRoot = this.attachShadow({mode: 'open'});
    const template = document.createElement('template');
    template.innerHTML = templateHTML
    const instance = template.content.cloneNode(true);
    shadowRoot.appendChild(instance);

    const wrapper = shadowRoot.querySelector('.wrapper')
    const imageWrapper = shadowRoot.querySelector('.image-wrapper')
    const center = shadowRoot.querySelector('.center')

    if (!(wrapper instanceof HTMLElement)) return
    if (!(imageWrapper instanceof HTMLElement)) return
    if (!(center instanceof HTMLElement)) return

    wrapper.addEventListener("click", () => {
        imageWrapper.style.filter = "blur(0px)";
        center.style.display = 'none'
        imageWrapper.style.cursor = 'auto'
    });
    imageWrapper.addEventListener("mouseleave", () => {
        imageWrapper.style.filter = "blur(20px)";
        center.style.display = 'block'
        imageWrapper.style.cursor = 'pointer'
    });
  }
}

customElements.define('content-warning', ContentWarning);
