// Spells listed in these const arrays are sourced from: PHB2024, XGE, TCE
// Various spell lists grouped by various notable aspects

/**
 * Based on frequent use within its level
 */
const frequentUse = [
    "Armor of Agathys", "Absorb Elements", "Banishment", "Bless", "Counterspell", "Cure Wounds",
    "Dancing Lights", "Detect Evil and Good", "Detect Magic", "Dispel Magic", "Eldritch Blast",
    "Find Familiar", "Find Greater Steed", "Find Steed", 
    "Fly", "Goodberry", "Greater Invisibility", "Guidance", "Guiding Bolt", "Healing Word", "Hex",
    "Haste", "Hold Person", "Hunter's Mark", "Identify", "Invisibility", "Light", "Mage Armor",
    "Magic Missile", "Misty Step", "Mirror Image", "Minor Illusion", "Pass without Trace",
    "Phantom Steed", "Polymorph", "Prestidigitation", "Protection from Evil and Good",
    "Revivify", "Sanctuary",
    "See Invisibility", "Shillelagh", "Shield", "Sleep", "Spare the Dying", "Spiritual Weapon",
    "Suggestion", "Thaumaturgy", "Vicious Mockery", "Web"
];

/**
 * Spells that generally have a high impact when they are used properly.
 */
const highImpact = [
    "Astral Projection", "Catnap", "Clone", "Conjure Animals", "Conjure Celestial", "Conjure Elemental",
    "Conjure Fey", "Conjure Minor Elementals", "Conjure Woodland Beings", "Contingency", "Demiplane",
    "Disintegrate", "Divine Word", "Fireball", "Foresight", "Forbiddance", "Gate", "Heroes' Feast",
    "Imprisonment", "Invulnerability", "Mass Heal", "Mass Polymorph", "Mass Suggestion", "Maze",
    "Melf's Minute Meteors", "Meteor Swarm", "Mordenkainen's Magnificent Mansion",
    "Mordenkainen's Sword", "Plane Shift", "Plant Growth", "Power Word Heal",
    "Power Word Kill", "Prismatic Wall", "Raise Dead", "Reverse Gravity", "Sequester",
    "Shapechange", "Silence",
    "Simulacrum", "Steel Wind Strike", "Storm of Vengeance", "Summon Aberration", "Summon Beast",
    "Summon Celestial", "Summon Construct", "Summon Draconic Spirit", "Summon Dragon", "Summon Elemental",
    "Summon Fey", "Summon Fiend", "Summon Greater Demon", "Summon Lesser Demons", "Summon Shadowspawn",
    "Summon Undead", "Sunburst", "Synaptic Static", "Tasha's Mind Whip", "Teleport", "Teleportation Circle",
    "Time Stop", "True Polymorph", "True Resurrection", "Tsunami", "Wish"
];

/**
 * Any healing related, hp increasing, or body-restorative spells
 */
const healingRelated = [
    "Aid", "Arcane Vigor", "Armor of Agathys", "Aura of Life", "Aura of Purity", "Aura of Vitality",
    "Beacon of Hope", "Cure Wounds", "Death Ward", "False Life", "Gentle Repose", "Goodberry",
    "Greater Restoration", "Heal", "Healing Spirit", "Healing Word", "Heroism", "Heroes' Feast",
    "Lesser Restoration", "Life Transference", "Mass Cure Wounds", "Mass Heal", "Mass Healing Word",
    "Power Word Fortify", "Power Word Heal",
    "Prayer of Healing", "Protection from Poison", "Raise Dead", "Regenerate", "Reincarnate",
    "Remove Curse", "Resurrection", "Revivify", "Soul Cage", "Spare the Dying", "True Resurrection",
    "Vampiric Touch", "Warding Bond", "Wish"
];

const utility = [
    "Alter Self", "Arcane Eye", "Arcane Lock", "Bigby's Hand", "Chaos Bolt", "Chromatic Orb",
    "Commune with Nature", "Comprehend Languages", "Contingency", "Control Water",
    "Control Weather", "Dancing Lights", "Demiplane", "Detect Magic", "Detect Thoughts",
    "Dimension Door", "Disguise Self", "Dispel Magic", "Druid Grove", "Druidcraft",
    "Enlarge/Reduce", "Fabricate", "Faerie Fire", "Featherfall",
    "Find Familiar", "Find Greater Steed", "Find Steed", 
    "Fly", "Gaseous Form", "Greater Invisibility", "Guidance", "Invisibility",
    "Knock", "Legend Lore", "Leomund's Secret Chest", "Leomund's Tiny Hut",
    "Levitate", "Light", "Locate Object", "Longstrider", "Mage Hand", "Magic Mouth",
    "Mending", "Message", "Mighty Fortress", "Mind Sliver", "Minor Illusion", "Misty Step",
    "Mold Earth", "Mordenkainen's Faithful Hound", "Mordenkainen's Magnificent Mansion",
    "Pass without Trace", "Phantom Steed", "Plant Growth", "Polymorph", "Prestidigitation",
    "Purify Food and Drink", "Rary's Telepathic Bond",
    "Rope Trick", "Sending", "Silent Image", "Soul Cage", "Speak with Animals", "Speak with Dead",
    "Speak with Plants", "Stone Shape", "Tasha's Bubbling Cauldron", "Tasha's Mind Whip",
    "Teleport", "Teleportation Circle", "Tenser's Floating Disk", "Tongues", "Tiny Servant",
    "Unseen Servant", "Water Breathing", "Water Walk", "Wish", "Web"
];

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
const forceDamage = [
    "Bigby's Hand", "Magic Missle", "Blade Barrier",
    "Conjure Barrage", "Conjure Volley", "Conjure Woodland Beings",
    "Disintegrate", "Draconic Transformation", "Eldritch Blast", "Hunter's Mark",
    "Mordenkainen's Faithful Hound", "Shillelagh", "Spiritual Weapon",
    "Spray of Cards", "Steel Wind Strike", "Sword Burst", "Zephyr Strike"
];

