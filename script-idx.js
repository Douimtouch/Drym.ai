const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
ctx.filter = 'blur(1px)'

const points = [];
const lines = [];
const elements = document.querySelectorAll('.element');
const maxDistance = 270;
const minSize = 4;
const maxSize = 14;
const coloredPointSize = 22;
const expandedPointSize = 100;
const speed = 0.125;

let cursorPosition = { x: 0, y: 0 };
let isMobile = false;
let selectedPoint = null;
let draggedPoint = null;
let touchStartPosition = { x: 0, y: 0 };
let startTime = null;
let lastAnimationTime = 0;
const animationInterval = 4000; // Intervalle entre chaque animation (en millisecondes)
const animationDuration = 1000;
let animationActive = true;

const particleConfig = {
    COUNT: 10,
    INNER: 40,
    OUTER: 50,
    MIN_DIST: 45,
    RINGS: 2,
    DURATION: 3000,
    INTERVAL: 6000,
    COLOR: '#3b82f6',
    CURSOR_SVG: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>`
};

let cursorImg;
const loadCursor = () => {
    return new Promise(resolve => {
        cursorImg = new Image();
        cursorImg.onload = () => resolve();
        cursorImg.src = 'data:image/svg+xml,' + encodeURIComponent(particleConfig.CURSOR_SVG);
    });
};

function checkMobileDevice() {
    isMobile = isMobileDevice();
}

function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

function hexToRgb(hex) {
    var r = 0, g = 0, b = 0;
    hex = hex.substring(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    return {r: r, g: g, b: b};
}

document.querySelectorAll('.element').forEach(function(el) {
    var bgColor = el.getAttribute('data-color');
    var rgb = hexToRgb(bgColor);

    // Calcul une couleur plus sombre pour le texte
    var darkerColor = `rgb(${Math.max(rgb.r - 110, 0)}, ${Math.max(rgb.g - 110, 0)}, ${Math.max(rgb.b - 110, 0)})`;
    el.style.color = darkerColor;
  
    // Ajuste la couleur pour le survol (moins claire que précédemment)
    var hoverColor = `rgb(${Math.min(rgb.r - 50, 255)}, ${Math.min(rgb.g - 50, 255)}, ${Math.min(rgb.b - 50, 255)})`;

    el.querySelectorAll('a').forEach(function(a) {
        a.style.color = darkerColor;
        var span = document.createElement('span');
        span.className = 'link-circle';
        a.appendChild(span);
        a.dataset.hoverColor = hoverColor;
    });
});

document.querySelectorAll('.element a').forEach(function(a) {
    a.addEventListener('mouseenter', function() {
        this.style.color = this.dataset.hoverColor;
    });
    a.addEventListener('mouseleave', function() {
        var parentColor = this.closest('.element').style.color;
        this.style.color = parentColor; // Réapplique la couleur d'origine
    });
});


function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    cursorPosition.x = event.clientX - rect.left;
    cursorPosition.y = event.clientY - rect.top;

    if (draggedPoint) {
        const margin = draggedPoint.color !== '#444444' ? coloredPointSize + 20 : maxSize + 5;
        draggedPoint.x = Math.max(margin, Math.min(cursorPosition.x, canvas.width - margin));
        draggedPoint.y = Math.max(margin, Math.min(cursorPosition.y, canvas.height - margin));
    }
}

function handleMouseUp(event) {
    if (draggedPoint) {
        canvas.releasePointerCapture(event.pointerId);
        draggedPoint = null;
        if (isMobile) {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
        }
    }
}

function init() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const numPointsPerWidth = canvas.width / 30;
    const numPoints = Math.max(elements.length, Math.floor(numPointsPerWidth));

    points.length = 0;
    for (let i = 0; i < numPoints; i++) {
        const color = elements[i]?.dataset.color || '#444444';
        const size = elements[i] ? coloredPointSize : minSize;
        points.push(createPoint(color, size, elements[i]));
    }
}

function createPoint(color, size, element) {
    const margin = maxSize + 5;
    return {
        x: Math.random() * (canvas.width - margin * 2) + margin,
        y: Math.random() * (canvas.height - margin * 2) + margin,
        z: Math.random() * 100,
        vx: (Math.random() * 2 - 1) * speed,
        vy: (Math.random() * 2 - 1) * speed,
        vz: (Math.random() * 2 - 1) * speed,
        size: size,
        speed: Math.random() * 0.1 + 0.05,
        color: color,
        element: element,
        expanded: false
    };
}

function hideAllElements() {
    elements.forEach(element => {
        element.style.display = 'none';
    });
}

function update() {
    const margin = maxSize + 5;
    const coloredMargin = coloredPointSize + 40;

    points.forEach(point => {
        if (!point.expanded && point !== draggedPoint) {
            if (selectedPoint) {
                const dx = point.x - selectedPoint.x;
                const dy = point.y - selectedPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < expandedPointSize * 1.75) {
                    const angle = Math.atan2(dy, dx);
                    const repulsionForce = (expandedPointSize * 2 - distance) / (expandedPointSize * 2);
                    const repulsionX = Math.cos(angle) * repulsionForce * 2;
                    const repulsionY = Math.sin(angle) * repulsionForce * 2;

                    point.x += repulsionX;
                    point.y += repulsionY;

                    if (point.color !== '#444444') {
                        if (point.x < coloredMargin) {
                            point.x = coloredMargin;
                        } else if (point.x > canvas.width - coloredMargin) {
                            point.x = canvas.width - coloredMargin;
                        }

                        if (point.y < coloredMargin) {
                            point.y = coloredMargin;
                        } else if (point.y > canvas.height - coloredMargin) {
                            point.y = canvas.height - coloredMargin;
                        }
                    } else {
                        if (point.x < margin) {
                            point.x = margin;
                        } else if (point.x > canvas.width - margin) {
                            point.x = canvas.width - margin;
                        }

                        if (point.y < margin) {
                            point.y = margin;
                        } else if (point.y > canvas.height - margin) {
                            point.y = canvas.height - margin;
                        }
                    }
                }
            }

            point.x += point.vx;
            point.y += point.vy;
            point.z += point.vz;

            if (point.color !== '#444444') {
                if (point.x < coloredMargin || point.x > canvas.width - coloredMargin) point.vx *= -1;
                if (point.y < coloredMargin || point.y > canvas.height - coloredMargin) point.vy *= -1;
            } else {
                if (point.x < margin || point.x > canvas.width - margin) point.vx *= -1;
                if (point.y < margin || point.y > canvas.height - margin) point.vy *= -1;
            }

            if (point.z < 0 || point.z > 100) point.vz *= -1;
        }
    });

    lines.length = 0;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const dz = points[i].z - points[j].z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < maxDistance) {
                lines.push([points[i], points[j]]);
            }
        }
    }
}

async function initializeCanvas() {
    checkMobileDevice();
    await loadCursor(); // Attendre que l'image soit chargée
    init();
    animate();
}

function optimizedParticleGeneration(time, point) {
    const particles = [];
    const ringCount = particleConfig.RINGS;
    const particlesPerRing = Math.ceil(particleConfig.COUNT / ringCount);
    
    for (let ring = 0; ring < ringCount; ring++) {
        const radius = particleConfig.INNER + 
            (particleConfig.OUTER - particleConfig.INNER) * (ring / (ringCount - 1));
        
        // Calculer le nombre de particules pour ce cercle
        const angleStep = (2 * Math.PI) / particlesPerRing;
        
        for (let i = 0; i < particlesPerRing; i++) {
            if (particles.length >= particleConfig.COUNT) break;
            
            const angle = i * angleStep + (ring * angleStep / 2);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            particles.push({
                x: point.x + x,
                y: point.y + y,
                bx: x,
                by: y,
                fx: x * 0.5, // Force de dispersion proportionnelle à la position
                fy: y * 0.5,
                scale: 1,
                opacity: 0.8,
                time: time + (particles.length * 50), // Délai progressif
                isCursor: Math.random() > 0.3,
                color: point.color
            });
        }
    }
    
    // Mélanger l'ordre d'apparition des particules
    return particles
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.cursorCache = new Map();
        this.textCache = new Map();
    }

    generate(time, point) {
        this.particles = optimizedParticleGeneration(time, point);
    }

    createPixelatedOutline(ctx, drawFunction, pixelSize = 2) {
        // Créer un canvas temporaire avec une résolution plus basse
        const tempCanvas = document.createElement('canvas');
        const scale = 1 / pixelSize;
        tempCanvas.width = ctx.canvas.width * scale;
        tempCanvas.height = ctx.canvas.height * scale;
        
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.scale(scale, scale);
        
        // Dessiner sur le canvas temporaire
        drawFunction(tempCtx);
        
        // Redimensionner vers le canvas original avec pixelisation
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            tempCanvas, 
            0, 0, tempCanvas.width, tempCanvas.height,
            0, 0, ctx.canvas.width, ctx.canvas.height
        );
        ctx.imageSmoothingEnabled = true;
    }

    getCursorCanvas(color) {
        if (this.cursorCache.has(color)) {
            return this.cursorCache.get(color);
        }

        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');

        // Fonction pour dessiner le contour pixelisé
        const drawOutline = (targetCtx) => {
            targetCtx.lineWidth = 0.8;
            targetCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
            
            targetCtx.beginPath();
            targetCtx.moveTo(3, 3);
            targetCtx.lineTo(10.07, 19.97);
            targetCtx.lineTo(12.58, 12.58);
            targetCtx.lineTo(19.97, 10.07);
            targetCtx.closePath();
            targetCtx.stroke();

            targetCtx.beginPath();
            targetCtx.moveTo(13, 13);
            targetCtx.lineTo(19, 19);
            targetCtx.stroke();
        };

        // Dessiner le contour pixelisé
        this.createPixelatedOutline(ctx, drawOutline);

        // Dessiner la forme colorée normalement
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        
        ctx.beginPath();
        ctx.moveTo(3, 3);
        ctx.lineTo(10.07, 19.97);
        ctx.lineTo(12.58, 12.58);
        ctx.lineTo(19.97, 10.07);
        ctx.closePath();
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(13, 13);
        ctx.lineTo(19, 19);
        ctx.stroke();

        this.cursorCache.set(color, canvas);
        return canvas;
    }

    getTextCanvas(text, color) {
        const key = `${text}-${color}`;
        if (this.textCache.has(key)) {
            return this.textCache.get(key);
        }

        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');

        // Fonction pour dessiner le contour du texte pixelisé
        const drawOutline = (targetCtx) => {
            targetCtx.font = "600 16px system-ui";
            targetCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
            targetCtx.lineWidth = 0.8;
            targetCtx.strokeText(text, 20, 15);
        };

        // Dessiner le contour pixelisé
        this.createPixelatedOutline(ctx, drawOutline);

        // Dessiner le texte coloré normalement
        ctx.font = "600 16px system-ui";
        ctx.fillStyle = color;
        ctx.fillText(text, 20, 15);

        this.textCache.set(key, canvas);
        return canvas;
    }

    render(ctx, time, point) {
        this.particles.forEach(p => {
            const elapsed = time - p.time;
            if(elapsed < 0 || elapsed > particleConfig.DURATION) return;

            const progress = elapsed / particleConfig.DURATION;
            let scale = 0, opacity = 0;
            let x = point.x + p.bx;
            let y = point.y + p.by;

            if(progress < 0.1) {
                const t = progress / 0.1;
                scale = t;
                opacity = t;
            } else if(progress < 0.8) {
                scale = 1;
                opacity = 1;
            } else {
                const t = (progress - 0.8) / 0.2;
                scale = 1 - t;
                opacity = 1 - t;
                x += p.fx * t;
                y += p.fy * t;
            }

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.globalAlpha = opacity;

            if(p.isCursor) {
                const cursorCanvas = this.getCursorCanvas(p.color);
                ctx.drawImage(cursorCanvas, -10, -10, 20, 20);
            } else {
                const textCanvas = this.getTextCanvas('click', p.color);
                ctx.drawImage(textCanvas, -20, -10);
            }

            ctx.restore();
        });
    }
}

function draw(timestamp) {
    if (!startTime) startTime = timestamp;

    ctx.fillStyle = 'rgba(245, 245, 245, 5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Dessiner les lignes
    lines.forEach(line => {
        const gradient = ctx.createLinearGradient(line[0].x, line[0].y, line[1].x, line[1].y);
        gradient.addColorStop(0, line[0].color);
        gradient.addColorStop(1, line[1].color);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        ctx.lineTo(line[1].x, line[1].y);
        ctx.stroke();
    });

    const sortedPoints = points.slice().sort((a, b) => {
        if (a.element && !b.element) return 1;
        if (!a.element && b.element) return -1;
        return 0;
    });

    // 2. Dessiner les cercles
    sortedPoints.forEach(point => {
        if (point !== selectedPoint) {
            let size = point.size;

            if (!isMobile) {
                const dx = point.x - cursorPosition.x;
                const dy = point.y - cursorPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                size = distance < 50 ? point.size * 1.5 : point.size;
            }

            if (point.element && animationActive) {
                const animationProgress = (timestamp - lastAnimationTime) / animationDuration;
                if (animationProgress < 1) {
                    const pulseFactor = 1 + Math.sin(animationProgress * Math.PI) * 0.85;
                    size *= pulseFactor;
                }
            }

            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.ellipse(point.x, point.y, size, size, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // 3. Dessiner les particules en dernier
    sortedPoints.forEach(point => {
        if (point !== selectedPoint && point.element && animationActive) {
            if (!point.particleSystem) {
                point.particleSystem = new ParticleSystem();
                point.lastParticleAnim = 0;
            }

            if (timestamp - point.lastParticleAnim > particleConfig.INTERVAL) {
                point.lastParticleAnim = timestamp;
                point.particleSystem.generate(timestamp, point);
            }

            if (point.particleSystem) {
                point.particleSystem.render(ctx, timestamp, point);
            }
        }
    });

    // 4. Dessiner le point sélectionné en tout dernier
    if (selectedPoint) {
        const size = expandedPointSize;
        ctx.fillStyle = selectedPoint.color;
        ctx.beginPath();
        ctx.ellipse(selectedPoint.x, selectedPoint.y, size, size, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate(timestamp) {
    update();
    draw(timestamp);
    requestAnimationFrame(animate);
}

function handleResize() {
    hideAllElements();
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    if (selectedPoint) {
        selectedPoint.expanded = false;
        selectedPoint.element.style.display = 'none';
        selectedPoint = null;
    }

    init();
}

function handlePointClick(event) {
    if (event.type === 'touch' && event.touches.length > 1) {
        return;
    }

    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const x = event.type === 'touchstart' ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = event.type === 'touchstart' ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

    let pointClicked = false;

    if (selectedPoint) {
        const dx = selectedPoint.x - x;
        const dy = selectedPoint.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= expandedPointSize) {
            selectedPoint.expanded = false;
            selectedPoint.element.style.display = 'none';
            selectedPoint = null;
            return;
        }
    }

    for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i];
        if (point.element) {
            const dx = point.x - x;
            const dy = point.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= point.size + 10) {
                pointClicked = true;
                if (selectedPoint === point) {
                    selectedPoint = null;
          point.expanded = false;
          point.element.style.display = 'none';
        } else {
          if (selectedPoint) {
            selectedPoint.expanded = false;
            selectedPoint.element.style.display = 'none';
          }
          selectedPoint = point;
          point.expanded = true;
          point.x = canvas.width / 2;
          point.y = canvas.height / 2;

          point.element.style.display = 'block';
          point.element.style.left = point.x + 'px';
          point.element.style.top = point.y + 'px';
          point.element.style.transform = 'translate(-50%, -50%)';
          animationActive = false; // Désactiver l'animation lorsqu'un point est cliqué
        }
                if (event.type === 'touch') {
                    event.target.setPointerCapture(event.touches[0].identifier);
                }
                return;
            }
        }
    }

    if (!pointClicked) {
        for (let i = points.length - 1; i >= 0; i--) {
            const point = points[i];
            if (!point.element) {
                const dx = point.x - x;
                const dy = point.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= point.size * 8.5) {
                    draggedPoint = point;
                    if (isMobile) {
                        document.body.style.overflow = 'hidden';
                        document.body.style.touchAction = 'none';
                        event.preventDefault();
                    }
                    return;
                }
            }
        }
    }

    if (!pointClicked) {
        draggedPoint = null;
        if (isMobile) {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
        }
    }
}

function handleTouchStart(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const y = event.touches[0].clientY - rect.top;
    handlePointClick({ type: 'touchstart', touches: [{ clientX: event.touches[0].clientX, clientY: event.touches[0].clientY }] });
}

function handleTouchMove(event) {
    if (draggedPoint) {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = event.touches[0].clientX - rect.left;
        const y = event.touches[0].clientY - rect.top;
        const margin = draggedPoint.color !== '#444444' ? coloredPointSize + 20 : maxSize + 5;
        draggedPoint.x = Math.max(margin, Math.min(x, canvas.width - margin));
        draggedPoint.y = Math.max(margin, Math.min(y, canvas.height - margin));
    }
}

function handleTouchEnd(event) {
    if (draggedPoint) {
        draggedPoint = null;
        document.body.style.overflow = 'auto';
        document.body.style.touchAction = 'auto';
    }
}

initializeCanvas();

window.addEventListener('resize', () => {
    if (!isMobile) {    
        handleResize();
    }
});

window.addEventListener('orientationchange', () => {
    if (isMobile) {
        setTimeout(handleResize, 100);
    }
});

canvas.addEventListener('pointerdown', handlePointClick);
canvas.addEventListener('pointermove', handleMouseMove);
canvas.addEventListener('pointerup', handleMouseUp);

canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

canvas.addEventListener('gesturestart', function(event) {
    event.preventDefault();
});
