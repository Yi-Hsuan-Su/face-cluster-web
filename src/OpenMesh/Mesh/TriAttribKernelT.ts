import { VPropHandle } from "./Handles/PropHandles";
import { FaceHandle, VertexHandle } from "./Handles/Handles";
import { Vector3 } from "../Utils/Vector";
import TriConnectivity from "../Mesh/TriConnectivity";
import StatusInfo from "./Attributes/Status";

class Point extends Vector3 { }

export default class TriAttributeKernel extends TriConnectivity {
    //standard vertex properties
    private points_: VPropHandle<Point>
    //data properties handles
    constructor() {
        super();
        this.refcount_vstatus_ = 0;
        this.refcount_fstatus_ = 0;
        this.points_ = new VPropHandle<Point>(this.add_property(new VPropHandle<Point>(), "v:points", new Point()));
    }
    init() {
        return new Promise<void>(async resolve => {
            await this.async_request_vertex_status();
            await this.async_request_face_status();
            resolve();
        })
    }
    points() {
        return this.property(this.points_);
    }
    point(_vh: VertexHandle) {
        return this.property(this.points_, _vh) as Point;
    }
    set_point(_vh: VertexHandle, _p: Point) {
        this.set_property(this.points_, _vh, _p);
        this.set_property(this.vertex_status_, _vh, new StatusInfo());
    }
    set_face_status(_fh: FaceHandle) {
        this.set_property(this.face_status_, _fh, new StatusInfo());
    }
    points_property_handle() {
        return this.points_;
    }
}
