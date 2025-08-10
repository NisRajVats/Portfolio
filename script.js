// Polyfills for older browsers
(function() {
    'use strict';
    
    // Element.matches polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
    
    // Element.closest polyfill
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
    
    // Array.from polyfill
    if (!Array.from) {
        Array.from = function(object) {
            return [].slice.call(object);
        };
    }
})();

// Main application object
const PortfolioApp = {
    // Configuration
    config: {
        animationDuration: 1000,
        pauseDuration: 500,
        scrollThreshold: 300,
        debounceDelay: 100,
        carouselAutoStart: 1000,
        carouselPauseBetweenCycles: 2000
    },
    
    // State management
    state: {
        isMobileMenuOpen: false,
        isCarouselRunning: false,
        currentCarouselIndex: 0,
        isScrolling: false,
        particles: null
    },
    
    // Utility functions
    utils: {
        // Debounce function for performance
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction() {
                const later = function() {
                    clearTimeout(timeout);
                    func.apply(this, arguments);
                }.bind(this);
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle function for scroll events
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Safe element selector
        safeQuerySelector: function(selector, parent) {
            parent = parent || document;
            try {
                return parent.querySelector(selector);
            } catch (e) {
                console.warn('Invalid selector:', selector);
                return null;
            }
        },
        
        // Safe element selector all
        safeQuerySelectorAll: function(selector, parent) {
            parent = parent || document;
            try {
                return Array.from(parent.querySelectorAll(selector));
            } catch (e) {
                console.warn('Invalid selector:', selector);
                return [];
            }
        },
        
        // Check if element is in viewport
        isInViewport: function(element) {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },
        
        // Get browser info for compatibility
        getBrowserInfo: function() {
            const ua = navigator.userAgent;
            return {
                isIE: ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') !== -1,
                isEdge: ua.indexOf('Edge/') !== -1,
                isSafari: ua.indexOf('Safari/') !== -1 && ua.indexOf('Chrome/') === -1,
                isChrome: ua.indexOf('Chrome/') !== -1,
                isFirefox: ua.indexOf('Firefox/') !== -1,
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
            };
        }
    },
    
    // Mobile menu functionality
    mobileMenu: {
        init: function() {
            const menuBtn = PortfolioApp.utils.safeQuerySelector('#menu-btn');
            const mobileMenu = PortfolioApp.utils.safeQuerySelector('#mobile-menu');
            
            if (!menuBtn || !mobileMenu) {
                console.warn('Mobile menu elements not found');
                return;
            }
            
            // Menu toggle
            menuBtn.addEventListener('click', this.toggle.bind(this));
            
            // Close menu when clicking links
            const menuLinks = PortfolioApp.utils.safeQuerySelectorAll('#mobile-menu a');
            menuLinks.forEach(link => {
                link.addEventListener('click', this.close.bind(this));
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#mobile-menu') && !e.target.closest('#menu-btn')) {
                    this.close();
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && PortfolioApp.state.isMobileMenuOpen) {
                    this.close();
                }
            });
            
            // Handle resize events
            window.addEventListener('resize', PortfolioApp.utils.debounce(() => {
                if (window.innerWidth > 768 && PortfolioApp.state.isMobileMenuOpen) {
                    this.close();
                }
            }, PortfolioApp.config.debounceDelay));
        },
        
        toggle: function() {
            if (PortfolioApp.state.isMobileMenuOpen) {
                this.close();
            } else {
                this.open();
            }
        },
        
        open: function() {
            const menuBtn = PortfolioApp.utils.safeQuerySelector('#menu-btn');
            const mobileMenu = PortfolioApp.utils.safeQuerySelector('#mobile-menu');
            
            if (!menuBtn || !mobileMenu) return;
            
            mobileMenu.classList.add('menu-open');
            menuBtn.innerHTML = '<i class="fas fa-times"></i>';
            PortfolioApp.state.isMobileMenuOpen = true;
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        },
        
        close: function() {
            const menuBtn = PortfolioApp.utils.safeQuerySelector('#menu-btn');
            const mobileMenu = PortfolioApp.utils.safeQuerySelector('#mobile-menu');
            
            if (!menuBtn || !mobileMenu) return;
            
            mobileMenu.classList.remove('menu-open');
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            PortfolioApp.state.isMobileMenuOpen = false;
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
    },
    
    // Smooth scrolling functionality
    smoothScroll: {
        init: function() {
            const smoothScrollLinks = PortfolioApp.utils.safeQuerySelectorAll('a[href^="#"]');
            
            smoothScrollLinks.forEach(anchor => {
                anchor.addEventListener('click', this.handleClick.bind(this));
            });
        },
        
        handleClick: function(e) {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href');
            const targetElement = PortfolioApp.utils.safeQuerySelector(targetId);
            
            if (!targetElement) return;
            
            // Close mobile menu if open
            PortfolioApp.mobileMenu.close();
            
            // Smooth scroll with fallback
            if ('scrollBehavior' in document.documentElement.style) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                // Fallback for older browsers
                this.animateScroll(targetElement);
            }
        },
        
        animateScroll: function(targetElement) {
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 800;
            let start = null;
            
            function animation(currentTime) {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = PortfolioApp.smoothScroll.easeInOutQuad(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }
            
            requestAnimationFrame(animation);
        },
        
        easeInOutQuad: function(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
    },
    
    // Scroll to top button
    scrollToTop: {
        init: function() {
            const scrollTopBtn = PortfolioApp.utils.safeQuerySelector('#scroll-top');
            
            if (!scrollTopBtn) {
                console.warn('Scroll to top button not found');
                return;
            }
            
            // Throttled scroll handler for performance
            const handleScroll = PortfolioApp.utils.throttle(() => {
                const scrolled = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrolled > PortfolioApp.config.scrollThreshold) {
                    scrollTopBtn.classList.remove('hidden');
                } else {
                    scrollTopBtn.classList.add('hidden');
                }
            }, 100);
            
            window.addEventListener('scroll', handleScroll, { passive: true });
            
            scrollTopBtn.addEventListener('click', () => {
                if ('scrollBehavior' in document.documentElement.style) {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } else {
                    // Fallback animation
                    PortfolioApp.smoothScroll.animateScroll(document.body);
                }
            });
        }
    },
    
    // Dark mode toggle
    darkMode: {
        init: function() {
            const darkModeToggle = PortfolioApp.utils.safeQuerySelector('#dark-mode-toggle');
            
            if (!darkModeToggle) {
                console.warn('Dark mode toggle not found');
                return;
            }
            
            darkModeToggle.addEventListener('click', this.toggle.bind(this));
            
            // Check for saved preference with error handling
            this.loadPreference();
            
            // Listen for system preference changes
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', 
                    PortfolioApp.utils.debounce(this.handleSystemPreferenceChange.bind(this), 100)
                );
            }
        },
        
        toggle: function() {
            document.body.classList.toggle('light-mode');
            this.updateIcon();
            this.savePreference();
        },
        
        updateIcon: function() {
            const darkModeToggle = PortfolioApp.utils.safeQuerySelector('#dark-mode-toggle');
            if (!darkModeToggle) return;
            
            const isLightMode = document.body.classList.contains('light-mode');
            darkModeToggle.innerHTML = isLightMode 
                ? '<i class="fas fa-moon"></i>'
                : '<i class="fas fa-sun"></i>';
        },
        
        savePreference: function() {
            try {
                const isLightMode = document.body.classList.contains('light-mode');
                if (typeof Storage !== 'undefined') {
                    localStorage.setItem('lightMode', isLightMode.toString());
                }
            } catch (error) {
                console.warn('Could not save theme preference:', error);
            }
        },
        
        loadPreference: function() {
            try {
                if (typeof Storage !== 'undefined') {
                    const savedPreference = localStorage.getItem('lightMode');
                    if (savedPreference === 'true') {
                        document.body.classList.add('light-mode');
                    }
                }
            } catch (error) {
                console.warn('Could not load theme preference:', error);
                // Fall back to system preference
                this.detectSystemPreference();
            }
            this.updateIcon();
        },
        
        detectSystemPreference: function() {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                document.body.classList.add('light-mode');
            }
        },
        
        handleSystemPreferenceChange: function(e) {
            // Only update if user hasn't manually set a preference
            try {
                if (typeof Storage !== 'undefined' && !localStorage.getItem('lightMode')) {
                    if (e.matches) {
                        document.body.classList.remove('light-mode');
                    } else {
                        document.body.classList.add('light-mode');
                    }
                    this.updateIcon();
                }
            } catch (error) {
                console.warn('Error handling system preference change:', error);
            }
        }
    },
    
    // Project carousel
    projectCarousel: {
        init: function() {
            const carousel = PortfolioApp.utils.safeQuerySelector('.project-carousel');
            const container = carousel ? PortfolioApp.utils.safeQuerySelector('.flex', carousel) : null;
            
            if (!carousel || !container) {
                console.warn('Project carousel elements not found');
                return;
            }
            
            const originalCards = PortfolioApp.utils.safeQuerySelectorAll('.project-card');
            if (originalCards.length === 0) {
                console.warn('No project cards found');
                return;
            }
            
            this.carousel = carousel;
            this.container = container;
            this.originalCards = originalCards;
            this.currentCards = [...originalCards];
            this.cardWidth = originalCards[0].offsetWidth || 320;
            this.gap = 24;
            this.isAnimating = false;
            
            // Handle resize events
            window.addEventListener('resize', PortfolioApp.utils.debounce(() => {
                this.handleResize();
            }, PortfolioApp.config.debounceDelay));
            
            // Initialize carousel
            this.reset();
            
            // Start animation with delay
            setTimeout(() => {
                this.startAnimation();
            }, PortfolioApp.config.carouselAutoStart);
            
            // Pause on hover
            this.addInteractionListeners();
        },
        
        reset: function() {
            if (!this.container) return;
            
            this.container.innerHTML = '';
            this.currentCards.forEach(card => {
                if (card && card.parentNode !== this.container) {
                    this.container.appendChild(card.cloneNode(true));
                }
            });
            this.container.style.transform = 'translateX(0)';
            this.container.style.transition = 'none';
        },
        
        handleResize: function() {
            if (!this.originalCards[0]) return;
            
            const newCardWidth = this.originalCards[0].offsetWidth || 320;
            if (Math.abs(newCardWidth - this.cardWidth) > 10) {
                this.cardWidth = newCardWidth;
                this.reset();
            }
        },
        
        startAnimation: function() {
            if (!this.container || PortfolioApp.state.isCarouselRunning) return;
            
            PortfolioApp.state.isCarouselRunning = true;
            this.animateOneCard();
        },
        
        stopAnimation: function() {
            PortfolioApp.state.isCarouselRunning = false;
            this.isAnimating = false;
        },
        
        animateOneCard: function() {
            if (!PortfolioApp.state.isCarouselRunning || this.isAnimating) return;
            
            this.isAnimating = true;
            
            try {
                // 1. Slide out leftmost card
                this.container.style.transition = `transform ${PortfolioApp.config.animationDuration}ms ease-in-out`;
                this.container.style.transform = `translateX(-${this.cardWidth + this.gap}px)`;
                
                setTimeout(() => {
                    if (!PortfolioApp.state.isCarouselRunning) {
                        this.isAnimating = false;
                        return;
                    }
                    
                    // 2. Remove the transition and moved card
                    this.container.style.transition = 'none';
                    const movedCard = this.container.firstElementChild;
                    
                    if (movedCard) {
                        this.container.removeChild(movedCard);
                        
                        // 3. Move the card to end and update array
                        this.container.appendChild(movedCard);
                        this.currentCards.push(this.currentCards.shift());
                        
                        // 4. Reset position
                        this.container.style.transform = 'translateX(0)';
                        
                        // Force reflow
                        if (this.container.offsetWidth) {
                            // Reflow triggered
                        }
                        
                        // 5. Pause before next animation
                        setTimeout(() => {
                            this.isAnimating = false;
                            
                            if (!PortfolioApp.state.isCarouselRunning) return;
                            
                            // 6. Check if we've shown all cards
                            const cycleDelay = (this.currentCards[0] === this.originalCards[0]) 
                                ? PortfolioApp.config.carouselPauseBetweenCycles 
                                : PortfolioApp.config.pauseDuration;
                                
                            setTimeout(() => {
                                this.animateOneCard();
                            }, cycleDelay);
                            
                        }, PortfolioApp.config.pauseDuration);
                    }
                }, PortfolioApp.config.animationDuration);
                
            } catch (error) {
                console.error('Carousel animation error:', error);
                this.isAnimating = false;
            }
        },
        
        addInteractionListeners: function() {
            if (!this.carousel) return;
            
            // Pause on hover/touch
            this.carousel.addEventListener('mouseenter', () => {
                this.stopAnimation();
            });
            
            this.carousel.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    this.startAnimation();
                }, 1000);
            });
            
            // Touch events for mobile
            let touchStartX = 0;
            let touchEndX = 0;
            
            this.carousel.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                this.stopAnimation();
            }, { passive: true });
            
            this.carousel.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
                
                setTimeout(() => {
                    this.startAnimation();
                }, 2000);
            }, { passive: true });
        },
        
        handleSwipe: function(startX, endX) {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swipe left - next card
                    this.animateOneCard();
                }
                // For swipe right, we could implement reverse animation
            }
        }
    },
    
    // Particles.js initialization
    particles: {
        init: function() {
            // Check if particles.js is loaded
            if (typeof particlesJS === 'undefined') {
                console.warn('Particles.js not loaded');
                return;
            }
            
            const particlesContainer = PortfolioApp.utils.safeQuerySelector('#particles-js');
            if (!particlesContainer) {
                console.warn('Particles container not found');
                return;
            }
            
            try {
                // Initialize particles with error handling
                particlesJS('particles-js', {
                    particles: {
                        number: { 
                            value: this.getParticleCount(), 
                            density: { enable: true, value_area: 800 } 
                        },
                        color: { value: '#00DDEB' },
                        shape: { type: 'circle' },
                        opacity: { value: 0.5, random: true },
                        size: { value: 3, random: true },
                        line_linked: { 
                            enable: true, 
                            distance: 150, 
                            color: '#00DDEB', 
                            opacity: 0.4, 
                            width: 1 
                        },
                        move: { 
                            enable: true, 
                            speed: 2, 
                            direction: 'none', 
                            random: false, 
                            straight: false, 
                            out_mode: 'out', 
                            bounce: false 
                        }
                    },
                    interactivity: {
                        detect_on: 'canvas',
                        events: { 
                            onhover: { enable: !PortfolioApp.utils.getBrowserInfo().isMobile, mode: 'repulse' }, 
                            onclick: { enable: true, mode: 'push' }, 
                            resize: true 
                        },
                        modes: { 
                            repulse: { distance: 100, duration: 0.4 }, 
                            push: { particles_nb: 4 } 
                        }
                    },
                    retina_detect: true
                });
                
                PortfolioApp.state.particles = window.pJSDom[0];
                
            } catch (error) {
                console.error('Particles.js initialization error:', error);
            }
            
            // Handle resize events
            window.addEventListener('resize', PortfolioApp.utils.debounce(() => {
                this.handleResize();
            }, PortfolioApp.config.debounceDelay));
        },
        
        getParticleCount: function() {
            const browserInfo = PortfolioApp.utils.getBrowserInfo();
            const width = window.innerWidth;
            
            // Reduce particles on mobile for performance
            if (browserInfo.isMobile || width < 768) {
                return 40;
            } else if (width < 1024) {
                return 60;
            } else {
                return 80;
            }
        },
        
        handleResize: function() {
            if (PortfolioApp.state.particles && PortfolioApp.state.particles.pJS) {
                try {
                    PortfolioApp.state.particles.pJS.particles.number.value = this.getParticleCount();
                    PortfolioApp.state.particles.pJS.fn.particlesRefresh();
                } catch (error) {
                    console.warn('Particles resize error:', error);
                }
            }
        }
    },
    
    // Form handling
    forms: {
        init: function() {
            const contactForm = PortfolioApp.utils.safeQuerySelector('form[action*="formsubmit"]');
            if (!contactForm) {
                console.warn('Contact form not found');
                return;
            }
            
            contactForm.addEventListener('submit', this.handleSubmit.bind(this));
            
            // Add input validation
            const inputs = PortfolioApp.utils.safeQuerySelectorAll('input, textarea', contactForm);
            inputs.forEach(input => {
                input.addEventListener('blur', this.validateInput.bind(this));
                input.addEventListener('input', this.clearErrors.bind(this));
            });
        },
        
        handleSubmit: function(e) {
            const form = e.target;
            const submitButton = PortfolioApp.utils.safeQuerySelector('button[type="submit"]', form);
            
            // Basic validation
            if (!this.validateForm(form)) {
                e.preventDefault();
                return false;
            }
            
            // Show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 'Sending...';
                
                // Reset button after delay (in case of errors)
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Send Message';
                }, 10000);
            }
        },
        
        validateForm: function(form) {
            let isValid = true;
            const inputs = PortfolioApp.utils.safeQuerySelectorAll('input[required], textarea[required]', form);
            
            inputs.forEach(input => {
                if (!this.validateInput({ target: input })) {
                    isValid = false;
                }
            });
            
            return isValid;
        },
        
        validateInput: function(e) {
            const input = e.target;
            const value = input.value.trim();
            let isValid = true;
            let errorMessage = '';
            
            // Remove existing error
            this.clearErrors(e);
            
            // Required field validation
            if (input.hasAttribute('required') && !value) {
                errorMessage = 'This field is required';
                isValid = false;
            }
            
            // Email validation
            if (input.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
            }
            
            // Show error if invalid
            if (!isValid) {
                this.showError(input, errorMessage);
            }
            
            return isValid;
        },
        
        showError: function(input, message) {
            input.classList.add('error');
            
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            errorElement.style.color = 'var(--accent-pink)';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            
            input.parentNode.appendChild(errorElement);
        },
        
        clearErrors: function(e) {
            const input = e.target;
            input.classList.remove('error');
            
            const errorMessage = input.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    },
    
    // Performance monitoring
    performance: {
        init: function() {
            // Monitor page load performance
            window.addEventListener('load', () => {
                if (window.performance && window.performance.timing) {
                    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                    console.log(`Page load time: ${loadTime}ms`);
                    
                    // Warn if load time is slow
                    if (loadTime > 3000) {
                        console.warn('Slow page load detected. Consider optimizing resources.');
                    }
                }
            });
            
            // Monitor memory usage (if available)
            if (window.performance && window.performance.memory) {
                setInterval(() => {
                    const memory = window.performance.memory;
                    const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                    
                    if (usage > 80) {
                        console.warn('High memory usage detected:', usage.toFixed(2) + '%');
                    }
                }, 30000); // Check every 30 seconds
            }
        }
    },
    
    // Main initialization
    init: function() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init.bind(this));
            return;
        }
        
        console.log('Initializing Portfolio App...');
        
        try {
            // Initialize all modules
            this.mobileMenu.init();
            this.smoothScroll.init();
            this.scrollToTop.init();
            this.darkMode.init();
            this.projectCarousel.init();
            this.particles.init();
            this.forms.init();
            this.performance.init();
            
            console.log('Portfolio App initialized successfully');
            
        } catch (error) {
            console.error('Error initializing Portfolio App:', error);
        }
        
        // Handle browser compatibility warnings
        const browserInfo = this.utils.getBrowserInfo();
        if (browserInfo.isIE) {
            console.warn('Internet Explorer detected. Some features may not work optimally.');
        }
    }
};

// Initialize the application
PortfolioApp.init();