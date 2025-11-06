const gameContainer = document.getElementById("gameContainer");
const nave = document.getElementById("nave");
let naveX = gameContainer.clientWidth / 2 - 20;
const naveSpeed = 1.5;
let gamePaused = true;

// Creación enemigos

const enemies = [];
const rows = 4, cols = 7;
const enemySpacing = 60;
for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        let enemy = document.createElement("div");
        enemy.classList.add("enemy");
        enemy.style.left = 100 + c * enemySpacing + "px";
        enemy.style.top = 50 + r * enemySpacing + "px";
        gameContainer.appendChild(enemy);
        enemies.push(enemy);
    }
    
}

var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var images = [];
images.length = 3;

//push the images into array
for(var i = 1 ; i < images.length ; i++){
    images[i] = new Image();
    images[i].src = 'sprite/enemy/Result (' + i.toString() + ').png';
}
var i = 1;
setInterval(function(){
    i++;
    if(i >= 4){
        i = 1;
    }
    // Cambiar fondo de los div.enemy
    enemies.forEach(enemy => {
        enemy.style.backgroundImage = `url('${images[i].src}')`;
        enemy.style.backgroundSize = 'contain';
        enemy.style.backgroundRepeat = 'no-repeat';
        enemy.style.backgroundPosition = 'center';
    });

    // También dibuja en el canvas como ya estabas haciendo
    c.clearRect(0, 0, canvas.width, canvas.height); // limpiar canvas

}, 100);


// Movimiento del jugador
const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

function updatePlayer() {
    if (keys["ArrowLeft"] && naveX > 0) naveX -= naveSpeed;
    if (keys["ArrowRight"] && naveX + nave.clientWidth < gameContainer.clientWidth) naveX += naveSpeed;
    nave.style.left = naveX + "px";
}

// Disparo

function checkCollision(a, b) {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();

    return !(
        rectA.top > rectB.bottom ||
        rectA.bottom < rectB.top ||
        rectA.left > rectB.right ||
        rectA.right < rectB.left
    );
}

 const bullets = [];
function shootBullet() {
    
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");

    bullet.style.left = naveX + nave.clientWidth / 2 - 2 + "px"; // -2 para centrar la bala
    bullet.style.bottom = "30px"; // 30px desde la parte inferior del contenedor

    // Agregar bala al contenedor del juego
    gameContainer.appendChild(bullet);

    // Guardar la bala en el arreglo
    bullets.push(bullet);


}

let spacePressed = false;
let canShoot = true; // Controla si se puede disparar
const shootDelay = 500; // Tiempo de espera en milisegundos

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !spacePressed && canShoot) {
    shootBullet();        // dispara la bala
    spacePressed = true;  // bloquea mientras se mantenga presionada
canShoot = false;
    
    setTimeout(() => {
        canShoot = true;
    }, shootDelay );
  }
});

window.addEventListener("keyup", (e) => {
    if (e.code === "Space"){

    spacePressed = false;
    }
});


// Actualizar balas
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        let currentBottom = parseFloat(bullet.style.bottom) || 0;
        bullet.style.bottom = currentBottom + 1 + "px"; // velocidad de la bala

        // Eliminar balas que salen del contenedor
        if (currentBottom > gameContainer.clientHeight) {
            bullet.remove();
            bullets.splice(i, 1);
            continue;
        }

        // Revisar colisión con enemigos
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (checkCollision(bullet, enemy)) {
                // Eliminar enemigo y bala
                enemy.remove();
                bullets[i].remove();

                enemies.splice(j, 1);
                bullets.splice(i, 1);
                  if (enemies.length === 0) {
                    showEndImage("imagen/fondo2.gif" ,"¡Ganaste!","Jugar de nuevo",() => window.location.reload());
                    
                    gameOver = true; // detener el juego
                }
                break; // salir del loop de enemigos para esa bala
            }
        }
    }
}
const enemyBullets = [];
function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        let currentTop = parseFloat(bullet.style.top) || 0; //  asegura número válido
        bullet.style.top = currentTop + 1 + "px"; // mueve la bala hacia abajo

        if (currentTop > gameContainer.clientHeight) {
            bullet.remove();
            enemyBullets.splice(i, 1);
            continue;
        }

        if (checkCollision(bullet, nave)) {
            bullet.remove();
            enemyBullets.splice(i, 1);
           showEndImage("imagen/perder.gif" ,"¡Perdiste!","Jugar de nuevo",() => window.location.reload());
            gameOver = true;
            break;
        }
        
    }
}
 function shootEnemyBullet(enemy) {
    const bullet = document.createElement("div");
bullet.classList.add("enemy-bullet");
bullet.style.position = "absolute"; 

    // Posición inicial de la bala: centro del enemigo
    bullet.style.left = enemy.offsetLeft + enemy.clientWidth / 2 - 2 + "px";
    bullet.style.top = enemy.offsetTop + enemy.clientHeight + "px";

    gameContainer.appendChild(bullet);
    enemyBullets.push(bullet); // guardar bala en el arreglo
}


