import { Vertex, Edge, Face, Halfedge_with_prev } from './ArrayItems'
import { FaceHandle, HalfedgeHandle, VertexHandle, EdgeHandle } from './Handles/Handles';
import StatusInfo from './Attributes/Status'
import BaseKernel from './BaseKernel'
import { EPropHandle, FPropHandle, HPropHandle, VPropHandle } from './Handles/PropHandles';
import { assert } from "../Utils/UtilsFunc";


type VertexStatusPropertyHandle = VPropHandle<StatusInfo>;
type HalfedgeStatusPropertyHandle = HPropHandle<StatusInfo>;
type EdgeStatusPropertyHandle = EPropHandle<StatusInfo>;
type FaceStatusPropertyHandle = FPropHandle<StatusInfo>;

export default class ArrayKernel extends BaseKernel {

    //Status
    vertex_status_: VertexStatusPropertyHandle = new VPropHandle<StatusInfo>();
    halfedge_status_: HalfedgeStatusPropertyHandle = new HPropHandle<StatusInfo>();;
    edge_status_: EdgeStatusPropertyHandle = new EPropHandle<StatusInfo>();;
    face_status_: FaceStatusPropertyHandle = new FPropHandle<StatusInfo>();;
    refcount_vstatus_: number;
    refcount_hstatus_: number;
    refcount_estatus_: number;
    refcount_fstatus_: number;
    //Containers
    vertices_: Vertex[] = [];
    edges_: Edge[] = [];
    faces_: Face[] = [];
    halfedges_: Halfedge_with_prev[] = [];

    // --- number of items ---

    n_vertices() {
        return this.vertices_.length;
    }

    n_faces() {
        return this.faces_.length;
    }

    n_edges() {
        return this.edges_.length;
    }

    n_halfedges() {
        return this.halfedges_.length;
    }

    // --- handle -> item ---

    handle(item: Face | Vertex | Halfedge_with_prev | Edge):
        FaceHandle | VertexHandle | HalfedgeHandle | EdgeHandle {

        if (item instanceof (Vertex)) {
            return new VertexHandle(this.vertices_.indexOf(item));
        }
        if (item instanceof (Edge)) {
            return new EdgeHandle(this.edges_.indexOf(item));
        }
        if (item instanceof (Face)) {
            return new FaceHandle(this.faces_.indexOf(item));
        }
        if (item instanceof (Halfedge_with_prev)) {
            return new HalfedgeHandle(this.halfedges_.indexOf(item))
        }
    }

    ///checks handle validity

    is_valid_handle(handle: FaceHandle | VertexHandle | HalfedgeHandle | EdgeHandle) {

        const index = handle.idx();
        if (handle instanceof (VertexHandle)) {
            return 0 <= index && index < this.n_vertices();
        }
        if (handle instanceof (EdgeHandle)) {
            return 0 <= index && index < this.n_edges();
        }
        if (handle instanceof (FaceHandle)) {
            return 0 <= index && index < this.n_faces();
        }
        if (handle instanceof (HalfedgeHandle)) {
            return 0 <= index && index < this.n_edges() * 2;
        }
    }

    // --- item -> handle ---

    vertex(_vh: VertexHandle): Vertex {
        assert(this.is_valid_handle(_vh));
        return this.vertices_[_vh.idx()];
    }

    halfedge(_heh: HalfedgeHandle): Halfedge_with_prev {
        assert(this.is_valid_handle(_heh));
        return this.halfedges_[_heh.idx()];
    }

    edge(_eh: EdgeHandle): Edge {
        assert(this.is_valid_handle(_eh));
        return this.edges_[_eh.idx()];
    }

    face(_fh: FaceHandle): Face {
        assert(this.is_valid_handle(_fh))
        return this.faces_[_fh.idx()];
    }

    // --- get i'th items ---
    //
    vertex_handle(input: number): VertexHandle {
        return (input < this.n_vertices()) ?
            this.handle(this.vertices_[input]) : new VertexHandle();
    }

