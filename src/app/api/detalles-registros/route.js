import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const INGRESOS_TABLE_ID = process.env.AIRTABLE_INGRESOS_TABLE_ID;
const GASTOS_TABLE_ID = process.env.AIRTABLE_GASTOS_TABLE_ID;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = searchParams.get("mes");
    const type = searchParams.get("type");

    if (!mes || !type) {
      return NextResponse.json({ success: false, error: "Parámetros insuficientes" }, { status: 400 });
    }

    const tableId = type === "ingreso" ? INGRESOS_TABLE_ID : GASTOS_TABLE_ID;
    // Filtrar por el mes en el campo Fecha, asumiendo que la fecha está en formato ISO y contiene "YYYY-MM"
    const filterFormula = `FIND("${mes}", {Fecha})`;

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    const response = await fetch(url, {
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
