 <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.167.1/examples/jsm/"
        }
      }
    </script>
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let camera, scene, renderer, cube, controls, isToppling = false;
let toppleDirection = new THREE.Vector3();
let toppleAxis = new THREE.Vector3();
let toppleAngle = 0;
let initialCubePosition = new THREE.Vector3();
let originalColor;
let gui;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let cubeRotationSpeed = 0.005;
let textMesh, bigTextMesh;
let frontLight;
let isTextRotating = false;
let textRotationSpeed = 0.01;
let textRotationX = 0;
let textRotationY = 0;
let textPosition = new THREE.Vector3(0, 1.5, 0)


function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.body.appendChild(renderer.domElement);


    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

   const lightPositions = [
        new THREE.Vector3(5, 5, 5),
        new THREE.Vector3(-5, 5, 5),
        new THREE.Vector3(5, 5, -5),
        new THREE.Vector3(-5, 5, -5),
         new THREE.Vector3(5, -5, 5),
        new THREE.Vector3(-5, -5, 5),
        new THREE.Vector3(5, -5, -5),
        new THREE.Vector3(-5, -5, -5),
    ];


    lightPositions.forEach(position => {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
        directionalLight.position.copy(position);
        scene.add(directionalLight);
         directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -5;
        directionalLight.shadow.camera.right = 5;
        directionalLight.shadow.camera.top = 5;
        directionalLight.shadow.camera.bottom = -5;


    });



    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x54c987,
        metalness: 0.9,
        roughness: 0.2,
        envMapIntensity: 1
    });
    originalColor = material.color.clone()

    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

     cube.castShadow = true;
     cube.receiveShadow = true;



    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableRotate = true;


    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;


    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('click', onCubeClick, false);
     renderer.domElement.addEventListener('mousedown', onTextMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onTextMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onTextMouseUp, false)
    document.addEventListener('mousemove', onDocumentMouseMove, false);


    initialCubePosition.copy(cube.position);


        // GUI setup
    gui = new GUI();
    const cubeFolder = gui.addFolder('Cube');

    const params = {
        color: '#54c987',
         rotationSpeed: 0.005,
    };

    cubeFolder.addColor(params, 'color').onChange((value) => {
        changeCubeColor(value)
    });
    cubeFolder.add(params, 'rotationSpeed', 0, 0.05).onChange((value) => {
       cubeRotationSpeed = value;
    });

    cubeFolder.add({ resetColor: resetCubeColor }, 'resetColor').name('Reset Color')

    cubeFolder.open()


     // Load font and create text
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
           const bigTextGeometry = new TextGeometry('THE CUBE', {
            font: font,
            size: 0.8,
            height: 0.05,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5
        });
             const bigTextMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.9,
            roughness: 0.2,
            envMapIntensity: 1
        });

         bigTextMesh = new THREE.Mesh(bigTextGeometry, bigTextMaterial);
         bigTextMesh.geometry.center();
         bigTextMesh.position.set(0, 2.5, 0);
         scene.add(bigTextMesh);


        const textGeometry = new TextGeometry('Made By Dope', {
            font: font,
            size: 0.3,
            height: 0.05,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5
        });
             const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.9,
            roughness: 0.2,
            envMapIntensity: 1
        });

        textMesh = new THREE.Mesh(textGeometry, textMaterial);
         textMesh.geometry.center();
         textMesh.position.copy(textPosition);
        scene.add(textMesh);



         // Position the camera to view text initially

        controls.target.set(0,0,0)
        controls.update();


       frontLight = new THREE.DirectionalLight(0xffffff, 1);
       frontLight.position.set(0,0,3)
        scene.add(frontLight);
        
         frontLight.castShadow = true;
        frontLight.shadow.mapSize.width = 1024;
        frontLight.shadow.mapSize.height = 1024;
        frontLight.shadow.camera.near = 0.5;
        frontLight.shadow.camera.far = 100;
        frontLight.shadow.camera.left = -5;
        frontLight.shadow.camera.right = 5;
        frontLight.shadow.camera.top = 5;
        frontLight.shadow.camera.bottom = -5;

    });



}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
     windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
}

function onCubeClick(event) {
    if (isToppling) return;
     controls.enableRotate = false;
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(cube);

    if (intersects.length > 0) {
         const clickPointWorld = intersects[0].point;


        toppleDirection.copy(clickPointWorld).sub(cube.position).normalize();


        toppleAxis.copy(toppleDirection).cross(new THREE.Vector3(0, 1, 0)).normalize();

        toppleAngle = 0;
        isToppling = true;
    }
     setTimeout(() => {
         controls.enableRotate = true;
    }, 100);
}
function updateTopple(){
    if (isToppling) {
            const toppleSpeed = 0.04;
            toppleAngle += toppleSpeed;

        if(toppleAngle < Math.PI / 2){

        const rotationMatrix = new THREE.Matrix4().makeRotationAxis(toppleAxis, toppleSpeed);

        cube.position.sub(initialCubePosition)
        cube.position.applyMatrix4(rotationMatrix);
        cube.position.add(initialCubePosition)

            cube.rotation.x = 0;
            cube.rotation.y = 0;
            cube.rotation.z = 0;
        cube.rotateOnAxis(toppleAxis, toppleSpeed)
    }
        else{
            isToppling = false;
             cube.position.copy(initialCubePosition);
             cube.rotation.set(0,0,0)

         }
    }
}
function onTextMouseDown(event){
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(textMesh);

    if (intersects.length > 0) {
        isTextRotating = true;
    }
}

function onTextMouseMove(event){
    if(isTextRotating){
        textRotationX = (event.clientX - windowHalfX) * 0.00001;
        textRotationY = (event.clientY - windowHalfY) * 0.00001;
    }

}

function onTextMouseUp(){
      isTextRotating = false;
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
     cube.rotation.x += cubeRotationSpeed;
    cube.rotation.y += cubeRotationSpeed * 1.1;
     cube.rotation.z += cubeRotationSpeed* 0.9;

    if(!isTextRotating){
        textMesh.rotation.set(0,0,0)
    }
    else{
         textMesh.rotation.y +=  textRotationX;
         textMesh.rotation.x +=  textRotationY;
    }
    
    
    updateTopple()
    renderer.render(scene, camera);
}

function changeCubeColor(color) {
    cube.material.color.set(color);
}


function resetCubeColor() {
     cube.material.color.copy(originalColor)
}



init();
animate();