    halfedge_handle(input: number | EdgeHandle | FaceHandle | VertexHandle, _i: number = -1): HalfedgeHandle {
        if (typeof input === "number") {
            return (_i < this.n_halfedges()) ?
                this.handle(this.halfedges_[_i]) : new HalfedgeHandle();
        } else if (input instanceof EdgeHandle) {
            assert(_i !== -1);
            return ArrayKernel.s_halfedge_handle(input, _i);
        } else if (input instanceof FaceHandle) {
            return this.face(input).halfedge_handle_;
        } else if (input instanceof VertexHandle) {
            return this.vertex(input).halfedge_handle_;
        }
    }

    edge_handle(input: number | HalfedgeHandle): EdgeHandle {
        if (typeof input === "number") {
            return (input < this.n_edges()) ?
                this.handle(this.edges_[input]) : new EdgeHandle();
        } else if (input instanceof HalfedgeHandle) {
            return ArrayKernel.s_edge_handle(input);
        }
    }

    face_handle(input: number | HalfedgeHandle): FaceHandle {
        if (typeof input === "number") {
            return (input < this.n_faces()) ?
                this.handle(this.faces_[input]) : new FaceHandle();
        } else if (input instanceof HalfedgeHandle) {
            return this.halfedge(input).face_handle_;
        }
    }

    // --- vertex connectivity ---
    set_halfedge_handle(handle: VertexHandle | FaceHandle, _heh: HalfedgeHandle) {
        if (handle instanceof VertexHandle) {
            this.vertex(handle).halfedge_handle_ = _heh;
        }
        // --- face connectivity ---
        else if (handle instanceof FaceHandle) {
            this.face(handle).halfedge_handle_ = _heh;
        }
    }
    async_set_halfedge_handle(handle: VertexHandle | FaceHandle, _heh: HalfedgeHandle): Promise<void> {
        return new Promise(resolve => {
            if (handle instanceof VertexHandle) {
                this.vertex(handle).halfedge_handle_ = _heh;
            }
            // --- face connectivity ---
            else if (handle instanceof FaceHandle) {
                this.face(handle).halfedge_handle_ = _heh;
            }
            resolve();
        })
    }
    is_isolated(_vh: VertexHandle): boolean {
        return !this.halfedge_handle(_vh).is_valid();
    }
    set_isolated(_vh: VertexHandle) {
        this.vertex(_vh).halfedge_handle_.invalidate();
    }
    // --- halfedge connectivity ---
    to_vertex_handle(_heh: HalfedgeHandle): VertexHandle {
        return this.halfedge(_heh).vertex_handle_;
    }
    from_vertex_handle(_heh: HalfedgeHandle): VertexHandle {
        return this.to_vertex_handle(this.opposite_halfedge_handle(_heh));
    }

    set_vertex_handle(_heh: HalfedgeHandle, _vh: VertexHandle) {
        this.halfedges_[_heh.idx()].vertex_handle_ = _vh;
        // this.halfedge(_heh).vertex_handle_ = _vh;
    }
    set_face_handle(_heh: HalfedgeHandle, _fh: FaceHandle) {
        this.halfedge(_heh).face_handle_ = _fh;
    }
    async_set_face_handle(_heh: HalfedgeHandle, _fh: FaceHandle): Promise<void> {
        return new Promise(resolve => {
            this.halfedge(_heh).face_handle_ = _fh;
            resolve();
        })
    }
    set_boundary(_heh: HalfedgeHandle) {
        this.halfedge(_heh).face_handle_.invalidate();
    }
    is_boundary(_heh: HalfedgeHandle) {
        return !this.face_handle(_heh).is_valid();
    }
    next_halfedge_handle(_heh: HalfedgeHandle): HalfedgeHandle {
        return this.halfedge(_heh).next_halfedge_handle_;
    }
    set_next_halfedge_handle(_heh: HalfedgeHandle, _nheh: HalfedgeHandle) {
        this.halfedge(_heh).next_halfedge_handle_ = _nheh;
        this.set_prev_halfedge_handle(_nheh, _heh);
    }
    async_set_next_halfedge_handle(_heh: HalfedgeHandle, _nheh: HalfedgeHandle): Promise<void> {
        return new Promise<void>(resolve => {
            this.halfedge(_heh).next_halfedge_handle_ = _nheh;
            this.set_prev_halfedge_handle(_nheh, _heh);
            resolve();
        })
    }
    set_prev_halfedge_handle(_heh: HalfedgeHandle, _pheh: HalfedgeHandle) {
        this.halfedge(_heh).prev_halfedge_handle_ = _pheh;
    }
    prev_halfedge_handle(_heh: HalfedgeHandle): HalfedgeHandle {
        return this.halfedge(_heh).prev_halfedge_handle_;
    }
    opposite_halfedge_handle(_heh: HalfedgeHandle): HalfedgeHandle {
        return new HalfedgeHandle(_heh.idx() ^ 1);
    }
    ccw_rotated_halfedge_handle(_heh: HalfedgeHandle): HalfedgeHandle {
        return this.opposite_halfedge_handle(this.prev_halfedge_handle(_heh))
    }
    cw_rotated_halfedge_handle(_heh: HalfedgeHandle): HalfedgeHandle {
        return this.next_halfedge_handle(this.opposite_halfedge_handle(_heh));
    }

