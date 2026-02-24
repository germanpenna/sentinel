# Sentinel — Database Schema (Prisma)

## User

```prisma
model User {
  id               String   @id @default(uuid())
  clerkUserId      String   @unique
  email            String
  isPro            Boolean  @default(false)
  stripeCustomerId String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  runs             Run[]
}
```

## Run

```prisma
model Run {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  createdAt    DateTime @default(now())
  score        Int
  riskLevel    String
  warningsJson Json
  evidenceJson Json
}
```

Both `User.id` and `Run.id` use `@id @default(uuid())` for auto-generated unique identifiers.
