// ToDo: change random magic item picking to randomly pick category and rarity, 
//          then send it through the variant "blender". That way we can potential pick items with lower level spells
//          that have been upgraded to the appropriate rarity (affects scrolls, enspelled items).
// ToDo: Let user decide rarity max.
// ToDo: finish adding items to getItemVariant(name)
// ToDo: Statistics to approx supplied amounts that users can adjust. Town pop and magic presence (high/med/low)
// ToDo: Update README.md
// ToDo: Finish adding the rest of TCE magic items.

const sourceAbbreviationKey = {
    PHB: "Player's Handbook (2024)",
    PHB2014: "Player's Handbook (2014)",
    DMG: "Dungeon Master's Guide (2024)",
    DMG2014: "Dungeon Master's Guide (2014)",
    XGE: "Xanathar's Guide to Everything",
    TCE: "Tasha's Cauldron of Everything",
};
const allowedRaritiesConsumables = ["common", "uncommon", "rare"]; //0-5
const allowedRaritiesNonConsumables = ["common", "uncommon", "rare"];
const basePrices = {
    common: 100,
    uncommon: 400,
    rare: 4000,
    "very rare": 40_000, //probably shouldn't include these in the store
    legendary: 200_000,  //we shouldn't include these in the store
    artifact: 2_000_000  //made up price, we shouldn't ever include these in the store
};
//Level:                  0   1   2    3    4     5     6      7      8      9
const scrollBasePrices = [30, 50, 200, 300, 2000, 3000, 20000, 25000, 30000, 100000]; //RAW 2024
const scrollRarity = ['common', 'common', 'uncommon', 'uncommon', 'rare', 'rare', 'very rare', 'very rare', 'very rare', 'legendary'];

let spells = [];   //all spells -- reference only

