/*
Adapted from svelte-tag by Chris Ward
*/

// witchcraft from svelte issue - https://github.com/sveltejs/svelte/issues/2588
import { detach, insert, noop } from 'svelte/internal'
function createSlots (slots) {
  const svelteSlots = {}
  for (const slotName in slots) {
    svelteSlots[slotName] = [createSlotFn(slots[slotName])]
  }
  function createSlotFn (element) {
    return function () {
      return {
        c: noop,
        m: function mount (target, anchor) {
          insert(target, element.cloneNode(true), anchor)
        },
        d: function destroy (detaching) {
          if (detaching && element.innerHTML) {
            detach(element)
          }
        },
        l: noop
      }
    }
  }
  return svelteSlots
}
/**
 * Convert a Svelte component into a Web Component for A-Frame.
 *
 * Provides the wrapperElement context to the Svelte component with a reference to the custom element instance.
 * @param  {object} opts
 * @param  {function} opts.Component - the Svelte component constructor
 * @param  {string} opts.tagname - the element tag for the Web Component, must contain a '-'
 * @param  {string[]} opts.attributes - the props from the Svelte copmonent which will be settable via setAttribute
 * @param  {HTMLElement} [opts.baseClass] - base class that Web Component element will inherit from, default's to AEntity
 * @param  {boolean} [opts.noWraper] - EXPERIMENTAL: render the Svelte component output as siblings to the Web Component element instead of as children
 * @example <caption>Basic usage</caption>
 * // creates and registers the <a-person> custom element from the APerson.svelte component
 * import { registerWebComponent } from 'svawc'
 * import APerson from "./APerson.svelte"
 * registerWebComponent({ component: APerson, tagname: "a-person", attributes: ["skin", "shirt", "pants"] })
 * @example <caption>Using context to modify the containing element from inside the Svelte component</caption>
 * import { getContext } from "svelte";
 * getContext('wrapperElement').setAttribute('shadow', '')
 */
export function registerWebComponent (opts) {
  const BaseClass = opts.baseClass ?? window.AFRAME.AEntity
  class Wrapper extends BaseClass {
    constructor () {
      super()
      this.addEventListener('nodeready', () => this.init(), { once: true })
    }

    static get observedAttributes () {
      return (opts.attributes || []).concat(BaseClass.observedAttributes || [])
    }

    // use init on nodeready instead of connectedCallback to avoid
    // issues with multiple calls due to A-Frame's initialization delay
    init () {
      const props = {}
      props.$$scope = {}
      Array.from(this.attributes).forEach(attr => (props[attr.name] = attr.value))
      props.$$scope = {}
      const slots = this.getSlots()
      props.$$slots = createSlots(slots)
      const context = new Map([['wrapperElement', opts.noWrapper ? null : this]])
      this.elem = new opts.Component({ target: opts.noWrapper ? this.parentElement : this, props, context })
    }

    disconnectedCallback () {
      super.disconnectedCallback?.()
      if (this.observe) {
        this.observer.disconnect()
      }
      try { this.elem.$destroy() } catch (err) {} // detroy svelte element when removed from dom
    }

    unwrap (from) {
      const node = document.createDocumentFragment()
      // TODO - this drops the actual [slot] element and only clones its children
      while (from.firstChild) {
        node.appendChild(from.removeChild(from.firstChild))
      }
      return node
    }

    getSlots () {
      const namedSlots = this.querySelectorAll('[slot]')
      const slots = {}
      namedSlots.forEach(n => {
        slots[n.slot] = this.unwrap(n)
        this.removeChild(n)
      })
      if (this.innerHTML.length) {
        slots.default = this.unwrap(this)
        this.innerHTML = ''
      }
      return slots
    }

    attributeChangedCallback (name, oldValue, newValue) {
      if (!opts.attributes.includes(name)) {
        // passthrough for inherited attrs
        return super.attributeChangedCallback?.()
      }
      if (this.elem && newValue !== oldValue) {
        this.elem.$set({ [name]: newValue })
      }
    }
  }
  window.customElements.define(opts.tagname, Wrapper)
  return Wrapper
}
