import { make_smart } from '../SmartHandles/SmartHandleFunc';
import { FaceHandle, HalfedgeHandle, VertexHandle, EdgeHandle } from '../Handles/Handles';
import PolyConnectivity from '../PolyConnectivity';


export default class GenericIterator {

    hnd_: FaceHandle | HalfedgeHandle | VertexHandle | EdgeHandle;
    constructor(_mesh: PolyConnectivity, _hnd: FaceHandle | HalfedgeHandle | VertexHandle | EdgeHandle) {
        this.hnd_ = make_smart(_hnd, _mesh);
    }
    handle() {
        if (this.hnd_ instanceof FaceHandle) {
            return Object.assign(new FaceHandle(), this.hnd_);
        }
        if (this.hnd_ instanceof HalfedgeHandle) {
            return Object.assign(new HalfedgeHandle(), this.hnd_);
        }
        if (this.hnd_ instanceof VertexHandle) {
            return Object.assign(new VertexHandle(), this.hnd_);
        }
        if (this.hnd_ instanceof EdgeHandle) {
            return Object.assign(new EdgeHandle(), this.hnd_);
        }
    }

    idx() {
        return this.hnd_.idx();
    }

    next() {
        this.hnd_.__increment();
        return this;
    }

    prev() {
        this.hnd_.__decrement();
        return this;
    }

}