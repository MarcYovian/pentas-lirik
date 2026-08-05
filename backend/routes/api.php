<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - PentasLirik V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public Live State Synchronization Route (for OBS Browser Source load)
    Route::get('/state/live', [\App\Http\Controllers\Api\V1\LiveControlController::class, 'getLiveState']);
    Route::get('/live/state', [\App\Http\Controllers\Api\V1\LiveControlController::class, 'getLiveState']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Live Control API (Operator actions)
        Route::post('/live/display', [\App\Http\Controllers\Api\V1\LiveControlController::class, 'display']);
        Route::post('/live/clear', [\App\Http\Controllers\Api\V1\LiveControlController::class, 'clear']);

        // Songs & Lyrics Management API
        Route::apiResource('songs', \App\Http\Controllers\Api\V1\SongController::class);

        // Setlists & Items Management API
        Route::apiResource('setlists', \App\Http\Controllers\Api\V1\SetlistController::class);
        Route::post('/setlists/{setlist}/items', [\App\Http\Controllers\Api\V1\SetlistController::class, 'addItem']);
        Route::delete('/setlists/{setlist}/items/{itemId}', [\App\Http\Controllers\Api\V1\SetlistController::class, 'removeItem']);
        Route::put('/setlists/{setlist}/reorder', [\App\Http\Controllers\Api\V1\SetlistController::class, 'reorder']);

        // Admin Only User Management API
        Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class)->middleware('role:ADMIN');

        // Protected test routes for role-based access control
        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Welcome Admin']);
        })->middleware('role:ADMIN');

        Route::get('/operator/dashboard', function () {
            return response()->json(['message' => 'Welcome Operator/Admin']);
        })->middleware('role:ADMIN,OPERATOR');
    });
});
