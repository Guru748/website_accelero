// Accelerobotics Website JavaScript - Fixed Version

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
        // Navigation links
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-page]');
            if (target) {
                e.preventDefault();
                const page = target.getAttribute('data-page');
                this.navigateToPage(page);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // Handle popstate for better browser navigation
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
    }

    setupMobileNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });

            // Close mobile menu when clicking outside
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
        }
    }

    setupInteractiveElements() {
        // Setup robot card interactions
        const robotCards = document.querySelectorAll('.robot-card');
        robotCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                this.navigateToPage('products');
                
                // Scroll to relevant product section after navigation
                setTimeout(() => {
                    const robotTitle = card.querySelector('h3').textContent;
                    this.scrollToProductSection(robotTitle);
                }, 200);
            });
        });

        // Setup service card interactions
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                this.navigateToPage('services');
            });
        });

        // Setup industry tag interactions
        const industryTags = document.querySelectorAll('.industry-tag');
        industryTags.forEach(tag => {
            tag.style.cursor = 'pointer';
            tag.addEventListener('click', () => {
                this.navigateToPage('industries');
            });
        });

        // Setup consultation buttons
        this.setupConsultationButtons();
    }

    setupConsultationButtons() {
        const consultationButtons = document.querySelectorAll('button');
        consultationButtons.forEach(button => {
            const buttonText = button.textContent.toLowerCase();
            if (buttonText.includes('consultation') || buttonText.includes('quote')) {
                button.addEventListener('click', () => {
                    this.navigateToPage('contact');
                    
                    // After navigation, pre-select appropriate service
                    setTimeout(() => {
                        const serviceSelect = document.getElementById('service-type');
                        if (serviceSelect) {
                            if (buttonText.includes('consultation')) {
                                serviceSelect.value = 'consultation';
                            } else if (buttonText.includes('quote')) {
                                serviceSelect.value = 'purchase';
                            }
                            serviceSelect.dispatchEvent(new Event('change'));
                        }
                        
                        const contactForm = document.getElementById('contact-form');
                        if (contactForm) {
                            contactForm.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 200);
                });
            }
        });
    }

    scrollToProductSection(robotName) {
        let targetSection = null;
        
        if (robotName.includes('T600') || robotName.toLowerCase().includes('delivery')) {
            targetSection = document.querySelector('.product-category:first-child');
        } else if (robotName.includes('MT1') || robotName.toLowerCase().includes('cleaning')) {
            targetSection = document.querySelector('.product-category:nth-child(2)');
        } else if (robotName.toLowerCase().includes('interactive')) {
            targetSection = document.querySelector('.product-category:nth-child(3)');
        }
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    handleInitialRoute() {
        const hash = window.location.hash.slice(1);
        if (hash && this.pages.includes(hash)) {
            this.navigateToPage(hash);
        } else {
            this.navigateToPage('home');
        }
    }

    handleRouteChange() {
        const hash = window.location.hash.slice(1);
        if (hash && this.pages.includes(hash)) {
            this.showPage(hash);
        } else {
            this.showPage('home');
        }
    }

    navigateToPage(pageId) {
        if (!this.pages.includes(pageId)) {
            console.warn(`Page '${pageId}' not found`);
            return;
        }

        // Update URL hash
        if (history.pushState) {
            history.pushState(null, null, `#${pageId}`);
        } else {
            window.location.hash = pageId;
        }

        this.showPage(pageId);
    }

    showPage(pageId) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show the selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            this.updateActiveNavLink(pageId);
            this.scrollToTop();
        }
    }

    updateActiveNavLink(pageId) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page link
        const activeLink = document.querySelector(`[data-page="${pageId}"]`);
        if (activeLink && activeLink.classList.contains('nav-link')) {
            activeLink.classList.add('active');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate required fields
        const requiredFields = ['name', 'email', 'service-type', 'message'];
        const errors = [];

        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                errors.push(this.getFieldLabel(field));
            }
        });

        // Validate email format
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        // Remove any existing error/success messages
        this.removeFormMessages(form);

        if (errors.length > 0) {
            this.showFormError(form, `Please fill in the following fields: ${errors.join(', ')}`);
            return;
        }

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.classList.add('btn--loading');
        submitButton.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            this.showFormSuccess(form, 'Thank you for your message! We\'ll get back to you within 24 hours.');
            form.reset();
            
            // Reset button state
            submitButton.classList.remove('btn--loading');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 2000);
    }

    getFieldLabel(fieldName) {
        const labels = {
            'name': 'Full Name',
            'email': 'Email Address',
            'phone': 'Phone Number',
            'company': 'Company/Organization',
            'service-type': 'Service Interest',
            'message': 'Message'
        };
        return labels[fieldName] || fieldName;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFormError(form, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);

        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showFormSuccess(form, message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.textContent = message;
        form.insertBefore(successDiv, form.firstChild);

        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    removeFormMessages(form) {
        const existingMessages = form.querySelectorAll('.form-error, .form-success');
        existingMessages.forEach(message => message.remove());
    }
}

// UI Enhancement class for animations and interactions
class UIEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.addHoverEffects();
        this.addScrollAnimations();
        this.setupDynamicFormBehavior();
    }

    addHoverEffects() {
        const cards = document.querySelectorAll('.service-card, .robot-card, .industry-card, .why-card, .step');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!card.style.transform || card.style.transform === 'translateY(0px)') {
                    card.style.transform = 'translateY(-4px)';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0px)';
            });
        });

        // Industry tags hover effect
        const industryTags = document.querySelectorAll('.industry-tag');
        industryTags.forEach(tag => {
            tag.addEventListener('mouseenter', () => {
                tag.style.transform = 'scale(1.05)';
            });
            
            tag.addEventListener('mouseleave', () => {
                tag.style.transform = 'scale(1)';
            });
        });
    }

    addScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll(
            '.service-card, .robot-card, .industry-card, .step, .why-card, .product-category, .robot-item'
        );
        
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    }

    setupDynamicFormBehavior() {
        const serviceSelect = document.getElementById('service-type');
        const messageTextarea = document.getElementById('message');
        
        if (serviceSelect && messageTextarea) {
            serviceSelect.addEventListener('change', (e) => {
                this.updateMessagePlaceholder(e.target.value, messageTextarea);
            });
        }
    }

    updateMessagePlaceholder(serviceType, messageTextarea) {
        const placeholders = {
            'rent': 'Tell us about your event, duration needed, and any specific requirements...',
            'lease-3': 'Describe your business needs and how robotics could help improve your operations...',
            'lease-6': 'Let us know about your long-term automation goals and current challenges...',
            'lease-custom': 'Describe your unique requirements and we\'ll create a custom solution...',
            'purchase': 'Tell us about your business and which robots you\'re interested in purchasing...',
            'consultation': 'What would you like to discuss in your free consultation? Any specific challenges or goals?'
        };

        messageTextarea.placeholder = placeholders[serviceType] || 'Describe your project, event, or business needs...';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main application
    window.app = new AcceleroboticsApp();
    
    // Initialize UI enhancements
    new UIEnhancements();
    
    console.log('Accelerobotics website initialized successfully!');
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AcceleroboticsApp,
        UIEnhancements
    };
}
