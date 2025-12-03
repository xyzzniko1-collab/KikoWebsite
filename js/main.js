// =============================================
// Main JavaScript
// Created by: KikoEnkTau
// =============================================

// Configuration
const config = {
    profileImage: 'https://via.placeholder.com/150',
    siteName: 'My Website',
    apiEndpoint: 'https://formspree.io/f/mldqnzvp' // Ganti dengan ID Formspree Anda
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🚀 Website by KikoEnkTau', 'color: #667eea; font-size: 16px; font-weight: bold;');
    
    // Set profile image jika ada
    const profileImg = document.getElementById('profileImg');
    if (profileImg && config.profileImage) {
        profileImg.src = config.profileImage;
    }

    // Smooth scroll untuk semua anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
        
        lastScroll = currentScroll;
    });

    // Animate on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
});

// Utility function untuk loading state
function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = '⏳ Loading...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Submit';
    }
}

// Export config untuk digunakan di file lain
window.siteConfig = config;

// Credit: KikoEnkTau - https://github.com/KikoEnkTau