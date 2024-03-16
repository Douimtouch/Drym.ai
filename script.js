document.addEventListener('DOMContentLoaded', function() {
    const svg = document.getElementById('lines');
    const points = document.querySelectorAll('.point, .services-text .before, .services-text .after');

    updateSvgSize();



    function createGradient(id, colorStart, colorEnd) {
        const defs = svg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.prepend(defs);

        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '0%');

        const start = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        start.setAttribute('offset', '0%');
        start.setAttribute('style', `stop-color:${colorStart}`);

        const end = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        end.setAttribute('offset', '100%');
        end.setAttribute('style', `stop-color:${colorEnd}`);

        gradient.appendChild(start);
        gradient.appendChild(end);
        defs.appendChild(gradient);

        return `url(#${id})`;
    }

    function createRectangle(x, y, width, height, angle, gradientId) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('transform', `rotate(${angle},${x},${y})`);
        rect.setAttribute('fill', gradientId);
        svg.appendChild(rect);
    }

function updateLines() {
    svg.innerHTML = '<defs></defs>'; // Reset while keeping defs
    const pointsArray = Array.from(points);
    pointsArray.forEach((startPoint, i) => {
        if(i < pointsArray.length - 1) {
            const endPoint = pointsArray[i + 1];
            const colorStart = getMainColor(startPoint);
            const colorEnd = getMainColor(endPoint);
            const gradientId = createGradient(`gradient-${i}`, colorStart, colorEnd);
            drawRectangleBetweenElements(startPoint, endPoint, gradientId);
        }
    });
}

function getMainColor(element) {
    const style = window.getComputedStyle(element);
    const bgColor = style.getPropertyValue('background-image');

    if (bgColor.includes('radial-gradient')) {
        const colors = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g);
        if (colors && colors.length > 0) {
            const mainColor = colors[0].match(/\d+/g);
            const r = parseInt(mainColor[0]);
            const g = parseInt(mainColor[1]);
            const b = parseInt(mainColor[2]);
            return `rgb(${r}, ${g}, ${b})`;
        }
    } else if (bgColor.includes('linear-gradient')) {
        const colors = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g);
        if (colors && colors.length > 0) {
            const mainColor = colors[0].match(/\d+/g);
            const r = parseInt(mainColor[0]);
            const g = parseInt(mainColor[1]);
            const b = parseInt(mainColor[2]);
            return `rgb(${r}, ${g}, ${b})`;
        }
    } else {
        const bgColorFlat = style.getPropertyValue('background-color');
        if (bgColorFlat.startsWith('#')) {
            return bgColorFlat;
        } else if (bgColorFlat.includes('rgb')) {
            const rgbValues = bgColorFlat.match(/\d+/g);
            const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
            const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
            const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        } else if (bgColorFlat.includes('rgba')) {
            const rgbaValues = bgColorFlat.match(/[\d.]+/g);
            const r = parseInt(rgbaValues[0]).toString(16).padStart(2, '0');
            const g = parseInt(rgbaValues[1]).toString(16).padStart(2, '0');
            const b = parseInt(rgbaValues[2]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
    }

    return '#000000'; // Couleur par défaut si aucune correspondance n'est trouvée
}



    function drawRectangleBetweenElements(startElement, endElement, gradientId) {
        const startRect = startElement.getBoundingClientRect();
        const endRect = endElement.getBoundingClientRect();

        const x1 = startRect.left + startRect.width / 2 + window.scrollX;
        const y1 = startRect.top + startRect.height / 2 + window.scrollY;
        const x2 = endRect.left + endRect.width / 2 + window.scrollX;
        const y2 = endRect.top + endRect.height / 2 + window.scrollY;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const width = Math.sqrt(dx * dx + dy * dy);
        const height = 8; // Increased thickness for a better 3D effect

        createRectangle(x1, y1 - height / 2, width, height, angle, gradientId);
    }

    function updateSvgSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
    }

    animateLines();
    window.addEventListener('resize', () => {
        updateSvgSize();
        updateLines();
    });

    function animateLines() {
        requestAnimationFrame(() => {
            updateLines();
            animateLines();
        });
    }
    const toggleTextButton = document.getElementById('toggleText');
    const servicesTextParagraph = document.querySelector('.services-text p');
    
    toggleTextButton.addEventListener('click', function() {
        servicesTextParagraph.classList.toggle('expanded');
        if (servicesTextParagraph.classList.contains('expanded')) {
            toggleTextButton.textContent = 'Voir moins';
        } else {
            toggleTextButton.textContent = 'Voir plus';
        }
    });
    });

