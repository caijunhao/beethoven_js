console.log("Beethoven's Night")

let params = {
    panorama: true,
    audio: false
}
const gui = new dat.GUI();
gui.add(params, 'panorama').name('Panorama');
gui.add(params, 'audio').name('BGM');
gui.open();

let step = 0, lon = 0, lat = 0;
let phi = 0, theta = 0;
let radius = 1.5;
let height = 1.5;
let targetPos = new THREE.Vector3(0, height, 0)
let onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;

let mixer;

var scene = new THREE.Scene();
scene.position.set(0, 0, 0);
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
document.addEventListener('pointerdown', onPointerDown, false);
document.addEventListener('wheel', onDocumentMouseWheel, true);

// audio
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);
// create a global audio source
const sound = new THREE.Audio( listener );
const file = 'src/audio/Dawdio - Moonlight Sonata Trapped Within a Music Box.flac';
// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load(file, function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.3);
});
sound.hasPlaybackControl = false;

function BGM_Control() {
    if(params.audio) {
        if(sound.hasPlaybackControl) {
            console.log("BGM is playing.")
        }
        else {
            sound.hasPlaybackControl = true;
            sound.play();

        }
    }
    else {
        if (sound.hasPlaybackControl) {
            sound.pause();
            sound.hasPlaybackControl = false;
        }
    }
}




const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.minDistance = 1;
controls.maxDistance = 3;

window.addEventListener('resize', onWindowResize, true);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onPointerDown(event) {
    event.preventDefault();
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    document.addEventListener('pointermove', onPointerMove, false);
    document.addEventListener('pointerup', onPointerUp, false);
}

function onPointerMove(event) {
    lon = (event.clientX - onPointerDownPointerX) * 0.1 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
}

function onPointerUp() {
    document.removeEventListener('pointermove', onPointerMove, false);
    document.removeEventListener('pointerup', onPointerUp, false);
}

function onDocumentMouseWheel(event) {
    const fov = camera.fov + event.deltaY * 0.05;
    camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
    camera.updateProjectionMatrix();
}


// new THREE.RGBELoader()
//     .setDataType( THREE.UnsignedByteType )
//     .setPath( 'textures/equirectangular/')
//     .load( 'satara_night_no_lamps_8k.hdr', function ( texture ) {

//         const envMap = pmremGenerator.fromEquirectangular( texture ).texture;

//         scene.background = envMap;
//         scene.environment = envMap;

//         texture.dispose();
//         pmremGenerator.dispose();

//         renderScene();

//         // model

//         // use of RoughnessMipmapper is optional
//         // const roughnessMipmapper = new THREE.RoughnessMipmapper( renderer );

//         const loader = new THREE.GLTFLoader().setPath( 'models/gltf/music_box_anima/glTF/' );
//         loader.load( 'BN_20201201.gltf', function ( gltf ) {

//             gltf.scene.traverse( function ( child ) {

//                 if ( child.isMesh ) {
//                   child.castShadow = true;
//                   child.receiveShadow = true;
//                   let Mat = new THREE.MeshPhongMaterial( { color: 0xffffff} );
//                   Mat.metalnessMap = child.material.metalnessMap;
//                   Mat.normalMap = child.material.normalMap;
//                   Mat.roughnessMap = child.material.roughnessMap;
//                   Mat.map = child.material.map;
//                   child.material = Mat;
//                 }

//             } );

//             scene.add( gltf.scene );

//             // roughnessMipmapper.dispose();

//             renderScene();

//         } );

//     } );

// for compressed loader
new THREE.RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath('textures/equirectangular/')
    .load('satara_night_no_lamps_8k.hdr', function (texture) {

        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        scene.background = envMap;
        scene.environment = envMap;

        texture.dispose();
        pmremGenerator.dispose();

        renderScene();

        // model

        // use of RoughnessMipmapper is optional
        // const roughnessMipmapper = new THREE.RoughnessMipmapper( renderer );


        //const loader = new THREE.GLTFLoader().setPath( 'examples/models/gltf/BN_GLTF_20201128/glTF/' );
        const loader = new THREE.GLTFLoader();

        // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('examples/js/libs/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.setPath( 'examples/models/gltf/BN_GLTF_20201129_compressed_demeshed/glTF/' );
        loader.load('BN_20201129.gltf', function (gltf) {

            gltf.scene.traverse(function (child) {

                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    let Mat = new THREE.MeshPhongMaterial({color: 0xffffff});
                    Mat.metalnessMap = child.material.metalnessMap;
                    Mat.normalMap = child.material.normalMap;
                    Mat.roughnessMap = child.material.roughnessMap;
                    Mat.map = child.material.map;
                    child.material = Mat;
                }

            });

            scene.add(gltf.scene);

            // roughnessMipmapper.dispose();

            renderScene();

        });

    });


    new THREE.RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath('textures/equirectangular/')
    .load('satara_night_no_lamps_8k.hdr', function (texture) {

        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        scene.background = envMap;
        scene.environment = envMap;

        texture.dispose();
        pmremGenerator.dispose();

        renderScene();

        // model

        // use of RoughnessMipmapper is optional
        // const roughnessMipmapper = new THREE.RoughnessMipmapper( renderer );


        //const loader = new THREE.GLTFLoader().setPath( 'examples/models/gltf/BN_GLTF_20201128/glTF/' );
        const loader = new THREE.GLTFLoader();

        // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('examples/js/libs/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.setPath( 'examples/models/gltf/music_box_anima/glTF/' );
        loader.load('BN_20201201.gltf', function (gltf) {

            mixer = new THREE.AnimationMixer( gltf.scene );
			const action = mixer.clipAction( gltf.animations[ 0 ] );
			action.setDuration(2.0).play();

            gltf.scene.traverse(function (child) {

                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    let Mat = new THREE.MeshPhongMaterial({color: 0xffffff});
                    Mat.metalnessMap = child.material.metalnessMap;
                    Mat.normalMap = child.material.normalMap;
                    Mat.roughnessMap = child.material.roughnessMap;
                    Mat.map = child.material.map;
                    child.material = Mat;
                }

            });

            scene.add(gltf.scene);

            // roughnessMipmapper.dispose();

            renderScene();

        });

    });

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// point light
// let bulbLight, bulbMat;
// bulbMat, bulbLight = init_point_light(1, 1, 1);
// bulbLight.castShadow = true;
// scene.add( bulbLight );

