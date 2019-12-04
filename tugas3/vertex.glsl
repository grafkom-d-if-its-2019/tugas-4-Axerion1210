precision mediump float;

attribute vec3 vPosition;
attribute vec3 vColor;
varying vec3 fColor;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float theta, scaleX, mode, alpha;
uniform float transX, transY, transZ;

void main() {
  vec3 translate = vec3(transX,transY,transZ);
  mat4 scale = mat4 (
    scaleX, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  mat4 rotate = mat4 (
    cos(alpha), 0.0, -sin(alpha), 0.0,
    0.0, 1.0, 0.0, 0.0,
    sin(alpha), 0.0, cos(alpha), 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  mat4 trans = mat4 (
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    translate, 1.0
  );

  if (mode == 0.0)
  {
    fColor = vColor;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPosition, 1.0);
  }
  else if(mode == 1.0)
  {
    fColor = vColor;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * trans * rotate * vec4(vPosition, 1.0);
  }
}
