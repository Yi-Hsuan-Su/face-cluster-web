const FragmentShader = `
    precision mediump float;
	precision mediump int;
	varying vec3 vPosition;
    varying vec4 vColor;
    
	void main()	{
		gl_FragColor = vColor;
	}
`;

export default FragmentShader;