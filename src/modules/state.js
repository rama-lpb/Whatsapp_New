export class StateManager {
  constructor() {
    this.state = {
      currentUser: null,
      conversations: [],
      currentConversation: null,
      contacts: [],
      isTyping: false,
      typingTimeout: null
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyStateChange();
  }

  getState() {
    return { ...this.state };
  }

  notifyStateChange() {
    document.dispatchEvent(new CustomEvent('stateChanged', { 
      detail: this.getState() 
    }));
  }

  setCurrentUser(user) {
    this.setState({ currentUser: user });
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser() {
    if (!this.state.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.state.currentUser = JSON.parse(stored);
      }
    }
    return this.state.currentUser;
  }

  setConversations(conversations) {
    this.setState({ conversations });
  }

  addConversation(conversation) {
    const conversations = [...this.state.conversations, conversation];
    this.setState({ conversations });
  }

  setCurrentConversation(conversation) {
    this.setState({ currentConversation: conversation });
  }

  setContacts(contacts) {
    this.setState({ contacts });
  }

  addContact(contact) {
    const contacts = [...this.state.contacts, contact];
    this.setState({ contacts });
  }
}

export const stateManager = new StateManager();