function createFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = `<br><br>
        <hr>
        <div class="text-center text-muted small">
            Best viewed by tablet (768px) or larger
        </div>
        <div class="text-muted small">
            JavaScript and Bootstrap Demo<br>
            Author: John Classen<br>
            Created: May 2025<br>
            Last Updated: <span id="file-date"></span><br>
        </div>
    `;
    const main = document.querySelector('main');
    if (main && main.parentNode) {
        main.parentNode.insertBefore(footer, main.nextSibling);
    } else {
        document.body.appendChild(footer);
    }
}


document.addEventListener('DOMContentLoaded', async() => {
    createFooter();
    document.getElementById('file-date').textContent = new Date(document.lastModified).toLocaleDateString();
});
