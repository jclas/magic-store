function createNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-sm navbar-light bg-light';
    nav.innerHTML = `
        <div class="container-fluid">
            <a class="navbar-brand" href="magic-store.html">Magic Store</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="magic-store.html" id="nav-inventory">View Inventory</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="supplier-settings.html" id="nav-settings">Supplier Settings</a>
                    </li>
                </ul>
            </div>
        </div>
    `;
    document.body.insertBefore(nav, document.body.firstChild);
}

function highlightCurrentNav() {
    const path = window.location.pathname.split('/').pop();
    if (path === 'magic-store.html') {
        document.getElementById('nav-inventory')?.classList.add('active');
    } else if (path === 'supplier-settings.html') {
        document.getElementById('nav-settings')?.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createNavbar();
    highlightCurrentNav();
});