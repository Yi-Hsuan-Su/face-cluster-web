import ArrayKernel from './ArrayKernel';
import { VertexHandle, HalfedgeHandle, EdgeHandle, FaceHandle } from './Handles/Handles';
import SmartEdgeHandle from './SmartHandles/SmartEdgeHandle';
import SmartFaceHandle from './SmartHandles/SmartFaceHandle';
import SmartHalfedgeHandle from './SmartHandles/SmartHalfedgeHandle';
import { make_smart } from './SmartHandles/SmartHandleFunc';
import SmartVertexHandle from './SmartHandles/SmartVertexHandle';
import { EdgeIter, FaceEdgeCWIter, FaceFaceCWIter, FaceHalfedgeCWIter, FaceIter, FaceVertexCWIter, HalfedgeIter, VertexEdgeCWIter, VertexFaceCWIter, VertexIHalfedgeCWIter, VertexIter, VertexOHalfedgeCWIter, VertexVertexCWIter } from './Iterators';
import { assert, resize } from "../Utils/UtilsFunc";

class AddFaceEdgeInfo {
    halfedge_handle: HalfedgeHandle = new HalfedgeHandle();
    is_new: boolean = false;
    needs_adjust: boolean = false;
    constructor(halfedge_handle: HalfedgeHandle = new HalfedgeHandle(),
        is_new: boolean = false, needs_adjust: boolean = false) {
        this.halfedge_handle = halfedge_handle;
        this.is_new = is_new;
        this.needs_adjust = needs_adjust;
    }
}

class pair<T1, T2>{
    first: T1
    second: T2
    constructor(first?: T1, second?: T2) {
        this.first = first;
        this.second = second;
    }
}

export default class PolyConnectivity extends ArrayKernel {

    private edgeData_: AddFaceEdgeInfo[] = [];
    private next_cache_: pair<HalfedgeHandle, HalfedgeHandle>[] = [];
    readonly InvalidEdgeHandle: EdgeHandle = new EdgeHandle();
    readonly InvalidFaceHandle: FaceHandle = new FaceHandle();
    readonly InvalidHalfedgeHandle: HalfedgeHandle = new HalfedgeHandle();
    readonly InvalidVertexHandle: VertexHandle = new VertexHandle();

    is_boundary(handle: VertexHandle | HalfedgeHandle | EdgeHandle): boolean {
        if (handle instanceof VertexHandle) {
            const heh = new HalfedgeHandle(super.halfedge_handle(handle));
            return (!(heh.is_valid() && this.face_handle(heh).is_valid()));
        }
        else if (handle instanceof HalfedgeHandle) {
            return super.is_boundary(handle);
        }
        else if (handle instanceof EdgeHandle) {
            return (this.is_boundary(this.halfedge_handle(handle, 0)) ||
                this.is_boundary(this.halfedge_handle(handle, 1)));
        }
    }
    async_is_boundary(handle: VertexHandle | HalfedgeHandle | EdgeHandle): Promise<boolean> {
        return new Promise(resolve => {
            if (handle instanceof VertexHandle) {
                const heh = new HalfedgeHandle(super.halfedge_handle(handle));
                resolve(!(heh.is_valid() && this.face_handle(heh).is_valid()));
            }
            else if (handle instanceof HalfedgeHandle) {
                resolve(super.is_boundary(handle));
            }
            else if (handle instanceof EdgeHandle) {
                resolve(this.is_boundary(this.halfedge_handle(handle, 0)) ||
                    this.is_boundary(this.halfedge_handle(handle, 1)));
            }
        })
    }
    add_vertex(): SmartVertexHandle {
        return make_smart(this.new_vertex(), this) as SmartVertexHandle;
    }

