document.addEventListener('DOMContentLoaded', () => {
    // 1. Header scroll effect
    const header = document.querySelector('header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            mobileMenuBtn.classList.toggle('open');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileMenuBtn.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // 3. Slider/Slideshow Functionality (Infinite Loop & Center Centered)
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const originalSlides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (sliderWrapper && originalSlides.length > 0) {
        const totalSlides = originalSlides.length;
        const numClones = 3; // Number of clones on each side to ensure left/right are filled
        let currentOriginalIndex = 0;
        let autoPlayTimer = null;
        let isTransitioning = false;

        // Clone slides programmatically
        // Prepend copies of the last few slides to the beginning
        for (let i = totalSlides - numClones; i < totalSlides; i++) {
            const clone = originalSlides[i].cloneNode(true);
            clone.classList.add('clone');
            sliderWrapper.insertBefore(clone, sliderWrapper.firstChild);
        }

        // Append copies of the first few slides to the end
        for (let i = 0; i < numClones; i++) {
            const clone = originalSlides[i].cloneNode(true);
            clone.classList.add('clone');
            sliderWrapper.appendChild(clone);
        }

        // Get updated list of all slides (including clones)
        const allSlides = sliderWrapper.querySelectorAll('.slide');

        // Generate dots indicators (only for original slides)
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(i);
                resetAutoPlay();
            });
            dotsContainer.appendChild(dot);
        }
        const dots = dotsContainer.querySelectorAll('.dot');

        const updateDots = (index) => {
            dots.forEach((dot, idx) => {
                if (idx === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };

        const updateSliderPosition = (smooth = true) => {
            const containerWidth = sliderWrapper.parentElement.clientWidth;
            const activeIndexInAll = currentOriginalIndex + numClones;
            const activeSlide = allSlides[activeIndexInAll];
            if (!activeSlide) return;
            const slideWidthPx = activeSlide.offsetWidth;

            if (smooth) {
                sliderWrapper.style.transition = 'transform 2s cubic-bezier(0.25, 1, 0.5, 1)';
            } else {
                sliderWrapper.style.transition = 'none';
            }

            // Calculate translation based on actual widths of elements
            let offsetLeft = 0;
            for (let i = 0; i < activeIndexInAll; i++) {
                offsetLeft += allSlides[i].offsetWidth;
            }
            const translation = (containerWidth - slideWidthPx) / 2 - offsetLeft;
            sliderWrapper.style.transform = `translateX(${translation}px)`;

            // Update classes for scale and opacity transition
            allSlides.forEach((slide, idx) => {
                if (idx === activeIndexInAll) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Map index back to original bounds for dots
            let displayIndex = currentOriginalIndex;
            if (currentOriginalIndex >= totalSlides) displayIndex = 0;
            if (currentOriginalIndex < 0) displayIndex = totalSlides - 1;
            updateDots(displayIndex);
        };

        const goToSlide = (originalIndex, smooth = true) => {
            if (isTransitioning) return;
            if (smooth) {
                isTransitioning = true;
            }
            currentOriginalIndex = originalIndex;
            updateSliderPosition(smooth);
        };

        const nextSlide = () => {
            if (isTransitioning) return;
            goToSlide(currentOriginalIndex + 1, true);
        };

        const prevSlide = () => {
            if (isTransitioning) return;
            goToSlide(currentOriginalIndex - 1, true);
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoPlay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoPlay();
            });
        }

        // Seamless loop jump handler
        sliderWrapper.addEventListener('transitionend', () => {
            isTransitioning = false;

            if (currentOriginalIndex >= totalSlides) {
                // Jump from last clone back to first original slide instantly
                currentOriginalIndex = 0;
                updateSliderPosition(false);
            } else if (currentOriginalIndex < 0) {
                // Jump from first clone back to last original slide instantly
                currentOriginalIndex = totalSlides - 1;
                updateSliderPosition(false);
            }
        });

        // Touch Swipe support for mobile devices
        let touchStartX = 0;
        let touchEndX = 0;

        sliderWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        }, { passive: true });

        sliderWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoPlay();
        }, { passive: true });

        const handleSwipe = () => {
            const swipeThreshold = 50; // Minimum drag distance in pixels
            if (touchStartX - touchEndX > swipeThreshold) {
                nextSlide();
            } else if (touchEndX - touchStartX > swipeThreshold) {
                prevSlide();
            }
        };

        // Handle window resizing (re-adjust alignment instantly)
        window.addEventListener('resize', () => {
            updateSliderPosition(false);
        });

        // Autoplay functions
        const startAutoPlay = () => {
            if (!autoPlayTimer) {
                autoPlayTimer = setInterval(nextSlide, 5000);
            }
        };

        const stopAutoPlay = () => {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
            }
        };

        const resetAutoPlay = () => {
            stopAutoPlay();
            startAutoPlay();
        };

        // Initialize position on load
        updateSliderPosition(false);

        // Start auto play
        startAutoPlay();

        // Pause autoplay when mouse is over slider
        const heroSection = document.querySelector('.hero-slider-section');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', stopAutoPlay);
            heroSection.addEventListener('mouseleave', startAutoPlay);
        }
    }

    // 4. Scroll Animations (Fade-in elements)
    const animElements = document.querySelectorAll('.fade-in-up');
    
    if ('IntersectionObserver' in window && animElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    observer.unobserve(entry.target); // Animates only once
                }
            });
        }, observerOptions);

        animElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for browsers that do not support IntersectionObserver
        animElements.forEach(el => el.classList.add('appear'));
    }
});
