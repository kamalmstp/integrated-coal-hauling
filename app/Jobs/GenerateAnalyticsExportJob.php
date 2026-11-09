<?php

namespace App\Jobs;

use App\Models\ReportExportJob;
use App\Services\ManagementAnalyticsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class GenerateAnalyticsExportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $exportJobId)
    {
    }

    public function handle(ManagementAnalyticsService $analyticsService): void
    {
        $exportJob = ReportExportJob::find($this->exportJobId);
        if (!$exportJob) {
            return;
        }

        $exportJob->update(['status' => 'processing']);

        $filters = $exportJob->filters ?? [];
        $dataset = $analyticsService->buildExportDataset($exportJob->report_type, $filters);

        $ext = $exportJob->export_format === 'excel' ? 'csv' : 'html';
        $relativePath = "exports/{$exportJob->export_code}.{$ext}";

        if ($exportJob->export_format === 'excel') {
            $lines = [];
            $lines[] = implode(',', array_map(fn ($h) => '"' . str_replace('"', '""', (string) $h) . '"', $dataset['headers']));
            foreach ($dataset['rows'] as $row) {
                $lines[] = implode(',', array_map(fn ($v) => '"' . str_replace('"', '""', (string) $v) . '"', $row));
            }
            Storage::disk('local')->put($relativePath, implode("\n", $lines));
        } else {
            $html = "<html><head><meta charset='utf-8'><title>{$dataset['title']}</title></head><body>";
            $html .= "<h1>{$dataset['title']}</h1>";
            $html .= "<table border='1' cellpadding='6' cellspacing='0'><thead><tr>";
            foreach ($dataset['headers'] as $h) {
                $html .= "<th>" . htmlspecialchars((string) $h) . "</th>";
            }
            $html .= "</tr></thead><tbody>";
            foreach ($dataset['rows'] as $row) {
                $html .= "<tr>";
                foreach ($row as $cell) {
                    $html .= "<td>" . htmlspecialchars((string) $cell) . "</td>";
                }
                $html .= "</tr>";
            }
            $html .= "</tbody></table></body></html>";
            Storage::disk('local')->put($relativePath, $html);
        }

        $exportJob->update([
            'row_count' => count($dataset['rows']),
            'file_path' => $relativePath,
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
