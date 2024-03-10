import confettiImage from '../assets/images/confetti.png';

const confetti = {
    defaults: {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['star'],
        colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
        origin: {
            y: 0.4,
        },
    },
    fire () {
        window.confetti({
            ...this.defaults,
            particleCount: 40,
            scalar: 2.2,
            shapes: ['image'],
            shapeOptions: {
                image: [
                    {
                        src: confettiImage,
                        width: 32,
                        height: 32,
                    },
                ],
            },
        });

        window.confetti({
            ...this.defaults,
            particleCount: 10,
            scalar: 1.55,
            shapes: ['circle'],
        });
    },
    start () {
        this.stop();
        this.timeout1 = setTimeout(() => {
            this.fire();
        }, 100);
        this.timeout2 = setTimeout(() => {
            this.fire();
        }, 200);
        this.timeout3 = setTimeout(() => {
            this.fire();
        }, 300);
    },
    stop () {
        clearTimeout(this.timeout1);
        clearTimeout(this.timeout2);
        clearTimeout(this.timeout2);
    },
    timeout1: null,
    timeout2: null,
    timeout3: null,
};

export default confetti;
