var f = -1.2; 

var startTime = (new Date()).getTime() / 1000, time = startTime;
var canvases = [];

function initCanvas(id) {
   var canvas = document.getElementById(id);
   canvas.setCursor = function(x, y, z) {
      var r = this.getBoundingClientRect();
      this.cursor.set(x - r.left, y - r.top, z);
   }
   canvas.cursor = new Vector3(0, 0, 0);
   canvas.onmousedown = function(e) { this.setCursor(e.clientX, e.clientY, 1); }
   canvas.onmousemove = function(e) { this.setCursor(e.clientX, e.clientY   ); }
   canvas.onmouseup   = function(e) { this.setCursor(e.clientX, e.clientY, 0); }
   canvases.push(canvas);
   g = canvas.getContext('2d');
   return canvas;
}
function tick() {
   time = (new Date()).getTime() / 1000 - startTime;
   for (var i = 0 ; i < canvases.length ; i++)
      if (canvases[i].update !== undefined) {
    var canvas = canvases[i];
         g.clearRect(0, 0, canvas.width, canvas.height);
         canvas.update(g);
      }
   setTimeout(tick, 1000 / 60);
}
tick();

function Vector3(x, y, z) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.set(x, y, z);
}
Vector3.prototype = {
   set : function(x, y, z) {
      if (x !== undefined) this.x = x;
      if (y !== undefined) this.y = y;
      if (z !== undefined) this.z = z;
   },
   xMatrix : function(m){ 
      var product = [ ];
      var productVec3 = new Vector3 (0,0,0);
      for (var r = 0; r < m.length - 1; r++){ 
         product.push(m[r][0] * ((f * this.x) / this.z)  + m[r][1] * ((f * this.y) / this.z) + m[r][2] * ((f * this.z) / this.z) + m[r][3]);
      }
      productVec3.x = product[0];
      productVec3.y = product[1];
      productVec3.z = product[2];
      return productVec3;
   }
}

function Matrix() {
   this.data = [];
   this.identity();
}
Matrix.prototype = {
   identity : function(){ //use for initialization
      this.data = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]; 
   },
   translate : function(x, y, z){  
      this.data = x2Matrix(this.data,[[1,0,0,x],[0,1,0,y],[0,0,1,z],[0,0,0,1]]);
   },
   rotateX : function(theta){ // look at gimbal lock
      this.data = x2Matrix(this.data,[[1,0,0,0],[0,Math.cos(theta),-Math.sin(theta),0],[0,Math.sin(theta),Math.cos(theta),0],[0,0,0,1]]);
   },
   rotateY : function(theta){
      this.data = x2Matrix(this.data,[[Math.cos(theta),0,-Math.sin(theta),0],[0,1,0,0],[Math.sin(theta),0,Math.cos(theta),0],[0,0,0,1]]);
   },
   rotateZ : function(theta){
      this.data = x2Matrix(this.data,[[Math.cos(theta),-Math.sin(theta),0,0],[Math.sin(theta),Math.cos(theta),0,0],[0,0,1,0],[0,0,0,1]]);
   },
   scale : function(x, y, z){
      this.data = x2Matrix(this.data,[[x,0,0,0],[0,y,0,0],[0,0,z,0],[0,0,0,1]]);
   },
   transform : function(src, dst){ //transform vector
      dst = src.xMatrix(this.data);
      return dst;
   },
   transformM : function(srcm, dst){ //transform matrix
      dst = srcm.xMatrix(this.data);
      return dst;
   },
   xMatrix : function(m){ 
      // console.log(this.data);
      // console.log(m.data);
      var productM = [[],[],[],[]];
      for (var r = 0; r < this.data.length; r++){ 
         productM[r] = [0,0,0,0];
         for (var c = 0; c < m[0].length; c++){
            var sum = 0;
            for (var c2 = 0; c2 < this.data[0].length; c2++){
               sum += this.data[r][c2] * m[c2][c];
            }
            productM[r][c] = sum;
         }
      }
      this.data = productM; 
      return productM;
   }, 
   assignM : function(dstM){
      dstM = [[],[],[],[]];
      for (var r = 0; r < this.data.length; r++){ 
         dstM[r] = [0,0,0,0];
         for (var c = 0; c < dstM[0].length; c++){
            dstM[r][c] = this.data[r][c];
         }
      }
      return dstM;
   }
}

function x2Matrix(m1, m2) { 
   var productM = [[],[],[],[]];
   for (var r = 0; r < m1.length; r++){ 
      productM[r] = [0,0,0,0];
      for (var c = 0; c < m1[0].length; c++){
         var sum = 0;
         for (var c2 = 0; c2 < m1[0].length; c2++){
            sum += m1[r][c2] * m2[c2][c];
         }
         productM[r][c] = sum;
      }
   }
   return productM;
}

