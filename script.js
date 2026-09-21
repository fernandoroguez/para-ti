/* ============================================================
   CONFIGURACIÓN
============================================================ */

/*
    ============================================================
    MENSAJE FINAL
    ============================================================

    CAMBIA SOLAMENTE ESTA VARIABLE para poner tu mensaje.
*/
const mensaje = "TU MENSAJE AQUÍ";


/*
    Texto de la pantalla inicial.
*/
const TEXTO_INICIAL = "Toca aquí para la magia";


/*
    Texto que aparece debajo de la flor.
*/
const TEXTO_TOCA = "Tócame";


/*
    ============================================================
    TIEMPOS DE ANIMACIÓN
    ============================================================

    Todos están en milisegundos.
*/
const CONFIG = {

    // Duración de crecimiento del tallo
    stemDuration: 1800,

    // Duración de aparición de las hojas
    leavesDuration: 1200,

    // Duración de creación de los pétalos
    petalsDuration: 2200,

    // Tiempo que dejamos contemplar la flor
    flowerPause: 900,

    // Transformación flor -> corazón
    heartDuration: 2800,

    // Espera antes de mostrar el mensaje final
    messageDelay: 500
};


/*
    Colores principales.
    Puedes modificarlos fácilmente.
*/
const COLORS = {

    gold: "#ffe04a",
    goldLight: "#fff59d",
    green: "#4f8d4a"
};


/* ============================================================
   ELEMENTOS
============================================================ */

const intro = document.getElementById("intro");
const magicText = document.getElementById("magicText");

const flowerScene = document.getElementById("flowerScene");
const flowerSvg = document.getElementById("flowerSvg");

const flower = document.getElementById("flower");

const stem = document.getElementById("stem");

const leafLeft = document.getElementById("leafLeft");
const leafRight = document.getElementById("leafRight");

const petalLeft = document.getElementById("petalLeft");
const petalCenter = document.getElementById("petalCenter");
const petalRight = document.getElementById("petalRight");
const petalFront = document.getElementById("petalFront");

const flowerGlow = document.getElementById("flowerGlow");

const touchMessage = document.getElementById("touchMessage");

const finalMessage = document.getElementById("finalMessage");

const particles = document.getElementById("particles");


/* ============================================================
   ESTADO
============================================================ */

let experienceStarted = false;
let flowerFinished = false;
let transformationStarted = false;


/* ============================================================
   UTILIDADES
============================================================ */

function wait(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


/*
    Animación mediante requestAnimationFrame.

    Permite hacer movimientos muy fluidos sin depender
    de librerías externas.
*/
function animateValue(duration, update, easing = easeInOutCubic) {

    return new Promise(resolve => {

        const start = performance.now();

        function frame(now) {

            const elapsed = now - start;

            let progress = Math.min(
                elapsed / duration,
                1
            );

            progress = easing(progress);

            update(progress);

            if (elapsed < duration) {

                requestAnimationFrame(frame);

            } else {

                update(1);

                resolve();
            }
        }

        requestAnimationFrame(frame);
    });
}


/*
    Movimiento suave.
*/
function easeInOutCubic(t) {

    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}


/*
    Movimiento muy suave para las transformaciones finales.
*/
function easeOutQuart(t) {

    return 1 - Math.pow(1 - t, 4);
}


/* ============================================================
   PREPARACIÓN DE LA FLOR
============================================================ */

function prepareFlower() {

    /*
        El tallo empieza prácticamente invisible.
    */

    const stemLength = stem.getTotalLength();

    stem.style.strokeDasharray = stemLength;
    stem.style.strokeDashoffset = stemLength;


    /*
        Hojas ocultas.
    */

    leafLeft.style.opacity = "0";
    leafRight.style.opacity = "0";

    leafLeft.style.transformOrigin = "100% 100%";
    leafRight.style.transformOrigin = "0% 100%";

    leafLeft.style.transform = "scale(0)";
    leafRight.style.transform = "scale(0)";


    /*
        Pétalos empiezan pequeños y transparentes.
    */

    const petals = [
        petalLeft,
        petalCenter,
        petalRight,
        petalFront
    ];

    petals.forEach(petal => {

        petal.style.opacity = "0";
        petal.style.transformBox = "fill-box";
        petal.style.transformOrigin = "center bottom";
        petal.style.transform = "scaleY(.15) scaleX(.5)";
    });


    flowerGlow.style.opacity = "0";
}


/* ============================================================
   PARTÍCULAS
============================================================ */

function createParticle() {

    const particle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    );

    /*
        Las partículas aparecen alrededor del centro
        de la flor.
    */

    const angle = Math.random() * Math.PI * 2;

    const distance =
        65 + Math.random() * 85;

    const x =
        200 + Math.cos(angle) * distance;

    const y =
        230 + Math.sin(angle) * distance;

    const size =
        .7 + Math.random() * 1.8;

    particle.setAttribute("cx", x);
    particle.setAttribute("cy", y);
    particle.setAttribute("r", size);

    particle.setAttribute(
        "fill",
        Math.random() > .5
            ? COLORS.gold
            : COLORS.goldLight
    );

    particle.classList.add("magic-particle");

    particle.style.setProperty(
        "--dx",
        `${(Math.random() - .5) * 60}px`
    );

    particle.style.setProperty(
        "--dy",
        `${-30 - Math.random() * 80}px`
    );

    particle.style.setProperty(
        "--duration",
        `${1200 + Math.random() * 1200}ms`
    );

    particles.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 2500);
}


