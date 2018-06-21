import {AnimationTag, AttributeId, PowerAttribute, PowerDefinition, PowerTag, PowerType} from "./network/Messages";


//TODO: ideally these will be downloaded from definition in google sheet file

export const UsablePower = {
    type: PowerType.Use,

};

//TODO: if i create effectTag describing all particle effects, slashdefinition could have attribute saying which effect to spawn

export const SlashDefinition = {
    __extends: "UsablePower",
    tag: PowerTag.Slash,

    attributes: {
        [PowerAttribute.Duration]: (attributes) => 300, /* * attributes(AttributeId.HitPoints) */ //these are functions because i can say for example that the duration is faster with player having less hp
        [PowerAttribute.Damage]: (attributes) => 8,
        [PowerAttribute.SlashArc1Length]: (attributes) => 0.88,
        [PowerAttribute.Range]: (attributes) => 47,
        [PowerAttribute.AnimationTag]: (attributes) => AnimationTag.Spellcast,
        [PowerAttribute.IsChanneled]: (attributes) => false, //TODO: i can return 0 if i want these functions to always return number
    }

} as PowerDefinition;


export const GolemStompDefinition = {
    __extends: "UsablePower",
    tag: PowerTag.GolemStomp,

    attributes: {
        [PowerAttribute.Duration]: (attributes) => 300,
        [PowerAttribute.Damage]: (attributes) => 10,
        [PowerAttribute.Range]: (attributes) => 47,
        [PowerAttribute.AnimationTag]: (attributes) => AnimationTag.Spellcast,
        [PowerAttribute.IsChanneled]: (attributes) => false,
    }

} as PowerDefinition;