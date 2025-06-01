// ToDo: combine magicitems, spell scrolls.json, spellwroughttattoos.json
// ToDo: user chooses percentage of generated item categories: armor, potion, ring, rod, scroll, staff, wand, weapon, wondrous item, tattoo.
//       Then an item's rarityScore would apply only to its category.
// ToDo: Use scroll list for gernerating spellwrought tattoos (note: only use <= L5)
// ToDo: Create an magicitemsDailyExpectedSales array, which gets plugged into the bellCurveRandomInt. 
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
let inventory = [];
let pendingInventory = []; //temp inventory until save
let todaysUpdates = [];
let magicItems = [];
let rarityScoreGrandTotal = 0;

const basePrices = {
    common: 100,
    uncommon: 400,
    rare: 4000,
    "very rare": 40000,
    legendary: 200000,  //we shouldn't include these in the store
    artifact: 999999  //made up price, we shouldn't include these in the store
};

const magicStore = {
    initialize: function () {
        this.setupEventListeners();
        this.loadMagicItemsFile();
        this.updateInventoryDisplay();
    },

    setupEventListeners: function () {
        const InventoryFileInput = document.getElementById('inventoryFileInput');
        if (InventoryFileInput) {
            InventoryFileInput.addEventListener('change', function (event) {
                const label = document.getElementById('inventoryFileLabel');
                if (this.files.length > 0) {
                    label.textContent = this.files[0].name;
                } else {
                    label.textContent = "Load Inventory File 🪄";
                }
                magicStore.loadInventoryFile(event);
            });
        }
        document.getElementById('btnTodaysUpdates').addEventListener('click', this.showUpdatesPopup.bind(this));
        document.getElementById('btnSaveTodaysUpdates').addEventListener('click', this.saveTodaysUpdates.bind(this));
        document.getElementById('closePopup').addEventListener('click', () => {
            document.getElementById('updatePopup').style.display = 'none';
        });
    },

    /**
     * Note: only loading common, uncommon, rare, very rare. No Legendary or Artifacts.
     */
    loadMagicItemsFile: async function () {
        magicItems = [];

        try {
            const response = await fetch('magic-items.json');
            const allItems = await response.json();

            // Only include items with allowed rarities
            const allowedRarities = ["common", "uncommon", "rare", "very rare"];
            magicItems = allItems.filter(item =>
                item.rarity && allowedRarities.includes(item.rarity.toLowerCase())
            );

            todaysUpdateChanceArrival = 0;

            magicItems.forEach(item => {
                item.price = this.calculateMagicItemPrice(item);
                item.rarityScore = this.getRarityScore(item);
                rarityScoreGrandTotal += item.rarityScore;
                // console.log(item.name + ' rarityScore: ' + item.rarityScore);
            });
            // console.log('loadMagicItemsFile rarityScoreGrandTotal: ' + rarityScoreGrandTotal.toFixed(7));
        } catch (e) {
            console.error(e);
        }
    },

    loadInventoryFile: function (event) {

        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                inventory = JSON.parse(e.target.result);
                // inventory.forEach(item => {
                //     //add object fields here if needed
                // });

                this.updateInventoryDisplay();
            } catch {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file); //let the reading begin!
    },

    updateInventoryDisplay: function () {
        let main = document.querySelector('main');
        let table = document.getElementById('inventoryTable');
        if (table) table.remove();

        table = document.createElement('table');
        table.id = 'inventoryTable';
        table.className = 'table table-striped mt-4';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price (gp)</th>
                    <th>Rarity</th>
                    <th>Rarity Score</th>
                    <th>Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${inventory.length === 0 ? `
                    <tr>
                        <td colspan="6" class="text-center">No inventory loaded.</td>
                    </tr>
                ` : inventory.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.price}</td>
                        <td>${item.rarity}</td>
                        <td>${item.rarityScore}</td>
                        <td>${item.quantity}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        main.appendChild(table);
    },

    showUpdatesPopup: function () {
        pendingInventory = JSON.parse(JSON.stringify(inventory));

        let suggestedArrivals = 10;
        let suggestedSales = 9;
        suggestedSales = inventory.length < suggestedSales ? inventory.length : suggestedSales;

        document.getElementById('arrivalsInput').value = suggestedArrivals;
        document.getElementById('salesInput').value = suggestedSales;
        document.getElementById('btnSaveTodaysUpdates').style.display = 'none'; //hide save button

        document.getElementById('btnGenerateUpdates').onclick = () => {
            todaysUpdates = this.generateTodaysUpdates();
            this.displayTodaysUpdates(todaysUpdates);

            document.getElementById('btnSaveTodaysUpdates').style.display = ''; //show save button
        };

        document.getElementById('updatePopup').style.display = 'block';
    },

    generateTodaysUpdates: function () {
        const arrivalsCount = parseInt(document.getElementById('arrivalsInput').value) || 0;
        const salesCount = parseInt(document.getElementById('salesInput').value) || 0;

        pendingInventory = JSON.parse(JSON.stringify(inventory));
        todaysUpdates = [];

        //*****  Customer bought
        let salesMade = 0;
        let attempts = 0;
        const maxAttempts = salesCount * 10;

        if (pendingInventory.length > 0) {
            while (salesMade < salesCount && attempts < maxAttempts) {
                const rarityScores = pendingInventory.map(obj => obj.rarityScore);


                //ToDo: don't forget to incorporate quantity
                const idx = getWeightedRandomIndex(rarityScores);



                if (idx && pendingInventory[idx] && pendingInventory[idx].quantity > 0) {
                    pendingInventory[idx].quantity--;
                    /*
                    todaysUpdates.push({
                        action: 'Customer bought',
                        change: -1,
                        ...pendingInventory[idx]
                    });
                    */
                    insertObjectAlphabetically(todaysUpdates, {
                        action: 'Customer bought',
                        change: -1,
                        ...pendingInventory[idx]
                    });

                    salesMade++;
                }
                attempts++;
            }
        }

        const rarityScores = magicItems.map(obj => obj.rarityScore);

        //*****  Supplier delivered
        for (let i = 0; i < arrivalsCount; i++) {
            if (magicItems.length === 0) continue;

            const magicItemsIndex = getWeightedRandomIndex(rarityScores);
            const magicItem = magicItems[magicItemsIndex];

            let inventoryIndex = pendingInventory.findIndex(item => item.name === magicItem.name);

            if (inventoryIndex === -1) {
                //doesn't exist in inventory yet, so insert it.
                /*
                pendingInventory.push({
                    ...magicItem,
                    quantity: 1,
                });
                */
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
                action: 'Supplier delivered',
                change: +1,
                ...magicItem
            });
        }

        return todaysUpdates;
    },

    displayTodaysUpdates: function (todaysUpdates) {
        document.getElementById('todaysUpdatesTable').innerHTML =
            `<table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>Change</th>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Rarity</th>
                        <th>Rarity Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${todaysUpdates.map(u => `
                        <tr>
                            <td>${u.action}</td>
                            <td>${u.change > 0 ? '+' : ''}${u.change}</td>
                            <td>${u.name}</td>
                            <td>${u.price}</td>
                            <td>${u.rarity}</td>
                            <td>${u.rarityScore}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    },

    saveTodaysUpdates: function () {
        inventory = JSON.parse(JSON.stringify(pendingInventory));
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inventory, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", "magic-store-inventory.json");
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();

        document.getElementById('updatePopup').style.display = 'none';
        this.updateInventoryDisplay();
    },

    // --- Utility methods that are specific to this app ---

    /**
     * A score based on price, likability, major/minor, potion/scroll/other
     * @param {*} item 
     * @returns 
     */
    getRarityScore(item) {

        let rarityScore = 10 / item.price * item.likability;

        if (item.magicType.toLowerCase() == 'major') {
            rarityScore /= 2;
        }
        if (item.magicType.toLowerCase() == 'minor') {
            if (this.isConsumable(item)) {
                rarityScore *= 5;

                if (item.category.toLowerCase() == "potion" || item.category.toLowerCase() == "scroll") {
                    rarityScore *= 10;
                }
            } else {
                //just a minor
                rarityScore *= 2;
            }
        }

        return Number(rarityScore.toFixed(6));
    },

    /**
     * Items that have extra expense in order to craft
     * @param {*} magicItem 
     * @returns number
     */
    getValueAddedCraftingExpense: function (magicItem) {
        const componentCosts = {
            "Antipathy/Sympathy": 1000,
            "Arcane Lock": 25,
            "Awaken": 1000,
            "Clone": 1000,
            "Commune": 25,
            "Contingency": 1500,
            "Contact Other Plane": 250,
            "Divination": 25,
            "Drawmij's Instant Summons": 1000,
            "Find Familiar": 10,
            "Find Greater Steed": 100,
            "Find the Path": 100,
            "Forbiddance": 1000,
            "Gate": 5000,
            "Glyph of Warding": 200,
            "Greater Restoration": 100,
            "Guards and Wards": 200,
            "Hallow": 1000,
            "Heroes' Feast": 1000,
            "Imprisonment": 500,
            "Legend Lore": 250,
            "Leomund's Secret Chest": 5000,
            "Magic Jar": 500,
            "Planar Binding": 1000,
            "Private Sanctum": 500,
            "Raise Dead": 500,
            "Regenerate": 1000,
            "Resurrection": 1000,
            "Revivify": 300,
            "Scrying": 1000,
            "Sequester": 5000,
            "Simulacrum": 1500,
            "Symbol": 1000,
            "Teleportation Circle": 50,
            "True Polymorph": 1500,
            "True Resurrection": 25000,
        };

        if (magicItem.category === "scroll" && magicItem.name.startsWith("Scroll: ")) {
            const spellName = magicItem.name.replace(/^Scroll: /, '').replace(/\s*\(\d+\)$/, '').trim();
            return componentCosts[spellName] || 0;
        }
        return 0;
    },

    calculateMagicItemPrice: function (item) {
        let rarity = (item.rarity || "legendary").toLowerCase().replace(/\s+/g, ' ');
        let price = basePrices[rarity] || basePrices.legendary;
        const componentExpense = this.getValueAddedCraftingExpense(item);

        if (this.isConsumable(item)) {
            price = price / 2;
        }
        price += componentExpense;

        return Math.round(price);
    },

    isConsumable(item) {

        const consumables = [
            "Ammunition", "Arrow of ", "Bag of Beans", "Bead of ", "Bolt of ", "Bullet of ",
            "Chime of Opening", "Dust of ", "Elemental Gem", "Elixir", "Feather Token",
            "Marvelous Pigments", "Ointment", "Oil of ", "Philter of ", "Potion",
            "Robe of Useful Items", "Scroll of ", "Sovereign Glue", "Universal Solvent", "powder"
        ];

        const lowerName = item.name.toLowerCase();

        let isConsumable = consumables.some(keyphrase => lowerName.includes(keyphrase.toLowerCase())) ||
            item.category.toLowerCase() == "potion" ||
            item.category.toLowerCase() == "scroll";

        return isConsumable;
    }


};

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

document.addEventListener('DOMContentLoaded', () => {
    magicStore.initialize();
});