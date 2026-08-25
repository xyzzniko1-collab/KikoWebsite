// ============== TOGGLE INFO & KETENTUAN ==============
function toggleInfo(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        icon.textContent = '▲';
    } else {
        el.classList.add('hidden');
        icon.textContent = '▼';
    }
}
