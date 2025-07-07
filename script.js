// Language toggle functionality
let currentLanguage = 'en';

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update all elements with data-en and data-zh attributes
    const elements = document.querySelectorAll('[data-en][data-zh]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update placeholders for form inputs
    const placeholderElements = document.querySelectorAll('[data-placeholder-en][data-placeholder-zh]');
    placeholderElements.forEach(element => {
        const placeholder = element.getAttribute(`data-placeholder-${lang}`);
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
    
    // Update select options
    const selectOptions = document.querySelectorAll('select option[data-en][data-zh]');
    selectOptions.forEach(option => {
        const text = option.getAttribute(`data-${lang}`);
        if (text) {
            option.textContent = text;
        }
    });
    
    // Update the language toggle active state
    const langEnOption = document.getElementById('lang-en');
    const langZhOption = document.getElementById('lang-zh');
    if (langEnOption && langZhOption) {
        if (lang === 'en') {
            langEnOption.classList.add('active');
            langZhOption.classList.remove('active');
        } else {
            langEnOption.classList.remove('active');
            langZhOption.classList.add('active');
        }
    }
    
    // Update the HTML lang attribute
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
}

// RSVP Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    // Language toggle event listeners
    const langEnOption = document.getElementById('lang-en');
    const langZhOption = document.getElementById('lang-zh');
    
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

    const rsvpLinks = document.querySelectorAll('a[href="#rsvp"]');
    const rsvpModal = document.getElementById('rsvp-modal');
    const closeModal = document.querySelector('.close-modal');
    const rsvpForm = document.querySelector('.rsvp-form');

    // Open modal when RSVP links are clicked
    rsvpLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            rsvpModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal when close button is clicked
    closeModal.addEventListener('click', function() {
        rsvpModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside the modal content
    rsvpModal.addEventListener('click', function(e) {
        if (e.target === rsvpModal) {
            rsvpModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Handle form submission
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(rsvpForm);
        const firstName = rsvpForm.querySelector('input[data-placeholder-en="First Name"]').value;
        const lastName = rsvpForm.querySelector('input[data-placeholder-en="Last Name"]').value;
        const email = rsvpForm.querySelector('input[type="email"]').value;
        const attendance = rsvpForm.querySelector('select').value;
        const guests = rsvpForm.querySelector('input[type="number"]').value;
        const dietary = rsvpForm.querySelector('textarea').value;

        // Simple validation
        if (!firstName || !lastName || !email || !attendance) {
            const errorMessage = currentLanguage === 'en' 
                ? 'Please fill in all required fields.' 
                : '请填写所有必填字段。';
            alert(errorMessage);
            return;
        }

        // Show success message
        const successMessage = currentLanguage === 'en' 
            ? 'Thank you for your RSVP! We look forward to celebrating with you.' 
            : '感谢您的回复！我们期待与您一起庆祝。';
        alert(successMessage);
        
        // Reset form and close modal
        rsvpForm.reset();
        rsvpModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#rsvp') {
                return; // Let the modal handler take care of this
            }
            
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && rsvpModal.style.display === 'block') {
            rsvpModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});
