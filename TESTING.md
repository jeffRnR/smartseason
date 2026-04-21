# Smart Season — Testing Guide

This guide walks through every feature of the system using the seeded demo data. Follow the scenarios in order for the clearest experience.

---

## Setup

Make sure both servers are running and the database is seeded:

```bash
npm run db:seed
npm run dev:backend    
npm run dev:frontend  
```

Open **http://localhost:5000**

---

## Demo Accounts

| Role | Email | Password | What they see |
|---|---|---|---|
| Admin | `admin@smartseason.com` | `password123` | All 6 fields, all logs, all agents |
| Agent 1 | `agent1@smartseason.com` | `password123` | 3 fields (North Paddock, Valley Plot, Riverside Block) |
| Agent 2 | `agent2@smartseason.com` | `password123` | 3 fields (Hilltop Farm, Eastern Quarter, South Field) |

---

## Seeded Fields at a Glance

| Field | Crop | Agent | Stage | Status | Why |
|---|---|---|---|---|---|
| North Paddock | Maize | Jane Wanjiku | Planted | Active | Only 15 days old — within threshold |
| Valley Plot | Tomatoes | Jane Wanjiku | Growing | Active | 55 days — under 90-day Growing limit |
| Riverside Block | Beans | Jane Wanjiku | Planted | At Risk | 35 days in Planted — over 30-day limit |
| Hilltop Farm | Wheat | Brian Omondi | Ready | Active | Ready stage is always Active |
| Eastern Quarter | Sorghum | Brian Omondi | Growing | At Risk | 100 days in Growing — over 90-day limit |
| South Field | Sunflower | Brian Omondi | Harvested | Completed | Harvested stage is always Completed |

---

## Scenario 1 — Admin Login & Dashboard

**Login as Admin:** `admin@smartseason.com / password123`

### What to verify on the Dashboard:
- KPI cards show: **6 Total**, **3 Active**, **2 At Risk**, **1 Completed**
- The "At Risk Fields" panel lists **Riverside Block** and **Eastern Quarter**
- The "Recent Fields" panel shows all 6 fields with their status badges
- The stage breakdown shows: Planted ×2, Growing ×2, Ready ×1, Harvested ×1

---

## Scenario 2 — Admin Views All Fields

Go to **Fields** in the sidebar.

### What to verify:
- All 6 fields are visible across both agents
- Each card shows the agent's name (e.g. "Jane Wanjiku")
- The **Add Field** button is visible
- Status stripes on cards: green for Active, red for At Risk, blue for Completed

### Test the filters:
- Set Status filter to **At Risk** → only Riverside Block and Eastern Quarter remain
- Set Stage filter to **Growing** → only Valley Plot and Eastern Quarter remain
- Type **"maize"** in the search bar → only North Paddock appears
- Clear filters to reset

---

## Scenario 3 — Admin Creates a New Field

On the Fields page, click **Add Field**.

Fill in:
- **Field Name:** Test Plot
- **Crop Type:** Cabbage
- **Planting Date:** today's date
- **Stage:** Planted
- **Location:** Kisumu County
- **Agent:** Brian Omondi
- **Notes:** Pilot test field

Click **Add Field** → the card should appear immediately with - Active - status.

---

## Scenario 4 — Admin Edits a Field

Hover over any field card → click **Edit**.

As admin you can change everything: name, crop, date, stage, location, agent assignment, and notes.

### Test reassigning an agent:
- Edit **North Paddock** → change agent from Jane Wanjiku to Brian Omondi → Save
- Log back in as **agent1@smartseason.com** → North Paddock should be gone from their view
- Log back in as **agent2@smartseason.com** → North Paddock should now appear

---

## Scenario 5 — Admin Deletes a Field

Hover over the **Test Plot** field you created → click **Delete** → confirm.

The card disappears. Note: agents do not see a delete button at all.

---

## Scenario 6 — Admin Views All Activity Logs

Go to **Activity Log** in the sidebar.

### What to verify — 8 pre-seeded log entries:

