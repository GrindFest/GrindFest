import GameSystem from "../../infrastructure/world/GameSystem";
import NetworkManager from "../../NetworkManager";
import {
    ClientSkillUse,
    MessageId,
    ServerActorPlayAnimation,
    SkillDefinition,
    SkillType
} from "../../infrastructure/network/Messages";
import Client from "../../Client";
import Component from "../../infrastructure/world/Component";
import Actor from "../components/Actor";
import {performance} from "perf_hooks";


class SkillUser extends Component {
    currentSkill: Skill;
    currentSkillPromise: SkillPromise;
}

export abstract class Skill {
    abstract async execute(): Promise<void>;
}

export abstract class SkillPromise implements Promise<void> {
    user: SkillUser;
    isFinished: boolean = false;
    readonly [Symbol.toStringTag]: "Promise";


    abstract start(): void;
    abstract update(dt: number): void;

    catch<TResult>(onrejected?: ((reason: any) => (PromiseLike<TResult> | TResult)) | null | undefined): Promise<void | TResult> {
        return undefined;
    }

    then<TResult1, TResult2>(onfulfilled?: ((value: void) => (PromiseLike<TResult1> | TResult1)) | null | undefined, onrejected?: ((reason: any) => (PromiseLike<TResult2> | TResult2)) | null | undefined): Promise<TResult1 | TResult2> {
    }
}

class PlayAnimation extends SkillPromise {

    animationTag: string;
    duration: number;
    time: number;

    constructor(animationTag: string, duration: number) {
        super();
        this.animationTag = animationTag;
        this.duration = duration;
    }

    start() {
        let actor = this.user.gameObject.components.get(Actor);
        // broadcast the animation to near object in the zone
        actor.zone.broadcast({ //TODO: i don't like that i am creating packets so deep
            id: MessageId.SMSG_ACTOR_PLAY_ANIMATION,
            actorId: actor.actorId,
            animationTag: this.animationTag,
            duration: this.duration
        } as ServerActorPlayAnimation);
    }

    update(dt) {
        this.time += dt;
        if (this.time > this.duration) {
            this.isFinished = true;
        }
    }

}

class Dash extends Skill {
    async execute() {
        await new PlayAnimation("spellcast", 5);
        //  await new Wait(1);
        await new PlayAnimation("spellcast", 5);

//        await new Damage(10);
    }
}


export default class SkillSystem extends GameSystem {

    skillUsers: SkillUser[] = [];

    constructor() {
        super();

        this.registerNodeJunction(this.skillUsers, SkillUser);

        NetworkManager.registerHandler(MessageId.CMSG_SKILL_USE, this.onSkillUse.bind(this));
    }

    update(dt) {
        for (let skillUser of this.skillUsers) {
            if (skillUser.currentSkill != null) {
                if (skillUser.currentSkillPromise == null || skillUser.currentSkillPromise.isFinished) { // no promise yet, get next
                    skillUser.currentSkillPromise = skillUser.currentSkill.execute() as SkillPromise;
                    skillUser.currentSkillPromise.user = skillUser; //TODO: where will i get the target? maybe i need more than this, also only some skills have target
                    skillUser.currentSkillPromise.start()
                }

                skillUser.currentSkillPromise.update(dt);

            }
            //skillUser.currentPromise = somePromise;
            //if (somePromise.)
        }
    }

    getSkill(skillTag: string): SkillDefinition { //TODO: move somehwere else, load from file
        return {
            tag: "slash",
            type:SkillType.Use,
        }
    }
    onSkillUse(client: Client, message: ClientSkillUse) {

        let hero = client.hero;

        // let skill = getSkill(message.skillTag);1
        //
        // let skillUser = hero.components.get(SkilLUser);
        // if (skillUser.currentSkill != null) {
        //     return;
        // }
        //
        // skillUser.currentSkill = skill;

    }
}