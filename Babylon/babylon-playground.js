var createScene = function () {
  // This creates a basic Babylon Scene object (non-mesh)
  var scene = new BABYLON.Scene(engine);

  // This creates and positions a free camera (non-mesh)
  var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

  // This targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;
  light.lightmapMode = BABYLON.Light.LIGHTMAP_SPECULAR;

  // Our built-in 'sphere' shape.
  var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);

  // Move the sphere upward 1/2 its height
  sphere.position.y = 6;

  // Assign a material so that it doesn't look boring.
  const shiny = new BABYLON.StandardMaterial("shiny", scene);
  shiny.diffuseColor = BABYLON.Color3.Random();
  sphere.material = shiny;

  // Our built-in 'ground' shape.
  var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

  var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
  var havokPlugin = new BABYLON.HavokPlugin();
  scene.enablePhysics(gravityVector, havokPlugin);

  // Create a sphere shape and the associated body. Size will be determined automatically.
  var sphereAggregate = new BABYLON.PhysicsAggregate(
    sphere,
    BABYLON.PhysicsShapeType.SPHERE,
    { mass: 1, restitution: 0.75 },
    scene
  );
  // Create a static box shape.
  var groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

  var actionManager = new BABYLON.ActionManager(scene);
  sphere.actionManager = actionManager;
  ground.actionManager = actionManager;
  sphere.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
      const sourceObject = evt.meshUnderPointer;
      if (sourceObject === sphere) {
        shiny.diffuseColor = BABYLON.Color3.Random();
        shiny.specularColor = BABYLON.Color3.Random();

        // Push the sphere up so that it falls again
        // sourceSphere.applyImpulse(new BABYLON.Vector3(15, 15, 15), new BABYLON.Vector3(0, 0, 0));
        sphereAggregate.body.applyImpulse(new BABYLON.Vector3(0, 5, 1), camera.position);
      } else {
        for (var i = 0; i < 4; ++i) {
          setTimeout(function () {
            var sizeAndWeight = Math.random();
            var marble = BABYLON.MeshBuilder.CreateSphere(
              "marble" + Math.random(),
              { diameter: 0.4 * sizeAndWeight, segments: 16 },
              scene
            );
            marble.position.y = 6;
            var negativePositionMultiplier = Math.round(Math.random()) == 0 ? 1 : -1;
            marble.position.x = (Math.random() / 1000) * negativePositionMultiplier;
            marble.position.z = (Math.random() / 1000) * negativePositionMultiplier;
            marble.material = shiny;
            new BABYLON.PhysicsAggregate(
              marble,
              BABYLON.PhysicsShapeType.SPHERE,
              { mass: 0.2 * sizeAndWeight, restitution: 0.75 },
              scene
            );
          }, 300 * i);
        }
      }
    })
  );

  return scene;
};
