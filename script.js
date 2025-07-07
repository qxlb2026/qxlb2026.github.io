// RSVP Modal functionality
document.addEventListener('DOMContentLoaded', function() {
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
        const firstName = rsvpForm.querySelector('input[placeholder="First Name"]').value;
        const lastName = rsvpForm.querySelector('input[placeholder="Last Name"]').value;
        const email = rsvpForm.querySelector('input[type="email"]').value;
        const attendance = rsvpForm.querySelector('select').value;
        const guests = rsvpForm.querySelector('input[type="number"]').value;
        const dietary = rsvpForm.querySelector('textarea').value;

        // Simple validation
        if (!firstName || !lastName || !email || !attendance) {
            alert('Please fill in all required fields.');
            return;
        }

        // Show success message
        alert('Thank you for your RSVP! We look forward to celebrating with you.');
        
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