| Field | Transition | When |
|---|---|---|
| Valley Plot | Planted → Growing | ~30 days ago |
| Riverside Block | Planted → Planted | ~10 days ago (stall note) |
| Hilltop Farm | Planted → Growing | ~60 days ago |
| Hilltop Farm | Growing → Ready | ~10 days ago |
| Eastern Quarter | Planted → Growing | ~75 days ago |
| South Field | Planted → Growing | ~110 days ago |
| South Field | Growing → Ready | ~25 days ago |
| South Field | Ready → Harvested | ~5 days ago |

Each entry shows: field name, crop, agent name, stage transition (badge → badge), timestamp, and notes.

### Test search:
- Type **"south"** → only South Field's 3 log entries appear
- Type **"Brian"** → all of Brian Omondi's logs appear
- Type **"harvest"** → the Harvested transition entry appears

---

## Scenario 7 — Agent Login & Scoped View

**Logout → Login as Agent 1:** `agent1@smartseason.com / password123`

### What to verify on Dashboard:
- KPI cards now show **3 Total**, **1 Active**, **1 At Risk**, **0 Completed** (Jane's fields only, not platform-wide)
- At Risk shows only **Riverside Block**

### What to verify on Fields page:
- Only 3 fields visible — North Paddock, Valley Plot, Riverside Block
- **No "Add Field" button**
- Hover a card → **no Delete button**, only "Update"

---

## Scenario 8 — Agent Updates a Field Stage

As Agent 1, hover over **North Paddock** → click **Update**.

### What to verify in the modal:
- Only two fields are shown: **Current Stage** and **Field Notes**
- No access to name, crop, location, or agent assignment

Change Stage from **Planted → Growing**, add a note: *"Seedlings fully emerged, transitioning to growing phase"* → click **Save Update**.

### Verify the log was created:
- Go to **Activity Log**
- The first entry should be: North Paddock · Planted → Growing · just now

---

## Scenario 9 — Agent Cannot Access Other Agents' Fields

As Agent 1, try navigating directly to a field that belongs to Agent 2:

```
http://localhost:5000/fields
```

Only Jane's 3 fields should be visible — Brian's fields are never returned by the API.

### Verify at the API level:
Open browser DevTools → Network tab → click on the `GET /api/fields` request.

The response `data` array should contain exactly 3 fields, all with `agentId` matching Jane's ID.

---

## Scenario 10 — Agent Views Scoped Logs

As Agent 1, go to **Activity Log**.

### What to verify:
- Only logs for Jane's fields appear (Valley Plot, Riverside Block, North Paddock)
- Brian's field logs (Hilltop Farm, Eastern Quarter, South Field) are not visible
- The agent name column is hidden (agents don't need to see "by Jane Wanjiku" — they know it's them)

---

## Scenario 11 — Agent Cannot Access Admin Routes

With Agent 1 still logged in, try navigating to:

```
http://localhost:5000/agents
```

The app redirects you to `/dashboard` — the route is protected client-side.

Test the API directly in DevTools or Postman:

```
GET http://localhost:3001/api/users
Authorization: Bearer <agent1_token>
```

Response:
```json
{ "success": false, "message": "Access denied. Required role: ADMIN" }
```

---

## Scenario 12 — Status Logic Verification

This verifies the computed status rules without any code changes.

| Field | Days planted | Stage | Expected status | Actual |
|---|---|---|---|---|
| North Paddock | 15 | Planted | 🟢 Active | ✓ |
| Valley Plot | 55 | Growing | 🟢 Active | ✓ |
| Riverside Block | 35 | Planted | ⚠️ At Risk | ✓ |
| Hilltop Farm | 80 | Ready | 🟢 Active | ✓ |
| Eastern Quarter | 100 | Growing | ⚠️ At Risk | ✓ |
| South Field | 130 | Harvested | ✅ Completed | ✓ |

**To manually trigger an At Risk status:**
1. As Admin, create a new field
2. Set Planting Date to 40 days ago
3. Set Stage to Planted
4. Save → the card immediately shows ⚠️ At Risk

This proves the status is computed on read — you set no "status" field anywhere.

---

## Quick Reset

To return the database to the original seeded state at any point:

```bash
npm run db:seed
```

This clears all fields, logs, and users and re-inserts the demo data.