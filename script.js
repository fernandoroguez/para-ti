/* ============================================================
   CONFIGURACIÓN
============================================================ */

/*
    ============================================================
    MENSAJE FINAL
    ============================================================

    CAMBIA SOLAMENTE ESTA VARIABLE para poner tu mensaje.
*/
const mensaje = "Es una pena no poder comprarte flores, pero eso no significa que no te ame, te amo más que a nada, muchisimas gracias por aparecer en mi vida";


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
    heartDuration: 3200,

    // Espera antes de mostrar el mensaje final
    messageDelay: 500
};


/*
    Colores principales.
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
*/
function animateValue(
    duration,
    update,
    easing = easeInOutCubic
) {

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
    Movimiento suave de llegada.
*/
function easeOutQuart(t) {

    return 1 - Math.pow(1 - t, 4);
}


/* ============================================================
   PREPARACIÓN DE LA FLOR
============================================================ */

function prepareFlower() {

    /*
        TALLO
    */

    const stemLength = stem.getTotalLength();

    stem.style.strokeDasharray = stemLength;
    stem.style.strokeDashoffset = stemLength;


    /*
        HOJAS
    */

    leafLeft.style.opacity = "0";
    leafRight.style.opacity = "0";

    leafLeft.style.transformOrigin = "100% 100%";
    leafRight.style.transformOrigin = "0% 100%";

    leafLeft.style.transform = "scale(0)";
    leafRight.style.transform = "scale(0)";


    /*
        PÉTALOS
    */

    const petals = [
        petalLeft,
        petalCenter,
        petalRight,
        petalFront
    ];

    petals.forEach(petal => {

        petal.style.opacity = "0";

        petal.style.transformBox =
            "fill-box";

        petal.style.transformOrigin =
            "center bottom";

        petal.style.transform =
            "scaleY(.15) scaleX(.5)";
    });


    flowerGlow.style.opacity = "0";
}


/* ============================================================
   PARTÍCULAS
============================================================ */

function createParticle() {

    const particle =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    const angle =
        Math.random() * Math.PI * 2;


    const distance =
        65 + Math.random() * 85;


    const x =
        200 +
        Math.cos(angle) *
        distance;


    const y =
        230 +
        Math.sin(angle) *
        distance;


    const size =
        .7 +
        Math.random() * 1.8;


    particle.setAttribute(
        "cx",
        x
    );

    particle.setAttribute(
        "cy",
        y
    );

    particle.setAttribute(
        "r",
        size
    );


    particle.setAttribute(
        "fill",
        Math.random() > .5
            ? COLORS.gold
            : COLORS.goldLight
    );


    particle.classList.add(
        "magic-particle"
    );


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


    particles.appendChild(
        particle
    );


    setTimeout(() => {

        particle.remove();

    }, 2500);
}


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

        clearInterval(
            particleInterval
        );

        particleInterval = null;
    }
}


/* ============================================================
   FASE 1 — TALLO
============================================================ */

