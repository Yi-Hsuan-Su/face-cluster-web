import SmartHandleStatusPredicates from './SmartHandleStatusPredicates';
import SmartHandleBoundaryPredicate from './SmartHandleBoundaryPredicate';
import PolyConnectivity from '../PolyConnectivity';
import { FaceHandle } from '../Handles/Handles'
import SmartHalfedgeHandle from './SmartHalfedgeHandle';
import { make_smart } from './SmartHandleFunc';
import { assert } from '../../Utils/UtilsFunc';

interface Handle extends
    SmartHandleStatusPredicates<SmartFaceHandle>,
    SmartHandleBoundaryPredicate<SmartFaceHandle> {
}

export default class SmartFaceHandle extends FaceHandle implements Handle {
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


    /// Returns one of the halfedges of the face
    halfedge(): SmartHalfedgeHandle {
        const mesh = this.mesh();
        assert(mesh !== undefined);
        return make_smart(mesh.halfedge_handle(this), mesh) as SmartHalfedgeHandle;
    };

    /// Returns a range of vertices incident to the face (PolyConnectivity::fv_range())
    vertices() { return };
    /// Returns a range of halfedges of the face (PolyConnectivity::fh_range())
    halfedges() { return };
    /// Returns a range of edges of the face (PolyConnectivity::fv_range())
    edges() { return };
    /// Returns a range adjacent faces of the face (PolyConnectivity::ff_range())
    faces() { return };
    /// Returns the valence of the face
    valence() {
        const mesh = this.mesh();
        assert(mesh !== undefined);
        return mesh.valence(this);
    };
}