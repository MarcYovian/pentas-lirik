<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SyncSongsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'remote_url' => ['required', 'url'],
            'conflict_strategy' => ['required', 'in:overwrite,skip'],
            'api_token' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'password' => ['nullable', 'string'],
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'remote_url.required' => 'URL Remote VPS wajib diisi.',
            'remote_url.url' => 'Format URL Remote VPS tidak valid.',
            'conflict_strategy.required' => 'Strategi konflik (overwrite/skip) wajib dipilih.',
            'conflict_strategy.in' => 'Strategi konflik harus bernilai "overwrite" atau "skip".',
        ];
    }
}
