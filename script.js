const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');
const points = [];
const lines = [];
const elements = document.querySelectorAll('.element');
const maxDistance = 270;
const minSize = 5;
const maxSize = 14;
const coloredPointSize = 22; // Taille des points de couleur
const expandedPointSize = 100; // Taille des points cliqués
const speed = 0.12;
const touchIndicator = document.getElementById('touchIndicator');

let cursorPosition = { x: 0, y: 0 };
let isMobile = false;
let selectedPoint = null;
let draggedPoint = null;
let touchStartPosition = { x: 0, y: 0 };

function checkMobileDevice() {
    isMobile = isMobileDevice();
}

function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

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

function handleTouchStart(event) {
    const rect = canvas.getBoundingClientRect();
    touchStartPosition.x = event.touches[0].clientX - rect.left;
    touchStartPosition.y = event.touches[0].clientY - rect.top;
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
    } else if (!selectedPoint && event.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const x = event.touches[0].clientX - rect.left;
        const y = event.touches[0].clientY - rect.top;

        // Vérifier si le doigt est au-dessus d'un point
        let isOverPoint = false;
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const dx = point.x - x;
            const dy = point.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= point.size * 1.5) {
                isOverPoint = true;
                break;
            }
        }

        if (isOverPoint) {
            hideTouchIndicator();
        } else {
            showTouchIndicator();
        }
    }
}
let touchIndicatorInterval;

function showTouchIndicator() {
    if (isMobile) {
        touchIndicatorInterval = setInterval(() => {
            touchIndicator.style.display = touchIndicator.style.display === 'none' ? 'block' : 'none';
        }, 20);
    }
}

function hideTouchIndicator() {
    if (isMobile) {
        clearInterval(touchIndicatorInterval);
        touchIndicator.style.display = 'none';
    }
}


function handleMouseUp() {
    draggedPoint = null;
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
    const coloredMargin = coloredPointSize + 20; // Marge plus grande pour les points de couleur

    points.forEach(point => {
        if (!point.expanded && point !== draggedPoint) {
            if (selectedPoint) {
                const dx = point.x - selectedPoint.x;
                const dy = point.y - selectedPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < expandedPointSize * 2) {
                    const angle = Math.atan2(dy, dx);
                    const repulsionForce = (expandedPointSize * 2 - distance) / (expandedPointSize * 2);
                    const repulsionX = Math.cos(angle) * repulsionForce * 2;
                    const repulsionY = Math.sin(angle) * repulsionForce * 2;

                    point.x += repulsionX;
                    point.y += repulsionY;

                    // Vérifier si le point est poussé hors du cadre
                    if (point.color !== '#444444') {
                        // Utiliser la marge plus grande pour les points de couleur
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
                        // Utiliser la marge normale pour les points noirs
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

            // Vérifier si le point est un point de couleur ou un point noir
            if (point.color !== '#444444') {
                // Utiliser la marge plus grande pour les points de couleur
                if (point.x < coloredMargin || point.x > canvas.width - coloredMargin) point.vx *= -1;
                if (point.y < coloredMargin || point.y > canvas.height - coloredMargin) point.vy *= -1;
            } else {
                // Utiliser la marge normale pour les points noirs
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

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function draw() {
    ctx.fillStyle = 'rgba(245, 245, 245, 5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lines.forEach(line => {
        const gradient = ctx.createLinearGradient(line[0].x, line[0].y, line[1].x, line[1].y);
        gradient.addColorStop(0, line[0].color);
        gradient.addColorStop(1, line[1].color);
        ctx.strokeStyle = gradient;
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

    sortedPoints.forEach(point => {
        if (point !== selectedPoint) {
            const dx = point.x - cursorPosition.x;
            const dy = point.y - cursorPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const size = distance < 50 ? point.size * 1.5 : point.size;
            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    if (selectedPoint) {
        const size = expandedPointSize;
        ctx.fillStyle = selectedPoint.color;
        ctx.beginPath();
        ctx.arc(selectedPoint.x, selectedPoint.y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

function handleResize() {
    hideAllElements();
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    if (selectedPoint) {
        selectedPoint.expanded = false;
        selectedPoint.element.style.display = 'none';
        selectedPoint = null;
    }

    init();
}

function handlePointClick(event) {
    if (event.type === 'touchstart' && event.touches.length > 1) {
        // Ignorer le clic si plusieurs doigts sont sur l'écran
        return;
    }

    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const x = event.type === 'touchstart' ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = event.type === 'touchstart' ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

    let pointClicked = false;

    // Vérifier si le point sélectionné a été cliqué
    if (selectedPoint) {
        const dx = selectedPoint.x - x;
        const dy = selectedPoint.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= expandedPointSize) {
            selectedPoint.expanded = false;
            selectedPoint.element.style.display = 'none';
            selectedPoint = null;
            if (isMobile) {
                showTouchIndicator();
            }
            return;
        }
    }

    // Parcourir d'abord les points de couleur
    for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i];
        if (point.element) {
            const dx = point.x - x;
            const dy = point.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= point.size * 2.2) {
                pointClicked = true;
                hideTouchIndicator();
                if (selectedPoint === point) {
                    selectedPoint = null;
                    point.expanded = false;
                    point.element.style.display = 'none';
                    if (isMobile) {
                        showTouchIndicator();
                    }
                } else {
                    if (selectedPoint) {
                        selectedPoint.expanded = false;
                        selectedPoint.element.style.display = 'none';
                    }
                    selectedPoint = point;
                    point.expanded = true;
                    point.x = canvas.width / 2;
                    point.y = canvas.height / 2;

                    // Afficher le contenu HTML du point cliqué
                    point.element.style.display = 'block';
                    point.element.style.left = point.x + 'px';
                    point.element.style.top = point.y + 'px';
                    point.element.style.transform = 'translate(-50%, -50%)';
                }
                return;
            }
        }
    }

    // Si aucun point de couleur n'a été cliqué, vérifier les points noirs
    if (!pointClicked) {
        for (let i = points.length - 1; i >= 0; i--) {
            const point = points[i];
            if (!point.element) {
                const dx = point.x - x;
                const dy = point.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= point.size * 1.5) {
                    draggedPoint = point;
                    hideTouchIndicator();
                    return;
                }
            }
        }
    }

    if (!pointClicked) {
        draggedPoint = null;
        if (!selectedPoint && isMobile) {
            showTouchIndicator();
        }
    }
}

checkMobileDevice();
if (isMobile) {
    showTouchIndicator();
}
init();
animate();

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

// Gestionnaire d'événements pour le clic de souris et le début du toucher
canvas.addEventListener('mousedown', handlePointClick);
canvas.addEventListener('touchstart', handlePointClick);

// Gestionnaire d'événements pour le déplacement de la souris et le déplacement du doigt
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('touchmove', handleTouchMove);

// Gestionnaire d'événements pour le relâchement du clic de souris et la fin du toucher
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('touchend', handleMouseUp);

// Gestionnaire d'événements pour les mouvements de la souris
canvas.addEventListener('mousemove', handleMouseMove);

// Gestionnaire d'événements pour les touches sur l'écran (appareils mobiles)
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

// Gestionnaire d'événements pour le relâchement du clic de souris
canvas.addEventListener('mouseup', handleMouseUp);

// Gestionnaire d'événements pour empêcher le zoom par défaut sur les appareils mobiles
canvas.addEventListener('gesturestart', function(event) {
    event.preventDefault();
});