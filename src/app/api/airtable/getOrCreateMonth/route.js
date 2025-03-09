import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const CONTABILIDAD_TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_CONTABILIDAD_TABLE_ID;

export async function POST(request) {
  try {
    const { mes } = await request.json();

    if (!mes) {
      console.error("Error: No se proporcionó el mes en la solicitud");
      return NextResponse.json({ success: false, error: "El mes es requerido" }, { status: 400 });
    }

    console.log(`🔍 Buscando el mes en Airtable: ${mes}`);

    // 1. Buscar si el mes ya existe en Contabilidad Mensual
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CONTABILIDAD_TABLE_ID}?filterByFormula=FIND("${mes}", {Mes})`;
    console.log("📡 Enviando solicitud a Airtable: ", searchUrl);

    const searchResponse = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!searchResponse.ok) {
      console.error("❌ Error en la consulta a Airtable:", await searchResponse.text());
      return NextResponse.json({ success: false, error: "Error en la consulta a Airtable" }, { status: 500 });
    }

    const searchData = await searchResponse.json();
    console.log("✅ Respuesta de Airtable: ", searchData);

    // Verificar si `records` existe y tiene datos
    if (searchData?.records?.length > 0) {
      console.log(`✅ Mes encontrado en Airtable con ID: ${searchData.records[0].id}`);
      return NextResponse.json({
        success: true,
        recordId: searchData.records[0].id,
      });
    }

    console.log("⚠️ Mes no encontrado, creando nuevo registro...");

    // 2. Si no existe, crear el nuevo mes
    const createResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CONTABILIDAD_TABLE_ID}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: { Mes: mes },
        }),
      }
    );

    if (!createResponse.ok) {
      console.error("❌ Error al crear el mes:", await createResponse.text());
      return NextResponse.json({ success: false, error: "Error al crear el mes" }, { status: 500 });
    }

    const createData = await createResponse.json();

    if (!createData.id) {
      console.error("❌ No se pudo obtener el ID del mes creado");
      return NextResponse.json({ success: false, error: "No se pudo obtener el ID del mes creado" }, { status: 500 });
    }

    console.log(`✅ Nuevo mes creado con ID: ${createData.id}`);

    return NextResponse.json({ success: true, recordId: createData.id });
  } catch (error) {
    console.error("❌ Error en getOrCreateMonth.js:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
