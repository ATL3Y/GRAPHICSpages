// Generate random noise texture
var clouds = function(){

    var noiseSize = 1000;
    var size = noiseSize * noiseSize;
    var data = new Uint8Array( 4 * size );
    for ( var i = 0; i < size * 4; i ++ ) {
        data[ i ] = Math.random() * 255 | 0;
    }
    var texture = new THREE.DataTexture( data, noiseSize, noiseSize, THREE.RGBAFormat );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    var uniformsSky = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2 },
        texture: { type: "t", value: texture}, // not passing new THREE.Texture(texture)
        color: {type: "c", value: new THREE.Color(0x1199FF)} // not passing
    };

    var mat = new THREE.ShaderMaterial( {
        uniforms: uniformsSky,
        vertexShader: document.getElementById('skyVS').innerHTML, 
        fragmentShader: document.getElementById('skyFS').innerHTML,
    } );

    var sky = new THREE.Mesh( new THREE.ParametricGeometry(SkyDome, 5, 5), mat ); //skydome function call is in parametricgeo function
    sky.position.set(0, -20, -100);
    sky.scale.set(2,2,2);
    sky.rotation.x = -Math.PI/100;
    return sky;
};

SkyDome = function(i, j) {
    i -= 0.5;
    j -= 0.5;
    var r2 = i*i*4 + j*j*4;
    var x, y, z;
    return new THREE.Vector3(i*20000, (1-r2)*5000, j*20000).multiplyScalar(0.05);
}