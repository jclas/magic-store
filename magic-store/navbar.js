function createNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-sm navbar-light bg-light';
    nav.innerHTML = `
        <div class="container-fluid">
            <a class="navbar-brand" href="magic-store.html">Magic Store</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="magic-store.html">View Inventory</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="supplier-settings.html">Settings</a>
                    </li>
                </ul>
            </div>
        </div>
    `;
    document.body.insertBefore(nav, document.body.firstChild);
}

document.addEventListener('DOMContentLoaded', () => {
    createNavbar();
});