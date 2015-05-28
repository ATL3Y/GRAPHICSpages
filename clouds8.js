var clouds = function(){

    var noiseSize = 256;
    var size = noiseSize * noiseSize;
    var d0 = new Uint8Array( 64 * size ); 
    var d1 = new Uint8Array( 16 * size ); //need array of vec3 to control color range
    var d2 = new Uint8Array( 4 * size );
    var d3 = new Uint8Array( 4 * size );

    var maxAnisotropy = renderer.getMaxAnisotropy();

    for ( var i = 0; i < size * 64; i++ ) {
        d0[ i ] = Math.random() * 255 | 0;
    }

    for ( var i = 0; i < size * 16; i++ ) {
        d1[ i ] = d0[ i ]/4 + d0[ i*2 ]/4 + d0[ i*3 ]/4 + d0[ i*4 ]/4;
    }

    for ( var i = 0; i < size * 4; i++ ) {
        d2[ i ] = d1[ i ]/4 + d1[ i*2 ]/4 + d1[ i*3 ]/4 + d1[ i*4 ]/4;
    }

    for ( var i = 0; i < size * 4; i++ ) { //needs to be size*4
        d3[ i ] = (d2[ i ] + d1[ i ] + d1[ i*2 ] + d1[ i*3 ] + d1[ i*4 ])/7;
    }

    for ( var i = 0; i < size * 4; i++ ) {
        d3[ i * 3 ]     = d3[ i * 3 ] * 1.2; // R
        d3[ i * 3 + 1 ] = d3[ i * 3 ] * 1.2; // G
        d3[ i * 3 + 2 ] = d3[ i * 3 ] ;// B
    }

    function cloudExpCurve(v){
        var c = 0;
        var cloudSharpness = .9; // Lower values give sharper, denser clouds, and values closer to 1.0 give fuzzier, thinner clouds. 

        for ( var i = 0; i < size * 4; i++){
            c = v - d3[i];
            if( c < 0 ){
                c = 0;
            } 
            d3[ i ] = 255 - (Math.pow(cloudSharpness, c) * 255);
        }
        return d3;
    }

    var texture = new THREE.DataTexture( cloudExpCurve(90), noiseSize, noiseSize, THREE.RGBFormat );
    texture.anisotropy = 1;
    texture.magFilter = THREE.Linear;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping; 
    texture.needsUpdate = true;

    var uniformsSky = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2( 64, 64) }, 
        texture: { type: "t", value: texture } 
    };

    var mat = new THREE.ShaderMaterial( {
        uniforms: uniformsSky,
        vertexShader: document.getElementById( 'skyVS' ).textContent,
        fragmentShader: document.getElementById( 'skyFS' ).textContent
    } );

    var sky = new THREE.Mesh( new THREE.ParametricGeometry( SkyDome, 5, 5 ), mat );

    sky.position.set( 0, -30, -100 );
    sky.scale.set( 2, 2, 2 );
    sky.rotation.x = -Math.PI / 2;
    return sky;
};

SkyDome = function(i, j) {
    i -= 0.5;
    j -= 0.5;
    var r2 = i*i*4 + j*j*4;
    var x, y, z;
    return new THREE.Vector3(i*20000, (1-r2)*5000, j*20000).multiplyScalar(0.05);
}