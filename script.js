document.addEventListener('DOMContentLoaded', () => {
    // Add js-loaded class to body to enable scroll-reveal animations
    document.body.classList.add('js-loaded');
    
    /* ==========================================================================
       HEADER SCROLL STATE
       ========================================================================== */
    const header = document.getElementById('header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on load in case page is already scrolled

    /* ==========================================================================
       MOBILE NAVIGATION TOGGLE
       ========================================================================== */
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Toggle hamburger icon animation/state
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars-staggered';
            }
        });
        
        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.className = 'fa-solid fa-bars-staggered';
            });
        });
        
        // Close menu when clicking outside of the nav menu and toggle button
        document.addEventListener('click', (event) => {
            if (!navMenu.contains(event.target) && !navToggle.contains(event.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.className = 'fa-solid fa-bars-staggered';
            }
        });
    }

    /* ==========================================================================
       AUTO-TYPING TEXT EFFECT
       ========================================================================== */
    const typedTextSpan = document.getElementById('typed-text');
    const textArray = [
        "Full Stack Developer",
        "AI Builder",
        "Open Source Contributor",
        "Java Backend Developer"
    ];
    const typingSpeed = 80;
    const erasingSpeed = 40;
    const newTextDelay = 2000; // Delay between current and next text
    let textArrayIndex = 0;
    let charIndex = 0;
    
    function type() {
        if (charIndex < textArray[textArrayIndex].length) {
            typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, typingSpeed);
        } else {
            setTimeout(erase, newTextDelay);
        }
    }
    
    function erase() {
        if (charIndex > 0) {
            typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, erasingSpeed);
        } else {
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, typingSpeed + 500);
        }
    }
    
    // Start typing animation on load
    if (typedTextSpan) {
        setTimeout(type, 1000);
    }

    /* ==========================================================================
       SCROLL REVEAL & NAVIGATION LINKS SCROLL TRACKING
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    const skillsSection = document.getElementById('skills');
    
    // Setup Intersection Observer for scroll animations
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                
                // Specific skill section activation to trigger progress fills
                if (entry.target.id === 'skills' || entry.target.contains(skillsSection)) {
                    skillsSection.classList.add('active-section');
                }
                
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    scrollRevealElements.forEach(el => revealObserver.observe(el));
    if (skillsSection) revealObserver.observe(skillsSection);

    // Safety fallback: if after 1.2 seconds elements are still hidden, reveal them automatically
    setTimeout(() => {
        scrollRevealElements.forEach(el => {
            if (!el.classList.contains('reveal-active')) {
                el.classList.add('reveal-active');
            }
        });
        if (skillsSection && !skillsSection.classList.contains('active-section')) {
            skillsSection.classList.add('active-section');
        }
    }, 1200);

    // Setup Active Nav Link tracking
    const navObserverCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    
    const navObserver = new IntersectionObserver(navObserverCallback, {
        root: null,
        threshold: 0.5, // 50% of the section must be visible
        rootMargin: '-80px 0px -20% 0px' // adjust for header height
    });
    
    sections.forEach(section => navObserver.observe(section));

    /* ==========================================================================
       CONTACT FORM SUBMISSION WITH PREMIUM SUCCESS MODAL
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    
    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent full page reload
            
            // Check form validation
            if (!contactForm.checkValidity()) {
                return;
            }
            
            // Get inputs
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value;
            
            // Animate button loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-circle-notch fa-spin btn-icon"></i>';
            
            // Simulate API request (1.5 seconds delay)
            setTimeout(() => {
                // Show custom modal alert
                showSuccessModal(name);
                
                // Reset button and form
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Message Sent! <i class="fa-solid fa-check btn-icon"></i>';
                
                contactForm.reset();
                
                // Revert button text back after 3 seconds
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                }, 3000);
                
            }, 1500);
        });
    }
    
    function showSuccessModal(name) {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100vw';
        modalOverlay.style.height = '100vh';
        modalOverlay.style.backgroundColor = 'rgba(8, 11, 17, 0.85)';
        modalOverlay.style.backdropFilter = 'blur(16px)';
        modalOverlay.style.zIndex = '999';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.opacity = '0';
        modalOverlay.style.transition = 'opacity 0.4s ease';
        
        // Modal Container (Glassmorphic card)
        const modalContainer = document.createElement('div');
        modalContainer.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)';
        modalContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        modalContainer.style.padding = '3rem 2.5rem';
        modalContainer.style.borderRadius = '24px';
        modalContainer.style.maxWidth = '450px';
        modalContainer.style.width = '90%';
        modalContainer.style.textAlign = 'center';
        modalContainer.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
        modalContainer.style.transform = 'translateY(30px)';
        modalContainer.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Success Icon
        const successIcon = document.createElement('div');
        successIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        successIcon.style.fontSize = '4.5rem';
        successIcon.style.background = 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)';
        successIcon.style.webkitBackgroundClip = 'text';
        successIcon.style.webkitTextFillColor = 'transparent';
        successIcon.style.marginBottom = '1.5rem';
        
        // Modal Content
        const modalTitle = document.createElement('h3');
        modalTitle.innerText = 'Thank You!';
        modalTitle.style.fontSize = '1.75rem';
        modalTitle.style.fontWeight = '700';
        modalTitle.style.color = '#FFF';
        modalTitle.style.marginBottom = '0.75rem';
        modalTitle.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        
        const modalBody = document.createElement('p');
        modalBody.innerText = `Hi ${name}, your message has been sent successfully. I will get back to you shortly!`;
        modalBody.style.color = '#9CA3AF';
        modalBody.style.fontSize = '0.95rem';
        modalBody.style.lineHeight = '1.6';
        modalBody.style.marginBottom = '2rem';
        modalBody.style.fontFamily = "'Inter', sans-serif";
        
        // Modal Button
        const modalBtn = document.createElement('button');
        modalBtn.innerText = 'Close';
        modalBtn.style.background = 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)';
        modalBtn.style.color = '#FFF';
        modalBtn.style.padding = '0.75rem 2.5rem';
        modalBtn.style.borderRadius = '12px';
        modalBtn.style.fontWeight = '600';
        modalBtn.style.cursor = 'pointer';
        modalBtn.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.2)';
        modalBtn.style.transition = 'all 0.3s ease';
        
        modalBtn.addEventListener('mouseenter', () => {
            modalBtn.style.transform = 'translateY(-2px)';
            modalBtn.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.4)';
        });
        modalBtn.addEventListener('mouseleave', () => {
            modalBtn.style.transform = 'translateY(0)';
            modalBtn.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.2)';
        });
        
        // Append all
        modalContainer.appendChild(successIcon);
        modalContainer.appendChild(modalTitle);
        modalContainer.appendChild(modalBody);
        modalContainer.appendChild(modalBtn);
        modalOverlay.appendChild(modalContainer);
        document.body.appendChild(modalOverlay);
        
        // Trigger animations
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            modalContainer.style.transform = 'translateY(0)';
        }, 10);
        
        // Close event
        const closeModal = () => {
            modalOverlay.style.opacity = '0';
            modalContainer.style.transform = 'translateY(30px)';
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 400);
        };
        
        modalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }
});
