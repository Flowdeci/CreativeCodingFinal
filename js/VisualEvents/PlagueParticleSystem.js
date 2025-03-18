class PlagueParticleSystem {
    constructor(x, y, cityHeight, color) {
        this.x = x;
        this.y = y;
        this.cityHeight = cityHeight
        this.particles = [];
        this.color = color

        this.audio = {
            sick1: new Audio('assets/sounds/sick5.wav'),
            sick2: new Audio('assets/sounds/sick6.wav'),
            sick3: new Audio('assets/sounds/sick7.wav'),
            sick4: new Audio('assets/sounds/sick8.wav'),
        }

       
    }

    emit() {
        for (let i = 0; i < random(10, 30); i++) {
            this.particles.push(new PlagueParticle(this.x, this.y, this.cityHeight, this.color));
        }
    }

    update() {
        //Update and display all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let particle = this.particles[i];
            particle.update();
            particle.render();

            if (particle.lifespan <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }


    updateCityHeight(newHeight) {
        this.cityHeight = newHeight;
    }

    startAudioLoop() {
        this.audioInterval = setInterval(() => {
            const randomAudioKey = `sick${Math.ceil(Math.random() * 4)}`;
            const randomAudio = this.audio[randomAudioKey];

            randomAudio.currentTime = 0;
            randomAudio.play();
        }, 1000);
    }

    // Stop the random audio playback loop
    stopAudioLoop() {
        this.isActive = false; 
        if (this.audioInterval) {
            clearInterval(this.audioInterval);
            this.audioInterval = null;
        }
        Object.values(this.audio).forEach((audio) => {
            audio.pause();
            audio.currentTime = 0; 
        });
    }
}

class PlagueParticle {
    constructor(x, y, cityHeight, color) {
        this.x = x + random(-10, 10);
        this.y = y + random(-10, 10);
        this.z = random(0, 10);;
        this.cityHeight = cityHeight
        this.lifespan = random(255, 750);
        this.color = color;

        const zMin = map(cityHeight, 50, 200, 0.5, 1.5);
        const zMax = map(cityHeight, 50, 200, 1.5, 3.5);

        // Initialize velocity with random values
        this.velocity = createVector(
            random(-3, 3),
            random(-3, 3),
            random(zMin, zMax) //random z velocity with city height influence
        );

        this.angle = random(0, TWO_PI);
        this.angularVelocity = random(-0.05, 0.05);
    }

    update() {
        this.lifespan -= random(1, 4);

        // Swirl particles around the city
        this.angle += this.angularVelocity;
        this.x += cos(this.angle) * 0.5;
        this.y += sin(this.angle) * 0.5;

        // Rise upward and stop near the city's height
        this.z += this.velocity.z;
        this.z = constrain(this.z, 0, this.cityHeight);

        //Gradually slow down the particles
        this.velocity.mult(0.98);
    }

    render() {
        push();
        translate(this.x, this.y, this.z);
        noStroke();

        // Gradually shrink particles as they rise
        const size = map(this.lifespan, 0, 750, 0, 3); // Shrink as lifespan decreases
        fill(red(this.color), green(this.color), blue(this.color), this.lifespan);
        sphere(size); // Render as a shrinking sphere
        pop();

    }


}