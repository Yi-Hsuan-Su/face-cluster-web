import * as THREE from "three";
import Global from "./Global"
import TriMesh from "OpenMesh/Mesh/TriMeshT";
import { FaceHandle, VertexHandle } from "OpenMesh/Mesh/Handles/Handles";
import { MeshBasicMaterial } from "three";
import { FaceEdgeCWIter } from "OpenMesh/Mesh/Iterators";



let self:Cluster;



export class  Cluster {

    public facehandle:Array<FaceHandle>;
    public faceid:Array<number>;
    public normal:THREE.Vector3;
    public color: THREE.Color;
    constructor()
    {
        this.facehandle = Array<FaceHandle>();
        this.faceid =Array<number>();
        this.normal = new THREE.Vector3();
        this.color =  new THREE.Color(0xffffff);

    }
}