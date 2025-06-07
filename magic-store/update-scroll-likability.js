/**
 * This script fetches/updates likability for scrolls
 * using the lists from likability.js.
 * It will give you a downloadable to copy/paste into the real file
 */
async function updateScrollLikability() {

    let scrolls = [];
    let spells = [];

    function isCantrip(spell) {
        return spell.level == 0;
    }

    /**
     * 
     * @returns Likability will ultimately be a multiplier within the rarityScore algorithm
     */
    function updateLikability() {
        // uses global scrolls and spells
        for (const scroll of scrolls) {
            const baseLikability = 0.3;
            const spell = getSpellByName(scroll.name);
            let likability = baseLikability;

            // if (matchesList(scroll.name, frequentSpells)) likability += 0.20;
            if (matchesList(scroll.name, highImpactSpells)) likability += 0.20;
            if (spell.castingTime.toLowerCase().includes("bonus action")) likability += 0.20;
            if (spell.castingTime.toLowerCase().includes("reaction")) likability += 0.30;
            if (matchesList(scroll.name, healingRelatedSpells)) {
                likability += 0.25;
                //healing spells that bards can cast are among the most popular -- cumulative mega bump
                if (spell.spellLists.some(list => list.toLowerCase() == "bard")) likability += 0.25;
            }
            if (matchesList(scroll.name, utilitySpells)) likability += 0.15;
            // if (matchesList(scroll.name, forceDamageSpells)) likability += 0.10;
            // if (matchesList(scroll.name, radiantDamageSpells)) likability += 0.10;
            // if (matchesList(scroll.name, psychicDamageSpells)) likability += 0.10;
            if (likability > baseLikability) {
                if (spell.concentration) likability -= 0.15; //downgrade
                if (spell.componentConsumptionExpense) likability += 0.15; //upgrade for scrolls

                // Note: maybe ritual spell is upgrade AND downgrade, because mages want to learn it (upgrade)
                //       but then won't normally cast it from a scroll as it's a waste of money (downgrade).
                if (matchesList(scroll.name, ritualSpells)) likability += 0.10; //small bump
            }
            if (matchesList(scroll.name, ritualSpells) && likability < baseLikability) likability = baseLikability;
            if (isCantrip(spell)) likability *= 0.20; // Cantrip - major downgrade

            //massive bumpage
            if (topScrolls1.some(s => s.toLowerCase() === spell.name.toLowerCase())) {
                likability *= 4;
            } 
            if (topScrolls2.some(s => s.toLowerCase() === spell.name.toLowerCase())) {
                likability *= 3;
            }
            if (topScrolls3.some(s => s.toLowerCase() === spell.name.toLowerCase())) {
                likability *= 2;
            }

            if (likability < 0.1) likability = 0.1; //min
            scroll.likability = Number(likability.toFixed(6));
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
        console.log('err...');
        console.log(err);
    }

    function getSpellByName(name) {

        name = normalizeSpellName(name);

        return spells.find(spell => normalizeSpellName(spell.name) === name);
    }

}