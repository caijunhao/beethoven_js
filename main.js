console.log("Hello World!")

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100);
var renderer = new THREE.WebGLRenderer();

const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.minDistance = 1;
controls.maxDistance = 20;

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}


new THREE.RGBELoader()
    .setDataType( THREE.UnsignedByteType )
    .setPath( 'textures/equirectangular/')
    .load( 'satara_night_no_lamps_8k.hdr', function ( texture ) {

        const envMap = pmremGenerator.fromEquirectangular( texture ).texture;

        scene.background = envMap;
        scene.environment = envMap;

        texture.dispose();
        pmremGenerator.dispose();

        renderScene();

        // model

        // use of RoughnessMipmapper is optional
        // const roughnessMipmapper = new THREE.RoughnessMipmapper( renderer );

        const loader = new THREE.GLTFLoader().setPath( 'models/gltf/BN_noroom/glTF/' );
        loader.load( 'BN.gltf', function ( gltf ) {

            gltf.scene.traverse( function ( child ) {

                if ( child.isMesh ) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  let Mat = new THREE.MeshPhongMaterial( { color: 0xffffff} );
                  Mat.metalnessMap = child.material.metalnessMap;
                  Mat.normalMap = child.material.normalMap;
                  Mat.roughnessMap = child.material.roughnessMap;
                  Mat.map = child.material.map;
                  child.material = Mat;
                }

            } );

            scene.add( gltf.scene );

            // roughnessMipmapper.dispose();

            renderScene();

        } );

    } );

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// point light
let bulbLight, bulbMat;
bulbMat, bulbLight = init_point_light(1, 1, 1);
bulbLight.castShadow = true;
scene.add( bulbLight );

let hemiLight;
hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02);
scene.add( hemiLight );

let candleLight, candleMat, candleMesh, flameMaterials;
function helper(materials, light){
  flameMaterials = materials;
  candleLight = light;
}
candleMat, candleMesh = get_candle(helper);
candleMesh.castShadow = true;
scene.add(candleMesh);

// floor
let floorMesh, floorMat;
floorMat = new THREE.MeshStandardMaterial( {
  roughness: 1.0,
  color: 0xffffff,
  metalness: 0.4,
  bumpScale: 0.01
} );
let textureLoader = new THREE.TextureLoader();
textureLoader.load( "textures/hardwood2_diffuse.jpg", function ( map ) {
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 4;
  map.repeat.set( 10, 24 );
  map.encoding = THREE.sRGBEncoding;
  floorMat.map = map;
  floorMat.needsUpdate = true;
} );
let floorGeometry = new THREE.PlaneBufferGeometry( 20, 20 );
floorMesh = new THREE.Mesh(floorGeometry, floorMat);
floorMesh.receiveShadow = true;
floorMesh.rotation.x = - Math.PI / 2.0;
scene.add(floorMesh);

renderer.antialias = true;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

//camera
camera.position.x=2;
camera.position.y=2;
camera.position.z=2;
camera.lookAt(scene.position);

$('#first-threejs').append(renderer.domElement);


let step = 0;

function renderScene() 
{
  requestAnimationFrame(renderScene);
  //make updates to position, rotation of objects in the Scene
  step+=0.02;
  flameMaterials[0].uniforms.time.value = step;
  flameMaterials[1].uniforms.time.value = step;
  candleLight.position.x = Math.sin(step * Math.PI) * 0.25;
  candleLight.position.z = Math.cos(step * Math.PI * 0.75) * 0.25;
  candleLight.intensity = 2 + Math.sin(step * Math.PI * 2) * Math.cos(step * Math.PI * 1.5) * 0.25;
  renderer.render(scene, camera); 
}


renderScene();
