import { DataTypes } from "sequelize";
import { sequelize } from "../Data/database.js";

export const Tarjetas = sequelize.define(
  "Tarjeta",
  {
    numerotarjeta: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    nombretarjetahabiente: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    identificaciontarjetahabiente: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    codigoseguridad: {
      type: DataTypes.CHAR(3),
      allowNull: false
    },
    mesexpira: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 12
      }
    },
    annoexpira: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        isValidYear(value) {
          const currentYear = new Date().getFullYear();
          if (value < currentYear) {
            throw new Error("El año de expiración no puede ser menor al año actual.");
          }
        }
      }
    },
    saldo: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    estado: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        isIn: [[0, 1]] 
      }
    }
  },
  {
    tableName: "apitarjetas",
    timestamps: false
  }
);
