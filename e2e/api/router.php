<?php

// Router for `php -S`, run from the API's public/ folder. It lets a test pin the API's clock
// by writing a date to E2E_NOW_FILE, then hands the request to Laravel's own dev-server router.

$nowFile = getenv('E2E_NOW_FILE');

if ($nowFile && is_file($nowFile)) {
    require getcwd().'/../vendor/autoload.php';
    Illuminate\Support\Carbon::setTestNow(trim(file_get_contents($nowFile)));
}

return require getcwd().'/../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php';
