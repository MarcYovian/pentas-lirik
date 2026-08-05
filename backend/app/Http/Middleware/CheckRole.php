<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array(strtoupper($user->role), array_map('strtoupper', $roles))) {
            return response()->json([
                'message' => 'Forbidden. You do not have access to this resource.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
