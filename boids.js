// Size of canvas. These get updated to fill the whole browser.
let width = 150;
let height = 150;

const numBoids = 40;


var boids = [];

function initBoids() {
    for (var i = 0; i < numBoids; i += 1) {
        boids[boids.length] = {
            x: Math.random() * width,
            y: Math.random() * height,
            dx: Math.random() * 10 - 5,
            dy: Math.random() * 10 - 5,
            history: [],
            color:  `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
            scale: Math.random() * 1.5 + 0.5
        };
    }
}



function distance(boid1, boid2) {
    return Math.sqrt(
        (boid1.x - boid2.x) * (boid1.x - boid2.x) +
        (boid1.y - boid2.y) * (boid1.y - boid2.y),
    );
}

// TODO: This is naive and inefficient.
function nClosestBoids(boid, n) {
    // Make a copy
    const sorted = boids.slice();
    // Sort the copy by distance from `boid`
    sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
    // Return the `n` closest
    return sorted.slice(1, n + 1);
}

// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
    const canvas = document.getElementById("boids");
    width = window.innerWidth;
    height = window.innerHeight -90;
    canvas.width = width;
    canvas.height = height;
}

// Constrain a boid to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
function keepWithinBounds(boid) {
    const margin = 100;
    const turnFactor = 1;

    if (boid.x < margin) {
        boid.dx += turnFactor;
    }
    if (boid.x > width - margin) {
        boid.dx -= turnFactor
    }
    if (boid.y < margin) {
        boid.dy += turnFactor;
    }
    if (boid.y > height - margin) {
        boid.dy -= turnFactor;
    }
}

// Find the center of mass of the other boids and adjust velocity slightly to
// point towards the center of mass.
function flyTowardsCenter(boid) {
    const centeringFactor = settings.cohesion/10;
    const visualRange = settings.visual;
    let centerX = 0;
    let centerY = 0;
    let numNeighbors = 0;

    for (let otherBoid of boids) {
        if (distance(boid, otherBoid) < visualRange) {
            centerX += otherBoid.x;
            centerY += otherBoid.y;
            numNeighbors += 1;
        }
    }

    if (numNeighbors) {
        centerX = centerX / numNeighbors;
        centerY = centerY / numNeighbors;

        boid.dx += (centerX - boid.x) * centeringFactor;
        boid.dy += (centerY - boid.y) * centeringFactor;
    }
}

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid) {
    const minDistance = 20; // The distance to stay away from other boids
    const avoidFactor = settings.seperation/10;
    let moveX = 0;
    let moveY = 0;
    for (let otherBoid of boids) {
        if (otherBoid !== boid) {
            if (distance(boid, otherBoid) < minDistance) {
                moveX += boid.x - otherBoid.x;
                moveY += boid.y - otherBoid.y;
            }
        }
    }

    boid.dx += moveX * avoidFactor;
    boid.dy += moveY * avoidFactor;
}

// Find the average velocity (speed and direction) of the other boids and
// adjust velocity slightly to match.
function matchVelocity(boid) {
    const matchingFactor = settings.alignment/10;
    const visualRange = settings.visual;
    let avgDX = 0;
    let avgDY = 0;
    let numNeighbors = 0;

    for (let otherBoid of boids) {
        if (distance(boid, otherBoid) < visualRange) {
            avgDX += otherBoid.dx;
            avgDY += otherBoid.dy;
            numNeighbors += 1;
        }
    }

    if (numNeighbors) {
        avgDX = avgDX / numNeighbors;
        avgDY = avgDY / numNeighbors;

        boid.dx += (avgDX - boid.dx) * matchingFactor;
        boid.dy += (avgDY - boid.dy) * matchingFactor;
    }
}

// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(boid) {
    const speedLimit = 15;
    const minSpeed = 3;
    const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
    if (speed > speedLimit) {
        boid.dx = (boid.dx / speed) * speedLimit;
        boid.dy = (boid.dy / speed) * speedLimit;
    }
    if (speed < minSpeed) {
        boid.dx = (boid.dx / speed) * minSpeed;
        boid.dy = (boid.dy / speed) * minSpeed;
    }

}



const DRAW_TRAIL = true;

function drawBoid(ctx, boid) {
    const angle = Math.atan2(boid.dy, boid.dx);
    ctx.translate(boid.x, boid.y);
    ctx.rotate(angle);
    ctx.translate(-boid.x, -boid.y);
   //ctx.strokeStyle = boid.color;

ctx.globalCompositeOperation = 'darker';
    ctx.strokeStyle = "#558cf4";
    ctx.lineWidth = 2; // Adjust the line width as needed




    ctx.beginPath();
    ctx.moveTo(boid.x, boid.y);
    ctx.lineTo(boid.x - 10, boid.y - 8); // Tail
    ctx.lineTo(boid.x - 15, boid.y);    // Body
    ctx.lineTo(boid.x - 10, boid.y + 8); // Head
    ctx.lineTo(boid.x, boid.y);         // Back to the tail
    ctx.closePath();
    ctx.stroke();
    if(settings.color) {
        ctx.fillStyle = boid.color
        ctx.fill();
    }



    // ctx.beginPath();
    // ctx.moveTo(boid.x, boid.y);
    // ctx.lineTo(boid.x - 15, boid.y + 5);
    // ctx.lineTo(boid.x - 15, boid.y - 5);
    // ctx.lineTo(boid.x, boid.y);
    // ctx.closePath(); // Close the path to connect the lines
    // ctx.stroke(); // Draw the outlines



    // ctx.fillStyle = "#558cf4";
    // ctx.beginPath();
    // ctx.moveTo(boid.x, boid.y);
    // ctx.lineTo(boid.x - 15, boid.y + 5);
    // ctx.lineTo(boid.x - 15, boid.y - 5);
    // ctx.lineTo(boid.x, boid.y);
    // ctx.fill();



    ctx.setTransform(1, 0, 0, 1, 0, 0);



    if (settings.trails) {
        ctx.strokeStyle = "#558cf466";
        ctx.beginPath();
        ctx.moveTo(boid.history[0][0], boid.history[0][1]);
        for (const point of boid.history) {
            ctx.lineTo(point[0], point[1]);
        }
        ctx.stroke();
    } else {
        boid.history = [];
    }
}



// Main animation loop
function animationLoop(timestamp) {

    const elapsed = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    fps = Math.round(1000 / elapsed);
    if (settings.run) {
        // Update each boid
        for (let boid of boids) {
            // Update the velocities according to each rule
            flyTowardsCenter(boid);
            avoidOthers(boid);
            matchVelocity(boid);
            limitSpeed(boid);
            keepWithinBounds(boid);

            // Update the position based on the current velocity
            boid.x += boid.dx;
            boid.y += boid.dy;
            boid.history.push([boid.x, boid.y])
            boid.history = boid.history.slice(-50);
        }

        // Clear the canvas and redraw all the boids in their current positions
        const ctx = document.getElementById("boids").getContext("2d");
        ctx.clearRect(0, 0, width, height);
        for (let boid of boids) {
            drawBoid(ctx, boid);
        }

        const textFPS = `FPS: ${fps}`;
        const textBirds = `Birds: ${boids.length}`;
        const fpstextWidth = ctx.measureText(textFPS).width;
        const boidstextWidth = ctx.measureText(textBirds).width;
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.fillText(textFPS, width - fpstextWidth - 20, 30); // Right-aligned FPS
        ctx.fillText(textBirds, width - boidstextWidth - 20, 60); // Right-aligned # boids
    }
    // Schedule the next frame
    window.requestAnimationFrame(animationLoop);
}

function registerHandlers()
{
    const cohesionInput = document.getElementById("cohesion");
    cohesionInput.addEventListener("input", function() {
        settings.cohesion = parseFloat(cohesionInput.value);
    });

    const seperationInput = document.getElementById("seperation");
    seperationInput.addEventListener("input", function() {
        settings.seperation = parseFloat(seperationInput.value);
    });

    const alignmentInput = document.getElementById("alignment");
    alignmentInput.addEventListener("input", function() {
        settings.alignment = parseFloat(alignmentInput.value);
    });

    const visualInput = document.getElementById("visual");
    visualInput.addEventListener("input", function() {
        settings.visual = parseFloat(visualInput.value);
    });



    const moreButton = document.getElementById("more");
    moreButton.addEventListener("click", function() {
        initBoids();
    });

    const lessButton = document.getElementById("less");
    lessButton.addEventListener("click", function() {
        if (boids.length >= 40) {
          boids.splice(-40);
        } else {
            boids = [];
          // Handle the case where the array has fewer than 40 elements
          // You can choose to clear the entire array or handle it differently based on your requirements
        }
    });

    const resetButton = document.getElementById("reset");
    resetButton.addEventListener("click", function() {
        boids = [];
        initBoids();
    });

    const trailsButton = document.getElementById("trails");
    trailsButton.addEventListener("click", function() {
        settings.trails = !settings.trails
    });

    const colourButton = document.getElementById("colour");
    colourButton.addEventListener("click", function() {
        settings.color = !settings.color
    });

    const pauseButton = document.getElementById("pause");
    pauseButton.addEventListener("click", function() {
        settings.run = !settings.run
    });
}

window.onload = () => {
    // Make sure the canvas always fills the whole window
    window.addEventListener("resize", sizeCanvas, false);
    sizeCanvas();


    // Randomly distribute the boids to start
    initBoids();

    registerHandlers();

    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop);
};

let lastTimestamp = 0;
let fps = 0;

const settings = {
    cohesion: 0.05,
    alignment: 0.2,
    seperation: 0.1,
    visual: 5,
    trails: false,
    run: true,
    color: false,
    // Add more settings as needed
};
