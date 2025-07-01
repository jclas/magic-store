// ToDo: get scroll variants with caster metrics
//
// The intention of this file is to house all code to determine a magic item's variations.
// For example: Armor +1 could be Leather Armor +1 or Breastplate +1.
//
// ToDo: Need to pass the item object, not just the name, so we can assign new possible metrics:
//      - price (variant cost)
//      - spell level (if upcasted)
//      - caster level: which determines a probable attack bonus or DC
//      - Change rarityScore based on number of variants.
//      - consider having a hasVariants property
//      
//

const randomItemVariants = {

    /**
     * 
     * @param {object} item 
     * @returns 
     */    
    getItemVariant(item) {
        let variantItem = structuredClone(item);
        variantItem.variantName = variantItem.name; //default;

        const nameLower = item.name.toLowerCase();
        if (nameLower.startsWith("scroll:")) {
            variantItem = this.getSpellScrollVariant(variantItem);
        }

        if (nameLower == "adamantine armor") {
            variantItem.variantName = "Adamantine " + this.getRandomMetalArmorType();
        }

        if (nameLower.startsWith("ammunition +")) {
            variantItem.variantName = item.name.replace(/ammunition/i, this.getRandomAmmoType()) + " (x10)";
        }

        if (nameLower == "ammunition of slaying") {
            variantItem.variantName = this.getRandomAmmoType() + " of " + this.getRandomCreatureType() + " Slaying (x10)";
        }

        if (nameLower.startsWith("armor +")) {
            variantItem.variantName = item.name.replace(/armor/i, this.getRandomArmorType());
        }
        
        if (nameLower.startsWith("armor of gleaming")) {
            variantItem.variantName = item.name.replace(/armor/i, this.getRandomArmorType());
        }
        
        if (nameLower.startsWith("armor of resistance")) {
            variantItem.variantName = item.name.replace(/armor/i, this.getRandomArmorType());
            variantItem.name += " (" + this.getRandomElementalDamageType() + ")";
        }

        if (nameLower == "cast-off armor") {
            variantItem.variantName = "Cast-off " + this.getRandomArmorType();
        }

        if (nameLower == "dragon scale armor") {
            variantItem.variantName = item.name + " (" + this.getRandomDragonType() + ")";
        }
        if (nameLower == "dwarven plate") {
            const isHalfPlate = parseInt(Math.random() * 3);
            if (isHalfPlate) {
                variantItem.variantName = item.name + " (Half Plate Armor)";
            } else {
                variantItem.variantName = item.name + " (Plate Armor)";
            }
        }

        if (nameLower.startsWith("enspelled")) {
            variantItem = this.getEnspelledItemVariant(variantItem);
        }

        if (nameLower == "flame tongue") {
            variantItem.variantName = item.name + " (" + this.getRandomWeaponType(true, false) + ")"; 
        }

        if (nameLower == "frost brand") {
            const weapons = ["Glaive", "Greatsword", "Longsword", "Rapier", "Scimitar", "Shortsword"];
            variantItem.variantName = item.name + " (" + weapons[getWeightedRandomIndex([1,1,1,1,1,1])] + ")";
        }

        if (nameLower == "giant slayer") {
            variantItem.variantName = item.name + " (" + this.getRandomWeaponType() + ")";
        }

        if (nameLower == "holy avenger") {
            variantItem.variantName = item.name + " (" + this.getRandomWeaponType() + ")";
        }

        if (nameLower == "luck blade") {
            const weapons = ["Glaive", "Greatsword", "Longsword", "Rapier", "Scimitar", "Sickle", "Shortsword"];
            variantItem.variantName = item.name + " (" + weapons[getWeightedRandomIndex([1,1,1,1,1,1,1])] + ")";
        }

        if (nameLower == "mariner's armor") {
            // return item.name + " (" + this.getRandomArmorType() + ")";
            variantItem.variantName = item.name.replace(/armor/i, this.getRandomArmorType());
        }
        
        if (nameLower == "mithral armor") {
            variantItem.variantName = item.name.replace(/armor/i, this.getRandomMetalArmorType());
        }

        if (nameLower == "moonblade") {
            const weapons = ["Greatsword", "Longsword", "Rapier", "Scimitar", "Shortsword"];
            variantItem.variantName = item.name + " (" + weapons[getWeightedRandomIndex([1,1,1,1,1])] + ")";
        }

        if (nameLower.startsWith("moon-touched")) {
            const weapons = ["Glaive", "Greatsword", "Longsword", "Rapier", "Scimitar", "Shortsword"];
            variantItem.variantName = "Moon-touched " + weapons[getWeightedRandomIndex([1,1,1,1,1,1])];
        }

        if (nameLower == "nine lives stealer") {
            variantItem.variantName = item.name + "(" + this.getRandomWeaponType() + ")";
        }

        if (nameLower == "oathbow") {
            const weapons = ["Longbow", "Shortbow"];
            variantItem.variantName = item.name + " (" + weapons[getWeightedRandomIndex([1,1])] + ")";
        }

        if (nameLower == "plate armor of etherealness") {
            const armors = ["Plate", "Half Plate"];
            variantItem.variantName = item.name + " (" + armors[getWeightedRandomIndex([1,1])] + ")";
        }

        if (nameLower == "smoldering armor") {
            variantItem.variantName = "Smoldering " + this.getRandomArmorType();
        }
        
        if (nameLower == "scroll of titan summoning") {
            variantItem.variantName = item.name + " (" + this.getScrollOfTitalSummoningType() + ")";
        }

        if (nameLower == "sword of life stealing") {
            //ToDo:
            
        }

        return variantItem;
    },

    getRandomAmmoType() {

        const types = ["Arrow", "Bolt", "Firearm Bullet", "Sling Bullet", "Needle"];
        const weightedArray = [.40, .40, .02, .10, .08]; //This is somewhat arbitrary. Do what you want.
        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    getRandomArmorType(includeShield = false) {

        let types = ["Padded Armor", "Leather Armor", "Studded Leather Armor", "Hide Armor", "Chain Shirt", "Scale Mail", "Breastplate", "Half Plate Armor", "Ring Mail", "Chain Mail", "Splint Armor", "Plate Armor"];
        let weightedArray = [1, 1, 4, 1, 4, 1, 4, 4, 1, 4, 1, 4]; //This is somewhat arbitrary. Do what you want.

        if (includeShield) {
            types.push("Shield");
            weightedArray.push(4);
        }

        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },
    
    getRandomMetalArmorType() {

        const types = ["Chain Shirt", "Scale Mail", "Breastplate", "Half Plate Armor", "Ring Mail", "Chain Mail", "Splint Armor", "Plate Armor"];
        const weightedArray = [4, 1, 4, 4, 1, 4, 1, 4]; //This is somewhat arbitrary. Do what you want.
        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    /**
     * 
     * @param {boolean} melee 
     * @param {boolean} ranged 
     * @param {boolean} includeStaff Staves can be categoried as a weapon or a staff.
     * @returns {string}
     */
    getRandomWeaponType(melee = true, ranged = true, includeStaff = true) {

        let types = [];
        const typesMelee = [
            "Club", "Dagger", "Greatclub", "Handaxe", "Javelin", "Light Hammer", "Mace", "Sickle", "Spear",
            "Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword", "Halberd", "Lance", "Longsword", "Maul", "Morningstar",
            "Pike", "Rapier", "Scimitar", "Shortsword", "Trident", "Warhammer", "War Pick", "Whip"
        ];
        const typesRanged = [
            "Dart", "Light Crossbow", "Shortbow", "Sling",
            "Blowgun", "Hand Crossbow", "Heavy Crossbow", "Longbow", "Musket", "Pistol"
        ];
        const weightedArrayMelee = [1, 3, 2, 3, 3, 3, 3, 2, 3,   3, 3, 3, 3, 3, 3, 3, 3, 3, 3,   3, 3, 3, 3, 3, 3, 3, 2,]; //This is somewhat arbitrary. Do what you want.
        const weightedArrayRanged = [2, 3, 3, 2,   2, 3, 3, 3, .25, .25]; //This is somewhat arbitrary. Do what you want.
        let weightedArray = [];

        if (melee) {
            weightedArray = weightedArray.concat(weightedArrayMelee);
            types = types.concat(typesMelee)
        }
        if (ranged) {
            weightedArray = weightedArray.concat(weightedArrayRanged);
            types = types.concat(typesRanged)
        }

        if (includeStaff) {
            weightedArray =  weightedArray.concat([3]);
            types = types.concat(["Quarterstaff"]);
        }

        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    /**
     * Dont't mind all the superfluous code here. This returns a random dragon color.
     * @returns {string} A dragon color
     */
    getRandomDragonType() {
        //All of my rankings, based on personality type, habitat, mating habits
        //Rarest to least rarest): Gold, Red, Blue, Silver, Bronze, Green, Brass, Copper, Black, White
        //Keep in mind that if you don't live in a frigid climate or near an icy mountain, you will never see a white dragon,
        // but if you live in a frigid climate, you will most likely have to deal with them.
        //Social least to most (all are): Bronze (helpful), Gold (helpful, sagacious), Copper (wit, entertainment), Brass (curious, talkative), Silver (love humanoids)
        //Isolationist most to least (all are antisocial): White (primal, vengeful, memory), Black (temper, cruel), Green (bully, manipulate, killers), Blue (vain, methodical, territorial), Red (arrogant, tyrannical)
        
        let types = {
            "Black": "Acid",
            "Blue": "Lightning",
            "Brass": "Fire",
            "Bronze": "Lightning",
            "Copper": "Acid",
            "Gold": "Fire",
            "Green": "Poison",
            "Red": "Fire",
            "Silver": "Cold",
            "White": "Cold"  //Beastial, dull, or stupid with a great memory
        };
        
        const dragonColors = Object.keys(types);
        const randomIndex = parseInt(Math.random() * dragonColors.length);

        return dragonColors[randomIndex];
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

    /**
     * Adds/changes properties of the item object that represents an enspelled item.
     * @param {magicItem} item 
     * @returns enspelledItem
     */
    getEnspelledItemVariant(item) {

        let updatedItem = structuredClone(item); //copy
        let schools = [];
        let spellLevel = parseInt(updatedItem.name.replace(/\D/g, '')) || 0; //filter out everything but the number
        let casterMetrics = this.getRandomCasterMetrics(spellLevel);
        let variantName = "Enspelled ";
        let itemTypeVariant = ""; //example: Dagger, Leather Armor, Plate Mail , Staff

        switch(updatedItem.category.toLowerCase()) {
            case "armor":
                schools = ["abjuration", "illusion"];
                itemTypeVariant = this.getRandomArmorType(true);
                break;
            case "staff":
                schools = ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"];
                itemTypeVariant = "Staff";
                break;
            case "weapon":
                schools = ["conjuration", "divination", "evocation", "necromancy", "transmutation"];
                itemTypeVariant = this.getRandomWeaponType();
                break;
            default:
                break;
        }
        variantName += itemTypeVariant;

        //add all the spells at spellLevel
        let filteredSpells = spells.filter(s => s.level == spellLevel && schools.includes(s.school.toLowerCase()))
                                .map(obj => ({ ...obj })); //creates copy/clone of the filtered objects

        //add all upcastable lower level spells (except cantrips)
        for (let i = spellLevel - 1; i > 0; i--) {
            filteredSpells = filteredSpells.concat(
                spells.filter(s => s.level == i && s.canUpcast && schools.includes(s.school.toLowerCase()))
                    .map(obj => ({ ...obj })) //creates copy/clone of the filtered objects
            );
        }

        let likabilityScores = [];
        filteredSpells.forEach(spell => {
            //using scroll likability for 2 reasons:
            //  1) scroll likability would be similar to an enspelled item.
            //  2) likability instead of rarityscore because we don't want to factor in scroll rarity on top of enspelled item rarity, because all variants are within the same tier/level
            const scroll = magicStore.getScroll(spell.name);
            likabilityScores.push(scroll.likability);
        });

// console.log('spellLevel: ' + spellLevel);
// console.log('filteredSpells...');
// console.table(filteredSpells);
// console.log('likabilityScores...');
// console.log(likabilityScores);


        //add the spell name to the variant name
        const idx = getWeightedRandomIndex(likabilityScores); //get a random spell index (weighted on likability)
        variantName += " - " + filteredSpells[idx].name;

        //add the spell level to the variant name
        if (spellLevel == 0 && filteredSpells[idx].canUpcast) {
            //Cantrip (uses caster level instead)
            variantName += "(Cantrip";
            if (casterMetrics.level >= 5) variantName += "*";
            variantName += ")";
        } else {
            //Regular spell
            variantName += "(" + spellLevel;
            if (spellLevel > filteredSpells[idx].level) variantName += "*";  // * denotes upcast
            variantName += ")";
        }

        updatedItem.variantName = variantName;
        updatedItem.spellName = filteredSpells[idx].name;
        updatedItem.originalSpellLevel = filteredSpells[idx].level;
        updatedItem.spellLevel = spellLevel;
        updatedItem.casterLevel = casterMetrics.level;
        updatedItem.price = this.getItemPrice(itemTypeVariant, updatedItem.rarity); //item price + rarity price
        updatedItem.proficiencyBonus = casterMetrics.profBonus;
        updatedItem.abilityMod = casterMetrics.abilityMod;
        updatedItem.attackBonus = casterMetrics.abilityMod + casterMetrics.profBonus;
        updatedItem.dc = 8 + casterMetrics.abilityMod + casterMetrics.profBonus;

        return updatedItem;
    },

    /**
     * Assigns random caster metrics to the crafted scroll.
     * @param {*} item 
     * @returns 
     */
    getSpellScrollVariant(item) {

        let updatedItem = structuredClone(item); //copy

        const spell = magicStore.getSpell(item.name);
        const casterMetrics = this.getRandomCasterMetrics(spell.level, false);

        updatedItem.originalSpellLevel = spell.level;
        updatedItem.spellLevel = spell.level;
        updatedItem.casterLevel = casterMetrics.level;
        updatedItem.proficiencyBonus = casterMetrics.profBonus;
        updatedItem.abilityMod = casterMetrics.abilityMod;
        updatedItem.attackBonus = casterMetrics.abilityMod + casterMetrics.profBonus;
        updatedItem.dc = 8 + casterMetrics.abilityMod + casterMetrics.profBonus;

        updatedItem.source = spell.source; //maybe should move this assignment to loading of scrolls?

        return updatedItem;
    },

    /**
     * Produces a caster object with: caster level, ability mod, prof bonus, attack bonus, dc.
     * The caster level is at least the min level needed to cast the given spellLevel.
     * A level is randomly chosen basen on a geometric progression of odds.
     * Each level's odds proportion is based on: spreadCoefficient^(20-Level)
     * @param {number} spellLevel 
     * @param {number} useLowestCasterLevel (Default true) True ensures the minimum caster level is used.
     * @returns casterMetrics object
     */
    getRandomCasterMetrics(spellLevel, useLowestCasterLevel = true) {

        const maxCasterLevel = 20;
        const minCasterLevel = parseInt(spellLevel * 2 - .5) || 1;
        let casterLevel = minCasterLevel; //default caster level

        //****************************************************************
        //***  Get random caster (based on odds) for given spellLevel  ***
        //****************************************************************
        if (useLowestCasterLevel == false) {
            //spreadCoefficient affects the rate of geometic progression per character level.
            //1 is equal proportions at each level, 2 is half the odds of being each level higher
            const spreadCoefficient = 1.5;

            //set the odds
            let cumLevelProportions = 0;
            let sumLevelProportions = 0;
            let levelProportions = [];

            for(let i = 0; i < maxCasterLevel - minCasterLevel; i++ ) {
                const levelProportion = spreadCoefficient**(maxCasterLevel - (i + 1));
                levelProportions.push(levelProportion);
                sumLevelProportions += levelProportion;
            }

            //pick caster level based on the odds
            let rnd = Math.random();
            for(let i = 0; i < maxCasterLevel - minCasterLevel; i++ ) {
                cumLevelProportions += levelProportions[i];
                const cumLevelOdds = cumLevelProportions / sumLevelProportions
                if (rnd <= cumLevelOdds) {
                    casterLevel = minCasterLevel + i;
                    break;
                }
            }
        }

        //************************
        //***  Setup Metrics  ****
        //************************
        let abilityMod = 3; //making assumption that all scroll makers will at least have a +3 ability mod
        if (casterLevel >= 8) {
            abilityMod = 5;
        } else if (casterLevel >= 4) {
            abilityMod = 4;
        }

        const profBonus = parseInt((casterLevel - 1) / 4) + 2;

        let caster = {
            level: casterLevel,
            abilityMod: abilityMod,
            profBonus: profBonus,
            attackBonus: abilityMod + profBonus,
            dc: 8 + abilityMod + profBonus
        }

        return caster;
    },

    /**
     * NOT IMPLEMENTED YET - waiting for getEnspelledItemVariant() to be implemented
     * 
     * Adds the price to make the non-magical version to the rarity price.
     * itemTypeVariants include: armor, weapons, arcane focuses.
     * @param {string} itemTypeVariant Examples: glaive, shortbow, plate armor, orb
     * @param {string} rarity common, uncommon, rare, very rare
     * @param {number} ignorePriceTheshold ignores the non-magical price less than or equal to this amount. Default is 10.
     * @returns 
     */
    getItemPrice(itemTypeVariant, rarity, ignorePriceTheshold = 10) {

        let itemPrices = {...armorPrices, ...weaponPrices, ...arcaneFocusPrices}; //non-magical prices

        let price = itemPrices[itemTypeVariant.toLowerCase()] || 0;
        if (price <= ignorePriceTheshold) price = 0;

        price +=  basePrices[rarity.toLowerCase()];

        return price;
    },

    getScrollOfTitalSummoningType() {
        const titans = ["Animal Lord", "Blob of Annihilation", "Colossus", "Elemental Cataclysm", "Empyrean", "Kraken", "Tarrasque"];
        const weightedArray = [15, 15, 15, 15, 15, 15, 10];
        const idx = getWeightedRandomIndex(weightedArray);
        return titans[idx];
    },

};

const armorPrices = {
    "padded armor": 5,
    "leather armor": 10,
    "studded leather armor": 45,
    "hide armor": 10,
    "chain shirt": 50,
    "scale mail": 50,
    "breastplate": 400,
    "half plate armor": 750,
    "ring mail": 30,
    "chain mail": 75,
    "splint armor": 200,
    "plate armor": 1500,
    "shield": 10,
};

const weaponPrices = {
    "club": .1,
    "dagger": 2,
    "greatclub": .2,
    "handaxe": 5,
    "javelin": .5,
    "light hammer": 2,
    "mace": 5,
    "quarterstaff": .2,
    "sickle": 1,
    "spear": 1,
    "dart": .05,
    "light crossbow": 25,
    "shortbow": 25,
    "sling": .1,
    "battleaxe": 10,
    "flail": 10,
    "glaive": 20,
    "greataxe": 30,
    "greatsword": 50,
    "halberd": 20,
    "lance": 10,
    "longsword": 15,
    "maul": 10,
    "morningsta": 15,
    "pike": 5,
    "rapier": 25,
    "scimitar": 25,
    "shortsword": 10,
    "trident": 5,
    "warhammer": 15,
    "war pick": 5,
    "whip": 2,
    "blowgun": 10, //for a blowgun??
    "hand crossbow": 75,
    "heavy crossbow": 50,
    "longbow": 50,
    "musket": 500,
    "pistol": 250
};

const arcaneFocusPrices = {
    "crystal": 10,
    "orb": 20,
    "rod": 10, 
    "staff": 5,
    "wand": 10
};
