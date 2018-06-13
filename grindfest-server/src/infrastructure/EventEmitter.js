// @flow

export default class EventEmitter<T> { //TODO: fix this so it doesn't look insane

    handlers = [];

    register(handler: (any) => void) {
        this.handlers.push(handler);
    }

    emit1(payload1) {
        for (let handler of this.handlers) {
            handler(payload1);
        }
    }
    emit2(payload1, payload2) {
        for (let handler of this.handlers) {
            handler(payload1, payload2);
        }
    }
    emit3(payload1, payload2, payload3) {
        for (let handler of this.handlers) {
            handler(payload1, payload2, payload3);
        }
    }
}
