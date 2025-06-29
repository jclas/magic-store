/**
 * These arrays are used for likability utilities, filtering, and picking
 */
//spells and magic items sourced from: PHB2024, XGE, TCE

/**
 * The MOST frequently used spell scrolls, within its level. (Top tier)
 * No cantrips. No rituals.
 */
const topScrolls1 = [
    "Shield", "Healing Word", "Cure Wounds", "Misty Step"
];

/**
 * Frequently used spell scrolls and super-clutch situational spells best used via spell scrolls.
 * Usually this is the top category for the best concentration spells.
 * No cantrips. No rituals (unless it has consumable components)
 */
const topScrolls2 = [
    "Banishment", "Bless", "Counterspell", "Faerie Fire",
    "Greater Invisibility", "Haste", "Hex", "Hunter's Mark", "Invisibility",
    "Mage Armor", "Prayer of Healing", "Raise Dead", "Revivify",
    "Sanctuary",
];

/**
 * Tertiary spell usage, or clutch situational spells best used via spell scrolls,
 * or I super-duper really wanna learn this spell, or give a spell from another category an extra bump.
 * No cantrips. No rituals (unless it has consumable components)
 */
const topScrolls3 = [
    "Absorb Elements", "Arcane Lock", "Armor of Agathys", "Control Water", "Dispel Magic", "Enlarge/Reduce",
    "Featherfall", "Find Greater Steed", "Find Steed", "Fly", "Goodberry",
    "Guiding Bolt", "Heat Metal", "Heroes' Feast", "Heroism",
    "Hold Person", "Knock", "Mirror Image",
    "Mordenkainen's Magnificent Mansion", "Polymorph", "Protection from Evil", 
    "See Invisibility", "Shadow Blade", "Silence", "Sleep", "Suggestion",
    "Tasha's Hideous Laughter", "Tasha's Bubbling Cauldron", "Tasha's Mind Whip", "True Seeing",
    "Vicious Mockery", "Web"


];

/**
 * ToDo: Add more spells to this.
 * incorporate this list into scroll likability and enspelled likability. 
 */
const topOffenseSpells = [
    "Chromatic Orb", "Fireball", "Lightning Bolt", "Melf's Minute Meteors", "Spirit Guardians",

];

/**
 * ToDo: incorporate this list into scroll likability and enspelled likability.
 *       Is there too much overlap with topDefenseSpells?
 */
const topControlSpells = [
    

];

//
/**
 * ToDo: incorporate this list into scroll likability and enspelled likability.
 *       Is there too much overlap with topControlSpells?
 */
const topDefenseSpells = [
    

];

//ToDo: use this. Consider removing them from "TopScrolls", or even remove all the TopScrolls lists
//      if we can div those up to more meaningful categories.
//Should I make several arrays 1 for each level they start kicking more ass? probably not;
//  this would probably only differentiate Bestow Curse and Major Image
const goodUpcastSpells = [
    "Aid", "Armor of Agathys", "Bane", "Banishment", "Bestow Curse", "Bless", "Blindness/Deafness",
    "Cause Fear", "Charm Monster", "Charm Person", "Chromatic Orb", "Counterspell",
    "Enhance Ability", "Fly", "Heroism", "Hold Monster", "Hold Person",
    "Invisibility", "Intellect Fortress", "Jump", "Longstrider", "Major Image", "Mass Suggestion",
    "Planar Binding", "Spirit Guardians", "Tasha's Mind Whip",
];

/**
 * ToDo: can this be renamed or re-organized? What kind of impacts?
 * Spells that generally have a high impact when they are used properly. 
 */
const highImpactSpells = [
    "Astral Projection", "Catnap", "Clone", "Conjure Animals", "Conjure Celestial", "Conjure Elemental",
    "Conjure Fey", "Conjure Minor Elementals", "Conjure Woodland Beings", "Contingency", "Demiplane",
    "Disintegrate", "Divine Word", "Fireball", "Foresight", "Forbiddance", "Gate", "Heroes' Feast",
    "Imprisonment", "Invulnerability",
    "Mass Cure Wounds", "Mass Heal", "Mass Healing Word", "Mass Polymorph", "Mass Suggestion",
    "Maze", "Melf's Minute Meteors", "Meteor Swarm", "Mordenkainen's Magnificent Mansion",
    "Mordenkainen's Sword", "Plane Shift", "Plant Growth", "Power Word Heal",
    "Power Word Kill", "Prismatic Wall", "Raise Dead", "Reverse Gravity", "Revivify",
    "Sequester", "Shapechange", "Silence",
    "Simulacrum", "Steel Wind Strike", "Storm of Vengeance", "Summon Aberration", "Summon Beast",
    "Summon Celestial", "Summon Construct", "Summon Draconic Spirit", "Summon Dragon", "Summon Elemental",
    "Summon Fey", "Summon Fiend", "Summon Greater Demon", "Summon Lesser Demons", "Summon Shadowspawn",
    "Summon Undead", "Sunburst", "Synaptic Static", "Tasha's Mind Whip", "Teleport", "Teleportation Circle",
    "Time Stop", "True Polymorph", "True Resurrection", "Tsunami",
];

