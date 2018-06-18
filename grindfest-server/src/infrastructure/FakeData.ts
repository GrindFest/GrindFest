import {PowerDefinition, PowerType} from "./network/Messages";


export const UsablePower = {
    type: PowerType.Use,
    animationTag: "spellcast",

};

export const SlashDefinition = {
    __extends: "UsablePower",
    type: PowerType.Use,
    animationTag: "spellcast",

    tag: "slash",
    duration: 300, // (mob) => mob.speed * 100

} as PowerDefinition;