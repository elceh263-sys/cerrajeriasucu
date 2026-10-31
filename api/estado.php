<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/firebase.php';


if (!isset($_SESSION['clienteid'])) {

    http_response_code(401);

    echo json_encode([
        'error' => 'No existe una consulta activa'
    ]);

    exit;
}


$clienteid = $_SESSION['clienteid'];


try {

    $sectionVisible = $database
        ->getReference(
            '1/' .
            $clienteid .
            '/sectionVisible'
        )
        ->getValue();

} catch (Throwable $e) {

    error_log(
        'ESTADO FIREBASE ERROR: ' .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'error' => 'No fue posible consultar el estado',
        'detalle' => $e->getMessage()
    ]);

    exit;
}


echo json_encode([
    'ok' => true,
    'clienteid' => $clienteid,
    'sectionVisible' => $sectionVisible
]);