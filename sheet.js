/* QuestBoard D&D 5e - Roll20 Sheet Workers */
/* Migrated from chartcraft.html abilityMod(), updateCharSheet(), applyCharSheet() */
/* Original: lines 4825-4956 of chartcraft.html */

// ── Constants ──
// Mirrors DND_SKILLS from chartcraft.html lines 4831-4838
const ABILITIES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

const SKILLS = {
    acrobatics:       "dexterity",
    animal_handling:  "wisdom",
    arcana:           "intelligence",
    athletics:        "strength",
    deception:        "charisma",
    history:          "intelligence",
    insight:          "wisdom",
    intimidation:     "charisma",
    investigation:    "intelligence",
    medicine:         "wisdom",
    nature:           "intelligence",
    perception:       "wisdom",
    performance:      "charisma",
    persuasion:       "charisma",
    religion:         "intelligence",
    sleight_of_hand:  "dexterity",
    stealth:          "dexterity",
    survival:         "wisdom"
};

// ── Utility: Ability Modifier ──
// Direct port of abilityMod() from chartcraft.html line 4840
function abilityMod(score) {
    return Math.floor((parseInt(score) || 10 - 10) / 2);
}

function modStr(mod) {
    return mod >= 0 ? "+" + mod : String(mod);
}

// ── Recalculate All Derived Stats ──
// Replaces updateCharSheet() from chartcraft.html lines 4896-4914
function recalcAll() {
    var attrList = [];

    // Gather all attributes we need
    ABILITIES.forEach(function(ab) {
        attrList.push(ab);
        attrList.push(ab + "_save_prof");
    });
    attrList.push("proficiency_bonus");

    Object.keys(SKILLS).forEach(function(skill) {
        attrList.push(skill + "_prof");
    });

    attrList.push("spellcasting_ability");

    getAttrs(attrList, function(values) {
        var setObj = {};
        var prof = parseInt(values.proficiency_bonus) || 2;

        // Ability modifiers
        ABILITIES.forEach(function(ab) {
            var score = parseInt(values[ab]) || 10;
            var mod = Math.floor((score - 10) / 2);
            setObj[ab + "_mod"] = mod;

            // Saving throws: mod + (prof if proficient)
            var saveProf = values[ab + "_save_prof"] === "1" || values[ab + "_save_prof"] === "on";
            setObj[ab + "_save"] = mod + (saveProf ? prof : 0);
        });

        // Skill bonuses: ability mod + (prof if proficient)
        Object.keys(SKILLS).forEach(function(skill) {
            var ab = SKILLS[skill];
            var abScore = parseInt(values[ab]) || 10;
            var mod = Math.floor((abScore - 10) / 2);
            var skillProf = values[skill + "_prof"] === "1" || values[skill + "_prof"] === "on";
            setObj[skill + "_bonus"] = mod + (skillProf ? prof : 0);
        });

        // Initiative modifier = DEX mod
        var dexScore = parseInt(values.dexterity) || 10;
        var dexMod = Math.floor((dexScore - 10) / 2);
        setObj.initiative_mod = dexMod;

        // Passive Perception = 10 + perception bonus
        var wisScore = parseInt(values.wisdom) || 10;
        var wisMod = Math.floor((wisScore - 10) / 2);
        var percProf = values.perception_prof === "1" || values.perception_prof === "on";
        setObj.passive_perception = 10 + wisMod + (percProf ? prof : 0);

        // Spellcasting: DC = 8 + prof + ability mod, Attack = prof + ability mod
        var spellAb = values.spellcasting_ability || "intelligence";
        var spellAbScore = parseInt(values[spellAb]) || 10;
        var spellAbMod = Math.floor((spellAbScore - 10) / 2);
        setObj.spell_save_dc = 8 + prof + spellAbMod;
        setObj.spell_attack_bonus = prof + spellAbMod;

        setAttrs(setObj);
    });
}

// ── Event Listeners ──

// Trigger recalculation when any ability score changes
on("change:strength change:dexterity change:constitution change:intelligence change:wisdom change:charisma", recalcAll);

// Trigger recalculation when proficiency bonus changes
on("change:proficiency_bonus", recalcAll);

// Trigger recalculation when any save proficiency toggles
on("change:strength_save_prof change:dexterity_save_prof change:constitution_save_prof change:intelligence_save_prof change:wisdom_save_prof change:charisma_save_prof", recalcAll);

// Trigger recalculation when any skill proficiency toggles
on("change:acrobatics_prof change:animal_handling_prof change:arcana_prof change:athletics_prof change:deception_prof change:history_prof change:insight_prof change:intimidation_prof change:investigation_prof change:medicine_prof change:nature_prof change:perception_prof change:performance_prof change:persuasion_prof change:religion_prof change:sleight_of_hand_prof change:stealth_prof change:survival_prof", recalcAll);

// Trigger recalculation when spellcasting ability changes
on("change:spellcasting_ability", recalcAll);

// ── Tab Navigation via Action Buttons ──
on("clicked:tab_main", function() {
    setAttrs({ tab: "main" });
});

on("clicked:tab_bio", function() {
    setAttrs({ tab: "bio" });
});

on("clicked:tab_spells", function() {
    setAttrs({ tab: "spells" });
});

// ── Sheet Opened ──
on("sheet:opened", recalcAll);
