const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');
const points = [];
const lines = [];
const numPoints = 24;
const maxDistance = 470;
const minSize = 2;
const maxSize = 5;
const speed = 0.2;

function init() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const numPointsPerWidth = canvas.width / 30; // Ajustez ce nombre selon vos préférences
    const numPoints = Math.max(10, Math.floor(numPointsPerWidth));

    points.length = 0;
    for (let i = 0; i < numPoints; i++) {
        points.push(createPoint());
    }
}

function createPoint() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 100,
        vx: (Math.random() * 2 - 1) * speed,
        vy: (Math.random() * 2 - 1) * speed,
        vz: (Math.random() * 2 - 1) * speed,
        size: Math.random() * (maxSize - minSize) + minSize,
        speed: Math.random() * 0.1 + 0.05
    };
}

function update() {
    const margin = maxSize + 5;

    points.forEach(point => {
        point.x += point.vx;
        point.y += point.vy;
        point.z += point.vz;
        point.size += point.speed;

        if (point.x < margin || point.x > canvas.width - margin) point.vx *= -1;
        if (point.y < margin || point.y > canvas.height - margin) point.vy *= -1;
        if (point.z < 0 || point.z > 100) point.vz *= -1;
        if (point.size < minSize || point.size > maxSize) point.speed *= -1;
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

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    lines.forEach(line => {
        ctx.moveTo(line[0].x, line[0].y);
        ctx.lineTo(line[1].x, line[1].y);
    });
    ctx.stroke();

    ctx.fillStyle = 'black';
    points.forEach(point => {
        const size = easeInOutQuad((point.z / 100)) * (maxSize - minSize) + minSize;
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

init();
animate();

window.addEventListener('resize', () => {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    init();
});