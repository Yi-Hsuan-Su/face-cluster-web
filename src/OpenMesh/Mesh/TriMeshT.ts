import { Vector3 } from "../Utils/Vector";
import { VertexHandle } from "./Handles/Handles";
import { make_smart } from "./SmartHandles/SmartHandleFunc";
import SmartVertexHandle from "./SmartHandles/SmartVertexHandle";
import TriAttributeKernel from "./TriAttribKernelT";

export default class TriMesh extends TriAttributeKernel {
    new_vertex(_p?: Vector3): SmartVertexHandle {
        if (_p === undefined) {
            return make_smart(super.new_vertex(), this) as SmartVertexHandle;
        } else {
            const vh = new VertexHandle(super.new_vertex().idx());
            this.set_point(vh, _p);
            return make_smart(vh, this) as SmartVertexHandle;
        }
    }

    async_new_vertex(_p?: Vector3): Promise<SmartVertexHandle> {
        return new Promise(async resolve => {
            if (_p === undefined) {
                resolve(make_smart(super.new_vertex(), this) as SmartVertexHandle);
            } else {
                const vh = new VertexHandle(await super.async_new_vertex());
                await this.set_point(vh, _p);

                resolve(make_smart(vh, this) as SmartVertexHandle);
            }
        })
    }
    async_add_vertex(_p?: Vector3): Promise<SmartVertexHandle> {
        return this.async_new_vertex(_p);
    }

    add_vertex(_p?: Vector3): SmartVertexHandle {
        return this.new_vertex(_p);
    }
}