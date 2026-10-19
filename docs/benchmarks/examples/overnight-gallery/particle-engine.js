   // Configuration
   const N_SPECIES = 3;
   const MATRIX_SIZE = 3;
   const MAX_PARTICLES = 150; // 50 per species
   const NEIGHBOR_RADIUS = 80;
   const DT = 16; // approx frame time

   // mulberry32 PRNG
   function mulberry32(seed) {
     let t = seed + 0x6D2B79F5;
     t = Math.imul(t ^ t >>> 15, t | 1);
     t = Math.imul(t ^ t >>> 7, t | 64);
     return (t ^ t >>> 16) >>> 0; // but need float
     // Actually return integer, then divide by 0x100000000 elsewhere
   }

   // Particle class
   class Particle {
     constructor(x, y, species, vx, vy) {
       this.x = x; this.y = y; this.species = species; this.vx = vx; this.vy = vy;
       this.forceX = 0; this.forceY = 0;
       // vitality for "alive" feel
       this.vitality = 0.5;
     }
   }

   // Signed matrix: matrix[from][to] is coefficient for force from 'to' on 'from'? 
   // Particle life: every frame each particle sums a per-pair force from neighbours within radius.
   // Coefficients are asymmetric: A→B may differ from B→A.
   // So matrix[speciesA][speciesB] = coefficient for force exerted by a speciesB particle on a speciesA particle.
   // The force direction is from A to B? Or from B to A? Typically particle life: force on particle i from particle j is coefficient * direction. I'll define: force vector from j to i is matrix[species_i][species_j] * direction(i-j). Or maybe matrix[species_j][species_i]. I need to be consistent.
   // Let's say: for particle i with species s_i, particle j with species s_j, the force on i due to j is: coeff = matrix[s_i][s_j]; direction = (j.pos - i.pos) normalized; force = coeff * direction. If coeff > 0, attraction; if < 0, repulsion. Asymmetric means matrix[s_i][s_j] != matrix[s_j][s_i].

   // Initialization function
   function initSimulation(seed, mode) {
     prng = mulberry32(seed);
     particles = [];
     matrix = // mode-dependent
     // create particles with random positions within canvas, random velocities, species assignment
     // reset forces
   }

   // Update function
   function updateParticles() {
     // for each particle, sum forces from neighbors within radius
     // clear forces
     // for each pair i,j within radius: compute dx, dy, dist; if dist < radius and dist > 0:
     //   coeff = matrix[particles[i].species][particles[j].species];
     //   invDist = 1 / dist; // or 1/dist^2? particle life usually uses 1/dist or similar.
     //   fx = coeff * (dx * invDist) ? Actually need a force model. Classic particle life uses a potential: F = coeff * (1 - dist/radius) or just coeff / dist. I'll implement a simple: force magnitude = coeff / (dist + 0.1), direction from i to j or j to i.
     //   add to particles[i].forceX, particles[i].forceY
     // then apply forces: particles[i].vx += fx * DT; particles[i].vy += fy * DT; // simple integration
     // then update positions: particles[i].x += particles[i].vx * DT; particles[i].y += particles[i].vy * DT;
     // wrap around canvas or bounce
     // update vitality based on force magnitude
   }

   // Render function
   function renderParticles(ctx) {
     ctx.clearRect(0, 0, width, height);
     // apply perspective: y *= 1 / (1 + particles[i].y / depth) or something for 3D feel
     // draw circles with color based on species and vitality
   }

   // Main loop
   function loop() {
     updateParticles();
     renderParticles(ctx);
     requestAnimationFrame(loop);
   }

   // UI handlers
   document.getElementById('reset').addEventListener('click', () => { ... })
   document.getElementById('doorA').addEventListener('click', () => { initSimulation(newSeed, 'order') })
   document.getElementById('doorB').addEventListener('click', () => { initSimulation(newSeed, 'chaos') })

   // Seed display
   // etc.