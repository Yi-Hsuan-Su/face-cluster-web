import { EdgeHandle, FaceHandle, HalfedgeHandle, VertexHandle } from '../../Handles/Handles';
import PolyConnectivity from '../../../Mesh/PolyConnectivity';

export default class GenericCirculator_DereferenciabilityCheckT {
    centerEntityHandle: FaceHandle | VertexHandle;
    valueHandle: FaceHandle | EdgeHandle | HalfedgeHandle | VertexHandle;

    constructor(centerEntityHandle: FaceHandle | VertexHandle,
        valueHandle: FaceHandle | EdgeHandle | HalfedgeHandle | VertexHandle) {
        this.centerEntityHandle = centerEntityHandle;
        this.valueHandle = valueHandle
    }
    static isDereferenciable(mesh: PolyConnectivity, heh: HalfedgeHandle, centerEntityHandle, valueHandle): boolean {
        if (centerEntityHandle instanceof FaceHandle && valueHandle instanceof FaceHandle) {
            return mesh.face_handle(mesh.opposite_halfedge_handle(heh)).is_valid();
        }
        if (centerEntityHandle instanceof VertexHandle && valueHandle instanceof FaceHandle) {
            return mesh.face_handle(heh).is_valid();
        }
    }
}