    // --- edge connectivity ---
    static s_halfedge_handle(_eh: EdgeHandle, _i: number) {
        return new HalfedgeHandle((_eh.idx() << 1) + _i);
    }

    static s_edge_handle(_heh: HalfedgeHandle) {
        return new EdgeHandle(_heh.idx() >> 1);
    }
    /// Status Query API
    set_status(handle: VertexHandle | HalfedgeHandle | EdgeHandle | FaceHandle, _status: StatusInfo) {
        //------------------------------------------------------------ vertex status
        if (handle instanceof VertexHandle && this.vertex_status_ !== undefined) {
            this.set_property(this.vertex_status_, handle, _status);
        }
        //----------------------------------------------------------- halfedge status
        if (handle instanceof HalfedgeHandle && this.halfedge_status_ !== undefined) {
            this.set_property(this.halfedge_status_, handle, _status);
        }
        //--------------------------------------------------------------- edge status
        if (handle instanceof EdgeHandle && this.edge_status_ !== undefined) {
            this.set_property(this.edge_status_, handle, _status);
        }
        //--------------------------------------------------------------- face status
        if (handle instanceof FaceHandle && this.face_status_ !== undefined) {
            this.set_property(this.face_status_, handle, _status);
        }
    }

    status(handle: VertexHandle | HalfedgeHandle | EdgeHandle | FaceHandle): StatusInfo {
        //------------------------------------------------------------ vertex status
        if (handle instanceof VertexHandle && this.vertex_status_ !== undefined) {
            return this.property(this.vertex_status_, handle) as StatusInfo;
        }
        //----------------------------------------------------------- halfedge status
        if (handle instanceof HalfedgeHandle && this.halfedge_status_ !== undefined) {
            return this.property(this.halfedge_status_, handle) as StatusInfo;
        }
        //--------------------------------------------------------------- edge status
        if (handle instanceof EdgeHandle && this.edge_status_ !== undefined) {
            return this.property(this.edge_status_, handle) as StatusInfo;
        }
        //--------------------------------------------------------------- face status
        if (handle instanceof FaceHandle && this.face_status_ !== undefined) {
            return this.property(this.face_status_, handle) as StatusInfo;
        }
    }

    has_vertex_status() {
        return this.vertex_status_.is_valid();
    }
    has_halfedge_status() {
        return this.halfedge_status_.is_valid();
    }
    has_edge_status() {
        return this.edge_status_.is_valid();
    }
    has_face_status() {
        return this.face_status_.is_valid();
    }
    vertex_status_pph(): VertexStatusPropertyHandle {
        return this.vertex_status_;
    }
    halfedge_status_pph(): HalfedgeHandle {
        return this.halfedge_status_;
    }
    edge_status_pph(): EdgeStatusPropertyHandle {
        return this.edge_status_;
    }
    face_status_pph(): FaceStatusPropertyHandle {
        return this.face_status_;
    }
    /// status property by handle
    status_pph(handle: VertexHandle | HalfedgeHandle | EdgeHandle | FaceHandle) {
        if (handle instanceof VertexHandle) { return this.vertex_status_pph(); }
        if (handle instanceof HalfedgeHandle) { return this.halfedge_status_pph(); }
        if (handle instanceof EdgeHandle) { return this.edge_status_pph(); }
        if (handle instanceof FaceHandle) { return this.face_status_pph(); }
    }
    /// Status Request API
    request_vertex_status() {
        if (!this.refcount_vstatus_++)
            this.add_property(this.vertex_status_, "v:status", new StatusInfo());
    }

