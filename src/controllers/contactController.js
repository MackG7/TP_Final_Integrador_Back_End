import ContactService from "../services/contactService.js";

export const createContact = async (req, res) => {
    res.status(201).json(await ContactService.createContact(req.body));
};

export const getContacts = async (req, res) => {
    res.json(await ContactService.getAllContacts());
};

export const getContact = async (req, res) => {
    res.json(await ContactService.getContactById(req.params.id));
};

export const updateContact = async (req, res) => {
    res.json(await ContactService.updateContact(req.params.id, req.body));
};

export const deleteContact = async (req, res) => {
    await ContactService.deleteContact(req.params.id);
    res.json({ message: "Contacto eliminado" });
};