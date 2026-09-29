# Business Rules — Atelier OS

Money is integer minor units; display divides by 100 using organization currency. Revenue is paid payments in the period minus refunds issued in that period; pending and void are excluded. Full refund only, no silent deletion of payment history. LTV is retained paid amount for a client's appointments. Visits count completed appointments, not bookings. No invented VIP inference: explicit vip flag only.

Times persist as timestamptz, entered/rendered in organization timezone; day schedules use local date and HH:mm, no overnight shifts in this MVP. Free slots are 15-minute start increments within an explicit staff shift, exclude non-cancelled/non-no_show overlaps, require active specialist/service assignment and full service duration. Unknown schedule is not assumed free.

Lifecycle: pending -> confirmed/cancelled/no_show; confirmed -> checked_in/cancelled/no_show; checked_in -> completed/cancelled; terminal states are immutable. Cancelled/no_show do not block scheduling. Adjacent appointments are allowed. Database exclusion protects concurrent writes. Price is a snapshot; later catalogue price changes do not rewrite appointments.

Owner manages organization and roles; owner/admin operate clients/services/staff/schedules/appointments/payments. Specialist reads own appointments and essential catalogues, cannot see finance or full CRM. Identity is stable app_users.id from verified Telegram user.id, never initDataUnsafe. Every server operation rechecks membership. Owner cannot remove/demote last owner. Archive instead of delete preserves history.

Onboarding creates organization, owner membership and first branch atomically and is idempotent per app user. No secrets in client or Git. Existing migrations are immutable; only additive migrations. Unavailable data is an error or permission state, not zero metrics.
