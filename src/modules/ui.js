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
    const messagesContainer = DOMUtils.getElementById(SELECTORS.messagesContainer);
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.35L2 22l5.65-1.05C9.96 21.64 11.46 22 13 22h-1c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
              <svg class="w-16 h-16 text-yellow-500 mt-[5px] ml-[-40px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.35L2 22l5.65-1.05C9.96 21.64 11.46 22 13 22h-1c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
            </div>
            <h3 class="text-white text-xl font-medium mb-2">Bienvenue sur ChatApp</h3>
            <p class="text-gray-400">Sélectionnez une conversation ou créez en une nouvelle pour commencer à discuter</p>
            <p class="text-gray-600 mt-2 text-[14px]">Vos données sont chiffrées pour une meilleure protection de votre vie privée</p>
          </div>
        </div>
      `;
    }
  }
}