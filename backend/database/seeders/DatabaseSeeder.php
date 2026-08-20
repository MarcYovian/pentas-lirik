<?php

namespace Database\Seeders;

use App\Models\LyricChunk;
use App\Models\Organization;
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
        // 1. Seed Default Organization
        $defaultOrg = Organization::firstOrCreate(
            ['slug' => 'default'],
            [
                'name' => 'PentasLirik Main',
                'description' => 'Default Organization',
            ]
        );

        // 2. Seed Default Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@pentaslirik.local'],
            [
                'name' => 'Admin PentasLirik',
                'password' => Hash::make('password'),
                'role' => 'ADMIN',
            ]
        );
        $admin->organizations()->syncWithoutDetaching([
            $defaultOrg->id => ['role' => 'ADMIN'],
        ]);

        // 3. Seed Default Operator User
        $operator = User::firstOrCreate(
            ['email' => 'operator@pentaslirik.local'],
            [
                'name' => 'Operator Live',
                'password' => Hash::make('password'),
                'role' => 'OPERATOR',
            ]
        );
        $operator->organizations()->syncWithoutDetaching([
            $defaultOrg->id => ['role' => 'OPERATOR'],
        ]);

        // 4. Seed Sample Songs
        $song1 = Song::firstOrCreate(
            ['title' => 'Amazing Grace', 'organization_id' => $defaultOrg->id],
            ['artist' => 'John Newton']
        );

        LyricChunk::firstOrCreate(
            ['song_id' => $song1->id, 'label' => '[VERSE 1]'],
            ['content' => "Amazing grace! How sweet the sound\nThat saved a wretch like me!", 'order' => 1]
        );

        LyricChunk::firstOrCreate(
            ['song_id' => $song1->id, 'label' => '[VERSE 2]'],
            ['content' => "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;", 'order' => 2]
        );

        LyricChunk::firstOrCreate(
            ['song_id' => $song1->id, 'label' => '[CHORUS]'],
            ['content' => "My chains are gone, I've been set free\nMy God, my Savior has ransomed me", 'order' => 3]
        );

        $song2 = Song::firstOrCreate(
            ['title' => '10,000 Reasons (Bless The Lord)', 'organization_id' => $defaultOrg->id],
            ['artist' => 'Matt Redman']
        );

        LyricChunk::firstOrCreate(
            ['song_id' => $song2->id, 'label' => '[CHORUS]'],
            ['content' => "Bless the Lord, O my soul, O my soul\nWorship His holy name", 'order' => 1]
        );

        LyricChunk::firstOrCreate(
            ['song_id' => $song2->id, 'label' => '[VERSE 1]'],
            ['content' => "The sun comes up, it's a new day dawning\nIt's time to sing Your song again", 'order' => 2]
        );

        $song3 = Song::firstOrCreate(
            ['title' => 'What A Beautiful Name', 'organization_id' => $defaultOrg->id],
            ['artist' => 'Hillsong Worship']
        );

        LyricChunk::firstOrCreate(
            ['song_id' => $song3->id, 'label' => '[VERSE 1]'],
            ['content' => "You were the Word at the beginning\nOne with God the Lord Most High", 'order' => 1]
        );

        LyricChunk::firstOrCreate(
            ['song_id' => $song3->id, 'label' => '[CHORUS]'],
            ['content' => "What a beautiful Name it is\nWhat a beautiful Name it is\nThe Name of Jesus Christ my King", 'order' => 2]
        );

        $song4 = Song::firstOrCreate(
            ['title' => 'Goodness Of God', 'organization_id' => $defaultOrg->id],
            ['artist' => 'Bethel Music']
        );

        LyricChunk::firstOrCreate(
            ['song_id' => $song4->id, 'label' => '[VERSE 1]'],
            ['content' => "I love You Lord\nFor Your mercy never fails me", 'order' => 1]
        );

        // 5. Seed Sample Setlist
        $setlist = Setlist::firstOrCreate(
            ['user_id' => $operator->id, 'organization_id' => $defaultOrg->id, 'name' => 'Kebaktian Minggu Pagi - 10 AM']
        );

        SetlistItem::firstOrCreate(
            ['setlist_id' => $setlist->id, 'song_id' => $song1->id],
            ['order' => 1]
        );

        SetlistItem::firstOrCreate(
            ['setlist_id' => $setlist->id, 'song_id' => $song2->id],
            ['order' => 2]
        );

        // 6. Seed Default Display Settings
        $this->call(DisplaySettingSeeder::class);
    }
}
