import {
  CUBE_LETTER_COLOR,
  CUBIE_DATA,
  CUBE_EDGE_LENGTH,
  CUBE_DATA,
  guessList,
} from "./data.js";



var vertexShader = `
    varying vec3 vPos;
    void main()	{
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `;

var fragmentShader = `
    varying vec3 vPos;
    uniform vec3 size;
    uniform float thickness;
    uniform float smoothness;
    uniform vec3 color;

    void main() {

      float a = smoothstep(thickness, thickness + smoothness, length(abs(vPos.xy) - size.xy));
      a *= smoothstep(thickness, thickness + smoothness, length(abs(vPos.yz) - size.yz));
      a *= smoothstep(thickness, thickness + smoothness, length(abs(vPos.xz) - size.xz));

      vec3 c = mix(vec3(0), color, a);

      gl_FragColor = vec4(c, 1.0);
    }
  `;


export function Cubie(cubieID, cubieData) {

  let geo_cube = new THREE.BoxBufferGeometry(CUBE_EDGE_LENGTH, CUBE_EDGE_LENGTH, CUBE_EDGE_LENGTH);

  let materials = []
  for (let i=0; i < cubieData.colors.length; i++) {
    let material = new THREE.ShaderMaterial({
      uniforms: {
        size: {
          value: new THREE.Vector3(geo_cube.parameters.width, geo_cube.parameters.height, geo_cube.parameters.depth).multiplyScalar(0.5)
        },
        thickness: {
          value: 0.01
        },
        smoothness: {
          value: 0.2
        },
        color: {type: 'vec3', value: new THREE.Color(cubieData.colors[i])},
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
    materials.push(material);
  }
  let cube = new THREE.Mesh(geo_cube, materials);
  cube.name = cubieID;
  cube.position.copy(cubieData.position);
  return cube;
}

export function getLettersGroup(letter_font, selectedCubieType) {
  let letters = new THREE.Group();
  for (const [cubieID, cubieData] of Object.entries(CUBIE_DATA)) {
    for (const [cubeFace, name] of Object.entries(cubieData.names)) {
      if (name) {
        if (cubieData.type === selectedCubieType) {
          letters.add(Letter(letter_font, name, cubieData.position, cubeFace, cubieData.type));
        }
      }
    }
  }
  return letters;
}

function Letter(letter_font, name, cubePosition, cubeFace, cubieType) {
  let geo_text = new THREE.TextGeometry(name, {
    font: letter_font,
    size: CUBE_EDGE_LENGTH * 0.5,
    height: 0.2,
  });
  geo_text.center();
  let letter = new THREE.Mesh(geo_text, new THREE.MeshBasicMaterial({color: CUBE_LETTER_COLOR}));
  letter.name = `${cubieType}${name}`;
  letter.position.copy(cubePosition);
  letter.translateOnAxis(CUBE_DATA[cubeFace]['normal'], CUBE_EDGE_LENGTH * 0.5);
  letter.setRotationFromEuler(CUBE_DATA[cubeFace]['letter_rotation']);
  return letter;
}

export function getRandomLetterGroup(letter_font) {
  let letters = new THREE.Group();
  let randomLetter = guessList[Math.floor(Math.random() * guessList.length)];
  console.log(`CubeID: ${randomLetter.cubieID} Face: ${randomLetter.cubeFace} -- Answer: ${randomLetter.name}`)
  letters.add(Letter(letter_font, "?", randomLetter.cubePosition, randomLetter.cubeFace, "random"));
  return [letters, randomLetter.name, randomLetter.cubeFace];
}
