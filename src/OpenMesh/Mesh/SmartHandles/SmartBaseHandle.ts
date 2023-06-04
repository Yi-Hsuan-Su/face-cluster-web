import PolyConnectivity from '../PolyConnectivity';

export default class SmartBaseHandle {

    private mesh_: PolyConnectivity | undefined;

    constructor(_mesh?: PolyConnectivity) {
        this.mesh_ = _mesh;
    }

    mesh() {
        return this.mesh_;
    }
}