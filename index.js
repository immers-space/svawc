/*
Adapted from svelte-tag by Chris Ward
*/

// witchcraft from svelte issue - https://github.com/sveltejs/svelte/issues/2588
import { detach, insert, noop } from 'svelte/internal';
function createSlots(slots) {
  const svelteSlots = {};
  for (const slotName in slots) {
    svelteSlots[slotName] = [createSlotFn(slots[slotName])];
  }
  function createSlotFn(element) {
    return function() {
      return {
        c: noop,
        m: function mount(target, anchor) {
          insert(target, element.cloneNode(true), anchor); 
        },
        d: function destroy(detaching) { 
          if (detaching && element.innerHTML){ 
            detach(element);
          } 
        },
        l: noop,
      };
    }
  }
  return svelteSlots;
}

export function registerWebComponent(opts){
  const BaseClass = opts.baseClass ?? window.AFRAME.AEntity
  class Wrapper extends BaseClass{

    constructor() {
      super();
      this.slotcount = 0
      this.hasConnected = false
      let root =  this
      this._root = root
      this.addEventListener('nodeready', () => this.init(), { once: true })
    }

    static get observedAttributes() {
      return (opts.attributes || []).concat(BaseClass.observedAttributes || [])
    }

    // use init on nodeready instead of connectedCallback to avoid
    // issues with multiple calls due to A-Frame's initialization delay
    init() {
      let props = opts.defaults ? opts.defaults : {};
      let slots
      props.$$scope = {}
      Array.from(this.attributes).forEach( attr => props[attr.name] = attr.value )
      props.$$scope = {}
      slots = this.getSlots()
      this.slotcount = Object.keys(slots).length
      props.$$slots = createSlots(slots)
      const context = new Map([['wrapperElement', opts.noWrapper ? null : this]])
      this.elem = new opts.component({	target: opts.noWrapper ? this.parentElement : this, props, context});
    }

    disconnectedCallback(){
      super.disconnectedCallback?.()
      if(this.observe){
        this.observer.disconnect()
      }
      try{ this.elem.$destroy()}catch(err){} // detroy svelte element when removed from dom
    }
    
    unwrap(from){
      let node = document.createDocumentFragment();
      // TODO - this drops the actual [slot] element and only clones its children
      while (from.firstChild) {
        node.appendChild(from.removeChild(from.firstChild));
      }
      return node
    }

    getSlots(){
      const namedSlots = this.querySelectorAll('[slot]')
      let slots = {}
      namedSlots.forEach(n=>{
        slots[n.slot] = this.unwrap(n)
        this.removeChild(n)
      })
      if(this.innerHTML.length){
        slots.default = this.unwrap(this)
        this.innerHTML = ""
      }
      return slots
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!opts.attributes.includes(name)) {
        // passthrough for inherited attrs
        return super.attributeChangedCallback?.()
      }
      if(this.elem && newValue!=oldValue){
        this.elem.$set({[name]:newValue})
      }
    }
  }  
  window.customElements.define(opts.tagname, Wrapper);
  return Wrapper
}