/**
 * Spells that do radiant damage. (rare resistance type)
 */
const radiantDamage = [
    "Blinding Smite", "Branding Smite", "Conjure Celestial", "Crusader's Mantle",
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
const psychicDamage = [
    "Maddening Darkness", "Mental Prison", "Mind Sliver", "Mind Spike", "Psychic Scream",
    "Shadow Blade", "Synaptic Static", "Tasha's Mind Whip"
];

// Spells with gp-cost components (consumed or not)
const componentCost = [
    "Arcane Lock", // gold dust worth 25 gp, consumed
    "Astral Projection", // one jacinth worth 1,000 gp and one silver bar worth 100 gp per creature, consumed
    "Awaken", // agate worth 1,000 gp, consumed
    "Chromatic Orb", // diamond worth 50 gp, not consumed
    "Clone", // diamond worth 1,000 gp + vessel worth 2,000 gp, both consumed
    "Commune", // incense and ivory strips worth 250 gp, consumed
    "Contingency", // ivory statuette worth 1,500 gp, consumed
    "Contact Other Plane", // incense and ivory strips worth 250 gp, consumed
    "Nondetection", // powdered diamond worth 25 gp, consumed  
    "Continual Flame", // ruby dust worth 50 gp, consumed
    "Create Homunculus", // jewel worth 1,000 gp, consumed (XGE)
    "Create Undead", // onyx gems worth 150 gp per corpse, consumed
    "Drawmij's Instant Summons", // sapphire worth 1,000 gp, consumed
    "Find Familiar", // charcoal, incense, herbs worth 10 gp, consumed
    "Forcecage", // ruby dust worth 1,500 gp, consumed
    "Forbiddance", // incense, rare oils, holy water worth 1,000 gp/60-ft cube, consumed
    "Gate", // diamond worth 5,000 gp, consumed
    "Glyph of Warding", // incense and powdered diamond worth 200 gp, consumed
    "Hallow", // herbs, oils, and incense worth 1,000 gp, consumed
    "Heroes' Feast", // jeweled bowl worth 1,000 gp, consumed
    "Identify", // pearl worth 100 gp, not consumed
    "Imprisonment", // special item worth ≥ 500 gp, consumed
    "Legend Lore", // incense worth 250 gp + four ivory strips worth 50 gp each, all consumed
    "Leomund's Secret Chest", // chest worth 5,000 gp, not consumed
    "Magic Circle", // powdered silver and iron worth 100 gp, consumed
    "Magic Jar", // container worth 500 gp, not consumed
    "Mordenkainen's Magnificent Mansion", // miniature door worth ~15 gp, not consumed
    "Nondetection", //pinch of diamond dust worth 25gp+, consumed
    "Planar Binding", // jewel worth 1,000 gp, not consumed
    "Plane Shift", // forked metal rod worth 250 gp, not consumed
    "Private Sanctum", // silver powder worth 100 gp, consumed
    "Raise Dead", // diamond worth 500 gp, consumed
    "Reincarnate", // rare oils and unguents worth 1,000 gp, consumed
    "Resurrection", // diamond worth 1,000 gp, consumed
    "Revivify", // diamond worth 300 gp, consumed
    "Scrying", // focus worth 1,000 gp, not consumed
    "Sequester", // powdered diamond worth 5,000 gp, consumed
    "Simulacrum", // powdered ruby worth 1,500 gp (plus snow, etc.), consumed
    "Stoneskin", // diamond dust worth 100 gp, consumed
    "Summon Dragon", //an object with the image of a dragon engraved on it worth 500+ GP, not consumed
    "Summon Shadowspawn", //tears inside a gem worth at least 300 gp, not consumed
    "Symbol", // mercury, phosphorus, powdered diamond, opal worth 1,000 gp, consumed
    "Teleportation Circle", // rare chalks/inks with gems worth 50 gp, consumed
    "Trap the Soul", // gem worth 1,000 gp or more, consumed
    "True Resurrection", // holy water + diamonds worth 25,000 gp, consumed
    "True Seeing" // ointment worth 25 gp, consumed
];