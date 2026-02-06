const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function createProject() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const projectName = process.argv[2] || "ניסוי claude";

  if (!databaseId) {
    console.error("Error: NOTION_DATABASE_ID is not set in .env");
    process.exit(1);
  }

  if (!process.env.NOTION_API_KEY) {
    console.error("Error: NOTION_API_KEY is not set in .env");
    process.exit(1);
  }

  try {
    // First, query the database to understand its schema
    const db = await notion.databases.retrieve({ database_id: databaseId });
    console.log("Database found:", db.title?.[0]?.plain_text || db.id);
    console.log("Properties:", Object.keys(db.properties).join(", "));

    // Find the title property
    const titleProp = Object.entries(db.properties).find(
      ([, v]) => v.type === "title"
    );

    if (!titleProp) {
      console.error("Error: Could not find a title property in the database");
      process.exit(1);
    }

    const [titlePropName] = titleProp;
    console.log(`Using title property: "${titlePropName}"`);

    // Create the page
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        [titlePropName]: {
          title: [
            {
              text: {
                content: projectName,
              },
            },
          ],
        },
      },
    });

    console.log(`\nProject "${projectName}" created successfully!`);
    console.log(`Page ID: ${response.id}`);
    console.log(`URL: ${response.url}`);
  } catch (error) {
    if (error.code === "object_not_found") {
      console.error(
        "Error: Database not found. Make sure the Notion integration has access to the database."
      );
    } else if (error.code === "unauthorized") {
      console.error(
        "Error: Unauthorized. Check your NOTION_API_KEY."
      );
    } else {
      console.error("Error creating project:", error.message);
    }
    process.exit(1);
  }
}

createProject();
