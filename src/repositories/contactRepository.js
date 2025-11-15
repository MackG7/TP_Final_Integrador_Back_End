import Contact from "../models/contact.model.js";
import User from "../models/User.model.js";

export default class ContactRepository {

    static async addContact(ownerId, email, alias) {

        // user al que quiero agregar
        const contactUser = await User.findOne({ email });

        if(!contactUser){
            throw new Error("Ese usuario no existe en el sistema");
        }

        if(contactUser._id.toString() === ownerId.toString()){
            throw new Error("No puedes agregarte a ti mismo");
        }

        // si ya existe pero desactivado → reactivo
        let existing = await Contact.findOne({ owner: ownerId, contactUser: contactUser._id });

        if(existing){
            existing.isActive = true;
            if(alias) existing.alias = alias;
            await existing.save();
            return existing;
        }

        const newContact = await Contact.create({
            owner: ownerId,
            contactUser: contactUser._id,
            alias
        });

        return newContact;
    }


    static async getContacts(ownerId){
        return await Contact.find({ owner: ownerId, isActive: true })
            .populate("contactUser", "username email _id");
    }


    static async updateAlias(ownerId, contactId, newAlias){
        return await Contact.findOneAndUpdate(
            { _id: contactId, owner: ownerId },
            { $set: { alias: newAlias }},
            { new: true }
        );
    }


    static async softDelete(ownerId, contactId){
        return await Contact.findOneAndUpdate(
            { _id: contactId, owner: ownerId },
            { $set: { isActive: false }},
            { new: true }
        );
    }

}
