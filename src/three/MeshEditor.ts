import * as THREE from "three";
import Global from "./Global"
import TriMesh from "OpenMesh/Mesh/TriMeshT";
import { FaceHandle, VertexHandle } from "OpenMesh/Mesh/Handles/Handles";
import { MeshBasicMaterial } from "three";
import {Cluster} from "./Cluster";
import { debuglog } from "util";
let self: MeshEditor;

function getL2Distance(point: THREE.Vector3, v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3): number {
  point.distanceTo(v1)
  return point.distanceTo(v1) + point.distanceTo(v2) + point.distanceTo(v3);
}

export default class MeshEditor {
  public mesh: THREE.Mesh;
  public points: THREE.Points;
  public selectedFacesMeshes: THREE.Group = new THREE.Group();
  //
  private camera: THREE.Camera;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  //
  private triMesh: TriMesh;
  private selectMode: boolean = true;
  private selectedFaces: FaceHandle[];
  private selectedPoints: VertexHandle[];
  private renderedFaceIndex: number[];
  private renderedPointsIndex: number[];
  //
  private initPointsColor: number[];
  private _pointScale: number;
  //
  private face = [];
  private normal = [];
  private clustercolor = Array<THREE.Color>();
  private m_Cluster:Array<Cluster>;
  private m_newCluster:Array<Cluster>;
  public facehandle:Array<FaceHandle>;
  //

  constructor() {
    this.camera = Global.inst.viewportController.camera;
    this.selectedPoints = [];
    this.selectedFaces = [];
    this.renderedFaceIndex = [];
    this.renderedPointsIndex = [];
    this.m_Cluster = Array<Cluster>();
    this.m_newCluster = Array<Cluster>();
    this.facehandle = Array<FaceHandle>();
    this.clustercolor = Array<THREE.Color>();
    this.face=[];
    this.normal = [];
    this.clustercolor = [];
    self = this;
  }

  set pointScale(value: number) {
    this._pointScale = value;
    this.selectedFacesMeshes.scale.setScalar(value)
  }

  get pointScale() {
    return this._pointScale;
  }

  load(mesh: THREE.Mesh, points: THREE.Points, triMesh: TriMesh) {
    console.log(triMesh)
    this.triMesh = triMesh;
    this.mesh = mesh;
    this.points = points;
    this.pointScale = 1;
    const pointsGeometry = points.geometry as THREE.BufferGeometry;
    this.initPointsColor = Array.from(pointsGeometry.getAttribute("color").array);
    this.attachPointerEvent();
  }

