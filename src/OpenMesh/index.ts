import IOManager from './IO/IOManager'
import TriMesh from './Mesh/TriMeshT';
export default class OpenMesh {
    ioManager: IOManager = new IOManager();

    read<T extends TriMesh>(objContext: string, triMesh: T): Promise<any> {
        return (this.ioManager.read(objContext, triMesh));
    }
}