import StatusInfo from './Status';

enum AttributeBits {
    None = 0,  ///< Clear all attribute bits
    Normal = 1,  ///< Add normals to mesh item (vertices/faces)
    Color = 2,  ///< Add colors to mesh item (vertices/faces/edges)
    PrevHalfedge = 4,  ///< Add storage for previous halfedge (halfedges). The bit is set by default in the DefaultTraits.
    Status = 8,  ///< Add status to mesh item (all items)
    TexCoord1D = 16, ///< Add 1D texture coordinates (vertices, halfedges)
    TexCoord2D = 32, ///< Add 2D texture coordinates (vertices, halfedges)
    TexCoord3D = 64, ///< Add 3D texture coordinates (vertices, halfedges)
    TextureIndex = 128 ///< Add texture index (faces)
};

export default class Attributes {
    StatusInfo = new StatusInfo();
    AttributeBits = AttributeBits;
}