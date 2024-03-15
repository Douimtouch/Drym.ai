const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');
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
    var darkerColor = `rgb(${rgb.r * 0.45}, ${rgb.g * 0.45}, ${rgb.b * 0.45})`;
    el.style.color = darkerColor;
  
    // Ajuste la couleur pour le survol (moins claire que précédemment)
    var hoverColor = `rgb(${Math.min(rgb.r * 0.65, 255)}, ${Math.min(rgb.g * 0.65, 255)}, ${Math.min(rgb.b * 0.65, 255)})`;

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

function setCanvasResolution(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
}

function init() {
    const container = canvas.parentElement;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
    setCanvasResolution(canvas);

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
            let size = point.size;

            if (!isMobile) {
                const dx = point.x - cursorPosition.x;
                const dy = point.y - cursorPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                size = distance < 50 ? point.size * 1.5 : point.size;
            }

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
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
    setCanvasResolution(canvas);

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

checkMobileDevice();
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