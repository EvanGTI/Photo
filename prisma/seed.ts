/**
 * 数据库种子文件 —— 创建管理员账户和示例数据
 * 运行：npx ts-node prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // ── 创建管理员账户 ──
  const adminEmail = process.env.ADMIN_EMAIL || "admin@lenslight.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe@123"

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "管理员",
      role: "ADMIN",
    },
  })

  const passwordHash = await bcrypt.hash(adminPassword, 12)
  await prisma.siteSetting.upsert({
    where: { key: `pwd_${admin.id}` },
    update: { value: passwordHash },
    create: { key: `pwd_${admin.id}`, value: passwordHash },
  })

  console.log(`✓ 管理员账户: ${adminEmail}`)

  // ── 网站基本设置 ──
  const settings = [
    { key: "site_name", value: "Lens & Light Photography" },
    { key: "site_tagline", value: "用镜头记录世界的美好瞬间" },
    { key: "contact_email", value: "contact@lenslight.com" },
    { key: "watermark_text", value: "© Lens & Light" },
  ]

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }

  console.log("✓ 网站设置已初始化")
  console.log("\n🎉 Seed 完成！")
  console.log(`\n管理员登录：`)
  console.log(`  邮箱：${adminEmail}`)
  console.log(`  密码：${adminPassword}`)
  console.log(`\n⚠️  请在生产环境修改默认密码！`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
