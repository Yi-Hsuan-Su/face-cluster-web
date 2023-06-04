import SmartVertexHandle from './SmartVertexHandle';
import SmartEdgeHandle from './SmartEdgeHandle';
import SmartHalfedgeHandle from './SmartHalfedgeHandle';
import SmartFaceHandle from './SmartFaceHandle';
import { VertexHandle, HalfedgeHandle, EdgeHandle, FaceHandle } from '../Handles/Handles';
import PolyConnectivity from '../PolyConnectivity';
import { assert } from '../../Utils/UtilsFunc';

/// Creats a SmartHandle from a Handle and a Mesh
export function make_smart(handle: VertexHandle | HalfedgeHandle | EdgeHandle | FaceHandle, _mesh: PolyConnectivity | undefined):
    SmartVertexHandle | SmartEdgeHandle | SmartHalfedgeHandle | SmartFaceHandle {
    if (handle instanceof VertexHandle) {
        return new SmartVertexHandle(handle.idx(), _mesh);
    }

    else if (handle instanceof EdgeHandle) {
        return new SmartEdgeHandle(handle.idx(), _mesh);
    }

    else if (handle instanceof HalfedgeHandle) {
        return new SmartHalfedgeHandle(handle.idx(), _mesh);
    }

    else if (handle instanceof FaceHandle) {
        return new SmartFaceHandle(handle.idx(), _mesh);
    }

    else {
        assert(false);
    }
}


