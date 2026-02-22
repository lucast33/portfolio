// Prevent any accidental music autoplay
document.getElementById('backgroundMusic').pause();

// Loading Animation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - starting sequence');

    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.getElementById('loadingBar');
    const loadingPercentage = document.getElementById('loadingPercentage');
    const enterScreen = document.getElementById('enterScreen');
    const mainContent = document.getElementById('mainContent');
    const enterButton = document.getElementById('enterButton');

    let progress = 0;
    const totalTime = 2500; // 2.5 seconds
    const interval = 50; // Update every 50ms
    const increment = (100 * interval) / totalTime;

    const loadingInterval = setInterval(() => {
        progress += increment;

        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);

            console.log('Loading complete - showing enter screen');

            // Complete loading and show enter screen
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                enterScreen.classList.add('visible');
                console.log('Enter screen should now be visible');
            }, 300);
        }

        loadingBar.style.width = progress + '%';
        loadingPercentage.textContent = Math.floor(progress) + '%';
    }, interval);

    // Enter button click handler
    enterButton.addEventListener('click', function() {
        console.log('Enter button clicked');
        enterScreen.classList.remove('visible');
        enterScreen.classList.add('hidden');
        mainContent.classList.add('visible');
        initializeMainContent();
        initializeSpaceInvaders();
        startBackgroundMusic();
    });
});

// Start background music - ONLY CALLED WHEN BUTTON IS CLICKED
function startBackgroundMusic() {
    console.log('Attempting to start music');
    const audio = document.getElementById('backgroundMusic');
    audio.volume = 0.3;

    audio.play().then(() => {
        console.log('Background music started successfully');
    }).catch(error => {
        console.log('Failed to start music:', error);
    });

    audio.addEventListener('error', (e) => {
        console.log('Background music error - check file path:', e);
    });
}

// Initialize main content functionality
function initializeMainContent() {
    // Initialize time widget
    initializeTimeWidget();

    // Add click handlers for tabs (for mobile support)
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            // Toggle the active class for mobile
            this.classList.toggle('active');
        });
    });

    // Smooth reveal animations for tabs
    // Add intersection observer for scroll-based animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    tabs.forEach(tab => {
        observer.observe(tab);
    });

    // Enhanced hover effects (only add if not mobile)
    if (window.innerWidth > 768) {
        tabs.forEach(tab => {
            tab.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(10px) scale(1.02)';
            });

            tab.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0) scale(1)';
            });
        });
    }

    // Add dynamic gradient effect to name (optional - can remove if causing issues)
    try {
        const nameElement = document.querySelector('.name');
        if (nameElement) {
            let hue = 0;
            setInterval(() => {
                hue = (hue + 1) % 360;
                nameElement.style.background = `linear-gradient(45deg, hsl(${hue}, 0%, 100%), hsl(${hue + 60}, 0%, 100%))`;
                nameElement.style.webkitBackgroundClip = 'text';
                nameElement.style.backgroundClip = 'text';
            }, 100);
        }
    } catch (error) {
        console.log('Name animation disabled');
    }
}

// Time Widget functionality
function initializeTimeWidget() {
    const timeWidget = document.getElementById('timeWidget');

    function updateTime() {
        try {
            const now = new Date();

            // Convert to Eastern Time
            const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));

            // Format time as HH:MM:SS
            const hours = easternTime.getHours().toString().padStart(2, '0');
            const minutes = easternTime.getMinutes().toString().padStart(2, '0');
            const seconds = easternTime.getSeconds().toString().padStart(2, '0');

            // Format date in lowercase
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'America/New_York'
            };
            const dateString = easternTime.toLocaleDateString('en-US', options).toLowerCase();

            // Update the widget
            timeWidget.innerHTML = `local time (est): ${hours}:${minutes}:${seconds} - ${dateString}`;
        } catch (error) {
            timeWidget.innerHTML = 'local time (est): --:--:-- - date unavailable';
        }
    }

    // Update immediately and then every second
    updateTime();
    setInterval(updateTime, 1000);
}

