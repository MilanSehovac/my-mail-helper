import sequelize from "../config/db.js";
import Agency from "./Agency.js";
import Contact from "./Contact.js";
import Template from "./Template.js";

Agency.hasMany(Contact, {
    foreignKey: "agency_id",
    onDelete: "CASCADE",
    as: "contacts",
})

Contact.belongsTo(Agency, {
    foreignKey: "agency_id",
    as: "agency",
})

export {
    sequelize,
    Agency,
    Contact,
    Template
}