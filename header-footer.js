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
            adjustIframeHeight();
        }
    });

    window.addEventListener('resize', function() {
        adjustIframeHeight();
    });

    function adjustIframeHeight() {
        const isMenuOpen = menuItems.classList.contains('active');
        const headerHeight = document.querySelector('header').offsetHeight;
        const iframeHeight = isMenuOpen ? headerHeight + menuItems.offsetHeight : headerHeight;
        window.parent.postMessage({ height: iframeHeight }, '*');
    }
});