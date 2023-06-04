import GenericCirculatorBaseT from './GenericCirculatorBaseT';
import GCVHF from './ValueHandleFnsT';
import PolyConnectivity from '../../PolyConnectivity';
import { EdgeHandle, FaceHandle, HalfedgeHandle, VertexHandle } from '../../../Mesh/Handles/Handles';

type Input = { mesh: any, heh: HalfedgeHandle, start: HalfedgeHandle, lap_counter: number }
type CenterEntityHandle = FaceHandle | VertexHandle;
type valueHandle = FaceHandle | EdgeHandle | HalfedgeHandle | VertexHandle;

export default class GenericCirculatorT extends GenericCirculatorBaseT {

    CW: boolean;
    centerEntityHandle: CenterEntityHandle;
    valueHandle: valueHandle;

    constructor(mesh: PolyConnectivity, handle: CenterEntityHandle | HalfedgeHandle, end: boolean = false, centerEntityHandle: CenterEntityHandle, valueHandle: valueHandle) {

        if (handle instanceof HalfedgeHandle) {
            super(mesh, handle, end);
            this.centerEntityHandle = centerEntityHandle;
            this.valueHandle = valueHandle;
            const input: Input = {
                mesh: this.mesh_,
                heh: this.heh_,
                start: this.start_,
                lap_counter: this.lap_counter_
            }
            GCVHF.init(input, this.centerEntityHandle, this.valueHandle, this.CW);
        } else {
            super(mesh, mesh.halfedge_handle(handle) as VertexHandle, end);
            this.centerEntityHandle = centerEntityHandle;
            this.valueHandle = valueHandle;
            const input: Input = {
                mesh: this.mesh_,
                heh: this.heh_,
                start: this.start_,
                lap_counter: this.lap_counter_
            }
            GCVHF.init(input, this.centerEntityHandle, this.valueHandle, this.CW);
        }
    }

    next() {
        return new Promise<any>(async resolve => {
            const input: Input = {
                mesh: this.mesh_,
                heh: this.heh_,
                start: this.start_,
                lap_counter: this.lap_counter_
            }
            // console.log("NextStart", this.heh_.idx())
            const output = await GCVHF.increment(input, this.centerEntityHandle, this.valueHandle, this.CW);
            this.heh_ = output.heh;
            this.lap_counter_ = output.lap_counter;
            // console.log("NextEnd", this.heh_.idx())
            resolve(this);
        })
    }

    prev() {
        return new Promise<any>(async resolve => {
            const input: Input = {
                mesh: this.mesh_,
                heh: this.heh_,
                start: this.start_,
                lap_counter: this.lap_counter_
            }
            // console.log("NextStart", this.heh_.idx())
            const output = await GCVHF.decrement(input, this.centerEntityHandle, this.valueHandle, this.CW);
            this.heh_ = output.heh;
            this.lap_counter_ = output.lap_counter;
            // console.log("NextEnd", this.heh_.idx())
            resolve(this);
        })
    }

    is_valid() {
        return GCVHF.is_valid(this.heh_, this.lap_counter_);
    }
}