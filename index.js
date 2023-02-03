/*
Adapted from svelte-tag by Chris Ward
Usage - convert svelte app to web component
import component from "svelte-tag"
new component({component:App,tagname:"hello-world",href="/your/stylesheet.css",attributes:["name"]})
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

export default function(opts){
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
      this.elem = new opts.component({	target: this._root,	props});
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
      if(this.elem && newValue!=oldValue){
        this.elem.$set({[name]:newValue})
      }
    }
  }  
  window.customElements.define(opts.tagname, Wrapper);
}