// Space Invaders background animation
function initializeSpaceInvaders() {
    const container = document.getElementById('backgroundAnimations');
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', () => { resize(); initFormation(); });

    const PX = 4;           // px per "pixel block"
    const COLS = 8;
    const ROWS = 3;
    const SW = 8 * PX;      // sprite width
    const SH = 8 * PX;      // sprite height
    const GAP_X = PX * 3;
    const GAP_Y = PX * 2;
    const OP = 0.15;        // base opacity — keep it subtle
    const STEP_MS_BASE = 700;
    const STEP_PX = PX * 2;
    const DROP_PX = PX * 4;

    // Pixel art sprites [frame0, frame1]
    const SP = {
        squid: [
            [[0,0,1,0,0,1,0,0],[0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,1,0,1,1,0,1,0],[1,1,1,1,1,1,1,1],[1,0,1,0,0,1,0,1],[1,0,0,0,0,0,0,1],[0,0,1,0,0,1,0,0]],
            [[0,0,1,0,0,1,0,0],[1,0,0,1,1,0,0,1],[1,0,1,1,1,1,0,1],[1,1,0,1,1,0,1,1],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,0,1,0,0,1,0,0],[0,1,0,0,0,0,1,0]]
        ],
        crab: [
            [[0,1,0,0,0,0,1,0],[1,0,0,0,0,0,0,1],[1,0,1,1,1,1,0,1],[1,1,1,0,0,1,1,1],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,1,0,0,0,0,1,0],[1,0,0,0,0,0,0,1]],
            [[0,1,0,0,0,0,1,0],[0,0,1,0,0,1,0,0],[0,1,1,1,1,1,1,0],[1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1],[0,1,0,1,1,0,1,0],[1,0,0,0,0,0,0,1],[0,1,0,0,0,0,1,0]]
        ],
        octopus: [
            [[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1],[1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1],[0,0,1,0,0,1,0,0],[0,1,0,1,1,0,1,0],[1,0,1,0,0,1,0,1]],
            [[0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1],[1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1],[0,1,0,1,1,0,1,0],[1,0,0,0,0,0,0,1],[0,0,1,1,1,1,0,0]]
        ],
        player: [[0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,1,1,1,0,0,0,0],[0,1,1,1,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1]],
        ufo:    [[0,0,0,1,1,1,1,1,1,0,0,0],[0,1,1,1,1,1,1,1,1,1,1,0],[1,0,1,0,1,0,1,0,1,0,1,0],[0,1,1,1,1,1,1,1,1,1,1,0]],
        explode:[[1,0,0,1,0,0,1,0],[0,1,0,1,0,1,0,1],[0,0,0,0,0,0,0,0],[1,1,0,0,0,1,1,0],[0,0,0,0,0,0,0,0],[0,1,0,1,0,1,0,1],[1,0,0,1,0,0,1,0],[0,1,0,0,0,0,1,0]]
    };

    function drawSprite(pixels, x, y, op) {
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        for (let ry = 0; ry < pixels.length; ry++) {
            for (let rx = 0; rx < pixels[ry].length; rx++) {
                if (pixels[ry][rx]) ctx.fillRect(~~(x + rx * PX), ~~(y + ry * PX), PX, PX);
            }
        }
    }

    // Game state
    let aliens, formX, formY, formDir, animFrame, stepTimer, stepMs;
    let player, bullets, alienBullets;
    let ufo, ufoTimer, shootTimer, alienShootTimer;

    const PLAYER_W = SP.player[0].length * PX;
    const UFO_W = SP.ufo[0].length * PX;

    function ax(col) { return formX + col * (SW + GAP_X); }
    function ay(row) { return formY + row * (SH + GAP_Y); }

    function initFormation() {
        const fw = COLS * (SW + GAP_X) - GAP_X;
        formX = (W - fw) / 2;
        formY = H * 0.07;
        formDir = 1;
        animFrame = 0;
        stepTimer = 0;
        stepMs = STEP_MS_BASE;
        const types = ['squid', 'crab', 'octopus'];
        aliens = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                aliens.push({ r, c, type: types[r], alive: true, exploding: false, explodeTimer: 0 });
            }
        }
        player = { x: W / 2, y: H - PX * 10, dir: 1, speed: 40 };
        bullets = [];
        alienBullets = [];
        ufo = { active: false, x: 0, y: H * 0.03, dir: 1, speed: 100 };
        ufoTimer = 10000;
        shootTimer = 3000 + Math.random() * 2000;
        alienShootTimer = 5000 + Math.random() * 3000;
    }

    let lastTs = 0;
    function loop(ts) {
        const dt = Math.min(ts - lastTs, 50);
        lastTs = ts;
        ctx.clearRect(0, 0, W, H);

        const alive = aliens.filter(a => a.alive && !a.exploding);

        // --- Step formation ---
        stepTimer += dt;
        if (stepTimer >= stepMs) {
            stepTimer = 0;
            animFrame = 1 - animFrame;

            if (alive.length === 0) { initFormation(); requestAnimationFrame(loop); return; }

            const cols = alive.map(a => a.c);
            const rEdge = ax(Math.max(...cols)) + SW;
            const lEdge = ax(Math.min(...cols));

            if (formDir === 1 && rEdge + STEP_PX >= W - 20) {
                formDir = -1; formY += DROP_PX;
            } else if (formDir === -1 && lEdge - STEP_PX <= 20) {
                formDir = 1; formY += DROP_PX;
            } else {
                formX += formDir * STEP_PX;
            }
            stepMs = Math.max(150, STEP_MS_BASE * (alive.length / (COLS * ROWS)));
        }

        // Reset if formation too low or cleared
        if (formY + ROWS * (SH + GAP_Y) > H - PX * 15) { initFormation(); requestAnimationFrame(loop); return; }
        if (alive.length === 0 && !aliens.some(a => a.exploding)) { initFormation(); requestAnimationFrame(loop); return; }

        // --- Draw aliens ---
        for (const a of aliens) {
            if (a.exploding) {
                drawSprite(SP.explode, ax(a.c), ay(a.r), OP * (a.explodeTimer / 600));
                a.explodeTimer -= dt;
                if (a.explodeTimer <= 0) { a.alive = false; a.exploding = false; }
            } else if (a.alive) {
                drawSprite(SP[a.type][animFrame], ax(a.c), ay(a.r), OP);
            }
        }

        // --- UFO ---
        ufoTimer -= dt;
        if (!ufo.active && ufoTimer <= 0) {
            ufo.active = true;
            ufo.dir = Math.random() > 0.5 ? 1 : -1;
            ufo.x = ufo.dir === 1 ? -UFO_W : W;
            ufoTimer = 12000 + Math.random() * 8000;
        }
        if (ufo.active) {
            ufo.x += ufo.dir * ufo.speed * (dt / 1000);
            drawSprite(SP.ufo, ufo.x, ufo.y, OP * 0.85);
            if (ufo.x > W + UFO_W || ufo.x < -UFO_W) ufo.active = false;
        }

        // --- Player ---
        player.x += player.dir * player.speed * (dt / 1000);
        if (player.x > W - PLAYER_W - 20) player.dir = -1;
        if (player.x < 20) player.dir = 1;
        drawSprite(SP.player, player.x - PLAYER_W / 2, player.y, OP * 1.3);

        // --- Player shoots ---
        shootTimer -= dt;
        if (shootTimer <= 0) {
            shootTimer = 3000 + Math.random() * 3000;
            bullets.push({ x: player.x, y: player.y, active: true });
        }

        // --- Player bullets ---
        for (const b of bullets) {
            if (!b.active) continue;
            b.y -= 280 * (dt / 1000);
            if (b.y < 0) { b.active = false; continue; }
            // draw slim bullet
            ctx.fillStyle = `rgba(255,255,255,${OP * 1.2})`;
            ctx.fillRect(~~b.x - 1, ~~b.y, PX - 1, PX * 3);
            // collision
            for (const a of aliens) {
                if (!a.alive || a.exploding) continue;
                if (b.x >= ax(a.c) && b.x <= ax(a.c) + SW && b.y >= ay(a.r) && b.y <= ay(a.r) + SH) {
                    b.active = false;
                    a.exploding = true;
                    a.explodeTimer = 600;
                }
            }
        }
        bullets = bullets.filter(b => b.active);

        // --- Alien shoots ---
        alienShootTimer -= dt;
        if (alienShootTimer <= 0 && alive.length > 0) {
            alienShootTimer = 4000 + Math.random() * 4000;
            const shooter = alive[~~(Math.random() * alive.length)];
            alienBullets.push({ x: ax(shooter.c) + SW / 2, y: ay(shooter.r) + SH, active: true });
        }
        for (const b of alienBullets) {
            if (!b.active) continue;
            b.y += 180 * (dt / 1000);
            if (b.y > H) { b.active = false; continue; }
            ctx.fillStyle = `rgba(255,255,255,${OP * 0.9})`;
            ctx.fillRect(~~b.x - 1, ~~b.y, PX - 1, PX * 3);
        }
        alienBullets = alienBullets.filter(b => b.active);

        requestAnimationFrame(loop);
    }

    initFormation();
    requestAnimationFrame(loop);
}
