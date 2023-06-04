import SmartHandleStatusPredicates from './SmartHandleStatusPredicates';
import SmartHandleBoundaryPredicate from './SmartHandleBoundaryPredicate';
import PolyConnectivity from '../PolyConnectivity';
import { EdgeHandle } from '../Handles/Handles'
import SmartHalfedgeHandle from './SmartHalfedgeHandle';
import SmartVertexHandle from './SmartVertexHandle';
import { make_smart } from './SmartHandleFunc';
import { assert } from '../../Utils/UtilsFunc';

interface Handle extends
    SmartHandleStatusPredicates<SmartEdgeHandle>,
    SmartHandleBoundaryPredicate<SmartEdgeHandle> {
}

export default class SmartEdgeHandle extends EdgeHandle implements Handle {
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

    /// Returns one of the two halfedges of the edge
    halfedge(_i): SmartHalfedgeHandle {
        const mesh = this.mesh();
        assert(mesh !== undefined);
        return make_smart(mesh.halfedge_handle(this, _i), mesh) as SmartHalfedgeHandle;
    };
    /// Shorthand for halfedge()
    h(_i): SmartHalfedgeHandle {
        return this.halfedge(_i)
    };
    /// Shorthand for halfedge(0)
    h0(): SmartHalfedgeHandle {
        return this.h(0)
    };
    /// Shorthand for halfedge(1)
    h1(): SmartHalfedgeHandle {
        return this.h(1)
    };
    /// Returns one of the two incident vertices of the edge
    vertex(_i): SmartVertexHandle {
        return this.halfedge(_i).from();
    };
    /// Shorthand for vertex()
    v(_i): SmartVertexHandle {
        return this.vertex(_i);
    };
    /// Shorthand for vertex(0)
    v0(): SmartVertexHandle {
        return this.v(0);
    };
    /// Shorthand for vertex(1)
    v1(): SmartVertexHandle {
        return this.v(1);
    };
}