  setVertexColor(vertexHandles: VertexHandle[], color: THREE.Color) {
    const geometry = this.points.geometry as THREE.BufferGeometry;
    const colors = Array.from(geometry.getAttribute("color").array);
    for (let i = 0; i < vertexHandles.length; i++) {
      const index = vertexHandles[i].idx();
      colors[3 * index] = color.r;
      colors[3 * index + 1] = color.g;
      colors[3 * index + 2] = color.b;
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  }

  async createTriangle(faceHandles: FaceHandle[], color: THREE.Color) {
    const op = this.triMesh;
    const geometry = new THREE.BufferGeometry();
    const vertices = []
    for (let i = 0; i < faceHandles.length; i++) {
      for (let fv_it = op.fv_cwiter(faceHandles[i]); fv_it.is_valid(); await fv_it.next()) {
        const pointPos = op.point(fv_it.handle());
        vertices.push(pointPos.x, pointPos.y, pointPos.z);
      }
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    const material = new MeshBasicMaterial({ color })
    return new THREE.Mesh(geometry, material);
  }

  openMeshDemo(e) {
    if (e.key === "e" || e.key === "E") {
      if (self.selectMode) {
        self.findOneRingVertices();
      } else {
        self.findOneRingFaces();
      }
    } else if (e.key === "q" || e.key === "Q") {
      self.selectMode = !self.selectMode;
      self.clearSelected();
      console.log(self.selectMode);
    }
  }

  async findOneRingVertices() {
    const oneRingVertices: VertexHandle[] = [];
    if (this.selectedPoints.length > 0) {
      for (let i = 0; i < this.selectedPoints.length; i++) {
        for (let vv_cwiter = self.triMesh.vv_cwbegin(this.selectedPoints[i]); vv_cwiter.is_valid(); await vv_cwiter.next()) {
          if (oneRingVertices.find(handle => handle.idx() === vv_cwiter.handle().idx()) === undefined) {
            if (!this.renderedPointsIndex.includes(vv_cwiter.handle().idx())) {
              oneRingVertices.push(vv_cwiter.handle());
              //record the rendered faces' index.
              this.renderedPointsIndex.push(vv_cwiter.handle().idx());
              const handle = vv_cwiter.handle()
              oneRingVertices.push(handle);
            }
          }
        }
      }
      this.selectedPoints = [];
      this.setVertexColor(oneRingVertices, new THREE.Color(0x0000ff));
      this.selectedPoints = Array.from(oneRingVertices);
    }
  }

  async findOneRingFaces() {
    const oneRingFaces = []
    if (this.selectedFaces.length > 0) {
      for (let i = 0; i < this.selectedFaces.length; i++) {
        for (let ff_iter = self.triMesh.ff_cwiter(this.selectedFaces[i]); ff_iter.is_valid(); await ff_iter.next()) {
          //determine whether the face has been rendered, if so, ignore the rendered face.
          if (oneRingFaces.find(handle => handle.idx() === ff_iter.handle().idx()) === undefined) {
            if (!this.renderedFaceIndex.includes(ff_iter.handle().idx())) {
              oneRingFaces.push(ff_iter.handle());
              //record the rendered faces' index.
              this.renderedFaceIndex.push(ff_iter.handle().idx());
            }
          }
        }
      }
      this.selectedFaces = [];
      const face = await this.createTriangle(oneRingFaces, new THREE.Color(0x0000ff));
      this.selectedFaces = Array.from(oneRingFaces);
      this.selectedFacesMeshes.add(face);
    }
  }

  clearSelected() {
    //clear face meshes.
    while (this.selectedFacesMeshes.children.length !== 0) {
      this.selectedFacesMeshes.remove(this.selectedFacesMeshes.children[0]);
    }
    if (this.selectedFaces.length > 0) {
      //remove all records and 
      this.selectedFaces = [];
      this.renderedFaceIndex = [];
    }

    const pointsGeometry = this.points.geometry as THREE.BufferGeometry;
    pointsGeometry.setAttribute("color", new THREE.Float32BufferAttribute(this.initPointsColor, 3));
    if (this.selectedPoints.length > 0) {
      //change the vertices color back to the original color.
      this.selectedPoints = [];
      this.renderedPointsIndex = [];
    }
  }
//---------------------------------------------------------------這個區塊是我加的
  Random_cluster_color()
  {
    for(let i = 0 ; i < 3000 ; i++)
    {
    this.clustercolor.pop();
    }
    for(let i = 0 ; i < 3000 ; i++)
    {
      this.clustercolor.push(new THREE.Color(Math.random(),Math.random(),Math.random()));//tmp.setHex(Math.random()*0xffffff
    }
    //console.log("color" ,this.clustercolor);
  }


   caculate_normal() 
  {
    for(let i=0 ; i < this.face.length;i++)
    {
   //console.log("vector",this.face[i]);
     var vector1 =new THREE.Vector3();
     vector1.subVectors(this.face[i][0],this.face[i][1]);
     var vector2 =new THREE.Vector3();
     vector2.subVectors(this.face[i][2],this.face[i][1]);
     //console.log("v1",vector1)
    // console.log("v2",vector2)
     var m_normal = vector1.cross(vector2);
      this.normal.push(m_normal.normalize());

    }
  }

  findnormal(cl:Cluster[] , norm:THREE.Vector3)
  {
    for(let i =0 ; i < cl.length;i++  )
    {
     // console.log(cl[i].normal.dot(norm));
      if( cl[i].normal.dot(norm)>0.98)
      {
       
        return i;
      }
    }
      return -1;
  }

  Normal_CLustering()
  {
    for(let i=0 ; i < this.face.length;i++)
    {
      var isfind =  this.findnormal(this.m_Cluster,this.normal[i])
      if(isfind !=-1 )
      {
        this.m_Cluster[isfind].faceid.push(i);
        this.m_Cluster[isfind].facehandle.push(this.facehandle[i]);
      }
      else
      {
        var tmp = new Cluster();
        tmp.faceid.push(i);
        tmp.facehandle.push(this.facehandle[i]);
        tmp.normal = this.normal[i];
        tmp.color = this.clustercolor[i];
        this.m_Cluster.push(tmp);
      }
    }
  }


  calplanedist(norm:THREE.Vector3,center:THREE.Vector3,qpoint:THREE.Vector3)
  {
  
    var planeequation;
    var normalizevalue;
    var dist;
    var norm0:number ,norm1:number,norm2:number , qpoint0:number , qpoint1:number,qpoint2:number,center0:number,center1:number,center2:number;

    norm0 = norm.getComponent(0).valueOf();
    norm1 = norm.getComponent(1).valueOf();
    norm2 = norm.getComponent(2).valueOf();
    
    qpoint0 = qpoint.getComponent(0).valueOf();
    qpoint1 = qpoint.getComponent(1).valueOf();
    qpoint2 = qpoint.getComponent(2).valueOf();

    center0 = center.getComponent(0).valueOf();
    center1 = center.getComponent(1).valueOf();
    center2 = center.getComponent(2).valueOf();


    planeequation = norm0 * (qpoint0 - center0) + norm1 * (qpoint1 - center1) + norm2 * (qpoint2 - center2);
    normalizevalue =Math.sqrt( Math.pow(norm0,2) + Math.pow(norm1,2) + Math.pow(norm2,2) );
	  dist = Math.abs(planeequation / normalizevalue);
	  return dist;
  }

  plandistclustering()
  {
    var checklist = [];



    for(let i=0 ; i < this.m_Cluster.length;i++)
    {
      for(let i=0 ; i < this.face.length;i++)
      {
        checklist.push(-1);
      }
      for(let j = 0 ;j<this.m_Cluster[i].faceid.length;j++)
      {
        if(checklist[this.m_Cluster[i].faceid[j]]==-1)
        {
       // checklist[this.m_Cluster[i].faceid[j]] = 1;
        var tmpcl = new Cluster();
        for(let k = 0 ;k<this.m_Cluster[i].faceid.length;k++)
        {
          if(checklist[this.m_Cluster[i].faceid[k]]==-1)
          {

            var dist:number = this.calplanedist(this.normal[this.m_Cluster[i].faceid[j]] ,this.face[this.m_Cluster[i].faceid[j]][0] , this.face[this.m_Cluster[i].faceid[k]][0] );
            console.log("dist", dist);
            if(dist < 0.1)
            {
              checklist[this.m_Cluster[i].faceid[k]]=1;
             tmpcl.faceid.push(this.m_Cluster[i].faceid[k]);
             tmpcl.facehandle.push(this.m_Cluster[i].facehandle[k]);
             tmpcl.normal = this.m_Cluster[i].normal;
            }     
          } 
         }
        this.m_newCluster.push(tmpcl);
        }
      }
 
    }


    for(let i=0 ; i < this.m_newCluster.length;i++)
    {
      this.m_newCluster[i].color = this.clustercolor[i];
    }
  }


  async CLustering()
  {
    for (let f_iter = self.triMesh.faces_begin(); f_iter.idx() !== self.triMesh.faces_end().idx(); f_iter.next()) {

      let fv_iter = self.triMesh.fv_cwiter(f_iter.handle());

      let temp = self.triMesh.point(fv_iter.handle());
      const temp1 = new THREE.Vector3(temp.x, temp.y, temp.z);
      temp1.multiplyScalar(this._pointScale);
      await fv_iter.next();

      temp = self.triMesh.point(fv_iter.handle());
      const temp2 = new THREE.Vector3(temp.x, temp.y, temp.z);
      temp2.multiplyScalar(this._pointScale);

      await fv_iter.next();

      temp = self.triMesh.point(fv_iter.handle());
      const temp3 = new THREE.Vector3(temp.x, temp.y, temp.z);
      temp3.multiplyScalar(this._pointScale);
      //--------------------------
      var tmpf = [temp1 ,temp2 ,temp3];
      this.face.push(tmpf);
      this.facehandle.push(f_iter.handle());
      //-------------------------
    }
   // console.log("face size",this.facehandle.length);
    this.caculate_normal();
    this.Random_cluster_color();
    this.Normal_CLustering();
    this.plandistclustering();
    //console.log("cluster size",JSON.parse(JSON.stringify(this.m_Cluster[0].color)));

     
    for(let i = 0 ; i <this.m_newCluster.length;i++)
    {
     //console.log("cluster",this.m_Cluster);
      for(let j = 0 ; j< this.m_newCluster[i].facehandle.length;j++)
      {
        //console.log("color", this.m_Cluster[i].color[j][0] , this.m_Cluster[i].color[j][1] ,  this.m_Cluster[i].color[j][2]);
      const face = await this.createTriangle([this.m_newCluster[i].facehandle[j]], this.m_newCluster[i].color);//this.m_Cluster[i].color[j])
      this.selectedFacesMeshes.add(face);
      //record rendered face.
      this.renderedFaceIndex.push(this.m_newCluster[i].facehandle[j].idx());//this.m_Cluster[i].facehandle[j].idx()
      }
    }



    /*
    for(let i = 0 ; i <this.m_Cluster.length;i++)
    {
     //console.log("cluster",this.m_Cluster);
      for(let j = 0 ; j< this.m_Cluster[i].facehandle.length;j++)
      {
        //console.log("color", this.m_Cluster[i].color[j][0] , this.m_Cluster[i].color[j][1] ,  this.m_Cluster[i].color[j][2]);
      const face = await this.createTriangle([this.m_Cluster[i].facehandle[j]], this.m_Cluster[i].color);//this.m_Cluster[i].color[j])
      this.selectedFacesMeshes.add(face);
      //record rendered face.
      this.renderedFaceIndex.push(this.m_Cluster[i].facehandle[j].idx());//this.m_Cluster[i].facehandle[j].idx()
      }
    }*/

    
  }

//-----------------------------------------------------
  async getFace() {

    const intersects = self.raycaster.intersectObject(this.mesh);
    let selectedFace: FaceHandle;

    if (intersects.length > 0) {
      let min = 10;
      const point = intersects[0].point;
      //find the nearest face for the clickeddown position.
      for (let f_iter = self.triMesh.faces_begin(); f_iter.idx() !== self.triMesh.faces_end().idx(); f_iter.next()) {

        let fv_iter = self.triMesh.fv_cwiter(f_iter.handle());

        let temp = self.triMesh.point(fv_iter.handle());
        const temp1 = new THREE.Vector3(temp.x, temp.y, temp.z);
        temp1.multiplyScalar(this._pointScale);
        await fv_iter.next();

        temp = self.triMesh.point(fv_iter.handle());
        const temp2 = new THREE.Vector3(temp.x, temp.y, temp.z);
        temp2.multiplyScalar(this._pointScale);

        await fv_iter.next();

        temp = self.triMesh.point(fv_iter.handle());
        const temp3 = new THREE.Vector3(temp.x, temp.y, temp.z);
        temp3.multiplyScalar(this._pointScale);
        //--------------------------
        var tmpf = [temp1 ,temp2 ,temp3];
        this.face.push(tmpf);
        //-------------------------
        let distance = getL2Distance(point, temp1, temp2, temp3)
        if (distance < min) {
          min = distance;
          selectedFace = f_iter.handle();
        }
      }
      if (selectedFace !== undefined) {
        if (!this.renderedFaceIndex.includes(selectedFace.idx())) {
          const face = await this.createTriangle([selectedFace], new THREE.Color(0x0000ff));
          this.selectedFacesMeshes.add(face);
          //record selected faces.
          this.selectedFaces.push(selectedFace);
          //record rendered face.
          this.renderedFaceIndex.push(selectedFace.idx());
        }
      }
    }
  }

  async getPoint() {
    const intersects = this.raycaster.intersectObject(
      this.mesh
    );
    if (intersects.length > 0) {
      let min = 10;

      const clickedPointPosition = intersects[0].point;
      let clickedPoint: VertexHandle;
      for (let v_iter = this.triMesh.vertices_begin(); v_iter.idx() !== this.triMesh.vertices_end().idx(); v_iter.next()) {
        const { x, y, z } = clickedPointPosition;
        const point = this.triMesh.point(v_iter.handle());
        const distance = Math.sqrt(Math.pow((x - point.x * this._pointScale), 2) + Math.pow((y - point.y * this._pointScale), 2) + Math.pow((z - point.z * this._pointScale), 2));
        if (distance <= min) {
          min = distance;
          clickedPoint = v_iter.handle();
        }
      }

      if (clickedPoint !== undefined) {
        if (!this.renderedPointsIndex.includes(clickedPoint.idx())) {
          this.setVertexColor([clickedPoint], new THREE.Color(0x0000ff));
          this.selectedPoints.push(clickedPoint);
          this.renderedPointsIndex.push(clickedPoint.idx());
        }
      }
    }
  }

  onPointerDown(event: PointerEvent) {
    if (event.buttons === 1) {
      self.setRaycaster(event);
      if (self.selectMode) {
        self.getPoint();
      } else {
        self.getFace();
      }
    } else {
      self.clearSelected();
    }
  }

  setRaycaster(event: any) {
    this.getMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  getMouse(event: any) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  attachPointerEvent() {
    document.addEventListener("pointerdown", this.onPointerDown, false);
    window.addEventListener("keydown", this.openMeshDemo);
  }
}
