<?php

function obtenerIP(): string
{
    // Por ahora NO confiamos en X-Forwarded-For enviado
    // directamente por el visitante.
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}


function verificarRateLimit(
    string $accion,
    int $maxIntentos,
    int $ventanaSegundos
): array {

    $ip = obtenerIP();

    /*
    |--------------------------------------------------------------------------
    | IDENTIFICADOR
    |--------------------------------------------------------------------------
    */

    $identificador = hash(
        'sha256',
        $accion . '|' . $ip
    );


    /*
    |--------------------------------------------------------------------------
    | CARPETA TEMPORAL
    |--------------------------------------------------------------------------
    */

    $directorio =
        sys_get_temp_dir()
        . DIRECTORY_SEPARATOR
        . 'mi_app_rate_limit';


    if (!is_dir($directorio)) {

        mkdir(
            $directorio,
            0700,
            true
        );
    }


    $archivo =
        $directorio
        . DIRECTORY_SEPARATOR
        . $identificador
        . '.json';


    /*
    |--------------------------------------------------------------------------
    | BLOQUEAR ARCHIVO
    |--------------------------------------------------------------------------
    */

    $fp = fopen($archivo, 'c+');

    if ($fp === false) {

        // Si el rate limiter falla, no tumbamos
        // toda la aplicación durante esta primera versión.

        return [
            'permitido' => true,
            'restantes' => $maxIntentos
        ];
    }


    flock($fp, LOCK_EX);


    /*
    |--------------------------------------------------------------------------
    | LEER INTENTOS
    |--------------------------------------------------------------------------
    */

    rewind($fp);

    $contenido =
        stream_get_contents($fp);


    $ahora = time();

    $intentos = [];


    if ($contenido) {

        $datos =
            json_decode(
                $contenido,
                true
            );


        if (
            is_array($datos) &&
            isset($datos['intentos']) &&
            is_array($datos['intentos'])
        ) {

            $intentos =
                $datos['intentos'];
        }
    }


    /*
    |--------------------------------------------------------------------------
    | ELIMINAR INTENTOS VIEJOS
    |--------------------------------------------------------------------------
    */

    $limiteTiempo =
        $ahora - $ventanaSegundos;


    $intentos =
        array_values(
            array_filter(
                $intentos,
                function ($timestamp)
                use ($limiteTiempo) {

                    return
                        $timestamp >
                        $limiteTiempo;
                }
            )
        );


    /*
    |--------------------------------------------------------------------------
    | COMPROBAR LÍMITE
    |--------------------------------------------------------------------------
    */

    if (
        count($intentos) >=
        $maxIntentos
    ) {

        $primerIntento =
            min($intentos);


        $retryAfter =
            ($primerIntento + $ventanaSegundos)
            - $ahora;


        flock($fp, LOCK_UN);

        fclose($fp);


        return [

            'permitido' => false,

            'restantes' => 0,

            'retryAfter' =>
                max(1, $retryAfter)

        ];
    }


    /*
    |--------------------------------------------------------------------------
    | REGISTRAR INTENTO
    |--------------------------------------------------------------------------
    */

    $intentos[] = $ahora;


    rewind($fp);

    ftruncate($fp, 0);


    fwrite(
        $fp,
        json_encode([
            'intentos' => $intentos
        ])
    );


    fflush($fp);

    flock($fp, LOCK_UN);

    fclose($fp);


    return [

        'permitido' => true,

        'restantes' =>
            max(
                0,
                $maxIntentos -
                count($intentos)
            )

    ];
}
