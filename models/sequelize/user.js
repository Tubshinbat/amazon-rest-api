const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ""
    },
    email: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: ""
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ""
    },
    password: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      defaultValue: ""
    },
    about:{
      type:DataTypes.VIRTUAL,
      get(){
        return `${this.name} - ${this.email}`
      },
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
