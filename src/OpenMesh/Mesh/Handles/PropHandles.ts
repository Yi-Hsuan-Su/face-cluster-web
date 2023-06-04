import BaseHandle from './BaseHandle'
// eslint-disable-next-line
export class BasePropHandle<T> extends BaseHandle {
    constructor(_idx: number = -1) {
        super(_idx);
    }
}

export class VPropHandle<T> extends BasePropHandle<T> {
    constructor(input: number | BasePropHandle<T> = -1) {
        if (input instanceof BasePropHandle) {
            super(input.idx())
        } else {
            super(input);
        }
    }
    set(input: BasePropHandle<T>) {
        this.idx = input.idx;
    }
}

export class HPropHandle<T> extends BasePropHandle<T> {
    constructor(input: number | BasePropHandle<T> = -1) {
        if (input instanceof BasePropHandle) {
            super(input.idx())
        } else {
            super(input);
        }
    }
}
export class EPropHandle<T> extends BasePropHandle<T> {
    constructor(input: number | BasePropHandle<T> = -1) {
        if (input instanceof BasePropHandle) {
            super(input.idx())
        } else {
            super(input);
        }
    }
}

export class FPropHandle<T> extends BasePropHandle<T> {
    constructor(input: number | BasePropHandle<T> = -1) {
        if (input instanceof BasePropHandle) {
            super(input.idx())
        } else {
            super(input);
        }
    }
}

export class MPropHandle<T> extends BasePropHandle<T> {
    constructor(input: number | BasePropHandle<T> = -1) {
        if (input instanceof BasePropHandle) {
            super(input.idx())
        } else {
            super(input);
        }
    }
}
