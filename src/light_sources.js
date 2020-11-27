console.log("This is code of light sources.")

function init_point_light(x, y, z) {
    let bulbGeometry = new THREE.SphereBufferGeometry( 0.02, 16, 8 );
    let bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );

    let bulbMat = new THREE.MeshStandardMaterial( {
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
    } );
    bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
    bulbLight.position.set( x, y, z );
    bulbLight.castShadow = true;
    return bulbMat, bulbLight;
}


// load candle
function getFlameMaterial(isFrontSide){
    let side = isFrontSide ? THREE.FrontSide : THREE.BackSide;
    return new THREE.ShaderMaterial({
    uniforms: {
        time: {value: 0}
    },
    vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float hValue;

        // 2D Random
        float random (in vec2 st) {
            return fract(sin(dot(st.xy,
                                vec2(12.9898,78.233)))
                        * 43758.5453123);
        }

        float noise (in vec2 st) {
            vec2 i = floor(st); // find the nearest integer less than or equal to the parameter
            vec2 f = fract(st); // compute the fractional part of the argument

            // Four corners in 2D of a tile
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            // Smooth Interpolation

            // Cubic Hermine Curve.  Same as SmoothStep()
            vec2 u = f*f*(3.0-2.0*f);
            // u = smoothstep(0.,1.,f);

            // Mix 4 coorners percentages
            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        void main() {
        vUv = uv;
        vec3 pos = position;

        pos *= vec3(0.8, 2, 0.725);  // rescale the sphere
        hValue = position.y;  // get height value for each vertex of the geometry
        // float sinT = sin(time * 2.) * 0.5 + 0.5;
        float posXZlen = length(position.xz);

        // [pi/4, pi*3/4] for (posXZlen + 0.25) * 3.1415926
        // pos.y is in range [0, 1]. for (cos((posXZlen + 0.25) * 3.1415926) * 0.25 + noise(vec2(0, time)) * position.y, when pos.y becomes larger, the shape become thinner and sharper
        // noise(vec2(position.x + time, position.z + time)) * 0.5 introduces extra trembling
        pos.y *= 1. + (cos((posXZlen + 0.25) * 3.1415926) * 0.25 + noise(vec2(0, time)) * 0.125 + noise(vec2(position.x + time, position.z + time)) * 0.5) * position.y; // flame height

        pos.x += noise(vec2(time * 2., (position.y - time) * 4.0)) * hValue * 0.0312; // flame trembling
        pos.z += noise(vec2((position.y - time) * 4.0, time * 2.)) * hValue * 0.0312; // flame trembling

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
        }
    `,
    fragmentShader: `
        varying float hValue;
        varying vec2 vUv;

        // the bottom sixth bar
        vec3 heatmapGradient(float t) {
        return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
        }

        void main() {
        // gl_FragColor = vec4(0.7, 0.7, 0.7, 0.3);
        float v = abs(smoothstep(0.0, 0.4, hValue) - 1.);
        float alpha = (1. - v) * 0.99; // bottom transparency
        alpha -= 1. - smoothstep(1.0, 0.97, hValue); // tip transparency
        gl_FragColor = vec4(heatmapGradient(smoothstep(0.0, 0.3, hValue)) * vec3(0.95,0.95,0.4), alpha) ;
        gl_FragColor.rgb = mix(vec3(0,0,1), gl_FragColor.rgb, smoothstep(0.0, 0.3, hValue)); // blueish for bottom
        gl_FragColor.rgb += vec3(1, 0.9, 0.5) * (1.25 - vUv.y); // make the midst brighter
        // gl_FragColor.rgb += vec3(1, 0.9, 0.5) * smoothstep(-0.4, 1.0, hValue); // make the midst brighter
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.66, 0.32, 0.03), smoothstep(0.95, 1., hValue)); // tip
        }
    `,
    transparent: true,
    side: side
    });
}

// candle
function get_candle(helper, rescale=0.1){

    // candlewick
    let candlewickProfile = new THREE.Shape();
    candlewickProfile.absarc(0, 0, 0.0625, 0, Math.PI * 2);

    let candlewickCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.5, -0.0625),
    new THREE.Vector3(0.25, 0.5, 0.125)
    ]);

    // let points = candlewickCurve.getPoints(5000);
    // let candlewickGeo = new THREE.BufferGeometry().setFromPoints(points);
    // candlewickGeo.translate(0, 0.95, 0);
    // let candlewickMat = new THREE.LineBasicMaterial({color: 0xffff44});
    // let caseMat = candlewickMat;
    // let caseMesh = new THREE.Line(candlewickGeo, candlewickMat);

    let candlewickGeo = new THREE.ExtrudeBufferGeometry(candlewickProfile, {steps: 8, bevelEnabled: false, extrudePath: candlewickCurve});
    let colors = [];
    let color1 = new THREE.Color('black');
    let color2 = new THREE.Color(0x994411);
    let color3 = new THREE.Color(0xffff44);
    for (let i = 0; i < candlewickGeo.attributes.position.count; i++){
    if (candlewickGeo.attributes.position.getY(i) < 0.4){
        color1.toArray(colors, i * 3);
    }
    else {
        color2.toArray(colors, i * 3);
    };
    if (candlewickGeo.attributes.position.getY(i) < 0.15) color3.toArray(colors, i * 3);
    }
    candlewickGeo.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array(colors), 3 ) );
    candlewickGeo.translate(0, 0.95, 0);
    candlewickMat = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});

    // let candlewickMesh = new THREE.Mesh(candlewickGeo, candlewickMat);
    // caseMesh.add(candlewickMesh);
    let caseMat = candlewickMat;
    let caseMesh = new THREE.Mesh(candlewickGeo, candlewickMat);
    caseMesh.castShadow = false;
    
    var candleLight2 = new THREE.PointLight(0xffaa33, 1, 0, 2);  // 0xffffff
    candleLight2.position.set(0, 3, 0);
    candleLight2.castShadow = true;
    caseMesh.add(candleLight2);

    // flame
    flameMaterials = [];
    function flame(isFrontSide){
        let flameGeo = new THREE.SphereBufferGeometry(0.5, 32, 32);
        flameGeo.translate(0, 0.5, 0);
        let flameMat = getFlameMaterial(isFrontSide);
        flameMaterials.push(flameMat);
        let flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.set(0.06, 1.2, 0.06);
        flame.rotation.y = THREE.Math.degToRad(-45);
        caseMesh.add(flame);
    }
    

    // caseMesh.scale.set(0.05, 0.05, 0.05);
    caseMesh.scale.set(rescale, rescale, rescale);

    flame(false);
    flame(true);
    helper(flameMaterials, candleLight2);
    return caseMat, caseMesh;
}






