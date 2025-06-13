import { DOMUtils } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';

export class UIManager {
  constructor() {
    this.sidebarMenu = DOMUtils.getElementById(SELECTORS.sidebarMenu);
    this.sidebarMenuBtn = DOMUtils.getElementById(SELECTORS.sidebarMenuBtn);
    this.userNameElement = DOMUtils.getElementById(SELECTORS.userName);
    this.userAvatarElement = DOMUtils.getElementById(SELECTORS.userAvatar);
    this.filtersDiv = DOMUtils.getElementById(SELECTORS.filters);
    
    this.initEventListeners();
  }

  initEventListeners() {
    if (this.sidebarMenuBtn) {
      this.sidebarMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSidebarMenu();
      });
    }

    document.addEventListener('click', (e) => {
      if (this.sidebarMenu && !this.sidebarMenu.contains(e.target)) {
        DOMUtils.hide(this.sidebarMenu);
      }
    });

    if (this.filtersDiv) {
      this.filtersDiv.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-filter')) {
          this.handleFilterClick(e.target);
        }
      });
    }


    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('logoutRequested'));
      });
    }

    document.addEventListener('userLoggedIn', (e) => {
      this.updateUserInfo(e.detail);
    });
  }

  toggleSidebarMenu() {
    if (this.sidebarMenu) {
      DOMUtils.toggle(this.sidebarMenu);
    }
  }

  updateUserInfo(user) {
    if (this.userNameElement) {
      this.userNameElement.textContent = user.name || user.fullname;
    }
    
    if (this.userAvatarElement) {
      const initial = (user.name || user.fullname || 'U').charAt(0).toUpperCase();
      this.userAvatarElement.textContent = initial;
    }
  }

  handleFilterClick(filterButton) {

    const allFilters = this.filtersDiv.querySelectorAll('button');
    allFilters.forEach(btn => {
      DOMUtils.removeClass(btn, 'bg-yellow-500');
      DOMUtils.addClass(btn, 'bg-gray-700');
    });


    DOMUtils.removeClass(filterButton, 'bg-gray-700');
    DOMUtils.addClass(filterButton, 'bg-yellow-500');


    const filterType = filterButton.getAttribute('data-filter');
    document.dispatchEvent(new CustomEvent('filterChanged', { detail: filterType }));
  }

  showWelcomeScreen() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('chat-page').classList.add('hidden');
  }

  showChatPage() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('chat-page').classList.remove('hidden');
  }
}