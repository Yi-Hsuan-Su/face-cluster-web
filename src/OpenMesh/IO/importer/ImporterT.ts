import StatusInfo from "../../Mesh/Attributes/Status";
import { VertexHandle, EdgeHandle, HalfedgeHandle, FaceHandle } from "../../Mesh/Handles/Handles";
import BaseImporter from "./BaseImporter";
import { resize } from "../../Utils/UtilsFunc";
import { Vector3 } from "../../Utils/Vector";
import TriMesh from "../../Mesh/TriMeshT";

export default class ImporterT<Mesh extends TriMesh> extends BaseImporter {
    mesh_: Mesh;

    init(mesh: Mesh) {
        this.mesh_ = mesh;
    }

    set_status(handle: VertexHandle | EdgeHandle | HalfedgeHandle | FaceHandle, _status: StatusInfo) {
        if (!this.mesh_.has_vertex_status()) {
            this.mesh_.request_vertex_status();
        }
        this.mesh_.set_status(handle, _status);
    };


    // add a vertex with coordinate \c _point
    add_vertex(_point?: Vector3): Promise<VertexHandle> {
        return this.async_add_vertex(_point);
    };
    async_add_vertex(_point?: Vector3): Promise<VertexHandle> {
        return new Promise(resolve => {
            if (_point === undefined) {
                resolve(this.mesh_.async_new_vertex());
            }
            resolve(this.mesh_.async_add_vertex(_point));
        })
    };
    // add an edge. Use set_next, set_vertex and set_face to set corresponding entities for halfedges
    add_edge(_vh0: VertexHandle, _vh1: VertexHandle) {
        return this.mesh_.new_edge(_vh0, _vh1);
    };
    // add a face with indices _indices refering to vertices
    // add a face with incident halfedge
    add_face(handles: VertexHandle[] | HalfedgeHandle) {
        return new Promise<FaceHandle>(async resolve => {
            let fh = new FaceHandle();

            if (handles instanceof HalfedgeHandle) {
                let fh = await this.mesh_.async_new_face();
                await this.mesh_.async_set_halfedge_handle(fh, handles);
                resolve(fh);
            }
            else if (Array.isArray(handles)) {
                if (handles.length > 2) {
                    // test for valid vertex indices
                    handles.forEach(handle => {
                        if (!this.mesh_.is_valid_handle(handle)) {
                            console.error("ImporterT: Face contains invalid vertex index!")
                            resolve(fh);
                        }
                    });

                    // don't allow double vertices
                    for (let i = 0; i < handles.length; i++) {
                        for (let j = i + 1; j < handles.length; j++) {
                            if (handles[i] === handles[j]) {
                                console.error("ImporterT: Face has equal vertices")
                                resolve(fh);
                            }
                        }
                    }

                    // try to add face
                    fh = await this.mesh_.add_face(handles);

                    // separate non-manifold faces and mark them
                    if (!fh.is_valid()) {
                        console.warn(fh)
                        let vhandles: VertexHandle[] = []
                        vhandles = await resize(vhandles, handles.length, new VertexHandle());
                        for (let j = 0; j < handles.length; j++) {

                            let p = this.mesh_.point(handles[j]);
                            vhandles[j] = await this.mesh_.async_add_vertex(p);

                            // Mark vertices of failed face as non-manifold
                            if (this.mesh_.has_vertex_status()) {
                                this.mesh_.status(vhandles[j]).set_fixed_nonmanifold(true);
                            }
                        }

                        // add face
                        fh = await this.mesh_.add_face(vhandles);
                        // Mark failed face as non-manifold
                        if (this.mesh_.has_face_status()) {
                            this.mesh_.status(fh).set_fixed_nonmanifold(true);
                        }

                        // Mark edges of failed face as non-two-manifold
                        if (this.mesh_.has_edge_status()) {
                            for (let fe_it = this.mesh_.fe_cwiter(fh); fe_it.is_valid(); fe_it.next()) {
                                this.mesh_.status(fe_it.handle()).set_fixed_nonmanifold(true);
                            }
                        }
                    }
                    resolve(fh);
                }
            }
        })
    };
    // Set outgoing halfedge for the given vertex.
    set_halfedge(_vh: VertexHandle, _heh: HalfedgeHandle) {
        this.mesh_.set_halfedge_handle(_vh, _heh);
    };
    // set next halfedge handle
    set_next(_heh: HalfedgeHandle, _next: HalfedgeHandle) {
        this.mesh_.set_next_halfedge_handle(_heh, _next);
    };
    // set incident face handle for given halfedge
    set_face(_heh: HalfedgeHandle, _fh: FaceHandle) {
        this.mesh_.set_face_handle(_heh, _fh);
    };


    // query number of faces, vertices, normals, texcoords
    n_vertices() { return this.mesh_.n_vertices(); };
    n_faces() { return this.mesh_.n_faces(); };
    n_edges() { return this.mesh_.n_edges(); };

    // pre-processing
    prepare() { };

    // post-processing
    finish() { };
}