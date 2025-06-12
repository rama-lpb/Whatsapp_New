export class DOMUtils {
  static getElementById(id) {
    return document.getElementById(id);
  }

  static hide(element) {
    if (element) {
      element.classList.add('hidden');
    }
  }

  static show(element) {
    if (element) {
      element.classList.remove('hidden');
    }
  }

  static toggle(element) {
    if (element) {
      element.classList.toggle('hidden');
    }
  }





  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }







  static createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  static findElement(selector) {
    return document.querySelector(selector);
  }

  static findElements(selector) {
    return document.querySelectorAll(selector);
  }

  static addClass(element, className) {
    if (element) element.classList.add(className);
  }

  static removeClass(element, className) {
    if (element) element.classList.remove(className);
  }

  static toggleClass(element, className) {
    if (element) element.classList.toggle(className);
  }

  static hasClass(element, className) {
    return element ? element.classList.contains(className) : false;
  }

  static setAttributes(element, attributes) {
    if (!element) return;
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  static removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  static insertAfter(newElement, referenceElement) {
    if (referenceElement && referenceElement.parentNode) {
      referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
    }
  }

  static insertBefore(newElement, referenceElement) {
    if (referenceElement && referenceElement.parentNode) {
      referenceElement.parentNode.insertBefore(newElement, referenceElement);
    }
  }

  static getPosition(element) {
    if (!element) return { top: 0, left: 0 };
    
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    };
  }

  static isElementInViewport(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  static scrollToElement(element, behavior = 'smooth') {
    if (element) {
      element.scrollIntoView({ behavior, block: 'center' });
    }
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static animateElement(element, keyframes, options = {}) {
    if (!element || !element.animate) return Promise.resolve();
    
    const defaultOptions = {
      duration: 300,
      easing: 'ease-in-out',
      fill: 'forwards'
    };
    
    return element.animate(keyframes, { ...defaultOptions, ...options }).finished;
  }

  static fadeIn(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    element.style.opacity = '0';
    element.style.display = 'block';
    
    return this.animateElement(element, [
      { opacity: 0 },
      { opacity: 1 }
    ], { duration });
  }

  static fadeOut(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    return this.animateElement(element, [
      { opacity: 1 },
      { opacity: 0 }
    ], { duration }).then(() => {
      element.style.display = 'none';
    });
  }

  static slideDown(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    const height = element.scrollHeight;
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.display = 'block';
    
    return this.animateElement(element, [
      { height: '0px' },
      { height: `${height}px` }
    ], { duration }).then(() => {
      element.style.height = '';
      element.style.overflow = '';
    });
  }

  static slideUp(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    const height = element.scrollHeight;
    element.style.height = `${height}px`;
    element.style.overflow = 'hidden';
    
    return this.animateElement(element, [
      { height: `${height}px` },
      { height: '0px' }
    ], { duration }).then(() => {
      element.style.display = 'none';
      element.style.height = '';
      element.style.overflow = '';
    });
  }
}