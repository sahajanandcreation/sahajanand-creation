# Admin Panel Setup — The Sahajanand Creation

Your new admin panel is at **admin.html** (e.g. `yoursite.com/admin.html`).
It is not linked from the menu anywhere — that's intentional, keep the link private.

## Step 1 — Create the admin account (one time)

The admin panel signs in using one fixed email address:

    admin@sahajanand.com

Create this account **once**, using either method:

- **Easiest:** open `register.html` on your live site and register normally using
  this exact email and any password you want. (The name/phone you enter don't matter.)
- **Or:** in the Firebase Console → Authentication → Users → Add user, enter this
  email and a password.

Then go to `admin.html` and log in with just that password.

> Want a different admin email? Open `admin.html`, find the line
> `const ADMIN_EMAIL = "admin@sahajanand.com";` near the bottom, and change it
> to whatever email you registered — then update the Firestore rules below to match.

## Step 2 — Paste these Firestore security rules (important!)

The password screen alone is just a UI gate — the real security is these database
rules. Go to **Firebase Console → Firestore Database → Rules**, replace everything
with this, and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null && request.auth.token.email == "admin@sahajanand.com";
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /orders/{orderId} {
      allow read: if isAdmin() || (request.auth != null && resource.data.uid == request.auth.uid);
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    match /users/{userId} {
      allow read, update: if isAdmin() || (request.auth != null && request.auth.uid == userId);
      allow create: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This means:
- Anyone can **read** products (needed to show them on the site), but only the
  admin account can add/edit/delete them.
- Customers can only read/create their **own** orders; only the admin can read
  every order or mark one as Completed.
- Customers can only read/edit their own profile; only the admin can read/edit
  everyone's.

## Step 3 — Import your existing products (one time)

1. Log in to `admin.html`
2. Go to the **Products** tab
3. Click **"Import Current Products"** (only shown while the database is empty)

This copies all your current Neckpiece, Lace, Neck Patch, Phone Cover and
Material products into the database in one go. After that, every category
page on the site loads its products live from the database instead of the
hardcoded list — so anything you add, edit, hide, or delete from the admin
panel shows up on the site immediately, with no code changes needed.

(As a safety net, if the database is ever empty or unreachable, each page
falls back to showing its original built-in product list, so the site never
goes blank.)

## What the admin panel does

**Orders tab** — every order placed on the site (regardless of who placed
it), with total sales, today's sales, and pending-order counts at the top.
Mark an order "Completed" once it's fulfilled.

**Products tab** — filter by category, add a new product, edit or delete any
existing one, or just uncheck "Show on website" to hide it without deleting.
