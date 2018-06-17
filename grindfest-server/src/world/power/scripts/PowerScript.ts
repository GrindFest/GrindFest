
export abstract class PowerScript  {


    isFinished: boolean = false;

    abstract start(): void;
    abstract update(dt: number): void;

}

