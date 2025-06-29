//ToDo: jack-up likability for items with variant sets

/**
 * Client-side script to fetch/update likability in magic-items.json based on various factors.
 */
async function updateMagicItemLikability() {
    // Load magicitems.json
    const response = await fetch('magic-items.json');
    const items = await response.json();


    /**
     * A utility that calculates/updates the likability scores in the magic items file
     * Use hasWildcardListMatch or hasListMatch to find various aspects of items to give
     * likability increases or decreases.
     */
    for (const item of items) {
        let baseLikability = 0.4;
        let likability = baseLikability;
        
        // Positive bumps
        if (hasWildcardListMatch(item.name, frequentUseMagicItems)) likability += 0.30;
        if (hasWildcardListMatch(item.name, healingRelatedMagicItems)) likability += 0.30;
        if (hasWildcardListMatch(item.name, highImpactMagicItems)) likability += 0.3;
        if (hasWildcardListMatch(item.name, bonusActionMagicItems)) likability += 0.20;
        if (item.category.toLowerCase() == 'potion'
            && !item.rarity.toLowerCase() == "common" //only a couple of mediocre common potions - no bump for you
            && !item.name.toLowerCase().startsWith("oil") //oils are not bonus action potions - no bump for you
        ) {
            likability += 0.20; //bonus action bump
        }
        if (hasWildcardListMatch(item.name, statBoosterMagicItems)) likability += 0.20;
        if (hasWildcardListMatch(item.name, highUtilityMagicItems)) likability += 0.15;
        // if (hasWildcardListMatch(item.name, consumableItems)) likability += 0.0;
        if (hasWildcardListMatch(item.name, foregoConsumedComponentMagicItems)) likability += 0.10;
        if (hasWildcardListMatch(item.name, foregoExpensiveComponentMagicItems)) likability += 0.20;
        if (likability > baseLikability) {
            if (hasWildcardListMatch(item.name, foregoConcentrationMagicItems)) likability += .20;
        }
        if (item.name.toLowerCase().includes("cantrip")) likability *= .2; //downgrade - item with a cantrip on it, like an enspelled item

        if (item.name.toLowerCase().startsWith("potion of healing")) {
            //Potion of healing specific bump!
            if (item.rarity.toLowerCase() == "common") {
            //     likability *= 4; //mucho grande popular! Ai ai aiiiiii!
            // } else {
                likability *= 2; //grande popular
            }
        } 


        //downgrade common items or we get too much crap
        if (item.rarity.toLowerCase() == "common"
            && !["scroll", "tattoo"].includes(item.category.toLowerCase())
            && !item.name.toLowerCase().startsWith("potion of healing")
        ) {
            if (hasWildcardListMatch(item.name, usefulCommonMagicItems1)) {
                likability /= 1;
            } else if (hasWildcardListMatch(item.name, usefulCommonMagicItems2)) {
                likability /= 1.5;
            } else if (hasWildcardListMatch(item.name, bottomTierCommonMagicItems)) {
                likability /= 4;
            } else {
                likability /= 2;
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
