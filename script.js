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

let isMobile = false;
let selectedPoint = null;

function checkMobileDevice() {
    isMobile = isMobileDevice();
}

function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
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


    points.forEach(point => {
        if (!point.expanded) {
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

            point.x += point.vx;
            point.y += point.vy;
            point.z += point.vz;

            if (point.x < margin || point.x > canvas.width - margin) point.vx *= -1;
            if (point.y < margin || point.y > canvas.height - margin) point.vy *= -1;
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
        const size = point.expanded ? expandedPointSize : point.size;
        ctx.fillStyle = point.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
    });
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
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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

    points.forEach(point => {
        if (point.element) {
            const dx = point.x - x;
            const dy = point.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= point.size) {
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

                    // Afficher le contenu HTML du point cliqué
                    point.element.style.display = 'block';
                    point.element.style.left = point.x + 'px';
                    point.element.style.top = point.y + 'px';
                    point.element.style.transform = 'translate(-50%, -50%)';
                }
            }
        }
    });
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

canvas.addEventListener('click', handlePointClick);