import ImporterT from "../IO/importer/ImporterT"
import OBJReader from "../IO/reader/OBJReader";
import TriMesh from "../Mesh/TriMeshT";

export default class IOManager {
    importer: ImporterT<TriMesh>;
    objReader: OBJReader;
    mesh: any;
    constructor() {
        this.importer = new ImporterT();
        this.objReader = new OBJReader();
    }

    async read(_fileContent: string, mesh: any): Promise<any> {
        return new Promise(async resolve => {
            this.mesh = mesh;
            await this.mesh.init();
            this.importer.init(this.mesh);
            await this.objReader.read(_fileContent, this.importer)
            resolve(this.mesh);
        })
    }
}