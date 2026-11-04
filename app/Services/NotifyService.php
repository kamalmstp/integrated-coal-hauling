<?php

namespace App\Services;

class NotifyService
{
    /**
     * Flash a notification to the session.
     */
    public function flash(string $type, string $title, ?string $message = null, array $options = []): self
    {
        $notification = array_merge([
            'id' => uniqid('notify_', true),
            'type' => $type, // 'success', 'error', 'warning', 'info', 'confirm'
            'title' => $title,
            'message' => $message,
            'duration' => $options['duration'] ?? 4000,
            'timestamp' => now()->timestamp,
        ], $options);

        session()->flash('notify', $notification);

        // Also populate standard flash keys for compatibility
        if (in_array($type, ['success', 'error', 'warning', 'info'])) {
            session()->flash($type, $message ?? $title);
        }

        return $this;
    }

    public function success(string $title, ?string $message = null, array $options = []): self
    {
        return $this->flash('success', $title, $message, $options);
    }

    public function error(string $title, ?string $message = null, array $options = []): self
    {
        return $this->flash('error', $title, $message, $options);
    }

    public function warning(string $title, ?string $message = null, array $options = []): self
    {
        return $this->flash('warning', $title, $message, $options);
    }

    public function info(string $title, ?string $message = null, array $options = []): self
    {
        return $this->flash('info', $title, $message, $options);
    }

    /**
     * Trigger a confirm request dialog
     */
    public function confirm(string $title, ?string $message = null, array $confirmOptions = []): self
    {
        return $this->flash('confirm', $title, $message, array_merge([
            'confirmButtonText' => $confirmOptions['confirmButtonText'] ?? 'Ya, Lanjutkan',
            'cancelButtonText' => $confirmOptions['cancelButtonText'] ?? 'Batal',
            'actionUrl' => $confirmOptions['actionUrl'] ?? null,
            'method' => $confirmOptions['method'] ?? 'POST',
            'data' => $confirmOptions['data'] ?? [],
        ], $confirmOptions));
    }
}
