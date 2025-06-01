/**
 * This script fetches/updates likability for scrolls
 * using the lists from likability.js.
 * It will give you a downloadable to copy/paste into the real file
 */
async function updateScrollLikability() {

    let scrolls = [];
    let spells = [];

    function normalizeSpellName(name) {
        return name
            .replace(/^Scroll:\s*/, '') // Remove "Scroll:" prefix
            //.replace(/\s*\(\d+\)$/, '') // Remove "(X)" at end
            .replace(/[’‘]/g, "'") // Normalize curly apostrophes to straight
            .replace(/[“”]/g, '"') // Normalize curly quotes to straight
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .trim()
            .toLowerCase();
    }

    function matchesList(spellName, list) {
        const searchName = normalizeSpellName(spellName);
        return list.some(name => normalizeSpellName(name) === searchName);
    }

    function isCantrip(spell) {
        return spell.spellLevel == 0;
    }

    function updateLikability() {
        // uses global scrolls and spells
        for (const scroll of scrolls) {
            const baseLikability = 0.3;
            const spell = getSpellByName(scroll.name);
            let likability = baseLikability;

            if (matchesList(scroll.name, frequentUse)) likability += 0.20;
            if (matchesList(scroll.name, highImpact)) likability += 0.20;
            if (spell.castingTime.toLowerCase() == "bonus action") likability += 0.20;
            if (spell.castingTime.toLowerCase() == "reaction") likability += 0.25;
            if (matchesList(scroll.name, healingRelated)) {
                likability += 0.25;
                //healing spells that bards can cast are among the most popular
                if (spell.spellLists.some(list => list.toLowerCase() == "bard")) likability += 0.25;
            }
            if (matchesList(scroll.name, utility)) likability += 0.15;
            // if (matchesList(scroll.name, forceDamage)) likability += 0.15;
            // if (matchesList(scroll.name, radiantDamage)) likability += 0.15;
            // if (matchesList(scroll.name, psychicDamage)) likability += 0.15;
            if (likability > baseLikability) {
                if (spell.concentration) likability -= 0.15; //downgrade
                if (matchesList(scroll.name, componentCost)) likability += 0.15; //upgrade for scrolls

                // Note: maybe ritual spell is upgrade AND downgrade, because mages want to learn it (upgrade)
                //       but then won't normally cast it from a scroll (downgrade).
                if (scroll.castingTime.toLowerCase() == "ritual") likability += .1;
            }
            //if (likability <= baseLikability && matchesList(scroll.name, componentCost)) likability -= 0.15; //downgrade
            if (matchesList(scroll.name, ritualSpells) && likability < baseLikability) likability = baseLikability;
            if (isCantrip(scroll)) likability *= 0.25; // Cantrip - major downgrade

            if (likability < 0.1) likability = 0.1; //min
            scroll.likability = Number(likability.toFixed(4));
        }
        return scrolls;
    }

    function downloadJSON(data, filename = "spell-scrolls-updated.json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    }

    // --- Fetch, process, and download ---
    try {
        const [scrollsResponse, spellsResponse] = await Promise.all([
            fetch("spell-scrolls.json"),
            fetch("spells-phb2024-xge-tce.json")
        ]);
        if (!scrollsResponse.ok) throw new Error("Could not fetch spell-scrolls.json");
        if (!spellsResponse.ok) throw new Error("Could not fetch spells-phb2024-xge-tce.json");
        scrolls = await scrollsResponse.json();
        spells = await spellsResponse.json();
        const updated = updateLikability();
        downloadJSON(updated);

        alert("Scroll Likability values updated and file downloaded!");
        console.log("Spell scrolls processed: " + scrolls.length);
    } catch (err) {
        alert("Error: " + err.message);
    }

    function getSpellByName(name) {

        name = normalizeSpellName(name);

        return spells.find(spell => normalizeSpellName(spell.name) === name);
    }

}