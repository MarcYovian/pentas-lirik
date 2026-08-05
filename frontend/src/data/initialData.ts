import { Song, Setlist, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@pentaslirik.local',
    password: 'password',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Operator User',
    email: 'operator@pentaslirik.local',
    password: 'password',
    role: 'operator',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_SONGS: Song[] = [
  {
    id: 1,
    title: 'Amazing Grace (My Chains Are Gone)',
    artist: 'Chris Tomlin / John Newton',
    lyrics_raw: `[VERSE 1]
Amazing grace! How sweet the sound
That saved a wretch like me!
I once was lost, but now am found
Was blind, but now I see

[VERSE 2]
'Twas grace that taught my heart to fear
And grace my fears relieved
How precious did that grace appear
The hour I first believed

[CHORUS]
My chains are gone, I've been set free
My God, my Savior has ransomed me
And like a flood His mercy rains
Unending love, amazing grace

[VERSE 3]
The Lord has promised good to me
His word my hope secures
He will my shield and portion be
As long as life endures

[BRIDGE]
The earth shall soon dissolve like snow
The sun forbear to shine
But God who called me here below
Will be forever mine`,
    lyrics: [
      {
        id: 101,
        label: '[VERSE 1]',
        content: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found\nWas blind, but now I see',
        order: 1,
      },
      {
        id: 102,
        label: '[VERSE 2]',
        content: "'Twas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed",
        order: 2,
      },
      {
        id: 103,
        label: '[CHORUS]',
        content: 'My chains are gone, I\'ve been set free\nMy God, my Savior has ransomed me\nAnd like a flood His mercy rains\nUnending love, amazing grace',
        order: 3,
      },
      {
        id: 104,
        label: '[VERSE 3]',
        content: 'The Lord has promised good to me\nHis word my hope secures\nHe will my shield and portion be\nAs long as life endures',
        order: 4,
      },
      {
        id: 105,
        label: '[BRIDGE]',
        content: 'The earth shall soon dissolve like snow\nThe sun forbear to shine\nBut God who called me here below\nWill be forever mine',
        order: 5,
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: '10,000 Reasons (Bless The Lord)',
    artist: 'Matt Redman',
    lyrics_raw: `[CHORUS]
Bless the Lord, O my soul, O my soul
Worship His holy name
Sing like never before, O my soul
I'll worship Your holy name

[VERSE 1]
The sun comes up, it's a new day dawning
It's time to sing Your song again
Whatever may pass and whatever lies before me
Let me be singing when the evening comes

[VERSE 2]
You're rich in love and You're slow to anger
Your name is great and Your heart is kind
For all Your goodness I will keep on singing
Ten thousand reasons for my heart to find

[VERSE 3]
And on that day when my strength is failing
The end draws near and my time has come
Still my soul will sing Your praise unending
Ten thousand years and then forevermore`,
    lyrics: [
      {
        id: 201,
        label: '[CHORUS]',
        content: "Bless the Lord, O my soul, O my soul\nWorship His holy name\nSing like never before, O my soul\nI'll worship Your holy name",
        order: 1,
      },
      {
        id: 202,
        label: '[VERSE 1]',
        content: "The sun comes up, it's a new day dawning\nIt's time to sing Your song again\nWhatever may pass and whatever lies before me\nLet me be singing when the evening comes",
        order: 2,
      },
      {
        id: 203,
        label: '[VERSE 2]',
        content: "You're rich in love and You're slow to anger\nYour name is great and Your heart is kind\nFor all Your goodness I will keep on singing\nTen thousand reasons for my heart to find",
        order: 3,
      },
      {
        id: 204,
        label: '[VERSE 3]',
        content: "And on that day when my strength is failing\nThe end draws near and my time has come\nStill my soul will sing Your praise unending\nTen thousand years and then forevermore",
        order: 4,
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'What A Beautiful Name',
    artist: 'Hillsong Worship',
    lyrics_raw: `[VERSE 1]
You were the Word at the beginning
One with God the Lord Most High
Your hidden glory in creation
Now revealed in You our Christ

[CHORUS 1]
What a beautiful Name it is
What a beautiful Name it is
The Name of Jesus Christ my King
What a beautiful Name it is
Nothing compares to this
What a beautiful Name it is
The Name of Jesus

[VERSE 2]
You didn't want heaven without us
So Jesus You brought heaven down
My sin was great Your love was greater
What could separated us now

[CHORUS 2]
What a wonderful Name it is
What a wonderful Name it is
The Name of Jesus Christ my King
What a wonderful Name it is
Nothing compares to this
What a wonderful Name it is
The Name of Jesus

[BRIDGE]
Death could not hold You
The veil tore before You
You silence the boast of sin and grave
The heavens are roaring
The praise of Your glory
For You are raised to life again`,
    lyrics: [
      {
        id: 301,
        label: '[VERSE 1]',
        content: "You were the Word at the beginning\nOne with God the Lord Most High\nYour hidden glory in creation\nNow revealed in You our Christ",
        order: 1,
      },
      {
        id: 302,
        label: '[CHORUS 1]',
        content: "What a beautiful Name it is\nWhat a beautiful Name it is\nThe Name of Jesus Christ my King\nWhat a beautiful Name it is\nNothing compares to this\nWhat a beautiful Name it is\nThe Name of Jesus",
        order: 2,
      },
      {
        id: 303,
        label: '[VERSE 2]',
        content: "You didn't want heaven without us\nSo Jesus You brought heaven down\nMy sin was great Your love was greater\nWhat could separated us now",
        order: 3,
      },
      {
        id: 304,
        label: '[CHORUS 2]',
        content: "What a wonderful Name it is\nWhat a wonderful Name it is\nThe Name of Jesus Christ my King\nWhat a wonderful Name it is\nNothing compares to this\nWhat a wonderful Name it is\nThe Name of Jesus",
        order: 4,
      },
      {
        id: 305,
        label: '[BRIDGE]',
        content: "Death could not hold You\nThe veil tore before You\nYou silence the boast of sin and grave\nThe heavens are roaring\nThe praise of Your glory\nFor You are raised to life again",
        order: 5,
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Goodness Of God',
    artist: 'Bethel Music / Jenn Johnson',
    lyrics_raw: `[VERSE 1]
I love You Lord, Oh Your mercy never fails me
All my days I've been held in Your hands
From the moment that I wake up until I lay my head
Oh I will sing of the goodness of God

[CHORUS]
All my life You have been faithful
All my life You have been so so good
With every breath that I am able
Oh I will sing of the goodness of God

[VERSE 2]
I love Your voice, You have led me through the fire
In darkest night You are close like no other
I've known You as a father, I've known You as a friend
I have lived in the goodness of God

[BRIDGE]
Your goodness is running after, it's running after me
Your goodness is running after, it's running after me
With my life laid down, I'm surrendered now, I give You everything
Your goodness is running after, it's running after me`,
    lyrics: [
      {
        id: 401,
        label: '[VERSE 1]',
        content: "I love You Lord, Oh Your mercy never fails me\nAll my days I've been held in Your hands\nFrom the moment that I wake up until I lay my head\nOh I will sing of the goodness of God",
        order: 1,
      },
      {
        id: 402,
        label: '[CHORUS]',
        content: "All my life You have been faithful\nAll my life You have been so so good\nWith every breath that I am able\nOh I will sing of the goodness of God",
        order: 2,
      },
      {
        id: 403,
        label: '[VERSE 2]',
        content: "I love Your voice, You have led me through the fire\nIn darkest night You are close like no other\nI've known You as a father, I've known You as a friend\nI have lived in the goodness of God",
        order: 3,
      },
      {
        id: 404,
        label: '[BRIDGE]',
        content: "Your goodness is running after, it's running after me\nYour goodness is running after, it's running after me\nWith my life laid down, I'm surrendered now, I give You everything\nYour goodness is running after, it's running after me",
        order: 4,
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'In Christ Alone',
    artist: 'Keith & Kristyn Getty',
    lyrics_raw: `[VERSE 1]
In Christ alone my hope is found
He is my light, my strength, my song
This Cornerstone, this solid Ground
Firm through the fiercest drought and storm

[VERSE 2]
In Christ alone, who took on flesh
Fullness of God in helpless babe
This gift of love and righteousness
Scorned by the ones He came to save

[VERSE 3]
There in the ground His body lay
Light of the world by darkness slain
Then bursting forth in glorious Day
Up from the grave He rose again

[VERSE 4]
No guilt in life, no fear in death
This is the power of Christ in me
From life's first cry to final breath
Jesus commands my destiny`,
    lyrics: [
      {
        id: 501,
        label: '[VERSE 1]',
        content: "In Christ alone my hope is found\nHe is my light, my strength, my song\nThis Cornerstone, this solid Ground\nFirm through the fiercest drought and storm",
        order: 1,
      },
      {
        id: 502,
        label: '[VERSE 2]',
        content: "In Christ alone, who took on flesh\nFullness of God in helpless babe\nThis gift of love and righteousness\nScorned by the ones He came to save",
        order: 2,
      },
      {
        id: 503,
        label: '[VERSE 3]',
        content: "There in the ground His body lay\nLight of the world by darkness slain\nThen bursting forth in glorious Day\nUp from the grave He rose again",
        order: 3,
      },
      {
        id: 504,
        label: '[VERSE 4]',
        content: "No guilt in life, no fear in death\nThis is the power of Christ in me\nFrom life's first cry to final breath\nJesus commands my destiny",
        order: 4,
      },
    ],
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_SETLISTS: Setlist[] = [
  {
    id: 1,
    name: 'Sunday Morning Celebration Service',
    items: [
      {
        id: 1,
        type: 'announcement',
        content: 'Welcome to PentasLirik Live Service! Please quiet your mobile devices.',
        order: 1,
      },
      {
        id: 2,
        type: 'song',
        song_id: 1,
        song_title: 'Amazing Grace (My Chains Are Gone)',
        artist: 'Chris Tomlin / John Newton',
        order: 2,
      },
      {
        id: 3,
        type: 'song',
        song_id: 2,
        song_title: '10,000 Reasons (Bless The Lord)',
        artist: 'Matt Redman',
        order: 3,
      },
      {
        id: 4,
        type: 'song',
        song_id: 4,
        song_title: 'Goodness Of God',
        artist: 'Bethel Music / Jenn Johnson',
        order: 4,
      },
      {
        id: 5,
        type: 'announcement',
        content: 'Next Youth Night Gathering: Friday at 7:00 PM in the Main Auditorium.',
        order: 5,
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Evening Praise & Worship Rundown',
    items: [
      {
        id: 1,
        type: 'song',
        song_id: 3,
        song_title: 'What A Beautiful Name',
        artist: 'Hillsong Worship',
        order: 1,
      },
      {
        id: 2,
        type: 'song',
        song_id: 5,
        song_title: 'In Christ Alone',
        artist: 'Keith & Kristyn Getty',
        order: 2,
      },
    ],
    created_at: new Date().toISOString(),
  },
];