/*
    Crea partículas continuamente mientras se construye la flor.
*/
let particleInterval = null;

function startParticles() {

    particleInterval = setInterval(() => {

        if (!flowerFinished) {

            createParticle();

        }

    }, 160);
}


function stopParticles() {

    if (particleInterval) {

        clearInterval(particleInterval);

        particleInterval = null;
    }
}


/* ============================================================
   FASE 1 — TALLO
============================================================ */

async function growStem() {

    const length = stem.getTotalLength();

    await animateValue(
        CONFIG.stemDuration,
        progress => {

            stem.style.strokeDashoffset =
                length * (1 - progress);

        }
    );
}


/* ============================================================
   FASE 2 — HOJAS
============================================================ */

async function growLeaves() {

    await animateValue(
        CONFIG.leavesDuration,
        progress => {

            leafLeft.style.opacity = progress;
            leafRight.style.opacity = progress;

            /*
                Las hojas nacen desde el tallo.
            */

            const scale =
                0.05 + progress * 0.95;

            leafLeft.style.transform =
                `scale(${scale})`;

            leafRight.style.transform =
                `scale(${scale})`;
        }
    );
}


/* ============================================================
   FASE 3 — PÉTALOS
============================================================ */

async function growPetals() {

    const petals = [
        petalLeft,
        petalCenter,
        petalRight,
        petalFront
    ];


    /*
        Cada pétalo aparece ligeramente después
        del anterior.
    */

    for (let i = 0; i < petals.length; i++) {

        const petal = petals[i];

        await animateValue(
            CONFIG.petalsDuration / 4,
            progress => {

                petal.style.opacity = progress;

                /*
                    Efecto de "abrirse".
                */

                const scaleY =
                    .15 + progress * .85;

                const scaleX =
                    .5 + progress * .5;

                petal.style.transform =
                    `scaleY(${scaleY})
                     scaleX(${scaleX})`;
            }
        );
    }


    /*
        Brillo interior.
    */

    await animateValue(
        900,
        progress => {

            flowerGlow.style.opacity =
                progress * .22;
        }
    );
}


/* ============================================================
   CREACIÓN COMPLETA DE LA FLOR
============================================================ */

async function createFlower() {

    prepareFlower();

    startParticles();

    await growStem();

    await growLeaves();

    await growPetals();

    await wait(CONFIG.flowerPause);

    flowerFinished = true;

    stopParticles();

    /*
        El mensaje aparece únicamente cuando
        la flor ya está terminada.
    */

    touchMessage.classList.add("visible");
}


/* ============================================================
   CAMBIAR PANTALLA INICIAL
============================================================ */

async function startExperience() {

    if (experienceStarted) {
        return;
    }

    experienceStarted = true;

    /*
        Desaparece el texto.
    */

    magicText.style.opacity = "0";
    magicText.style.transform = "scale(.9)";

    await wait(700);

    /*
        Ocultamos completamente la intro.
    */

    intro.classList.remove("active");

    /*
        Mostramos la escena.
    */

    flowerScene.classList.add("active");

    await wait(500);

    /*
        Empieza la construcción.
    */

    createFlower();
}


/* ============================================================
   TRANSFORMACIÓN FLOR -> CORAZÓN
============================================================ */

/*
    Esta es la parte más importante.

    No creamos otro corazón.

    Los mismos elementos de la flor se reorganizan:

        - pétalo izquierdo  -> lóbulo izquierdo
        - pétalo derecho    -> lóbulo derecho
        - pétalo central    -> parte superior/central
        - pétalo frontal    -> parte inferior
        - hojas             -> laterales/inferiores
        - tallo             -> eje inferior

    De esta manera se conserva la sensación de que la flor
    realmente se está convirtiendo en el corazón.
*/


