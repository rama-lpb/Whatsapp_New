import { DOMUtils } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';
import { ApiService } from '../services/api.js';
import { showNotification } from '../utils/notifications.js';

export class ContactsManager {
  constructor() {
    this.contactBtn = DOMUtils.getElementById(SELECTORS.contactBtn);
    this.addContactForm = DOMUtils.getElementById(SELECTORS.addContactForm);
    this.addContactFormContainer = DOMUtils.getElementById(SELECTORS.addContactFormContainer);
    this.cancelAddContactBtn = DOMUtils.getElementById(SELECTORS.cancelAddContact);
    this.conversationsList = DOMUtils.getElementById(SELECTORS.conversationsList);
    
    this.conversations = [];
    this.users = [];
    this.currentUser = null;
    
    this.initEventListeners();
  }

  initEventListeners() {
    if (this.contactBtn) {
      this.contactBtn.addEventListener('click', () => this.showAddContactForm());
    }
    
    if (this.cancelAddContactBtn) {
      this.cancelAddContactBtn.addEventListener('click', () => this.hideAddContactForm());
    }
    
    if (this.addContactForm) {
      this.addContactForm.addEventListener('submit', (e) => this.handleAddContact(e));
    }

    document.addEventListener('userLoggedIn', (e) => {
      this.currentUser = e.detail;
      this.loadConversations();
    });

    document.addEventListener('filterChanged', (e) => {
      const filter = e.detail;
      this.filterConversations(filter);
    });
  }

  showAddContactForm() {
    DOMUtils.show(this.addContactFormContainer);
    const filtersDiv = document.getElementById('filters');
    const conversationsListDiv = document.getElementById('conversations-list');
    if (filtersDiv) DOMUtils.hide(filtersDiv.parentElement);
    if (conversationsListDiv) DOMUtils.hide(conversationsListDiv);
  }

  hideAddContactForm() {
    DOMUtils.hide(this.addContactFormContainer);
    const filtersDiv = document.getElementById('filters');
    const conversationsListDiv = document.getElementById('conversations-list');
    if (filtersDiv) DOMUtils.show(filtersDiv.parentElement);
    if (conversationsListDiv) DOMUtils.show(conversationsListDiv);
    
    if (this.addContactForm) {
      this.addContactForm.reset();
    }
  }

  normalizePhone(phone) {
    let cleaned = phone.trim().replace(/[\s\-]/g, '');
    if (cleaned.startsWith('+')) {
      cleaned = '+' + cleaned.slice(1).replace(/\D/g, '');
    } else {
      cleaned = cleaned.replace(/\D/g, '');
    }
    const valid = /^(\+?\d{9,15})$/.test(cleaned);
    if (!valid) {
      showNotification("Numéro invalide !");
      return null;
    }
    return cleaned.slice(-9);
  }

  getInitials(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async handleAddContact(event) {
    event.preventDefault();
    
    const name = document.getElementById('new-contact-name').value.trim();
    const phone = document.getElementById('new-contact-phone').value.trim();

    if (!name || !phone) {
      showNotification('Veuillez remplir tous les champs');
      return;
    }

    let normalizedInput = this.normalizePhone(phone);
    if (!normalizedInput) return;

    try {
      const usersList = await ApiService.getUsers() || [];
      let existingUser = usersList.find(u => this.normalizePhone(u.phone) === normalizedInput);
      
      let contactUser;
      
      if (existingUser) {
        contactUser = existingUser;
        const existingConversation = this.conversations.find(conv => 
          conv.participants.includes(this.currentUser.id) && 
          conv.participants.includes(contactUser.id)
        );
        
        if (existingConversation) {
          showNotification("Vous avez déjà une conversation avec ce contact");
          return;
        }
      } else {
        const newUser = {
          id: this.generateId(),
          name: name,
          phone: normalizedInput,
          avatar: this.getInitials(name),
          status: 'En ligne'
        };
        
        contactUser = await ApiService.createUser(newUser);
        if (!contactUser) {
          showNotification("Erreur lors de l'ajout du contact");
          return;
        }
      }

      const newConversation = {
        id: this.generateId(),
        participants: [this.currentUser.id, contactUser.id],
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString()
      };

      const createdConversation = await ApiService.createConversation(newConversation);
      
      if (createdConversation) {
        showNotification("Contact ajouté avec succès !");
        this.hideAddContactForm();
        await this.loadConversations();
      } else {
        showNotification("Erreur lors de la création de la conversation");
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact:', error);
      showNotification('Erreur lors de l\'ajout du contact: ' + error.message);
    }
  }

  async loadConversations() {
    try {
      this.conversations = await ApiService.getConversations() || [];
      this.users = await ApiService.getUsers() || [];
      this.renderConversations();
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    }
  }

  renderConversations(conversationsToRender = this.conversations) {
    if (!this.conversationsList || !this.currentUser) return;

    this.conversationsList.innerHTML = '';
    
    conversationsToRender.forEach(conversation => {
      const otherUserId = conversation.participants.find(id => id !== this.currentUser.id);
      const otherUser = this.users.find(user => user.id === otherUserId);
      
      if (!otherUser) return;
      
      const conversationElement = this.createConversationElement(conversation, otherUser);
      this.conversationsList.prepend(conversationElement);
    });
  }

  createConversationElement(conversation, otherUser) {
    const conversationDiv = document.createElement('div');
    conversationDiv.className = 'flex items-center p-3 hover:bg-gray-700 cursor-pointer transition rounded-lg';

    conversationDiv.innerHTML = `
      <div class="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span class="text-white font-medium">${otherUser.avatar || otherUser.name[0]}</span>
      </div>
      <div class="ml-3 flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="text-white font-medium truncate">${otherUser.name}</h3>
          <span class="text-gray-400 text-xs">${this.formatTime(conversation.lastMessageTime)}</span>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-gray-400 text-sm truncate">
            ${conversation.lastMessage ? conversation.lastMessage : '<span class="italic text-gray-500">Aucun message</span>'}
          </p>
          ${conversation.unreadCount > 0 ? `
            <span class="bg-yellow-600 text-white text-xs rounded-full px-2 py-1 ml-2">${conversation.unreadCount}</span>
          ` : ''}
        </div>
      </div>
    `;

    conversationDiv.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('conversationSelected', {
        detail: { conversation, otherUser }
      }));
    });

    return conversationDiv;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }

  filterConversations(filter) {
    let filtered = this.conversations;
    if (filter === 'favorites') {
      filtered = filtered.filter(conv => conv.isFavorite);
    } else if (filter === 'unread') {
      filtered = filtered.filter(conv => conv.unreadCount > 0);
    } else if (filter === 'groups') {
      filtered = filtered.filter(conv => conv.isGroup);
    }
    this.renderConversations(filtered);
  }

  updateConversation(conversation) {
    // Mets à jour la conversation dans le tableau, puis rafraîchis l'affichage
    const idx = this.conversations.findIndex(c => c.id === conversation.id);
    if (idx !== -1) {
      this.conversations[idx] = conversation;
      this.renderConversations(this.conversations);
    }
  }
}