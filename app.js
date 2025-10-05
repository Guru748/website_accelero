class AcceleroboticsApp {
    constructor() {
        this.currentPage = 'home';
        this.pages = ['home', 'about', 'services', 'products', 'industries', 'getting-started', 'contact'];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleInitialRoute();
        this.setupMobileNavigation();
        this.setupFormValidation();
        this.setupInteractiveElements();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-page]');
            if (target) {
                e.preventDefault();
                const page = target.getAttribute('data-page');
                this.navigateToPage(page);
            }
        });

        window.addEventListener('hashchange', () => { this.handleRouteChange(); });
        window.addEventListener('popstate', () => { this.handleRouteChange(); });
    }

    setupMobileNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });

            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }
    }

    setupFormValidation() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(contactForm);
            });

            const formFields = contactForm.querySelectorAll('input, select, textarea');
            formFields.forEach(field => {
                field.addEventListener('blur', () => { this.validateField(field); });
                field.addEventListener('input', () => { this.clearFieldError(field); });
            });
        }
    }

    setupInteractiveElements() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        this.setupCardAnimations();
    }

    setupCardAnimations() {
        const cards = document.querySelectorAll('.service-card, .robot-card, .industry-card, .reason-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-5px)'; card.style.transition = 'all 0.3s ease'; });
            card.addEventListener('mouseleave', () => { card.style.transform = 'translateY(0)'; });
        });
    }

    navigateToPage(pageId) {
        if (!this.pages.includes(pageId)) return;
        const currentPageElement = document.getElementById(this.currentPage);
        if (currentPageElement) { currentPageElement.classList.remove('active'); }
        const newPageElement = document.getElementById(pageId);
        if (newPageElement) { newPageElement.classList.add('active'); }
        this.updateNavigation(pageId);
        window.history.pushState({ page: pageId }, '', `#${pageId}`);
        this.currentPage = pageId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateNavigation(activePageId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === activePageId) { link.classList.add('active'); }
        });
    }

    handleInitialRoute() {
        const hash = window.location.hash.substr(1);
        if (hash && this.pages.includes(hash)) { this.navigateToPage(hash); }
        else { this.navigateToPage('home'); }
    }

    handleRouteChange() {
        const hash = window.location.hash.substr(1);
        if (hash && this.pages.includes(hash) && hash !== this.currentPage) { this.navigateToPage(hash); }
        else if (!hash && this.currentPage !== 'home') { this.navigateToPage('home'); }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        let isValid = true;
        let errorMessage = '';
        this.clearFieldError(field);
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} is required.`;
        } else if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        } else if (fieldType === 'tel' && value) {
            const phoneRegex = /^[\d\s\-+()]+$/;
            if (!phoneRegex.test(value) || value.length < 10) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number.';
            }
        } else if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Please select an option.';
        }
        if (!isValid) { this.showFieldError(field, errorMessage); }
        else { this.showFieldSuccess(field); }
        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) { errorElement.remove(); }
    }

    showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('success');
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }

    showFieldSuccess(field) {
        field.classList.add('success');
        field.classList.remove('error');
    }

    getFieldLabel(field) {
        const label = field.parentNode.querySelector('label');
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }

    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const formFields = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;
        formFields.forEach(field => { if (!this.validateField(field)) { isFormValid = false; } });
        if (!isFormValid) { this.showFormMessage('Please correct the errors above.', 'error'); return; }
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...'; submitButton.classList.add('loading'); submitButton.disabled = true;
        try {
            const formDataObject = {};
            for (let [key, value] of formData.entries()) { formDataObject[key] = value; }
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formDataObject)
            });
            const result = await response.json();
            if (response.ok && result.success) {
                this.showFormMessage('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
                form.reset();
                formFields.forEach(field => { this.clearFieldError(field); });
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormMessage('There was an error sending your message. Please try again or contact us directly at accelerorobotics@gmail.com', 'error');
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    }

    showFormMessage(message, type) {
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) { existingMessage.remove(); }
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type === 'error' ? 'error-message' : 'success-message'}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-weight: 500;
            background-color: ${type === 'error' ? '#fef2f2' : '#f0fdf4'};
            color: ${type === 'error' ? '#dc2626' : '#166534'};
            border: 1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'};
        `;
        const form = document.getElementById('contact-form');
        form.insertBefore(messageElement, form.firstChild);
        setTimeout(() => { if (messageElement.parentNode) { messageElement.remove(); } }, 8000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.acceleroboticsApp = new AcceleroboticsApp();
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const navToggle = document.getElementById('nav-toggle');
            const navMenu = document.getElementById('nav-menu');
            if (navToggle && navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
});
