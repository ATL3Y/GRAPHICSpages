    var BoidObj = function(){
        var scope = this;
        THREE.Geometry.call(this);
        vec3(3,0,0);
        vec3(-1,-.5,1);
        vec3(-3,0,0);
        vec3(-2,-1,-1);
        vec3(0,1,-10);
        vec3(0,1,10);
        vec3(1,0,0);
        vec3(-1.5,0,0);
        f3(0,2,1);
        f3(4,7,6);
        f3(5,6,7);

        this.computeCentroids();
        // this.computeBoundingBox();

        // var centroid = new THREE.Vector3();
        // centroid.addVectors( this.boundingBox.min, this.boundingBox.max );
        // centroid.multiplyScalar( - 0.5 );

        // var material = new THREE.MeshBasicMaterial();

        // var mesh = new THREE.Mesh(this.geometry, material);

        // centroid.applyMatrix4( mesh.matrixWorld ); 
        this.computeFaceNormals();

        function vec3(x,y,z){
            scope.vertices.push(new THREE.Vector3(x,y,z));
        }

        function f3(a,b,c){
            scope.faces.push(new THREE.Face3(a,b,c));
        }
    }

    BoidObj.prototype = Object.create(THREE.Geometry.prototype);
