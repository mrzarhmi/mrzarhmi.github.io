/**
 * Mirza Rahimi Portal & Gateway — Landing Page Interactive Engine
 * Pure Vanilla JavaScript (ES6+)
 */

document.addEventListener("DOMContentLoaded", () => {
    initThemeManager();
    initParticleCanvas();
    initCard3DTilt();
    initAudioSynthesizer();
    initKeyboardShortcuts();
    initDynamicYear();
    initMinecraftServerStatus();
});

/* ==========================================================================
   1. Theme Management (Shared with Portfolio via localStorage: 'mr_theme')
   ========================================================================== */
function initThemeManager() {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const htmlRoot = document.documentElement;

    function applyTheme(theme) {
        htmlRoot.setAttribute("data-theme", theme);
        const isDark = theme === "dark";
        if (themeIcon) {
            themeIcon.textContent = isDark ? "☀️" : "🌙";
            themeIcon.setAttribute("title", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
        }
        localStorage.setItem("mr_theme", theme);
    }

    // Retrieve saved theme or default to dark
    const initialTheme = localStorage.getItem("mr_theme") || "dark";
    applyTheme(initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = htmlRoot.getAttribute("data-theme") || "dark";
            const nextTheme = currentTheme === "dark" ? "light" : "dark";
            applyTheme(nextTheme);

            if (window.soundFX && window.soundFX.enabled) {
                window.soundFX.playTone(520, "sine", 0.08);
            }
        });
    }
}

/* ==========================================================================
   2. Interactive Ambient Particle Canvas
   ========================================================================== */
function initParticleCanvas() {
    const canvas = document.getElementById("ambient-canvas");
    const motionToggleBtn = document.getElementById("motion-toggle");
    const motionIcon = document.getElementById("motion-icon");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let animationFrameId = null;
    let isRunning = true;

    // Check system preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        isRunning = false;
        canvas.classList.add("paused");
        if (motionIcon) motionIcon.textContent = "💤";
    }

    // Mouse tracker
    const mouse = {
        x: null,
        y: null,
        radius: 140,
    };

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle constructor
    const particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 16000), 75);

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = (Math.random() - 0.5) * 0.45;
            this.density = Math.random() * 20 + 10;
            // Theme colors: cyan, rose, emerald, indigo
            const colors = [
                "rgba(56, 189, 248, ",   // Cyan
                "rgba(244, 63, 94, ",    // Rose
                "rgba(52, 211, 153, ",   // Emerald
                "rgba(129, 140, 248, ",  // Indigo
            ];
            this.baseColor = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.5 + 0.2;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.baseColor + this.alpha + ")";
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.baseColor + "0.6)";
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        update() {
            // Movement
            this.x += this.vx;
            this.y += this.vy;

            // Bounce on boundaries
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = forceDirectionX * force * this.density * 0.3;
                    const directionY = forceDirectionY * force * this.density * 0.3;

                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }
    }

    function init() {
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        const maxDist = 120;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.hypot(dx, dy);

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.18;
                    ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        if (!isRunning) return;
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        connectParticles();

        animationFrameId = requestAnimationFrame(animate);
    }

    init();
    if (isRunning) {
        animate();
    }

    // Window resize handler with debounce
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        }, 150);
    });

    // Pause animation when page is hidden to preserve battery/CPU
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else if (isRunning) {
            animate();
        }
    });

    // Motion toggle control
    if (motionToggleBtn) {
        motionToggleBtn.addEventListener("click", () => {
            isRunning = !isRunning;
            canvas.classList.toggle("paused", !isRunning);
            if (motionIcon) {
                motionIcon.textContent = isRunning ? "✨" : "💤";
                motionToggleBtn.setAttribute(
                    "title",
                    isRunning ? "Pause Particle Motion" : "Resume Particle Motion"
                );
            }
            if (isRunning) {
                animate();
            } else {
                cancelAnimationFrame(animationFrameId);
                ctx.clearRect(0, 0, width, height);
            }

            if (window.soundFX && window.soundFX.enabled) {
                window.soundFX.playTone(isRunning ? 600 : 380, "sine", 0.08);
            }
        });
    }
}

/* ==========================================================================
   3. 3D Card Perspective Tilt & Specular Shine
   ========================================================================== */
function initCard3DTilt() {
    const cards = document.querySelectorAll(".portal-card");
    if (!cards.length) return;

    // Check if device supports fine hover (desktop)
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Tilt calculations (max 7 degrees)
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;

            // Update CSS variables for specular light glare
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            card.style.setProperty("--mouse-x", "50%");
            card.style.setProperty("--mouse-y", "50%");
        });

        // Click card anywhere navigates to its primary action
        card.addEventListener("click", (e) => {
            // Ignore if clicking directly on link/button to prevent double trigger
            if (e.target.closest("a")) return;
            const link = card.querySelector(".portal-btn");
            if (link) {
                link.click();
            }
        });

        // Sound on hover
        card.addEventListener("mouseenter", () => {
            if (window.soundFX && window.soundFX.enabled) {
                const isPortfolio = card.classList.contains("card-portfolio");
                const isMedia = card.classList.contains("card-mediaworks");
                const tone = isPortfolio ? 440 : (isMedia ? 494 : 554);
                window.soundFX.playTone(tone, "sine", 0.05, 0.04);
            }
        });
    });
}

