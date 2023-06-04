import { FaceHandle, HalfedgeHandle, VertexHandle } from './Handles/Handles';


export class Vertex {
    halfedge_handle_: HalfedgeHandle = new HalfedgeHandle();
}

export class Halfedge_without_prev {
    face_handle_: FaceHandle = new FaceHandle();
    vertex_handle_: VertexHandle = new VertexHandle();
    next_halfedge_handle_: HalfedgeHandle = new HalfedgeHandle();
}

export class Halfedge_with_prev extends Halfedge_without_prev {
    prev_halfedge_handle_: HalfedgeHandle = new HalfedgeHandle();
}

export class Edge {
    halfedges_: Halfedge_with_prev[] = [new Halfedge_with_prev(), new Halfedge_with_prev()];
}

export class Face {
    halfedge_handle_: HalfedgeHandle = new HalfedgeHandle();
}
