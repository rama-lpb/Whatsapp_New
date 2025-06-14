import './index.css';

import { AuthManager } from './modules/auth.js';
import { ContactsManager } from './modules/contacts.js';
import { ChatManager } from './modules/chat.js';
import { UIManager } from './modules/ui.js';
import { NavigationManager } from './modules/navigation.js';
import { stateManager } from './modules/state.js';
import { showNotification } from './utils/notifications.js';

class App {
  constructor() {
    this.authManager = null;
    this.contactsManager = null;
    this.chatManager = null;
    this.uiManager = null;
    this.navigationManager = null;
    
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeApp());
    } else {
      this.initializeApp();
    }
  }

  initializeApp() {
    try {
      this.authManager = new AuthManager();
      this.contactsManager = new ContactsManager();
      this.chatManager = new ChatManager(this.contactsManager);
      this.uiManager = new UIManager();
      this.navigationManager = new NavigationManager();

      this.setupGlobalEventListeners();
      this.setupConversationFilters();

      this.checkExistingSession();

      console.log('ChatApp initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      showNotification('Erreur lors de l\'initialisation de l\'application');
    }
  }

  setupConversationFilters() {
    const filters = document.querySelectorAll('#filters [data-filter]');
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('bg-yellow-500'));
        btn.classList.add('bg-yellow-500');
        document.dispatchEvent(new CustomEvent('filterChanged', { detail: btn.dataset.filter }));
      });
    });
  }

  setupGlobalEventListeners() {
    document.addEventListener('logoutRequested', () => {
      this.authManager.logout();
      this.uiManager.showWelcomeScreen();
    });

    document.addEventListener('messageSent', () => {
      this.contactsManager.loadConversations();
    });

    document.addEventListener('filterChanged', (e) => {
      if (this.contactsManager && typeof this.contactsManager.filterConversations === 'function') {
        this.contactsManager.filterConversations(e.detail);
      }
    });

    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
    });
  }

  checkExistingSession() {
    const currentUser = stateManager.getCurrentUser();
    if (currentUser) {
      document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: currentUser }));
      this.authManager.showChatPage();
    } else {
      this.uiManager.showWelcomeScreen();
    }
  }
}

new App();