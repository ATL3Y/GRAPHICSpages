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
  VxMatrix : function(m){ 
    var productM = [];
    for (var r = 0; r < 3; r++) {
      productM.push(m[4*r] * this.x + m[4*r+1] * this.y + m[4*r+2] * this.z + m[4*r+3]); //need last term? 
    }
    this.x = productM[0];
    this.y = productM[1];
    this.z = productM[2];
   }
}

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

function Matrix() {
  this.identity();
}
Matrix.prototype = {
  identity : function() {
    this.data = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  },
  translate : function (x, y, z) { //try assign each element
    var tm = [1,0,0,x,0,1,0,y,0,0,1,z,0,0,0,1];
    this.MxMatrix(tm);
  },
  rotateX : function(theta) {
    var rxm = [1,0,0,0,0,Math.cos(theta),-Math.sin(theta),0,0,Math.sin(theta),Math.cos(theta),0,0,0,0,1];
      this.MxMatrix(rxm);
  },
  rotateY : function(theta) {
    var rym = [Math.cos(theta),0,-Math.sin(theta),0,0,1,0,0,Math.sin(theta),0,Math.cos(theta),0,0,0,0,1];
    this.MxMatrix(rym);
  },
  rotateZ : function(theta) {
    var rzm = [Math.cos(theta),-Math.sin(theta),0,0,Math.sin(theta),Math.cos(theta),0,0,0,0,1,0,0,0,0,1];
    this.MxMatrix(rzm);
  },
  scale : function(x, y, z){
    var sm = [x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];
    this.MxMatrix(sm);
  },
  transformVec : function(src, dst) {
      var productM = [];
      for (var r = 0; r < 3; r++) {
         productM.push(this.data[4*r] * src.x + this.data[4*r+1] * src.y + this.data[4*r+2] * src.z + this.data[4*r+3]);  
      }
      dst.x = productM[0];
      dst.y = productM[1];
      dst.z = productM[2];
    return dst;
  },
   MxMatrix : function(matrix) { 
      product = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      for (var r = 0; r < 4; r++){ 
         for (var c = 0; c < 4; c++){
            var sum = 0;
            for (var c2 = 0; c2 < 4; c2++){
               sum += this.data[4 * r + c2] * matrix[4 * c2 + c]; 
            }
            product[4 * r + c] = sum;
         }
      }
      this.data = product;
   },
   AxMatrix : function(a){ 
      var productA = [];
      for (var r = 0; r < 4; r++) {
         productA.push(this.data[4*r] * a[0] + this.data[4*r+1] * a[1] + this.data[4*r+2] * a[2] + this.data[4*r+3] * a[3]); 
      }
      return productA;
   }
}

function Spline(p0, p1, r0, r1, mat) {
   this.set(p0, p1, r0, r1, mat); 
   this.setABCD();
}
Spline.prototype = {
   set : function(p0, p1, r0, r1, mat) {
      if (p0 !== undefined) this.p0 = new Vector3(p0.x,p0.y,p0.z);
      if (p1 !== undefined) this.p1 = new Vector3(p1.x,p1.y,p1.z);
      if (r0 !== undefined) this.r0 = new Vector3(r0.x,r0.y,r0.z);
      if (r1 !== undefined) this.r1 = new Vector3(r1.x,r1.y,r1.z);
      if (mat !== undefined) this.mat = mat;
   },
   setABCD : function() {
      var xArray = [this.p0.x, this.p1.x, this.r0.x, this.r1.x]; 
      var yArray = [this.p0.y, this.p1.y, this.r0.y, this.r1.y];
      var zArray = [this.p0.z, this.p1.z, this.r0.z, this.r1.z];
      this.xABCD = [0,0,0,0];
      this.yABCD = [0,0,0,0];
      this.zABCD = [0,0,0,0];
      this.xABCD = this.mat.AxMatrix(xArray);
      this.yABCD = this.mat.AxMatrix(yArray);
      this.zABCD = this.mat.AxMatrix(zArray); 
   },
   xInT : function(t) {
      var x = 0;
      x = this.xABCD[0]*Math.pow(t,3) + this.xABCD[1]*Math.pow(t,2) + this.xABCD[2]*t + this.xABCD[3];
      return x;
   },
   yInT : function(t) {
      var y = 0;
      y = this.yABCD[0]*Math.pow(t,3) + this.yABCD[1]*Math.pow(t,2) + this.yABCD[2]*t + this.yABCD[3];
      return y;
   },
   zInT : function(t) {
      var z = 0;
      z = this.zABCD[0]*Math.pow(t,3) + this.zABCD[1]*Math.pow(t,2) + this.zABCD[2]*t + this.zABCD[3];
      return z;
   },
   draw : function(g, m) {
      g.width=500;
      g.height=500;
      g.beginPath();

      for (var t = 0.00; t <= 1.0 ; t += 0.01) {

         var vs = new Vector3(0,0,0);
         var vf = new Vector3(0,0,0);
         var vs_t = new Vector3(0,0,0);
         var vf_t = new Vector3(0,0,0);

         vs.set(this.xInT(t),this.yInT(t),0); 
         vf.set(this.xInT(t+0.01),this.yInT(t+0.01),0);

         vs_t = m.transformVec(vs, vs_t); 
         vf_t = m.transformVec(vf, vf_t);

         pxs = (g.width / 2) + vs_t.x * (g.width / 2);
         pys = (g.height / 2) - vs_t.y * (g.height / 2);
         pzs = (g.width / 2) + vs_t.z * (g.width / 2); 
         pxf = (g.width / 2) + vf_t.x * (g.width / 2);
         pyf = (g.height / 2) - vf_t.y * (g.height / 2); 
         pzf = (g.width / 2) + vf_t.z * (g.width / 2); 

         g.moveTo(pxs, pys, pzs); 
         g.lineTo(pxf, pyf, pzf); 
         g.stroke();
      }
   }
      
   //    var vs = new Vector3(0,0,0);
   //    var vs_t = new Vector3(0,0,0);
   //    vs.set(this.xInT(0),this.yInT(0),0); 
   //    //console.log(m[0]);
   //    vs_t = m.transformVec(vs, vs_t); 

   //    var px = (g.width/2) + vs_t.x * (g.width/2);
   //    var py = (g.height/2) - vs_t.y * (g.height/2);
   //    var pz = (g.width/2) + vs_t.z * (g.width/2); 

   //    g.moveTo(px, py, pz);

   //    for (var t = 0.00; t <= .99 ; t += 0.01) {
   //       vs.set(this.xInT(t),this.yInT(t),0); 
   //       //console.log(vs.x);
   //       vs_t = m.transformVec(vs, vs_t); 
   //       console.log(vs_t.y);
   //       px = ((g.width/2) + vs_t.x * (g.width/2)) / 20 + 200;
   //       py = (g.height/2) - vs_t.y * (g.height/2);
   //       pz = (g.width/2) + vs_t.z * (g.width/2); 
   //       console.log(px, py, pz);
   //       g.lineTo(px, py, pz);
   //    }
   //    g.stroke();
   // }
}

