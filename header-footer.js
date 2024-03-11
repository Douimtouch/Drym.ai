// header-footer.js

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const menuItems = document.getElementById('menu');
    const dropdownItems = document.querySelectorAll('.dropdown');
    const threshold = 180; // Seuil de taille en pixels

    function toggleMenu() {
        menuItems.classList.toggle('active');
        adjustIframeHeight();
    }

    menuToggle.addEventListener('click', function() {
        toggleMenu();
    });

    dropdownItems.forEach(function(item) {
        if (item) {
            item.addEventListener('click', function(event) {
                event.stopPropagation();
                this.classList.toggle('active');
                adjustIframeHeight();
            });
        }
    });

    document.addEventListener('click', function(event) {
        const target = event.target;
        if (!menuToggle.contains(target) && !menuItems.contains(target)) {
            const iframeHeight = window.parent.document.querySelector('header iframe').offsetHeight;
            const headerHeight = document.querySelector('header').offsetHeight;
            const menuHeight = menuItems.offsetHeight;
            
            if (iframeHeight === headerHeight || iframeHeight === menuHeight) {
                menuItems.classList.remove('active');
            }
        }
    });

    function adjustIframeHeight() {
        const headerHeight = document.querySelector('header').offsetHeight;
        const menuHeight = menuItems.offsetHeight;
        let iframeHeight;

        if (menuHeight > threshold) {
            iframeHeight = menuHeight;
        } else {
            iframeHeight = 63;
        }

        window.parent.postMessage({ height: iframeHeight }, '*');
    }

    menuItems.addEventListener('transitionend', function() {
        adjustIframeHeight();
    });

    // Fermer le menu lors du chargement de la page ou d'un retour en arrière
    window.addEventListener('pageshow', function(event) {
        const menuCheckbox = document.getElementById('menuCheckbox');
        if (menuCheckbox.checked) {
            menuCheckbox.checked = false;
            menuItems.classList.remove('active');
            adjustIframeHeight();
        }
    });
}); 