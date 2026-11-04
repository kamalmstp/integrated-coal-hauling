<?php

use App\Services\NotifyService;

if (!function_exists('notify')) {
    /**
     * Helper to dispatch notification or get the NotifyService instance.
     *
     * @param string|null $message
     * @param string $type
     * @return NotifyService
     */
    function notify(?string $message = null, string $type = 'success'): NotifyService
    {
        $service = app(NotifyService::class);

        if ($message !== null) {
            $service->flash($type, $type === 'success' ? 'Berhasil' : 'Pemberitahuan', $message);
        }

        return $service;
    }
}
