<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';

use Kreait\Firebase\Factory;


/*
|--------------------------------------------------------------------------
| CREDENCIAL PRIVADA
|--------------------------------------------------------------------------
*/

$serviceAccountPath =
    dirname(__DIR__) . '/firebase-secrets/firebase-admin.json';


if (!file_exists($serviceAccountPath)) {

    throw new Exception(
        'No se encontró la credencial de Firebase en: ' .
        $serviceAccountPath
    );
}


/*
|--------------------------------------------------------------------------
| FIREBASE ADMIN
|--------------------------------------------------------------------------
*/

$factory = (new Factory)
    ->withServiceAccount($serviceAccountPath)
    ->withDatabaseUri(
        'https://dominicmm10-1d098-default-rtdb.firebaseio.com'
    );


/*
|--------------------------------------------------------------------------
| REALTIME DATABASE
|--------------------------------------------------------------------------
*/

$database = $factory->createDatabase();
$auth = $factory->createAuth();