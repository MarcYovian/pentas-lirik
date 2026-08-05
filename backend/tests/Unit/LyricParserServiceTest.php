<?php

namespace Tests\Unit;

use App\Models\Song;
use App\Services\LyricParserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LyricParserServiceTest extends TestCase
{
    use RefreshDatabase;

    private LyricParserService $parser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parser = new LyricParserService();
    }

    public function test_empty_string_returns_empty_array(): void
    {
        $result = $this->parser->parse('');
        $this->assertEmpty($result);

        $resultSpaces = $this->parser->parse("   \n  \t ");
        $this->assertEmpty($resultSpaces);
    }

    public function test_parses_tagged_lyrics_correctly(): void
    {
        $raw = <<<'EOD'
[verse 1]
Amazing grace! How sweet the sound
That saved a wretch like me!

[chorus]
My chains are gone, I've been set free
My God, my Savior has ransomed me

[bridge]
The earth shall soon dissolve like snow
EOD;

        $chunks = $this->parser->parse($raw);

        $this->assertCount(3, $chunks);

        $this->assertEquals('[VERSE 1]', $chunks[0]['label']);
        $this->assertEquals("Amazing grace! How sweet the sound\nThat saved a wretch like me!", $chunks[0]['content']);
        $this->assertEquals(1, $chunks[0]['order']);

        $this->assertEquals('[CHORUS]', $chunks[1]['label']);
        $this->assertEquals("My chains are gone, I've been set free\nMy God, my Savior has ransomed me", $chunks[1]['content']);
        $this->assertEquals(2, $chunks[1]['order']);

        $this->assertEquals('[BRIDGE]', $chunks[2]['label']);
        $this->assertEquals('The earth shall soon dissolve like snow', $chunks[2]['content']);
        $this->assertEquals(3, $chunks[2]['order']);
    }

    public function test_parses_untagged_lyrics_as_single_default_chunk(): void
    {
        $raw = "Line 1 of song\nLine 2 of song\nLine 3 of song";

        $chunks = $this->parser->parse($raw);

        $this->assertCount(1, $chunks);
        $this->assertEquals('[LYRICS]', $chunks[0]['label']);
        $this->assertEquals($raw, $chunks[0]['content']);
        $this->assertEquals(1, $chunks[0]['order']);
    }

    public function test_ignores_empty_tagged_sections(): void
    {
        $raw = <<<'EOD'
[verse 1]

[verse 2]
Real verse content here
EOD;

        $chunks = $this->parser->parse($raw);

        $this->assertCount(1, $chunks);
        $this->assertEquals('[VERSE 2]', $chunks[0]['label']);
        $this->assertEquals('Real verse content here', $chunks[0]['content']);
    }

    public function test_parse_and_sync_saves_chunks_to_database(): void
    {
        $song = Song::create([
            'title' => 'Test Song',
            'artist' => 'Test Artist',
        ]);

        $raw = "[VERSE 1]\nFirst line\n[CHORUS]\nChorus line";

        $this->parser->parseAndSync($song, $raw);

        $this->assertDatabaseHas('lyric_chunks', [
            'song_id' => $song->id,
            'label' => '[VERSE 1]',
            'content' => 'First line',
            'order' => 1,
        ]);

        $this->assertDatabaseHas('lyric_chunks', [
            'song_id' => $song->id,
            'label' => '[CHORUS]',
            'content' => 'Chorus line',
            'order' => 2,
        ]);

        $this->assertEquals(2, $song->lyricChunks()->count());
    }
}