/**
 * Any healing related, hp increasing, or body-restorative spells
 * No Rituals.
 */
const healingRelatedSpells1 = [
    "Aid", "Aura of Vitality", "Cure Wounds",
    "Greater Restoration", "Heal", "Healing Spirit", "Healing Word", "Heroism", "Heroes' Feast",
    "Lesser Restoration", "Mass Cure Wounds", "Mass Heal", "Mass Healing Word",
    "Power Word Heal", "Power Word Fortify", "Prayer of Healing", "Revivify",
];
const healingRelatedSpells2 = [
    "Arcane Vigor", "Armor of Agathys", "Aura of Life", "Aura of Purity", 
    "Beacon of Hope", "Death Ward", "False Life", 
    "Goodberry", "Life Transference", 
    "Protection from Poison", "Raise Dead", "Regenerate", "Reincarnate",
    "Remove Curse", "Resurrection",  "Soul Cage", "True Resurrection",
    "Vampiric Touch", "Warding Bond",
];

/**
 * No cantrips.
 */
const topUtilitySpells1 = [
    "Dimension Door", "Dispel Magic", "Featherfall", "Fly", "Polymorph",
];
const topUtilitySpells2 = [
    "Alter Self", "Arcane Eye", "Arcane Lock", "Bigby's Hand",
    "Commune with Nature", "Comprehend Languages", "Contingency", "Control Water",
    "Control Weather", "Demiplane", "Detect Magic", "Detect Thoughts",
    "Disguise Self",
    "Dragon's Breath", //good for familiars
    "Druid Grove", "Enlarge/Reduce",
    "Fabricate", "Faerie Fire",
    "Find Familiar", "Find Greater Steed", "Find Steed",
    "Gaseous Form", "Jump", "Knock",
    "Leomund's Secret Chest", "Leomund's Tiny Hut", "Levitate",
    "Locate Object", "Longstrider", "Major Image", "Mending", "Message",
    "Mighty Fortress",
    "Mold Earth", "Mordenkainen's Faithful Hound", "Mordenkainen's Magnificent Mansion",
    "Pass without Trace", "Phantom Steed", "Plant Growth", 
    "Purify Food and Drink", "Rary's Telepathic Bond", "Rope Trick", "Sending", 
    "Silent Image", "Soul Cage", "Speak with Animals", "Speak with Dead",
    "Speak with Plants", "Stone Shape", "Sorcerous Burst", "Tasha's Bubbling Cauldron",
    "Tasha's Mind Whip", "Teleport", "Teleportation Circle", "Tenser's Floating Disk",
    "Tongues", "Tiny Servant", "Unseen Servant", "Water Breathing", "Water Walk", "Web"
];

const nicheClutchScrolls = [
    "Dimension Door", "Enhance Ability", 
    "Fly", "Freedom of Movement",
    "Invisibility",
    "Pass Without Trace",
    "Revivify", 
    //"Death Ward"
];

//ToDo: move to spell.castingTime
const ritualSpells = [
    "Alarm", "Animal Messenger", "Augury", "Beast Sense", "Ceremony", "Commune", "Commune with Nature",
    "Comprehend Languages", "Contact Other Plane", "Detect Magic", "Detect Poison and Disease",
    "Divination", "Drawmij's Instant Summons", "Feign Death", "Find Familiar", "Forbiddance",
    "Gentle Repose", "Identify", "Illusory Script", "Leomund's Tiny Hut", "Locate Animals or Plants",
    "Magic Mouth", "Meld into Stone", "Phantom Steed", "Purify Food and Drink", "Rary's Telepathic Bond",
    "Silence", "Skywrite", "Speak with Animals", "Tenser's Floating Disk", "Unseen Servant",
    "Water Breathing", "Water Walk"
];

/**
 * Spells that do force damage. (rare resistance type)
 * Blade barrier is now force in 2024? weird!
 */
const forceDamageSpells = [
    "Bigby's Hand", "Magic Missle", "Blade Barrier",
    "Conjure Barrage", "Conjure Volley", "Conjure Woodland Beings",
    "Disintegrate", "Draconic Transformation", "Eldritch Blast", "Hunter's Mark",
    "Mordenkainen's Faithful Hound", "Shillelagh", "Spiritual Weapon",
    "Spray of Cards", "Steel Wind Strike", "Sword Burst", "Zephyr Strike"
];

