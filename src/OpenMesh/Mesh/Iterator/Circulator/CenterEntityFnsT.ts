import PolyConnectivity from '../../../Mesh/PolyConnectivity';
import { FaceHandle, HalfedgeHandle, VertexHandle } from '../../Handles/Handles';

type Input = { mesh: PolyConnectivity, heh: HalfedgeHandle, start: HalfedgeHandle, lap_counter: number }
type Output = { heh: HalfedgeHandle; lap_counter: number };

export default class GenericCirculator_CenterEntityFnsT {
    static increment(_input: Input, centerEntityHandle, CW: boolean) {
        return new Promise<Output>(async resolve => {
            let heh;
            let lap_counter = 0;
            if (centerEntityHandle instanceof FaceHandle) {
                if (CW) {
                    heh = _input.mesh.next_halfedge_handle(_input.heh);
                    if (heh.idx() === _input.start.idx()) {
                        ++_input.lap_counter;
                        lap_counter = _input.lap_counter;
                    }
                    resolve({ heh, lap_counter });
                } else {
                    heh = _input.mesh.prev_halfedge_handle(_input.heh);
                    if (heh.idx() === _input.start.idx()) {
                        ++_input.lap_counter;
                        lap_counter = _input.lap_counter;
                    }
                    resolve({ heh, lap_counter });
                }
            } else if (centerEntityHandle instanceof VertexHandle) {
                if (CW) {
                    heh = _input.mesh.cw_rotated_halfedge_handle(_input.heh);
                    if (heh.idx() === _input.start.idx()) {
                        ++_input.lap_counter;
                        lap_counter = _input.lap_counter;
                    }
                    resolve({ heh, lap_counter });
                } else {
                    heh = _input.mesh.ccw_rotated_halfedge_handle(_input.heh);
                    if (_input.heh.idx() === _input.start.idx()) {
                        ++_input.lap_counter;
                        lap_counter = _input.lap_counter;
                    }
                    resolve({ heh, lap_counter });
                }
            }
        })
    }

    static decrement(_input: Input, centerEntityHandle, CW) {
        return new Promise<Output>(resolve => {
            let heh;
            let lap_counter = 0;
            if (centerEntityHandle instanceof FaceHandle) {
                if (CW) {
                    if (_input.heh.idx() === _input.start.idx()) {
                        --_input.lap_counter;
                        lap_counter = _input.lap_counter;
                    }
                    heh = _input.mesh.prev_halfedge_handle(_input.heh);
                    resolve({ heh, lap_counter });
                } else {
                    if (_input.heh.idx() === _input.start.idx()) {
                        --_input.lap_counter;
                        lap_counter = _input.lap_counter;
                    }
                    heh = _input.mesh.next_halfedge_handle(_input.heh);
                    resolve({ heh, lap_counter });
                }
            } else if (centerEntityHandle instanceof VertexHandle) {
                if (CW) {
                    if (_input.heh.idx() === _input.start.idx()) {
                        --_input.lap_counter;
                        lap_counter = _input.lap_counter;
                    }
                    heh = _input.mesh.ccw_rotated_halfedge_handle(_input.heh);
                    resolve({ heh, lap_counter });
                } else {
                    if (_input.heh.idx() === _input.start.idx()) {
                        --_input.lap_counter;
                        lap_counter = _input.lap_counter;
                    }
                    heh = _input.mesh.cw_rotated_halfedge_handle(_input.heh);
                    resolve({ heh, lap_counter });
                }
            }
        })
    }
}
