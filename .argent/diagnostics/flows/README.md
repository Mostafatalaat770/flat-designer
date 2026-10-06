Historical QA recordings retained for audit. Do not use these as passing regression flows.

The old edit flow could not target the nested inspector scroller; studio-edit-v2 uses a discovered wheel anchor and passes. Native headless select key interaction did not change the finish; finish buttons replace that control and studio-asset-finish-v2 passes. The raw asset recording used a mismatched expected status string; the corrected studio-asset-v1 passes. Raw parity includes an earlier missing material path; the finished parity flow passes all13views.
