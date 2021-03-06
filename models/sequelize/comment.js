const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comment', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    comment: {
      type: DataTypes.STRING(450),
      allowNull: false,
      get(){
        let comment = this.getDataValue("comment").toLowerCase();
        return comment.charAt(0).toUpperCase() + comment.slice(1);
      },
      set(value){
        
        this.setDataValue("comment",value.replace('миа', 'тиймэрхүү'));
      }
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    bookId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'book',
        key: 'id'
      }
    },

  }, {
    sequelize,
    tableName: 'comment',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "FK_comment_1",
        using: "BTREE",
        fields: [
          { name: "bookId" },
        ]
      },
      {
        name: "FK_comment_2",
        using: "BTREE",
        fields: [
          { name: "userId" },
        ]
      },
    ]
  });
};
