<?php

namespace Database\Factories;

use App\Models\Setlist;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Setlist>
 */
class SetlistFactory extends Factory
{
    protected $model = Setlist::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => 'Event Setlist '.fake()->word(),
        ];
    }
}
