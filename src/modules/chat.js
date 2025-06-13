import { DOMUtils } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';
import { ApiService } from '../services/api.js';
import { showNotification } from '../utils/notifications.js';

export class ChatManager {
  constructor(contactsManager) {
    this.messagesContainer = DOMUtils.getElementById(SELECTORS.messagesContainer);
    this.messageInput = DOMUtils.getElementById(SELECTORS.messageInput);
    this.sendButton = DOMUtils.getElementById(SELECTORS.sendButton);
    this.messageInputContainer = DOMUtils.getElementById(SELECTORS.messageInputContainer);
    this.chatHeader = DOMUtils.getElementById(SELECTORS.chatHeader);
    this.chatHeaderContent = DOMUtils.getElementById('chat-header-content');
    this.chatMenuBtn = DOMUtils.getElementById('chat-menu-btn');
    this.chatMenu = DOMUtils.getElementById('chat-menu');
    
    this.currentConversation = null;
    this.currentContact = null;
    this.messages = [];
    this.currentUser = null;
    this.contactsManager = contactsManager;
    
    this.initEventListeners();
  }

  initEventListeners() {
    if (this.sendButton) {
      this.sendButton.addEventListener('click', () => this.sendMessage());
    }
    
    if (this.messageInput) {
      this.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }

    // Menu hamburger du chat
    if (this.chatMenuBtn) {
      this.chatMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleChatMenu();
      });
    }

    // Fermer le menu en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (this.chatMenu && !this.chatMenu.contains(e.target) && !this.chatMenuBtn.contains(e.target)) {
        DOMUtils.hide(this.chatMenu);
      }
    });

    // Actions du menu
    this.initChatMenuActions();

    // Listen for conversation selection
    document.addEventListener('conversationSelected', (e) => {
      this.openConversation(e.detail.conversation, e.detail.otherUser);
    });

    // Listen for user login
    document.addEventListener('userLoggedIn', (e) => {
      this.currentUser = e.detail;
    });
  }

  initChatMenuActions() {
    // Fermer le chat
    const chatCloseBtn = document.getElementById('chat-close-btn');
    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', () => {
        this.closeChat();
        DOMUtils.hide(this.chatMenu);
      });
    }

    // Infos du contact
    const chatInfoBtn = document.getElementById('chat-info-btn');
    if (chatInfoBtn) {
      chatInfoBtn.addEventListener('click', () => {
        this.showContactInfo();
        DOMUtils.hide(this.chatMenu);
      });
    }

    // Rechercher dans le chat
    const chatSearchBtn = document.getElementById('chat-search-btn');
    if (chatSearchBtn) {
      chatSearchBtn.addEventListener('click', () => {
        this.showSearchInChat();
        DOMUtils.hide(this.chatMenu);
      });
    }

    // Médias partagés
    const chatMediaBtn = document.getElementById('chat-media-btn');
    if (chatMediaBtn) {
      chatMediaBtn.addEventListener('click', () => {
        this.showSharedMedia();
        DOMUtils.hide(this.chatMenu);
      });
    }

    // Couper les notifications
    const chatMuteBtn = document.getElementById('chat-mute-btn');
    if (chatMuteBtn) {
      chatMuteBtn.addEventListener('click', () => {
        this.toggleMuteNotifications();
        DOMUtils.hide(this.chatMenu);
      });
    }

    // Bloquer le contact
    const chatBlockBtn = document.getElementById('chat-block-btn');
    if (chatBlockBtn) {
      chatBlockBtn.addEventListener('click', () => {
        this.blockContact();
        DOMUtils.hide(this.chatMenu);
      });
    }

    // Vider la conversation
    const chatClearBtn = document.getElementById('chat-clear-btn');
    if (chatClearBtn) {
      chatClearBtn.addEventListener('click', () => {
        this.clearConversation();
        DOMUtils.hide(this.chatMenu);
      });
    }

    const chatFavoriteBtn = document.getElementById('chat-favorite-btn');
    if (chatFavoriteBtn) {
      chatFavoriteBtn.onclick = () => this.toggleFavorite();
    }
  }

  toggleChatMenu() {
    if (this.chatMenu) {
      DOMUtils.toggle(this.chatMenu);
    }
  }

  openConversation(conversation, contact) {
    this.currentConversation = conversation;
    this.currentContact = contact;
    this.updateChatHeader(contact);
    this.loadMessages(conversation.id);
    this.showMessageInput();
    this.showChatMenu();

    // Met à jour dynamiquement le texte du bouton favoris
    const chatFavoriteBtn = document.getElementById('chat-favorite-btn');
    if (chatFavoriteBtn) {
      chatFavoriteBtn.textContent = conversation.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
    }
  }

  updateChatHeader(contact) {
    if (!this.chatHeaderContent) return;
    this.chatHeaderContent.innerHTML = `
      <div class="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
        <span class="text-white font-medium text-lg">${contact.avatar || contact.name[0]}</span>
      </div>
      <div class="ml-3 flex flex-col">
        <span class="text-white font-medium text-base">${contact.name}</span>
        <span class="text-yellow-300 text-xs">${contact.status || 'En ligne'}</span>
      </div>
    `;
  }

  showChatMenu() {
    if (this.chatMenuBtn) {
      DOMUtils.show(this.chatMenuBtn);
    }
  }

  hideChatMenu() {
    if (this.chatMenuBtn) {
      DOMUtils.hide(this.chatMenuBtn);
    }
    if (this.chatMenu) {
      DOMUtils.hide(this.chatMenu);
    }
  }

  showMessageInput() {
    DOMUtils.show(this.messageInputContainer);
    if (this.messageInput) {
      this.messageInput.disabled = false;
    }
    if (this.sendButton) {
      this.sendButton.disabled = false;
    }
  }

  async loadMessages(conversationId) {
    try {
      const allMessages = await ApiService.getMessages() || [];
      this.messages = allMessages.filter(msg => msg.conversationId === conversationId);
      this.renderMessages();
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  }

  renderMessages() {
    if (!this.messagesContainer) return;
    
    this.messagesContainer.innerHTML = '';
    
    if (this.messages.length === 0) {
      this.messagesContainer.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <p class="text-gray-400">Aucun message dans cette conversation</p>
            <p class="text-gray-500 text-sm mt-2">Envoyez votre premier message !</p>
          </div>
        </div>
      `;
      return;
    }
    
    const messagesWrapper = DOMUtils.createElement('div', 'space-y-4');
    
    this.messages.forEach(message => {
      const messageElement = this.createMessageElement(message);
      messagesWrapper.appendChild(messageElement);
    });
    
    this.messagesContainer.appendChild(messagesWrapper);
    this.scrollToBottom();
  }

  createMessageElement(message) {
    const isOwn = message.senderId === this.currentUser?.id;
    const messageDiv = DOMUtils.createElement('div', 
      `flex ${isOwn ? 'justify-end' : 'justify-start'}`
    );
    
    messageDiv.innerHTML = `
      <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-black text-white' 
          : 'bg-gray-700 text-white'// Initialize the application

      }">
        <p class="text-sm">${message.content}</p>
        <div class="flex items-center justify-end mt-1 space-x-1">
          <span class="text-xs opacity-70">${this.formatTime(message.timestamp)}</span>
          ${isOwn ? `
            <svg class="w-3 h-3 opacity-70" fill="currentColor" viewBox="0 0 24 24">
              ${message.status === 'read' ? `
                <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
              ` : message.status === 'delivered' ? `
                <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41z"/>
              ` : `
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              `}
            </svg>
          ` : ''}
        </div>
      </div>
    `;
    
    return messageDiv;
  }

  async sendMessage() {
    const messageText = this.messageInput.value.trim();
    if (!messageText) return;

    const messageData = {
      // Retire 'id' si le backend le refuse
      conversationId: this.currentConversation.id,
      senderId: this.currentUser.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent'
    };

    try {
      const savedMessage = await ApiService.sendMessage(messageData);
      if (savedMessage) {
        this.currentConversation.lastMessage = messageText;
        this.currentConversation.lastMessageTime = messageData.timestamp;
        if (this.contactsManager && typeof this.contactsManager.updateConversation === 'function') {
          this.contactsManager.updateConversation(this.currentConversation);
        }
        document.dispatchEvent(new CustomEvent('messageSent', { 
          detail: { message: savedMessage, conversation: this.currentConversation } 
        }));
      }
    } catch (error) {
      showNotification("Erreur lors de l'envoi du message. Le message n'a pas été stocké.");
      console.error(error);
    }
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Actions du menu
  closeChat() {
    this.currentConversation = null;
    this.currentContact = null;
    this.messages = [];
    
    // Vider le header
    if (this.chatHeaderContent) {
      this.chatHeaderContent.innerHTML = '';
    }
    
    // Cacher le menu et la zone de saisie
    this.hideChatMenu();
    DOMUtils.hide(this.messageInputContainer);

    // Cacher le bouton hamburger
    if (this.chatMenuBtn) {
      DOMUtils.hide(this.chatMenuBtn);
    }

    if (this.messageInput) this.messageInput.disabled = true;
    if (this.sendButton) this.sendButton.disabled = true;
    
    // Afficher le message de bienvenue
    this.showWelcomeMessage();
    
    showNotification('Chat fermé');
  }

  showContactInfo() {
    if (!this.currentContact) return;
    
    const info = `
      Nom: ${this.currentContact.name}
      Téléphone: ${this.currentContact.phone || 'Non disponible'}
      Statut: ${this.currentContact.status}
    `;
    
    showNotification(`Informations du contact:\n${info}`);
  }

  showSearchInChat() {
    showNotification('Fonction de recherche en développement');
    // TODO: Implémenter la recherche dans le chat
  }

  showSharedMedia() {
    showNotification('Médias partagés en développement');
    // TODO: Afficher les médias partagés
  }

  toggleMuteNotifications() {
    showNotification('Notifications coupées pour ce contact');
    // TODO: Implémenter la logique de mute
  }

  blockContact() {
    if (!this.currentContact) return;

    // Affiche un popup de confirmation personnalisé
    showNotification(
      `Voulez-vous vraiment bloquer ${this.currentContact.name} ?`,
      {
        confirmText: 'Bloquer',
        cancelText: 'Annuler',
        onConfirm: () => {
          showNotification(`${this.currentContact.name} a été bloqué`);
          this.closeChat();
          // TODO: Implémenter la logique de blocage
        }
      }
    );
  }

  clearConversation() {
    if (!this.currentConversation) return;

    showNotification(
      'Êtes-vous sûr de vouloir vider cette conversation ? Cette action est irréversible.',
      {
        confirmText: 'Vider',
        cancelText: 'Annuler',
        onConfirm: () => {
          this.messages = [];
          this.renderMessages();
          showNotification('Conversation vidée');
          // TODO: Supprimer les messages du serveur
        }
      }
    );
  }

  showWelcomeMessage() {
    if (!this.messagesContainer) return;
    
    this.messagesContainer.innerHTML = `
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
          <p class="text-gray-600 mt-2 text-[14px]">vos données sont chiffrées pour une meilleure protection de votre vie privée</p>
        </div>
      </div>
    `;
  }

  // Fonction pour exporter la conversation
  exportConversation() {
    if (!this.messages.length) {
      showNotification('Aucun message à exporter');
      return;
    }
    
    const conversationText = this.messages.map(msg => {
      const sender = msg.senderId === this.currentUser.id ? 'Vous' : this.currentContact.name;
      const time = this.formatTime(msg.timestamp);
      return `[${time}] ${sender}: ${msg.content}`;
    }).join('\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${this.currentContact.name}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Conversation exportée');
  }

  // Fonction pour marquer tous les messages comme lus
  markAllAsRead() {
    this.messages.forEach(msg => {
      if (msg.senderId !== this.currentUser.id) {
        msg.status = 'read';
      }
    });
    this.renderMessages();
    showNotification('Tous les messages marqués comme lus');
  }

  // Nouvelle méthode à ajouter dans ChatManager
  toggleFavorite() {
    if (!this.currentConversation) return;
    this.currentConversation.isFavorite = !this.currentConversation.isFavorite;

    // Mets à jour le texte du bouton
    const chatFavoriteBtn = document.getElementById('chat-favorite-btn');
    if (chatFavoriteBtn) {
      chatFavoriteBtn.textContent = this.currentConversation.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
    }

    if (this.currentConversation.isFavorite) {
      showNotification('Conversation ajoutée aux favoris');
    } else {
      showNotification('Conversation retirée des favoris');
    }

    if (typeof this.contactsManager?.updateConversation === 'function') {
      this.contactsManager.updateConversation(this.currentConversation);
    }
  }
}