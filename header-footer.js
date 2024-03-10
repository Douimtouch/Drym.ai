// header-footer.js

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const menuItems = document.getElementById('menu');
    const dropdownItems = document.querySelectorAll('.dropdown');

    function toggleMenu() {
        menuItems.classList.toggle('active');
        adjustIframeHeight();
    }

    menuToggle.addEventListener('click', function() {
        toggleMenu();
    });

    dropdownItems.forEach(function(item) {
        item.addEventListener('click', function(event) {
            event.stopPropagation();
            this.classList.toggle('active');
        });
    });

    document.addEventListener('click', function(event) {
        const target = event.target;
        if (!menuToggle.contains(target) && !menuItems.contains(target)) {
            menuItems.classList.remove('active');
        }
    });

    function adjustIframeHeight() {
        const isMenuOpen = menuItems.classList.contains('active');
        const headerHeight = document.querySelector('header').offsetHeight;
        const menuHeight = menuItems.offsetHeight;
        const iframeHeight = isMenuOpen ? menuHeight : headerHeight;
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