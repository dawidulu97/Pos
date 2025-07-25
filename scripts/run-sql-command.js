import { neon } from "@neondatabase/serverless"

export default async function runSqlCommand(sqlCommand) {
  if (!process.env.POSTGRES_URL) {
    console.error("POSTGRES_URL environment variable is not set.")
    return { error: "Database URL not configured." }
  }

  const sql = neon(process.env.POSTGRES_URL)

  try {
    console.log(`Executing SQL command: ${sqlCommand}`)
    const result = await sql.unsafe(sqlCommand)
    console.log("SQL command executed successfully.")
    console.log("Result:", result)
    return { success: true, result }
  } catch (error) {
    console.error("Error executing SQL command:", error)
    return { error: error.message }
  }
}

// Example usage (for local testing, not for production execution directly)
// if (process.argv[2]) {
//   runSqlCommand(process.argv[2]);
// } else {
//   console.log("Usage: node run-sql-command.js \"SELECT * FROM products;\"");
// }
