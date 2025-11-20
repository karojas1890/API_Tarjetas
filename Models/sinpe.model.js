import { DataTypes } from "sequelize";
import { sequelize } from "../Data/database.js";

export const Sinpe = sequelize.define("Sinpe", {
  nreferencia: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  ntelefono: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fechahora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: {
      isIn: [[0, 1]] // solo permite 0 o 1
    }
  }
}, {
  tableName: "sinpe",
  freezeTableName: true,
  timestamps: false
});
