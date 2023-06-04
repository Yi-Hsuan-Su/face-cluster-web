import { EdgeHandle, FaceHandle, HalfedgeHandle, VertexHandle } from "../../../Mesh/Handles/Handles";
import PolyConnectivity from "../../../Mesh/PolyConnectivity";

export default class GenericCirculatorBaseT {
    mesh_: PolyConnectivity;
    start_: HalfedgeHandle;
    heh_: HalfedgeHandle;
    lap_counter_: number;

    constructor(mesh: PolyConnectivity, heh: HalfedgeHandle, end: boolean = false) {
        this.mesh_ = mesh;
        this.heh_ = heh;
        this.start_ = heh;
        this.lap_counter_ = heh.is_valid() && end ? 1 : 0;
    }

    toFaceHandle(): FaceHandle {
        return this.mesh_.face_handle(this.heh_);
    }

    toOppositeFaceHandle(): FaceHandle {
        return this.mesh_.face_handle(this.toOppositeHalfedgeHandle());
    }

    toEdgeHandle(): EdgeHandle {
        return this.mesh_.edge_handle(this.heh_);
    }

    toHalfEdgeHandle(): HalfedgeHandle {
        return this.heh_;
    }

    toOppositeHalfedgeHandle(): HalfedgeHandle {
        return this.mesh_.opposite_halfedge_handle(this.heh_);
    }

    toVertexHandle(): VertexHandle {
        return this.mesh_.to_vertex_handle(this.heh_);
    }
}