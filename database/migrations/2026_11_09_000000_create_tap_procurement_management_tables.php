<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Upgrade purchase_requests & purchase_request_items (created in Phase 5) with full Phase 6 columns
        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('warehouse_id')->constrained('departments')->nullOnDelete();
            $table->date('required_date')->nullable()->after('request_date');
            $table->string('purchase_category', 50)->default('sparepart')->after('source')->index(); // sparepart, tire_tyre, lubricant, operational, general
            $table->text('purpose')->nullable()->after('estimated_total');
            $table->string('attachment_path')->nullable()->after('notes');
            $table->foreignId('work_order_id')->nullable()->after('warehouse_id')->constrained('work_orders')->nullOnDelete();
            $table->unsignedTinyInteger('current_approval_step')->default(1)->after('status');
            $table->text('rejection_reason')->nullable()->after('approved_at');
        });

        Schema::table('purchase_request_items', function (Blueprint $table) {
            $table->foreignId('inventory_item_id')->nullable()->change();
            $table->string('item_name', 180)->nullable()->after('inventory_item_id');
            $table->text('specification')->nullable()->after('item_name');
            $table->string('purpose', 255)->nullable()->after('notes');
        });

        // 2. Configurable Procurement Approval Rules (NEVER hardcode approval nominal thresholds)
        Schema::create('procurement_approval_rules', function (Blueprint $table) {
            $table->id();
            $table->string('rule_code', 50)->unique()->index();
            $table->string('rule_name', 150);
            $table->string('document_type', 20)->default('ALL')->index(); // PR, PO, ALL
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('purchase_category', 50)->nullable()->index(); // null = all categories
            $table->decimal('min_amount', 18, 2)->default(0);
            $table->decimal('max_amount', 18, 2)->nullable(); // null = no upper limit
            $table->unsignedTinyInteger('step_order')->default(1);
            $table->foreignId('approver_position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->string('approver_role_label', 100);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        // 3. RFQs (Request for Quotation)
        Schema::create('rfqs', function (Blueprint $table) {
            $table->id();
            $table->string('rfq_number', 50)->unique()->index();
            $table->foreignId('purchase_request_id')->constrained('purchase_requests')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->date('issue_date')->index();
            $table->date('closing_date')->nullable();
            $table->string('title', 200);
            $table->string('status', 30)->default('open')->index(); // draft, open, quoted, compared, awarded, closed
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. RFQ Vendors (Vendor Invitation)
        Schema::create('rfq_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->constrained('rfqs')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->restrictOnDelete();
            $table->dateTime('invited_at')->nullable();
            $table->string('invitation_status', 30)->default('invited'); // invited, responded, declined
            $table->string('contact_email', 150)->nullable();
            $table->string('notes', 255)->nullable();
            $table->timestamps();

            $table->unique(['rfq_id', 'vendor_id']);
        });

        // 5. Vendor Quotations
        Schema::create('vendor_quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_number', 60)->unique()->index();
            $table->foreignId('rfq_id')->constrained('rfqs')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->restrictOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->date('quotation_date')->index();
            $table->date('valid_until')->nullable();
            $table->unsignedInteger('delivery_lead_time_days')->default(7);
            $table->string('payment_terms', 100)->default('TOP 30 Days'); // CBD, COD, TOP 14 Days, TOP 30 Days, TOP 60 Days
            $table->string('currency', 10)->default('IDR');
            $table->decimal('subtotal_amount', 18, 2)->default(0);
            $table->decimal('discount_amount', 18, 2)->default(0);
            $table->decimal('tax_amount', 18, 2)->default(0);
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->string('attachment_path')->nullable();
            $table->string('status', 30)->default('submitted')->index(); // submitted, shortlisted, selected, rejected
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 6. Vendor Quotation Items
        Schema::create('vendor_quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_quotation_id')->constrained('vendor_quotations')->cascadeOnDelete();
            $table->foreignId('purchase_request_item_id')->nullable()->constrained('purchase_request_items')->nullOnDelete();
            $table->foreignId('inventory_item_id')->nullable()->constrained('inventory_items')->nullOnDelete();
            $table->string('item_name', 180);
            $table->text('specification')->nullable();
            $table->decimal('quantity', 14, 2);
            $table->string('unit', 30)->default('PCS');
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(11.00);
            $table->decimal('total_price', 18, 2)->default(0);
            $table->unsignedInteger('delivery_days')->default(7);
            $table->string('brand_offered', 100)->nullable();
            $table->string('notes', 255)->nullable();
            $table->timestamps();
        });

        // 7. Quotation Comparisons (Vendor Comparison Matrix & Selection)
        Schema::create('quotation_comparisons', function (Blueprint $table) {
            $table->id();
            $table->string('comparison_number', 50)->unique()->index();
            $table->foreignId('rfq_id')->constrained('rfqs')->cascadeOnDelete();
            $table->foreignId('purchase_request_id')->constrained('purchase_requests')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->date('comparison_date')->index();
            $table->foreignId('selected_quotation_id')->nullable()->constrained('vendor_quotations')->nullOnDelete();
            $table->foreignId('selected_vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->foreignId('lowest_price_quotation_id')->nullable()->constrained('vendor_quotations')->nullOnDelete();
            $table->foreignId('fastest_delivery_quotation_id')->nullable()->constrained('vendor_quotations')->nullOnDelete();
            $table->foreignId('best_payment_terms_quotation_id')->nullable()->constrained('vendor_quotations')->nullOnDelete();
            $table->json('comparison_matrix')->nullable();
            $table->text('selection_remarks')->nullable();
            $table->foreignId('evaluated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->string('status', 30)->default('completed')->index(); // draft, completed, converted_to_po
            $table->timestamps();
        });

        // 8. Purchase Orders (PO Header)
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number', 50)->unique()->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('purchase_request_id')->nullable()->constrained('purchase_requests')->nullOnDelete();
            $table->foreignId('rfq_id')->nullable()->constrained('rfqs')->nullOnDelete();
            $table->foreignId('quotation_comparison_id')->nullable()->constrained('quotation_comparisons')->nullOnDelete();
            $table->foreignId('vendor_quotation_id')->nullable()->constrained('vendor_quotations')->nullOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->restrictOnDelete();
            $table->date('po_date')->index();
            $table->date('expected_delivery_date')->nullable()->index();
            $table->string('delivery_location', 255)->nullable();
            $table->string('payment_terms', 100)->default('TOP 30 Days');
            $table->string('purchase_category', 50)->default('sparepart');
            $table->decimal('subtotal_amount', 18, 2)->default(0);
            $table->decimal('discount_amount', 18, 2)->default(0);
            $table->decimal('tax_percent', 5, 2)->default(11.00);
            $table->decimal('tax_amount', 18, 2)->default(0);
            $table->decimal('grand_total', 18, 2)->default(0);
            $table->text('terms_and_conditions')->nullable();
            $table->string('approval_status', 30)->default('pending_approval')->index(); // draft, pending_approval, approved, rejected
            $table->string('status', 30)->default('pending_approval')->index(); // draft, pending_approval, approved, issued, partial_received, received, invoiced, completed, cancelled
            $table->unsignedTinyInteger('current_approval_step')->default(1);
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 9. Purchase Order Items
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('purchase_request_item_id')->nullable()->constrained('purchase_request_items')->nullOnDelete();
            $table->foreignId('inventory_item_id')->nullable()->constrained('inventory_items')->nullOnDelete();
            $table->string('item_name', 180);
            $table->text('specification')->nullable();
            $table->decimal('quantity_ordered', 14, 2);
            $table->decimal('quantity_received', 14, 2)->default(0);
            $table->decimal('quantity_rejected', 14, 2)->default(0);
            $table->decimal('quantity_outstanding', 14, 2)->default(0);
            $table->string('unit', 30)->default('PCS');
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_price', 18, 2)->default(0);
            $table->string('status', 30)->default('open'); // open, partial, received, over_delivered
            $table->timestamps();
        });

        // 10. Purchase Approvals (Multi-level configurable approval history for PR & PO)
        Schema::create('purchase_approvals', function (Blueprint $table) {
            $table->id();
            $table->string('approvable_type', 40)->index(); // purchase_request, purchase_order
            $table->unsignedBigInteger('approvable_id')->index();
            $table->foreignId('purchase_request_id')->nullable()->constrained('purchase_requests')->cascadeOnDelete();
            $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('approval_rule_id')->nullable()->constrained('procurement_approval_rules')->nullOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('approver_position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->unsignedTinyInteger('step_order')->default(1);
            $table->string('step_name', 120);
            $table->decimal('transaction_amount', 18, 2)->default(0);
            $table->string('purchase_category', 50)->nullable();
            $table->string('status', 30)->default('pending')->index(); // pending, approved, rejected
            $table->foreignId('acted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('acted_by_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->dateTime('acted_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 11. Goods Receipts (GRN Header — Integrated with Warehouse)
        Schema::create('goods_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('grn_number', 50)->unique()->index();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->restrictOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->restrictOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->date('receipt_date')->index();
            $table->string('delivery_note_number', 100)->nullable(); // Nomor Surat Jalan Vendor
            $table->foreignId('received_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('inspected_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('receipt_type', 40)->default('full_receiving')->index(); // full_receiving, partial_receiving, over_delivery_review, under_delivery
            $table->string('status', 40)->default('confirmed')->index(); // draft, pending_over_delivery_review, confirmed, rejected
            $table->foreignId('inventory_transaction_id')->nullable()->constrained('inventory_transactions')->nullOnDelete();
            $table->decimal('total_received_value', 18, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->string('attachment_path')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 12. Goods Receipt Items
        Schema::create('goods_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_id')->constrained('goods_receipts')->cascadeOnDelete();
            $table->foreignId('purchase_order_item_id')->constrained('purchase_order_items')->restrictOnDelete();
            $table->foreignId('inventory_item_id')->nullable()->constrained('inventory_items')->nullOnDelete();
            $table->foreignId('warehouse_location_id')->nullable()->constrained('warehouse_locations')->nullOnDelete();
            $table->decimal('qty_ordered', 14, 2)->default(0);
            $table->decimal('qty_previously_received', 14, 2)->default(0);
            $table->decimal('qty_delivered', 14, 2)->default(0);
            $table->decimal('qty_accepted', 14, 2)->default(0);
            $table->decimal('qty_damaged', 14, 2)->default(0);
            $table->decimal('qty_rejected', 14, 2)->default(0);
            $table->decimal('qty_over_delivery', 14, 2)->default(0);
            $table->decimal('qty_under_delivery', 14, 2)->default(0);
            $table->string('unit', 30)->default('PCS');
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total_accepted_value', 18, 2)->default(0);
            $table->string('delivery_status', 30)->default('full'); // full, partial, under_delivery, over_delivery, rejected
            $table->string('condition_notes', 255)->nullable();
            $table->timestamps();
        });

        // 13. Vendor Invoices (3-Way Matching: PO + GRN + Invoice for Finance Obligation Recording)
        Schema::create('vendor_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 60)->unique()->index(); // Internal Document Number
            $table->string('vendor_invoice_number', 100)->index(); // External Vendor Invoice Number
            $table->date('invoice_date')->index();
            $table->date('payment_due_date')->nullable()->index();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->restrictOnDelete();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->restrictOnDelete();
            $table->foreignId('goods_receipt_id')->nullable()->constrained('goods_receipts')->nullOnDelete();
            $table->string('po_reference', 60);
            $table->string('grn_reference', 60)->nullable();
            $table->decimal('subtotal_amount', 18, 2)->default(0);
            $table->decimal('tax_amount', 18, 2)->default(0);
            $table->decimal('total_invoice_amount', 18, 2)->default(0);
            $table->decimal('matched_po_amount', 18, 2)->default(0);
            $table->decimal('matched_grn_amount', 18, 2)->default(0);
            $table->decimal('variance_amount', 18, 2)->default(0);
            $table->boolean('is_three_way_matched')->default(false);
            $table->string('verification_status', 30)->default('pending_verification')->index(); // draft, pending_verification, verified, discrepancy, ready_for_finance, rejected
            $table->string('attachment_path')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_invoices');
        Schema::dropIfExists('goods_receipt_items');
        Schema::dropIfExists('goods_receipts');
        Schema::dropIfExists('purchase_approvals');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('quotation_comparisons');
        Schema::dropIfExists('vendor_quotation_items');
        Schema::dropIfExists('vendor_quotations');
        Schema::dropIfExists('rfq_vendors');
        Schema::dropIfExists('rfqs');
        Schema::dropIfExists('procurement_approval_rules');

        Schema::table('purchase_request_items', function (Blueprint $table) {
            $table->dropColumn(['item_name', 'specification', 'purpose']);
        });

        Schema::table('purchase_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('work_order_id');
            $table->dropConstrainedForeignId('department_id');
            $table->dropColumn([
                'required_date',
                'purchase_category',
                'purpose',
                'attachment_path',
                'current_approval_step',
                'rejection_reason',
            ]);
        });
    }
};
