// ToDo: Apply user-entered item category %s to random picks.
// ToDo: finish getVariantName(name).
//       "Enspelled" should be fun: use scroll likability; filter by school(s) based on armor, weapon, or staff.
// ToDo: Finish adding the rest of TCE magic items.
//
// ToDo: ? Create an magicitemsDailyExpectedSales array, which gets plugged into the bellCurveRandomInt. 
//       Perhaps some predefined "templates" (expected sales change by category) the user can choose from depending on the type of store it is.
//ToDo: possible scroll upgrades: 1) scroll creators attack/DC beyond scroll default, 2) upcasted level, example: fireball(4)
//ToDo: derived scroll properties with small random chance for upgrade: scrollLevel, attackBonus, dc

const sourceAbbreviationKey = {
    PHB: "Player's Handbook (2024)",
    PHB2014: "Player's Handbook (2014)",
    DMG: "Dungeon Master's Guide (2024)",
    DMG2014: "Dungeon Master's Guide (2014)",
    XGE: "Xanathar's Guide to Everything",
    TCE: "Tasha's Cauldron of Everything",
};
const allowedRaritiesConsumables = ["common", "uncommon", "rare", "very rare"];
const allowedRaritiesNonConsumables = ["common", "uncommon", "rare"];
const basePrices = {
    common: 100,
    uncommon: 400,
    rare: 4000,
    "very rare": 40_000,
    legendary: 200_000,  //we shouldn't include these in the store
    artifact: 2_000_000  //made up price, we shouldn't include these in the store
};
//Level:                  0   1   2    3    4     5     6      7      8      9
const scrollBasePrices = [30, 50, 200, 300, 2000, 3000, 20000, 25000, 30000, 100000]; //RAW 2024
//const scrollBasePrices = [30, 50, 100, 200, 1000, 2000, 10000, 15000, 20000, 100000]; //custom

