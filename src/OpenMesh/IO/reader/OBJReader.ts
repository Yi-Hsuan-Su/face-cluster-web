/* eslint-disable */

import BaseImporter from "../importer/BaseImporter";
import { FaceHandle, VertexHandle } from "../../Mesh/Handles/Handles";
import { Vector3, Vector2 } from "../../Utils/Vector";

function getPreprocessedLines(contents: string): string[] {
    const arr = contents.trim().split('\n');
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].trim();
    }
    return arr;
}
function removeDuplicatedVertices(faceVertices: VertexHandle[]): VertexHandle[] {
    return faceVertices.reduce((acc: VertexHandle[], current) => {
        const x = acc.find(item => item.idx() === current.idx());
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);
}
function isComment(line: string) {
    return (line.length === 0 || line === "#") ? true : false;
}

// o object_name | g group_name
const object_pattern = /^[og]\s*(.+)?/;
// mtllib file_reference
const material_library_pattern = /^mtllib /;
// usemtl material_name
const material_use_pattern = /^usemtl /;
// usemap map_name
const map_use_pattern = /^usemap /;
let counter = 0;
export default class OBJReader {
    get_description(): string {
        return "Alias/Wavefront";
    }
    get_extension(): string {
        return "obj";
    }
    async read(_fileContent: string, _bi: BaseImporter, _opt?: any): Promise<boolean> {
        return new Promise(async resolve => {
            let normals: Vector3[] = [];
            let colors: Vector3[] = [];
            let texcoords3d: Vector3[] = [];
            let texcoords: Vector2[] = [];
            let vertexHandles: VertexHandle[] = [];
            // eslint-disable-next-line
            let vhandles: VertexHandle[] = [];
            // eslint-disable-next-line
            let face_texcoords3d: Vector3[] = [];
            // eslint-disable-next-line
            let face_texcoords: Vector2[] = [];
            // eslint-disable-next-line
            let matname = ""


            const lines = getPreprocessedLines(_fileContent);
            // pass 1: read vertices
            if (!await this.read_vertices(lines, _bi, _opt,
                normals, colors, texcoords3d, texcoords,
                vertexHandles)) {
                resolve(false);
            }
            let nCurrentPositions = 0,
                nCurrentTexcoords = 0,
                nCurrentNormals = 0;
            // pass 2: read faces
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const characters = line.split(" ")
                const keyWrd = characters[0];

                // comment
                if (isComment(line)) { continue; };

                //material file
                if (material_library_pattern.test(line)) {
                    //TODO::?
                } else if (material_use_pattern.test(line)) {
                    //TODO::?
                } else if (keyWrd === "v") {
                    ++nCurrentPositions;
                } else if (keyWrd === "vt") {
                    ++nCurrentTexcoords;
                } else if (keyWrd === "vn") {
                    ++nCurrentNormals;
                } else if (keyWrd === "f") {
                    let component = 0, nV = 0;
                    let value;

                    vhandles = [];
                    face_texcoords = [];
                    face_texcoords3d = [];

                    let faceVertices: VertexHandle[] = [];
                    let fh: FaceHandle;

                    // read full line after detecting a face
                    //Vertex indices f v1 v2 v3 ....
                    if (characters[1].split("/").length === 1) {
                        for (let i = 1; i < characters.length; i++) {
                            const char = characters[i];
                            value = Number(char)
                            if (value < 0) {
                                value = nCurrentPositions + value + 1;
                            }
                            faceVertices.push(new VertexHandle(value - 1));
                        }
                    }
                    else {
                        for (let i = 1; i < characters.length; i++) {
                            const arr = characters[i].split('/');
                            const arr1 = characters[i].split('//');

                            //Vertex texture coordinate indices f v1/vt1 v2/vt2 v3/vt3 ...
                            if (arr.length === 2) {
                                value = Number(arr[0])
                                if (value < 0) {
                                    value = nCurrentPositions + value + 1;
                                }
                                faceVertices.push(new VertexHandle(value - 1));
                            }
                            //Vertex normal indices f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 ...
                            else if (arr.length === 3 && arr1.length !== 2) {
                                value = Number(arr[0])
                                if (value < 0) {
                                    value = nCurrentPositions + value + 1;
                                }
                                faceVertices.push(new VertexHandle(value - 1));
                            }
                            //Vertex normal indices without texture coordinate indices
                            // f v1//vn1 v2//vn2 v3//vn3 ...
                            else if (arr1.length === 2) {

                            }
                        }
                    }
                    // note that add_face can possibly triangulate the faces, which is why we have to
                    // store the current number of faces first
                    const n_faces = _bi.n_faces();

                    faceVertices = removeDuplicatedVertices(faceVertices);

                    // //A minimum of three vertices are required.
                    if (faceVertices.length > 2) {
                        fh = await _bi.add_face(faceVertices);
                    }
                    // if (!vhandles.length && fh.is_valid()) {
                    // _bi.add_face_texcoords(fh, vhandles[0], face_texcoords);
                    // _bi.add_face_texcoords(fh, vhandles[0], face_texcoords3d);
                    // }
                    //material.....
                }
            }
            resolve(true);
        })
    }
    read_vertices(lines: string[], _bi: BaseImporter, _opt: any,
        normals: Vector3[], colors: Vector3[], texcoords3d: Vector3[],
        texcoords: Vector2[], vertexHandles: VertexHandle[]): Promise<boolean> {
        return new Promise(async resolve => {
            let x, y, z, u, v, w;
            let r, g, b;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                if (isComment(line)) {
                    continue;
                }
                const elements = line.split(" ");
                const keyWrd = elements.length === 4 ? elements[0] : "";

                // vertex
                if (keyWrd === "v") {
                    x = Number(elements[1]);
                    y = Number(elements[2]);
                    z = Number(elements[3]);
                    vertexHandles.push(await _bi.add_vertex(new Vector3(x, y, z)))
                }

                // texture coord
                else if (keyWrd === "vt") {
                    //TODO::
                }
                // color per vertex
                else if (keyWrd === "vc") {
                    //TODO::
                }
                // normal
                else if (keyWrd === "vn") {
                    //TODO::
                }
            }
            resolve(true);
        })
    }
}