function transformFlowerIntoHeart() {

    if (transformationStarted || !flowerFinished) {
        return;
    }

    transformationStarted = true;

    touchMessage.classList.remove("visible");

    flowerSvg.classList.add("heart-mode");


    /*
        Ocultamos progresivamente el brillo.
    */

    animateValue(
        CONFIG.heartDuration,
        progress => {

            flowerGlow.style.opacity =
                Math.max(
                    0,
                    .22 * (1 - progress)
                );
        }
    );


    /*
        ========================================================
        PETALOS
        ========================================================

        En lugar de desaparecer, cada pétalo cambia:

        posición
        escala
        rotación

        para construir la silueta del corazón.
    */

    const startTransforms = {

        left: {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0
        },

        center: {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0
        },

        right: {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0
        },

        front: {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0
        }
    };


    /*
        Posiciones finales.

        Están calculadas para que los pétalos continúen
        formando una masa amarilla reconocible.
    */

    const targets = {

        left: {
            x: -55,
            y: 30,
            scale: .68,
            rotate: -27
        },

        center: {
            x: 0,
            y: 82,
            scale: .72,
            rotate: 180
        },

        right: {
            x: 55,
            y: 30,
            scale: .68,
            rotate: 27
        },

        front: {
            x: 0,
            y: 90,
            scale: .82,
            rotate: 180
        }
    };


    function animatePetal(
        element,
        start,
        target
    ) {

        return animateValue(
            CONFIG.heartDuration,
            progress => {

                const x =
                    start.x +
                    (target.x - start.x) *
                    progress;

                const y =
                    start.y +
                    (target.y - start.y) *
                    progress;

                const scale =
                    start.scale +
                    (target.scale - start.scale) *
                    progress;

                const rotate =
                    start.rotate +
                    (target.rotate - start.rotate) *
                    progress;

                element.style.transform =
                    `translate(${x}px, ${y}px)
                     rotate(${rotate}deg)
                     scale(${scale})`;
            },
            easeInOutCubic
        );
    }


    /*
        Ejecutamos simultáneamente todos los pétalos.
    */

    const animations = [

        animatePetal(
            petalLeft,
            startTransforms.left,
            targets.left
        ),

        animatePetal(
            petalCenter,
            startTransforms.center,
            targets.center
        ),

        animatePetal(
            petalRight,
            startTransforms.right,
            targets.right
        ),

        animatePetal(
            petalFront,
            startTransforms.front,
            targets.front
        )
    ];


    /*
        ========================================================
        HOJAS
        ========================================================

        Las hojas se acercan al cuerpo del corazón.
    */

    const leafAnimation = animateValue(
        CONFIG.heartDuration,
        progress => {

            /*
                Izquierda
            */

            const leftX =
                -65 * progress;

            const leftY =
                20 * progress;

            const leftScale =
                1 - .55 * progress;

            const leftRotation =
                0 - 55 * progress;

            leafLeft.style.transform =
                `translate(${leftX}px, ${leftY}px)
                 rotate(${leftRotation}deg)
                 scale(${leftScale})`;


            /*
                Derecha
            */

            const rightX =
                65 * progress;

            const rightY =
                20 * progress;

            const rightScale =
                1 - .55 * progress;

            const rightRotation =
                0 + 55 * progress;

            leafRight.style.transform =
                `translate(${rightX}px, ${rightY}px)
                 rotate(${rightRotation}deg)
                 scale(${rightScale})`;


            /*
                Poco a poco las hojas se integran
                en el dorado del corazón.
            */

            const opacity =
                1 - progress * .55;

            leafLeft.style.opacity = opacity;
            leafRight.style.opacity = opacity;
        },
        easeInOutCubic
    );


    /*
        ========================================================
        TALLO
        ========================================================

        El tallo se recoge hacia el centro.

        No desaparece inmediatamente.
    */

    const stemAnimation = animateValue(
        CONFIG.heartDuration,
        progress => {

            const y =
                75 * progress;

            const scale =
                1 - .65 * progress;

            const rotation =
                -progress * 180;

            stem.style.transform =
                `translateY(${y}px)
                 rotate(${rotation}deg)
                 scaleY(${scale})`;

            /*
                El verde se va atenuando.
            */

            stem.style.opacity =
                1 - progress * .85;
        },
        easeOutQuart
    );


    /*
        ========================================================
        ESPERA A QUE TERMINE TODO
        ========================================================
    */

    Promise.all([
        ...animations,
        leafAnimation,
        stemAnimation
    ]).then(async () => {

        await wait(CONFIG.messageDelay);

        showFinalMessage();
    });
}


/* ============================================================
   MENSAJE FINAL
============================================================ */

function showFinalMessage() {

    /*
        Inserta el mensaje.

        white-space pre-line permite utilizar \n
        para crear varias líneas.
    */

    finalMessage.textContent = mensaje;

    finalMessage.classList.add("visible");
}


/* ============================================================
   INTERACCIÓN INICIAL
============================================================ */

/*
    pointerdown funciona tanto para:

        - dedo
        - ratón
        - stylus

    y evita tener que crear eventos diferentes.
*/

intro.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        startExperience();
    },
    {
        passive: false
    }
);


/* ============================================================
   INTERACCIÓN CON LA FLOR
============================================================ */

flowerSvg.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        transformFlowerIntoHeart();
    },
    {
        passive: false
    }
);


/* ============================================================
   INICIO
============================================================ */

prepareFlower();
