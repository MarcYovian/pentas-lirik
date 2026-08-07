<?php

namespace Database\Seeders;

use App\Models\LyricChunk;
use App\Models\Setlist;
use App\Models\SetlistItem;
use App\Models\Song;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Default Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@pentaslirik.local'],
            [
                'name' => 'Admin PentasLirik',
                'password' => Hash::make('password'),
                'role' => 'ADMIN',
            ]
        );

        // 2. Seed Default Operator User
        $operator = User::firstOrCreate(
            ['email' => 'operator@pentaslirik.local'],
            [
                'name' => 'Operator Live',
                'password' => Hash::make('password'),
                'role' => 'OPERATOR',
            ]
        );

        // 3. Seed Sample Songs
        $song1 = Song::create([
            'title' => 'Amazing Grace',
            'artist' => 'John Newton',
        ]);

        LyricChunk::create([
            'song_id' => $song1->id,
            'label' => '[VERSE 1]',
            'content' => "Amazing grace! How sweet the sound\nThat saved a wretch like me!",
            'order' => 1,
        ]);

        LyricChunk::create([
            'song_id' => $song1->id,
            'label' => '[VERSE 2]',
            'content' => "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;",
            'order' => 2,
        ]);

        LyricChunk::create([
            'song_id' => $song1->id,
            'label' => '[CHORUS]',
            'content' => "My chains are gone, I've been set free\nMy God, my Savior has ransomed me",
            'order' => 3,
        ]);

        $song2 = Song::create([
            'title' => '10,000 Reasons (Bless The Lord)',
            'artist' => 'Matt Redman',
        ]);

        LyricChunk::create([
            'song_id' => $song2->id,
            'label' => '[CHORUS]',
            'content' => "Bless the Lord, O my soul, O my soul\nWorship His holy name",
            'order' => 1,
        ]);

        LyricChunk::create([
            'song_id' => $song2->id,
            'label' => '[VERSE 1]',
            'content' => "The sun comes up, it's a new day dawning\nIt's time to sing Your song again",
            'order' => 2,
        ]);

        $song3 = Song::create([
            'title' => 'What A Beautiful Name',
            'artist' => 'Hillsong Worship',
        ]);

        LyricChunk::create([
            'song_id' => $song3->id,
            'label' => '[VERSE 1]',
            'content' => "You were the Word at the beginning\nOne with God the Lord Most High",
            'order' => 1,
        ]);

        LyricChunk::create([
            'song_id' => $song3->id,
            'label' => '[CHORUS]',
            'content' => "What a beautiful Name it is\nWhat a beautiful Name it is\nThe Name of Jesus Christ my King",
            'order' => 2,
        ]);

        $song4 = Song::create([
            'title' => 'Goodness Of God',
            'artist' => 'Bethel Music',
        ]);

        LyricChunk::create([
            'song_id' => $song4->id,
            'label' => '[VERSE 1]',
            'content' => "I love You Lord\nFor Your mercy never fails me",
            'order' => 1,
        ]);

        // 4. Seed Sample Setlist
        $setlist = Setlist::create([
            'user_id' => $operator->id,
            'name' => 'Kebaktian Minggu Pagi - 10 AM',
        ]);

        SetlistItem::create([
            'setlist_id' => $setlist->id,
            'song_id' => $song1->id,
            'order' => 1,
        ]);

        SetlistItem::create([
            'setlist_id' => $setlist->id,
            'song_id' => $song2->id,
            'order' => 2,
        ]);
    }
}
