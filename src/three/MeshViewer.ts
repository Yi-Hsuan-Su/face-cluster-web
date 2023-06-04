import * as THREE from "three";
import MeshEditor from "./MeshEditor";
import Global from "./Global";
import ViewportController from "./ViewportController";
import TriMesh from "OpenMesh/Mesh/TriMeshT";
import FragmentShader from "./Shader/FragmentShader";
import VertexShader from "./Shader/VertexShader";
import PointShader from "./Shader/Point";
import * as dat from "dat-gui";

export default class MeshViewer {

  scene: THREE.Scene;
  mesh: THREE.Mesh;
  points: THREE.Points;
  isAdded: boolean;
  meshEditor: MeshEditor;
  viewportControls: ViewportController = Global.inst.viewportController;
  triMesh: TriMesh;
  gui: dat;
  originalScale: number;
  pointSize: number;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.isAdded = false;
    this.viewportControls.init(canvas);
    this.meshEditor = new MeshEditor();
    this.gui = new dat.GUI();
    this.pointSize = 0.05;
    this.originalScale = 1;
    const self = this;
    const animate = function () {
      requestAnimationFrame(animate);
      self.viewportControls.render(self.scene);
    };

    animate();
  }

  removeOld() {
    return new Promise<void>(resolve => {
      if (this.isAdded) {
        while (this.scene.children.length !== 0) {
          this.scene.remove(this.scene.children[0]);
        }
        this.points.geometry.dispose();
        this.mesh.geometry.dispose();
        this.meshEditor.clearSelected();
        this.originalScale = 0;
      }
      resolve();
    })
  }
  // Set 3D model in to scene
  async setModel(mesh: THREE.Mesh, triMesh: TriMesh) {
    console.log(mesh);
    this.mesh = mesh;
    this.triMesh = triMesh
    this.meshPreproccessing();
    this.meshEditor.load(this.mesh, this.points, this.triMesh);
    this.scene.add(this.meshEditor.selectedFacesMeshes);

    this.points.renderOrder = 3;
    this.mesh.renderOrder = 0;
    this.meshEditor.selectedFacesMeshes.renderOrder = 2;

    if (!this.isAdded) {
      this.setPointSizeGUI();
      this.setModelScaleGUI();
    } else {
      this.gui.__controllers.forEach(controller =>
        controller.setValue(controller.initialValue));
    }
    this.isAdded = true;
  }

  normalizeModel() {
    const size = new THREE.Vector3()
    const bbox = new THREE.Box3().setFromObject(this.mesh);
    bbox.getSize(size);
    const maxSize = Math.max(size.x, size.y, size.z);
    this.originalScale = 1 / maxSize;

    this.mesh.scale.setScalar(1 / maxSize);
    this.points.scale.setScalar(1 / maxSize);
    this.meshEditor.pointScale = 1 / maxSize;
  }

  showMeshWire(option: boolean) {
    const material = this.mesh.material as THREE.MeshBasicMaterial;
    material.wireframe = option;
  }

  showPoints(option: boolean) {
    this.points.visible = option;
  }
  //Setup Mesh's Color and create Vertices' point
  meshPreproccessing() {
    const geometry = this.mesh.geometry as THREE.BufferGeometry;
    const colors: number[] = [];
    const vertices = geometry.getAttribute("position").array;
    //setup default color of mesh 
    const material = new THREE.ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      side: THREE.DoubleSide,
      transparent: false
    })
    for (let i = 0; i < vertices.length / 3; i++) {
      const color = new THREE.Color(0xff0000);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    this.mesh.material = material;

    //setup points of mesh
    const pointSize = 0.05;
    const pointVertices = [];
    const pointColor = [];
    const pointSizeArr = [];
    for (let i = 0; i < this.triMesh.n_vertices(); i++) {
      const color = new THREE.Color(0x00ff00);
      pointColor.push(color.r, color.g, color.b);
      const pointPosition = this.triMesh.point(this.triMesh.vertex_handle(i));
      pointVertices.push(pointPosition.x, pointPosition.y, pointPosition.z);
      pointSizeArr.push(pointSize)
    }
    const pointGeometry = new THREE.BufferGeometry();
    const pointShader = new PointShader();
    const pointMaterial = new THREE.ShaderMaterial({
      vertexShader: pointShader.vertexShader,
      fragmentShader: pointShader.fragmentShader,
      side: THREE.DoubleSide,
      transparent: false
    })
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointVertices, 3));
    pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(pointColor, 3));
    pointGeometry.setAttribute('size', new THREE.Float32BufferAttribute(pointSizeArr, 1));
    this.points = new THREE.Points(pointGeometry, pointMaterial);
    this.normalizeModel();
    this.scene.add(this.mesh);
    this.scene.add(this.points);
  }

  setPointSizeGUI() {
    const pointSize = {
      point_size: this.pointSize
    }
    const slider = this.gui.add(pointSize, 'point_size', 0.001, 1, 0.01);
    slider.onChange(value => {
      if (this.points === undefined) {
        return;
      }
      const geometry = this.points.geometry as THREE.BufferGeometry;
      const length = geometry.getAttribute("size").array.length;
      const sizeArr = [];
      for (let i = 0; i < length; i++) {
        sizeArr.push(value);
      }
      geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizeArr, 1));
    });
  }

  setModelScaleGUI() {
    const modelScale = {
      scale: 1
    }
    const slider = this.gui.add(modelScale, 'scale', 0.1, 20, 0.1);
    slider.onChange(async value => {
      if (this.points === undefined) {
        return;
      } else {
        const newScale = this.originalScale * value;
        this.points.scale.setScalar(newScale);
        this.mesh.scale.setScalar(newScale);
        this.meshEditor.pointScale = newScale;
      }
    });
  }
}
