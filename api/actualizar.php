<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/firebase.php';


/*
|--------------------------------------------------------------------------
| VERIFICAR SESIÓN
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['clienteid'])) {

    http_response_code(401);

    echo json_encode([
        'error' => 'No existe una consulta activa'
    ]);

    exit;
}

$clienteid = $_SESSION['clienteid'];


/*
|--------------------------------------------------------------------------
| RECIBIR JSON
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


/*
|--------------------------------------------------------------------------
| CAMPOS QUE EL CLIENTE PUEDE MODIFICAR
|--------------------------------------------------------------------------
*/

$camposPermitidos = [
    'domicilion',
    'norinvalida',
    'color',
    'sectionVisible'
];

$datos = [];


foreach ($camposPermitidos as $campo) {

    if (array_key_exists($campo, $body)) {

        $valor = $body[$campo];

        if (
            !is_string($valor) &&
            !is_numeric($valor)
        ) {
            continue;
        }

        $valor = trim((string)$valor);

        if (strlen($valor) > 100) {
            continue;
        }

        $datos[$campo] = $valor;
    }
}


/*
|--------------------------------------------------------------------------
| EVITAR ACTUALIZACIONES VACÍAS
|--------------------------------------------------------------------------
*/

if (empty($datos)) {

    http_response_code(400);

    echo json_encode([
        'error' => 'No hay datos válidos para actualizar'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| ACTUALIZAR FIREBASE
|--------------------------------------------------------------------------
*/

try {

    $database
        ->getReference(
            '1/' . $clienteid
        )
        ->update($datos);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'error' => $e->getMessage()
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| RESPUESTA
|--------------------------------------------------------------------------
*/

echo json_encode([
    'ok' => true
]);