import { VertexHandle, HalfedgeHandle, FaceHandle, EdgeHandle } from "./Handles/Handles";
import GenericCirculatorT from "./Iterator/Circulator/GenericCirculatorT";
import GenericIterator from "./Iterator/GenericIterator";
import PolyConnectivity from "./PolyConnectivity";
import SmartHalfedgeHandle from "./SmartHandles/SmartHalfedgeHandle";
import { make_smart } from "./SmartHandles/SmartHandleFunc";
import SmartVertexHandle from "./SmartHandles/SmartVertexHandle";

export class VertexVertexCWIter extends GenericCirculatorT {
    CW: boolean = true;
    handle() {
        const res = this.mesh_.to_vertex_handle(this.heh_);
        return make_smart(res, this.mesh_) as SmartVertexHandle;
    }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false,) {
        super(mesh, handle, end, new VertexHandle(), new VertexHandle());
    }
}
export class VertexVertexCCWIter extends GenericCirculatorT {
    CW: boolean = false;
    handle() {
        const res = this.mesh_.to_vertex_handle(this.heh_);
        return make_smart(res, this.mesh_) as SmartVertexHandle;
    }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false) {
        super(mesh, handle, end, new VertexHandle(), new VertexHandle());
    }
}
export class VertexOHalfedgeCWIter extends GenericCirculatorT {
    CW: boolean = true;
    handle() {
        return make_smart(this.heh_, this.mesh_) as SmartHalfedgeHandle;
    }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false) {
        super(mesh, handle, end, new VertexHandle(), new HalfedgeHandle());
    }
}
export class VertexOHalfedgeCCWIter extends GenericCirculatorT {
    CW: boolean = false;
    handle() { return make_smart(this.heh_, this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false) {
        super(mesh, handle, end, new VertexHandle(), new HalfedgeHandle())
    }
}

export class VertexIHalfedgeCWIter extends GenericCirculatorT {
    CW: boolean = true;
    handle() { return make_smart(this.mesh_.opposite_halfedge_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false) {
        super(mesh, handle, end, new VertexHandle(), new HalfedgeHandle())
    }
}
export class VertexIHalfedgeCCWIter extends GenericCirculatorT {
    CW: boolean = false;
    handle() { return make_smart(this.mesh_.opposite_halfedge_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false) {
        super(mesh, handle, end, new VertexHandle(), new HalfedgeHandle())
    }
}

export class VertexFaceCWIter extends GenericCirculatorT {
    CW: boolean = true;
    handle() { return make_smart(this.mesh_.face_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false) {
        super(mesh, handle, end, new VertexHandle(), new FaceHandle())
    }
}
export class VertexFaceCCWIter extends GenericCirculatorT {
    CW: boolean = false;
    handle() { return make_smart(this.mesh_.face_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false) {
        super(mesh, handle, end, new VertexHandle(), new FaceHandle())
    }
}

export class VertexEdgeCWIter extends GenericCirculatorT {
    CW: boolean = true;
    handle() { return make_smart(this.mesh_.edge_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false) {
        super(mesh, handle, end, new VertexHandle(), new EdgeHandle())
    }
}
export class VertexEdgeCCWIter extends GenericCirculatorT {
    CW: boolean = false;
    handle() { return make_smart(this.mesh_.edge_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: VertexHandle, end: boolean = false) {
        super(mesh, handle, end, new VertexHandle(), new EdgeHandle())
    }
}
export class FaceVertexCCWIter extends GenericCirculatorT {
    CW: boolean = false;
    handle() { return make_smart(this.mesh_.to_vertex_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: FaceHandle, end: boolean = false) {
        super(mesh, handle, end, new FaceHandle(), new VertexHandle())
    }
}
export class FaceVertexCWIter extends GenericCirculatorT {
    CW: boolean = true;
    handle() { return make_smart(this.mesh_.to_vertex_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: FaceHandle, end: boolean = false) {
        super(mesh, handle, end, new FaceHandle(), new VertexHandle())
    }
}
export class FaceHalfedgeCCWIter extends GenericCirculatorT {
    CW: boolean = false;
    handle() { return make_smart(this.heh_, this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: FaceHandle, end: boolean = false) {
        super(mesh, handle, end, new FaceHandle(), new HalfedgeHandle())
    }
}
export class FaceHalfedgeCWIter extends GenericCirculatorT {
    CW: boolean = true;
    handle() { return make_smart(this.heh_, this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: FaceHandle, end: boolean = false) {
        super(mesh, handle, end, new FaceHandle(), new HalfedgeHandle())
    }
}

export class FaceEdgeCCWIter extends GenericCirculatorT {
    CW: boolean = false;
    handle() { return make_smart(this.mesh_.edge_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: FaceHandle, end: boolean = false) {
        super(mesh, handle, end, new FaceHandle(), new EdgeHandle())
    }
}
export class FaceEdgeCWIter extends GenericCirculatorT {
    CW: boolean = true;
    handle() { return make_smart(this.mesh_.edge_handle(this.heh_), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: FaceHandle, end: boolean = false) {
        super(mesh, handle, end, new FaceHandle(), new EdgeHandle())
    }
}
export class FaceFaceCCWIter extends GenericCirculatorT {
    CW: boolean = false;
    handle() { return make_smart(this.mesh_.face_handle(this.mesh_.opposite_halfedge_handle(this.heh_)), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: FaceHandle, end: boolean = false) {
        super(mesh, handle, end, new FaceHandle(), new FaceHandle())
    }
}
export class FaceFaceCWIter extends GenericCirculatorT {
    CW: boolean = true;
    handle() { return make_smart(this.mesh_.face_handle(this.mesh_.opposite_halfedge_handle(this.heh_)), this.mesh_); }
    constructor(mesh: PolyConnectivity, handle: FaceHandle, end: boolean = false) {
        super(mesh, handle, end, new FaceHandle(), new FaceHandle())
    }
}

export class VertexIter extends GenericIterator { };
export class HalfedgeIter extends GenericIterator { };
export class EdgeIter extends GenericIterator { };
export class FaceIter extends GenericIterator { };