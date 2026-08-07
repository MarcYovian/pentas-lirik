<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderSetlistItemsRequest;
use App\Http\Requests\StoreSetlistRequest;
use App\Http\Resources\SetlistResource;
use App\Models\Setlist;
use App\Models\SetlistItem;
use App\Models\Song;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class SetlistController extends Controller
{
    /**
     * Display a listing of all setlists.
     */
    public function index(): AnonymousResourceCollection
    {
        $setlists = Setlist::with(['setlistItems.song.lyricChunks'])
            ->orderBy('created_at', 'desc')
            ->get();

        return SetlistResource::collection($setlists);
    }

    /**
     * Display the specified setlist.
     */
    public function show(Setlist $setlist): SetlistResource
    {
        $setlist->load(['setlistItems.song.lyricChunks']);

        return new SetlistResource($setlist);
    }

    /**
     * Store a newly created setlist.
     */
    public function store(StoreSetlistRequest $request): JsonResponse
    {
        $setlist = Setlist::create([
            'user_id' => $request->user()->id,
            'name' => $request->validated('name'),
        ]);

        if ($request->has('items') && is_array($request->input('items'))) {
            $this->syncSetlistItems($setlist, $request->input('items'));
        }

        $setlist->load(['setlistItems.song.lyricChunks']);

        return (new SetlistResource($setlist))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update the specified setlist name & items.
     */
    public function update(StoreSetlistRequest $request, Setlist $setlist): SetlistResource
    {
        $setlist->update([
            'name' => $request->validated('name'),
        ]);

        if ($request->has('items') && is_array($request->input('items'))) {
            $this->syncSetlistItems($setlist, $request->input('items'));
        }

        $setlist->load(['setlistItems.song.lyricChunks']);

        return new SetlistResource($setlist);
    }

    /**
     * Helper to sync items array for a setlist.
     */
    protected function syncSetlistItems(Setlist $setlist, array $items): void
    {
        DB::transaction(function () use ($setlist, $items) {
            $setlist->setlistItems()->delete();
            $order = 1;
            foreach ($items as $item) {
                if (isset($item['song_id']) && $item['song_id']) {
                    $setlist->setlistItems()->create([
                        'song_id' => $item['song_id'],
                        'order' => $order++,
                    ]);
                }
            }
        });
    }

    /**
     * Remove the specified setlist.
     */
    public function destroy(Setlist $setlist): JsonResponse
    {
        $setlist->delete();

        return response()->json([
            'message' => 'Setlist deleted successfully.',
        ]);
    }

    /**
     * Add a song to the setlist.
     */
    public function addItem(Request $request, Setlist $setlist): JsonResponse
    {
        $validated = $request->validate([
            'song_id' => ['required', 'integer', 'exists:songs,id'],
        ]);

        $maxOrder = $setlist->setlistItems()->max('order') ?? 0;

        $setlist->setlistItems()->create([
            'song_id' => $validated['song_id'],
            'order' => $maxOrder + 1,
        ]);

        $setlist->load(['setlistItems.song.lyricChunks']);

        return (new SetlistResource($setlist))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Remove an item from the setlist.
     */
    public function removeItem(Setlist $setlist, int $itemId): JsonResponse
    {
        $item = $setlist->setlistItems()->where('id', $itemId)->firstOrFail();
        $item->delete();

        // Re-sequence remaining items
        DB::transaction(function () use ($setlist) {
            $remaining = $setlist->setlistItems()->orderBy('order')->get();
            // Assign temporary negative order to prevent unique key conflict
            foreach ($remaining as $idx => $rItem) {
                $rItem->update(['order' => -($idx + 1)]);
            }
            foreach ($remaining as $idx => $rItem) {
                $rItem->update(['order' => $idx + 1]);
            }
        });

        $setlist->load(['setlistItems.song.lyricChunks']);

        return response()->json([
            'message' => 'Item removed from setlist successfully.',
            'data' => new SetlistResource($setlist),
        ]);
    }

    /**
     * Reorder setlist items.
     */
    public function reorder(ReorderSetlistItemsRequest $request, Setlist $setlist): SetlistResource
    {
        $itemIds = $request->validated('item_ids');

        DB::transaction(function () use ($setlist, $itemIds) {
            // Step 1: Assign temporary negative orders to avoid unique (setlist_id, order) conflicts
            foreach ($itemIds as $index => $id) {
                SetlistItem::where('id', $id)
                    ->where('setlist_id', $setlist->id)
                    ->update(['order' => -($index + 1)]);
            }

            // Step 2: Assign final positive 1-based order
            foreach ($itemIds as $index => $id) {
                SetlistItem::where('id', $id)
                    ->where('setlist_id', $setlist->id)
                    ->update(['order' => $index + 1]);
            }
        });

        $setlist->load(['setlistItems.song.lyricChunks']);

        return new SetlistResource($setlist);
    }
}
