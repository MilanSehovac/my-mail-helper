import sequelize from "../config/db.js";
import Agency from "./Agency.js";
import Contact from "./Contact.js";
import Campaign from "./Campaign.js";
import Template from "./Template.js";
import CampaignAgency from "./CampaignAgency.js";
import CampaignContact from "./CampaignContact.js";
import User from "./User.js";
import SmtpSettings from "./SmtpSettings.js";
import NotificationPreferences from "./NotificationPreferences.js";

Agency.hasMany(Contact, {
    foreignKey: "agency_id",
    onDelete: "CASCADE",
    as: "contacts",
})

Contact.belongsTo(Agency, {
    foreignKey: "agency_id",
    as: "agency",
})

CampaignContact.belongsTo(Contact, { foreignKey: 'contact_id', as: 'contact' });
CampaignContact.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' });
Campaign.hasMany(CampaignContact, { foreignKey: 'campaign_id', as: 'recipients', onDelete: 'CASCADE' });
Campaign.belongsTo(Template, { foreignKey: 'template_id', as: 'template' });
Template.hasMany(Campaign, { foreignKey: 'template_id', as: 'campaigns' });

Campaign.belongsToMany(Agency, {
    through: CampaignAgency,
    foreignKey: 'campaign_id',
    otherKey: 'agency_id',
    as: 'agencies'
});
Agency.belongsToMany(Campaign, {
    through: CampaignAgency,
    foreignKey: 'agency_id',
    otherKey: 'campaign_id',
    as: 'campaigns'
});

Campaign.belongsToMany(Contact, {
    through: CampaignContact,
    foreignKey: 'campaign_id',
    otherKey: 'contact_id',
    as: 'contacts'
});
Contact.belongsToMany(Campaign, {
    through: CampaignContact,
    foreignKey: 'contact_id',
    otherKey: 'campaign_id',
    as: 'campaigns'
});

export {
    sequelize,
    Agency,
    Contact,
    Campaign,
    Template,
    CampaignAgency,
    CampaignContact,
    User,
    SmtpSettings,
    NotificationPreferences
}