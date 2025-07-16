import { neon } from "@neondatabase/serverless"
import fs from "fs/promises"
import path from "path"

export default async function executeSqlFile(filePath) {
  const sql = neon(process.env.POSTGRES_URL)
  try {
    const fullPath = path.resolve(process.cwd(), filePath)
    const sqlContent = await fs.readFile(fullPath, "utf-8")
    const statements = sqlContent.split(";").filter((s) => s.trim().length > 0)

    const results = []
    for (const statement of statements) {
      if (statement.trim()) {
        const result = await sql(statement)
        results.push(result)
      }
    }
    console.log(`SQL file ${filePath} executed successfully.`)
    return { success: true, results }
  } catch (error) {
    console.error(`Error executing SQL file ${filePath}:`, error)
    return { success: false, error: error.message }
  }
}
