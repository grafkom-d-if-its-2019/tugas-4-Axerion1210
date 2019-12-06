(function() {

  glUtils.SL.init({ callback: function() { main(); }});
  var gl, program, canvas;
  var vColor, vPosition, vPosition2, vNormal, vTexCoord, dd;
  function main() {
    canvas = document.getElementById("glcanvas");
    gl = glUtils.checkWebGL(canvas);
    var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex);
    var fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
    program = glUtils.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    draw();
  }

  function draw(){
    // Definisi untuk matriks model
    var mmLoc = gl.getUniformLocation(program, 'modelMatrix');
    var mm = glMatrix.mat4.create();
    glMatrix.mat4.translate(mm, mm, [0.0, 0.0, -2.0]);
    
    // Definisi untuk matrix view dan projection
    var vmLoc = gl.getUniformLocation(program, 'viewMatrix');
    var vm = glMatrix.mat4.create();
    var pmLoc = gl.getUniformLocation(program, 'projectionMatrix');
    var pm = glMatrix.mat4.create();
    var camera = {x: 0.0, y: 0.0, z:0.0};
    glMatrix.mat4.perspective(pm,
      glMatrix.glMatrix.toRadian(90), // fovy dalam radian
      canvas.width/canvas.height,     // aspect ratio
      0.5,  // near
      10.0, // far  
    );
    gl.uniformMatrix4fv(pmLoc, false, pm);
    
    
    //uniform untuk pencahayaan
    var dcLoc = gl.getUniformLocation(program, 'diffuseColor');
    var dc = glMatrix.vec3.fromValues(1.0, 1.0, 1.0);  //rgb
    gl.uniform3fv(dcLoc, dc);
    
    var ddLoc = gl.getUniformLocation(program, 'diffusePosition');
    
    var aLoc = gl.getUniformLocation(program, 'ambientColor');
    var ac = glMatrix.vec3.fromValues(0.17, 0.41, 0.13);
    gl.uniform3fv(aLoc, ac);
    
    // uniform untuk modelMatrix vektor normal
    var nmLoc = gl.getUniformLocation(program, 'normalMatrix');
    
    // Kontrol menggunakan keyboard
    function onKeyDown(event) {
      if (event.keyCode == 189) thetaSpeed -= 0.01;       // key '-'
      else if (event.keyCode == 187) thetaSpeed += 0.01;  // key '='
      else if (event.keyCode == 48) thetaSpeed = 0;       // key '0'
      if (event.keyCode == 88) axis[x] = !axis[x];
      if (event.keyCode == 89) axis[y] = !axis[y];
      if (event.keyCode == 90) axis[z] = !axis[z];
      if (event.keyCode == 38) camera.y -= 0.1;
      else if (event.keyCode == 40) camera.y += 0.1;
      if (event.keyCode == 37) camera.x -= 0.1;
      else if (event.keyCode == 39) camera.x += 0.1;
    }
    document.addEventListener('keydown', onKeyDown);
    
    // Membuat sambungan untuk uniform
    var thetaUniformLocation = gl.getUniformLocation(program, 'theta');
    var theta = 0;
    var thetaSpeed = 0.0;
    var axis = [true, true, true];
    var x = 0;
    var y = 1;
    var z = 2;
    var alphaUniformLocation = gl.getUniformLocation(program, 'alpha');
    var transXUniformLocation = gl.getUniformLocation(program, 'transX');
    var transYUniformLocation = gl.getUniformLocation(program, 'transY');
    var transZUniformLocation = gl.getUniformLocation(program, 'transZ');
    var alpha = 0.0;
    var transX = 0.0;
    var transY = 0.0;
    var transZ = 0.0;
    var dirX = 1.0;
    var dirY = 1.0;
    var dirZ = 1.0;
    var mode = 0.0;
    var modeUniformLocation;
    
    function render() {
      gl.clearColor(0.0, 0.1, 0.4, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      modeUniformLocation = gl.getUniformLocation(program,'mode');
      
      
      theta += thetaSpeed;
      if (axis[z]) glMatrix.mat4.rotateZ(mm, mm, thetaSpeed);
      if (axis[y]) glMatrix.mat4.rotateY(mm, mm, thetaSpeed);
      if (axis[x]) glMatrix.mat4.rotateX(mm, mm, thetaSpeed);
      gl.uniformMatrix4fv(mmLoc, false, mm);
      
      
      alpha += 0.1;
      gl.uniform1f(alphaUniformLocation,alpha);
      
      if(transX >= 0.6) dirX = -1.0;
      else if (transX <= -0.6) dirX = 1.0;
      transX += 0.03 * dirX;
      gl.uniform1f(transXUniformLocation,transX);
      
      if(transY >= 0.475) dirY = -1.0;
      else if (transY <= -0.475) dirY = 1.0;
      transY += 0.025 * dirY;
      gl.uniform1f(transYUniformLocation,transY);
      
      if(transZ >= 0.6) dirZ = -1.0;
      else if (transZ <= -0.6) dirZ = 1.0;
      transZ += 0.02 * dirZ;
      gl.uniform1f(transZUniformLocation,transZ);
      
      var nm = glMatrix.mat3.create();
      glMatrix.mat3.normalFromMat4(nm, mm);
      gl.uniformMatrix3fv(nmLoc, false, nm);

      dd = glMatrix.vec3.fromValues(transX, transY, transZ);  //xyz
      gl.uniform3fv(ddLoc, dd);
      
      glMatrix.mat4.lookAt(vm,
        [camera.x, camera.y, camera.z], // di mana posisi kamera (posisi)
        [0.0, 0.0, -2.0], // ke mana kamera menghadap (vektor)
        [0.0, 1.0, 0.0]  // ke mana arah atas kamera (vektor)
      );
      gl.uniformMatrix4fv(vmLoc, false, vm);
      
      mode = 0.0;
      gl.uniform1f(modeUniformLocation,mode);
      var n = initBuffer(gl);
      gl.drawArrays(gl.TRIANGLES, 0, n);
      gl.disableVertexAttribArray(vNormal);
      gl.disableVertexAttribArray(vTexCoord);
      
      mode = 1.0;
      gl.uniform1f(modeUniformLocation,mode);
      var m = initBuffer2(gl);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, m);
        

      requestAnimationFrame(render);
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    initTexture();
    
    render();
  }
  
  function initTexture(){
    // Uniform untuk tekstur
    var sampler0Loc = gl.getUniformLocation(program,'sampler0');
    gl.uniform1i(sampler0Loc, 0);

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
    
    // Asynchronously load an image
    var image = new Image();
    image.src = "images/Untitled.png";
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
  }

  function initBuffer(){
    // Mendefinisikan verteks-verteks
    var vertices = [];
    var cubePoints = [
      [ -0.85, -0.85,  0.85 ],
      [ -0.85,  0.85,  0.85 ],
      [  0.85,  0.85,  0.85 ],
      [  0.85, -0.85,  0.85 ],
      [ -0.85, -0.85, -0.85 ],
      [ -0.85,  0.85, -0.85 ],
      [  0.85,  0.85, -0.85 ],
      [  0.85, -0.85, -0.85 ]
    ];
    var cubeNormals = [
      [],
      [ 0.0,  0.0, 1.0], // depan
      [ 1.0,  0.0, 0.0], // kanan
      [ 0.0, -1.0, 0.0], // bawah
      [ 0.0,  0.0, -1.0], // belakang
      [-1.0, 0.0, 0.0], // kiri
      [ 0.0,  1.0, 0.0], // atas
      []
    ];
    function quad(a, b, c, d) {
      var indices = [a, b, c, a, c, d];
      for (var i=0; i < indices.length; i++) {
        for (var j=0; j < 3; j++) {
          vertices.push(cubePoints[indices[i]][j]);
        }
        // for (var j=0; j < 3; j++) {
        //   vertices.push(cubeColors[a][j]);
        // }
        for (var j=0; j < 3; j++) {
          vertices.push(-1.0 * cubeNormals[a][j]);
        }
        switch (indices[i]){
          case a:
            vertices.push((a-2.0)*0.125);
            vertices.push(0.0);
            break;
          case b:
            vertices.push((a-2.0)*0.125);
            vertices.push(1.0);
            break;
          case c:
            vertices.push((a-1.0)*0.125);
            vertices.push(1.0);
            break;
          case d:
            vertices.push((a-1.0)*0.125);
            vertices.push(0.0);
            break;
        }
      }
    }
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
    quad(6, 5, 1, 2);
    
    // Membuat vertex buffer object (CPU Memory <==> GPU Memory)
    var vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Membuat sambungan untuk attribute
    vPosition = gl.getAttribLocation(program, 'vPosition');
    vNormal = gl.getAttribLocation(program, 'vNormal');
    vTexCoord = gl.getAttribLocation(program,'vTexCoord');
    gl.vertexAttribPointer(
      vPosition,    // variabel yang memegang posisi attribute di shader
      3,            // jumlah elemen per atribut
      gl.FLOAT,     // tipe data atribut
      gl.FALSE, 
      8 * Float32Array.BYTES_PER_ELEMENT, // ukuran byte tiap verteks (overall) 
      0                                   // offset dari posisi elemen di array
    );
    gl.vertexAttribPointer(
      vNormal,
      3,
      gl.FLOAT,
      gl.FALSE,
      8 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.vertexAttribPointer(
      vTexCoord,
      2,
      gl.FLOAT,
      gl.FALSE,
      8 * Float32Array.BYTES_PER_ELEMENT,
      6 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vNormal);
    gl.enableVertexAttribArray(vTexCoord);

    n = 30;
    
    return n;
  }

  function initBuffer2(){
    var vertexBuffer3 = gl.createBuffer(),
        vertices3 = [];
        
    for (var i = 90; i<=270; i+=1){
      var j = i * Math.PI / 180;

      var vert1 = [
        Math.sin(j) / 4,
        Math.cos(j) / 4 - 0.125,
        0.0,

        0.2, 0.2, 0.6
      ];

      var vert3 = [
        Math.sin(j) / 6,
        Math.cos(j) / 6 - 0.125,
        0.0,

        0.2, 0.2, 0.6
      ]

      vertices3 = vertices3.concat(vert1);
      vertices3 = vertices3.concat(vert3);
    }

    for (var i = 270; i<=450; i+=1){
      var j = i * Math.PI / 180;

      var vert2 = [
        Math.sin(j) / 4,
        Math.cos(j) / 4 + 0.125,
        0.0,

        0.2, 0.2, 0.6
      ];

      var vert4 = [
        Math.sin(j) / 6,
        Math.cos(j) / 6 + 0.125,
        0.0,

        0.2, 0.2, 0.6
      ]
      vertices3 = vertices3.concat(vert2);
      vertices3 = vertices3.concat(vert4);
    }

    var vert5 = [
      0.25,0.125,0.0,   0.2, 0.2, 0.6,
      (1/6),0.125,0.0,   0.2, 0.2, 0.6,
      0.25,-0.125,0.0,  0.2, 0.2, 0.6,
      (1/6),-0.125,0.0,  0.2, 0.2, 0.6,
    ];

    vertices3 = vertices3.concat(vert5);

    var m = vertices3.length / 6;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer3);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices3), gl.STATIC_DRAW);

    vPosition2 = gl.getAttribLocation(program, 'vPosition');
    vColor = gl.getAttribLocation(program, 'vColor');

    gl.vertexAttribPointer(
      vPosition2,
      3,
      gl.FLOAT,
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.vertexAttribPointer(
      vColor,
      3,
      gl.FLOAT,
      gl.FALSE, 
      6 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(vPosition2);
    gl.enableVertexAttribArray(vColor);
    
    return m;
  }
})();