function Cube(x, y, z, e) {
   this.x = 0;
   this.y = 0;
   this.z = 0;
   this.e = .5;
   this.set(x, y, z, e);
}
Cube.prototype = {
   set : function(x, y, z, e) {
      if (x !== undefined) this.x = x;
      if (y !== undefined) this.y = y;
      if (z !== undefined) this.z = z;
      if (e !== undefined) this.e = e;

      var v1 = new Vector3(x + .5 * e, y - .5 * e, z + .5 * e);
      var v2 = new Vector3(x + .5 * e, y - .5 * e, z - .5 * e);
      var v3 = new Vector3(x - .5 * e, y - .5 * e, z - .5 * e);
      var v4 = new Vector3(x - .5 * e, y - .5 * e, z + .5 * e);
      var v5 = new Vector3(x - .5 * e, y + .5 * e, z + .5 * e);
      var v6 = new Vector3(x + .5 * e, y + .5 * e, z + .5 * e);
      var v7 = new Vector3(x + .5 * e, y + .5 * e, z - .5 * e);
      var v8 = new Vector3(x - .5 * e, y + .5 * e, z - .5 * e);

      this.a1 = [v1, v2, v3, v4, v5, v6, v7, v8];
      this.a2 = [[v1, v2], [v2, v3], [v3, v4], [v4, v1], [v1, v6], [v4, v5], [v3, v8], [v2, v7], [v6, v7], [v7, v8], [v8, v5], [v5, v6]]; //edges are vertex indecis. this is a two element array
   },
   draw : function(g, m) { 
      g.beginPath();
      g.lineJoin = "round";

      for(i=0; i < this.a2.length; i++){
         var vs = new Vector3(0,0,0);
         var vf = new Vector3(0,0,0);

         var e = this.a2[i]; 
         vs = this.a2[i][0];
         vf = this.a2[i][1];
         g.width=500;
         g.height=500;

         var vs_t = new Vector3(0,0,0);
         var vf_t = new Vector3(0,0,0);

         vs_t = m.transform(vs, vs_t); 
         vf_t = m.transform(vf, vf_t);

         pxs = (g.width / 2) + vs_t.x * (g.width / 2);
         pys = (g.height / 2) - vs_t.y * (g.height / 2);
         pzs = (g.width / 2) + vs_t.z * (g.width / 2);
         pxf = (g.width / 2) + vf_t.x * (g.width / 2);
         pyf = (g.height / 2) - vf_t.y * (g.height / 2); 
         pzf = (g.width / 2) + vs_t.z * (g.width / 2);

         //console.log(pxs,pys,pzs);

         g.moveTo(pxs, pys, pzs);
         g.lineTo(pxf, pyf, pzf);

         g.stroke();
      }
   }
}

