// Generate random noise texture
var clouds3 = function(){

    var noiseSize = 256;
    var size = noiseSize * noiseSize;
    var data = new Uint8Array( 4 * size );
    for ( var i = 0; i < size * 4; i ++ ) {
        data[ i ] = Math.random() * 255 | 0;
    }
    var texture = new THREE.DataTexture( data, noiseSize, noiseSize, THREE.RGBAFormat );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    var geo = new THREE.PlaneGeometry( 2000, 2000, 256 );
    var mat = new THREE.MeshLambertMaterial({color: 0x000000, map: texture});
    sky = new THREE.Mesh(geo, mat);
    //sky.visible = false;
    sky.position.set(0, 0, -35);
    sky.scale.set(.1,.1,.1);



    return sky;



}