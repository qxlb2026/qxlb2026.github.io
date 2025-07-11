// AGGRESSIVE PHOTO PRELOADING - Start immediately when script loads
(function() {
    'use strict';
    
    // Photo URLs to preload
    const photoUrls = [
        '1 - RX-min.jpg',
        '2 - RXKO-min.jpg', 
        '3 - KO-min.jpg',
        '4 - RXKO-min.jpg',
        '5 - RXKO-min.jpg',
        '6 - RXKO-min.jpg'
    ];
    
    // Cache for loaded images
    const imageCache = new Map();
    
    // Mobile memory persistence test - force images to stay in memory
    function createPersistentImageCache() {
        if (window.matchMedia('(max-width: 768px)').matches) {
            // Create hidden persistent container
            const persistentContainer = document.createElement('div');
            persistentContainer.id = 'persistent-image-cache';
            persistentContainer.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                width: 1px;
                height: 1px;
                opacity: 0;
                pointer-events: none;
                z-index: -9999;
                overflow: hidden;
            `;
            
            // Create persistent hidden images
            photoUrls.forEach((url, index) => {
                const hiddenImg = document.createElement('img');
                hiddenImg.src = url;
                hiddenImg.style.cssText = `
                    width: 1px;
                    height: 1px;
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                `;
                hiddenImg.loading = 'eager';
                hiddenImg.fetchPriority = 'high';
                hiddenImg.setAttribute('aria-hidden', 'true');
                hiddenImg.alt = '';
                
                persistentContainer.appendChild(hiddenImg);
            });
            
            // Add to body immediately
            document.body.appendChild(persistentContainer);
        }
    }
    
    // Preload images immediately 
    function preloadImages() {
        photoUrls.forEach((url, index) => {
            const img = new Image();
            
            // Set fetchpriority for first 3 images
            if (index < 3) {
                img.fetchPriority = 'high';
            }
            
            img.onload = () => {
                imageCache.set(url, img);
            };
            
            img.onerror = () => {
                console.warn(`Failed to preload: ${url}`);
            };
            
            // Start loading immediately
            img.src = url;
        });
    }
    
    // Initialize both strategies
    createPersistentImageCache();
    preloadImages();
    
    // Make cache available globally
    window.photoCache = imageCache;
})();

// Prevent transition flash on page load by adding preload class
// This class is removed after the page loads to enable smooth transitions
document.body.classList.add('preload');

// Enhanced image loading for IMG elements - simplified like bottom image
function forceImageLoading() {
    const galleryImages = document.querySelectorAll('.gallery-photo');
    
    galleryImages.forEach((img) => {
        // Mobile-specific memory persistence
        if (window.matchMedia('(max-width: 768px)').matches) {
            // Force immediate display and prevent unloading
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            img.loading = 'eager';
            img.decoding = 'sync';
            
            // Force GPU layer to prevent mobile unloading
            img.style.transform = 'translateZ(0)';
            img.style.willChange = 'auto';
            img.style.backfaceVisibility = 'hidden';
        } else {
            // Desktop - simple loading
            img.style.opacity = '1';
            img.style.visibility = 'visible';
        }
        
        const handleLoad = () => {
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            
            // Additional mobile persistence after load
            if (window.matchMedia('(max-width: 768px)').matches) {
                img.style.transform = 'translateZ(0)';
            }
        };
        
        const handleError = () => {
            console.warn(`Failed to load image: ${img.src}`);
        };
        
        // Add event listeners
        img.addEventListener('load', handleLoad, { once: true, passive: true });
        img.addEventListener('error', handleError, { once: true, passive: true });
        
        // For already loaded images
        if (img.complete && img.naturalHeight !== 0) {
            handleLoad();
        }
    });
}

// Start loading images when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    forceImageLoading();
});

// Register service worker for aggressive photo caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                // Service worker registered successfully
            })
            .catch((registrationError) => {
                console.warn('Service Worker registration failed: ', registrationError);
            });
    });
}

// Remove preload class after page loads to enable animations
window.addEventListener('load', () => {
    document.body.classList.remove('preload');
    
    // Force another check for images after full page load
    setTimeout(() => {
        forceImageLoading();
    }, 100);
});

// Language toggle functionality
let currentLanguage = 'en';

// Cache DOM elements
let langEnOption, langZhOption, navElement;

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update all elements with bilingual data attributes
    const elements = document.querySelectorAll('[data-en][data-zh]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            // Use innerHTML for elements that contain HTML tags, textContent for others
            if (text.includes('<') && text.includes('>')) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Update the language toggle active state and ARIA attributes
    if (langEnOption && langZhOption) {
        if (lang === 'en') {
            langEnOption.classList.add('active');
            langEnOption.setAttribute('aria-pressed', 'true');
            langZhOption.classList.remove('active');
            langZhOption.setAttribute('aria-pressed', 'false');
        } else {
            langEnOption.classList.remove('active');
            langEnOption.setAttribute('aria-pressed', 'false');
            langZhOption.classList.add('active');
            langZhOption.setAttribute('aria-pressed', 'true');
        }
    }
    
    // Update the HTML lang attribute
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
}

// Main initialization when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    langEnOption = document.getElementById('lang-en');
    langZhOption = document.getElementById('lang-zh');
    navElement = document.querySelector('.nav');
    
    // Language toggle event listeners
    if (langEnOption) {
        langEnOption.addEventListener('click', function() {
            if (currentLanguage !== 'en') {
                switchLanguage('en');
            }
        });
    }
    
    if (langZhOption) {
        langZhOption.addEventListener('click', function() {
            if (currentLanguage !== 'zh') {
                switchLanguage('zh');
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Handle scroll to top for logo link or empty anchor
            if (href === '#' || href === '') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            
            if (target && navElement) {
                const navHeight = navElement.offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active state to navigation links based on scroll position
    let scrollTimeout;
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        const navHeight = navElement ? navElement.offsetHeight : 80;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 50;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Throttled scroll handler for better performance
    function handleScroll() {
        if (scrollTimeout) {
            return;
        }
        
        scrollTimeout = setTimeout(() => {
            updateActiveNavLink();
            scrollTimeout = null;
        }, 16); // ~60fps
    }
    
    // Update active nav link on scroll with passive listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveNavLink(); // Call once on load

    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isActive = navToggle.classList.contains('active');
            
            if (isActive) {
                // Close menu
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            } else {
                // Open menu
                navToggle.classList.add('active');
                navMenu.classList.add('active');
                navToggle.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }
        });
        
        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close menu with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Set initial ARIA attributes
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Toggle navigation menu');
    }

    // Initialize scroll animations for fade-in effects
    initScrollAnimations();
});

// Scroll-triggered animations for fade-in effects on key elements
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Use requestAnimationFrame for smooth animations
                requestAnimationFrame(() => {
                    entry.target.classList.add('animated');
                });
                observer.unobserve(entry.target); // Stop observing after animation
            }
        });
    }, observerOptions);

    // Elements that should animate on scroll (excluding photo gallery for smooth scrolling)
    const elementsToAnimate = [
        '.section-title',
        '.day-name',
        '.day-date',
        '.schedule-event',
        '.faq-item',
        '.things-category',
        '.activity-item',
        '.location-info'
    ];

    // Add animation classes and observe each element
    elementsToAnimate.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.classList.add('animate-on-scroll');
            observer.observe(element);
        });
    });
}

// Save to Calendar functionality - generates .ics files for events
function addToCalendar(eventId) {
    // Event data with bilingual support
    // Each event contains: title, date, start/end times, location, and description
    // Titles and descriptions change based on currentLanguage
    const events = {
        'forest-hike': {
            title: currentLanguage === 'en' ? 'Forest Hike - Keisha & Robin\'s Wedding' : '森林徒步 - 琦霞乐彬婚礼',
            date: '2026-01-16',
            startTime: '15:00',
            endTime: '17:00',
            location: 'MacRitchie Reservoir Park, Singapore',
            description: currentLanguage === 'en' ? 'See monkeys and wild boars as we visit the TreeTop Walk. It\'s not too hot under the shade!' : '跟我们一起参观树梢吊桥。您可能会遇见猴子和野猪。树荫下可是相当凉快呢！'
        },
        'hawker-dinner': {
            title: currentLanguage === 'en' ? 'Hawker Centre Dinner - Keisha & Robin\'s Wedding' : '小贩中心晚餐 - 琦霞乐彬婚礼',
            date: '2026-01-16',
            startTime: '18:30',
            endTime: '20:00',
            location: 'Zion Riverside Food Centre, Singapore',
            description: currentLanguage === 'en' ? 'Join us for dinner at one of Singapore\'s famous hawker centres.' : '来新加坡著名的小贩中心之一与我们共进晚餐。'
        },
        'riverside-walk': {
            title: currentLanguage === 'en' ? 'Riverside Walk - Keisha & Robin\'s Wedding' : '河畔散步 - 琦霞乐彬婚礼',
            date: '2026-01-16',
            startTime: '20:00',
            endTime: '22:00',
            location: 'Singapore River, Singapore',
            description: currentLanguage === 'en' ? 'Walk with us along the Singapore River towards Boat Quay and Marina Bay.' : '与我们一起沿着新加坡河走向克拉码头和滨海湾。'
        },
        'gallery-tour': {
            title: currentLanguage === 'en' ? 'Gallery Viewing - Keisha & Robin\'s Wedding' : '美术馆参观 - 琦霞乐彬婚礼',
            date: '2026-01-17',
            startTime: '13:30',
            endTime: '15:30',
            location: 'National Gallery Singapore, Singapore',
            description: currentLanguage === 'en' ? 'Explore the world\'s largest collection of modern Southeast Asian art.' : '探索世界上最大的现代东南亚艺术收藏。'
        },
        'duck-tour': {
            title: currentLanguage === 'en' ? 'Duck Tour - Keisha & Robin\'s Wedding' : '鸭子游船 - 琦霞乐彬婚礼',
            date: '2026-01-17',
            startTime: '16:00',
            endTime: '17:00',
            location: 'Suntec City Tourist Hub, Singapore',
            description: currentLanguage === 'en' ? 'View some of Singapore\'s most iconic sites while floating down the Singapore River.' : '在新加坡河上欣赏新加坡一些最具标志性的景点。'
        },
        'kite-flying': {
            title: currentLanguage === 'en' ? 'Kite Flying - Keisha & Robin\'s Wedding' : '放风筝 - 琦霞乐彬婚礼',
            date: '2026-01-17',
            startTime: '17:30',
            endTime: '19:30',
            location: 'Marina Barrage, Singapore',
            description: currentLanguage === 'en' ? 'Fly kites with us at the top of Marina Barrage against the backdrop of the city skyline.' : '与我们一起在滨海堤坝放风筝。'
        },
        'garden-walk': {
            title: currentLanguage === 'en' ? 'Garden Walk - Keisha & Robin\'s Wedding' : '植物园散步 - 琦霞乐彬婚礼',
            date: '2026-01-18',
            startTime: '09:00',
            endTime: '11:00',
            location: 'Singapore Botanic Gardens, Singapore',
            description: currentLanguage === 'en' ? 'Come with us for a stroll through the Botanic Gardens, Singapore\'s first UNESCO World Heritage Site.' : '与我们一起漫步新加坡植物园——新加坡首个联合国世界遗产地。'
        },
        'wedding-reception': {
            title: currentLanguage === 'en' ? 'Keisha & Robin\'s Wedding Reception & Dinner' : '琦霞乐彬婚礼招待会与晚宴',
            date: '2026-01-18',
            startTime: '18:30',
            endTime: '22:30',
            location: 'Claudine Restaurant, 39C Harding Road, Singapore 249541',
            description: currentLanguage === 'en' ? 'Join us for an evening of celebration and good food alongside friends, old and new.' : '与我们一起享受美食和庆祝活动，老朋友和新朋友齐聚一堂。'
        }
    };

    // Get the event data for the requested event ID
    const event = events[eventId];
    if (!event) return;

    // Generate ICS content and trigger download
    const icsContent = generateICS(event);
    downloadICS(icsContent, `${eventId}-keisha-robin-wedding.ics`);
}

// Generate ICS (iCalendar) format content for calendar applications
function generateICS(event) {
    const startDateTime = formatDateTimeForICS(event.date, event.startTime);
    const endDateTime = formatDateTimeForICS(event.date, event.endTime);
    const currentDateTime = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Generate a unique ID for this event
    const uid = `${event.date.replace(/-/g, '')}-${event.startTime.replace(':', '')}-keisha-robin-wedding@qxlb2026.github.io`;
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Keisha & Robin Wedding//Wedding Invitation//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${currentDateTime}`,
        `DTSTART:${startDateTime}`,
        `DTEND:${endDateTime}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
    
    return icsContent;
}

// Format date and time for ICS format (YYYYMMDDTHHMMSS)
function formatDateTimeForICS(date, time) {
    // Convert date format from YYYY-MM-DD to YYYYMMDD
    const dateStr = date.replace(/-/g, '');
    // Convert time format from HH:MM to HHMMSS (Singapore timezone)
    const timeStr = time.replace(':', '') + '00';
    
    return `${dateStr}T${timeStr}`;
}

// Create and trigger download of ICS file
function downloadICS(content, filename) {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