function Noise() {
   var abs = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = Math.abs(x[i]);
      return dst;
   };
   var add = function(x, y, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] + y[i];
      return dst;
   };
   var dot = function(x, y) {
      var z = 0;
      for (var i = 0 ; i < x.length ; i++)
         z += x[i] * y[i];
      return z;
   };
   var fade = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i]*x[i]*x[i]*(x[i]*(x[i]*6.0-15.0)+10.0);
      return dst;
   };
   var floor = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = Math.floor(x[i]);
      return dst;
   };
   var fract = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] - Math.floor(x[i]);
      return dst;
   };
   var gt0 = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] > 0 ? 1 : 0;
      return dst;
   };
   var lt0 = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] < 0 ? 1 : 0;
      return dst;
   };
   var mix = function(x, y, t, dst) {
      if (! Array.isArray(x))
         return x + (y - x) * t;
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] + (y[i] - x[i]) * t;
      return dst;
   };
   var mod289 = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] - Math.floor(x[i] * (1.0 / 289.0)) * 289.0;
      return dst;
   };
   var multiply = function(x, y, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] * y[i];
      return dst;
   };
   var multiplyScalar = function(x, s) {
      for (var i = 0 ; i < x.length ; i++)
         x[i] *= s;
      return x;
   };
   var permute = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         tmp0[i] = (x[i] * 34.0 + 1.0) * x[i];
      mod289(tmp0, dst);
      return dst;
   };
   var scale = function(x, s, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] * s;
      return dst;
   };
   var set3 = function(a, b, c, dst) {
      dst[0] = a;
      dst[1] = b;
      dst[2] = c;
      return dst;
   }
   var set4 = function(a, b, c, d, dst) {
      dst[0] = a;
      dst[1] = b;
      dst[2] = c;
      dst[3] = d;
      return dst;
   }
   var subtract = function(x, y, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = x[i] - y[i];
      return dst;
   };
   var taylorInvSqrt = function(x, dst) {
      for (var i = 0 ; i < x.length ; i++)
         dst[i] = 1.79284291400159 - 0.85373472095314 * x[i];
      return dst;
   };

   var HALF4 = [.5,.5,.5,.5];
   var ONE3  = [1,1,1];
   var f     = [0,0,0];
   var f0    = [0,0,0];
   var f1    = [0,0,0];
   var g0    = [0,0,0];
   var g1    = [0,0,0];
   var g2    = [0,0,0];
   var g3    = [0,0,0];
   var g4    = [0,0,0];
   var g5    = [0,0,0];
   var g6    = [0,0,0];
   var g7    = [0,0,0];
   var gx0   = [0,0,0,0];
   var gy0   = [0,0,0,0];
   var gx1   = [0,0,0,0];
   var gy1   = [0,0,0,0];
   var gz0   = [0,0,0,0];
   var gz1   = [0,0,0,0];
   var i0    = [0,0,0];
   var i1    = [0,0,0];
   var ix    = [0,0,0,0];
   var ixy   = [0,0,0,0];
   var ixy0  = [0,0,0,0];
   var ixy1  = [0,0,0,0];
   var iy    = [0,0,0,0];
   var iz0   = [0,0,0,0];
   var iz1   = [0,0,0,0];
   var norm0 = [0,0,0,0];
   var norm1 = [0,0,0,0];
   var nz    = [0,0,0,0];
   var nz0   = [0,0,0,0];
   var nz1   = [0,0,0,0];
   var tmp0  = [0,0,0,0];
   var tmp1  = [0,0,0,0];
   var tmp2  = [0,0,0,0];
   var sz0   = [0,0,0,0];
   var sz1   = [0,0,0,0];
   var t3    = [0,0,0];

   this.noise = function(P) {
     mod289(floor(P, t3), i0);
     mod289(add(i0, ONE3, t3), i1);
     fract(P, f0);
     subtract(f0, ONE3, f1);
     fade(f0, f);

     set4(i0[0], i1[0], i0[0], i1[0], ix );
     set4(i0[1], i0[1], i1[1], i1[1], iy );
     set4(i0[2], i0[2], i0[2], i0[2], iz0);
     set4(i1[2], i1[2], i1[2], i1[2], iz1);

     permute(add(permute(ix, tmp1), iy, tmp2), ixy);
     permute(add(ixy, iz0, tmp1), ixy0);
     permute(add(ixy, iz1, tmp1), ixy1);

     scale(ixy0, 1 / 7, gx0);
     scale(ixy1, 1 / 7, gx1);
     subtract(fract(scale(floor(gx0, tmp1), 1 / 7, tmp2), tmp0), HALF4, gy0);
     subtract(fract(scale(floor(gx1, tmp1), 1 / 7, tmp2), tmp0), HALF4, gy1);
     fract(gx0, gx0);
     fract(gx1, gx1);
     subtract(subtract(HALF4, abs(gx0, tmp1), tmp2), abs(gy0, tmp0), gz0);
     subtract(subtract(HALF4, abs(gx1, tmp1), tmp2), abs(gy1, tmp0), gz1);
     gt0(gz0, sz0);
     gt0(gz1, sz1);

     subtract(gx0, multiply(sz0, subtract(lt0(gx0, tmp1), HALF4, tmp2), tmp0), gx0);
     subtract(gy0, multiply(sz0, subtract(lt0(gy0, tmp1), HALF4, tmp2), tmp0), gy0);
     subtract(gx1, multiply(sz1, subtract(lt0(gx1, tmp1), HALF4, tmp2), tmp0), gx1);
     subtract(gy1, multiply(sz1, subtract(lt0(gy1, tmp1), HALF4, tmp2), tmp0), gy1);

     set3(gx0[0],gy0[0],gz0[0], g0);
     set3(gx0[1],gy0[1],gz0[1], g1);
     set3(gx0[2],gy0[2],gz0[2], g2);
     set3(gx0[3],gy0[3],gz0[3], g3);
     set3(gx1[0],gy1[0],gz1[0], g4);
     set3(gx1[1],gy1[1],gz1[1], g5);
     set3(gx1[2],gy1[2],gz1[2], g6);
     set3(gx1[3],gy1[3],gz1[3], g7);

     taylorInvSqrt(set4(dot(g0,g0), dot(g1,g1), dot(g2,g2), dot(g3,g3), tmp0), norm0);
     taylorInvSqrt(set4(dot(g4,g4), dot(g5,g5), dot(g6,g6), dot(g7,g7), tmp0), norm1);

     multiplyScalar(g0, norm0[0]);
     multiplyScalar(g1, norm0[1]);
     multiplyScalar(g2, norm0[2]);
     multiplyScalar(g3, norm0[3]);

     multiplyScalar(g4, norm1[0]);
     multiplyScalar(g5, norm1[1]);
     multiplyScalar(g6, norm1[2]);
     multiplyScalar(g7, norm1[3]);

     mix(set4(g0[0] * f0[0] + g0[1] * f0[1] + g0[2] * f0[2],
              g1[0] * f1[0] + g1[1] * f0[1] + g1[2] * f0[2],
              g2[0] * f0[0] + g2[1] * f1[1] + g2[2] * f0[2],
              g3[0] * f1[0] + g3[1] * f1[1] + g3[2] * f0[2], tmp1),

         set4(g4[0] * f0[0] + g4[1] * f0[1] + g4[2] * f1[2],
              g5[0] * f1[0] + g5[1] * f0[1] + g5[2] * f1[2],
              g6[0] * f0[0] + g6[1] * f1[1] + g6[2] * f1[2],
              g7[0] * f1[0] + g7[1] * f1[1] + g7[2] * f1[2], tmp2), f[2], nz);

     return 2.2 * mix(mix(nz[0],nz[2],f[1]), mix(nz[1],nz[3],f[1]), f[0]);
   }
}

