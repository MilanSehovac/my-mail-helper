import {Agency, Contact} from '../models/index.js';

export const getAgencies = async (req, res) => {
  try {
    const agencies = await Agency.findAll();
    res.json(agencies);
  } catch (error) {
    console.error('Could not get agencies:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

export const getAgencyById = async (req, res) => {
    try {
        const { id } = req.params;
        const agency = await Agency.findByPk(id, {
            include:{
                model: Contact,
                as: 'contacts'
            }
        });

        if (!agency) {
        return res.status(404).json({ error: 'Agency not found' });
        }

        res.status(200).json(agency);
    } catch (error) {
        console.error('Could not get agency:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
export const createAgency = async (req, res) => {
  try {
    const { name, country, city, website, focus_tags, comment } = req.body;

    if(!name || !country || !city) {
      return res.status(400).json({ error: 'Name, country and city are required' });
    }

    const newAgency = await Agency.create({
      name,
      country,
      city,
      website,
      focus_tags,
      comment,
    });

    res.status(201).json(newAgency);
  } catch (err) {
    console.error('Could not create agency:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export const updateAgency = async (req, res) => {
  try{
    const { id } = req.params;
    const { name, country, city, website, focus_tags, status, counter, last_contact, comment } = req.body;
    const agency = await Agency.findByPk(id);

    if(!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    await agency.update({
        name,
        country,
        city,
        website,
        focus_tags,
        status,
        counter,
        last_contact,
        comment
    });

    res.status(200).json({ message: 'Agency updated successfully', agency })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Server error' });
  }
}

export const deleteAgency = async (req,res) => {
  try{
    const { id } = req.params;
    const agency = await Agency.findByPk(id);

    if(!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    await Agency.destroy({ where: { id } });
    res.status(200).json({ message: 'Agency deleted successfully' });
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: 'Server error' });
  }
}