const magicStore = {

    inventory: [],
    pendingInventory: [], //temp inventory until save

    //move these array to global area pretty preaze
    magicItems: [],     //all magic items
    scrolls: [],        //all scrolls
    tattoos: [],        //all tattoos
    allItems: [],       //all items combined in one list

    categoryItems: [],          //An array of arrays. Each element is an array of items from a category
    categoryRarityScores: [],   //An array of arrays. Each element is an array of rarityScores for a category.

    riv: randomItemVariants,

    async initialize() {

        this.setupEventListeners();
        spells = await this.loadSpellsFile();
        const allMagicItems = await this.loadMagicItemsFile();
        const allScrolls = await this.loadScrollsFile();

        //*****  filter out rarities
        // Only include items with allowed rarities - different for consumables vs non-consumables
        this.magicItems = allMagicItems.filter(item => item.rarity && (
            (allowedRaritiesConsumables.includes(item.rarity.toLowerCase()) && isConsumable(item))
            || (allowedRaritiesNonConsumables.includes(item.rarity.toLowerCase()) && !isConsumable(item))

        ));
        this.magicItems.forEach(item => {
            item.price = this.calculateMagicItemBasePrice(item); //tentative price before possible variant price applied.
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

        console.log('acceptable rarities magicItems.length: ' + this.magicItems.length);

        this.categoryItems.push(this.scrolls);
        this.categoryItems.push(this.magicItems.filter(item => item.category == 'potion'));
        this.categoryItems.push(this.magicItems.filter(item => item.category == 'ring'));
        this.categoryItems.push(this.magicItems.filter(item => ['rod','staff','wand'].includes(item.category)));
        this.categoryItems.push(this.magicItems.filter(item => item.category == 'wondrous item'));
        this.categoryItems.push(this.magicItems.filter(item => item.category == 'armor'));
        this.categoryItems.push(this.magicItems.filter(item => item.category == 'weapon'));
        this.categoryItems.push(this.tattoos);

        // this.categoryItems.forEach(arr =>{ console.log(arr.length); });

        this.categoryRarityScores.push(structuredClone(this.categoryItems[0].map(item => item.rarityScore)));
        this.categoryRarityScores.push(structuredClone(this.categoryItems[1].map(item => item.rarityScore)));
        this.categoryRarityScores.push(structuredClone(this.categoryItems[2].map(item => item.rarityScore)));
        this.categoryRarityScores.push(structuredClone(this.categoryItems[3].map(item => item.rarityScore)));
        this.categoryRarityScores.push(structuredClone(this.categoryItems[4].map(item => item.rarityScore)));
        this.categoryRarityScores.push(structuredClone(this.categoryItems[5].map(item => item.rarityScore)));
        this.categoryRarityScores.push(structuredClone(this.categoryItems[6].map(item => item.rarityScore)));
        this.categoryRarityScores.push(structuredClone(this.categoryItems[7].map(item => item.rarityScore)));


        //update total quantitiy on each category label
        document.querySelectorAll('#updatePopup #categories label').forEach((label, index) => {
            label.title += `${this.categoryItems[index].length}`;
        });

        // Auto-load existing inventory from localStorage
        this.inventory = this.loadInventoryFromStorage();
        
        // Update display at the end
        this.updateInventoryDisplay();

    },

    setupEventListeners() {
        // Keep original file input for backwards compatibility
        document.getElementById('inventoryFileInput').addEventListener('change', async (event) => {
            const label = document.getElementById('inventoryFileLabel');
            if (event.currentTarget.files.length > 0) {
                label.textContent = event.currentTarget.files[0].name;
            } else {
                return;
            }

            this.inventory = await magicStore.loadInventoryFile(event);
            magicStore.updateInventoryDisplay();
        });

        // Add localStorage save/load functionality
        document.getElementById('btnExportInventory')?.addEventListener('click', () => {
            this.exportInventoryAsJSON();
        });

        document.getElementById('btnImportInventory')?.addEventListener('click', () => {
            this.importInventoryFromJSON();
        });

        document.getElementById('btnTodaysUpdates').addEventListener('click', () => magicStore.showUpdatesPopup()); 
        document.getElementById('btnSaveTodaysUpdates').addEventListener('click',() => magicStore.saveTodaysUpdates());
        document.getElementById('closePopup').addEventListener('click', () => {
            document.getElementById('updatePopup').style.display = 'none';
        });
        document.querySelectorAll('#updatePopup #categories input').forEach(input => {
            input.addEventListener('input', () => this.updatePopupPercentTotal());
        });

        document.getElementById('btnClearPercents').addEventListener('click', () => {
            document.getElementById('totalPercentMessage').innerHTML = "Total: 0%";
            document.querySelectorAll('#updatePopup #categories input').forEach(el => {
                el.value = "";
            });
            this.updatePopupPercentTotal();
        });

        document.getElementById('btnPresetScriptorium').addEventListener('click', () => {
            this.setCategoryPercentages([100]);
        });
        document.getElementById('btnPresetScriptoriumPlus').addEventListener('click', () => {
            this.setCategoryPercentages([80,19.6,.1,.1,.2]);
        });
        document.getElementById('btnPresetApothecary').addEventListener('click', () => {
            this.setCategoryPercentages([0,100]);
        });
            document.getElementById('btnPresetFullMix').addEventListener('click', () => {
            this.setCategoryPercentages([70, 26.2, .2, .5, 2.3, .4, .4, 0]);

        });

        document.querySelector('.popup-content')?.addEventListener('scroll', this.updateScrollButtonsVisibility);
        window.addEventListener('resize', this.updateScrollButtonsVisibility);
        
        // Add scroll and resize listeners for inventory scroll buttons
        window.addEventListener('scroll', () => this.updateInventoryScrollButtonsVisibility());
        window.addEventListener('resize', () => this.updateInventoryScrollButtonsVisibility());

    },

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

    loadInventoryFromStorage: function() {
        try {
            const stored = localStorage.getItem('magicStoreInventory');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load inventory from localStorage:', error);
            return [];
        }
    },

    saveInventoryToStorage: function() {
        try {
            this.inventory = structuredClone(pendingInventory.filter(item => item.quantity > 0));
            
            // Sort inventory first by name, then by variantName
            this.inventory.sort((a, b) => {
                const aName = a.name || "";
                const bName = b.name || "";
                const nameCmp = aName.localeCompare(bName);
                if (nameCmp !== 0) return nameCmp;

                const aVariant = a.variantName || "";
                const bVariant = b.variantName || "";
                return aVariant.localeCompare(bVariant);
            });

            localStorage.setItem('magicStoreInventory', JSON.stringify(this.inventory, null, 2));
            this.updateInventoryDisplay();
            return true;
        } catch (error) {
            console.error('Failed to save inventory to localStorage:', error);
            return false;
        }
    },

    exportInventoryAsJSON: function() {
        const fileName = "magic-store-inventory.json";
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.inventory, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", fileName);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
    },

    importInventoryFromJSON: function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    const imported = JSON.parse(text);
                    this.inventory = imported;
                    this.saveInventoryToStorage(); // Auto-save to localStorage
                    this.updateInventoryDisplay();
                    alert('Inventory imported successfully!');
                } catch (error) {
                    alert('Invalid JSON file.');
                }
            }
        };
        input.click();
    },

    updateInventoryDisplay: function () {        
        let main = document.querySelector('main');
        let existingContainer = document.querySelector('.inventory-container');
        let zeroInventoryMessage = document.getElementById('zeroInventoryMessage');

        if (existingContainer) existingContainer.remove();

        // Show/hide no inventory message
        if (this.inventory.length === 0) {
            if (zeroInventoryMessage) {
                zeroInventoryMessage.style.display = 'block';
            }
            return; // Don't create table if no inventory
        }

        if (zeroInventoryMessage) {
            zeroInventoryMessage.style.display = 'none';
        }
        // Only remove demo instructions when we have inventory to show
        const demoInstructions = document.getElementsByClassName("demo-instructions")[0];
        if (demoInstructions) demoInstructions.remove();

        // Sort inventory by variantName ascending before displaying
        this.inventory.sort((a, b) => {
            const aVariant = a.variantName || "";
            const bVariant = b.variantName || "";
            return aVariant.localeCompare(bVariant);
        });

        table = document.createElement('table');
        table.id = 'inventoryTable';
        table.className = 'table table-striped mt-3';
        
        // Calculate total quantity
        const totalQuantity = this.inventory.reduce((sum, item) => sum + item.quantity, 0);
        
        table.innerHTML = `
            <thead>
            <tr>
                <th onclick="magicStore.sortInventoryTable(0)">Item</th>
                <th class="text-end" onclick="magicStore.sortInventoryTable(1)">Price (gp)</th>
                <th onclick="magicStore.sortInventoryTable(2)">Rarity</th>
                <th class="text-end" onclick="magicStore.sortInventoryTable(3)">Rarity Score</th>
                <th class="text-end" onclick="magicStore.sortInventoryTable(4)">Quantity</th>
            </tr>
            </thead>
            <tbody>
                ${this.inventory.map(item => `
                    <tr>
                        <td title="${this.getCasterStatsTooltip(item)}">${item.variantName || item.name}</td>
                        <td class="text-end">${item.price}</td>
                        <td>${item.rarity}</td>
                        <td class="text-end">${item.rarityScore.toFixed(6)}</td>
                        <td class="text-end">${item.quantity}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
            <tr class="table-secondary">
                <td colspan="4" class="text-end fw-bold">Total Items:</td>
                <td class="text-end fw-bold">${totalQuantity}</td>
            </tr>
            </tfoot>
        `;
        
        // Create container for table and scroll buttons
        const inventoryContainer = document.createElement('div');
        inventoryContainer.className = 'inventory-container';
        
        // Create table wrapper
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'inventory-table-wrapper';
        tableWrapper.appendChild(table);
        
        // Create scroll buttons container
        const scrollButtonsContainer = document.createElement('div');
        scrollButtonsContainer.id = 'inventoryScrollButtons';
        scrollButtonsContainer.className = 'scroll-buttons-container';
        scrollButtonsContainer.innerHTML = `
            <button id="scrollUpInventoryTable" class="btn btn-primary btn-sm" title="Scroll to top">
                <span class="arrow">&#8593;</span>
            </button>
            <button id="scrollDownInventoryTable" class="btn btn-primary btn-sm" title="Scroll to bottom">
                <span class="arrow">&#8595;</span>
            </button>
        `;
        
        inventoryContainer.appendChild(tableWrapper);
        inventoryContainer.appendChild(scrollButtonsContainer);
        main.appendChild(inventoryContainer);

        const sortingNote = document.createElement('div');
        sortingNote.className = 'text-muted mt-5';
        sortingNote.innerHTML = 'Note: Multiples of the same item that contain spells (such as scrolls) are grouped by Attack/DC. (See item mouseover tooltips.)';
        main.appendChild(sortingNote);


        // Add scroll button event listeners
        this.setupInventoryScrollButtons();

        // Auto-save to localStorage whenever inventory is updated
        if (this.inventory.length > 0) {
            try {
                localStorage.setItem('magicStoreInventory', JSON.stringify(this.inventory, null, 2));
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    },

    sortInventoryTable: function(colIndex) {
        const table = document.getElementById('inventoryTable');
        const tbody = table.tBodies[0];
        const rows = Array.from(tbody.rows).filter(row => !row.classList.contains('no-sort'));
        // Toggle sort direction
        const isAsc = table.getAttribute('data-sort-col') == colIndex && table.getAttribute('data-sort-dir') == 'asc';

        // Define rarity hierarchy for proper sorting
        const rarityOrder = {
            'common': 1,
            'uncommon': 2,
            'rare': 3,
            'very rare': 4,
            'legendary': 5
        };

        rows.sort((a, b) => {
            let aText = a.cells[colIndex].textContent.trim();
            let bText = b.cells[colIndex].textContent.trim();
            
            // Special handling for rarity column (column 2)
            if (colIndex === 2) {
                const aRarityValue = rarityOrder[aText.toLowerCase()] || 999;
                const bRarityValue = rarityOrder[bText.toLowerCase()] || 999;
                
                if (aRarityValue === bRarityValue) {
                    // Secondary sort on column 0 (Item name)
                    let aName = a.cells[0].textContent.trim();
                    let bName = b.cells[0].textContent.trim();
                    return isAsc ? aName.localeCompare(bName) : bName.localeCompare(aName);
                }
                return isAsc ? aRarityValue - bRarityValue : bRarityValue - aRarityValue;
            }
            
            // Try to compare as numbers if possible
            let aNum = parseFloat(aText.replace(/[^0-9.\-]+/g,""));
            let bNum = parseFloat(bText.replace(/[^0-9.\-]+/g,""));
            if (!isNaN(aNum) && !isNaN(bNum)) {
                if (aNum === bNum && colIndex !== 0) {
                    // Secondary sort on column 0 (Item name)
                    let aName = a.cells[0].textContent.trim();
                    let bName = b.cells[0].textContent.trim();
                    return isAsc ? aName.localeCompare(bName) : bName.localeCompare(aName);
                }
                return isAsc ? aNum - bNum : bNum - aNum;
            }
            if (aText === bText && colIndex !== 0) {
                // Secondary sort on column 0 (Item name)
                let aName = a.cells[0].textContent.trim();
                let bName = b.cells[0].textContent.trim();
                return isAsc ? aName.localeCompare(bName) : bName.localeCompare(aName);
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
        
        if (categoryPercentages.every(element => element === 0)) categoryPercentages.fill(1); //fill it with some value > 0

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
        //console.log("categoryPercentages: " + categoryPercentages.toString());

        for (let i = 0; i < arrivalsCount; i++) {
            let randomCategoryIndex = getWeightedRandomIndex(categoryPercentages);  //pick category
            let itemsIndex = getWeightedRandomIndex(this.categoryRarityScores[randomCategoryIndex]); //pick item in category

            let randomItem = structuredClone(this.categoryItems[randomCategoryIndex][itemsIndex]); //makes a copy (doesn't reference)
            randomItem = this.riv.getItemVariant(randomItem);

            let inventoryIndex = pendingInventory.findIndex(item => item.variantName === randomItem.variantName && (!item.hasOwnProperty("attackBonus") || item.attackBonus == randomItem.attackBonus));

            if (inventoryIndex === -1) {
                insertObjectAlphabetically(pendingInventory, {
                    ...randomItem,
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
                ...randomItem
            });
        }

        // Sort todaysUpdates by action, then by variantName
        todaysUpdates.sort((a, b) => {
            // Sort by action first
            if (a.action !== b.action) {
                return a.action.localeCompare(b.action);
            }
            return a.variantName.localeCompare(b.variantName);
        });

        return todaysUpdates;
    },

    displayTodaysUpdates: function (todaysUpdates) {
        //console.table(todaysUpdates);

        document.getElementById('todaysUpdatesTable').innerHTML =
            `
            <div class="updates-container">
                <!-- Table column -->
                <div class="updates-table-column">
                    <div id="updatesTableContainer">
                        <table id='updatesTable' class="table table-bordered">
                            <thead>
                                <tr>
                                <th onclick="magicStore.sortUpdatesTable(0)">Action</th>
                                <th onclick="magicStore.sortUpdatesTable(1)">Category</th>
                                <th onclick="magicStore.sortUpdatesTable(2)">Item</th>
                                <th onclick="magicStore.sortUpdatesTable(3)">Price</th>
                                <th onclick="magicStore.sortUpdatesTable(4)">Rarity</th>
                                <th onclick="magicStore.sortUpdatesTable(5)">Rarity Score</th>
                                <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${todaysUpdates.map((u, idx) => `
                                    <tr data-update-idx="${idx}">
                                        <td>${u.action}</td>
                                        <!--td>${u.change > 0 ? '+' : ''}${u.change}</td-->
                                        <td>${u.category}</td>
                                        <!--td data-original-name="${u.name}" title="source: ${u.source}">${stripItemNamePrefix(u.variantName) || stripItemNamePrefix(u.name)}</td-->
                                        <td data-original-name="${u.name}" title="${this.getCasterStatsTooltip(u)}">${u.variantName}</td>
                                        <td>${u.price}</td>
                                        <td>${u.rarity}</td>
                                        <td>${u.rarityScore}</td>
                                        <td>
                                            <button class="btn btn-secondary btn-xs btn-delete-update" title="Delete">&times;</button>
                                            <button class="btn btn-secondary btn-xs btn-get-same-category" title="Get new from same category">C ↺</button>
                                            ${ u.variantName && u.variantName !== u.name
                                                ? `<button class="btn btn-secondary btn-xs btn-get-new-variant" title="Get new variant">V ↺</button>`
                                                : ''
                                            }
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- Button column -->
                <div id="popupScrollButtons">
                    <button id="scrollDownUpdatesTable" title="Scroll to bottom">
                        <span class="arrow">&#8595;</span>
                    </button>
                    <button id="scrollUpUpdatesTable" title="Scroll to top">
                        <span class="arrow">&#8593;</span>
                    </button>
                </div>
            </div>
            <div id="updatesCategorySummary" class="mt-3"></div>
            `;

        this.updateScrollButtonsVisibility();

        //*******************************************
        //* Event listeners for the new html
        //*******************************************

        // "x" (delete) button event listeners
        document.querySelectorAll('.btn-delete-update').forEach(btn => {
            btn.addEventListener('click', function () {
                const row = this.closest('tr');
                const idx = parseInt(row.getAttribute('data-update-idx'));

                // Remove from todaysUpdates
                todaysUpdates.splice(idx, 1);

                // Remove from pendingInventory if it's a supplier delivery
                const update = row.querySelector('td').textContent === 'Supplier delivered';
                if (update) {
                    // Find and remove from pendingInventory by variantName
                    const variantName = row.querySelectorAll('td')[2].textContent;
                    const invIdx = pendingInventory.findIndex(item => item.variantName === variantName);
                    if (invIdx !== -1) {
                        pendingInventory.splice(invIdx, 1);
                    }
                }

                // Re-render the updates table
                magicStore.displayTodaysUpdates(todaysUpdates);
            });
        });

        // "V ↺" Get new variant button
        document.querySelectorAll('.btn-get-new-variant').forEach(btn => {
            let that = this;
            btn.addEventListener('click', function () {
                const row = this.closest('tr');
                const idx = parseInt(row.getAttribute('data-update-idx'));
                const lineItem = todaysUpdates[idx];

                let newVariant;
                let i = 0; //loop failsafe
                // Get a new variant name using the item's name
                do {
                    i++;
                    newVariant = that.riv.getItemVariant(lineItem);
                } while(lineItem.variantName == newVariant.variantName && i < 100);
                todaysUpdates[idx] = newVariant;
                // row.querySelector('td[data-original-name]').textContent = newVariant.variantName;
                // Re-render the updates table to reflect the change
                that.displayTodaysUpdates(todaysUpdates);
            });
        });

        // "C ↺" Get new from same category" button
        document.querySelectorAll('.btn-get-same-category').forEach(btn => {
            let that = this;
            btn.addEventListener('click', function () {
                const row = this.closest('tr');
                const idx = parseInt(row.getAttribute('data-update-idx'));
                let lineItem = todaysUpdates[idx];

                // Find the right category array
                const catIdx = that.categoryItems.findIndex(
                    //peek to see if the first one in the list is the right category
                    arr => arr.length && arr[0].category === lineItem.category
                );

                let pickIdx;
                do {
                    pickIdx = getWeightedRandomIndex(that.categoryRarityScores[catIdx]);
                } while(that.categoryItems[catIdx][pickIdx].name === lineItem.name && that.categoryItems[catIdx].length > 1);

                const picked = that.categoryItems[catIdx][pickIdx];

                lineItem = {
                    action: 'Supplied (+1)',
                    change: +1,
                    ...picked
                };

                todaysUpdates[idx] = that.riv.getItemVariant(lineItem);
                
                // Re-render the updates table to reflect the change
                that.displayTodaysUpdates(todaysUpdates);
            });
        });
        
        // Show quantity summary by category
        const summary = {};
        todaysUpdates.forEach(u => {
            if (!u.category) return;
            if (!summary[u.category]) summary[u.category] = 0;
            summary[u.category] += u.change || 0;
        });
        const sortedCategories = Object.keys(summary).sort();
        const summaryHtml = `
            <table class="table table-sm table-bordered w-auto">
                <thead><tr><th>Category</th><th>Net Change</th></tr></thead>
                <tbody>
                    ${sortedCategories.map(cat =>
                        `<tr><td>${cat}</td><td class="text-end">${summary[cat] > 0 ? "+" : ""}${summary[cat]}</td></tr>`
                    ).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('updatesCategorySummary').innerHTML = summaryHtml;

        // Scroll up/down buttons
        setTimeout(() => {
            const scrollDownBtn = document.getElementById('scrollDownUpdatesTable');
            const scrollUpBtn = document.getElementById('scrollUpUpdatesTable');
            // Always target the popup-content element which is the actual scrollable container
            const popup = document.querySelector('.popup-content');
            
            if (scrollDownBtn && popup) {
                scrollDownBtn.onclick = () => {
                    popup.scrollTo({ 
                        top: popup.scrollHeight, 
                        behavior: 'smooth' 
                    });
                };
            }
            if (scrollUpBtn && popup) {
                scrollUpBtn.onclick = () => {
                    popup.scrollTo({ 
                        top: 0, 
                        behavior: 'smooth' 
                    });
                };
            }
        }, 0);
    },

    updateScrollButtonsVisibility() {
        const popup = document.querySelector('.popup-content');
        const table = document.getElementById('updatesTable');
        const scrollDownBtn = document.getElementById('scrollDownUpdatesTable');
        const scrollUpBtn = document.getElementById('scrollUpUpdatesTable');
        
        if (!popup || !table || !scrollDownBtn || !scrollUpBtn) return;

        // Get bounding rectangles
        const popupRect = popup.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();

        // Show scroll down button if table extends below viewport (like inventory buttons)
        if (tableRect.bottom > popupRect.bottom) {
            scrollDownBtn.classList.add('overflow-y');
        } else {
            scrollDownBtn.classList.remove('overflow-y');
        }

        // Show scroll up button if table top is above viewport (like inventory buttons)
        if (tableRect.top < popupRect.top) {
            scrollUpBtn.classList.add('overflow-y');
        } else {
            scrollUpBtn.classList.remove('overflow-y');
        }
    },

    setupInventoryScrollButtons() {
        setTimeout(() => {
            const scrollDownBtn = document.getElementById('scrollDownInventoryTable');
            const scrollUpBtn = document.getElementById('scrollUpInventoryTable');
            
            // Find the scrollable container (window in this case for main page)
            if (scrollDownBtn) {
                scrollDownBtn.onclick = () => {
                    // Scroll to the bottom of the page
                    window.scrollTo({ 
                        top: document.body.scrollHeight, 
                        behavior: 'smooth' 
                    });
                };
            }
            if (scrollUpBtn) {
                scrollUpBtn.onclick = () => {
                    // Scroll to the top of the inventory table
                    const inventoryTable = document.getElementById('inventoryTable');
                    if (inventoryTable) {
                        inventoryTable.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }
                };
            }
            
            // Update visibility based on table height
            this.updateInventoryScrollButtonsVisibility();
        }, 0);
    },

    updateInventoryScrollButtonsVisibility() {
        const table = document.getElementById('inventoryTable');
        const scrollDownBtn = document.getElementById('scrollDownInventoryTable');
        const scrollUpBtn = document.getElementById('scrollUpInventoryTable');
        
        if (!table || !scrollDownBtn || !scrollUpBtn) return;

        // Check if the table is tall enough to need scrolling
        const tableHeight = table.offsetHeight;
        const windowHeight = window.innerHeight;
        const tableRect = table.getBoundingClientRect();
        
        // Show scroll down button if table extends below viewport
        if (tableRect.bottom > windowHeight) {
            scrollDownBtn.classList.add('overflow-y');
        } else {
            scrollDownBtn.classList.remove('overflow-y');
        }
        
        // Show scroll up button if table top is above viewport
        if (tableRect.top < 0) {
            scrollUpBtn.classList.add('overflow-y');
        } else {
            scrollUpBtn.classList.remove('overflow-y');
        }
    },

    //Today's Updates
    sortUpdatesTable(colIndex) {
        const table = document.getElementById('updatesTable');
        if (!table) return;
        const tbody = table.tBodies[0];
        const rows = Array.from(tbody.rows);
        const isAsc = table.getAttribute('data-sort-col') == colIndex && table.getAttribute('data-sort-dir') == 'asc';

        rows.sort((a, b) => {
            // Helper function to get cell text
            const getCell = (row, idx) => row.cells[idx]?.textContent.trim() || "";

            // Sort by Category (col 1), secondary by Item (col 2)
            if (colIndex === 1) {
                let cmp = isAsc
                    ? getCell(a, 1).localeCompare(getCell(b, 1))
                    : getCell(b, 1).localeCompare(getCell(a, 1));
                if (cmp !== 0) return cmp;

                // Secondary sort on Item (col 2) Name
                return isAsc
                    ? getCell(a, 2).localeCompare(getCell(b, 2))
                    : getCell(b, 2).localeCompare(getCell(a, 2));
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

            // If sorting by Category (col 2) Name, do secondary sort on Item (col 1) Category
            if (colIndex === 2) {
                let cmp = isAsc
                    ? getCell(a, 2).localeCompare(getCell(b, 2))
                    : getCell(b, 2).localeCompare(getCell(a, 2));
                if (cmp !== 0) return cmp;

                return isAsc
                    ? getCell(a, 1).localeCompare(getCell(b, 1))
                    : getCell(b, 1).localeCompare(getCell(a, 1));
            }

            // For Price, Rarity Score, use a numeric sort
            if (colIndex === 3 || colIndex === 5) {
                let aNum = parseFloat(getCell(a, colIndex).replace(/[^0-9.\-]+/g,""));
                let bNum = parseFloat(getCell(b, colIndex).replace(/[^0-9.\-]+/g,""));
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return isAsc ? aNum - bNum : bNum - aNum;
                }
            }

            // Special handling for Rarity column (colIndex 4)
            if (colIndex === 4) {
                const rarityOrder = { "common": 1, "uncommon": 2, "rare": 3, "very rare": 4, "legendary": 5, "artifact": 6 };
                let aVal = rarityOrder[getCell(a, 4).toLowerCase()] || 99;
                let bVal = rarityOrder[getCell(b, 4).toLowerCase()] || 99;
                return isAsc ? aVal - bVal : bVal - aVal;
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

        // Sort inventory first by name, then by variantName
        this.inventory.sort((a, b) => {
            const aName = a.name || "";
            const bName = b.name || "";
            const nameCmp = aName.localeCompare(bName);
            if (nameCmp !== 0) return nameCmp;

            // Secondary sort by variantName
            const aVariant = a.variantName || "";
            const bVariant = b.variantName || "";
            return aVariant.localeCompare(bVariant);
        });

        // Save to localStorage instead of downloading file
        if (this.saveInventoryToStorage()) {
            document.getElementById('updatePopup').style.display = 'none';
            alert('Today\'s updates saved successfully!');
        } else {
            alert('Failed to save updates.');
        }
    },

    /**
     * index: 0 scrolls, 1 potions, 2 rings, 3 rod/staff/wands, 4 wondrous items, 5 armor, 6 weapons, 7 tattoos,  
     * @param {[number]} percentages 
     */
    setCategoryPercentages(percentages = []) {

        document.getElementById('totalPercentMessage').innerHTML = "Total: 0%";
        const inputs = document.querySelectorAll('#updatePopup #categories input');

        inputs.forEach(input => input.value = 0);

        percentages.forEach((p, index) => {
            inputs[index].value = p;        
            this.updatePopupPercentTotal();  
        });
    },

    updatePopupPercentTotal() {

        const percentInputs = document.querySelectorAll('#updatePopup #categories input');
        const totalMsg = document.getElementById('totalPercentMessage');
        let total = Number(Array.from(percentInputs).reduce((sum, input) => sum + (Number(input.value) || 0), 0)).toFixed(2);
        // total = ((total * 10) + (total * 10)) / 2 / 10;
        totalMsg.textContent = `Total: ${total}%`;

        if (Number(total) == 0) {
            totalMsg.classList.remove('text-danger');
            totalMsg.classList.remove('text-success');
            totalMsg.classList.add('text-muted');
        } else if (Number(total) !== 100) {
            totalMsg.classList.remove('text-muted');
            totalMsg.classList.remove('text-success');
            totalMsg.classList.add('text-danger');
        } else {
            totalMsg.classList.remove('text-danger');
            totalMsg.classList.remove('text-muted');
            totalMsg.classList.add('text-success');
        }
    },

    getCasterStatsTooltip(item) {
        let tooltip = "";

        if (item.hasOwnProperty("spellLevel")) {
            tooltip += "Orig item name: " + item.name + "\n";
            tooltip += "Orig Spell Level: " + item.originalSpellLevel + "\n";
            tooltip += "Spell Level: " + item.spellLevel + "\n";
            // tooltip += "Caster Level: " + item.casterLevel + "\n";
            tooltip += "Prof Bonus: " + item.proficiencyBonus + "\n";
            tooltip += "Ability Mod: " + item.abilityMod + "\n";
            tooltip += "Attack: " + item.attackBonus + "\n";
            tooltip += "DC: " + item.dc + "\n";
        }

        tooltip += "Source: " + item.source;

        return tooltip;
    },

    // --- Utility methods that are specific to this app ---

    /**
     * @param {*} name Can be a spell name, scroll name, or tattoo name
     * @returns A spell object
     */
    getSpell: function (name) {
        if (!name || typeof name !== "string") return null;
        const spell = spells.find(s => normalizeSpellName(s.name) === normalizeSpellName(name)) || null;

        return spell;
    },

    /**
     * @param {string} name Can be a spell name, scroll name, or tattoo name
     * @returns A scroll object or null
     */
    getScroll: function (name) {
        if (!name || typeof name !== "string") return null;
        const scroll = this.scrolls.find(s => normalizeSpellName(s.name) === normalizeSpellName(name)) || null;

        return scroll;
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

        // let rareFactor1 = this.calculateMagicItemBasePrice(item);
        let rareFactor1 = item.price;

        if (item.rarity.toLowerCase() == "common"
            && !item.name.toLowerCase().startsWith("potion of healing")
            && item.category.toLowerCase() != "scroll"
            && item.category.toLowerCase() != "tattoo"
        ) {
            // rareFactor1 *= 3; //more rare. most common junk is not as high in demand as the price would normally dictate.
            rareFactor1 *= 6 //more rare. most common junk is not as high in demand as the price would normally dictate.
        }

        // let rarityScore = 100000 / this.calculateMagicItemBasePrice(item)**1.3 * item.likability;
        let rarityScore = 100000 / rareFactor1**1.3 * item.likability;

        //scrolls are even easier to make than other consumables so lets bump them up again
         if (item.category.toLowerCase() == "scroll")  {
             const spell = this.getSpell(item.name);
            if (spell && spell.level != 0) {
                if (spell.componentConsumptionExpense) {
                    rarityScore *= 1.5;  //scroll bump: spells that consume comps.
                } else {
                    rarityScore *= 2;    //bigger scroll bump: only need your regular (non-consumed) spell comps.
                }
             }
         }
        //potions of healing are way eaier to make than other items in their category
        //  and more crafters can make these.
         if (item.name.toLowerCase().startsWith("potion of healing")) {
             rarityScore *= 2;  //big bump. more of these than "healing" scrolls
         }

        //way harder to make if a "major"
        if ('magicType' in item) {
            if (item.magicType.toLowerCase() == 'major') {
                rarityScore /= 2;
            }
        }

        if (item.rarity.toLowerCase() == "common"
            && !item.name.toLowerCase().startsWith("potion of healing")
            && item.category.toLowerCase() != "scroll"
            && item.category.toLowerCase() != "tattoo"
        ) {
            // rarityScore /= 4; //demand is not that great for most of these items
            // rarityScore /= 3; //demand is not that great for most of these items
        }

        return Number(rarityScore.toFixed(6));
    },

    calculateMagicItemBasePrice: function (item) {
        let rarity = (item.rarity || "unknown").toLowerCase();
        let price = basePrices[rarity] || basePrices.legendary;

        if (isConsumable(item)) {
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
     * I'm just going to charge twice as much as scrolls for now.
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

}; //End of magicStore


/**
 * Strips any prefix, converts to lower case,
 * converts curly apostrophes to straight,
 * ensures only single spaces, trims start/end spaces.
 * @param {string} name 
 * @returns 
 */
function normalizeSpellName(name) {
    if (typeof name === 'undefined' || !name) return;
    name = stripItemNamePrefix(name);
    return name
        .toLowerCase()
        .replace(/[’‘]/g, "'") // Normalize curly apostrophes to straight
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
}

/**
 * Removes everything up to (and including) the last colon
 * @param {string} name 
 * @returns string
 */
function stripItemNamePrefix(name) {
    if (typeof name === 'undefined' || !name) return;
    // console.log("name: " + name);
    return name
        .replace(/^.*:\s*/, '') // Remove everything up to the last colon and any spaces immeditely following the colon.
        ;
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
 * Generate a standard normal distributed value using Box-Muller transform.
 * Produces an integer that has a weighted proximity to the average of the given upper and lower bounds.
 * The deviations from ave follow a standard normal distribution.
 * @param {number} lowerBound 
 * @param {number} upperBound 
 * @returns integer
 */
function bellCurveRandomInt(lowerBound, upperBound) {
    const ave = (lowerBound + upperBound) / 2;
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Avoid 0
    while (v === 0) v = Math.random();
    const standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    //*** Standard deviation ***  Scale and shift to desired mean and range
    // const stddev = (ave - lowerBound) / 3; //~99.7% of values are within [lowerBound, upperBound]
    // const stddev = (ave - lowerBound) / 4; //~99.9937% of values are within [lowerBound, upperBound]
    // const stddev = (ave - lowerBound) / 5; //~99.99994% of values are within [lowerBound, upperBound]
    // const stddev = (ave - lowerBound) / 6; //~99.9999998% of values are within [lowerBound, upperBound]
    const stddev = (ave - lowerBound) / 4;
    
    const value = Math.round(ave + standardNormal * stddev);

    // Clamp to [lowerBound, upperBound]    The small % beyond the designated std devs is chopped off
    return Math.max(lowerBound, Math.min(upperBound, value));
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


// let sum = 0, i = 0;
// const loopTimes = 1000000;

// console.time();

// while(i++ < loopTimes) {
//     const val = bellCurveRandomInt(3,18);
//     console.log(val);
//     sum += val;
// }
// console.timeEnd();
// console.log("ave: " + sum/loopTimes)