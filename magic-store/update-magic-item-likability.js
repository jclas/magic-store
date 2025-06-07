/**
 * Client-side script to fetch/update likability in magic-items.json based on various factors.
 */
async function updateMagicItemLikability() {
    // Load magicitems.json
    const response = await fetch('magic-items.json');
    const items = await response.json();


    /**
     * A utility that alculates/updates the likability scores in the magic items file
     * Use keywordInListMatches or matchesList to find various aspects of items to give
     * likability increases or decreases.
     */
    for (const item of items) {
        let baseLikability = 0.4;
        let likability = baseLikability;
        
        // Positive bumps
        if (keywordInListMatches(item.name, frequentUseMagicItems)) likability += 0.30;
        if (keywordInListMatches(item.name, healingRelatedMagicItems)) likability += 0.30;
        if (keywordInListMatches(item.name, highImpactMagicItems)) likability += 0.3;
        if (keywordInListMatches(item.name, bonusActionMagicItems)) likability += 0.20;
        if (item.category.toLowerCase() == 'potion'
            && !item.rarity.toLowerCase() == "common" //only a couple of mediocre common potions - no bump for you
            && !item.name.toLowerCase().startsWith("oil") //oils are not bonus action potions - no bump for you
        ) {
            likability += 0.20; //bonus action bump
        }
        if (keywordInListMatches(item.name, statBoosterMagicItems)) likability += 0.20;
        if (keywordInListMatches(item.name, highUtilityMagicItems)) likability += 0.15;
        // if (keywordInListMatches(item.name, consumableItems)) likability += 0.0;
        if (keywordInListMatches(item.name, foregoConsumedComponentMagicItems)) likability += 0.10;
        if (keywordInListMatches(item.name, foregoExpensiveComponentMagicItems)) likability += 0.20;
        if (likability > baseLikability) {
            if (keywordInListMatches(item.name, foregoConcentrationMagicItems)) likability += .20;
        }

        if (item.name.toLowerCase().startsWith("potion of healing")) {
            //Potion of healing specific bump!
            if (item.rarity.toLowerCase() == "common") {
                likability *= 4; //mucho grande popular! Ai ai aiiiiii!
            } else {
                likability *= 2; //grande popular
            }
        } 

        if (item.rarity.toLowerCase() == "common") {
            if (! keywordInListMatches(item.name, usefulCommonMagicItems)) {
                likability /= 3; //downgrading (a lot!) or we get too much crap
            }
        }

        // Range
        if (likability < 0.1) likability = 0.1;  //min

        item.likability = Number(likability.toFixed(6));
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
