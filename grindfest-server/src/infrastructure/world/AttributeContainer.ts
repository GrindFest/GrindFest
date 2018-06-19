import {AttributeId} from "../network/Messages";

interface Attribute {
    value: number;

}

// how can i move this into gameobject, client cant now anything about attribute being dirty, maybe he can though, its probably just problem of sharing code between client and server while both have different roles of how to server data to each other

//TODO: attribute container might be something liek gameoBject.Id, something that should be directly on game object
// but am i not doing just components as attributes then, no ai am not because i need functions with internal state like react state components in redux app
//TODO: maybe position should also be there. but the problem is that non-"bussiness" systems has to access it as well, same with speed
// maybe its the same different as in redux with global state and component state
// AttributeContainer is redux store
// fields on components is component state
//NOTE: all "business" values that needs to be synchronzied with the client has to be in AttributeContainerComponent
export default class AttributeContainer {

    public isDirty: boolean = false;
    private internalAttributes: Map<AttributeId, {value: number, isDirty: boolean }> = new Map();

    public get attributes(): {attributeId: number, value: number}[] {
        let result = [];
        for (let [attributeId, attribute] of this.internalAttributes) {
            result.push({
                attributeId: attributeId,
                value: attribute.value
            });
        }
        return result;
    }

    get(attributeId: AttributeId): number {
        let attribute = this.internalAttributes.get(attributeId);
        if (attribute == null) {
            return null;
        }
        return attribute.value;
    }

    set(attributeId: AttributeId, value: number) {
        this.isDirty = true;
        this.internalAttributes.set(attributeId, { value: value, isDirty: true });
    }


    * getDirtyAttributes(): IterableIterator<{attributeId: AttributeId, value: number}> {
        for (let [attributeId, attribute] of this.internalAttributes) {
            if (attribute.isDirty) {
                yield {
                    attributeId:  attributeId,
                    value: attribute.value
                }
            }
        }
    }

    clearDirty() {
        this.isDirty = false;
        for (let [attributeId, attribute] of this.internalAttributes) {
            attribute.isDirty = false;
        }
    }
}