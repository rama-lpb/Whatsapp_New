import { DOMUtils } from '../utils/dom.js';
import { showNotification } from '../utils/notifications.js';

export class NavigationManager {
  constructor() {
    this.currentPage = 'messages'; // Page par défaut
    this.sidebarButtons = [];
    this.conversationsContainer = null;
    this.statusContainer = null;
    this.channelsContainer = null;
    this.communitiesContainer = null;
    
    this.initEventListeners();
    this.createPageContainers();
  }

  initEventListeners() {
    // Récupérer tous les boutons de la sidebar
    const sidePageDiv = document.getElementById('side-page');
    if (sidePageDiv) {
      this.sidebarButtons = Array.from(sidePageDiv.querySelectorAll('button'));
      
      this.sidebarButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          this.handleNavigation(index);
        });
      });
    }
  }

  createPageContainers() {
    const conversationsListDiv = document.getElementById('conversations-list');
    const parentContainer = conversationsListDiv?.parentElement;
    
    if (!parentContainer) return;

    // Container pour les status
    this.statusContainer = document.createElement('div');
    this.statusContainer.id = 'status-container';
    this.statusContainer.className = 'flex-1 overflow-y-auto hidden';
    this.statusContainer.innerHTML = `
      <div class="p-4">
        <h3 class="text-white text-lg font-medium mb-4">Status</h3>
        <div class="space-y-3">
          <div class="flex items-center p-3 hover:bg-gray-700 cursor-pointer rounded-lg">
            <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center relative">
              <span class="text-white font-medium">Moi</span>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-white font-medium">Mon status</p>
              <p class="text-gray-400 text-sm">Appuyez pour ajouter un status</p>
            </div>
          </div>
          <div class="border-t border-gray-700 pt-3">
            <p class="text-gray-400 text-sm mb-3">Mises à jour récentes</p>
            <div class="text-center py-8">
              <p class="text-gray-500">Aucune mise à jour récente</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Container pour les chaînes
    this.channelsContainer = document.createElement('div');
    this.channelsContainer.id = 'channels-container';
    this.channelsContainer.className = 'flex-1 overflow-y-auto hidden';
    this.channelsContainer.innerHTML = `
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white text-lg font-medium">Chaînes</h3>
          <button class="text-yellow-500 hover:text-yellow-400">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        </div>
        <div class="space-y-3">
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.9218 10.6469C21.321 6.08949 17.5557 2.45561 12.9894 2.04404C7.06124 1.50197 2.16447 6.05937 2.05432 11.982C2.01426 14.1101 2.82538 15.9371 3.23595 16.7201L2.0443 20.6651C1.81398 21.4281 2.52497 22.1408 3.28602 21.9099L7.17139 20.7455C8.65344 21.5686 10.3157 22.0002 12.0181 22.0002C17.9663 22.0002 22.7129 16.7602 21.9118 10.6469H21.9218Z"/>
              </svg>
            </div>
            <p class="text-gray-400 mb-2">Restez informé</p>
            <p class="text-gray-500 text-sm">Suivez des chaînes pour recevoir des mises à jour importantes</p>
            <button class="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm">
              Rechercher des chaînes
            </button>
          </div>
        </div>
      </div>
    `;

    // Container pour les communautés
    this.communitiesContainer = document.createElement('div');
    this.communitiesContainer.id = 'communities-container';
    this.communitiesContainer.className = 'flex-1 overflow-y-auto hidden';
    this.communitiesContainer.innerHTML = `
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white text-lg font-medium">Communautés</h3>
          <button class="text-yellow-500 hover:text-yellow-400">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        </div>
        <div class="space-y-3">
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 32 32">
                <path d="M7.85445 17.0075C7.73851 17.0026 7.62033 17 7.50003 17C6.60797 17 5.83268 17.1426 5.22106 17.3148C4.69554 17.4627 4.0988 17.7054 3.5974 18.0919C3.08634 18.4858 2.62143 19.0755 2.52966 19.8877C2.48679 20.2672 2.50003 21.0796 2.51038 21.5399C2.52882 22.3601 3.20095 23 4.00656 23H7.35217C7.15258 22.5784 7.03459 22.1084 7.01993 21.6087C7.00557 21.1191 6.9671 19.7982 7.06216 19.097C7.1117 18.7316 7.19832 18.3892 7.31207 18.0721C7.45559 17.6719 7.64219 17.3186 7.85445 17.0075Z"/>
              </svg>
            </div>
            <p class="text-gray-400 mb-2">Connectez-vous avec des communautés</p>
            <p class="text-gray-500 text-sm">Découvrez et rejoignez des communautés qui partagent vos intérêts</p>
            <button class="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm">
              Créer une communauté
            </button>
          </div>
        </div>
      </div>
    `;

    // Ajouter les containers au parent
    parentContainer.appendChild(this.statusContainer);
    parentContainer.appendChild(this.channelsContainer);
    parentContainer.appendChild(this.communitiesContainer);

    // Référence au container des conversations
    this.conversationsContainer = conversationsListDiv.parentElement;
  }

  handleNavigation(buttonIndex) {
    // Réinitialiser tous les boutons
    this.sidebarButtons.forEach(btn => {
      btn.classList.remove('bg-yellow-600');
      btn.classList.add('bg-gray-700');
    });

    // Activer le bouton cliqué
    this.sidebarButtons[buttonIndex].classList.remove('bg-gray-700');
    this.sidebarButtons[buttonIndex].classList.add('bg-yellow-600');

    // Cacher tous les containers
    this.hideAllContainers();

    // Afficher le container approprié
    switch (buttonIndex) {
      case 0: // Messages
        this.showMessagesPage();
        this.currentPage = 'messages';
        break;
      case 1: // Status
        this.showStatusPage();
        this.currentPage = 'status';
        break;
      case 2: // Chaînes
        this.showChannelsPage();
        this.currentPage = 'channels';
        break;
      case 3: // Communautés
        this.showCommunitiesPage();
        this.currentPage = 'communities';
        break;
      case 4: // Paramètres
        this.showSettingsPage();
        this.currentPage = 'settings';
        break;
      case 5: // Archive
        this.showArchivePage();
        this.currentPage = 'archive';
        break;
      default:
        this.showMessagesPage();
        this.currentPage = 'messages';
    }
  }

  hideAllContainers() {
    // Cacher le container des conversations et ses éléments
    const conversationsListDiv = document.getElementById('conversations-list');
    const filtersDiv = document.getElementById('filters');
    const searchDiv = conversationsListDiv?.parentElement.querySelector('.relative');
    const addContactFormContainer = document.getElementById('add-contact-form-container');

    if (conversationsListDiv) DOMUtils.hide(conversationsListDiv);
    if (filtersDiv) DOMUtils.hide(filtersDiv.parentElement);
    if (searchDiv) DOMUtils.hide(searchDiv);
    if (addContactFormContainer) DOMUtils.hide(addContactFormContainer);

    // Cacher les autres containers
    if (this.statusContainer) DOMUtils.hide(this.statusContainer);
    if (this.channelsContainer) DOMUtils.hide(this.channelsContainer);
    if (this.communitiesContainer) DOMUtils.hide(this.communitiesContainer);
  }

  showMessagesPage() {
    const conversationsListDiv = document.getElementById('conversations-list');
    const filtersDiv = document.getElementById('filters');
    const searchDiv = conversationsListDiv?.parentElement.querySelector('.relative');

    if (conversationsListDiv) DOMUtils.show(conversationsListDiv);
    if (filtersDiv) DOMUtils.show(filtersDiv.parentElement);
    if (searchDiv) DOMUtils.show(searchDiv);
  }

  showStatusPage() {
    if (this.statusContainer) {
      DOMUtils.show(this.statusContainer);
    }
  }

  showChannelsPage() {
    if (this.channelsContainer) {
      DOMUtils.show(this.channelsContainer);
    }
  }

  showCommunitiesPage() {
    if (this.communitiesContainer) {
      DOMUtils.show(this.communitiesContainer);
    }
  }

  showSettingsPage() {
    showNotification('Page des paramètres en développement');
    // Revenir à la page messages
    this.handleNavigation(0);
  }

  showArchivePage() {
    showNotification('Page des archives en développement');
    // Revenir à la page messages
    this.handleNavigation(0);
  }

  getCurrentPage() {
    return this.currentPage;
  }
}