// Clean optimized script
(function() {
    'use strict';
    
    // Lenis smooth scroll (disabled wheel so we can handle horizontal snap)
    let lenis;
    try {
        lenis = new Lenis({
            duration: 0.5,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            orientation: 'vertical',
            smoothWheel: false,
            wheelMultiplier: 1,
            touchMultiplier: 1.2
        });
    } catch (err) {
        lenis = {
            raf() {},
            get scroll() { return window.pageYOffset || 0; },
            scrollTo(target, opts) {
                const top = typeof target === 'number' ? target : 0;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        };
    }
    
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    // Cache DOM elements
    const els = {
        pixelFrame: document.querySelector('.pixel-frame'),
        cursor: document.querySelector('.cursor'),
        menuToggle: document.getElementById('menuToggle'),
        menuOverlay: document.getElementById('menuOverlay'),
        bioWord: document.getElementById('bioWord'),
        workWord: document.getElementById('workWord'),
        stuffWord: document.getElementById('stuffWord'),
        sinceText: document.querySelector('.since-text'),
        heroTitle: document.querySelector('.hero-image'),
        projectsBg: document.getElementById('projectsBg'),
        projectsWrapper: document.querySelector('.projects-wrapper'),
        heroButton: document.querySelector('.hero-button'),
        footerBg: document.querySelector('.footer-bg'),
        footerWrapper: document.querySelector('.footer-wrapper'),
        leftEye: document.querySelector('.menu-toggle-eye.left'),
        rightEye: document.querySelector('.menu-toggle-eye.right'),
        redesButton: document.getElementById('redesButton'),
        holaButton: document.getElementById('holaButton'),
        lightButton: document.getElementById('lightButton'),
        menuButton: document.getElementById('menuButton'),
        mainContentWrapper: document.getElementById('mainContentWrapper'),
        projectImageFloat: document.getElementById('projectImageFloat'),
        projectImageFloatImg: document.getElementById('projectImageFloatImg'),
        heroLayerVertical: document.getElementById('heroLayerVertical')
    };
    
    // State
    const state = {
        mouseX: 0, mouseY: 0,
        cursorX: 0, cursorY: 0,
        pixelX: 0, pixelY: 0,
        targetPixelX: 0, targetPixelY: 0,
        scrollY: 0,
        currentSection: 0, // 0: initial, 1: design, 2: bio
        menuCenterX: 0, menuCenterY: 0
    };

    // Cache menu center to prevent reflow on mousemove
    function updateMenuCenter() {
        if (els.menuToggle) {
            const rect = els.menuToggle.getBoundingClientRect();
            state.menuCenterX = rect.left + rect.width / 2;
            state.menuCenterY = rect.top + rect.height / 2;
        }
    }
    window.addEventListener('resize', updateMenuCenter, { passive: true });
    // Call once on load after a short delay to ensure layout is done
    setTimeout(updateMenuCenter, 100);

    // Random character glitch effect for hero button
    const glitchChars = '@#$%&*!?+=<>[]{}|/\\;:.,~`';
    const originalText = els.heroButton ? els.heroButton.textContent : '@&%$#';
    let glitchInterval;

    function startGlitchEffect() {
        if (!els.heroButton) return;
        
        glitchInterval = setInterval(() => {
            const text = els.heroButton.textContent;
            let newText = '';
            for (let i = 0; i < text.length; i++) {
                if (Math.random() > 0.7) {
                    newText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                    newText += text[i];
                }
            }
            els.heroButton.textContent = newText;
        }, 100);
    }

    function stopGlitchEffect() {
        if (glitchInterval) {
            clearInterval(glitchInterval);
            if (els.heroButton) {
                els.heroButton.textContent = originalText;
            }
        }
    }

    // Start glitch effect on page load
    startGlitchEffect();

    // Back to home button click handler
    if (els.backToHome) {
        els.backToHome.addEventListener('click', function() {
            lenis.scrollTo(0, {
                duration: 1,
                easing: (t) => 1 - Math.pow(1 - t, 3)
            });
        });
    }
    
    // Simplified RAF loop - runs every 3rd frame (20fps) for heavy animations
    let frameCount = 0;
    function animate() {
        frameCount++;
        

        
        // Smooth pixel frame animation
        if (els.pixelFrame && state.scrollY < window.innerHeight) {
            state.pixelX += (state.targetPixelX - state.pixelX) * 0.1;
            state.pixelY += (state.targetPixelY - state.pixelY) * 0.1;
            els.pixelFrame.style.transform = `translate(${state.pixelX.toFixed(1)}px, ${state.pixelY.toFixed(1)}px)`;
            if (els.heroButton) {
                els.heroButton.style.transform = `translate(calc(-50% + ${state.pixelX.toFixed(1)}px), ${state.pixelY.toFixed(1)}px)`;
            }
        }
        
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    
    // Mouse move handler
    function onMouseMove(e) {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
        
        // Move entire face to follow mouse
        if (els.menuToggle && state.menuCenterX !== 0) {
            const centerX = state.menuCenterX;
            const centerY = state.menuCenterY;
            
            // Calculate angle from menu center to mouse
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const distance = Math.min(5, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 15);
            
            // Move entire face within limited range
            const faceMoveX = Math.cos(angle) * distance;
            const faceMoveY = Math.sin(angle) * distance;
            
            const face = els.menuToggle.querySelector('.menu-toggle-face');
            if (face) {
                face.style.transform = `translate(${faceMoveX}px, ${faceMoveY}px)`;
            }
        }
        
        // Smooth pixel frame animation
        if (els.pixelFrame && state.scrollY < window.innerHeight) {
            state.targetPixelX = -((state.mouseX / window.innerWidth) - 0.5) * 40;
            state.targetPixelY = -((state.mouseY / window.innerHeight) - 0.5) * 40;
        }
    }
    
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    
    // Lightweight scroll handler
    let scrollTicking = false;
    function onScroll() {
        state.scrollY = lenis.scroll || window.pageYOffset;
        if (scrollTicking) return;
        scrollTicking = true;

        requestAnimationFrame(function() {
            // Fade out vertical logo on scroll
            if (els.heroLayerVertical) {
                if (state.scrollY > 50) {
                    els.heroLayerVertical.style.opacity = '0';
                    els.heroLayerVertical.style.pointerEvents = 'none';
                } else {
                    els.heroLayerVertical.style.opacity = '1';
                    els.heroLayerVertical.style.pointerEvents = 'auto';
                }
            }

            // Hide floating project image when scrolling
            if (els.projectImageFloat && els.projectImageFloat.classList.contains('active')) {
                els.projectImageFloat.classList.remove('active');
            }
            
            // Background parallax for projects
            if (els.projectsBg && els.projectsWrapper) {
                const r = els.projectsWrapper.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) {
                    const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
                    els.projectsBg.style.transform = `translate3d(0, ${Math.round(-p * 50)}px, 0)`;
                }
            }
            
            // Footer background parallax - appears from below
            if (els.footerBg && els.footerWrapper) {
                const r = els.footerWrapper.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) {
                    const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
                    els.footerBg.style.transform = `translate3d(0, ${Math.round(-p * 100)}px, 0)`;
                }
            }
            
            scrollTicking = false;
        });
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    
    // Menu toggle functionality
    if (els.menuToggle && els.menuOverlay) {
        els.menuToggle.addEventListener('click', () => {
            const isActive = els.menuOverlay.classList.toggle('active');
            els.sinceText.classList.toggle('active');
            els.menuToggle.classList.toggle('active');
            
            // Toggle theme switch stroke based on menu state and theme
            const themeSwitch = document.getElementById('themeToggle');
            if (themeSwitch) {
                if (isActive) {
                    themeSwitch.style.borderColor = '#ede4dd';
                } else {
                    // Keep stroke in dark mode, hide in light mode
                    if (body.classList.contains('dark-theme')) {
                        themeSwitch.style.borderColor = '#ede4dd';
                    } else {
                        themeSwitch.style.borderColor = 'transparent';
                    }
                }
            }
        });
        
        const menuItems = els.menuOverlay.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                els.menuOverlay.classList.remove('active');
                els.menuToggle.classList.remove('active');
                if (els.sinceText) {
                    els.sinceText.style.display = 'block';
                }
                
                // Reset theme switch stroke when menu closes (respect dark mode)
                const themeSwitch = document.getElementById('themeToggle');
                if (themeSwitch) {
                    if (body.classList.contains('dark-theme')) {
                        themeSwitch.style.borderColor = '#ede4dd';
                    } else {
                        themeSwitch.style.borderColor = 'transparent';
                    }
                }
            });
        });
    }



    // Show/hide expanded images on menu item hover
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const expanded = item.querySelector('.menu-expanded');
        
        item.addEventListener('mouseenter', () => {
            if (expanded) {
                expanded.classList.add('active');
            }
        });
        
        item.addEventListener('mouseleave', () => {
            if (expanded) {
                expanded.classList.remove('active');
            }
        });
    });

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    function toggleTheme() {
        if (body.classList.contains('dark-theme')) {
            setLightTheme();
        } else {
            setDarkTheme();
        }
    }

     function setLightTheme() {
         body.classList.remove('dark-theme');
         localStorage.setItem('theme', 'light');
         
         // Update theme switch stroke based on menu state
         const themeSwitch = document.getElementById('themeToggle');
         const menuOverlay = document.getElementById('menuOverlay');
         if (themeSwitch) {
             if (menuOverlay && menuOverlay.classList.contains('active')) {
                 themeSwitch.style.borderColor = '#ede4dd';
             } else {
                 themeSwitch.style.borderColor = 'transparent';
             }
         }
         
         // Use PABZ_LETTERING_1.svg for light theme
         const hero1 = document.getElementById('heroLayer1');
         if (hero1) hero1.src = 'assets/PABZ_LETTERING_1.svg';
     }
 
     function setDarkTheme() {
         body.classList.add('dark-theme');
         localStorage.setItem('theme', 'dark');
         
         // Always show stroke in dark mode
         const themeSwitch = document.getElementById('themeToggle');
         if (themeSwitch) {
             themeSwitch.style.borderColor = '#ede4dd';
         }
         
         // Use PABZ_LETTERING_3.svg for dark theme
         const hero1 = document.getElementById('heroLayer1');
         if (hero1) hero1.src = 'assets/PABZ_LETTERING_3.svg';
     }

    // Event listener for theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    function isMobile() { return window.innerWidth <= 768; }
    function updateLightButtonText(dark) {
        if (!els.lightButton) return;
        els.lightButton.textContent = dark ? 'Dark' : 'Light';
    }
    if (savedTheme === 'dark') {
        setDarkTheme();
        updateLightButtonText(true);
    } else {
        setLightTheme();
        updateLightButtonText(false);
    }

    // Cursor grow on footer buttons hover
    if (els.cursor) {
        const socialButtons = document.querySelectorAll('.social-btn');
        socialButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                els.cursor.style.width = '48px';
                els.cursor.style.height = '48px';
            });
            btn.addEventListener('mouseleave', () => {
                els.cursor.style.width = '12px';
                els.cursor.style.height = '12px';
            });
        });
    }
    
    // Navigation buttons functionality
    if (els.redesButton) {
        els.redesButton.addEventListener('click', () => {
            state.currentSection = 0;
            if (els.mainContentWrapper) els.mainContentWrapper.classList.remove('scrolled');
            
            lenis.scrollTo(0, {
                duration: 0.8,
                easing: (t) => 1 - Math.pow(1 - t, 3)
            });
        });
    }
    
    if (els.lightButton) {
        els.lightButton.addEventListener('click', () => {
            toggleTheme();
            updateLightButtonText(body.classList.contains('dark-theme'));
        });
        window.addEventListener('resize', () => updateLightButtonText(body.classList.contains('dark-theme')));
    }
    
    // menuButton is now handled by the popup menu inline script

    

    // Horizontal scroll toggle function
    let isScrollSnapping = false;
    const SNAP_COOLDOWN = 1200; // ms between snaps

    function toggleHorizontalScroll(direction) {
        if (els.projectImageFloat) {
            els.projectImageFloat.classList.remove('active');
        }
        
        // If no direction specified, default to right
        if (direction === undefined) {
            direction = 'right';
        }
        
        if (direction === 'right') {
            // Move forward through sections
            if (state.currentSection === 0) {
                // From initial to bio
                state.currentSection = 1;
                if (els.mainContentWrapper) {
                    els.mainContentWrapper.classList.add('scrolled');
                }
            }
        } else if (direction === 'left') {
            // Move backward through sections
            if (state.currentSection === 1) {
                // From bio to initial
                state.currentSection = 0;
                if (els.mainContentWrapper) {
                    els.mainContentWrapper.classList.remove('scrolled');
                }
            }
        }
    }

    // ── Scroll-triggered horizontal snap ──────────────────────────────────
    // Accumulated delta for trackpad inertia filtering
    let wheelAccum = 0;
    const WHEEL_THRESHOLD = 150; // px needed to trigger a snap

    function onWheel(e) {
        // If already mid-snap, swallow the event
        if (isScrollSnapping) {
            e.preventDefault();
            return;
        }

        const delta = e.deltaY || e.deltaX;
        wheelAccum += delta;

        if (Math.abs(wheelAccum) >= WHEEL_THRESHOLD) {
            const dir = wheelAccum > 0 ? 'right' : 'left';
            wheelAccum = 0;

            // Only snap if there is a section to go to
            const canRight = dir === 'right' && state.currentSection < 2;
            const canLeft  = dir === 'left'  && state.currentSection > 0;

            if (canRight || canLeft) {
                e.preventDefault();
                isScrollSnapping = true;
                toggleHorizontalScroll(dir);
                setTimeout(() => {
                    isScrollSnapping = false;
                    wheelAccum = 0;
                }, SNAP_COOLDOWN);
            } else {
                // Edge section reached – reset accumulator so normal scroll resumes
                wheelAccum = 0;
            }
        } else {
            // Prevent default while accumulating so page doesn't jitter
            e.preventDefault();
        }
    }

    // Passive: false so we can call preventDefault
    window.addEventListener('wheel', onWheel, { passive: false });

    // ── Touch swipe support ────────────────────────────────────────────────
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 50; // px

    window.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function(e) {
        if (isScrollSnapping) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Only trigger if horizontal swipe dominates
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
            const dir = dx < 0 ? 'right' : 'left';
            const canRight = dir === 'right' && state.currentSection < 2;
            const canLeft  = dir === 'left'  && state.currentSection > 0;
            if (canRight || canLeft) {
                isScrollSnapping = true;
                toggleHorizontalScroll(dir);
                setTimeout(() => { isScrollSnapping = false; }, SNAP_COOLDOWN);
            }
        }
    }, { passive: true });
    

    
    // P*rnafolio word - scroll to projects section
    if (els.portfolioWord && els.projectsWrapper) {
        els.portfolioWord.addEventListener('click', function(e) {
            e.preventDefault();
            const projectsTop = els.projectsWrapper.offsetTop;
            lenis.scrollTo(projectsTop, { 
                duration: 0.8,
                easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
            });
        });
    }
    
    // Page load
    document.body.style.opacity = '0';
    window.addEventListener('load', () => document.body.style.opacity = '1');
    
    // Project page transition - "entering the project window" effect
    const transitionOverlay = document.getElementById('pageTransition');
    const transitionImage = document.getElementById('transitionImage');
    const projectLinks = document.querySelectorAll('.project-link');
    
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            
            e.preventDefault();
            
            // Get the clicked project image
            const projectImage = this.querySelector('.project-image img');
            const rect = projectImage ? projectImage.getBoundingClientRect() : this.getBoundingClientRect();
            
            // Set initial position (match the project image position)
            transitionImage.style.top = rect.top + 'px';
            transitionImage.style.left = rect.left + 'px';
            transitionImage.style.width = rect.width + 'px';
            transitionImage.style.height = rect.height + 'px';
            transitionImage.style.borderRadius = '8px';
            
            // Set the image
            if (projectImage) {
                transitionImage.style.backgroundImage = `url(${projectImage.src})`;
            }
            
            // Show overlay
            transitionOverlay.classList.add('active');
            
            // Trigger expansion animation
            requestAnimationFrame(() => {
                transitionImage.classList.add('expanded');
                
                // Fade to black then navigate
                setTimeout(() => {
                    transitionImage.style.opacity = '0';
                    transitionImage.style.transition = 'opacity 0.2s ease';
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 200);
                }, 400);
            });
        });
    });
    
    // PABZ lettering: perspectiva 3D + desface de profundidad entre capas + deformación
    const heroLayer1 = document.getElementById('heroLayer1');
    const heroLayer2 = document.getElementById('heroLayer2');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const bioPhotoImg = document.getElementById('bioPhotoImg');
    if (heroLayer1 && heroLayer2) {
        // Perspectiva compartida (rotateX / rotateY)
        let targetRotX = 0, targetRotY = 0;
        let curRotX = 0, curRotY = 0;
        // Desface de posición entre capas (translate)
        let target1X = 0, target1Y = 0;
        let target2X = 0, target2Y = 0;
        let cur1X = 0, cur1Y = 0;
        let cur2X = 0, cur2Y = 0;
        // Skew (deformación)
        let targetSkewX = 0, targetSkewY = 0;
        let curSkew1X = 0, curSkew1Y = 0;
        let curSkew2X = 0, curSkew2Y = 0;
        // Escala
        let targetScale = 1;
        let curScale1 = 1;
        let curScale2 = 1;
        // Variables removidas para imagePlaceholder y bioPhoto
        let isAnimating = false;

        function updateLayerTilt() {
            // Perspectiva — lerp suave
            curRotX += (targetRotX - curRotX) * 0.15;
            curRotY += (targetRotY - curRotY) * 0.15;

            // Desface translate — capa 1 más lenta (fondo), capa 2 más rápida (frente)
            cur1X += (target1X - cur1X) * 0.08;
            cur1Y += (target1Y - cur1Y) * 0.08;
            cur2X += (target2X - cur2X) * 0.14;
            cur2Y += (target2Y - cur2Y) * 0.14;

            // Deformación (skew) - capa 1 más sutil
            curSkew1X += (targetSkewX * 0.5 - curSkew1X) * 0.1;
            curSkew1Y += (targetSkewY * 0.5 - curSkew1Y) * 0.1;
            curSkew2X += (targetSkewX - curSkew2X) * 0.15;
            curSkew2Y += (targetSkewY - curSkew2Y) * 0.15;

            // Escala
            curScale1 += (targetScale - curScale1) * 0.1;
            curScale2 += (targetScale - curScale2) * 0.15;

            // Animaciones de bioPhoto e imagePlaceholder removidas

            // Combinar perspectiva + desface + skew + escala en cada capa
            const mobileExtra = isMobile() ? ' scale(2) rotate(-90deg)' : '';
            heroLayer1.style.transform = `perspective(1000px) rotateX(${curRotX.toFixed(2)}deg) rotateY(${curRotY.toFixed(2)}deg) translate(${cur1X.toFixed(2)}px, ${cur1Y.toFixed(2)}px) skew(${curSkew1X.toFixed(2)}deg, ${curSkew1Y.toFixed(2)}deg) scale(${curScale1.toFixed(3)})${mobileExtra}`;
            heroLayer2.style.transform = `perspective(1000px) rotateX(${curRotX.toFixed(2)}deg) rotateY(${curRotY.toFixed(2)}deg) translate(${cur2X.toFixed(2)}px, ${cur2Y.toFixed(2)}px) skew(${curSkew2X.toFixed(2)}deg, ${curSkew2Y.toFixed(2)}deg) scale(${curScale2.toFixed(3)})${mobileExtra}`;

            // Animaciones transform removidas

            const delta = Math.abs(targetRotX - curRotX) + Math.abs(targetRotY - curRotY)
                        + Math.abs(target1X - cur1X) + Math.abs(target1Y - cur1Y)
                        + Math.abs(target2X - cur2X) + Math.abs(target2Y - cur2Y)
                        + Math.abs(targetSkewX - curSkew2X) + Math.abs(targetSkewY - curSkew2Y)
                        + Math.abs(targetScale - curScale2);
            if (delta > 0.01) {
                requestAnimationFrame(updateLayerTilt);
            } else {
                isAnimating = false;
            }
        }

        // Auto-animación universal (mobile + desktop idle)
        let autoAnimId = null;
        let mouseIdleTimer = null;
        let autoTimeOffset = 0;
        let autoStartTime = 0;
        const IDLE_TIMEOUT = 3000;

        function updateAutoTargets() {
            const elapsed = Date.now() / 1000 - autoStartTime;
            const t = autoTimeOffset + elapsed;
            const ramp = Math.min(1, elapsed / 3);
            const amp = ramp * ramp * ramp * 0.9; // cúbica — arranque muy suave
            const x = Math.sin(t * 0.6) * amp;
            const y = Math.sin(t * 0.4 + 1.2) * amp;

            targetRotX = y * -32;
            targetRotY = x * 32;
            target1X = x * 15;
            target1Y = y * 10;
            target2X = x * 100;
            target2Y = y * 65;
            const xx = x * Math.abs(x);
            const yy = y * Math.abs(y);
            targetSkewX = xx * -30;
            targetSkewY = yy * 30;
            const distance = Math.sqrt(x * x + y * y);
            targetScale = 1 + (distance * 0.4);

            if (!isAnimating) {
                isAnimating = true;
                requestAnimationFrame(updateLayerTilt);
            }

            autoAnimId = requestAnimationFrame(updateAutoTargets);
        }

        function startAutoAnimation() {
            if (autoAnimId) return;
            // Calcular seed para que la auto-animación continúe desde donde el mouse dejó
            const clamped = Math.min(0.89, Math.max(-0.89, curRotY / 32));
            let seedT = 0;
            if (Math.abs(clamped) < 0.89) {
                seedT = Math.asin(clamped / 0.9) / 0.6;
            }
            autoTimeOffset = Math.max(0, seedT);
            autoStartTime = Date.now() / 1000;
            autoAnimId = requestAnimationFrame(updateAutoTargets);
        }

        function stopAutoAnimation() {
            if (autoAnimId) {
                cancelAnimationFrame(autoAnimId);
                autoAnimId = null;
            }
        }

        document.addEventListener('mousemove', (e) => {
            if (isMobile()) return;

            // Cuando el mouse se mueve, detener auto-animación y usar parallax en vivo
            stopAutoAnimation();
            clearTimeout(mouseIdleTimer);
            mouseIdleTimer = setTimeout(() => {
                startAutoAnimation();
            }, IDLE_TIMEOUT);

            const x = (e.clientX / window.innerWidth  - 0.5) * 2; // -1 a 1
            const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 a 1

            // Perspectiva 3D — más pronunciada
            targetRotX = y * -28;
            targetRotY = x * 28;

            // Desface de profundidad — mucho más fuerte para que capa 2 parezca mucho más adelante
            target1X = x * 10;
            target1Y = y * 6;
            target2X = x * 90;
            target2Y = y * 55;
            
            // Cálculos independientes removidos

            // Deformación cuadrática (signo preservado) — skew uniforme en todas direcciones
            const xx = x * Math.abs(x);
            const yy = y * Math.abs(y);
            targetSkewX = xx * -25;
            targetSkewY = yy * 25;

            // Escala — crece basado en la distancia al centro
            const distance = Math.sqrt(x * x + y * y); // Máximo ~1.41 en las esquinas
            targetScale = 1 + (distance * 0.3); // Crecerá hasta 1.4x de su tamaño original en los bordes

            if (!isAnimating) {
                isAnimating = true;
                requestAnimationFrame(updateLayerTilt);
            }
        }, { passive: true });

        // Arrancar auto-animación en ambos (mobile no tiene mousemove, desktop la pausa al mover)
        startAutoAnimation();
    }

    
    // Project image floating effect
    const projectNames = document.querySelectorAll('.project-name');
    if (els.projectImageFloat && els.projectImageFloatImg) {
        projectNames.forEach(projectName => {
            projectName.addEventListener('mouseenter', function() {
                const imageUrl = this.dataset.image;
                if (imageUrl) {
                    els.projectImageFloatImg.src = imageUrl;
                    els.projectImageFloat.classList.add('active');
                }
            });
            
            projectName.addEventListener('mouseleave', function() {
                els.projectImageFloat.classList.remove('active');
            });
        });
        
        // Make the floating image follow the cursor
        document.addEventListener('mousemove', function(e) {
            if (els.projectImageFloat.classList.contains('active')) {
                els.projectImageFloat.style.left = e.clientX + 'px';
                els.projectImageFloat.style.top = e.clientY + 'px';
            }
        });
    }
    
    // Multi-timezone clock with toggle
    const timezones = [
        { zone: 'America/Lima',    label: 'Peru, Lima' },
        { zone: 'Europe/Madrid',   label: 'Madrid, España' }
    ];
    let currentTzIndex = 0;

    function updateClock() {
        const timeElement = document.getElementById('limaTime');
        const tzLabelEl   = document.getElementById('tzLabel');
        if (!timeElement) return;

        const tz = timezones[currentTzIndex];
        const now = new Date();
        const options = {
            timeZone: tz.zone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        timeElement.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
        if (tzLabelEl) tzLabelEl.textContent = tz.label;
    }

    const tzContainer = document.getElementById('limaTimeContainer');
    if (tzContainer) {
        tzContainer.addEventListener('click', () => {
            currentTzIndex = (currentTzIndex + 1) % timezones.length;
            updateClock();
        });
    }

    updateClock();
    setInterval(updateClock, 1000);

    // Throwable physics for bio photo
    const bioPhoto = document.querySelector('.bio-photo');
    if (bioPhoto) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let currentX = window.innerWidth * 0.7; // Start at 70% width
        let currentY = window.innerHeight * 0.2; // Start at 20% height
        let vx = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6);
        let vy = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6);
        let rotation = 0;
        let vr = (Math.random() - 0.5) * 2; // Initial rotation speed
        let lastX = currentX, lastY = currentY;
        let animationFrameId = null;
        const friction = 0.985;        // Natural slow deceleration
        const bounce = 0.65;           // Realistic bounce: loses some speed
        const rotationFriction = 0.985;
        const photoSize = 300;         // Fixed width/height of the bio-photo container

        // Set initial position & rotation
        bioPhoto.style.left = currentX + 'px';
        bioPhoto.style.top = currentY + 'px';
        bioPhoto.style.transform = `rotate(${rotation}deg)`;

        // Start floating immediately
        animationFrameId = requestAnimationFrame(updatePhysics);

        function updatePhysics() {
            if (!isDragging) {
                // Apply velocity
                currentX += vx;
                currentY += vy;
                rotation += vr;

                // Friction
                vx *= friction;
                vy *= friction;
                vr *= rotationFriction;

                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;

                // Calculate the bounding box of the rotated square
                const theta = (rotation * Math.PI) / 180;
                const cos = Math.abs(Math.cos(theta));
                const sin = Math.abs(Math.sin(theta));
                const hs = photoSize / 2; // 150
                const hw = hs * (cos + sin);
                const hh = hs * (sin + cos);

                // Center coordinates
                let cx = currentX + hs;
                let cy = currentY + hs;

                // Collisions with walls based on the rotated bounding box
                if (cx - hw < 0) {
                    cx = hw;
                    currentX = cx - hs;
                    vx = -vx * bounce;
                    vr += vy * 0.05; // Collision converts linear speed to spin
                } else if (cx + hw > containerWidth) {
                    cx = containerWidth - hw;
                    currentX = cx - hs;
                    vx = -vx * bounce;
                    vr -= vy * 0.05;
                }

                if (cy - hh < 0) {
                    cy = hh;
                    currentY = cy - hs;
                    vy = -vy * bounce;
                    vr -= vx * 0.05; // Collision converts linear speed to spin
                } else if (cy + hh > containerHeight) {
                    cy = containerHeight - hh;
                    currentY = cy - hs;
                    vy = -vy * bounce;
                    vr += vx * 0.05;
                }

                bioPhoto.style.left = currentX + 'px';
                bioPhoto.style.top = currentY + 'px';
                bioPhoto.style.transform = `rotate(${rotation}deg)`;

                // Stop loop if moving very slowly
                if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05 || Math.abs(vr) > 0.05) {
                    animationFrameId = requestAnimationFrame(updatePhysics);
                } else {
                    animationFrameId = null;
                }
            }
        }

        function onDragStart(e) {
            isDragging = true;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            startX = clientX - currentX;
            startY = clientY - currentY;
            lastX = currentX;
            lastY = currentY;
            vx = 0;
            vy = 0;

            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragEnd);
            document.addEventListener('touchmove', onDragMove, { passive: false });
            document.addEventListener('touchend', onDragEnd);
        }

        function onDragMove(e) {
            if (!isDragging) return;
            if (e.cancelable) e.preventDefault();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            currentX = clientX - startX;
            currentY = clientY - startY;

            // Calculate velocity
            vx = currentX - lastX;
            vy = currentY - lastY;

            // Update rotation based on drag movement
            vr = (vx * 0.1) - (vy * 0.05);
            rotation += vr;

            lastX = currentX;
            lastY = currentY;

            bioPhoto.style.left = currentX + 'px';
            bioPhoto.style.top = currentY + 'px';
            bioPhoto.style.transform = `rotate(${rotation}deg)`;
        }

        function onDragEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('mouseup', onDragEnd);
            document.removeEventListener('touchmove', onDragMove);
            document.removeEventListener('touchend', onDragEnd);

            // Limit maximum throw velocity
            const maxSpeed = 45;
            const speed = Math.hypot(vx, vy);
            if (speed > maxSpeed) {
                vx = (vx / speed) * maxSpeed;
                vy = (vy / speed) * maxSpeed;
            }

            // Spin on throw based on velocity
            vr = (vx * 0.25) - (vy * 0.15);
            const maxSpin = 20;
            if (Math.abs(vr) > maxSpin) {
                vr = Math.sign(vr) * maxSpin;
            }

            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updatePhysics);
            }
        }

        bioPhoto.addEventListener('mousedown', onDragStart);
        bioPhoto.addEventListener('touchstart', onDragStart, { passive: true });

        // Handle window resize to keep it in bounds
        window.addEventListener('resize', () => {
            const theta = (rotation * Math.PI) / 180;
            const cos = Math.abs(Math.cos(theta));
            const sin = Math.abs(Math.sin(theta));
            const hs = photoSize / 2;
            const hw = hs * (cos + sin);
            const hh = hs * (sin + cos);

            let cx = currentX + hs;
            let cy = currentY + hs;

            if (cx - hw < 0) {
                cx = hw;
            } else if (cx + hw > window.innerWidth) {
                cx = window.innerWidth - hw;
            }
            if (cy - hh < 0) {
                cy = hh;
            } else if (cy + hh > window.innerHeight) {
                cy = window.innerHeight - hh;
            }

            currentX = cx - hs;
            currentY = cy - hs;
            bioPhoto.style.left = currentX + 'px';
            bioPhoto.style.top = currentY + 'px';
        });
    }

})();