/* ==========================================================================
   4. Pure Web Audio API Sound Synthesizer (Zero External Audio Files)
   ========================================================================== */
function initAudioSynthesizer() {
    const soundToggleBtn = document.getElementById("sound-toggle");
    const soundIcon = document.getElementById("sound-icon");

    let audioCtx = null;
    
    // Default to ON unless user explicitly turned it off previously
    const savedSound = localStorage.getItem("mr_sound");
    let isSoundEnabled = savedSound === null ? true : savedSound === "true";

    function updateSoundUI(enabled) {
        if (soundIcon) {
            soundIcon.textContent = enabled ? "🔊" : "🔇";
        }
        if (soundToggleBtn) {
            soundToggleBtn.setAttribute(
                "title",
                enabled ? "Disable UI Sound Effects" : "Enable UI Sound Effects"
            );
        }
    }

    // Set initial UI state
    updateSoundUI(isSoundEnabled);

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Browser Autoplay Policy unlocker: resume AudioContext upon first user gesture
    function unlockAudio() {
        if (isSoundEnabled) {
            getAudioContext();
        }
        window.removeEventListener("pointerdown", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
    }
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    window.soundFX = {
        get enabled() {
            return isSoundEnabled;
        },
        playTone(freq = 440, type = "sine", duration = 0.08, gainVol = 0.05) {
            if (!isSoundEnabled) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                gain.gain.setValueAtTime(gainVol, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + duration);
            } catch (err) {
                console.debug("Audio play silenced:", err);
            }
        },
    };

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener("click", () => {
            isSoundEnabled = !isSoundEnabled;
            localStorage.setItem("mr_sound", String(isSoundEnabled));
            updateSoundUI(isSoundEnabled);

            if (isSoundEnabled) {
                getAudioContext();
                window.soundFX.playTone(660, "triangle", 0.12, 0.08);
            }
        });
    }

    // Attach click sound to buttons
    document.querySelectorAll(".portal-btn, .social-chip, .control-btn").forEach((el) => {
        el.addEventListener("click", () => {
            if (window.soundFX && window.soundFX.enabled) {
                window.soundFX.playTone(720, "sine", 0.09, 0.05);
            }
        });
    });
}

/* ==========================================================================
   5. Keyboard Navigation Shortcuts
   ========================================================================== */
function initKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
        // Prevent trigger if user is typing in an input/textarea
        if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

        if (e.key === "1") {
            const portfolioBtn = document.getElementById("btn-portfolio");
            if (portfolioBtn) {
                portfolioBtn.focus();
                portfolioBtn.click();
            }
        } else if (e.key === "2") {
            const mediaBtn = document.getElementById("btn-mediaworks");
            if (mediaBtn) {
                mediaBtn.focus();
                mediaBtn.click();
            }
        } else if (e.key === "3") {
            const mcBtn = document.getElementById("btn-minecraft");
            if (mcBtn) {
                mcBtn.focus();
                mcBtn.click();
            }
        }
    });
}

/* ==========================================================================
   6. Dynamic Copyright Year
   ========================================================================== */
