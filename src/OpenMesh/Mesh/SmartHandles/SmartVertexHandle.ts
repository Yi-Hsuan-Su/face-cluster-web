import PolyConnectivity from '../PolyConnectivity';
import SmartHandleStatusPredicates from './SmartHandleStatusPredicates';
import SmartHandleBoundaryPredicate from './SmartHandleBoundaryPredicate';
import { VertexHandle } from '../Handles/Handles';
import SmartHalfedgeHandle from './SmartHalfedgeHandle';
import { make_smart } from './SmartHandleFunc';
import { assert } from '../../Utils/UtilsFunc';

interface Handle extends
    SmartHandleStatusPredicates<SmartVertexHandle>,
    SmartHandleBoundaryPredicate<SmartVertexHandle> {
}

export default class SmartVertexHandle extends VertexHandle implements Handle {
    private mesh_: PolyConnectivity | undefined;
    constructor(_idx: number = -1, _mesh?: PolyConnectivity) {
        super(_idx);
        this.mesh_ = _mesh;
    }
    mesh() {
        return this.mesh_;
    }
    feature(): boolean {
        return this.mesh()?.status(this).feature();
    }
    selected(): boolean {
        return this.mesh()?.status(this).selected();
    }
    tagged(): boolean {
        return this.mesh()?.status(this).tagged();
    }
    tagged2(): boolean {
        return this.mesh()?.status(this).tagged2();
    }
    locked(): boolean {
        return this.mesh()?.status(this).locked();
    }
    hidden(): boolean {
        return this.mesh()?.status(this).hidden();
    }
    deleted(): boolean {
        return this.mesh()?.status(this).deleted();
    }
    is_boundary(): boolean {
        return this.mesh().is_boundary(this)
    }
    /// Returns an outgoing halfedge
    out(): SmartHalfedgeHandle {
        const mesh = this.mesh();
        assert(mesh !== undefined);
        return make_smart(mesh.halfedge_handle(this), mesh) as SmartHalfedgeHandle;
    }
    /// Returns an outgoing halfedge
    // alias for out
    halfedge(): SmartHalfedgeHandle {
        return this.out();
    }
    /// Returns an incoming halfedge
    in(): SmartHalfedgeHandle {
        return this.out().opp();
    };

    /// Returns a range of faces incident to the vertex (PolyConnectivity::vf_range())
    faces() { };
    /// Returns a range of edges incident to the vertex (PolyConnectivity::ve_range())
    edges() { };
    /// Returns a range of vertices adjacent to the vertex (PolyConnectivity::vv_range())
    vertices() { };
    /// Returns a range of outgoing halfedges incident to the vertex (PolyConnectivity::voh_range())
    incoming_halfedges() { };
    /// Returns a range of incoming halfedges incident to the vertex (PolyConnectivity::vih_range())
    outgoing_halfedges() { };
    /// Returns valence of the vertex
    valence() {
        const mesh = this.mesh();
        assert(mesh !== undefined);
        return mesh.valence(this);
    };
    /// Returns true iff (the mesh at) the vertex is two-manifold ?
    is_manifold() {
        const mesh = this.mesh();
        assert(mesh !== undefined);
        return mesh.is_manifold(this);
    }
}