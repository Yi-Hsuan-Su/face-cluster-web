import { FaceHandle, VertexHandle } from "./Handles/Handles";
import PolyConnectivity from "./PolyConnectivity";
import SmartFaceHandle from "./SmartHandles/SmartFaceHandle";
import { make_smart } from "./SmartHandles/SmartHandleFunc";
import SmartVertexHandle from "./SmartHandles/SmartVertexHandle";

export default class TriConnectivity extends PolyConnectivity {

    add_face(_vh0: VertexHandle[] | SmartVertexHandle[], _vh1?: VertexHandle, _vh2?: VertexHandle): Promise<SmartFaceHandle> {
        if (Array.isArray(_vh0)) {
            return this.add_face_vh_size(_vh0, _vh0.length);
        }
        else if (_vh1 !== undefined && _vh2 !== undefined) {
            return this.add_face_vh_size([_vh0, _vh1, _vh2], 3);
        }
    }
    add_face_vh_size(_vertex_handles: VertexHandle[] | SmartVertexHandle[], _vhs_size: number): Promise<SmartFaceHandle> {
        return new Promise(async resolve => {
            // need at least 3 vertices
            if (_vhs_size < 3) {
                resolve(make_smart(this.InvalidFaceHandle, this) as SmartFaceHandle);
            }

            /// face is triangle -> ok
            if (_vhs_size === 3)
                resolve(super.add_face_vh_size(_vertex_handles, _vhs_size));

            /// face is not a triangle -> triangulate
            else {
                let fh: FaceHandle;
                let i = 1;

                while (i < _vhs_size - 1) {
                    let vhandles: VertexHandle[] = [];
                    vhandles.push(_vertex_handles[0]);
                    vhandles.push(_vertex_handles[i]);
                    vhandles.push(_vertex_handles[++i]);
                    fh = await super.add_face_vh_size(vhandles, 3);
                }
                resolve(make_smart(fh, this) as SmartFaceHandle);
            }
        })
    }
}