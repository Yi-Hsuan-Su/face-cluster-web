import { FaceHandle, HalfedgeHandle } from '../../Handles/Handles';
import GCCEF from './CenterEntityFnsT';
import GDCT from './DereferencibilityCheckT';
import PolyConnectivity from '../../../Mesh/PolyConnectivity';

type Input = { mesh: PolyConnectivity, heh: HalfedgeHandle, start: HalfedgeHandle, lap_counter: number }
class Output { heh: HalfedgeHandle; lap_counter: number };

// eslint-disable-next-line
export default class GenericCirculator_ValueHandleFnsT {

    static is_valid(heh: HalfedgeHandle, lap_counter: number): boolean {
        return (heh.is_valid() && lap_counter === 0);
    }

    static init(_input: Input, centerEntityHandle, valueHandle, CW) {
        if (_input.heh.is_valid() && !GDCT.isDereferenciable(_input.mesh, _input.heh, centerEntityHandle, valueHandle) && _input.lap_counter === 0)
            this.increment(_input, centerEntityHandle, valueHandle, CW);
    }

    static increment(_input: Input, centerEntityHandle, valueHandle, CW) {
        return new Promise<Output>(async resolve => {
            if (valueHandle instanceof FaceHandle) {
                let output;
                do {
                    output = await GCCEF.increment(_input, centerEntityHandle, CW);
                } while (this.is_valid(_input.heh, _input.lap_counter) && !GDCT.isDereferenciable(_input.mesh, _input.heh, centerEntityHandle, valueHandle));
                resolve(output);
            } else {
                resolve(GCCEF.increment(_input, centerEntityHandle, CW));
            }
        })
    }

    static decrement(_input: Input, centerEntityHandle, valueHandle, CW) {
        return new Promise<Output>(async resolve => {
            if (valueHandle instanceof FaceHandle) {
                let output;
                do {
                    output = await GCCEF.decrement(_input, centerEntityHandle, CW);
                } while (this.is_valid(_input.heh, _input.lap_counter) && !GDCT.isDereferenciable(_input.mesh, _input.heh, centerEntityHandle, valueHandle));
                resolve(output);
            } else {
                resolve(GCCEF.decrement(_input, centerEntityHandle, CW));
            }
        })
    }
}