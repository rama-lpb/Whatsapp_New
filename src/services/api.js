const API_BASE_URL = 'http://localhost:3001';

export class ApiService {
  static async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Méthodes pour les utilisateurs
  static async getUsers() {
    return this.request('users');
  }

  static async createUser(userData) {
    return this.request('users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  static async updateUser(userId, userData) {
    return this.request(`users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Méthodes pour les conversations
  static async getConversations() {
    return this.request('conversations');
  }

  static async createConversation(conversationData) {
    return this.request('conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData)
    });
  }

  static async updateConversation(conversationId, conversationData) {
    return this.request(`conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(conversationData)
    });
  }

  static async deleteConversation(conversationId) {
    return this.request(`conversations/${conversationId}`, {
      method: 'DELETE'
    });
  }

  // Méthodes pour les messages
  static async getMessages() {
    return this.request('messages');
  }

  static async sendMessage(messageData) {
    return this.request('messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  static async markMessageAsRead(messageId) {
    return this.request(`messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'read' })
    });
  }

  static async clearConversationMessages(conversationId) {
    return this.request(`messages/conversation/${conversationId}`, {
      method: 'DELETE'
    });
  }

  // Méthodes pour la gestion des contacts
  static async blockContact(contactId) {
    return this.request(`users/${contactId}/block`, {
      method: 'POST'
    });
  }

  static async unblockContact(contactId) {
    return this.request(`users/${contactId}/unblock`, {
      method: 'POST'
    });
  }

  // Méthodes pour les recherches
  static async searchMessages(conversationId, query) {
    return this.request(`messages/search?conversationId=${conversationId}&q=${encodeURIComponent(query)}`);
  }

  static async searchContacts(query) {
    return this.request(`users/search?q=${encodeURIComponent(query)}`);
  }
}