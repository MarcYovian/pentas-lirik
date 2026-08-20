<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DisplaySettingController;
use App\Http\Controllers\Api\V1\LiveControlController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\OrganizationMemberController;
use App\Http\Controllers\Api\V1\SetlistController;
use App\Http\Controllers\Api\V1\SongController;
use App\Http\Controllers\Api\V1\SongSyncController;
use App\Http\Controllers\Api\V1\SuperAdminController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - PentasLirik V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth Routes (Public)
    Route::post('/auth/register', [AuthController::class, 'register'])->name('register');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('login');

    // Public Live State & Display Customization Routes (for OBS Browser Source load)
    Route::get('/state/live', [LiveControlController::class, 'getLiveState']);
    Route::get('/live/state', [LiveControlController::class, 'getLiveState']);
    Route::get('/display/settings', [DisplaySettingController::class, 'show']);
    Route::get('/organizations/public/{organization:slug}', [OrganizationController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        // User Auth & Self-Service Profile API
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'profile']);
        Route::put('/auth/password', [AuthController::class, 'updatePassword']);

        // Organizations Management API
        Route::post('/organizations/join', [OrganizationMemberController::class, 'join']);
        Route::get('/organizations/{organization}/members', [OrganizationMemberController::class, 'index']);
        Route::post('/organizations/{organization}/members', [OrganizationMemberController::class, 'store']);
        Route::patch('/organizations/{organization}/members/{userId}/status', [OrganizationMemberController::class, 'updateStatus']);
        Route::delete('/organizations/{organization}/members/{userId}', [OrganizationMemberController::class, 'destroy']);
        Route::post('/organizations/{organization}/regenerate-invite', [OrganizationMemberController::class, 'regenerateInvite']);

        // Organization Specific Content Endpoints (Songs, Setlists, Presets)
        Route::get('/organizations/{organization}/songs', [OrganizationController::class, 'songs']);
        Route::get('/organizations/{organization}/setlists', [OrganizationController::class, 'setlists']);
        Route::get('/organizations/{organization}/presets', [OrganizationController::class, 'presets']);

        Route::apiResource('organizations', OrganizationController::class)->except(['destroy']);

        // Super Admin Global Server API
        Route::get('/super-admin/stats', [SuperAdminController::class, 'stats']);

        // OBS Display Customization Management API
        Route::put('/display/settings', [DisplaySettingController::class, 'update']);
        Route::get('/display/presets', [DisplaySettingController::class, 'indexPresets']);
        Route::post('/display/presets', [DisplaySettingController::class, 'storePreset']);
        Route::put('/display/presets/{id}', [DisplaySettingController::class, 'updatePreset']);
        Route::post('/display/presets/{id}/activate', [DisplaySettingController::class, 'activatePreset']);
        Route::delete('/display/presets/{id}', [DisplaySettingController::class, 'destroyPreset']);

        // Live Control API (Operator actions)
        Route::post('/live/display', [LiveControlController::class, 'display']);
        Route::post('/live/send-lyric', [LiveControlController::class, 'display']);
        Route::post('/live/clear', [LiveControlController::class, 'clear']);

        // Songs & Lyrics Management API
        Route::post('/songs/sync-remote', [SongSyncController::class, 'sync']);
        Route::apiResource('songs', SongController::class);

        // Setlists & Items Management API
        Route::apiResource('setlists', SetlistController::class);
        Route::post('/setlists/{setlist}/items', [SetlistController::class, 'addItem']);
        Route::delete('/setlists/{setlist}/items/{itemId}', [SetlistController::class, 'removeItem']);
        Route::put('/setlists/{setlist}/reorder', [SetlistController::class, 'reorder']);

        // Admin Only User Management API
        Route::apiResource('users', UserController::class)->middleware('role:ADMIN');

        // Protected test routes for role-based access control
        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Welcome Admin']);
        })->middleware('role:ADMIN');

        Route::get('/operator/dashboard', function () {
            return response()->json(['message' => 'Welcome Operator/Admin']);
        })->middleware('role:ADMIN,OPERATOR');
    });
});
