// ui.js - Handles UI interactions like dragging the event menu

let isDragging = false;
let offsetX, offsetY;
let draggableMenu;

function setupUI() {
    // Get the drabble menu
    draggableMenu = document.querySelector('.draggable');

    // load previous postiion
    const savedLeft = localStorage.getItem('menuLeft');
    const savedTop = localStorage.getItem('menuTop');
    if (savedLeft && savedTop) {
        draggableMenu.style.left = savedLeft;
        draggableMenu.style.top = savedTop;
    }

    // Events for dragging
    draggableMenu.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
}

function startDrag(e) {
    if (e.target === draggableMenu || e.target === draggableMenu.querySelector('h3')) {
        isDragging = true;
        offsetX = e.clientX - draggableMenu.offsetLeft;
        offsetY = e.clientY - draggableMenu.offsetTop;
    }
}

function drag(e) {
    if (isDragging) {
        draggableMenu.style.left = `${e.clientX - offsetX}px`;
        draggableMenu.style.top = `${e.clientY - offsetY}px`;
    }
}

function endDrag() {
    isDragging = false;
    // Save last position
    localStorage.setItem('menuLeft', draggableMenu.style.left);
    localStorage.setItem('menuTop', draggableMenu.style.top);
}