    async add_face(_vh0: VertexHandle[] | SmartVertexHandle[], _vh1?: VertexHandle, _vh2?: VertexHandle, _vh3?: VertexHandle): Promise<SmartFaceHandle> {
        if (Array.isArray(_vh0)) {
            return this.add_face_vh_size(_vh0, _vh0.length);
        }
        else if (_vh1 !== undefined && _vh2 !== undefined && _vh3 === undefined) {
            return this.add_face_vh_size([_vh0, _vh1, _vh2], 3);
        }
        else if (_vh1 !== undefined && _vh2 !== undefined && _vh3 !== undefined) {
            return this.add_face_vh_size([_vh0, _vh1, _vh2, _vh3], 4);
        }
    }
    async add_face_vh_size(_vertex_handles: VertexHandle[] | SmartVertexHandle[], _vhs_size: number): Promise<SmartFaceHandle> {
        return new Promise(async resolve => {

            const n = _vhs_size;

            if (this.edgeData_.length < n) {
                this.edgeData_ = await resize(this.edgeData_, n, new AddFaceEdgeInfo());
                this.next_cache_ = await resize(this.next_cache_, 6 * n, new pair<HalfedgeHandle, HalfedgeHandle>());
            }
            let next_cache_count = 0;

            // don't allow degenerated faces
            assert(n > 2);

            // test for topological errors
            for (let i = 0, ii = 1; i < n; ++i, ++ii, ii %= n) {

                if (!this.is_boundary(_vertex_handles[i])) {
                    console.log(_vertex_handles[i])
                    console.error("PolyMeshT::add_face: complex vertex")
                    resolve(make_smart(this.InvalidFaceHandle, this) as SmartFaceHandle);
                }

                // Initialise edge attributes
                this.edgeData_[i] = await this.initialise_edge_attributes(i, ii, _vertex_handles);

                if (!this.edgeData_[i].is_new && !this.is_boundary(this.edgeData_[i].halfedge_handle)) {
                    console.error("PolyMeshT::add_face: complex edge");
                    resolve(make_smart(this.InvalidFaceHandle, this) as SmartFaceHandle);
                }
            }
            // re-link patches if necessary
            for (let i = 0, ii = 1; i < n; ++i, ++ii, ii %= n) {
                next_cache_count = await this.relink_patches(i, ii, _vertex_handles, next_cache_count);
                if (next_cache_count === -1) {
                    resolve(make_smart(this.InvalidFaceHandle, this) as SmartFaceHandle);
                }
            }

            // create missing edges
            for (let i = 0, ii = 1; i < n; ++i, ++ii, ii %= n) {
                this.edgeData_[i] = await this.create_missing_edges(i, ii, _vertex_handles);
            }

            // create the face
            const fh = new FaceHandle(this.new_face());
            await this.async_set_halfedge_handle(fh, this.edgeData_[n - 1].halfedge_handle);

            // setup halfedges
            for (let i = 0, ii = 1; i < n; ++i, ++ii, ii %= n) {
                next_cache_count = await this.setup_halfedges(i, ii, _vertex_handles, next_cache_count, fh);
            }
            // process next halfedge cache
            for (let i = 0; i < next_cache_count; ++i)
                await this.set_next_halfedge_handle(this.next_cache_[i].first, this.next_cache_[i].second);
            // adjust vertices' halfedge handle
            for (let i = 0; i < n; ++i)
                if (this.edgeData_[i].needs_adjust)
                    await this.async_adjust_outgoing_halfedge(_vertex_handles[i]);
            resolve(make_smart(fh, this) as SmartFaceHandle);
        })
    }
    initialise_edge_attributes(i: number, ii: number, _vertex_handles: VertexHandle[]): Promise<AddFaceEdgeInfo> {
        return new Promise(async resolve => {
            const heh = await this.find_halfedge(_vertex_handles[i],
                _vertex_handles[ii]);
            const is_new = !heh.is_valid();
            const needs_adjust = false;
            resolve(new AddFaceEdgeInfo(heh, is_new, needs_adjust));
        })
    }
    create_missing_edges(i: number, ii: number, _vertex_handles: VertexHandle[]): Promise<AddFaceEdgeInfo> {
        return new Promise(async resolve => {
            const { is_new, needs_adjust } = this.edgeData_[i];
            if (is_new) {
                const heh = await this.async_new_edge(_vertex_handles[i], _vertex_handles[ii]);
                resolve(new AddFaceEdgeInfo(heh, is_new, needs_adjust));
            } else {
                resolve(this.edgeData_[i]);
            }
        })
    }
    relink_patches(i: number, ii: number, _vertex_handles: VertexHandle[], next_cache_count: number) {
        return new Promise<number>(async (resolve) => {
            if (!this.edgeData_[i].is_new && !this.edgeData_[ii].is_new) {
                let inner_prev, inner_next, outer_prev, boundary_prev, boundary_next, patch_start, patch_end;

                inner_prev = this.edgeData_[i].halfedge_handle;
                inner_next = this.edgeData_[ii].halfedge_handle;

                if (this.next_halfedge_handle(inner_prev).idx() !== inner_next.idx()) {
                    // here comes the ugly part... we have to relink a whole patch

                    // search a free gap
                    // free gap will be between boundary_prev and boundary_next
                    outer_prev = this.opposite_halfedge_handle(inner_next);
                    // outer_next = this.opposite_halfedge_handle(inner_prev);
                    boundary_prev = outer_prev;
                    do
                        boundary_prev =
                            this.opposite_halfedge_handle(this.next_halfedge_handle(boundary_prev));
                    while (!this.is_boundary(boundary_prev));
                    boundary_next = this.next_halfedge_handle(boundary_prev);

                    // ok ?
                    if (boundary_prev.idx() === inner_prev.idx()) {
                        console.error("PolyMeshT::add_face: patch re-linking failed")
                        resolve(-1);
                    }

                    assert(this.is_boundary(boundary_prev));
                    assert(this.is_boundary(boundary_next));

                    // other halfedges' handles
                    patch_start = this.next_halfedge_handle(inner_prev);
                    patch_end = this.prev_halfedge_handle(inner_next);

                    assert(boundary_prev.is_valid());
                    assert(patch_start.is_valid());
                    assert(patch_end.is_valid());
                    assert(boundary_next.is_valid());
                    assert(inner_prev.is_valid());
                    assert(inner_next.is_valid());

                    // relink
                    this.next_cache_[next_cache_count++] = new pair<HalfedgeHandle, HalfedgeHandle>(boundary_prev, patch_start);
                    this.next_cache_[next_cache_count++] = new pair<HalfedgeHandle, HalfedgeHandle>(patch_end, boundary_next);
                    this.next_cache_[next_cache_count++] = new pair<HalfedgeHandle, HalfedgeHandle>(inner_prev, inner_next);
                }
                resolve(next_cache_count);
            }
            resolve(next_cache_count);
        })
    }
    setup_halfedges(i: number, ii: number, _vertex_handles: VertexHandle[], next_cache_count: number, fh: FaceHandle) {
        return new Promise<number>(async resolve => {
            let vh, inner_prev, inner_next, outer_prev, outer_next, boundary_prev, boundary_next;
            vh = _vertex_handles[ii];
            inner_prev = this.edgeData_[i].halfedge_handle;
            inner_next = this.edgeData_[ii].halfedge_handle;
            assert(inner_prev.is_valid());
            assert(inner_next.is_valid());
            let id = 0;
            if (this.edgeData_[i].is_new) id |= 1;
            if (this.edgeData_[ii].is_new) id |= 2;

            // set outer links
            if (id) {
                outer_prev = this.opposite_halfedge_handle(inner_next);
                outer_next = this.opposite_halfedge_handle(inner_prev);
                assert(outer_prev.is_valid());
                assert(outer_next.is_valid());
                // set outer links
                switch (id) {
                    case 1: // prev is new, next is old
                        boundary_prev = this.prev_halfedge_handle(inner_next);
                        assert(boundary_prev.is_valid());
                        this.next_cache_[next_cache_count++] = new pair<HalfedgeHandle, HalfedgeHandle>(boundary_prev, outer_next);
                        await this.async_set_halfedge_handle(vh, outer_next);
                        break;

                    case 2: // next is new, prev is old
                        boundary_next = this.next_halfedge_handle(inner_prev);
                        assert(boundary_next.is_valid());
                        this.next_cache_[next_cache_count++] = new pair<HalfedgeHandle, HalfedgeHandle>(outer_prev, boundary_next);
                        await this.async_set_halfedge_handle(vh, boundary_next);
                        break;

                    case 3: // both are new
                        if (!this.halfedge_handle(vh).is_valid()) {
                            await this.async_set_halfedge_handle(vh, outer_next);
                            this.next_cache_[next_cache_count++] = new pair<HalfedgeHandle, HalfedgeHandle>(outer_prev, outer_next);
                        }
                        else {
                            boundary_next = this.halfedge_handle(vh);
                            boundary_prev = this.prev_halfedge_handle(boundary_next);
                            assert(boundary_prev.is_valid());
                            assert(boundary_next.is_valid());
                            this.next_cache_[next_cache_count++] = new pair<HalfedgeHandle, HalfedgeHandle>(boundary_prev, outer_next);
                            this.next_cache_[next_cache_count++] = new pair<HalfedgeHandle, HalfedgeHandle>(outer_prev, boundary_next);
                        }
                        break;
                }
                // set inner link
                this.next_cache_[next_cache_count++] = new pair<HalfedgeHandle, HalfedgeHandle>(inner_prev, inner_next);
            }
            else {
                this.edgeData_[ii].needs_adjust = (this.halfedge_handle(vh).idx() === inner_next.idx());
            }

            // set face handle
            await this.async_set_face_handle(this.edgeData_[i].halfedge_handle, fh);
            resolve(next_cache_count)
        })
    }
    adjust_outgoing_halfedge(_vh: VertexHandle) {
        for (let vh_it = this.voh_cwiter(_vh); vh_it.is_valid(); vh_it.next()) {
            console.log(vh_it.handle())
            if (this.is_boundary(vh_it.handle())) {
                this.set_halfedge_handle(_vh, vh_it.handle());
                break;
            }
        }
    }
    async_adjust_outgoing_halfedge(_vh: VertexHandle) {
        return new Promise<void>(async resolve => {
            for (let vh_it = this.voh_cwiter(_vh); vh_it.is_valid(); await vh_it.next()) {
                if (this.is_boundary(vh_it.handle())) {
                    await this.async_set_halfedge_handle(_vh, vh_it.handle());
                    resolve();
                }
            }
            resolve();
        })
    }
    find_halfedge(_start_vh: VertexHandle, _end_vh: VertexHandle): Promise<SmartHalfedgeHandle> {
        return new Promise(async resolve => {
            assert(_start_vh.is_valid() && _end_vh.is_valid());
            for (let voh_it = this.voh_cwiter(_start_vh); voh_it.is_valid(); await voh_it.next()) {
                const vhandle = this.to_vertex_handle(voh_it.handle());
                if (vhandle.idx() === _end_vh.idx()) {
                    resolve(voh_it.handle() as SmartHalfedgeHandle);
                }
            }
            resolve(make_smart(this.InvalidEdgeHandle, this) as SmartHalfedgeHandle);
        })
    }
    next_halfedge_handle(_heh: SmartHalfedgeHandle | HalfedgeHandle): SmartHalfedgeHandle | HalfedgeHandle {
        return make_smart(super.next_halfedge_handle(_heh), this);
    }
    prev_halfedge_handle(_heh: SmartHalfedgeHandle | HalfedgeHandle): SmartHalfedgeHandle | HalfedgeHandle {
        return make_smart(super.prev_halfedge_handle(_heh), this);
    }
    opposite_halfedge_handle(_heh: SmartHalfedgeHandle | HalfedgeHandle): SmartHalfedgeHandle | HalfedgeHandle {
        return make_smart(super.opposite_halfedge_handle(_heh), this);
    }
    ccw_rotated_halfedge_handle(_heh: SmartHalfedgeHandle | HalfedgeHandle): SmartHalfedgeHandle | HalfedgeHandle {
        return make_smart(super.ccw_rotated_halfedge_handle(_heh), this);
    }
    cw_rotated_halfedge_handle(_heh: SmartHalfedgeHandle | HalfedgeHandle): SmartHalfedgeHandle {
        return make_smart(super.cw_rotated_halfedge_handle(_heh), this) as SmartHalfedgeHandle;
    }
    s_halfedge_handle(_eh: SmartEdgeHandle, _i): SmartHalfedgeHandle {
        return make_smart(ArrayKernel.s_halfedge_handle(_eh, _i), _eh.mesh()) as SmartHalfedgeHandle;
    }
    s_edge_handle(_heh: SmartHalfedgeHandle): SmartEdgeHandle {
        return make_smart(ArrayKernel.s_edge_handle(_heh), _heh.mesh()) as SmartEdgeHandle;
    }
    halfedge_handle(handle: EdgeHandle | FaceHandle | VertexHandle, _i: number = -1): SmartHalfedgeHandle {
        if (handle instanceof EdgeHandle) {
            return make_smart(super.halfedge_handle(handle, _i), this) as SmartHalfedgeHandle;
        }
        if (handle instanceof FaceHandle) {
            return make_smart(super.halfedge_handle(handle), this) as SmartHalfedgeHandle;
        }
        if (handle instanceof VertexHandle) {
            return make_smart(super.halfedge_handle(handle), this) as SmartHalfedgeHandle;
        }
    }
    edge_handle(_heh: SmartHalfedgeHandle | HalfedgeHandle): SmartEdgeHandle {
        return make_smart(super.edge_handle(_heh), this) as SmartEdgeHandle;
    }
    face_handle(_heh: SmartHalfedgeHandle | HalfedgeHandle): SmartFaceHandle {
        return make_smart(super.face_handle(_heh), this) as SmartFaceHandle;
    }
    opposite_face_handle(_heh: HalfedgeHandle): SmartFaceHandle {
        return make_smart(super.face_handle(super.opposite_halfedge_handle(_heh)), this) as SmartFaceHandle;
    }
    is_manifold(_vh: VertexHandle) {
        throw Error('Method not implemented.');
    }
    valence(handle: VertexHandle | FaceHandle): number {
        if (handle instanceof VertexHandle) {
            let count = 0;
            let vv_it = this.vv_cwiter(handle);
            while (!vv_it.is_valid()) {
                vv_it.next();
                count++;
            }
            return count;
        }
        if (handle instanceof FaceHandle) {
            let count = 0;
            let fv_it = this.fv_cwiter(handle);
            while (!fv_it.is_valid()) {
                fv_it.next();
                count++;
            }
            return count;
        }
    }

