const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

const seed = async () => {
  const username = "slpng"
  const password = "owo"
  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      username,
      passwordHash,
      library: { create: {} }
    }
  })

  await prisma.title.create({
    data: {
      type: "movie",
      name: "The Drop",
      tmdbId: "154400"
    }
  })
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