/**
 * Spells that do radiant damage. (rare resistance type)
 */
const radiantDamageSpells = [
    "Blinding Smite", "Conjure Celestial", "Crusader's Mantle",
    "Dawn", "Destructive Wave", "Divine Favor", "Divine Smite", "Flame Strike",
    "Forbiddance", "Fount of Moonlight", "Guardian of Faith", "Guiding Bolt",
    "Holy Weapon", "Jallarzi's Storm of Radiance", "Moonbeam", "Sacred Flame",
    "Shining Smite", "Sickening Radiance", "Spirit Guardians", "Spirit Shroud",
    "Starry Wisp", "Sunbeam", "Sunburst", "True Strike", "Wall of Light",
    "Word of Radiance"
];

/**
 * Spells that do psychic damage. (rare resistance type)
 */
const psychicDamageSpells = [
    "Maddening Darkness", "Mental Prison", "Mind Sliver", "Mind Spike", "Psychic Scream",
    "Shadow Blade", "Synaptic Static", "Tasha's Mind Whip"
];


//***************************************************************************************/
//***************************************************************************************/
//***************************************************************************************/


const frequentUseMagicItems = [
    "potion of healing", "enspelled"
];

/**
 * Items that should get an extra rating boost just because of how great they are.
 */
const highImpactMagicItems = [
    "Cauldron of Rebirth", "Cloak of Displacement", "Deck of Many Things", "Ghost Step Tattoo",
    "Holy Avenger", "Manual of Bodily Health", "Manual of Gainful Exercise",
    "Manual of Quickness of Action", "Ring of Three Wishes",
    "Ring of Evasion", "Ring of Free Action", "Ring of Spell Storing",
    "Rod of Lordly Might", "Rod of Security", "Sphere of Annihilation", "Staff of Power",
    "Tome of Clear Thought", "Tome of Leadership and Influence", "Tome of Stilled Tongue",
    "Tome of Understanding", "Vorpal Sword"
];

const statBoosterMagicItems = [
    "Amulet of Health", "Amulet of the Devout", "Arcane Grimoire", "Belt of Giant Strength", "Bloodwell Vial",
    "Headband of Intellect", "Gauntlets of Ogre Power", "Ioun Stone",
    "Manual of Bodily Health", "Manual of Gainful Exercise", "Manual of Quickness of Action",
    "Moon Sickle", "Rod of the Pact Keeper",
    "Tome of Clear Thought", "Tome of Leadership and Influence", "Tome of Understanding",
    "Wand of the War Mage",  "Wraps of Unarmed Power"
];

const healingRelatedMagicItems = [
    "Amulet of Health", "Blood Fury Tattoo", "Cauldron of Rebirth", "Elixir of Health",
    "Ioun Stone (Fortitude)", "Keoghtom's Ointment", "Lifewell Tattoo", "Manual of Bodily Health",
    "Moon Sickle", "Necklace of Prayer Beads",
    "Periapt of Health", "Periapt of Proof Against Poison", "Periapt of Wound Closure",
    "Potion of Healing", "Potion of Heroism", "Potion of Longevity",
    "Potion of Vitality", "Ring of Regeneration", "Rod of Resurrection", "Rod of Security", "Staff of Healing"
];

const highUtilityMagicItems = [
    "Alchemy Jug", "Bag of Holding", "Boots of Elvenkind", "Boots of False Tracks", "Boots of Levitation",
    "Broom of Flying", "Cloak of Elvenkind", "Decanter of Endless Water", 
    "Feather Token", "Gloves of Thievery", "Hat of Disguise",
    "Immovable Rod", "Portable Hole", "Rod of Lordly Might", "Rope of Climbing",
    "Wand of Magic Detection"
];

/**
 * Consumable magic item identifying key words and phrases.
 * Purposefully leaving out: Ring of Three Wishes (too epic!), Rod of Absorption
 */
const consumableMagicItems = [
    "Ammunition", "Arrow of ", "Bag of Beans", "Bead of ", "Bolt of ", "Bullet of ", "Candle of ",
    "Chime of Opening", "Dust of ", "Elemental Gem", "Elixir", "Feather Token",
    "Marvelous Pigments", "Keoghtom's Ointment", "Oil of ", "Philter of ", "Potion",
    "Robe of Useful Items", "Scroll of ", "Sovereign Glue", "Tattoo", "Universal Solvent",
    "powder"
];

/**
 * Items used with Bonus Action.
 * Note: potions are not listed here and are noted as bonus action via category type elsewhere in code.
 */
