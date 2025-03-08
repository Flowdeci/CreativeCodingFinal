// ui.js - Handles UI interactions like dragging the event menu and city stats menu

let currentDraggingMenu = null; // Tracks which menu is being dragged
let offsetX, offsetY;

function setupUI() {
    // Get the draggable menus
    const draggableMenu = document.querySelector('.draggable');
    const cityStatsMenu = document.querySelector('.city-stats-menu');

    // Load previous positions for the event menu
    const savedLeft = localStorage.getItem('menuLeft');
    const savedTop = localStorage.getItem('menuTop');
    if (savedLeft && savedTop) {
        draggableMenu.style.left = savedLeft;
        draggableMenu.style.top = savedTop;
    }

    // Load previous positions for the city stats menu
    const savedStatsLeft = localStorage.getItem('statsMenuLeft');
    const savedStatsTop = localStorage.getItem('statsMenuTop');
    if (savedStatsLeft && savedStatsTop) {
        cityStatsMenu.style.left = savedStatsLeft;
        cityStatsMenu.style.top = savedStatsTop;
    }

    // Add drag events for the event menu
    draggableMenu.addEventListener('mousedown', (e) => startDrag(e, draggableMenu));
    document.addEventListener('mousemove', (e) => drag(e));
    document.addEventListener('mouseup', () => endDrag(draggableMenu, 'menuLeft', 'menuTop'));

    // Add drag events for the city stats menu
    cityStatsMenu.addEventListener('mousedown', (e) => startDrag(e, cityStatsMenu));
    document.addEventListener('mousemove', (e) => drag(e));
    document.addEventListener('mouseup', () => endDrag(cityStatsMenu, 'statsMenuLeft', 'statsMenuTop'));
}

function startDrag(e, menu) {
    if (e.target === menu || e.target === menu.querySelector('h3')) {
        currentDraggingMenu = menu; // Set the currently dragged menu
        offsetX = e.clientX - menu.offsetLeft;
        offsetY = e.clientY - menu.offsetTop;
    }
}

function drag(e) {
    if (currentDraggingMenu) {
        currentDraggingMenu.style.left = `${e.clientX - offsetX}px`;
        currentDraggingMenu.style.top = `${e.clientY - offsetY}px`;
    }
}

function endDrag(menu, localStorageKeyLeft, localStorageKeyTop) {
    if (currentDraggingMenu === menu) {
        currentDraggingMenu = null; // Stop dragging
        // Save the last position of the menu
        localStorage.setItem(localStorageKeyLeft, menu.style.left);
        localStorage.setItem(localStorageKeyTop, menu.style.top);
    }
}