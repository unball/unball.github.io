const textContainer = document.querySelector(".banner-text-container");

class Logo3d {
    constructor(selector, glbPath){
        this.logoContainer = document.querySelector(selector);
        this.scene = new THREE.Scene();
        this.loader = new THREE.GLTFLoader();
        this.camera = new THREE.PerspectiveCamera( 45, this.logoContainer.offsetWidth / this.logoContainer.offsetHeight, 0.001, 10 );
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.glbPath = glbPath;

        // Logo object
        this.logo = undefined;

        // Start rendering time
        this.t0 = undefined;

        // Last time color changed
        this.lastPaint = 0;
    }

    load(){
        // Set camera position
        this.camera.position.set( 0, 0.05, 0 );
        this.camera.lookAt( 0, 0, 0 );
        
        // Configure renderer
        this.renderer.setClearColor(0x000000, 0); // Transparent Background
        this.renderer.setSize(this.logoContainer.offsetWidth, this.logoContainer.offsetHeight); // Adjust to element size

        // Set light position
        this.light.position.set(0.05,0.1,0);
        this.light.lookAt(0,0,0);
        this.scene.add(this.light);
        
        // Add canvas to DOM
        this.logoContainer.appendChild( this.renderer.domElement );

        return this.loadLogoObject();
    }

    loadLogoObject(){
        return new Promise((resolve, reject) => {
            this.loader.load(this.glbPath, (gltf) => {
                this.logo = gltf.scene;
                    
                this.logo.traverse((child) => {
                    // Add reflective material to object
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({color: 0xff660b});
                        child.material.side = THREE.DoubleSide;
                    }
    
                    // Calculate centroids
                    if (child.name == 'logo') {
                        for (let group of child.children) {
                            this.computeGroupCentroid(group);
                        }
                    }
    
                    resolve();
                });
                console.log(this.logo);
            }, undefined, () => reject());
        });
    }

    start(){
        this.t0 = new Date().getTime() / 1000;
        this.scene.add(this.logo);
        this.animate();
    }

    animate() {
        if(!this.logo) return;

        this.scene.updateMatrixWorld();

        // Current time
        const t = new Date().getTime() / 1000;

        // Current time since start
        const rt = t - this.t0;
        
        // Animations
        this.softRotationAnimation(t);
        this.softEarsOscilationAnimation(t);
        this.implodeAnimation(rt);
        this.softColorChangeAnimation(t);

        this.updatePosition();
        this.updateResize();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    };

    updateResize(){
        this.camera.aspect = this.logoContainer.offsetWidth / this.logoContainer.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.logoContainer.offsetWidth, this.logoContainer.offsetHeight);
    }

    updatePosition(){
        // Position of center (0,0,0) in camera's normalized device coordinate
        this.camera.getWorldPosition(new THREE.Vector3());
        const ref = new THREE.Vector3(0,0,0);
        ref.project(this.camera);

        // Move object to the left, so that it's placed half distance from center
        const vec = new THREE.Vector3();
        vec.set(-0.5, 0, ref.z); // center 50% of width/2 from left
        vec.unproject(this.camera);
        this.logo.position.setX(vec.x);
    }

    softRotationAnimation(t){
        this.logo.rotation.z = 0.1 * Math.sin(2 * Math.PI * t / 10);
        this.logo.rotation.x = 0.01 * Math.sin(2 * Math.PI * t / 10);
    }

    softEarsOscilationAnimation(t){
        this.logo.traverse((child) => {
            if (child.name == 'RightEar') {
                child.scale.set(1, 0.25 * Math.abs(Math.cos(2 * Math.PI * t / 20)) + 1, 1);
            }
            if (child.name == 'LeftEar') {
                child.scale.set(1, 0.25 * Math.abs(Math.cos(2 * Math.PI * t / 20 + Math.PI / 2)) + 1, 1);
            }
        });
    }

    implodeAnimation(rt){
        this.logo.traverse((child) => {
            if (child.name == 'logo') {
                for (let group of child.children) {
                    const period = group.name.includes('Ear') ? 1 : 0.5;
                    const newPosition = group.centroid.clone();

                    newPosition.setLength(Math.exp(-4 * rt / period));
                    group.position.copy(newPosition);
                }
            }
        })
    }

    softColorChangeAnimation(t){
        if (t - this.lastPaint > 1) {
            this.lastPaint = t;
            this.logo.traverse((child) => {
                if (child.name == 'logo') {
                    for (let group of child.children) {
                        const paintWhite = Math.random() > 0.5;
                        group.traverse((groupChildren) => {
                            if (groupChildren.isMesh) {
                                var col = new THREE.Color(paintWhite ? 0xff5400 : 0xff660b);
                                TweenLite.to(groupChildren.material.color, 0.2, {
                                    r: col.r,
                                    g: col.g,
                                    b: col.b,
                                });
                            }
                        })
                    }
                }
            })
        }
    }

    computeMeshCentroid(mesh) {
        const geometry = mesh.geometry;
        geometry.computeBoundingBox();
        mesh.centroid = new THREE.Vector3();
        mesh.centroid.addVectors(geometry.boundingBox.min, geometry.boundingBox.max);
        mesh.centroid.multiplyScalar(0.5);
        mesh.centroid.applyMatrix4( mesh.matrixWorld );
    }
    
    computeGroupCentroid(group) {
        group.centroid = new THREE.Vector3();
        let count = 0;
        group.traverse((child) => {
            if(child.isMesh){
                this.computeMeshCentroid(child);
                group.centroid.add(child.centroid);
                count++;
            }
        })
        group.centroid.divideScalar(count);
        group.centroid.applyMatrix4( group.matrixWorld );
    }
}







