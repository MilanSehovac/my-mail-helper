import { Template } from '../models/index.js';
export const getTemplates = async(req,res) =>{
    try{
        const templates = await Template.findAll();
        res.json(templates)
    } catch (err){
        console.log(err)
        res.status(500).json({ error: 'Server error' });
    }
}

export const getTemplateById = async(req,res) =>{

        try{
            const { id } = req.params;
            const template = await Template.findByPk(id);

            if(!template) {
                return res.status(404).json({ error: 'Template not found' });
            }

            res.status(200).json(template);
        } catch (err){
            console.log(err)
            res.status(500).json({ error: 'Server error' });
        }

}
export const createTemplate = async(req,res) =>{
    try{
        const { name, subject, body } = req.body;

        if(!name || !subject || !body) {
            return res.status(400).json({ error: 'Please provide name, subject, and body for the template' });
        }

        const newTemplate = await Template.create({
            name,
            subject,
            body
        });
        res.status(201).json(newTemplate);
    } catch (err){
        console.log(err)
        res.status(500).json({ error: 'Server error' });
    }
}

export const updateTemplate = async(req,res) =>{
    try{
        const { id } = req.params;
        const { name, subject, body } = req.body;

        const template = await Template.findByPk(id);

        if(!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        await template.update({
            name,
            subject,
            body
        });
        res.status(200).json({ message: 'Template updated successfully', template });
    } catch (err){
        console.log(err)
        res.status(500).json({ error: 'Server error' });
    }
}

export const deleteTemplate = async(req,res) =>{
    try{
        const { id } = req.params;

        const template = await Template.findByPk(id);

        if(!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        await template.destroy();
        res.status(200).json({ message: 'Template deleted successfully' });
    } catch (err){
        console.log(err)
        res.status(500).json({ error: 'Server error' });
    }
}