import { VPropHandle } from "./Handles/PropHandles";
import PolyConnectivity from "./PolyConnectivity";
import { VertexHandle } from "./Handles/Handles";
import { Vector3 } from "../Utils/Vector";

class Point extends Vector3 { }

export default class AttributeKernel extends PolyConnectivity {
    //standard vertex properties
    private points_: VPropHandle<Point> = new VPropHandle<Point>(0);
    //data properties handles
    constructor() {
        super();
        this.add_property(this.points_, "v:points", new Point);
    }
    points() {
        return this.property(this.points_);
    }

    point(_vh: VertexHandle) {
        return this.property(this.points_, _vh);
    }

    set_point(_vh: VertexHandle, _p: Point) {
        this.set_property(this.points_, _vh, _p);
    }

    points_property_handle() {
        return this.points_;
    }
}
