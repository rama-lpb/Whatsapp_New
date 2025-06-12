import { DOMUtils } from './dom.js';

export function showNotification(message, type = 'info') {
  const modal = DOMUtils.getElementById('popup-modal');
  const messageElement = DOMUtils.getElementById('popup-message');
  const closeButton = DOMUtils.getElementById('popup-close');
  
  if (!modal || !messageElement) {
    console.log(`${type.toUpperCase()}: ${message}`);
    return;
  }
  
  messageElement.textContent = message;
  DOMUtils.show(modal);
  
  setTimeout(() => {
    DOMUtils.hide(modal);
  }, 3000);
  
  if (closeButton) {
    closeButton.onclick = () => DOMUtils.hide(modal);
  }
  
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      DOMUtils.hide(modal);
    }
  };
}