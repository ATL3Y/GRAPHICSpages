// Generate random noise texture
var water = function(){

    var noiseSize = 1000;
    var size = noiseSize * noiseSize;
    var data = new Uint8Array( 4 * size );
    for ( var i = 0; i < size * 4; i ++ ) {
        data[ i ] = Math.random() * 255 | 0;
    }
    var texture = new THREE.DataTexture( data, noiseSize, noiseSize, THREE.RGBAFormat );
    texture.anisotropy = 1;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    var geo = new THREE.PlaneBufferGeometry( 3000, 3000, 10, 10 );
    // var mat = new THREE.MeshPhongMaterial({color: 0x333333});
    // terrain = new THREE.Mesh(geo, mat);

    var uniformsWater = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2 ( 16, 16 ) }, 
        texture: { type: "t", value: texture } 
    };

    var mat = new THREE.ShaderMaterial( {
        uniforms: uniformsWater,
        vertexShader: document.getElementById('skyVS').innerHTML, 
        fragmentShader: document.getElementById('waterFS').innerHTML
    } );

    var water = new THREE.Mesh( geo, mat );

    water.position.set(0, -100, -50);
    water.rotation.x = -Math.PI/2;

    return water;
}