const bonusActionMagicItems = [
    "dancing sword", "boots of speed", "bag of tricks", "necklace of prayer beads", "quaal's feather token",
    "scimitar of speed",
]

/**
 * Item has a power, that is similar to a spell, and that spell would normally require concentration,
 * but the item does not.
 */
const foregoConcentrationMagicItems = [
    "Blackrazor", "Boots of Speed", "Broom of Flying", "Cloak of Displacement",
    "Cloak of Invisibility", "Coiling Grasp Tattoo",
    "Potion of Clairvoyance", "Potion of Diminution", "Potion of Flying", "Potion of Gaseous Form",
    "Potion of Greater Invisibility", "Potion of Growth", "Potion of Heroism", "Potion of Invisibility",
    "Potion of Levitation", "Potion of Mind Reading", "Potion of Speed", "Ring of Invisibility",
    "Winged Boots", "Wings of Flying"
];

/**
 * An item that has a feature similar to a spell that would expend material components.
 */
const foregoConsumedComponentMagicItems = [
    "rod of resurrection", "Amulet of the Planes", "Robe of Stars", "Staff of Healing", "Staff of the Magi",
];
/**
 * Note: Efreeti Bottle--even though only partially true, this item is so powerful I kept it in the list for a bump up.
 * Leaving out Crystal Ball because IT IS the expensive component for Scrying, so it doesn't remove the need for a component.
 */
const foregoExpensiveComponentMagicItems = [
    "rod of resurrection", "Amulet of the Planes", "Efreeti Bottle", "Staff of Healing", "Staff of the Magi",
];

/**
 * There's a lot of lame common items, some ok ones, and some good ones.
 * Here are some of the more useful ones.
 * I left some out even if they're useful, just because I think they're stupid.
 * Scrolls/Tattoos are not in this list.
 */
const usefulCommonMagicItems1 = [
    "Bead of Nourishment", "Bead of Refreshment", "Boots of False Tracks",
    "Dark Shard Amulet", "Hat of Wizardry",
    "Horn of Silent Alarm", "Moon-Touched Sword",
    "Potion of Climbing",  "Potion of Healing",
    "Ruby of the War Mage",
    "Silvered Weapon", "Sylvan Talon", "Unbreakable Arrow", "Walloping Ammunition"
];

/**
 * Tier-2 of useful common items--better than average.
 * Scrolls/Tattoos are not in this list.
 *
 */
const usefulCommonMagicItems2 = [
    "Cast-Off Armor", "Clockwork Amulet", "Heward's Handy Spice Pouch",
    "Lock of Trickery", "Mystery Key", "Pot of Awakening", "Potion of Comprehension"
];

/**
 * Bottom-tier - Has little to no utility.
 * Scrolls/Tattoos are not in this list.
 */
const bottomTierCommonMagicItems = [
    'Armor of Gleaming', 'Cloak of Billowing', 'Cloak of Many Fashions', 'Clothes of Mending', 'Dread Helm',
    "Pipe of Smoke Monsters", "Rope of Mending",
    "Pole of Angling", "Pole of Collapsing",
    "Shield of Expression", "Smoldering Armor", "Staff of Adornment", "Staff of Birdcalls", "Staff of Flowers",
    "Tankard of Sobriety", "Wand of Conducting", "Wand of Pyrotechnics", "Wand of Scowls", "Wand of Smiles"
];

//***************************************************************************************/
//***************************************************************************************/
//***************************************************************************************/

/**
 * Recognizes potions, scrolls, tattoos, and other consumables.
 * Keeping tattoo recognized as category or in name (because it normally is considered a wondrous item.)
 * @param {*} item Can be an item or a name of an item. If an item, then it has to have the name property.
 * @returns 
 */
function isConsumable(item) {

    const consumables = [
        "ammunition", "arrow of ", "bag of beans", "bead of ", "bolt of ", "bullet of ",
        "chime of opening", "dust of ", "elemental gem", "feather token",
        "marvelous pigments", "ointment", "robe of useful items", "sovereign glue",
        "tattoo", "universal solvent", "powder"
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
}

// Helper: checks if any name is in the list
function hasListMatch(searchName, list) {
    const normalizedSearchName = normalizeSpellName(searchName);
    return list.some(n => normalizeSpellName(n) === normalizedSearchName);  //exact match of one in the list
}

// Helper: checks if any keyword/phrase in arr is found in str (case-insensitive)
function hasWildcardListMatch(str, arr) {
    if (!str) return false;
    const lowerStr = str.toLowerCase();
    return arr.some(keyword => lowerStr.includes(keyword.toLowerCase()));
}
