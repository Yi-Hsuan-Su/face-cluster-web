import Global from "three/Global";
import React from "react";
import MeshViewer from "three/MeshViewer";
import ObjUploadButton from "./ObjUploadButton";
import CustomTriMesh from "three/CustomTriMesh";
import OBJLoader2 from "../../three/ObjectLoader";
import * as THREE from "three";
import MeshEditor from "three/MeshEditor";
let triMesh;
let meshViewer: MeshViewer;
let self: Viewer;
type State = {
  showMesh: boolean;
  showPoint: boolean;
  btnText: string;
  pointBtnText: string;
  clusteringtext:string;
  objLoaded: boolean;
};
type Props = {};
export default class Viewer extends React.Component<Props, State> {
  canvas: HTMLCanvasElement;
  canvasCss: {};
  meshDisplayCss: {};
  constructor(props: any) {
    super(props);
    this.state = {
      btnText: "Show Mesh",
      pointBtnText: "Show Point",
      clusteringtext:"Clustering",
      showPoint: true,
      showMesh: false,
      objLoaded: false,
    };
    this.canvasCss = {
      width: "100%",
      height: "100%",
      position: "absolute",
      bottom: "0",
    };
    this.meshDisplayCss = {
      position: "relative",
    };
    this.meshDisplayControl = this.meshDisplayControl.bind(this);
    this.pointDisplayControl = this.pointDisplayControl.bind(this);
    this.Clusterfacecontroller=  this.Clusterfacecontroller.bind(this);
    //
    self = this;
  }

  pointDisplayControl() {
    const { showPoint, objLoaded } = this.state;
    if (!objLoaded) return;
    let text = "";
    meshViewer.showPoints(!showPoint);
    if (!showPoint) {
      text = "Close Point";
    } else {
      text = "Show Point";
    }
    this.setState({ showPoint: !showPoint, pointBtnText: text });
  }

  meshDisplayControl() {
    const { showMesh, objLoaded } = this.state;
    if (!objLoaded) return;
    let text = "";
    meshViewer.showMeshWire(!showMesh);
    if (!showMesh) {
      text = "Close Mesh";
    } else {
      text = "Show Mesh";
    }
    this.setState({ showMesh: !showMesh, btnText: text });
  }


  Clusterfacecontroller()
  {
    const { showMesh, objLoaded } = this.state;
    if (!objLoaded) return;

    meshViewer.meshEditor.CLustering();

  }

  async updateObj(text: string) {
    triMesh = new CustomTriMesh();
    console.log("Load Obj Model.");
    const objLoader: any = new OBJLoader2();
    const meshGroup = objLoader.parse(text) as THREE.Object3D;
    const meshConnectivity = await Global.inst.openMesh.read(text, triMesh);
    self.setState({ objLoaded: true });
    await meshViewer.removeOld();
    meshViewer.setModel(meshGroup.children[0] as THREE.Mesh, meshConnectivity);
  }

  componentDidMount() {
    meshViewer = new MeshViewer(this.canvas);
  }

  render() {
    return (
      <div className="Main">
        <div className="viewerContainer">
          <canvas
            style={this.canvasCss}
            ref={(ref) => {
              this.canvas = ref;
            }}
            id="webGL Canvas"
          />
        </div>
        <div className="UI">
          <label>
            Upload Obj
            <ObjUploadButton updateObj={this.updateObj} />
          </label>
          <button
            type="button"
            style={this.meshDisplayCss}
            onClick={this.meshDisplayControl}
          >
            {this.state.btnText}
          </button>
          <button
            type="button"
            style={this.meshDisplayCss}
            onClick={this.pointDisplayControl}
          >
            {this.state.pointBtnText}
          </button>
          <button
            type="button"
            style={this.meshDisplayCss}
            onClick={this.Clusterfacecontroller}
          >
            {this.state.clusteringtext}
          </button>
        </div>
      </div>
    );
  }
}
