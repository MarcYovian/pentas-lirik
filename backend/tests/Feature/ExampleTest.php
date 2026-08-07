<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    #[Test]
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/api/v1/live/state');

        $response->assertStatus(200);
    }
}
