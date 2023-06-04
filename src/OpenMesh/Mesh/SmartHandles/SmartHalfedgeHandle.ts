import PolyConnectivity from '../PolyConnectivity';
import SmartHandleStatusPredicates from './SmartHandleStatusPredicates';
import SmartHandleBoundaryPredicate from './SmartHandleBoundaryPredicate';
import { HalfedgeHandle } from '../Handles/Handles';
import SmartVertexHandle from './SmartVertexHandle';
import SmartEdgeHandle from './SmartEdgeHandle';
import SmartFaceHandle from './SmartFaceHandle';
import { make_smart } from './SmartHandleFunc';

interface Handle extends
    SmartHandleStatusPredicates<SmartVertexHandle>,
    SmartHandleBoundaryPredicate<SmartVertexHandle> {
}

export default class SmartHalfedgeHandle extends HalfedgeHandle implements Handle {
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
    next(): SmartHalfedgeHandle {
        const mesh = this.mesh();
        if (mesh !== undefined) {
            return make_smart(mesh.next_halfedge_handle(this), mesh) as SmartHalfedgeHandle;
        }
    }
    prev(): SmartHalfedgeHandle {
        const mesh = this.mesh();
        if (mesh !== undefined) {
            return make_smart(mesh.prev_halfedge_handle(this), mesh) as SmartHalfedgeHandle;
        }
    };
    /// Returns opposite halfedge handle
    opp(): SmartHalfedgeHandle {
        const mesh = this.mesh();
        if (mesh !== undefined) {
            return make_smart(mesh.opposite_halfedge_handle(this), mesh) as SmartHalfedgeHandle;
        }
    };
    /// Returns vertex pointed to by halfedge
    to(): SmartVertexHandle {
        const mesh = this.mesh();
        if (mesh !== undefined) {
            return make_smart(mesh.to_vertex_handle(this), mesh) as SmartVertexHandle;
        }
    };
    /// Returns vertex at start of halfedge
    from(): SmartVertexHandle {
        const mesh = this.mesh();
        if (mesh !== undefined) {
            return make_smart(mesh.from_vertex_handle(this), mesh) as SmartVertexHandle;
        }
    };
    /// Returns incident edge of halfedge
    edge(): SmartEdgeHandle {
        const mesh = this.mesh();
        if (mesh !== undefined) {
            return make_smart(mesh.edge_handle(this), mesh) as SmartEdgeHandle;
        }
    };
    /// Returns incident face of halfedge
    face(): SmartFaceHandle {
        const mesh = this.mesh();
        if (mesh !== undefined) {
            return make_smart(mesh.face_handle(this), mesh) as SmartFaceHandle;
        }
    };

    /// Returns a range of halfedges in the face of the halfedge (or along the boundary) (PolyConnectivity::hl_range())
    loop() {

    }

}