import { neon } from "@neondatabase/serverless"

export default async function runSqlCommand(sqlCommand) {
  const sql = neon(process.env.POSTGRES_URL)
  try {
    const result = await sql(sqlCommand)
    console.log("SQL Command executed successfully:", result)
    return { success: true, result }
  } catch (error) {
    console.error("Error executing SQL command:", error)
    return { success: false, error: error.message }
  }
}
