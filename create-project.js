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

  console.log(`Creating project "${projectName}" in database ${databaseId}...`);

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Project: {
          title: [
            {
              text: {
                content: projectName,
              },
            },
          ],
        },
        Status: {
          status: {
            name: "Not started",
          },
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
      console.error("Error: Unauthorized. Check your NOTION_API_KEY.");
    } else {
      console.error("Error creating project:", error.message);
      if (error.cause) console.error("Cause:", error.cause);
    }
    process.exit(1);
  }
}

createProject();