async function growStem() {

    const length =
        stem.getTotalLength();


    await animateValue(

        CONFIG.stemDuration,

        progress => {

            stem.style.strokeDashoffset =
                length *
                (1 - progress);
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

            leafLeft.style.opacity =
                progress;

            leafRight.style.opacity =
                progress;


            const scale =
                0.05 +
                progress *
                0.95;


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


    for (
        let i = 0;
        i < petals.length;
        i++
    ) {

        const petal =
            petals[i];


        await animateValue(

            CONFIG.petalsDuration / 4,

            progress => {

                petal.style.opacity =
                    progress;


                const scaleY =
                    .15 +
                    progress *
                    .85;


                const scaleX =
                    .5 +
                    progress *
                    .5;


                petal.style.transform =
                    `
                    scaleY(${scaleY})
                    scaleX(${scaleX})
                    `;
            }
        );
    }


    await animateValue(

        900,

        progress => {

            flowerGlow.style.opacity =
                progress *
                .22;
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

    await wait(
        CONFIG.flowerPause
    );

    flowerFinished = true;

    stopParticles();

    touchMessage.classList.add(
        "visible"
    );
}


/* ============================================================
   CAMBIAR PANTALLA INICIAL
============================================================ */

async function startExperience() {

    if (experienceStarted) {
        return;
    }

    experienceStarted = true;


    magicText.style.opacity =
        "0";

    magicText.style.transform =
        "scale(.9)";


    await wait(700);


    intro.classList.remove(
        "active"
    );


    flowerScene.classList.add(
        "active"
    );


    await wait(500);


    createFlower();
}


/* ============================================================
   🌷 → ❤️
   
   TRANSFORMACIÓN MEDIANTE MUCHOS PÉTALOS
============================================================ */

async function transformFlowerIntoHeart() {

    if (
        transformationStarted ||
        !flowerFinished
    ) {
        return;
    }

    transformationStarted = true;


    /*
        Quitamos "Tócame".
    */

    touchMessage.classList.remove(
        "visible"
    );


    flowerSvg.classList.add(
        "heart-mode"
    );


    /* ========================================================
       CONFIGURACIÓN
    ======================================================== */

    /*
        Número de pétalos que formarán el corazón.

        Puedes probar:

        40 = menos pétalos
        52 = recomendado
        65 = corazón muy definido
        80 = muy denso
    */

    const HEART_PETAL_COUNT = 52;


    /*
        Tamaño del corazón.

        Aumenta este número para hacerlo más grande.
    */

    const HEART_SCALE = 7.0;


    /*
        Posición del corazón dentro del SVG.
    */

    const HEART_CENTER_X = 200;

    const HEART_CENTER_Y = 315;


    /*
        Duración total.
    */

    const DURATION =
        Math.max(
            CONFIG.heartDuration,
            3200
        );


    /* ========================================================
       CONTENEDOR DE LOS PÉTALOS
    ======================================================== */

    const heartGroup =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );


    heartGroup.setAttribute(
        "id",
        "petalHeart"
    );


    /*
        Lo ponemos encima de la flor.
    */

    flowerSvg.appendChild(
        heartGroup
    );


    /* ========================================================
       FUNCIÓN QUE GENERA LA SILUETA
       DEL CORAZÓN
    ======================================================== */

    function heartPoint(
        t,
        scale = HEART_SCALE
    ) {

        /*
            Fórmula matemática del corazón.
        */

        const x =
            16 *
            Math.pow(
                Math.sin(t),
                3
            );


        const y =
            13 *
            Math.cos(t)

            -
            5 *
            Math.cos(
                2 * t
            )

            -
            2 *
            Math.cos(
                3 * t
            )

            -
            Math.cos(
                4 * t
            );


        return {

            x:
                HEART_CENTER_X +
                x * scale,

            y:
                HEART_CENTER_Y -
                y * scale
        };
    }


    /* ========================================================
       CREAR LAS COPIAS
    ======================================================== */

    const originals = [

        petalLeft,
        petalCenter,
        petalRight,
        petalFront

    ];


    const heartPetals = [];


    for (
        let i = 0;
        i < HEART_PETAL_COUNT;
        i++
    ) {

        /*
            Posición del pétalo sobre
            la curva del corazón.
        */

        const t =
            (
                Math.PI *
                2 *
                i
            ) /
            HEART_PETAL_COUNT;


        const target =
            heartPoint(t);


        /*
            Siguiente punto.

            Sirve para orientar cada pétalo
            siguiendo la curva.
        */

        const nextT =
            t +
            (
                Math.PI *
                2 /
                HEART_PETAL_COUNT
            ) *
            .7;


        const next =
            heartPoint(nextT);


        const angle =
            Math.atan2(

                next.y -
                target.y,

                next.x -
                target.x

            ) *
            180 /
            Math.PI;


        /*
            Elegimos uno de los cuatro
            pétalos originales.
        */

        const original =
            originals[
                i %
                originals.length
            ];


        /*
            COPIAMOS EL PÉTALO REAL.
        */

        const clone =
            original.cloneNode(
                true
            );


        /*
            Eliminamos el ID para no duplicarlo.
        */

        clone.removeAttribute(
            "id"
        );


        clone.classList.add(
            "heart-petal"
        );


        /*
            Tamaño de cada pétalo.

            Pequeñas variaciones aleatorias.
        */

        const scale =
            .13 +
            Math.random() *
            .055;


        /*
            Todos comienzan aproximadamente
            desde el centro de la flor.
        */

        const startX = 200;

        const startY = 200;


        /*
            No llegan todos a la vez.
        */

        const delay =
            (
                i /
                HEART_PETAL_COUNT
            ) *
            850

            +

            Math.random() *
            120;


        clone.style.opacity =
            "0";


        heartGroup.appendChild(
            clone
        );


        heartPetals.push({

            element:
                clone,

            startX:
                startX,

            startY:
                startY,

            targetX:
                target.x,

            targetY:
                target.y,

            angle:
                angle,

            scale:
                scale,

            delay:
                delay
        });
    }


    /* ========================================================
       RECOGER FLOR ORIGINAL
    ======================================================== */

    const originalPetals = [

        petalLeft,
        petalCenter,
        petalRight,
        petalFront

    ];


    animateValue(

        DURATION * .52,

        progress => {

            const scale =
                1 -
                progress *
                .72;


            const y =
                progress *
                38;


            const rotate =
                progress *
                8;


            originalPetals.forEach(

                (
                    petal,
                    index
                ) => {

                    const extraX =
                        index === 0
                            ? -4
                            :
                        index === 2
                            ? 4
                            :
                            0;


                    petal.style.transform =
                        `
                        translate(
                            ${extraX}px,
                            ${y}px
                        )
                        rotate(${rotate}deg)
                        scale(${scale})
                        `;


                    petal.style.opacity =
                        1 -
                        progress;
                }
            );


            /*
                TALLO
            */

            stem.style.transform =
                `
                translateY(
                    ${progress * 75}px
                )
                scaleY(
                    ${1 - progress * .82}
                )
                `;


            stem.style.opacity =
                1 -
                progress;


            /*
                HOJA IZQUIERDA
            */

            leafLeft.style.transform =
                `
                translate(
                    ${-progress * 32}px,
                    ${progress * 45}px
                )
                rotate(
                    ${-progress * 55}deg
                )
                scale(
                    ${1 - progress * .65}
                )
                `;


            /*
                HOJA DERECHA
            */

            leafRight.style.transform =
                `
                translate(
                    ${progress * 32}px,
                    ${progress * 45}px
                )
                rotate(
                    ${progress * 55}deg
                )
                scale(
                    ${1 - progress * .65}
                )
                `;


            leafLeft.style.opacity =
                1 -
                progress;


            leafRight.style.opacity =
                1 -
                progress;
        },

        easeInOutCubic
    );


    /* ========================================================
       HACER VIAJAR LOS PÉTALOS
       HACIA EL CORAZÓN
    ======================================================== */

    const animations =
        heartPetals.map(
            data => {

                return new Promise(
                    resolve => {

                        setTimeout(
                            () => {

                                animateValue(

                                    DURATION *
                                    .82,

                                    progress => {

                                        /*
                                            Movimiento X.
                                        */

                                        const x =
                                            data.startX +

                                            (
                                                data.targetX -
                                                data.startX
                                            ) *
                                            progress;


                                        /*
                                            Movimiento Y.
                                        */

                                        const y =
                                            data.startY +

                                            (
                                                data.targetY -
                                                data.startY
                                            ) *
                                            progress;


                                        /*
                                            Pequeña curva
                                            durante el vuelo.
                                        */

                                        const curve =
                                            Math.sin(
                                                progress *
                                                Math.PI
                                            ) *
                                            16;


                                        /*
                                            Escala.
                                        */

                                        const currentScale =
                                            data.scale *
                                            (
                                                1.25 -
                                                .25 *
                                                easeOutQuart(
                                                    progress
                                                )
                                            );


                                        /*
                                            Rotación.
                                        */

                                        const rotation =
                                            data.angle *
                                            progress;


                                        /*
                                            Aparición.
                                        */

                                        data.element.style.opacity =
                                            Math.min(
                                                1,
                                                progress *
                                                2.2
                                            );


                                        /*
                                            Posición final.
                                        */

                                        data.element.style.transform =
                                            `
                                            translate(
                                                ${x - 200}px,
                                                ${y - 200 + curve}px
                                            )

                                            rotate(
                                                ${rotation}deg
                                            )

                                            scale(
                                                ${currentScale}
                                            )
                                            `;
                                    },

                                    easeOutQuart

                                ).then(
                                    resolve
                                );

                            },

                            data.delay
                        );
                    }
                );
            }
        );


    /* ========================================================
       BRILLO
    ======================================================== */

    animateValue(

        DURATION,

        progress => {

            flowerGlow.style.opacity =
                .22 *
                (
                    1 -
                    progress
                );
        }
    );


    /* ========================================================
       ESPERAR A QUE TODOS LOS PÉTALOS
       TERMINEN
    ======================================================== */

    await Promise.all(
        animations
    );


    await wait(250);


    /* ========================================================
       DESTELLO FINAL
    ======================================================== */

    heartPetals.forEach(
        data => {

            data.element.style.filter =
                `
                drop-shadow(
                    0 0 4px
                    rgba(
                        255,
                        225,
                        70,
                        .45
                    )
                )
                `;
        }
    );


    await wait(350);


    /*
        CORAZÓN TERMINADO.
    */

    showFinalMessage();
}


/* ============================================================
   MENSAJE FINAL
============================================================ */

function showFinalMessage() {

    /*
        textContent permite que el mensaje sea seguro.

        Puedes utilizar \n para varias líneas.
    */

    finalMessage.textContent =
        mensaje;


    finalMessage.classList.add(
        "visible"
    );
}


/* ============================================================
   INTERACCIÓN INICIAL
============================================================ */

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
