import { Tarjetas } from "../Models/Tarjetas.model.js";
import moment from "moment";

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

  // Busca la tarjeta en DB
   const tarjetas = await Tarjetas.findAll();
  const tarjeta = tarjetas.find(t => {
    const ultimosCuatroDB = t.numerotarjeta.toString().slice(-4);
    return ultimosCuatroDB === ultimosCuatro;
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
    tarjetaEnmascarada: enmascararTarjeta(numerotarjeta)
  };
}

// Enmascara tipo VISA/MasterCard
function enmascararTarjeta(numero) {
  const str = numero.toString();
  return `${str.slice(0, 4)} **** **** ${str.slice(-4)}`;
}
