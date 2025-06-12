import { DOMUtils } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';
import { ApiService } from '../services/api.js';
import { showNotification } from '../utils/notifications.js';

export class AuthManager {
  constructor() {
    this.loginPage = DOMUtils.getElementById(SELECTORS.loginPage);
    this.chatPage = DOMUtils.getElementById(SELECTORS.chatPage);
    this.loginForm = DOMUtils.getElementById(SELECTORS.loginForm);
    this.registerForm = DOMUtils.getElementById(SELECTORS.registerForm);
    
    this.initEventListeners();
  }

  initEventListeners() {
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    if (this.registerForm) {
      this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    
    if (showRegisterLink) {
      showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegisterForm();
      });
    }
    
    if (showLoginLink) {
      showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginForm();
      });
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

  async handleLogin(event) {
    event.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!fullname || !phone) {
      showNotification('Veuillez remplir tous les champs');
      return;
    }

    let normalizedInput = this.normalizePhone(phone);
    if (!normalizedInput) return;

    try {
      const response = await ApiService.getUsers();
      const usersList = response || [];
      const user = usersList.find(u => this.normalizePhone(u.phone) === normalizedInput);

      if (user) {
        if (user.name.trim().toLowerCase() !== fullname.trim().toLowerCase()) {
          showNotification('Identifiants incorrects');
          return;
        }
        this.onLoginSuccess(user);
      } else {
        showNotification("Aucun utilisateur trouvé avec ce numéro. Veuillez vous inscrire.");
      }
    } catch (error) {
      showNotification('Erreur de connexion: ' + error.message);
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const phone = document.getElementById('register-phone').value.trim();

    if (!name || !phone) {
      showNotification('Veuillez remplir tous les champs');
      return;
    }

    let normalizedInput = this.normalizePhone(phone);
    if (!normalizedInput) return;

    try {
      const usersList = await ApiService.getUsers() || [];
      const existingUser = usersList.find(u => this.normalizePhone(u.phone) === normalizedInput);
      
      if (existingUser) {
        showNotification("Ce numéro est déjà utilisé");
        return;
      }

      const newUser = {
        name: name,
        phone: normalizedInput,
        avatar: this.getInitials(name),
        status: 'En ligne'
      };

      const createdUser = await ApiService.createUser(newUser);
      if (createdUser) {
        this.onLoginSuccess(createdUser);
        showNotification('Inscription réussie!');
      }
    } catch (error) {
      showNotification('Erreur d\'inscription: ' + error.message);
    }
  }

  onLoginSuccess(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.showChatPage();
    
    document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
  }

  showLoginForm() {
    DOMUtils.show(this.loginForm);
    DOMUtils.hide(this.registerForm);
  }

  showRegisterForm() {
    DOMUtils.hide(this.loginForm);
    DOMUtils.show(this.registerForm);
  }

  showChatPage() {
    DOMUtils.hide(this.loginPage);
    DOMUtils.show(this.chatPage);
  }

  logout() {
    localStorage.removeItem('currentUser');
    DOMUtils.show(this.loginPage);
    DOMUtils.hide(this.chatPage);
    
    document.dispatchEvent(new CustomEvent('userLoggedOut'));
  }
}