function initDynamicYear() {
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

/* ==========================================================================
   7. Live Minecraft Server Status Widget (mcstatus.io API)
   ========================================================================== */
function initMinecraftServerStatus() {
    const SERVER_ADDRESS = "mija.ddns.net";

    // Card elements (from user specification)
    const dot = document.getElementById("dot");
    const statusLabel = document.getElementById("status-label");
    const playerInfo = document.getElementById("player-info");
    const motdInfo = document.getElementById("motd-info");

    // Header Pill and extra UI elements
    const mcPill = document.getElementById("mc-status-pill");
    const mcWrapper = document.getElementById("mc-status-wrapper");
    const headerMcStatus = document.getElementById("header-mc-status");
    const headerMcPlayers = document.getElementById("header-mc-players");
    const cardStatusBadge = document.getElementById("card-status-badge");
    const playerBarFill = document.getElementById("player-bar-fill");
    const mcVersionBadge = document.getElementById("mc-version-badge");
    const copyIpBtn = document.getElementById("copy-ip-btn");
    const serverIpBox = document.getElementById("server-ip-box");
    const copyLabel = document.getElementById("copy-label");

    async function fetchServerStatus() {
        try {
            // Queries Java edition status via mcstatus.io API
            const response = await fetch(`https://api.mcstatus.io/v2/status/java/${SERVER_ADDRESS}`);
            const data = await response.json();

            if (data.online) {
                // Card updates
                if (dot) dot.className = "indicator online";
                if (statusLabel) statusLabel.textContent = "Online";
                if (cardStatusBadge) cardStatusBadge.className = "status-badge online";
                if (playerInfo) playerInfo.textContent = `${data.players.online} / ${data.players.max}`;
                if (motdInfo) motdInfo.textContent = data.motd?.clean || "Welcome to Mija's Server!";
                
                // Version badge
                if (mcVersionBadge) {
                    mcVersionBadge.textContent = data.version?.name_clean ? data.version.name_clean : "Java Edition";
                }

                // Player progress bar
                if (playerBarFill && data.players.max > 0) {
                    const pct = Math.min(100, Math.round((data.players.online / data.players.max) * 100));
                    playerBarFill.style.width = `${pct}%`;
                }

                // Header pill updates
                if (mcPill) {
                    mcPill.classList.remove("checking", "offline");
                    mcPill.classList.add("online");
                    mcPill.setAttribute("title", `Minecraft Server Online (${data.players.online}/${data.players.max} players) • Click for details`);
                }
                if (headerMcStatus) headerMcStatus.textContent = "Online";
                if (headerMcPlayers) headerMcPlayers.textContent = `(${data.players.online}/${data.players.max})`;
            } else {
                // Card updates for offline
                if (dot) dot.className = "indicator offline";
                if (statusLabel) statusLabel.textContent = "Offline";
                if (cardStatusBadge) cardStatusBadge.className = "status-badge offline";
                if (playerInfo) playerInfo.textContent = "Server unreachable";
                if (motdInfo) motdInfo.textContent = "Server is currently offline";

                if (playerBarFill) playerBarFill.style.width = "0%";

                // Header pill updates
                if (mcPill) {
                    mcPill.classList.remove("checking", "online");
                    mcPill.classList.add("offline");
                    mcPill.setAttribute("title", "Minecraft Server is currently offline • Click for details");
                }
                if (headerMcStatus) headerMcStatus.textContent = "Offline";
                if (headerMcPlayers) headerMcPlayers.textContent = "";
            }
        } catch (err) {
            if (dot) dot.className = "indicator offline";
            if (statusLabel) statusLabel.textContent = "Error";
            if (cardStatusBadge) cardStatusBadge.className = "status-badge offline";
            if (playerInfo) playerInfo.textContent = "Failed to fetch status";
            if (motdInfo) motdInfo.textContent = "Connection check failed";

            if (playerBarFill) playerBarFill.style.width = "0%";

            if (mcPill) {
                mcPill.classList.remove("checking", "online");
                mcPill.classList.add("offline");
            }
            if (headerMcStatus) headerMcStatus.textContent = "Offline";
            if (headerMcPlayers) headerMcPlayers.textContent = "";
        }
    }

    // Toggle Dropdown Card on click
    if (mcPill && mcWrapper) {
        mcPill.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = mcWrapper.classList.toggle("is-open");
            mcPill.setAttribute("aria-expanded", String(isOpen));

            if (window.soundFX && window.soundFX.enabled) {
                window.soundFX.playTone(isOpen ? 640 : 480, "sine", 0.08, 0.04);
            }
        });

        // Close on click outside
        document.addEventListener("click", (e) => {
            if (!mcWrapper.contains(e.target)) {
                mcWrapper.classList.remove("is-open");
                mcPill.setAttribute("aria-expanded", "false");
            }
        });

        // Close on escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && mcWrapper.classList.contains("is-open")) {
                mcWrapper.classList.remove("is-open");
                mcPill.setAttribute("aria-expanded", "false");
                mcPill.focus();
            }
        });
    }

    // Copy IP Address Functionality
    function showCopyFeedback() {
        if (copyLabel) copyLabel.textContent = "Copied! ✓";
        if (copyIpBtn) copyIpBtn.classList.add("copied");

        if (window.soundFX && window.soundFX.enabled) {
            window.soundFX.playTone(880, "sine", 0.1, 0.06);
        }

        setTimeout(() => {
            if (copyLabel) copyLabel.textContent = "Copy";
            if (copyIpBtn) copyIpBtn.classList.remove("copied");
        }, 2000);
    }

    function fallbackCopy() {
        try {
            const tempInput = document.createElement("input");
            tempInput.value = SERVER_ADDRESS;
            tempInput.style.position = "fixed";
            tempInput.style.opacity = "0";
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
        } catch (err) {
            console.warn("Clipboard fallback failed", err);
        }
        showCopyFeedback();
    }

    function copyServerAddress(e) {
        if (e) e.stopPropagation();
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(SERVER_ADDRESS).then(() => {
                showCopyFeedback();
            }).catch(() => {
                fallbackCopy();
            });
        } else {
            fallbackCopy();
        }
    }

    if (copyIpBtn) {
        copyIpBtn.addEventListener("click", copyServerAddress);
    }
    if (serverIpBox) {
        serverIpBox.addEventListener("click", copyServerAddress);
        serverIpBox.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                copyServerAddress(e);
            }
        });
    }

    // Initial check
    fetchServerStatus();

    // Auto-refresh every 60 seconds
    setInterval(fetchServerStatus, 60000);
}