let enemyDirection = 0.4; // 1 = derecha, -1 = izquierda
let enemyHorizontalSpeed = 0.4; // velocidad horizontal
let enemyVerticalSpeed = 0.1;   // velocidad vertical
let stepDown = 10; // píxeles que bajan cuando cambian de dirección

function enemyShootRandom() {   
    if (enemies.length === 0) return;

    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    shootEnemyBullet(randomEnemy);
}


let enemyShootInterval; // variable para guardar el intervalo

document.getElementById("start-button").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none"; // Oculta el menú
    gamePaused = false; // Reanuda el juego

    // Velocidad Iniciar disparos enemigos
    enemyShootInterval = setInterval(enemyShootRandom, 1000);
});

function updateEnemies() {
    if (gameOver) return;

    let reachedEdge = false;

    for (let enemy of enemies) {
        let currentLeft = parseFloat(enemy.style.left) || 0;
        let currentTop = parseFloat(enemy.style.top) || 0;
        const enemyWidth = enemy.clientWidth;
        const enemyHeight = enemy.clientHeight;

        // Mover horizontalmente
        currentLeft += enemyHorizontalSpeed * enemyDirection;
        enemy.style.left = currentLeft + "px";

        // Verificar si llegó a un borde
        if (currentLeft <= 0 || currentLeft + enemyWidth >= gameContainer.clientWidth) {
            reachedEdge = true;
        }

        // Verificar si llega al borde inferior (fin del juego)
        if (currentTop + enemyHeight + enemyVerticalSpeed >= gameContainer.clientHeight) {
            enemy.style.top = gameContainer.clientHeight - enemyHeight + "px";
            alert("¡Perdiste! Las naves llegaron al final ");
            gameOver = true;
            window.location.reload();
            return;
        }
    }

    // Si alguno tocó un borde, todos bajan y cambian de dirección
    if (reachedEdge) {
        enemyDirection *= -1; // cambiar dirección

        for (let enemy of enemies) {
            let currentTop = parseFloat(enemy.style.top) || 0;
            enemy.style.top = (currentTop + stepDown) + "px";
        }
    }
}


function checkCollision(enemy, nave) {
    const enemyRect = enemy.getBoundingClientRect();
    const naveRect = nave.getBoundingClientRect();

    return !(
        enemyRect.top > naveRect.bottom ||
        enemyRect.bottom < naveRect.top ||
        enemyRect.left > naveRect.right ||
        enemyRect.right < naveRect.left
    );
}
let gameOver = false;

function checkEnemiesCollision() {
    for (let enemy of enemies) {
        if (checkCollision(enemy, nave)) {
            alert("¡Perdiste!");
            gameOver = true;
            window.location.reload();
            break;
        }
    }
}


function showEndImage(src, mensaje, botonTexto, botonAccion) {
    // Crear contenedor para la imagen y el texto
    const container = document.createElement("div");
    container.classList.add("end-container"); //  asigna la clase CSS

    // Crear imagen
    const img = document.createElement("img");
    img.src = src;

    // Crear texto debajo de la imagen
    const text = document.createElement("div");
    text.innerText = mensaje;

    // Crear botón
    const button = document.createElement("button");
    button.innerText = botonTexto;
    button.onclick = botonAccion;

    // Agregar elementos al contenedor
    container.appendChild(img);
    container.appendChild(text);
    container.appendChild(button);

    // Agregar contenedor al juego
    gameContainer.appendChild(container);

    // Detener el juego
    gameOver = true;
}

const musica = new Audio("audio/1.mp3");
musica.loop = true; // Para repetir la música
musica.volume = 0.5; // Volumen (0 a 1)

const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");

// Espera a que el jugador presione "Jugar"
startButton.addEventListener("click", () => {
    startScreen.style.display = "none"; // oculta la pantalla de inicio
    gameLoop(); // inicia el juego
});
document.getElementById("start-button").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none"; // Oculta el menú
    gamePaused = false; // Reanuda el juego
});



//

// Game loop
function gameLoop() {
    if (gameOver) return;
     if (gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    updatePlayer();
    updateBullets();
    
    updateEnemies();
    
    checkEnemiesCollision(); 
    
    requestAnimationFrame(gameLoop);
    updateEnemyBullets(); 
    
}

gameLoop();
