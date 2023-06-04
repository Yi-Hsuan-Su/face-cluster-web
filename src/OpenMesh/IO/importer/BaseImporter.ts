import StatusInfo from "../../Mesh/Attributes/Status";
import { EdgeHandle, FaceHandle, HalfedgeHandle, VertexHandle } from "../../Mesh/Handles/Handles";
import { Vector3 } from "../../Utils/Vector"

export default abstract class BaseImporter {

    // set vertex,edge,halfedge,face status
    abstract set_status(handle: VertexHandle | EdgeHandle | HalfedgeHandle | FaceHandle, status: StatusInfo);


    // add a vertex with coordinate \c _point
    abstract add_vertex(_point: Vector3);
    // add an edge. Use set_next, set_vertex and set_face to set corresponding entities for halfedges
    abstract add_edge(_vh0: VertexHandle, _vh1: VertexHandle);
    // add a face with indices _indices refering to vertices
    // add a face with incident halfedge
    abstract add_face(handles: VertexHandle[] | HalfedgeHandle);
    // Set outgoing halfedge for the given vertex.
    abstract set_halfedge(_vh: VertexHandle, _heh: HalfedgeHandle);
    // set next halfedge handle
    abstract set_next(_heh: HalfedgeHandle, _next: HalfedgeHandle);
    // set incident face handle for given halfedge
    abstract set_face(_heh: HalfedgeHandle, _fh: FaceHandle);

    // query number of faces, vertices, normals, texcoords
    abstract n_vertices();
    abstract n_faces();
    abstract n_edges();

    // pre-processing
    abstract prepare();

    // post-processing
    abstract finish();
}