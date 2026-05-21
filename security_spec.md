# security_spec.md - Firebase Firestore Security Specification

This specification maps the data invariants and access patterns for the Parrot India Firestore database.

## Data Invariants
1. **Parrots**: Publicly viewable catalog list, editable only by verified administrator (`uu104015@gmail.com`).
2. **Orders**: Searchable by customer via track lookup code (specific single ID lookup), but only admin can view list of all orders. Anybody can place a booking order as long as they pay.
3. **Enquiries**: Allowed to submit by any guest visitor, viewable and cleanable by admin only.
4. **Promo Codes**: Publicly read coupons, modified strictly by admin.

## The "Dirty Dozen" Payloads (Denial Tests)
We assert that these payloads must return `PERMISSION_DENIED`:
1. Save parrot document by a non-logged-in guest visitor.
2. Save parrot document by a registered user who is *not* `uu104015@gmail.com`.
3. Read all orders collection without matching permissions or without admin role.
4. Create order containing malicious shadow properties not defined in the specification.
5. Create duplicate orders hijacking another existing user's unique order tracking code.
6. Create empty order lacking required fields (e.g., no phone or firstName).
7. Submit customer enquiry with extremely oversized ID payload.
8. Modify a registered order's status or details by non-admin guest clients.
9. Inject promo codes with invalid discounts (negative numbers).
10. Update a public parrot price without owner privileges.
11. View another user's single invoice with unverified ID formatting.
12. Modify core discount rates by non-admin visitors.

## Rules Draft
We will write the rules to `/firestore.rules`.
