
/**
 * Client-side script to fetch/update likability in magic-items.json based on various factors.
 */
async function updateMagicItemLikability() {
    // Load magicitems.json
    const response = await fetch('magic-items.json');
    const items = await response.json();

    //These array elements are treated like keywords and key-phrases.

    /**
     * Items that should get an extra rating boost just because of how great they are.
     */
    const highImpact = [
        "Cauldron of Rebirth", "Cloak of Displacement", "Deck of Many Things", "Ghost Step Tattoo",
        "Holy Avenger", "Manual of Bodily Health", "Manual of Gainful Exercise",
        "Manual of Quickness of Action", "Ring of Three Wishes",
        "Ring of Evasion", "Ring of Free Action",
        "Rod of Lordly Might", "Rod of Security", "Sphere of Annihilation", "Staff of Power",
        "Tome of Clear Thought", "Tome of Leadership and Influence", "Tome of Stilled Tongue",
        "Tome of Understanding", "Vorpal Sword"
    ];

    /*
    const recharges = [
        "Amulet of the Planes", "Anstruth Harp", "Astral Shard", "Black Dragon Mask", "Blue Dragon Mask",
        "Boots of Speed", "Cauldron of Rebirth", "Canaith Mandolin", "Cli Lyre", "Crystalline Chronicle",
        "Cube of Force", "Cubic Gate", "Decanter of Endless Water", "Doss Lute", "Efreeti Bottle",
        "Elemental Essence Shard", "Enspelled", "Far Realm Shard",
        "Fochlucan Bandore", "Folding Boat", "Fulminating Treatise", "Ghost Step Tattoo", "Green Dragon Mask",
        "Harp of Discord", "Heart Weaver's Primer", "Heward's Handy Spice Pouch", "Horn of Silent Alarm",
        "Horn of Valhalla", "Instrument of Illusions", "Instrument of Scribing", "Libram of Souls and Flesh",
        "Lyre of Building", "Mac-Fuirmidh Cithern", "Medallion of Thoughts", "Necklace of Prayer Beads",
        "Ollamh Harp", "Orb of Command", "Orb of Dragonkind", "Orb of the Eternal Light",
        "Periapt of Wound Closure", "Pipes of the Sewers", "Red Dragon Mask",
        "Rhythm Maker's Drum", "Ring of the Djinni Summoning", "Ring of Shooting Stars", "Ring of the Ram",
        "Robe of Stars", "Rod of the Pact Keeper",
        "Rod of Resurrection", "Rod of Security", "Shadowfell Shard", "Spirit Board",
        "Staff of Adornment", "Staff of Birdcalls", "Staff of Charming",
        "Staff of Fire", "Staff of Frost", "Staff of Healing", "Staff of Swarming Insects", "Staff of the Magi",
        "Staff of Power", "Staff of Striking", "Staff of Thunder and Lightning",
        "Staff of the Woodlands", "Stone of Controlling Earth Elementals",
        "Talisman of Pure Good", "Talisman of Ultimate Evil", "Tome of the Stilled Tongue", "Wand of Binding",
        "Wand of Conducting", "Wand of Enemy Detection", "Wand of Fear", "Wand of Fireballs",
        "Wand of Lightning Bolts", "Wand of Magic Detection","Wand of Magic Missiles", "Wand of Paralysis",
        "Wand of Polymorph", "Wand of Pyrotechnics", "Wand of Scowls", "Wand of Smiles", "Wand of Web",
        "Wave", "White Dragon Mask", "Wind Fan", "Winged Boots", "Wings of Flying"
    ];
*/

    const statBoosters = [
        "Amulet of Health", "Belt of Giant Strength", "Headband of Intellect", "Ioun Stone",
        "Manual of Bodily Health", "Manual of Gainful Exercise", "Manual of Quickness of Action",
        "Tome of Clear Thought", "Tome of Leadership and Influence", "Tome of Understanding",
        "Wand of the War Mage"
    ];

    const healingRelated = [
        "healing", "health",
        "Amulet of Health",
        "Blood Fury Tattoo",
        "Cauldron of Rebirth",
        "Elixir of Health",
        "Ioun Stone (Fortitude)",
        "Keoghtom's Ointment",
        "Lifewell Tattoo",
        "Manual of Bodily Health",
        "Necklace of Prayer Beads",
        "Periapt of Health",
        "Periapt of Proof Against Poison",
        "Periapt of Wound Closure",
        "Potion of Greater Healing",
        "Potion of Healing",
        "Potion of Heroism",
        "Potion of Longevity",
        "Potion of Superior Healing",
        "Potion of Supreme Healing",
        "Potion of Vitality",
        "Restorative Ointment",
        "Ring of Regeneration",
        "Rod of Resurrection",
        "Rod of Security",
        "Staff of Healing"
    ];

    const highUtility = [
        "Alchemy Jug", "Bag of Holding", "Boots of Elvenkind", "Boots of Levitation",
        "Broom of Flying", "Cloak of Elvenkind", "Decanter of Endless Water", 
        "Enspelled", "Feather Token", "Gloves of Thievery", "Hat of Disguise",
        "Immovable Rod", "Portable Hole", "Rod of Lordly Might", "Rope of Climbing", "Wand of Magic Detection"
    ];

    /**
     * Consumable magic item identifying key words and phrases.
     * Purposefully leaving out: Ring of Three Wishes (too epic!), Rod of Absorption
     */
    const consumables = [
        "Ammunition", "Arrow of ", "Bag of Beans", "Bead of ", "Bolt of ", "Bullet of ",
        "Chime of Opening", "Dust of ", "Elemental Gem", "Elixir", "Feather Token",
        "Marvelous Pigments", "Ointment", "Oil of ", "Philter of ", "Potion",
        "Robe of Useful Items", "Scroll of ", "Sovereign Glue", "Universal Solvent", "powder"
    ];

    /**
     * Has a power, that is similar to a spell, that normally requires concentration.
     */
    const foregoConcentration = [
        "Blackrazor", "Boots of Speed", "Broom of Flying", "Cloak of Displacement",
        "Cloak of Invisibility", "Coiling Grasp Tattoo",
        "Potion of Clairvoyance", "Potion of Diminution", "Potion of Flying", "Potion of Gaseous Form",
        "Potion of Greater Invisibility", "Potion of Growth", "Potion of Heroism", "Potion of Invisibility",
        "Potion of Levitation", "Potion of Mind Reading", "Potion of Speed", "Ring of Invisibility",
        "Winged Boots", "Wings of Flying"
    ];

    const foregoConsumedComponents = [
        "resurrection", "Amulet of the Planes", "Robe of Stars", "Staff of Healing", "Staff of the Magi",
    ];
    /**
     * Note: Efreeti Bottle--even though only partially true, this item is so powerful I kept it in the list for a bump up.
     * Leaving out Crystal Ball because IT IS the expensive component for Scrying, so it doesn't remove the need for a component.
     */
    const foregoExpensiveComponents = [
        "teleport", "resurrection", "Amulet of the Planes", "Efreeti Bottle", "Staff of Healing", "Staff of the Magi",
    ];

    // Helper: checks if any keyword/phrase in arr is found in str (case-insensitive)
    function matchesAnyKeyword(str, arr) {
        if (!str) return false;
        const lowerStr = str.toLowerCase();
        return arr.some(keyword => lowerStr.includes(keyword.toLowerCase()));
    }

    // Calculate likability for each item
    for (const item of items) {
        let baseLikability = 0.3;
        let likability = baseLikability;
        // Positive bumps
        //if (matchesAnyKeyword(item.name, frequentUse)) likability += 0.30;
        if (matchesAnyKeyword(item.name, highImpact)) likability += 0.3;
        //if (item.magicType.toLowerCase() == "major" && matchesAnyKeyword(item.name, recharges)) likability += 0.20;
        if (matchesAnyKeyword(item.name, statBoosters)) likability += 0.20;
        if (matchesAnyKeyword(item.name, healingRelated)) likability += 0.40;
        if (matchesAnyKeyword(item.name, highUtility)) likability += 0.15;
        if (matchesAnyKeyword(item.name, foregoConsumedComponents)) likability += 0.10;
        if (matchesAnyKeyword(item.name, foregoExpensiveComponents)) likability += 0.10;
        if (likability > baseLikability) {
            if (matchesAnyKeyword(item.name, foregoConcentration)) likability += .2;
        }
        // Negative bumps
        //if (matchesAnyKeyword(item.name, nicheItems)) likability -= 0.15;
        // if (matchesAnyKeyword(item.name, infrequentUse)) likability -= 0.10;

        // Clamp to range
        if (likability < 0.1) likability = 0.1;

        item.likability = Number(likability.toFixed(3));
    }

    // Download updated file
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'magic-items-likability-updated.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Likability updated and file downloaded.');
}