let hemiLight;
hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
scene.add(hemiLight);

let flameMaterials = [];
let candleLights = [];

let candleLight1, candleMat1, candleMesh1, flameMaterials1;
candleMat1, candleMesh1 = getCandle(function (materials, light) {
    flameMaterials1 = materials;
    candleLight1 = light;
}, 0.03);
candleLights.push(candleLight1);
flameMaterials.push(flameMaterials1);
candleMesh1.castShadow = true;
candleMesh1.position.set(0.1687, 1.56, 2.24)
scene.add(candleMesh1);

let candleLight2, candleMat2, candleMesh2, flameMaterials2;
candleMat2, candleMesh2 = getCandle(function (materials, light) {
    flameMaterials2 = materials;
    candleLight2 = light;
}, 0.02);
candleLights.push(candleLight2);
flameMaterials.push(flameMaterials2);
candleMesh2.castShadow = true;
candleMesh2.position.set(0.1997, 1.37, 2.117)
scene.add(candleMesh2);

let candleLight3, candleMat3, candleMesh3, flameMaterials3;
candleMat3, candleMesh3 = getCandle(function (materials, light) {
    flameMaterials3 = materials;
    candleLight3 = light;
}, 0.02);
candleLights.push(candleLight3);
flameMaterials.push(flameMaterials3);
candleMesh3.castShadow = true;
candleMesh3.position.set(0.06212, 1.416, 2.157)
scene.add(candleMesh3);

let candleLight4, candleMat4, candleMesh4, flameMaterials4;
candleMat4, candleMesh4 = getCandle(function (materials, light) {
    flameMaterials4 = materials;
    candleLight4 = light;
}, 0.03);
candleLights.push(candleLight4);
flameMaterials.push(flameMaterials4);
candleMesh4.castShadow = true;
candleMesh4.position.set(1.25, 0.8713, -0.2855)
scene.add(candleMesh4);

let candleLight5, candleMat5, candleMesh5, flameMaterials5;
candleMat5, candleMesh5 = getCandle(function (materials, light) {
    flameMaterials5 = materials;
    candleLight5 = light;
}, 0.02);
candleLights.push(candleLight5);
flameMaterials.push(flameMaterials5);
candleMesh5.castShadow = true;
candleMesh5.position.set(1.291, 0.8321, -0.3404)
scene.add(candleMesh5);

let candleLight6, candleMat6, candleMesh6, flameMaterials6;
candleMat6, candleMesh6 = getCandle(function (materials, light) {
    flameMaterials6 = materials;
    candleLight6 = light;
}, 0.02);
candleLights.push(candleLight6);
flameMaterials.push(flameMaterials6);
candleMesh6.castShadow = true;
candleMesh6.position.set(1.232, 0.8001, -0.363)
scene.add(candleMesh6);

let candleLight7, candleMat7, candleMesh7, flameMaterials7;
candleMat7, candleMesh7 = getCandle(function (materials, light) {
    flameMaterials7 = materials;
    candleLight7 = light;
}, 0.02);
candleLights.push(candleLight7);
flameMaterials.push(flameMaterials7);
candleMesh7.castShadow = true;
candleMesh7.position.set(1.581, 0.938, 2.199)
scene.add(candleMesh7);

