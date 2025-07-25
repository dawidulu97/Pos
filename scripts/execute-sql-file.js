import { neon } from "@neondatabase/serverless"
import { promises as fs } from "fs"
import path from "path"

export default async function executeSqlFile(filePath) {
  if (!process.env.POSTGRES_URL) {
    console.error("POSTGRES_URL environment variable is not set.")
    return { error: "Database URL not configured." }
  }

  const sql = neon(process.env.POSTGRES_URL)

  try {
    const fullPath = path.resolve(process.cwd(), filePath)
    console.log(`Reading SQL file from: ${fullPath}`)
    const sqlContent = await fs.readFile(fullPath, "utf8")

    console.log(`Executing SQL file: ${filePath}`)
    // Split the SQL content by semicolons, filter out empty strings, and execute each command
    const commands = sqlContent
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0)

    const results = []
    for (const command of commands) {
      if (command) {
        console.log(`Executing command: ${command.substring(0, 100)}...`)
        const result = await sql.unsafe(command)
        results.push(result)
      }
    }

    console.log("SQL file executed successfully.")
    console.log("Results:", results)
    return { success: true, results }
  } catch (error) {
    console.error(`Error executing SQL file ${filePath}:`, error)
    return { error: error.message }
  }
}

// Example usage (for local testing, not for production execution directly)
// if (process.argv[2]) {
//   executeSqlFile(process.argv[2]);
// } else {
//   console.log("Usage: node execute-sql-file.js \"./scripts/setup-database.sql\"");
// }
