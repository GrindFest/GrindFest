

export interface StateGenerator<T>{
    execute(context: T): IterableIterator<State>
}

export abstract class State {
    abstract start();
    abstract update(dt: number);

    isFinished: boolean = false;
}

export class WaitState extends State {
    private time: number;

    constructor(time: number) {
        super();
        this.time = time;
    }

    start() {
    }

    update(dt: number) {
        this.time -= dt;
        if (this.time <= 0) {
            this.isFinished = true;
        }

    }


}


export default class StateMachine<T> {
    stateIterator: IterableIterator<State>;
    currentState: State;

    stateGenerator: StateGenerator<T>;

    constructor(stateGenerator: StateGenerator<T>) { //TODO: removing generator code from update function would allow me to get rid of this
        this.stateGenerator = stateGenerator;
    }

    update(dt: number, context: T) {

        if (this.stateIterator == null) {
            this.stateIterator = this.stateGenerator.execute(context); //TODO: should this be here?
        }
        if (this.currentState == null) {
            let result = this.stateIterator.next();
            if (result.done) {
                this.currentState = null;
                this.stateIterator = null;
                return true;
            } else {
                this.currentState = result.value;
                this.currentState.start();
            }
        }

        if (this.currentState != null) {
            this.currentState.update(dt);
            if (this.currentState.isFinished) {
                this.currentState = null;
                this.stateIterator = null;
            }
        }
        return false;
    }
}
