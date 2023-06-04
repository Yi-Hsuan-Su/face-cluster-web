const VertexShader = `
precision mediump float;
precision mediump int;
attribute vec4 color;
varying vec3 vPosition;
varying vec4 vColor;

void main()	{
    vPosition = position;
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}`;

export default VertexShader;