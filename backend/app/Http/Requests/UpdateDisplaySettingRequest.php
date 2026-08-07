<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDisplaySettingRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $colorRegex = 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/';

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'font_size' => ['sometimes', 'integer', 'min:16', 'max:120'],
            'font_weight' => ['sometimes', 'string', 'in:400,600,700,800'],
            'text_transform' => ['sometimes', 'string', 'in:uppercase,capitalize,none'],
            'align_items' => ['sometimes', 'string', 'in:left,center,right'],
            'text_color' => ['sometimes', 'string', $colorRegex],
            'text_shadow_color' => ['sometimes', 'string', $colorRegex],
            'text_shadow_blur' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'text_stroke_width' => ['sometimes', 'integer', 'min:0', 'max:10'],
            'text_stroke_color' => ['sometimes', 'string', $colorRegex],
            'show_background' => ['sometimes', 'boolean'],
            'background_color' => ['sometimes', 'string', $colorRegex],
            'background_opacity' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'padding_vertical' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'padding_horizontal' => ['sometimes', 'integer', 'min:0', 'max:200'],
            'border_radius' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'max_width' => ['sometimes', 'string', 'max:50'],
        ];
    }
}
