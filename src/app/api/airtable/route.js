import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const GASTOS_TABLE_ID = process.env.AIRTABLE_GASTOS_TABLE_ID;
const INGRESOS_TABLE_ID = process.env.AIRTABLE_INGRESOS_TABLE_ID;
const CONTABILIDAD_TABLE_ID = process.env.AIRTABLE_CONTABILIDAD_TABLE_ID;

async function getOrCreateMonthRecord(fecha) {
    try {
      const mesCalculado = new Date(fecha).toISOString().slice(0, 7); // YYYY-MM
      console.log(`🔍 Buscando el mes en Airtable: ${mesCalculado}`);
  
      const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CONTABILIDAD_TABLE_ID}?filterByFormula={Mes}="${mesCalculado}"`;
      console.log("📡 URL de búsqueda en Airtable:", searchUrl);
  
      const searchResponse = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      });
  
      if (!searchResponse.ok) {
        console.error("❌ Error en la consulta a Airtable:", await searchResponse.text());
        return null;
      }
  
      const searchData = await searchResponse.json();
      console.log("✅ Respuesta de búsqueda:", searchData);
  
      if (searchData?.records?.length > 0) {
        console.log(`✅ Mes encontrado con ID: ${searchData.records[0].id}`);
        return searchData.records[0].id;
      }
  
      console.log("⚠️ Mes no encontrado, intentando crearlo...");
  
      // Crear nuevo mes si no existe
      const createResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CONTABILIDAD_TABLE_ID}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: { Mes: mesCalculado }, // Guardamos el mes en la tabla "Contabilidad Mensual"
          }),
        }
      );
  
      if (!createResponse.ok) {
        console.error("❌ Error al crear el mes:", await createResponse.text());
        return null;
      }
  
      const createData = await createResponse.json();
      if (!createData.id) {
        console.error("❌ No se pudo obtener el ID del mes creado");
        return null;
      }
  
      console.log(`✅ Nuevo mes creado con ID: ${createData.id}`);
      return createData.id;
    } catch (error) {
      console.error("❌ Error en getOrCreateMonthRecord:", error);
      return null;
    }
  }
  

  export async function POST(request) {
    try {
      const { type, data } = await request.json();
  
      if (!data.Fecha) {
        return NextResponse.json({ success: false, error: "La fecha es requerida" }, { status: 400 });
      }
  
      // Obtener o crear el ID del mes en Contabilidad Mensual
      const mesId = await getOrCreateMonthRecord(data.Fecha);
      if (!mesId) {
        return NextResponse.json({ success: false, error: "No se pudo asociar el mes" }, { status: 500 });
      }
  
      let tableId;
      let fields = {
        Fecha: data.Fecha,
        Monto: parseFloat(data.Monto),
        "Contabilidad Mensual": [mesId], // 💡 Enlazamos con el ID de Contabilidad Mensual
      };
  
      if (type === "gasto") {
        tableId = GASTOS_TABLE_ID;
        fields = {
          ...fields,
          Categoria: data.Categoria,
          Concepto: data.Concepto,
          "Método de Pago": data.MetodoPago,
          Factura: data.Factura ? [{ url: data.Factura }] : undefined,
        };
      } else if (type === "ingreso") {
        tableId = INGRESOS_TABLE_ID;
        fields = {
          ...fields,
          Categoria: data.Categoria,
          Fuente: data.Fuente,
          Notas: data.Notas,
        };
      } else {
        return NextResponse.json({ success: false, error: "Tipo inválido" }, { status: 400 });
      }
  
      const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`;
  
      const airtableResponse = await fetch(airtableUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });
  
      if (!airtableResponse.ok) {
        const errorResponse = await airtableResponse.json();
        return NextResponse.json({ success: false, error: errorResponse }, { status: airtableResponse.status });
      }
  
      const result = await airtableResponse.json();
      return NextResponse.json({ success: true, record: result });
    } catch (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }
  