const magicStore = {

    inventory: [],
    pendingInventory: [], //temp inventory until save

    magicItems: [],    //all magic items
    scrolls: [],       //all scrolls
    tattoos: [],       //all tattoos
    allItems: [],      //all

    spells: [],        //all spells -- reference only

    async initialize() {
        this.setupEventListeners();
        this.spells = await this.loadSpellsFile();
        const allMagicItems = await this.loadMagicItemsFile();
        const allScrolls = await this.loadScrollsFile();

        //*****  filter out rarities
        // Only include items with allowed rarities - different for consumables vs non-consumables
        this.magicItems = allMagicItems.filter(item => item.rarity && (
            (allowedRaritiesConsumables.includes(item.rarity.toLowerCase()) && this.isConsumable(item))
            || (allowedRaritiesNonConsumables.includes(item.rarity.toLowerCase()) && !this.isConsumable(item))

        ));
        this. magicItems.forEach(item => {
            item.price = this.calculateMagicItemBasePrice(item);
            item.rarityScore = this.calcRarityScore(item);
            // console.log(item.name, item.price, item.rarityScore);
        });

        // Only include scrolls with allowed rarities
        this.scrolls = allScrolls.filter(item =>
            item.rarity && allowedRaritiesConsumables.includes(item.rarity.toLowerCase())
        );

        this.scrolls.forEach(item => {
            item.price = this.calcSpecificScrollPrice(item);
            item.rarityScore = this.calcRarityScore(item);
            // console.log(item.name, item.price, item.rarityScore);
        });

        // Copy scrolls to tattoos, then filter to only those with spell level <= 5
        this.tattoos = structuredClone(this.scrolls)
            .filter(tattoo => this.getSpell(tattoo.name).level <= 5)
            .map(item => {
                // Create a new tattoo object based on the scroll
                const tattoo = { ...item };
                tattoo.name = tattoo.name.replace(/Scroll:/gi, "Spellwrought Tattoo:");
                tattoo.category = "tattoo";
                tattoo.price = this.calcSpecificTattooPrice(item);
                tattoo.rarityScore = this.calcRarityScore(item);
                
                return tattoo;
            });

        // Combine all items into one array after loading
        this.allItems = [
            ...this.magicItems,
            ...this.scrolls,
            ...this.tattoos
        ];
        console.log('allItems.length: ' + this.allItems.length);

        // console.log('this.allItems...');
        // console.log(this.allItems);
        // console.log('this.tattoos...');
        // console.log(this.tattoos);
    },

    setupEventListeners() {
        // document.getElementById('inventoryFileInput').addEventListener('change', async function (event) {
        document.getElementById('inventoryFileInput').addEventListener('change', async (event) => {
            const label = document.getElementById('inventoryFileLabel');
            if (event.currentTarget.files.length > 0) {
                label.textContent = event.currentTarget.files[0].name;
            } else {
                //label.textContent = "Load Inventory File 🪄";
                return;
            }

            this.inventory = await magicStore.loadInventoryFile(event);
            magicStore.updateInventoryDisplay();
        });

        document.getElementById('btnTodaysUpdates').addEventListener('click', () => magicStore.showUpdatesPopup()); 
        document.getElementById('btnSaveTodaysUpdates').addEventListener('click',() => magicStore.saveTodaysUpdates());
        document.getElementById('closePopup').addEventListener('click', () => {
            document.getElementById('updatePopup').style.display = 'none';
        });
        document.querySelectorAll('#updatePopup #categories input').forEach(input => {
            input.addEventListener('input', () => this.updatePopupPercentTotal());
        });
    },

    /**
     * Note: only loading common, uncommon, rare, very rare. No Legendary or Artifacts.
     */
    loadMagicItemsFile: async function () {
        try {
            const response = await fetch('magic-items.json');
            const allMagicItems = await response.json();

            return allMagicItems;
        } catch (e) {
            console.error(e);
        }
    },

    loadSpellsFile: async function () {
        try {
            const response = await fetch('spells-phb2024-xge-tce.json');
            const spells = await response.json();
            
            // console.log('Loaded spells:', spells.length);

            return spells;
        } catch (e) {
            console.error('Failed to load spells:', e);
        }
    },

    loadScrollsFile: async function () {
        try {
            const response = await fetch('spell-scrolls.json');
            const allScrolls = await response.json();

            return allScrolls;
        } catch (e) {
            console.error('Failed to load scrolls:', e);
        }
    },

    loadInventoryFile: async function (event) {

        let results = new Promise((resolve, reject) => {
            const file = event.target.files[0];
            if (!file) {
                resolve([]);
                return;
            } 
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const loadedInventory = JSON.parse(e.target.result);
                    resolve(loadedInventory);
                } catch {
                    alert('Invalid JSON file.');
                    resolve([]);
                }
            };
            reader.readAsText(file); //let the reading begin!
        });

        return results;
    },

    updateInventoryDisplay: function () {
        let main = document.querySelector('main');
        let table = document.getElementById('inventoryTable');
        if (table) table.remove();

        table = document.createElement('table');
        table.id = 'inventoryTable';
        table.className = 'table table-striped mt-3';
        table.innerHTML = `
            <thead>
            <tr>
                <th style="cursor:pointer;" onclick="magicStore.sortInventoryTable(0)">Item</th>
                <th class="text-end" style="width:100px; cursor:pointer" onclick="magicStore.sortInventoryTable(1)">Price (gp)</th>
                <th style="width:110px; cursor:pointer" onclick="magicStore.sortInventoryTable(2)">Rarity</th>
                <th class="text-end" style="width:130px; cursor:pointer" onclick="magicStore.sortInventoryTable(3)">Rarity Score</th>
                <th class="text-end" style="width:100px; cursor:pointer" onclick="magicStore.sortInventoryTable(4)">Quantity</th>
            </tr>
            </thead>
            <tbody>
                ${this.inventory.length === 0 ? `
                    <tr>
                        <td colspan="5" class="text-center">No inventory loaded.</td>
                    </tr>
                ` : this.inventory.map(item => `
                    <tr>
                        <td title="${item.name}">${item.name}</td>
                        <td class="text-end">${item.price}</td>
                        <td>${item.rarity}</td>
                        <td class="text-end">${item.rarityScore.toFixed(6)}</td>
                        <td class="text-end">${item.quantity}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        main.appendChild(table);
    },

    sortInventoryTable: function(colIndex) {
        const table = document.getElementById('inventoryTable');
        const tbody = table.tBodies[0];
        const rows = Array.from(tbody.rows).filter(row => !row.classList.contains('no-sort'));
        // Toggle sort direction
        const isAsc = table.getAttribute('data-sort-col') == colIndex && table.getAttribute('data-sort-dir') == 'asc';

        rows.sort((a, b) => {
            let aText = a.cells[colIndex].textContent.trim();
            let bText = b.cells[colIndex].textContent.trim();
            // Try to compare as numbers if possible
            let aNum = parseFloat(aText.replace(/[^0-9.\-]+/g,""));
            let bNum = parseFloat(bText.replace(/[^0-9.\-]+/g,""));
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAsc ? aNum - bNum : bNum - aNum;
            }
            return isAsc ? aText.localeCompare(bText) : bText.localeCompare(aText);
        });
        rows.forEach(row => tbody.appendChild(row));
        table.setAttribute('data-sort-col', colIndex);
        table.setAttribute('data-sort-dir', isAsc ? 'desc' : 'asc');
    },

    showUpdatesPopup: function () {

        // pendingInventory = JSON.parse(JSON.stringify(this.inventory)); //make a copy

        const boxExpandMe = document.getElementById('boxExpandMe');
        const boxCollapseMe = document.getElementById('boxCollapseMe');

        // Clear the updates table each time popup is shown
        document.getElementById('todaysUpdatesTable').innerHTML = '';
        boxExpandMe.style.display = 'none'; //hide expand button
        document.getElementById('btnSaveTodaysUpdates').style.display = 'none'; //hide save button

        const fields = document.getElementById('inventoryUpdateFields');

        fields.style.display =  '';  //show
        boxExpandMe.classList.add('d-none');  //hide
        boxExpandMe.classList.remove('d-flex');


        boxExpandMe.addEventListener('click', function() {
            fields.style.display =  ''; //show
            boxExpandMe.classList.add('d-none');  //hide
            boxExpandMe.classList.remove('d-flex');
        });
        boxCollapseMe.addEventListener('click', function() {
            fields.style.display = 'none'; //hide
            boxExpandMe.classList.add('d-flex');  //show
            boxExpandMe.classList.remove('d-none');
        });

        this.updatePopupPercentTotal();

        document.getElementById('btnGenerateUpdates').onclick = () => {
            // Collapse the fields between the title and the generate button
            fields.style.display = 'none'; //hide
            boxExpandMe.classList.add('d-flex');  //show
            boxExpandMe.classList.remove('d-none');


            const todaysUpdates = this.generateTodaysUpdates();
            this.displayTodaysUpdates(todaysUpdates);

            document.getElementById('boxExpandMe').style.display = '';
            document.getElementById('btnSaveTodaysUpdates').style.display = ''; //show save button
        };

        document.getElementById('updatePopup').style.display = 'block';
    },

    generateTodaysUpdates: function () {
        const arrivalsCount = parseInt(document.getElementById('arrivalsInput').value) || 0;
        const salesCount = parseInt(document.getElementById('salesInput').value) || 0;
        const categoryPercentages = [];
        let todaysUpdates = [];

        pendingInventory = structuredClone(this.inventory); //make a copy

        document.querySelectorAll('#updatePopup #categories input').forEach(input => {
            categoryPercentages.push(Number((Number(input.value) /100).toFixed(6)) || 0);
        });
        

        //*****************************************************
        //*****  Customer bought
        //*****************************************************
        let salesMade = 0;
        let attempts = 0;
        const maxAttempts = salesCount * 10;

        if (pendingInventory.length > 0) {
            const rarityScores = structuredClone(pendingInventory).map(item => item.rarityScore);

            while (salesMade < salesCount && attempts < maxAttempts) {
                const idx = getWeightedRandomIndex(rarityScores);

                if (idx && pendingInventory[idx] && pendingInventory[idx].quantity > 0) {
                    pendingInventory[idx].quantity--;
                    
                    insertObjectAlphabetically(todaysUpdates, {
                        // action: 'Customer bought',
                        action: 'Sold (-1)',
                        change: -1,
                        ...pendingInventory[idx]
                    });

                    salesMade++;
                }
                attempts++;
            }
        }


        //****************************************************************** */
        // ToDo:
        //  - separate weighted/random item searches into categories searches
        //  - refactor to do (arrivalsCount/categoryPercentages[x]) number of picks in each category
        //  - ? Come up with an incoming number of items.  For now, it's manually set by user (later we offer randomish)
        //****************************************************************** */


        //*****************************************************
        //*****  Supplier delivered
        //*****************************************************
        console.log("categoryPercentages: " + categoryPercentages.toString());

        let categoryItems = []; //ToDo: move this to globals
        categoryItems.push(this.allItems.filter(item => item.category == 'scroll'));
        categoryItems.push(this.allItems.filter(item => item.category == 'potion'));
        categoryItems.push(this.allItems.filter(item => item.category == 'ring'));
        categoryItems.push(this.allItems.filter(item => ['rod','staff','wand'].includes(item.category)));
        categoryItems.push(this.allItems.filter(item => item.category == 'wondrous item'));
        categoryItems.push(this.allItems.filter(item => item.category == 'armor'));
        categoryItems.push(this.allItems.filter(item => item.category == 'weapon'));
        categoryItems.push(this.allItems.filter(item => item.category == 'tattoo'));

        let categoryRarityScores = []; //An array of item rarityScores for each category
        categoryRarityScores.push(structuredClone(categoryItems[0].map(item => item.rarityScore)));
        categoryRarityScores.push(structuredClone(categoryItems[1].map(item => item.rarityScore)));
        categoryRarityScores.push(structuredClone(categoryItems[2].map(item => item.rarityScore)));
        categoryRarityScores.push(structuredClone(categoryItems[3].map(item => item.rarityScore)));
        categoryRarityScores.push(structuredClone(categoryItems[4].map(item => item.rarityScore)));
        categoryRarityScores.push(structuredClone(categoryItems[5].map(item => item.rarityScore)));
        categoryRarityScores.push(structuredClone(categoryItems[6].map(item => item.rarityScore)));
        categoryRarityScores.push(structuredClone(categoryItems[7].map(item => item.rarityScore)));

        for (let i = 0; i < arrivalsCount; i++) {
            if (categoryItems.length === 0) continue;
            
            let randomCategoryIndex = getWeightedRandomIndex(categoryPercentages);  //pick category

            if (categoryItems[randomCategoryIndex].length === 0) continue;

            let itemsIndex = getWeightedRandomIndex(categoryRarityScores[randomCategoryIndex]);

            let magicItem = structuredClone(categoryItems[randomCategoryIndex][itemsIndex]); //makes a copy (doesn't reference)
            magicItem.name = this.getVariantName(magicItem.name) || magicItem.name;

            let inventoryIndex = pendingInventory.findIndex(item => item.name === magicItem.name);

            if (inventoryIndex === -1) {
                insertObjectAlphabetically(pendingInventory, {
                    ...magicItem,
                    quantity: 1,
                });

            } else {
                //already exists in inventory, so add 1 to it.
                pendingInventory[inventoryIndex].quantity++;
            }

            //array for visual log
            todaysUpdates.push({
                //action: 'Supplier delivered',
                action: 'Supplied (+1)',
                change: +1,
                ...magicItem
            });
        }

        // Sort todaysUpdates by action, then by category, then by name
        todaysUpdates.sort((a, b) => {
            // Sort by action first
            if (a.action !== b.action) {
                return a.action.localeCompare(b.action);
            }
            // // Then by category
            // if (a.category !== b.category) {
            //     return a.category.localeCompare(b.category);
            // }
            // Then by name
            return a.name.localeCompare(b.name);
        });

        return todaysUpdates;
    },

    /**
     * Returns the category percentage, given a category name
     * @param {*} categoryName 
     * @param {*} categoryPercentages 
     * @returns 
     */
    getCategoryPercentage(categoryName, categoryPercentages) {
        // The order of categoryPercentages must match this order:
        // [Scrolls, Potions, Rings, Rod/Staff/Wands, Wondrous Items, Armor, Weapons, Tattoos]
        // We'll match by normalized category name.
        const norm = (categoryName || '').toLowerCase().trim();

        if (norm === "scroll") return categoryPercentages[0] || 0;
        if (norm === "potion") return categoryPercentages[1] || 0;
        if (norm === "ring") return categoryPercentages[2] || 0;
        // For rod, staff, or wand, match any of those
        if (norm === "rod" || norm === "staff" || norm === "wand") return categoryPercentages[3] || 0;
        if (norm === "wondrous item") return categoryPercentages[4] || 0;
        if (norm === "armor") return categoryPercentages[5] || 0;
        if (norm === "weapon") return categoryPercentages[6] || 0;
        if (norm === "tattoo") return categoryPercentages[7] || 0;

        return 0;
    },

    displayTodaysUpdates: function (todaysUpdates) {

        document.getElementById('todaysUpdatesTable').innerHTML =
            `
            <div style="display: flex; flex-direction: row;">
                <!-- Table column -->
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <div id="updatesTableContainer">
                        <table id='updatesTable' class="table table-bordered">
                            <thead>
                                <tr>
                                <th style="cursor:pointer" onclick="magicStore.sortUpdatesTable(0)">Action</th>
                                <th style="cursor:pointer" onclick="magicStore.sortUpdatesTable(1)">Category</th>
                                <th style="cursor:pointer" onclick="magicStore.sortUpdatesTable(2)">Item</th>
                                <th style="cursor:pointer" onclick="magicStore.sortUpdatesTable(3)">Price</th>
                                <th style="cursor:pointer" onclick="magicStore.sortUpdatesTable(4)">Rarity</th>
                                <th style="cursor:pointer" onclick="magicStore.sortUpdatesTable(5)">Rarity Score</th>
                                <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${todaysUpdates.map((u, idx) => `
                                    <tr data-update-idx="${idx}">
                                        <td>${u.action}</td>
                                        <!--td>${u.change > 0 ? '+' : ''}${u.change}</td-->
                                        <td>${u.category}</td>
                                        <td>${stripItemNamePrefix(u.name)}</td>
                                        <td>${u.price}</td>
                                        <td>${u.rarity}</td>
                                        <td>${u.rarityScore}</td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm btn-delete-update" title="Delete this update">&times;</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- Button column -->
                <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; margin-left: 8px;">
                    <button id="scrollDownUpdatesTable" class="btn btn-primary btn-sm" title="Scroll to bottom" style="margin-bottom: 8px;">
                        <span style="font-size: 1.2em;">&#8595;</span>
                    </button>
                    <div style="flex:1"></div>
                    <button id="scrollUpUpdatesTable" class="btn btn-primary btn-sm mb-3" title="Scroll to top" style="margin-top: 8px;">
                        <span style="font-size: 1.2em;">&#8593;</span>
                    </button>
                </div>
            </div>
        `;

        // Add delete event listeners
        document.querySelectorAll('.btn-delete-update').forEach(btn => {
            btn.addEventListener('click', function () {
                const row = this.closest('tr');
                const idx = parseInt(row.getAttribute('data-update-idx'), 10);

                // Remove from todaysUpdates
                todaysUpdates.splice(idx, 1);

                // Remove from pendingInventory if it's a supplier delivery
                const update = row.querySelector('td').textContent === 'Supplier delivered';
                if (update) {
                    // Find and remove from pendingInventory by name
                    const name = row.querySelectorAll('td')[2].textContent;
                    const invIdx = pendingInventory.findIndex(item => item.name === name);
                    if (invIdx !== -1) {
                        pendingInventory.splice(invIdx, 1);
                    }
                }

                // Re-render the updates table
                magicStore.displayTodaysUpdates(todaysUpdates);
            });
        });

        // Scroll up/down buttons
        setTimeout(() => {
            const scrollDownBtn = document.getElementById('scrollDownUpdatesTable');
            const scrollUpBtn = document.getElementById('scrollUpUpdatesTable');
            // Find the popup container that actually scrolls
            let popup = document.getElementById('updatePopup');
            // If updatePopup doesn't scroll, try its first child with overflow
            if (popup) {
                // If the popup itself doesn't scroll, try to find a scrollable child
                if (popup.scrollHeight <= popup.clientHeight) {
                    // Try to find a scrollable child
                    const scrollable = Array.from(popup.querySelectorAll('*')).find(
                        el => el.scrollHeight > el.clientHeight
                    );
                    if (scrollable) popup = scrollable;
                }
            }
            if (scrollDownBtn && popup) {
                scrollDownBtn.onclick = () => {
                    popup.scrollTop = popup.scrollHeight;
                };
            }
            if (scrollUpBtn && popup) {
                scrollUpBtn.onclick = () => {
                    popup.scrollTop = 0;
                };
            }
        }, 0);
    },

    sortUpdatesTable(colIndex) {
        const table = document.getElementById('updatesTable');
        if (!table) return;
        const tbody = table.tBodies[0];
        const rows = Array.from(tbody.rows);
        const isAsc = table.getAttribute('data-sort-col') == colIndex && table.getAttribute('data-sort-dir') == 'asc';

        rows.sort((a, b) => {
            // Helper to get cell text
            const getCell = (row, idx) => row.cells[idx]?.textContent.trim() || "";

            // Special handling for Rarity column (colIndex 4)
            if (colIndex === 4) {
                const rarityOrder = { "common": 1, "uncommon": 2, "rare": 3, "very rare": 4, "legendary": 5, "artifact": 6 };
                let aVal = rarityOrder[getCell(a, 4).toLowerCase()] || 99;
                let bVal = rarityOrder[getCell(b, 4).toLowerCase()] || 99;
                return isAsc ? aVal - bVal : bVal - aVal;
            }

            // If sorting by Action (col 0), do secondary sort on Item (col 1), tertiary on Category (col 2)
            if (colIndex === 0) {
                let cmp = isAsc
                    ? getCell(a, 0).localeCompare(getCell(b, 0))
                    : getCell(b, 0).localeCompare(getCell(a, 0));
                if (cmp !== 0) return cmp;

                cmp = isAsc
                    ? getCell(a, 1).localeCompare(getCell(b, 1))
                    : getCell(b, 1).localeCompare(getCell(a, 1));
                if (cmp !== 0) return cmp;

                return isAsc
                    ? getCell(a, 2).localeCompare(getCell(b, 2))
                    : getCell(b, 2).localeCompare(getCell(a, 2));
            }

            // If sorting by Category (col 2), do secondary sort on Item (col 1)
            if (colIndex === 2) {
                let cmp = isAsc
                    ? getCell(a, 2).localeCompare(getCell(b, 2))
                    : getCell(b, 2).localeCompare(getCell(a, 2));
                if (cmp !== 0) return cmp;

                return isAsc
                    ? getCell(a, 1).localeCompare(getCell(b, 1))
                    : getCell(b, 1).localeCompare(getCell(a, 1));
            }

            // For Price, Rarity Score, etc., try numeric sort
            if (colIndex === 3 || colIndex === 5) {
                let aNum = parseFloat(getCell(a, colIndex).replace(/[^0-9.\-]+/g,""));
                let bNum = parseFloat(getCell(b, colIndex).replace(/[^0-9.\-]+/g,""));
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return isAsc ? aNum - bNum : bNum - aNum;
                }
            }

            // Default: simple text sort
            return isAsc
                ? getCell(a, colIndex).localeCompare(getCell(b, colIndex))
                : getCell(b, colIndex).localeCompare(getCell(a, colIndex));
        });

        rows.forEach(row => tbody.appendChild(row));
        table.setAttribute('data-sort-col', colIndex);
        table.setAttribute('data-sort-dir', isAsc ? 'desc' : 'asc');
    },

    saveTodaysUpdates: function () {
        this.inventory = structuredClone(pendingInventory.filter(item => item.quantity > 0));
        const fileName = "magic-store-inventory.json";
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.inventory, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", fileName);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();

        document.getElementById('updatePopup').style.display = 'none';

        document.getElementById('inventoryFileLabel').textContent = "Load Inventory File 🪄";
        this.updateInventoryDisplay();
    },

    updatePopupPercentTotal() {

        const percentInputs = document.querySelectorAll('#updatePopup #categories input');
        const totalMsg = document.getElementById('totalPercentMessage');
        let total = Array.from(percentInputs).reduce((sum, input) => sum + (Number(input.value) || 0), 0);
        // total = ((total * 10) + (total * 10)) / 2 / 10;
        totalMsg.textContent = `Total: ${total.toFixed(2)}%`;

        if (total !== 100) {
            totalMsg.classList.remove('text-muted');
            totalMsg.classList.add('text-danger');
        } else {
            totalMsg.classList.remove('text-danger');
            totalMsg.classList.add('text-muted');
        }
    },

    // --- Utility methods that are specific to this app ---

    /**
     * @param {*} spellName Can be a spell name, scroll name, or tattoo name
     * @returns A spell object
     */
    getSpell: function (spellName) {
        if (!spellName || typeof spellName !== "string") return null;
        // Normalize for best match (case-insensitive, trims, ignores trailing (level))

        return this.spells.find(
            // s => s.name.replace(/\s*\(\d+\)$/, '').trim().toLowerCase() === normalizeSpellName(spellName)
            s => s.name.trim().toLowerCase() === normalizeSpellName(spellName)
        ) || null;
    },

    /**
     * A score based on price, likability, major/minor, potion/scroll/other.
     * The smaller the number, the rarer it is.
     * Items get increasees if they are easier to make like potions of healing and scrolls.
     * Major items get a decrease because of the difficulty in creating, especially with hard-to-get ingredients.
     * @param {*} item 
     * @returns 
     */
    calcRarityScore(item) {

        let rareFactor1 = this.calculateMagicItemBasePrice(item);
        // if (item.rarity.toLowerCase() == "common" && !item.name.toLowerCase().startsWith("potion of healing")) rareFactor1 *= 5; //not more copious. most common junk is not as high in demand as the price would normally dictate.
        if (item.rarity.toLowerCase() == "common"
            && !item.name.toLowerCase().startsWith("potion of healing")
            && item.category.toLowerCase() != "scroll"
        ) {
            rareFactor1 *= 3; //more rare. most common junk is not as high in demand as the price would normally dictate.
        }

        // let rarityScore = 100000 / this.calculateMagicItemBasePrice(item)**1.3 * item.likability;
        let rarityScore = 100000 / rareFactor1**1.3 * item.likability;

        //scrolls are even easier to make than other consumables so lets bump them up again
         if (item.category.toLowerCase() == "scroll")  {
             const spell = this.getSpell(item.name);
             if (spell && spell.componentConsumptionExpense) {
                rarityScore *= 1.5; //scroll bump: spells that consume comps.
             } else {
                rarityScore *= 2;    //bigger scroll bump: only need your regular (non-consumed) spell comps.
             }
         }
        //potions of healing are way eaier to make than other items in their category
        //  and more crafters can make these.
         if (item.name.toLowerCase().startsWith("potion of healing")) {
             rarityScore *= 4;  //big bump. more of these than "healing" scrolls
         }

        //way harder to make if a "major"
        if ('magicType' in item) {
            if (item.magicType.toLowerCase() == 'major') {
                rarityScore /= 2;
            }
        }

        if (item.rarity.toLowerCase() == "common" && !item.name.toLowerCase().startsWith("potion of healing")) {
                rarityScore /= 4; //demand is not that great for most of these items
        }

        return Number(rarityScore.toFixed(6));
    },

    calculateMagicItemBasePrice: function (item) {
        let rarity = (item.rarity || "unknown").toLowerCase();
        let price = basePrices[rarity] || basePrices.legendary;

        if (this.isConsumable(item)) {
            price = price / 2;
        }

        return Math.round(price);
    },

    /**
     * @param {object} scrollObject Use a scroll (or tattoo) from the spell scrolls file
     */
    calcSpecificScrollPrice(scrollObject) {

        const spell = this.getSpell(scrollObject.name);
        let price = scrollBasePrices[spell.level];
        price += this.getAddedConsumedComponentCost(scrollObject.name) || 0;

        return price;
    },

    /**
     * Idk, I give up on tattoos. They are too crazy/broken.
     * I'm just going to make them same as scrolls for now.
     * @param {*} tattoo 
     * @returns number
     */
    calcSpecificTattooPrice(tattoo) {
        let price = this.calcSpecificScrollPrice(tattoo);
        price *= 2; //In my opinion, tattoo prices should be more than a scroll, so use double.

        return price;
    },

    /**
     * Scrolls that have and extra component expense to craft
     * @param {string} scrollName 
     * @returns number
     */
    getAddedConsumedComponentCost: function (scrollName) {

        const spell = this.getSpell(scrollName);
        let expense = 0;

        try {
            if (spell) {
                expense = Number(spell.componentConsumptionExpense || 0);
            }
        } catch (e) {
            console.error(e);
        }

        return expense;
    },

    /**
     * ToDo: should probably move this hard-coded local consumables array to somewhere more global.
     * @param {*} item Can be an item or a name of an item. If an item, then it has to have the name property.
     * @returns 
     */
    isConsumable(item) {

        const consumables = [
            "Ammunition", "Arrow of ", "Bag of Beans", "Bead of ", "Bolt of ", "Bullet of ",
            "Chime of Opening", "Dust of ", "Elemental Gem", "Elixir", "Feather Token",
            "Marvelous Pigments", "Ointment", "Oil of ", "Philter of ", "Potion",
            "Robe of Useful Items", "Scroll of ", "Sovereign Glue", "Tattoo", "Universal Solvent", "powder"
        ];

        let lowerName;

        if (typeof item === "string") {
            lowerName = item.toLowerCase();
        } else {
            //hopefully proper item object
            lowerName = item.name.toLowerCase();
        }

        let isConsumable = consumables.some(keyphrase => lowerName.includes(keyphrase.toLowerCase()))
            || item.category.toLowerCase() == "potion"
            || item.category.toLowerCase() == "scroll"
            || item.category.toLowerCase() == "tattoo";

        return isConsumable;
    },

    //ToDo: finish this
    getVariantName(name) {

        let newName = name.toLowerCase();
        
        if (newName == "adamantine armor") {
            return newName + " (" + this.getRandomArmorType() + ")";
        }
        
        if (newName == "adamantine weapon") {
            if (getWeightedRandomIndex([1, 7])) {
                return newName += " (" + this.getRandomAdamantineWeaponType() + ")";   //index 1+
            }

            return newName.replace("weapon", "Ammunition (") + this.getRandomAmmoType() + ")"; //index 0
        }

        if (newName.startsWith("ammunition +")) {
            return newName + " (" + this.getRandomAmmoType() + ")";
        }

        if (newName == "ammunition of slaying") {
            return this.getRandomAmmoType() + " of " + this.getRandomCreatureType() + " slaying";
        }

        if (newName.startsWith("armor +")) {
            return newName + " (" + this.getRandomArmorType() + ")";
        }
        
        if (newName.startsWith("armor of gleaming")) {
            return newName + " (" + this.getRandomArmorType() + ")";
        }
        
        if (newName.startsWith("armor of resistance")) {
            return newName + " (" + this.getRandomArmorType() + ")";
        }

        if (newName == "cast-off armor") {
            return newName + " (" + this.getRandomArmorType() + ")";
        }

        //ToDo: get fancy and pick a spell(?)
        if (newName.startsWith("enspelled armor")) {
            return newName += " (" + this.getRandomArmorType() + ")";
        }

        //ToDo: get fancy and pick a spell(?)
        if (newName.startsWith("enspelled staff")) {
            return newName;   //todo
        }

        //ToDo: get fancy and pick a spell(?)
        if (newName.startsWith("enspelled weapon")) {
            return newName += " (" + this.getRandomWeaponType() + ")";
        }

        if (newName == "flame tongue") {
            return newName += " (" + this.getRandomWeaponType(true, false) + ")"; 
        }

        if (newName == "frost brand") {
            const weapons = ["Glaive", "Greatsword", "Longsword", "Rapier", "Scimitar", "Shortsword"];
            const weapon = weapons[getWeightedRandomIndex([1,1,1,1,1,1])];
            return newName += " (" + weapon + ")";
        }

        if (newName == "giant slayer") {
            return newName += " (" + this.getRandomWeaponType() + ")";
        }

        if (newName == "holy avenger") {
            return newName += " (" + this.getRandomWeaponType() + ")";
        }

        if (newName == "luck blade") {
            const weapons = ["Glaive", "Greatsword", "Longsword", "Rapier", "Scimitar", "Sickle", "Shortsword"];
            const weapon = weapons[getWeightedRandomIndex([1,1,1,1,1,1,1])];
            return newName += " (" + weapon + ")";
        }

        if (newName == "mariner's armor") {
            return newName + " (" + this.getRandomArmorType() + ")";
        }
        
        if (newName == "mithril armor") {

            //todo:

        }

        return false;
    },

    getRandomAmmoType() {

        const types = ["Arrow", "Bolt", "Bullet (Firearm)", "Bullet (Sling)", "Needle"]
        const weightedArray = [.35, .35, .3, .17, .10]; //This is somewhat arbitrary. Do what you want.
        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    getRandomArmorType() {

        const types = ["Padded Armor", "Leather Armor", "Studded Leather Armor", "Hide Armor", "Chain Shirt", "Scale Mail", "Breastplate", "Half Plate Armor", "Ring Mail", "Chain Mail", "Splint Armor", "Plate Armor"];
        const weightedArray = [1, 1, 3, 1, 3, 1, 3, 3, 1, 3, 1, 3]; //This is somewhat arbitrary. Do what you want.
        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    getRandomAdamantineWeaponType() {
        
        const types = [
            "Club", "Dagger", "Greatclub", "Handaxe", "Javelin", "Light Hammer", "Mace", "Quarterstaff", "Sickle", "Spear",
            "Dart",
            "Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword", "Halberd", "Lance", "Longsword", "Maul",
            "Morningstar", "Pike", "Rapier", "Scimitar", "Shortsword", "Trident", "Warhammer", "War Pick",
        ];
        const weightedArray = [1, 3, 2, 3, 3, 3, 3, 3, 2, 3,   2,   3, 3, 3, 3, 3, 3, 3, 3, 3,   3, 3, 3, 3, 3, 3, 3, 3]; //This is somewhat arbitrary. Do what you want.
        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    getRandomWeaponType(melee = true, ranged = true) {

        let types = [];
        const typesMelee = [
            "Club", "Dagger", "Greatclub", "Handaxe", "Javelin", "Light Hammer", "Mace", "Quarterstaff", "Sickle", "Spear",
            "Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword", "Halberd", "Lance", "Longsword", "Maul", "Morningstar",
            "Pike", "Rapier", "Scimitar", "Shortsword", "Trident", "Warhammer", "War Pick", "Whip"
        ];
        const typesRanged = [
            "Dart", "Light Crossbow", "Shortbow", "Sling",
            "Blowgun", "Hand Crossbow", "Heavy Crossbow", "Longbow", "Musket", "Pistol"
        ];
        const weightedArrayMelee = [1, 3, 2, 3, 3, 3, 3, 3, 2, 3,   3, 3, 3, 3, 3, 3, 3, 3, 3, 3,   3, 3, 3, 3, 3, 3, 3, 2,]; //This is somewhat arbitrary. Do what you want.
        const weightedArrayRanged = [2, 3, 3, 2,   2, 3, 3, 3, 1, 1]; //This is somewhat arbitrary. Do what you want.
        let weightedArray = [];

        if (melee) {
            weightedArray = weightedArray.concat(weightedArrayMelee);
            types = types.concat(typesMelee)
        }
        if (ranged) {
            weightedArray = weightedArray.concat(weightedArrayRanged);
            types = types.concat(typesRanged)
        }

        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    getRandomElementalDamageType() {

        const types = [
            "Acid", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Poison", "Psychic", "Radiant", "Thunder"
        ];
        const weightedArray = [2, 3, 3, 2, 3, 2, 3, 2, 2, 2]; //This is somewhat arbitrary. Do what you want.
        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    getRandomCreatureType() {
        const types = ["Aberrations", "Beasts", "Celestials", "Constructs", "Dragons", "Elementals", "Humanoids", "Fey", "Fiends", "Giants", "Monstrosities", "Oozes", "Plants", "Undead"];
        const weightedArray = [10, 5, 5, 5, 10, 10, 5, 10, 10, 5, 5, 5, 5, 10]; //This is somewhat arbitrary. Do what you want.
        const weightedIndex = getWeightedRandomIndex(weightedArray);
    
        return types[weightedIndex];
    },

}; //End of magicStore

function normalizeSpellName(name) {
    return name
        .toLowerCase()
        .replace(/^scroll:\s*/i, '') // Remove "Scroll:" prefix
        .replace(/^spellwrought\btattoo:\s*/i, '') // Remove "Scroll:" prefix
        .replace(/[’‘]/g, "'") // Normalize curly apostrophes to straight
        .replace(/[“”]/g, '"') // Normalize curly quotes to straight
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
}

function stripItemNamePrefix(name) {
    return name
        // .toLowerCase()
        .replace(/^scroll:\s*/i, '') // Remove "Scroll:" prefix
        .replace(/^spellwrought\btattoo:\s*/i, '') // Remove "Scroll:" prefix
        // .replace(/[’‘]/g, "'") // Normalize curly apostrophes to straight
        // .replace(/[“”]/g, '"') // Normalize curly quotes to straight
        // .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        // .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
}


/**
 * An array's index is chosen based on a random "raffle",
 *  where each weight acts like a number of raffle tickets in the bin.
 * @param {number[]} weights
 * @param {number} total Default is sum of the weights used as the denominator, otherwise use a number larger than the sum for a "no-pick" chance.
 * @returns number
 */
function getWeightedRandomIndex(weights, total = null) {

    if (!total || isNaN(total) || total <= 0) {
        total = weights.reduce((sum, w) => sum + w, 0);  //sum of the weights
    }

    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        if (r < weights[i]) return i;
        r -= weights[i];
    }

    return null; //no index was picked
}

/**
 * Produces an integer that has a weighted proximity to the given "ave" parameter.
 * The deviations from ave follow a standard normal distribution.
 * @param {*} ave 
 * @returns integer
 */
function bellCurveRandomInt(ave) {
    // Generate a standard normal distributed value using Box-Muller transform
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Avoid 0
    while (v === 0) v = Math.random();
    let standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    // Scale and shift to desired mean and range
    // Standard deviation is ave / 3 so ~99.7% of values are within [0, 2*ave]
    let stddev = ave / 3;
    let value = Math.round(ave + standardNormal * stddev);

    // Clamp to [0, 2*ave]
    return Math.max(0, Math.min(2 * ave, value));
}

/**
 * Assuming you are starting with a sorted array of objects (all having the name property),
 *      this function will insert the newObject alphabetically by its name property.
 * @param {*} array An array of objects (that all have the name property)
 * @param {*} newObject The object that will get inserted into the array
 * @returns 
 */
function insertObjectAlphabetically(array, newObject) {
    const index = array.findIndex(obj => newObject.name.localeCompare(obj.name) < 0);
    
    if (index === -1) {
        array.push(newObject);
    } else {
        array.splice(index, 0, newObject);
    }
    
    return array;
}

document.addEventListener('DOMContentLoaded', async () => {
    //magicStore.initialize();
    await magicStore.initialize();
});