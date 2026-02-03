import { prisma } from "../lib/db";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("✓ Created admin user:", admin.email);

  // Create staff users
  const staffPassword = await bcrypt.hash("staff123", 10);
  const staff1 = await prisma.user.upsert({
    where: { email: "staff1@example.com" },
    update: {},
    create: {
      email: "staff1@example.com",
      name: "John Doe",
      password: staffPassword,
      role: "STAFF",
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: "staff2@example.com" },
    update: {},
    create: {
      email: "staff2@example.com",
      name: "Jane Smith",
      password: staffPassword,
      role: "STAFF",
    },
  });

  console.log("✓ Created staff users:", staff1.email, staff2.email);

  // Create sample tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Login button not working",
      description:
        "The login button on the homepage does not respond to clicks",
      status: "OPEN",
      priority: "HIGH",
      createdById: admin.id,
      assignedToId: staff1.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: "Database performance issue",
      description: "Queries are taking too long, need optimization",
      status: "IN_PROGRESS",
      priority: "URGENT",
      createdById: admin.id,
      assignedToId: staff2.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: "Update documentation",
      description: "Need to update API documentation for v2",
      status: "OPEN",
      priority: "LOW",
      createdById: staff1.id,
    },
  });

  console.log("✓ Created sample tickets");

  // Create activity logs
  await prisma.activity.create({
    data: {
      ticketId: ticket1.id,
      userId: admin.id,
      action: "created",
      newValue: "OPEN",
    },
  });

  await prisma.activity.create({
    data: {
      ticketId: ticket1.id,
      userId: admin.id,
      action: "assigned",
      newValue: staff1.id,
    },
  });

  console.log("✓ Created activity logs");

  console.log("\n✅ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
