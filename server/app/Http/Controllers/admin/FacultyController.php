<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class FacultyController extends Controller
{
    /**
     * GET /api/faculties
     * - Paginated
     * - Cached
     * - Optional eager loading via ?with=relation1,relation2
     */
    public function index(Request $request)
    {
        $page    = max(1, (int) $request->query('page', 1));
        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $with    = $this->sanitizeRelations($request->query('with'));

        $cacheKey = sprintf('faculties:index:p:%d:pp:%d:w:%s', $page, $perPage, md5(implode(',', $with)));
        $ttl      = now()->addMinutes(10);

        $payload = Cache::remember($cacheKey, $ttl, function () use ($with, $perPage, $request) {
            $paginator = Faculty::with($with)
                ->orderByDesc('created_at')
                ->paginate($perPage)
                ->appends($request->query());

            // Convert models to array for safe caching
            $data = collect($paginator->items())
                ->map(fn ($m) => $m->toArray())
                ->all();

            return [
                'status' => true,
                'data'   => $data,
                'meta'   => [
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                    'per_page'     => $paginator->perPage(),
                    'total'        => $paginator->total(),
                    'from'         => $paginator->firstItem(),
                    'to'           => $paginator->lastItem(),
                ],
                'links'  => [
                    'first' => $paginator->url(1),
                    'last'  => $paginator->url($paginator->lastPage()),
                    'prev'  => $paginator->previousPageUrl(),
                    'next'  => $paginator->nextPageUrl(),
                ],
            ];
        });

        return response()->json($payload, 200);
    }

    /**
     * POST /api/faculties
     * - Create and clear caches
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:32|unique:faculties,code',
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $faculty = Faculty::create($validator->validated());

        // Clear cache after mutation
        Cache::flush();

        return response()->json([
            'status'  => true,
            'message' => 'Faculty created successfully',
            'data'    => $faculty->toArray(),
        ], 201);
    }

    /**
     * GET /api/faculties/{faculty}
     * - Cached
     * - Optional eager loading via ?with=relation1,relation2
     */
    public function show(Request $request, Faculty $faculty)
    {
        $with = $this->sanitizeRelations($request->query('with'));

        $cacheKey = sprintf('faculties:show:%d:w:%s', $faculty->id, md5(implode(',', $with)));
        $ttl      = now()->addMinutes(10);

        $data = Cache::remember($cacheKey, $ttl, function () use ($faculty, $with) {
            $model = Faculty::with($with)->findOrFail($faculty->id);
            return $model->toArray();
        });

        return response()->json([
            'status' => true,
            'data'   => $data,
        ], 200);
    }

    /**
     * PUT /api/faculties/{faculty}
     * - Update and clear caches
     */
    public function update(Request $request, Faculty $faculty)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:32|unique:faculties,code,' . $faculty->id,
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $faculty->update($validator->validated());

        // Clear cache after update
        Cache::flush();

        return response()->json([
            'status'  => true,
            'message' => 'Faculty updated successfully',
            'data'    => $faculty->toArray(),
        ], 200);
    }

    /**
     * DELETE /api/faculties/{faculty}
     * - Delete and clear caches
     */
    public function destroy(Faculty $faculty)
    {
        $faculty->delete();

        // Clear cache after delete
        Cache::flush();

        return response()->json([
            'status'  => true,
            'message' => 'Faculty deleted successfully',
        ], 200);
    }

    /* ---------------- Helpers ---------------- */

    /**
     * Eager-loading sanitizer: only allow relations that exist on the model.
     * Accepts comma-separated list or array (?with=departments,teachers).
     */
    protected function sanitizeRelations($withParam): array
    {
        if (!$withParam) return [];

        $requested = collect(is_array($withParam) ? $withParam : explode(',', (string) $withParam))
            ->map(fn ($r) => trim($r))
            ->filter()
            ->unique();

        $model = new Faculty();

        $allowed = $requested->filter(fn ($rel) => method_exists($model, $rel));

        return $allowed->values()->all();
    }
}
