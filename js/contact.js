// =============================================
// Contact Form Handler
// Created by: KikoEnkTau
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Form submission handler
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Hide previous messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';

        // Get submit button
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        // Set loading state
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Mengirim...';

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };

        try {
            // Send data to Formspree or your backend
            const response = await fetch(window.siteConfig.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Success
                successMessage.style.display = 'block';
                contactForm.reset();
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                // Log success (optional)
                console.log('Form submitted successfully:', formData);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Error
            console.error('Error submitting form:', error);
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    // Validate individual field
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }

        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        }

        if (isValid) {
            field.style.borderColor = '#4caf50';
            field.classList.remove('error');
        } else {
            field.style.borderColor = '#f44336';
            field.classList.add('error');
        }

        return isValid;
    }

    // Character counter untuk textarea (optional)
    const messageField = document.getElementById('message');
    const maxLength = 500;

    messageField.addEventListener('input', function() {
        const remaining = maxLength - this.value.length;
        
        // Create counter if not exists
        let counter = document.getElementById('charCounter');
        if (!counter) {
            counter = document.createElement('small');
            counter.id = 'charCounter';
            counter.style.display = 'block';
            counter.style.marginTop = '5px';
            counter.style.color = '#666';
            this.parentElement.appendChild(counter);
        }

        counter.textContent = `${this.value.length}/${maxLength} karakter`;
        
        if (remaining < 0) {
            counter.style.color = '#f44336';
            this.value = this.value.substring(0, maxLength);
        } else if (remaining < 50) {
            counter.style.color = '#ff9800';
        } else {
            counter.style.color = '#666';
        }
    });

    console.log('%c📬 Contact Form Ready - by KikoEnkTau', 'color: #667eea; font-size: 14px;');
});

// Credit: KikoEnkTau