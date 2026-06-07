(function () {
    const canvas = document.getElementById("lightningCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Detect mobile devices (simple heuristic)
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);

    // Settings differ for mobile and desktop to keep desktop as lively as before
    const settings = isMobile ? {
        particleCount: Math.max(40, Math.floor((canvas.width * canvas.height) / 30000)),
        particleSize: 1.6,
        velocityFactor: 0.8,
        connectDistance: 100,
        mouseRadius: 140,
        shadowBlur: 12,
        lineWidth: 1.4
    } : {
        particleCount: 120,
        particleSize: 2,
        velocityFactor: 0.7,
        connectDistance: 120,
        mouseRadius: 180,
        shadowBlur: 15,
        lineWidth: 1
    };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    const mouse = {
        x: null,
        y: null,
        radius: settings.mouseRadius
    };

    // Mouse support for desktop
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Touch support for mobile
    window.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        if (t) {
            mouse.x = t.clientX;
            mouse.y = t.clientY;
        }
    }, {passive: true});

    window.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        if (t) {
            mouse.x = t.clientX;
            mouse.y = t.clientY;
        }
    }, {passive: true});

    window.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;

            this.vx = (Math.random() - 0.5) * settings.velocityFactor;
            this.vy = (Math.random() - 0.5) * settings.velocityFactor;

            this.size = settings.particleSize;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = "#00ff88";
            ctx.shadowBlur = settings.shadowBlur;
            ctx.shadowColor = "#00ff88";
            ctx.fill();
        }
    }

    const particles = [];
    const count = settings.particleCount;

    for (let i = 0; i < count; i++) particles.push(new Particle());

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < settings.connectDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.strokeStyle = `rgba(0,255,136,${1 - distance / settings.connectDistance})`;
                    ctx.lineWidth = settings.lineWidth;
                    ctx.stroke();
                }
            }
        }
    }

    function connectMouse() {
        if (mouse.x === null || mouse.y === null) return;
        particles.forEach(p => {
            let dx = p.x - mouse.x;
            let dy = p.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(0,255,136,${1 - distance / mouse.radius})`;
                ctx.lineWidth = settings.lineWidth;
                ctx.stroke();
            }
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        connectMouse();
        requestAnimationFrame(animate);
    }

    animate();
})();