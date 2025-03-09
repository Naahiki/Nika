"use client";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResumenContabilidad() {
  const [resumen, setResumen] = useState([]);
  const [filteredResumen, setFilteredResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsType, setDetailsType] = useState("ingreso"); // "ingreso" o "gasto"
  const [recordsDetails, setRecordsDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Cargar resumen mensual desde Airtable
  useEffect(() => {
    async function fetchResumen() {
      const response = await fetch("/api/resumen");
      const data = await response.json();
      if (data.success) {
        setResumen(data.records);
        setFilteredResumen(data.records);
      } else {
        console.error("Error cargando resumen:", data.error);
      }
      setLoading(false);
    }
    fetchResumen();
  }, []);

  // Filtro por año: se espera que el campo Mes tenga formato "YYYY-MM"
  const handleYearFilterChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    if (year === "") {
      setFilteredResumen(resumen);
    } else {
      setFilteredResumen(
        resumen.filter((record) => record.fields.Mes.startsWith(year))
      );
    }
  };

  // Al pulsar en una fila se muestran detalles para ese mes
  const handleRecordClick = (record) => {
    setSelectedRecord(record);
    setDetailsType("ingreso"); // Por defecto, cargar ingresos
    fetchRecordsDetails(record.fields.Mes, "ingreso");
  };

  // Cambiar pestaña en detalles y cargar datos correspondientes
  const handleTabChange = (type) => {
    setDetailsType(type);
    if (selectedRecord) {
      fetchRecordsDetails(selectedRecord.fields.Mes, type);
    }
  };

  // Función para obtener registros detallados para un mes y tipo (ingreso/gasto)
  const fetchRecordsDetails = async (mes, type) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(`/api/detalles-registros?mes=${mes}&type=${type}`);
      const data = await response.json();
      if (data.success) {
        setRecordsDetails(data.records);
      } else {
        console.error("Error al cargar detalles:", data.error);
      }
    } catch (error) {
      console.error("Error al obtener detalles:", error);
    }
    setDetailsLoading(false);
  };

  // Datos para el gráfico de barras
  const chartLabels = filteredResumen.map((record) => record.fields.Mes);
  const ingresosData = filteredResumen.map(
    (record) => Number(record.fields["Ingresos Totales"]) || 0
  );
  const gastosData = filteredResumen.map(
    (record) => Number(record.fields["Gastos Totales"]) || 0
  );
  const balanceData = filteredResumen.map(
    (record) => Number(record.fields["Balance Mensual"]) || 0
  );

  const dataChart = {
    labels: chartLabels,
    datasets: [
      {
        label: "Ingresos Totales",
        data: ingresosData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Gastos Totales",
        data: gastosData,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Balance Mensual",
        data: balanceData,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const optionsChart = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Resumen Mensual" },
    },
  };

  if (loading) return <p className="text-center text-gray-600">Cargando resumen...</p>;

  return (
    <div className="bg-gray-100 p-6 mt-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Resumen Contabilidad Mensual</h2>
      
      {/* Filtro por año */}
      <div className="mb-4 flex items-center">
        <label htmlFor="yearFilter" className="mr-2 font-semibold">Filtrar por año:</label>
        <input
          id="yearFilter"
          type="text"
          placeholder="Ej: 2025"
          value={selectedYear}
          onChange={handleYearFilterChange}
          className="border p-1 rounded"
        />
      </div>

      {/* Tabla de resumen mensual */}
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Mes</th>
            <th className="border border-gray-300 px-4 py-2">Ingresos Totales</th>
            <th className="border border-gray-300 px-4 py-2">Gastos Totales</th>
            <th className="border border-gray-300 px-4 py-2">Chat</th>
            <th className="border border-gray-300 px-4 py-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {filteredResumen.map((record) => (
            <tr key={record.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRecordClick(record)}>
              <td className="border border-gray-300 px-4 py-2">{record.fields.Mes}</td>
              <td className="border border-gray-300 px-4 py-2">${record.fields["Ingresos Totales"] || 0}</td>
              <td className="border border-gray-300 px-4 py-2">${record.fields["Gastos Totales"] || 0}</td>
              <td className="border border-gray-300 px-4 py-2">${record.fields.Chat || 0}</td>
              <td className="border border-gray-300 px-4 py-2">${record.fields["Balance Mensual"] || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>



      {/* Detalle expandible para un mes */}
      {selectedRecord && (
        <div className="p-4 border border-gray-300 rounded mb-6">
          <h3 className="font-bold mb-2">Detalles para el mes {selectedRecord.fields.Mes}</h3>
          <div className="mb-4 flex gap-4">
            <button
              onClick={() => handleTabChange("ingreso")}
              className={`px-4 py-2 rounded ${detailsType === "ingreso" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
            >
              Ingresos
            </button>
            <button
              onClick={() => handleTabChange("gasto")}
              className={`px-4 py-2 rounded ${detailsType === "gasto" ? "bg-green-500 text-white" : "bg-gray-300"}`}
            >
              Gastos
            </button>
          </div>
          {detailsLoading ? (
            <p>Cargando detalles...</p>
          ) : (
            <>
              {recordsDetails.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Fecha</th>
                      <th className="border border-gray-300 px-4 py-2">Monto</th>
                      <th className="border border-gray-300 px-4 py-2">Categoría</th>
                      <th className="border border-gray-300 px-4 py-2">
                        {detailsType === "ingreso" ? "Fuente" : "Concepto"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsDetails.map((rec) => (
                      <tr key={rec.id} className="text-center">
                        <td className="border border-gray-300 px-4 py-2">{rec.fields.Fecha}</td>
                        <td className="border border-gray-300 px-4 py-2">${rec.fields.Monto}</td>
                        <td className="border border-gray-300 px-4 py-2">{rec.fields.Categoria}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {detailsType === "ingreso" ? rec.fields.Fuente : rec.fields.Concepto}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No hay registros para este mes.</p>
              )}
            </>
          )}
          <button
            onClick={() => setSelectedRecord(null)}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cerrar Detalles
          </button>
        </div>
      )}
            {/* Gráfico de barras */}
        <div className="mb-6">
        <Bar data={dataChart} options={optionsChart} />
      </div>
    </div>
  );
}