    vertices_begin() {
        return new VertexIter(this, new VertexHandle(0));
    }
    vertices_end() {
        return new VertexIter(this, new VertexHandle(this.n_vertices()));
    }
    halfedges_begin() {
        return new HalfedgeIter(this, new HalfedgeHandle(0));
    }
    halfedges_end() {
        return new HalfedgeIter(this, new HalfedgeHandle(this.n_halfedges()));
    }
    edges_begin() {
        return new EdgeIter(this, new EdgeHandle(0));
    }
    edges_end() {
        return new EdgeIter(this, new EdgeHandle(this.n_edges()));
    }
    faces_begin() {
        return new FaceIter(this, new FaceHandle(0));
    }
    faces_end() {
        return new FaceIter(this, new FaceHandle(this.n_faces()));
    }
    vv_cwiter(_vh: VertexHandle) {
        return new VertexVertexCWIter(this, _vh);
    }
    vih_cwiter(_vh: VertexHandle) {
        return new VertexIHalfedgeCWIter(this, _vh);
    }
    voh_cwiter(_vh: VertexHandle) {
        return new VertexOHalfedgeCWIter(this, _vh);
    }
    ve_cwiter(_vh: VertexHandle) {
        return new VertexEdgeCWIter(this, _vh);
    }
    vf_cwiter(_vh: VertexHandle) {
        return new VertexFaceCWIter(this, _vh);
    }
    fv_cwiter(_fh: FaceHandle) {
        return new FaceVertexCWIter(this, _fh);
    }
    fh_cwiter(_fh: FaceHandle) {
        return new FaceHalfedgeCWIter(this, _fh);
    }
    fe_cwiter(_fh: FaceHandle) {
        return new FaceEdgeCWIter(this, _fh);
    }
    ff_cwiter(_fh: FaceHandle) {
        return new FaceFaceCWIter(this, _fh);
    }
    vv_cwbegin(_vh: VertexHandle) {
        return new VertexVertexCWIter(this, _vh);
    }
    vih_cwbegin(_vh: VertexHandle) {
        return new VertexIHalfedgeCWIter(this, _vh);
    }
    voh_cwbegin(_vh: VertexHandle) {
        return new VertexOHalfedgeCWIter(this, _vh);
    }
    ve_cwbegin(_vh: VertexHandle) {
        return new VertexEdgeCWIter(this, _vh);
    }
    vf_cwbegin(_vh: VertexHandle) {
        return new VertexFaceCWIter(this, _vh);
    }
    fv_cwbegin(_fh: FaceHandle) {
        return new FaceVertexCWIter(this, _fh);
    }
    fh_cwbegin(_fh: FaceHandle) {
        return new FaceHalfedgeCWIter(this, _fh);
    }
    fe_cwbegin(_fh: FaceHandle) {
        return new FaceEdgeCWIter(this, _fh);
    }
    ff_cwbegin(_fh: FaceHandle) {
        return new FaceFaceCWIter(this, _fh);
    }

    vv_cwend(_vh: VertexHandle) {
        return new VertexVertexCWIter(this, _vh, true);
    }
    vih_cwend(_vh: VertexHandle) {
        return new VertexIHalfedgeCWIter(this, _vh, true);
    }
    voh_cwend(_vh: VertexHandle) {
        return new VertexOHalfedgeCWIter(this, _vh, true);
    }
    ve_cwend(_vh: VertexHandle) {
        return new VertexEdgeCWIter(this, _vh, true);
    }
    vf_cwend(_vh: VertexHandle) {
        return new VertexFaceCWIter(this, _vh, true);
    }
    fv_cwend(_fh: FaceHandle) {
        return new FaceVertexCWIter(this, _fh, true);
    }
    fh_cwend(_fh: FaceHandle) {
        return new FaceHalfedgeCWIter(this, _fh, true);
    }
    fe_cwend(_fh: FaceHandle) {
        return new FaceEdgeCWIter(this, _fh, true);
    }
    ff_cwend(_fh: FaceHandle) {
        return new FaceFaceCWIter(this, _fh, true);
    }
}