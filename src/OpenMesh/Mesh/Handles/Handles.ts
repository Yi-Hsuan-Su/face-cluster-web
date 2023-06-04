import BaseHandle from './BaseHandle';

export class VertexHandle extends BaseHandle {
    constructor(input: number | BaseHandle = -1) {
        if (input instanceof BaseHandle) {
            super(input.idx());
        }
        else {
            super(input);
        }
    }
}

export class HalfedgeHandle extends BaseHandle {
    constructor(input: number | BaseHandle = -1) {
        if (input instanceof BaseHandle) {
            super(input.idx());
        }
        else {
            super(input);
        }
    }
}

export class EdgeHandle extends BaseHandle {
    constructor(input: number | BaseHandle = -1) {
        if (input instanceof BaseHandle) {
            super(input.idx());
        }
        else {
            super(input);
        }
    }
}

export class FaceHandle extends BaseHandle {
    constructor(input: number | BaseHandle = -1) {
        if (input instanceof BaseHandle) {
            super(input.idx());
        }
        else {
            super(input);
        }
    }
}

export class MeshHandle extends BaseHandle {
    constructor(input: number | BaseHandle = -1) {
        if (input instanceof BaseHandle) {
            super(input.idx());
        }
        else {
            super(input);
        }
    }
}