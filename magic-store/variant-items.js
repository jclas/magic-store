/*
 * The intention of this file is to house all code to determine a magic item's variations.
 * For example: Armor +1 could be Leather Armor +1 or Breastplate +1.
 * 
 */



const randomItemVariants = {

    //ToDo: finish this
    getVariantName(name) {
        const nameLower = name.toLowerCase();

        if (nameLower == "adamantine armor") {
            return "Adamantine " + this.getRandomMetalArmorType();
        }

        if (nameLower.startsWith("ammunition +")) {
            return name.replace(/ammunition/i, this.getRandomAmmoType()) + " (x10)";
        }

        if (nameLower == "ammunition of slaying") {
            return this.getRandomAmmoType() + " of " + this.getRandomCreatureType() + " Slaying (x10)";
        }

        if (nameLower.startsWith("armor +")) {
            return this.getRandomArmorType() + " " + name;
        }
        
        if (nameLower.startsWith("armor of gleaming")) {
            return this.getRandomArmorType() + " " + name;
        }
        
        if (nameLower.startsWith("armor of resistance")) {
            return this.getRandomArmorType() + " " + name;
        }

        if (nameLower == "cast-off armor") {
            return "Cast-off " + this.getRandomArmorType() + " Armor";
        }

        if (nameLower == "dragon scale armor") {
            return name + " (" + this.getRandomDragonType() + ")";
        }

        if (nameLower.startsWith("enspelled armor")) {
            let level = parseInt(name.replace(/\D/g, '')) || 0; //filter out everything but the number
            return  this.getEnspelledArmorVariant(level);
        }

        if (nameLower.startsWith("enspelled staff")) {
            let level = parseInt(name.replace(/\D/g, '')) || 0; //filter out everything but the number
            return this.getEnspelledStaffVariant(level);
        }

        if (nameLower.startsWith("enspelled weapon")) {
            let level = parseInt(name.replace(/\D/g, '')) || 0; //filter out everything but the number
            return this.getEnspelledWeaponVariant(level);
        }

        if (nameLower == "flame tongue") {
            return name + " (" + this.getRandomWeaponType(true, false) + ")"; 
        }

        if (nameLower == "frost brand") {
            const weapons = ["Glaive", "Greatsword", "Longsword", "Rapier", "Scimitar", "Shortsword"];
            return name + " (" + weapons[getWeightedRandomIndex([1,1,1,1,1,1])] + ")";
        }

        if (nameLower == "giant slayer") {
            return name + " (" + this.getRandomWeaponType() + ")";
        }

        if (nameLower == "holy avenger") {
            return name + " (" + this.getRandomWeaponType() + ")";
        }

        if (nameLower == "luck blade") {
            const weapons = ["Glaive", "Greatsword", "Longsword", "Rapier", "Scimitar", "Sickle", "Shortsword"];
            return name + " (" + weapons[getWeightedRandomIndex([1,1,1,1,1,1,1])] + ")";
        }

        if (nameLower == "mariner's armor") {
            // return name + " (" + this.getRandomArmorType() + ")";
            return name.replace(/armor/i, this.getRandomArmorType()) + " Armor";
        }
        
        if (nameLower == "mithral armor") {
            return name.replace(/armor/i, this.getRandomMetalArmorType());
        }

        if (nameLower == "moonblade") {
            const weapons = ["Greatsword", "Longsword", "Rapier", "Scimitar", "Shortsword"];
            return name + " (" + weapons[getWeightedRandomIndex([1,1,1,1,1])] + ")";
        }

        if (nameLower.startsWith("moon-touched")) {
            const weapons = ["Glaive", "Greatsword", "Longsword", "Rapier", "Scimitar", "Shortsword"];
            return "Moon-touched " + weapons[getWeightedRandomIndex([1,1,1,1,1,1])];
        }

        if (nameLower == "nine lives stealer") {
            return name + "(" + this.getRandomWeaponType() + ")";
        }

        if (nameLower == "oathbow") {
            const weapons = ["Longbow", "Shortbow"];
            return name + " (" + weapons[getWeightedRandomIndex([1,1])] + ")";
        }

        if (nameLower == "plate armor of etherealness") {
            const armors = ["Plate", "Half Plate"];
            return name + " (" + armors[getWeightedRandomIndex([1,1])] + ")";
        }

        if (nameLower == "smoldering armor") {
            return "Smoldering " + this.getRandomArmorType() + " Armor";
        }
        
        if (nameLower == "scroll of titan summoning") {
            return name + " (" +this.getScrollOfTitalSummoningType() + ")";
        }

        if (nameLower == "sword of life stealing") {
            //ToDo:
            
        }

        return "";
    },

    getRandomAmmoType() {

        const types = ["Arrow", "Bolt", "Firearm Bullet", "Sling Bullet", "Needle"];
        const weightedArray = [.40, .40, .02, .10, .08]; //This is somewhat arbitrary. Do what you want.
        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    getRandomArmorType() {

        const types = ["Padded", "Leather", "Studded Leather", "Hide", "Chain Shirt", "Scale Mail", "Breastplate", "Half Plate", "Ring Mail", "Chain Mail", "Splint", "Plate"];
        const weightedArray = [1, 1, 4, 1, 4, 1, 4, 4, 1, 4, 1, 4]; //This is somewhat arbitrary. Do what you want.
        const weightedIndex = getWeightedRandomIndex(weightedArray);

        return types[weightedIndex];
    },

    
    getRandomMetalArmorType() {

        const types = ["Chain Shirt", "Scale Mail", "Breastplate", "Half Plate", "Ring Mail", "Chain Mail", "Splint", "Plate"];
        const weightedArray = [4, 1, 4, 4, 1, 4, 1, 4]; //This is somewhat arbitrary. Do what you want.
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
            "White": "Cold"  //dull or stupid with a great memory
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

    //ToDo: finish
    getEnspelledArmorVariant(level) {

        const schools = ["abjuration", "illusion"];

        let filteredSpells = spells.filter(s => s.level == level && schools.includes(s.school.toLowerCase()))
                                .map(obj => ({ ...obj })); //creates copy/clone of the filtered objects

        //add all the upcastable spells
        for (let i = level - 1; i > 0; i--) {
            filteredSpells = filteredSpells.concat(
                spells.filter(s => s.level == i && s.canUpcast && schools.includes(s.school.toLowerCase()))
                      .map(obj => ({ ...obj })) //creates copy/clone of the filtered objects
            );
        }

        let likabilityScores = [];
        filteredSpells.forEach(spell => {
            //using scroll likability for 2 reasons:
            //  1) scroll likability would be similar to an enspelled item.
            //  2) likability instead of rarityscore because we don't want to factor in scroll rarity on top of enspelled item rarity.
            const scroll = magicStore.getScroll(spell.name);
            likabilityScores.push(scroll.likability);
        });

        const idx = getWeightedRandomIndex(likabilityScores);

        if (level == 0) level = this.getCantripCasterLevel(); //probably still 0, but maybe 5, 11, or 17

        const upcastStep = level - filteredSpells[idx].level;

        let variantName = "Enspelled " + this.getRandomArmorType() + " Armor of " + filteredSpells[idx].name;

        if (upcastStep) variantName += "(" + level + ")";

        return variantName;
    },

    getEnspelledWeaponVariant(level) {

        const schools = ["conjuration", "divination", "evocation", "necromancy", "transmutation"];

        let filteredSpells = spells.filter(s => s.level == level && schools.includes(s.school.toLowerCase()))
                                .map(obj => ({ ...obj })); //creates copy/clone of the filtered objects

        //add all the upcastable spells
        for (let i = level - 1; i > 0; i--) {
            filteredSpells = filteredSpells.concat(
                spells.filter(s => s.level == i && s.canUpcast && schools.includes(s.school.toLowerCase()))
                      .map(obj => ({ ...obj })) //creates copy/clone of the filtered objects
            );
        }

        let likabilityScores = [];
        filteredSpells.forEach(spell => {
            //using scroll likability for 2 reasons:
            //  1) scroll likability would be similar to an enspelled item.
            //  2) likability instead of rarityscore because we don't want to factor in scroll rarity on top of enspelled item rarity.
            const scroll = magicStore.getScroll(spell.name);
            likabilityScores.push(scroll.likability);
        });

        const idx = getWeightedRandomIndex(likabilityScores);

        if (level == 0) level = this.getCantripCasterLevel(); //probably still 0, but maybe 5, 11, or 17

        const upcastStep = level - filteredSpells[idx].level;

        let variantName = "Enspelled " + this.getRandomWeaponType() + " of " + filteredSpells[idx].name;
    
        if (upcastStep) variantName += "(" + level + ")";

        return variantName;
    },

    getEnspelledStaffVariant(level) {

        const schools = ["conjuration", "divination", "evocation", "necromancy", "transmutation"];

        let filteredSpells = spells.filter(s => s.level == level && schools.includes(s.school.toLowerCase()))
                                .map(obj => ({ ...obj })); //creates copy/clone of the filtered objects

        //add all the upcastable spells
        for (let i = level - 1; i > 0; i--) {
            filteredSpells = filteredSpells.concat(
                spells.filter(s => s.level == i && s.canUpcast && schools.includes(s.school.toLowerCase()))
                      .map(obj => ({ ...obj })) //creates copy/clone of the filtered objects
            );
        }

        let likabilityScores = [];
        filteredSpells.forEach(spell => {
            //using scroll likability for 2 reasons:
            //  1) scroll likability would be similar to an enspelled item.
            //  2) likability instead of rarityscore because we don't want to factor in scroll rarity on top of enspelled item rarity.
            const scroll = magicStore.getScroll(spell.name);
            likabilityScores.push(scroll.likability);
        });

        const idx = getWeightedRandomIndex(likabilityScores);

        if (level == 0) level = this.getCantripCasterLevel(); //probably still 0, but maybe 5, 11, or 17

        const upcastStep = level - filteredSpells[idx].level;

        let variantName = "Enspelled Staff of " + filteredSpells[idx].name;
    
        if (upcastStep) variantName += "(" + level + ")";

        return variantName;
    },

    /**
     * I base these upgrade odds on what percentage of casters are level 1+, 5+, 11+, and 17+
     */
    getCantripCasterLevel() {
        let casterLevel = 0;
        let x = Math.random();

        if (x > 0.802710533866) casterLevel = 5;
        if (x > 0.982954072545) casterLevel = 11;
        if (x > 0.998777922306) casterLevel = 17;
        
        return casterLevel;
    },

    getScrollOfTitalSummoningType() {
        const titans = ["Animal Lord", "Blob of Annihilation", "Colossus", "Elemental Cataclysm", "Empyrean", "Kraken", "Tarrasque"];
        const weightedArray = [15, 15, 15, 15, 15, 15, 10];
        const idx = getWeightedRandomIndex(weightedArray);
        return titans[idx];
    },

};

/**
 * Abjuration or Illusion spells
 * Perhaps use this list only for levels 0-3, then use full list 4+
 * Maybe give a 10% chance of a spell not on this list (but still in the proper spell schools)
 * Possibly give a 5% chance to use a lower spell that is upcast.
 * Cross-reference the spell list to get level.
 */
const bestEnspelledArmorSpells = [
    "Absorb Elements", "Aid", "Arcane Vigor", "Armor of Agathys", "Aura of Life", "Aura of Purity",
    "Aura of Vitality", "Banishment", "Beacon of Hope", "Blade Ward", "Blur", "Color Spray", "Counterspell",
    "Cure Wounds", "Death Ward", "Disguise Self", "Dispel Magic", "Fear", "Freedom of Movement",
    "Greater Invisibility", "Hallucinatory Terrain", "Healing Word", "Hypnotic Pattern", "Intellect Fortress",
    "Invisibility", "Lesser Restoration", "Mass Healing Word", "Mirror Image", "Mordenkainen's Private Sanctum",
    "Nondetection", "Nystul's Magic Aura", "Pass without Trace", "Phantasmal Force", "Phantasmal Killer",
    "Phantom Steed", "Prayer of Healing",
    "Protection from Energy", "Protection from Evil and Good", "Protection from Poison",
    "Remove Curse", "Resistance", "Sanctuary", "Shadow Blade", "Shield of Faith", "Shield", "Silence",
    "Warding Bond"
];

//Conjuration. Divination, Evocation, Necromancy, or Transmutation spells
//Hmmm probably not needed. Just pick a random spell from those schools
// const bestEnspelledWeaponSpells = [
// ];

//Any spell school
//Hmmm probably not needed. Just pick a random spell from those schools
// const bestEnspelledStaffSpells = [
// ];

