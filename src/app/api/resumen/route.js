import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const CONTABILIDAD_TABLE_ID = process.env.AIRTABLE_CONTABILIDAD_TABLE_ID;

export async function GET() {
  try {
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CONTABILIDAD_TABLE_ID}`;
    
    const response = await fetch(airtableUrl, {
      headers: { "Authorization": `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return NextResponse.json({ success: false, error: errorResponse }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ success: true, records: result.records });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
