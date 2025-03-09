"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ResumenContabilidad from "./ResumenContabilidad";

export default function Contabilidad() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState(null);
  const [showResumen, setShowResumen] = useState(false); // Agregado para controlar el resumen
  const [formData, setFormData] = useState({});

  // Manejo de inputs de texto y select
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejo de input de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Para este ejemplo, simulamos el URL del archivo.
      // En una implementación real, deberías subir el archivo y obtener un URL.
      setFormData({ ...formData, Factura: "https://via.placeholder.com/150" });
    }
  };

  // Enviar datos al endpoint de Airtable
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enviar los datos del formulario directamente al backend
    const requestData = {
      type: activeForm, // "gasto" o "ingreso"
      data: formData,
    };

    const response = await fetch("/api/airtable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();

    if (responseData.success) {
      alert("Registro creado con éxito");
      setFormData({});
      setActiveForm(null);
    } else {
      alert(`Error creando registro: ${responseData.error}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold mb-4">Módulo de Contabilidad</h1>
      <p className="text-lg mb-6">
        Selecciona una acción para registrar un nuevo gasto o ingreso.
      </p>

      {/* Botones para elegir formulario */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveForm("gasto")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Añadir Gasto
        </button>
        <button
          onClick={() => setActiveForm("ingreso")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Añadir Ingreso
        </button>
        <button
          onClick={() => setShowResumen(!showResumen)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {showResumen ? "Ocultar Resumen" : "Ver Resumen"}
        </button>
      </div>

      {/* Formulario para Gastos */}
      {activeForm === "gasto" && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <h2 className="text-xl font-bold">Nuevo Gasto</h2>
          <div>
            <label className="block">Fecha:</label>
            <input
              type="date"
              name="Fecha"
              value={formData.Fecha || ""}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block">Monto:</label>
            <input
              type="number"
              step="0.01"
              name="Monto"
              value={formData.Monto || ""}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block">Categoría:</label>
            <select
              name="Categoria"
              value={formData.Categoria || ""}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccione</option>
              <option value="Recursos">Recursos</option>
              <option value="Gestión">Gestión</option>
              <option value="Sueldos">Sueldos</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div>
            <label className="block">Concepto:</label>
            <input
              type="text"
              name="Concepto"
              value={formData.Concepto || ""}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block">Método de Pago:</label>
            <select
              name="MetodoPago"
              value={formData.MetodoPago || ""}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccione</option>
              <option value="Tarjeta 1">Tarjeta 1</option>
              <option value="Tarjeta 2">Tarjeta 2</option>
            </select>
          </div>
          <div>
            <label className="block">Adjuntar Factura:</label>
            <input
              type="file"
              name="FacturaFile"
              onChange={handleFileChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Crear Gasto
          </button>
        </form>
      )}

      {/* Formulario para Ingresos */}
      {activeForm === "ingreso" && (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <h2 className="text-xl font-bold">Nuevo Ingreso</h2>
          <div>
            <label className="block">Fecha:</label>
            <input
              type="date"
              name="Fecha"
              value={formData.Fecha || ""}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block">Monto:</label>
            <input
              type="number"
              step="0.01"
              name="Monto"
              value={formData.Monto || ""}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block">Categoría:</label>
            <select
              name="Categoria"
              value={formData.Categoria || ""}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccione</option>
              <option value="Suscripciones">Suscripciones</option>
              <option value="Propinas">Propinas</option>
              <option value="Mensajes">Mensajes</option>
            </select>
          </div>
          <div>
            <label className="block">Fuente:</label>
            <select
              name="Fuente"
              value={formData.Fuente || ""}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccione</option>
              <option value="Luna">Luna</option>
              <option value="Ariel">Ariel</option>
              <option value="Cantante">Cantante</option>
            </select>
          </div>
          <div>
            <label className="block">Notas:</label>
            <input
              type="text"
              name="Notas"
              value={formData.Notas || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Crear Ingreso
          </button>
        </form>
      )}

      {/* Resumen de Contabilidad Mensual */}
      {showResumen && <ResumenContabilidad />}

      <button
        onClick={() => router.push("/")}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Volver al Dashboard
      </button>
    </div>
  );
}
