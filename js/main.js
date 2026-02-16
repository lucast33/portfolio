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
        initializeBackgroundAnimations();
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
                nameElement.style.background = `linear-gradient(45deg, hsl(${hue}, 0%, 100%), hsl(${hue + 60}, 0%, 80%))`;
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

// Background Animations
function initializeBackgroundAnimations() {
    const backgroundContainer = document.getElementById('backgroundAnimations');

    // Create sound wave circles
    function createSoundWave() {
        const wave = document.createElement('div');
        wave.className = 'sound-wave';
        wave.style.left = Math.random() * 100 + '%';
        wave.style.top = Math.random() * 100 + '%';
        backgroundContainer.appendChild(wave);

        setTimeout(() => {
            if (wave.parentNode) {
                wave.parentNode.removeChild(wave);
            }
        }, 8000);
    }

    // Create waveform lines
    function createWaveform() {
        const waveform = document.createElement('div');
        waveform.className = 'waveform';
        waveform.style.top = Math.random() * 100 + '%';
        backgroundContainer.appendChild(waveform);

        setTimeout(() => {
            if (waveform.parentNode) {
                waveform.parentNode.removeChild(waveform);
            }
        }, 12000);
    }

    // Create audio visualizer bars
    function createAudioBars() {
        const bars = document.createElement('div');
        bars.className = 'audio-bars';
        bars.style.left = Math.random() * 80 + '%';
        bars.style.top = Math.random() * 80 + '%';

        for (let i = 0; i < 7; i++) {
            const bar = document.createElement('div');
            bar.className = 'audio-bar';
            bars.appendChild(bar);
        }

        backgroundContainer.appendChild(bars);

        setTimeout(() => {
            if (bars.parentNode) {
                bars.parentNode.removeChild(bars);
            }
        }, 6000);
    }

    // Create floating particles
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        backgroundContainer.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 15000);
    }

    // Create sine waves
    function createSineWave() {
        const sineWave = document.createElement('div');
        sineWave.className = 'sine-wave';
        sineWave.style.top = Math.random() * 100 + '%';
        backgroundContainer.appendChild(sineWave);

        setTimeout(() => {
            if (sineWave.parentNode) {
                sineWave.parentNode.removeChild(sineWave);
            }
        }, 6000);
    }

    // Start animations at different intervals
    setInterval(createSoundWave, 4000);
    setInterval(createWaveform, 6000);
    setInterval(createAudioBars, 8000);
    setInterval(createParticle, 3000);
    setInterval(createSineWave, 10000);

    // Create initial animations
    setTimeout(() => {
        createSoundWave();
        createWaveform();
        createParticle();
    }, 1000);
}