    async_request_vertex_status() {
        return new Promise<void>(async resolve => {
            if (!this.refcount_vstatus_++)
                this.vertex_status_ = new VPropHandle<StatusInfo>(await this.async_add_property(this.vertex_status_, "v:status", new StatusInfo()));
            resolve();
        })
    }

    request_halfedge_status() {
        if (!this.refcount_hstatus_++)
            this.add_property(this.halfedge_status_, "h:status");
    }

    request_edge_status() {
        if (!this.refcount_estatus_++)
            this.add_property(this.edge_status_, "e:status");
    }

    request_face_status() {
        if (!this.refcount_fstatus_++)
            this.add_property(this.face_status_, "f:status");
    }

    async_request_face_status() {
        return new Promise<void>(async resolve => {
            if (!this.refcount_fstatus_++)
                this.face_status_ = new FPropHandle<StatusInfo>(await this.async_add_property(this.face_status_, "f:status", new StatusInfo()));
            resolve();
        })
    }

    new_vertex(): VertexHandle {
        this.vertices_.push(new Vertex());
        return this.handle(this.vertices_[this.vertices_.length - 1])
    }

    async_new_vertex(): Promise<VertexHandle> {
        return new Promise(resolve => {
            this.vertices_.push(new Vertex());
            resolve(this.handle(this.vertices_[this.vertices_.length - 1]));
        })
    }
    new_edge(_start_vh: VertexHandle, _end_vh: VertexHandle): HalfedgeHandle {
        this.edges_.push(new Edge());
        // eprops_resize(this.n_edges());//TODO:should it be push_back()?
        // hprops_resize(this.n_halfedges());//TODO:should it be push_back()?
        const eh = new EdgeHandle(this.handle(this.edges_[this.n_edges() - 1]));
        const heh0 = new HalfedgeHandle(this.halfedge_handle(eh, 0));
        const heh1 = new HalfedgeHandle(this.halfedge_handle(eh, 1));
        this.halfedges_.push(new Halfedge_with_prev(), new Halfedge_with_prev());
        this.set_vertex_handle(heh0, _end_vh);
        this.set_vertex_handle(heh1, _start_vh);
        return heh0;
    }
    async_new_edge(_start_vh: VertexHandle, _end_vh: VertexHandle): Promise<HalfedgeHandle> {
        return new Promise(resolve => {
            this.edges_.push(new Edge());
            // eprops_resize(this.n_edges());//TODO:should it be push_back()?
            // hprops_resize(this.n_halfedges());//TODO:should it be push_back()?
            const eh = new EdgeHandle(this.handle(this.edges_[this.n_edges() - 1]));
            const heh0 = new HalfedgeHandle(this.halfedge_handle(eh, 0));
            const heh1 = new HalfedgeHandle(this.halfedge_handle(eh, 1));
            this.halfedges_.push(this.edges_[this.edges_.length - 1].halfedges_[0], this.edges_[this.edges_.length - 1].halfedges_[1]);
            this.set_vertex_handle(heh0, _end_vh);
            this.set_vertex_handle(heh1, _start_vh);
            resolve(heh0);
        })
    }
    new_face(_f?: Face): FaceHandle {
        if (_f === undefined) {
            this.faces_.push(new Face());
        } else {
            this.faces_.push(_f);
        }
        this.set_status(new FaceHandle(this.faces_.length - 1), new StatusInfo());
        return this.handle((this.faces_[this.faces_.length - 1]));
    }
    async_new_face(_f?: Face): Promise<FaceHandle> {
        return new Promise(resolve => {
            if (_f === undefined) {
                this.faces_.push(new Face());
            } else {
                this.faces_.push(_f);
            }
            resolve(this.handle((this.faces_[this.faces_.length - 1])));
        })
    }
}