// floor
let floorMesh, floorMat;
floorMat = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    color: 0xffffff,
    metalness: 0.4,
    bumpScale: 0.01
});
let textureLoader = new THREE.TextureLoader();
textureLoader.load("textures/hardwood2_diffuse.jpg", function (map) {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(5, 4);
    map.encoding = THREE.sRGBEncoding;
    floorMat.map = map;
    floorMat.needsUpdate = true;
});
let floorGeometry = new THREE.PlaneBufferGeometry(5, 4);
floorMesh = new THREE.Mesh(floorGeometry, floorMat);
floorMesh.receiveShadow = true;
floorMesh.rotation.x = -Math.PI / 2.0;
floorMesh.rotation.z = Math.PI / 2.0;
scene.add(floorMesh);

// wall1
let wallMesh1, wallMat1;
wallMat1 = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    color: 0xffffff,
    metalness: 0.4,
    bumpScale: 0.01
});
textureLoader.load("textures/wallpaper/TexturesCom_WallpaperForties0070_seamless_S.jpg", function (map) {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(5, 4);
    map.encoding = THREE.sRGBEncoding;
    wallMat1.map = map;
    wallMat1.needsUpdate = true;
});
let wallGeometry1 = new THREE.PlaneBufferGeometry(4, 2.6);
wallMesh1 = new THREE.Mesh(wallGeometry1, wallMat1);
wallMesh1.receiveShadow = true;
wallMesh1.position.z = -2.5;
wallMesh1.position.y = 1.3;
scene.add(wallMesh1);

// wall2
let wallMesh2, wallMat2;
wallMat2 = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    color: 0xffffff,
    metalness: 0.4,
    bumpScale: 0.01
});
textureLoader.load("textures/wallpaper/TexturesCom_WallpaperForties0070_seamless_S.jpg", function (map) {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(5, 4);
    map.encoding = THREE.sRGBEncoding;
    wallMat2.map = map;
    wallMat2.needsUpdate = true;
});
let wallGeometry2 = new THREE.PlaneBufferGeometry(4, 2.6);
wallMesh2 = new THREE.Mesh(wallGeometry2, wallMat2);
wallMesh2.receiveShadow = true;
wallMesh2.position.z = 2.5;
wallMesh2.position.y = 1.3;
wallMesh2.rotation.y = Math.PI;
scene.add(wallMesh2);

// wall3
let wallMesh3, wallMat3;
wallMat3 = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    color: 0xffffff,
    metalness: 0.4,
    bumpScale: 0.01
});
textureLoader.load("textures/wallpaper/TexturesCom_WallpaperForties0070_seamless_S.jpg", function (map) {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(5, 4);
    map.encoding = THREE.sRGBEncoding;
    wallMat3.map = map;
    wallMat3.needsUpdate = true;
});
let wallGeometry3 = new THREE.PlaneBufferGeometry(5, 2.6);
wallMesh3 = new THREE.Mesh(wallGeometry3, wallMat3);
wallMesh3.receiveShadow = true;
wallMesh3.position.x = 2;
wallMesh3.position.y = 1.3;
wallMesh3.rotation.y = -Math.PI / 2;
scene.add(wallMesh3);

// wall4
let wallMesh4, wallMat4;
wallMat4 = new THREE.MeshStandardMaterial({
    roughness: 1.0,
    color: 0xffffff,
    metalness: 0.4,
    bumpScale: 0.01
});
textureLoader.load("textures/wallpaper/TexturesCom_WallpaperForties0070_seamless_S.jpg", function (map) {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(5, 4);
    map.encoding = THREE.sRGBEncoding;
    wallMat4.map = map;
    wallMat4.needsUpdate = true;
});
let wallGeometry4 = new THREE.PlaneBufferGeometry(5, 2.6);
wallMesh4 = new THREE.Mesh(wallGeometry4, wallMat4);
wallMesh4.receiveShadow = true;
wallMesh4.position.x = -2;
wallMesh4.position.y = 1.3;
wallMesh4.rotation.y = Math.PI / 2;
scene.add(wallMesh4);

renderer.antialias = true;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//camera
// camera.position.x=4;
// camera.position.y=4;
// camera.position.z=-4;
// scene.position.x = 0;
// scene.position.y = 0;
// scene.position.z = 0;
// camera.lookAt(scene.position);

$('#first-threejs').append(renderer.domElement);




function renderScene() {
    requestAnimationFrame(renderScene);
    //make updates to position, rotation of objects in the Scene
    step += 0.01;
    lon += .1;
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);
    for (let i = 0; i < flameMaterials.length; i++) {
        flameMaterials[i].uniforms.time.value = step;
        // flameMaterials[i][1].uniforms.time.value = step;
        candleLights[i].position.x = Math.sin(step * Math.PI) * 0.25;
        candleLights[i].position.z = Math.cos(step * Math.PI * 0.75) * 0.25;
        candleLights[i].intensity = 2 + Math.sin(step * Math.PI * 2) * Math.cos(step * Math.PI * 1.5) * 0.25;
    }
    if (params.panorama) {
        camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        camera.position.y = height;  // radius * Math.cos( phi )
        camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(targetPos);
    }
    if ( mixer ) mixer.update(0.01);
    renderer.render(scene, camera);
    // BGM control
    BGM_Control();
}
renderScene();


