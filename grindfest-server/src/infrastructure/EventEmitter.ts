export default class EventEmitter { //TODO: fix this so it doesn't look insane

    handlers: ((...args: any[]) => void)[] = [];

    register(handler: (...args: any[]) => void) {
        this.handlers.push(handler);
    }

    emit1(payload1: any) {
        for (let handler of this.handlers) {
            handler(payload1);
        }
    }
    emit2(payload1: any, payload2: any) {
        for (let handler of this.handlers) {
            handler(payload1, payload2);
        }
    }
    emit3(payload1: any, payload2: any, payload3: any) {
        for (let handler of this.handlers) {
            handler(payload1, payload2, payload3);
        }
    }
}
