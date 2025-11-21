import { Tarjetas } from "../Models/Tarjetas.model.js";
import moment from "moment";
import { Sinpe } from "../Models/sinpe.model.js";


export async function validarTarjeta(datos) {
  const { numerotarjeta, nombretarjetahabiente, identificaciontarjetahabiente, codigoseguridad, monto } = datos;

  // Validacion inicial de campos obligatorios
  if (!numerotarjeta || !codigoseguridad) {
    return { valido: false, mensaje: "Número de tarjeta y código de seguridad son obligatorios." };
  }

  // Valida nombre del titular
  if (!nombretarjetahabiente || nombretarjetahabiente.trim() === "") {
    return { valido: false, mensaje: "Nombre del titular es obligatorio." };
  }

  // Valida identificacion del titular
  if (!identificaciontarjetahabiente || identificaciontarjetahabiente.trim() === "") {
    return { valido: false, mensaje: "Identificacion del titular es obligatoria." };
  }

  // Valida formato de CVV
  if (!/^\d{3}$/.test(codigoseguridad.trim())) {
    return { valido: false, mensaje: "Código de seguridad inválido." };
  }

  // Obtener últimos 4 dígitos para búsqueda
  const numeroIngresado = numerotarjeta.toString().replace(/\s+/g, '').replace(/-/g, '');
  const ultimosCuatroIngresados = numeroIngresado.slice(-4);
  
  console.log("Buscando tarjeta con últimos 4 dígitos:", ultimosCuatroIngresados);

  // Busca todas las tarjetas en DB
  const tarjetas = await Tarjetas.findAll();
  
  // Buscar tarjeta que coincida con los últimos 4 dígitos
  const tarjeta = tarjetas.find(t => {
    const numeroDB = t.numerotarjeta.toString().replace(/\s+/g, '').replace(/-/g, '');
    const ultimosCuatroDB = numeroDB.slice(-4);
    return ultimosCuatroDB === ultimosCuatroIngresados;
  });

  if (!tarjeta) {
    return { valido: false, mensaje: "Tarjeta no registrada en el sistema." };
  }

  // Valida que el nombre coincida
  if (tarjeta.nombretarjetahabiente.trim().toLowerCase() !== nombretarjetahabiente.trim().toLowerCase()) {
    return { valido: false, mensaje: "Nombre del titular incorrecto." };
  }

  // Valida que la identificacion coincida
  if (tarjeta.identificaciontarjetahabiente.trim() !== identificaciontarjetahabiente.trim()) {
    return { valido: false, mensaje: "Identificacion del titular incorrecta." };
  }

  // Valida el codigo de seguridad
  if (tarjeta.codigoseguridad.trim() !== codigoseguridad.trim()) {
    return { valido: false, mensaje: "Código de seguridad incorrecto." };
  }

  // Valida estado (0 = activa, 1 = inactiva/bloqueada)
  if (tarjeta.estado !== 0) {
    return { valido: false, mensaje: "Tarjeta inactiva o bloqueada." };
  }

  // Valida la fecha de expiracion
  const hoy = moment();
  const fechaExpira = moment(`${tarjeta.annoexpira}-${tarjeta.mesexpira}-01`, "YYYY-MM-DD");

  if (!fechaExpira.isValid()) {
    return { valido: false, mensaje: "Fecha de expiracion inválida." };
  }

  if (hoy.isAfter(fechaExpira, "month")) {
    return { valido: false, mensaje: "La tarjeta ha expirado." };
  }

  // Valida el monto
  if (monto !== undefined && (isNaN(monto) || monto <= 0)) {
    return { valido: false, mensaje: "Monto inválido." };
  }

  if (monto && tarjeta.saldo < monto) {
    return { valido: false, mensaje: "Saldo insuficiente." };
  }

  // Descontar monto si aplica
  if (monto) {
    tarjeta.saldo = tarjeta.saldo - monto;
    await tarjeta.save(); 
  }

  // Respuesta
  return {
    valido: true,
    mensaje: "Tarjeta válida.",
    titular: tarjeta.nombretarjetahabiente,
    identificacion: tarjeta.identificaciontarjetahabiente,
    saldoDisponible: tarjeta.saldo,
    tarjetaEnmascarada: enmascararTarjeta(tarjeta.numerotarjeta)
  };
}

// Función auxiliar para enmascarar tarjeta
function enmascararTarjeta(numeroTarjeta) {
  const numeroStr = numeroTarjeta.toString().replace(/\s+/g, '').replace(/-/g, '');
  if (numeroStr.length <= 4) {
    return numeroStr;
  }
  const ultimosCuatro = numeroStr.slice(-4);
  return '•••• •••• •••• ' + ultimosCuatro;
}


export async function validarSinpe(datos) {
  const { nreferencia, ntelefono, monto } = datos;

  // Validación de campos
  if (!nreferencia && !ntelefono) {
    return { valido: false, mensaje: "Debe enviar la referencia o el teléfono del SINPE" };
  }
  if (!monto) {
    return { valido: false, mensaje: "Debe enviar el monto del SINPE" };
  }

  try {
    // Buscar registro confirmado en la DB
    const registro = await Sinpe.findOne({
      where: {
        monto,
        estado: 1, // solo SINPE confirmados
        ...(nreferencia ? { nreferencia } : {}),
        ...(ntelefono ? { ntelefono } : {})
      }
    });

    if (!registro) {
      return {
        valido: false,
        mensaje: "No se ha encontrado un SINPE válido con los datos proporcionados"
      };
    }

    // Si encuentra registro válido
    return {
      valido: true,
      mensaje: "SINPE válido, puede agendar la cita",
      registro: {
        nreferencia: registro.nreferencia,
        ntelefono: registro.ntelefono,
        monto: registro.monto,
        fechahora: moment(registro.fechahora).format("YYYY-MM-DD HH:mm:ss"),
        estado: registro.estado
      }
    };

  } catch (error) {
    console.error("Error validando SINPE:", error);
    return {
      valido: false,
      mensaje: "Error interno al validar SINPE",
      error: error.message
    };
  }
}

