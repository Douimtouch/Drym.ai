// header-footer.js

document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menu-icon');
    const menuItems = document.getElementById('menu-items');
    const dropdownItems = document.querySelectorAll('.dropdown');
    const headerIframe = window.parent.document.querySelector('header iframe');

    function toggleMenu() {
        menuItems.classList.toggle('active');
        headerIframe.classList.toggle('expanded');
        
        if (headerIframe.classList.contains('expanded')) {
            headerIframe.style.height = '900px';
        } else {
            headerIframe.style.height = '50px';
        }
    }

    menuIcon.addEventListener('click', function() {
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
        if (!menuIcon.contains(target) && !menuItems.contains(target)) {
            menuItems.classList.remove('active');
            headerIframe.classList.remove('expanded');
            headerIframe.style.height = '50px';
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuItems.classList.remove('active');
            headerIframe.classList.remove('expanded');
            headerIframe.style.height = '50px';
        }
    });
});