function Surface(r) { 
   this.uArray = [];
   this.vArray = [];
   this.array = [];
   this.r = r;
   this.set();
}
Surface.prototype = {
   set : function() {
      for (var i = 0; i < this.r; i++) { 
         this.uArray.push(1. / this.r * (i + 1)); 
         this.vArray.push(1. / this.r * (i + 1));
      }
   }, 
   cylinder : function() {  
      for (var i = 0; i < this.vArray.length; i++){ //row
         rowArray = [];
         for (var j = 0; j < this.uArray.length; j++){ //column
            var t = 2*Math.PI*this.uArray[j]; //theta
            var c = new Vector3(0,0,0); //coordinate
            c.set(Math.sin(t), 2*this.vArray[i]-1, Math.cos(t) + 6.5);
            rowArray.push(c);
         }
         this.array.push(rowArray);
      }
   },
   sphere : function() {
      for (var i = 0; i < this.vArray.length; i++){ //row
         rowArray = [];
         for (var j = 0; j < this.uArray.length; j++){ //column
            var t = 2*Math.PI*this.uArray[j]; //theta
            var p = Math.PI*this.vArray[i] - Math.PI / 2;
            var c = new Vector3(0,0,0); //coordinate
            c.set(Math.cos(p)*Math.sin(t), Math.sin(p), Math.cos(p)*Math.cos(t) + 6.5);
            rowArray.push(c);
         }
         this.array.push(rowArray);
      }
   },
   superQuadric : function(c) {
      for (var i = 0; i < this.vArray.length; i++){ //row
         rowArray = [];
         for (var j = 0; j < this.uArray.length; j++){ //column
            var t = 2*Math.PI*this.uArray[j]; //theta
            var p = Math.PI*this.vArray[i] - Math.PI / 2;
            var c = new Vector3(0,0,0); //coordinate
            c.set(Math.cos(p)*Math.sin(t), Math.sin(p), Math.cos(p)*Math.cos(t) + 3.5);
            var s = 0;
            s = 1 / Math.pow(Math.pow(c.x,4)+Math.pow(c.y,4)+Math.pow(c.z,4), 1/4);
            c.set(s*c.x,s*c.y,s*c.z);
            rowArray.push(c);
         }
         this.array.push(rowArray);
      }
   },
   draw : function(g, m) {
      g.width=500;
      g.height=500;
      g.beginPath();

      for (i = 0; i < this.array.length-1; i++) {
         for (j = 0; j < this.array[i].length-1; j++) {
            var vs = new Vector3(0,0,0);
            var vf = new Vector3(0,0,0);
            var vf2 = new Vector3(0,0,0);
            var vs_t = new Vector3(0,0,0);
            var vf_t = new Vector3(0,0,0);
            var vf2_t = new Vector3(0,0,0);

            if(i == this.array.length-2) {
               if(j == this.array.length-2){
                  vs = this.array[i][j];
                  vf = this.array[i][0];
               } else {
                  vs = this.array[i][j];
                  vf = this.array[i][j+1];
               }
               
               vs_t = m.transform(vs, vs_t); 
               vf_t = m.transform(vf, vf_t);

               pxs = (g.width / 2) + vs_t.x * (g.width / 2);
               pys = (g.height / 2) - vs_t.y * (g.height / 2);
               pzs = (g.width / 2) + vs_t.z * (g.width / 2);
               pxf = (g.width / 2) + vf_t.x * (g.width / 2);
               pyf = (g.height / 2) - vf_t.y * (g.height / 2); 
               pzf = (g.width / 2) + vf_t.z * (g.width / 2); 

               g.moveTo(pxs, pys, pzs);
               g.lineTo(pxf, pyf, pzf);
               g.stroke();

            } else {
               if(j == this.array.length-2){
                  vs = this.array[i][j];
                  vf = this.array[i][0];
                  vf2 = this.array[i+1][j];
               } else {
                  vs = this.array[i][j];
                  vf = this.array[i][j+1];
                  vf2 = this.array[i+1][j];
               }

               vs_t = m.transform(vs, vs_t); 
               vf_t = m.transform(vf, vf_t);
               vf2_t = m.transform(vf2, vf2_t);

               pxs = (g.width / 2) + vs_t.x * (g.width / 2);
               pys = (g.height / 2) - vs_t.y * (g.height / 2);
               pzs = (g.width / 2) + vs_t.z * (g.width / 2);
               pxf = (g.width / 2) + vf_t.x * (g.width / 2);
               pyf = (g.height / 2) - vf_t.y * (g.height / 2); 
               pzf = (g.width / 2) + vf_t.z * (g.width / 2);
               pxf2 = (g.width / 2) + vf2_t.x * (g.width / 2);
               pyf2 = (g.height / 2) - vf2_t.y * (g.height / 2); 
               pzf2 = (g.width / 2) + vf2_t.z * (g.width / 2);

               g.moveTo(pxs, pys, pzs);
               g.lineTo(pxf, pyf, pzf);
               g.moveTo(pxs, pys, pzs);
               g.lineTo(pxf2, pyf2, pzf2);
               g.stroke();
            }
         }
      }
   }
}
function simpleInvert(src, dst) {
      // COMPUTE ADJOINT COFACTOR MATRIX FOR THE ROTATION+SCALE 3x3
      for (var i = 0 ; i < 3 ; i++)
      for (var j = 0 ; j < 3 ; j++) {
         var i0 = (i+1) % 3;
         var i1 = (i+2) % 3;
         var j0 = (j+1) % 3;
         var j1 = (j+2) % 3;
         dst[j+4*i] = src[i0+4*j0] * src[i1+4*j1] - src[i0+4*j1] * src[i1+4*j0];
      }

      // RENORMALIZE BY DETERMINANT TO GET ROTATION+SCALE 3x3 INVERSE
      var determinant = src[0+4*0] * dst[0+4*0]
                      + src[1+4*0] * dst[0+4*1]
                      + src[2+4*0] * dst[0+4*2];
      for (var i = 0 ; i < 3 ; i++)
      for (var j = 0 ; j < 3 ; j++)
         dst[i+4*j] /= determinant;

      // COMPUTE INVERSE TRANSLATION
      for (var i = 0 ; i < 3 ; i++)
         dst[i+4*3] = - dst[i+4*0] * src[0+4*3]
                      - dst[i+4*1] * src[1+4*3]
                      - dst[i+4*2] * src[2+4*3];
      return dst;
}
